import React, { useEffect, useState } from 'react';
import {
  Award,
  BarChart3,
  Brain,
  Briefcase,
  CalendarDays,
  MessageCircle,
  Search,
  ShieldCheck,
  Settings,
  User,
  Video,
  BookOpenCheck,
  LogOut
} from 'lucide-react';

const moduleCards = [
  {
    title: 'My Profile',
    description: 'View and edit your digital identity',
    icon: User,
    iconLayout: 'bg-gradient-to-br from-blue-400 to-blue-600'
  },
  {
    title: 'Reels & Feed',
    description: 'Share videos and discover content',
    icon: Video,
    iconLayout: 'bg-gradient-to-br from-pink-400 to-pink-600'
  },
  {
    title: 'Academics',
    description: 'Notes, assignments, and attendance',
    icon: BookOpenCheck,
    iconLayout: 'bg-gradient-to-br from-blue-500 to-indigo-600'
  },
  {
    title: 'Placements',
    description: 'Jobs, resumes, and interviews',
    icon: Briefcase,
    iconLayout: 'bg-gradient-to-br from-orange-400 to-orange-600'
  },
  {
    title: 'Certificates',
    description: 'Upload and verify achievements',
    icon: Award,
    iconLayout: 'bg-gradient-to-br from-emerald-400 to-emerald-600'
  },
  {
    title: 'Chat',
    description: 'Message with other users',
    icon: MessageCircle,
    iconLayout: 'bg-gradient-to-br from-cyan-400 to-blue-500'
  },
  {
    title: 'Discover',
    description: 'Find people and opportunities',
    icon: Search,
    iconLayout: 'bg-gradient-to-br from-green-400 to-emerald-600'
  },
  {
    title: 'AI Assistant',
    description: '24/7 learning and career help',
    icon: Brain,
    iconLayout: 'bg-gradient-to-br from-pink-500 to-rose-600'
  },
  {
    title: 'Events & Clubs',
    description: 'Manage events and communities',
    icon: CalendarDays,
    iconLayout: 'bg-gradient-to-br from-amber-400 to-orange-600'
  },
  {
    title: 'Safety',
    description: 'Emergency SOS and reporting',
    icon: ShieldCheck,
    iconLayout: 'bg-gradient-to-br from-red-400 to-rose-600'
  },
  {
    title: 'Analytics',
    description: 'Your performance and insights',
    icon: BarChart3,
    iconLayout: 'bg-gradient-to-br from-teal-400 to-cyan-600'
  },
  {
    title: 'Settings',
    description: 'Account and preferences',
    icon: Settings,
    iconLayout: 'bg-gradient-to-br from-slate-500 to-slate-700'
  }
];

const statsCards = [
  {
    label: 'Profile Completion',
    value: 75,
    suffix: '%',
    description: 'Progress toward a verified student profile',
    gradient: 'from-blue-200 via-blue-100 to-blue-50'
  },
  {
    label: 'Certificates Verified',
    value: 3,
    description: 'Credentials confirmed this week',
    gradient: 'from-emerald-200 via-emerald-100 to-emerald-50'
  },
  {
    label: 'Messages Unread',
    value: 5,
    description: 'New conversations waiting',
    gradient: 'from-purple-200 via-purple-100 to-purple-50'
  },
  {
    label: 'Opportunities',
    value: 12,
    description: 'Live placement + internship leads',
    gradient: 'from-amber-200 via-amber-100 to-amber-50'
  }
];

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

const StudentDashboard = ({ email = '', onLogout = () => {}, onModuleSelect = () => {} }) => {
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState(() => statsCards.map(() => 0));

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let animationFrame;
    const start = performance.now();
    const duration = 900;

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = easeOutCubic(progress);
      setCounts(statsCards.map((stat) => Math.round(stat.value * eased)));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-lg font-black text-white shadow-lg shadow-slate-500/30">
              K
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">KLH UniConnect</p>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Student</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <p className="text-[0.6rem] uppercase tracking-[0.5em] text-slate-400">Role</p>
              <p className="text-base font-semibold text-slate-900">Student</p>
            </div>
            <div className="text-right">
              <p className="text-[0.6rem] uppercase tracking-[0.5em] text-slate-400">Email</p>
              <p className="text-base font-semibold text-slate-900">{email || 'user@klh.edu.in'}</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-slate-600 transition hover:border-slate-300 hover:text-slate-900 flex items-center gap-2"
            >
              <LogOut className="w-3 h-3" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="pb-16">
        {/* Welcome Banner */}
        <section className="mx-auto mt-6 max-w-6xl px-6">
          <div
            className={`overflow-hidden rounded-[40px] bg-gradient-to-r from-purple-100 via-pink-100 to-blue-100 px-10 py-12 text-slate-900 shadow-lg transition duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
          >
            <p className="text-4xl font-black tracking-tight">Welcome back! 👋</p>
            <p className="mt-3 text-lg text-slate-700">
              Access all your university tools and features in one place. Start exploring the KLH UniConnect ecosystem.
            </p>
          </div>
        </section>

        {/* Available Modules */}
        <section className="mx-auto mt-12 max-w-6xl px-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900">Available Modules</h2>
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-slate-400">Daily intelligence</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {moduleCards.map((module, index) => {
              const Icon = module.icon;
              return (
                <button
                  key={module.title}
                  onClick={() => {
                    if (module.title === 'My Profile') onModuleSelect('profile');
                    if (module.title === 'Reels & Feed') onModuleSelect('reels');
                    if (module.title === 'Academics') onModuleSelect('academics');
                    if (module.title === 'Placements') onModuleSelect('placements');
                    if (module.title === 'Certificates') onModuleSelect('certificates');
                    if (module.title === 'Chat') onModuleSelect('chat');
                    if (module.title === 'Events & Clubs') onModuleSelect('events');
                    if (module.title === 'Discover') onModuleSelect('discover');
                    if (module.title === 'AI Assistant') onModuleSelect('ai');
                    if (module.title === 'Safety') onModuleSelect('safety');
                    if (module.title === 'Analytics') onModuleSelect('analytics');
                  }}
                  className={`text-left transform rounded-[28px] border border-white bg-white p-6 shadow-[0_25px_90px_-50px_rgba(15,23,42,0.9)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_-40px_rgba(15,23,42,0.6)] ${
                    mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{ transitionDelay: `${index * 60}ms` }}
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[24px] ${module.iconLayout} text-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]`}>
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{module.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{module.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Stats Cards */}
        <section className="mx-auto mt-12 max-w-6xl px-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {statsCards.map((stat, index) => (
              <article
                key={stat.label}
                className={`rounded-[32px] px-6 py-8 shadow-lg bg-gradient-to-br ${stat.gradient} border border-white/50 transition duration-500 hover:-translate-y-1 hover:shadow-xl ${
                  mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${index * 60}ms` }}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.45em] text-slate-600">{stat.label}</p>
                <p className="mt-4 text-4xl font-black text-slate-900">
                  {counts[index]}
                  {stat.suffix}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{stat.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
