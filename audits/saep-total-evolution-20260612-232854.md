# SAEP TOTAL EVOLUTION AUDIT

timestamp: 20260612-232854
root: /root/savant-061126
backup: audits/before-saep-total-evolution-20260612-232854.tar.gz

## FACT — PRESENT
- Vite + React + Three.js application.
- Express server with Gemini endpoints.
- OptimizedSpaceScene active in App.
- AppStateContext is central state authority.
- GLB asteroid asset path expected: public/assets/ast/ast.glb.
- Current temporary evolution console exists but is visually hidden by CSS.
- Current scene uses InstancedMesh for asteroid field.
- Current package scripts include purge/check/audit helpers.

## FACT — PARTIAL
- HUD restoration exists only through CSS/class assumptions.
- Asteroid material switching is referenced but not enforced through a dedicated visible deck.
- Knowledge/graph/intelligence concepts exist mostly as projections, not runtime authority.

## FACT — BROKEN / RISK
- App mounts SavantEvolutionConsole despite later CSS hiding it.
- That is dead active UI capital and should be removed from runtime mount.
- Material switching needs explicit event bridge.
- Scene needs stronger cinematic lighting, material variations, and parallax layers.
- index.html title remains generic.

## FACT — DUPLICATED
- Projection files record multiple prior optimization passes.
- Previous ThreeScene/CockpitHUD systems appear in audit history but are not active in current App.

## UNKNOWN
- Runtime FPS and GPU timing require device profiling.
- GLB internal material quality requires asset inspection.
- Gemini endpoint behavior requires valid API key.

## IMPLEMENTATION
- Replace active environment with event-driven GLB-instanced asteroid field.
- Add SavantOperationalHUD as the active restored HUD.
- Remove hidden SavantEvolutionConsole from App runtime.
- Add explicit 7-material asteroid deck.
- Improve title/metadata.
- Preserve BootScreen, DestinationScreen, CRTOverlay, AppStateContext, server endpoints, and GLB asset path.
