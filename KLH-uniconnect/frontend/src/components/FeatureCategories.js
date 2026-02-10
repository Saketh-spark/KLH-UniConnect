import React from 'react';

const FeatureCategories = ({ categories }) => (
  <section className="px-6">
    <div className="mx-auto max-w-6xl space-y-8 py-16">
      <div className="space-y-3 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.5em] text-slate-500">Features</p>
        <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Comprehensive Features for Every Role</h2>
        <p className="text-base text-slate-600">
          From students to faculty to admins, KLH UniConnect covers all aspects of university life.
        </p>
      </div>
      <div className="space-y-10">
        {categories.map((category) => (
          <article key={category.title} className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-[0_25px_60px_-35px_rgba(15,23,42,0.9)]">
            <div className="flex flex-col gap-3 text-slate-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.emoji}</span>
                <div>
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                  <p className="text-sm text-slate-500">{category.summary}</p>
                </div>
              </div>
              <span className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400">
                Module Suite
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {category.cards.map((card) => (
                <div key={card.title} className="flex flex-col gap-3 rounded-[24px] border border-slate-100 bg-slate-50/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/15 text-sky-600">
                      {card.icon}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900">{card.title}</h4>
                  </div>
                  <p className="text-sm text-slate-500">{card.description}</p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  </section>
);

export default FeatureCategories;
