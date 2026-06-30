# Charting foundation is visx; Plotly is excluded from the portal

## Context

The repo already has react-plotly.js installed (used by the operational dashboards in an off-brand slate palette) and a set of hand-built SVG/CSS charts on the public `/impact` dashboard. The Impact Data Portal is a funder-facing surface where branding is the priority, with a small, repetitive chart set (mostly bars, a few lines, one interactive radar, one map, two analyst-grade distribution/scatter charts).

## Decision

Standardise the portal's charts on **visx** (D3 primitives as React components), building a small reusable set of Ink & Signal chart components (`BarComparison`, `TrendLine`, `Distribution`, `Scatter`, plus the existing `RadarChart`). **Plotly is excluded from the portal.** MapLibre (`ScaleMap`) is retained for the geographic Site-Level view (visx is not for map tiles).

## Considered Options

- **Recharts** — fastest to build, but a capped branding ceiling (you override a default "dashboard" aesthetic). Rejected because branding is the priority.
- **Plotly (already installed)** — good defaults for histogram/scatter, but heavy, client-only (`ssr:false`), and always reads as "Plotly". Rejected for a brand-critical public page.
- **visx** — chosen. No aesthetic of its own to fight; D3's math (scales, binning) with hand-rendered SVG for exact brand control; renders server-side (charts in initial HTML, screenshot-clean); animates via the repo's framer-motion. Solves the analyst-grade charts so Plotly is unneeded.

## Consequences

- More code per chart than Recharts, and we write our own axes/tooltips — bounded because the chart set is small and reused across programmes.
- One chart family, not two; the portal never imports Plotly.
- The existing hand-built `/impact` CSS-bar charts can migrate onto the visx kit over time for consistency (not required day one).

## Status

accepted (2026-06-18)
