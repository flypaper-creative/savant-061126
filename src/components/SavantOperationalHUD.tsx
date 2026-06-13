import React, { memo, useEffect, useMemo, useState } from 'react';
import {
  Aperture,
  Atom,
  BookOpen,
  ChevronRight,
  Compass,
  Crosshair,
  Eye,
  Fingerprint,
  Gauge,
  Grid3X3,
  Layers,
  Lightbulb,
  Menu,
  Move3D,
  Palette,
  Radar,
  Rocket,
  Shield,
  Sparkles,
  Target,
  Zap,
  type LucideIcon
} from 'lucide-react';

type PanelId = 'THEMES' | 'TOOLS' | 'FLIGHT' | 'WEAPONS' | 'RADAR' | 'MATERIALS' | 'SYSTEMS';

type AsteroidTheme =
  | 'CHROME_BLOOD'
  | 'GOLD_GUNMETAL'
  | 'OBSIDIAN_MOTTLED'
  | 'CARBON_VIOLET'
  | 'OPAL_STARDUST'
  | 'IRON_GREEN'
  | 'QUICKSILVER_COPPER';

const PANELS: Array<{ id: PanelId; label: string; icon: LucideIcon }> = [
  { id: 'THEMES', label: 'PRESETS', icon: Palette },
  { id: 'TOOLS', label: 'TOOLS', icon: Grid3X3 },
  { id: 'FLIGHT', label: 'FLIGHT', icon: Rocket },
  { id: 'WEAPONS', label: 'WEAPONS', icon: Crosshair },
  { id: 'RADAR', label: 'RADAR', icon: Radar },
  { id: 'MATERIALS', label: 'DECK', icon: Layers },
  { id: 'SYSTEMS', label: 'SYSTEM', icon: Gauge }
];

const MATERIALS: Array<{ id: AsteroidTheme; label: string; meta: string }> = [
  { id: 'CHROME_BLOOD', label: 'W-01 CHROME', meta: 'red rim / mirror fracture' },
  { id: 'GOLD_GUNMETAL', label: 'W-02 GOLD', meta: 'warm ore / heavy dust' },
  { id: 'OBSIDIAN_MOTTLED', label: 'W-03 OBSIDIAN', meta: 'black basalt / cyan edge' },
  { id: 'CARBON_VIOLET', label: 'W-04 CARBON', meta: 'low albedo / violet trace' },
  { id: 'OPAL_STARDUST', label: 'W-05 OPAL', meta: 'ice mineral / pale scatter' },
  { id: 'IRON_GREEN', label: 'W-06 IRON', meta: 'oxidized mass / green rim' },
  { id: 'QUICKSILVER_COPPER', label: 'W-07 COPPER', meta: 'silver face / copper bounce' }
];

const emit = (name: string, detail: unknown) => {
  window.dispatchEvent(new CustomEvent(name, { detail }));
};

