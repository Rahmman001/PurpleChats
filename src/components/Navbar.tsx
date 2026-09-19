import React from 'react';
import { ShieldCheck, HelpCircle, RotateCcw } from 'lucide-react';

interface NavbarProps {
  hasData: boolean;
  onReset: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ hasData, onReset, onOpenGuide }) => {
  return (
    <header className="w-full border-b border-white/5 bg-background/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.38 17.07L2 22L7.09 20.66C8.54 21.5 10.21 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.88 16.4C16.68 16.96 15.75 17.47 15.22 17.53C14.75 17.58 14.13 17.6 12.05 16.74C9.4 15.65 7.69 12.96 7.56 12.79C7.43 12.62 6.5 11.38 6.5 10.09C6.5 8.8 7.16 8.17 7.42 7.9C7.68 7.63 7.99 7.57 8.19 7.57C8.39 7.57 8.59 7.57 8.76 7.58C8.94 7.59 9.18 7.52 9.4 8.05C9.63 8.61 10.18 9.96 10.25 10.1C10.32 10.24 10.36 10.41 10.26 10.6C10.16 10.79 10.09 10.89 9.94 11.06C9.79 11.23 9.63 11.43 9.5 11.57C9.35 11.73 9.19 11.9 9.36 12.19C9.53 12.48 10.12 13.44 10.99 14.21C12.11 15.21 13.03 15.53 13.33 15.68C13.63 15.83 13.8 15.81 13.98 15.6C14.16 15.39 14.75 14.7 14.97 14.39C15.19 14.08 15.41 14.13 15.68 14.23C15.95 14.33 17.41 15.05 17.71 15.2C18.01 15.35 18.21 15.42 18.28 15.54C18.35 15.66 18.35 16.19 18.15 16.75L16.88 16.4Z" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-base sm:text-lg text-white tracking-tight">
              Chat<span className="text-brand-emerald">Analyzer</span>
            </span>
            <span className="ml-2 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 rounded">
              v2.0
            </span>
          </div>
        </div>

        {/* Privacy badge & Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-surface-elevated/70 border border-white/10 text-xs text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
            </span>
            <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
            <span>100% In-Browser · 0 Data Sent</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 border border-white/5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">How to Export</span>
          </button>

          {hasData && (
            <button
              onClick={onReset}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-white bg-surface-elevated hover:bg-surface-elevated/80 border border-white/10 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
