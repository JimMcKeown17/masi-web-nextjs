// Test-only: loads the golden fixture from disk. Not imported by app code.
import { readFileSync } from "node:fs";
import path from "node:path";

import type { FinanceSnapshot } from "@/lib/types/finance";

export function loadFixture(): FinanceSnapshot {
  const file = path.join(process.cwd(), "src", "lib", "finance", "fixtures", "finance-snapshot-example.json");
  return JSON.parse(readFileSync(file, "utf8")) as FinanceSnapshot;
}
