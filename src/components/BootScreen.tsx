import React, { useState, useEffect } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { useAudio } from '../hooks/useAudio';
import { motion } from 'motion/react';
import { Terminal as TerminalIcon, User, Layers, ShieldAlert, Cpu, Check, Activity, ShieldCheck, Zap, Server } from 'lucide-react';
import { ArcadeCalibrator } from './ArcadeCalibrator';

export const BootScreen: React.FC = () => {
  const { updatePilotConfig, setPhase, addTelemetryLog } = useAppState();
  const { playDiagnosticBlip, initAudioCtx, playWarpWhoosh } = useAudio();

  // Onboarding local state
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [callsign, setCallsign] = useState('SAVANT_X1');
  const [division, setDivision] = useState<'RESEARCH' | 'MINING' | 'RECON' | 'WARP_CORPS'>('RESEARCH');
  const [objective, setObjective] = useState('Explore the gravitational core node boundary limits.');
  const [humFrequency, setHumFrequency] = useState(55);
  const [hudColorName, setHudColorName] = useState<'CYAN' | 'EMERALD' | 'AMBER' | 'RUBY'>('CYAN');

  // Interactive diagnostics and blueprint local states
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrationStage, setCalibrationStage] = useState('SYSTEM_STANDBY_IDLE');
  const [checklist, setChecklist] = useState({
    warpLens: 'WAITING',
    acousticHum: 'WAITING',
    steerCoupling: 'WAITING',
    shieldArray: 'WAITING',
  });

  // Color mapper helper
  const getSelectedColorHex = () => {
    if (hudColorName === 'CYAN') return '#00f2ff';
    if (hudColorName === 'EMERALD') return '#10b981';
    if (hudColorName === 'AMBER') return '#f59e0b';
    if (hudColorName === 'RUBY') return '#ef4444';
    return '#00f2ff';
  };
  const themeHex = getSelectedColorHex();

  // Trigger sound feedback
  const handleSelectVal = (type: string, val: any) => {
    playDiagnosticBlip(680, 0.05);
    if (type === 'color') setHudColorName(val);
    if (type === 'div') setDivision(val);
    if (type === 'hum') setHumFrequency(val);
  };

  const runCalibration = () => {
    if (isCalibrating) return;
    initAudioCtx();
    setIsCalibrating(true);
    setCalibrationProgress(0);
    setCalibrationStage('INITIALIZING_CORE_REGISTRIES');
    playDiagnosticBlip(440, 0.1);
    
    setChecklist({
      warpLens: 'TUNING',
      acousticHum: 'WAITING',
      steerCoupling: 'WAITING',
      shieldArray: 'WAITING',
    });

    let currentProg = 0;
    const interval = setInterval(() => {
      currentProg += Math.floor(Math.random() * 12) + 8;
      if (currentProg >= 100) {
        currentProg = 100;
        clearInterval(interval);
        setIsCalibrating(false);
        setCalibrationStage('CALIBRATION_SUCCESS_NOMINAL');
        setChecklist({
          warpLens: 'NOMINAL',
          acousticHum: 'NOMINAL',
          steerCoupling: 'NOMINAL',
          shieldArray: 'NOMINAL',
        });
        playDiagnosticBlip(1040, 0.25);
        addTelemetryLog('BOOT DIAGNOSTICS: PREFLIGHT INTEGRITY CHECKS COMPLETED NOMINAL');
      } else {
        setCalibrationProgress(currentProg);
        playDiagnosticBlip(550 + currentProg * 3.5, 0.03);
        
        // Dynamic progress stage simulation
        if (currentProg > 25 && currentProg <= 50) {
          setCalibrationStage('CALIBRATING_ACOUSTIC_SYNTH_HUM');
          setChecklist(prev => ({ ...prev, warpLens: 'NOMINAL', acousticHum: 'TUNING' }));
        } else if (currentProg > 50 && currentProg <= 75) {
          setCalibrationStage('COUPLING_THRUSTER_STEER_MATRIX');
          setChecklist(prev => ({ ...prev, acousticHum: 'NOMINAL', steerCoupling: 'TUNING' }));
        } else if (currentProg > 75) {
          setCalibrationStage('CHARGING_REACTIVE_DEFLECTOR_SHIELDS');
          setChecklist(prev => ({ ...prev, steerCoupling: 'NOMINAL', shieldArray: 'TUNING' }));
        }
      }
    }, 120);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initAudioCtx();
    
    // Play sound FX
    playDiagnosticBlip(880, 0.15);
    setTimeout(() => {
      playDiagnosticBlip(1040, 0.2);
    }, 100);

    // Save configuration variables
    updatePilotConfig({
      callsign: callsign.trim().toUpperCase() || 'SAVANT_COCKPIT',
      division,
      objective: objective.trim() || 'Classified flight core vector mapping',
      humFrequency,
      hudColorName,
    });

    // Start background logs and navigate to active INIT cinematic intro phase
    addTelemetryLog(`SECURE LOGIN VERIFIED: CALLSIGN "${callsign.toUpperCase()}" SIGNED ON`);
    addTelemetryLog(`MISSION SCOPE: ${objective}`);
    addTelemetryLog(`HUD LINKED CONFIG: ${hudColorName}`);
    
    setPhase('FLIGHT');
  };

  const divDetails = {
    RESEARCH: 'MAPPING NEURAL SYNAPSE WEBS & COLLIMATING EMERGENT INTELLECT CORES',
    MINING: 'SURVEYING ACCRETION FLOW GRADIENTS WITHIN BLACK HOLE LIMINAL SHELVES',
    RECON: 'RECOVERING CELESTIAL ANOMALIES & COLLATING SECURE ANCIENT MONOLITHS',
    WARP_CORPS: 'SYNAPSE COLLISION TRIGGERS IN QUANTUM PARTICLE VELOCITY COEFFICIENTS',
  };



  return (
    <div id="boot-terminal-dashboard" className="relative w-full h-full flex items-center justify-center font-mono text-zinc-450 p-4 overflow-hidden select-none bg-black/40 z-10">
      
      {/* Background Volumetric Ambient Vignette and Soft Depth Mist */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,13,20,0.15)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_6px] pointer-events-none" />

      <div 
        className="w-full max-w-5xl border border-zinc-800/60 bg-[#07090d]/92 backdrop-blur-[24px] rounded-[16px] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-700 ease-out opacity-100 scale-100"
      >
        {/* Understated structural corner brackets of refined micro-detail */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-zinc-700 pointer-events-none opacity-40" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-zinc-700 pointer-events-none opacity-40" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-zinc-700 pointer-events-none opacity-40" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-zinc-700 pointer-events-none opacity-40" />

        {/* Micro coordinate markers of civilizational infrastructure */}
        <span className="absolute top-2.5 left-8 text-[6px] text-zinc-600 tracking-[0.2em] font-sans selection:bg-transparent uppercase">LAT_STG_018 // INTEL_RES_ALIGN</span>
        <span className="absolute top-2.5 right-8 text-[6px] text-zinc-600 tracking-[0.2em] font-sans selection:bg-transparent uppercase">SYS_FOC // DEEP_VOX_C</span>

        {/* Dynamic ambient focus glow */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-1000 -z-10 rounded-[16px] opacity-25"
          style={{
            background: `radial-gradient(circle at 50% 15%, ${themeHex}12, transparent 65%)`
          }}
        />

        {/* Console Header - Integrated Architecture */}
        <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900/80 pb-5 mb-1 gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <TerminalIcon style={{ color: themeHex }} className="w-5 h-5 transition-colors duration-550 opacity-90" />
              <div style={{ backgroundColor: themeHex }} className="absolute inset-0 blur-md rounded-full pointer-events-none opacity-10" />
            </div>
            <div>
              <h2 style={{ color: themeHex }} className="text-[11.5px] font-black tracking-[0.28em] uppercase transition-colors duration-550 select-text">SAVANT EXPERIMENTAL • DIRECT ARCHITECTURE SEQUENCE</h2>
              <p className="text-[8px] text-zinc-500 font-medium tracking-wider uppercase mt-0.5">HIGH-INTEGRITY INTERSTELLAR QUANTUM INSTRUMENTATION v4.91.5 // COGNITIVE DEVIATION NODE</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1.5 px-3 bg-zinc-950/80 border border-zinc-900 rounded-md">
            <Activity className="w-3 h-3 text-emerald-500/80 animate-[spin_12s_linear_infinite]" />
            <span className="text-[8px] font-black text-emerald-400 select-text tracking-widest uppercase">STABLE_LINK_ONLINE</span>
          </div>
        </div>

        {/* LEFT COLUMN: Input Configuration (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Section 1: Pilot Identification */}
            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-zinc-550" />
                  <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400">PILOT COGNITION IDENTIFIER [REG_ID]</label>
                </div>
                <span className="text-[7px] text-zinc-600 font-sans tracking-widest">LAYER_ONE_SEC</span>
              </div>
              <input
                id="pilot-callsign-input"
                type="text"
                required
                maxLength={15}
                value={callsign}
                onChange={(e) => setCallsign(e.target.value.toUpperCase())}
                style={{ borderColor: `${themeHex}22`, color: themeHex }}
                className="w-full bg-zinc-950/55 border px-3 py-2 text-xs tracking-[0.2em] uppercase rounded-md focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 transition duration-400 font-mono text-center"
                placeholder="E.G. COGNIZANT_ONE"
              />
            </div>

            {/* Section 2: Fleet Division */}
            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-zinc-550" />
                <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400">DIVISION SYSTEMIC PARAMETER</label>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[8px] select-none">
                {(['RESEARCH', 'MINING', 'RECON', 'WARP_CORPS'] as const).map((divName) => {
                  const isActive = division === divName;
                  return (
                    <button
                      key={divName}
                      type="button"
                      onClick={() => handleSelectVal('div', divName)}
                      className={`py-2 px-1 text-center font-bold tracking-widest border transition duration-400 uppercase rounded-md cursor-pointer ${
                        isActive
                          ? 'bg-zinc-950 text-white font-black'
                          : 'border-zinc-900/70 bg-zinc-950/10 text-zinc-500 hover:text-zinc-350 hover:border-zinc-800'
                      }`}
                      style={{ 
                        borderColor: isActive ? themeHex : undefined, 
                        boxShadow: isActive ? `0 0 12px ${themeHex}0b` : undefined, 
                        color: isActive ? themeHex : undefined 
                      }}
                    >
                      {divName === 'RESEARCH' ? 'COGNITIVE_DEV' : divName === 'MINING' ? 'MORPH_SURG' : divName === 'RECON' ? 'VOL_RECON' : 'PHOTONIC_PROP'}
                    </button>
                  );
                })}
              </div>
              <div className="bg-zinc-950/70 px-3 py-2 border border-zinc-900 rounded-md text-[8.5px] text-zinc-500 leading-relaxed font-sans select-text">
                INTELLIGENT SYSTEM DESIGN STATEMENT:<br />
                <span className="text-zinc-400 font-medium font-mono">{divDetails[division]}</span>
              </div>
            </div>

            {/* Section 3: Core Objective */}
            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-zinc-550" />
                <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400">OPERATIONAL OBJECTIVE SCHEMATIC</label>
              </div>
              <textarea
                id="pilot-objective-input"
                rows={2}
                maxLength={120}
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                className="w-full bg-zinc-950/40 border border-zinc-900 px-3 py-2 text-xs text-zinc-300 tracking-wide rounded-md focus:outline-none focus:border-zinc-700 transition duration-400 font-mono resize-none leading-relaxed"
                placeholder="Declare trajectory vector parameters or architectural goals..."
              />
            </div>

            {/* Section 4: Cockpit Hum */}
            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-zinc-550" />
                  <label className="text-[9.5px] font-black tracking-[0.16em] uppercase">SYSTEMIC ACOUSTIC RESONATOR DRONE</label>
                </span>
                <span style={{ color: themeHex }} className="text-[9px] font-extrabold tracking-widest">{humFrequency} HZ</span>
              </div>
              <div className="flex gap-2">
                {[55, 65, 75].map((freq) => (
                  <button
                    key={freq}
                    type="button"
                    onClick={() => handleSelectVal('hum', freq)}
                    className={`flex-1 py-1.5 text-[8.5px] tracking-widest border cursor-pointer font-bold rounded-md transition duration-400 ${
                      humFrequency === freq
                        ? 'bg-zinc-950 text-white font-extrabold'
                        : 'border-zinc-900/70 bg-zinc-950/10 text-zinc-500 hover:text-zinc-400 hover:border-zinc-800'
                    }`}
                    style={{ borderColor: humFrequency === freq ? themeHex : undefined, color: humFrequency === freq ? themeHex : undefined }}
                  >
                    {freq}Hz {freq === 55 ? '[INFRA_RESON]' : freq === 65 ? '[DEEP_DRONE]' : '[STABIL_HUM]'}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 5: Primary Color Lens tint */}
            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
              <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400 block">SYSTEM INTELLIGENCE HUD SPECTRAL CHANNELS</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[8.5px]">
                {[
                  { name: 'CYAN', hex: '#00f2ff', label: 'HYDROGEN CYAN [C-102]', short: 'HYDROGEN_C' },
                  { name: 'EMERALD', hex: '#10b981', label: 'ISOTOPE EMERALD [G-504]', short: 'ISOTOPE_G' },
                  { name: 'AMBER', hex: '#f59e0b', label: 'SILICATE AMBER [A-812]', short: 'SILICATE_Y' },
                  { name: 'RUBY', hex: '#ef4444', label: 'LITHIUM SCARLET [R-901]', short: 'LITHIUM_R' },
                ].map((colorObj) => {
                  const isActive = hudColorName === colorObj.name;
                  return (
                    <button
                      key={colorObj.name}
                      type="button"
                      onClick={() => handleSelectVal('color', colorObj.name)}
                      className={`py-2 px-1 text-center font-bold tracking-wide border rounded-md transition duration-400 uppercase cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                        isActive
                          ? 'bg-zinc-950 text-white font-black'
                          : 'border-zinc-900/70 bg-zinc-950/10 text-zinc-500 hover:text-zinc-400 hover:border-zinc-800'
                      }`}
                      style={{ borderColor: isActive ? themeHex : undefined }}
                    >
                      <div 
                        className="w-2 h-2 rounded-full border border-neutral-900 opacity-80"
                        style={{ backgroundColor: colorObj.hex }}
                      />
                      <span className="text-[7.5px] tracking-widest">{colorObj.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Highly sophisticated informational system warning */}
            <div className="bg-zinc-950/70 border border-zinc-900 text-zinc-500 px-3 py-2.5 rounded-md flex items-start gap-2.5 font-sans text-[8.5px] leading-relaxed">
              <ShieldAlert className="w-3.5 h-3.5 text-zinc-650 shrink-0 mt-0.5" />
              <p>
                PROTOCOL STATEMENT: Execution coordinates will configure real-time Canvas processes. Accelerate memory state allocations during transitional sequence boundaries.
              </p>
            </div>

            {/* Actions: Commit */}
            <div className="w-full">
              <button
                id="boot-sim-validate"
                type="submit"
                style={{ backgroundColor: themeHex, boxShadow: `0 8px 30px ${themeHex}1a` }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:brightness-105 text-black shadow-lg transition duration-400 font-extrabold uppercase tracking-[0.22em] text-[9.5px] rounded-md cursor-pointer active:scale-[0.99] select-none"
              >
                COMMIT INTEGRATION SEQ
                <Check className="w-4 h-4 text-black shrink-0" />
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Holographic Blueprint Vectors & Interactive System Calibrator (lg:col-span-5) */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-900/80 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between space-y-4">
          
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
              <span className="text-[9px] font-black tracking-[0.16em] text-zinc-500 block uppercase">
                ■ TACTICAL DEFENSIVE CALIBRATOR [3D ARCADE]
              </span>
              <span style={{ color: themeHex }} className="text-[8px] font-black tracking-widest uppercase">
                {calibrationStage}
              </span>
            </div>

            {/* Micro Calibration checklist indicators */}
            <div className="grid grid-cols-2 gap-2 text-[8px] tracking-wide bg-zinc-950/40 p-2.5 rounded border border-zinc-900/40">
              <div className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${checklist.warpLens === 'NOMINAL' ? 'bg-emerald-500' : checklist.warpLens === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
                <span className="text-zinc-550 font-medium uppercase font-sans">LENS_ALIGN :</span>
                <span className={checklist.warpLens === 'NOMINAL' ? 'text-emerald-500' : checklist.warpLens === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.warpLens}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${checklist.acousticHum === 'NOMINAL' ? 'bg-emerald-500' : checklist.acousticHum === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
                <span className="text-zinc-550 font-medium uppercase font-sans">ACOUSTIC :</span>
                <span className={checklist.acousticHum === 'NOMINAL' ? 'text-emerald-500' : checklist.acousticHum === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.acousticHum}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${checklist.steerCoupling === 'NOMINAL' ? 'bg-emerald-500' : checklist.steerCoupling === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
                <span className="text-zinc-550 font-medium uppercase font-sans">COUPLE_GEOM :</span>
                <span className={checklist.steerCoupling === 'NOMINAL' ? 'text-emerald-500' : checklist.steerCoupling === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.steerCoupling}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${checklist.shieldArray === 'NOMINAL' ? 'bg-emerald-500' : checklist.shieldArray === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
                <span className="text-zinc-550 font-medium uppercase font-sans">SHIELD_ARR :</span>
                <span className={checklist.shieldArray === 'NOMINAL' ? 'text-emerald-500' : checklist.shieldArray === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.shieldArray}</span>
              </div>
            </div>

            {/* Playable Vector Galaga mini-game deck */}
            <ArcadeCalibrator
              themeColor={themeHex}
              themeName={hudColorName}
              calibrationProgress={calibrationProgress}
              division={division}
              onProgressUpdate={(newProg) => {
                setCalibrationProgress(newProg);
                if (newProg >= 100) {
                  setCalibrationStage('CALIBRATION_SUCCESS_NOMINAL');
                  setChecklist({
                    warpLens: 'NOMINAL',
                    acousticHum: 'NOMINAL',
                    steerCoupling: 'NOMINAL',
                    shieldArray: 'NOMINAL',
                  });
                  addTelemetryLog('BOOT DIAGNOSTICS: PREFLIGHT INTEGRITY CHECKS COMPLETED NOMINAL via RETRO ARCADE SYS');
                } else if (newProg > 75) {
                  setCalibrationStage('CHARGING_REACTIVE_DEFLECTOR_SHIELDS');
                  setChecklist({
                    warpLens: 'NOMINAL',
                    acousticHum: 'NOMINAL',
                    steerCoupling: 'NOMINAL',
                    shieldArray: 'TUNING',
                  });
                } else if (newProg > 50) {
                  setCalibrationStage('COUPLING_THRUSTER_STEER_MATRIX');
                  setChecklist({
                    warpLens: 'NOMINAL',
                    acousticHum: 'NOMINAL',
                    steerCoupling: 'TUNING',
                    shieldArray: 'WAITING',
                  });
                } else if (newProg > 25) {
                  setCalibrationStage('CALIBRATING_ACOUSTIC_SYNTH_HUM');
                  setChecklist({
                    warpLens: 'NOMINAL',
                    acousticHum: 'TUNING',
                    steerCoupling: 'WAITING',
                    shieldArray: 'WAITING',
                  });
                } else {
                  setCalibrationStage('INITIALIZING_CORE_REGISTRIES');
                  setChecklist({
                    warpLens: 'TUNING',
                    acousticHum: 'WAITING',
                    steerCoupling: 'WAITING',
                    shieldArray: 'WAITING',
                  });
                }
              }}
            />
          </div>

        </div>

      </div>
    </div>
  );
};
