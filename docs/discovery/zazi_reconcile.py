#!/usr/bin/env python3
"""One-time Zazi iZandi -> canonical Child Registry reconciliation.

Spec: docs/discovery/zazi-canonical-cleanup-spec-2026-06-18.md

Pulls FRESH from source so it can be re-run to verify the gap closes after a load:
  - Airtable Child Registry  (canonical: Mcode, Child UID, names, Teampact Participant ID lookup)
  - Zazi prod DB             (teampact_participants + teampact_sessions_complete)

Method: session-active filter -> dedupe by token-sort name key (keep most-recent
participant_id) -> classify covered / relink / import -> edit-distance near-match
safety pass on imports. Emits two CSVs. Name is the only identity signal (no DOB,
messy schools), so outputs are HIGH-RECALL worklists to spot-verify, not blind-load.

Run with the backend venv (has psycopg2 + requests):
  "/Users/.../backend/Masi Web Main/venv/bin/python" docs/discovery/zazi_reconcile.py
"""
import csv
import os
import re
import sys
from collections import defaultdict
from datetime import date
from difflib import SequenceMatcher

import psycopg2
import requests

BACKEND_ENV = "/Users/jimmckeown/Development/Masi_Website_2026/backend/Masi Web Main/.env"
ZAZI_ENV = "/Users/jimmckeown/Development/Zazi_iZandi_Website_2025/.env"
OUT_DIR = os.path.dirname(os.path.abspath(__file__))
STAMP = "2026-06-18"
NEAR_MATCH_RATIO = 0.86  # difflib ratio above which an import is flagged a possible duplicate


def env(path, key):
    for line in open(path):
        line = line.strip()
        if line.startswith(f"{key}="):
            return line.split("=", 1)[1].strip().strip('"').split()[0]
    raise KeyError(f"{key} not in {path}")


def name_key(first, last):
    s = re.sub(r"[^a-z ]", " ", f"{first or ''} {last or ''}".lower())
    return " ".join(sorted(t for t in s.split() if t))


def parse_dt(s):
    return s or ""  # ISO strings sort lexically; good enough for "most recent"


# ---- 1. Canonical side: one pass over the Airtable Child Registry --------------
def load_canonical():
    base = env(BACKEND_ENV, "AIRTABLE_CHILDREN_2026_BASE_ID")
    table = env(BACKEND_ENV, "AIRTABLE_CHILDREN_2026_TABLE_ID")
    token = env(BACKEND_ENV, "AIRTABLE_TOKEN")
    url = f"https://api.airtable.com/v0/{base}/{table}"
    headers = {"Authorization": f"Bearer {token}"}
    linked = set()                       # participant_ids already linked (M)
    by_name = defaultdict(list)          # name_key -> [(child_uid, mcode)]
    max_mcode = 0
    offset = None
    fields = ["Mcode", "Child UID", "Canonical First Name", "Canonical Surname",
              "Canonical Full Name", "Teampact Participant ID"]
    while True:
        params = {"pageSize": 100, "fields[]": fields}
        if offset:
            params["offset"] = offset
        r = requests.get(url, headers=headers, params=params)
        r.raise_for_status()
        d = r.json()
        for rec in d.get("records", []):
            f = rec.get("fields", {})
            mc = f.get("Mcode")
            if isinstance(mc, (int, float)):
                max_mcode = max(max_mcode, int(mc))
            tp = f.get("Teampact Participant ID")
            if isinstance(tp, list):
                for x in tp:
                    linked.add(str(x))
            elif tp:
                linked.add(str(tp))
            k = name_key(f.get("Canonical First Name"), f.get("Canonical Surname"))
            fk = name_key(f.get("Canonical Full Name"), "")
            for key in {k, fk}:
                if key.strip():
                    by_name[key].append((f.get("Child UID"), mc))
        offset = d.get("offset")
        if not offset:
            break
    return linked, by_name, max_mcode


# ---- 2. Zazi side: participants + dominant school ------------------------------
def load_zazi():
    conn = psycopg2.connect(env(ZAZI_ENV, "RENDER_EXTERNAL_DB_URL"))
    cur = conn.cursor()
    cur.execute("""
        SELECT participant_id, firstname, lastname, gender,
               latest_session_date, total_attendance
        FROM teampact_participants
    """)
    parts = cur.fetchall()
    cur.execute("""
        SELECT DISTINCT ON (participant_id) participant_id, program_name
        FROM (
            SELECT participant_id, program_name, count(*) n
            FROM teampact_sessions_complete
            GROUP BY participant_id, program_name
        ) s ORDER BY participant_id, n DESC
    """)
    school = {pid: sch for pid, sch in cur.fetchall()}
    conn.close()
    return parts, school


