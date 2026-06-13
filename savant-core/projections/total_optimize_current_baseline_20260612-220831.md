# Total Optimize Current Baseline

timestamp: 20260612-220831

Baseline:
- current /root/savant-061126 source dump
- current site retained as authority

Implemented:
- removed active scanline/CRT rendering
- replaced CRT overlay with cinematic optical overlay
- replaced active ThreeScene mount with optimized native Three.js instanced space scene
- used one generated asteroid source geometry
- rendered asteroid belt through THREE.InstancedMesh
- capped DPR for Android / low-memory devices
- added reduced-motion handling
- added proper dispose cleanup for renderer, geometry, materials, buffers
- removed random transform generation from App render path
- memoized high-level shell/evolution console
- hardened Vite chunk splitting
- added purge/check/audit scripts
- added responsive overflow safeguards
- preserved BootScreen, DestinationScreen, AppStateContext, audio, Gemini endpoints, and current content architecture

Validation:
- npm run lint
- npm run build
- npm run audit:scanlines

Backup:
audits/before-total-optimize-current-baseline-20260612-220831.tar.gz

Audit:
audits/total-optimize-current-baseline-20260612-220831.md
