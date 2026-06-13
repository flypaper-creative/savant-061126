import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppPhase, PilotConfig, TelemetryData, OpticMode, FilterEffect, SystemError, AsteroidTheme } from '../types';

interface AppStateContextType {
  phase: AppPhase;
  pilotConfig: PilotConfig;
  telemetry: TelemetryData;
  opticMode: OpticMode;
  filterEffect: FilterEffect;
  telemetryLogs: string[];
  errors: SystemError[];
  screenShake: number;
  loadingProgress: number;
  spotlightActive: boolean;
  spotlightIntensity: number;
  spotlightColor: string;
  spotlightAngle: number;
  hudVisible: boolean;
  asteroidTheme: AsteroidTheme;
  setPhase: (phase: AppPhase) => void;
  updatePilotConfig: (config: Partial<PilotConfig>) => void;
  setOpticMode: (mode: OpticMode) => void;
  setFilterEffect: (effect: FilterEffect) => void;
  addTelemetryLog: (log: string) => void;
  addError: (message: string, severity?: 'WARNING' | 'CRITICAL' | 'FAULT', stack?: string) => void;
  clearErrors: () => void;
  triggerScreenShake: (amount: number) => void;
  updateTelemetry: (data: Partial<TelemetryData>) => void;
  resetSim: () => void;
  setLoadingProgress: (p: number) => void;
  setSpotlightActive: (active: boolean) => void;
  setSpotlightIntensity: (intensity: number) => void;
  setSpotlightColor: (color: string) => void;
  setSpotlightAngle: (angle: number) => void;
  setHudVisible: (visible: boolean) => void;
  setAsteroidTheme: (theme: AsteroidTheme) => void;
}

const defaultPilotConfig: PilotConfig = {
  callsign: 'SAVANT_01',
  division: 'RESEARCH',
  objective: 'Quantum Core Synthesis and Space Anomaly Calibration',
  humFrequency: 55,
  hudColor: '#00f2ff',
  hudColorName: 'CYAN',
};

const defaultTelemetry: TelemetryData = {
  velocity: 600,
  altitude: 1550,
  latitude: 0,
  longitude: 0,
  powerLevels: 100,
  shieldCap: 100,
  gateProgress: 0,
  currentGate: 1,
  flightMode: 'AUTOPILOT',
  nearestAsteroidDist: 999,
  nearestAsteroidName: 'N/A',
  thrusterSensitivity: 1.0,
  targetSpeedSetting: 600,
};

