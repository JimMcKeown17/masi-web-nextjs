import { ArrowRight } from 'lucide-react';

const kpis = [
  {
    label: 'Letter Knowledge',
    unit: 'letters correct per minute',
    baseline: '13.6',
    endline: '37.9',
    changeLabel: '+179%',
    borderColor: 'border-blue-700',
    ringColor: 'ring-blue-700/20',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description:
      'Grade 1 learners nearly tripled their letter-sound fluency over the course of the programme.',
  },
  {
    label: 'Hitting Benchmark',
    unit: 'of children on reading benchmark',
    baseline: '13.1%',
    endline: '52.5%',
    changeLabel: '4x',
    borderColor: 'border-yellow-400',
    ringColor: 'ring-yellow-400/20',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description:
      'The proportion of Grade 1 learners meeting the reading benchmark quadrupled from baseline to endline.',
  },
  {
    label: 'Zero-Letter Knowledge',
    unit: 'of children knowing zero letters',
    baseline: '23.4%',
    endline: '1.3%',
    changeLabel: '-95%',
    borderColor: 'border-green-500',
    ringColor: 'ring-green-500/20',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description:
      'Nearly every child who started knowing zero letter sounds gained measurable literacy by end of year.',
  },
  {
    label: 'Word Reading',
    unit: 'words read per minute',
    baseline: '8.3',
    endline: '13.9',
    changeLabel: '+68%',
    borderColor: 'border-red-500',
    ringColor: 'ring-red-500/20',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    description:
      'Grade 1 learners improved their connected-text reading fluency significantly over the intervention period.',
  },
];

export default function KpiSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-8 h-1 bg-yellow-400" />
            <span className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Grade 1 Key Metrics
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Measuring What Matters
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Four core metrics tracking real literacy gains for Grade 1 learners —
            from baseline to endline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className={`bg-white rounded-xl p-6 shadow-md border border-gray-100 border-l-4 ${kpi.borderColor} hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">{kpi.label}</h3>
                <span className={`text-sm font-bold ${kpi.textColor} ${kpi.bgColor} px-3 py-1 rounded-full`}>
                  {kpi.changeLabel}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {/* Baseline */}
                <div className="flex-1 text-center bg-gray-50 rounded-lg p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                    Baseline
                  </div>
                  <div className="text-3xl font-bold text-gray-400">{kpi.baseline}</div>
                </div>

                <ArrowRight className="h-5 w-5 text-yellow-400 shrink-0" />

                {/* Endline */}
                <div className={`flex-1 text-center ${kpi.bgColor} rounded-lg p-4 ring-2 ${kpi.ringColor}`}>
                  <div className={`text-xs font-semibold uppercase tracking-wider ${kpi.textColor} mb-1`}>
                    Endline
                  </div>
                  <div className={`text-3xl font-bold ${kpi.textColor}`}>{kpi.endline}</div>
                </div>
              </div>

              <div className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                {kpi.unit}
              </div>
              <p className="text-sm text-gray-600">{kpi.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
