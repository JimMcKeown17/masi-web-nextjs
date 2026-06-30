// Portal MethodologyNote: a visible-but-collapsible provenance disclosure.
// Every Headline Result in the portal carries one (source, population/N, "as of",
// comparison group, caveat). Same Ink & Signal styling as the dashboard note, but
// takes explicit props rather than a PublishedStat row.

export function MethodologyNote({
  source,
  population,
  asOf,
  comparison,
  caveat,
  dark = false,
}: {
  source: string;
  population: string;
  asOf: string;
  comparison?: string;
  caveat?: string;
  dark?: boolean;
}) {
  return (
    <details className={`mt-4 text-[12.5px] ${dark ? "text-gray-500" : "text-gray-400"}`}>
      <summary className="cursor-pointer underline decoration-dotted underline-offset-2">
        Source: {source}
      </summary>
      <div className="mt-1 max-w-md space-y-0.5 leading-relaxed">
        <div>Population: {population}</div>
        {comparison && <div>Comparison: {comparison}</div>}
        <div>Data as of: {asOf}</div>
        {caveat && <div>{caveat}</div>}
      </div>
    </details>
  );
}
