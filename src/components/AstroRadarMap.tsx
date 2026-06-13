import React, { useState, useMemo, useEffect } from 'react';
import { 
  Map, 
  Target, 
  Crosshair, 
  Search, 
  Compass, 
  ZoomIn, 
  ZoomOut, 
  X, 
  Pin, 
  PinOff, 
  ChevronsUpDown, 
  Layers,
  SlidersHorizontal
} from 'lucide-react';
import { TelemetryData, PilotConfig } from '../types';

interface AstroRadarMapProps {
  telemetry: TelemetryData;
  pilotConfig: PilotConfig;
  onDestroy?: () => void;
  playDiagnosticBlip: (freq: number, dur: number) => void;
  updateTelemetry: (data: Partial<TelemetryData>) => void;
}

interface MapTarget {
  id: string;
  name: string;
  type: 'GATE' | 'ASTEROID' | 'DESTINATION';
  x: number; // local X (-200 to 200)
  z: number; // longitudinal progress (0 to 1600)
  theme?: string;
  scale?: number;
  composition?: string;
  yieldPct?: number;
}

export const AstroRadarMap: React.FC<AstroRadarMapProps> = ({
  telemetry,
  pilotConfig,
  onDestroy,
  playDiagnosticBlip,
  updateTelemetry
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [selectedTarget, setSelectedTarget] = useState<MapTarget | null>(null);
  const [activeTab, setActiveTab] = useState<'SECTOR' | 'TACTICAL'>('SECTOR');
  const [radarSweepAngle, setRadarSweepAngle] = useState(0);

  const hudColor = pilotConfig.hudColor;

  // Real-time ship coordinates
  const shipProgress = Math.max(0, 1600 - telemetry.altitude); // 0 to 1600
  const shipX = telemetry.latitude; // lateral position
  const shipY = telemetry.longitude; // vertical/pitch position

  // 1. Generate stable deterministic pseudo-elements for the star track
  const mapElements = useMemo<MapTarget[]>(() => {
    const list: MapTarget[] = [];

    // Add 5 Gates
    for (let g = 1; g <= 5; g++) {
      list.push({
        id: `GATE-${g}`,
        name: `Gate ${g}`,
        type: 'GATE',
        x: 0,
        z: g * 250,
        composition: 'Plasma',
        yieldPct: 100
      });
    }

    // Add SAVANT core destination
    list.push({
      id: 'CORE',
      name: 'Core',
      type: 'DESTINATION',
      x: 0,
      z: 1600,
      composition: 'Singularity',
      yieldPct: 100
    });

    // Add beautiful styled asteroids seeded deterministically
    const asteroidCount = 45;
    const themes = [
      { name: 'CHROME', label: 'Chrome', yieldName: 'Ferrous', color: '#f43f5e' },
      { name: 'GOLD', label: 'Gold', yieldName: 'Aurum', color: '#eab308' },
      { name: 'OBSIDIAN', label: 'Obsidian', yieldName: 'Silica', color: '#a855f7' },
      { name: 'CARBON', label: 'Carbon', yieldName: 'Crystal', color: '#c084fc' },
      { name: 'OPAL', label: 'Opal', yieldName: 'Multispectral', color: '#38bdf8' },
      { name: 'IRON', label: 'Iron', yieldName: 'Fluorite', color: '#22c55e' },
      { name: 'QUICKSILVER', label: 'Quicksilver', yieldName: 'Mercury', color: '#14b8a6' },
    ];

    for (let i = 0; i < asteroidCount; i++) {
      // Deterministic pseudo-random seed generator
      const seed = Math.sin(i * 12.345) * 10000;
      const rVal = seed - Math.floor(seed);
      const rVal2 = (seed * 11.23) - Math.floor(seed * 11.23);
      const rVal3 = (seed * 7.54) - Math.floor(seed * 7.54);

      const z = 120 + i * 32 + rVal * 20; // Spread along 100 to 1550 range
      const theta = rVal2 * Math.PI * 2;
      const rad = 20 + rVal3 * 160;
      const x = Math.cos(theta) * rad;

      const themeIdx = Math.floor(rVal * themes.length);
      const selectedTheme = themes[themeIdx];

      list.push({
        id: `ROCK-${i + 1}`,
        name: `Rock ${i + 1}`,
        type: 'ASTEROID',
        x: x / 3, // normalized for 2D visualization
        z: parseFloat(z.toFixed(1)),
        theme: selectedTheme.name,
        scale: Math.floor(4 + rVal * 12),
        composition: selectedTheme.label,
        yieldPct: Math.floor(25 + rVal2 * 68)
      });
    }

    return list;
  }, []);

  // Animate Local Radar sweeping lines
  useEffect(() => {
    let frameId: number;
    const animate = () => {
      setRadarSweepAngle(prev => (prev + 1.2) % 360);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, []);

  // Compute local objects for Tactical Proximity Radar
  // This shows asteroids centered relative to the ship inside a 500m bubble!
  const localTargets = useMemo(() => {
    return mapElements.filter(el => {
      if (el.type === 'DESTINATION') return false;
      const dz = el.z - shipProgress;
      // Filter out asteroids that are behind or too far ahead (e.g. 350km range)
      return dz > -60 && dz < 350;
    }).map(el => {
      const dz = el.z - shipProgress;
      const dx = el.x - (shipX / 6); // adjust ship scale yaw
      const distance = Math.sqrt(dx * dx + dz * dz);
      return {
        ...el,
        relX: dx,
        relZ: dz,
        distance: distance
      };
    });
  }, [mapElements, shipProgress, shipX]);

  const handleSelectTarget = (target: MapTarget) => {
    playDiagnosticBlip(880, 0.05);
    setSelectedTarget(target);
    // Synced lock on with overall cockpit telemetry
    updateTelemetry({ 
      nearestAsteroidName: target.name,
      nearestAsteroidDist: Math.floor(Math.abs(target.z - shipProgress))
    });
  };

  return (
    <div id="astro-radar-inner" className="flex flex-col gap-1.5 h-full select-none text-[6.5px] tracking-wide text-zinc-400 font-mono">
      {/* 2 Workspace Tabs inside the Panel */}
      <div className="flex bg-zinc-950/80 p-0.5 rounded-md border border-zinc-900/60 items-stretch" style={{ gap: '1px' }}>
        {[
          { id: 'SECTOR' as const, label: 'Sector' },
          { id: 'TACTICAL' as const, label: 'Radar' }
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playDiagnosticBlip(720, 0.04);
                setActiveTab(tab.id);
              }}
              className={`flex-1 text-center py-1 rounded text-[5px] font-black uppercase transition-all duration-150 cursor-pointer ${
                active 
                  ? 'bg-zinc-900 text-white border border-zinc-800'
                  : 'text-zinc-550 hover:text-zinc-300'
              }`}
              style={{ color: active ? hudColor : undefined, borderColor: active ? `${hudColor}30` : undefined }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panel Content */}
      <div className="relative bg-zinc-950/95 border border-zinc-900/60 rounded-lg p-2 flex flex-col gap-1.5 h-[160px] overflow-hidden">
        {activeTab === 'SECTOR' ? (
          /* ================== TAB 1: SECTOR STAR CHART ================== */
          <div className="relative flex-grow flex flex-col justify-between h-full">
            {/* Map Canvas viewport Container */}
            <div className="relative w-full h-[115px] bg-zinc-950 rounded border border-zinc-900/40 overflow-hidden">
              {/* Star chart grid background */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-[0.06]"
                style={{
                  backgroundImage: `linear-gradient(to right, ${hudColor} 1px, transparent 1px), linear-gradient(to bottom, ${hudColor} 1px, transparent 1px)`,
                  backgroundSize: '12px 12px'
                }}
              />

              {/* Longitudinal View Path Map */}
              <svg className="w-full h-full" viewBox="0 0 100 240" preserveAspectRatio="none">
                {/* Center path flight corridor vector */}
                <line 
                  x1="50" y1="240" x2="50" y2="0" 
                  stroke={hudColor} 
                  strokeWidth="0.5" 
                  strokeDasharray="2 3" 
                  opacity="0.3" 
                />

                {/* Draw sector gates & asteroids */}
                {mapElements.map(el => {
                  // Coordinate translation
                  // z goes from 0 to 1600. Map SVG height has y from 240 down to 0!
                  // Let's project z linearly.
                  const svgY = 240 - (el.z / 1600) * 240;
                  // x is offset centering from 50 (middle)
                  const svgX = 50 + (el.x / 1.6) * zoomLevel;

                  if (el.type === 'GATE') {
                    const isPassed = shipProgress > el.z;
                    return (
                      <g key={el.id} className="cursor-pointer" onClick={() => handleSelectTarget(el)}>
                        {/* Interactive gate sensor lines */}
                        <line 
                          x1="10" y1={svgY} x2="90" y2={svgY} 
                          stroke={isPassed ? '#10b981' : hudColor} 
                          strokeWidth="0.3" 
                          opacity={isPassed ? "0.2" : "0.5"} 
                          strokeDasharray="1 2"
                        />
                        <circle 
                          cx="50" cy={svgY} r="3" 
                          fill="none" 
                          stroke={isPassed ? '#10b981' : hudColor} 
                          strokeWidth="0.6"
                          className={isPassed ? '' : 'animate-pulse'}
                        />
                        <text 
                          x="5" y={svgY + 1.5} 
                          fill={isPassed ? '#10b981' : hudColor} 
                          fontSize="2.8" 
                          fontWeight="black" 
                          opacity="0.75"
                        >
                          {el.id}
                        </text>
                      </g>
                    );
                  }

                  if (el.type === 'DESTINATION') {
                    return (
                      <g key={el.id} className="cursor-pointer" onClick={() => handleSelectTarget(el)}>
                        <line 
                          x1="5" y1={svgY} x2="95" y2={svgY} 
                          stroke="#fb7185" 
                          strokeWidth="0.5" 
                          opacity="0.6" 
                        />
                        <polygon 
                          points="50,1 46,6 54,6" 
                          transform={`translate(0, ${svgY - 3})`}
                          fill="none" 
                          stroke="#ef4444" 
                          strokeWidth="0.8"
                        />
                        <text x="56" y={svgY + 2.5} fill="#ef4444" fontSize="3" fontWeight="black" opacity="0.9">
                          Core
                        </text>
                      </g>
                    );
                  }

                  // Asteroid dots
                  const isClose = Math.abs(el.z - shipProgress) < 110;
                  const dotColor = selectedTarget?.id === el.id ? '#fb923c' : (isClose ? '#ef4444' : '#4b5563');
                  const size = (el.scale || 5) / 4.5;

                  return (
                    <circle 
                      key={el.id}
                      cx={svgX} 
                      cy={svgY} 
                      r={Math.max(0.6, size)}
                      fill={dotColor}
                      opacity={isClose ? '0.90' : '0.55'}
                      className="cursor-pointer hover:scale-150 transition-transform duration-100"
                      onClick={() => handleSelectTarget(el)}
                    />
                  );
                })}

                {/* ACTIVE SHIP MARKER */}
                {/* Ship's longitudinal Progress Y coordinate */}
                {(() => {
                  const shipSvgY = 240 - (shipProgress / 1600) * 240;
                  const shipSvgX = 50 + (shipX / 6) * zoomLevel;
                  return (
                    <g className="transition-all duration-200">
                      {/* Compass range finder ring */}
                      <circle 
                        cx={shipSvgX} cy={shipSvgY} r="10" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="0.25" 
                        strokeDasharray="1 1"
                        opacity="0.5" 
                      />
                      {/* Glow cone forward */}
                      <polygon 
                        points={`${shipSvgX},${shipSvgY} ${shipSvgX - 4},${shipSvgY - 14} ${shipSvgX + 4},${shipSvgY - 14}`} 
                        fill={`radial-gradient(ellipse, ${hudColor}15 0%, transparent 80%)`}
                        stroke={hudColor}
                        strokeWidth="0.15"
                        opacity="0.15"
                      />
                      {/* Ship triangle reticle */}
                      <polygon 
                        points={`${shipSvgX},${shipSvgY - 2.5} ${shipSvgX - 2},${shipSvgY + 2} ${shipSvgX + 2},${shipSvgY + 2}`} 
                        fill="#10b981" 
                        stroke="#065f46" 
                        strokeWidth="0.25"
                      />
                      {/* Ship designator label */}
                      <text x={shipSvgX + 4} y={shipSvgY + 1} fill="#10b981" fontSize="2.8" fontWeight="bold">
                        {pilotConfig.callsign}
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Map Controls HUD footer */}
            <div className="flex justify-between items-center bg-zinc-950/80 p-1 border border-zinc-900 rounded-md text-[5.5px]">
              <div className="flex items-center gap-1">
                <Compass className="w-2.5 h-2.5 text-emerald-400 animate-[spin_8s_linear_infinite]" />
                <span>COORDS:</span>
                <span className="text-zinc-300 font-extrabold font-mono">
                  X:{Math.round(shipX)} | Y:{Math.round(shipY)} | Z:-{Math.round(1600 - telemetry.altitude)}
                </span>
              </div>
              
              <div className="flex gap-1">
                <button 
                  onClick={() => { playDiagnosticBlip(680, 0.04); setZoomLevel(z => Math.max(0.4, z - 0.15)); }}
                  className="p-0.5 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-md cursor-pointer text-[5px]"
                  title="Zoom Out Map Channel"
                >
                  <ZoomOut className="w-2.5 h-2.5" />
                </button>
                <div className="px-1 bg-zinc-950 border border-zinc-900 rounded select-none flex items-center justify-center font-bold">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <button 
                  onClick={() => { playDiagnosticBlip(720, 0.04); setZoomLevel(z => Math.min(2.5, z + 0.15)); }}
                  className="p-0.5 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-md cursor-pointer text-[5px]"
                  title="Zoom In Map Channel"
                >
                  <ZoomIn className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ================== TAB 2: PROXIMITY TACTICAL RADAR SCREEN ================== */
          <div className="relative flex-grow flex flex-col justify-between h-full">
            <div className="relative w-full h-[115px] bg-zinc-950 rounded border border-zinc-900/40 overflow-hidden flex items-center justify-center">
              {/* Radar sweep lines & ticks background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[100px] h-[100px] rounded-full border border-zinc-900 opacity-40 flex items-center justify-center">
                  <div className="w-[70px] h-[70px] rounded-full border border-zinc-900/60 flex items-center justify-center">
                    <div className="w-[40px] h-[40px] rounded-full border border-zinc-900/30" />
                  </div>
                </div>
                {/* Crosshairs axis */}
                <div className="absolute w-[105px] h-[0.5px] bg-zinc-900/40" />
                <div className="absolute h-[105px] w-[0.5px] bg-zinc-900/40" />

                {/* Rotating active radar radar sweep sector */}
                <div 
                  className="absolute w-[50px] h-[50px] top-[7.5px] left-[50%] origin-bottom-left pointer-events-none"
                  style={{
                    transform: `rotate(${radarSweepAngle}deg)`,
                    background: `conic-gradient(from 270deg, ${hudColor}1C 0deg, transparent 70deg)`,
                    borderRight: `0.5px solid ${hudColor}33`
                  }}
                />
              </div>

              {/* Local Radar Scope Elements Canvas wrapper */}
              <div className="relative w-[110px] h-[110px]">
                {/* Centered Green Ship */}
                <div className="absolute inset-x-0 inset-y-0 m-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.9)] flex items-center justify-center z-10">
                  <span className="w-[4px] h-[4px] rounded-full bg-white animate-ping" />
                </div>

                {/* Map local targets positioned relative to centered ship */}
                {localTargets.map(target => {
                  // dx, dz are coordinate offsets. Let's normalize inside the 110px canvas.
                  // dx goes from say -150 to 150. we divide by 3 to normalize. Scale with zoom.
                  const maxRange = 150 / zoomLevel;
                  const centerX = 55;
                  const centerY = 55;

                  // Ship is moving forward. Asteroids moving down towards ship (negative relative Z).
                  const radialX = centerX + (target.relX / maxRange) * 50;
                  // As relZ gets smaller (closer), they move down towards the center (centerY)!
                  const radialY = centerY - (target.relZ / maxRange) * 50; // invert for top-down depth direction

                  // Don't render out of bounds of the round screen (r=50)
                  const distFromCenter = Math.sqrt(Math.pow(radialX - centerX, 2) + Math.pow(radialY - centerY, 2));
                  if (distFromCenter > 50) return null;

                  const isGate = target.type === 'GATE';
                  const isSelected = selectedTarget?.id === target.id;

                  return (
                    <div
                      key={target.id}
                      onClick={() => handleSelectTarget(target)}
                      className="absolute group cursor-pointer transition-all duration-300"
                      style={{
                        left: `${radialX}px`,
                        top: `${radialY}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {/* Floating marker dot */}
                      <span 
                        className={`block rounded-full transition-all duration-200 ${
                          isSelected 
                            ? 'w-1.5 h-1.5 bg-amber-500 animate-ping' 
                            : (isGate ? 'w-1.2 h-1.2 bg-cyan-400 border border-cyan-300' : 'w-1 h-1 bg-rose-500 hover:scale-150')
                        }`}
                        style={{
                          backgroundColor: isSelected ? undefined : (isGate ? undefined : (target.theme ? undefined : '#f43f5e')),
                          borderColor: isSelected ? undefined : (isGate ? undefined : '#f43f5e')
                        }}
                      />
                      {/* Name tag pop-up on hover */}
                      <div className="absolute hidden group-hover:block bg-zinc-950/95 border border-zinc-800 text-white rounded p-1 text-[4.5px] leading-none text-center whitespace-nowrap -bottom-5 left-[50%] -translate-x-1/2 z-30">
                        {target.name} ({Math.round(target.distance)}km)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sweep rate status bar */}
            <div className="flex justify-between items-center bg-zinc-950/80 p-1 border border-zinc-900 rounded-md text-[5.2px]">
              <span className="flex items-center gap-1">
                <Target className="w-2 h-2 text-rose-500 animate-pulse" />
                <span>SWEEP: <span className="text-zinc-200 font-extrabold">2.4 GHz</span></span>
              </span>
              <span className="text-zinc-500 uppercase">TARGETS: <span className="text-emerald-400 font-bold font-mono">{localTargets.length}</span></span>
            </div>
          </div>
        )}
      </div>

      {/* Target inspection details pane */}
      <div 
        className="bg-zinc-950/90 border rounded-lg p-1.5 flex flex-col gap-1 transition-all duration-300"
        style={{ borderColor: selectedTarget ? `${hudColor}38` : '#1c1d24' }}
      >
        {selectedTarget ? (
          <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
              <span className="font-extrabold text-[#00f2ff] flex items-center gap-1 text-[7px]" style={{ color: hudColor }}>
                <Crosshair className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
                {selectedTarget.name}
              </span>
              <button 
                onClick={() => { playDiagnosticBlip(400, 0.05); setSelectedTarget(null); }}
                className="text-zinc-650 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 p-0.5 rounded cursor-pointer transition-all"
              >
                <X className="w-2 h-2" />
              </button>
            </div>

            {/* Structured details matrix */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[5.5px] leading-tight text-zinc-500">
              <div>TYPE: <span className="text-white font-bold">{selectedTarget.type}</span></div>
              <div>WAYPOINT: <span className="text-zinc-300 font-extrabold font-mono">{selectedTarget.z} km</span></div>
              <div className="col-span-2">MATERIAL: <span className="text-zinc-300">{selectedTarget.composition || 'Mineral Matrix'}</span></div>
              
              {selectedTarget.type === 'ASTEROID' && (
                <>
                  <div>SIZE: <span className="text-zinc-300 font-black">{selectedTarget.scale}0 m</span></div>
                  <div>YIELD: <span style={{ color: hudColor }} className="font-mono font-black">{selectedTarget.yieldPct}%</span></div>
                </>
              )}
            </div>

            <div className="bg-zinc-950 p-1 border border-zinc-900 text-[5px] text-zinc-550 leading-relaxed uppercase select-none rounded">
              {selectedTarget.type === 'GATE' ? (
                <span>PILOT PROTOCOL: FLY DIRECTLY THROUGH THE TRANSIT CHAMBER RING PORTAL TO SECURE ANOMALY QUANTUM PROPULSION BOOST.</span>
              ) : selectedTarget.type === 'DESTINATION' ? (
                <span>PILOT PROTOCOL: CORES SYNCHRONIZED. ACCELERATE DRIVE ENGINES TO MAXIMUM REPROJECTION THRESHOLDS AND TERMINATE ORBIT.</span>
              ) : (
                <span>TACTICAL ANALYSIS: AVOID DIRECT IMPACT AND HOVER CLOSELY FOR SPECTROSCOPIC SYNTHESIS CALIBRATION SHIELDS.</span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 text-zinc-650 font-bold font-sans uppercase tracking-widest text-[5.5px] gap-1 select-none">
            <Search className="w-2.5 h-2.5 animate-pulse text-zinc-550" />
            SELECT THE SECTOR OBJECTS TO ACQUIRE A COGNITIVE TRACKING LOCK
          </div>
        )}
      </div>
    </div>
  );
};
