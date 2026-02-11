import React from 'react';

const Stats = ({ items }) => (
  <section className="px-6">
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.label} className="space-y-3 rounded-[28px] border border-slate-100 bg-gradient-to-br from-white/80 to-slate-50 p-6 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.8)]">
            <p className="text-xs font-semibold uppercase tracking-[0.6em] text-slate-400">{item.label}</p>
            <p className="text-4xl font-extrabold text-slate-900">{item.value}</p>
            <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
