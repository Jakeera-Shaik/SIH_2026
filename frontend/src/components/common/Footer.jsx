import React from 'react';
import { Sprout, ShieldCheck, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Sprout className="w-5 h-5 text-emerald-500" />
          <span className="font-semibold text-slate-200">KrishiSetu Platform</span>
          <span className="text-slate-600">|</span>
          <span className="text-xs text-slate-500">SIH 2026 Innovation Challenge</span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400">
          <span>AI Decision Support</span>
          <span>•</span>
          <span>Mandi Price Intelligence</span>
          <span>•</span>
          <span>Direct Buyer Linkage</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>Built with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          <span>for Indian Farmers</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
