import React from 'react';

const Footer = () => (
  <footer className="mt-20 border-t border-slate-100 bg-white px-6 py-12">
    <div className="mx-auto max-w-6xl space-y-10 text-sm text-slate-600">
      <div className="flex flex-col gap-4 text-slate-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold">KLH UniConnect</p>
          <p className="text-sm text-slate-500">
            A comprehensive university platform combining social media, academics, placements, and administration.
          </p>
        </div>
        <span className="text-xs uppercase tracking-[0.4em] text-slate-500">Stay connected</span>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Product</p>
          <p className="text-base text-slate-900">Features</p>
          <p className="text-base text-slate-900">Security</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Company</p>
          <p className="text-base text-slate-900">About</p>
          <p className="text-base text-slate-900">Contact</p>
          <p className="text-base text-slate-900">Blog</p>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Legal</p>
          <p className="text-base text-slate-900">Privacy Policy</p>
          <p className="text-base text-slate-900">Terms</p>
          <p className="text-base text-slate-900">Cookie Policy</p>
        </div>
      </div>
      <div className="border-t border-slate-100 pt-6 text-xs uppercase tracking-[0.4em] text-slate-500">
        <div className="flex flex-col items-start gap-2 text-slate-500 md:flex-row md:items-center md:justify-between">
          <span>© 2025 KLH University. All rights reserved.</span>
          <span>Made with ❤️ for the KLH Community</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
