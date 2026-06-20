"use client";
import { useMemo, type CSSProperties } from "react";
import { Fraunces } from "next/font/google";
import type { SchoolProgrammeGrid } from "@/lib/types/school-programme";
import { summarizeStaffing } from "./shared";
import styles from "./LeadershipBoard.module.css";

// One new face: the editorial serif numerals that give the board its character.
// Labels reuse the app's existing sans.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-fraunces",
});

const RING_C = 2 * Math.PI * 58; // r = 58

function accent(color: string): CSSProperties {
  return { ["--accent" as string]: color } as CSSProperties;
}

function formatAsOf(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  // The cron writes UTC; render in SAST so the date is correct for the team.
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Johannesburg",
  });
}

export function LeadershipBoard({ grid }: { grid: SchoolProgrammeGrid }) {
  const s = useMemo(
    () => summarizeStaffing(grid.schools, grid.programmes),
    [grid.schools, grid.programmes],
  );

  // Nothing planned in this view -> the board has nothing to summarise.
  if (s.schoolsWithPlan === 0 && s.totalActive === 0) return null;

  const pct = s.pctStaffed ?? 0;
  const ringOffset = RING_C * (1 - Math.min(pct, 100) / 100);
  const coverage =
    s.schoolsWithPlan > 0 ? Math.round((100 * s.fullyStaffed) / s.schoolsWithPlan) : 0;

  return (
    <section className={`${fraunces.variable} ${styles.root}`}>
      <div className={styles.caption}>
        Staffing as of <b>{formatAsOf(s.asOf)}</b>
      </div>

      <div className={styles.board}>
        {/* HERO -- overall % staffed */}
        <div className={`${styles.tile} ${styles.hero}`} style={accent("var(--lb-emerald)")}>
          <div className={styles.ringwrap}>
            <svg width="132" height="132" viewBox="0 0 132 132">
              <circle cx="66" cy="66" r="58" fill="none" stroke="#e7efe9" strokeWidth="12" />
              <circle
                cx="66"
                cy="66"
                r="58"
                fill="none"
                stroke="var(--lb-emerald)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={ringOffset}
                transform="rotate(-90 66 66)"
              />
            </svg>
            <div className={styles.ringPct}>
              <span className={styles.ringN}>{s.pctStaffed == null ? "—" : `${s.pctStaffed}%`}</span>
              <span className={styles.ringT}>Staffed</span>
            </div>
          </div>
          <div className={styles.heroBody}>
            <div className={styles.lab}>
              <span className={styles.dot} />
              Overall staffing
            </div>
            <div className={styles.headline}>
              <span className={styles.hl}>{s.totalActive}</span> of {s.totalPlanned}
              <br />
              youth in post
            </div>
            <div className={styles.miniwrap}>
              <div className={styles.minirow}>
                <span>Filled</span>
                <span>
                  <b>{s.totalActive} active</b>
                </span>
              </div>
              <div className={styles.bartrack}>
                <div className={styles.barfill} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <div className={styles.minirow}>
                <span>{s.netToFill} still to fill</span>
                <span>{s.totalPlanned} planned</span>
              </div>
            </div>
          </div>
        </div>

        {/* Open vacancies */}
        <div className={styles.tile} style={accent("var(--lb-red)")}>
          <div className={styles.lab}>
            <span className={styles.dot} />
            Open vacancies
          </div>
          <div className={styles.num}>{s.openVacancies}</div>
          <div className={styles.foot}>
            <b>
              {s.schoolsShort} {s.schoolsShort === 1 ? "school" : "schools"}
            </b>{" "}
            short of plan
          </div>
        </div>

        {/* Fully staffed */}
        <div className={styles.tile} style={accent("var(--lb-emerald)")}>
          <div className={styles.lab}>
            <span className={styles.dot} />
            Fully staffed
          </div>
          <div className={styles.num}>
            {s.fullyStaffed}
            <span className={styles.of}> / {s.schoolsWithPlan}</span>
          </div>
          <div className={styles.foot}>
            <div className={styles.bartrack} style={{ marginBottom: 9 }}>
              <div className={styles.barfill} style={{ width: `${coverage}%` }} />
            </div>
            <b>{coverage}%</b> of sites at or above plan
          </div>
        </div>

        {/* Over plan */}
        <div className={styles.tile} style={accent("var(--lb-amber)")}>
          <div className={styles.lab}>
            <span className={styles.dot} />
            Over plan
          </div>
          <div className={styles.num}>{s.overHires}</div>
          <div className={styles.foot}>
            <b>
              {s.schoolsOver} {s.schoolsOver === 1 ? "school" : "schools"}
            </b>{" "}
            above allocation
          </div>
        </div>

        {/* Watchlist -- biggest gaps */}
        <div className={styles.tile} style={accent("var(--lb-red)")}>
          <div className={styles.lab}>
            <span className={styles.dot} />
            Act first &middot; biggest gaps
          </div>
          {s.watchlist.length === 0 ? (
            <div className={styles.allclear}>Every staffed site is at or above plan.</div>
          ) : (
            <div className={styles.rows}>
              {s.watchlist.map((w, i) => (
                <div className={styles.wrow} key={`${w.school}-${w.programme}`}>
                  <div>
                    <span className={styles.rank}>{i + 1}</span>
                    <span className={styles.who}>{w.school}</span>
                    <div className={styles.prog}>
                      {w.programme} &middot; {w.active} of {w.planned} in post
                    </div>
                  </div>
                  <div className={styles.g}>&minus;{w.gap}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
