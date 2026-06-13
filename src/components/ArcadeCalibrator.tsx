import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Swords, 
  Shield, 
  Trophy, 
  Activity, 
  Zap, 
  Volume2, 
  VolumeX, 
  Cpu, 
  Terminal,
  Compass,
  ArrowUpRight
} from 'lucide-react';

interface ArcadeCalibratorProps {
  themeColor: string;
  themeName: string;
  onProgressUpdate: (progress: number) => void;
  calibrationProgress: number;
  division: 'RESEARCH' | 'MINING' | 'RECON' | 'WARP_CORPS';
}

interface Laser {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  isEnemy: boolean;
  size: number;
  piercing?: boolean;
}

interface Enemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'SWARMER' | 'HUNTER' | 'BOSS';
  width: number;
  height: number;
  shields: number;
  maxShields: number;
  shootCooldown: number;
  scoreVal: number;
  trailTimer: number;
}

interface Asteroid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxHealth: number;
  health: number;
  points: number[];
  rotation: number;
  rotSpeed: number;
}

interface SpiralMeteor {
  id: number;
  centerX: number;
  centerY: number;
  theta: number;
  thetaSpeed: number;
  radius: number;
  radialSpeed: number;
  size: number;
  color: string;
  alpha: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  isGlow: boolean;
  isWarpStreak?: boolean;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  vy: number;
  type: 'SHIELD' | 'UPGRADE' | 'CHRONO_CORE';
  size: number;
  pulseTime: number;
}

