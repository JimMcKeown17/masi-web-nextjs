const CENTER = 140;
const R = 110;
const AXES = 8;

function point(axis: number, frac: number): string {
  const angle = (Math.PI * 2 * axis) / AXES - Math.PI / 2;
  const x = CENTER + R * frac * Math.cos(angle);
  const y = CENTER + R * frac * Math.sin(angle);
  return `${x.toFixed(1)},${y.toFixed(1)}`;
}

const LABELS: { text: string; x: number; y: number; anchor: "start" | "middle" | "end" }[] = [
  { text: "Letter Sounds", x: 140, y: 22, anchor: "middle" },
  { text: "Story Comp.", x: 228, y: 56, anchor: "start" },
  { text: "First Sounds", x: 258, y: 144, anchor: "start" },
  { text: "Read Words", x: 226, y: 232, anchor: "start" },
  { text: "Read Sentences", x: 140, y: 272, anchor: "middle" },
  { text: "Write Letters", x: 54, y: 232, anchor: "end" },
  { text: "Write CVCs", x: 22, y: 144, anchor: "end" },
  { text: "Listen Words", x: 54, y: 56, anchor: "end" },
];

export function RadarChart({ baseline, endline }: { baseline: number[]; endline: number[] }) {
  const poly = (values: number[]) => values.map((value, index) => point(index, value)).join(" ");

  return (
    <svg viewBox="-70 0 420 300" className="w-full" role="img" aria-label="Skill profile, January vs November">
      <g transform="translate(0,10)">
        {[1, 0.75, 0.5, 0.25].map((fraction) => (
          <circle key={fraction} cx={CENTER} cy={CENTER} r={R * fraction} fill="none" stroke="#eef0f4" />
        ))}
        {Array.from({ length: AXES }, (_, index) => {
          const [x, y] = point(index, 1).split(",").map(Number);
          return <line key={index} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#eef0f4" />;
        })}
        <polygon points={poly(baseline)} fill="rgba(148,163,184,0.25)" stroke="#94a3b8" strokeWidth="1.5" />
        <polygon points={poly(endline)} fill="rgba(200,30,60,0.12)" stroke="#C81E3C" strokeWidth="2.5" />
        {LABELS.map((label) => (
          <text key={label.text} x={label.x} y={label.y} textAnchor={label.anchor} className="fill-gray-400" fontSize="10.5">
            {label.text}
          </text>
        ))}
      </g>
    </svg>
  );
}
