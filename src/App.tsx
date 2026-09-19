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
import { LanguageProvider } from './utils/i18n';

function AppContent() {
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

  // Process raw text through Web Worker
  const processRawText = (rawText: string) => {
    setError(null);
    setProgress({ phase: 'reading', percentage: 10, messageCount: 0 });
    workerRef.current?.postMessage({ rawText });
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
    <div className={`bg-[#F5F2EB] text-[#1C1917] flex flex-col ${!analytics ? 'min-h-dvh md:h-dvh md:overflow-hidden' : 'min-h-screen'}`}>
        <Navbar
        hasData={!!analytics}
        onReset={handleReset}
        onOpenGuide={() => setIsGuideOpen(true)}
      />

      <main className="flex-1 min-h-0 flex flex-col">
        {!analytics ? (
          <Hero
            onFileSelected={handleFileSelected}
            onLoadDemo={handleLoadDemo}
            onOpenGuide={() => setIsGuideOpen(true)}
            progress={progress}
            error={error}
          />
        ) : (
          <div className="w-full flex-1">
            {/* Print-Only Dossier Header */}
            <div className="hidden print:block max-w-7xl mx-auto px-4 pt-4 pb-4 mb-6 border-b border-[#E2DDD3]">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#78716C] block">
                    Confidential Archive Dossier
                  </span>
                  <h1 className="font-serif text-2xl text-[#1C1917] font-normal">
                    WhatsApp Group Intelligence Report
                  </h1>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-mono text-[#15803D] uppercase tracking-wider block font-bold">
                    100% On-Device · Zero External Servers
                  </span>
                  <span className="text-[9px] font-mono text-[#78716C]">
                    Generated {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>

            <BentoGrid
              analytics={analytics}
              onOpenWrapped={() => setIsWrappedOpen(true)}
            />
          </div>
        )}
      </main>

      {analytics && (
        <footer className="w-full border-t border-[#E2DDD3] py-6 px-4 text-center text-[11px] font-mono text-[#78716C] shrink-0 bg-[#F5F2EB] print:bg-white print:py-4">
          <p>Processed entirely in your browser · No messages or data ever leave this device</p>
        </footer>
      )}

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

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
