import React, { useEffect, useRef, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { useAudio } from '../hooks/useAudio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Gauge, Radio, Shield, Zap, Target, Sliders, ChevronRight, Eye, EyeOff, RefreshCw, Terminal, Sun, SlidersHorizontal, Power, AlertTriangle, Cpu, Navigation, Lock, Unlock, Save, X, Pin, PinOff, ChevronsUpDown, Maximize2, Minimize2, Layers, BookOpen, Grid, Droplet, MousePointer, Check, HelpCircle
} from 'lucide-react';
import { AstroRadarMap } from './AstroRadarMap';
import { HolographicVectorProjection } from './HolographicVectorProjection';

// Cyberpunk-themed decorative elements to match the reference image
const HazardStripes: React.FC<{ className?: string; color?: string }> = ({ className = "h-1 opacity-30", color = "bg-amber-500" }) => (
  <div className={`flex gap-[3px] overflow-hidden ${className}`}>
    {[...Array(20)].map((_, i) => (
      <div key={i} className={`w-1 h-full skew-x-30 shrink-0 ${color}`} />
    ))}
  </div>
);

const TechBarcode: React.FC<{ color?: string }> = ({ color = "bg-white" }) => (
  <div className="flex items-end gap-[1.5px] h-3.5 opacity-60">
    <div className={`w-[1px] h-full ${color}`} />
    <div className={`w-[2px] h-full ${color}`} />
    <div className={`w-[1px] h-[60%] ${color}`} />
    <div className={`w-[1px] h-[40%] ${color}`} />
    <div className={`w-[3px] h-full ${color}`} />
    <div className={`w-[1px] h-[80%] ${color}`} />
    <div className={`w-[2px] h-[55%] ${color}`} />
    <div className={`w-[1px] h-full ${color}`} />
    <div className={`w-[2px] h-[30%] ${color}`} />
  </div>
);

const CornerBracket: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; color: string }> = ({ position, color }) => {
  const isTop = position.startsWith('t');
  const isLeft = position.endsWith('l');
  
  const bracketStyle = {
    tl: 'top-2.5 left-2.5 border-t-[2px] border-l-[2px] rounded-tl-[4px]',
    tr: 'top-2.5 right-2.5 border-t-[2px] border-r-[2px] rounded-tr-[4px]',
    bl: 'bottom-2.5 left-2.5 border-b-[2px] border-l-[2px] rounded-bl-[4px]',
    br: 'bottom-2.5 right-2.5 border-b-[2px] border-r-[2px] rounded-br-[4px]',
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-[16px] z-20">
      {/* Structural Corner Bracket */}
      <div 
        className={`absolute w-3 h-3 ${bracketStyle[position]} opacity-85`}
        style={{ borderColor: color }}
      />
      
      {/* Micro-dot Indicator next to bracket */}
      <div 
        className="absolute w-[3px] h-[3px] rounded-full opacity-70"
        style={{ 
          backgroundColor: color,
          top: isTop ? '15px' : 'auto',
          bottom: !isTop ? '15px' : 'auto',
          left: isLeft ? '15px' : 'auto',
          right: !isLeft ? '15px' : 'auto'
        }}
      />

      {/* Futuristic ZBrush / Octane details: Miniature coordinate labels */}
      <span 
        className="absolute text-[5px] font-black font-mono tracking-widest opacity-45 scale-75"
        style={{ 
          color,
          top: isTop ? '3px' : 'auto',
          bottom: !isTop ? '3px' : 'auto',
          left: isLeft ? '18px' : 'auto',
          right: !isLeft ? '18px' : 'auto'
        }}
      >
        {position.toUpperCase()}_{isLeft ? 'SEC_X' : 'SYS_X'}
      </span>

      {/* Tiny diagonal warning stripes inside corners */}
      <div 
        className="absolute text-[5.5px] font-extrabold leading-none opacity-40 select-none tracking-tighter"
        style={{
          color,
          top: isTop ? '7px' : 'auto',
          bottom: !isTop ? '7px' : 'auto',
          left: isLeft ? '7px' : 'auto',
          right: !isLeft ? '7px' : 'auto',
        }}
      >
        ///
      </div>
    </div>
  );
};

// Tactical Flight Sighting Reticle (Aiming Crosshair) modeled after advanced cyber vector military HUD specs
const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
};

const SECTOR_DIRECTIONS = [
  { id: 'N', center: 0 },
  { id: 'NE', center: 45 },
  { id: 'E', center: 90 },
  { id: 'SE', center: 135 },
  { id: 'S', center: 180 },
  { id: 'SW', center: 225 },
  { id: 'W', center: 270 },
  { id: 'NW', center: 315 },
];

