import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020";

import { loadFixture } from "./testFixture";

// Overview section 3.25: the same constants live in masi-finance and Django.
const CONTRACT_SCHEMA_DIGEST = "4c87e0c550a711c20b9088ff062f4aa0fb91908d559d67992878c53e5ceb630e";
const CONTRACT_FIXTURE_DIGEST = "9cd8555f04b3b0b2143b4a44f6443f64187ace6d00f06736b38be632ccffd7a7";

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    const entries = Object.keys(value as Record<string, unknown>).sort()
      .map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

function canonicalDigest(value: unknown): string {
  return createHash("sha256").update(canonical(value), "utf8").digest("hex");
}

const schema = JSON.parse(readFileSync(path.join(process.cwd(), "src", "lib", "finance", "finance-snapshot-1.0.0.json"), "utf8"));

test("schema and fixture copies match the contract digests", () => {
  assert.equal(canonicalDigest(schema), CONTRACT_SCHEMA_DIGEST);
  assert.equal(canonicalDigest(loadFixture()), CONTRACT_FIXTURE_DIGEST);
});

test("the golden fixture validates against the schema copy", () => {
  const validate = new Ajv2020({ allErrors: true, strict: false }).compile(schema);
  assert.equal(validate(loadFixture()), true, JSON.stringify(validate.errors));
});

test("the golden fixture is schema 1.0.0 and has the shape the types describe", () => {
  const snapshot = loadFixture();
  assert.equal(snapshot.schema_version, "1.0.0");
  assert.equal(snapshot.accounting_year, 2026);
  assert.equal(snapshot.funder_contracts.length, 5);
  assert.equal(snapshot.allocation_coverage.length, 5);
  assert.equal(snapshot.findings.length, 11);
  assert.deepEqual(snapshot.allocation_coverage.map((g) => g.complete), [true, false, false, false, false]);
  assert.deepEqual(snapshot.allocation_coverage.map((g) => g.unbound_row_count), [0, 1, 1, 1, 1]);
  assert.deepEqual(snapshot.funder_contracts.map((c) => c.row_count_in_year), [2, 3, 1, 3, 0]);
  assert.equal(snapshot.allocation_coverage_caveats.length, 1);
  const alpha = snapshot.funder_contracts[0];
  assert.equal(alpha.id, "1f5047ecae02");
  assert.equal(alpha.contract_code, "ALPHA-25-26");
  assert.equal(alpha.remaining, "1100.00");
  assert.equal(alpha.lines[0].binding, "derived");
  const beta = snapshot.funder_contracts[2];
  assert.equal(beta.budget_total, null);
  assert.deepEqual(beta.completeness_reasons.map((r) => r.code), ["MISSING_BUDGET", "MISSING_BUDGET"]);
});
