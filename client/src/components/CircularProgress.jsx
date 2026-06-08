import React from 'react';

export default function CircularProgress({ value, size = 120, strokeWidth = 10, title, subtitle, colorClass = "stroke-brand-500" }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="stroke-white/10"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className={`transition-all duration-1000 ease-out ${colorClass}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-extrabold text-white tracking-tight">
            {value}%
          </span>
          {subtitle && (
            <span className="text-[9px] text-neutral-500 font-semibold uppercase tracking-widest mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      </div>

      {title && (
        <span className="text-xs font-semibold text-neutral-400 mt-3 uppercase tracking-widest text-center">
          {title}
        </span>
      )}
    </div>
  );
}
