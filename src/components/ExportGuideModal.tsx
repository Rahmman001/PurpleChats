import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportGuideModal: React.FC<ExportGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#F5F2EB] border border-[#E7E2D8] rounded-3xl p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E2DDD3] mb-5">
          <div>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#78716C] block mb-1">
              Quick Guide · On-Device Privacy
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] tracking-tight">
              How to export your chat from WhatsApp
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#78716C] hover:text-[#1C1917] transition-colors cursor-pointer shrink-0"
            title="Close guide"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Platform Tabs */}
        <div className="flex gap-1.5 p-1 bg-[#EFECE6] border border-[#E2DDD3] rounded-full mb-6">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'ios'
                ? 'bg-[#1C1917] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Apple iOS
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-1.5 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'android'
                ? 'bg-[#1C1917] text-white shadow-xs'
                : 'text-[#78716C] hover:text-[#1C1917]'
            }`}
          >
            Google Android
          </button>
        </div>

        {/* Steps List */}
        {activeTab === 'ios' ? (
          <ol className="space-y-3.5 text-xs sm:text-sm font-serif text-[#57534E]">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                01
              </span>
              <span>Open the WhatsApp chat and tap the contact or group name at the very top.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                02
              </span>
              <span>Scroll down and tap <strong className="text-[#1C1917] font-semibold">Export Chat</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                03
              </span>
              <span>Choose <strong className="text-[#1C1917] font-semibold">Without Media</strong> (this exports faster and keeps your archive lightweight).</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                04
              </span>
              <span>Save the <code className="text-xs font-mono text-[#1C1917] bg-[#EFECE6] border border-[#E2DDD3] px-1.5 py-0.5 rounded">.zip</code> or <code className="text-xs font-mono text-[#1C1917] bg-[#EFECE6] border border-[#E2DDD3] px-1.5 py-0.5 rounded">.txt</code> file to your device and drop it in.</span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-3.5 text-xs sm:text-sm font-serif text-[#57534E]">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                01
              </span>
              <span>Open the WhatsApp chat and tap the three dots in the top-right corner.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                02
              </span>
              <span>Tap <strong className="text-[#1C1917] font-semibold">More</strong>, then tap <strong className="text-[#1C1917] font-semibold">Export chat</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                03
              </span>
              <span>Choose <strong className="text-[#1C1917] font-semibold">Without media</strong>.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] flex items-center justify-center text-[10px] font-mono mt-0.5 font-bold">
                04
              </span>
              <span>Save the <code className="text-xs font-mono text-[#1C1917] bg-[#EFECE6] border border-[#E2DDD3] px-1.5 py-0.5 rounded">.txt</code> file and drop it here to begin.</span>
            </li>
          </ol>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[#E2DDD3] flex items-center justify-between">
          <span className="text-[10px] font-mono text-[#78716C]">
            Zero servers · 100% On-Device
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#1C1917] hover:bg-[#2E2A27] text-white font-mono text-xs font-medium transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
