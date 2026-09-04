import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { loadFixture } from "../../lib/finance/testFixture";
import { FinanceContractDetail } from "./FinanceContractDetail";

test("contract detail resolves the canonical contract code and expands only that contract", () => {
  const markup = renderToStaticMarkup(
    <FinanceContractDetail
      contracts={loadFixture().funder_contracts}
      contractCode="ALPHA-26-27"
      accountingYear={2026}
    />,
  );

  assert.match(markup, /ALPHA-26-27/);
  assert.match(markup, /Training/);
  assert.doesNotMatch(markup, /BETA-SD-26/);
  assert.match(markup, /href="\/operations\/finance\/funders"/);
});

test("contract detail fails visibly when the code is absent from the approved snapshot", () => {
  const markup = renderToStaticMarkup(
    <FinanceContractDetail contracts={loadFixture().funder_contracts} contractCode="MISSING" accountingYear={2026} />,
  );

  assert.match(markup, /No funder contract with code MISSING exists in this snapshot\./);
  assert.doesNotMatch(markup, /Funder contract.*BETA-SD-26/);
});
