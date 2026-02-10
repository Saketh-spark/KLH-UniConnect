import React from 'react';

const navLinks = ['Home', 'Features', 'About'];

const Navbar = ({ onSignIn = () => {}, onGetStarted = () => {} }) => (
  <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3 text-lg font-semibold text-slate-900">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-600 to-indigo-600 text-base font-bold text-white">
          K
        </span>
        <span>KLH UniConnect</span>
      </div>
      <nav className="hidden items-center gap-10 text-sm font-medium text-slate-600 md:flex">
        {navLinks.map((link) => (
          <a key={link} className="transition hover:text-slate-900" href="#">
            {link}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onSignIn} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
          Sign In
        </button>
        <button
          type="button"
          onClick={onGetStarted}
          className="rounded-full bg-gradient-to-r from-sky-600 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:opacity-90"
        >
          Get Started
        </button>
      </div>
    </div>
  </header>
);

export default Navbar;
