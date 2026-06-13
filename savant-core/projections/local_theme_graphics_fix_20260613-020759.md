# Local Theme Graphics Fix

timestamp: 20260613-020759

Fixed:
- Removed dependency on /mnt/data.
- Generated production local atlas:
  public/assets/themes/generated/savant-theme-atlas.png
- Generated transparent HUD SVG:
  public/assets/themes/generated/hud-overlay.svg
- Wired graphics into:
  - menubar
  - subbar
  - rail
  - panel
  - footer
  - cards
  - HUD overlay
- Each theme samples a different atlas region.

Backup:
audits/before-local-theme-graphics-20260613-020759.tar.gz
