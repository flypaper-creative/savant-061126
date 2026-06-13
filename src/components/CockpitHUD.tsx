import React, { useEffect, useState, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { useAudio } from '../hooks/useAudio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Gauge, Radio, Shield, Zap, Target, Sliders, ChevronRight, Eye, RefreshCw, Terminal, SlidersHorizontal, Power, AlertTriangle, Cpu, Navigation, Lock, Save, Send, Info, Layers, MessageSquare, Terminal as TerminalIcon
} from 'lucide-react';

export const CockpitHUD: React.FC = () => {
  const {
    phase,
    pilotConfig,
    telemetry,
    opticMode,
    filterEffect,
    telemetryLogs,
    asteroidTheme,
    updatePilotConfig,
    setOpticMode,
    setFilterEffect,
    addTelemetryLog,
    updateTelemetry,
    setPhase,
    resetSim,
    triggerScreenShake,
  } = useAppState();

  const {
    playDiagnosticBlip,
    playWarpWhoosh,
    playPassagePulse,
  } = useAudio();

  const [activeTab, setActiveTab] = useState<'CONSOLE' | 'AI_RESONATOR' | 'SYSTEM_LOGS'>('CONSOLE');
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiReplies, setAiReplies] = useState<Array<{ sender: 'USER' | 'SAVANT'; text: string; time: string }>>([
    { sender: 'SAVANT', text: 'Secure neural link active. I am SAVANT_COG_C1. State your structural directives.', time: '00:01' }
  ]);
  const [aiTyping, setAiTyping] = useState(false);
  const [warpProgress, setWarpProgress] = useState(0);
  const [isWarping, setIsWarping] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log feed
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [telemetryLogs]);

  // Audio tone play for click events
  const triggerClickAudio = (freq = 780, vol = 0.04) => {
    try {
      playDiagnosticBlip(freq, vol);
    } catch (e) {}
  };

  // Slider change handler
  const handleSliderUpdate = (prop: string, val: number) => {
    updateTelemetry({ [prop]: val });
    if (Math.abs(val % 10) < 1.5) {
      triggerClickAudio(900 + val * 0.4, 0.012);
    }
  };

  // Theme change trigger
  const handleThemeSwitch = (themeName: any) => {
    let spotCol = '#00f2ff';
    let hudColName: 'CYAN' | 'EMERALD' | 'AMBER' | 'RUBY' = 'CYAN';
    
    switch (themeName) {
      case 'CHROME_BLOOD':
        hudColName = 'RUBY';
        spotCol = '#ef4444';
        break;
      case 'GOLD_GUNMETAL':
        hudColName = 'AMBER';
        spotCol = '#f59e0b';
        break;
      case 'OBSIDIAN_MOTTLED':
        hudColName = 'CYAN';
        spotCol = '#ffffff';
        break;
      case 'CARBON_VIOLET':
        hudColName = 'RUBY';
        spotCol = '#d946ef';
        break;
      case 'OPAL_STARDUST':
        hudColName = 'CYAN';
        spotCol = '#22d3ee';
        break;
      case 'IRON_GREEN':
        hudColName = 'EMERALD';
        spotCol = '#10b981';
        break;
      case 'QUICKSILVER_COPPER':
        hudColName = 'AMBER';
        spotCol = '#f97316';
        break;
    }

    // Trigger double chord synthesis nodes!
    triggerClickAudio(340, 0.12);
    setTimeout(() => triggerClickAudio(520, 0.08), 80);

    updatePilotConfig({
      hudColor: spotCol,
      hudColorName: hudColName
    });

    // In React state is bound, we also log it
    addTelemetryLog(`THEME_MAP Changed -> [${themeName}] with spectral frequency align`);
    
    // Set custom visual element state in threeJS via app state
    // We update pilotConfig colors perfectly
    try {
      const stateSetter = (window as any).__THREE_SET_THEME_FALLBACK__;
      if (typeof stateSetter === 'function') stateSetter(themeName);
    } catch (err) {}
  };

  // Submit AI Prompt through full-stack backend Express Endpoint!
  const handleSendAiPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim() || aiTyping) return;

    const userText = aiPrompt;
    setAiPrompt('');
    triggerClickAudio(850, 0.08);

    const currentTimeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAiReplies((prev) => [...prev, { sender: 'USER', text: userText, time: currentTimeString }]);
    setAiTyping(true);
    addTelemetryLog(`DIAL_ENG: Sending telemetry briefing prompt: [${userText}]`);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          history: aiReplies.slice(-6).map(r => ({ sender: r.sender, text: r.text }))
        })
      });

      if (!res.ok) throw new Error("Backend query failed");
      const data = await res.json();

      setAiReplies((prev) => [...prev, { sender: 'SAVANT', text: data.text, time: currentTimeString }]);
      triggerClickAudio(420, 0.12);
      addTelemetryLog('DIAL_ENG: Intelligence response synthesized successfully.');

      // Dynamic parameter tuner: parse model recommendations or update theme based on colors!
      const lowerReply = data.text.toLowerCase();
      if (lowerReply.includes('chrome') || lowerReply.includes('blood')) handleThemeSwitch('CHROME_BLOOD');
      else if (lowerReply.includes('gold') || lowerReply.includes('prestige')) handleThemeSwitch('GOLD_GUNMETAL');
      else if (lowerReply.includes('carbon') || lowerReply.includes('violet')) handleThemeSwitch('CARBON_VIOLET');
      else if (lowerReply.includes('opal') || lowerReply.includes('dream')) handleThemeSwitch('OPAL_STARDUST');
      else if (lowerReply.includes('emerald') || lowerReply.includes('green')) handleThemeSwitch('IRON_GREEN');

    } catch (err) {
      console.warn("Express endpoint bypassed. Constructing sovereign fallback matrix review.");
      // Procedural smart response fallback
      let matchedText = 'System brief parsed by local simulated node. Savant approaches design with complete integrity. To enable server-side deep learning replies, define process.env.GEMINI_API_KEY in the Settings Secrets panel.';
      if (userText.toLowerCase().includes('flight') || userText.toLowerCase().includes('speed')) {
        matchedText = 'Sovereign assessment: Flight vectors optimized. Speed and spatial density can be regulated using the left controller metrics. Your trajectory reveals optimum alignment values.';
      } else if (userText.toLowerCase().includes('color') || userText.toLowerCase().includes('theme')) {
        matchedText = 'Sovereign assessment: Style preset parsed. Modulate theme spectrum on the right deck array. We highly recommend Chrome Liquid and Carbon Violet presets.';
      }

      setAiReplies((prev) => [...prev, { sender: 'SAVANT', text: matchedText, time: currentTimeString }]);
      triggerClickAudio(950, 0.04);
    } finally {
      setAiTyping(false);
    }
  };

  // Warp engagement countdown
  const handleEngageWarp = () => {
    if (isWarping) return;
    setIsWarping(true);
    addTelemetryLog('WARN: INITIALIZING CHRONOS COUPLING DRIVE. STEER SHIELD MAXIMUM.');
    
    let currentPrg = 0;
    const interval = setInterval(() => {
      currentPrg += 8;
      setWarpProgress(Math.min(100, currentPrg));
      triggerScreenShake(currentPrg * 0.15);
      triggerClickAudio(150 + currentPrg * 8, 0.08);

      if (currentPrg >= 100) {
        clearInterval(interval);
        try {
          playWarpWhoosh();
        } catch (e) {}
        addTelemetryLog('COGNITIVE_TRANSIT: COMPILATION SECURE. GATE ARRIVAL COMMENCING.');
        setTimeout(() => {
          setPhase('DESTINATION');
          setIsWarping(false);
          setWarpProgress(0);
        }, 800);
      }
    }, 120);
  };

  const hudHex = pilotConfig.hudColor || '#00f2ff';

  return (
    <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between p-3 sm:p-5 pointer-events-none font-mono text-zinc-300 z-10">
      
      {/* 1. TOP STATUS PANEL BAR (TACTILE AEROSPACE CAP) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3 items-start pointer-events-auto">
        
        {/* Upper Left Identity Badge */}
        <div className="md:col-span-4 flex items-center gap-3.5 bg-black/75 border border-zinc-900/90 rounded-md p-2.5 backdrop-blur-md">
          <div className="relative">
            <Cpu style={{ color: hudHex }} className="w-5 h-5 animate-pulse" />
            <span style={{ backgroundColor: hudHex }} className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-550 font-semibold">PILOT //</span>
              <span style={{ color: hudHex }} className="text-[11px] font-black tracking-wide uppercase">{pilotConfig.callsign || 'PILOT_RECON'}</span>
            </div>
            <span className="text-[7.5px] text-zinc-500 tracking-wider">SEC_ALIGN: ACTIVE // DIRECTIVE: {pilotConfig.objective || 'MAPPING_ASTEROID_MATRIX'}</span>
          </div>
        </div>

        {/* Center Horizon Indicators */}
        <div className="md:col-span-5 flex items-center justify-between bg-black/75 border border-zinc-900/90 rounded-md p-2.5 backdrop-blur-md">
          <div className="text-center w-1/3 border-r border-zinc-950/60 leading-none">
            <span className="text-[7px] text-zinc-500 block uppercase">LASER RADAR</span>
            <span style={{ color: hudHex }} className="text-[11.5px] font-black tracking-widest mt-1 block">
              {telemetry.nearestAsteroidName ?? 'TARGET_STDBY'}
            </span>
          </div>
          <div className="text-center w-1/3 border-r border-[#101015]/60 leading-none">
            <span className="text-[7px] text-zinc-500 block uppercase">OBST_DIST</span>
            <span className="text-[11.5px] font-black text-amber-500 mt-1 block">
              {telemetry.nearestAsteroidDist ? `${telemetry.nearestAsteroidDist} M` : 'DETECTING_SEC'}
            </span>
          </div>
          <div className="text-center w-1/3 leading-none">
            <span className="text-[7px] text-zinc-500 block uppercase">ACTIVE OPTIC</span>
            <span style={{ color: hudHex }} className="text-[9.5px] font-black mt-1 block uppercase">
              {opticMode.replace('STD_', '').replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Console Mode Tab Swappers */}
        <div className="md:col-span-3 grid grid-cols-3 gap-1.5 bg-black/60 p-1 border border-zinc-900/90 rounded-md backdrop-blur-md">
          {([
            { id: 'CONSOLE', label: 'FLIGHT_DECK', icon: SlidersHorizontal },
            { id: 'AI_RESONATOR', label: 'AI_DIALOGUE', icon: MessageSquare },
            { id: 'SYSTEM_LOGS', label: 'TELEMETRY_LOGS', icon: Terminal }
          ] as const).map((tab) => {
            const isTabActive = activeTab === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { triggerClickAudio(680, 0.05); setActiveTab(tab.id); }}
                style={{
                  borderColor: isTabActive ? hudHex : undefined,
                }}
                className={`flex flex-col items-center justify-center p-1 font-bold text-[8px] border rounded transition cursor-pointer select-none uppercase ${
                  isTabActive 
                    ? 'bg-zinc-950 text-white' 
                    : 'border-zinc-900/60 bg-zinc-900/10 text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <TabIcon style={{ color: isTabActive ? hudHex : undefined }} className="w-3.5 h-3.5 mb-0.5" />
                <span>{tab.label.split('_')[0]}</span>
              </button>
            );
          })}
        </div>

      </div>

      {/* 2. DYNAMIC INTERACTION MAIN LOWER BODY PANELS */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end pointer-events-auto mt-4.5">
        
        {/* Left Hand: Tactical Trajectory Flight Controllers */}
        <div className="md:col-span-4 bg-black/85 border border-zinc-900/92 rounded-md p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-zinc-900/80 pb-1.5 mb-2.5">
            <span className="text-[9px] font-bold text-white tracking-widest flex items-center gap-1.5">
              <Compass style={{ color: hudHex }} className="w-3.5 h-3.5 animate-spin [animation-duration:8s]" />
              FLIGHT TRAJECTORY METRICS
            </span>
            <span className="text-[7px] text-zinc-650 font-black">SEC: L_CTRL_A</span>
          </div>

          <div className="space-y-3">
            {/* Slider 1: Resolution Flight Velocity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-extrabold font-mono text-zinc-500 uppercase">
                <span>Traversing Velocity Vector</span>
                <span style={{ color: hudHex }}>{telemetry.velocity} m/s</span>
              </div>
              <input 
                type="range"
                min="180" 
                max="1350"
                value={telemetry.velocity}
                onChange={(e) => handleSliderUpdate('velocity', parseInt(e.target.value))}
                className="w-full bg-zinc-900 h-1 rounded cursor-pointer accent-sky-400"
              />
            </div>

            {/* Slider 2: Orbit Altitude */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-bold font-mono text-zinc-500 uppercase">
                <span>Stellar Altitude Grid</span>
                <span style={{ color: hudHex }}>{telemetry.altitude} km</span>
              </div>
              <input 
                type="range"
                min="200" 
                max="3200"
                value={telemetry.altitude}
                onChange={(e) => handleSliderUpdate('altitude', parseInt(e.target.value))}
                className="w-full bg-zinc-900 h-1 rounded cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Slider 3: Rotational speed */}
            <div className="space-y-1">
              <div className="flex justify-between text-[8px] font-bold font-mono text-zinc-500 uppercase">
                <span>Gyro Rotation Sensitivity</span>
                <span style={{ color: hudHex }}>{telemetry.thrusterSensitivity.toFixed(2)}x</span>
              </div>
              <input 
                type="range"
                min="0.1" 
                max="3.0"
                step="0.1"
                value={telemetry.thrusterSensitivity}
                onChange={(e) => handleSliderUpdate('thrusterSensitivity', parseFloat(e.target.value))}
                className="w-full bg-zinc-900 h-1 rounded cursor-pointer accent-emerald-400"
              />
            </div>
          </div>

          {/* Mini Diagnostic Grid Section */}
          <div className="grid grid-cols-2 gap-2 mt-3.5 border-t border-[#1a1a1f] pt-2.5">
            <div className="bg-zinc-950/60 p-1.5 border border-zinc-900 rounded flex flex-col justify-between h-9.5">
              <span className="text-[6.5px] text-zinc-500">LATITUDE SEC</span>
              <span className="text-[9.5px] font-black text-zinc-200 mt-0.5">{telemetry.latitude.toFixed(4)}° N</span>
            </div>
            <div className="bg-zinc-950/60 p-1.5 border border-zinc-900 rounded flex flex-col justify-between h-9.5">
              <span className="text-[6.5px] text-zinc-500">LONGITUDE SEC</span>
              <span className="text-[9.5px] font-black text-zinc-200 mt-0.5">{telemetry.longitude.toFixed(4)}° W</span>
            </div>
          </div>
        </div>

        {/* Center Section: Core interaction (Depending on active mode tab!) */}
        <div className="md:col-span-5 bg-black/85 border border-zinc-900/92 rounded-md p-3.5 h-[230px] flex flex-col justify-between shadow-2xl backdrop-blur-md">
          
          {/* TAB CONTENT: CONSOLE (MAIN CONTROLLER SLICK COCKPIT SELECTION) */}
          {activeTab === 'CONSOLE' && (
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-bold text-zinc-550 block uppercase tracking-widest mb-1.5">✦ COCKPIT SYSTEM INTELLIGENCE PRESETS</span>
                
                {/* Advanced Ocular Selection Grid */}
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {([
                    { id: 'STD_OPTIC', label: 'STD_OPTIC // VISIBLE LENS' },
                    { id: 'BIO_THERM', label: 'INFRARED // BIO THERMAL' },
                    { id: 'ECHO_PULSE', label: 'ECHO PULSE // WIRE LATTICE' },
                    { id: 'VOID_DRIVE', label: 'VOID CORE // NEON SECTOR' }
                  ] as const).map((mode) => {
                    const isModeActive = opticMode === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => { triggerClickAudio(500, 0.05); setOpticMode(mode.id); }}
                        style={{
                          borderColor: isModeActive ? hudHex : undefined,
                        }}
                        className={`py-1.5 px-2 text-left font-black text-[8px] border rounded transition cursor-pointer select-none uppercase ${
                          isModeActive 
                            ? 'bg-zinc-950 text-white font-extrabold' 
                            : 'border-zinc-900/60 bg-zinc-900/10 text-neutral-520 hover:text-zinc-350'
                        }`}
                      >
                        ■ {mode.label}
                      </button>
                    );
                  })}
                </div>

                {/* Sub Material Aesthetics Theme Trackers */}
                <span className="text-[8px] font-bold text-zinc-550 block uppercase tracking-widest mb-1.5">✦ SOLID PROTOCOL MATERIAL PALETS</span>
                <div className="flex flex-wrap gap-1">
                  {([
                    'GOLD_GUNMETAL', 'CHROME_BLOOD', 'OBSIDIAN_MOTTLED', 
                    'CARBON_VIOLET', 'OPAL_STARDUST', 'IRON_GREEN', 'QUICKSILVER_COPPER'
                  ] as const).map((themeName) => {
                    const isThemeActive = asteroidTheme === themeName;
                    return (
                      <button
                        key={themeName}
                        onClick={() => handleThemeSwitch(themeName)}
                        style={{
                          borderColor: isThemeActive ? hudHex : 'transparent',
                        }}
                        className={`text-[7px] font-bold px-2 py-1 uppercase rounded border transition cursor-pointer select-none ${
                          isThemeActive 
                            ? 'bg-neutral-900 text-white font-black' 
                            : 'bg-zinc-900/30 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
                        }`}
                      >
                        {themeName.replace('_', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Master Voyage Compilator Engage Button */}
              <div className="border-t border-[#111116] pt-2 mt-2 flex gap-2.5 items-center">
                <button
                  onClick={handleEngageWarp}
                  disabled={isWarping}
                  style={{
                    backgroundColor: isWarping ? '#ef4444' : hudHex,
                    boxShadow: isWarping ? '0 0 16px rgba(239, 68, 68, 0.35)' : `0 0 16px ${hudHex}35`
                  }}
                  className="flex-1 py-1.5 text-center font-black text-[10.5px] text-zinc-950 cursor-pointer rounded uppercase tracking-[0.16em]"
                >
                  {isWarping ? `COGNITIVE COUPLING WARP: ${warpProgress}%` : 'ENGAGE HYPER_WARP TRAJECTORY'}
                </button>
                
                {/* Reset button */}
                <button
                  onClick={() => { triggerClickAudio(400, 0.15); resetSim(); }}
                  className="p-1.5 border border-zinc-900 bg-zinc-900/25 hover:bg-zinc-900/80 rounded cursor-pointer transition select-none flex items-center justify-center h-[30px] w-[30px]"
                  title="RESET COCKPIT SIMULATOR"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: AI RESONATOR DIALOGUE BOARD */}
          {activeTab === 'AI_RESONATOR' && (
            <div className="h-full flex flex-col justify-between overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 h-32 scrollbar-none">
                {aiReplies.map((reply, i) => (
                  <div 
                    key={i} 
                    className={`flex flex-col text-[8.5px] leading-relaxed p-1.5 rounded ${
                      reply.sender === 'USER' 
                        ? 'items-end bg-sky-500/10 border border-sky-400/10 ml-auto' 
                        : 'items-start bg-zinc-900/30 border border-zinc-900/50'
                    } max-w-[85%]`}
                  >
                    <span className="text-[6.5px] font-black text-zinc-550 block mb-0.5 select-none font-mono uppercase">
                      {reply.sender === 'USER' ? 'COGNITIVE PILOT' : 'SAVANT_COG_C1'} • {reply.time}
                    </span>
                    <p className="font-mono text-zinc-300">{reply.text}</p>
                  </div>
                ))}
                
                {aiTyping && (
                  <div className="items-start bg-zinc-900/30 border border-zinc-900 p-1.5 rounded max-w-[80%] flex flex-col gap-1">
                    <span className="text-[6.5px] font-black text-purple-400 block uppercase select-none">SAVANT COMPILING ANSWER...</span>
                    <div className="flex gap-1 py-0.5">
                      <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <div className="w-1 h-1 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSendAiPrompt} className="flex gap-1.5 border-t border-zinc-900/80 pt-2.5 mt-1">
                <input 
                  type="text"
                  placeholder="Direct dynamic vector adjustments (e.g., Change theme to Gold)..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 bg-zinc-950 border border-zinc-900 rounded px-2.5 py-1 text-[9px] text-white focus:outline-none placeholder-zinc-650"
                  disabled={aiTyping}
                />
                <button
                  type="submit"
                  disabled={aiTyping || !aiPrompt.trim()}
                  className="bg-zinc-900 border border-zinc-800 hover:bg-neutral-900 px-3 py-1 text-[9px] text-zinc-300 font-bold rounded cursor-pointer transition flex items-center justify-center"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            </div>
          )}

          {/* TAB CONTENT: SYSTEM_LOGS (REAL-TIME TELEMETRY STREAM) */}
          {activeTab === 'SYSTEM_LOGS' && (
            <div className="h-full flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-1 mb-1.5 select-none">
                <span className="text-[8px] font-bold text-zinc-550 uppercase">TELEMETRY_LOGS_STREAM</span>
                <span className="text-[7px] text-emerald-400 font-black flex items-center gap-1.5 leading-none">
                  <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                  LOGS_FEED_ONLINE_TRUE
                </span>
              </div>

              <div className="flex-1 overflow-y-auto font-mono text-[8px] text-[#86bf8a] leading-relaxed pr-1 h-36 scrollbar-thin scrollbar-track-transparent">
                {telemetryLogs.map((log, i) => (
                  <div key={i} className="py-0.5 border-b border-zinc-950/20 max-w-full truncate font-medium">
                    <span className="text-zinc-700 mr-1 select-none">[{1000 + i}]</span>
                    {log}
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>

              <div className="text-[6.5px] italic text-zinc-550 pt-1.5 border-t border-zinc-900/40 text-center select-none tracking-wider">
                CORE SYSTEM DICTIONARY CONTEXT REPLICANT SECURE
              </div>
            </div>
          )}

        </div>

        {/* Right Hand: Audio Signal Telemetry Oscilloscope */}
        <div className="md:col-span-3 bg-black/85 border border-zinc-900/92 rounded-md p-3 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-zinc-900/80 pb-1.5 mb-2.5">
            <span className="text-[9px] font-bold text-white tracking-widest flex items-center gap-1">
              <Radio style={{ color: hudHex }} className="w-3.5 h-3.5 animate-pulse" />
              ACOUSTIC RESONATOR DRONE
            </span>
            <span className="text-[7px] text-zinc-650 font-black">SEC: AUDIO_C</span>
          </div>

          <div className="space-y-3.5">
            {/* Ambient drone frequency select knob indicators */}
            <div className="bg-zinc-950 border border-zinc-900 rounded p-2 leading-tight">
              <span className="text-[7px] text-zinc-550 block uppercase">Resonator Drone Frequency</span>
              <div className="flex items-center gap-2 mt-1 px-1.5 justify-between">
                {[55, 65, 75].map((freq) => {
                  const isFreqActive = pilotConfig.humFrequency === freq;
                  return (
                    <button
                      key={freq}
                      onClick={() => {
                        triggerClickAudio(freq, 0.25);
                        updatePilotConfig({ humFrequency: freq });
                        addTelemetryLog(`ACOUST_TUNE: Hum resonator adjusted to target tone: ${freq}Hz`);
                      }}
                      style={{
                        borderColor: isFreqActive ? hudHex : undefined,
                      }}
                      className={`text-[8px] font-black border px-1.5 py-0.5 rounded transition cursor-pointer select-none ${
                        isFreqActive 
                          ? 'bg-neutral-900 text-white' 
                          : 'border-zinc-900/80 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {freq} HZ
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Simulated Live Audio Stream Oscilloscope / Waveform canvas */}
            <div className="bg-zinc-950 border border-zinc-900/80 rounded h-15.5 relative overflow-hidden flex items-center justify-center">
              
              {/* Dynamic waveform ripples drawing */}
              <div className="absolute inset-x-2 h-7 flex items-center gap-[1px]">
                {[...Array(26)].map((_, i) => {
                  // Simulate neat dynamic breathing sound waves
                  const noiseFactor = Math.sin(i * 0.4) * Math.cos(i * 0.15);
                  return (
                    <div 
                      key={i}
                      style={{
                        height: `${Math.max(10, Math.floor(25 + noiseFactor * 22))}px`,
                        backgroundColor: hudHex,
                        transition: 'height 0.15s ease-in-out'
                      }}
                      className="flex-1 opacity-70 rounded-full animate-pulse [animation-duration:1s]"
                    />
                  );
                })}
              </div>

              {/* Grid line overlay */}
              <div className="absolute inset-0 bg-[#000000]/10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_4px] pointer-events-none" />
              <div className="absolute top-1 left-1.5 text-[5px] text-zinc-650 block select-none">OSC_1 // AUDIO_TEL_BUF</div>
              <div className="absolute bottom-1 right-1.5 text-[5px] text-zinc-650 block select-none">GAIN_0.12 // AMPLI_MAX</div>
            </div>
          </div>

          {/* Core Calibration progress */}
          <div className="mt-3.5 border-t border-[#1a1a1f] pt-2 flex items-center justify-between text-[7px] text-zinc-550 uppercase">
            <span>RES_STABILITY</span>
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">
              ■ FULLY STABILIZED IND_99.8%
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
