import React from 'react';

export default function StatCard({ title, value, icon: Icon, description, trend, purple }) {
  return (
    <div className={`card-elegant p-6 rounded-lg transition-all duration-300 flex items-start justify-between border border-slate-700`}>
      <div className="flex-1 pr-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
          {title}
        </span>
        <h3 className="text-3xl font-bold mt-2 text-white tracking-tight">
          {value}
        </h3>

        {description && (
          <p className="text-xs text-slate-400 mt-2 font-medium">
            {description}
          </p>
        )}

        {trend && (
          <div className="flex items-center gap-2 mt-3">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${
              trend.type === 'positive'
                ? 'bg-emerald-500/10 text-emerald-400'
                : trend.type === 'negative'
                  ? 'bg-red-500/10 text-red-400'
                  : 'bg-slate-800 text-slate-400'
            }`}>
              {trend.value}
            </span>
            <span className="text-xs text-slate-500 font-medium">{trend.label}</span>
          </div>
        )}
      </div>

      <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
        purple
          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
          : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
      }`}>
        <Icon className="w-7 h-7" />
      </div>
    </div>
  );
}
