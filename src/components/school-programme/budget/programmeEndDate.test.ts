import assert from "node:assert/strict";
import test from "node:test";

import {
  programmeEndPresetFor,
  programmeEndPresets,
} from "./programmeEndDate";

test("programme end presets map to exact 2026 calendar dates", () => {
  assert.deepEqual(programmeEndPresets(2026), [
    { id: "end-october", label: "End October", date: "2026-10-31" },
    { id: "mid-november", label: "Mid-November", date: "2026-11-14" },
    { id: "full-november", label: "Full November", date: "2026-11-30" },
  ]);
});

test("an exact date outside the presets is identified as custom", () => {
  assert.equal(programmeEndPresetFor("2026-11-01", 2026), "custom");
  assert.equal(
    programmeEndPresetFor("2026-11-14", 2026),
    "mid-november",
  );
});
