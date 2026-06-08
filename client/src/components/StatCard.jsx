import React from 'react';

export default function StatCard({ title, value, icon: Icon, description, trend, purple }) {
  return (
    <div className="card-elegant p-6 transition-all duration-300 flex items-start justify-between glow-card">
      <div className="flex-1 pr-4">
        <span className="section-label block">
          {title}
        </span>
        <h3 className="font-display text-3xl font-bold mt-2 text-white tracking-tight">
          {value}
        </h3>

        {description && (
          <p className="text-xs text-neutral-500 mt-2">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs font-semibold px-2.5 py-1 ${
              trend.type === 'positive'
                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30'
                : trend.type === 'negative'
                  ? 'bg-red-900/30 text-red-400 border border-red-800/30'
                  : 'bg-white/5 text-neutral-500 border border-white/10'
            }`}>
              {trend.value}
            </span>
            <span className="text-xs text-neutral-600">{trend.label}</span>
          </div>
        )}
      </div>

      <div className={`w-12 h-12 flex items-center justify-center shrink-0 border ${
        purple
          ? 'bg-wellbeing-500/10 text-wellbeing-400 border-wellbeing-500/25'
          : 'bg-brand-500/10 text-brand-400 border-brand-500/25'
      }`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
