import React, { useEffect, useState } from 'react';

const roles = [
  {
    emoji: '🎓',
    title: 'Student',
    description: 'Access academics, placements, and community'
  },
  {
    emoji: '🧑‍🏫',
    title: 'Faculty',
    description: 'Manage classes, attendance, and evaluations'
  },
  {
    emoji: '🏅',
    title: 'Alumni',
    description: 'Mentor students and share experiences'
  },
  {
    emoji: '⚙️',
    title: 'Admin',
    description: 'Manage platform and verify content'
  }
];

const RoleSelectionScreen = ({ onBack = () => {}, onSelectRole = () => {} }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen isolate overflow-hidden bg-[#f7f7ff] text-slate-900">
      <div className="absolute inset-0 bg-gradient-to-br from-[#edf2ff] via-[#fceffe] to-[#f8fbff]" />
      <div className="pointer-events-none absolute -left-16 top-10 h-72 w-72 rounded-full bg-[#c8d7ff] blur-[120px] opacity-80" />
      <div className="pointer-events-none absolute -bottom-16 right-8 h-72 w-72 rounded-full bg-[#e4c7ff] blur-[180px] opacity-70" />
      <div className="pointer-events-none absolute top-1/2 left-1/4 h-80 w-80 rounded-full bg-[#d1e0ff] blur-[150px] opacity-60" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <header className="mb-8 flex flex-col items-center gap-2 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 text-lg font-bold text-white shadow-lg">
            K
          </span>
          <p className="text-lg font-semibold text-slate-900">KLH UniConnect</p>
        </header>

        <div
          className={`w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 shadow-[0_30px_90px_rgba(15,23,42,0.25)] backdrop-blur transition-all duration-500 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <div className="rounded-t-[32px] bg-gradient-to-br from-[#e7edff] to-[#f2d9ff] px-8 py-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Choose Your Role</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">Select your role to continue</p>
          </div>

          <div className="space-y-4 px-6 py-6">
            {roles.map((role, index) => (
              <button
                key={role.title}
                type="button"
                onClick={() => onSelectRole(role.title)}
                className={`flex w-full items-center gap-4 rounded-[20px] border border-slate-200 bg-white/80 px-4 py-4 text-left text-base font-semibold text-slate-900 transition duration-200 hover:bg-slate-50 hover:text-slate-900 hover:shadow-[0_20px_40px_-30px_rgba(15,23,42,0.85)] hover:-translate-y-0.5 ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
                style={{ transitionDelay: `${index * 80}ms` }}
              >
                <span className="text-2xl leading-none">{role.emoji}</span>
                <div>
                  <p className="text-base font-semibold text-slate-900">{role.title}</p>
                  <span className="text-sm font-normal text-slate-500">{role.description}</span>
                </div>
              </button>
            ))}

            <button
              type="button"
              onClick={onBack}
              className="mt-3 w-full rounded-[20px] border border-[#0f4dff] bg-white px-4 py-3 text-sm font-semibold text-[#0f4dff] shadow-[0_18px_35px_-25px_rgba(15,23,42,0.9)] transition duration-200 hover:bg-[#eef3ff] hover:-translate-y-0.5"
            >
              Back
            </button>
          </div>

          <div className="rounded-b-[32px] border-t border-white/70 bg-white/60 px-6 py-6 text-center text-xs text-slate-500">
            <p className="tracking-[0.08em]">By signing in, you agree to our Terms of Service and Privacy Policy</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="mt-6 flex items-center justify-center gap-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <span aria-hidden="true">←</span>
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

export default RoleSelectionScreen;
