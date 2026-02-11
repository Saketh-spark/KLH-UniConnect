import React, { useEffect, useState } from 'react';

const Hero = ({ features, onGetStarted = () => {} }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="px-6 py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
        <div
          className={`space-y-6 lg:flex-1 transition-all duration-700 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">
            ⭐ Welcome to the Future of University Life
          </span>
          <h1 className="text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl">
            KLH <span className="bg-gradient-to-r from-sky-600 to-violet-500 bg-clip-text text-transparent">UniConnect</span> – Your Complete University Platform
          </h1>
          <p className="max-w-xl text-lg text-slate-600">
            A secure, AI-powered super app combining social media, academics, placements, and administration.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onGetStarted}
              className="rounded-full bg-gradient-to-r from-sky-600 to-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_15px_40px_-35px_rgba(14,165,233,0.9)] transition duration-300 hover:-translate-y-0.5"
            >
              Get Started
            </button>
            <button className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-900 transition duration-300 hover:border-slate-300 hover:-translate-y-0.5">
              Learn More
            </button>
          </div>
        </div>
        <div className="lg:flex-1">
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 -z-10 rounded-[40px] bg-gradient-to-br from-[#cfd6ff] to-[#d1afff] blur-[120px] opacity-70" />
            <div className="rounded-[40px] border border-white/70 bg-gradient-to-br from-[#f7f8ff] via-white to-white px-6 py-7 shadow-[0_25px_80px_-60px_rgba(49,46,129,0.9)]">
              <div className="space-y-4">
                <p className="text-xs font-semibold uppercase tracking-[0.6em] text-slate-500">Live Modules</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature, index) => (
                    <div
                      key={feature.label || index}
                      className={`flex flex-col items-center justify-center gap-2 rounded-[24px] bg-white px-4 py-5 text-center text-sm font-medium text-slate-900 shadow-[0_15px_35px_-20px_rgba(15,23,42,0.25)] transition duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_25px_50px_-30px_rgba(15,23,42,0.45)] ${
                        mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                      }`}
                      style={{ transitionDelay: `${index * 80 + 150}ms` }}
                    >
                      <span className="text-3xl leading-none">{feature.emoji}</span>
                      <span className="text-sm font-semibold text-slate-900">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
