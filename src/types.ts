export type AsteroidTheme = 
  | 'CHROME_BLOOD'
  | 'GOLD_GUNMETAL'
  | 'OBSIDIAN_MOTTLED'
  | 'CARBON_VIOLET'
  | 'OPAL_STARDUST'
  | 'IRON_GREEN'
  | 'QUICKSILVER_COPPER';

export type AppPhase = 'BOOT' | 'INIT' | 'FLIGHT' | 'DESTINATION' | 'EXIT';

export interface PilotConfig {
  callsign: string;
  division: 'RESEARCH' | 'MINING' | 'RECON' | 'WARP_CORPS';
  objective: string;
  humFrequency: number;
  hudColor: string; // Hex color
  hudColorName: 'CYAN' | 'EMERALD' | 'AMBER' | 'RUBY';
}

export interface TelemetryData {
  velocity: number;      // Mapped to Polygon Density in Studio HUD
  altitude: number;      // Mapped to Morphing Wave Frequency in Studio HUD
  latitude: number;      // X displacement
  longitude: number;     // Y displacement
  powerLevels: number;   // Mapped to Lens Aberration Intensity in Studio HUD
  shieldCap: number;     // Mapped to Audio Synth Core Volume in Studio HUD
  gateProgress: number;  // Processing / Render Compile rate (0 - 100)
  currentGate: number;   // Active architectural layer/block index (1 to 4)
  flightMode: 'CRUISE' | 'NEWTONIAN' | 'AUTOPILOT'; // Wireframe vs Flat vs Refracted
  nearestAsteroidDist: number; // Mapped to audio resonance Q-factor
  nearestAsteroidName: string; // Active render block name
  thrusterSensitivity: number; // Block rotation speed multiplier
  targetSpeedSetting: number;  // Target frame processing rate
}

export type OpticMode = 'STD_OPTIC' | 'BIO_THERM' | 'ECHO_PULSE' | 'VOID_DRIVE';

export type FilterEffect = 'NONE' | 'LATTICE' | 'VOID' | 'GHOST' | 'MIST';

export interface SystemError {
  id: string;
  timestamp: string;
  message: string;
  stack?: string;
  componentStack?: string;
  severity: 'WARNING' | 'CRITICAL' | 'FAULT';
}
