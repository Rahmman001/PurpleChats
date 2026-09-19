import React, { useState } from 'react';
import { X, Smartphone, Apple } from 'lucide-react';

interface ExportGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportGuideModal: React.FC<ExportGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card-elevated rounded-2xl p-6 sm:p-7 shadow-2xl border border-white/10">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <h3 className="text-lg font-bold text-white tracking-tight">
            How to Export Your WhatsApp Chat
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switches */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-elevated rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'ios'
                ? 'bg-brand-emerald text-black font-semibold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>iPhone (iOS)</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center justify-center space-x-2 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'android'
                ? 'bg-brand-emerald text-black font-semibold shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android</span>
          </button>
        </div>

        {/* Steps */}
        {activeTab === 'ios' ? (
          <ol className="space-y-4 text-sm text-zinc-300">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">1</span>
              <span>Open the WhatsApp chat you want to analyze and tap the contact or group name at the top.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">2</span>
              <span>Scroll down to the bottom and tap <strong className="text-white">Export Chat</strong>.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">3</span>
              <span>Select <strong className="text-brand-emerald">Without Media</strong> (speeds up export and protects privacy).</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">4</span>
              <span>Save the <code className="text-xs font-mono text-zinc-200 bg-surface-elevated px-1.5 py-0.5 rounded">.zip</code> or <code className="text-xs font-mono text-zinc-200 bg-surface-elevated px-1.5 py-0.5 rounded">_chat.txt</code> to your Files or AirDrop it to your computer, then drop it here!</span>
            </li>
          </ol>
        ) : (
          <ol className="space-y-4 text-sm text-zinc-300">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">1</span>
              <span>Open the chat, tap the <strong className="text-white">three dots (⋮)</strong> in the top-right corner.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">2</span>
              <span>Tap <strong className="text-white">More</strong> &gt; <strong className="text-white">Export chat</strong>.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">3</span>
              <span>Choose <strong className="text-brand-emerald">Without media</strong>.</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface-elevated border border-white/10 text-brand-emerald flex items-center justify-center text-xs font-mono font-bold">4</span>
              <span>Share or save the exported <code className="text-xs font-mono text-zinc-200 bg-surface-elevated px-1.5 py-0.5 rounded">.txt</code> file and drop it directly onto the screen.</span>
            </li>
          </ol>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-surface-elevated hover:bg-white/10 text-white transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
