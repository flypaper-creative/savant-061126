# Vertical Tools / Live Materials / Starfield Upgrade

timestamp: 20260613-001044

Implemented:
- Removed bottom material deck.
- Added MATERIALS as a vertical-menu tool panel.
- Material changes now emit live events and no longer remount/reset the asteroid field.
- Added expanded vertical menu:
  - Spotlight
  - Flight
  - Weapons
  - Materials
  - Radar
  - Telemetry
  - Mission
  - Environment
- Added robust spotlight panel:
  - toggle
  - intensity slider
  - distance slider
  - beam-width slider
- Added ship flight panel:
  - thrust
  - port/starboard
  - rise
  - yaw
- Added weapons panel:
  - Pulse
  - Rail
  - Flak
  - Lance
  - fire command
- Scene listens to events:
  - savant-asteroid-theme
  - savant-spotlight-config
  - savant-flight-command
  - savant-weapon-fire
- Added four-layer procedural starfield with independent drift/parallax.
- Preserved GLB instanced asteroid field.
- Preserved current baseline identity and core functionality.

Backup:
audits/before-vertical-tools-live-materials-20260613-001044.tar.gz
