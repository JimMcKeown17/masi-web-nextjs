import assert from "node:assert/strict";
import test from "node:test";

import { canAccessFinance } from "./access";

test("Project Managers cannot access the finance dashboard", () => {
  assert.equal(canAccessFinance("PROJECT MANAGER"), false);
});

test("Admins can access the finance dashboard", () => {
  assert.equal(canAccessFinance("ADMIN"), true);
});
