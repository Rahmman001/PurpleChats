import React, { useState } from 'react';
import { Flame, Sparkles } from 'lucide-react';

export const TiltStoryCard: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Gentle tilt angles: max ~10-12 deg
    setTilt({
      x: -(y / (rect.height / 2)) * 12,
      y: (x / (rect.width / 2)) * 14,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="relative flex items-center justify-center p-3 select-none group cursor-default"
      style={{ perspective: '1200px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Soft Ambient Glow under the Card */}
      <div
        className="absolute w-48 h-72 rounded-full bg-[#16A34A]/15 blur-2xl transition-opacity duration-500 pointer-events-none"
        style={{
          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
          opacity: isHovered ? 0.8 : 0.4,
        }}
      />

      {/* Floating 3D Badge 1: Top Right */}
      <div
        className="absolute -top-1 -right-2 sm:-right-4 z-30 px-3 py-1.5 rounded-full bg-[#1C1917] text-white border border-white/10 shadow-xl flex items-center gap-1.5 transition-all duration-300 pointer-events-none"
        style={{
          transform: isHovered
            ? `translate3d(${tilt.y * 0.8}px, ${tilt.x * 0.8}px, 40px) scale(1.05)`
            : 'translate3d(0, 0, 20px)',
        }}
      >
        <Sparkles className="w-3 h-3 text-[#FACC15] animate-spin-slow" />
        <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">
          Wrapped 2024
        </span>
      </div>

      {/* Floating 3D Badge 2: Bottom Left */}
      <div
        className="absolute -bottom-2 -left-2 sm:-left-4 z-30 px-2.5 py-1 rounded-full bg-[#EA580C] text-white shadow-xl flex items-center gap-1 transition-all duration-300 pointer-events-none"
        style={{
          transform: isHovered
            ? `translate3d(${tilt.y * 0.6}px, ${tilt.x * 0.6}px, 35px) scale(1.05)`
            : 'translate3d(0, 0, 20px)',
        }}
      >
        <Flame className="w-3 h-3 text-white" />
        <span className="text-[9px] font-mono uppercase font-bold tracking-wider">
          Top 1% Reflex
        </span>
      </div>

      {/* Main 9:16 Editorial Story Card */}
      <div
        className="w-[220px] sm:w-[240px] h-[380px] sm:h-[410px] rounded-[26px] bg-[#F5F2EB] border border-[#E2DDD3] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.25),0_0_0_1px_rgba(28,25,23,0.06)] flex flex-col justify-between p-4 relative overflow-hidden transition-all text-[#1C1917]"
        style={{
          transform: isHovered
            ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.03, 1.03, 1.03)`
            : 'rotateY(-12deg) rotateX(7deg) rotateZ(2deg)',
          transition: isHovered
            ? 'transform 0.1s ease-out'
            : 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.6s ease',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Subtle Specular Glare Effect on Hover */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none rounded-[26px] transition-opacity duration-300"
          style={{ opacity: isHovered ? 0.6 : 0 }}
        />

        {/* Top Progress Bars */}
        <div className="space-y-2 z-10">
          <div className="flex gap-1 w-full">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="flex-1 h-1 rounded-full bg-[#E5E0D6] overflow-hidden">
                <div
                  className={`h-full ${idx === 1 ? 'w-full bg-[#1C1917]' : 'w-0'}`}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="px-2 py-0.5 rounded-full text-[8px] font-mono uppercase tracking-widest font-bold bg-[#16A34A] text-white">
              OVERVIEW
            </span>
            <span className="text-[9px] font-mono text-[#78716C]">01 / 06</span>
          </div>
        </div>

        {/* Center Content */}
        <div className="space-y-2 text-center my-auto py-1 z-10">
          <div>
            <h3 className="font-serif text-2xl font-normal text-[#1C1917] tracking-tight leading-none mb-1">
              Alex's Wrapped
            </h3>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#E2DDD3] text-[9px] font-mono text-[#1C1917]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]" />
              Rank #1 of 4 Members
            </span>
          </div>

          {/* Hero Activity Card */}
          <div className="p-3 rounded-2xl bg-[#EFECE6] border border-[#E2DDD3] text-center">
            <span className="inline-block px-1.5 py-0.5 rounded-full bg-[#EA580C] text-white text-[8px] font-mono font-bold uppercase tracking-wider mb-0.5">
              YOUR ACTIVITY
            </span>
            <span className="font-serif text-4xl text-[#1C1917] block font-normal tracking-tight leading-none my-0.5">
              1,420
            </span>
            <span className="text-[9px] font-mono text-[#78716C] uppercase tracking-wider block">
              Messages Sent (41%)
            </span>
          </div>

          {/* Twin Mini Bento Cards */}
          <div className="grid grid-cols-2 gap-1.5 text-left">
            <div className="p-2 rounded-xl bg-[#EFECE6] border border-[#E2DDD3]">
              <span className="text-[8px] font-mono text-[#16A34A] font-bold block uppercase">
                WORDS
              </span>
              <span className="font-serif text-base text-[#1C1917] font-normal block leading-tight">
                12.8k
              </span>
              <span className="text-[8px] font-mono text-[#78716C] block">
                9 words/msg
              </span>
            </div>

            <div className="p-2 rounded-xl bg-[#EFECE6] border border-[#E2DDD3]">
              <span className="text-[8px] font-mono text-[#EA580C] font-bold block uppercase">
                BOND
              </span>
              <span className="font-serif text-base text-[#1C1917] font-normal block leading-tight truncate">
                Maya
              </span>
              <span className="text-[8px] font-mono text-[#78716C] block">
                ~1.4m speed
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-2 border-t border-[#E5E0D6] flex items-center justify-between text-[8px] font-mono text-[#78716C] z-10">
          <span>WHATSAPP WRAPPED</span>
          <span className="text-[#A8A29E] font-medium uppercase tracking-wider">
            Preview
          </span>
        </div>
      </div>
    </div>
  );
};
