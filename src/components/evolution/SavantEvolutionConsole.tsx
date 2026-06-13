import React, { memo, useMemo, useState } from 'react';
import {
  Activity,
  Brain,
  CircuitBoard,
  Compass,
  Crosshair,
  Database,
  Gauge,
  Layers,
  Lightbulb,
  Network,
  Orbit,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';

const pillars = [
  {
    id: 'vision',
    title: 'Spatial Intelligence',
    signal: 'SAVANT becomes a cinematic command interface for understanding complex systems.',
    upgrade: 'Every visual element should expose meaning, state, relationship, provenance, and next action.'
  },
  {
    id: 'experience',
    title: 'Cinematic UX',
    signal: 'The site stops behaving like a portfolio and behaves like an operational instrument.',
    upgrade: 'Boot, cockpit, flight, destination, radar, HUD, and scene become one continuous journey.'
  },
  {
    id: 'game',
    title: 'Playable Simulation',
    signal: 'The asteroid field becomes a skill loop instead of a background decoration.',
    upgrade: 'Targets, materials, mission objectives, feedback, scoring, heat, and progression become coherent.'
  },
  {
    id: 'graph',
    title: 'Knowledge Substrate',
    signal: 'Projects, claims, capabilities, visuals, systems, and decisions become graph-addressable.',
    upgrade: 'Everything important exposes lineage, evidence, confidence, dependencies, and relationships.'
  },
  {
    id: 'ai',
    title: 'Evidence-Aware AI',
    signal: 'AI becomes a guided mission analyst instead of decorative chat.',
    upgrade: 'AI outputs must cite source, confidence, missing data, assumptions, and recommended next action.'
  },
  {
    id: 'conversion',
    title: 'Client Command Flow',
    signal: 'The site converts attention into trust, then trust into qualified project action.',
    upgrade: 'Visitor intent routes into tailored briefs, capability proof, project fit, and contact readiness.'
  },
  {
    id: 'operations',
    title: 'Extensible Platform',
    signal: 'SAVANT becomes maintainable enough to grow without becoming patchwork.',
    upgrade: 'Subsystems expose primitives, events, metadata, diagnostics, rollback paths, and validation.'
  }
];

const systems = [
  ['Brand', 'from style to operating doctrine'],
  ['Visuals', 'from spectacle to cinematic instrumentation'],
  ['3D Scene', 'from backdrop to navigable world'],
  ['HUD', 'from clutter to command hierarchy'],
  ['Game', 'from firing toy to mission loop'],
  ['AI', 'from feature to intelligence layer'],
  ['Graph', 'from idea to authority substrate'],
  ['Content', 'from copy to evidence projection'],
  ['Performance', 'from hope to measurable budget'],
  ['Mobile', 'from shrink-down to designed mode']
];

export const SavantEvolutionConsole: React.FC = memo(() => {
  const {
    phase,
    pilotConfig,
    telemetry,
    telemetryLogs,
    setPhase,
    resetSim,
    addTelemetryLog,
    triggerScreenShake
  } = useAppState();

  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(false);

  const selected = pillars[active];

  const score = useMemo(() => {
    const base =
      telemetry.powerLevels +
      telemetry.shieldCap +
      Math.min(100, telemetry.velocity / 10);

    return Math.round(base / 3);
  }, [telemetry.powerLevels, telemetry.shieldCap, telemetry.velocity]);

  const runUpgradePulse = () => {
    addTelemetryLog(`EVOLUTION_ENGINE: ${selected.title.toUpperCase()} OPTIMIZATION PASS QUEUED`);
    triggerScreenShake(1.2);
    window.dispatchEvent(new CustomEvent('savant-evolution-pulse', {
      detail: {
        pillar: selected.id,
        title: selected.title,
        timestamp: performance.now()
      }
    }));
  };

  return (
    <div className={`sv-evo-root ${compact ? 'is-compact' : ''}`}>
      <header className="sv-evo-topbar">
        <div className="sv-evo-brand">
          <Sparkles size={16} />
          <div>
            <b>SAVANT EVOLUTION ENGINE</b>
            <span>{phase} / {pilotConfig.callsign}</span>
          </div>
        </div>

        <div className="sv-evo-metrics">
          <div><Gauge size={12} /><span>VALUE</span><b>{score}</b></div>
          <div><Activity size={12} /><span>VEL</span><b>{Math.round(telemetry.velocity)}</b></div>
          <div><Shield size={12} /><span>SHIELD</span><b>{Math.round(telemetry.shieldCap)}</b></div>
        </div>

        <button type="button" onClick={() => setCompact(!compact)}>
          {compact ? 'EXPAND' : 'FOCUS'}
        </button>
      </header>

      {!compact && (
        <>
          <aside className="sv-evo-pillar-rail">
            {pillars.map((pillar, index) => (
              <button
                key={pillar.id}
                type="button"
                className={index === active ? 'active' : ''}
                onClick={() => setActive(index)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <b>{pillar.title}</b>
              </button>
            ))}
          </aside>

          <main className="sv-evo-main">
            <section className="sv-evo-hero-card">
              <div className="sv-evo-kicker">
                <Orbit size={14} />
                <span>PRIMARY EVOLUTION VECTOR</span>
              </div>

              <h1>{selected.title}</h1>
              <p>{selected.signal}</p>

              <div className="sv-evo-upgrade">
                <Lightbulb size={16} />
                <span>{selected.upgrade}</span>
              </div>

              <div className="sv-evo-actions">
                <button type="button" onClick={() => setPhase('FLIGHT')}>
                  <Rocket size={14} />
                  Enter Flight
                </button>
                <button type="button" onClick={runUpgradePulse}>
                  <Zap size={14} />
                  Pulse Upgrade
                </button>
                <button type="button" onClick={resetSim}>
                  <Compass size={14} />
                  Reset
                </button>
              </div>
            </section>

            <section className="sv-evo-system-grid">
              {systems.map(([name, value], index) => (
                <div key={name} className="sv-evo-system-card">
                  {index % 5 === 0 && <Brain size={15} />}
                  {index % 5 === 1 && <Layers size={15} />}
                  {index % 5 === 2 && <Crosshair size={15} />}
                  {index % 5 === 3 && <Network size={15} />}
                  {index % 5 === 4 && <Database size={15} />}
                  <b>{name}</b>
                  <span>{value}</span>
                </div>
              ))}
            </section>
          </main>

          <aside className="sv-evo-right">
            <section>
              <div className="sv-evo-kicker">
                <CircuitBoard size={14} />
                <span>ROADMAP</span>
              </div>
              <ol>
                <li>Stop stale rendering paths.</li>
                <li>Unify scene ownership.</li>
                <li>Collapse HUD hierarchy.</li>
                <li>Make game loop measurable.</li>
                <li>Project graph intelligence into UI.</li>
              </ol>
            </section>

            <section>
              <div className="sv-evo-kicker">
                <Target size={14} />
                <span>RECENT SIGNAL</span>
              </div>
              <div className="sv-evo-log">
                {(telemetryLogs.length ? telemetryLogs : ['Awaiting telemetry.']).slice(0, 5).map((log, index) => (
                  <span key={`${log}-${index}`}>{log}</span>
                ))}
              </div>
            </section>
          </aside>
        </>
      )}
    </div>
  );
});

SavantEvolutionConsole.displayName = 'SavantEvolutionConsole';
