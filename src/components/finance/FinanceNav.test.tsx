import assert from "node:assert/strict";
import test from "node:test";
import { renderToStaticMarkup } from "react-dom/server";

import { FinanceNavView } from "./FinanceNav";

test("finance navigation exposes the four WP1a views and keeps Funders active on contract pages", () => {
  const markup = renderToStaticMarkup(
    <FinanceNavView
      pathname="/operations/finance/funders/ALPHA-26-27"
      capabilities={["finance.read"]}
    />,
  );

  for (const [href, label] of [
    ["/operations/finance/overview", "Overview"],
    ["/operations/finance/funders", "Funders"],
    ["/operations/finance/coverage", "Coverage"],
    ["/operations/finance/fix", "Fix"],
  ]) {
    assert.match(markup, new RegExp(`href="${href}"[^>]*>${label}</a>`));
  }

  const fundersHref = markup.indexOf('href="/operations/finance/funders"');
  const fundersLink = markup.slice(markup.lastIndexOf("<a", fundersHref), markup.indexOf("</a>", fundersHref));
  assert.match(fundersLink, /aria-current="page"/);
});

test("finance navigation renders no tabs without finance.read", () => {
  const markup = renderToStaticMarkup(
    <FinanceNavView pathname="/operations/finance/overview" capabilities={[]} />,
  );

  assert.equal(markup, "");
});

for (const [label, capabilities, visible] of [
  ["PROJECT MANAGER", [], false], ["plain STAFF", [], false],
  ["read-only Finance Manager", ["finance.read"], false],
  ["publish-only user", ["finance.publish"], false],
  ["ADMIN", ["finance.read", "finance.publish"], true],
] as const) {
  test(`Upload capability gate: ${label}`, () => {
    const html = renderToStaticMarkup(<FinanceNavView pathname="/operations/finance/upload" capabilities={[...capabilities]} />);
    assert.equal(html.includes(">Upload</a>"), visible);
  });
}
