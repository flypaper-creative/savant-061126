import React, { useEffect, useState } from 'react';
import { useAppState } from '../contexts/AppStateContext';

export const CRTOverlay: React.FC = () => {
  const { phase, asteroidTheme, screenShake } = useAppState();
  const [flicker, setFlicker] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  // Classy analog vacuum-tube power fluctuating sags & screen glitches linked to physical hull impacts
  useEffect(() => {
    if (screenShake > 1.5) {
      setGlitchActive(true);
      setFlicker(true);
      const t1 = setTimeout(() => {
        setGlitchActive(false);
        setFlicker(false);
      }, 150 + Math.random() * 150);
      return () => clearTimeout(t1);
    }
  }, [screenShake]);

  // Occasional random solar radiation interference (ambient electrical noise sweeps)
  useEffect(() => {
    const triggerAmbientStatic = () => {
      setFlicker(true);
      setTimeout(() => setFlicker(false), 60 + Math.random() * 80);
    };

    const interval = setInterval(() => {
      if (Math.random() < 0.08) {
        triggerAmbientStatic();
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Determine button-specific overlay color, tint, and visual patterns
  const getThemeOverlayClass = () => {
    switch (asteroidTheme) {
      case 'CHROME_BLOOD':
        return {
          tint: 'bg-red-950/15',
          glowColor: 'rgba(239, 68, 68, 0.35)',
          scanlineColor: 'rgba(255, 10, 10, 0.16)',
          chromaticShift: 'text-shadow-red',
          borderDecoration: 'border-red-950/60',
          title: 'CHROME BLOOD RECON SCANNET',
          effectStyle: 'mix-blend-color-dodge opacity-85',
        };
      case 'GOLD_GUNMETAL':
        return {
          tint: 'bg-amber-950/12',
          glowColor: 'rgba(245, 158, 11, 0.30)',
          scanlineColor: 'rgba(245, 158, 11, 0.14)',
          chromaticShift: 'text-shadow-gold',
          borderDecoration: 'border-amber-950/60',
          title: 'GOLD GUNMETAL CALIBRATION STREAM',
          effectStyle: 'mix-blend-overlay opacity-90',
        };
      case 'OBSIDIAN_MOTTLED':
        return {
          tint: 'bg-cyan-950/15',
          glowColor: 'rgba(6, 182, 212, 0.32)',
          scanlineColor: 'rgba(0, 242, 255, 0.15)',
          chromaticShift: 'text-shadow-cyan',
          borderDecoration: 'border-cyan-950/60',
          title: 'OBSIDIAN SONAR MATRIX FEED',
          effectStyle: 'mix-blend-screen opacity-80',
        };
      case 'CARBON_VIOLET':
        return {
          tint: 'bg-purple-950/15',
          glowColor: 'rgba(217, 70, 239, 0.35)',
          scanlineColor: 'rgba(217, 70, 239, 0.18)',
          chromaticShift: 'text-shadow-purple',
          borderDecoration: 'border-purple-950/60',
          title: 'CARBON NEURAL PLASMA POLARITY',
          effectStyle: 'mix-blend-color-dodge opacity-90',
        };
      case 'OPAL_STARDUST':
        return {
          tint: 'bg-orange-950/12',
          glowColor: 'rgba(251, 146, 60, 0.28)',
          scanlineColor: 'rgba(253, 186, 116, 0.15)',
          chromaticShift: 'text-shadow-orange',
          borderDecoration: 'border-orange-950/60',
          title: 'OPAL CHROMA REFRACTIVE PRISM',
          effectStyle: 'mix-blend-screen opacity-85',
        };
      case 'IRON_GREEN':
        return {
          tint: 'bg-emerald-950/18',
          glowColor: 'rgba(16, 185, 129, 0.40)',
          scanlineColor: 'rgba(34, 197, 94, 0.18)',
          chromaticShift: 'text-shadow-green',
          borderDecoration: 'border-emerald-950/60',
          title: 'IRON URANIUM RADAR OSCILLOSCOPE',
          effectStyle: 'mix-blend-normal opacity-90',
        };
      case 'QUICKSILVER_COPPER':
        return {
          tint: 'bg-amber-950/14',
          glowColor: 'rgba(249, 115, 22, 0.35)',
          scanlineColor: 'rgba(249, 115, 22, 0.18)',
          chromaticShift: 'text-shadow-copper',
          borderDecoration: 'border-amber-900/40',
          title: 'QUICKSILVER CRYO THERMAL RAD',
          effectStyle: 'mix-blend-color-dodge opacity-85',
        };
      default:
        return {
          tint: 'bg-zinc-950/10',
          glowColor: 'rgba(255, 255, 255, 0.10)',
          scanlineColor: 'rgba(255, 255, 255, 0.08)',
          chromaticShift: '',
          borderDecoration: 'border-zinc-950/60',
          title: 'STANDARD OPTICAL RECON STRIP',
          effectStyle: 'mix-blend-overlay',
        };
    }
  };

  const currentTheme = getThemeOverlayClass();

  // Handle phase specific overrides
  const getPhaseModifier = () => {
    switch (phase) {
      case 'BOOT':
        return {
          contrast: 'contrast-[1.25]',
          brightness: 'brightness-105',
          blur: 'blur-[0.3px]',
          customGrainSpeed: '0.04s',
          scanlineIntensity: 'opacity-40 animate-pulse',
          screenJitter: 'animate-[bounce_0.08s_infinite] opacity-90',
        };
      case 'DESTINATION':
        return {
          contrast: 'contrast-[1.10]',
          brightness: 'brightness-110',
          blur: 'blur-[0.1px]',
          customGrainSpeed: '0.12s',
          scanlineIntensity: 'opacity-15',
          screenJitter: 'opacity-100',
        };
      case 'FLIGHT':
      default:
        return {
          contrast: 'contrast-[1.05]',
          brightness: 'brightness-100',
          blur: 'none',
          customGrainSpeed: '0.07s',
          scanlineIntensity: 'opacity-25',
          screenJitter: glitchActive ? 'translate-y-[2px] skew-x-1 opacity-95 transition-transform' : 'opacity-100',
        };
    }
  };

  const phaseMod = getPhaseModifier();

  // Render responsive overlay elements
  return (
    <div 
      id="savant-crt-visual-overlay" 
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-40 overflow-hidden ${phaseMod.contrast} ${phaseMod.brightness} ${phaseMod.blur} ${flicker ? 'opacity-85 brightness-110' : 'opacity-100'}`}
    >
      {/* 1. SOLID VINTAGE MONITOR CORNER BEVELLING GRID TINT */}
      <div className={`absolute inset-0 transition-colors duration-700 ${currentTheme.tint} ${phaseMod.screenJitter}`} />

      {/* 2. DYNAMIC CRT SCANLINE STRIPES Repeating Gradient */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-all duration-300 ${phaseMod.scanlineIntensity}`}
        style={{
          backgroundImage: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 1px,
            ${currentTheme.scanlineColor} 2px,
            ${currentTheme.scanlineColor} 3px,
            transparent 4px
          )`,
          backgroundSize: '100% 4px'
        }}
      />

      {/* 3. CATODE RAY RADAR SCANNING HORIZONTAL HORIZON HOLD SWEEP */}
      <div 
        className="absolute left-0 right-0 w-full h-[6px] opacity-45 pointer-events-none animate-scanline"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent 0%, ${currentTheme.scanlineColor} 50%, transparent 100%)`,
          boxShadow: `0 0 12px ${currentTheme.glowColor}`
        }}
      />

      {/* 4. REAL-TIME MULTI-OCTAVE SVG FILM-GRAIN TEXTURE (Perfect organic cinematic grit) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.14] mix-blend-overlay">
        <filter id="film-grain-noise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.65" 
            numOctaves="3" 
            stitchTiles="stitch"
          >
            <animate 
              attributeName="seed" 
              from="1" 
              to="100" 
              dur={phaseMod.customGrainSpeed} 
              repeatCount="indefinite" 
            />
          </feTurbulence>
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.25 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#film-grain-noise)" />
      </svg>

      {/* 5. WARPED RETRO CORNER VIGNETTE SHADOW (Gives screen classic curved tube feel) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 65%, rgba(0,0,0,0.72) 100%)',
        }}
      />

      {/* 6. CORNER MILITARY BROADCAST LOGGING DETAILS */}
      <div className="absolute top-1/2 left-3 -translate-y-1/2 flex flex-col gap-10 font-mono text-[5px] font-black tracking-widest text-zinc-500 uppercase select-none opacity-40 scale-75 origin-left">
        <div>SYS_SIG: LNK_EST / {currentTheme.title}</div>
        <div>V_SYNC: LOK_OK / PHASE_{phase}</div>
        <div>ALCHEM_DEVI: {asteroidTheme}</div>
      </div>
    </div>
  );
};
