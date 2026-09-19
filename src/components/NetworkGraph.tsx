import React, { useState, useRef, useMemo, useEffect } from 'react';
import { ChatAnalytics, ParticipantConnection } from '../types/chat';
import { Network, Download, Loader2, Pin } from 'lucide-react';
import { exportStoryCard } from '../utils/exportImage';
import { SearchableConnectionSelector } from './SearchableConnectionSelector';
import { SearchableParticipantSelector } from './SearchableParticipantSelector';

interface NetworkGraphProps {
  analytics: ChatAnalytics;
}

interface NodePosition {
  name: string;
  x: number;
  y: number;
  r: number;
  color: string;
  percentage: number;
  messageCount: number;
}

// Helper to compare undirected connections
const isSameConnection = (
  a: ParticipantConnection | null | undefined,
  b: ParticipantConnection | null | undefined
): boolean => {
  if (!a || !b) return false;
  return (
    (a.source === b.source && a.target === b.target) ||
    (a.source === b.target && a.target === b.source)
  );
};

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ analytics }) => {
  const { participants, connections } = analytics;
  const svgRef = useRef<SVGSVGElement>(null);

  const participantColorMap = useMemo(
    () => new Map(participants.map(p => [p.name, p.color || '#16A34A'])),
    [participants]
  );

  const getInitials = (name: string) => {
    if (!name) return '';
    const clean = name.replace(/^~+\s*/, '').trim();
    const parts = clean.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Anti-congestion states: Default to 12 if large group, 6 if medium, or all if <= 6
  const [memberLimit, setMemberLimit] = useState<number | 'all'>(
    participants.length > 12 ? 12 : participants.length > 6 ? 6 : 'all'
  );
  const [minExchanges, setMinExchanges] = useState<number>(1);
  const [focusedNode, setFocusedNode] = useState<string | null>(null);
  const [searchedParticipant, setSearchedParticipant] = useState<string | null>(null);

  // Active participants based on limit or searched participant's ego circle (capped to 12)
  const activeParticipants = useMemo(() => {
    if (searchedParticipant) {
      const target = participants.find(p => p.name === searchedParticipant);
      if (!target) return participants.slice(0, Math.min(12, participants.length));

      // Find conversational partners of this searched member
      const memberConnections = connections
        .filter(c => c.source === searchedParticipant || c.target === searchedParticipant)
        .sort((a, b) => b.exchangeCount - a.exchangeCount);

      const partnerNames = new Set<string>();
      for (const c of memberConnections) {
        const partner = c.source === searchedParticipant ? c.target : c.source;
        partnerNames.add(partner);
        if (partnerNames.size >= 11) break; // Keep total nodes <= 12
      }

      const partners = participants.filter(p => partnerNames.has(p.name));
      return [target, ...partners];
    }

    if (memberLimit === 'all' || participants.length <= memberLimit) {
      return participants;
    }
    return participants.slice(0, memberLimit);
  }, [participants, connections, memberLimit, searchedParticipant]);

  const activeNames = useMemo(() => {
    return new Set(activeParticipants.map(p => p.name));
  }, [activeParticipants]);

  // Active connections filtered by visible members and exchange threshold
  const visibleConnections = useMemo(() => {
    return connections.filter(conn => {
      const bothVisible = activeNames.has(conn.source) && activeNames.has(conn.target);
      const meetsThreshold = conn.exchangeCount >= minExchanges;
      return bothVisible && meetsThreshold;
    });
  }, [connections, activeNames, minExchanges]);

  const handleSelectParticipant = (name: string | null) => {
    setSearchedParticipant(name);
    setFocusedNode(name);
    if (name) {
      const topConn = connections.find(c => c.source === name || c.target === name);
      if (topConn) {
        setSelectedConnection(topConn);
        setPinnedConnection(topConn);
      }
    }
  };

  const handleSetMemberLimit = (limit: number | 'all') => {
    setMemberLimit(limit);
    setSearchedParticipant(null);
    setFocusedNode(null);
  };

  const handleSelectConnection = (conn: ParticipantConnection) => {
    setSelectedConnection(conn);
    setPinnedConnection(conn);
    if (!activeNames.has(conn.source) || !activeNames.has(conn.target)) {
      setSearchedParticipant(conn.source);
      setFocusedNode(conn.source);
    }
  };

  // Active hover/selection & pinned states
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ParticipantConnection | null>(null);
  const [pinnedConnection, setPinnedConnection] = useState<ParticipantConnection | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);

  // Duo Card Export
  const exportCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportDuo = async () => {
    if (!selectedConnection || !exportCardRef.current) return;
    try {
      setIsExporting(true);
      await exportStoryCard(exportCardRef.current, `duo_${selectedConnection.source}_${selectedConnection.target}`);
    } catch (e) {
      console.error('Failed to export duo card:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Initialize node positions in a balanced radial orbit
  const initialPositions = useMemo(() => {
    const width = 740;
    const height = 480;
    const centerX = width / 2;
    const centerY = height / 2;
    const count = activeParticipants.length;

    if (count <= 1) {
      return activeParticipants.map(p => ({
        name: p.name,
        x: centerX,
        y: centerY,
        r: 40,
        color: p.color || '#0A3323',
        percentage: p.percentage,
        messageCount: p.messageCount,
      }));
    }

    if (count === 2) {
      return [
        {
          name: activeParticipants[0].name,
          x: centerX - 140,
          y: centerY,
          r: 38,
          color: activeParticipants[0].color || '#0A3323',
          percentage: activeParticipants[0].percentage,
          messageCount: activeParticipants[0].messageCount,
        },
        {
          name: activeParticipants[1].name,
          x: centerX + 140,
          y: centerY,
          r: 38,
          color: activeParticipants[1].color || '#105666',
          percentage: activeParticipants[1].percentage,
          messageCount: activeParticipants[1].messageCount,
        },
      ];
    }

    // Radial layout for 3+ participants
    const radius = Math.min(centerX, centerY) - (count > 20 ? 45 : count > 8 ? 60 : 80);
    const minR = count > 30 ? 12 : count > 16 ? 18 : 24;
    const maxR = count > 30 ? 20 : count > 16 ? 32 : 44;

    return activeParticipants.map((p, i) => {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const r = Math.max(minR, Math.min(maxR, minR + (p.percentage * 0.35)));
      return {
        name: p.name,
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
        r,
        color: p.color || '#0A3323',
        percentage: p.percentage,
        messageCount: p.messageCount,
      };
    });
  }, [activeParticipants]);

  const [nodes, setNodes] = useState<NodePosition[]>(initialPositions);

  // Keep node positions aligned if activeParticipants change
  useEffect(() => {
    setNodes(initialPositions);
  }, [initialPositions]);

  // Set default selected connection or align when visible connections change
  useEffect(() => {
    if (visibleConnections.length > 0) {
      const stillVisible = selectedConnection && visibleConnections.some(c => isSameConnection(c, selectedConnection));
      if (!stillVisible) {
        setSelectedConnection(visibleConnections[0]);
        setPinnedConnection(null);
      }
    } else {
      setSelectedConnection(null);
      setPinnedConnection(null);
    }
  }, [visibleConnections]);

  const handleEdgeClick = (conn: ParticipantConnection, e: React.MouseEvent) => {
    e.stopPropagation();
    if (pinnedConnection && isSameConnection(pinnedConnection, conn)) {
      setPinnedConnection(null);
    } else {
      setSelectedConnection(conn);
      setPinnedConnection(conn);
    }
  };

  const handleEdgeHover = (conn: ParticipantConnection) => {
    if (!pinnedConnection) {
      setSelectedConnection(conn);
    }
  };

  const handleNodeClick = (nodeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // If a node is already focused and a different connected node is clicked, select that pair's connection!
    if (focusedNode && focusedNode !== nodeName) {
      const mutualConn = visibleConnections.find(
        c =>
          (c.source === focusedNode && c.target === nodeName) ||
          (c.source === nodeName && c.target === focusedNode)
      );
      if (mutualConn) {
        setSelectedConnection(mutualConn);
        setPinnedConnection(mutualConn);
        return;
      }
    }
    setFocusedNode(prev => (prev === nodeName ? null : nodeName));
  };

  // Drag handlers
  const handlePointerDown = (name: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDraggingNode(name);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingNode || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 740 / rect.width;
    const scaleY = 480 / rect.height;
    const clientX = (e.clientX - rect.left) * scaleX;
    const clientY = (e.clientY - rect.top) * scaleY;

    const clampedX = Math.max(50, Math.min(690, clientX));
    const clampedY = Math.max(50, Math.min(430, clientY));

    setNodes(prev =>
      prev.map(n => (n.name === draggingNode ? { ...n, x: clampedX, y: clampedY } : n))
    );
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingNode) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      setDraggingNode(null);
    }
  };

  // Node lookup map
  const nodeMap = useMemo(() => {
    return new Map<string, NodePosition>(nodes.map(n => [n.name, n]));
  }, [nodes]);

  // Neighbors of focused node
  const focusedNeighbors = useMemo(() => {
    if (!focusedNode) return null;
    const set = new Set<string>([focusedNode]);
    for (const c of visibleConnections) {
      if (c.source === focusedNode) set.add(c.target);
      if (c.target === focusedNode) set.add(c.source);
    }
    return set;
  }, [focusedNode, visibleConnections]);

  if (!participants.length) return null;

  return (
    <div className="rounded-3xl bg-[#F5F2EB] border border-[#E7E2D8] p-6 sm:p-7 relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#E2DDD3] gap-3">
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-[#78716C] block mb-1">
            Section 03 · Who Talks to Whom
          </span>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#1C1917]" />
            <h3 className="font-serif text-xl sm:text-2xl font-normal text-[#1C1917] tracking-tight">
              Conversation Map & Bonds
            </h3>
          </div>
          <p className="text-xs text-[#787774] mt-0.5">
            {searchedParticipant ? (
              <span>
                Viewing personal circle for <strong className="text-[#1C1917]">{searchedParticipant}</strong> ({activeParticipants.length - 1} top chat partners)
              </span>
            ) : focusedNode ? (
              <span>
                Focusing conversations for <strong className="text-[#111111] underline">{focusedNode}</strong> (click another member or empty space to reset)
              </span>
            ) : pinnedConnection ? (
              <span className="text-[#111111] font-medium">
                Inspecting bond: {pinnedConnection.source} × {pinnedConnection.target}
              </span>
            ) : (
              'See who replies to whom most often and how fast they respond'
            )}
          </p>
        </div>

        {/* Filter Toolbar for Large Groups */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {participants.length > 6 && (
            <div className="flex items-center bg-[#EFECE6] p-0.5 rounded-full border border-[#E2DDD3] text-xs font-mono">
              <button
                onClick={() => handleSetMemberLimit(6)}
                className={`px-2.5 py-1 rounded-full transition-colors font-medium cursor-pointer ${
                  !searchedParticipant && memberLimit === 6
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Top 6
              </button>
              <button
                onClick={() => handleSetMemberLimit(Math.min(12, participants.length))}
                className={`px-2.5 py-1 rounded-full transition-colors font-medium cursor-pointer ${
                  !searchedParticipant && (memberLimit === 12 || (participants.length <= 12 && memberLimit === 'all'))
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                {participants.length <= 12 ? `All (${participants.length})` : 'Top 12'}
              </button>
            </div>
          )}

          {/* Search any participant to view their personal circle */}
          <SearchableParticipantSelector
            participants={participants}
            selectedParticipant={searchedParticipant}
            onSelectParticipant={handleSelectParticipant}
          />

          {connections.length > 6 && (
            <div className="flex items-center bg-[#EFECE6] p-0.5 rounded-full border border-[#E2DDD3] text-xs font-mono">
              <button
                onClick={() => setMinExchanges(1)}
                className={`px-2.5 py-1 rounded-full transition-colors font-medium cursor-pointer ${
                  minExchanges === 1 ? 'bg-[#1C1917] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                All Pairs
              </button>
              <button
                onClick={() => setMinExchanges(2)}
                className={`px-2.5 py-1 rounded-full transition-colors font-medium cursor-pointer ${
                  minExchanges === 2 ? 'bg-[#1C1917] text-white shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
                }`}
              >
                Frequent (2+)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Visualizer Area: Two-Column Responsive Grid so Bond Dossier never overlaps graph nodes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mt-4">
        {/* Left: Interactive Chord Network Graph */}
        <div className={`${selectedConnection ? 'lg:col-span-7 xl:col-span-8' : 'col-span-12'} relative w-full aspect-[74/48] flex items-center justify-center select-none`}>
          <svg
            ref={svgRef}
            viewBox="0 0 740 480"
            className="w-full h-full touch-none"
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <defs>
              <radialGradient id="networkCenterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#F7F6F3" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </radialGradient>

              <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background click to clear focus & unpin */}
            <rect
              width="740"
              height="480"
              fill="transparent"
              onClick={() => {
                setFocusedNode(null);
                setPinnedConnection(null);
              }}
              className="cursor-default"
            />
            <circle cx="370" cy="240" r="180" fill="url(#networkCenterGlow)" />

            {/* Render Connection Edges */}
            <g className="edges">
              {visibleConnections.map((conn, idx) => {
                const src = nodeMap.get(conn.source);
                const tgt = nodeMap.get(conn.target);
                if (!src || !tgt) return null;

                const isConnectedToFocus =
                  !focusedNode || conn.source === focusedNode || conn.target === focusedNode;

                const isSelected = isSameConnection(selectedConnection, conn);
                const isPinned = isSameConnection(pinnedConnection, conn);
                const isConnectedToHover = hoveredNode === conn.source || hoveredNode === conn.target;
                const isHighlighted = isSelected || isConnectedToHover;

                const dx = tgt.x - src.x;
                const dy = tgt.y - src.y;
                const offsetFactor = (idx % 2 === 0 ? 1 : -1) * 28;
                const midX = (src.x + tgt.x) / 2 - (dy / Math.max(1, Math.hypot(dx, dy))) * offsetFactor;
                const midY = (src.y + tgt.y) / 2 + (dx / Math.max(1, Math.hypot(dx, dy))) * offsetFactor;

                const pathD = `M ${src.x} ${src.y} Q ${midX} ${midY} ${tgt.x} ${tgt.y}`;
                const strokeWidth = Math.max(1.5, conn.strength * 4.5);

                // Opacity based on focus and highlight
                let opacity = Math.max(0.2, conn.strength * 0.6);
                if (focusedNode) {
                  opacity = isConnectedToFocus ? 0.95 : 0.04;
                } else if (isHighlighted) {
                  opacity = 0.95;
                }

                return (
                  <g key={`${conn.source}-${conn.target}`} className="edge-group">
                    {/* Subtle Glow Filter for active connection */}
                    {isSelected && (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#111111"
                        strokeWidth={strokeWidth + 4}
                        strokeOpacity={0.15}
                        filter="url(#edgeGlow)"
                      />
                    )}

                    {/* Main Connection Arc */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#111111"
                      strokeWidth={strokeWidth}
                      strokeOpacity={opacity}
                      strokeLinecap="round"
                      strokeDasharray={isPinned ? 'none' : isSelected ? '4 3' : 'none'}
                      className="transition-all duration-300"
                    />

                    {/* Wide invisible hit area for frictionless clicking & hovering */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="#111111"
                      strokeOpacity={0.001}
                      strokeWidth={32}
                      strokeLinecap="round"
                      pointerEvents="stroke"
                      onMouseEnter={() => handleEdgeHover(conn)}
                      onClick={(e) => handleEdgeClick(conn, e)}
                      className="cursor-pointer"
                    />

                    {/* Interactive Exchange Pill Indicator for active connection */}
                    {isSelected && (
                      <g
                        transform={`translate(${midX}, ${midY})`}
                        onClick={(e) => handleEdgeClick(conn, e)}
                        className="cursor-pointer"
                      >
                        <circle
                          r={12}
                          fill="#111111"
                          stroke={isPinned ? '#111111' : '#EAEAEA'}
                          strokeWidth={1.5}
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#FFFFFF"
                          fontSize="9"
                          fontWeight="600"
                          className="pointer-events-none select-none font-mono"
                        >
                          {conn.exchangeCount}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Render Nodes */}
            <g className="nodes">
              {nodes.map(node => {
                const isHovered = hoveredNode === node.name;
                const isSelected = focusedNode === node.name;
                const isInFocusCluster = !focusedNeighbors || focusedNeighbors.has(node.name);
                const isConnectedToSelected =
                  selectedConnection &&
                  (selectedConnection.source === node.name || selectedConnection.target === node.name);

                const nodeOpacity = isInFocusCluster ? 1 : 0.2;

                return (
                  <g
                    key={node.name}
                    data-node={node.name}
                    transform={`translate(${node.x}, ${node.y})`}
                    opacity={nodeOpacity}
                    onPointerDown={e => handlePointerDown(node.name, e)}
                    onClick={e => handleNodeClick(node.name, e)}
                    onMouseEnter={() => setHoveredNode(node.name)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-opacity duration-300"
                  >
                    {/* Outer Pulsing Ring if active */}
                    {(isHovered || isConnectedToSelected) && (
                      <circle
                        r={node.r + 5}
                        fill="none"
                        stroke="#111111"
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        className="animate-spin"
                        style={{ transformOrigin: '0 0', animationDuration: '10s' }}
                      />
                    )}

                    {/* Selected Focus Halo */}
                    {isSelected && (
                      <circle
                        r={node.r + 6}
                        fill="none"
                        stroke="#111111"
                        strokeWidth={1.5}
                      />
                    )}

                    {/* Node Background Halo */}
                    <circle
                      r={node.r + 1.5}
                      fill="#FFFFFF"
                      stroke="#EAEAEA"
                      strokeWidth={1}
                      className="transition-all duration-300"
                    />

                    {/* Core Node */}
                    <circle
                      r={node.r}
                      fill="#111111"
                      className="transition-all duration-300"
                    />

                    {/* Participant Name / Label */}
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#FFFFFF"
                      fontSize={node.r > 32 ? '11' : node.r > 20 ? '9' : '8'}
                      fontWeight="500"
                      className="pointer-events-none select-none tracking-tight uppercase font-mono"
                    >
                      {(() => {
                        const clean = node.name.replace(/^~+\s*/, '');
                        return clean.includes('••••')
                          ? `…${clean.slice(-4)}`
                          : node.r <= 16
                          ? clean.slice(0, 2).toUpperCase()
                          : clean.length > 8
                          ? `${clean.slice(0, 7)}…`
                          : clean;
                      })()}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Right: Bond Dossier Card (Side-by-Side, Zero Overlap, Single Responsive Card) */}
        {selectedConnection && (
          <div className="lg:col-span-5 xl:col-span-4 w-full flex justify-center">
            {(() => {
              const sourcePct = Math.round(
                (selectedConnection.sourceInitiatedCount / Math.max(1, selectedConnection.exchangeCount)) * 100
              );
              const targetPct = 100 - sourcePct;
              const isPinned = isSameConnection(pinnedConnection, selectedConnection);
              const sourceColor = participantColorMap.get(selectedConnection.source) || '#16A34A';
              const targetColor = participantColorMap.get(selectedConnection.target) || '#3B82F6';
              const cleanSourceId = selectedConnection.source.replace(/[^a-zA-Z0-9]/g, '');
              const cleanTargetId = selectedConnection.target.replace(/[^a-zA-Z0-9]/g, '');
              const cleanSourceName = selectedConnection.source.replace(/^~+\s*/, '');
              const cleanTargetName = selectedConnection.target.replace(/^~+\s*/, '');

              return (
                <div className="w-full max-w-sm lg:max-w-none bg-[#161513] text-[#FAF8F5] border border-[#2D2A26] rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-md">
                  {/* Top Kicker Status Bar */}
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#2D2A26] gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-400/90 font-semibold">
                        ✦ Relational Dossier
                      </span>
                    </div>
                    {isPinned ? (
                      <button
                        onClick={() => setPinnedConnection(null)}
                        title="Click to unpin"
                        className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-[#FAF8F5] px-2 py-0.5 rounded-full bg-[#262420] border border-[#38342F] hover:bg-[#332F2A] transition-colors shrink-0 cursor-pointer"
                      >
                        <Pin className="w-2.5 h-2.5 fill-current text-emerald-400" /> Pinned
                      </button>
                    ) : (
                      <span className="text-[9px] font-mono text-[#A8A29E] uppercase tracking-wider bg-[#262420] px-2 py-0.5 rounded-full border border-[#38342F] shrink-0">
                        Live Dynamic
                      </span>
                    )}
                  </div>

                  {/* Pair Selector Row */}
                  <div className="mb-2">
                    <SearchableConnectionSelector
                      id="conn-selector"
                      connections={connections}
                      selectedConnection={selectedConnection}
                      onSelectConnection={handleSelectConnection}
                      theme="dark"
                    />
                  </div>

                  {/* Dual Orbital Celestial Chemistry Graphic */}
                  <div className="my-2 py-0.5 flex items-center justify-center">
                    <svg width="220" height="64" viewBox="0 0 220 64" className="overflow-visible select-none pointer-events-none">
                      <defs>
                        <linearGradient id={`grad-src-${cleanSourceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={sourceColor} stopOpacity="0.85" />
                          <stop offset="100%" stopColor={sourceColor} stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id={`grad-tgt-${cleanTargetId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={targetColor} stopOpacity="0.2" />
                          <stop offset="100%" stopColor={targetColor} stopOpacity="0.85" />
                        </linearGradient>
                        <radialGradient id="dossierSparkGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#34D399" stopOpacity="0.95" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Gravitational Wave Strands */}
                      <path d="M 60 32 Q 110 12 160 32" fill="none" stroke="#FAF8F5" strokeOpacity="0.2" strokeWidth="1.2" strokeDasharray="3 3" />
                      <path d="M 60 32 Q 110 52 160 32" fill="none" stroke="#FAF8F5" strokeOpacity="0.2" strokeWidth="1.2" strokeDasharray="3 3" />

                      {/* Orbit Source */}
                      <circle cx="60" cy="32" r="24" fill={`url(#grad-src-${cleanSourceId})`} stroke={sourceColor} strokeWidth="1.5" />
                      <text x="60" y="32" textAnchor="middle" dominantBaseline="central" fill="#FAF8F5" fontSize="10" fontWeight="600" className="font-mono">
                        {getInitials(selectedConnection.source)}
                      </text>

                      {/* Orbit Target */}
                      <circle cx="160" cy="32" r="24" fill={`url(#grad-tgt-${cleanTargetId})`} stroke={targetColor} strokeWidth="1.5" />
                      <text x="160" y="32" textAnchor="middle" dominantBaseline="central" fill="#FAF8F5" fontSize="10" fontWeight="600" className="font-mono">
                        {getInitials(selectedConnection.target)}
                      </text>

                      {/* Central Connection Nexus Spark */}
                      <circle cx="110" cy="32" r="12" fill="url(#dossierSparkGlow)" />
                      <circle cx="110" cy="32" r="3" fill="#FAF8F5" />
                      <circle cx="110" cy="32" r="1.5" fill="#34D399" />
                    </svg>
                  </div>

                  {/* Duo Archetype & Synergy Box */}
                  <div className="mb-3 p-3 rounded-2xl bg-[#22201D] border border-[#38342F] relative">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-base shrink-0">{selectedConnection.duoBadge.emoji || '✨'}</span>
                        <span className="font-serif text-sm sm:text-base font-normal text-[#FAF8F5] tracking-tight leading-snug">
                          {selectedConnection.duoBadge.title}
                        </span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 font-bold border border-emerald-800/60 shrink-0">
                        {selectedConnection.synergyLabel}
                      </span>
                    </div>
                    <p className="text-xs font-serif italic text-[#A8A29E] mt-1 leading-snug">
                      "{selectedConnection.duoBadge.description}"
                    </p>
                  </div>

                  {/* Two-Column Stats Micro-Tiles */}
                  <div className="grid grid-cols-2 gap-2.5 mb-3">
                    <div className="rounded-2xl bg-[#22201D]/70 border border-[#38342F] p-2.5 text-center">
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[#A8A29E] block mb-0.5">
                        Replies
                      </span>
                      <span className="font-serif text-xl sm:text-2xl text-[#FAF8F5] font-light block leading-tight">
                        {selectedConnection.exchangeCount}
                      </span>
                      <span className="text-[8px] font-mono text-emerald-400/80 block mt-0.5">exchanges</span>
                    </div>
                    <div className="rounded-2xl bg-[#22201D]/70 border border-[#38342F] p-2.5 text-center">
                      <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-widest text-[#A8A29E] block mb-0.5">
                        Avg Response
                      </span>
                      <span className="font-serif text-xl sm:text-2xl text-emerald-400 font-light block leading-tight">
                        {selectedConnection.avgLatencyMinutes}m
                      </span>
                      <span className="text-[8px] font-mono text-[#A8A29E] block mt-0.5">reflex speed</span>
                    </div>
                  </div>

                  {/* Initiation Balance Bar */}
                  <div className="mb-3.5 p-2.5 rounded-2xl bg-[#22201D]/70 border border-[#38342F]">
                    <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                      <span className="text-[#FAF8F5] font-medium truncate max-w-[48%] flex items-center gap-1" title={selectedConnection.source}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: sourceColor }} />
                        <span className="truncate">{cleanSourceName}</span>
                        <span className="font-semibold text-[9px]">{sourcePct}%</span>
                      </span>
                      <span className="text-[#A8A29E] truncate max-w-[48%] text-right flex items-center justify-end gap-1" title={selectedConnection.target}>
                        <span className="font-semibold text-[9px]">{targetPct}%</span>
                        <span className="truncate">{cleanTargetName}</span>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: targetColor }} />
                      </span>
                    </div>
                    <div className="w-full bg-[#2E2A25] h-2 rounded-full overflow-hidden flex p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${sourcePct}%`, backgroundColor: sourceColor }}
                      />
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${targetPct}%`, backgroundColor: targetColor }}
                      />
                    </div>
                  </div>

                  {/* Export Action Button */}
                  <button
                    onClick={handleExportDuo}
                    disabled={isExporting}
                    className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#FAF8F5] via-[#F5F2EB] to-[#E7E2D8] hover:from-white hover:to-[#FAF8F5] text-[#181715] font-mono text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_24px_rgba(255,255,255,0.15)] transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    {isExporting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#181715]" />
                        <span>Printing Keepsake...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-[#181715]" />
                        <span>Export Dossier Card</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Offscreen Shareable Duo Card for Image Export */}
      {selectedConnection && (
        <div className="absolute left-[-9999px] top-[-9999px]">
          {(() => {
            const sourcePct = Math.round(
              (selectedConnection.sourceInitiatedCount / Math.max(1, selectedConnection.exchangeCount)) * 100
            );
            const targetPct = 100 - sourcePct;
            const sourceColor = participantColorMap.get(selectedConnection.source) || '#16A34A';
            const targetColor = participantColorMap.get(selectedConnection.target) || '#3B82F6';
            const cleanSourceId = selectedConnection.source.replace(/[^a-zA-Z0-9]/g, '');
            const cleanTargetId = selectedConnection.target.replace(/[^a-zA-Z0-9]/g, '');

            return (
              <div
                ref={exportCardRef}
                className="w-[500px] p-8 bg-[#141311] text-[#FAF8F5] border border-[#2D2A26] rounded-3xl flex flex-col justify-between font-sans shadow-2xl relative overflow-hidden"
              >
                {/* Subtle Ambient Radial Glow */}
                <div
                  className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: sourceColor }}
                />
                <div
                  className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
                  style={{ backgroundColor: targetColor }}
                />

                {/* Top Header */}
                <div className="flex items-center justify-between border-b border-[#2D2A26] pb-3.5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                      ✦ Relational Chemistry Dossier
                    </span>
                  </div>
                  <span className="text-[9px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 font-bold border border-emerald-800/80">
                    {selectedConnection.synergyLabel}
                  </span>
                </div>

                {/* Duo Names */}
                <div className="my-5 relative z-10">
                  <div className="text-[11px] font-mono text-[#A8A29E] uppercase tracking-wider mb-1">
                    DUO ARCHIVE
                  </div>
                  <h2 className="font-serif text-3xl font-normal tracking-tight text-[#FAF8F5] flex items-baseline gap-2 flex-wrap">
                    <span>{selectedConnection.source}</span>
                    <span className="italic text-emerald-400 font-serif text-2xl">&amp;</span>
                    <span>{selectedConnection.target}</span>
                  </h2>

                  {/* Dual Orbital Celestial Illustration */}
                  <div className="my-4 py-2 flex items-center justify-center">
                    <svg width="300" height="84" viewBox="0 0 300 84" className="overflow-visible">
                      <defs>
                        <linearGradient id={`export-grad-src-${cleanSourceId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={sourceColor} stopOpacity="0.9" />
                          <stop offset="100%" stopColor={sourceColor} stopOpacity="0.25" />
                        </linearGradient>
                        <linearGradient id={`export-grad-tgt-${cleanTargetId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={targetColor} stopOpacity="0.25" />
                          <stop offset="100%" stopColor={targetColor} stopOpacity="0.9" />
                        </linearGradient>
                      </defs>

                      <path d="M 80 42 Q 150 14 220 42" fill="none" stroke="#FAF8F5" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 4" />
                      <path d="M 80 42 Q 150 70 220 42" fill="none" stroke="#FAF8F5" strokeOpacity="0.2" strokeWidth="1.5" strokeDasharray="4 4" />

                      <circle cx="80" cy="42" r="32" fill={`url(#export-grad-src-${cleanSourceId})`} stroke={sourceColor} strokeWidth="2" />
                      <text x="80" y="42" textAnchor="middle" dominantBaseline="central" fill="#FAF8F5" fontSize="13" fontWeight="700" className="font-mono">
                        {getInitials(selectedConnection.source)}
                      </text>

                      <circle cx="220" cy="42" r="32" fill={`url(#export-grad-tgt-${cleanTargetId})`} stroke={targetColor} strokeWidth="2" />
                      <text x="220" y="42" textAnchor="middle" dominantBaseline="central" fill="#FAF8F5" fontSize="13" fontWeight="700" className="font-mono">
                        {getInitials(selectedConnection.target)}
                      </text>

                      <circle cx="150" cy="42" r="14" fill="#10B981" fillOpacity="0.3" />
                      <circle cx="150" cy="42" r="4" fill="#FAF8F5" />
                    </svg>
                  </div>

                  {/* Archetype Description Card */}
                  <div className="p-4 bg-[#1F1D1A] border border-[#38342F] rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedConnection.duoBadge.emoji || '✨'}</span>
                      <span className="font-serif text-lg text-[#FAF8F5] tracking-tight">
                        {selectedConnection.duoBadge.title}
                      </span>
                    </div>
                    <p className="text-xs font-serif italic text-[#D6D3D1] mt-1.5 leading-relaxed">
                      "{selectedConnection.duoBadge.description}"
                    </p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                  <div className="bg-[#1F1D1A] border border-[#38342F] rounded-2xl p-4 text-center">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#A8A29E] block mb-1">
                      Exchange Volume
                    </span>
                    <span className="font-serif text-3xl text-[#FAF8F5] block leading-tight font-light">
                      {selectedConnection.exchangeCount}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 block mt-1">replies back &amp; forth</span>
                  </div>
                  <div className="bg-[#1F1D1A] border border-[#38342F] rounded-2xl p-4 text-center">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-[#A8A29E] block mb-1">
                      Reflex Latency
                    </span>
                    <span className="font-serif text-3xl text-emerald-400 block leading-tight font-light">
                      {selectedConnection.avgLatencyMinutes}m
                    </span>
                    <span className="text-[9px] font-mono text-[#A8A29E] block mt-1">avg response time</span>
                  </div>
                </div>

                {/* Equilibrium Bar */}
                <div className="mb-5 p-3 rounded-2xl bg-[#1F1D1A] border border-[#38342F] relative z-10">
                  <div className="flex justify-between items-center text-[10px] font-mono mb-1.5">
                    <span className="text-[#FAF8F5] font-medium flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sourceColor }} />
                      {selectedConnection.source} {sourcePct}%
                    </span>
                    <span className="text-[#A8A29E] flex items-center gap-1.5">
                      {selectedConnection.target} {targetPct}%
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: targetColor }} />
                    </span>
                  </div>
                  <div className="w-full bg-[#2E2A25] h-2 rounded-full overflow-hidden flex p-0.5">
                    <div className="h-full rounded-full" style={{ width: `${sourcePct}%`, backgroundColor: sourceColor }} />
                    <div className="h-full rounded-full" style={{ width: `${targetPct}%`, backgroundColor: targetColor }} />
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3.5 flex items-center justify-between text-[10px] font-mono text-[#78716C] border-t border-[#2D2A26] relative z-10">
                  <span>100% Private (On-Device)</span>
                  <span className="border border-[#FAF8F5]/20 px-2.5 py-0.5 rounded-full text-[#FAF8F5]">
                    ChatAnalyzer · Archive
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
      </div>
  );
};
