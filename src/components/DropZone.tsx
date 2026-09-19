import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { ParsingProgress } from '../types/chat';

interface DropZoneProps {
  onFileSelected: (file: File) => void;
  progress: ParsingProgress | null;
  error: string | null;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, progress, error }) => {
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
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !progress && fileInputRef.current?.click()}
        className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 transition-all duration-300 flex flex-col items-center justify-center text-center ${
          isDragging
            ? 'border-brand-emerald bg-brand-emerald/10 scale-[1.01] shadow-[0_0_30px_rgba(16,185,129,0.2)]'
            : progress
            ? 'border-white/20 bg-surface/80 cursor-wait'
            : 'border-white/10 hover:border-brand-emerald/50 bg-surface/50 hover:bg-surface/80 glass-card'
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
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-12 h-12 text-brand-emerald animate-spin" />
              <span className="absolute font-mono text-xs font-bold text-white">
                {progress.percentage}%
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white capitalize">
                {progress.phase === 'parsing' ? 'Reading & tokenizing messages...' : 'Analyzing conversation dynamics...'}
              </p>
              {progress.messageCount > 0 && (
                <p className="text-xs font-mono text-brand-emerald">
                  {progress.messageCount.toLocaleString()} messages parsed so far
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-white/10 flex items-center justify-center text-brand-emerald mb-4 group-hover:scale-110 group-hover:border-brand-emerald/40 transition-transform duration-300 shadow-lg">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5 tracking-tight">
              Drop your WhatsApp export here
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mb-4">
              Drag & drop your <span className="font-mono text-zinc-200">_chat.txt</span> or <span className="font-mono text-zinc-200">.zip</span> archive, or click to browse.
            </p>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Supports iOS & Android formats</span>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center space-x-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
