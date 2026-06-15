'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

// Illustrative cohort assessment values (0-1). Swap for live data-portal data
// before promoting to the live homepage. Clockwise from the top: programme
// children are strongest on Phonemic Awareness and the programme's smallest
// edge over the control group is on Story Writing.
// Control ~= 0.52x programme at each axis, so the control polygon is a
// proportionally-scaled version of the programme shape (same high-at-Phonemic-
// Awareness, low-at-Story-Writing contour) nested inside it. A constant ratio
// also keeps Story Writing the smallest programme-vs-control gap.
const AXES = [
  { label: 'Phonemic Awareness', programme: 0.94, control: 0.49 },
  { label: 'Phonics', programme: 0.89, control: 0.46 },
  { label: 'Blending', programme: 0.85, control: 0.43 },
  { label: 'Word Reading', programme: 0.79, control: 0.40 },
  { label: 'Comprehension', programme: 0.72, control: 0.37 },
  { label: 'Sentence Writing', programme: 0.64, control: 0.33 },
  { label: 'Story Writing', programme: 0.58, control: 0.30 },
];

// Wide viewBox leaves room for the axis labels so they never clip the card edge.
const CX = 250;
const CY = 170;
const R = 112;
const N = AXES.length;
const RINGS = [0.25, 0.5, 0.75, 1];

function point(i: number, v: number): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return [CX + R * v * Math.cos(angle), CY + R * v * Math.sin(angle)];
}

function polygon(key: 'programme' | 'control', progress: number): string {
  return AXES.map((a, i) => {
    const [x, y] = point(i, a[key] * progress);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

function ring(level: number): string {
  return AXES.map((_, i) => {
    const [x, y] = point(i, level);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
}

export default function RadarChartV3() {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [p, setP] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1100, 1);
      setP(1 - Math.pow(1 - t, 3));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  return (
    <svg ref={ref} viewBox="0 0 500 340" className="w-full h-auto" role="img"
      aria-label="Radar chart comparing programme children against a control group across seven literacy skills">
      {/* Grid rings */}
      {RINGS.map((level) => (
        <polygon
          key={level}
          points={ring(level)}
          fill="none"
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={1}
        />
      ))}

      {/* Spokes */}
      {AXES.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.10)" strokeWidth={1} />;
      })}

      {/* Control polygon */}
      <polygon points={polygon('control', p)} fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />

      {/* Programme polygon */}
      <polygon points={polygon('programme', p)} fill="rgba(231,45,77,0.28)" stroke="#E72D4D" strokeWidth={2} />
      {AXES.map((a, i) => {
        const [x, y] = point(i, a.programme * p);
        return <circle key={i} cx={x} cy={y} r={3} fill="#E72D4D" />;
      })}

      {/* Axis labels */}
      {AXES.map((a, i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
        const lx = CX + (R + 22) * Math.cos(angle);
        const ly = CY + (R + 22) * Math.sin(angle);
        const cos = Math.cos(angle);
        const anchor = Math.abs(cos) < 0.3 ? 'middle' : cos > 0 ? 'start' : 'end';
        return (
          <text
            key={i}
            x={lx}
            y={ly}
            textAnchor={anchor}
            dominantBaseline="middle"
            fill="rgba(255,255,255,0.65)"
            style={{ fontSize: 10, letterSpacing: 0.2 }}
          >
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
