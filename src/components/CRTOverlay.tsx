import React, { memo } from 'react';
import { useAppState } from '../contexts/AppStateContext';

export const CRTOverlay: React.FC = memo(() => {
  const { phase, asteroidTheme } = useAppState();

  const phaseClass =
    phase === 'BOOT'
      ? 'sv-optics-phase-boot'
      : phase === 'DESTINATION' || phase === 'EXIT'
        ? 'sv-optics-phase-destination'
        : 'sv-optics-phase-flight';

  return (
    <div
      id="savant-cinematic-optical-overlay"
      className={`sv-optics-root ${phaseClass}`}
      data-asteroid-theme={asteroidTheme}
      aria-hidden="true"
    >
      <div className="sv-optics-vignette" />
      <div className="sv-optics-depth" />
      <div className="sv-optics-glass" />
    </div>
  );
});

CRTOverlay.displayName = 'CRTOverlay';
