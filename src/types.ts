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
  velocity: number;      // m/s
  altitude: number;      // km
  latitude: number;
  longitude: number;
  powerLevels: number;   // %
  shieldCap: number;     // %
  gateProgress: number;  // 0 to 100 per gate
  currentGate: number;   // 1 to 5
  flightMode: 'CRUISE' | 'NEWTONIAN' | 'AUTOPILOT';
  nearestAsteroidDist: number;
  nearestAsteroidName: string;
  thrusterSensitivity: number;
  targetSpeedSetting: number;
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

