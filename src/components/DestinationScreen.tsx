import React, { useEffect, useState, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { useAudio } from '../hooks/useAudio';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Target, 
  Zap, 
  Activity, 
  Info, 
  LogOut, 
  Cpu, 
  Layers, 
  Send, 
  Briefcase, 
  Mail, 
  Terminal,
  ExternalLink,
  Upload,
  MessageSquare,
  FileText,
  Sliders,
  Check,
  Code2,
  Workflow,
  Sparkles,
  RefreshCw,
  Gauge
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'SAVANT' | 'USER' | 'SYSTEM';
  text: string;
  timestamp: string;
}

interface UploadedFileMeta {
  name: string;
  size: string;
  type: string;
  vectorComplexity: number;
  readinessRating: number;
}

export const DestinationScreen: React.FC = () => {
  const {
    phase,
    pilotConfig,
    telemetry,
    resetSim,
    setPhase,
    addTelemetryLog,
    triggerScreenShake,
  } = useAppState();

  const { playDiagnosticBlip, playWarpWhoosh, playPassagePulse } = useAudio();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Internal Navigation within Arrival Console
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STUDIO_WORK' | 'CAPABILITIES' | 'PALAVER_CORE'>('OVERVIEW');

  // Contact / Transmission Input registers
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [transmittingSignal, setTransmittingSignal] = useState(false);
  const [transmissionCompleted, setTransmissionCompleted] = useState(false);

  // Exit screen logs
  const [typedLogs, setTypedLogs] = useState<string[]>([]);
  const [logIndex, setLogIndex] = useState(0);

  // Interactive Bento Dimension States
  const [geoPrecision, setGeoPrecision] = useState(85);
  const [matGloss, setMatGloss] = useState(72);
  const [chromaticIntensity, setChromaticIntensity] = useState(40);
  const [spatiality, setSpatiality] = useState(65);

  // PALAVER COR SYSTEM - Conversation State
  const [palaverInput, setPalaverInput] = useState('');
  const [isSavantTyping, setIsSavantTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'greeting_1',
      sender: 'SAVANT',
      text: 'Secure neural dialogue link established. Welcome to Savant Experimental’s Core Intelligence Node. I am SAVANT_COG_C1, your architectural discovery companion.',
      timestamp: '00:01'
    },
    {
      id: 'greeting_2',
      sender: 'SAVANT',
      text: 'We are prepared to collaborate on high-tension contemporary designs, custom procedural WebGL interfaces, and authentic non-cliche digital brand narratives. Express your core inquiry, or drop a project briefing file for algorithmic vector parsing.',
      timestamp: '00:02'
    }
  ]);

  // Drag and Drop State
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileMeta | null>(null);
  const [scanningFile, setScanningFile] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Ref to chat flow container for auto scrolls
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Peak statistical multipliers matching the flight speeds
  const peakVelocity = Math.max(2847, telemetry.velocity);
  const finalAltitude = 15200; // standard benchmark target altitude

  const accentColor = pilotConfig.hudColor || '#00f2ff';

  const captainLogs = [
    `LOG_ID: SECURE_CAPTAIN_LOG_[${pilotConfig.callsign}]`,
    'MISSION SEQUENCE ENVELOPE: EXTRAPOLATION SUCCESS',
    `COGNITIVE DIVISION ALLOCATION: [${pilotConfig.division}]`,
    `TACTICAL RUN TARGET: ${pilotConfig.objective}`,
    'TRANSIT DEVIATION HARMONIC INDEX: 1.000 (NOMINAL)',
    `CHRONOS FUSION RESONATOR: SYNCHRONIZED AT ${pilotConfig.humFrequency}HZ`,
    `COCKPIT VECTOR ANALYSIS: PEAK SPEED JUMP ${peakVelocity} M/S`,
    `FINAL ALTITUDE METRICS: ${finalAltitude} KM ABOVE SECTOR SHELF`,
    'CORE POWER COMPILATION INTEGRITY: 100.00% MAX',
    'SAVANT_CORE SYSTEM RE-CONVERGENCE: FULL INTEGRATION COMPLETE',
    'ALL QUANTUM VECTORS SET TO STANDBY. PROTOCOLS SECURE.'
  ];

  // Auto-scroll chat to latest messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isSavantTyping]);

  // Typing effect helper for EXIT state
  useEffect(() => {
    if (phase !== 'EXIT') return;

    if (logIndex < captainLogs.length) {
      const interval = setTimeout(() => {
        setTypedLogs((prev) => [...prev, captainLogs[logIndex]]);
        setLogIndex((val) => val + 1);
        playDiagnosticBlip(750, 0.04);
      }, 400);

      return () => clearTimeout(interval);
    }
  }, [phase, logIndex, captainLogs, playDiagnosticBlip]);

  // Handle Engage Core action
  const handleEngageCore = () => {
    playWarpWhoosh();
    addTelemetryLog('WARNING: ENGAGING QUANTUM SINGULARITY CORE. HYPERWARPE CONVERGENCE...');
    setTimeout(() => {
      setPhase('EXIT');
    }, 450);
  };

  // Handle Terminate Session action (fade-out reset loop)
  const handleTerminate = () => {
    playDiagnosticBlip(380, 0.25);
    setTimeout(() => {
      resetSim();
    }, 600);
  };

  // Tab switching audio feedback
  const handleTabSwitch = (newTab: typeof activeTab) => {
    playDiagnosticBlip(680, 0.05);
    setActiveTab(newTab);
  };

  // Trigger brief biomechanical clicks on slider adjustments
  const handleSliderChange = (type: string, value: number, setter: (val: number) => void) => {
    setter(value);
    if (Math.abs(value % 5) < 1) {
      playDiagnosticBlip(900 + value * 2, 0.02);
    }
  };

  // Formulate responses from the dialogue Oracle
  const getSavantDialogueResponse = (query: string): string => {
    const q = query.toLowerCase();
    
    if (q.includes('webgl') || q.includes('immersive') || q.includes('3d') || q.includes('shader')) {
      return "Initiating design briefing algorithm. Live 3D WebGL portals break down the passive barriers of standard flat layouts. We bind responsive physics, custom geometric shaders, and micro-acoustics directly to core brand narratives. Standard solutions compromise attention; spatial assets capture and sustain it.";
    }
    
    if (q.includes('partnership') || q.includes('collaborate') || q.includes('work with') || q.includes('hire')) {
      return "Cognitive synergy protocol activated. We partner select-exclusively with tech leadership, creative pioneers, and high-end enterprises seeking proprietary digital footprints. We replace clichéd templates with authentic, tailored interactive artifacts. Would you like to digitize your initial timeline?";
    }
    
    if (q.includes('philosophy') || q.includes('method') || q.includes('how you work')) {
      return "Our methodology centers on architectural honesty. Every pixel grid, typography weight, and vector motion is stripped of decorative AI-slop or useless margin metrics. We let pure high-contrast composition, kinetic timing, and clean functional structures deliver maximum sophistication.";
    }

    if (q.includes('brand') || q.includes('identity') || q.includes('logo')) {
      return "A premium brand is a cohesive kinetic loop. We engineer comprehensive visual packages—combining vector logo geometry, custom layouts, and interactive behavioral systems—so your brand behaves organically and responsive to active user input.";
    }

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('greetings')) {
      return "Dialogue link secure. Welcome, pilot. I am compiled to analyze and consult on custom high-end systems. How can Savant's computational design vectors resolve your needs?";
    }

    return "Inquiry ingested by the Savant Cognitive Cluster. We approach digital craft with experimental rigor and physical precision. Your parameters have been beamed to our master directory; we will decrypt and align on your vector within 24 standard cycles.";
  };

  // Process custom messages sent inside Palaver Core
  const handleSendPalaverMessage = async (text: string) => {
    if (!text.trim() || isSavantTyping) return;

    playDiagnosticBlip(780, 0.08);
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: 'USER',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...chatMessages, userMsg];
    setChatMessages(updatedHistory);
    setPalaverInput('');
    setIsSavantTyping(true);

    try {
      let currentTick = 0;
      const ticks = setInterval(() => {
        if (currentTick < 4) {
          playDiagnosticBlip(820 + currentTick * 40, 0.02);
          currentTick++;
        } else {
          clearInterval(ticks);
        }
      }, 100);

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: updatedHistory.slice(-10)
        })
      });

      if (!res.ok) {
        throw new Error("API call returned fatal response status");
      }

      const data = await res.json();
      const savantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'SAVANT',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, savantMsg]);
      setIsSavantTyping(false);
      addTelemetryLog('DIAL_ENG: Secure intelligence reply compiled.');
    } catch (err) {
      console.warn("Backend API not reachable. Falling back to simulated local core diagnostics.", err);
      const responseText = getSavantDialogueResponse(text);
      const savantMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        sender: 'SAVANT',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, savantMsg]);
      setIsSavantTyping(false);
      addTelemetryLog('DIAL_ENG: Simulated local core reply translated.');
    }
  };

  // Handle Preset Queries
  const handlePresetQuery = (preset: string) => {
    handleSendPalaverMessage(preset);
  };

  // Drag-and-drop file uploader simulation with custom analytics parsing!
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const onDragLeave = () => {
    setIsDraggingFile(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const processFile = (file: File) => {
    setScanningFile(true);
    setScanProgress(0);
    playDiagnosticBlip(320, 0.15);
    addTelemetryLog(`SEC_SCAN: Ingesting external document [${file.name}]...`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setScanProgress(progress);
      playDiagnosticBlip(400 + progress * 8, 0.03);

      if (progress >= 100) {
        clearInterval(interval);
        
        const reader = new FileReader();
        reader.onload = async (e) => {
          const fileText = (e.target?.result as string) || "";
          
          setScanningFile(false);
          playDiagnosticBlip(980, 0.22);
          triggerScreenShake(4);

          const sizeKB = (file.size / 1024).toFixed(1);
          const derivedComplexity = Math.floor(65 + Math.random() * 30);
          const derivedReadiness = Math.floor(80 + Math.random() * 19);

          setUploadedFile({
            name: file.name,
            size: `${sizeKB} KB`,
            type: file.type || 'TXT_DATA_PLANE',
            vectorComplexity: derivedComplexity,
            readinessRating: derivedReadiness,
          });

          setChatMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              sender: 'SYSTEM',
              text: `Asset [${file.name}] logged successfully. Invoking Gemini design matrix core analysis...`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);

          try {
            const apiRes = await fetch("/api/gemini/analyze-brief", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type || 'TXT_DATA_PLANE',
                fileComplexity: derivedComplexity,
                fileText: fileText.slice(0, 15000)
              })
            });
            const data = await apiRes.json();
            
            setChatMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substring(2, 9),
                sender: 'SAVANT',
                text: data.analysis || "Analysis received, coordinates aligned.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            addTelemetryLog(`SEC_SCAN: Gemini assessment completed for [${file.name}].`);
          } catch (err) {
            console.warn("Brief analysis API call failed. Falling back to local report.", err);
            setChatMessages((prev) => [
              ...prev,
              {
                id: Math.random().toString(36).substring(2, 9),
                sender: 'SYSTEM',
                text: `Asset [${file.name}] parsed successfully. Size: ${sizeKB}KB. Cyber vector complexity score: ${derivedComplexity}%. Synthesis suitability: ${derivedReadiness}% optimum alignment. Core stands active for dialogue concerning this brief.`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            addTelemetryLog(`SEC_SCAN: Dataset [${file.name}] mapped. Suitability Index: ${derivedReadiness}%`);
          }
        };

        reader.onerror = () => {
          clearInterval(interval);
          setScanningFile(false);
          addTelemetryLog(`SEC_SCAN: Failed back to read file [${file.name}].`);
        };

        reader.readAsText(file);
      }
    }, 120);
  };

  // Submit Contact Form
  const handleSubmitTransmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (transmittingSignal || transmissionCompleted) return;

    setTransmittingSignal(true);
    playDiagnosticBlip(440, 0.1);
    addTelemetryLog(`TRANSMITTING QUANTUM SIGNAL ENVELOPE TO SAVANT EXPERIMENTAL...`);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      playDiagnosticBlip(550 + progress * 4, 0.05);
      if (progress >= 100) {
        clearInterval(interval);
        setTransmittingSignal(false);
        setTransmissionCompleted(true);
        triggerScreenShake(8);
        playDiagnosticBlip(1150, 0.25);
        addTelemetryLog(`SEC_LINK: Signal ingested by Savant Creative Cluster successfully.`);
        
        // Auto add a smart confirmation from AI
        setChatMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            sender: 'SAVANT',
            text: `Registry complete. Transmission successfully compiled from developer address [${senderEmail}]. Securing coordinates. Standard response cycle active.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        
        // Reset inputs
        setSenderName('');
        setSenderEmail('');
      }
    }, 180);
  };

  return (
    <div id="arrived-studio-screen" className="absolute inset-0 flex flex-col items-center justify-center font-mono text-zinc-300 p-3 sm:p-4 md:p-8 overflow-hidden bg-black/60 select-none z-15">
      
      {/* High-fidelity CRT and vector scan line overlays to look atmospheric */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute inset-0 bg-[#000000]/10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none" />

      {/* =======================================
          A. PHASE: DESTINATION (STUDIO ARRIVED CARD)
          ======================================= */}
      {phase === 'DESTINATION' && (
        <div 
          className={`max-w-4xl w-full border border-zinc-900 bg-zinc-950/92 backdrop-blur-[20px] rounded-[12px] p-4 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.85)] relative transition-all duration-700 ease-out flex flex-col justify-between ${
            isMounted ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
        >
          {/* Ambient Accent Radial Glow of the chosen HUD theme */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
            style={{
              background: `radial-gradient(circle at 50% 15%, ${accentColor}15, transparent 60%)`
            }}
          />

          {/* Luxury Technical Outer Brackets and Label Ticks */}
          <div style={{ borderColor: accentColor }} className="absolute顶 absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-[8px] -mt-0.5 -ml-0.5 pointer-events-none opacity-85" />
          <div style={{ borderColor: accentColor }} className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-[8px] -mt-0.5 -mr-0.5 pointer-events-none opacity-85" />
          <div style={{ borderColor: accentColor }} className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-[8px] -mb-0.5 -ml-0.5 pointer-events-none opacity-85" />
          <div style={{ borderColor: accentColor }} className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-[8px] -mb-0.5 -mr-0.5 pointer-events-none opacity-85" />

          {/* Micro structural information texts modeled after premium design suites */}
          <span className="absolute top-1 left-7 text-[5px] text-zinc-650 tracking-widest pointer-events-none">COORD_Z_85 // SYSTEM_GATES</span>
          <span className="absolute top-1 right-7 text-[5px] text-zinc-650 tracking-widest pointer-events-none">SEC_VAL_TRUE // NOMINAL_WARP</span>

          {/* Navigation Bar / Station ID */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900/60 pb-3 mb-3 z-10 gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <Terminal style={{ color: accentColor }} className="w-5 h-5 animate-pulse" />
                <div style={{ backgroundColor: accentColor }} className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full animate-ping" />
              </div>
              <div>
                <h1 style={{ color: accentColor }} className="text-[12px] font-black tracking-[0.25em] uppercase">SAVANT EXPERIMENTAL</h1>
                <p className="text-[8px] text-zinc-550 leading-none">CREATIVE VECTOR SYSTEMS & DIGITIZED METHOD MATRIX</p>
              </div>
            </div>
            
            {/* HUD Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 border border-zinc-900 bg-zinc-900/45 rounded-md text-[8px] text-emerald-400 font-extrabold tracking-widest animate-pulse self-start sm:self-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              PORTAL_CALIBRATED_ACTIVE
            </div>
          </div>

          {/* TACTICAL TAB SELECTION RAIL */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-3.5 z-10">
            {([
              { id: 'OVERVIEW', label: 'OVERVIEW_PRIME', icon: Info, detail: 'THE_STATEMENT' },
              { id: 'STUDIO_WORK', label: 'PORTFOLIO_WORKS', icon: Briefcase, detail: 'ACTIVE_MATRICES' },
              { id: 'CAPABILITIES', label: 'CAPABILITIES_INDEX', icon: Layers, detail: 'SKILLS_READOUT' },
              { id: 'PALAVER_CORE', label: 'PALAVER_DIALOGUE', icon: MessageSquare, detail: 'AUTONOMOUS_COG' }
            ] as const).map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabSwitch(tab.id)}
                  style={{
                    borderColor: isActive ? accentColor : undefined,
                    boxShadow: isActive ? `inset 0 0 10px ${accentColor}12` : undefined
                  }}
                  className={`py-2 px-2 text-left font-black tracking-widest border transition duration-300 uppercase cursor-pointer rounded-md flex flex-col justify-between select-none relative h-13 group ${
                    isActive
                      ? 'bg-zinc-950 text-white'
                      : 'border-zinc-900/50 bg-zinc-900/10 text-zinc-550 hover:text-zinc-350 hover:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <TabIcon style={{ color: isActive ? accentColor : undefined }} className="w-3.5 h-3.5" />
                    <span className="text-[5.5px] text-zinc-600 font-bold group-hover:text-zinc-400 transition">{tab.detail}</span>
                  </div>
                  <span className="text-[9px] mt-1.5 block">{tab.label}</span>
                  {isActive && (
                    <div style={{ backgroundColor: accentColor }} className="absolute bottom-0 inset-x-4 h-[1px] opacity-70 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC METRIC TAB CONTROLLER HEIGHT */}
          <div className="h-[285px] border border-zinc-900/60 bg-black/65 rounded-lg p-3 md:p-4.5 overflow-y-auto hover:scrollbar-zinc-800 font-mono text-zinc-300 z-10 select-text leading-relaxed relative flex flex-col justify-between scrollbar-thin">
            
            {/* TAB 1: OVERVIEW_PRIME (SOPHSTICATED BENTO LAYOUT) */}
            {activeTab === 'OVERVIEW' && (
              <div className="space-y-3.5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
                    <h3 style={{ color: accentColor }} className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      ■ CONTEXT: INITIAL_CONCEPTS // ADVANCED CREATIVE SYSTEMS
                    </h3>
                    <span className="text-[7.5px] text-zinc-500 font-bold">NODE: CORE_VECT</span>
                  </div>
                  
                  {/* Bento Row 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                    <div className="md:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-md p-3">
                      <span style={{ color: accentColor }} className="text-[8px] font-black tracking-wider uppercase block mb-1">■ DIRECTIVE / SAVANT METAPHOR</span>
                      <p className="text-[10.5px] text-zinc-400 leading-normal">
                        We operate <span className="text-white">where raw experimental artistry meets bulletproof system physics</span>. Standard layouts commodify interest; Savant engineering compiles interactive dimensional structures specifically to capture high-value retention. We reject standard templates and superfluous UI slop to let elegant typography and cohesive behavior define premium caliber.
                      </p>
                    </div>

                    <div className="md:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-md p-3 flex flex-col justify-between">
                      <div>
                        <span style={{ color: accentColor }} className="text-[8px] font-black tracking-wider uppercase block mb-1">■ SYNAPSE CAPACITIES</span>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] border-b border-zinc-950 pb-0.5">
                            <span className="text-zinc-500">KINETIC FLIGHT RESOLVER</span>
                            <span className="text-emerald-400 font-bold">100% ONLINE</span>
                          </div>
                          <div className="flex justify-between text-[9px] border-b border-zinc-950 pb-0.5">
                            <span className="text-zinc-500">PROCEDURAL ASTEROID FIELD</span>
                            <span className="text-emerald-400 font-bold">DURABLE</span>
                          </div>
                          <div className="flex justify-between text-[9px]">
                            <span className="text-zinc-500">ACES FILM COLOR GRADE</span>
                            <span className="text-emerald-400 font-bold">1.25 EXPOSURE</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-[7px] text-zinc-650 mt-2">CHRONOS_FUSION_RESONATOR RECONNECT: STANDARD</div>
                    </div>
                  </div>
                </div>

                {/* Interactive Custom Tuning Sliders representing Studio Parameters! */}
                <div className="bg-zinc-900/25 border border-zinc-900/50 p-3 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8.5px] font-extrabold text-white tracking-widest flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-sky-400" />
                      PROCEDURAL CORE DYNAMICS TUNING
                    </span>
                    <span className="text-[7.5px] text-zinc-550 italic uppercase">Acoustic diagnostics active on slide</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                    {/* SLIDER 1 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold">
                        <span className="text-zinc-500">GEOMETRIC_PREC</span>
                        <span style={{ color: accentColor }}>{geoPrecision}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="100" 
                        value={geoPrecision} 
                        onChange={(e) => handleSliderChange('precision', parseInt(e.target.value), setGeoPrecision)}
                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* SLIDER 2 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold">
                        <span className="text-zinc-500">MATERIAL_GLOSS</span>
                        <span style={{ color: accentColor }}>{matGloss}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="100" 
                        value={matGloss} 
                        onChange={(e) => handleSliderChange('gloss', parseInt(e.target.value), setMatGloss)}
                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* SLIDER 3 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold">
                        <span className="text-zinc-500">CHROM_ABERRATION</span>
                        <span style={{ color: accentColor }}>{chromaticIntensity}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={chromaticIntensity} 
                        onChange={(e) => handleSliderChange('chromatic', parseInt(e.target.value), setChromaticIntensity)}
                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
                      />
                    </div>

                    {/* SLIDER 4 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-bold">
                        <span className="text-zinc-500">SPATIAL_INDEX</span>
                        <span style={{ color: accentColor }}>{spatiality}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={spatiality} 
                        onChange={(e) => handleSliderChange('spatiality', parseInt(e.target.value), setSpatiality)}
                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PORTFOLIO_WORKS (HIGH END ARCHITECTURAL GRID) */}
            {activeTab === 'STUDIO_WORK' && (
              <div className="space-y-3.5 h-full">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <h3 style={{ color: accentColor }} className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    ■ INDEXED SYSTEM RELEASES // ACTIVE PROJECTS
                  </h3>
                  <span className="text-[7.5px] text-zinc-550">REF: REALIZED_03</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* WORK 1 */}
                  <div className="border border-zinc-900 bg-zinc-900/20 p-3 rounded-md flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative group">
                    <div className="absolute top-1 right-2 text-[6px] text-zinc-650 font-black tracking-widest leading-none pointer-events-none">V_GATE_01</div>
                    <div>
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-950">
                        <span className="text-[11px] font-black text-white hover:text-[#00f2ff] transition">PROJECT_NEBULA_GATE</span>
                      </div>
                      <p className="text-[9px] text-zinc-450 leading-relaxed min-h-[46px]">
                        Architectural interactive branding package. Generates beautiful dynamic vector portals directly inside React code mapping to secure user registers.
                      </p>
                    </div>
                    <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-zinc-950">
                      <span className="text-[7px] text-sky-400 font-bold font-mono tracking-tight">Complexity: 94% SEC</span>
                      <span className="text-[6.5px] border border-sky-950/40 bg-sky-950/20 px-1.5 py-0.5 rounded font-black text-sky-400 uppercase tracking-wider">
                        ACTIVE // LNK
                      </span>
                    </div>
                  </div>

                  {/* WORK 2 */}
                  <div className="border border-zinc-900 bg-zinc-900/20 p-3 rounded-md flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative group">
                    <div className="absolute top-1 right-2 text-[6px] text-zinc-650 font-black tracking-widest leading-none pointer-events-none">C_FLIGHT_02</div>
                    <div>
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-950">
                        <span className="text-[11px] font-black text-white">CHRONOS_CORE</span>
                      </div>
                      <p className="text-[9px] text-zinc-450 leading-relaxed min-h-[46px]">
                        WebGL trajectory simulator engine compiled using optimized custom shader sheets and volumetric stellar clouds.
                      </p>
                    </div>
                    <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-zinc-950">
                      <span className="text-[7px] text-emerald-400 font-bold font-mono tracking-tight">Shader Blocks: 119/120</span>
                      <span className="text-[6.5px] border border-emerald-950/40 bg-emerald-950/20 px-1.5 py-0.5 rounded font-black text-emerald-400 uppercase tracking-wider">
                        DEPLOYED
                      </span>
                    </div>
                  </div>

                  {/* WORK 3 */}
                  <div className="border border-zinc-900 bg-zinc-900/20 p-3 rounded-md flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative group">
                    <div className="absolute top-1 right-2 text-[6px] text-zinc-650 font-black tracking-widest leading-none pointer-events-none">H_MAT_03</div>
                    <div>
                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-950">
                        <span className="text-[11px] font-black text-white">HUMAN_METRIC_HYPER</span>
                      </div>
                      <p className="text-[9px] text-zinc-450 leading-relaxed min-h-[46px]">
                        Bespoke interactive UX framework implementing physical micro-animations, acoustic feedback curves, and grid spacing calibration.
                      </p>
                    </div>
                    <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-zinc-950">
                      <span className="text-[7px] text-amber-500 font-bold font-mono tracking-tight">Stability: OPTIMUM</span>
                      <span className="text-[6.5px] border border-amber-950/40 bg-amber-950/20 px-1.5 py-0.5 rounded font-black text-amber-500 uppercase tracking-wider">
                        SECURE // CALIB
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/10 border border-zinc-900 p-2.5 rounded-md flex items-center justify-between text-[8px] mt-2">
                  <span className="text-zinc-550 flex items-center gap-1.5 font-bold">
                    <span className="w-1 h-1 rounded-full bg-orange-400 animate-ping" />
                    SYSTEM REGISTRY ALERT: SHADER STAGE IS PRE-COMPILED FOR ULTRA-FAST LOADING
                  </span>
                  <a href="#view-manifest" onClick={(e) => { e.preventDefault(); playDiagnosticBlip(620, 0.04); }} className="text-white hover:underline uppercase flex items-center gap-1">
                    Request Physical Booklet
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
            )}

            {/* TAB 3: CAPABILITIES (PREMIUM TECHNICAL SKILLS RADAR) */}
            {activeTab === 'CAPABILITIES' && (
              <div className="space-y-3 h-full">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                  <h3 style={{ color: accentColor }} className="text-xs font-black uppercase tracking-widest flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    ■ ADVANCED SPECIALITIES // METRIC ARCHITECTURE
                  </h3>
                  <span className="text-[7.5px] text-zinc-550">REF: CAP_SCHEMA</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* METRIC 1 */}
                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">01_PROCEDURAL WebGL SHADER WORK</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-sky-500/15 border border-sky-400/25 text-sky-400 rounded-md font-bold">98.6% CORE</span>
                    </div>
                    <p className="text-[9px] text-[#9a9a9f]">
                      Developing mathematical GPU shaders, fluid dynamics, particles simulations, and vertex morph targets tailored for real-time web execution.
                    </p>
                  </div>

                  {/* METRIC 2 */}
                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">02_AUTHENTIC CONTEMPORARY BRAND DESIGN</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 rounded-md font-bold">OPTIMUM</span>
                    </div>
                    <p className="text-[9px] text-[#9a9a9f]">
                      Configuring distinctive visual languages. We reject templates to carve unparalleled typography formulas, solid layout grids, and brand matrices.
                    </p>
                  </div>

                  {/* METRIC 3 */}
                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">03_MICRO-ACOUSTIC DESIGN & SEAMLESS INTERACTION</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/15 border border-amber-400/25 text-amber-500 rounded-md font-bold">100% G-GATE</span>
                    </div>
                    <p className="text-[9px] text-[#9a9a9f]">
                      Orchestrating biomechanical acoustic feedbacks, audio buffers synthesized on-the-fly, and state transitions using buttery animations.
                    </p>
                  </div>

                  {/* METRIC 4 */}
                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-white uppercase tracking-wider">04_FULL-STACK SYSTEMS INTEGRATION</span>
                      <span className="text-[8px] px-1.5 py-0.5 bg-purple-500/15 border border-purple-400/25 text-purple-400 rounded-md font-bold">SECURE_DYN</span>
                    </div>
                    <p className="text-[9px] text-[#9a9a9f]">
                      Constructing bulletproof React components, high-integrity types, Node infrastructure pipelines, and responsive memory buffers.
                    </p>
                  </div>
                </div>

                <div className="text-[7.5px] text-zinc-650 text-center tracking-widest mt-1">
                  CYBER CAPABILITY MATRIX REGISTERED // ALL SECTOR COGNITIVE INDEX COMPILED SUCCESSFUL
                </div>
              </div>
            )}

            {/* TAB 4: PALAVER_CORE (MASSIVE MULTI-INTERACTIVE DIALOGUE ORACLE & DRAG DROP SCANNER) */}
            {activeTab === 'PALAVER_CORE' && (
              <div className="h-full flex flex-col md:flex-row gap-3.5 overflow-hidden">
                
                {/* Left Panel: Dialogue Stream */}
                <div className="flex-1 flex flex-col justify-between h-full min-h-0 bg-zinc-950/40 p-2.5 border border-zinc-900/60 rounded-md relative">
                  
                  {/* Chat Message Lists */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin max-h-[165px] md:max-h-[190px]">
                    {chatMessages.map((msg) => (
                      <div 
                        key={msg.id} 
                        className={`flex flex-col max-w-[85%] ${
                          msg.sender === 'USER' 
                            ? 'ml-auto items-end bg-sky-500/10 border border-sky-450/20 p-2 rounded-r-none rounded-md' 
                            : msg.sender === 'SYSTEM'
                              ? 'mx-auto w-full items-center bg-zinc-900/60 border border-zinc-900/50 p-2 rounded-md text-[8.5px] text-emerald-400/90'
                              : 'mr-auto items-start bg-zinc-900/35 border border-zinc-900 p-2 rounded-l-none rounded-md'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[6.5px] text-zinc-550 mb-0.5 font-bold uppercase select-none">
                          <span style={{ color: msg.sender === 'USER' ? accentColor : undefined }}>
                            {msg.sender === 'USER' ? 'MISSION_PILOT_CMD' : msg.sender === 'SYSTEM' ? 'SYNAPSE_SYSTEM_ASSESS' : 'SAVANT_COG_C1'}
                          </span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className={`text-[9.5px] leading-relaxed select-text ${msg.sender === 'USER' ? 'text-white' : 'text-zinc-300'}`}>{msg.text}</p>
                      </div>
                    ))}
                    
                    {isSavantTyping && (
                      <div className="mr-auto items-start bg-zinc-900/30 border border-zinc-900 p-2 rounded-md max-w-[80%]">
                        <div className="flex items-center gap-1.5 text-[6.5px] text-zinc-550 mb-1 font-bold">
                          <span>SAVANT_COG_C1</span>
                          <span>•</span>
                          <span>THINKING</span>
                        </div>
                        <div className="flex gap-1 items-center py-0.5">
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Preset Quick Queries Suggestion Bar (Smart UI UX enhancement) */}
                  <div className="flex gap-1.5 overflow-x-auto py-1 mb-2 border-t border-zinc-900 select-none pb-1.5 scrollbar-none">
                    <button 
                      onClick={() => handlePresetQuery("Request Bespoke WebGL Portal")}
                      disabled={isSavantTyping}
                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
                    >
                      💡 Request WebGL Audit
                    </button>
                    <button 
                      onClick={() => handlePresetQuery("Propose Design Partnership")}
                      disabled={isSavantTyping}
                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
                    >
                      🤝 Partnership Proposal
                    </button>
                    <button 
                      onClick={() => handlePresetQuery("Analyze Studio Creative Philosophy")}
                      disabled={isSavantTyping}
                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
                    >
                      👁️ Architecture Method
                    </button>
                    <button 
                      onClick={() => handlePresetQuery("Discuss Proprietary Brand Metaphor")}
                      disabled={isSavantTyping}
                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
                    >
                      📐 Custom Brand Metaphor
                    </button>
                  </div>

                  {/* Message Input line */}
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={palaverInput}
                      disabled={isSavantTyping}
                      onChange={(e) => setPalaverInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendPalaverMessage(palaverInput);
                      }}
                      className="flex-1 bg-black/80 border border-zinc-900 focus:outline-none focus:border-zinc-700 p-2 text-[10px] text-white rounded font-mono"
                      placeholder={isSavantTyping ? "Savant core synthesising response..." : "Query the Savant Dialogue core or transmit message..."}
                    />
                    <button 
                      onClick={() => handleSendPalaverMessage(palaverInput)}
                      disabled={isSavantTyping || !palaverInput.trim()}
                      style={{ backgroundColor: accentColor }}
                      className="p-2 px-3 text-black font-extrabold hover:opacity-90 active:scale-95 transition rounded-md flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3 text-black shrink-0" />
                    </button>
                  </div>

                </div>

                {/* Right Panel: Integrated File Briefing dragging system */}
                <div className="w-full md:w-[210px] flex flex-col justify-between h-full bg-zinc-950/20 p-2.5 border border-zinc-900/60 rounded-md">
                  
                  {/* File Upload Landings with drag support */}
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={triggerFileSelect}
                    className={`relative flex-1 flex flex-col items-center justify-center p-3 text-center border-2 border-dashed rounded-md cursor-pointer transition select-none h-[115px] md:h-auto ${
                      isDraggingFile 
                        ? 'border-cyan-400 bg-cyan-900/5' 
                        : 'border-zinc-900 bg-black/40 hover:border-zinc-800 hover:bg-black/60'
                    }`}
                  >
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.txt,.json,.png,.jpg,.jpeg"
                    />

                    {scanningFile ? (
                      <div className="flex flex-col items-center gap-1.5">
                        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
                        <span className="text-[8.5px] font-black text-white">SCANNING_BRIEF: {scanProgress}%</span>
                        <div className="w-24 h-1 bg-zinc-900 mt-1 rounded-full overflow-hidden">
                          <div style={{ width: `${scanProgress}%` }} className="h-full bg-cyan-400 transition-all duration-150" />
                        </div>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex flex-col items-center gap-1">
                        <FileText className="w-7 h-7 text-emerald-400" />
                        <span className="text-[9.5px] font-black text-white truncate max-w-[170px]">{uploadedFile.name}</span>
                        <span className="text-[7.5px] text-zinc-550 uppercase">{uploadedFile.size} • LOADED ok</span>
                        <span className="text-[7.5px] block font-extrabold text-[#00f2ff] underline mt-1">TAP_TO_REPLACE</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 group">
                        <Upload className="w-7 h-7 text-zinc-700 group-hover:text-zinc-550 transition animate-bounce" />
                        <span className="text-[9px] font-black text-zinc-300">ATTACH BRIEF & REGS</span>
                        <p className="text-[7px] text-zinc-550 leading-snug">Drag & drop project brief file, or click to upload</p>
                      </div>
                    )}
                  </div>

                  {/* File assessors details output */}
                  <div className="mt-3 bg-zinc-900/40 border border-zinc-950 p-2.5 rounded-md">
                    <span className="text-[7.5px] font-bold text-zinc-550 block mb-1 uppercase tracking-widest">Assessment Matrix:</span>
                    {uploadedFile ? (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[8.5px] border-b border-zinc-950 pb-0.5">
                          <span className="text-zinc-500">VECTOR COMPLEX:</span>
                          <span className="text-white font-bold">{uploadedFile.vectorComplexity}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[8.5px] border-b border-zinc-950 pb-0.5">
                          <span className="text-zinc-500">SUITABILITY INDEX:</span>
                          <span className="text-white font-bold">{uploadedFile.readinessRating}%</span>
                        </div>
                        <div className="flex justify-between items-center text-[8.5px]">
                          <span className="text-zinc-500">ASSESSMENT:</span>
                          <span className="text-emerald-400 font-extrabold text-[8px]">OPTIMUM</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[8.5px] text-zinc-650 italic text-center py-2 uppercase leading-snug">
                        Ready to ingest brief for custom vector telemetry analysis.
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

          {/* SATELLITE BEAM TRANSMISSION DETAILS & ACTION ROW */}
          <div className="mt-3.5 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-zinc-900/60 pt-3.5 z-10">
            
            {/* Embedded Inline Quick Email Contact Submission as second safety */}
            {activeTab !== 'PALAVER_CORE' ? (
              <div className="flex items-center gap-2 text-[8px] text-zinc-500 select-none self-start">
                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>COCKPIT_VEHICLE: FLUID PORTAL ESTABLISHED NOMINAL</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitTransmission} className="flex flex-wrap items-center gap-2.5 self-start w-full md:w-auto">
                <input 
                  type="email" 
                  required
                  placeholder="SECURE_ADDRESS@MAIL.COM"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  className="bg-black/95 border border-zinc-900 focus:outline-none focus:border-zinc-700 px-2 py-1 text-[8px] text-zinc-300 rounded font-mono w-48 shrink-0"
                />
                <button 
                  type="submit"
                  disabled={transmittingSignal || !senderEmail}
                  className="px-3.5 py-1.5 text-black font-extrabold text-[7.5px] uppercase tracking-widest rounded transition cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: accentColor }}
                >
                  {transmittingSignal ? 'BEAM_FREQUENCY...' : 'BEAM CONTACT SIGNAL'}
                </button>
              </form>
            )}
            
            <button
              id="destination-engage-core-btn"
              onClick={handleEngageCore}
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 0 16px ${accentColor}33`,
              }}
              className="w-full md:w-auto px-8 py-2 bg-sky-400 text-black hover:brightness-110 shadow-lg transition font-extrabold uppercase tracking-widest text-[9.5px] rounded-md cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5 hover:scale-[1.01] self-end"
            >
              ENGAGE_QUANTUM_CORE
              <Zap className="w-3.5 h-3.5 text-black animate-[bounce_1.5s_infinite]" />
            </button>
          </div>
        </div>
      )}

      {/* =======================================
          B. PHASE: EXIT (MISSION COMPLETE STATS)
          ======================================= */}
      {phase === 'EXIT' && (
        <div 
          className={`max-w-2xl w-full border border-zinc-900 bg-zinc-950/98 rounded-[12px] p-4 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] relative transition-all duration-700 ease-out ${
            isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {/* Accent radial glow */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 10%, ${accentColor}10, transparent 50%)`
            }}
          />

          {/* Corner accents */}
          <div style={{ borderColor: accentColor }} className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl-[6px]" />
          <div style={{ borderColor: accentColor }} className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 rounded-tr-[6px]" />
          <div style={{ borderColor: accentColor }} className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 rounded-bl-[6px]" />
          <div style={{ borderColor: accentColor }} className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br-[6px]" />

          {/* Core top status header */}
          <div className="flex items-center gap-2.5 border-b border-zinc-900/60 pb-3 mb-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div>
              <h1 style={{ color: accentColor }} className="text-[11px] font-bold tracking-widest uppercase">SAVANT_CORE // MISSION COMPLETION LOG REPORT</h1>
              <p className="text-[8px] text-zinc-550">NOMINAL QUANTUM CONVERGENCE FLUID COEFFICIENT (0.00)</p>
            </div>
          </div>

          {/* RETRO SCI-FI COMPILER COMPLETED GRAPHIC ACCENT */}
          <div className="mb-4 bg-zinc-950 border border-zinc-900 p-2 text-center text-[6.5px] font-mono select-none overflow-x-auto leading-tight rounded-md">
            <pre className="inline-block text-left whitespace-pre" style={{ color: accentColor }}>
{`   _____ _____ __     __ _____  _   _ _______    _____ ____  _____  ______
  / ____|  _  |\\ \\   / // ____|| \\ | |__   __|  / ____/ __ \\|  _ \\|  ____|
 | (___ | |_| | \\ \\_/ /| |  __  |  \\| |  | |    | |   | |  | | |_) | |__   
  \\___ \\|  _  |  \\   / | | |_ | | . \` |  | |    | |   | |  | |  _  |  __|  
  ____) | | | |   | |  | |__| | | |\\  |  | |    | |___| |__| | |_) | |____ 
 |_____/|_| |_|   |_|   \\_____| |_| \\_|  |_|     \\_____\\____/|____/|______|`}
            </pre>
          </div>

          {/* Dynamic statistics dashboards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5 select-none">
            {/* CARD 1 */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">GATES_SAMPLED</span>
              <span className="text-sm font-black text-white block">05 / 05</span>
              <span className="text-[7.5px] text-emerald-400 leading-none">NOMINAL</span>
            </div>

            {/* CARD 2 */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">PEAK_VEL_M_S</span>
              <span className="text-sm font-black text-white block">{peakVelocity}</span>
              <span className="text-[7.5px] text-zinc-500 leading-none">WARP SCALE</span>
            </div>

            {/* CARD 3 */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">ALTITUDE_SURF</span>
              <span className="text-sm font-black text-white block">15,200 km</span>
              <span style={{ color: accentColor }} className="text-[7.5px] leading-none">COSMIC_SHELF</span>
            </div>

            {/* CARD 4 */}
            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">CORE_FUSION</span>
              <span className="text-sm font-black text-emerald-400 block">ENGAGED</span>
              <span className="text-[7.5px] text-emerald-400 leading-none">SYNC_ACTIVE</span>
            </div>
          </div>

          {/* Scrolling typewriter logs */}
          <div className="space-y-1.5 mb-5.5">
            <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-widest">■ CAPTAINS_FLIGHT_RECORDS :</span>
            <div 
              id="exit-typewriting-console" 
              className="w-full bg-black/80 border border-zinc-900 p-3 h-44 overflow-y-auto font-mono text-[9.5px] text-zinc-400 select-text scrollbar-thin rounded-md"
            >
              {typedLogs.map((logStr, idx) => (
                <div key={idx} className="flex gap-2 mb-1.5 border-b border-zinc-950 pb-1 last:border-0">
                  <span className="text-zinc-650 font-bold">▶</span>
                  <span className={idx === typedLogs.length - 1 ? 'text-[#00f2ff]' : ''} style={{ color: idx === typedLogs.length - 1 ? accentColor : undefined }}>
                    {logStr}
                  </span>
                </div>
              ))}
              {typedLogs.length < captainLogs.length && (
                <div style={{ color: accentColor }} className="flex items-center gap-1.5 text-[8.5px] p-1.5 animate-pulse mt-1.5 bg-zinc-900/20 border border-dashed border-zinc-900 rounded">
                  <Cpu className="w-3.5 h-3.5 animate-spin" />
                  <span>DECRYPTING SECURE LOG ENVELOPES...</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom terminal controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900/60 pt-4">
            <div className="flex items-center gap-2 text-[8px] text-zinc-550">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>COCKPIT_VEHICLE: FLUID STATUS OK</span>
            </div>
            <button
              id="exit-terminate-btn"
              onClick={handleTerminate}
              style={{
                borderColor: `${accentColor}33`,
              }}
              className="flex items-center gap-2 px-5 py-2 bg-neutral-900/80 border border-zinc-850 text-zinc-300 hover:text-white hover:border-[#00f2ff]/30 hover:shadow-[0_0_12px_rgba(0,242,255,0.1)] transition rounded-md cursor-pointer font-bold uppercase tracking-wider text-[10px] active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              TERMINATE_SESSION
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
