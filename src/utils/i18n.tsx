import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'es' | 'de';
export type SupportedLocale = Language;

export interface Translations {
  appTitle: string;
  privateBadge: string;
  exportGuide: string;
  exportPdf: string;
  resetChat: string;
  heroHeadline: string;
  heroSubheadline: string;
  trySampleChat: string;
  howToExport: string;
  dropZonePrompt: string;
  dropZoneSubtext: string;
  dropZoneBrowse: string;
  onDeviceBadge: string;
  notableMomentsTitle: string;
  mostReactions: string;
  mostEmojis: string;
  longestMessage: string;
  fastestExchange: string;
  lateNightChat: string;
}

export const translations: Record<SupportedLocale, Translations> = {
  en: {
    appTitle: 'PurpleChats',
    privateBadge: 'Private (On-Device)',
    exportGuide: 'How to Export',
    exportPdf: 'Export PDF',
    resetChat: 'Analyze Another',
    heroHeadline: 'See how your circle talks, laughs, and stays in touch.',
    heroSubheadline: 'Explore your WhatsApp chat habits and get personalized Wrapped cards—100% private, on-device.',
    trySampleChat: 'Try with sample chat',
    howToExport: 'How to export chat',
    dropZonePrompt: 'Drop your exported chat (.txt or .zip)',
    dropZoneSubtext: 'or select file from your device',
    dropZoneBrowse: 'Select File',
    onDeviceBadge: '100% PRIVATE · RUNS ON YOUR BROWSER',
    notableMomentsTitle: 'Notable Moments',
    mostReactions: 'Most Reactions',
    mostEmojis: 'Most Emojis',
    longestMessage: 'Longest Message',
    fastestExchange: 'Fastest Exchange',
    lateNightChat: 'Late Night Chat',
  },
  es: {
    appTitle: 'PurpleChats',
    privateBadge: 'Privado (En dispositivo)',
    exportGuide: 'Cómo Exportar',
    exportPdf: 'Exportar PDF',
    resetChat: 'Analizar Otro',
    heroHeadline: 'Descubre cómo tu círculo habla, ríe y se comunica.',
    heroSubheadline: 'Explora los hábitos de tu chat de WhatsApp y obtén tarjetas Wrapped personalizadas: 100% privado, en tu dispositivo.',
    trySampleChat: 'Probar con chat de muestra',
    howToExport: 'Cómo exportar chat',
    dropZonePrompt: 'Arrastra tu chat exportado (.txt o .zip)',
    dropZoneSubtext: 'o selecciona un archivo de tu dispositivo',
    dropZoneBrowse: 'Seleccionar Archivo',
    onDeviceBadge: '100% PRIVADO · SE EJECUTA EN TU NAVEGADOR',
    notableMomentsTitle: 'Momentos Destacados',
    mostReactions: 'Más Reacciones',
    mostEmojis: 'Más Emojis',
    longestMessage: 'Mensaje Más Largo',
    fastestExchange: 'Intercambio Más Rápido',
    lateNightChat: 'Chat Nocturno',
  },
  de: {
    appTitle: 'PurpleChats',
    privateBadge: 'Privat (Auf dem Gerät)',
    exportGuide: 'Anleitung zum Exportieren',
    exportPdf: 'PDF Exportieren',
    resetChat: 'Anderen Chat analysieren',
    heroHeadline: 'Erfahre, wie dein Kreis spricht, lacht und in Kontakt bleibt.',
    heroSubheadline: 'Entdecke deine WhatsApp-Chat-Gewohnheiten und personalisierte Wrapped-Karten – 100 % privat, auf deinem Gerät.',
    trySampleChat: 'Mit Beispiel-Chat testen',
    howToExport: 'Chat exportieren',
    dropZonePrompt: 'Exportierten Chat hier ablegen (.txt oder .zip)',
    dropZoneSubtext: 'oder Datei von deinem Gerät wählen',
    dropZoneBrowse: 'Datei Auswählen',
    onDeviceBadge: '100% PRIVAT · LÄUFT DIREKT IM BROWSER',
    notableMomentsTitle: 'Besondere Momente',
    mostReactions: 'Meiste Reaktionen',
    mostEmojis: 'Meiste Emojis',
    longestMessage: 'Längste Nachricht',
    fastestExchange: 'Schnellster Austausch',
    lateNightChat: 'Nachtaktiver Chat',
  },
  hi: {
    appTitle: 'PurpleChats',
    privateBadge: 'निजी (ऑन-डिवाइस)',
    exportGuide: 'एक्सपोर्ट गाइड',
    exportPdf: 'पीडीएफ एक्सपोर्ट',
    resetChat: 'अन्य चैट जोड़ें',
    heroHeadline: 'देखें आपका ग्रुप कैसे बात करता है और जुड़ा रहता है।',
    heroSubheadline: 'व्हाट्सएप चैट की आदतें समझें और पर्सनलाइज्ड रैप्ड कार्ड्स पाएं—100% निजी, ऑन-डिवाइस।',
    trySampleChat: 'सैंपल चैट के साथ देखें',
    howToExport: 'चैट कैसे एक्सपोर्ट करें',
    dropZonePrompt: 'अपनी चैट फ़ाइल यहाँ छोड़ें (.txt या .zip)',
    dropZoneSubtext: 'या अपने डिवाइस से फ़ाइल चुनें',
    dropZoneBrowse: 'फ़ाइल चुनें',
    onDeviceBadge: '100% निजी · आपके ब्राउज़र में चलता है',
    notableMomentsTitle: 'खास पल और बातचीत',
    mostReactions: 'सबसे ज़्यादा रिएक्शन',
    mostEmojis: 'सबसे ज़्यादा इमोजी',
    longestMessage: 'सबसे लंबा संदेश',
    fastestExchange: 'सबसे तेज़ जवाब',
    lateNightChat: 'देर रात की बातचीत',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

const STORAGE_KEY = 'whatsapp_analyzer_locale';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'es' || saved === 'de' || saved === 'hi') {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

