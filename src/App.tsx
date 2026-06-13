import React, { memo, useMemo } from 'react';
import { AppStateProvider, useAppState } from './contexts/AppStateContext';
import { ErrorBoundary, GlobalErrorInspector } from './components/ErrorDisplay';
import { OptimizedSpaceScene } from './components/optimized/OptimizedSpaceScene';
import { BootScreen } from './components/BootScreen';
import { CRTOverlay } from './components/CRTOverlay';
import { DestinationScreen } from './components/DestinationScreen';
import { CupolaFrame } from './components/CupolaFrame';
import { SavantOperationalHUD } from './components/SavantOperationalHUD';

const CockpitLayout: React.FC = memo(() => {
  const { phase, screenShake } = useAppState() as any;

  const shakeStyle = useMemo<React.CSSProperties | undefined>(() => {
    if (!screenShake || screenShake <= 0) return undefined;

    const magnitude = Math.min(8, screenShake * 1.05);
    return {
      transform: `translate3d(${magnitude}px, ${-magnitude * 0.28}px, 0)`,
      transition: 'transform 80ms ease-out'
    };
  }, [screenShake]);

  return (
    <div
      className="relative w-full h-dvh overflow-hidden bg-black select-none font-mono sv-upgraded-shell"
      style={shakeStyle}
    >
      <OptimizedSpaceScene />
      <CRTOverlay />

      {phase === 'BOOT' && <CupolaFrame />}

      <SavantOperationalHUD />

      {phase === 'BOOT' && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/24 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-500 sv-boot-overlay">
          <BootScreen />
        </div>
      )}

      {(phase === 'DESTINATION' || phase === 'EXIT') && (
        <div className="absolute inset-0 z-10 transition-opacity duration-500">
          <DestinationScreen />
        </div>
      )}

      <GlobalErrorInspector />
    </div>
  );
});

CockpitLayout.displayName = 'CockpitLayout';

export default function App() {
  return (
    <AppStateProvider>
      <ErrorBoundary>
        <CockpitLayout />
      </ErrorBoundary>
    </AppStateProvider>
  );
}
