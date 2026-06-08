import React from 'react';

export default function PageHeader({ label, title, subtitle, icon: Icon }) {
  return (
    <div className="animate-fade-in-up">
      {label && (
        <>
          <div className="gold-line w-10 mb-4" />
          <p className="section-label mb-3">{label}</p>
        </>
      )}
      <h2 className="font-display text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
        {Icon && <Icon className="w-7 h-7 text-brand-400 shrink-0" />}
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-neutral-500 mt-2 max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
