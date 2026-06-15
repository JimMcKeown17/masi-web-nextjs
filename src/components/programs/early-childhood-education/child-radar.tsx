'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

// ============================================================================
// Luphawu's real intake-vs-end literacy assessment (used with signed consent).
// Raw scores are normalised as score/10 for the radar (10 was her highest end
// score, on Phonics). If a metric is scored out of a different maximum, change
// that axis's divisor. Story Writing is genuinely 0 -> 0: a skill she has not
// yet started, shown honestly (the polygon meets the centre on that axis).
// Raw scores -> start | end:  Phonemic Awareness 2|9, Phonics 1|10, Blending
// 0|8, Word Reading 0|6, Comprehension 1|8, Passage Reading 0|4, Sentence
// Writing 0|2, Story Writing 0|0.
// ============================================================================
const AXES = [
  { label: 'Phonemic Awareness', start: 0.2, now: 0.9 },
  { label: 'Phonics', start: 0.1, now: 1.0 },
  { label: 'Blending', start: 0.0, now: 0.8 },
  { label: 'Word Reading', start: 0.0, now: 0.6 },
  { label: 'Comprehension', start: 0.1, now: 0.8 },
  { label: 'Passage Reading', start: 0.0, now: 0.4 },
  { label: 'Sentence Writing', start: 0.0, now: 0.2 },
  { label: 'Story Writing', start: 0.0, now: 0.0 },
];

const CX = 250;
const CY = 170;
const R = 112;
const N = AXES.length;
const RINGS = [0.25, 0.5, 0.75, 1];

function point(i: number, v: number): [number, number] {
  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
  return [CX + R * v * Math.cos(angle), CY + R * v * Math.sin(angle)];
}

function polygon(key: 'start' | 'now', progress: number): string {
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

export default function ChildRadar() {
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
    <svg
      ref={ref}
      viewBox="0 0 500 340"
      className="w-full h-auto"
      role="img"
      aria-label="Radar chart comparing one child's literacy skills at intake against today across eight measures"
    >
      {/* Grid rings */}
      {RINGS.map((level) => (
        <polygon key={level} points={ring(level)} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
      ))}

      {/* Spokes */}
      {AXES.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="rgba(255,255,255,0.10)" strokeWidth={1} />;
      })}

      {/* Intake polygon (where she started) */}
      <polygon points={polygon('start', p)} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />

      {/* Today polygon (where she is now) */}
      <polygon points={polygon('now', p)} fill="rgba(231,45,77,0.28)" stroke="#E72D4D" strokeWidth={2} />
      {AXES.map((a, i) => {
        const [x, y] = point(i, a.now * p);
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
