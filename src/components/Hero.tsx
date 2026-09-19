import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DropZone } from './DropZone';
import { TiltStoryCard } from './TiltStoryCard';
import { PreviewBento } from './PreviewBento';
import { ParsingProgress } from '../types/chat';
import { useLanguage } from '../utils/i18n';

interface HeroProps {
  onFileSelected: (file: File) => void;
  onLoadDemo: () => void;
  onOpenGuide: () => void;
  progress: ParsingProgress | null;
  error: string | null;
}

export const Hero: React.FC<HeroProps> = ({
  onFileSelected,
  onLoadDemo,
  onOpenGuide,
  progress,
  error,
}) => {
  const { t } = useLanguage();

  return (
    <section className="w-full flex flex-col flex-1 min-h-0 md:overflow-hidden bg-[#F5F2EB]">
      <div className="w-full grid grid-cols-1 md:grid-cols-12 flex-1 min-h-0 border-b border-[#E2DDD3]">
        {/* Left Column: Editorial Typography & Actions */}
        <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-center px-5 sm:px-8 md:px-10 lg:px-12 py-6 sm:py-8 md:py-10 border-b md:border-b-0 md:border-r border-[#E2DDD3] relative min-h-0">
          <div className="space-y-4 sm:space-y-5 max-w-2xl my-auto">
            {/* Editorial Serif Headline */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-[3.5vw] font-normal tracking-tight text-[#1C1917] leading-[1.12]">
              {t.heroHeadline}
            </h1>

            {/* Editorial Serif Description */}
            <p className="text-sm sm:text-base font-serif text-[#57534E] max-w-xl leading-relaxed">
              {t.heroSubheadline}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 sm:pt-4 w-full sm:w-auto">
              <button
                onClick={onLoadDemo}
                className="px-6 py-3 rounded-full bg-[#1C1917] hover:bg-[#2E2A27] text-white font-mono text-xs font-medium flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto group"
              >
                <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse shrink-0" />
                <span>{t.trySampleChat}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>
              <button
                onClick={onOpenGuide}
                className="px-6 py-3 rounded-full bg-[#EFECE6] hover:bg-[#EAE5DB] text-[#1C1917] font-mono text-xs font-medium border border-[#E2DDD3] transition-all cursor-pointer w-full sm:w-auto text-center"
              >
                {t.howToExport}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Tilt Story Card Preview & Drop Zone */}
        <div className="md:col-span-6 lg:col-span-7 min-h-0 h-full bg-[#EFECE6] p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 overflow-hidden relative">
          {/* 3D Tilt Perspective Example Story Card */}
          <div className="shrink-0 flex items-center justify-center">
            <TiltStoryCard />
          </div>

          {/* Upload Drop Zone */}
          <div className="w-full max-w-[310px] shrink-0">
            <DropZone
              onFileSelected={onFileSelected}
              progress={progress}
              error={error}
            />
          </div>
        </div>
      </div>

      {/* Bottom Grid: Previews */}
      <div className="w-full h-auto md:h-56 lg:h-60 shrink-0 bg-[#F5F2EB]">
        <PreviewBento />
      </div>
    </section>
  );
};