const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phase, setPhaseState] = useState<AppPhase>('FLIGHT');
  const [pilotConfig, setPilotConfig] = useState<PilotConfig>(defaultPilotConfig);
  const [telemetry, setTelemetry] = useState<TelemetryData>(defaultTelemetry);
  const [opticMode, setOpticMode] = useState<OpticMode>('STD_OPTIC');
  const [filterEffect, setFilterEffect] = useState<FilterEffect>('NONE');
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [spotlightActive, setSpotlightActive] = useState<boolean>(true);
  const [spotlightIntensity, setSpotlightIntensity] = useState<number>(8.0);
  const [spotlightColor, setSpotlightColor] = useState<string>('#ffffff');
  const [spotlightAngle, setSpotlightAngle] = useState<number>(0.4);
  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [asteroidTheme, setAsteroidThemeState] = useState<AsteroidTheme>('GOLD_GUNMETAL');

  // Wrapper for adding telemetry terminal logs
  const addTelemetryLog = useCallback((log: string) => {
    const timestamp = new Date().toISOString().slice(11, 19);
    setTelemetryLogs((prev) => [`[${timestamp}] ${log}`, ...prev.slice(0, 49)]);
  }, []);

  const setAsteroidTheme = useCallback((theme: AsteroidTheme) => {
    setAsteroidThemeState(theme);
    addTelemetryLog(`GEOLOGY_CHRON: ALCHEMIC MATERIAL RESTRUCTURE ENGAGED -> ${theme}`);
    
    // Map theme to corresponding HUD config and neon spotlight colors
    let hudColorName: 'CYAN' | 'EMERALD' | 'AMBER' | 'RUBY' = 'CYAN';
    let hudColor = '#00f2ff';
    let spotColor = '#ffffff';
    
    switch (theme) {
      case 'CHROME_BLOOD':
        hudColorName = 'RUBY';
        hudColor = '#ef4444';
        spotColor = '#ff2d2d';
        break;
      case 'GOLD_GUNMETAL':
        hudColorName = 'AMBER';
        hudColor = '#f59e0b';
        spotColor = '#f59e0b';
        break;
      case 'OBSIDIAN_MOTTLED':
        hudColorName = 'CYAN';
        hudColor = '#00f2ff';
        spotColor = '#00f2ff';
        break;
      case 'CARBON_VIOLET':
        hudColorName = 'RUBY';
        hudColor = '#d946ef';
        spotColor = '#d946ef';
        break;
      case 'OPAL_STARDUST':
        hudColorName = 'AMBER';
        hudColor = '#fba875';
        spotColor = '#fdba74';
        break;
      case 'IRON_GREEN':
        hudColorName = 'EMERALD';
        hudColor = '#10b981';
        spotColor = '#10b981';
        break;
      case 'QUICKSILVER_COPPER':
        hudColorName = 'AMBER';
        hudColor = '#f97316';
        spotColor = '#f97316';
        break;
    }
    
    setPilotConfig((prev) => ({
      ...prev,
      hudColorName,
      hudColor,
    }));
    
    setSpotlightColor(spotColor);
  }, [addTelemetryLog]);

  // Set phase with log
  const setPhase = useCallback((newPhase: AppPhase) => {
    setPhaseState(newPhase);
    addTelemetryLog(`SYSTEM PHASE CHANGED -> ${newPhase}`);
  }, [addTelemetryLog]);

  const updatePilotConfig = useCallback((newConfig: Partial<PilotConfig>) => {
    setPilotConfig((prev) => {
      const merged = { ...prev, ...newConfig };
      // Map colors
      if (newConfig.hudColorName) {
        if (newConfig.hudColorName === 'CYAN') merged.hudColor = '#00f2ff';
        else if (newConfig.hudColorName === 'EMERALD') merged.hudColor = '#10b981';
        else if (newConfig.hudColorName === 'AMBER') merged.hudColor = '#f59e0b';
        else if (newConfig.hudColorName === 'RUBY') merged.hudColor = '#ef4444';
      }
      return merged;
    });
  }, []);

  const triggerScreenShake = useCallback((amount: number) => {
    setScreenShake(amount);
    // Exponential decay of screen shake
    const interval = setInterval(() => {
      setScreenShake((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          return 0;
        }
        return prev * 0.7; // decay
      });
    }, 100);
  }, []);

  const addError = useCallback((message: string, severity: 'WARNING' | 'CRITICAL' | 'FAULT' = 'WARNING', stack?: string) => {
    const newErr: SystemError = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      stack,
      severity,
    };
    setErrors((prev) => [...prev, newErr]);
    addTelemetryLog(`ERR_CAPTURED: [${severity}] ${message}`);
  }, [addTelemetryLog]);

  const clearErrors = useCallback(() => {
    setErrors([]);
    addTelemetryLog('SYSTEM ERRORS RESOLVED & PURGED');
  }, [addTelemetryLog]);

  const updateTelemetry = useCallback((data: Partial<TelemetryData>) => {
    setTelemetry((prev) => ({ ...prev, ...data }));
  }, []);

  const resetSim = useCallback(() => {
    setPhaseState('FLIGHT');
    setLoadingProgress(100);
    setPilotConfig(defaultPilotConfig);
    setTelemetry(defaultTelemetry);
    setOpticMode('STD_OPTIC');
    setFilterEffect('NONE');
    setAsteroidThemeState('GOLD_GUNMETAL');
    setErrors([]);
    setScreenShake(0);
    setTelemetryLogs([]);
    addTelemetryLog('COCKPIT SIMULATOR REBOOTED & PURGED');
  }, [addTelemetryLog]);

  // Log system initialization
  useEffect(() => {
    addTelemetryLog('SAVANT_CORE INITIALIZED. COCKPIT CONSOLE ACTIVE.');
  }, [addTelemetryLog]);

  return (
    <AppStateContext.Provider
      value={{
        phase,
        pilotConfig,
        telemetry,
        opticMode,
        filterEffect,
        telemetryLogs,
        errors,
        screenShake,
        setPhase,
        updatePilotConfig,
        setOpticMode,
        setFilterEffect,
        addTelemetryLog,
        addError,
        clearErrors,
        triggerScreenShake,
        updateTelemetry,
        resetSim,
        loadingProgress,
        setLoadingProgress,
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
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