def main():
    linked, canon_by_name, max_mcode = load_canonical()
    parts, school = load_zazi()
    GENDER = {1: "Male", 2: "Female"}

    # session-active + cluster by name key
    clusters = defaultdict(list)
    for pid, fn, ln, g, lsd, att in parts:
        if not ((lsd is not None) or (att or 0) > 0):
            continue
        k = name_key(fn, ln) or f"__noname__{pid}"
        clusters[k].append(dict(pid=str(pid), fn=fn or "", ln=ln or "",
                                gender=GENDER.get(g, ""), lsd=parse_dt(str(lsd) if lsd else ""),
                                school=school.get(pid, "")))

    # near-match index: token-prefix(3) -> set(canonical name_keys)
    prefix_idx = defaultdict(set)
    for ck in canon_by_name:
        for tok in ck.split():
            prefix_idx[tok[:3]].add(ck)

    def near_match(k):
        cands = set()
        for tok in k.split():
            cands |= prefix_idx.get(tok[:3], set())
        best, best_r = None, 0.0
        for ck in cands:
            r = SequenceMatcher(None, k, ck).ratio()
            if r > best_r:
                best, best_r = ck, r
        return (best, best_r) if best_r >= NEAR_MATCH_RATIO else (None, best_r)

    imports, relinks = [], []
    counts = defaultdict(int)
    next_mcode = max_mcode

    for k, members in clusters.items():
        pids = {m["pid"] for m in members}
        recent = max(members, key=lambda m: (m["lsd"], int(m["pid"])))  # most-recent id
        year = recent["lsd"][:4] if recent["lsd"] else ""
        if pids & linked:
            counts["covered"] += 1
            continue
        if k in canon_by_name:
            counts["relink"] += 1
            for uid, mc in canon_by_name[k]:
                relinks.append(dict(participant_id=recent["pid"], firstname=recent["fn"],
                                    lastname=recent["ln"], gender=recent["gender"],
                                    match_child_uid=uid, match_mcode=mc,
                                    reason="name_match_not_linked"))
            continue
        nm, ratio = near_match(k)
        if nm:
            counts["review_possible_duplicate"] += 1
            for uid, mc in canon_by_name[nm]:
                relinks.append(dict(participant_id=recent["pid"], firstname=recent["fn"],
                                    lastname=recent["ln"], gender=recent["gender"],
                                    match_child_uid=uid, match_mcode=mc,
                                    reason=f"near_match ratio={ratio:.2f} canon='{nm}'"))
        else:
            counts["import"] += 1
            next_mcode += 1
            imports.append(dict(participant_id=recent["pid"], firstname=recent["fn"],
                                lastname=recent["ln"], gender=recent["gender"],
                                recent_school=recent["school"], latest_session_year=year,
                                suggested_mcode=next_mcode))

    imp_path = os.path.join(OUT_DIR, f"zazi-import-candidates-{STAMP}.csv")
    rel_path = os.path.join(OUT_DIR, f"zazi-relink-{STAMP}.csv")
    with open(imp_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["participant_id", "firstname", "lastname",
                                          "gender", "recent_school", "latest_session_year",
                                          "suggested_mcode"])
        w.writeheader(); w.writerows(imports)
    with open(rel_path, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["participant_id", "firstname", "lastname",
                                          "gender", "match_child_uid", "match_mcode", "reason"])
        w.writeheader(); w.writerows(relinks)

    total = sum(counts.values())
    print(f"distinct session-active children : {total:,}")
    for k in ("covered", "relink", "review_possible_duplicate", "import"):
        print(f"  {k:<26}: {counts[k]:,}")
    print(f"current max Mcode (canonical)    : {max_mcode:,}  -> suggested new range {max_mcode+1}..{next_mcode}")
    print(f"wrote {len(imports):,} -> {imp_path}")
    print(f"wrote {len(relinks):,} -> {rel_path}")


if __name__ == "__main__":
    main()
