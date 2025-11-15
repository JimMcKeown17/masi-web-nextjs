// components/mentors/VisitFrequencyChart.tsx
'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MentorVisit, YeboVisit, ThousandStoriesVisit, NumeracyVisit } from '@/lib/types';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface VisitFrequencyChartProps {
  mentorVisits: MentorVisit[];
  yeboVisits?: YeboVisit[];
  thousandStoriesVisits?: ThousandStoriesVisit[];
  numeracyVisits?: NumeracyVisit[];
  timePeriod?: 'week' | 'month';
  showCombined?: boolean; // If true, shows all programs stacked
}

export function VisitFrequencyChart({
  mentorVisits,
  yeboVisits = [],
  thousandStoriesVisits = [],
  numeracyVisits = [],
  timePeriod = 'month',
  showCombined = false,
}: VisitFrequencyChartProps) {
  const chartData = useMemo(() => {
    // Group visits by date
    const groupByDate = (visits: any[]) => {
      const grouped: Record<string, number> = {};
      
      visits.forEach((visit) => {
        const date = new Date(visit.visit_date);
        let key: string;
        
        if (timePeriod === 'week') {
          // Group by week
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
        } else {
          // Group by month
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }
        
        grouped[key] = (grouped[key] || 0) + 1;
      });
      
      return grouped;
    };

    const literacyGrouped = groupByDate(mentorVisits);
    const yeboGrouped = groupByDate(yeboVisits);
    const storiesGrouped = groupByDate(thousandStoriesVisits);
    const numeracyGrouped = groupByDate(numeracyVisits);

    // Get all unique dates
    const allDates = new Set([
      ...Object.keys(literacyGrouped),
      ...Object.keys(yeboGrouped),
      ...Object.keys(storiesGrouped),
      ...Object.keys(numeracyGrouped),
    ]);

    const sortedDates = Array.from(allDates).sort();

    // Format dates for display
    const formattedDates = sortedDates.map((date) => {
      if (timePeriod === 'week') {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        const [year, month] = date.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
      }
    });

    if (showCombined) {
      // Stacked bar chart for all programs
      return [
        {
          x: formattedDates,
          y: sortedDates.map((date) => literacyGrouped[date] || 0),
          name: 'Masi Literacy',
          type: 'bar' as const,
          marker: { color: '#3b82f6' }, // Blue
        },
        {
          x: formattedDates,
          y: sortedDates.map((date) => yeboGrouped[date] || 0),
          name: 'Yebo',
          type: 'bar' as const,
          marker: { color: '#ef4444' }, // Red
        },
        {
          x: formattedDates,
          y: sortedDates.map((date) => storiesGrouped[date] || 0),
          name: '1000 Stories',
          type: 'bar' as const,
          marker: { color: '#14b8a6' }, // Teal
        },
        {
          x: formattedDates,
          y: sortedDates.map((date) => numeracyGrouped[date] || 0),
          name: 'Numeracy',
          type: 'bar' as const,
          marker: { color: '#f59e0b' }, // Amber
        },
      ];
    } else {
      // Single program bar chart (just literacy for now)
      return [
        {
          x: formattedDates,
          y: sortedDates.map((date) => literacyGrouped[date] || 0),
          name: 'Visits',
          type: 'bar' as const,
          marker: { color: '#3b82f6' },
        },
      ];
    }
  }, [mentorVisits, yeboVisits, thousandStoriesVisits, numeracyVisits, timePeriod, showCombined]);

  return (
    <Plot
      data={chartData}
      layout={{
        autosize: true,
        margin: { l: 50, r: 20, t: 20, b: 50 },
        xaxis: {
          title: { text: timePeriod === 'week' ? 'Week' : 'Month' },
          tickangle: -45,
        },
        yaxis: {
          title: { text: 'Number of Visits' },
          tickformat: 'd', // Integer format
        },
        barmode: showCombined ? 'stack' : 'group',
        showlegend: showCombined,
        legend: {
          orientation: 'h',
          y: -0.2,
        },
        hovermode: 'x unified',
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
      }}
      config={{
        responsive: true,
        displayModeBar: false,
      }}
      style={{ width: '100%', height: '100%' }}
      useResizeHandler={true}
    />
  );
}