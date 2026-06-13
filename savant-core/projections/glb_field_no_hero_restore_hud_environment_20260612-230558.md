# GLB Field / No Hero / HUD Restore / Cinematic Environment

Applied:
- Removed the giant standalone rotating hero asteroid.
- All asteroids now move through the field as GLB instances.
- Asteroid source remains public/assets/ast/ast.glb.
- Added offscreen sun directional lighting.
- Sun itself is not rendered.
- Lighting angle designed to reveal crags and shadows.
- Added cold rim light and warm bounce light.
- Added three-layer parallax starfield.
- Added subtle nebula atmosphere layers.
- Restored HUD by hiding the temporary SavantEvolutionConsole layer.
- Preserved asteroidTheme event/state path so the 7 deck buttons can change asteroid materials if they update asteroidTheme.

Validation:
- npm run lint
- npm run build
