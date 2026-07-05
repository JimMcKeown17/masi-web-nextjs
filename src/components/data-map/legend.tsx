import { Role, ROLE_META } from "@/lib/data-map/config";

// Shared visual vocabulary for the Data Map. Three semantic colours run the
// whole page (canonical / event / derived); identity is never colour-alone,
// every mark sits beside its text label.

export function RoleDot({ role, dark = false }: { role: Role; dark?: boolean }) {
  const color = dark ? ROLE_META[role].dark : ROLE_META[role].light;
  return (
    <span
      className="inline-block h-2 w-2 rounded-full shrink-0"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function RoleChip({
  role,
  label,
  dark = false,
}: {
  role: Role;
  label?: string;
  dark?: boolean;
}) {
  const color = dark ? ROLE_META[role].dark : ROLE_META[role].light;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        dark ? "border-white/15 text-white/80" : "border-gray-200 text-gray-700"
      }`}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      {label ?? ROLE_META[role].label}
    </span>
  );
}

// The page-level legend strip: introduces the three colours once, up front.
export function RoleLegend({ dark = false }: { dark?: boolean }) {
  const roles: Role[] = ["canonical", "event", "derived"];
  return (
    <div className="flex flex-wrap items-center gap-2">
      {roles.map((r) => (
        <RoleChip key={r} role={r} label={ROLE_META[r].plural} dark={dark} />
      ))}
    </div>
  );
}

// An ID rendered as a specimen: mono, bordered, unmistakably "a key".
export function KeyBadge({ id, dark = false }: { id: string; dark?: boolean }) {
  return (
    <code
      className={`inline-block rounded border px-1.5 py-0.5 font-mono text-[11px] leading-none tracking-tight ${
        dark
          ? "border-white/15 bg-white/5 text-white/75"
          : "border-gray-200 bg-white text-gray-600"
      }`}
    >
      {id}
    </code>
  );
}

// Section eyebrow, per the Ink & Signal pattern. `tone` picks hairline colour.
export function Eyebrow({
  index,
  label,
  dark = false,
}: {
  index: string;
  label: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-serif text-sm italic text-[#E72D4D]">{index}</span>
      <span className="h-px w-10 bg-[#E72D4D]" />
      <span
        className={`text-sm tracking-[0.25em] uppercase ${
          dark ? "text-white/60" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