export const SavantOperationalHUD: React.FC = memo(() => {
  const [panel, setPanel] = useState<PanelId | null>(null);
  const [material, setMaterial] = useState<AsteroidTheme>(
    (localStorage.getItem('savant_asteroid_theme') as AsteroidTheme) || 'OBSIDIAN_MOTTLED'
  );
  const [weapon, setWeapon] = useState('PULSE');

  const activePanel = useMemo(() => PANELS.find((x) => x.id === panel), [panel]);

  useEffect(() => {
    document.documentElement.dataset.savantTheme = 'minority';
    emit('savant-aesthetic-theme', { theme: 'minority' });
  }, []);

  const applyMaterial = (id: AsteroidTheme) => {
    setMaterial(id);
    localStorage.setItem('savant_asteroid_theme', id);
    emit('savant-asteroid-theme', { theme: id });
  };

  return (
    <div className="sv-minority-ui">
      <div className="sv-minority-glass" aria-hidden="true">
        <div className="sv-minority-reticle" />
        <div className="sv-minority-handprint"><Fingerprint size={84} /></div>
        <div className="sv-minority-vector-a" />
        <div className="sv-minority-vector-b" />
      </div>

      <header className="sv-minority-menu">
        <button type="button" className="sv-minority-logo" onClick={() => setPanel(panel === 'THEMES' ? null : 'THEMES')}>
          <Menu size={14} />
          <b>CO</b>
        </button>

        <nav>
          {['FILE', 'EDIT', 'VIEW', 'WINDOW', 'HELP'].map((item) => (
            <button key={item} type="button">{item}</button>
          ))}
        </nav>

        <section>
          <span>ACTIVE_PRESET:</span>
          <b>MINORITY REPORT</b>
        </section>
      </header>

      <div className="sv-minority-submenu">
        <button type="button">⇧ EDITABLE</button>
        <button type="button">▣ SAVE</button>
        <i />
        <b>PANELS:</b>
        {PANELS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={panel === item.id ? 'active' : ''}
            onClick={() => setPanel(panel === item.id ? null : item.id)}
          >
            {item.label}
          </button>
        ))}
        <i />
        <b>OPTICS_MODE:</b>
        <button type="button" className="active">GESTURE</button>
      </div>

      <aside className="sv-minority-rail">
        {PANELS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              className={panel === item.id ? 'active' : ''}
              onClick={() => setPanel(panel === item.id ? null : item.id)}
              title={item.label}
            >
              <Icon size={17} />
              <small>{item.label.slice(0, 1)}</small>
            </button>
          );
        })}
      </aside>

      <section className="sv-minority-readout left">
        <span>AIR // ACTIVE</span>
        <span>V_SYNC // PRECOG-COEF</span>
        <span>ALCHEM_DEV1 // SOLID_SYNTHETIC</span>
      </section>

      <section className="sv-minority-readout right">
        <span>SYS_ALIGN: 98%</span>
        <span>CHRON_6 LOCK: 0%</span>
        <span>EST. 2100 VECTOR</span>
      </section>

      <footer className="sv-minority-footer">
        <span>ACTIVE_TOOL: <b>{panel || 'SCAN'}</b></span>
        <span>MATERIAL: <b>{material}</b></span>
        <span>GRID: OFF</span>
        <span>SNAP: ON</span>
        <span>ZOOM: 100%</span>
      </footer>

      {panel && (
        <section className="sv-minority-panel">
          <header>
            <div>
              <b>{activePanel?.label}</b>
              <span>predictive spatial intelligence command surface</span>
            </div>
            <button type="button" onClick={() => setPanel(null)}>CLOSE</button>
          </header>

          {panel === 'THEMES' && (
            <div className="sv-minority-showcase">
              <button className="active" type="button">
                <Eye size={18} />
                <b>MINORITY REPORT</b>
                <span>gestural whiteglass / cyan forensic optics / predictive interface</span>
              </button>
              <button type="button"><Aperture size={18} /><b>LOCKED</b><span>other cinematic presets remain archived for this pass</span></button>
            </div>
          )}

          {panel === 'TOOLS' && (
            <div className="sv-minority-grid">
              <button type="button" onClick={() => emit('savant-spotlight-config', { enabled: true, intensity: 10, distance: 1700, angle: 26, softness: .62 })}>
                <Lightbulb size={16} /><b>INSPECTION LIGHT</b><span>forward ship illumination</span>
              </button>
              <button type="button" onClick={() => emit('savant-spotlight-config', { enabled: false, intensity: 0 })}>
                <Eye size={16} /><b>PASSIVE OPTICS</b><span>return to ambient analysis</span>
              </button>
              <button type="button" onClick={() => emit('savant-flight-command', { speed: 0.55, strafe: 0, lift: 0, yaw: 0 })}>
                <Target size={16} /><b>INSPECTION DRIFT</b><span>slow material review</span>
              </button>
            </div>
          )}

          {panel === 'FLIGHT' && (
            <div className="sv-minority-grid">
              {[
                ['CRUISE', { speed: 1, strafe: 0, lift: 0, yaw: 0 }],
                ['FAST PASS', { speed: 2.4, strafe: 0, lift: 0, yaw: 0 }],
                ['PORT SWEEP', { speed: 1.2, strafe: -0.8, lift: 0, yaw: -0.5 }],
                ['STARBOARD', { speed: 1.2, strafe: 0.8, lift: 0, yaw: 0.5 }],
                ['RISE', { speed: 1, strafe: 0, lift: 0.9, yaw: 0 }],
                ['DROP', { speed: 1, strafe: 0, lift: -0.9, yaw: 0 }]
              ].map(([label, command]) => (
                <button key={label as string} type="button" onClick={() => emit('savant-flight-command', command)}>
                  <Move3D size={16} /><b>{label as string}</b><span>gesture flight preset</span>
                </button>
              ))}
            </div>
          )}

          {panel === 'WEAPONS' && (
            <div className="sv-minority-grid">
              {['PULSE', 'RAIL', 'FLAK', 'LANCE'].map((item) => (
                <button key={item} type="button" className={weapon === item ? 'active' : ''} onClick={() => setWeapon(item)}>
                  <Crosshair size={16} /><b>{item}</b><span>select vector weapon</span>
                </button>
              ))}
              <button type="button" className="danger" onClick={() => emit('savant-weapon-fire', { weapon })}>
                <Zap size={16} /><b>FIRE {weapon}</b><span>strike nearest asteroid vector</span>
              </button>
            </div>
          )}

          {panel === 'MATERIALS' && (
            <div className="sv-minority-grid compact">
              {MATERIALS.map((item) => (
                <button key={item.id} type="button" className={material === item.id ? 'active' : ''} onClick={() => applyMaterial(item.id)}>
                  <Layers size={16} /><b>{item.label}</b><span>{item.meta}</span>
                </button>
              ))}
            </div>
          )}

          {panel === 'RADAR' && (
            <div className="sv-minority-radar-panel">
              <div />
              <p>Predictive field radar. Scene remains visible. Crosshair remains primary.</p>
            </div>
          )}

          {panel === 'SYSTEMS' && (
            <div className="sv-minority-grid">
              <button type="button"><BookOpen size={16} /><b>LINEAGE</b><span>events expose source and intent</span></button>
              <button type="button"><Atom size={16} /><b>CORE</b><span>graph-ready control surface</span></button>
              <button type="button"><Shield size={16} /><b>SAFETY</b><span>one panel only</span></button>
            </div>
          )}
        </section>
      )}
    </div>
  );
});

SavantOperationalHUD.displayName = 'SavantOperationalHUD';