const TacticalCrosshair: React.FC<{ color: string; telemetry: any; alignmentScore: number; coreTemp: number; filterEffect: string }> = ({
  color,
  telemetry,
  alignmentScore,
  coreTemp,
  filterEffect
}) => {
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleVelocityChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number; y: number }>;
      if (customEvent.detail) {
        setVelocity({ x: customEvent.detail.x ?? 0, y: customEvent.detail.y ?? 0 });
      }
    };
    window.addEventListener('ship-velocity-vector', handleVelocityChange);
    return () => {
      window.removeEventListener('ship-velocity-vector', handleVelocityChange);
    };
  }, []);

  const speed = Math.hypot(velocity.x, velocity.y);
  const threshold = 0.08; // deadzone threshold
  
  let activeDirection = '';
  if (speed > threshold) {
    const angleRad = Math.atan2(velocity.y, velocity.x);
    let physicalDeg = angleRad * (180 / Math.PI);
    if (physicalDeg < 0) physicalDeg += 360;

    const headingDeg = (90 - physicalDeg + 360) % 360;
    const segmentIndex = Math.round(headingDeg / 45) % 8;
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    activeDirection = directions[segmentIndex];
  }

  return (
    <div id="central-flight-aiming-reticle" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
      {/* Floating high-tech crosshair structure */}
      <div className="relative w-[340px] h-[340px] flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite]">
        
        {/* Horizontal alignment reference line ticks */}
        <div className="absolute left-[-40px] right-[-40px] h-[1px] flex justify-between px-6 pointer-events-none">
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-current opacity-40" style={{ color }} />
          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-current opacity-40" style={{ color }} />
        </div>

        {/* Vertical alignment reference line ticks */}
        <div className="absolute top-[-40px] bottom-[-40px] w-[1px] flex flex-col justify-between py-6 pointer-events-none">
          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent to-current opacity-40" style={{ color }} />
          <div className="h-16 w-[1px] bg-gradient-to-t from-transparent to-current opacity-40" style={{ color }} />
        </div>

        {/* Outer Circular frame of target sights with graduation symbols */}
        <svg width="240" height="240" viewBox="0 0 240 240" className="opacity-80 absolute">
          {/* Tilted orbital resonance loops (alien gyroscopic tracking) */}
          <ellipse cx="120" cy="120" rx="115" ry="24" stroke={color} strokeWidth="0.8" fill="none" className="opacity-30 animate-[spin_16s_linear_infinite]" transform="rotate(30 120 120)" />
          <ellipse cx="120" cy="120" rx="115" ry="24" stroke={color} strokeWidth="0.8" fill="none" className="opacity-20" strokeDasharray="3 3" transform="rotate(-40 120 120)" />
          
          {/* Inner focal target circles */}
          <circle cx="120" cy="120" r="12" stroke={color} strokeWidth="0.8" strokeDasharray="3 1.5" fill="none" className="opacity-50 animate-[spin_40s_linear_infinite]" />
          <circle cx="120" cy="120" r="8" stroke={color} strokeWidth="1" fill="none" className="opacity-60" />
          <circle cx="120" cy="120" r="1.5" fill={color} className="opacity-90 animate-pulse" />
          
          {/* Main sighting split circle - 8 symmetrical pieces with motion glow */}
          {SECTOR_DIRECTIONS.map((sector) => {
            const isActive = activeDirection === sector.id;
            // Draw a arc of 38 degrees with a 7 degree spacing gap
            const startAngle = sector.center - 19;
            const endAngle = sector.center + 19;
            const d = describeArc(120, 120, 48, startAngle, endAngle);
            return (
              <path
                key={sector.id}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={isActive ? 2.8 : 1.0}
                opacity={isActive ? 1.0 : 0.35}
                style={{
                  filter: isActive ? `drop-shadow(0 0 5px ${color})` : 'none',
                  transition: 'stroke-width 0.12s ease-out, opacity 0.12s ease-out, filter 0.12s ease-out'
                }}
              />
            );
          })}
          
          {/* Large target bracket circles with gaps */}
          <circle cx="120" cy="120" r="92" stroke={color} strokeWidth="1.2" strokeDasharray="110 50 110 50" fill="none" className="opacity-35" />

          {/* Sighting diagonal ticks and hashes at 45, 135, 225, 315 deg */}
          <line x1="120" y1="28" x2="120" y2="34" stroke={color} strokeWidth="1.5" className="opacity-45" />
          <line x1="120" y1="206" x2="120" y2="212" stroke={color} strokeWidth="1.5" className="opacity-45" />
          <line x1="28" y1="120" x2="34" y2="120" stroke={color} strokeWidth="1.5" className="opacity-45" />
          <line x1="206" y1="120" x2="212" y2="120" stroke={color} strokeWidth="1.5" className="opacity-45" />

          {/* Micro dots grid system */}
          <circle cx="80" cy="80" r="1" fill={color} className="opacity-25" />
          <circle cx="160" cy="80" r="1" fill={color} className="opacity-25" />
          <circle cx="80" cy="160" r="1" fill={color} className="opacity-25" />
          <circle cx="160" cy="160" r="1" fill={color} className="opacity-25" />

          {/* Tech Degree markers enriched with alien runic glyph index lines */}
          <text x="120" y="24" fill={color} fontSize="5" fontWeight="950" textAnchor="middle" className="font-mono opacity-50">𐎦𐎔 • 000° [K-VECT]</text>
          <text x="120" y="222" fill={color} fontSize="5" fontWeight="950" textAnchor="middle" className="font-mono opacity-50">𐎚𐎖 • 180° [Z-TRANS]</text>
          <text x="220" y="122" fill={color} fontSize="5" fontWeight="950" textAnchor="start" className="font-mono opacity-50">𐎟𐎀 • 090° [O-PLAN]</text>
          <text x="20" y="122" fill={color} fontSize="5" fontWeight="950" textAnchor="end" className="font-mono opacity-50">𐎖𐎔 • 270° [G-COEF]</text>
        </svg>

        {/* Outer hud corner boxes containing miniature details and progress grids */}
        <div className="absolute top-[35px] left-[-30px] flex flex-col items-start font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
          <span className="font-black leading-none">AIM_LOCK_A: ACTIVE</span>
          <span className="opacity-60 leading-tight">RANGE: {(2500 - telemetry.altitude * 0.1).toFixed(0)}m</span>
          <div className="flex gap-[1.5px] mt-1 h-1 items-end">
            <div className="w-[1.5px] h-full bg-current" style={{ backgroundColor: color }} />
            <div className="w-[1.5px] h-[60%] bg-current opacity-60" style={{ backgroundColor: color }} />
            <div className="w-[1.5px] h-[30%] bg-current opacity-30" style={{ backgroundColor: color }} />
            <div className="w-[1.5px] h-[90%] bg-current" style={{ backgroundColor: color }} />
          </div>
        </div>

        <div className="absolute top-[35px] right-[-30px] flex flex-col items-end font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
          <span className="font-black leading-none">SYS_ALIGN: {alignmentScore}%</span>
          <span className="opacity-60 leading-tight">CHRON_G_LOK: {telemetry.gateProgress}%</span>
          <span className="opacity-50 mt-1 uppercase">EST. 2100_VECTOR</span>
        </div>

        <div className="absolute bottom-[35px] left-[-30px] flex flex-col items-start font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
          <span className="font-black leading-none">COR_TEMP // {coreTemp}°C</span>
          <div className="flex gap-0.5 mt-0.5 opacity-60">
            <span className="text-[5px]">SYS_MOD //</span>
            <span className="font-bold underline">ACTIVE</span>
          </div>
        </div>

        <div className="absolute bottom-[35px] right-[-30px] flex flex-col items-end font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
          <span className="font-black leading-none">FILT_EFF // {filterEffect}</span>
          <span className="opacity-50 mt-0.5 select-none text-[5px]">WINDSHIELD_SENS_LNK</span>
        </div>

        {/* Diagonal caution stripes under the reticle sights */}
        <div className="absolute bottom-[-22px] w-[110px] scale-75 opacity-25">
          <div className="flex gap-[3px] overflow-hidden h-1">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="w-1 h-full skew-x-30 shrink-0" style={{ backgroundColor: color }} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export interface SavantPreset {
  id: string;
  name: string;
  colorName: string;
  primary: string;       // main glowing color
  secondary: string;     // secondary neon highlight
  background: string;    // soft background tint for panels
  alienGlyph: string;    // custom runic descriptor
  description: string;   // high-concept alien-tech description
}

export const SAVANT_THEME_PRESETS: SavantPreset[] = [
  {
    id: "sav-01",
    name: "XENON_FLESH",
    colorName: "CYAN",
    primary: "#00f2ff",
    secondary: "#ff2a85",
    background: "rgba(10, 15, 26, 0.95)",
    alienGlyph: "𐎦𐎔",
    description: "Cold-gas bioluminescent cybernetic membranes fused with silicate fiber lines."
  },
  {
    id: "sav-02",
    name: "AETHER_SPORE",
    colorName: "EMERALD",
    primary: "#10b981",
    secondary: "#c29330",
    background: "rgba(8, 20, 15, 0.95)",
    alienGlyph: "𐎚𐎖",
    description: "Phosphorescent spore clouds drifting around ancient carbon monoliths."
  },
  {
    id: "sav-03",
    name: "QUANTUM_BISMUTH",
    colorName: "AMBER",
    primary: "#f59e0b",
    secondary: "#a855f7",
    background: "rgba(18, 10, 28, 0.95)",
    alienGlyph: "𐎟𐎀",
    description: "High-entropy crystal lattice patterns shifting continuously across spectrum gates."
  },
  {
    id: "sav-04",
    name: "NOX_CATALYST",
    colorName: "RUBY",
    primary: "#ef4444",
    secondary: "#84cc16",
    background: "rgba(8, 12, 22, 0.95)",
    alienGlyph: "𐎔𐎚",
    description: "Chemical catalysts reacting under twin-star cosmic radiation parameters."
  },
  {
    id: "sav-05",
    name: "ABYSSAL_SHELL",
    colorName: "CYAN_DEEP",
    primary: "#06b6d4",
    secondary: "#f97316",
    background: "rgba(6, 16, 20, 0.95)",
    alienGlyph: "𐎖𐎟",
    description: "Sub-oceanic pressurized carapace armor refracting thermal venting sparks."
  },
  {
    id: "sav-06",
    name: "ASTRA_OPAL",
    colorName: "OPAL_ROSE",
    primary: "#ec4899",
    secondary: "#22d3ee",
    background: "rgba(18, 10, 20, 0.95)",
    alienGlyph: "𐎀𐎦",
    description: "Iridescent stellar powder captured in local gravity bubble structures."
  },
  {
    id: "sav-07",
    name: "SOLAR_LITHIUM",
    colorName: "LITHIUM_FIRE",
    primary: "#e67e22",
    secondary: "#ef4444",
    background: "rgba(22, 12, 6, 0.95)",
    alienGlyph: "𐎚𐎀",
    description: "Supercharged lithium core plasma fields with raw thermal containment rings."
  },
  {
    id: "sav-08",
    name: "ECHO_VOID",
    colorName: "DEEP_VIOLET",
    primary: "#8b5cf6",
    secondary: "#3d70ff",
    background: "rgba(7, 6, 15, 0.95)",
    alienGlyph: "𐎦𐎖",
    description: "Sonic wave echoes vibrating through unmapped dark sector intervals."
  },
  {
    id: "sav-09",
    name: "NEURA_SPINDLE",
    colorName: "ORCHID_GOLD",
    primary: "#c084fc",
    secondary: "#eab308",
    background: "rgba(12, 10, 18, 0.95)",
    alienGlyph: "𐎟𐎚",
    description: "Whispering neural tendrils woven through rigid titanium cockpit struts."
  },
  {
    id: "sav-10",
    name: "TECTON_BASALT",
    colorName: "TECTONIC_MAGMA",
    primary: "#fb923c",
    secondary: "#5c7490",
    background: "rgba(14, 12, 10, 0.95)",
    alienGlyph: "𐎔𐎟",
    description: "Molten magma lines cooling along shifting planetary fold planes."
  },
  {
    id: "sav-11",
    name: "CRYO_FRACTURE",
    colorName: "CRYO_CRYSTAL",
    primary: "#38bdf8",
    secondary: "#a4b5cf",
    background: "rgba(8, 15, 22, 0.95)",
    alienGlyph: "𐎖𐎀",
    description: "Super-cooled crystalline fractures reflecting distant galaxy halos."
  },
  {
    id: "sav-12",
    name: "SCYTHE_PLAGUE",
    colorName: "PLAGUE_MAGENTA",
    primary: "#d946ef",
    secondary: "#10b981",
    background: "rgba(18, 6, 16, 0.95)",
    alienGlyph: "𐎚𐎦",
    description: "Bacterial bio-toxins interacting with cybernetic filtration nodes."
  },
  {
    id: "sav-13",
    name: "PLASM_LICHEN",
    colorName: "PLASM_GOLD",
    primary: "#e5b111",
    secondary: "#06b6d4",
    background: "rgba(15, 15, 8, 0.95)",
    alienGlyph: "𐎟𐎖",
    description: "Adaptive lichen cultures breathing on superheated plasma pipes."
  },
  {
    id: "sav-14",
    name: "ASTRAL_BREEZE",
    colorName: "ASTRAL_PINK",
    primary: "#26e1ff",
    secondary: "#f472b6",
    background: "rgba(8, 16, 18, 0.95)",
    alienGlyph: "𐎀𐎔",
    description: "Gentle solar wind streams carrying crystalline silica dust."
  },
  {
    id: "sav-15",
    name: "MYCELIUM_GLOW",
    colorName: "BIO_TEAL",
    primary: "#14b8a6",
    secondary: "#b45309",
    background: "rgba(8, 18, 16, 0.95)",
    alienGlyph: "𐎦𐎟",
    description: "Deep subterranean root networks communicating via electrical pulses."
  },
  {
    id: "sav-16",
    name: "CHRONO_MERCURY",
    colorName: "MERCURY_SILVER",
    primary: "#cbd5e1",
    secondary: "#2563eb",
    background: "rgba(10, 12, 18, 0.95)",
    alienGlyph: "𐎚𐎔",
    description: "Fluid metal alloy structures morphing according to time flow curves."
  },
  {
    id: "sav-17",
    name: "VOID_DUST",
    colorName: "VOID_LAVENDER",
    primary: "#bb88ff",
    secondary: "#fbcfe8",
    background: "rgba(12, 8, 16, 0.95)",
    alienGlyph: "𐎟𐎀",
    description: "Cosmic background matter crystallizing into fine orbital halos."
  },
  {
    id: "sav-18",
    name: "AERO_SPINE",
    colorName: "AERO_EMERALD",
    primary: "#05d5b4",
    secondary: "#eab308",
    background: "rgba(10, 16, 15, 0.95)",
    alienGlyph: "𐎖𐎔",
    description: "Lightweight bone composite framework designed for extreme flight stress."
  },
  {
    id: "sav-19",
    name: "VESICLE_PULSE",
    colorName: "VESICLE_CRIMSON",
    primary: "#ff0055",
    secondary: "#1be5ff",
    background: "rgba(16, 6, 10, 0.95)",
    alienGlyph: "𐎀𐎚",
    description: "Vascular nectar chambers pumping biosynthetic engine coolant."
  },
  {
    id: "sav-20",
    name: "HYPER_SAVANT",
    colorName: "HYPER_GOLD",
    primary: "#00ffcc",
    secondary: "#ffa500",
    background: "rgba(6, 18, 14, 0.95)",
    alienGlyph: "𐎦𐎟𐎀",
    description: "Highly complex intelligence array optimizing quantum routing lines."
  }
];

export const CockpitHUD: React.FC = () => {
  const {
    pilotConfig,
    telemetry,
    opticMode,
    filterEffect,
    telemetryLogs,
    setOpticMode,
    setFilterEffect,
    updateTelemetry,
    triggerScreenShake,
    setPhase,
    addTelemetryLog,
    spotlightActive,
    spotlightIntensity,
    spotlightColor,
    spotlightAngle,
    setSpotlightActive,
    setSpotlightIntensity,
    setSpotlightColor,
    setSpotlightAngle,
    hudVisible,
    setHudVisible,
    asteroidTheme,
    setAsteroidTheme,
    updatePilotConfig,
  } = useAppState();

  const { playDiagnosticBlip, playWarpWhoosh, playPassagePulse } = useAudio();

  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // Local state for interactive flight correction and core dynamics
  const [alignmentScore, setAlignmentScore] = useState(95);
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [isWarpingActive, setIsWarpingActive] = useState(false);
  const [coreTemp, setCoreTemp] = useState(240); // safety core temperature in degrees celsius
  const [isVentingActive, setIsVentingActive] = useState(false);

  // Savant customized bio-cybernetic branding & joystick interfaces
  const [isBrandingPortalOpen, setIsBrandingPortalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Continuous steering event publisher while dragging the Holo-Drift stick
  useEffect(() => {
    if (!isDragging) return;
    const interval = setInterval(() => {
      // Scale to max radius 35px
      const vx = (dragOffset.x / 35) * 1.8;
      const vy = -(dragOffset.y / 35) * 1.5;
      window.dispatchEvent(new CustomEvent('ship-thrust-override', { detail: { dirX: vx, dirY: vy } }));
    }, 45);
    return () => clearInterval(interval);
  }, [isDragging, dragOffset]);

  // Closeable panels and Workspace Layout saving states (loaded from localStorage dynamically)
  const [isLayoutLocked, setIsLayoutLocked] = useState(() => {
    try {
      const saved = localStorage.getItem('cockpit_layout_locked');
      return saved === 'true';
    } catch (_) { return false; }
  });

  const [isNavOpen, setIsNavOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('cockpit_nav_open');
      return saved !== 'false';
    } catch (_) { return true; }
  });

  const [isHelmOpen, setIsHelmOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('cockpit_helm_open');
      return saved !== 'false';
    } catch (_) { return true; }
  });

  const [isSynthesisOpen, setIsSynthesisOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('cockpit_synthesis_open');
      return saved !== 'false';
    } catch (_) { return true; }
  });

  const [isRadarOpen, setIsRadarOpen] = useState(() => {
    try {
      const saved = localStorage.getItem('cockpit_radar_open');
      return saved !== 'false';
    } catch (_) { return true; }
  });

  // Adobe Creative Suite inspired Panel States (Collapsibility, real-time opacity sliders, docking pins, tab workspace)
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [navOpacity, setNavOpacity] = useState(0.92);
  const [navPinned, setNavPinned] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<'NAV' | 'LOGS' | 'THEM'>('NAV');

  const [isHelmCollapsed, setIsHelmCollapsed] = useState(false);
  const [helmOpacity, setHelmOpacity] = useState(0.92);
  const [helmPinned, setHelmPinned] = useState(false);
  const [activeHelmTab, setActiveHelmTab] = useState<'HELM' | 'STEER'>('HELM');

  const [isSynthesisCollapsed, setIsSynthesisCollapsed] = useState(false);
  const [synthesisOpacity, setSynthesisOpacity] = useState(0.92);
  const [synthesisPinned, setSynthesisPinned] = useState(false);
  const [activeSynthesisTab, setActiveSynthesisTab] = useState<'SYNTH' | 'SPECS'>('SYNTH');

  const [isRadarCollapsed, setIsRadarCollapsed] = useState(false);
  const [radarOpacity, setRadarOpacity] = useState(0.92);
  const [radarPinned, setRadarPinned] = useState(false);

  // Adobe Power HUD customization states
  const [hudScale, setHudScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('cockpit_hud_scale');
      return saved ? parseFloat(saved) : 1.0;
    } catch (_) { return 1.0; }
  });
  const [isGridVisible, setIsGridVisible] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cockpit_grid_visible') === 'true';
    } catch (_) { return false; }
  });
  const [isSnappingEnabled, setIsSnappingEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('cockpit_snapping_enabled') !== 'false';
    } catch (_) { return true; }
  });
  const [activeTool, setActiveTool] = useState<'MOVE' | 'SCAN' | 'LASER' | 'TRACTOR' | 'DROPPER' | 'ZOOM'>(() => {
    try {
      return (localStorage.getItem('cockpit_active_tool') as any) || 'MOVE';
    } catch (_) { return 'MOVE'; }
  });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeDropdown, setActiveDropdown] = useState<'FILE' | 'EDIT' | 'VIEW' | 'WINDOW' | 'HELP' | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  useEffect(() => {
    const trackMouse = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', trackMouse);
    return () => {
      window.removeEventListener('mousemove', trackMouse);
    };
  }, []);

  // Adobe Panel Drag, Snap & Active Resize States
  const [activeDragId, setActiveDragId] = useState<'nav' | 'helm' | 'synthesis' | 'radar' | null>(null);
  const [activePreset, setActivePreset] = useState(() => {
    try {
      const saved = localStorage.getItem('cockpit_active_preset');
      return saved || 'Essentials';
    } catch (_) { return 'Essentials'; }
  });

  const [panelSizes, setPanelSizes] = useState<{
    nav: { w: number; h: number };
    helm: { w: number; h: number };
    synthesis: { w: number; h: number };
    radar: { w: number; h: number };
  }>(() => {
    try {
      const saved = localStorage.getItem('cockpit_workspace_sizes');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (_) {}
    return {
      nav: { w: 260, h: 290 },
      helm: { w: 260, h: 290 },
      synthesis: { w: 720, h: 180 },
      radar: { w: 260, h: 285 }
    };
  });

  const [panelPositions, setPanelPositions] = useState<{
    nav: { x: number; y: number };
    helm: { x: number; y: number };
    synthesis: { x: number; y: number };
    radar: { x: number; y: number };
  }>(() => {
    try {
      const saved = localStorage.getItem('cockpit_workspace_positions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.radar) parsed.radar = { x: 0, y: 0 };
        return parsed;
      }
    } catch (_) {}
    return {
      nav: { x: 0, y: 0 },
      helm: { x: 0, y: 0 },
      synthesis: { x: 0, y: 0 },
      radar: { x: 0, y: 0 }
    };
  });

  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'SELECT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      
      const key = e.key.toUpperCase();
      
      // Ctrl combinations
      if (e.ctrlKey) {
        if (key === 'S') {
          e.preventDefault();
          saveWorkspace();
        }
        if (key === 'E') {
          e.preventDefault();
          try {
            const payload = {
              preset: activePreset,
              sizes: panelSizes,
              positions: panelPositions,
              scale: hudScale,
              timestamp: new Date().toISOString()
            };
            navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
            addTelemetryLog("INTEL_EXPORT: CABIN STRUCT CHASSIS METRICS COPIED TO MEMORY.");
            playDiagnosticBlip(880, 0.18);
          } catch (_) {}
        }
        if (e.key === "'") {
          e.preventDefault();
          setIsGridVisible(prev => !prev);
          playDiagnosticBlip(750, 0.08);
        }
        return;
      }
      
      // Alt combinations
      if (e.altKey) {
        if (key === 'R') {
          e.preventDefault();
          updateTelemetry({ velocity: 0 });
          addTelemetryLog("FILE: COMPASS & CALIBRATION SENSORS RE-ALIGNED.");
          playDiagnosticBlip(450, 0.1);
        }
        if (key === 'S') {
          e.preventDefault();
          triggerScreenShake(3.5);
          addTelemetryLog("EDIT: STRESS CHECK SECTOR OS SHAKE EXECUTED.");
          playDiagnosticBlip(120, 0.3);
        }
        if (key === 'A') {
          e.preventDefault();
          setIsNavOpen(true); setIsHelmOpen(true); setIsRadarOpen(true); setIsSynthesisOpen(true);
          setIsNavCollapsed(false); setIsHelmCollapsed(false); setIsRadarCollapsed(false); setIsSynthesisCollapsed(false);
          playDiagnosticBlip(780, 0.1);
        }
        if (key === 'C') {
          e.preventDefault();
          setIsNavOpen(false); setIsHelmOpen(false); setIsRadarOpen(false); setIsSynthesisOpen(false);
          playDiagnosticBlip(320, 0.12);
        }
        return;
      }

      // Standard single-letter tool hotkeys (V, S, L, O, I, Z)
      if (key === 'V') {
        setActiveTool('MOVE');
        addTelemetryLog("TOOL ENGAGED: [MOVE TOOL] SHORTCUT_KEY (V) REGISTERED.");
        playDiagnosticBlip(680, 0.05);
      } else if (key === 'S') {
        setActiveTool('SCAN');
        addTelemetryLog("TOOL ENGAGED: [SCAN PROBE] SHORTCUT_KEY (S) REGISTERED.");
        playDiagnosticBlip(680, 0.05);
      } else if (key === 'L') {
        setActiveTool('LASER');
        addTelemetryLog("TOOL ENGAGED: [LASER SIGHT] SHORTCUT_KEY (L) REGISTERED.");
        playDiagnosticBlip(680, 0.05);
      } else if (key === 'O') {
        setActiveTool('TRACTOR');
        addTelemetryLog("TOOL ENGAGED: [SPOTLIGHT CLAMPING] SHORTCUT_KEY (O) REGISTERED.");
        playDiagnosticBlip(680, 0.05);
      } else if (key === 'I') {
        setActiveTool('DROPPER');
        addTelemetryLog("TOOL ENGAGED: [EYEDROPPER SAMPLE] SHORTCUT_KEY (I) REGISTERED.");
        playDiagnosticBlip(680, 0.05);
      } else if (key === 'Z') {
        const nextScale = hudScale === 1.15 ? 0.85 : hudScale === 1.0 ? 1.15 : 1.0;
        setHudScale(nextScale);
        addTelemetryLog(`ZOOM: COCKPIT VIEWPORT SCALING CONFIGURED TO ${Math.round(nextScale * 100)}%`);
        playDiagnosticBlip(920, 0.1);
      } else if (e.key === 'F1') {
        e.preventDefault();
        setIsHelpModalOpen(prev => !prev);
        playDiagnosticBlip(750, 0.08);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [hudScale, activePreset, panelSizes, panelPositions, isSnappingEnabled, isLayoutLocked, isNavOpen, isHelmOpen, isRadarOpen, isSynthesisOpen]);

  const saveWorkspace = () => {
    try {
      localStorage.setItem('cockpit_nav_open', String(isNavOpen));
      localStorage.setItem('cockpit_helm_open', String(isHelmOpen));
      localStorage.setItem('cockpit_synthesis_open', String(isSynthesisOpen));
      localStorage.setItem('cockpit_radar_open', String(isRadarOpen));
      localStorage.setItem('cockpit_workspace_positions', JSON.stringify(panelPositions));
      localStorage.setItem('cockpit_workspace_sizes', JSON.stringify(panelSizes));
      localStorage.setItem('cockpit_layout_locked', String(isLayoutLocked));
      localStorage.setItem('cockpit_active_preset', activePreset);
      localStorage.setItem('cockpit_hud_scale', String(hudScale));
      localStorage.setItem('cockpit_grid_visible', String(isGridVisible));
      localStorage.setItem('cockpit_snapping_enabled', String(isSnappingEnabled));
      localStorage.setItem('cockpit_active_tool', activeTool);
      
      playDiagnosticBlip(1100, 0.15);
      addTelemetryLog('WORKSPACE DOCK: COCKPIT LAYOUT & PANEL GEOMETRIX SAVED SECURELY.');
      setSaveStatus('SAVED!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.warn('Workspace save failed:', err);
    }
  };

  const changeWorkspacePreset = (presetName: string) => {
    setActivePreset(presetName);
    
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    let newPositions = {
      nav: { x: 0, y: 0 },
      helm: { x: 0, y: 0 },
      synthesis: { x: 0, y: 0 },
      radar: { x: 0, y: 0 }
    };
    let newSizes = {
      nav: { w: 260, h: 290 },
      helm: { w: 260, h: 290 },
      synthesis: { w: 720, h: 180 },
      radar: { w: 260, h: 285 }
    };
    
    if (presetName === 'Essentials') {
      setIsNavOpen(true);
      setIsHelmOpen(true);
      setIsRadarOpen(true);
      setIsSynthesisOpen(true);
      setIsNavCollapsed(false);
      setIsHelmCollapsed(false);
      setIsRadarCollapsed(false);
      setIsSynthesisCollapsed(false);
    } else if (presetName === 'Tactical Map-Focus') {
      newSizes.radar = { w: 340, h: 320 };
      newPositions = {
        radar: { x: -10, y: 220 },
        nav: { x: 12, y: 0 },
        helm: { x: -12, y: 0 },
        synthesis: { x: 0, y: 0 }
      };
      setIsNavOpen(true);
      setIsHelmOpen(true);
      setIsRadarOpen(true);
      setIsSynthesisOpen(true);
      setIsNavCollapsed(true);
      setIsHelmCollapsed(true);
      setIsRadarCollapsed(false);
      setIsSynthesisCollapsed(true);
    } else if (presetName === 'Alchemic Synthesis') {
      newSizes.synthesis = { w: 840, h: 220 };
      newPositions = {
        synthesis: { x: 0, y: 0 },
        nav: { x: 12, y: 20 },
        helm: { x: -12, y: 20 },
        radar: { x: 12, y: 350 }
      };
      setIsNavOpen(true);
      setIsHelmOpen(true);
      setIsRadarOpen(true);
      setIsSynthesisOpen(true);
      setIsNavCollapsed(true);
      setIsHelmCollapsed(true);
      setIsRadarCollapsed(true);
      setIsSynthesisCollapsed(false);
    } else if (presetName === 'Duo-Dock Sidebar') {
      newPositions = {
        nav: { x: screenW - 290 - 40, y: 12},
        helm: { x: screenW - 290 - 40, y: 70},
        radar: { x: screenW - 290 - 40, y: 150},
        synthesis: { x: 0, y: 0 }
      };
      setIsNavOpen(true);
      setIsHelmOpen(true);
      setIsRadarOpen(true);
      setIsSynthesisOpen(true);
      setIsNavCollapsed(true);
      setIsHelmCollapsed(true);
      setIsRadarCollapsed(true);
      setIsSynthesisCollapsed(true);
    }

    setPanelPositions(newPositions);
    setPanelSizes(newSizes);
    playDiagnosticBlip(950, 0.12);
    addTelemetryLog(`WORKSPACE: RE-CONFIGURED HUD PRESET CHANNELS TO [${presetName.toUpperCase()}]`);
  };

  // Mathematical docking snapped alignment algorithm
  const applyMagneticDocking = (panelId: 'nav' | 'helm' | 'synthesis' | 'radar', candidateX: number, candidateY: number) => {
    if (!isSnappingEnabled) return { x: candidateX, y: candidateY };
    const element = document.getElementById(`hud-panel-${panelId}`);
    if (!element) return { x: candidateX, y: candidateY };

    const rect = element.getBoundingClientRect();
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    const snapThreshold = 25; // snap threshold in pixels
    const gap = 12; // gap size when docked adjacent

    let adjustX = 0;
    let adjustY = 0;

    // 1. Viewport boundary snaps
    if (rect.left < snapThreshold) {
      adjustX = -rect.left + gap; // dock to left edge with gap
    } else if (screenW - rect.right < snapThreshold) {
      adjustX = screenW - rect.right - gap; // dock to right edge
    }

    if (rect.top - 84 < snapThreshold && rect.top > 0) {
      adjustY = 84 - rect.top; // dock top below main HUD menu bar
    } else if (screenH - rect.bottom < snapThreshold) {
      adjustY = screenH - rect.bottom - gap; // dock to bottom
    }

    // 2. Inter-panel magnetic proximity snaps
    const panels: ('nav' | 'helm' | 'synthesis' | 'radar')[] = ['nav', 'helm', 'synthesis', 'radar'];
    for (const otherId of panels) {
      if (otherId === panelId) continue;
      const otherEl = document.getElementById(`hud-panel-${otherId}`);
      if (!otherEl) continue;

      const otherRect = otherEl.getBoundingClientRect();

      // Side-by-side adjacency docking
      if (Math.abs(rect.left - (otherRect.right + gap)) < snapThreshold) {
        adjustX = (otherRect.right + gap) - rect.left;
        if (Math.abs(rect.top - otherRect.top) < snapThreshold) {
          adjustY = otherRect.top - rect.top; // align tops
        }
      } else if (Math.abs(rect.right - (otherRect.left - gap)) < snapThreshold) {
        adjustX = (otherRect.left - gap) - rect.right;
        if (Math.abs(rect.top - otherRect.top) < snapThreshold) {
          adjustY = otherRect.top - rect.top; // align tops
        }
      }

      // Vertical stack docking
      if (Math.abs(rect.top - (otherRect.bottom + gap)) < snapThreshold) {
        adjustY = (otherRect.bottom + gap) - rect.top;
        if (Math.abs(rect.left - otherRect.left) < snapThreshold) {
          adjustX = otherRect.left - rect.left; // align lefts
        }
      } else if (Math.abs(rect.bottom - (otherRect.top - gap)) < snapThreshold) {
        adjustY = (otherRect.top - gap) - rect.bottom;
        if (Math.abs(rect.left - otherRect.left) < snapThreshold) {
          adjustX = otherRect.left - rect.left; // align lefts
        }
      }
    }

    return {
      x: candidateX + adjustX,
      y: candidateY + adjustY
    };
  };

  // Cooldown & charging states for Low, Medium, and High Warp Drives
  const [warpEnergy, setWarpEnergy] = useState<{ low: number; med: number; high: number }>({
    low: 100,
    med: 100,
    high: 100
  });

  // Dynamic automatic rebuild of warp drive energy over time
  useEffect(() => {
    const rechargeInterval = setInterval(() => {
      setWarpEnergy(prev => {
        let changed = false;
        const next = { ...prev };
        if (next.low < 100) {
          next.low = Math.min(100, next.low + 4.5); // low charges fast
          changed = true;
        }
        if (next.med < 100) {
          next.med = Math.min(100, next.med + 3.0); // med charges medium
          changed = true;
        }
        if (next.high < 100) {
          next.high = Math.min(100, next.high + 1.8); // high charges slow
          changed = true;
        }
        return changed ? next : prev;
      });
    }, 250);

    return () => clearInterval(rechargeInterval);
  }, []);

  // Procedural White Noise Vapor Ventilation Synthesis
  const playCoolantHiss = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      
      const bufferSize = ctx.sampleRate * 1.5; // 1.5 seconds hiss
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(750, ctx.currentTime + 1.2);
      filter.Q.value = 4.0;
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.4);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
    } catch (e) {
      console.warn('Procedural vapor hiss failed:', e);
    }
  };

  const handleVentingCoolant = () => {
    if (isVentingActive || coreTemp <= 220) return;
    setIsVentingActive(true);
    playCoolantHiss();
    addTelemetryLog('REACTOR_SAFETY: DEPLOYING HIGH PRESSURE CRYOGENIC VENT VALVE');
    
    let temp = coreTemp;
    const ventInterval = setInterval(() => {
      temp = Math.max(220, temp - Math.floor(Math.random() * 25) - 20);
      setCoreTemp(temp);
      if (temp <= 220) {
        clearInterval(ventInterval);
        setIsVentingActive(false);
        addTelemetryLog('REACTOR_COILS: COOLING CYCLE SUCCESS. CORE IDLE AT 220°C.');
      }
    }, 110);
  };

  const handleManualThrust = (dirX: number, dirY: number) => {
    playDiagnosticBlip(350, 0.08);
    const event = new CustomEvent('ship-thrust-override', {
      detail: { dirX, dirY },
    });
    window.dispatchEvent(event);
    addTelemetryLog(`MANUAL_STEER: IMPULSE INJECTED {x: ${dirX}, y: ${dirY}}`);
  };

  // Dedicated dynamic 2D canvas radar drawing sweep loop
  useEffect(() => {
    if (!radarCanvasRef.current) return;
    const canvas = radarCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameId: number;
    let angle = 0;

    const scaleX = canvas.width / 100;
    const scaleY = canvas.height / 100;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Static layout list of mock target portal gates in relative radial distances
    const blips = [
      { gateNum: 1, angle: 45, dist: 28, active: telemetry.currentGate === 1 },
      { gateNum: 2, angle: 120, dist: 38, active: telemetry.currentGate === 2 },
      { gateNum: 3, angle: 220, dist: 18, active: telemetry.currentGate === 3 },
      { gateNum: 4, angle: 310, dist: 42, active: telemetry.currentGate === 4 },
      { gateNum: 5, angle: 85, dist: 24, active: telemetry.currentGate === 5 },
    ];

    const drawRadar = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Radar Concentric grid boundaries
      ctx.strokeStyle = `${pilotConfig.hudColor}22`;
      ctx.lineWidth = 0.5;

      // Outer border circle ring
      ctx.beginPath();
      ctx.arc(cx, cy, cx - 1, 0, Math.PI * 2);
      ctx.stroke();

      // Inner boundary circle rings
      ctx.beginPath();
      ctx.arc(cx, cy, cx * 0.65, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, cx * 0.35, 0, Math.PI * 2);
      ctx.stroke();

      // Axis crosshairs lines
      ctx.beginPath();
      ctx.moveTo(cx - (cx - 1), cy);
      ctx.lineTo(cx + (cx - 1), cy);
      ctx.moveTo(cx, cy - (cx - 1));
      ctx.lineTo(cx, cy + (cx - 1));
      ctx.stroke();

      // Radar focal targets markers
      blips.forEach((blip) => {
        const radAngle = (blip.angle * Math.PI) / 180;
        const bx = cx + Math.cos(radAngle) * blip.dist * scaleX * 0.9;
        const by = cy + Math.sin(radAngle) * blip.dist * scaleY * 0.9;

        if (blip.active) {
          // Pulse current target gate blip
          const scale = (1.8 + Math.sin(performance.now() * 0.015) * 0.6) * scaleX;
          ctx.fillStyle = pilotConfig.hudColor;
          ctx.beginPath();
          ctx.arc(bx, by, scale, 0, Math.PI * 2);
          ctx.fill();

          // target blinking perimeter
          ctx.strokeStyle = pilotConfig.hudColor;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(bx, by, scale + 2.5 * scaleX, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          ctx.fillStyle = `${pilotConfig.hudColor}44`; // upcoming dim
          ctx.beginPath();
          ctx.arc(bx, by, 1.4 * scaleX, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Rotating radar beam sweep line
      const rad = (angle * Math.PI) / 180;
      const targetX = cx + Math.cos(rad) * (cx - 1);
      const targetY = cy + Math.sin(rad) * (cx - 1);

      const gradient = ctx.createRadialGradient(cx, cy, 3, cx, cy, cx - 1);
      gradient.addColorStop(0, `${pilotConfig.hudColor}03`);
      gradient.addColorStop(1, `${pilotConfig.hudColor}14`);
      ctx.fillStyle = gradient;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, cx - 1, rad - 0.22, rad);
      ctx.lineTo(cx, cy);
      ctx.fill();

      // Leading beam line
      ctx.strokeStyle = `${pilotConfig.hudColor}aa`;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();

      // Update angle
      angle = (angle + 3.5) % 360;
      frameId = requestAnimationFrame(drawRadar);
    };

    drawRadar();

    return () => cancelAnimationFrame(frameId);
  }, [pilotConfig.hudColor, telemetry.currentGate]);

  // Steering alignment mechanics
  const handleSteerAlignment = () => {
    playDiagnosticBlip(720, 0.06);
    const scoreDiff = (Math.random() - 0.5) * 5;
    const finalScore = Math.max(90, Math.min(100, Math.floor(alignmentScore + scoreDiff)));
    setAlignmentScore(finalScore);

    const checkLines = [
      'QUANTUM GRID ALIGNMENT: AUTOCORRECT ENGAGED',
      `COEF_CALIBRATE: VECTOR REBALANCED TO ${finalScore}% PRECISION`,
      'NOISE CALIBRATION CORRECTION LEVEL 100%'
    ];
    addTelemetryLog(checkLines[Math.floor(Math.random() * checkLines.length)]);
  };

  // Warp Drive Inject mechanics (progress navigation)
  const handleThrottleBoost = (speedLevel: 'low' | 'med' | 'high' = 'med') => {
    if (isWarpingActive) return;
    if (warpEnergy[speedLevel] < 100) {
      addTelemetryLog(`WARN: MODULE RECHARGING. CURRENT WARP DRIVE CAPACITY AT ${Math.floor(warpEnergy[speedLevel])}%`);
      return;
    }

    // Drain energy of this specific warp speed level to zero immediately
    setWarpEnergy(prev => ({ ...prev, [speedLevel]: 0 }));
    setIsWarpingActive(true);
    playWarpWhoosh();
    triggerScreenShake(0); // Screen shaking disabled per explicit direction "Don't shake screen"

    // Dispatch custom warp active event to ThreeScene for visual distortion, stretching, and warp field streaks
    window.dispatchEvent(new CustomEvent('ship-warp-active', { detail: { active: true, level: speedLevel } }));

    addTelemetryLog(`BOOST STATS: INJECTING ${speedLevel.toUpperCase()} WARP ENERGY TO CHRONOS VECTOR`);
    
    let currentProg = telemetry.gateProgress;
    const intervalTicks = setInterval(() => {
      let increment = 8;
      let targetVelBase = 5800;
      let tempRise = 12;

      if (speedLevel === 'low') {
        increment = Math.floor(Math.random() * 3) + 3; // 3-5%
        targetVelBase = 3200;
        tempRise = Math.floor(Math.random() * 8) + 4;
      } else if (speedLevel === 'med') {
        increment = Math.floor(Math.random() * 7) + 5; // 5-11%
        targetVelBase = 6200;
        tempRise = Math.floor(Math.random() * 14) + 10;
      } else if (speedLevel === 'high') {
        increment = Math.floor(Math.random() * 14) + 11; // 11-24%
        targetVelBase = 9800;
        tempRise = Math.floor(Math.random() * 24) + 20;
      }

      currentProg += increment;
      setCoreTemp((prev) => Math.min(480, prev + tempRise));

      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(intervalTicks);
        setIsWarpingActive(false);
        updateTelemetry({ gateProgress: 100, velocity: targetVelBase });
        playDiagnosticBlip(1050, 0.15);
        addTelemetryLog(`HUD DEVIATION_ACHIEVED: PORTAL GATE ${telemetry.currentGate} COMPILATION RECOGNIZED`);
        
        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('ship-warp-active', { detail: { active: false, level: 'none' } }));
      } else {
        // Linear acceleration interpolation mathematically simulated without external Three.js module
        const nextVel = telemetry.velocity + (targetVelBase - telemetry.velocity) * 0.28 + (Math.random() * 100 - 50);
        updateTelemetry({ 
          gateProgress: currentProg,
          velocity: Math.floor(Math.max(600, Math.min(nextVel, 11000)))
        });
      }
    }, 120);
  };

  // Passage check when gate progress has arrived at 100%
  const handlePassgatePortal = () => {
    if (telemetry.gateProgress < 100) return;

    playPassagePulse();
    triggerScreenShake(0); // Screen shaking disabled per explicit direction "Don't shake screen"

    const nextGateNum = telemetry.currentGate + 1;
    
    if (nextGateNum > 5) {
      addTelemetryLog('CHRONOS TRANSIT RUN 100% COMPLETE. SHIFTING PHASE TO DESTINATION CORE.');
      setTimeout(() => {
        setPhase('DESTINATION');
      }, 800);
    } else {
      updateTelemetry({
        currentGate: nextGateNum,
        gateProgress: 0,
        velocity: Math.floor(telemetry.velocity - 200),
      });
      addTelemetryLog(`SYSTEM DISPATCH: GATE ${telemetry.currentGate} SECURE_ENTER SUCCESS. INITIALIZING GATE ${nextGateNum}.`);
    }
  };

  // Spotlight Optical Source Types list
  const spotlightTypes = [
    { name: 'Halogen', value: '#ffd166', code: 'HAL', style: 'Warm Amber 3200K' },
    { name: 'LED', value: '#ffffff', code: 'LED', style: 'Crisp White 6500K' },
    { name: 'Xenon', value: '#00f2ff', code: 'XEN', style: 'Gas Discharge 8000K' },
    { name: 'Plasma', value: '#d946ef', code: 'PLS', style: 'Ionized Laser core' },
    { name: 'Infrared', value: '#ff3333', code: 'IR', style: 'Thermal Band 900nm_IR' },
  ];

  const hudColor = pilotConfig.hudColor;

  return (
    <div id="active-cockpit-hud" className="absolute inset-0 w-full h-full font-mono pointer-events-none text-xs select-none z-10 overflow-hidden">
      
      {/* ADOBE DOCK BOUNDARY SNAPPING GUIDE PLATES */}
      <AnimatePresence>
        {activeDragId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-10"
          >
            {/* Left Magnetic Zone Plate */}
            <div 
              className="absolute left-3 top-20 bottom-3 w-[270px] border border-dashed flex flex-col items-center justify-center transition-all bg-sky-500/5 duration-200 animate-pulse"
              style={{ 
                borderColor: `${hudColor}3a`,
                boxShadow: `inset 0 0 24px ${hudColor}12`
              }}
            >
              <div className="flex flex-col items-center gap-1 scale-90 opacity-60">
                <span className="text-[6.2px] tracking-[0.25em] font-black uppercase text-center" style={{ color: hudColor }}>DOCK LEFT AREA</span>
                <span className="text-[5px] text-zinc-550 lowercase">snaps navigator & astromap panels</span>
              </div>
            </div>

            {/* Right Magnetic Zone Plate */}
            <div 
              className="absolute right-3 top-20 bottom-3 w-[270px] border border-dashed flex flex-col items-center justify-center transition-all bg-sky-500/5 duration-200 animate-pulse"
              style={{ 
                borderColor: `${hudColor}3a`,
                boxShadow: `inset 0 0 24px ${hudColor}12`
              }}
            >
              <div className="flex flex-col items-center gap-1 scale-90 opacity-60">
                <span className="text-[6.2px] tracking-[0.25em] font-black uppercase text-center" style={{ color: hudColor }}>DOCK RIGHT AREA</span>
                <span className="text-[5px] text-zinc-550 lowercase">snaps flight steering controls matrix</span>
              </div>
            </div>

            {/* Bottom Geological Synthesis Dock */}
            <div 
              className="absolute bottom-3 left-[285px] right-[285px] h-[190px] border border-dashed flex flex-col items-center justify-center transition-all bg-emerald-500/5 duration-200 animate-pulse"
              style={{ 
                borderColor: `${hudColor}3a`,
                boxShadow: `inset 0 0 24px ${hudColor}12`
              }}
            >
              <div className="flex flex-col items-center gap-1 scale-90 opacity-60">
                <span className="text-[6.2px] tracking-[0.25em] font-black uppercase text-center" style={{ color: hudColor }}>TACTICAL WEAPONS DOCK CORE</span>
                <span className="text-[5px] text-zinc-550 lowercase">snaps tactical armament systems deck</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINIMALIST CORNER HUD RESTORE TRIGGER (ONLY visible when HUD is hidden, conforms strictly to 4-corner placement) */}
      {!hudVisible && (
        <button
          onClick={() => {
            playDiagnosticBlip(680, 0.08);
            setHudVisible(true);
          }}
          className="absolute top-10 left-10 w-11 h-11 rounded-full border bg-[#020306]/92 p-2 pointer-events-auto flex items-center justify-center cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.95)] z-50 transition-all active:scale-95 hover:bg-neutral-900 border-dashed"
          style={{
            borderColor: `${hudColor}aa`,
            boxShadow: `0 0 12px ${hudColor}22`,
            color: hudColor,
          }}
          title="Restore HUD Display"
        >
          <Eye className="w-4 h-4 animate-pulse" />
        </button>
      )}

      {/* RENDER NEW MINI INTEGRATED WINDSHIELD DISPLAYS & HELM/LIGHT DECK */}
      <AnimatePresence>
        {hudVisible && (
          <>
            {/* ====== ADOBE-STYLE APPLICATION TOP MENU BAR ====== */}
            <div 
              className="absolute top-0 left-0 right-0 h-[28px] bg-[#020306]/98 border-b border-zinc-900 flex items-center justify-between px-3 z-50 text-[9px] text-zinc-400 font-mono select-none pointer-events-auto shadow-md"
              style={{ borderBottomColor: `${hudColor}20` }}
            >
              <div className="flex items-center gap-4">
                {/* Neon App Icon */}
                <span 
                  className="font-black text-[10px] px-1 bg-zinc-900 rounded border hover:brightness-125 transition select-none flex items-center gap-1 cursor-pointer"
                  style={{ borderColor: `${hudColor}60`, color: hudColor }}
                  onClick={() => { playDiagnosticBlip(750, 0.08); setIsHelpModalOpen(true); }}
                >
                  CO
                </span>

                {/* Dropdown Menu Items */}
                <div className="flex items-center gap-2 text-[8px] font-black">
                  {/* FILE MENU */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'FILE' ? null : 'FILE')}
                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'FILE' ? 'bg-zinc-800 text-white' : ''}`}
                    >
                      FILE
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'FILE' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
                          style={{ borderColor: `${hudColor}33`, boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}
                        >
                          <button 
                            onClick={() => { saveWorkspace(); setActiveDropdown(null); }}
                            className="w-full text-left px-2 py-1 text-zinc-350 hover:bg-zinc-900 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>SAVE WORKSPACE DIRECTORY</span>
                            <span className="opacity-40 font-mono">Ctrl+S</span>
                          </button>
                          <button 
                            onClick={() => { 
                              setActiveDropdown(null); 
                              updateTelemetry({ velocity: 0 }); 
                              addTelemetryLog("FILE: COMPASS & CALIBRATION SENSORS RE-ALIGNED.");
                              playDiagnosticBlip(450, 0.1); 
                            }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-900 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>RE-CALIBRATE CABIN COMPASS</span>
                            <span className="opacity-40 font-mono">Alt+R</span>
                          </button>
                          <button 
                            onClick={() => {
                              setActiveDropdown(null);
                              try {
                                const payload = {
                                  preset: activePreset,
                                  sizes: panelSizes,
                                  positions: panelPositions,
                                  scale: hudScale,
                                  timestamp: new Date().toISOString()
                                };
                                navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                                addTelemetryLog("INTEL_EXPORT: CABIN STRUCT CHASSIS METRICS COPIED.");
                                playDiagnosticBlip(880, 0.18);
                              } catch (_) {}
                            }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-910 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>EXPORT COCKPIT GEOMETRY</span>
                            <span className="opacity-40 font-mono">Ctrl+E</span>
                          </button>
                          <div className="border-t border-zinc-900 my-0.5" />
                          <button 
                            onClick={() => {
                              setActiveDropdown(null);
                              localStorage.clear();
                              addTelemetryLog("CACHE_PURGE: TEMPORARY CABIN HUD STATE PURGED.");
                              playWarpWhoosh();
                              setTimeout(() => window.location.reload(), 1000);
                            }}
                            className="w-full text-left px-2 py-1 text-red-400 hover:bg-red-955/40 rounded flex items-center justify-between cursor-pointer"
                          >
                            <span>PURGE LOCAL MEMORY</span>
                            <span className="opacity-50">!]</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* EDIT MENU */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'EDIT' ? null : 'EDIT')}
                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'EDIT' ? 'bg-zinc-800 text-white' : ''}`}
                    >
                      EDIT
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'EDIT' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
                          style={{ borderColor: `${hudColor}33`, boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}
                        >
                          <button 
                            onClick={() => { setIsLayoutLocked(!isLayoutLocked); setActiveDropdown(null); playDiagnosticBlip(600, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-350 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>LOCK WORKSPACE MOVEMENT</span>
                            <span className="opacity-80 text-amber-500 font-mono font-black">{isLayoutLocked ? '✓' : ''}</span>
                          </button>
                          <button 
                            onClick={() => { setIsSnappingEnabled(!isSnappingEnabled); setActiveDropdown(null); playDiagnosticBlip(600, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>MAGNETIC SNAP TO EDGES</span>
                            <span className="opacity-85 text-emerald-400 font-mono font-black">{isSnappingEnabled ? '✓' : ''}</span>
                          </button>
                          <button 
                            onClick={() => { 
                              setActiveDropdown(null); 
                              triggerScreenShake(3.5); 
                              addTelemetryLog("EDIT: STRESS CHECK SECTOR OS SHAKE DISPATCHED.");
                              playDiagnosticBlip(120, 0.3);
                            }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>DISPLACEMENT CORE SHAKE</span>
                            <span className="opacity-40 font-mono">Alt+S</span>
                          </button>
                          <div className="border-t border-zinc-900 my-0.5" />
                          <button 
                            onClick={() => { 
                              setIsVentingActive(!isVentingActive); 
                              setActiveDropdown(null); 
                              addTelemetryLog(`EDIT: HEAT EXCHANGER VENTING STATE -> ${!isVentingActive ? 'ENGAGED' : 'DISENGAGED'}`);
                              playPassagePulse();
                            }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>VENT COCKPIT VENT COOLING</span>
                            <span className="opacity-85 text-cyan-400 font-mono font-black">{isVentingActive ? '✓' : ''}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* VIEW MENU */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'VIEW' ? null : 'VIEW')}
                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'VIEW' ? 'bg-zinc-800 text-white' : ''}`}
                    >
                      VIEW
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'VIEW' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
                          style={{ borderColor: `${hudColor}33`, boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}
                        >
                          <button 
                            onClick={() => { setIsGridVisible(!isGridVisible); setActiveDropdown(null); playDiagnosticBlip(750, 0.08); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>SHOW ALIGNMENT RULER GRID</span>
                            <span className="opacity-85 text-cyan-400 font-mono font-black">{isGridVisible ? '✓' : ''}</span>
                          </button>
                          <div className="border-t border-zinc-910 my-0.5" />
                          <button 
                            onClick={() => { setHudScale(0.85); setActiveDropdown(null); playDiagnosticBlip(950, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>ZOOM OUT VIEWPORT (85%)</span>
                            <span className="opacity-80 text-zinc-300 font-mono">{hudScale === 0.85 ? '✓' : ''}</span>
                          </button>
                          <button 
                            onClick={() => { setHudScale(1.0); setActiveDropdown(null); playDiagnosticBlip(950, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>NATIVE VIEWPORT VIEW (100%)</span>
                            <span className="opacity-80 text-zinc-300 font-mono">{hudScale === 1.0 ? '✓' : ''}</span>
                          </button>
                          <button 
                            onClick={() => { setHudScale(1.15); setActiveDropdown(null); playDiagnosticBlip(950, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>ZOOM IN VIEWPORT (115%)</span>
                            <span className="opacity-80 text-zinc-300 font-mono">{hudScale === 1.15 ? '✓' : ''}</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* WINDOW MENU */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'WINDOW' ? null : 'WINDOW')}
                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'WINDOW' ? 'bg-zinc-800 text-white' : ''}`}
                    >
                      WINDOW
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'WINDOW' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
                          style={{ borderColor: `${hudColor}33`, boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}
                        >
                          <button 
                            onClick={() => { setIsNavOpen(!isNavOpen); setActiveDropdown(null); playDiagnosticBlip(620, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>NAVIGATOR FLIGHT PANEL</span>
                            <span className="opacity-85 text-emerald-450 font-mono">{isNavOpen ? '✓' : ''}</span>
                          </button>
                          <button 
                            onClick={() => { setIsHelmOpen(!isHelmOpen); setActiveDropdown(null); playDiagnosticBlip(620, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>HELM FLIGHT CONTROLS</span>
                            <span className="opacity-85 text-emerald-450 font-mono">{isHelmOpen ? '✓' : ''}</span>
                          </button>
                          <button 
                            onClick={() => { setIsRadarOpen(!isRadarOpen); setActiveDropdown(null); playDiagnosticBlip(620, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>ASTRO RADAR GRAPH MAP</span>
                            <span className="opacity-85 text-emerald-450 font-mono">{isRadarOpen ? '✓' : ''}</span>
                          </button>
                          <button 
                            onClick={() => { setIsSynthesisOpen(!isSynthesisOpen); setActiveDropdown(null); playDiagnosticBlip(620, 0.05); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>TACTICAL WEAPONS ARRAY</span>
                            <span className="opacity-85 text-emerald-450 font-mono">{isSynthesisOpen ? '✓' : ''}</span>
                          </button>
                          <div className="border-t border-zinc-910 my-0.5" />
                          <button 
                            onClick={() => { 
                              setIsNavOpen(true); setIsHelmOpen(true); setIsRadarOpen(true); setIsSynthesisOpen(true);
                              setIsNavCollapsed(false); setIsHelmCollapsed(false); setIsRadarCollapsed(false); setIsSynthesisCollapsed(false);
                              setActiveDropdown(null); playDiagnosticBlip(780, 0.1); 
                            }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>MAXIMIZE ALL CONTROLS</span>
                            <span className="opacity-40 font-mono">Alt+A</span>
                          </button>
                          <button 
                            onClick={() => { 
                              setIsNavOpen(false); setIsHelmOpen(false); setIsRadarOpen(false); setIsSynthesisOpen(false);
                              setActiveDropdown(null); playDiagnosticBlip(320, 0.12);
                            }}
                            className="w-full text-left px-2 py-1 text-zinc-400 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>CLOSE ALL WINDOW TILES</span>
                            <span className="opacity-45 font-mono">Alt+C</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* HELP MENU */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === 'HELP' ? null : 'HELP')}
                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'HELP' ? 'bg-zinc-800 text-white' : ''}`}
                    >
                      HELP
                    </button>
                    <AnimatePresence>
                      {activeDropdown === 'HELP' && (
                        <motion.div 
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
                          style={{ borderColor: `${hudColor}33`, boxShadow: '0 10px 25px rgba(0,0,0,0.9)' }}
                        >
                          <button 
                            onClick={() => { setIsHelpModalOpen(true); setActiveDropdown(null); playDiagnosticBlip(750, 0.08); }}
                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
                          >
                            <span>SHORTCUT KEYMAP CHART</span>
                            <span className="opacity-40 font-mono">F1</span>
                          </button>
                          <div className="border-t border-zinc-910 my-0.5" />
                          <div className="px-2 py-1 text-[5.5px] text-zinc-500 leading-normal">
                            COCKPIT FLIGHT OS 9.2<br />
                            RELEASE VER_9.2.7_PRIME
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* HUD VISUAL CONTROLLER STATE CHASSIS */}
              <div className="flex items-center gap-3 text-[7px] border-l pl-3 border-zinc-800">
                <span className="text-zinc-655 font-extrabold uppercase">ACTIVE PRESET:</span>
                <span className="text-zinc-350 font-black tracking-widest uppercase" style={{ color: hudColor }}>{activePreset} EDITION</span>

                <button 
                  onClick={() => { playDiagnosticBlip(800, 0.08); setIsBrandingPortalOpen(true); }}
                  className="rounded px-2 py-0.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 hover:text-[#00f2ff] transition-all font-black text-zinc-300 cursor-pointer select-none text-[6.2px] flex items-center gap-1 uppercase"
                  title="Savant Alien Branding Portal"
                >
                  <Layers className="w-1.5 h-1.5" />
                  <span>𐎦 XENO_BRAND [20]</span>
                </button>

                <button 
                  onClick={() => { playDiagnosticBlip(1000, 0.1); setHudVisible(false); }}
                  className="rounded px-1 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer select-none"
                  title="Hide HUD"
                >
                  <EyeOff className="w-2 h-2" />
                </button>
              </div>
            </div>

            {/* ====== ADOBE-STYLE ALIGNMENT RULER GRID GRID LINES ====== */}
            {isGridVisible && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
                {/* Horizontal grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between opacity-[0.06]">
                  {[...Array(24)].map((_, idx) => (
                    <div key={`grid-h-${idx}`} className="w-full h-[1px] border-b border-dashed" style={{ borderColor: `${hudColor}` }} />
                  ))}
                </div>
                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex justify-between opacity-[0.06]">
                  {[...Array(32)].map((_, idx) => (
                    <div key={`grid-v-${idx}`} className="h-full w-[1px] border-r border-dashed" style={{ borderColor: `${hudColor}` }} />
                  ))}
                </div>
                {/* Ruler borders with metric coordinates markings */}
                <div className="absolute top-[28px] left-0 right-0 h-3 bg-zinc-950/70 border-b border-zinc-900/50 flex justify-between px-10 text-[5px] text-zinc-650 font-mono leading-none items-center self-center opacity-70">
                  <span>DX_000</span>
                  <span>DX_250</span>
                  <span>DX_500</span>
                  <span>DX_750</span>
                  <span>DX_1000</span>
                  <span>DX_1250</span>
                  <span>DX_1500</span>
                </div>
                <div className="absolute top-[40px] left-0 bottom-0 w-3 bg-zinc-950/70 border-r border-zinc-900/50 flex flex-col justify-between py-10 text-[5px] text-zinc-650 font-mono items-center opacity-70">
                  <span>DY_0</span>
                  <span>DY_200</span>
                  <span>DY_400</span>
                  <span>DY_600</span>
                  <span>DY_800</span>
                </div>
              </div>
            )}

            {/* ====== ADOBE-STYLE FLOATING VERTICAL TOOLBAR ====== */}
            <div 
              className="absolute top-24 left-3 w-[36px] bg-[#020306]/98 border border-zinc-900 rounded-lg flex flex-col items-center gap-1.5 py-3 pointer-events-auto z-40 shadow-[0_12px_45px_rgba(0,0,0,0.98)]"
              style={{ borderColor: `${hudColor}30`, boxShadow: `0 12px 45px rgba(0,0,0,0.98), 0 0 12px ${hudColor}08` }}
            >
              {[
                { id: 'MOVE', icon: SlidersHorizontal, label: 'Move Tool', key: 'V', desc: 'Reposition panels.' },
                { id: 'SCAN', icon: Terminal, label: 'Scan Probe', key: 'S', desc: 'Trace alchemic scan coordinates.' },
                { id: 'LASER', icon: Target, label: 'Laser Alignment', key: 'L', desc: 'Optical reticle sight overlays.' },
                { id: 'TRACTOR', icon: Sun, label: 'Tractor Clamping', key: 'O', desc: 'Toggle vector spotlight power.' },
                { id: 'DROPPER', icon: Droplet, label: 'Eyedropper Sample', key: 'I', desc: 'Sample interface swatches.' },
                { id: 'ZOOM', icon: Maximize2, label: 'Canvas Scaling', key: 'Z', desc: 'Cycle Cockpit scale zoom ratios.' }
              ].map((tool) => {
                const active = activeTool === tool.id;
                const IconComponent = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      if (tool.id === 'ZOOM') {
                        const nextScale = hudScale === 1.15 ? 0.85 : hudScale === 1.0 ? 1.15 : 1.0;
                        setHudScale(nextScale);
                        addTelemetryLog(`ZOOM: COCKPIT VIEWPORT SCALING CONFIGURED TO ${Math.round(nextScale * 100)}%`);
                        playDiagnosticBlip(920, 0.1);
                      } else {
                        setActiveTool(tool.id as any);
                        addTelemetryLog(`TOOL ENGAGED: [${tool.label.toUpperCase()}] SHORTCUT_KEY (${tool.key}) REGISTERED.`);
                        playDiagnosticBlip(680, 0.05);
                      }
                    }}
                    className={`group relative w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
                      active 
                        ? 'bg-zinc-900 text-white border' 
                        : 'text-zinc-550 hover:text-zinc-200 hover:bg-zinc-950 border-transparent border'
                    }`}
                    style={{ borderColor: active ? hudColor : 'transparent', color: active ? hudColor : undefined }}
                    title={`${tool.label} (${tool.key}) - ${tool.desc}`}
                  >
                    <IconComponent className="w-3 h-3" />
                    
                    <span className="absolute bottom-0.5 right-0.5 text-[4px] leading-none text-zinc-650 font-extrabold group-hover:text-zinc-400 select-none">
                      {tool.key}
                    </span>

                    <div className="absolute left-10 scale-0 group-hover:scale-100 transition-all origin-left delay-500 bg-[#020306]/98 border border-zinc-800 rounded px-2 py-1 w-36 pointer-events-none text-left z-50 shadow-2xl flex flex-col gap-0.5">
                      <span className="text-[6.5px] tracking-wide font-black uppercase" style={{ color: hudColor }}>
                        {tool.label} ({tool.key})
                      </span>
                      <p className="text-[5.5px] text-zinc-400 leading-snug font-normal normal-case">
                        {tool.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ====== ADOBE HELP SHORTCUTS POPUP DIALOG MODAL ====== */}
            <AnimatePresence>
              {isHelpModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-[360px] bg-[#020306]/98 border rounded-xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.99)] font-mono flex flex-col"
                    style={{ borderColor: hudColor, boxShadow: `0 0 32px ${hudColor}15` }}
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-zinc-950 border-zinc-900">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3 h-3" style={{ color: hudColor }} />
                        <span className="text-[7.2px] font-black tracking-widest text-zinc-300">COCKPIT_OS : HELPMAP</span>
                      </div>
                      <button 
                        onClick={() => { playDiagnosticBlip(300, 0.05); setIsHelpModalOpen(false); }}
                        className="text-zinc-550 hover:text-white transition cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="p-3.5 flex flex-col gap-2 text-[6.8px] leading-relaxed text-zinc-300">
                      <p className="text-zinc-500 border-b border-zinc-900 pb-0.5 mb-1 font-bold text-[5.8px]">
                        PREMIUM WORKSPACE SHORTCUT KEYS FOR FLIGHT DECK MANIPULATION
                      </p>
                      
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-bold">
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-550">ZOOM CANV:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>Z</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-550">EYEDROPPER:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>I</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-550">MOVE VIEW:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>V</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">SCAN PROB:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>S</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">LASER RETI:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>L</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">SPOTLIGHT:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>O</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">SAVE WORK:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">Ctrl+S</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">GRID DRAW:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">Ctrl+'</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">HELP CHART:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">F1</kbd></div>
                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">STRESS SHAK:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">Alt+S</kbd></div>
                      </div>

                      <div className="mt-2 bg-black/60 p-2 rounded border border-zinc-900 flex flex-col gap-1 text-[5.8px]">
                        <span className="font-extrabold uppercase" style={{ color: hudColor }}>CREATIVE ADOBE CONTROLS:</span>
                        <p className="text-zinc-400 font-normal leading-normal">
                          Repos files via headers. Drag resizing anchors on panels corners. Hotkeys (V, S, L, O, I, Z) switch tools directly. Use the horizontal menu bar at the top or status metrics at the bottom to configure preferences.
                        </p>
                      </div>
                    </div>

                    <div className="bg-zinc-950 py-2 border-t border-zinc-900 px-3 flex items-center justify-center">
                      <button 
                        onClick={() => { playDiagnosticBlip(400, 0.05); setIsHelpModalOpen(false); }}
                        className="text-[6px] font-black tracking-widest px-4 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:brightness-110 rounded cursor-pointer transition select-none text-white focus:outline-none"
                      >
                        CLOSE MANUAL
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ====== SAVANT ALIEN COLOR BRANDING PORTAL ====== */}
            <AnimatePresence>
              {isBrandingPortalOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto select-none">
                  <motion.div 
                    initial={{ scale: 0.93, opacity: 0, y: 15 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.93, opacity: 0, y: 15 }}
                    className="w-[530px] max-w-full bg-[#020306]/98 border rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.99)] font-mono flex flex-col"
                    style={{ borderColor: hudColor, boxShadow: `0 0 40px ${hudColor}15` }}
                  >
                    {/* Header bar */}
                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b bg-zinc-950 border-zinc-900/60 select-none">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 animate-pulse" style={{ color: hudColor }} />
                        <div className="flex flex-col">
                          <span className="text-[7.6px] font-black tracking-[0.15em] text-white">SAVANT_BRAND // COGNITIVE PRESETS MATRIX</span>
                          <span className="text-[4.5px] text-zinc-550 font-bold uppercase tracking-wider font-mono">BIOMEMBRANE CALIBRATION HUB • 20 INTERACTIVE OPTIONS</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => { playDiagnosticBlip(300, 0.05); setIsBrandingPortalOpen(false); }}
                        className="text-zinc-500 hover:text-white transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Presets Grid Layout */}
                    <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[380px] scrollbar-thin">
                      <p className="text-zinc-550 leading-relaxed text-[5.8px] border-b border-zinc-900/60 pb-1.5 uppercase font-bold">
                        Welcome to the Savant design hub. Our civilizations met and integrated are-architecture influence from beautiful alien aesthetics. Hover any membrane below to instantly run a temporary projection; click to commit the link.
                      </p>

                      <div className="grid grid-cols-5 gap-2">
                        {SAVANT_THEME_PRESETS.map((preset) => {
                          const isActive = pilotConfig.hudColor === preset.primary;
                          return (
                            <div
                              key={preset.id}
                              onClick={() => {
                                updatePilotConfig({ 
                                  hudColor: preset.primary,
                                  hudColorName: (['CYAN', 'EMERALD', 'AMBER', 'RUBY'].includes(preset.colorName) ? preset.colorName : 'CYAN') as any
                                });
                                playPassagePulse();
                                addTelemetryLog(`XENO_BRAND: Calibration committed. Preset [${preset.name}] other-accent committed.`);
                              }}
                              onMouseEnter={() => {
                                updatePilotConfig({ hudColor: preset.primary });
                              }}
                              className={`relative p-2 rounded-lg border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between h-[64px] group ${
                                isActive 
                                  ? 'bg-zinc-900 border-zinc-500' 
                                  : 'bg-zinc-950/90 border-zinc-900/80 hover:border-zinc-700/60 hover:bg-zinc-900/40'
                              }`}
                              style={{ 
                                borderColor: isActive ? preset.primary : undefined,
                                boxShadow: isActive ? `0 0 10px ${preset.primary}1a` : undefined 
                              }}
                            >
                              {/* Runic alien glyph badge in corner */}
                              <span 
                                className="absolute top-1 right-1.5 text-[5.5px] font-black tracking-widest opacity-80"
                                style={{ color: preset.primary }}
                              >
                                {preset.alienGlyph}
                              </span>

                              <div>
                                <span className="text-[5.5px] text-zinc-500 font-extrabold block uppercase leading-none group-hover:text-zinc-400">
                                  {preset.id}
                                </span>
                                <span className="text-[6.5px] text-zinc-200 font-black tracking-tight block truncate mt-0.5" style={{ color: isActive ? preset.primary : undefined }}>
                                  {preset.name}
                                </span>
                              </div>

                              {/* Tiny Color Swatch previews */}
                              <div className="flex gap-1 items-center mt-1">
                                <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: preset.primary }} />
                                <span className="w-1.5 h-1.5 rounded-full shrink-0 opacity-40" style={{ backgroundColor: preset.secondary }} />
                                {isActive && (
                                  <span className="text-[4px] font-black uppercase text-zinc-400 ml-auto leading-none">ACTIVE</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Decoded Biosystem details for the active color scheme */}
                      {(() => {
                        const currentPreset = SAVANT_THEME_PRESETS.find(p => p.primary === pilotConfig.hudColor) || SAVANT_THEME_PRESETS[0];
                        return (
                          <div className="mt-2 bg-zinc-950 p-3 rounded-lg border border-zinc-900 flex gap-3.5 items-center">
                            {/* Alien runic seal projection */}
                            <div 
                              className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm select-none shrink-0" 
                              style={{ borderColor: currentPreset.primary, color: currentPreset.primary, boxShadow: `0 0 12px ${currentPreset.primary}15` }}
                            >
                              {currentPreset.alienGlyph}
                            </div>
                            <div className="flex flex-col gap-0.5 leading-normal">
                              <span className="text-[5px] text-zinc-500 font-black uppercase font-mono">CURRENT SECTOR SPECTRAL RESOLUTION:</span>
                              <span className="text-[7.5px] font-black uppercase tracking-wider text-white" style={{ color: currentPreset.primary }}>
                                {currentPreset.name} (GLYPH {currentPreset.alienGlyph}) // INTEGRATED
                              </span>
                              <p className="text-[6.2px] text-zinc-400 font-normal leading-relaxed">
                                {currentPreset.description} Designed with high-performance physical composite materials incorporating subtle non-symmetrical lines and luminescence feedback.
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Footer buttons */}
                    <div className="bg-zinc-950 py-2.5 border-t border-zinc-900/60 px-4 flex items-center justify-between">
                      <div className="flex gap-1.5 items-center text-[5px] text-zinc-500 font-bold uppercase select-none font-mono">
                        <span>CALIBRATOR STATUS: ONLINE</span>
                        <span>•</span>
                        <span>ACCENT_LEVEL: SAVANT MAXIMUM</span>
                      </div>
                      <button 
                        onClick={() => { playDiagnosticBlip(400, 0.05); setIsBrandingPortalOpen(false); }}
                        className="text-[6.2px] font-black tracking-widest px-4 py-1.5 bg-zinc-900 border hover:bg-zinc-800 hover:brightness-110 rounded cursor-pointer transition select-none text-white focus:outline-none uppercase"
                        style={{ color: hudColor, borderColor: hudColor }}
                      >
                        LOCK IN CONFIG
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* ====== TOP SYSTEM NAVIGATION & DISPATCH DECK ====== */}
            <div className="absolute top-[38px] left-1/2 -translate-x-1/2 pointer-events-auto z-40 flex items-center gap-3">
              <div 
                className="bg-[#020306]/95 border px-4 py-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex items-center gap-4 font-mono text-[7px]"
                style={{ 
                  borderColor: `${hudColor}44`,
                  boxShadow: `0 8px 32px rgba(0,0,0,0.95), 0 0 14px ${hudColor}15`
                }}
              >
                {/* Visual LED Heartbeat */}
                <div className="flex items-center gap-1.5 border-r pr-3 border-zinc-800 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
                  <span className="text-zinc-400 font-extrabold uppercase select-none tracking-widest text-[5.8px] mr-1">SYS_ONLINE</span>
                  
                  {/* Additional diagnostic LEDs for cockpit flair */}
                  <div className="flex gap-1 items-center bg-zinc-950 px-1.5 py-0.5 rounded-md border border-zinc-900 leading-none">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_#ef4444]" style={{ animationDuration: '0.9s' }} />
                    <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse shadow-[0_0_4px_#fb923c]" style={{ animationDuration: '1.3s' }} />
                    <span className="w-1 h-1 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_4px_#facc15]" style={{ animationDuration: '0.7s' }} />
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_#34d399]" style={{ animationDuration: '1.5s' }} />
                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_#22d3ee]" style={{ animationDuration: '1.1s' }} />
                  </div>
                </div>

                {/* Lock/Unlock Workplace Toggle Buttons */}
                <div className="flex items-center gap-1.5 matches-desktop">
                  <span className="text-zinc-550 font-bold uppercase select-none text-[5.8px]">WORKSPACE:</span>
                  
                  {/* Adobe-style Workspace layout preset selection dropdown */}
                  <select
                    value={activePreset}
                    onChange={(e) => changeWorkspacePreset(e.target.value)}
                    style={{ 
                      borderColor: `${hudColor}33`,
                      color: hudColor
                    }}
                    className="bg-black/95 text-[6px] px-2 py-0.5 font-mono font-black border uppercase rounded-full hover:bg-zinc-950 cursor-pointer pointer-events-auto outline-none transition-all mr-1"
                  >
                    <option value="Essentials">Essentials (Classic)</option>
                    <option value="Tactical Map-Focus">Tactical (Map Focus)</option>
                    <option value="Alchemic Synthesis">Tactical Weapons (Combat Focus)</option>
                    <option value="Duo-Dock Sidebar">Duo-Dock (Sidebar Icons)</option>
                  </select>

                  <button
                    onClick={() => {
                      playDiagnosticBlip(800, 0.05);
                      setIsLayoutLocked(!isLayoutLocked);
                    }}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer font-black uppercase text-[5.8px] ${
                      isLayoutLocked 
                        ? 'bg-zinc-900 border-amber-500/50 text-amber-500'
                        : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-emerald-400 hover:border-emerald-500/30'
                    }`}
                  >
                    {isLayoutLocked ? <Lock className="w-2 h-2" /> : <Unlock className="w-2 h-2" />}
                    {isLayoutLocked ? 'LOCKED' : 'EDITABLE'}
                  </button>

                  <button
                    onClick={saveWorkspace}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer font-black uppercase text-[5.8px] bg-zinc-950/60 relative text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 ${
                      saveStatus ? 'border-cyan-500/50 text-cyan-400' : 'border-zinc-800'
                    }`}
                  >
                    <Save className="w-2 h-2" />
                    {saveStatus || 'SAVE'}
                  </button>
                </div>

                {/* Panel toggle states */}
                <div className="flex items-center gap-1 border-l pl-3 border-zinc-800">
                  <span className="text-zinc-550 font-bold uppercase select-none text-[5.8px]">PANELS:</span>
                  <button 
                    onClick={() => { playDiagnosticBlip(620, 0.05); setIsNavOpen(!isNavOpen); }}
                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isNavOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
                  >NAV</button>
                  <button 
                    onClick={() => { playDiagnosticBlip(620, 0.05); setIsHelmOpen(!isHelmOpen); }}
                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isHelmOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
                  >HELM</button>
                  <button 
                    onClick={() => { playDiagnosticBlip(620, 0.05); setIsSynthesisOpen(!isSynthesisOpen); }}
                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isSynthesisOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
                  >DECK</button>
                  <button 
                    onClick={() => { playDiagnosticBlip(620, 0.05); setIsRadarOpen(!isRadarOpen); }}
                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isRadarOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
                  >MAP</button>
                </div>

                {/* Integrated Optics Mode Selectors */}
                <div className="flex items-center gap-2 border-l pl-3 border-zinc-800">
                  <span className="text-zinc-550 font-bold uppercase text-[5.8px]">OPTICS_MODEM:</span>
                  <div className="flex gap-1">
                    {[
                      { key: 'STD_OPTIC', label: 'STD' },
                      { key: 'BIO_THERM', label: 'BIOT' },
                      { key: 'ECHO_PULSE', label: 'ECHO' },
                      { key: 'VOID_DRIVE', label: 'VOID' },
                    ].map((opt) => {
                      const active = opticMode === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => {
                            playDiagnosticBlip(600, 0.05);
                            setOpticMode(opt.key as any);
                          }}
                          className={`px-2 py-0.5 rounded text-[5.5px] border cursor-pointer font-extrabold transition-all duration-150 ${
                            active 
                              ? 'bg-zinc-900 text-white font-black border-zinc-700'
                              : 'bg-transparent text-zinc-550 border-transparent hover:text-zinc-300'
                          }`}
                          style={{ color: active ? hudColor : undefined, borderColor: active ? hudColor : undefined }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Atmosphere recon spectral filter selection */}
                <div className="flex items-center gap-2 border-l pl-3 border-zinc-800">
                  <span className="text-zinc-550 font-bold uppercase text-[5.8px]">SPECTRA_FILT:</span>
                  <div className="flex gap-1">
                    {(['NONE', 'LATTICE', 'VOID', 'GHOST', 'MIST'] as const).map((filt) => {
                      const active = filterEffect === filt;
                      return (
                        <button
                          key={filt}
                          onClick={() => {
                            playDiagnosticBlip(550, 0.04);
                            setFilterEffect(filt);
                          }}
                          className={`px-2 py-0.5 rounded text-[5.5px] border cursor-pointer font-extrabold transition-all duration-150 ${
                            active 
                              ? 'bg-zinc-900 text-white font-black border-zinc-700'
                              : 'bg-transparent text-zinc-555 border-transparent hover:text-zinc-200'
                          }`}
                          style={{ color: active ? hudColor : undefined, borderColor: active ? hudColor : undefined }}
                        >
                          {filt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ====== ADOBE SCALABLE VIEWPORT WORKSPACE ====== */}
            <div 
              style={{ 
                transform: `scale(${hudScale})`, 
                transformOrigin: 'top center',
                width: '100%',
                height: '100% '
              }} 
              className="absolute inset-0 pointer-events-none z-20"
            >

            {/* ====== PANEL 1: PILOT NAV-TRACKER (Floating Left Panel) ====== */}
            {isNavOpen && (
              <div className="absolute top-24 left-6 pointer-events-none z-20">
                <motion.div
                  key="hud-panel-nav"
                  id="hud-panel-nav"
                  drag={!isLayoutLocked && !navPinned}
                  dragMomentum={false}
                  onDragStart={() => setActiveDragId('nav')}
                  onDragEnd={(e, info) => {
                    setActiveDragId(null);
                    const cx = panelPositions.nav.x + info.offset.x;
                    const cy = panelPositions.nav.y + info.offset.y;
                    requestAnimationFrame(() => {
                      const snapped = applyMagneticDocking('nav', cx, cy);
                      setPanelPositions(prev => ({
                        ...prev,
                        nav: snapped
                      }));
                    });
                  }}
                  whileDrag={{ scale: 1.02, zIndex: 50 }}
                  className="border rounded-[12px] p-2 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex flex-col gap-1.5 font-mono relative transition-shadow duration-200"
                  style={{ 
                    x: panelPositions.nav.x,
                    y: panelPositions.nav.y,
                    width: panelSizes.nav.w,
                    height: isNavCollapsed ? 'auto' : panelSizes.nav.h,
                    backgroundColor: `rgba(2, 3, 6, ${navOpacity})`,
                    borderColor: navPinned ? '#fb923c' : `${hudColor}40`,
                    boxShadow: navPinned 
                      ? `0 8px 32px rgba(0,0,0,0.95), 0 0 12px rgba(251,146,60,0.2)` 
                      : `0 8px 32px rgba(0,0,0,0.95), 0 0 10px ${hudColor}10`,
                    cursor: (isLayoutLocked || navPinned) ? 'default' : 'grab'
                  }}
                >
                  <CornerBracket position="tl" color={hudColor} />
                  <CornerBracket position="tr" color={hudColor} />
                  <CornerBracket position="bl" color={hudColor} />
                  <CornerBracket position="br" color={hudColor} />
                  
                  {/* Adobe Header: Double-click to collapse/expand! */}
                  <div 
                    onDoubleClick={() => {
                      playDiagnosticBlip(600, 0.05);
                      setIsNavCollapsed(!isNavCollapsed);
                    }}
                    className="flex flex-col gap-1 border-b pb-1 select-none cursor-pointer" 
                    style={{ borderColor: `${hudColor}20` }}
                    title="Double-click header to Collapse/Expand"
                  >
                    <div className="flex items-center justify-between text-[7px] leading-none">
                      <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
                        <Navigation className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
                        Navigator
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Opacity Label & Indicator */}
                        <div className="flex items-center gap-1 text-[5.8px] bg-zinc-950/85 px-1 py-0.5 rounded border border-zinc-900 leading-none">
                          <Layers className="w-2 h-2 text-zinc-500" />
                          <span className="text-zinc-400 font-bold">OPAC:</span>
                          <span style={{ color: hudColor }} className="font-black">{Math.round(navOpacity * 100)}%</span>
                        </div>

                        {/* Indiv Pin Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(navPinned ? 580 : 750, 0.05);
                            setNavPinned(!navPinned);
                          }}
                          className={`p-0.5 rounded transition-all cursor-pointer ${navPinned ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-zinc-550 hover:bg-zinc-900 border border-transparent'}`}
                          title={navPinned ? "Unlock/Unpin Panel" : "Lock/Pin Panel Pos"}
                        >
                          {navPinned ? <Pin className="w-2.5 h-2.5" /> : <PinOff className="w-2.5 h-2.5" />}
                        </button>

                        {/* Minimizer Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(680, 0.05);
                            setIsNavCollapsed(!isNavCollapsed);
                          }}
                          className={`p-0.5 rounded hover:bg-zinc-900 border border-transparent transition-all cursor-pointer text-zinc-500`}
                          title="Minimize/Expand Panel"
                        >
                          <ChevronsUpDown className="w-2.5 h-2.5 text-cyan-500" />
                        </button>

                        {/* Close button icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(400, 0.08);
                            setIsNavOpen(false);
                          }}
                          className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all cursor-pointer flex items-center justify-center"
                          title="Close Panel"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Photoshop-style opacity slider - extremely Adobe CC! */}
                    <div className="flex items-center gap-1.5 mt-0.5 px-0.5">
                      <span className="text-[5px] text-zinc-500 font-bold">ALPHA:</span>
                      <input 
                        type="range"
                        min="0.15"
                        max="1.0"
                        step="0.05"
                        value={navOpacity}
                        onChange={(e) => setNavOpacity(parseFloat(e.target.value))}
                        className="flex-grow h-[3px] rounded-full appearance-none cursor-pointer bg-zinc-800 focus:outline-none"
                        style={{ 
                          accentColor: hudColor,
                          backgroundImage: `linear-gradient(to right, ${hudColor}, #555)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Active Adobe Panel Content: only displayed when collapsed state is FALSE */}
                  {!isNavCollapsed && (
                    <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
                      {/* Workspaces Tab Selection Headers */}
                      <div className="flex bg-zinc-950/80 p-0.5 rounded-md border border-zinc-900/60 items-stretch" style={{ gap: '1px' }}>
                        {[
                          { id: 'NAV' as const, label: 'NAV CORE' },
                          { id: 'LOGS' as const, label: 'LOGS TRACE' },
                          { id: 'THEM' as const, label: 'SPECTRA / THEME' }
                        ].map((tab) => {
                          const active = activeNavTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                playDiagnosticBlip(720, 0.04);
                                setActiveNavTab(tab.id);
                              }}
                              className={`flex-1 text-center py-1 rounded text-[5px] font-black uppercase transition-all duration-150 cursor-pointer ${
                                active 
                                  ? 'bg-zinc-900 text-white font-black border border-zinc-800'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                              style={{ color: active ? hudColor : undefined, borderColor: active ? `${hudColor}30` : undefined }}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* WORKSPACE TAB PANEL 1: NAV SPEED, PROGRESS & RADAR */}
                      {activeNavTab === 'NAV' && (
                        <div className="flex flex-col gap-1.5">
                          {/* Speed & Alt widgets */}
                          <div className="grid grid-cols-2 gap-1.5 mt-0.5">
                            <div className="bg-zinc-950/80 p-1 rounded border border-zinc-900/40 flex flex-col justify-center">
                              <span className="text-[5px] text-zinc-550 font-bold uppercase">VELOCITY</span>
                              <span className="text-[9.5px] font-black text-white" style={{ textShadow: `0 0 4px ${hudColor}33`, color: hudColor }}>
                                {telemetry.velocity} <span className="text-[6px] font-medium text-zinc-500">km/h</span>
                              </span>
                            </div>
                            <div className="bg-zinc-950/80 p-1 rounded border border-zinc-900/40 flex flex-col justify-center relative">
                              <span className="absolute top-1 right-1 flex h-1 w-1">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1 w-1 bg-cyan-500"></span>
                              </span>
                              <span className="text-[5px] text-zinc-550 font-bold uppercase">ALTITUDE</span>
                              <span className="text-[9.5px] font-black text-zinc-300">
                                {telemetry.altitude} <span className="text-[6px] font-medium text-zinc-500">m</span>
                              </span>
                            </div>
                          </div>

                          {/* Gate Transit Progress */}
                          <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-900/40 flex flex-col gap-1">
                            <div className="flex justify-between items-center text-[6px] leading-none">
                              <span className="text-zinc-500 font-extrabold uppercase">PORTAL TRANSIT GATE {telemetry.currentGate}/5</span>
                              <span className="font-bold" style={{ color: hudColor }}>{telemetry.gateProgress}%</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full transition-all duration-300 rounded-full"
                                style={{ width: `${telemetry.gateProgress}%`, backgroundColor: hudColor, boxShadow: `0 0 6px ${hudColor}44` }}
                              />
                            </div>
                          </div>

                          {/* Nested Sweep Radar Sensor */}
                          <div className="flex items-center gap-2 mt-0.5 pt-1.5 border-t border-zinc-900/40 font-mono">
                            <div className="relative w-10 h-10 rounded-full border border-zinc-900/40 bg-zinc-950 p-[1px] flex items-center justify-center shrink-0">
                              <span className="absolute top-[1.2px] text-[4px] uppercase font-bold text-zinc-500 scale-90 leading-none select-none">RADAR</span>
                              <canvas 
                                ref={radarCanvasRef} 
                                width={40} 
                                height={40} 
                                className="w-[38px] h-[38px] rounded-full block"
                              />
                            </div>
                            <div className="flex-1 flex flex-col justify-center text-[6px] leading-tight h-full justify-around font-mono">
                              <span className="text-zinc-400 font-extrabold uppercase text-[5.8px]">SWEEP RADAR SENSOR</span>
                              <span className="text-zinc-650">NEURAL CHRONOS SCAN DISTANCE</span>
                            </div>
                          </div>

                          {/* D3.js Holographic Vector Path Projection */}
                          <div className="mt-1 pt-1.5 border-t border-zinc-900/40">
                            <HolographicVectorProjection 
                              telemetry={telemetry} 
                              hudColor={hudColor} 
                              dragOffset={dragOffset} 
                            />
                          </div>
                        </div>
                      )}

                      {/* WORKSPACE TAB PANEL 2: RAW MISSION SYSTEM LOGS */}
                      {activeNavTab === 'LOGS' && (
                        <div 
                          className="flex flex-col bg-zinc-950/92 rounded border border-zinc-900/70 p-1.5 overflow-hidden relative"
                          style={{ height: Math.max(100, panelSizes.nav.h - 180) }}
                        >
                          <span className="text-[5px] text-zinc-550 font-black tracking-widest uppercase border-b border-zinc-900 pb-1 flex items-center justify-between">
                            <span>TRACE READOUT</span>
                            <span className="animate-pulse text-emerald-400">● LOGGING</span>
                          </span>
                          
                          <div className="flex-grow overflow-y-auto mt-1 flex flex-col gap-0.5 pr-0.5 custom-scrollbar select-text">
                            {telemetryLogs.length === 0 ? (
                              <span className="text-[5.5px] text-zinc-650 italic">Listening for telemetry transmission...</span>
                            ) : (
                              telemetryLogs.map((log, i) => (
                                <div key={i} className="text-[5.5px] font-mono leading-[1.3] text-zinc-400 border-b border-zinc-950 py-0.5 last:border-0 hover:text-white">
                                  {log}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}

                      {/* WORKSPACE TAB PANEL 3: OPTICS AND THEME SELECTOR */}
                      {activeNavTab === 'THEM' && (
                        <div className="flex flex-col gap-2 bg-zinc-950/80 p-1.5 rounded border border-zinc-900/40">
                          {/* Asteroid Alchemic Geology Material Selection */}
                          <div className="flex flex-col gap-0.5 select-none text-[5.5px]">
                            <span className="text-zinc-500 font-bold uppercase">ALCHEMIC CORE GEOLOGY THEME:</span>
                            <select 
                              value={asteroidTheme}
                              onChange={(e) => {
                                playDiagnosticBlip(620, 0.05);
                                setAsteroidTheme(e.target.value as any);
                              }}
                              style={{ 
                                borderColor: `${hudColor}20`,
                                color: hudColor
                              }}
                              className="bg-black text-[6px] p-1 font-mono font-black border uppercase rounded hover:bg-zinc-900 cursor-pointer pointer-events-auto outline-none transition-all"
                            >
                              <option value="GOLD_GUNMETAL">Gold & Gunmetal</option>
                              <option value="CHROME_BLOOD">Chrome & Blood Flare</option>
                              <option value="OBSIDIAN_MOTTLED">Obsidian Mottled</option>
                              <option value="CARBON_VIOLET">Carbon Violet Flare</option>
                              <option value="OPAL_STARDUST">Opal Stardust Nebula</option>
                              <option value="IRON_GREEN">Heavy Iron Green</option>
                              <option value="QUICKSILVER_COPPER">Quicksilver Copper</option>
                            </select>
                          </div>

                          {/* Adobe Swatches Selector Palette */}
                          <div className="flex flex-col gap-1 select-none text-[5.5px]">
                            <span className="text-zinc-550 font-bold uppercase flex items-center justify-between">
                              <span>ADOBE HUD SWATCHES:</span>
                              <span className="text-[4.5px] opacity-60">Eyedropper (I)</span>
                            </span>
                            <div className="grid grid-cols-3 gap-1">
                              {[
                                { name: 'Quantum Cyan', value: '#00f2ff', nameKey: 'CYAN' },
                                { name: 'Bio Emerald', value: '#10b981', nameKey: 'EMERALD' },
                                { name: 'Warning Gold', value: '#f59e0b', nameKey: 'AMBER' },
                                { name: 'Solar Ruby', value: '#ef4444', nameKey: 'RUBY' },
                                { name: 'Fuchsia Wave', value: '#d946ef', nameKey: 'FUCHSIA' },
                                { name: 'Stardust Void', value: '#ffffff', nameKey: 'WHITE' }
                              ].map((sw) => {
                                const active = pilotConfig.hudColor === sw.value;
                                return (
                                  <button
                                    key={sw.nameKey}
                                    onClick={() => {
                                      updatePilotConfig({ hudColorName: sw.nameKey as any, hudColor: sw.value } as any);
                                      addTelemetryLog(`SWATCH: SAMPLER COLOR CHOSEN -> ${sw.name.toUpperCase()}`);
                                      playDiagnosticBlip(750, 0.08);
                                    }}
                                    className={`flex items-center gap-1 p-0.5 rounded border hover:bg-zinc-900 transition text-left cursor-pointer border-transparent ${
                                      active ? 'bg-zinc-900 border' : 'bg-transparent'
                                    }`}
                                    style={{ borderColor: active ? hudColor : 'transparent' }}
                                    title={`Swatches: ${sw.name}`}
                                  >
                                    <span className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm" style={{ backgroundColor: sw.value }} />
                                    <span className="text-[4.8px] truncate text-zinc-400 uppercase font-black" style={{ color: active ? sw.value : undefined }}>
                                      {sw.name.split(' ')[1] || sw.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Optical Filter Types */}
                          <div className="flex flex-col gap-0.5 select-none text-[5.5px]">
                            <span className="text-zinc-500 font-bold uppercase">INTEGRATED OPTICS FILTER:</span>
                            <div className="grid grid-cols-4 gap-0.5">
                              {[
                                { key: 'STD_OPTIC', label: 'STD' },
                                { key: 'BIO_THERM', label: 'THERM' },
                                { key: 'ECHO_PULSE', label: 'ECHO' },
                                { key: 'VOID_DRIVE', label: 'VOID' },
                              ].map((opt) => {
                                const active = opticMode === opt.key;
                                return (
                                  <button
                                    key={opt.key}
                                    onClick={() => {
                                      playDiagnosticBlip(600, 0.05);
                                      setOpticMode(opt.key as any);
                                    }}
                                    className={`py-0.5 rounded text-[5px] border cursor-pointer font-extrabold transition-all duration-150 ${
                                      active 
                                        ? 'bg-zinc-900 text-white font-black border-zinc-700'
                                        : 'bg-transparent text-zinc-550 border-transparent hover:text-zinc-300'
                                    }`}
                                    style={{ color: active ? hudColor : undefined, borderColor: active ? hudColor : undefined }}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Atmosphere Spectra Filter Selection */}
                          <div className="flex flex-col gap-0.5 select-none text-[5.5px]">
                            <span className="text-zinc-550 font-bold uppercase">SPECTRA ATMOSPHERE:</span>
                            <div className="grid grid-cols-5 gap-0.5">
                              {(['NONE', 'LATTICE', 'VOID', 'GHOST', 'MIST'] as const).map((filt) => {
                                const active = filterEffect === filt;
                                return (
                                  <button
                                    key={filt}
                                    onClick={() => {
                                      playDiagnosticBlip(550, 0.04);
                                      setFilterEffect(filt);
                                    }}
                                    className={`py-0.5 rounded text-[4.2px] border cursor-pointer font-extrabold transition-all duration-150 ${
                                      active 
                                        ? 'bg-zinc-900 text-white font-black border-zinc-700'
                                        : 'bg-transparent text-zinc-555 border-transparent hover:text-zinc-200'
                                    }`}
                                    style={{ color: active ? hudColor : undefined, borderColor: active ? hudColor : undefined }}
                                  >
                                    {filt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Adobe Drag-Resize Corner Handle */}
                  {!isNavCollapsed && !isLayoutLocked && (
                    <div 
                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
                      onMouseDown={(mouseDownEvent) => {
                        mouseDownEvent.stopPropagation();
                        mouseDownEvent.preventDefault();
                        const startW = panelSizes.nav.w;
                        const startH = panelSizes.nav.h;
                        const startX = mouseDownEvent.clientX;
                        const startY = mouseDownEvent.clientY;
                        
                        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
                          const deltaX = mouseMoveEvent.clientX - startX;
                          const deltaY = mouseMoveEvent.clientY - startY;
                          setPanelSizes(prev => ({
                            ...prev,
                            nav: {
                              w: Math.max(220, Math.min(600, startW + deltaX)),
                              h: Math.max(160, Math.min(800, startH + deltaY))
                            }
                          }));
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      title="Drag to resize panel (Adobe style)"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
                        <path d="M8,0 L8,8 L0,8 Z" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
                     {/* ====== PANEL 2: HELM FLIGHT CONTROLS (Floating Right Top Panel) ====== */}
            {isHelmOpen && (
              <div className="absolute top-24 right-6 pointer-events-none z-20">
                <motion.div
                  key="hud-panel-helm"
                  id="hud-panel-helm"
                  drag={!isLayoutLocked && !helmPinned}
                  dragMomentum={false}
                  onDragStart={() => setActiveDragId('helm')}
                  onDragEnd={(e, info) => {
                    setActiveDragId(null);
                    const cx = panelPositions.helm.x + info.offset.x;
                    const cy = panelPositions.helm.y + info.offset.y;
                    requestAnimationFrame(() => {
                      const snapped = applyMagneticDocking('helm', cx, cy);
                      setPanelPositions(prev => ({
                        ...prev,
                        helm: snapped
                      }));
                    });
                  }}
                  whileDrag={{ scale: 1.02, zIndex: 50 }}
                  className="border rounded-[12px] p-2 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex flex-col gap-1.5 font-mono relative transition-shadow duration-200"
                  style={{ 
                    x: panelPositions.helm.x,
                    y: panelPositions.helm.y,
                    width: panelSizes.helm.w,
                    height: isHelmCollapsed ? 'auto' : panelSizes.helm.h,
                    backgroundColor: `rgba(2, 3, 6, ${helmOpacity})`,
                    borderColor: helmPinned ? '#fb923c' : `${hudColor}40`,
                    boxShadow: helmPinned 
                      ? `0 8px 32px rgba(0,0,0,0.95), 0 0 12px rgba(251,146,60,0.2)` 
                      : `0 8px 32px rgba(0,0,0,0.95), 0 0 10px ${hudColor}10`,
                    cursor: (isLayoutLocked || helmPinned) ? 'default' : 'grab'
                  }}
                >
                  <CornerBracket position="tl" color={hudColor} />
                  <CornerBracket position="tr" color={hudColor} />
                  <CornerBracket position="bl" color={hudColor} />
                  <CornerBracket position="br" color={hudColor} />

                  {/* Adobe Header: Double-click to collapse/expand! */}
                  <div 
                    onDoubleClick={() => {
                      playDiagnosticBlip(600, 0.05);
                      setIsHelmCollapsed(!isHelmCollapsed);
                    }}
                    className="flex flex-col gap-1 border-b pb-1 select-none cursor-pointer" 
                    style={{ borderColor: `${hudColor}20` }}
                    title="Double-click header to Collapse/Expand"
                  >
                    <div className="flex items-center justify-between text-[7px] leading-none text-zinc-400 font-bold">
                      <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
                        <SlidersHorizontal className="w-2.5 h-2.5 text-cyan-400" />
                        Helm
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Opacity Label & Indicator */}
                        <div className="flex items-center gap-1 text-[5.8px] bg-zinc-950/85 px-1 py-0.5 rounded border border-zinc-900 leading-none">
                          <Layers className="w-2 h-2 text-zinc-500" />
                          <span className="text-zinc-400 font-bold">OPAC:</span>
                          <span style={{ color: hudColor }} className="font-black">{Math.round(helmOpacity * 100)}%</span>
                        </div>

                        {/* Indiv Pin Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(helmPinned ? 580 : 750, 0.05);
                            setHelmPinned(!helmPinned);
                          }}
                          className={`p-0.5 rounded transition-all cursor-pointer ${helmPinned ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-zinc-550 hover:bg-zinc-900 border border-transparent'}`}
                          title={helmPinned ? "Unlock/Unpin Panel" : "Lock/Pin Panel Pos"}
                        >
                          {helmPinned ? <Pin className="w-2.5 h-2.5" /> : <PinOff className="w-2.5 h-2.5" />}
                        </button>

                        {/* Minimizer Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(680, 0.05);
                            setIsHelmCollapsed(!isHelmCollapsed);
                          }}
                          className={`p-0.5 rounded hover:bg-zinc-900 border border-transparent transition-all cursor-pointer text-zinc-500`}
                          title="Minimize/Expand Panel"
                        >
                          <ChevronsUpDown className="w-2.5 h-2.5 text-cyan-500" />
                        </button>

                        {/* Close button icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(400, 0.08);
                            setIsHelmOpen(false);
                          }}
                          className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
                          title="Close Panel"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Photoshop-style opacity slider - extremely Adobe CC! */}
                    <div className="flex items-center gap-1.5 mt-0.5 px-0.5">
                      <span className="text-[5px] text-zinc-500 font-bold">ALPHA:</span>
                      <input 
                        type="range"
                        min="0.15"
                        max="1.0"
                        step="0.05"
                        value={helmOpacity}
                        onChange={(e) => setHelmOpacity(parseFloat(e.target.value))}
                        className="flex-grow h-[3px] rounded-full appearance-none cursor-pointer bg-zinc-800 focus:outline-none"
                        style={{ 
                          accentColor: hudColor,
                          backgroundImage: `linear-gradient(to right, ${hudColor}, #555)`
                        }}
                      />
                    </div>
                  </div>

                  {/* Active Adobe Panel Content: only displayed when collapsed state is FALSE */}
                  {!isHelmCollapsed && (
                    <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
                      {/* Workspaces Tab Selection Headers */}
                      <div className="flex bg-zinc-950/80 p-0.5 rounded-md border border-zinc-900/60 items-stretch" style={{ gap: '1px' }}>
                        {[
                          { id: 'HELM' as const, label: 'FLIGHT SYSTEMS' },
                          { id: 'STEER' as const, label: 'DRIVE / WARP' }
                        ].map((tab) => {
                          const active = activeHelmTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                playDiagnosticBlip(720, 0.04);
                                setActiveHelmTab(tab.id);
                              }}
                              className={`flex-1 text-center py-1 rounded text-[5px] font-black uppercase transition-all duration-150 cursor-pointer ${
                                active 
                                  ? 'bg-zinc-900 text-white font-black border border-zinc-800'
                                  : 'text-zinc-500 hover:text-zinc-300'
                              }`}
                              style={{ color: active ? hudColor : undefined, borderColor: active ? `${hudColor}30` : undefined }}
                            >
                              {tab.label}
                            </button>
                          );
                        })}
                      </div>

                      {/* WORKSPACE TAB PANEL 1: FLIGHT SYSTEMS CONFIG */}
                      {activeHelmTab === 'HELM' && (
                        <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
                          {/* Selected Flight Mode Selector */}
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[5px] text-zinc-500 font-bold uppercase font-mono">NAVIGATION MODE:</span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { key: 'AUTOPILOT', desc: 'A.I. AUTO' },
                                { key: 'CRUISE', desc: 'MANUAL' },
                              ].map((mode) => {
                                const isCurrent = telemetry.flightMode === mode.key;
                                return (
                                  <button
                                    key={mode.key}
                                    onClick={() => {
                                      updateTelemetry({ flightMode: mode.key as any });
                                      playDiagnosticBlip(isCurrent ? 500 : 800, 0.05);
                                    }}
                                    className={`py-1 rounded text-[5.2px] font-black tracking-wider border cursor-pointer uppercase transition-all ${
                                      isCurrent 
                                        ? 'bg-emerald-955/40 text-emerald-400 border-emerald-550/40'
                                        : 'bg-zinc-950/90 text-zinc-500 border-zinc-900 hover:text-zinc-300'
                                    }`}
                                  >
                                    {mode.desc}
                                  </button>
                                );
                              })}
                            </div>
                            {/* Interactive Pilot State Badge details */}
                            <div className="mt-1 text-[4.3px] uppercase font-sans tracking-tight leading-tight select-none">
                              {telemetry.flightMode === 'AUTOPILOT' ? (
                                <div className="text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-1 rounded animate-pulse">
                                  ● PILOT MODE : COGNITIVE RELAY ACTIVE. AUTOMATIC PATH ROUTING ENABLED • RADAR THREAT DETECTOR LINKED
                                </div>
                              ) : (
                                <div className="text-amber-400 bg-amber-950/20 border border-amber-900/30 p-1 rounded">
                                  ⚡ PILOT MODE : MANUAL STEERING DEPLOYED. JOSTICK ON-SCREEN STICK WELL ACTIVE • KEYBOARD W-A-S-D LOCKED IN
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Thruster Sensitivity Slider */}
                          <div className="flex flex-col bg-zinc-950/80 p-1 rounded border border-zinc-900/40 gap-0.5 mt-0.5">
                            <div className="flex justify-between items-center text-[5.2px]">
                              <span className="text-zinc-500 font-bold uppercase">THRUSTER SENSITIVITY:</span>
                              <span style={{ color: hudColor }} className="font-extrabold">{telemetry.thrusterSensitivity.toFixed(1)}x</span>
                            </div>
                            <input 
                              type="range"
                              min="0.2"
                              max="3.0"
                              step="0.1"
                              value={telemetry.thrusterSensitivity}
                              onChange={(e) => {
                                updateTelemetry({ thrusterSensitivity: parseFloat(e.target.value) });
                              }}
                              className="w-full h-1 rounded bg-zinc-800 appearance-none cursor-pointer focus:outline-none"
                              style={{ 
                                accentColor: hudColor
                              }}
                            />
                          </div>

                          {/* Shield Capacity Widget */}
                          <div className="flex flex-col gap-1 bg-zinc-950/85 p-1.5 rounded border border-zinc-900/40">
                            <div className="flex justify-between items-center text-[5.8px]">
                              <span className="text-zinc-500 font-bold uppercase">ATMOSPHERIC PLASMA SHIELDS:</span>
                              <span className="font-black text-amber-400">{Math.round(telemetry.shieldCap)}%</span>
                            </div>
                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
                              <div 
                                className="h-full transition-all duration-300 rounded-full"
                                style={{ 
                                  width: `${telemetry.shieldCap}%`,
                                  backgroundColor: telemetry.shieldCap > 30 ? '#10b981' : '#f43f5e',
                                  boxShadow: `0 0 6px ${telemetry.shieldCap > 30 ? '#10b981' : '#f43f5e'}44`
                                }}
                              />
                            </div>
                          </div>

                          {/* Sector Stability Row */}
                          <div className="flex justify-between items-center bg-zinc-950/70 p-1 rounded border border-zinc-900/40 text-[5px] font-extrabold text-zinc-500 uppercase leading-none mt-0.5">
                            <span>SECTOR STABILITY</span>
                            <span className="text-emerald-400 font-extrabold">SECURE [100%]</span>
                          </div>
                        </div>
                      )}

                      {/* WORKSPACE TAB PANEL 2: COMPASS / STEER & PORTAL WARP CONTROLS */}
                      {activeHelmTab === 'STEER' && (
                        <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
                          
                          {/* Draggable Analog Joystick Pad */}
                          <div className="flex flex-col items-center justify-center p-2 relative bg-zinc-950/65 rounded-[10px] border border-zinc-900/40 gap-1 select-none">
                            <div className="absolute top-1 left-2 text-[4.5px] text-zinc-500 font-black uppercase tracking-wider">HOLO-DRIFT STICK</div>
                            <div className="absolute top-1 right-2 text-[4.5px] text-zinc-555 font-bold uppercase font-mono">{isDragging ? "ENGAGED" : "CENTER_PIN"}</div>
                            
                            {/* Interactive Joystick Well */}
                            <div 
                              className="relative w-20 h-20 rounded-full border border-dashed flex items-center justify-center cursor-crosshair select-none overflow-hidden touch-none"
                              style={{ 
                                borderColor: `${hudColor}33`, 
                                backgroundColor: isDragging ? `${hudColor}0a` : 'rgba(2, 3, 6, 0.45)',
                                boxShadow: isDragging ? `inset 0 0 10px ${hudColor}1a` : 'none' 
                              }}
                              onPointerDown={(e) => {
                                setIsDragging(true);
                                playDiagnosticBlip(480, 0.05);
                                const rect = e.currentTarget.getBoundingClientRect();
                                const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                                const dx = Math.min(35, Math.max(-35, e.clientX - center.x));
                                const dy = Math.min(35, Math.max(-35, e.clientY - center.y));
                                setDragOffset({ x: dx, y: dy });
                                e.currentTarget.setPointerCapture(e.pointerId);
                              }}
                              onPointerMove={(e) => {
                                if (!isDragging) return;
                                const rect = e.currentTarget.getBoundingClientRect();
                                const center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
                                const dx = Math.min(35, Math.max(-35, e.clientX - center.x));
                                const dy = Math.min(35, Math.max(-35, e.clientY - center.y));
                                setDragOffset({ x: dx, y: dy });
                              }}
                              onPointerUp={(e) => {
                                setIsDragging(false);
                                setDragOffset({ x: 0, y: 0 });
                                e.currentTarget.releasePointerCapture(e.pointerId);
                                playDiagnosticBlip(320, 0.05);
                              }}
                            >
                              {/* Glowing vector axis grid lines */}
                              <div className="absolute inset-x-0 h-[1px] border-t border-dotted opacity-20" style={{ borderColor: hudColor }} />
                              <div className="absolute inset-y-0 w-[1px] border-l border-dotted opacity-20" style={{ borderColor: hudColor }} />
                              
                              {/* Center anchor guide rings */}
                              <div className="absolute w-12 h-12 rounded-full border border-dotted opacity-10" style={{ borderColor: hudColor }} />
                              <div className="absolute w-6 h-6 rounded-full border border-dotted opacity-15" style={{ borderColor: hudColor }} />
                              
                              {/* Vector line trailing pointer */}
                              {isDragging && (
                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                  <line 
                                    x1="40" 
                                    y1="40" 
                                    x2={40 + dragOffset.x} 
                                    y2={40 + dragOffset.y} 
                                    stroke={hudColor} 
                                    strokeWidth="1.2" 
                                    opacity="0.85" 
                                    strokeDasharray="2 1"
                                  />
                                </svg>
                              )}

                              {/* Draggable knob indicator */}
                              <motion.div 
                                className="absolute w-6 h-6 rounded-full flex items-center justify-center border shadow-xl cursor-default"
                                style={{ 
                                  x: dragOffset.x,
                                  y: dragOffset.y,
                                  backgroundColor: isDragging ? hudColor : '#07090d',
                                  borderColor: hudColor,
                                  boxShadow: isDragging ? `0 0 12px ${hudColor}` : `0 2px 8px rgba(0,0,0,0.5)`,
                                  color: isDragging ? '#000' : hudColor,
                                }}
                                transition={isDragging ? { duration: 0 } : { type: "spring", stiffness: 350, damping: 25 }}
                              >
                                <span className="text-[6px] font-black pointer-events-none select-none">𐎟</span>
                              </motion.div>
                            </div>

                            {/* Tactile nudge controls for precise steering tweaks */}
                            <div className="flex gap-1.5 mt-0.5 select-none text-[5px] font-extrabold text-zinc-550 items-center font-mono">
                              <span>THR_X: <span style={{ color: Math.abs(dragOffset.x) > 1 ? hudColor : undefined }}>{((dragOffset.x / 35) * 100).toFixed(0)}%</span></span>
                              <span className="opacity-30">•</span>
                              <span>THR_Y: <span style={{ color: Math.abs(dragOffset.y) > 1 ? hudColor : undefined }}>{(-(dragOffset.y / 35) * 100).toFixed(0)}%</span></span>
                            </div>
                          </div>

                          {/* Drive Injector Power Core buttons */}
                          <div className="flex gap-1 border-t border-zinc-900 pt-1">
                            {telemetry.gateProgress === 100 ? (
                              <button
                                onClick={handlePassgatePortal}
                                style={{ backgroundColor: hudColor, boxShadow: `0 0 6px ${hudColor}55` }}
                                className="flex-grow py-1 px-1 text-black font-extrabold text-[#020306] text-center text-[7px] rounded-md cursor-pointer uppercase transition-all animate-pulse"
                              >
                                JUMP TRANSIT
                              </button>
                            ) : (
                              <div className="flex flex-col gap-1 flex-grow">
                                <span className="text-[5px] text-zinc-500 font-black uppercase tracking-wider text-center leading-none">WARP INJECTOR POWER</span>
                                <div className="flex gap-1 justify-stretch w-full">
                                  <button
                                    onClick={() => handleThrottleBoost('low')}
                                    disabled={isWarpingActive || warpEnergy.low < 100}
                                    className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 text-[5.8px] font-bold text-center rounded bg-[#102d1a] border border-[#1b5e34]/50 text-[#4af28b] cursor-pointer transition-all active:scale-95 ${
                                      isWarpingActive || warpEnergy.low < 100 ? 'opacity-25 cursor-not-allowed active:scale-100' : 'hover:bg-[#184628]'
                                    }`}
                                  >
                                    <span>LOW</span>
                                    <span className="text-[4.2px] font-bold opacity-80">{Math.floor(warpEnergy.low)}%</span>
                                  </button>
                                  <button
                                    onClick={() => handleThrottleBoost('med')}
                                    disabled={isWarpingActive || warpEnergy.med < 100}
                                    className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 text-[5.8px] font-bold text-center rounded bg-[#2e1c0c] border border-[#523314]/50 text-[#ffa23a] cursor-pointer transition-all active:scale-95 ${
                                      isWarpingActive || warpEnergy.med < 100 ? 'opacity-25 cursor-not-allowed active:scale-100' : 'hover:bg-[#422812]'
                                    }`}
                                  >
                                    <span>MED</span>
                                    <span className="text-[4.2px] font-bold opacity-80">{Math.floor(warpEnergy.med)}%</span>
                                  </button>
                                  <button
                                    onClick={() => handleThrottleBoost('high')}
                                    disabled={isWarpingActive || warpEnergy.high < 100}
                                    className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 text-[5.8px] font-bold text-center rounded bg-[#330f12] border border-[#591b20]/50 text-[#ff5f65] cursor-pointer transition-all active:scale-95 ${
                                      isWarpingActive || warpEnergy.high < 100 ? 'opacity-25 cursor-not-allowed active:scale-100' : 'hover:bg-[#4c161a]'
                                    }`}
                                  >
                                    <span>HI</span>
                                    <span className="text-[4.2px] font-bold opacity-80">{Math.floor(warpEnergy.high)}%</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Adobe Drag-Resize Corner Handle */}
                  {!isHelmCollapsed && !isLayoutLocked && (
                    <div 
                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
                      onMouseDown={(mouseDownEvent) => {
                        mouseDownEvent.stopPropagation();
                        mouseDownEvent.preventDefault();
                        const startW = panelSizes.helm.w;
                        const startH = panelSizes.helm.h;
                        const startX = mouseDownEvent.clientX;
                        const startY = mouseDownEvent.clientY;
                        
                        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
                          const deltaX = mouseMoveEvent.clientX - startX;
                          const deltaY = mouseMoveEvent.clientY - startY;
                          setPanelSizes(prev => ({
                            ...prev,
                            helm: {
                              w: Math.max(220, Math.min(600, startW + deltaX)),
                              h: Math.max(160, Math.min(800, startH + deltaY))
                            }
                          }));
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      title="Drag to resize panel (Adobe style)"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
                        <path d="M8,0 L8,8 L0,8 Z" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* ====== PANEL 4: INTERACTIVE ASTRO-RADAR MAP (Floating Left Bottom Panel) ====== */}
            {isRadarOpen && (
              <div className="absolute top-[380px] left-6 pointer-events-none z-20">
                <motion.div
                  key="hud-panel-radar"
                  id="hud-panel-radar"
                  drag={!isLayoutLocked && !radarPinned}
                  dragMomentum={false}
                  onDragStart={() => setActiveDragId('radar')}
                  onDragEnd={(e, info) => {
                    setActiveDragId(null);
                    const cx = panelPositions.radar.x + info.offset.x;
                    const cy = panelPositions.radar.y + info.offset.y;
                    requestAnimationFrame(() => {
                      const snapped = applyMagneticDocking('radar', cx, cy);
                      setPanelPositions(prev => ({
                        ...prev,
                        radar: snapped
                      }));
                    });
                  }}
                  whileDrag={{ scale: 1.02, zIndex: 50 }}
                  className="border rounded-[12px] p-2 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex flex-col gap-1.5 font-mono relative transition-shadow duration-200"
                  style={{ 
                    x: panelPositions.radar.x,
                    y: panelPositions.radar.y,
                    width: panelSizes.radar.w,
                    height: isRadarCollapsed ? 'auto' : panelSizes.radar.h,
                    backgroundColor: `rgba(2, 3, 6, ${radarOpacity})`,
                    borderColor: radarPinned ? '#fb923c' : `${hudColor}40`,
                    boxShadow: radarPinned 
                      ? `0 8px 32px rgba(0,0,0,0.95), 0 0 12px rgba(251,146,60,0.2)` 
                      : `0 8px 32px rgba(0,0,0,0.95), 0 0 10px ${hudColor}10`,
                    cursor: (isLayoutLocked || radarPinned) ? 'default' : 'grab'
                  }}
                >
                  <CornerBracket position="tl" color={hudColor} />
                  <CornerBracket position="tr" color={hudColor} />
                  <CornerBracket position="bl" color={hudColor} />
                  <CornerBracket position="br" color={hudColor} />
                  
                  {/* Adobe Header: Double-click to collapse/expand! */}
                  <div 
                    onDoubleClick={() => {
                      playDiagnosticBlip(600, 0.05);
                      setIsRadarCollapsed(!isRadarCollapsed);
                    }}
                    className="flex flex-col gap-1 border-b pb-1 select-none cursor-pointer" 
                    style={{ borderColor: `${hudColor}20` }}
                    title="Double-click header to Collapse/Expand"
                  >
                    <div className="flex items-center justify-between text-[7px] leading-none">
                      <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
                        <Compass className="w-2.5 h-2.5 animate-spin text-cyan-400" />
                        Radar
                      </span>
                      
                      <div className="flex items-center gap-1.5">
                        {/* Opacity slider label */}
                        <div className="flex items-center gap-1 text-[5.8px] bg-zinc-950/85 px-1 py-0.5 rounded border border-zinc-900 leading-none">
                          <Layers className="w-2 h-2 text-zinc-500" />
                          <span className="text-zinc-400 font-bold">OPAC:</span>
                          <span style={{ color: hudColor }} className="font-black">{Math.round(radarOpacity * 100)}%</span>
                        </div>

                        {/* Indiv Pin Toggle */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(radarPinned ? 580 : 750, 0.05);
                            setRadarPinned(!radarPinned);
                          }}
                          className={`p-0.5 rounded transition-all cursor-pointer ${radarPinned ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-zinc-550 hover:bg-zinc-900 border border-transparent'}`}
                          title={radarPinned ? "Unlock/Unpin Panel" : "Lock/Pin Panel Pos"}
                        >
                          {radarPinned ? <Pin className="w-2.5 h-2.5 text-amber-500" /> : <PinOff className="w-2.5 h-2.5" />}
                        </button>

                        {/* Minimizer Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(680, 0.05);
                            setIsRadarCollapsed(!isRadarCollapsed);
                          }}
                          className={`p-0.5 rounded hover:bg-zinc-900 border border-transparent transition-all cursor-pointer text-zinc-500`}
                          title="Minimize/Expand Panel"
                        >
                          <ChevronsUpDown className="w-2.5 h-2.5 text-[#00f2ff]" style={{ color: hudColor }} />
                        </button>

                        {/* Close button icon */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playDiagnosticBlip(440, 0.08);
                            setIsRadarOpen(false);
                          }}
                          className="p-0.5 rounded text-zinc-650 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all cursor-pointer"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Compact alpha opacity slider slider inline */}
                    <div className="flex items-center gap-1.5 mt-1 select-none pointer-events-auto" onClick={e => e.stopPropagation()}>
                      <span className="text-[5px] text-zinc-550 uppercase">HUD_MATT_ALPHA:</span>
                      <input 
                        type="range" 
                        min="0.25" 
                        max="0.98" 
                        step="0.01" 
                        value={radarOpacity} 
                        onChange={(ev) => setRadarOpacity(parseFloat(ev.target.value))}
                        className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
                        style={{ accentColor: hudColor }}
                      />
                    </div>
                  </div>

                  {/* Body Content */}
                  {!isRadarCollapsed && (
                    <div className="flex flex-col gap-1.5 mt-1">
                      <AstroRadarMap 
                        telemetry={telemetry} 
                        pilotConfig={pilotConfig} 
                        onDestroy={() => setIsRadarOpen(false)} 
                        playDiagnosticBlip={playDiagnosticBlip} 
                        updateTelemetry={updateTelemetry}
                      />
                    </div>
                  )}

                  {/* Adobe Drag-Resize Corner Handle */}
                  {!isRadarCollapsed && !isLayoutLocked && (
                    <div 
                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
                      onMouseDown={(mouseDownEvent) => {
                        mouseDownEvent.stopPropagation();
                        mouseDownEvent.preventDefault();
                        const startW = panelSizes.radar.w;
                        const startH = panelSizes.radar.h;
                        const startX = mouseDownEvent.clientX;
                        const startY = mouseDownEvent.clientY;
                        
                        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
                          const deltaX = mouseMoveEvent.clientX - startX;
                          const deltaY = mouseMoveEvent.clientY - startY;
                          setPanelSizes(prev => ({
                            ...prev,
                            radar: {
                              w: Math.max(220, Math.min(600, startW + deltaX)),
                              h: Math.max(160, Math.min(800, startH + deltaY))
                            }
                          }));
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      title="Drag to resize panel (Adobe style)"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
                        <path d="M8,0 L8,8 L0,8 Z" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            {/* ====== CENTRAL-BOTTOM COCKPIT DOCK: GEOLOGICAL ALCHEMIC SYNTHESIS DECK ====== */}
            {isSynthesisOpen && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-30">
                <motion.div
                  key="hud-bottom-center-materials"
                  id="hud-panel-synthesis"
                  drag={!isLayoutLocked}
                  dragMomentum={false}
                  onDragStart={() => setActiveDragId('synthesis')}
                  onDragEnd={(e, info) => {
                    setActiveDragId(null);
                    const cx = panelPositions.synthesis.x + info.offset.x;
                    const cy = panelPositions.synthesis.y + info.offset.y;
                    requestAnimationFrame(() => {
                      const snapped = applyMagneticDocking('synthesis', cx, cy);
                      setPanelPositions(prev => ({
                        ...prev,
                        synthesis: snapped
                      }));
                    });
                  }}
                  whileDrag={{ scale: 1.01, zIndex: 40 }}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 100, opacity: 0 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
                  className="bg-[#020306]/92 border rounded-t-[18px] rounded-b-[10px] p-2.5 pointer-events-auto shadow-[0_12px_45px_rgba(0,0,0,0.98)] flex flex-col gap-1.5 font-mono cursor-grab active:cursor-grabbing"
                  style={{
                    x: panelPositions.synthesis.x,
                    y: panelPositions.synthesis.y,
                    width: panelSizes.synthesis.w,
                    height: isSynthesisCollapsed ? 'auto' : panelSizes.synthesis.h,
                    borderColor: `${hudColor}38`,
                    boxShadow: `0 12px 45px rgba(0,0,0,0.98), 0 0 16px ${hudColor}15`
                  }}
                >
                  <CornerBracket position="tl" color={hudColor} />
                  <CornerBracket position="tr" color={hudColor} />
                  <CornerBracket position="bl" color={hudColor} />
                  <CornerBracket position="br" color={hudColor} />

                  <div className="flex items-center justify-between border-b pb-1 text-[7.5px] leading-none text-zinc-400" style={{ borderColor: `${hudColor}20` }}>
                    <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
                      <Target className="w-2.5 h-2.5 animate-pulse text-red-500" />
                      Weapons Matrix System <span className="text-[5.5px] font-normal opacity-60 tracking-normal select-none font-sans">({isLayoutLocked ? "LOCKED" : "DRAGGABLE"})</span>
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500 font-extrabold text-[7px]" style={{ color: `${hudColor}bb` }}>Active Combat Mode</span>
                      
                      {/* Close Panel Button */}
                      <button
                        onClick={() => {
                          playDiagnosticBlip(400, 0.08);
                          setIsSynthesisOpen(false);
                        }}
                        className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all cursor-pointer pointer-events-auto flex items-center justify-center"
                        title="Close Panel"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>

                  {/* Weapon Specs List definition */}
                  {(() => {
                    const weaponsList = [
                      {
                        id: 'CHROME_BLOOD',
                        label: 'W-01 Plasma',
                        sub: 'INFERNO FLARE',
                        accent: '#ff2d2d',
                        glow: 'rgba(255, 45, 45, 0.4)',
                        caliber: '55.0 GJ/Ion',
                        discharge: 'THERMO-KINETIC',
                      },
                      {
                        id: 'GOLD_GUNMETAL',
                        label: 'W-02 Railgun',
                        sub: 'KINETIC SLUG',
                        accent: '#f59e0b',
                        glow: 'rgba(245, 158, 11, 0.4)',
                        caliber: '120.0 MJ/Slg',
                        discharge: 'SOLID MAG-ACC',
                      },
                      {
                        id: 'OBSIDIAN_MOTTLED',
                        label: 'W-03 Void Ray',
                        sub: 'VOID SINGULAR',
                        accent: '#00f2ff',
                        glow: 'rgba(0, 242, 255, 0.4)',
                        caliber: '99.0 PQ/Tch',
                        discharge: 'ANTI-MASS DECAY',
                      },
                      {
                        id: 'CARBON_VIOLET',
                        label: 'W-04 Laser',
                        sub: 'NEON THERMAL',
                        accent: '#d946ef',
                        glow: 'rgba(217, 70, 239, 0.4)',
                        caliber: '41.5 THz/Bm',
                        discharge: 'HIGH ENERGY BEAM',
                      },
                      {
                        id: 'OPAL_STARDUST',
                        label: 'W-05 Cryo Ray',
                        sub: 'STARDUST CHILL',
                        accent: '#fdba74',
                        glow: 'rgba(253, 186, 116, 0.4)',
                        caliber: '18.2 mK/Ray',
                        discharge: 'THERMO-KINETIC',
                      },
                      {
                        id: 'IRON_GREEN',
                        label: 'W-06 Fission',
                        sub: 'GAMMA FLOUNCE',
                        accent: '#22c55e',
                        glow: 'rgba(34, 197, 94, 0.4)',
                        caliber: '880.0 KeV/Pls',
                        discharge: 'NUCLEAR FISSION',
                      },
                      {
                        id: 'QUICKSILVER_COPPER',
                        label: 'W-07 Fusion',
                        sub: 'SEEKER MISSILE',
                        accent: '#f97316',
                        glow: 'rgba(249, 115, 22, 0.4)',
                        caliber: '250.0 ST/Seek',
                        discharge: 'SEEKING HEAT ORB',
                      },
                    ];

                    const activeWeaponObj = weaponsList.find(w => w.id === asteroidTheme) || weaponsList[1];

                    return (
                      <div className="flex gap-2.5 h-[56px] items-stretch">
                        {/* Left part: 7 weapons button selectors */}
                        <div className="grid grid-cols-7 gap-1 flex-1">
                          {weaponsList.map((mat, idx) => {
                            const active = asteroidTheme === mat.id;
                            return (
                              <button
                                key={mat.id}
                                onClick={() => {
                                  playDiagnosticBlip(450 + idx * 40, 0.08);
                                  setAsteroidTheme(mat.id as any);
                                }}
                                className={`relative flex flex-col items-center justify-between text-center p-1 h-full rounded-lg border transition-all duration-300 cursor-pointer ${
                                  active
                                    ? 'bg-zinc-950/90'
                                    : 'bg-zinc-950/20 hover:bg-zinc-900/60 border-zinc-900 hover:border-zinc-700'
                                }`}
                                style={{
                                  borderColor: active ? mat.accent : undefined,
                                  boxShadow: active ? `0 0 10px ${mat.glow}` : undefined,
                                }}
                              >
                                <span 
                                  className="text-[6.5px] font-black uppercase tracking-tight"
                                  style={{ color: active ? '#ffffff' : '#a1a1aa' }}
                                >
                                  {mat.label.split(' ')[0]}
                                </span>
                                
                                {/* Active indicator bar */}
                                <div 
                                  className="w-5 h-[1.5px] rounded-full my-0.5"
                                  style={{ backgroundColor: active ? mat.accent : '#27272a' }}
                                />
                                
                                <span 
                                  className="text-[5.5px] font-bold tracking-tighter uppercase opacity-80"
                                  style={{ color: active ? mat.accent : '#52525b' }}
                                >
                                  {mat.label.split(' ').slice(1).join(' ')}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Right part: combat read-out and fire action trigger */}
                        <div className="flex items-center gap-2 border-l pl-3 border-zinc-900 h-full" style={{ borderColor: `${hudColor}20` }}>
                          <div className="flex flex-col text-left gap-0.5 font-mono w-[115px] leading-none text-[5.8px]">
                            <div className="text-zinc-500 uppercase tracking-tighter">SPEC OUT: <span className="font-bold text-zinc-300">CORE DECK</span></div>
                            <div className="whitespace-nowrap overflow-hidden text-ellipsis text-zinc-400">AMMO: <span className="font-extrabold uppercase" style={{ color: activeWeaponObj.accent }}>{activeWeaponObj.sub}</span></div>
                            <div className="text-zinc-400">CALIBER: <span className="text-zinc-300 font-extrabold">{activeWeaponObj.caliber}</span></div>
                            <div className="text-zinc-400 text-[5.2px] leading-tight select-none text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis">{activeWeaponObj.discharge}</div>
                          </div>

                          <button
                            onClick={() => {
                              playDiagnosticBlip(820, 0.05);
                              window.dispatchEvent(new CustomEvent('ship-fire-weapon', { detail: { weaponType: asteroidTheme } }));
                            }}
                            className="relative overflow-hidden px-2.5 py-1.5 h-[34px] w-[82px] rounded-md border font-black text-[6.8px] tracking-[0.12em] uppercase cursor-pointer select-none transition-all duration-200 hover:brightness-110 active:scale-95 text-white"
                            style={{
                              borderColor: activeWeaponObj.accent,
                              backgroundColor: `${activeWeaponObj.accent}18`,
                              boxShadow: `0 0 12px ${activeWeaponObj.accent}15`
                            }}
                            title="Click here, press Spacebar, or click viewport to fire ammunition!"
                          >
                            <span>FIRE_WEAP</span>
                            <div className="absolute bottom-0 left-0 h-[2px] w-full animate-pulse" style={{ backgroundColor: activeWeaponObj.accent }} />
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Adobe Drag-Resize Corner Handle */}
                  {!isSynthesisCollapsed && !isLayoutLocked && (
                    <div 
                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
                      onMouseDown={(mouseDownEvent) => {
                        mouseDownEvent.stopPropagation();
                        mouseDownEvent.preventDefault();
                        const startW = panelSizes.synthesis.w;
                        const startH = panelSizes.synthesis.h;
                        const startX = mouseDownEvent.clientX;
                        const startY = mouseDownEvent.clientY;
                        
                        const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
                          const deltaX = mouseMoveEvent.clientX - startX;
                          const deltaY = mouseMoveEvent.clientY - startY;
                          setPanelSizes(prev => ({
                            ...prev,
                            synthesis: {
                              w: Math.max(300, Math.min(1000, startW + deltaX)),
                              h: Math.max(120, Math.min(500, startH + deltaY))
                            }
                          }));
                        };
                        
                        const handleMouseUp = () => {
                          document.removeEventListener('mousemove', handleMouseMove);
                          document.removeEventListener('mouseup', handleMouseUp);
                        };
                        document.addEventListener('mousemove', handleMouseMove);
                        document.addEventListener('mouseup', handleMouseUp);
                      }}
                      title="Drag to resize panel (Adobe style)"
                    >
                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
                        <path d="M8,0 L8,8 L0,8 Z" />
                      </svg>
                    </div>
                  )}
                </motion.div>
              </div>
            )}

            </div> {/* CLOSE ADOBE SCALABLE VIEWPORT WORKSPACE CHASSIS */}

            {/* Core center-screen tactical flight aiming scope */}
            <TacticalCrosshair 
              color={hudColor} 
              telemetry={telemetry} 
              alignmentScore={alignmentScore} 
              coreTemp={coreTemp} 
              filterEffect={filterEffect} 
            />

            {/* ====== ADOBE-STYLE STATUS BAR ====== */}
            <div 
              style={{ borderTopColor: `${hudColor}20` }}
              className="absolute bottom-0 left-0 right-0 h-[24px] bg-[#020306]/98 border-t border-zinc-900 pointer-events-auto z-50 flex items-center justify-between px-3 select-none text-[8px] font-mono font-black"
            >
              {/* Left element: Mouse tracker & Tool Info */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-zinc-550">
                  <MousePointer className="w-2.5 h-2.5" />
                  <span>X: <span style={{ color: hudColor }}>{mousePos.x}px</span> Y: <span style={{ color: hudColor }}>{mousePos.y}px</span></span>
                </div>
                <span className="text-zinc-800">|</span>
                <div className="flex items-center gap-1.5 font-extrabold uppercase" style={{ color: hudColor }}>
                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                  <span>ACTIVE_TOOL: {activeTool}</span>
                </div>
              </div>

              {/* Center status message */}
              <div 
                style={{ color: isVentingActive ? '#f59e0b' : `${hudColor}df` }}
                className="hidden md:flex items-center gap-1.5 font-extrabold tracking-wider transition-colors duration-350"
              >
                {isVentingActive ? (
                  <>
                    <AlertTriangle className="w-2.5 h-2.5 text-amber-500 animate-bounce" />
                    <span>⚠️ HEAT EXCHANGER DISCHARGING CLUMPED THERMAL EXHAUSTS</span>
                  </>
                ) : (
                  <span>✓ SYSTEM CONFIGURATION SYNCHRONOUS // GEOMETRIC OVERLAYS VALIDATED</span>
                )}
              </div>

              {/* Right element: Scale selector, snapping, grid */}
              <div className="flex items-center gap-3 text-zinc-550">
                <button 
                  onClick={() => { setIsGridVisible(!isGridVisible); playDiagnosticBlip(750, 0.08); }}
                  className={`hover:text-white transition uppercase text-[7px] cursor-pointer ${isGridVisible ? 'text-zinc-200' : ''}`}
                >
                  GRID: {isGridVisible ? 'ON' : 'OFF'}
                </button>
                <span className="text-zinc-800">|</span>
                <button 
                  onClick={() => { setIsSnappingEnabled(!isSnappingEnabled); playDiagnosticBlip(600, 0.05); }}
                  className={`hover:text-white transition uppercase text-[7px] cursor-pointer ${isSnappingEnabled ? 'text-zinc-200' : ''}`}
                >
                  SNAP: {isSnappingEnabled ? 'ON' : 'OFF'}
                </button>
                <span className="text-zinc-800">|</span>
                <span className="font-extrabold uppercase">ZOOM: {Math.round(hudScale * 100)}%</span>
              </div>
            </div>

          </>
        )}
      </AnimatePresence>

    </div>
  );
};
