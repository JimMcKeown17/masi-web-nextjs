'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import { FadeUp, FadeLeft } from '@/components/animations/FadeAnimations';
import CountUp from '@/components/animations/count-up';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const chartData = {
  years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  jobs: [12, 28, 52, 80, 122, 172, 219, 309, 548, 839, 1318, 1806],
};

export default function JobsChartSection() {
  const plotData = useMemo(() => [{
    x: chartData.years,
    y: chartData.jobs,
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    marker: { color: '#1D4ED8', size: 8 },
    line: { color: '#1D4ED8', width: 3 },
    fill: 'tozeroy' as const,
    fillcolor: 'rgba(29, 78, 216, 0.08)',
    hovertemplate: '%{y} women in %{x}<extra></extra>',
  }], []);

  const layout = useMemo(() => ({
    font: { family: 'var(--font-geist-sans), system-ui, sans-serif', color: '#475569' },
    xaxis: { showgrid: false, zeroline: false, tickfont: { size: 12 } },
    yaxis: { showgrid: true, gridcolor: '#e8e2d8', zeroline: false, tickfont: { size: 12 } },
    plot_bgcolor: 'rgba(0,0,0,0)',
    paper_bgcolor: 'rgba(0,0,0,0)',
    margin: { t: 16, r: 16, b: 40, l: 48 },
    hovermode: 'closest' as const,
    autosize: true,
  }), []);

  const config = useMemo(() => ({ responsive: true, displayModeBar: false }), []);

  return (
    <section className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <FadeUp className="md:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-[#1D4ED8]" />
              <span className="text-sm tracking-[0.25em] uppercase text-gray-500">Empowering women</span>
            </div>
            <p className="font-serif text-3xl md:text-5xl leading-[1.15] text-[#14181D]">
              In a decade, we created jobs for{' '}
              <span className="text-[#1D4ED8]"><CountUp to={1806} /></span> women.
            </p>
            <p className="text-gray-600 leading-relaxed mt-6 max-w-sm">
              From 12 jobs in 2014 to over 1,800 today, almost all of them held by women
              from the communities we serve.
            </p>
          </FadeUp>

          <FadeLeft className="md:col-span-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm ring-1 ring-black/5">
              <Plot
                data={plotData}
                layout={layout}
                config={config}
                className="w-full"
                useResizeHandler={true}
                style={{ width: '100%', height: '360px' }}
              />
            </div>
          </FadeLeft>
        </div>
      </div>
    </section>
  );
}
