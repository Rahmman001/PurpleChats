import React, { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { ParsingProgress } from '../types/chat';
import { useLanguage } from '../utils/i18n';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  progress: ParsingProgress | null;
  error: string | null;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, progress, error }) => {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !progress && fileInputRef.current?.click()}
        className={`relative w-full h-full min-h-[240px] cursor-pointer rounded-3xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center text-center p-6 sm:p-8 ${
          isDragging
            ? 'border-[#16A34A] bg-[#FAF8F5] shadow-lg scale-[1.01]'
            : progress
            ? 'border-[#E2DDD3] bg-[#EFECE6] cursor-wait'
            : 'border-[#D5CDBC] hover:border-[#1C1917] bg-[#F5F2EB] hover:bg-[#FAF8F5] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-md'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.zip"
          onChange={handleInputChange}
          className="hidden"
          disabled={!!progress}
        />

        {progress ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-7 h-7 text-[#1C1917] animate-spin" />
            <div className="space-y-1">
              <p className="font-serif text-sm font-normal text-[#1C1917]">
                {progress.phase === 'parsing' ? 'Reading messages...' : 'Unpacking group insights...'}
              </p>
              {progress.messageCount > 0 && (
                <p className="text-[11px] font-mono text-[#78716C]">
                  {progress.messageCount.toLocaleString()} messages parsed
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] flex items-center justify-center mb-3 shadow-sm">
              <UploadCloud className="w-6 h-6 text-[#1C1917]" />
            </div>
            <p className="font-serif text-lg sm:text-xl font-normal text-[#1C1917] mb-1 tracking-tight">
              {t.dropZonePrompt}
            </p>
            <p className="text-xs font-serif italic text-[#57534E] max-w-[220px] mb-3 leading-relaxed">
              Accepts <span className="font-mono not-italic text-[#1C1917]">.txt</span> or <span className="font-mono not-italic text-[#1C1917]">.zip</span> from iOS or Android
            </p>
            <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-[#E7F3EC] text-[#15803D] font-bold border border-[#CDE5D5]">
              {t.onDeviceBadge}
            </span>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs font-serif">
          {error}
        </div>
      )}
    </div>
  );
};
