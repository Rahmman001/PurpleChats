import { useState, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { BentoGrid } from './components/BentoGrid';
import { ExportGuideModal } from './components/ExportGuideModal';
import { WrappedStoryModal } from './components/WrappedStoryModal';
import { ChatAnalytics, ParsingProgress } from './types/chat';
import { extractChatTextFromFile } from './utils/fileHandler';
import { DEMO_CHAT_TEXT } from './utils/demoData';
import { parseWhatsAppChat } from './utils/parser';
import { computeChatAnalytics } from './utils/analytics';
import { assignBadges } from './utils/badges';

export default function App() {
  const [analytics, setAnalytics] = useState<ChatAnalytics | null>(null);
  const [progress, setProgress] = useState<ParsingProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    try {
      workerRef.current = new Worker(
        new URL('./workers/parseWorker.ts', import.meta.url),
        { type: 'module' }
      );

      workerRef.current.onmessage = (e) => {
        const data = e.data;
        if (data.phase === 'complete') {
          setAnalytics(data.analytics);
          setProgress(null);
          setError(null);
        } else if (data.phase === 'error') {
          setError(data.error);
          setProgress(null);
        } else {
          setProgress({
            phase: data.phase,
            percentage: data.percentage,
            messageCount: data.messageCount || 0,
          });
        }
      };

      workerRef.current.onerror = (err) => {
        console.error('Worker error:', err);
        setError('Worker encountered an error parsing the chat.');
        setProgress(null);
      };
    } catch (e) {
      console.warn('Web Worker fallback enabled:', e);
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  // Process raw text either through Web Worker or synchronous fallback
  const processRawText = (rawText: string) => {
    setError(null);

    if (workerRef.current) {
      setProgress({ phase: 'reading', percentage: 10, messageCount: 0 });
      workerRef.current.postMessage({ rawText });
    } else {
      // Synchronous fallback if worker fails to initialize
      try {
        const messages = parseWhatsAppChat(rawText);
        if (messages.length === 0) {
          setError('No valid messages could be parsed from this file. Check the format in the Export Guide.');
          return;
        }
        const calculated = computeChatAnalytics(messages);
        calculated.badges = assignBadges(calculated);
        setAnalytics(calculated);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to analyze chat.');
      }
    }
  };

  // Handle file drop/upload
  const handleFileSelected = async (file: File) => {
    try {
      setError(null);
      setProgress({ phase: 'reading', percentage: 5, messageCount: 0 });
      const rawText = await extractChatTextFromFile(file);

      if (!rawText.trim()) {
        setError('The selected file is empty.');
        setProgress(null);
        return;
      }

      processRawText(rawText);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file.');
      setProgress(null);
    }
  };

  // Handle Demo Mode
  const handleLoadDemo = () => {
    setError(null);
    // Directly crunch demo data for instantaneous feedback
    const messages = parseWhatsAppChat(DEMO_CHAT_TEXT);
    const calculated = computeChatAnalytics(messages);
    calculated.badges = assignBadges(calculated);
    setAnalytics(calculated);
  };

  // Reset to initial state
  const handleReset = () => {
    setAnalytics(null);
    setProgress(null);
    setError(null);
    setIsWrappedOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-zinc-100 flex flex-col selection:bg-brand-emerald selection:text-black">
      <Navbar
        hasData={!!analytics}
        onReset={handleReset}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="flex-1 flex flex-col">
        {!analytics ? (
          <Hero
            onFileSelected={handleFileSelected}
            onLoadDemo={handleLoadDemo}
            onOpenGuide={() => setIsGuideOpen(true)}
            progress={progress}
            error={error}
          />
        ) : (
          <BentoGrid
            analytics={analytics}
            onOpenWrapped={() => setIsWrappedOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-6 px-4 text-center text-xs text-zinc-500 font-mono">
        <p>
          WhatsApp Chat Analyzer v2 · 100% Client-Side Privacy · No data is ever transmitted to any server
        </p>
      </footer>

      {/* Modals */}
      <ExportGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {analytics && (
        <WrappedStoryModal
          isOpen={isWrappedOpen}
          onClose={() => setIsWrappedOpen(false)}
          analytics={analytics}
        />
      )}
    </div>
  );
}