export const ArcadeCalibrator: React.FC<ArcadeCalibratorProps> = ({
  themeColor,
  themeName,
  onProgressUpdate,
  calibrationProgress,
  division,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      const saved = localStorage.getItem('savant_galaga_high_score');
      return saved ? parseInt(saved, 10) : 4850;
    } catch (e) {
      return 4850;
    }
  });

  const [shieldCount, setShieldCount] = useState(100);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeWeapon, setActiveWeapon] = useState<'Standard' | 'Plasmatic Sweep' | 'Quantum Rail' | 'Special Overload'>('Standard');
  const [warpStatus, setWarpStatus] = useState<'IDLE' | 'DOCKING' | 'WARPING' | 'COMPLETE'>('IDLE');

  const [combatLogs, setCombatLogs] = useState<string[]>([
    'ARCADE ENGINE BUILD: v4.2 ADVANCED FLIGHT CORE DETECTED.',
    'HOTKEYS: [W,S] FOR FORWARD/REVERSE ENGINE THRUSTERS.',
    'STEERING: [A,D] OR [MOUSE] ROTATES COCKPIT VECTOR SHIELD.',
    'HOTKEYS: SPACE OR CLICKS EMIT NEON ANNIHILATING LASERS.',
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const mousePosRef = useRef({ x: 0, y: 0 });
  const isUsingMouseRef = useRef(false);

  // Game tracking variables mirrored inside ref to avoid stale dependencies
  const scoreRef = useRef(0);
  const shieldsRef = useRef(100);
  const comboRef = useRef(0);
  const calibrationRef = useRef(0);
  const warpStatusRef = useRef<'IDLE' | 'DOCKING' | 'WARPING' | 'COMPLETE'>('IDLE');

  useEffect(() => {
    calibrationRef.current = calibrationProgress;
    if (calibrationProgress >= 100 && warpStatusRef.current === 'IDLE') {
      triggerDockingSequence();
    }
  }, [calibrationProgress]);

  const pushLog = (msg: string) => {
    setCombatLogs((prev) => [msg, ...prev.slice(0, 5)]);
  };

  // Audio synthetically generated on the fly (Web Audio API synthesis)
  const playLocalSynth = (type: 'laser' | 'rail' | 'enemyLaser' | 'hit' | 'explosion' | 'powerup' | 'gameover' | 'warning' | 'warp') => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          audioCtxRef.current = new AudioCtxClass();
        }
      }
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'suspended') {
        ctx?.resume();
      }
      if (!ctx) return;

      const now = ctx.currentTime;
      
      // Setup raw analog distortion waveshaper to apply the NIN gritty edge to all calibrations
      const shaper = ctx.createWaveShaper();
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      const distortionAmount = 45;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + distortionAmount) * x * 20 * deg) / (Math.PI + distortionAmount * Math.abs(x));
      }
      shaper.curve = curve;
      shaper.oversample = '2x';
      shaper.connect(ctx.destination);
      
      if (type === 'laser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
        
        osc.connect(shaper);
        shaper.disconnect(); // Disconnect default from destination to bypass routing safely, or just connect gain to shaper!
        // Reset connection tree to have sound go: Oscillator -> Gain -> Shaper -> Destination
        gain.connect(shaper);
        osc.connect(gain);
        
        osc.start();
        osc.stop(now + 0.1);
      } else if (type === 'rail') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'square';
        osc1.frequency.setValueAtTime(90, now);
        osc1.frequency.exponentialRampToValueAtTime(1600, now + 0.28);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(45, now);
        osc2.frequency.exponentialRampToValueAtTime(800, now + 0.28);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(shaper);
        
        osc1.start();
        osc2.start();
        osc1.stop(now + 0.3);
        osc2.stop(now + 0.3);
      } else if (type === 'enemyLaser') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(255, now + 0.12);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
        
        osc.connect(gain);
        gain.connect(shaper);
        
        osc.start();
        osc.stop(now + 0.14);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.07);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        
        osc.connect(gain);
        gain.connect(shaper);
        
        osc.start();
        osc.stop(now + 0.08);
      } else if (type === 'explosion') {
        // Deep noisy white rumble
        const bufferSize = ctx.sampleRate * 0.35;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.linearRampToValueAtTime(20, now + 0.32);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(shaper);
        
        noise.start();
        noise.stop(now + 0.35);
      } else if (type === 'powerup') {
        const osc1 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(330, now);
        osc1.frequency.setValueAtTime(440, now + 0.06);
        osc1.frequency.setValueAtTime(554, now + 0.12);
        osc1.frequency.setValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.07, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        osc1.connect(gain);
        gain.connect(shaper);
        
        osc1.start();
        osc1.stop(now + 0.27);
      } else if (type === 'warning') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.setValueAtTime(110, now + 0.16);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.39);
        
        osc.connect(gain);
        gain.connect(shaper);
        
        osc.start();
        osc.stop(now + 0.4);
      } else if (type === 'warp') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(5000, now + 2.5);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);
        
        osc.connect(gain);
        gain.connect(shaper);
        
        osc.start();
        osc.stop(now + 2.6);
      } else if (type === 'gameover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(40, now + 0.6);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.64);
        
        osc.connect(gain);
        gain.connect(shaper);
        
        osc.start();
        osc.stop(now + 0.65);
      }
    } catch (e) {
      // safe wrap
    }
  };

  const triggerDockingSequence = () => {
    setWarpStatus('DOCKING');
    warpStatusRef.current = 'DOCKING';
    pushLog('CALIBRATION COMPLETED! ALIGNING SPACESHIP FOR WARP MATRIX JUMP...');
    playLocalSynth('warning');
  };

  const triggerWarpJump = () => {
    if (warpStatusRef.current !== 'DOCKING' && calibrationProgress < 100) return;
    setWarpStatus('WARPING');
    warpStatusRef.current = 'WARPING';
    pushLog('ENGAGING WARP CORPS THRUSTERS! COGNITIVE HYPERSPACE TUNNEL MANIFESTING...');
    playLocalSynth('warp');
  };

  const engageSimulator = () => {
    playLocalSynth('powerup');
    setIsPlaying(true);
    setScore(0);
    setShieldCount(100);
    setCombo(0);
    setWarpStatus('IDLE');
    scoreRef.current = 0;
    shieldsRef.current = 100;
    comboRef.current = 0;
    warpStatusRef.current = 'IDLE';

    pushLog('WARP PRE-CALIBRATOR COCKPIT LOADED! MAP ARENA BOUNDS: 1800 x 1200.');
    pushLog(`ASTEROID REBOUND SHIELD DETECTORS ONLINE: ${division} SYSTEMS LOADED`);
  };

  const autoCalibrate = () => {
    playLocalSynth('powerup');
    onProgressUpdate(100);
    triggerDockingSequence();
  };

  // Main high-fidelity canvas game loop
  useEffect(() => {
    if (!isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle initial dimensional layout sizing
    const setupCanvasSize = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      canvas.width = rect?.width || 380;
      canvas.height = 300;
    };
    setupCanvasSize();

    // Key event bindings
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = true;
      keysPressedRef.current[e.code] = true;
      if (e.code === 'Space') e.preventDefault();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key] = false;
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Large Arena configurations
    const arenaWidth = 1800;
    const arenaHeight = 1200;

    // Advanced momentum attributes on Newtonian models
    let playerX = arenaWidth / 2;
    let playerY = arenaHeight / 2 + 200;
    let playerVx = 0;
    let playerVy = 0;
    let playerAngle = -Math.PI / 2; // Upward looking
    let playerTargetAngle = -Math.PI / 2;
    let isThrusting = false;

    const playerAcceleration = 0.38;
    const playerFriction = 0.94; // true inertia sliding feel
    const rotationRate = 0.082; // radians turn rate per frame
    
    // Dynamic Camera coordinate trackers 
    let cameraX = playerX - canvas.width / 2;
    let cameraY = playerY - canvas.height / 2;

    let shootCooldown = 0;

    let lasers: Laser[] = [];
    let enemies: Enemy[] = [];
    let asteroids: Asteroid[] = [];
    let spiralMeteors: SpiralMeteor[] = [];
    let particles: Particle[] = [];
    let floatingTexts: FloatingText[] = [];
    let powerUps: PowerUp[] = [];

    // Screen Shake juice attributes
    let screenShake = 0.0;
    let screenDamageFlash = 0.0;
    let meteorVortexTimer = 0;
    let warpAnimationTimer = 0;
    let loopFrameId: number;

    let asteroidIdCounter = 0;
    let meteorIdCounter = 0;
    let enemyIdCounter = 0;
    let systemSpawnTicks = 0;

    // Procedurally layout large craggy rocks in an elegant curving asteroid belt across the arena
    const generateSymmetricAsteroidBelt = () => {
      asteroids = [];
      // Generates 30 structured orbiting obstacles forming a belt path
      for (let i = 0; i < 35; i++) {
        asteroidIdCounter++;
        // Generate a diagonal snake belt matching coordinate profiles
        const segmentX = (arenaWidth / 35) * i + (Math.random() - 0.5) * 120;
        const segmentY = 400 + Math.sin(i * 0.35) * 150 + (Math.random() - 0.5) * 100;

        const size = Math.random() * 26 + 14;
        const health = Math.ceil(size / 7);

        // Render organic shape vertices
        const points: number[] = [];
        const verticesAmount = Math.floor(Math.random() * 4) + 7;
        for (let v = 0; v < verticesAmount; v++) {
          points.push(Math.random() * 0.4 + 0.8); // radius multipliers
        }

        asteroids.push({
          id: asteroidIdCounter,
          x: segmentX,
          y: segmentY,
          vx: (Math.random() - 0.5) * 0.65,
          vy: (Math.random() - 0.5) * 0.65,
          size,
          maxHealth: health,
          health,
          points,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.015
        });
      }
    };
    generateSymmetricAsteroidBelt();

    // High fidelity parallax star layers
    const starParallaxLayers: { x: number; y: number; s: number; color: string; speed: number }[] = [];
    for (let s = 0; s < 180; s++) {
      starParallaxLayers.push({
        x: Math.random() * arenaWidth,
        y: Math.random() * arenaHeight,
        s: Math.random() * 1.8 + 0.3,
        color: s % 3 === 0 ? '#b3c5ff' : s % 4 === 0 ? '#ffdae0' : '#ffffff',
        speed: Math.random() * 0.5 + 0.15 // relative scrolling speeds
      });
    }

    // Floating Cosmic Nebula Cloud matrices
    const nebulaClouds: { x: number; y: number; r: number; color: string; driftX: number }[] = [];
    for (let c = 0; c < 5; c++) {
      nebulaClouds.push({
        x: Math.random() * arenaWidth,
        y: Math.random() * arenaHeight,
        r: Math.random() * 110 + 90,
        color: c === 0 ? 'rgba(79, 70, 229, 0.05)' : c === 1 ? 'rgba(219, 39, 119, 0.04)' : 'rgba(5, 150, 105, 0.04)',
        driftX: (Math.random() - 0.5) * 0.08
      });
    }

    // Firing dynamic weapon structures based on combination multiplier
    const fireSpaceshipLaser = () => {
      if (shootCooldown > 0) return;
      const currentCombo = comboRef.current;

      if (currentCombo >= 14) {
        // Quantum Rail Cannon: Fierce piercing white-hot beam that shoots in the target direction
        playLocalSynth('rail');
        screenShake = 6.0;
        lasers.push({
          x: playerX + Math.cos(playerAngle) * 16,
          y: playerY + Math.sin(playerAngle) * 16,
          vx: Math.cos(playerAngle) * 15.0,
          vy: Math.sin(playerAngle) * 15.0,
          color: '#38bdf8',
          isEnemy: false,
          size: 6,
          piercing: true
        });
        shootCooldown = 26;
      } else if (currentCombo >= 8) {
        // Multi Sweep Plasmatic Cannons
        playLocalSynth('laser');
        screenShake = 2.0;
        lasers.push({
          x: playerX,
          y: playerY,
          vx: Math.cos(playerAngle - 0.18) * 9.5,
          vy: Math.sin(playerAngle - 0.18) * 9.5,
          color: '#f59e0b',
          isEnemy: false,
          size: 3.5
        });
        lasers.push({
          x: playerX,
          y: playerY,
          vx: Math.cos(playerAngle) * 10.5,
          vy: Math.sin(playerAngle) * 10.5,
          color: '#ffeb3b',
          isEnemy: false,
          size: 4
        });
        lasers.push({
          x: playerX,
          y: playerY,
          vx: Math.cos(playerAngle + 0.18) * 9.5,
          vy: Math.sin(playerAngle + 0.18) * 9.5,
          color: '#f59e0b',
          isEnemy: false,
          size: 3.5
        });
        shootCooldown = 15;
      } else if (currentCombo >= 4) {
        // Dual fire splay
        playLocalSynth('laser');
        lasers.push({
          x: playerX + Math.cos(playerAngle - 0.3) * 8,
          y: playerY + Math.sin(playerAngle - 0.3) * 8,
          vx: Math.cos(playerAngle - 0.08) * 9.0,
          vy: Math.sin(playerAngle - 0.08) * 9.0,
          color: themeColor,
          isEnemy: false,
          size: 3
        });
        lasers.push({
          x: playerX + Math.cos(playerAngle + 0.3) * 8,
          y: playerY + Math.sin(playerAngle + 0.3) * 8,
          vx: Math.cos(playerAngle + 0.08) * 9.0,
          vy: Math.sin(playerAngle + 0.08) * 9.0,
          color: themeColor,
          isEnemy: false,
          size: 3
        });
        shootCooldown = 13;
      } else {
        // Standard single rapid weapon
        playLocalSynth('laser');
        lasers.push({
          x: playerX + Math.cos(playerAngle) * 12,
          y: playerY + Math.sin(playerAngle) * 12,
          vx: Math.cos(playerAngle) * 9.5,
          vy: Math.sin(playerAngle) * 9.5,
          color: themeColor,
          isEnemy: false,
          size: 3
        });
        shootCooldown = 10;
      }

      // Add reverse kickback pushback propulsion
      playerVx -= Math.cos(playerAngle) * 0.14;
      playerVy -= Math.sin(playerAngle) * 0.14;

      // Particle muzzle release
      for (let p = 0; p < 4; p++) {
        particles.push({
          x: playerX + Math.cos(playerAngle) * 12 + (Math.random() - 0.5) * 6,
          y: playerY + Math.sin(playerAngle) * 12 + (Math.random() - 0.5) * 6,
          vx: Math.cos(playerAngle) * 4 + (Math.random() - 0.5) * 2,
          vy: Math.sin(playerAngle) * 4 + (Math.random() - 0.5) * 2,
          size: Math.random() * 2 + 1,
          color: '#ffffff',
          alpha: 1.0,
          decay: 0.08,
          isGlow: true
        });
      }
    };

    // Spawn a spiraling meteor storm from spiral equations
    const spawnSpiralMeteorShower = () => {
      playLocalSynth('warning');
      pushLog('TACTICAL TELEMETRY WARNING: SPIRAL METEORS DETECTED DEVOLVING FROM NESTED ANCHOR!');
      screenShake = 6.0;

      // Vortex focal point is set around the pilot's ship
      const vortexX = playerX + (Math.random() - 0.5) * 200;
      const vortexY = playerY - 300;

      // Spawn 12 spiraling hazard bodies in beautiful math trajectories
      for (let s = 0; s < 14; s++) {
        meteorIdCounter++;
        const initialTheta = (Math.PI * 2 / 14) * s;
        spiralMeteors.push({
          id: meteorIdCounter,
          centerX: vortexX,
          centerY: vortexY,
          theta: initialTheta,
          thetaSpeed: 0.016 + Math.random() * 0.015,
          radius: 320 + Math.random() * 80, // initial spiral radius
          radialSpeed: -1.75 - Math.random() * 1.5, // spiraling inward
          size: Math.random() * 12 + 6,
          color: Math.random() < 0.5 ? '#f43f5e' : '#fb923c',
          alpha: 1.0
        });
      }
    };

    // Spawning waves of alien flight intruders
    const spawnAlienInvaders = () => {
      systemSpawnTicks++;
      if (systemSpawnTicks % 120 === 0 && enemies.length < 8) {
        enemyIdCounter++;
        const spawnX = playerX + (Math.random() - 0.5) * 600;
        const spawnY = playerY - 450;

        const scoreMultiplier = Math.random();

        if (scoreMultiplier < 0.15 && scoreRef.current > 1200) {
          // BOSS carrier
          enemies.push({
            id: enemyIdCounter,
            x: spawnX,
            y: spawnY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: 0.8,
            type: 'BOSS',
            width: 44,
            height: 32,
            shields: 15,
            maxShields: 15,
            shootCooldown: 50,
            scoreVal: 500,
            trailTimer: 0
          });
          pushLog('WARNING: HOSTILE CARRIER ALIEN INTENSIFIED NEAR ASTEROIDS!');
          playLocalSynth('warning');
        } else if (scoreMultiplier < 0.5) {
          // HUNTER
          enemies.push({
            id: enemyIdCounter,
            x: spawnX,
            y: Math.max(50, spawnY),
            vx: (Math.random() - 0.5) * 2,
            vy: 1.4,
            type: 'HUNTER',
            width: 22,
            height: 18,
            shields: 3,
            maxShields: 3,
            shootCooldown: 60,
            scoreVal: 180,
            trailTimer: 0
          });
        } else {
          // SWARMER
          enemies.push({
            id: enemyIdCounter,
            x: spawnX,
            y: Math.max(50, spawnY),
            vx: (Math.random() - 0.5) * 2.5,
            vy: 1.1,
            type: 'SWARMER',
            width: 16,
            height: 13,
            shields: 1,
            maxShields: 1,
            shootCooldown: 70,
            scoreVal: 70,
            trailTimer: 0
          });
        }
      }
    };

    // The core execution loop function run on animation frames
    const frameLoop = () => {
      // 1. DYNAMIC CINEMATIC WARPING HANDLING
      const status = warpStatusRef.current;

      if (status === 'WARPING') {
        ctx.save();
        warpAnimationTimer++;

        // Smooth transition the spaceship to center and rotate pointing up
        playerX += (cameraX + canvas.width / 2 - playerX) * 0.1;
        playerY += (cameraY + canvas.height / 3 * 2 - playerY) * 0.1;
        playerAngle += (-Math.PI / 2 - playerAngle) * 0.15;

        // Draw deep space warp pitch
        ctx.fillStyle = '#010103';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generate radial warp beams (hyperspace star stretching pointing outward)
        if (particles.length < 150) {
          particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 20,
            vy: (Math.random() - 0.5) * 20,
            size: Math.random() * 2.5 + 1.2,
            color: Math.random() < 0.6 ? '#ffffff' : Math.random() < 0.5 ? '#6366f1' : '#38bdf8',
            alpha: 1.0,
            decay: 0.012,
            isGlow: true,
            isWarpStreak: true
          });
        }

        // Kinetic camera screen shaking
        const localShake = Math.sin(warpAnimationTimer * 0.55) * 2.5;
        ctx.translate(localShake, 0);

        // Draw warping hoop rings mimicking tube corridors
        const hoopedPhase = performance.now() * 0.005;
        for (let i = 1; i <= 6; i++) {
          const ringRad = ((warpAnimationTimer * 4 + i * 75) % 450);
          ctx.strokeStyle = `rgba(56, 189, 248, ${Math.max(0, 1 - ringRad / 450) * 0.28})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(canvas.width / 2, canvas.height / 2, ringRad * 1.5, ringRad * 0.8, hoopedPhase * 0.1 * i, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Draw radial laser lines
        particles = particles.filter((p) => {
          if (p.isWarpStreak) {
            p.x += p.vx * 1.1;
            p.y += p.vy * 1.1;
            p.alpha -= p.decay;

            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 3.4, p.y - p.vy * 3.4);
            ctx.stroke();

            return p.alpha > 0;
          }
          return false;
        });

        // Frame update starfighter
        ctx.save();
        ctx.translate(playerX - cameraX, playerY - cameraY);
        ctx.rotate(playerAngle);

        ctx.strokeStyle = themeColor;
        ctx.fillStyle = '#060a12';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = themeColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(-12, 10);
        ctx.lineTo(-4, 4);
        ctx.lineTo(4, 4);
        ctx.lineTo(12, 10);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Over-charged dual combustion jet fire
        const jetLen = 30 + Math.sin(warpAnimationTimer * 0.8) * 15;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 4.0;
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 4 + jetLen);
        ctx.stroke();

        ctx.restore();
        ctx.restore();

        // Draw epic layout HUD
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✓ CHRONO_CORPS DOCK COLLIMATION MATCH', canvas.width / 2, canvas.height / 2 - 80);
        ctx.fillStyle = themeColor;
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText('JUMPING SYSTEM INTENSIFICATION...', canvas.width / 2, canvas.height / 2 - 55);

        // Flash screen white out at the very peak and finalize trigger
        if (warpAnimationTimer >= 150) {
          ctx.fillStyle = 'white';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          setIsPlaying(false);
          setWarpStatus('COMPLETE');
          warpStatusRef.current = 'COMPLETE';
          onProgressUpdate(100);
          pushLog('✓ PILOT DISCHARGED INTO SECTOR 9 NOMINAL.');
        } else {
          loopFrameId = requestAnimationFrame(frameLoop);
        }
        return;
      }

      // 2. STANDARD FLIGHT RUNTIME PROCEDURES
      ctx.save();
      if (screenShake > 0.1) {
        const sx = (Math.random() - 0.5) * screenShake * 1.5;
        const sy = (Math.random() - 0.5) * screenShake * 1.5;
        ctx.translate(sx, sy);
        screenShake *= 0.88;
      }

      // Draw map foundation
      ctx.fillStyle = '#010204';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Interpolate camera to center on our spaceship smoothly (elastic tracking)
      const idealCamX = playerX - canvas.width / 2;
      const idealCamY = playerY - canvas.height / 2;
      cameraX += (idealCamX - cameraX) * 0.082;
      cameraY += (idealCamY - cameraY) * 0.082;

      // Bound camera inside actual arena map
      cameraX = Math.max(0, Math.min(arenaWidth - canvas.width, cameraX));
      cameraY = Math.max(0, Math.min(arenaHeight - canvas.height, cameraY));

      // Draw beautiful background nebulae clouds drifting matching relative scrolling
      ctx.save();
      ctx.translate(-cameraX * 0.12, -cameraY * 0.12); // Deep parallax scroll
      nebulaClouds.forEach((cloud) => {
        cloud.x += cloud.driftX;
        if (cloud.x < -120) cloud.x = arenaWidth + 120;
        if (cloud.x > arenaWidth + 120) cloud.x = -120;

        const radGrad = ctx.createRadialGradient(cloud.x, cloud.y, 5, cloud.x, cloud.y, cloud.r);
        radGrad.addColorStop(0, cloud.color);
        radGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Draw vector geometric navigation grid on the arena floor mapping deep space grid layout
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.022)';
      ctx.lineWidth = 0.5;
      const arenaGridSpacing = 50;
      const startGridX = Math.floor(cameraX / arenaGridSpacing) * arenaGridSpacing;
      const startGridY = Math.floor(cameraY / arenaGridSpacing) * arenaGridSpacing;

      for (let gx = startGridX; gx <= startGridX + canvas.width + arenaGridSpacing; gx += arenaGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(gx - cameraX, 0);
        ctx.lineTo(gx - cameraX, canvas.height);
        ctx.stroke();
      }
      for (let gy = startGridY; gy <= startGridY + canvas.height + arenaGridSpacing; gy += arenaGridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, gy - cameraY);
        ctx.lineTo(canvas.width, gy - cameraY);
        ctx.stroke();
      }

      // Parallax active scrolling vector star field layers
      ctx.save();
      starParallaxLayers.forEach((star) => {
        // Draw each relative star shifted by camera scrolling multi factor
        const sx = (star.x - cameraX * star.speed + arenaWidth) % arenaWidth;
        const sy = (star.y - cameraY * star.speed + arenaHeight) % arenaHeight;

        if (sx >= 0 && sx <= canvas.width && sy >= 0 && sy <= canvas.height) {
          ctx.fillStyle = star.color;
          ctx.fillRect(sx, sy, star.s, star.s);
        }
      });
      ctx.restore();

      // Periodic trigger spiral meteor showers
      meteorVortexTimer++;
      if (meteorVortexTimer % 280 === 0 && warpStatusRef.current === 'IDLE') {
        spawnSpiralMeteorShower();
      }

      // PROCESS ADVANCED USER SPACESHIP FLIGHT CONTROLS
      const k = keysPressedRef.current;

      // Handle dual mouse rotation or physical WASD navigation configurations
      if (isUsingMouseRef.current) {
        // Ship points directly to the mouse coordinate positions
        const physicalMouseGridX = mousePosRef.current.x + cameraX;
        const physicalMouseGridY = mousePosRef.current.y + cameraY;
        playerTargetAngle = Math.atan2(physicalMouseGridY - playerY, physicalMouseGridX - playerX);

        // Auto accelerate if clicking, or left clicking space
        isThrusting = k['Space'] || k['Spacebar'];
      } else {
        // Keyboard: W/S controls forward/reverse momentum, A/D rotates angle smoothly
        isThrusting = k['KeyW'] || k['ArrowUp'] || k['w'] || k['W'];
        const isBraking = k['KeyS'] || k['ArrowDown'] || k['s'] || k['S'];

        if (k['KeyA'] || k['ArrowLeft'] || k['a'] || k['A']) {
          playerAngle -= rotationRate;
        }
        if (k['KeyD'] || k['ArrowRight'] || k['d'] || k['D']) {
          playerAngle += rotationRate;
        }

        if (isThrusting) {
          playerVx += Math.cos(playerAngle) * playerAcceleration;
          playerVy += Math.sin(playerAngle) * playerAcceleration;
        }
        if (isBraking) {
          // reverse thrust braking force dampening
          playerVx -= Math.cos(playerAngle) * playerAcceleration * 0.5;
          playerVy -= Math.sin(playerAngle) * playerAcceleration * 0.5;
        }
      }

      // Interpolate ship rotation direction if pointing towards target mouse
      if (isUsingMouseRef.current) {
        // Slerp angle calculation
        let diff = playerTargetAngle - playerAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        playerAngle += diff * 0.16;
      }

      // Apply physical momentum variables
      playerVx *= playerFriction;
      playerVy *= playerFriction;

      playerX += playerVx;
      playerY += playerVy;

      // Restrict boundaries to map borders
      playerX = Math.max(20, Math.min(arenaWidth - 20, playerX));
      playerY = Math.max(20, Math.min(arenaHeight - 20, playerY));

      // Trigger automatic firing patterns
      if (k['Space'] || k['Spacebar'] || (isUsingMouseRef.current && k['mousedown'])) {
        fireSpaceshipLaser();
      }
      if (shootCooldown > 0) shootCooldown--;

      // UPDATE & DRAW PROCESS COHESION LOOT BLOCKS
      powerUps = powerUps.filter((item) => {
        item.y += item.vy;
        item.pulseTime += 0.15;

        // Draw floating core items
        const pulseSize = item.size + Math.sin(item.pulseTime) * 3;
        const screenX = item.x - cameraX;
        const screenY = item.y - cameraY;

        if (screenX >= -30 && screenX <= canvas.width + 30 && screenY >= -30 && screenY <= canvas.height + 30) {
          if (item.type === 'SHIELD') {
            ctx.strokeStyle = '#ef4444';
            ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          } else if (item.type === 'UPGRADE') {
            ctx.strokeStyle = '#eab308';
            ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
          } else {
            ctx.strokeStyle = '#10b981';
            ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          }

          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(screenX, screenY, pulseSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 7px monospace';
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(item.type === 'SHIELD' ? 'DEF' : item.type === 'UPGRADE' ? 'LVL' : 'CORE', screenX, screenY + 2.5);
        }

        // Check magnet collision with ship
        const dist = Math.hypot(playerX - item.x, playerY - item.y);
        if (dist <= 26 && status === 'IDLE') {
          playLocalSynth('powerup');
          screenShake = 3.0;

          if (item.type === 'SHIELD') {
            shieldsRef.current = Math.min(100, shieldsRef.current + 25);
            setShieldCount(shieldsRef.current);
            floatingTexts.push({
              id: Math.random(),
              x: item.x,
              y: item.y - 15,
              text: 'SHIELDS RESTORED +25%',
              color: '#f87171',
              alpha: 1.0,
              vy: -0.8
            });
            pushLog('SYSTEM SECURITY RECOVERED DEFLECTORS.');
          } else if (item.type === 'UPGRADE') {
            comboRef.current = Math.min(20, comboRef.current + 4);
            setCombo(comboRef.current);
            floatingTexts.push({
              id: Math.random(),
              x: item.x,
              y: item.y - 15,
              text: 'PLASMA CHARGE UPGRADE',
              color: '#eab308',
              alpha: 1.0,
              vy: -0.8
            });
            pushLog('TACTICAL LASERS UPGRADED AUTOMATICALLY.');
          } else {
            const currentProgress = calibrationRef.current;
            const stepChance = Math.min(100, currentProgress + 10);
            onProgressUpdate(stepChance);

            scoreRef.current += 1500;
            setScore(scoreRef.current);

            floatingTexts.push({
              id: Math.random(),
              x: item.x,
              y: item.y - 15,
              text: 'CHRONO_CORE CAPTURED +10%',
              color: '#34d399',
              alpha: 1.0,
              vy: -1.0
            });
            pushLog('CHRONO_CORE INTERFACED: FEEDING ALIGN SPECTROGRAPHS');
          }
          return false;
        }
        return item.y < arenaHeight;
      });

      // PROCESS & DRAW METICULOUS ASTEROID BODIES
      asteroids = asteroids.filter((rock) => {
        rock.x += rock.vx;
        rock.y += rock.vy;
        rock.rotation += rock.rotSpeed;

        // Wrap asteroids boundaries around map neatly
        if (rock.x < -40) rock.x = arenaWidth + 40;
        if (rock.x > arenaWidth + 40) rock.x = -40;
        if (rock.y < -40) rock.y = arenaHeight + 40;
        if (rock.y > arenaHeight + 40) rock.y = -40;

        const screenX = rock.x - cameraX;
        const screenY = rock.y - cameraY;

        // Render beautiful wireframe rock geometry if on-screen
        if (screenX >= -60 && screenX <= canvas.width + 60 && screenY >= -60 && screenY <= canvas.height + 60) {
          ctx.strokeStyle = `rgba(161, 161, 170, ${0.4 + (rock.health / rock.maxHealth) * 0.6})`;
          ctx.fillStyle = 'rgba(24, 24, 27, 0.9)';
          ctx.lineWidth = 1.5;

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(rock.rotation);

          ctx.beginPath();
          const vertices = rock.points.length;
          for (let p = 0; p < vertices; p++) {
            const pointAngle = (Math.PI * 2 / vertices) * p;
            const distance = rock.size * rock.points[p];
            const px = Math.cos(pointAngle) * distance;
            const py = Math.sin(pointAngle) * distance;

            if (p === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Render internal structural damage fractures
          if (rock.health < rock.maxHealth) {
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(rock.size * 0.4, 0);
            ctx.moveTo(0, 0);
            ctx.lineTo(-rock.size * 0.3, rock.size * 0.3);
            ctx.stroke();
          }

          ctx.restore();
        }

        // Verify spaceship collision with asteroid rock
        const playerCollideDist = Math.hypot(playerX - rock.x, playerY - rock.y);
        if (playerCollideDist < (rock.size + 14) && status === 'IDLE') {
          // Rebound elastic bounce physics calculations
          const bounceAngle = Math.atan2(playerY - rock.y, playerX - rock.x);
          playerVx = Math.cos(bounceAngle) * 5.0;
          playerVy = Math.sin(bounceAngle) * 5.0;

          // Damaging pilots defensive buffer shield configurations
          shieldsRef.current = Math.max(0, shieldsRef.current - 12);
          setShieldCount(shieldsRef.current);
          comboRef.current = 0;
          setCombo(0);

          screenDamageFlash = 0.35;
          screenShake = 6.0;
          playLocalSynth('hit');

          floatingTexts.push({
            id: Math.random(),
            x: playerX,
            y: playerY - 20,
            text: 'ASTEROID COLLISION -12%',
            color: '#ef4444',
            alpha: 1.0,
            vy: -0.8
          });

          pushLog('REBOUND COLLIDERS ACTIATED: HULL IMPACT REGISTERED.');

          // Sparks scatter
          for (let s = 0; s < 10; s++) {
            particles.push({
              x: playerX + (Math.random() - 0.5) * 16,
              y: playerY + (Math.random() - 0.5) * 16,
              vx: (Math.random() - 0.5) * 5,
              vy: (Math.random() - 0.5) * 5,
              size: Math.random() * 2 + 0.5,
              color: '#d4d4d8',
              alpha: 1.0,
              decay: 0.04,
              isGlow: false
            });
          }

          if (shieldsRef.current <= 0) {
            playLocalSynth('gameover');
            setIsPlaying(false);
            pushLog('CRITICAL DAMAGE HULL CRASH! REBOOT NEEDED.');
          }
        }

        // Verify weapon projectile interactions
        lasers.forEach((bullet) => {
          if (!bullet.isEnemy) {
            const rockBulletDist = Math.hypot(bullet.x - rock.x, bullet.y - rock.y);
            if (rockBulletDist < (rock.size + 5)) {
              if (!bullet.piercing) bullet.y = -9999; // absorb bullet

              rock.health--;
              playLocalSynth('hit');
              screenShake = Math.max(screenShake, 1.25);

              // Stone fragments
              for (let f = 0; f < 4; f++) {
                particles.push({
                  x: bullet.x,
                  y: bullet.y,
                  vx: (Math.random() - 0.5) * 3,
                  vy: (Math.random() - 0.5) * 3 - 0.5,
                  size: Math.random() * 2 + 0.5,
                  color: '#71717a',
                  alpha: 0.9,
                  decay: 0.05,
                  isGlow: false
                });
              }

              if (rock.health <= 0) {
                playLocalSynth('explosion');
                screenShake = 3.8;

                scoreRef.current += 200;
                setScore(scoreRef.current);
                comboRef.current++;
                setCombo(comboRef.current);

                // Probability of dropping Chrono Cores
                const bonusWeight = Math.random();
                if (bonusWeight < 0.25) {
                  powerUps.push({
                    id: Math.random(),
                    x: rock.x,
                    y: rock.y,
                    vy: 1.0,
                    type: bonusWeight < 0.08 ? 'SHIELD' : bonusWeight < 0.16 ? 'UPGRADE' : 'CHRONO_CORE',
                    size: 8,
                    pulseTime: 0
                  });
                }

                floatingTexts.push({
                  id: Math.random(),
                  x: rock.x,
                  y: rock.y,
                  text: '+200 PTS',
                  color: '#38bdf8',
                  alpha: 1.0,
                  vy: -0.9
                });

                // Debris blast
                for (let b = 0; b < 12; b++) {
                  particles.push({
                    x: rock.x,
                    y: rock.y,
                    vx: (Math.random() - 0.5) * 5,
                    vy: (Math.random() - 0.5) * 5,
                    size: Math.random() * 3 + 1,
                    color: '#52525b',
                    alpha: 1.0,
                    decay: 0.03,
                    isGlow: false
                  });
                }
              }
            }
          }
        });

        return rock.health > 0;
      });

      // PROCESS & DRAW DEVOLVING SPIRAL METEORS
      spiralMeteors = spiralMeteors.filter((met) => {
        // Polar spiral coordinates calculations
        met.radius += met.radialSpeed;
        met.theta += met.thetaSpeed;

        const actualX = met.centerX + Math.cos(met.theta) * met.radius;
        const actualY = met.centerY + Math.sin(met.theta) * met.radius;

        const screenX = actualX - cameraX;
        const screenY = actualY - cameraY;

        // Draw hot lava meteor trails
        if (Math.random() < 0.28) {
          particles.push({
            x: actualX,
            y: actualY,
            vx: (Math.random() - 0.5) * 1.5,
            vy: (Math.random() - 0.5) * 1.5,
            size: Math.random() * 3 + 1,
            color: met.color,
            alpha: 0.9,
            decay: 0.05,
            isGlow: true
          });
        }

        // Draw nice glowing spiral meteor geometry
        if (screenX >= -20 && screenX <= canvas.width + 20 && screenY >= -20 && screenY <= canvas.height + 20) {
          ctx.shadowColor = met.color;
          ctx.shadowBlur = 10;
          ctx.fillStyle = met.color;
          ctx.beginPath();
          ctx.arc(screenX, screenY, met.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }

        // Collision inspection to pilot starcraft
        const distanceToPlayer = Math.hypot(playerX - actualX, playerY - actualY);
        if (distanceToPlayer < (met.size + 13) && status === 'IDLE') {
          shieldsRef.current = Math.max(0, shieldsRef.current - 18);
          setShieldCount(shieldsRef.current);
          comboRef.current = 0;
          setCombo(0);

          screenDamageFlash = 0.45;
          screenShake = 8.0;
          playLocalSynth('hit');

          floatingTexts.push({
            id: Math.random(),
            x: playerX,
            y: playerY - 20,
            text: 'METEOR SPIRAL IMPACT -18%',
            color: '#f43f5e',
            alpha: 1.0,
            vy: -0.8
          });

          pushLog('COLLISION ALARM: METEOR ORBIT DAMAGE ABSORB.');

          if (shieldsRef.current <= 0) {
            playLocalSynth('gameover');
            setIsPlaying(false);
          }
          return false; // delete meteor
        }

        // Verify if blasted by player laser is complete
        lasers.forEach((bullet) => {
          if (!bullet.isEnemy) {
            const bDist = Math.hypot(bullet.x - actualX, bullet.y - actualY);
            if (bDist < (met.size + 6)) {
              if (!bullet.piercing) bullet.y = -9999;
              met.alpha = 0; // mark destroyed

              playLocalSynth('explosion');
              screenShake = Math.max(screenShake, 2.5);

              scoreRef.current += 400;
              setScore(scoreRef.current);
              comboRef.current++;
              setCombo(comboRef.current);

              floatingTexts.push({
                id: Math.random(),
                x: actualX,
                y: actualY,
                text: '+400 PTS',
                color: '#fb923c',
                alpha: 1.0,
                vy: -0.9
              });

              // Explode sparks
              for (let p = 0; p < 8; p++) {
                particles.push({
                  x: actualX,
                  y: actualY,
                  vx: (Math.random() - 0.5) * 5,
                  vy: (Math.random() - 0.5) * 5,
                  size: Math.random() * 2.5 + 1,
                  color: met.color,
                  alpha: 1.0,
                  decay: 0.04,
                  isGlow: true
                });
              }
            }
          }
        });

        // Filter out spiral meteors that spiral past target center
        return met.radius > 15 && met.alpha > 0;
      });

      // SPAWN PROCESS VEHICLE INTUDERS
      spawnAlienInvaders();

      // UPDATE PROCESS VECHICLE INTRUDERS AI MOTIONS
      enemies = enemies.filter((enemy) => {
        enemy.trailTimer++;

        // Basic forward targeting AI paths
        const currentTargetAngle = Math.atan2(playerY - enemy.y, playerX - enemy.x);
        enemy.vx = Math.cos(currentTargetAngle) * (enemy.type === 'BOSS' ? 0.75 : enemy.type === 'HUNTER' ? 1.85 : 2.5);
        enemy.vy = Math.sin(currentTargetAngle) * (enemy.type === 'BOSS' ? 0.75 : enemy.type === 'HUNTER' ? 1.55 : 2.1);

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;

        const screenX = enemy.x - cameraX;
        const screenY = enemy.y - cameraY;

        // Spawn vector trail exhaust
        if (enemy.trailTimer % 14 === 0) {
          particles.push({
            x: enemy.x,
            y: enemy.y,
            vx: -enemy.vx * 0.4 + (Math.random() - 0.5),
            vy: -enemy.vy * 0.4 + (Math.random() - 0.5),
            size: Math.random() * 2 + 0.5,
            color: enemy.type === 'BOSS' ? '#f43f5e' : '#eab308',
            alpha: 0.8,
            decay: 0.06,
            isGlow: false
          });
        }

        // Alien shooting logic patterns
        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0 && status === 'IDLE') {
          playLocalSynth('enemyLaser');
          if (enemy.type === 'BOSS') {
            // Triple heavy radial barrage output
            lasers.push({ x: enemy.x, y: enemy.y, vx: Math.cos(currentTargetAngle - 0.25) * 4.8, vy: Math.sin(currentTargetAngle - 0.25) * 4.8, color: '#f43f5e', isEnemy: true, size: 3 });
            lasers.push({ x: enemy.x, y: enemy.y, vx: Math.cos(currentTargetAngle) * 5.2, vy: Math.sin(currentTargetAngle) * 5.2, color: '#f43f5e', isEnemy: true, size: 3.5 });
            lasers.push({ x: enemy.x, y: enemy.y, vx: Math.cos(currentTargetAngle + 0.25) * 4.8, vy: Math.sin(currentTargetAngle + 0.25) * 4.8, color: '#f43f5e', isEnemy: true, size: 3 });
            enemy.shootCooldown = 65;
          } else {
            // Direct tactical laser targeting pilot
            lasers.push({
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(currentTargetAngle) * 5.8,
              vy: Math.sin(currentTargetAngle) * 5.8,
              color: '#f43f5e',
              isEnemy: true,
              size: 2.2
            });
            enemy.shootCooldown = Math.random() * 80 + 70;
          }
        }

        // Symmetrical procedural vector drawings
        if (screenX >= -40 && screenX <= canvas.width + 40 && screenY >= -40 && screenY <= canvas.height + 40) {
          ctx.strokeStyle = enemy.type === 'BOSS' ? '#f43f5e' : enemy.type === 'HUNTER' ? '#eab308' : '#fda4af';
          ctx.fillStyle = '#06020d';
          ctx.lineWidth = 1.8;

          ctx.save();
          ctx.translate(screenX, screenY);
          ctx.rotate(currentTargetAngle + Math.PI / 2); // look at direction

          ctx.beginPath();
          if (enemy.type === 'BOSS') {
            ctx.moveTo(0, -18);
            ctx.lineTo(-20, 10);
            ctx.lineTo(-6, 2);
            ctx.lineTo(6, 2);
            ctx.lineTo(20, 10);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Core energy red pulsating eye
            const eyeSwelling = Math.sin(performance.now() * 0.008) * 2 + 4;
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(0, -4, eyeSwelling, 0, Math.PI * 2);
            ctx.fill();
          } else if (enemy.type === 'HUNTER') {
            ctx.moveTo(0, -10);
            ctx.lineTo(-12, 6);
            ctx.lineTo(0, 2);
            ctx.lineTo(12, 6);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          } else {
            ctx.moveTo(0, -7);
            ctx.lineTo(-8, 5);
            ctx.lineTo(8, 5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }

          ctx.restore();
        }

        // Check if collide lasers
        lasers.forEach((laser) => {
          if (!laser.isEnemy) {
            const eDist = Math.hypot(laser.x - enemy.x, laser.y - enemy.y);
            if (eDist < (enemy.width / 2 + 6)) {
              if (!laser.piercing) laser.y = -9999;
              enemy.shields--;
              playLocalSynth('hit');
              screenShake = Math.max(screenShake, 1.8);

              if (enemy.shields <= 0) {
                playLocalSynth('explosion');
                screenShake = enemy.type === 'BOSS' ? 7.5 : 3.0;

                if (enemy.type === 'BOSS') {
                  pushLog('TACTICAL TELEMETRY: CARRIER INTENSIFICTION PURGED SHEDDED!');
                }

                // Award calibrations and scores
                const yieldCalibrate = enemy.type === 'BOSS' ? 18 : enemy.type === 'HUNTER' ? 7 : 4;
                onProgressUpdate(Math.min(100, calibrationRef.current + yieldCalibrate));

                scoreRef.current += enemy.scoreVal;
                setScore(scoreRef.current);
                comboRef.current++;
                setCombo(comboRef.current);

                // powerup dropping
                if (Math.random() < 0.4 || enemy.type === 'BOSS') {
                  powerUps.push({
                    id: Math.random(),
                    x: enemy.x,
                    y: enemy.y,
                    vy: 1.2,
                    type: Math.random() < 0.35 ? 'SHIELD' : Math.random() < 0.65 ? 'UPGRADE' : 'CHRONO_CORE',
                    size: 8,
                    pulseTime: 0
                  });
                }

                floatingTexts.push({
                  id: Math.random(),
                  x: enemy.x,
                  y: enemy.y,
                  text: `+${enemy.scoreVal} PTS`,
                  color: '#fbbf24',
                  alpha: 1.0,
                  vy: -0.8
                });

                // Blast particles
                const amountDebris = enemy.type === 'BOSS' ? 24 : 8;
                for (let d = 0; d < amountDebris; d++) {
                  particles.push({
                    x: enemy.x,
                    y: enemy.y,
                    vx: (Math.random() - 0.5) * 6,
                    vy: (Math.random() - 0.5) * 6,
                    size: Math.random() * 3 + 1,
                    color: enemy.type === 'BOSS' ? '#f43f5e' : '#f59e0b',
                    alpha: 1.0,
                    decay: Math.random() * 0.03 + 0.03,
                    isGlow: true
                  });
                }
              }
            }
          }
        });

        // Filter out entities
        return enemy.shields > 0;
      });

      // DRAW PROCESS PROJECTILE FLY-BYS
      lasers = lasers.filter((laser) => {
        laser.x += laser.vx;
        laser.y += laser.vy;

        const screenX = laser.x - cameraX;
        const screenY = laser.y - cameraY;

        if (screenX >= -15 && screenX <= canvas.width + 15 && screenY >= -15 && screenY <= canvas.height + 15) {
          ctx.strokeStyle = laser.color;
          ctx.lineWidth = laser.size;
          ctx.lineCap = 'round';
          ctx.shadowColor = laser.color;
          ctx.shadowBlur = laser.piercing ? 14 : 7;

          ctx.beginPath();
          ctx.moveTo(screenX, screenY);
          ctx.lineTo(screenX - laser.vx * 1.5, screenY - laser.vy * 1.5);
          ctx.stroke();

          ctx.shadowBlur = 0; // reset
        }

        // Alien hostile lasers hitting player starcraft
        if (laser.isEnemy && status === 'IDLE') {
          const lDist = Math.hypot(laser.x - playerX, laser.y - playerY);
          if (lDist < 14) {
            laser.y = 9999; // destroy bullet
            shieldsRef.current = Math.max(0, shieldsRef.current - 14);
            setShieldCount(shieldsRef.current);
            comboRef.current = 0;
            setCombo(0);

            screenDamageFlash = 0.4;
            screenShake = 6.8;
            playLocalSynth('hit');

            floatingTexts.push({
              id: Math.random(),
              x: playerX,
              y: playerY - 20,
              text: 'DEFLECTOR CAPACITY -14%',
              color: '#f43f5e',
              alpha: 1.0,
              vy: -0.8
            });

            pushLog('SHIELD HARMONICS CRITICAL DAMAGE CAPACITANCE.');

            // Sparks scatter
            for (let s = 0; s < 8; s++) {
              particles.push({
                x: playerX,
                y: playerY,
                vx: (Math.random() - 0.5) * 5,
                vy: (Math.random() - 0.5) * 5,
                size: Math.random() * 2 + 0.5,
                color: '#ef4444',
                alpha: 1.0,
                decay: 0.05,
                isGlow: true
              });
            }

            if (shieldsRef.current <= 0) {
              playLocalSynth('gameover');
              setIsPlaying(false);
              pushLog('CRITICAL LOSS: DECK MELT REGISTERED.');
            }
          }
        }

        return laser.x >= 0 && laser.x <= arenaWidth && laser.y >= 0 && laser.y <= arenaHeight;
      });

      // DRAW PLAYER SPACESHIP STARFIGHTER
      const rollAngle = Math.max(-0.4, Math.min(0.4, playerVx * 0.07));
      ctx.save();
      ctx.translate(playerX - cameraX, playerY - cameraY);
      ctx.rotate(playerAngle + rollAngle);

      ctx.strokeStyle = themeColor;
      ctx.fillStyle = '#060a12';
      ctx.lineWidth = 2.0;
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      ctx.moveTo(0, -14);
      ctx.lineTo(-12, 10);
      ctx.lineTo(-4, 4);
      ctx.lineTo(4, 4);
      ctx.lineTo(12, 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Wing lasers tip designs
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-11, 4);
      ctx.lineTo(-11, -2);
      ctx.moveTo(11, 4);
      ctx.lineTo(11, -2);
      ctx.stroke();

      // Exhaust fires
      if (isThrusting) {
        const jetLength = 12 + Math.sin(performance.now() * 0.06) * 6;
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3.0;
        ctx.shadowColor = '#6366f1';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 4 + jetLength);
        ctx.stroke();
      } else {
        const pulseRatio = 6 + Math.sin(performance.now() * 0.02) * 2;
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(0, 4 + pulseRatio);
        ctx.stroke();
      }

      ctx.restore();
      ctx.shadowBlur = 0; // reset

      // UPDATE & DRAW SOLID SPARKS AND EXPLOSION debris PARTICLES
      particles = particles.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        const screenX = p.x - cameraX;
        const screenY = p.y - cameraY;

        if (screenX >= -10 && screenX <= canvas.width + 10 && screenY >= -10 && screenY <= canvas.height + 10) {
          if (p.isGlow) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 7;
          }
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillRect(screenX, screenY, p.size, p.size);
          ctx.globalAlpha = 1.0;
          ctx.shadowBlur = 0;
        }

        return p.alpha > 0;
      });

      // UPDATE & DRAW POPPING FLOATING WORDS LOGGERS
      floatingTexts = floatingTexts.filter((t) => {
        t.y += t.vy;
        t.alpha -= 0.016;

        const screenX = t.x - cameraX;
        const screenY = t.y - cameraY;

        if (screenX >= 0 && screenX <= canvas.width && screenY >= 0 && screenY <= canvas.height) {
          ctx.font = 'bold 8px monospace';
          ctx.fillStyle = t.color;
          ctx.textAlign = 'center';
          ctx.globalAlpha = Math.max(0, t.alpha);
          ctx.fillText(t.text, screenX, screenY);
          ctx.globalAlpha = 1.0;
        }

        return t.alpha > 0;
      });

      // RED COCKPIT DAMAGE OVERLAYS ON IMPACT
      if (screenDamageFlash > 0) {
        screenDamageFlash -= 0.035;
        ctx.fillStyle = `rgba(239, 68, 68, ${screenDamageFlash})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 3. DRAW EXQUISITE NAVIGATION HUD MAPPING
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';

      // Left stats info board
      ctx.textAlign = 'left';
      ctx.fillText(`SCORE: ${scoreRef.current}`, 14, 18);
      ctx.fillText(`THRUST: ${isThrusting ? 'ACTIVE [PWR_94]' : 'STABLE_ORBIT'}`, 14, 28);

      // System weapon title alignment
      const activeCombo = comboRef.current;
      let weaponName = 'Standard';
      if (activeCombo >= 14) weaponName = 'Quantum Rail Cannon';
      else if (activeCombo >= 8) weaponName = 'Multi Plasmatic Array';
      else if (activeCombo >= 4) weaponName = 'Dual Fire Splay';
      ctx.fillText(`SHIP WEAPON: ${weaponName}`, 14, 38);

      // Right Stats info board
      ctx.textAlign = 'right';
      ctx.fillText(`MAP SPACE: 1800 x 1200`, canvas.width - 14, 18);
      ctx.fillText(`SECTOR: EPSILON_IV`, canvas.width - 14, 28);
      ctx.fillText(`ALIGN: ${calibrationRef.current}%`, canvas.width - 14, 38);

      // Bottom multiplier combo counters
      if (comboRef.current > 0) {
        ctx.textAlign = 'center';
        ctx.fillStyle = comboRef.current >= 14 ? '#ef4444' : comboRef.current >= 8 ? '#f59e0b' : '#34d399';
        ctx.font = 'bold 8.5px monospace';
        ctx.fillText(`COMBO LEVEL ×${comboRef.current}`, canvas.width / 2, canvas.height - 12);
      }

      // Draw horizontal bar meters
      ctx.strokeStyle = 'rgba(239,68,68,0.3)';
      ctx.strokeRect(14, 46, 75, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(15, 47, (shieldsRef.current / 100) * 73, 2);

      ctx.strokeStyle = 'rgba(16,185,129,0.3)';
      ctx.strokeRect(canvas.width - 89, 46, 75, 4);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(canvas.width - 88, 47, (calibrationRef.current / 100) * 73, 2);

      // Save high records
      if (scoreRef.current > highScore) {
        setHighScore(scoreRef.current);
        try {
          localStorage.setItem('savant_galaga_high_score', scoreRef.current.toString());
        } catch (e) {}
      }

      // 4. THE COCKPIT REAL-TIME RADAR PANEL SCREEN MAPPING
      // Placement: Draw in bottom-right corner as a glowing radar circular instrument
      ctx.save();
      const rCenterX = canvas.width - 48;
      const rCenterY = canvas.height - 48;
      const rRadius = 32;

      // Draw radar black circular base scope with neon teal bounds
      ctx.fillStyle = 'rgba(4, 10, 15, 0.88)';
      ctx.beginPath();
      ctx.arc(rCenterX, rCenterY, rRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `${themeColor}60`;
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Outer hazard borders
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.beginPath();
      ctx.arc(rCenterX, rCenterY, rRadius - 5, 0, Math.PI * 2);
      ctx.stroke();

      // Rotational scanning sweeping light beam
      const scanSweepAngle = (performance.now() * 0.0035) % (Math.PI * 2);
      ctx.strokeStyle = `${themeColor}28`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(rCenterX, rCenterY);
      ctx.lineTo(rCenterX + Math.cos(scanSweepAngle) * rRadius, rCenterY + Math.sin(scanSweepAngle) * rRadius);
      ctx.stroke();

      // Convert global map coordinates to relative miniature coordinates
      // Radar scale: covers the full 1800x1200 map scaled down
      const mapScalingFactorX = rRadius / (arenaWidth / 2);
      const mapScalingFactorY = rRadius / (arenaHeight / 2);

      // Draw asteroid belt boundary representation (two concentric elliptical guides)
      ctx.strokeStyle = 'rgba(113, 113, 122, 0.18)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      // scaled representation of the Asteroid belt line at y ~400-550
      const scaledBeltY = rCenterY + (480 - playerY) * mapScalingFactorY;
      ctx.moveTo(rCenterX - rRadius, scaledBeltY);
      ctx.lineTo(rCenterX + rRadius, scaledBeltY);
      ctx.stroke();

      // Draw asteroids inside scope
      asteroids.forEach((rock) => {
        const dx = (rock.x - playerX) * mapScalingFactorX;
        const dy = (rock.y - playerY) * mapScalingFactorY;
        if (Math.hypot(dx, dy) < rRadius - 2) {
          ctx.fillStyle = 'rgba(150, 150, 150, 0.7)';
          ctx.beginPath();
          ctx.arc(rCenterX + dx, rCenterY + dy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw hostiles red glowing dots in monitor
      enemies.forEach((enemy) => {
        const dx = (enemy.x - playerX) * mapScalingFactorX;
        const dy = (enemy.y - playerY) * mapScalingFactorY;
        if (Math.hypot(dx, dy) < rRadius - 2) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(rCenterX + dx, rCenterY + dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw spiral meteors inside radar scope
      spiralMeteors.forEach((met) => {
        const actualX = met.centerX + Math.cos(met.theta) * met.radius;
        const actualY = met.centerY + Math.sin(met.theta) * met.radius;
        const dx = (actualX - playerX) * mapScalingFactorX;
        const dy = (actualY - playerY) * mapScalingFactorY;
        if (Math.hypot(dx, dy) < rRadius - 2) {
          ctx.fillStyle = met.color;
          ctx.beginPath();
          ctx.arc(rCenterX + dx, rCenterY + dy, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw floating powerups inside radar scope
      powerUps.forEach((pup) => {
        const dx = (pup.x - playerX) * mapScalingFactorX;
        const dy = (pup.y - playerY) * mapScalingFactorY;
        if (Math.hypot(dx, dy) < rRadius - 2) {
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.arc(rCenterX + dx, rCenterY + dy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Green player cursor at radar center pointing inside target angle
      ctx.save();
      ctx.translate(rCenterX, rCenterY);
      ctx.rotate(playerAngle);
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.moveTo(3, 0);
      ctx.lineTo(-3, -2.5);
      ctx.lineTo(-1.5, 0);
      ctx.lineTo(-3, 2.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('RADAR SCAN', rCenterX, rCenterY + rRadius + 6);

      ctx.restore();
      ctx.restore();

      // Proceed checking loop frames
      if (warpStatusRef.current !== 'COMPLETE') {
        loopFrameId = requestAnimationFrame(frameLoop);
      }
    };

    loopFrameId = requestAnimationFrame(frameLoop);

    // Mouse positions mappings
    const handleMouseMove = (e: MouseEvent) => {
      isUsingMouseRef.current = true;
      const rect = canvas.getBoundingClientRect();
      mousePosRef.current.x = e.clientX - rect.left;
      mousePosRef.current.y = e.clientY - rect.top;
    };

    const handleTouchMove = (e: TouchEvent) => {
      isUsingMouseRef.current = true;
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mousePosRef.current.x = e.touches[0].clientX - rect.left;
        mousePosRef.current.y = e.touches[0].clientY - rect.top;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      keysPressedRef.current['mousedown'] = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      keysPressedRef.current['mousedown'] = false;
    };

    const handleMouseLeave = () => {
      isUsingMouseRef.current = false;
      keysPressedRef.current['mousedown'] = false;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(loopFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isPlaying, division, themeColor]);

  return (
    <div ref={containerRef} className="w-full flex flex-col pt-1">
      {/* Sleek sci-fi cockpit display housing with glass screen reflections */}
      <div 
        style={{ borderColor: `${themeColor}40` }}
        className="w-full h-80 bg-black border rounded-lg relative overflow-hidden flex flex-col justify-between"
      >
        {/* Optical glass glare and radial cinematic vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)] pointer-events-none z-10" />
        <div className="absolute inset-0  pointer-events-none z-10 opacity-70" />

        {/* Ambient top glowing bar */}
        <div 
          style={{ backgroundColor: `${themeColor}12`, borderBottomColor: `${themeColor}20` }}
          className="w-full border-b px-3 py-1.5 flex items-center justify-between z-20"
        >
          <div className="flex items-center gap-2">
            <span style={{ backgroundColor: themeColor }} className="w-1.5 h-1.5 rounded-full animate-ping" />
            <span className="text-[10px] font-black tracking-[0.2em] text-white font-sans uppercase">
              COCKPIT RADAR SIM_COREG4
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Weapon Indicator */}
            <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
              <span style={{ color: themeColor }} className="text-[7.5px] font-extrabold uppercase">WEAPON: {activeWeapon}</span>
            </div>

            {/* Speaker Mute button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="text-zinc-500 hover:text-white transition focus:outline-none cursor-pointer p-0.5"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isPlaying ? (
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair z-0"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center z-0 space-y-4">
            
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-2">
                <Compass style={{ color: themeColor }} className="w-5 h-5 animate-spin text-indigo-500" />
                <h3 className="text-sm font-black tracking-[0.3em] text-white">SAVANT NEBULA FLIGHT</h3>
              </div>
              <p className="text-[8px] text-zinc-500 tracking-[0.16em] uppercase">
                PROCEDURAL ASTEROID FIELD & SPIRAL ORBITS
              </p>
            </div>

            {/* Score indices */}
            <div className="flex items-center justify-center gap-5 border border-zinc-900 bg-zinc-950/70 p-2.5 rounded-lg">
              <div className="text-center">
                <p className="text-[7px] text-zinc-500 tracking-wider">MAP HIGH SCORE</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="text-xs font-black tracking-widest text-[#fbbf24]">{highScore} PTS</span>
                </div>
              </div>
              <div className="w-px h-7 bg-zinc-900" />
              <div className="text-center">
                <p className="text-[7px] text-zinc-500 tracking-wider">CALIBRATOR ENERGY</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <Shield style={{ color: themeColor }} className="w-3.5 h-3.5 animate-pulse" />
                  <span style={{ color: themeColor }} className="text-xs font-black tracking-widest">{calibrationProgress}%</span>
                </div>
              </div>
              <div className="w-px h-7 bg-zinc-900" />
              <div className="text-center">
                <p className="text-[7px] text-zinc-500 tracking-wider">FLIGHT ENGINE</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <span className="text-[9.5px] font-black tracking-wider text-green-400">ACTIVE DRIFT</span>
                </div>
              </div>
            </div>

            {/* Launch Consoles based on docking status */}
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
              {warpStatus === 'DOCKING' ? (
                <button
                  type="button"
                  id="activate_warp_speed_btn"
                  onClick={triggerWarpJump}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold tracking-[0.2em] text-[9.5px] rounded-md transition duration-200 shadow-lg shadow-indigo-500/20 uppercase cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4 text-white animate-bounce" />
                  DISCHARGE WARP JUMP NOW
                </button>
              ) : warpStatus === 'COMPLETE' ? (
                <button
                  type="button"
                  id="restart_exploration_deck_btn"
                  onClick={engageSimulator}
                  style={{ borderColor: themeColor, color: themeColor }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-zinc-950 text-[9px] border font-black tracking-[0.2em] rounded-md transition duration-200 uppercase cursor-pointer"
                >
                  REBOOT DECK FOR EXPEDITIONS
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    id="engage_dogfight_sim_btn"
                    onClick={engageSimulator}
                    style={{ backgroundColor: `${themeColor}20`, borderColor: themeColor, color: themeColor }}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border bg-black hover:brightness-135 text-white shadow-md text-[8.5px] font-extrabold tracking-[0.18em] uppercase rounded-md cursor-pointer transition active:scale-97"
                  >
                    <Play className="w-3.5 h-3.5 shrink-0" />
                    ENGAGE NAVIGATION SIM
                  </button>
                  
                  <button
                    type="button"
                    id="bypass_arcade_sim_btn"
                    onClick={autoCalibrate}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 text-[8px] font-bold tracking-[0.18em] uppercase rounded-md cursor-pointer transition active:scale-97"
                  >
                    <RotateCcw className="w-3 h-3 shrink-0" />
                    BYPASS CALIBRATE
                  </button>
                </>
              )}
            </div>

            {calibrationProgress >= 100 ? (
              <p className="text-[8.5px] text-[#10b981] font-bold tracking-widest uppercase">
                ✓ ALL DOCK CORES INTEGRATED SUCCESSFULLY. READY FOR WARP DISCHARGE.
              </p>
            ) : (
              <p className="text-[7.5px] text-zinc-500 tracking-wider">
                CONTROLS: MOVE WITH WASD OR ARROW KEYS. ESCAPE METEOR SPIRALS, USE RADAR MAP TO PURGE THREATS!
              </p>
            )}

          </div>
        )}
      </div>

      {/* Cyberpunk combat telemetry logging */}
      <div className="space-y-1.5 mt-3">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-black tracking-[0.16em] text-zinc-500 flex items-center gap-1 uppercase">
            <Terminal className="w-3 h-3 text-zinc-600" />
            ■ COMBAT INTELLIGENCE COM STREAMS
          </span>
          <span className="text-[8px] font-mono text-zinc-650 font-bold uppercase">
            STATUS: REAL_TIME SCANNER
          </span>
        </div>
        
        <div className="w-full h-18 bg-zinc-950/80 border border-zinc-900 p-2 text-[8px] text-zinc-600 leading-relaxed overflow-y-auto whitespace-pre font-mono scrollbar-thin rounded">
          {combatLogs.map((log, ix) => (
            <div key={ix} className="truncate">
              <span className="text-zinc-700">[{ix}]</span>{' '}
              <span style={{ color: log.includes('WARNING') || log.includes('CALIBRATION') || log.includes('ENGAGING') ? themeColor : undefined }}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
