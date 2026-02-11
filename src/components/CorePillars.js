import React from 'react';

const CorePillars = ({ pillars }) => (
  <section className="px-6">
    <div className="mx-auto max-w-6xl space-y-8 py-16">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.5em] text-slate-500">Pillars</p>
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Built on 6 Core Pillars</h2>
        <p className="text-base text-slate-600">
          Every pillar is designed to reinforce the KLH UniConnect ecosystem with consistent, premium experiences.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((pillar) => (
          <article
            key={pillar.title}
            className="space-y-4 rounded-[28px] border border-slate-100 bg-white px-6 py-8 text-center shadow-[0_25px_70px_-40px_rgba(15,23,42,0.9)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-500/20 text-slate-900">
              {pillar.icon}
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{pillar.title}</h3>
            <p className="text-sm text-slate-500">{pillar.description}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default CorePillars;
