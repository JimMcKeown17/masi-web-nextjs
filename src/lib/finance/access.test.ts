import assert from "node:assert/strict";
import test from "node:test";

import { canAccessFinance } from "./access";

test("finance.read grants the finance dashboard independently of profile role", () => {
  assert.equal(canAccessFinance(["finance.read"]), true);
});

test("missing, malformed, reserved, and unknown capabilities fail closed", () => {
  assert.equal(canAccessFinance(undefined), false);
  assert.equal(canAccessFinance(null), false);
  assert.equal(canAccessFinance("ADMIN"), false);
  assert.equal(canAccessFinance(["finance.publish"]), false);
  assert.equal(canAccessFinance(["finance.overview.read"]), false);
});
