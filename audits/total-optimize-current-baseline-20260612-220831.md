# SAVANT TOTAL OPTIMIZE CURRENT BASELINE

timestamp: 20260612-220831
root: /root/savant-061126

## files
./.env
./.env.example
./.gitignore
./README.md
./index.html
./metadata.json
./package-lock.json
./package.json
./public/assets/logo7/logo7.glb
./savant-core/projections/every_concept_upgrade_20260612-214446.md
./server.ts
./src/App.tsx
./src/App.tsx.before-every-concept-upgrade-20260612-214446
./src/components/ArcadeCalibrator.tsx
./src/components/AstroRadarMap.tsx
./src/components/BootScreen.tsx
./src/components/CRTOverlay.tsx
./src/components/CockpitHUD.tsx
./src/components/CupolaFrame.tsx
./src/components/DestinationScreen.tsx
./src/components/ErrorDisplay.tsx
./src/components/HolographicVectorProjection.tsx
./src/components/ThreeScene.tsx
./src/components/evolution/SavantEvolutionConsole.tsx
./src/contexts/AppStateContext.tsx
./src/hooks/useAudio.ts
./src/index.css
./src/index.css.before-every-concept-upgrade-20260612-214446
./src/main.tsx
./src/types.ts
./tsconfig.json
./vite.config.ts

## package
{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.1.14",
    "@vitejs/plugin-react": "^5.0.4",
    "canvas-confetti": "^1.9.4",
    "d3": "^7.9.0",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "gsap": "^3.15.0",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "three": "^0.184.0",
    "vite": "^6.2.3"
  },
  "devDependencies": {
    "@types/canvas-confetti": "^1.9.0",
    "@types/d3": "^7.4.3",
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/react": "^19.2.15",
    "@types/react-dom": "^19.2.3",
    "@types/three": "^0.184.1",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.1.14",
    "tsx": "^4.21.0",
    "typescript": "~5.8.2",
    "vite": "^6.2.3"
  }
}

## source sizes
    58 src/App.tsx
  2176 src/components/ArcadeCalibrator.tsx
   533 src/components/AstroRadarMap.tsx
   447 src/components/BootScreen.tsx
   234 src/components/CRTOverlay.tsx
  3525 src/components/CockpitHUD.tsx
    45 src/components/CupolaFrame.tsx
  1164 src/components/DestinationScreen.tsx
   224 src/components/ErrorDisplay.tsx
   368 src/components/HolographicVectorProjection.tsx
  7225 src/components/ThreeScene.tsx
   233 src/components/evolution/SavantEvolutionConsole.tsx
   216 src/contexts/AppStateContext.tsx
   987 src/hooks/useAudio.ts
   439 src/index.css
    10 src/main.tsx
    49 src/types.ts
 17933 total

