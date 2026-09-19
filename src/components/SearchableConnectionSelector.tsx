import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, ChevronDown, ArrowRightLeft } from 'lucide-react';
import { ParticipantConnection } from '../types/chat';

interface SearchableConnectionSelectorProps {
  connections: ParticipantConnection[];
  selectedConnection: ParticipantConnection | null;
  onSelectConnection: (conn: ParticipantConnection) => void;
  id?: string;
  theme?: 'light' | 'dark';
}

export const SearchableConnectionSelector: React.FC<SearchableConnectionSelectorProps> = ({
  connections,
  selectedConnection,
  onSelectConnection,
  id = 'conn-selector',
  theme = 'light',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter connections by query (matches either source or target)
  const filteredConnections = useMemo(() => {
    if (!searchQuery.trim()) return connections;
    const query = searchQuery.toLowerCase().trim();
    return connections.filter(
      (c) =>
        c.source.toLowerCase().includes(query) ||
        c.target.toLowerCase().includes(query)
    );
  }, [connections, searchQuery]);

  const currentLabel = selectedConnection
    ? `${selectedConnection.source} × ${selectedConnection.target}`
    : 'Select pair';

  const isSelected = (c: ParticipantConnection) => {
    if (!selectedConnection) return false;
    return (
      (c.source === selectedConnection.source && c.target === selectedConnection.target) ||
      (c.source === selectedConnection.target && c.target === selectedConnection.source)
    );
  };

  const isDark = theme === 'dark';

  return (
    <div className="relative flex-1 min-w-0" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-1.5 font-serif text-sm sm:text-base font-normal bg-transparent border-none p-0 focus:outline-none cursor-pointer tracking-tight text-left truncate group transition-colors ${
          isDark
            ? 'text-[#FAF8F5] hover:text-emerald-400'
            : 'text-[#1C1917] hover:text-[#15803D]'
        }`}
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isDark
              ? 'text-[#A8A29E] group-hover:text-[#FAF8F5]'
              : 'text-[#78716C] group-hover:text-[#1C1917]'
          } ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select connection pair"
          className={`absolute left-0 top-full mt-2 w-[270px] sm:w-[300px] max-w-[calc(100vw-2rem)] rounded-2xl border p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-[#1C1A17] border-[#38342F] text-[#FAF8F5] shadow-[0_20px_50px_rgba(0,0,0,0.6)]'
              : 'bg-[#FDFBF7] border-[#E7E2D8] text-[#1C1917] shadow-[0_16px_40px_rgba(0,0,0,0.12)]'
          }`}
        >
          {/* Search Header */}
          <div className="relative mb-2">
            <Search className="w-3.5 h-3.5 text-[#78716C] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search pair or name..."
              className={`w-full border rounded-xl text-xs font-mono pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 ${
                isDark
                  ? 'bg-[#262420] border-[#38342F] text-[#FAF8F5] placeholder-[#78716C] focus:border-emerald-500/50 focus:ring-emerald-500/20'
                  : 'bg-[#EFECE6] border-[#E2DDD3] text-[#1C1917] placeholder-[#78716C] focus:border-[#1C1917]/40 focus:ring-[#1C1917]/20'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#FAF8F5] p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Subheader with count */}
          <div
            className={`flex items-center justify-between px-2 py-1 mb-1 text-[9px] font-mono border-b ${
              isDark ? 'border-[#38342F] text-[#A8A29E]' : 'border-[#E2DDD3] text-[#78716C]'
            }`}
          >
            <span>CONNECTIONS</span>
            <span>
              {searchQuery
                ? `${filteredConnections.length} of ${connections.length}`
                : `${connections.length} pairs`}
            </span>
          </div>

          {/* Connections List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {filteredConnections.length === 0 ? (
              <div className="py-5 px-3 text-center text-xs font-mono text-[#78716C]">
                No connections match "{searchQuery}"
              </div>
            ) : (
              filteredConnections.map((c) => {
                const active = isSelected(c);
                return (
                  <button
                    key={`${c.source}---${c.target}`}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onSelectConnection(c);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                      active
                        ? isDark
                          ? 'bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-medium'
                          : 'bg-[#1C1917] text-[#FAF8F5] font-medium'
                        : isDark
                        ? 'text-[#FAF8F5] hover:bg-[#262420]'
                        : 'text-[#1C1917] hover:bg-[#EFECE6]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <ArrowRightLeft
                        className={`w-3 h-3 shrink-0 ${
                          active ? (isDark ? 'text-emerald-400' : 'text-[#FAF8F5]/80') : 'text-[#78716C]'
                        }`}
                      />
                      <span className="truncate font-sans font-medium">
                        {c.source} × {c.target}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          active
                            ? isDark
                              ? 'bg-emerald-800/40 text-emerald-200'
                              : 'bg-white/20 text-[#FAF8F5]'
                            : isDark
                            ? 'bg-[#2A2723] text-[#A8A29E]'
                            : 'bg-[#E2DDD3] text-[#57534E]'
                        }`}
                      >
                        {c.exchangeCount} {c.exchangeCount === 1 ? 'reply' : 'replies'}
                      </span>
                      {active && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
