import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = ({ onSignIn = () => {}, onGetStarted = () => {} }) => {
  const { t } = useLanguage();
  const navLinks = [
    { key: 'home', label: t('nav.home') },
    { key: 'features', label: t('nav.features') },
    { key: 'about', label: t('nav.about') },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3 text-lg font-semibold text-slate-900">
          <img 
            src="/logo.png" 
            alt="KLH UniConnect" 
            className="h-10 w-10 rounded-lg object-contain"
          />
          <span>KLH UniConnect</span>
        </div>
        <nav className="hidden items-center gap-10 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <a key={link.key} className="transition hover:text-slate-900" href="#">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button type="button" onClick={onSignIn} className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
            {t('nav.signIn')}
          </button>
          <button
            type="button"
            onClick={onGetStarted}
            className="rounded-full bg-gradient-to-r from-sky-600 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-200 transition hover:opacity-90"
          >
            {t('nav.getStarted')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
