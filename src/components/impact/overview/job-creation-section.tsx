'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const chartData = {
  years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  jobs: [12, 28, 52, 80, 122, 172, 219, 309, 548, 839, 1318, 1806],
};

export default function JobCreationSection() {
  const plotData = useMemo(
    () => [
      {
        x: chartData.years,
        y: chartData.jobs,
        type: 'scatter' as const,
        mode: 'lines+markers' as const,
        marker: { color: '#dc2626', size: 10 },
        line: { color: '#dc2626', width: 3 },
        fill: 'tozeroy' as const,
        fillcolor: 'rgba(220, 38, 38, 0.1)',
      },
    ],
    []
  );

  const layout = useMemo(
    () => ({
      title: {
        text: 'Women Employed by Year',
        font: { size: 20, family: 'Arial, sans-serif' },
      },
      xaxis: {
        title: { text: 'Year' },
        showgrid: true,
        gridcolor: '#e5e7eb',
      },
      yaxis: {
        title: { text: 'Number of Women' },
        showgrid: true,
        gridcolor: '#e5e7eb',
      },
      plot_bgcolor: '#ffffff',
      paper_bgcolor: '#ffffff',
      margin: { t: 60, r: 40, b: 60, l: 60 },
      hovermode: 'closest' as const,
      autosize: true,
    }),
    []
  );

  const config = useMemo(() => ({ responsive: true, displayModeBar: false }), []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="max-w-3xl mb-12">
          <span className="text-sm font-semibold tracking-widest uppercase text-gray-500 mb-4 block">
            Job Creation
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">
              Creating Dignified Employment
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Over the past decade, Masinyusane has employed 1,806 women from the
            community as education assistants, creating meaningful work that
            transforms both families and schools.
          </p>
        </div>

        {/* Jobs chart */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mb-12">
          <div className="md:col-span-4 flex flex-col justify-center">
            <p className="text-2xl md:text-3xl leading-relaxed">
              Over the past decade, we have created jobs for{' '}
              <span className="font-bold text-3xl md:text-4xl bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">
                1,806 women
              </span>{' '}
              from the community.
            </p>
          </div>
          <div className="md:col-span-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-md">
              <Plot
                data={plotData}
                layout={layout}
                config={config}
                className="w-full"
                useResizeHandler={true}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Youth testimony + Video CTA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Quote card */}
          <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
            <div className="text-4xl text-rose-300 mb-4">&ldquo;</div>
            <p className="text-lg text-gray-700 italic leading-relaxed mb-6">
              Masinyusane gave me my first real job. Now I can earn money, support my family
              and I&apos;m making a difference in children&apos;s lives every day. I wake
              up with purpose.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <span className="text-rose-600 font-bold text-sm">NM</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Ncumisa Mselane</div>
                <div className="text-sm text-gray-500">Education Assistant, Eastern Cape</div>
              </div>
            </div>
          </div>

          {/* Video embed */}
          <div className="rounded-xl overflow-hidden shadow-md aspect-video">
            <iframe
              src="https://www.youtube.com/embed/5j2d6nlFVe8"
              title="Masinyusane Youth Employment Impact"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Link to community jobs */}
        <Link
          href="/programs/community-jobs"
          className="inline-flex items-center gap-2 text-rose-600 font-semibold hover:text-rose-700 transition-colors"
        >
          Learn more about our jobs programme
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
