import React from 'react';
import { RotateCcw, Printer } from 'lucide-react';
import { useLanguage, Language } from '../utils/i18n';

interface NavbarProps {
  hasData: boolean;
  onReset: () => void;
  onOpenGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ hasData, onReset, onOpenGuide }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="w-full border-b border-[#E2DDD3] bg-[#F5F2EB]/90 backdrop-blur-md sticky top-0 z-40 print:hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="PurpleChats"
              className="w-6 h-6 object-contain"
            />
            <span className="font-serif text-base sm:text-lg font-normal text-[#1C1917] tracking-tight">
              {t.appTitle}
            </span>
          </div>
          <span className="hidden sm:inline-block text-[9px] font-mono uppercase tracking-wider text-[#15803D] px-2.5 py-0.5 rounded-full bg-[#E7F3EC] font-bold border border-[#CDE5D5]">
            {t.privateBadge}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Selector Pill */}
          <div className="flex items-center rounded-full bg-[#EFECE6] border border-[#E2DDD3] p-0.5 text-[10px] font-mono">
            {([
              { code: 'en' as Language, label: 'EN' },
              { code: 'hi' as Language, label: 'HI' },
              { code: 'es' as Language, label: 'ES' },
              { code: 'de' as Language, label: 'DE' },
            ]).map((item) => (
              <button
                key={item.code}
                onClick={() => setLanguage(item.code)}
                className={`px-1.5 sm:px-2 py-0.5 rounded-full transition-all font-semibold cursor-pointer ${
                  language === item.code
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
                title={`Switch language to ${item.label}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenGuide}
            className="text-xs font-mono text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer whitespace-nowrap hidden sm:inline-block"
          >
            {t.exportGuide}
          </button>

          {hasData && (
            <>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 text-xs font-mono text-[#1C1917] hover:text-[#1C1917] px-3.5 py-1.5 rounded-full border border-[#E2DDD3] bg-[#EFECE6] hover:bg-[#EAE5DB] transition-colors cursor-pointer whitespace-nowrap"
                title="Print or Save as PDF"
              >
                <Printer className="w-3 h-3 shrink-0 text-[#16A34A]" />
                <span className="hidden sm:inline">{t.exportPdf}</span>
                <span className="sm:hidden">PDF</span>
              </button>

              <button
                onClick={onReset}
                className="flex items-center gap-1.5 text-xs font-mono text-[#1C1917] hover:text-[#1C1917] px-3.5 py-1.5 rounded-full border border-[#E2DDD3] bg-[#EFECE6] hover:bg-[#EAE5DB] transition-colors cursor-pointer whitespace-nowrap"
                title="Analyze another chat file"
              >
                <RotateCcw className="w-3 h-3 shrink-0 text-[#78716C]" />
                <span className="hidden sm:inline">{t.resetChat}</span>
                <span className="sm:hidden">Reset</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
