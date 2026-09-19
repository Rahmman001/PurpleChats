import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Search, X, Check, User, Users, ChevronDown } from 'lucide-react';
import { ParticipantSummary } from '../types/chat';
import { resolveSenderName } from '../utils/phoneHandler';

interface SearchableParticipantSelectorProps {
  participants: ParticipantSummary[];
  selectedParticipant: string | null;
  onSelectParticipant: (name: string | null) => void;
  id?: string;
  theme?: 'light' | 'dark';
  placeholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  anonymize?: boolean;
}

export const SearchableParticipantSelector: React.FC<SearchableParticipantSelectorProps> = ({
  participants,
  selectedParticipant,
  onSelectParticipant,
  id = 'participant-selector',
  theme = 'light',
  placeholder = 'Find member...',
  showAllOption = false,
  allOptionLabel = 'All (Group Story)',
  anonymize = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  const getDisplayName = useCallback(
    (rawName: string) => {
      if (anonymize) {
        const idx = participants.findIndex((p) => p.name === rawName);
        return `Member ${String.fromCharCode(65 + ((idx >= 0 ? idx : 0) % 26))}`;
      }
      return resolveSenderName(rawName);
    },
    [anonymize, participants]
  );

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

  // Filter participants by query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;
    const query = searchQuery.toLowerCase().trim();
    return participants.filter((p) => {
      const resolved = getDisplayName(p.name).toLowerCase();
      const raw = p.name.toLowerCase();
      return resolved.includes(query) || raw.includes(query);
    });
  }, [participants, searchQuery, getDisplayName]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button / Pill */}
      {selectedParticipant ? (
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium shadow-xs ${
            isDark
              ? 'bg-[#1E1B19] border border-white/15 text-[#FAF8F5]'
              : 'bg-[#1C1917] text-[#FAF8F5]'
          }`}
        >
          <User className={`w-3 h-3 shrink-0 ${isDark ? 'text-amber-400' : 'text-emerald-400'}`} />
          <span className="truncate max-w-[130px] sm:max-w-[170px] font-sans">
            {showAllOption ? `I am: ${getDisplayName(selectedParticipant)}` : getDisplayName(selectedParticipant)}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectParticipant(null);
            }}
            className="hover:text-red-300 ml-0.5 p-0.5 rounded-full cursor-pointer transition-colors"
            title="Clear selection"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          id={id}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-colors cursor-pointer ${
            isDark
              ? 'bg-[#1E1B19] border border-white/10 text-[#D6D3D1] hover:text-white hover:border-white/20'
              : 'bg-[#EFECE6] border border-[#E2DDD3] hover:bg-[#EAE5DB] text-[#57534E] hover:text-[#1C1917]'
          }`}
          title="Filter or select member"
        >
          {showAllOption ? (
            <User className={`w-3.5 h-3.5 shrink-0 ${isDark ? 'text-amber-400/80' : 'text-[#78716C]'}`} />
          ) : (
            <Search className="w-3 h-3 text-[#78716C]" />
          )}
          <span>{placeholder}</span>
          <ChevronDown
            className={`w-3 h-3 text-[#78716C] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>
      )}

      {/* Popover Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          aria-label="Select member"
          className={`absolute right-0 sm:left-0 top-full mt-1.5 w-[260px] sm:w-[290px] max-w-[calc(100vw-2rem)] rounded-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? 'bg-[#1C1A18] border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl'
              : 'bg-[#FDFBF7] border border-[#E7E2D8] shadow-[0_16px_40px_rgba(0,0,0,0.14)]'
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
              placeholder="Search members..."
              className={`w-full rounded-xl text-xs font-mono pl-8 pr-7 py-1.5 focus:outline-none focus:ring-1 ${
                isDark
                  ? 'bg-[#292524] border border-white/10 text-white placeholder-[#78716C] focus:border-amber-400/50 focus:ring-amber-400/20'
                  : 'bg-[#EFECE6] border border-[#E2DDD3] text-[#1C1917] placeholder-[#78716C] focus:border-[#1C1917]/40 focus:ring-[#1C1917]/20'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-white p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Subheader */}
          <div
            className={`flex items-center justify-between px-2 py-1 mb-1 text-[9px] font-mono border-b ${
              isDark ? 'text-[#A8A29E] border-white/5' : 'text-[#78716C] border-[#E2DDD3]'
            }`}
          >
            <span>{showAllOption ? 'SELECT PERSPECTIVE' : 'MEMBERS'}</span>
            <span>
              {searchQuery
                ? `${filteredParticipants.length} of ${participants.length}`
                : `${participants.length} total`}
            </span>
          </div>

          {/* Members List */}
          <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5 custom-scrollbar">
            {/* Optional "All / Group" Option */}
            {showAllOption && (!searchQuery || 'all group everyone'.includes(searchQuery.toLowerCase())) && (
              <button
                type="button"
                role="option"
                aria-selected={selectedParticipant === null}
                onClick={() => {
                  onSelectParticipant(null);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                  selectedParticipant === null
                    ? isDark
                      ? 'bg-amber-400/15 text-amber-300 font-medium'
                      : 'bg-[#1C1917] text-[#FAF8F5] font-medium'
                    : isDark
                    ? 'text-[#D6D3D1] hover:bg-white/5 hover:text-white'
                    : 'text-[#1C1917] hover:bg-[#EFECE6]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Users className="w-3 h-3 text-amber-400" />
                  </div>
                  <span className="truncate font-mono">{allOptionLabel}</span>
                </div>
                {selectedParticipant === null && (
                  <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
                )}
              </button>
            )}

            {filteredParticipants.length === 0 ? (
              <div className="py-5 px-3 text-center text-xs font-mono text-[#78716C]">
                No members match "{searchQuery}"
              </div>
            ) : (
              filteredParticipants.map((p) => {
                const active = selectedParticipant === p.name;
                const displayName = getDisplayName(p.name);
                return (
                  <button
                    key={p.name}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onSelectParticipant(p.name);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer text-xs ${
                      active
                        ? isDark
                          ? 'bg-amber-400/15 text-amber-300 font-medium'
                          : 'bg-[#1C1917] text-[#FAF8F5] font-medium'
                        : isDark
                        ? 'text-[#D6D3D1] hover:bg-white/5 hover:text-white'
                        : 'text-[#1C1917] hover:bg-[#EFECE6]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.color || '#16A34A' }}
                      />
                      <span className="truncate font-sans font-medium">{displayName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
                          active
                            ? 'bg-white/20 text-[#FAF8F5]'
                            : isDark
                            ? 'bg-white/10 text-[#A8A29E]'
                            : 'bg-[#E2DDD3] text-[#57534E]'
                        }`}
                      >
                        {p.messageCount.toLocaleString()} msgs
                      </span>
                      {active && (
                        <Check
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isDark ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        />
                      )}
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
