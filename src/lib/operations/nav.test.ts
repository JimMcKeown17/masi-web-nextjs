import assert from "node:assert/strict";
import test from "node:test";

import { OPS_GROUPS } from "./nav";

test("the Operations hub opens Finance on its status overview", () => {
  const finance = OPS_GROUPS.flatMap((group) => group.tools).find((tool) => tool.title === "Finance");

  assert.equal(finance?.href, "/operations/finance/overview");
});
