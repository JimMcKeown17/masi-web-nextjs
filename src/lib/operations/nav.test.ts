import assert from "node:assert/strict";
import test from "node:test";

import { OPS_GROUPS, opsGroupsForAccess } from "./nav";

test("the Operations hub opens Finance on its status overview", () => {
  const finance = OPS_GROUPS.flatMap((group) => group.tools).find((tool) => tool.title === "Finance");

  assert.equal(finance?.href, "/operations/finance/overview");
});

test("a Project Manager role does not expose Finance without finance.read", () => {
  const finance = opsGroupsForAccess("PROJECT MANAGER", [])
    .flatMap((group) => group.tools)
    .find((tool) => tool.title === "Finance");

  assert.equal(finance, undefined);
});

test("finance.read exposes only Finance to a STAFF Finance Manager", () => {
  const groups = opsGroupsForAccess("STAFF", ["finance.read"]);

  assert.deepEqual(
    groups.map((group) => [group.title, group.tools.map((tool) => tool.title)]),
    [["Leadership", ["Finance"]]],
  );
});

test("an ADMIN role without finance.read keeps other tools but not Finance", () => {
  const tools = opsGroupsForAccess("ADMIN", [])
    .flatMap((group) => group.tools)
    .map((tool) => tool.title);

  assert.equal(tools.includes("WIG"), true);
  assert.equal(tools.includes("Finance"), false);
});
