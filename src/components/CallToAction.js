import React from 'react';

const CallToAction = ({ onSignIn = () => {} }) => (
  <section className="px-6">
    <div className="mx-auto max-w-6xl rounded-[32px] bg-gradient-to-r from-sky-500/80 via-sky-500/60 to-violet-400/60 p-12 text-center text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80">Get Started</p>
      <h2 className="mt-4 text-3xl font-semibold sm:text-4xl">Ready to Transform University Life?</h2>
      <p className="mt-3 text-base text-white/90">
        Join KLH UniConnect today and experience the future of campus management
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={onSignIn}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:opacity-90"
        >
          Sign In Now
        </button>
        <button className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold text-white transition hover:border-white">
          View Documentation
        </button>
      </div>
    </div>
  </section>
);

export default CallToAction;
