'use client';
import dynamic from 'next/dynamic';
import { useMemo } from 'react';

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

// Sample data - this should match the data from the Django plotly-chart.js
const chartData = {
  years: [2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  jobs: [12, 28, 52, 80, 122, 172, 219, 309, 548, 839, 1318, 1806]
};

export default function JobsChartSection() {
  const plotData = useMemo(() => [{
    x: chartData.years,
    y: chartData.jobs,
    type: 'scatter',
    mode: 'lines+markers',
    marker: { 
      color: '#dc2626', // red-600
      size: 10 
    },
    line: { 
      color: '#dc2626',
      width: 3 
    },
    fill: 'tozeroy',
    fillcolor: 'rgba(220, 38, 38, 0.1)'
  }], []);

  const layout = useMemo(() => ({
    title: {
      text: 'Women Employed by Year',
      font: { size: 20, family: 'Arial, sans-serif' }
    },
    xaxis: {
      title: 'Year',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    yaxis: {
      title: 'Number of Women',
      showgrid: true,
      gridcolor: '#e5e7eb'
    },
    plot_bgcolor: '#ffffff',
    paper_bgcolor: '#ffffff',
    margin: { t: 60, r: 40, b: 60, l: 60 },
    hovermode: 'closest',
    autosize: true
  }), []);

  const config = useMemo(() => ({
    responsive: true,
    displayModeBar: false
  }), []);

  return (
    <section className="py-16 md:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 flex flex-col justify-center md:justify-start">
            <div className="inline-block mb-2 text-center md:text-left">
              <span className="text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-blue-600 to-rose-600 bg-clip-text text-transparent">
                Empowering Women
              </span>
            </div>
            <p className="text-2xl md:text-3xl lg:text-4xl leading-relaxed text-center md:text-left">
              Over the past decade, we have created jobs for{' '}
              <span className="font-bold text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">
                1,806
              </span>{' '}
              <span className="font-bold text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-rose-600 to-blue-600 bg-clip-text text-transparent">
                women
              </span>{' '}
              from the community.
            </p>
          </div>
          <div className="md:col-span-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
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
      </div>
    </section>
  );
}

