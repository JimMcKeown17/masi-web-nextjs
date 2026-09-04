import assert from "node:assert/strict";
import test from "node:test";

import { userProfileRequestInit } from "./user-request";

test("authorization profile requests are no-store", () => {
  const init = userProfileRequestInit("clerk-token");

  assert.equal(init.cache, "no-store");
  assert.equal("next" in init, false);
  assert.equal(
    new Headers(init.headers).get("Authorization"),
    "Bearer clerk-token",
  );
});
