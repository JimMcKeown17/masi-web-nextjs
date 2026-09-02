import assert from "node:assert/strict";
import test from "node:test";

import { formatPercent, formatRand, parseMoney } from "./money";

test("formatRand renders decimal strings as South African rand with cents, without Intl", () => {
  assert.equal(formatRand("5500.00"), "R 5 500,00");
  assert.equal(formatRand("-200.00"), "-R 200,00");
  assert.equal(formatRand("0.00"), "R 0,00");
  assert.equal(formatRand("12128589.99"), "R 12 128 589,99");
  assert.equal(formatRand("999.50"), "R 999,50");
  assert.equal(formatRand("-0.02"), "-R 0,02");
});

test("formatRand uses the fallback for null", () => {
  assert.equal(formatRand(null), "n/a");
  assert.equal(formatRand(null, "budget not set"), "budget not set");
});

test("formatPercent divides money strings and is null when the denominator is missing or zero", () => {
  assert.equal(formatPercent("5900.00", "7000.00"), "84.3%");
  assert.equal(formatPercent("5000.00", "4800.00"), "104.2%");
  assert.equal(formatPercent("1.00", null), null);
  assert.equal(formatPercent("1.00", "0.00"), null);
});

test("parseMoney is exact for cents up to the ledger's magnitude", () => {
  assert.equal(parseMoney("12128589.99"), 12128589.99);
  assert.equal(parseMoney("-0.02"), -0.02);
});