## scanline references before
src/components/ArcadeCalibrator.tsx:2012:        {/* Raster glass glare, scanlines, and radial neon vignette */}
src/components/HolographicVectorProjection.tsx:346:      {/* Visual background scanning noise scanline */}
src/components/HolographicVectorProjection.tsx:347:      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/1 to-transparent pointer-events-none z-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,250,255,0.01) 0px, rgba(0,0,0,0) 2px)' }} />
src/components/ThreeScene.tsx:74:        // High frequency scanline shearing bands
src/components/ThreeScene.tsx:124:      // 3. Scanline stripes baked directly into 3D camera layer
src/components/ThreeScene.tsx:125:      float scanline = sin(zoomedDistortedCoord.y * 1100.0) * 0.018;
src/components/ThreeScene.tsx:126:      baseColor.rgb -= scanline;
src/components/ThreeScene.tsx:6090:      // Ambient minor scanline fluctuations (signal drops) in operational flight mode representing deep outer space radiation
src/components/DestinationScreen.tsx:452:      {/* High-fidelity CRT and vector scan line overlays to look atmospheric */}
src/components/CRTOverlay.tsx:4:export const CRTOverlay: React.FC = () => {
src/components/CRTOverlay.tsx:45:          scanlineColor: 'rgba(255, 10, 10, 0.16)',
src/components/CRTOverlay.tsx:55:          scanlineColor: 'rgba(245, 158, 11, 0.14)',
src/components/CRTOverlay.tsx:65:          scanlineColor: 'rgba(0, 242, 255, 0.15)',
src/components/CRTOverlay.tsx:75:          scanlineColor: 'rgba(217, 70, 239, 0.18)',
src/components/CRTOverlay.tsx:85:          scanlineColor: 'rgba(253, 186, 116, 0.15)',
src/components/CRTOverlay.tsx:95:          scanlineColor: 'rgba(34, 197, 94, 0.18)',
src/components/CRTOverlay.tsx:105:          scanlineColor: 'rgba(249, 115, 22, 0.18)',
src/components/CRTOverlay.tsx:115:          scanlineColor: 'rgba(255, 255, 255, 0.08)',
src/components/CRTOverlay.tsx:135:          scanlineIntensity: 'opacity-40 animate-pulse',
src/components/CRTOverlay.tsx:144:          scanlineIntensity: 'opacity-15',
src/components/CRTOverlay.tsx:154:          scanlineIntensity: 'opacity-25',
src/components/CRTOverlay.tsx:165:      id="savant-crt-visual-overlay" 
src/components/CRTOverlay.tsx:171:      {/* 2. DYNAMIC CRT SCANLINE STRIPES Repeating Gradient */}
src/components/CRTOverlay.tsx:173:        className={`absolute inset-0 pointer-events-none transition-all duration-300 ${phaseMod.scanlineIntensity}`}
src/components/CRTOverlay.tsx:175:          backgroundImage: `repeating-linear-gradient(
src/components/CRTOverlay.tsx:179:            ${currentTheme.scanlineColor} 2px,
src/components/CRTOverlay.tsx:180:            ${currentTheme.scanlineColor} 3px,
src/components/CRTOverlay.tsx:189:        className="absolute left-0 right-0 w-full h-[6px] opacity-45 pointer-events-none animate-scanline"
src/components/CRTOverlay.tsx:191:          backgroundImage: `linear-gradient(to bottom, transparent 0%, ${currentTheme.scanlineColor} 50%, transparent 100%)`,
src/components/CRTOverlay.tsx:196:      {/* 4. REAL-TIME MULTI-OCTAVE SVG FILM-GRAIN TEXTURE (Perfect organic cinematic grit) */}
src/components/CRTOverlay.tsx:198:        <filter id="film-grain-noise">
src/components/CRTOverlay.tsx:215:        <rect width="100%" height="100%" filter="url(#film-grain-noise)" />
src/App.tsx:6:import { CRTOverlay } from './components/CRTOverlay';
src/App.tsx:26:      <CRTOverlay />
src/index.css:10:  --animate-scanline: scanline 8s linear infinite;
src/index.css:13:  @keyframes scanline {
src/App.tsx.before-every-concept-upgrade-20260612-214446:7:import { CRTOverlay } from './components/CRTOverlay';
src/App.tsx.before-every-concept-upgrade-20260612-214446:29:      {/* Dynamic CRT CRT-style Scanline and Film-Grain Overlay */}
src/App.tsx.before-every-concept-upgrade-20260612-214446:30:      <CRTOverlay />
src/index.css.before-every-concept-upgrade-20260612-214446:10:  --animate-scanline: scanline 8s linear infinite;
src/index.css.before-every-concept-upgrade-20260612-214446:13:  @keyframes scanline {

## animation / loop references
src/hooks/useAudio.ts:1:import { useEffect, useRef, useCallback } from 'react';
src/hooks/useAudio.ts:193:      setTimeout(() => {
src/hooks/useAudio.ts:301:        setTimeout(() => {
src/hooks/useAudio.ts:359:        currentObj.chordTimeoutId = setTimeout(playNextSpaceChord, 14500);
src/hooks/useAudio.ts:420:          setTimeout(() => {
src/hooks/useAudio.ts:444:      stateObj.sequencerIntervalId = setInterval(playSequencerStep, 220);
src/hooks/useAudio.ts:525:        setTimeout(() => {
src/hooks/useAudio.ts:538:        currentObj.melodyTimeoutId = setTimeout(playSpaceMelodyChime, 4800);
src/hooks/useAudio.ts:573:        currentObj.glitchTimeoutId = setTimeout(playAnalogGlitchTick, nextLaunch);
src/hooks/useAudio.ts:580:      setTimeout(() => {
src/hooks/useAudio.ts:613:      setTimeout(() => {
src/hooks/useAudio.ts:627:  useEffect(() => {
src/hooks/useAudio.ts:676:  useEffect(() => {
src/components/BootScreen.tsx:1:import React, { useState, useEffect } from 'react';
src/components/BootScreen.tsx:15:  useEffect(() => {
src/components/BootScreen.tsx:70:    const interval = setInterval(() => {
src/components/BootScreen.tsx:110:    setTimeout(() => {
src/components/ArcadeCalibrator.tsx:1:import React, { useRef, useEffect, useState } from 'react';
src/components/ArcadeCalibrator.tsx:161:  useEffect(() => {
src/components/ArcadeCalibrator.tsx:397:  useEffect(() => {
src/components/ArcadeCalibrator.tsx:868:          loopFrameId = requestAnimationFrame(frameLoop);
src/components/ArcadeCalibrator.tsx:1951:        loopFrameId = requestAnimationFrame(frameLoop);
src/components/ArcadeCalibrator.tsx:1955:    loopFrameId = requestAnimationFrame(frameLoop);
src/components/HolographicVectorProjection.tsx:1:import React, { useEffect, useRef, useState } from 'react';
src/components/HolographicVectorProjection.tsx:23:  useEffect(() => {
src/components/HolographicVectorProjection.tsx:51:  useEffect(() => {
src/components/HolographicVectorProjection.tsx:52:    const interval = setInterval(() => {
src/components/HolographicVectorProjection.tsx:67:  useEffect(() => {
src/components/AstroRadarMap.tsx:1:import React, { useState, useMemo, useEffect } from 'react';
src/components/AstroRadarMap.tsx:130:  useEffect(() => {
src/components/AstroRadarMap.tsx:134:      frameId = requestAnimationFrame(animate);
src/components/AstroRadarMap.tsx:136:    frameId = requestAnimationFrame(animate);
src/components/ThreeScene.tsx:1:import React, { useEffect, useRef, useState } from 'react';
src/components/ThreeScene.tsx:153:    uColor: { value: new THREE.Color(0x00f2ff) }
src/components/ThreeScene.tsx:226:    uDriftOffset: { value: new THREE.Vector2(0, 0) },
src/components/ThreeScene.tsx:396:  const geom = new THREE.SphereGeometry(14.0, 24, 24);
src/components/ThreeScene.tsx:397:  const mat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:398:    color: new THREE.Color(colorHex),
src/components/ThreeScene.tsx:405:  const shieldMesh = new THREE.Mesh(geom, mat);
src/components/ThreeScene.tsx:409:  const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
src/components/ThreeScene.tsx:454:    const tv = new THREE.Vector3();
src/components/ThreeScene.tsx:462:    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
src/components/ThreeScene.tsx:472:    geom.setIndex(new THREE.BufferAttribute(indices, 1));
src/components/ThreeScene.tsx:525:    const dummyTex = new THREE.CanvasTexture(colCanvas);
src/components/ThreeScene.tsx:825:  const mapTex = new THREE.CanvasTexture(colCanvas);
src/components/ThreeScene.tsx:826:  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
src/components/ThreeScene.tsx:827:  const normalTex = new THREE.CanvasTexture(normCanvas);
src/components/ThreeScene.tsx:828:  const roughTex = new THREE.CanvasTexture(roughCanvas);
src/components/ThreeScene.tsx:829:  const metalTex = new THREE.CanvasTexture(metalCanvas);
src/components/ThreeScene.tsx:863:  const tex = new THREE.CanvasTexture(canvas);
src/components/ThreeScene.tsx:1011:  const texture = new THREE.CanvasTexture(canvas);
src/components/ThreeScene.tsx:1138:  const texture = new THREE.CanvasTexture(canvas);
src/components/ThreeScene.tsx:1229:  const texture = new THREE.CanvasTexture(canvas);
src/components/ThreeScene.tsx:1265:  const texture = new THREE.CanvasTexture(canvas);
src/components/ThreeScene.tsx:1297:    new THREE.Color(0xff00ff), // Vivid Hot Magenta
src/components/ThreeScene.tsx:1298:    new THREE.Color(0x00ffff), // Brilliant Electric Cyan
src/components/ThreeScene.tsx:1299:    new THREE.Color(0x8a2be2), // Blue Violet / Amethyst
src/components/ThreeScene.tsx:1300:    new THREE.Color(0xff007f), // Neon Rose
src/components/ThreeScene.tsx:1301:    new THREE.Color(0x39ff14), // Acid/Electric Green
src/components/ThreeScene.tsx:1302:    new THREE.Color(0xff4500), // Vibrant Orange/Red
src/components/ThreeScene.tsx:1303:    new THREE.Color(0xffffff), // Hot Star White
src/components/ThreeScene.tsx:1321:    const vDir = new THREE.Vector3(dx, dy, dz).normalize();
src/components/ThreeScene.tsx:1342:  const geom = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:1343:  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
src/components/ThreeScene.tsx:1344:  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
src/components/ThreeScene.tsx:1346:  const mat = new THREE.PointsMaterial({
src/components/ThreeScene.tsx:1356:  const points = new THREE.Points(geom, mat);
src/components/ThreeScene.tsx:1360:  const rotVel = new THREE.Vector3(
src/components/ThreeScene.tsx:1394:  const texture = new THREE.CanvasTexture(canvas);
src/components/ThreeScene.tsx:1556:  const texture = new THREE.CanvasTexture(canvas);
src/components/ThreeScene.tsx:1561:const COOL_BASE_COLOR = new THREE.Color(0x030305);
src/components/ThreeScene.tsx:1562:const HOT_HEAT_COLOR = new THREE.Color(0xffaa22);
src/components/ThreeScene.tsx:1563:const EMISSIVE_CYAN_COLOR = new THREE.Color(0x00f2ff);
src/components/ThreeScene.tsx:1564:const EMISSIVE_WHITE_COLOR = new THREE.Color(0xffffff);
src/components/ThreeScene.tsx:1604:  useEffect(() => { phaseRef.current = phase; }, [phase]);
src/components/ThreeScene.tsx:1605:  useEffect(() => {
src/components/ThreeScene.tsx:1613:  useEffect(() => { opticModeRef.current = opticMode; }, [opticMode]);
src/components/ThreeScene.tsx:1614:  useEffect(() => { filterEffectRef.current = filterEffect; }, [filterEffect]);
src/components/ThreeScene.tsx:1615:  useEffect(() => { telemetryRef.current = telemetry; }, [telemetry]);
src/components/ThreeScene.tsx:1616:  useEffect(() => { colorRef.current = pilotConfig.hudColor; }, [pilotConfig.hudColor]);
src/components/ThreeScene.tsx:1617:  useEffect(() => { spotlightActiveRef.current = spotlightActive; }, [spotlightActive]);
src/components/ThreeScene.tsx:1618:  useEffect(() => { spotlightIntensityRef.current = spotlightIntensity; }, [spotlightIntensity]);
src/components/ThreeScene.tsx:1619:  useEffect(() => { spotlightColorRef.current = spotlightColor; }, [spotlightColor]);
src/components/ThreeScene.tsx:1620:  useEffect(() => { spotlightAngleRef.current = spotlightAngle; }, [spotlightAngle]);
src/components/ThreeScene.tsx:1621:  useEffect(() => { screenShakeRef.current = screenShake; }, [screenShake]);
src/components/ThreeScene.tsx:1629:          nebula1: new THREE.Color(0xb20000),      // blood red
src/components/ThreeScene.tsx:1630:          nebula2: new THREE.Color(0x590000),      // dark crimson
src/components/ThreeScene.tsx:1631:          nebula3: new THREE.Color(0xff4d4d),      // red flare
src/components/ThreeScene.tsx:1632:          background: new THREE.Color(0x100101),   // blood red void
src/components/ThreeScene.tsx:1636:          nebula1: new THREE.Color(0x3a4556),      // gunmetal grey
src/components/ThreeScene.tsx:1637:          nebula2: new THREE.Color(0x1e2530),      // dark charcoal
src/components/ThreeScene.tsx:1638:          nebula3: new THREE.Color(0x535f72),      // steel grey
src/components/ThreeScene.tsx:1639:          background: new THREE.Color(0x050609),   // slate void
src/components/ThreeScene.tsx:1643:          nebula1: new THREE.Color(0xd4af37),      // gold dust
src/components/ThreeScene.tsx:1644:          nebula2: new THREE.Color(0xc0c0c0),      // silver dust
src/components/ThreeScene.tsx:1645:          nebula3: new THREE.Color(0xbfa555),      // gold highlights
src/components/ThreeScene.tsx:1646:          background: new THREE.Color(0x06050b),   // obsidian void
src/components/ThreeScene.tsx:1650:          nebula1: new THREE.Color(0x4c0519),      // wine
src/components/ThreeScene.tsx:1651:          nebula2: new THREE.Color(0x6b21a8),      // electric violet
src/components/ThreeScene.tsx:1652:          nebula3: new THREE.Color(0xd946ef),      // magenta
src/components/ThreeScene.tsx:1653:          background: new THREE.Color(0x0c011a),   // grid void
src/components/ThreeScene.tsx:1657:          nebula1: new THREE.Color(0xfba875),      // peach
src/components/ThreeScene.tsx:1658:          nebula2: new THREE.Color(0xacd2e6),      // pastel blue
src/components/ThreeScene.tsx:1659:          nebula3: new THREE.Color(0xc5aed5),      // lavender
src/components/ThreeScene.tsx:1660:          background: new THREE.Color(0x0c0817),   // opal void
src/components/ThreeScene.tsx:1664:          nebula1: new THREE.Color(0x15803d),      // bio green
src/components/ThreeScene.tsx:1665:          nebula2: new THREE.Color(0x14532d),      // forest green
src/components/ThreeScene.tsx:1666:          nebula3: new THREE.Color(0x22c55e),      // vibrant radioactive green
src/components/ThreeScene.tsx:1667:          background: new THREE.Color(0x011405),   // toxic void
src/components/ThreeScene.tsx:1671:          nebula1: new THREE.Color(0xc2410c),      // flaming copper
src/components/ThreeScene.tsx:1672:          nebula2: new THREE.Color(0x7c2d12),      // magma rust
src/components/ThreeScene.tsx:1673:          nebula3: new THREE.Color(0xea580c),      // solar flare
src/components/ThreeScene.tsx:1674:          background: new THREE.Color(0x120300),   // plasma void
src/components/ThreeScene.tsx:1678:          nebula1: new THREE.Color(0x1d4ed8),
src/components/ThreeScene.tsx:1679:          nebula2: new THREE.Color(0xd97736),
src/components/ThreeScene.tsx:1680:          nebula3: new THREE.Color(0x111827),
src/components/ThreeScene.tsx:1681:          background: new THREE.Color(0x000103),
src/components/ThreeScene.tsx:1916:    const targetColor = new THREE.Color(targetHex);
src/components/ThreeScene.tsx:1921:  useEffect(() => {
src/components/ThreeScene.tsx:1955:  const instancedAsteroidsRef = useRef<THREE.InstancedMesh | null>(null);
src/components/ThreeScene.tsx:2015:  const shipVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
src/components/ThreeScene.tsx:2016:  const gForceOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
src/components/ThreeScene.tsx:2017:  const userControlledPosRef = useRef(new THREE.Vector3(0, 0, 0));
src/components/ThreeScene.tsx:2022:  const shipPosRef = useRef(new THREE.Vector3(0, 0, -50)); // Starting position Z = -50
src/components/ThreeScene.tsx:2023:  const shipVRef = useRef(new THREE.Vector3(0, 0, 0)); // Newtonian velocity vector
src/components/ThreeScene.tsx:2046:  const starDriftOffsetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
src/components/ThreeScene.tsx:2056:  useEffect(() => {
src/components/ThreeScene.tsx:2457:      const defaultGeom = new THREE.DodecahedronGeometry(1.0, 0);
src/components/ThreeScene.tsx:2458:      const defaultMat = new THREE.MeshStandardMaterial({ color: 0x161514 });
src/components/ThreeScene.tsx:2462:        const fragMesh = new THREE.Mesh(defaultGeom, defaultMat);
src/components/ThreeScene.tsx:2471:        const outward = new THREE.Vector3(
src/components/ThreeScene.tsx:2482:        const finalRot = new THREE.Vector3(
src/components/ThreeScene.tsx:2537:          geom = new THREE.SphereGeometry(1.2, 8, 8);
src/components/ThreeScene.tsx:2538:          mat = new THREE.MeshBasicMaterial({ color: colorHex });
src/components/ThreeScene.tsx:2543:          geom = new THREE.CylinderGeometry(0.3, 0.3, 8, 4);
src/components/ThreeScene.tsx:2545:          mat = new THREE.MeshBasicMaterial({ color: colorHex });
src/components/ThreeScene.tsx:2550:          geom = new THREE.TorusGeometry(1.1, 0.25, 6, 12);
src/components/ThreeScene.tsx:2551:          mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });
src/components/ThreeScene.tsx:2556:          geom = new THREE.CylinderGeometry(0.15, 0.15, 10, 4);
src/components/ThreeScene.tsx:2558:          mat = new THREE.MeshBasicMaterial({ color: colorHex });
src/components/ThreeScene.tsx:2563:          geom = new THREE.IcosahedronGeometry(0.8, 0);
src/components/ThreeScene.tsx:2564:          mat = new THREE.MeshBasicMaterial({ color: colorHex });
src/components/ThreeScene.tsx:2569:          geom = new THREE.SphereGeometry(1.5, 6, 6);
src/components/ThreeScene.tsx:2570:          mat = new THREE.MeshBasicMaterial({ color: colorHex });
src/components/ThreeScene.tsx:2575:          geom = new THREE.ConeGeometry(0.5, 3.2, 4);
src/components/ThreeScene.tsx:2577:          mat = new THREE.MeshBasicMaterial({ color: colorHex });
src/components/ThreeScene.tsx:2581:          geom = new THREE.SphereGeometry(0.5, 6, 6);
src/components/ThreeScene.tsx:2582:          mat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });
src/components/ThreeScene.tsx:2585:      const mesh = new THREE.Mesh(geom, mat);
src/components/ThreeScene.tsx:2587:      const startPos = new THREE.Vector3(
src/components/ThreeScene.tsx:2594:      const dir = new THREE.Vector3(
src/components/ThreeScene.tsx:2716:  useEffect(() => {
src/components/ThreeScene.tsx:2727:    const renderer = new THREE.WebGLRenderer({
src/components/ThreeScene.tsx:2749:    const scene = new THREE.Scene();
src/components/ThreeScene.tsx:2750:    scene.background = new THREE.Color(0x000000);
src/components/ThreeScene.tsx:2754:    geoDodecSharedRef.current = new THREE.DodecahedronGeometry(1.0, 0);
src/components/ThreeScene.tsx:2755:    geoIcosSharedRef.current = new THREE.IcosahedronGeometry(1.0, 1);
src/components/ThreeScene.tsx:2756:    geoTetraSharedRef.current = new THREE.TetrahedronGeometry(1.0, 0);
src/components/ThreeScene.tsx:2758:    matMoltenSharedRef.current = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:2767:    matCrustSharedRef.current = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:2774:    matBasaltSharedRef.current = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:2782:    const camera = new THREE.PerspectiveCamera(
src/components/ThreeScene.tsx:2800:      new THREE.Vector2(width, height),
src/components/ThreeScene.tsx:2821:    const ambientLight = new THREE.AmbientLight(0x111622, 0.35); // Increased to soften harsh crevices and reduce flash contrasts
src/components/ThreeScene.tsx:2826:    scene.fog = new THREE.FogExp2(0x000103, 0.0022);
src/components/ThreeScene.tsx:2829:    const skyGlowBounce = new THREE.DirectionalLight(0x4a5de8, 1.4); 
src/components/ThreeScene.tsx:2834:    const dustScatterLight = new THREE.DirectionalLight(0xffaa44, 1.2);
src/components/ThreeScene.tsx:2839:    const nebulaRimLight = new THREE.DirectionalLight(0xa855f7, 1.0);
src/components/ThreeScene.tsx:2844:    const keyLight = new THREE.DirectionalLight(0xffedd5, 5.5); // reduced to soften the overall glaring highlight intensity
src/components/ThreeScene.tsx:2862:    const fillLight = new THREE.DirectionalLight(0x00f2ff, 1.1); // Subdued fill for high-vibrancy tech-glow shadows
src/components/ThreeScene.tsx:2867:    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.4); // lessened for realistic outline levels
src/components/ThreeScene.tsx:2879:    const explosionLight = new THREE.PointLight(0xffedd5, 0, 600);
src/components/ThreeScene.tsx:2886:    const starGeometry = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:2933:    starGeometry.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
src/components/ThreeScene.tsx:2934:    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
src/components/ThreeScene.tsx:2935:    starGeometry.setAttribute('aLayerIndex', new THREE.BufferAttribute(starLayers, 1));
src/components/ThreeScene.tsx:2937:    const starMaterial = new THREE.ShaderMaterial({
src/components/ThreeScene.tsx:2941:        uDriftOffset: { value: new THREE.Vector2(0, 0) },
src/components/ThreeScene.tsx:2955:    const stars = new THREE.Points(starGeometry, starMaterial);
src/components/ThreeScene.tsx:2961:    const warpGeometry = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:3016:    warpGeometry.setAttribute('position', new THREE.BufferAttribute(warpCoords, 3));
src/components/ThreeScene.tsx:3017:    warpGeometry.setAttribute('color', new THREE.BufferAttribute(warpColors, 3));
src/components/ThreeScene.tsx:3019:    const warpMaterial = new THREE.LineBasicMaterial({
src/components/ThreeScene.tsx:3027:    const warpLines = new THREE.LineSegments(warpGeometry, warpMaterial);
src/components/ThreeScene.tsx:3034:    const gridHelper = new THREE.GridHelper(100, 50, 0x00f2ff, 0x002244);
src/components/ThreeScene.tsx:3042:    const dustGeometry = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:3049:      const mixedColor = new THREE.Color().setHSL(0.55 + Math.random() * 0.12, 0.95, 0.45);
src/components/ThreeScene.tsx:3054:    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustCoords, 3));
src/components/ThreeScene.tsx:3055:    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
src/components/ThreeScene.tsx:3056:    const dustMaterial = new THREE.PointsMaterial({
src/components/ThreeScene.tsx:3064:    const dustClouds = new THREE.Points(dustGeometry, dustMaterial);
src/components/ThreeScene.tsx:3069:    const warpTunnelGroup = new THREE.Group();
src/components/ThreeScene.tsx:3073:      const ringGeom = new THREE.TorusGeometry(5.2, 0.03, 4, 6);
src/components/ThreeScene.tsx:3074:      const ringMat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3075:        color: new THREE.Color(0x00f2ff),
src/components/ThreeScene.tsx:3080:      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
src/components/ThreeScene.tsx:3090:    const warpTunnelGeom = new THREE.CylinderGeometry(warpTunnelRadius, warpTunnelRadius, warpTunnelLength, 32, 64, true);
src/components/ThreeScene.tsx:3093:    const warpTunnelMat = new THREE.ShaderMaterial({
src/components/ThreeScene.tsx:3098:        uColor: { value: new THREE.Color(pilotConfig.hudColor) }
src/components/ThreeScene.tsx:3108:    const warpShaderTunnel = new THREE.Mesh(warpTunnelGeom, warpTunnelMat);
src/components/ThreeScene.tsx:3121:    const fractalPlaneGeo1 = new THREE.PlaneGeometry(280, 280);
src/components/ThreeScene.tsx:3122:    const fractalPlaneMat1 = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3130:    const fractalPlane1 = new THREE.Mesh(fractalPlaneGeo1, fractalPlaneMat1);
src/components/ThreeScene.tsx:3136:    const fractalPlaneGeo2 = new THREE.PlaneGeometry(240, 240);
src/components/ThreeScene.tsx:3137:    const fractalPlaneMat2 = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3145:    const fractalPlane2 = new THREE.Mesh(fractalPlaneGeo2, fractalPlaneMat2);
src/components/ThreeScene.tsx:3152:    const fractalPlaneGeo3 = new THREE.PlaneGeometry(200, 200);
src/components/ThreeScene.tsx:3153:    const fractalPlaneMat3 = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3161:    const fractalPlane3 = new THREE.Mesh(fractalPlaneGeo3, fractalPlaneMat3);
src/components/ThreeScene.tsx:3169:    const fractalSphereGeo = new THREE.SphereGeometry(140, 32, 24);
src/components/ThreeScene.tsx:3170:    const fractalSphereMat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3178:    const fractalSphere = new THREE.Mesh(fractalSphereGeo, fractalSphereMat);
src/components/ThreeScene.tsx:3191:    const coreGlowGeo = new THREE.PlaneGeometry(300, 300);
src/components/ThreeScene.tsx:3192:    const coreGlowMat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3200:    const coreGlowMesh = new THREE.Mesh(coreGlowGeo, coreGlowMat);
src/components/ThreeScene.tsx:3206:    const lensFlareGeo = new THREE.PlaneGeometry(900, 160); // extremely wide streak
src/components/ThreeScene.tsx:3207:    const lensFlareMat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3215:    const lensFlareMesh = new THREE.Mesh(lensFlareGeo, lensFlareMat);
src/components/ThreeScene.tsx:3222:    const shockwaveGeo = new THREE.PlaneGeometry(160, 160);
src/components/ThreeScene.tsx:3223:    const shockwaveMat1 = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3232:    const shockwave1 = new THREE.Mesh(shockwaveGeo, shockwaveMat1);
src/components/ThreeScene.tsx:3238:    const shockwaveMat2 = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3247:    const shockwave2 = new THREE.Mesh(shockwaveGeo, shockwaveMat2);
src/components/ThreeScene.tsx:3256:    const cloudGroup = new THREE.Group();
src/components/ThreeScene.tsx:3268:      const cloudGeo = new THREE.PlaneGeometry(cloudSize, cloudSize);
src/components/ThreeScene.tsx:3270:      const cloudMat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3279:      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
src/components/ThreeScene.tsx:3301:    const planetGroup = new THREE.Group();
src/components/ThreeScene.tsx:3304:    const planetGeo = new THREE.SphereGeometry(35, 32, 32);
src/components/ThreeScene.tsx:3321:    const planetTex = new THREE.CanvasTexture(planetCanvas);
src/components/ThreeScene.tsx:3322:    const planetMat = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:3328:    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
src/components/ThreeScene.tsx:3334:    const planetaryRingGeo = new THREE.RingGeometry(46, 82, 64);
src/components/ThreeScene.tsx:3336:    const planetaryRingMat = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:3343:    const planetaryRingMesh = new THREE.Mesh(planetaryRingGeo, planetaryRingMat);
src/components/ThreeScene.tsx:3354:    const gateGroup = new THREE.Group();
src/components/ThreeScene.tsx:3356:      const ringGeom = new THREE.TorusGeometry(3.5, 0.04, 8, 36);
src/components/ThreeScene.tsx:3357:      const ringMat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3358:        color: new THREE.Color(0x00f2ff),
src/components/ThreeScene.tsx:3363:      const gateRing = new THREE.Mesh(ringGeom, ringMat);
src/components/ThreeScene.tsx:3387:      return new THREE.MeshPhysicalMaterial({
src/components/ThreeScene.tsx:3392:        normalScale: new THREE.Vector2(5.0, 5.0), // Drastically boosted to render gorgeous razor crags & craters
src/components/ThreeScene.tsx:3402:        specularColor: new THREE.Color(0xd4d4d8), // Muted minerals
src/components/ThreeScene.tsx:3404:        emissive: new THREE.Color(0x000000),
src/components/ThreeScene.tsx:3413:        () => new THREE.IcosahedronGeometry(1, 3),     // Rugged high-res organic boulder
src/components/ThreeScene.tsx:3414:        () => new THREE.IcosahedronGeometry(1, 4),     // Majestic high-definition potato monolith template
src/components/ThreeScene.tsx:3419:      const tempV = new THREE.Vector3();
src/components/ThreeScene.tsx:3456:    const instancedMasterMesh = new THREE.InstancedMesh(
src/components/ThreeScene.tsx:3471:      const asteroid = new THREE.Mesh(geometry, material);
src/components/ThreeScene.tsx:3519:      const velocity = new THREE.Vector3(
src/components/ThreeScene.tsx:3527:      const angularVelocity = new THREE.Vector3(
src/components/ThreeScene.tsx:3547:        originalScale: new THREE.Vector3(scaleX, scaleY, scaleZ),
src/components/ThreeScene.tsx:3574:    const beltDustGeo = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:3598:    beltDustGeo.setAttribute('position', new THREE.BufferAttribute(beltDustCoords, 3));
src/components/ThreeScene.tsx:3599:    beltDustGeo.setAttribute('color', new THREE.BufferAttribute(beltDustColors, 3));
src/components/ThreeScene.tsx:3601:    const beltDustMat = new THREE.PointsMaterial({
src/components/ThreeScene.tsx:3611:    const dustBelt = new THREE.Points(beltDustGeo, beltDustMat);
src/components/ThreeScene.tsx:3618:    const glassDustGeo = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:3634:    glassDustGeo.setAttribute('position', new THREE.BufferAttribute(glassDustCoords, 3));
src/components/ThreeScene.tsx:3637:    const glassDustMat = new THREE.PointsMaterial({
src/components/ThreeScene.tsx:3639:      color: new THREE.Color(pilotConfig.hudColor), 
src/components/ThreeScene.tsx:3647:    const glassDustMesh = new THREE.Points(glassDustGeo, glassDustMat);
src/components/ThreeScene.tsx:3654:    const meteorGeo = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:3722:    meteorGeo.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3));
src/components/ThreeScene.tsx:3723:    meteorGeo.setAttribute('color', new THREE.BufferAttribute(meteorColors, 3));
src/components/ThreeScene.tsx:3725:    const meteorMaterial = new THREE.LineBasicMaterial({
src/components/ThreeScene.tsx:3733:    const meteorLines = new THREE.LineSegments(meteorGeo, meteorMaterial);
src/components/ThreeScene.tsx:3742:    const tacticalSpaceGrid = new THREE.GridHelper(800, 40, 0x00f2ff, 0x0c2535);
src/components/ThreeScene.tsx:3753:    const flightGridGroup = new THREE.Group();
src/components/ThreeScene.tsx:3755:      const ringGeo = new THREE.RingGeometry(c * 25, c * 25 + 0.3, 32);
src/components/ThreeScene.tsx:3756:      const ringMat = new THREE.MeshBasicMaterial({
src/components/ThreeScene.tsx:3763:      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
src/components/ThreeScene.tsx:3771:    const coreGroup = new THREE.Group();
src/components/ThreeScene.tsx:3774:    const outerGeom = ensureAttributesAndTangents(new THREE.DodecahedronGeometry(2, 1));
src/components/ThreeScene.tsx:3775:    const outerMat = new THREE.MeshPhysicalMaterial({
src/components/ThreeScene.tsx:3787:    const outerCore = new THREE.Mesh(outerGeom, outerMat);
src/components/ThreeScene.tsx:3791:    const innerGeom = ensureAttributesAndTangents(new THREE.IcosahedronGeometry(0.8, 0));
src/components/ThreeScene.tsx:3792:    const innerMat = new THREE.MeshPhysicalMaterial({
src/components/ThreeScene.tsx:3802:    const innerCore = new THREE.Mesh(innerGeom, innerMat);
src/components/ThreeScene.tsx:3806:    const satGeom = ensureAttributesAndTangents(new THREE.TorusGeometry(2.3, 0.02, 6, 24));
src/components/ThreeScene.tsx:3807:    const satRing = new THREE.Mesh(satGeom, outerMat);
src/components/ThreeScene.tsx:3824:        const wrapper = new THREE.Group();
src/components/ThreeScene.tsx:3828:        const box = new THREE.Box3().setFromObject(gltf.scene);
src/components/ThreeScene.tsx:3829:        const center = new THREE.Vector3();
src/components/ThreeScene.tsx:3833:        const sizeVec = new THREE.Vector3();
src/components/ThreeScene.tsx:3850:            child.material = new THREE.MeshPhysicalMaterial({
src/components/ThreeScene.tsx:3851:              color: new THREE.Color(0x030305),        // Highly polished black chrome body carapace
src/components/ThreeScene.tsx:3854:              emissive: new THREE.Color(0x00f2ff),     // Deep electric cobalt inner glow
src/components/ThreeScene.tsx:3907:      frameId = requestAnimationFrame(animate);
src/components/ThreeScene.tsx:3925:      const activeColor = new THREE.Color(HUDColorHex);
src/components/ThreeScene.tsx:4004:          const colorObj = new THREE.Color(sColor);
src/components/ThreeScene.tsx:4037:        scene.background = new THREE.Color(0x0a0000);
src/components/ThreeScene.tsx:4057:        scene.background = new THREE.Color(0x000208);
src/components/ThreeScene.tsx:4077:        scene.background = new THREE.Color(0xffffff);
src/components/ThreeScene.tsx:5394:              const orig = uData.originalScale || new THREE.Vector3(1, 1, 1);
src/components/ThreeScene.tsx:5410:               const orig = uData.originalScale || new THREE.Vector3(1, 1, 1);
src/components/ThreeScene.tsx:5439:              const fragGeom = geoDodecSharedRef.current || new THREE.DodecahedronGeometry(1.0, 0);
src/components/ThreeScene.tsx:5440:              const fragMat = matCrustSharedRef.current || new THREE.MeshStandardMaterial({ color: 0x161514 });
src/components/ThreeScene.tsx:5444:                const fragMesh = new THREE.Mesh(
src/components/ThreeScene.tsx:5457:                const outward = new THREE.Vector3().subVectors(fragMesh.position, new THREE.Vector3(0, 0, -500));
src/components/ThreeScene.tsx:5469:                const finalRot = new THREE.Vector3(
src/components/ThreeScene.tsx:5509:              const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
src/components/ThreeScene.tsx:5661:              const normal = new THREE.Vector3().subVectors(rA.position, rB.position).normalize();
src/components/ThreeScene.tsx:5686:                const collisionPos = new THREE.Vector3().addVectors(rA.position, rB.position).multiplyScalar(0.5);
src/components/ThreeScene.tsx:5720:                  const shardGeom = isSpark ? new THREE.TetrahedronGeometry(shardSize, 0) : new THREE.DodecahedronGeometry(shardSize, 0);
src/components/ThreeScene.tsx:5725:                    shardMat = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:5735:                    shardMat = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:5743:                  const shardMesh = new THREE.Mesh(shardGeom, shardMat);
src/components/ThreeScene.tsx:5754:                  const radialDir = new THREE.Vector3(
src/components/ThreeScene.tsx:5764:                  const rotVec = new THREE.Vector3(
src/components/ThreeScene.tsx:6213:                  const projVector = new THREE.Vector3();
src/components/ThreeScene.tsx:6371:  useEffect(() => {
src/components/ThreeScene.tsx:6484:      const geoDodecShared = new THREE.DodecahedronGeometry(1.0, 0);
src/components/ThreeScene.tsx:6485:      const geoIcosShared = new THREE.IcosahedronGeometry(1.0, 1);
src/components/ThreeScene.tsx:6486:      const geoTetraShared = new THREE.TetrahedronGeometry(1.0, 0);
src/components/ThreeScene.tsx:6488:      const matMoltenShared = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:6497:      const matCrustShared = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:6504:      const matBasaltShared = new THREE.MeshStandardMaterial({
src/components/ThreeScene.tsx:6539:          const baseCol = new THREE.Color();
src/components/ThreeScene.tsx:6571:            sparkVelocities.push(new THREE.Vector3(rvx, rvy, baseVelZ));
src/components/ThreeScene.tsx:6579:        const sparkGeom = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:6580:        sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
src/components/ThreeScene.tsx:6581:        sparkGeom.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));
src/components/ThreeScene.tsx:6583:        const sparkMat = new THREE.PointsMaterial({
src/components/ThreeScene.tsx:6593:        const sparks = new THREE.Points(sparkGeom, sparkMat);
src/components/ThreeScene.tsx:6625:          const baseCol = new THREE.Color();
src/components/ThreeScene.tsx:6655:            ringVelocities.push(new THREE.Vector3(rvx, rvy, baseVelZ));
src/components/ThreeScene.tsx:6663:        const ringGeom = new THREE.BufferGeometry();
src/components/ThreeScene.tsx:6664:        ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
src/components/ThreeScene.tsx:6665:        ringGeom.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));
src/components/ThreeScene.tsx:6667:        const ringMat = new THREE.PointsMaterial({
src/components/ThreeScene.tsx:6677:        const ringSparks = new THREE.Points(ringGeom, ringMat);
src/components/ThreeScene.tsx:6932:          const baseVel = new THREE.Vector3(dx * speed, dy * speed, dz * speed);
src/components/ThreeScene.tsx:6946:            const shardMesh = new THREE.Mesh(geomsPool[typeIdx], matsPool[matIdx]);
src/components/ThreeScene.tsx:6952:            const rotVec = new THREE.Vector3(
src/components/ThreeScene.tsx:6965:              vel: new THREE.Vector3(rvx, rvy, baseVel.z + (125.0 + Math.random() * 185.0)), // Boosted forward past camera!
src/components/ThreeScene.tsx:7163:    scene.background = new THREE.Color(0x000103);
src/components/CupolaFrame.tsx:1:import React, { useState, useEffect } from 'react';
src/components/CupolaFrame.tsx:12:  useEffect(() => {
src/components/CupolaFrame.tsx:25:  useEffect(() => {
src/components/CupolaFrame.tsx:37:      animationFrameId = requestAnimationFrame(updateInterpolation);
src/components/CupolaFrame.tsx:40:    animationFrameId = requestAnimationFrame(updateInterpolation);
src/components/ErrorDisplay.tsx:111:  React.useEffect(() => {
src/components/DestinationScreen.tsx:1:import React, { useEffect, useState, useRef } from 'react';
src/components/DestinationScreen.tsx:60:  useEffect(() => {
src/components/DestinationScreen.tsx:133:  useEffect(() => {
src/components/DestinationScreen.tsx:140:  useEffect(() => {
src/components/DestinationScreen.tsx:144:      const interval = setTimeout(() => {
src/components/DestinationScreen.tsx:158:    setTimeout(() => {
src/components/DestinationScreen.tsx:166:    setTimeout(() => {
src/components/DestinationScreen.tsx:231:      const ticks = setInterval(() => {
src/components/DestinationScreen.tsx:323:    const interval = setInterval(() => {
src/components/DestinationScreen.tsx:420:    const interval = setInterval(() => {
src/components/CRTOverlay.tsx:1:import React, { useEffect, useState } from 'react';
src/components/CRTOverlay.tsx:10:  useEffect(() => {
src/components/CRTOverlay.tsx:14:      const t1 = setTimeout(() => {
src/components/CRTOverlay.tsx:23:  useEffect(() => {
src/components/CRTOverlay.tsx:26:      setTimeout(() => setFlicker(false), 60 + Math.random() * 80);
src/components/CRTOverlay.tsx:29:    const interval = setInterval(() => {
src/components/CockpitHUD.tsx:1:import React, { useEffect, useRef, useState } from 'react';
src/components/CockpitHUD.tsx:135:  useEffect(() => {
src/components/CockpitHUD.tsx:530:  useEffect(() => {
src/components/CockpitHUD.tsx:543:  useEffect(() => {
src/components/CockpitHUD.tsx:545:    const interval = setInterval(() => {
src/components/CockpitHUD.tsx:636:  useEffect(() => {
src/components/CockpitHUD.tsx:699:  useEffect(() => {
src/components/CockpitHUD.tsx:821:      setTimeout(() => setSaveStatus(''), 2000);
src/components/CockpitHUD.tsx:988:  useEffect(() => {
src/components/CockpitHUD.tsx:989:    const rechargeInterval = setInterval(() => {
src/components/CockpitHUD.tsx:1056:    const ventInterval = setInterval(() => {
src/components/CockpitHUD.tsx:1077:  useEffect(() => {
src/components/CockpitHUD.tsx:1182:      frameId = requestAnimationFrame(drawRadar);
src/components/CockpitHUD.tsx:1225:    const intervalTicks = setInterval(() => {
src/components/CockpitHUD.tsx:1279:      setTimeout(() => {
src/components/CockpitHUD.tsx:1464:                              setTimeout(() => window.location.reload(), 1000);
src/components/CockpitHUD.tsx:2188:                    requestAnimationFrame(() => {
src/components/CockpitHUD.tsx:2606:                    requestAnimationFrame(() => {
src/components/CockpitHUD.tsx:3039:                    requestAnimationFrame(() => {
src/components/CockpitHUD.tsx:3215:                    requestAnimationFrame(() => {
src/contexts/AppStateContext.tsx:1:import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
src/contexts/AppStateContext.tsx:117:    const interval = setInterval(() => {
src/contexts/AppStateContext.tsx:164:  useEffect(() => {

## scanline references after
src/components/HolographicVectorProjection.tsx:346:      {/* Visual background scanning noise scanline */}
src/components/HolographicVectorProjection.tsx:347:      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/1 to-transparent pointer-events-none z-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,250,255,0.01) 0px, rgba(0,0,0,0) 2px)' }} />
src/components/ThreeScene.tsx:74:        // High frequency scanline shearing bands
src/components/ThreeScene.tsx:124:      // 3. Scanline stripes baked directly into 3D camera layer
src/components/ThreeScene.tsx:125:      float scanline = sin(zoomedDistortedCoord.y * 1100.0) * 0.018;
src/components/ThreeScene.tsx:126:      baseColor.rgb -= scanline;
src/components/ThreeScene.tsx:6090:      // Ambient minor scanline fluctuations (signal drops) in operational flight mode representing deep outer space radiation
src/index.css:10:  --animate-scanline: scanline 8s linear infinite;
src/index.css:13:  @keyframes scanline {
src/index.css:516:.animate-scanline {
src/App.tsx.before-every-concept-upgrade-20260612-214446:29:      {/* Dynamic CRT CRT-style Scanline and Film-Grain Overlay */}
src/index.css.before-every-concept-upgrade-20260612-214446:10:  --animate-scanline: scanline 8s linear infinite;
src/index.css.before-every-concept-upgrade-20260612-214446:13:  @keyframes scanline {

## files changed
src/App.tsx
src/components/CRTOverlay.tsx
src/components/optimized/OptimizedSpaceScene.tsx
src/components/evolution/SavantEvolutionConsole.tsx
src/components/ArcadeCalibrator.tsx
src/components/BootScreen.tsx
src/components/DestinationScreen.tsx
src/index.css
vite.config.ts
package.json
