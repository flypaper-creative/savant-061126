# SAVANT NEW BASELINE DEEP PARSE

- timestamp: 20260612-212925
- source_zip: /storage/emulated/0/Download/savant-web-designer6.zip
- root: /root/savant-061126
- prior_backup: /root/savant-061126-before-new-baseline-20260612-212925.tar.gz

## files
./.env.example
./.gitignore
./README.md
./audits/new-baseline-deep-parse-20260612-212925.md
./index.html
./metadata.json
./package-lock.json
./package.json
./public/assets/logo7/logo7.glb
./server.ts
./src/App.tsx
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
./src/contexts/AppStateContext.tsx
./src/hooks/useAudio.ts
./src/index.css
./src/main.tsx
./src/types.ts
./tsconfig.json
./vite.config.ts

## checksums
b6d12c728de0aac8b0bc6239e53aa8088c1431bcb4f9a3d61e5e8a2df1c7c400  ./.env.example
db691f14fcf678985362a42c6aedb581e42cd6bb99962ce1b44aea460fb2a4df  ./.gitignore
9123096bae1ebf040b6a62fe0b01a5684a5e18daf3905caa5abe7d5c43bd01c8  ./README.md
3ff4b809867b122790b555693845a321b7bff9db654defd9a6848a71f1731a60  ./audits/new-baseline-deep-parse-20260612-212925.md
b5a1b4bb457eded1c68ffa133748651b475b26f62f55a4e4b8b9495e18e045d7  ./index.html
e7599619195380f5d1b324120f1b8368a26bd5f09f14e06b6f4d4ee7b7dc9801  ./metadata.json
4f176ceb538d2ee465b947fe3ff9c9327a204761947a912cccfa090810968020  ./package-lock.json
f18da84dfa97ee228732498d248986c9c6ed797e7f2e483d91b09804243d0e9a  ./package.json
ca0fd5301f71f4ec80b796c00dda041d8e5d16e966e5d2e97f50c93c23b266ea  ./public/assets/logo7/logo7.glb
605cb3607db76c5a089cde9eb33cb7ed4497e2e5cfb2ec55d1bb41d5b1810437  ./server.ts
9fe207e4a3ed5578574a61f01b8493b9151cd74b32fac658a24f7932f5376ed3  ./src/App.tsx
98a6eb411990cdf386556a3b9528c1ac8fe1729c7c8672938f9f531ba292db3c  ./src/components/ArcadeCalibrator.tsx
d24b7e5bc3444d25d7a9a05fe57457257fb7309ac21d50bfa14c57cd08c81f3d  ./src/components/AstroRadarMap.tsx
1d8221e2ed93d2265fa48bbeaeced7c4c7cecaa357fa7d42e89a8d79bd54f1d1  ./src/components/BootScreen.tsx
fa90482c83f6084ad6d144945d95e6c118c431aab7143eb3feb4d0463c8baf3b  ./src/components/CRTOverlay.tsx
8639160f7cb178dae45b63e8dd70aefb771561394d532f17dd24aaf0474251de  ./src/components/CockpitHUD.tsx
38f4c27d97935e991e795d48f89249a5a32845bcaba8efacf81218a455a25132  ./src/components/CupolaFrame.tsx
09946e6435d7306c725c4ac4248e53233ec663f375b1dcebbb6c9901db6496d4  ./src/components/DestinationScreen.tsx
2c0f83b683fbabb4055b69915b70514069fe60e11d8d7a9d239117e502b5d74a  ./src/components/ErrorDisplay.tsx
8da81aa44c193ce2ac8caaed8eea1513127f39c432af5234ce24eb927ecd81bb  ./src/components/HolographicVectorProjection.tsx
08bdd3b6b2bf9d568be811dd65f20d69a216c8d4532e18bcfc3ca71b13bcce53  ./src/components/ThreeScene.tsx
f85a1400077012c4750534da16ab0ed6071d110c1e3950c166aadb610ace53d0  ./src/contexts/AppStateContext.tsx
773b32a46a0f7868903b56b1cb38d5f7bf1f3054e4711866095c93bbfa38177a  ./src/hooks/useAudio.ts
cd296e59101593085cf47f932f14d40a8c5a977c77a948e976bb6c533bf5268a  ./src/index.css
5580d48b0fec68698a113d45a640b88d479dc35eb1f4b87c51f67c6cc81cee9b  ./src/main.tsx
891056112441a3e3a44e4cfadbadb8b00ed4ccb0f83fafe105fbd8d2aa66c383  ./src/types.ts
e93e15c3794e43a117964ea191ae985cbedea70c41d3d82b2e20aa8d07374fe4  ./tsconfig.json
c7b7cc4b3a6b6a08f0a4fb916bb4d4e41804d5767611bce43d4c1ad53a198192  ./vite.config.ts

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

## source line counts
    77 src/App.tsx
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
   216 src/contexts/AppStateContext.tsx
   987 src/hooks/useAudio.ts
    51 src/index.css
    10 src/main.tsx
    49 src/types.ts
 17331 total

## component map
src/hooks/useAudio.ts:1:import { useEffect, useRef, useCallback } from 'react';
src/hooks/useAudio.ts:20:export function useAudio() {
src/hooks/useAudio.ts:22:  const audioCtxRef = useRef<AudioContext | null>(null);
src/hooks/useAudio.ts:25:  const humGroupRef = useRef<{
src/hooks/useAudio.ts:37:  const musicGroupRef = useRef<{
src/hooks/useAudio.ts:627:  useEffect(() => {
src/hooks/useAudio.ts:676:  useEffect(() => {
src/components/BootScreen.tsx:1:import React, { useState, useEffect } from 'react';
src/components/BootScreen.tsx:8:export const BootScreen: React.FC = () => {
src/components/BootScreen.tsx:15:  useEffect(() => {
src/components/BootScreen.tsx:141:    <div id="boot-terminal-dashboard" className="relative w-full h-full flex items-center justify-center font-mono text-zinc-450 p-4 overflow-hidden select-none bg-black/40 z-10">
src/components/BootScreen.tsx:144:      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(10,13,20,0.15)_0%,rgba(0,0,0,0.75)_100%)] pointer-events-none" />
src/components/BootScreen.tsx:145:      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_50%,rgba(0,0,0,0.1)_50%)] bg-[size:100%_6px] pointer-events-none" />
src/components/BootScreen.tsx:148:        className="w-full max-w-5xl border border-zinc-800/60 bg-[#07090d]/92 backdrop-blur-[24px] rounded-[16px] p-6 md:p-8 shadow-[0_24px_80px_rgba(0,0,0,0.95)] relative grid grid-cols-1 lg:grid-cols-12 gap-8 transition-all duration-700 ease-out opacity-100 scale-100"
src/components/BootScreen.tsx:151:        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-zinc-700 pointer-events-none opacity-40" />
src/components/BootScreen.tsx:152:        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-zinc-700 pointer-events-none opacity-40" />
src/components/BootScreen.tsx:153:        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-zinc-700 pointer-events-none opacity-40" />
src/components/BootScreen.tsx:154:        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-zinc-700 pointer-events-none opacity-40" />
src/components/BootScreen.tsx:157:        <span className="absolute top-2.5 left-8 text-[6px] text-zinc-600 tracking-[0.2em] font-sans selection:bg-transparent uppercase">LAT_STG_018 // INTEL_RES_ALIGN</span>
src/components/BootScreen.tsx:158:        <span className="absolute top-2.5 right-8 text-[6px] text-zinc-600 tracking-[0.2em] font-sans selection:bg-transparent uppercase">SYS_FOC // DEEP_VOX_C</span>
src/components/BootScreen.tsx:162:          className="absolute inset-0 pointer-events-none transition-all duration-1000 -z-10 rounded-[16px] opacity-25"
src/components/BootScreen.tsx:169:        <div className="lg:col-span-12 flex flex-col md:flex-row md:items-center justify-between border-b border-zinc-900/80 pb-5 mb-1 gap-4">
src/components/BootScreen.tsx:170:          <div className="flex items-center gap-3">
src/components/BootScreen.tsx:171:            <div className="relative">
src/components/BootScreen.tsx:172:              <TerminalIcon style={{ color: themeHex }} className="w-5 h-5 transition-colors duration-550 opacity-90" />
src/components/BootScreen.tsx:173:              <div style={{ backgroundColor: themeHex }} className="absolute inset-0 blur-md rounded-full pointer-events-none opacity-10" />
src/components/BootScreen.tsx:176:              <h2 style={{ color: themeHex }} className="text-[11.5px] font-black tracking-[0.28em] uppercase transition-colors duration-550 select-text">SAVANT EXPERIMENTAL • DIRECT ARCHITECTURE SEQUENCE</h2>
src/components/BootScreen.tsx:177:              <p className="text-[8px] text-zinc-500 font-medium tracking-wider uppercase mt-0.5">HIGH-INTEGRITY INTERSTELLAR QUANTUM INSTRUMENTATION v4.91.5 // COGNITIVE DEVIATION NODE</p>
src/components/BootScreen.tsx:180:          <div className="flex items-center gap-2 p-1.5 px-3 bg-zinc-950/80 border border-zinc-900 rounded-md">
src/components/BootScreen.tsx:181:            <Activity className="w-3 h-3 text-emerald-500/80 animate-[spin_12s_linear_infinite]" />
src/components/BootScreen.tsx:182:            <span className="text-[8px] font-black text-emerald-400 select-text tracking-widest uppercase">STABLE_LINK_ONLINE</span>
src/components/BootScreen.tsx:187:        <div className="lg:col-span-7 space-y-5">
src/components/BootScreen.tsx:188:          <form onSubmit={handleSubmit} className="space-y-4">
src/components/BootScreen.tsx:191:            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
src/components/BootScreen.tsx:192:              <div className="flex items-center justify-between">
src/components/BootScreen.tsx:193:                <div className="flex items-center gap-2">
src/components/BootScreen.tsx:194:                  <User className="w-3.5 h-3.5 text-zinc-550" />
src/components/BootScreen.tsx:195:                  <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400">PILOT COGNITION IDENTIFIER [REG_ID]</label>
src/components/BootScreen.tsx:197:                <span className="text-[7px] text-zinc-600 font-sans tracking-widest">LAYER_ONE_SEC</span>
src/components/BootScreen.tsx:207:                className="w-full bg-zinc-950/55 border px-3 py-2 text-xs tracking-[0.2em] uppercase rounded-md focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-800 transition duration-400 font-mono text-center"
src/components/BootScreen.tsx:213:            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
src/components/BootScreen.tsx:214:              <div className="flex items-center gap-2">
src/components/BootScreen.tsx:215:                <Layers className="w-3.5 h-3.5 text-zinc-550" />
src/components/BootScreen.tsx:216:                <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400">DIVISION SYSTEMIC PARAMETER</label>
src/components/BootScreen.tsx:219:              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[8px] select-none">
src/components/BootScreen.tsx:227:                      className={`py-2 px-1 text-center font-bold tracking-widest border transition duration-400 uppercase rounded-md cursor-pointer ${
src/components/BootScreen.tsx:243:              <div className="bg-zinc-950/70 px-3 py-2 border border-zinc-900 rounded-md text-[8.5px] text-zinc-500 leading-relaxed font-sans select-text">
src/components/BootScreen.tsx:245:                <span className="text-zinc-400 font-medium font-mono">{divDetails[division]}</span>
src/components/BootScreen.tsx:250:            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
src/components/BootScreen.tsx:251:              <div className="flex items-center gap-2">
src/components/BootScreen.tsx:252:                <Cpu className="w-3.5 h-3.5 text-zinc-550" />
src/components/BootScreen.tsx:253:                <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400">OPERATIONAL OBJECTIVE SCHEMATIC</label>
src/components/BootScreen.tsx:261:                className="w-full bg-zinc-950/40 border border-zinc-900 px-3 py-2 text-xs text-zinc-300 tracking-wide rounded-md focus:outline-none focus:border-zinc-700 transition duration-400 font-mono resize-none leading-relaxed"
src/components/BootScreen.tsx:267:            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
src/components/BootScreen.tsx:268:              <div className="flex items-center justify-between text-zinc-400">
src/components/BootScreen.tsx:269:                <span className="flex items-center gap-2">
src/components/BootScreen.tsx:270:                  <Activity className="w-3.5 h-3.5 text-zinc-550" />
src/components/BootScreen.tsx:271:                  <label className="text-[9.5px] font-black tracking-[0.16em] uppercase">SYSTEMIC ACOUSTIC RESONATOR DRONE</label>
src/components/BootScreen.tsx:273:                <span style={{ color: themeHex }} className="text-[9px] font-extrabold tracking-widest">{humFrequency} HZ</span>
src/components/BootScreen.tsx:275:              <div className="flex gap-2">
src/components/BootScreen.tsx:281:                    className={`flex-1 py-1.5 text-[8.5px] tracking-widest border cursor-pointer font-bold rounded-md transition duration-400 ${
src/components/BootScreen.tsx:295:            <div className="space-y-1.5 bg-zinc-950/20 p-3 rounded-lg border border-zinc-900/40">
src/components/BootScreen.tsx:296:              <label className="text-[9.5px] font-black tracking-[0.16em] uppercase text-zinc-400 block">SYSTEM INTELLIGENCE HUD SPECTRAL CHANNELS</label>
src/components/BootScreen.tsx:297:              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[8.5px]">
src/components/BootScreen.tsx:310:                      className={`py-2 px-1 text-center font-bold tracking-wide border rounded-md transition duration-400 uppercase cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
src/components/BootScreen.tsx:318:                        className="w-2 h-2 rounded-full border border-neutral-900 opacity-80"
src/components/BootScreen.tsx:321:                      <span className="text-[7.5px] tracking-widest">{colorObj.short}</span>
src/components/BootScreen.tsx:329:            <div className="bg-zinc-950/70 border border-zinc-900 text-zinc-500 px-3 py-2.5 rounded-md flex items-start gap-2.5 font-sans text-[8.5px] leading-relaxed">
src/components/BootScreen.tsx:330:              <ShieldAlert className="w-3.5 h-3.5 text-zinc-650 shrink-0 mt-0.5" />
src/components/BootScreen.tsx:337:            <div className="w-full">
src/components/BootScreen.tsx:342:                className="w-full flex items-center justify-center gap-2 py-3 bg-white hover:brightness-105 text-black shadow-lg transition duration-400 font-extrabold uppercase tracking-[0.22em] text-[9.5px] rounded-md cursor-pointer active:scale-[0.99] select-none"
src/components/BootScreen.tsx:345:                <Check className="w-4 h-4 text-black shrink-0" />
src/components/BootScreen.tsx:352:        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-900/80 pt-5 lg:pt-0 lg:pl-6 flex flex-col justify-between space-y-4">
src/components/BootScreen.tsx:354:          <div className="space-y-4">
src/components/BootScreen.tsx:355:            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-1.5">
src/components/BootScreen.tsx:356:              <span className="text-[9px] font-black tracking-[0.16em] text-zinc-500 block uppercase">
src/components/BootScreen.tsx:359:              <span style={{ color: themeHex }} className="text-[8px] font-black tracking-widest uppercase">
src/components/BootScreen.tsx:365:            <div className="grid grid-cols-2 gap-2 text-[8px] tracking-wide bg-zinc-950/40 p-2.5 rounded border border-zinc-900/40">
src/components/BootScreen.tsx:366:              <div className="flex items-center gap-1.5">
src/components/BootScreen.tsx:367:                <span className={`w-1 h-1 rounded-full ${checklist.warpLens === 'NOMINAL' ? 'bg-emerald-500' : checklist.warpLens === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
src/components/BootScreen.tsx:368:                <span className="text-zinc-550 font-medium uppercase font-sans">LENS_ALIGN :</span>
src/components/BootScreen.tsx:369:                <span className={checklist.warpLens === 'NOMINAL' ? 'text-emerald-500' : checklist.warpLens === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.warpLens}</span>
src/components/BootScreen.tsx:371:              <div className="flex items-center gap-1.5">
src/components/BootScreen.tsx:372:                <span className={`w-1 h-1 rounded-full ${checklist.acousticHum === 'NOMINAL' ? 'bg-emerald-500' : checklist.acousticHum === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
src/components/BootScreen.tsx:373:                <span className="text-zinc-550 font-medium uppercase font-sans">ACOUSTIC :</span>
src/components/BootScreen.tsx:374:                <span className={checklist.acousticHum === 'NOMINAL' ? 'text-emerald-500' : checklist.acousticHum === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.acousticHum}</span>
src/components/BootScreen.tsx:376:              <div className="flex items-center gap-1.5">
src/components/BootScreen.tsx:377:                <span className={`w-1 h-1 rounded-full ${checklist.steerCoupling === 'NOMINAL' ? 'bg-emerald-500' : checklist.steerCoupling === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
src/components/BootScreen.tsx:378:                <span className="text-zinc-550 font-medium uppercase font-sans">COUPLE_GEOM :</span>
src/components/BootScreen.tsx:379:                <span className={checklist.steerCoupling === 'NOMINAL' ? 'text-emerald-500' : checklist.steerCoupling === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.steerCoupling}</span>
src/components/BootScreen.tsx:381:              <div className="flex items-center gap-1.5">
src/components/BootScreen.tsx:382:                <span className={`w-1 h-1 rounded-full ${checklist.shieldArray === 'NOMINAL' ? 'bg-emerald-500' : checklist.shieldArray === 'TUNING' ? 'bg-amber-500 animate-ping' : 'bg-zinc-800'}`} />
src/components/BootScreen.tsx:383:                <span className="text-zinc-550 font-medium uppercase font-sans">SHIELD_ARR :</span>
src/components/BootScreen.tsx:384:                <span className={checklist.shieldArray === 'NOMINAL' ? 'text-emerald-500' : checklist.shieldArray === 'TUNING' ? 'text-amber-500' : 'text-zinc-650'}>{checklist.shieldArray}</span>
src/components/ArcadeCalibrator.tsx:1:import React, { useRef, useEffect, useState } from 'react';
src/components/ArcadeCalibrator.tsx:113:export const ArcadeCalibrator: React.FC<ArcadeCalibratorProps> = ({
src/components/ArcadeCalibrator.tsx:120:  const canvasRef = useRef<HTMLCanvasElement | null>(null);
src/components/ArcadeCalibrator.tsx:121:  const containerRef = useRef<HTMLDivElement | null>(null);
src/components/ArcadeCalibrator.tsx:149:  const audioCtxRef = useRef<AudioContext | null>(null);
src/components/ArcadeCalibrator.tsx:150:  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
src/components/ArcadeCalibrator.tsx:151:  const mousePosRef = useRef({ x: 0, y: 0 });
src/components/ArcadeCalibrator.tsx:152:  const isUsingMouseRef = useRef(false);
src/components/ArcadeCalibrator.tsx:155:  const scoreRef = useRef(0);
src/components/ArcadeCalibrator.tsx:156:  const shieldsRef = useRef(100);
src/components/ArcadeCalibrator.tsx:157:  const comboRef = useRef(0);
src/components/ArcadeCalibrator.tsx:158:  const calibrationRef = useRef(0);
src/components/ArcadeCalibrator.tsx:159:  const warpStatusRef = useRef<'IDLE' | 'DOCKING' | 'WARPING' | 'COMPLETE'>('IDLE');
src/components/ArcadeCalibrator.tsx:161:  useEffect(() => {
src/components/ArcadeCalibrator.tsx:397:  useEffect(() => {
src/components/ArcadeCalibrator.tsx:425:    window.addEventListener('keydown', handleKeyDown);
src/components/ArcadeCalibrator.tsx:426:    window.addEventListener('keyup', handleKeyUp);
src/components/ArcadeCalibrator.tsx:868:          loopFrameId = requestAnimationFrame(frameLoop);
src/components/ArcadeCalibrator.tsx:958:      if (isUsingMouseRef.current) {
src/components/ArcadeCalibrator.tsx:990:      if (isUsingMouseRef.current) {
src/components/ArcadeCalibrator.tsx:1010:      if (k['Space'] || k['Spacebar'] || (isUsingMouseRef.current && k['mousedown'])) {
src/components/ArcadeCalibrator.tsx:1951:        loopFrameId = requestAnimationFrame(frameLoop);
src/components/ArcadeCalibrator.tsx:1955:    loopFrameId = requestAnimationFrame(frameLoop);
src/components/ArcadeCalibrator.tsx:1959:      isUsingMouseRef.current = true;
src/components/ArcadeCalibrator.tsx:1966:      isUsingMouseRef.current = true;
src/components/ArcadeCalibrator.tsx:1983:      isUsingMouseRef.current = false;
src/components/ArcadeCalibrator.tsx:1987:    canvas.addEventListener('mousemove', handleMouseMove);
src/components/ArcadeCalibrator.tsx:1988:    canvas.addEventListener('touchmove', handleTouchMove);
src/components/ArcadeCalibrator.tsx:1989:    canvas.addEventListener('mousedown', handleMouseDown);
src/components/ArcadeCalibrator.tsx:1990:    canvas.addEventListener('mouseup', handleMouseUp);
src/components/ArcadeCalibrator.tsx:1991:    canvas.addEventListener('mouseleave', handleMouseLeave);
src/components/ArcadeCalibrator.tsx:2006:    <div ref={containerRef} className="w-full flex flex-col pt-1">
src/components/ArcadeCalibrator.tsx:2010:        className="w-full h-80 bg-black border rounded-lg relative overflow-hidden flex flex-col justify-between"
src/components/ArcadeCalibrator.tsx:2013:        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)] pointer-events-none z-10" />
src/components/ArcadeCalibrator.tsx:2014:        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[size:100%_4px] pointer-events-none z-10 opacity-70" />
src/components/ArcadeCalibrator.tsx:2019:          className="w-full border-b px-3 py-1.5 flex items-center justify-between z-20"
src/components/ArcadeCalibrator.tsx:2021:          <div className="flex items-center gap-2">
src/components/ArcadeCalibrator.tsx:2022:            <span style={{ backgroundColor: themeColor }} className="w-1.5 h-1.5 rounded-full animate-ping" />
src/components/ArcadeCalibrator.tsx:2023:            <span className="text-[10px] font-black tracking-[0.2em] text-white font-sans uppercase">
src/components/ArcadeCalibrator.tsx:2028:          <div className="flex items-center gap-3">
src/components/ArcadeCalibrator.tsx:2030:            <div className="flex items-center gap-1 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-900">
src/components/ArcadeCalibrator.tsx:2031:              <span style={{ color: themeColor }} className="text-[7.5px] font-extrabold uppercase">WEAPON: {activeWeapon}</span>
src/components/ArcadeCalibrator.tsx:2037:              className="text-zinc-500 hover:text-white transition focus:outline-none cursor-pointer p-0.5"
src/components/ArcadeCalibrator.tsx:2040:              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
src/components/ArcadeCalibrator.tsx:2048:            className="w-full h-full cursor-crosshair z-0"
src/components/ArcadeCalibrator.tsx:2051:          <div className="flex flex-col items-center justify-center h-full p-4 text-center z-0 space-y-4">
src/components/ArcadeCalibrator.tsx:2053:            <div className="space-y-1">
src/components/ArcadeCalibrator.tsx:2054:              <div className="flex items-center justify-center gap-2">
src/components/ArcadeCalibrator.tsx:2055:                <Compass style={{ color: themeColor }} className="w-5 h-5 animate-spin text-indigo-500" />
src/components/ArcadeCalibrator.tsx:2056:                <h3 className="text-sm font-black tracking-[0.3em] text-white">SAVANT NEBULA FLIGHT</h3>
src/components/ArcadeCalibrator.tsx:2058:              <p className="text-[8px] text-zinc-500 tracking-[0.16em] uppercase">
src/components/ArcadeCalibrator.tsx:2064:            <div className="flex items-center justify-center gap-5 border border-zinc-900 bg-zinc-950/70 p-2.5 rounded-lg">
src/components/ArcadeCalibrator.tsx:2065:              <div className="text-center">
src/components/ArcadeCalibrator.tsx:2066:                <p className="text-[7px] text-zinc-500 tracking-wider">MAP HIGH SCORE</p>
src/components/ArcadeCalibrator.tsx:2067:                <div className="flex items-center justify-center gap-1 mt-0.5">
src/components/ArcadeCalibrator.tsx:2068:                  <Trophy className="w-3.5 h-3.5 text-yellow-500" />
src/components/ArcadeCalibrator.tsx:2069:                  <span className="text-xs font-black tracking-widest text-[#fbbf24]">{highScore} PTS</span>
src/components/ArcadeCalibrator.tsx:2072:              <div className="w-px h-7 bg-zinc-900" />
src/components/ArcadeCalibrator.tsx:2073:              <div className="text-center">
src/components/ArcadeCalibrator.tsx:2074:                <p className="text-[7px] text-zinc-500 tracking-wider">CALIBRATOR ENERGY</p>
src/components/ArcadeCalibrator.tsx:2075:                <div className="flex items-center justify-center gap-1 mt-0.5">
src/components/ArcadeCalibrator.tsx:2076:                  <Shield style={{ color: themeColor }} className="w-3.5 h-3.5 animate-pulse" />
src/components/ArcadeCalibrator.tsx:2077:                  <span style={{ color: themeColor }} className="text-xs font-black tracking-widest">{calibrationProgress}%</span>
src/components/ArcadeCalibrator.tsx:2080:              <div className="w-px h-7 bg-zinc-900" />
src/components/ArcadeCalibrator.tsx:2081:              <div className="text-center">
src/components/ArcadeCalibrator.tsx:2082:                <p className="text-[7px] text-zinc-500 tracking-wider">FLIGHT ENGINE</p>
src/components/ArcadeCalibrator.tsx:2083:                <div className="flex items-center justify-center gap-1 mt-0.5">
src/components/ArcadeCalibrator.tsx:2084:                  <span className="text-[9.5px] font-black tracking-wider text-green-400">ACTIVE DRIFT</span>
src/components/ArcadeCalibrator.tsx:2090:            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
src/components/ArcadeCalibrator.tsx:2096:                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold tracking-[0.2em] text-[9.5px] rounded-md transition duration-200 shadow-lg shadow-indigo-500/20 uppercase cursor-pointer"
src/components/ArcadeCalibrator.tsx:2098:                  <ArrowUpRight className="w-4 h-4 text-white animate-bounce" />
src/components/ArcadeCalibrator.tsx:2107:                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-black hover:bg-zinc-950 text-[9px] border font-black tracking-[0.2em] rounded-md transition duration-200 uppercase cursor-pointer"
src/components/ArcadeCalibrator.tsx:2118:                    className="flex-1 flex items-center justify-center gap-2 py-2 border bg-black hover:brightness-135 text-white shadow-md text-[8.5px] font-extrabold tracking-[0.18em] uppercase rounded-md cursor-pointer transition active:scale-97"
src/components/ArcadeCalibrator.tsx:2120:                    <Play className="w-3.5 h-3.5 shrink-0" />
src/components/ArcadeCalibrator.tsx:2128:                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-zinc-900 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 text-[8px] font-bold tracking-[0.18em] uppercase rounded-md cursor-pointer transition active:scale-97"
src/components/ArcadeCalibrator.tsx:2130:                    <RotateCcw className="w-3 h-3 shrink-0" />
src/components/ArcadeCalibrator.tsx:2138:              <p className="text-[8.5px] text-[#10b981] font-bold tracking-widest uppercase">
src/components/ArcadeCalibrator.tsx:2142:              <p className="text-[7.5px] text-zinc-500 tracking-wider">
src/components/ArcadeCalibrator.tsx:2152:      <div className="space-y-1.5 mt-3">
src/components/ArcadeCalibrator.tsx:2153:        <div className="flex items-center justify-between">
src/components/ArcadeCalibrator.tsx:2154:          <span className="text-[9px] font-black tracking-[0.16em] text-zinc-500 flex items-center gap-1 uppercase">
src/components/ArcadeCalibrator.tsx:2155:            <Terminal className="w-3 h-3 text-zinc-600" />
src/components/ArcadeCalibrator.tsx:2158:          <span className="text-[8px] font-mono text-zinc-650 font-bold uppercase">
src/components/ArcadeCalibrator.tsx:2163:        <div className="w-full h-18 bg-zinc-950/80 border border-zinc-900 p-2 text-[8px] text-zinc-600 leading-relaxed overflow-y-auto whitespace-pre font-mono scrollbar-thin rounded">
src/components/ArcadeCalibrator.tsx:2165:            <div key={ix} className="truncate">
src/components/ArcadeCalibrator.tsx:2166:              <span className="text-zinc-700">[{ix}]</span>{' '}
src/components/HolographicVectorProjection.tsx:1:import React, { useEffect, useRef, useState } from 'react';
src/components/HolographicVectorProjection.tsx:11:export const HolographicVectorProjection: React.FC<HolographicVectorProjectionProps> = ({
src/components/HolographicVectorProjection.tsx:16:  const svgRef = useRef<SVGSVGElement | null>(null);
src/components/HolographicVectorProjection.tsx:20:  const keyboardSteerRef = useRef({ x: 0, y: 0 });
src/components/HolographicVectorProjection.tsx:23:  useEffect(() => {
src/components/HolographicVectorProjection.tsx:42:    window.addEventListener('keydown', handleKeyDown);
src/components/HolographicVectorProjection.tsx:43:    window.addEventListener('keyup', handleKeyUp);
src/components/HolographicVectorProjection.tsx:51:  useEffect(() => {
src/components/HolographicVectorProjection.tsx:67:  useEffect(() => {
src/components/HolographicVectorProjection.tsx:345:    <div className="w-full bg-zinc-950/92 rounded-[8px] p-1 border border-zinc-900/60 flex flex-col gap-1 relative overflow-hidden">
src/components/HolographicVectorProjection.tsx:347:      <div className="absolute inset-0 bg-linear-to-b from-transparent via-cyan-500/1 to-transparent pointer-events-none z-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,250,255,0.01) 0px, rgba(0,0,0,0) 2px)' }} />
src/components/HolographicVectorProjection.tsx:349:      <div className="flex items-center justify-between border-b border-zinc-900 pb-0.5 px-0.5">
src/components/HolographicVectorProjection.tsx:350:        <span className="text-[5.2px] text-zinc-500 font-extrabold uppercase tracking-wider flex items-center gap-1">
src/components/HolographicVectorProjection.tsx:351:          <span className="w-1 h-1 bg-cyan-400 rounded-full animate-ping shrink-0" />
src/components/HolographicVectorProjection.tsx:354:        <span className="text-[5px] font-mono font-medium text-zinc-650 tracking-tighter">D3_SYS_V2.58</span>
src/components/HolographicVectorProjection.tsx:357:      <div className="flex justify-center items-center bg-zinc-950 aspect-[21/12.5] relative rounded-[4px] border border-zinc-900/40 p-[1px] overflow-hidden">
src/components/HolographicVectorProjection.tsx:363:          className="block z-0 select-none overflow-hidden" 
src/components/AstroRadarMap.tsx:1:import React, { useState, useMemo, useEffect } from 'react';
src/components/AstroRadarMap.tsx:39:export const AstroRadarMap: React.FC<AstroRadarMapProps> = ({
src/components/AstroRadarMap.tsx:59:  const mapElements = useMemo<MapTarget[]>(() => {
src/components/AstroRadarMap.tsx:130:  useEffect(() => {
src/components/AstroRadarMap.tsx:134:      frameId = requestAnimationFrame(animate);
src/components/AstroRadarMap.tsx:136:    frameId = requestAnimationFrame(animate);
src/components/AstroRadarMap.tsx:142:  const localTargets = useMemo(() => {
src/components/AstroRadarMap.tsx:172:    <div id="astro-radar-inner" className="flex flex-col gap-1.5 h-full select-none text-[6.5px] tracking-wide text-zinc-400 font-mono">
src/components/AstroRadarMap.tsx:174:      <div className="flex bg-zinc-950/80 p-0.5 rounded-md border border-zinc-900/60 items-stretch" style={{ gap: '1px' }}>
src/components/AstroRadarMap.tsx:187:              className={`flex-1 text-center py-1 rounded text-[5px] font-black uppercase transition-all duration-150 cursor-pointer ${
src/components/AstroRadarMap.tsx:201:      <div className="relative bg-zinc-950/95 border border-zinc-900/60 rounded-lg p-2 flex flex-col gap-1.5 h-[160px] overflow-hidden">
src/components/AstroRadarMap.tsx:204:          <div className="relative flex-grow flex flex-col justify-between h-full">
src/components/AstroRadarMap.tsx:206:            <div className="relative w-full h-[115px] bg-zinc-950 rounded border border-zinc-900/40 overflow-hidden">
src/components/AstroRadarMap.tsx:209:                className="absolute inset-0 pointer-events-none opacity-[0.06]"
src/components/AstroRadarMap.tsx:217:              <svg className="w-full h-full" viewBox="0 0 100 240" preserveAspectRatio="none">
src/components/AstroRadarMap.tsx:239:                      <g key={el.id} className="cursor-pointer" onClick={() => handleSelectTarget(el)}>
src/components/AstroRadarMap.tsx:253:                          className={isPassed ? '' : 'animate-pulse'}
src/components/AstroRadarMap.tsx:270:                      <g key={el.id} className="cursor-pointer" onClick={() => handleSelectTarget(el)}>
src/components/AstroRadarMap.tsx:304:                      className="cursor-pointer hover:scale-150 transition-transform duration-100"
src/components/AstroRadarMap.tsx:316:                    <g className="transition-all duration-200">
src/components/AstroRadarMap.tsx:352:            <div className="flex justify-between items-center bg-zinc-950/80 p-1 border border-zinc-900 rounded-md text-[5.5px]">
src/components/AstroRadarMap.tsx:353:              <div className="flex items-center gap-1">
src/components/AstroRadarMap.tsx:354:                <Compass className="w-2.5 h-2.5 text-emerald-400 animate-[spin_8s_linear_infinite]" />
src/components/AstroRadarMap.tsx:356:                <span className="text-zinc-300 font-extrabold font-mono">
src/components/AstroRadarMap.tsx:361:              <div className="flex gap-1">
src/components/AstroRadarMap.tsx:364:                  className="p-0.5 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-md cursor-pointer text-[5px]"
src/components/AstroRadarMap.tsx:367:                  <ZoomOut className="w-2.5 h-2.5" />
src/components/AstroRadarMap.tsx:369:                <div className="px-1 bg-zinc-950 border border-zinc-900 rounded select-none flex items-center justify-center font-bold">
src/components/AstroRadarMap.tsx:374:                  className="p-0.5 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 rounded-md cursor-pointer text-[5px]"
src/components/AstroRadarMap.tsx:377:                  <ZoomIn className="w-2.5 h-2.5" />
src/components/AstroRadarMap.tsx:384:          <div className="relative flex-grow flex flex-col justify-between h-full">
src/components/AstroRadarMap.tsx:385:            <div className="relative w-full h-[115px] bg-zinc-950 rounded border border-zinc-900/40 overflow-hidden flex items-center justify-center">
src/components/AstroRadarMap.tsx:387:              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
src/components/AstroRadarMap.tsx:388:                <div className="w-[100px] h-[100px] rounded-full border border-zinc-900 opacity-40 flex items-center justify-center">
src/components/AstroRadarMap.tsx:389:                  <div className="w-[70px] h-[70px] rounded-full border border-zinc-900/60 flex items-center justify-center">
src/components/AstroRadarMap.tsx:390:                    <div className="w-[40px] h-[40px] rounded-full border border-zinc-900/30" />
src/components/AstroRadarMap.tsx:394:                <div className="absolute w-[105px] h-[0.5px] bg-zinc-900/40" />
src/components/AstroRadarMap.tsx:395:                <div className="absolute h-[105px] w-[0.5px] bg-zinc-900/40" />
src/components/AstroRadarMap.tsx:399:                  className="absolute w-[50px] h-[50px] top-[7.5px] left-[50%] origin-bottom-left pointer-events-none"
src/components/AstroRadarMap.tsx:409:              <div className="relative w-[110px] h-[110px]">
src/components/AstroRadarMap.tsx:411:                <div className="absolute inset-x-0 inset-y-0 m-auto w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.9)] flex items-center justify-center z-10">
src/components/AstroRadarMap.tsx:412:                  <span className="w-[4px] h-[4px] rounded-full bg-white animate-ping" />
src/components/AstroRadarMap.tsx:439:                      className="absolute group cursor-pointer transition-all duration-300"
src/components/AstroRadarMap.tsx:448:                        className={`block rounded-full transition-all duration-200 ${
src/components/AstroRadarMap.tsx:459:                      <div className="absolute hidden group-hover:block bg-zinc-950/95 border border-zinc-800 text-white rounded p-1 text-[4.5px] leading-none text-center whitespace-nowrap -bottom-5 left-[50%] -translate-x-1/2 z-30">
src/components/AstroRadarMap.tsx:469:            <div className="flex justify-between items-center bg-zinc-950/80 p-1 border border-zinc-900 rounded-md text-[5.2px]">
src/components/AstroRadarMap.tsx:470:              <span className="flex items-center gap-1">
src/components/AstroRadarMap.tsx:471:                <Target className="w-2 h-2 text-rose-500 animate-pulse" />
src/components/AstroRadarMap.tsx:472:                <span>SWEEP: <span className="text-zinc-200 font-extrabold">2.4 GHz</span></span>
src/components/AstroRadarMap.tsx:474:              <span className="text-zinc-500 uppercase">TARGETS: <span className="text-emerald-400 font-bold font-mono">{localTargets.length}</span></span>
src/components/AstroRadarMap.tsx:482:        className="bg-zinc-950/90 border rounded-lg p-1.5 flex flex-col gap-1 transition-all duration-300"
src/components/AstroRadarMap.tsx:486:          <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
src/components/AstroRadarMap.tsx:487:            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
src/components/AstroRadarMap.tsx:488:              <span className="font-extrabold text-[#00f2ff] flex items-center gap-1 text-[7px]" style={{ color: hudColor }}>
src/components/AstroRadarMap.tsx:489:                <Crosshair className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
src/components/AstroRadarMap.tsx:494:                className="text-zinc-650 hover:text-white hover:bg-zinc-900 border border-transparent hover:border-zinc-800 p-0.5 rounded cursor-pointer transition-all"
src/components/AstroRadarMap.tsx:496:                <X className="w-2 h-2" />
src/components/AstroRadarMap.tsx:501:            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[5.5px] leading-tight text-zinc-500">
src/components/AstroRadarMap.tsx:502:              <div>TYPE: <span className="text-white font-bold">{selectedTarget.type}</span></div>
src/components/AstroRadarMap.tsx:503:              <div>WAYPOINT: <span className="text-zinc-300 font-extrabold font-mono">{selectedTarget.z} km</span></div>
src/components/AstroRadarMap.tsx:504:              <div className="col-span-2">MATERIAL: <span className="text-zinc-300">{selectedTarget.composition || 'Mineral Matrix'}</span></div>
src/components/AstroRadarMap.tsx:508:                  <div>SIZE: <span className="text-zinc-300 font-black">{selectedTarget.scale}0 m</span></div>
src/components/AstroRadarMap.tsx:509:                  <div>YIELD: <span style={{ color: hudColor }} className="font-mono font-black">{selectedTarget.yieldPct}%</span></div>
src/components/AstroRadarMap.tsx:514:            <div className="bg-zinc-950 p-1 border border-zinc-900 text-[5px] text-zinc-550 leading-relaxed uppercase select-none rounded">
src/components/AstroRadarMap.tsx:525:          <div className="flex items-center justify-center py-4 text-zinc-650 font-bold font-sans uppercase tracking-widest text-[5.5px] gap-1 select-none">
src/components/AstroRadarMap.tsx:526:            <Search className="w-2.5 h-2.5 animate-pulse text-zinc-550" />
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
src/components/ThreeScene.tsx:1566:export const ThreeScene: React.FC = () => {
src/components/ThreeScene.tsx:1567:  const containerRef = useRef<HTMLDivElement>(null);
src/components/ThreeScene.tsx:1568:  const canvasRef = useRef<HTMLCanvasElement>(null);
src/components/ThreeScene.tsx:1593:  const phaseRef = useRef(phase);
src/components/ThreeScene.tsx:1594:  const opticModeRef = useRef(opticMode);
src/components/ThreeScene.tsx:1595:  const filterEffectRef = useRef(filterEffect);
src/components/ThreeScene.tsx:1596:  const telemetryRef = useRef(telemetry);
src/components/ThreeScene.tsx:1597:  const colorRef = useRef(pilotConfig.hudColor);
src/components/ThreeScene.tsx:1598:  const spotlightActiveRef = useRef(spotlightActive);
src/components/ThreeScene.tsx:1599:  const spotlightIntensityRef = useRef(spotlightIntensity);
src/components/ThreeScene.tsx:1600:  const spotlightColorRef = useRef(spotlightColor);
src/components/ThreeScene.tsx:1601:  const spotlightAngleRef = useRef(spotlightAngle);
src/components/ThreeScene.tsx:1602:  const screenShakeRef = useRef(screenShake);
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
src/components/ThreeScene.tsx:1623:  const asteroidThemeRef = useRef<AsteroidTheme>(asteroidTheme);
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
src/components/ThreeScene.tsx:1932:  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
src/components/ThreeScene.tsx:1933:  const composerRef = useRef<EffectComposer | null>(null);
src/components/ThreeScene.tsx:1934:  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
src/components/ThreeScene.tsx:1935:  const lensPassRef = useRef<ShaderPass | null>(null);
src/components/ThreeScene.tsx:1936:  const sceneRef = useRef<THREE.Scene | null>(null);
src/components/ThreeScene.tsx:1937:  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
src/components/ThreeScene.tsx:1940:  const logoModelRef = useRef<THREE.Group | null>(null);
src/components/ThreeScene.tsx:1941:  const asteroidsRef = useRef<THREE.Mesh[]>([]);
src/components/ThreeScene.tsx:1942:  const activeBulletsRef = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; color: string; duration: number; age: number; type: string }[]>([]);
src/components/ThreeScene.tsx:1943:  const audioCtxRef = useRef<AudioContext | null>(null);
src/components/ThreeScene.tsx:1944:  const debrisFieldRef = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; rotVel: THREE.Vector3; age: number }[]>([]);
src/components/ThreeScene.tsx:1945:  const transientExplosionsRef = useRef<{
src/components/ThreeScene.tsx:1953:  const starsRef = useRef<THREE.Points | null>(null);
src/components/ThreeScene.tsx:1954:  const permanentNebulaRef = useRef<THREE.Mesh | null>(null);
src/components/ThreeScene.tsx:1955:  const instancedAsteroidsRef = useRef<THREE.InstancedMesh | null>(null);
src/components/ThreeScene.tsx:1956:  const warpLinesRef = useRef<THREE.LineSegments | null>(null);
src/components/ThreeScene.tsx:1957:  const warpBaseCoordsRef = useRef<Float32Array | null>(null);
src/components/ThreeScene.tsx:1958:  const warpShaderTunnelRef = useRef<THREE.Mesh<THREE.CylinderGeometry, THREE.ShaderMaterial> | null>(null);
src/components/ThreeScene.tsx:1959:  const bootTimeElapsedRef = useRef<number>(0.0);
src/components/ThreeScene.tsx:1960:  const initTimeElapsedRef = useRef<number>(0.0);
src/components/ThreeScene.tsx:1961:  const cameraApproachProgressRef = useRef<number>(0.0);
src/components/ThreeScene.tsx:1962:  const dustBeltRef = useRef<THREE.Points | null>(null);
src/components/ThreeScene.tsx:1963:  const gateMeshRef = useRef<THREE.Group | null>(null);
src/components/ThreeScene.tsx:1964:  const coreMeshRef = useRef<THREE.Group | null>(null);
src/components/ThreeScene.tsx:1965:  const logoWidthRef = useRef<number>(5.0); // Perfect container for dynamic padding math
src/components/ThreeScene.tsx:1966:  const logoScaleRef = useRef<number>(0.001);
src/components/ThreeScene.tsx:1967:  const logoHeatRef = useRef<number>(1.0);
src/components/ThreeScene.tsx:1968:  const logoZRef = useRef<number>(-200);
src/components/ThreeScene.tsx:1969:  const logoSpinSpeedRef = useRef<number>(-0.25);
src/components/ThreeScene.tsx:1970:  const glassDustMeshRef = useRef<THREE.Points | null>(null);
src/components/ThreeScene.tsx:1971:  const glassDustSpeedsRef = useRef<Float32Array | null>(null);
src/components/ThreeScene.tsx:1972:  const meteorShowerRef = useRef<THREE.LineSegments | null>(null);
src/components/ThreeScene.tsx:1973:  const meteorSpeedsRef = useRef<Float32Array | null>(null);
src/components/ThreeScene.tsx:1974:  const meteorOffsetsRef = useRef<Float32Array | null>(null);
src/components/ThreeScene.tsx:1975:  const meteorDirsRef = useRef<Float32Array | null>(null);
src/components/ThreeScene.tsx:1976:  const meteorAgesRef = useRef<Float32Array | null>(null);
src/components/ThreeScene.tsx:1979:  const fractalTextureRef = useRef<THREE.Texture | null>(null);
src/components/ThreeScene.tsx:1980:  const logoPhysicsActive = useRef<boolean>(false);
src/components/ThreeScene.tsx:1981:  const logoZ = useRef<number>(-300.0);
src/components/ThreeScene.tsx:1982:  const logoVelZ = useRef<number>(0.0);
src/components/ThreeScene.tsx:1983:  const logoRotY = useRef<number>(0.0);
src/components/ThreeScene.tsx:1984:  const logoRotVelY = useRef<number>(0.0);
src/components/ThreeScene.tsx:1986:  const explosionSparksRef = useRef<THREE.Points | null>(null);
src/components/ThreeScene.tsx:1987:  const explosionRingSparksRef = useRef<THREE.Points | null>(null);
src/components/ThreeScene.tsx:1990:  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
src/components/ThreeScene.tsx:1991:  const explosionLightRef = useRef<THREE.PointLight | null>(null);
src/components/ThreeScene.tsx:1992:  const shipSpotlightRef = useRef<THREE.SpotLight | null>(null);
src/components/ThreeScene.tsx:1993:  const spotlightConeRef = useRef<THREE.Mesh | null>(null);
src/components/ThreeScene.tsx:1994:  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
src/components/ThreeScene.tsx:1996:  const shockwaveZRef = useRef<number>(-500.0);
src/components/ThreeScene.tsx:1997:  const shockwaveActiveRef = useRef<boolean>(false);
src/components/ThreeScene.tsx:1999:  const geoDodecSharedRef = useRef<THREE.DodecahedronGeometry | null>(null);
src/components/ThreeScene.tsx:2000:  const geoIcosSharedRef = useRef<THREE.IcosahedronGeometry | null>(null);
src/components/ThreeScene.tsx:2001:  const geoTetraSharedRef = useRef<THREE.TetrahedronGeometry | null>(null);
src/components/ThreeScene.tsx:2002:  const matMoltenSharedRef = useRef<THREE.MeshStandardMaterial | null>(null);
src/components/ThreeScene.tsx:2003:  const matCrustSharedRef = useRef<THREE.MeshStandardMaterial | null>(null);
src/components/ThreeScene.tsx:2004:  const matBasaltSharedRef = useRef<THREE.MeshStandardMaterial | null>(null);
src/components/ThreeScene.tsx:2007:  const flashOverlayRef = useRef<HTMLDivElement | null>(null);
src/components/ThreeScene.tsx:2010:  const cinematicTimelineRef = useRef<gsap.core.Timeline | null>(null);
src/components/ThreeScene.tsx:2015:  const shipVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
src/components/ThreeScene.tsx:2016:  const gForceOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
src/components/ThreeScene.tsx:2017:  const userControlledPosRef = useRef(new THREE.Vector3(0, 0, 0));
src/components/ThreeScene.tsx:2018:  const lastTelemetryUpdateRef = useRef<number>(0);
src/components/ThreeScene.tsx:2019:  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
src/components/ThreeScene.tsx:2022:  const shipPosRef = useRef(new THREE.Vector3(0, 0, -50)); // Starting position Z = -50
src/components/ThreeScene.tsx:2023:  const shipVRef = useRef(new THREE.Vector3(0, 0, 0)); // Newtonian velocity vector
src/components/ThreeScene.tsx:2024:  const hasLoggedExitFieldRef = useRef(false);
src/components/ThreeScene.tsx:2025:  const hasLoggedEnterFieldRef = useRef(true);
src/components/ThreeScene.tsx:2026:  const lastAutoEvasionLogRef = useRef<number>(0);
src/components/ThreeScene.tsx:2027:  const glitchFactorRef = useRef<number>(0.0); // Procedural glitch decay tracker
src/components/ThreeScene.tsx:2028:  const chromaticFringingRef = useRef<number>(0.0016); // Local chromatic fringing target
src/components/ThreeScene.tsx:2031:  const warpStateRef = useRef<{ active: boolean; level: 'low' | 'med' | 'high' | 'none'; transition: number }>({
src/components/ThreeScene.tsx:2038:  const prevWarpActiveRef = useRef<boolean>(false);
src/components/ThreeScene.tsx:2039:  const warpStartEffectTimerRef = useRef<number>(0.0);
src/components/ThreeScene.tsx:2040:  const warpExitEffectTimerRef = useRef<number>(0.0);
src/components/ThreeScene.tsx:2041:  const flightGridGroupRef = useRef<THREE.Group | null>(null);
src/components/ThreeScene.tsx:2042:  const tacticalSpaceGridRef = useRef<THREE.GridHelper | null>(null);
src/components/ThreeScene.tsx:2045:  const starSpeedAccumRef = useRef<number>(0.0);
src/components/ThreeScene.tsx:2046:  const starDriftOffsetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
src/components/ThreeScene.tsx:2049:  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
src/components/ThreeScene.tsx:2052:  const flightTimeRef = useRef<number>(0.0);
src/components/ThreeScene.tsx:2053:  const shockwaveHitRef = useRef<boolean>(false);
src/components/ThreeScene.tsx:2054:  const localCameraShakeRef = useRef<number>(0.0);
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
src/components/ThreeScene.tsx:2690:    window.addEventListener('keydown', handleKeyDown);
src/components/ThreeScene.tsx:2691:    window.addEventListener('keyup', handleKeyUp);
src/components/ThreeScene.tsx:2692:    window.addEventListener('ship-thrust-override', handleThrustOverride);
src/components/ThreeScene.tsx:2693:    window.addEventListener('ship-warp-active', handleWarpActive);
src/components/ThreeScene.tsx:2694:    window.addEventListener('pointermove', handlePointerMove);
src/components/ThreeScene.tsx:2695:    window.addEventListener('pointerleave', handlePointerLeave);
src/components/ThreeScene.tsx:2696:    window.addEventListener('ship-fire-weapon', handleFireWeapon);
src/components/ThreeScene.tsx:2697:    window.addEventListener('click', handleCanvasClick);
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
src/components/ThreeScene.tsx:7180:    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0 select-none">
src/components/ThreeScene.tsx:7181:      <canvas ref={canvasRef} className="block w-full h-full" />
src/components/ThreeScene.tsx:7186:        className="absolute inset-0 bg-white pointer-events-none z-[100] opacity-0"
src/components/ThreeScene.tsx:7191:        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 font-mono tracking-tight text-center pointer-events-auto">
src/components/ThreeScene.tsx:7192:          <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest animate-pulse">
src/components/ThreeScene.tsx:7198:            className="px-4 py-1.5 bg-black/80 border border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider rounded-md hover:border-[#00f2ff]/60 hover:text-[#00f2ff] hover:shadow-[0_0_10px_rgba(0,242,255,0.2)] transition cursor-pointer active:scale-95 flex items-center gap-1.5"
src/components/ThreeScene.tsx:7207:        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 font-mono tracking-tight text-center pointer-events-auto">
src/components/ThreeScene.tsx:7208:          <p className="text-[10px] text-[#00f2ff] tracking-widest uppercase animate-pulse font-extrabold pb-1">
src/components/ThreeScene.tsx:7217:            className="px-7 py-3.5 bg-black/90 border-2 border-[#00f2ff] text-[#00f2ff] text-xs font-black uppercase tracking-widest rounded-lg hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition duration-300 cursor-pointer active:scale-95 flex items-center gap-1.5"
src/components/CupolaFrame.tsx:1:import React, { useState, useEffect } from 'react';
src/components/CupolaFrame.tsx:4:export const CupolaFrame: React.FC = () => {
src/components/CupolaFrame.tsx:12:  useEffect(() => {
src/components/CupolaFrame.tsx:20:    window.addEventListener('mousemove', handleMouseMove);
src/components/CupolaFrame.tsx:25:  useEffect(() => {
src/components/CupolaFrame.tsx:37:      animationFrameId = requestAnimationFrame(updateInterpolation);
src/components/CupolaFrame.tsx:40:    animationFrameId = requestAnimationFrame(updateInterpolation);
src/components/ErrorDisplay.tsx:44:        <div id="system-overload-screen" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-mono text-xs text-red-500 overflow-auto p-6 md:p-12 select-none">
src/components/ErrorDisplay.tsx:45:          <div className="max-w-3xl w-full border border-red-500 bg-red-950/20 backdrop-blur-md rounded-lg p-6 shadow-2xl relative overflow-hidden">
src/components/ErrorDisplay.tsx:47:            <div className="absolute inset-0 bg-[radial-gradient(#ef44440a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
src/components/ErrorDisplay.tsx:49:            <div className="flex items-center gap-3 border-b border-red-500/30 pb-4 mb-6">
src/components/ErrorDisplay.tsx:50:              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse shrink-0" />
src/components/ErrorDisplay.tsx:52:                <h1 className="text-sm font-bold tracking-widest text-red-400">CRITICAL_SYSTEM_FAULT_DETECTION</h1>
src/components/ErrorDisplay.tsx:53:                <p className="text-[10px] text-red-500/60 font-mono">SAVANT_CORE STACK PANIC: CORE OVERLOAD</p>
src/components/ErrorDisplay.tsx:57:            <p className="mb-4 leading-relaxed bg-red-950/40 p-3 rounded border border-red-500/20">
src/components/ErrorDisplay.tsx:61:            <div className="space-y-4 mb-8">
src/components/ErrorDisplay.tsx:63:                <span className="text-red-400 font-bold block mb-1">■ FAULT_MESSAGE :</span>
src/components/ErrorDisplay.tsx:64:                <code className="block bg-neutral-900 border border-neutral-800 text-neutral-300 p-2.5 rounded font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
src/components/ErrorDisplay.tsx:71:                  <span className="text-red-400 font-bold block mb-1">■ COMPONENT_STACK :</span>
src/components/ErrorDisplay.tsx:72:                  <pre className="block bg-neutral-900 border border-neutral-800 text-neutral-400 p-2.5 rounded font-mono text-[10px] max-h-48 overflow-y-auto whitespace-pre-wrap scrollbar-thin">
src/components/ErrorDisplay.tsx:79:            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-red-500/20 pt-6">
src/components/ErrorDisplay.tsx:80:              <span className="text-red-500/50 text-[10px] font-mono tracking-wider">
src/components/ErrorDisplay.tsx:86:                className="flex items-center gap-2 border border-red-500 bg-red-500/10 hover:bg-red-500 hover:text-black hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] px-5 py-2.5 rounded cursor-pointer transition duration-300 active:scale-95 font-bold uppercase tracking-widest text-[11px]"
src/components/ErrorDisplay.tsx:88:                <RefreshCw className="w-4.5 h-4.5 animate-spin-slow" />
src/components/ErrorDisplay.tsx:105:export const GlobalErrorInspector: React.FC = () => {
src/components/ErrorDisplay.tsx:111:  React.useEffect(() => {
src/components/ErrorDisplay.tsx:126:    window.addEventListener('error', handleError);
src/components/ErrorDisplay.tsx:127:    window.addEventListener('unhandledrejection', handleRejection);
src/components/ErrorDisplay.tsx:145:          className="fixed bottom-4 right-4 z-40 bg-zinc-950/90 border-2 border-amber-500 rounded-lg p-2.5 px-4 font-mono text-[10px] text-amber-500 flex items-center gap-2.5 shadow-xl shadow-black/60 cursor-pointer animate-pulse hover:border-amber-400 hover:text-amber-400 transition"
src/components/ErrorDisplay.tsx:147:          <AlertTriangle className="w-4.5 h-4.5 text-amber-500 shrink-0" />
src/components/ErrorDisplay.tsx:149:          <Eye className="w-3.5 h-3.5 ml-1 opacity-70" />
src/components/ErrorDisplay.tsx:155:        <div id="error-console-panel" className="fixed bottom-4 right-4 z-40 w-full max-w-lg bg-zinc-950/95 border border-zinc-800 rounded-lg shadow-2xl shadow-black/80 font-mono text-[11px] overflow-hidden">
src/components/ErrorDisplay.tsx:156:          <div className="flex h-9 items-center justify-between px-3 border-b border-zinc-800 bg-zinc-900/40">
src/components/ErrorDisplay.tsx:157:            <div className="flex items-center gap-2 text-amber-500 font-bold">
src/components/ErrorDisplay.tsx:158:              <Terminal className="w-4 h-4" />
src/components/ErrorDisplay.tsx:161:            <div className="flex items-center gap-2">
src/components/ErrorDisplay.tsx:164:                className="text-zinc-500 hover:text-zinc-300 hover:underline px-2 cursor-pointer"
src/components/ErrorDisplay.tsx:170:                className="text-zinc-500 hover:text-white cursor-pointer"
src/components/ErrorDisplay.tsx:172:                <X className="w-4.5 h-4.5" />
src/components/ErrorDisplay.tsx:179:            <div className="flex overflow-x-auto border-b border-zinc-900 bg-black/50 select-none scrollbar-none">
src/components/ErrorDisplay.tsx:184:                  className={`px-3 py-1.5 shrink-0 border-r border-zinc-900 cursor-pointer text-[9px] font-semibold transition ${
src/components/ErrorDisplay.tsx:197:          <div className="p-3.5 bg-zinc-950-70">
src/components/ErrorDisplay.tsx:198:            <div className="flex items-center gap-2 mb-2">
src/components/ErrorDisplay.tsx:199:              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
src/components/ErrorDisplay.tsx:204:              <span className="text-zinc-500 text-[9px]">{currentErr.timestamp}</span>
src/components/ErrorDisplay.tsx:207:            <p className="text-zinc-300 font-medium mb-3 border bg-black/40 border-zinc-900 p-2 rounded max-h-24 overflow-y-auto">
src/components/ErrorDisplay.tsx:213:                <span className="text-zinc-500 text-[10px] block mb-1">■ CALL_STACK_TRACE:</span>
src/components/ErrorDisplay.tsx:214:                <pre className="p-2 border border-zinc-900 bg-neutral-900/50 rounded font-mono text-[9px] text-zinc-400 overflow-x-auto max-h-32 overflow-y-auto scrollbar-thin">
src/components/DestinationScreen.tsx:1:import React, { useEffect, useState, useRef } from 'react';
src/components/DestinationScreen.tsx:46:export const DestinationScreen: React.FC = () => {
src/components/DestinationScreen.tsx:60:  useEffect(() => {
src/components/DestinationScreen.tsx:108:  const chatEndRef = useRef<HTMLDivElement>(null);
src/components/DestinationScreen.tsx:110:  const fileInputRef = useRef<HTMLInputElement>(null);
src/components/DestinationScreen.tsx:133:  useEffect(() => {
src/components/DestinationScreen.tsx:140:  useEffect(() => {
src/components/DestinationScreen.tsx:450:    <div id="arrived-studio-screen" className="absolute inset-0 flex flex-col items-center justify-center font-mono text-zinc-300 p-3 sm:p-4 md:p-8 overflow-hidden bg-black/60 select-none z-15">
src/components/DestinationScreen.tsx:453:      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30 pointer-events-none" />
src/components/DestinationScreen.tsx:454:      <div className="absolute inset-0 bg-[#000000]/10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[size:100%_4px] pointer-events-none" />
src/components/DestinationScreen.tsx:461:          className={`max-w-4xl w-full border border-zinc-900 bg-zinc-950/92 backdrop-blur-[20px] rounded-[12px] p-4 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.85)] relative transition-all duration-700 ease-out flex flex-col justify-between ${
src/components/DestinationScreen.tsx:467:            className="absolute inset-0 pointer-events-none transition-opacity duration-1000"
src/components/DestinationScreen.tsx:474:          <div style={{ borderColor: accentColor }} className="absolute顶 absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 rounded-tl-[8px] -mt-0.5 -ml-0.5 pointer-events-none opacity-85" />
src/components/DestinationScreen.tsx:475:          <div style={{ borderColor: accentColor }} className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 rounded-tr-[8px] -mt-0.5 -mr-0.5 pointer-events-none opacity-85" />
src/components/DestinationScreen.tsx:476:          <div style={{ borderColor: accentColor }} className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 rounded-bl-[8px] -mb-0.5 -ml-0.5 pointer-events-none opacity-85" />
src/components/DestinationScreen.tsx:477:          <div style={{ borderColor: accentColor }} className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 rounded-br-[8px] -mb-0.5 -mr-0.5 pointer-events-none opacity-85" />
src/components/DestinationScreen.tsx:480:          <span className="absolute top-1 left-7 text-[5px] text-zinc-650 tracking-widest pointer-events-none">COORD_Z_85 // SYSTEM_GATES</span>
src/components/DestinationScreen.tsx:481:          <span className="absolute top-1 right-7 text-[5px] text-zinc-650 tracking-widest pointer-events-none">SEC_VAL_TRUE // NOMINAL_WARP</span>
src/components/DestinationScreen.tsx:484:          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-900/60 pb-3 mb-3 z-10 gap-2">
src/components/DestinationScreen.tsx:485:            <div className="flex items-center gap-2.5">
src/components/DestinationScreen.tsx:486:              <div className="relative">
src/components/DestinationScreen.tsx:487:                <Terminal style={{ color: accentColor }} className="w-5 h-5 animate-pulse" />
src/components/DestinationScreen.tsx:488:                <div style={{ backgroundColor: accentColor }} className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full animate-ping" />
src/components/DestinationScreen.tsx:491:                <h1 style={{ color: accentColor }} className="text-[12px] font-black tracking-[0.25em] uppercase">SAVANT EXPERIMENTAL</h1>
src/components/DestinationScreen.tsx:492:                <p className="text-[8px] text-zinc-550 leading-none">CREATIVE VECTOR SYSTEMS & DIGITIZED METHOD MATRIX</p>
src/components/DestinationScreen.tsx:497:            <div className="flex items-center gap-1.5 px-2.5 py-1 border border-zinc-900 bg-zinc-900/45 rounded-md text-[8px] text-emerald-400 font-extrabold tracking-widest animate-pulse self-start sm:self-auto">
src/components/DestinationScreen.tsx:498:              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
src/components/DestinationScreen.tsx:504:          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-3.5 z-10">
src/components/DestinationScreen.tsx:521:                  className={`py-2 px-2 text-left font-black tracking-widest border transition duration-300 uppercase cursor-pointer rounded-md flex flex-col justify-between select-none relative h-13 group ${
src/components/DestinationScreen.tsx:527:                  <div className="flex items-center justify-between w-full">
src/components/DestinationScreen.tsx:528:                    <TabIcon style={{ color: isActive ? accentColor : undefined }} className="w-3.5 h-3.5" />
src/components/DestinationScreen.tsx:529:                    <span className="text-[5.5px] text-zinc-600 font-bold group-hover:text-zinc-400 transition">{tab.detail}</span>
src/components/DestinationScreen.tsx:531:                  <span className="text-[9px] mt-1.5 block">{tab.label}</span>
src/components/DestinationScreen.tsx:533:                    <div style={{ backgroundColor: accentColor }} className="absolute bottom-0 inset-x-4 h-[1px] opacity-70 animate-pulse" />
src/components/DestinationScreen.tsx:541:          <div className="h-[285px] border border-zinc-900/60 bg-black/65 rounded-lg p-3 md:p-4.5 overflow-y-auto hover:scrollbar-zinc-800 font-mono text-zinc-300 z-10 select-text leading-relaxed relative flex flex-col justify-between scrollbar-thin">
src/components/DestinationScreen.tsx:545:              <div className="space-y-3.5 h-full flex flex-col justify-between">
src/components/DestinationScreen.tsx:547:                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
src/components/DestinationScreen.tsx:548:                    <h3 style={{ color: accentColor }} className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
src/components/DestinationScreen.tsx:549:                      <Terminal className="w-3.5 h-3.5" />
src/components/DestinationScreen.tsx:552:                    <span className="text-[7.5px] text-zinc-500 font-bold">NODE: CORE_VECT</span>
src/components/DestinationScreen.tsx:556:                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
src/components/DestinationScreen.tsx:557:                    <div className="md:col-span-7 bg-zinc-900/30 border border-zinc-900 rounded-md p-3">
src/components/DestinationScreen.tsx:558:                      <span style={{ color: accentColor }} className="text-[8px] font-black tracking-wider uppercase block mb-1">■ DIRECTIVE / SAVANT METAPHOR</span>
src/components/DestinationScreen.tsx:559:                      <p className="text-[10.5px] text-zinc-400 leading-normal">
src/components/DestinationScreen.tsx:560:                        We operate <span className="text-white">where raw experimental artistry meets bulletproof system physics</span>. Standard layouts commodify interest; Savant engineering compiles interactive dimensional structures specifically to capture high-value retention. We reject standard templates and superfluous UI slop to let elegant typography and cohesive behavior define premium caliber.
src/components/DestinationScreen.tsx:564:                    <div className="md:col-span-5 bg-zinc-900/30 border border-zinc-900 rounded-md p-3 flex flex-col justify-between">
src/components/DestinationScreen.tsx:566:                        <span style={{ color: accentColor }} className="text-[8px] font-black tracking-wider uppercase block mb-1">■ SYNAPSE CAPACITIES</span>
src/components/DestinationScreen.tsx:567:                        <div className="space-y-1">
src/components/DestinationScreen.tsx:568:                          <div className="flex justify-between text-[9px] border-b border-zinc-950 pb-0.5">
src/components/DestinationScreen.tsx:569:                            <span className="text-zinc-500">KINETIC FLIGHT RESOLVER</span>
src/components/DestinationScreen.tsx:570:                            <span className="text-emerald-400 font-bold">100% ONLINE</span>
src/components/DestinationScreen.tsx:572:                          <div className="flex justify-between text-[9px] border-b border-zinc-950 pb-0.5">
src/components/DestinationScreen.tsx:573:                            <span className="text-zinc-500">PROCEDURAL ASTEROID FIELD</span>
src/components/DestinationScreen.tsx:574:                            <span className="text-emerald-400 font-bold">DURABLE</span>
src/components/DestinationScreen.tsx:576:                          <div className="flex justify-between text-[9px]">
src/components/DestinationScreen.tsx:577:                            <span className="text-zinc-500">ACES FILM COLOR GRADE</span>
src/components/DestinationScreen.tsx:578:                            <span className="text-emerald-400 font-bold">1.25 EXPOSURE</span>
src/components/DestinationScreen.tsx:582:                      <div className="text-[7px] text-zinc-650 mt-2">CHRONOS_FUSION_RESONATOR RECONNECT: STANDARD</div>
src/components/DestinationScreen.tsx:588:                <div className="bg-zinc-900/25 border border-zinc-900/50 p-3 rounded-md">
src/components/DestinationScreen.tsx:589:                  <div className="flex items-center justify-between mb-2">
src/components/DestinationScreen.tsx:590:                    <span className="text-[8.5px] font-extrabold text-white tracking-widest flex items-center gap-1">
src/components/DestinationScreen.tsx:591:                      <Sliders className="w-3 h-3 text-sky-400" />
src/components/DestinationScreen.tsx:594:                    <span className="text-[7.5px] text-zinc-550 italic uppercase">Acoustic diagnostics active on slide</span>
src/components/DestinationScreen.tsx:597:                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
src/components/DestinationScreen.tsx:599:                    <div className="space-y-1">
src/components/DestinationScreen.tsx:600:                      <div className="flex justify-between text-[8px] font-bold">
src/components/DestinationScreen.tsx:601:                        <span className="text-zinc-500">GEOMETRIC_PREC</span>
src/components/DestinationScreen.tsx:610:                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
src/components/DestinationScreen.tsx:615:                    <div className="space-y-1">
src/components/DestinationScreen.tsx:616:                      <div className="flex justify-between text-[8px] font-bold">
src/components/DestinationScreen.tsx:617:                        <span className="text-zinc-500">MATERIAL_GLOSS</span>
src/components/DestinationScreen.tsx:626:                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
src/components/DestinationScreen.tsx:631:                    <div className="space-y-1">
src/components/DestinationScreen.tsx:632:                      <div className="flex justify-between text-[8px] font-bold">
src/components/DestinationScreen.tsx:633:                        <span className="text-zinc-500">CHROM_ABERRATION</span>
src/components/DestinationScreen.tsx:642:                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
src/components/DestinationScreen.tsx:647:                    <div className="space-y-1">
src/components/DestinationScreen.tsx:648:                      <div className="flex justify-between text-[8px] font-bold">
src/components/DestinationScreen.tsx:649:                        <span className="text-zinc-500">SPATIAL_INDEX</span>
src/components/DestinationScreen.tsx:658:                        className="w-full accent-cyan-400 bg-zinc-900 h-1 rounded cursor-pointer"
src/components/DestinationScreen.tsx:668:              <div className="space-y-3.5 h-full">
src/components/DestinationScreen.tsx:669:                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
src/components/DestinationScreen.tsx:670:                  <h3 style={{ color: accentColor }} className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
src/components/DestinationScreen.tsx:671:                    <Briefcase className="w-3.5 h-3.5" />
src/components/DestinationScreen.tsx:674:                  <span className="text-[7.5px] text-zinc-550">REF: REALIZED_03</span>
src/components/DestinationScreen.tsx:677:                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
src/components/DestinationScreen.tsx:679:                  <div className="border border-zinc-900 bg-zinc-900/20 p-3 rounded-md flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative group">
src/components/DestinationScreen.tsx:680:                    <div className="absolute top-1 right-2 text-[6px] text-zinc-650 font-black tracking-widest leading-none pointer-events-none">V_GATE_01</div>
src/components/DestinationScreen.tsx:682:                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-950">
src/components/DestinationScreen.tsx:683:                        <span className="text-[11px] font-black text-white hover:text-[#00f2ff] transition">PROJECT_NEBULA_GATE</span>
src/components/DestinationScreen.tsx:685:                      <p className="text-[9px] text-zinc-450 leading-relaxed min-h-[46px]">
src/components/DestinationScreen.tsx:689:                    <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-zinc-950">
src/components/DestinationScreen.tsx:690:                      <span className="text-[7px] text-sky-400 font-bold font-mono tracking-tight">Complexity: 94% SEC</span>
src/components/DestinationScreen.tsx:691:                      <span className="text-[6.5px] border border-sky-950/40 bg-sky-950/20 px-1.5 py-0.5 rounded font-black text-sky-400 uppercase tracking-wider">
src/components/DestinationScreen.tsx:698:                  <div className="border border-zinc-900 bg-zinc-900/20 p-3 rounded-md flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative group">
src/components/DestinationScreen.tsx:699:                    <div className="absolute top-1 right-2 text-[6px] text-zinc-650 font-black tracking-widest leading-none pointer-events-none">C_FLIGHT_02</div>
src/components/DestinationScreen.tsx:701:                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-950">
src/components/DestinationScreen.tsx:702:                        <span className="text-[11px] font-black text-white">CHRONOS_CORE</span>
src/components/DestinationScreen.tsx:704:                      <p className="text-[9px] text-zinc-450 leading-relaxed min-h-[46px]">
src/components/DestinationScreen.tsx:708:                    <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-zinc-950">
src/components/DestinationScreen.tsx:709:                      <span className="text-[7px] text-emerald-400 font-bold font-mono tracking-tight">Shader Blocks: 119/120</span>
src/components/DestinationScreen.tsx:710:                      <span className="text-[6.5px] border border-emerald-950/40 bg-emerald-950/20 px-1.5 py-0.5 rounded font-black text-emerald-400 uppercase tracking-wider">
src/components/DestinationScreen.tsx:717:                  <div className="border border-zinc-900 bg-zinc-900/20 p-3 rounded-md flex flex-col justify-between hover:border-zinc-800 transition duration-300 relative group">
src/components/DestinationScreen.tsx:718:                    <div className="absolute top-1 right-2 text-[6px] text-zinc-650 font-black tracking-widest leading-none pointer-events-none">H_MAT_03</div>
src/components/DestinationScreen.tsx:720:                      <div className="flex justify-between items-center mb-1 pb-1 border-b border-zinc-950">
src/components/DestinationScreen.tsx:721:                        <span className="text-[11px] font-black text-white">HUMAN_METRIC_HYPER</span>
src/components/DestinationScreen.tsx:723:                      <p className="text-[9px] text-zinc-450 leading-relaxed min-h-[46px]">
src/components/DestinationScreen.tsx:727:                    <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-zinc-950">
src/components/DestinationScreen.tsx:728:                      <span className="text-[7px] text-amber-500 font-bold font-mono tracking-tight">Stability: OPTIMUM</span>
src/components/DestinationScreen.tsx:729:                      <span className="text-[6.5px] border border-amber-950/40 bg-amber-950/20 px-1.5 py-0.5 rounded font-black text-amber-500 uppercase tracking-wider">
src/components/DestinationScreen.tsx:736:                <div className="bg-zinc-900/10 border border-zinc-900 p-2.5 rounded-md flex items-center justify-between text-[8px] mt-2">
src/components/DestinationScreen.tsx:737:                  <span className="text-zinc-550 flex items-center gap-1.5 font-bold">
src/components/DestinationScreen.tsx:738:                    <span className="w-1 h-1 rounded-full bg-orange-400 animate-ping" />
src/components/DestinationScreen.tsx:741:                  <a href="#view-manifest" onClick={(e) => { e.preventDefault(); playDiagnosticBlip(620, 0.04); }} className="text-white hover:underline uppercase flex items-center gap-1">
src/components/DestinationScreen.tsx:743:                    <ExternalLink className="w-2.5 h-2.5" />
src/components/DestinationScreen.tsx:751:              <div className="space-y-3 h-full">
src/components/DestinationScreen.tsx:752:                <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
src/components/DestinationScreen.tsx:753:                  <h3 style={{ color: accentColor }} className="text-xs font-black uppercase tracking-widest flex items-center gap-1">
src/components/DestinationScreen.tsx:754:                    <Layers className="w-3.5 h-3.5" />
src/components/DestinationScreen.tsx:757:                  <span className="text-[7.5px] text-zinc-550">REF: CAP_SCHEMA</span>
src/components/DestinationScreen.tsx:760:                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
src/components/DestinationScreen.tsx:762:                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
src/components/DestinationScreen.tsx:763:                    <div className="flex justify-between items-center mb-1">
src/components/DestinationScreen.tsx:764:                      <span className="text-[10px] font-black text-white uppercase tracking-wider">01_PROCEDURAL WebGL SHADER WORK</span>
src/components/DestinationScreen.tsx:765:                      <span className="text-[8px] px-1.5 py-0.5 bg-sky-500/15 border border-sky-400/25 text-sky-400 rounded-md font-bold">98.6% CORE</span>
src/components/DestinationScreen.tsx:767:                    <p className="text-[9px] text-[#9a9a9f]">
src/components/DestinationScreen.tsx:773:                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
src/components/DestinationScreen.tsx:774:                    <div className="flex justify-between items-center mb-1">
src/components/DestinationScreen.tsx:775:                      <span className="text-[10px] font-black text-white uppercase tracking-wider">02_AUTHENTIC CONTEMPORARY BRAND DESIGN</span>
src/components/DestinationScreen.tsx:776:                      <span className="text-[8px] px-1.5 py-0.5 bg-emerald-500/15 border border-emerald-400/25 text-emerald-400 rounded-md font-bold">OPTIMUM</span>
src/components/DestinationScreen.tsx:778:                    <p className="text-[9px] text-[#9a9a9f]">
src/components/DestinationScreen.tsx:784:                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
src/components/DestinationScreen.tsx:785:                    <div className="flex justify-between items-center mb-1">
src/components/DestinationScreen.tsx:786:                      <span className="text-[10px] font-black text-white uppercase tracking-wider">03_MICRO-ACOUSTIC DESIGN & SEAMLESS INTERACTION</span>
src/components/DestinationScreen.tsx:787:                      <span className="text-[8px] px-1.5 py-0.5 bg-amber-500/15 border border-amber-400/25 text-amber-500 rounded-md font-bold">100% G-GATE</span>
src/components/DestinationScreen.tsx:789:                    <p className="text-[9px] text-[#9a9a9f]">
src/components/DestinationScreen.tsx:795:                  <div className="p-3 border border-zinc-900 bg-zinc-900/20 rounded-md">
src/components/DestinationScreen.tsx:796:                    <div className="flex justify-between items-center mb-1">
src/components/DestinationScreen.tsx:797:                      <span className="text-[10px] font-black text-white uppercase tracking-wider">04_FULL-STACK SYSTEMS INTEGRATION</span>
src/components/DestinationScreen.tsx:798:                      <span className="text-[8px] px-1.5 py-0.5 bg-purple-500/15 border border-purple-400/25 text-purple-400 rounded-md font-bold">SECURE_DYN</span>
src/components/DestinationScreen.tsx:800:                    <p className="text-[9px] text-[#9a9a9f]">
src/components/DestinationScreen.tsx:806:                <div className="text-[7.5px] text-zinc-650 text-center tracking-widest mt-1">
src/components/DestinationScreen.tsx:814:              <div className="h-full flex flex-col md:flex-row gap-3.5 overflow-hidden">
src/components/DestinationScreen.tsx:817:                <div className="flex-1 flex flex-col justify-between h-full min-h-0 bg-zinc-950/40 p-2.5 border border-zinc-900/60 rounded-md relative">
src/components/DestinationScreen.tsx:820:                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin max-h-[165px] md:max-h-[190px]">
src/components/DestinationScreen.tsx:824:                        className={`flex flex-col max-w-[85%] ${
src/components/DestinationScreen.tsx:832:                        <div className="flex items-center gap-1.5 text-[6.5px] text-zinc-550 mb-0.5 font-bold uppercase select-none">
src/components/DestinationScreen.tsx:839:                        <p className={`text-[9.5px] leading-relaxed select-text ${msg.sender === 'USER' ? 'text-white' : 'text-zinc-300'}`}>{msg.text}</p>
src/components/DestinationScreen.tsx:844:                      <div className="mr-auto items-start bg-zinc-900/30 border border-zinc-900 p-2 rounded-md max-w-[80%]">
src/components/DestinationScreen.tsx:845:                        <div className="flex items-center gap-1.5 text-[6.5px] text-zinc-550 mb-1 font-bold">
src/components/DestinationScreen.tsx:850:                        <div className="flex gap-1 items-center py-0.5">
src/components/DestinationScreen.tsx:851:                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
src/components/DestinationScreen.tsx:852:                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
src/components/DestinationScreen.tsx:853:                          <div className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
src/components/DestinationScreen.tsx:861:                  <div className="flex gap-1.5 overflow-x-auto py-1 mb-2 border-t border-zinc-900 select-none pb-1.5 scrollbar-none">
src/components/DestinationScreen.tsx:865:                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
src/components/DestinationScreen.tsx:872:                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
src/components/DestinationScreen.tsx:879:                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
src/components/DestinationScreen.tsx:886:                      className="text-[7.5px] shrink-0 font-bold border border-zinc-900 bg-neutral-900/30 hover:bg-neutral-900/80 hover:border-zinc-800 p-1 px-1.5 rounded transition cursor-pointer"
src/components/DestinationScreen.tsx:893:                  <div className="flex gap-2">
src/components/DestinationScreen.tsx:902:                      className="flex-1 bg-black/80 border border-zinc-900 focus:outline-none focus:border-zinc-700 p-2 text-[10px] text-white rounded font-mono"
src/components/DestinationScreen.tsx:909:                      className="p-2 px-3 text-black font-extrabold hover:opacity-90 active:scale-95 transition rounded-md flex items-center gap-1 cursor-pointer disabled:opacity-50"
src/components/DestinationScreen.tsx:911:                      <Send className="w-3 h-3 text-black shrink-0" />
src/components/DestinationScreen.tsx:918:                <div className="w-full md:w-[210px] flex flex-col justify-between h-full bg-zinc-950/20 p-2.5 border border-zinc-900/60 rounded-md">
src/components/DestinationScreen.tsx:926:                    className={`relative flex-1 flex flex-col items-center justify-center p-3 text-center border-2 border-dashed rounded-md cursor-pointer transition select-none h-[115px] md:h-auto ${
src/components/DestinationScreen.tsx:936:                      className="hidden"
src/components/DestinationScreen.tsx:941:                      <div className="flex flex-col items-center gap-1.5">
src/components/DestinationScreen.tsx:942:                        <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
src/components/DestinationScreen.tsx:943:                        <span className="text-[8.5px] font-black text-white">SCANNING_BRIEF: {scanProgress}%</span>
src/components/DestinationScreen.tsx:944:                        <div className="w-24 h-1 bg-zinc-900 mt-1 rounded-full overflow-hidden">
src/components/DestinationScreen.tsx:945:                          <div style={{ width: `${scanProgress}%` }} className="h-full bg-cyan-400 transition-all duration-150" />
src/components/DestinationScreen.tsx:949:                      <div className="flex flex-col items-center gap-1">
src/components/DestinationScreen.tsx:950:                        <FileText className="w-7 h-7 text-emerald-400" />
src/components/DestinationScreen.tsx:951:                        <span className="text-[9.5px] font-black text-white truncate max-w-[170px]">{uploadedFile.name}</span>
src/components/DestinationScreen.tsx:952:                        <span className="text-[7.5px] text-zinc-550 uppercase">{uploadedFile.size} • LOADED ok</span>
src/components/DestinationScreen.tsx:953:                        <span className="text-[7.5px] block font-extrabold text-[#00f2ff] underline mt-1">TAP_TO_REPLACE</span>
src/components/DestinationScreen.tsx:956:                      <div className="flex flex-col items-center gap-1.5 group">
src/components/DestinationScreen.tsx:957:                        <Upload className="w-7 h-7 text-zinc-700 group-hover:text-zinc-550 transition animate-bounce" />
src/components/DestinationScreen.tsx:958:                        <span className="text-[9px] font-black text-zinc-300">ATTACH BRIEF & REGS</span>
src/components/DestinationScreen.tsx:959:                        <p className="text-[7px] text-zinc-550 leading-snug">Drag & drop project brief file, or click to upload</p>
src/components/DestinationScreen.tsx:965:                  <div className="mt-3 bg-zinc-900/40 border border-zinc-950 p-2.5 rounded-md">
src/components/DestinationScreen.tsx:966:                    <span className="text-[7.5px] font-bold text-zinc-550 block mb-1 uppercase tracking-widest">Assessment Matrix:</span>
src/components/DestinationScreen.tsx:968:                      <div className="space-y-1">
src/components/DestinationScreen.tsx:969:                        <div className="flex justify-between items-center text-[8.5px] border-b border-zinc-950 pb-0.5">
src/components/DestinationScreen.tsx:970:                          <span className="text-zinc-500">VECTOR COMPLEX:</span>
src/components/DestinationScreen.tsx:971:                          <span className="text-white font-bold">{uploadedFile.vectorComplexity}%</span>
src/components/DestinationScreen.tsx:973:                        <div className="flex justify-between items-center text-[8.5px] border-b border-zinc-950 pb-0.5">
src/components/DestinationScreen.tsx:974:                          <span className="text-zinc-500">SUITABILITY INDEX:</span>
src/components/DestinationScreen.tsx:975:                          <span className="text-white font-bold">{uploadedFile.readinessRating}%</span>
src/components/DestinationScreen.tsx:977:                        <div className="flex justify-between items-center text-[8.5px]">
src/components/DestinationScreen.tsx:978:                          <span className="text-zinc-500">ASSESSMENT:</span>
src/components/DestinationScreen.tsx:979:                          <span className="text-emerald-400 font-extrabold text-[8px]">OPTIMUM</span>
src/components/DestinationScreen.tsx:983:                      <div className="text-[8.5px] text-zinc-650 italic text-center py-2 uppercase leading-snug">
src/components/DestinationScreen.tsx:997:          <div className="mt-3.5 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-zinc-900/60 pt-3.5 z-10">
src/components/DestinationScreen.tsx:1001:              <div className="flex items-center gap-2 text-[8px] text-zinc-500 select-none self-start">
src/components/DestinationScreen.tsx:1002:                <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
src/components/DestinationScreen.tsx:1006:              <form onSubmit={handleSubmitTransmission} className="flex flex-wrap items-center gap-2.5 self-start w-full md:w-auto">
src/components/DestinationScreen.tsx:1013:                  className="bg-black/95 border border-zinc-900 focus:outline-none focus:border-zinc-700 px-2 py-1 text-[8px] text-zinc-300 rounded font-mono w-48 shrink-0"
src/components/DestinationScreen.tsx:1018:                  className="px-3.5 py-1.5 text-black font-extrabold text-[7.5px] uppercase tracking-widest rounded transition cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-95"
src/components/DestinationScreen.tsx:1033:              className="w-full md:w-auto px-8 py-2 bg-sky-400 text-black hover:brightness-110 shadow-lg transition font-extrabold uppercase tracking-widest text-[9.5px] rounded-md cursor-pointer active:scale-[0.98] flex items-center justify-center gap-1.5 hover:scale-[1.01] self-end"
src/components/DestinationScreen.tsx:1036:              <Zap className="w-3.5 h-3.5 text-black animate-[bounce_1.5s_infinite]" />
src/components/DestinationScreen.tsx:1047:          className={`max-w-2xl w-full border border-zinc-900 bg-zinc-950/98 rounded-[12px] p-4 md:p-6 shadow-[0_0_40px_rgba(0,0,0,0.9)] relative transition-all duration-700 ease-out ${
src/components/DestinationScreen.tsx:1053:            className="absolute inset-0 pointer-events-none"
src/components/DestinationScreen.tsx:1060:          <div style={{ borderColor: accentColor }} className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 rounded-tl-[6px]" />
src/components/DestinationScreen.tsx:1061:          <div style={{ borderColor: accentColor }} className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 rounded-tr-[6px]" />
src/components/DestinationScreen.tsx:1062:          <div style={{ borderColor: accentColor }} className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 rounded-bl-[6px]" />
src/components/DestinationScreen.tsx:1063:          <div style={{ borderColor: accentColor }} className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 rounded-br-[6px]" />
src/components/DestinationScreen.tsx:1066:          <div className="flex items-center gap-2.5 border-b border-zinc-900/60 pb-3 mb-4">
src/components/DestinationScreen.tsx:1067:            <ShieldCheck className="w-5 h-5 text-emerald-400 animate-pulse" />
src/components/DestinationScreen.tsx:1069:              <h1 style={{ color: accentColor }} className="text-[11px] font-bold tracking-widest uppercase">SAVANT_CORE // MISSION COMPLETION LOG REPORT</h1>
src/components/DestinationScreen.tsx:1070:              <p className="text-[8px] text-zinc-550">NOMINAL QUANTUM CONVERGENCE FLUID COEFFICIENT (0.00)</p>
src/components/DestinationScreen.tsx:1075:          <div className="mb-4 bg-zinc-950 border border-zinc-900 p-2 text-center text-[6.5px] font-mono select-none overflow-x-auto leading-tight rounded-md">
src/components/DestinationScreen.tsx:1076:            <pre className="inline-block text-left whitespace-pre" style={{ color: accentColor }}>
src/components/DestinationScreen.tsx:1087:          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5 select-none">
src/components/DestinationScreen.tsx:1089:            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
src/components/DestinationScreen.tsx:1090:              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">GATES_SAMPLED</span>
src/components/DestinationScreen.tsx:1091:              <span className="text-sm font-black text-white block">05 / 05</span>
src/components/DestinationScreen.tsx:1092:              <span className="text-[7.5px] text-emerald-400 leading-none">NOMINAL</span>
src/components/DestinationScreen.tsx:1096:            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
src/components/DestinationScreen.tsx:1097:              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">PEAK_VEL_M_S</span>
src/components/DestinationScreen.tsx:1098:              <span className="text-sm font-black text-white block">{peakVelocity}</span>
src/components/DestinationScreen.tsx:1099:              <span className="text-[7.5px] text-zinc-500 leading-none">WARP SCALE</span>
src/components/DestinationScreen.tsx:1103:            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
src/components/DestinationScreen.tsx:1104:              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">ALTITUDE_SURF</span>
src/components/DestinationScreen.tsx:1105:              <span className="text-sm font-black text-white block">15,200 km</span>
src/components/DestinationScreen.tsx:1106:              <span style={{ color: accentColor }} className="text-[7.5px] leading-none">COSMIC_SHELF</span>
src/components/DestinationScreen.tsx:1110:            <div className="bg-zinc-900/40 border border-zinc-900 p-2 md:p-3 rounded-md text-center">
src/components/DestinationScreen.tsx:1111:              <span className="text-[7.5px] text-zinc-550 block font-bold tracking-widest leading-none mb-1">CORE_FUSION</span>
src/components/DestinationScreen.tsx:1112:              <span className="text-sm font-black text-emerald-400 block">ENGAGED</span>
src/components/DestinationScreen.tsx:1113:              <span className="text-[7.5px] text-emerald-400 leading-none">SYNC_ACTIVE</span>
src/components/DestinationScreen.tsx:1118:          <div className="space-y-1.5 mb-5.5">
src/components/DestinationScreen.tsx:1119:            <span className="text-[8px] text-zinc-500 font-bold block uppercase tracking-widest">■ CAPTAINS_FLIGHT_RECORDS :</span>
src/components/DestinationScreen.tsx:1122:              className="w-full bg-black/80 border border-zinc-900 p-3 h-44 overflow-y-auto font-mono text-[9.5px] text-zinc-400 select-text scrollbar-thin rounded-md"
src/components/DestinationScreen.tsx:1125:                <div key={idx} className="flex gap-2 mb-1.5 border-b border-zinc-950 pb-1 last:border-0">
src/components/DestinationScreen.tsx:1126:                  <span className="text-zinc-650 font-bold">▶</span>
src/components/DestinationScreen.tsx:1127:                  <span className={idx === typedLogs.length - 1 ? 'text-[#00f2ff]' : ''} style={{ color: idx === typedLogs.length - 1 ? accentColor : undefined }}>
src/components/DestinationScreen.tsx:1133:                <div style={{ color: accentColor }} className="flex items-center gap-1.5 text-[8.5px] p-1.5 animate-pulse mt-1.5 bg-zinc-900/20 border border-dashed border-zinc-900 rounded">
src/components/DestinationScreen.tsx:1134:                  <Cpu className="w-3.5 h-3.5 animate-spin" />
src/components/DestinationScreen.tsx:1142:          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900/60 pt-4">
src/components/DestinationScreen.tsx:1143:            <div className="flex items-center gap-2 text-[8px] text-zinc-550">
src/components/DestinationScreen.tsx:1144:              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
src/components/DestinationScreen.tsx:1153:              className="flex items-center gap-2 px-5 py-2 bg-neutral-900/80 border border-zinc-850 text-zinc-300 hover:text-white hover:border-[#00f2ff]/30 hover:shadow-[0_0_12px_rgba(0,242,255,0.1)] transition rounded-md cursor-pointer font-bold uppercase tracking-wider text-[10px] active:scale-95"
src/components/DestinationScreen.tsx:1155:              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
src/components/CRTOverlay.tsx:1:import React, { useEffect, useState } from 'react';
src/components/CRTOverlay.tsx:4:export const CRTOverlay: React.FC = () => {
src/components/CRTOverlay.tsx:10:  useEffect(() => {
src/components/CRTOverlay.tsx:23:  useEffect(() => {
src/components/CRTOverlay.tsx:166:      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-40 overflow-hidden ${phaseMod.contrast} ${phaseMod.brightness} ${phaseMod.blur} ${flicker ? 'opacity-85 brightness-110' : 'opacity-100'}`}
src/components/CRTOverlay.tsx:169:      <div className={`absolute inset-0 transition-colors duration-700 ${currentTheme.tint} ${phaseMod.screenJitter}`} />
src/components/CRTOverlay.tsx:173:        className={`absolute inset-0 pointer-events-none transition-all duration-300 ${phaseMod.scanlineIntensity}`}
src/components/CRTOverlay.tsx:189:        className="absolute left-0 right-0 w-full h-[6px] opacity-45 pointer-events-none animate-scanline"
src/components/CRTOverlay.tsx:197:      <svg className="absolute inset-0 w-full h-full opacity-[0.14] mix-blend-overlay">
src/components/CRTOverlay.tsx:220:        className="absolute inset-0 pointer-events-none"
src/components/CRTOverlay.tsx:227:      <div className="absolute top-1/2 left-3 -translate-y-1/2 flex flex-col gap-10 font-mono text-[5px] font-black tracking-widest text-zinc-500 uppercase select-none opacity-40 scale-75 origin-left">
src/components/CockpitHUD.tsx:1:import React, { useEffect, useRef, useState } from 'react';
src/components/CockpitHUD.tsx:12:const HazardStripes: React.FC<{ className?: string; color?: string }> = ({ className = "h-1 opacity-30", color = "bg-amber-500" }) => (
src/components/CockpitHUD.tsx:13:  <div className={`flex gap-[3px] overflow-hidden ${className}`}>
src/components/CockpitHUD.tsx:15:      <div key={i} className={`w-1 h-full skew-x-30 shrink-0 ${color}`} />
src/components/CockpitHUD.tsx:20:const TechBarcode: React.FC<{ color?: string }> = ({ color = "bg-white" }) => (
src/components/CockpitHUD.tsx:21:  <div className="flex items-end gap-[1.5px] h-3.5 opacity-60">
src/components/CockpitHUD.tsx:22:    <div className={`w-[1px] h-full ${color}`} />
src/components/CockpitHUD.tsx:23:    <div className={`w-[2px] h-full ${color}`} />
src/components/CockpitHUD.tsx:24:    <div className={`w-[1px] h-[60%] ${color}`} />
src/components/CockpitHUD.tsx:25:    <div className={`w-[1px] h-[40%] ${color}`} />
src/components/CockpitHUD.tsx:26:    <div className={`w-[3px] h-full ${color}`} />
src/components/CockpitHUD.tsx:27:    <div className={`w-[1px] h-[80%] ${color}`} />
src/components/CockpitHUD.tsx:28:    <div className={`w-[2px] h-[55%] ${color}`} />
src/components/CockpitHUD.tsx:29:    <div className={`w-[1px] h-full ${color}`} />
src/components/CockpitHUD.tsx:30:    <div className={`w-[2px] h-[30%] ${color}`} />
src/components/CockpitHUD.tsx:34:const CornerBracket: React.FC<{ position: 'tl' | 'tr' | 'bl' | 'br'; color: string }> = ({ position, color }) => {
src/components/CockpitHUD.tsx:46:    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden rounded-[16px] z-20">
src/components/CockpitHUD.tsx:49:        className={`absolute w-3 h-3 ${bracketStyle[position]} opacity-85`}
src/components/CockpitHUD.tsx:55:        className="absolute w-[3px] h-[3px] rounded-full opacity-70"
src/components/CockpitHUD.tsx:67:        className="absolute text-[5px] font-black font-mono tracking-widest opacity-45 scale-75"
src/components/CockpitHUD.tsx:81:        className="absolute text-[5.5px] font-extrabold leading-none opacity-40 select-none tracking-tighter"
src/components/CockpitHUD.tsx:126:const TacticalCrosshair: React.FC<{ color: string; telemetry: any; alignmentScore: number; coreTemp: number; filterEffect: string }> = ({
src/components/CockpitHUD.tsx:135:  useEffect(() => {
src/components/CockpitHUD.tsx:142:    window.addEventListener('ship-velocity-vector', handleVelocityChange);
src/components/CockpitHUD.tsx:164:    <div id="central-flight-aiming-reticle" className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
src/components/CockpitHUD.tsx:166:      <div className="relative w-[340px] h-[340px] flex items-center justify-center animate-[pulse_6s_ease-in-out_infinite]">
src/components/CockpitHUD.tsx:169:        <div className="absolute left-[-40px] right-[-40px] h-[1px] flex justify-between px-6 pointer-events-none">
src/components/CockpitHUD.tsx:170:          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-current opacity-40" style={{ color }} />
src/components/CockpitHUD.tsx:171:          <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-current opacity-40" style={{ color }} />
src/components/CockpitHUD.tsx:175:        <div className="absolute top-[-40px] bottom-[-40px] w-[1px] flex flex-col justify-between py-6 pointer-events-none">
src/components/CockpitHUD.tsx:176:          <div className="h-16 w-[1px] bg-gradient-to-b from-transparent to-current opacity-40" style={{ color }} />
src/components/CockpitHUD.tsx:177:          <div className="h-16 w-[1px] bg-gradient-to-t from-transparent to-current opacity-40" style={{ color }} />
src/components/CockpitHUD.tsx:181:        <svg width="240" height="240" viewBox="0 0 240 240" className="opacity-80 absolute">
src/components/CockpitHUD.tsx:183:          <ellipse cx="120" cy="120" rx="115" ry="24" stroke={color} strokeWidth="0.8" fill="none" className="opacity-30 animate-[spin_16s_linear_infinite]" transform="rotate(30 120 120)" />
src/components/CockpitHUD.tsx:184:          <ellipse cx="120" cy="120" rx="115" ry="24" stroke={color} strokeWidth="0.8" fill="none" className="opacity-20" strokeDasharray="3 3" transform="rotate(-40 120 120)" />
src/components/CockpitHUD.tsx:187:          <circle cx="120" cy="120" r="12" stroke={color} strokeWidth="0.8" strokeDasharray="3 1.5" fill="none" className="opacity-50 animate-[spin_40s_linear_infinite]" />
src/components/CockpitHUD.tsx:188:          <circle cx="120" cy="120" r="8" stroke={color} strokeWidth="1" fill="none" className="opacity-60" />
src/components/CockpitHUD.tsx:189:          <circle cx="120" cy="120" r="1.5" fill={color} className="opacity-90 animate-pulse" />
src/components/CockpitHUD.tsx:215:          <circle cx="120" cy="120" r="92" stroke={color} strokeWidth="1.2" strokeDasharray="110 50 110 50" fill="none" className="opacity-35" />
src/components/CockpitHUD.tsx:218:          <line x1="120" y1="28" x2="120" y2="34" stroke={color} strokeWidth="1.5" className="opacity-45" />
src/components/CockpitHUD.tsx:219:          <line x1="120" y1="206" x2="120" y2="212" stroke={color} strokeWidth="1.5" className="opacity-45" />
src/components/CockpitHUD.tsx:220:          <line x1="28" y1="120" x2="34" y2="120" stroke={color} strokeWidth="1.5" className="opacity-45" />
src/components/CockpitHUD.tsx:221:          <line x1="206" y1="120" x2="212" y2="120" stroke={color} strokeWidth="1.5" className="opacity-45" />
src/components/CockpitHUD.tsx:224:          <circle cx="80" cy="80" r="1" fill={color} className="opacity-25" />
src/components/CockpitHUD.tsx:225:          <circle cx="160" cy="80" r="1" fill={color} className="opacity-25" />
src/components/CockpitHUD.tsx:226:          <circle cx="80" cy="160" r="1" fill={color} className="opacity-25" />
src/components/CockpitHUD.tsx:227:          <circle cx="160" cy="160" r="1" fill={color} className="opacity-25" />
src/components/CockpitHUD.tsx:230:          <text x="120" y="24" fill={color} fontSize="5" fontWeight="950" textAnchor="middle" className="font-mono opacity-50">𐎦𐎔 • 000° [K-VECT]</text>
src/components/CockpitHUD.tsx:231:          <text x="120" y="222" fill={color} fontSize="5" fontWeight="950" textAnchor="middle" className="font-mono opacity-50">𐎚𐎖 • 180° [Z-TRANS]</text>
src/components/CockpitHUD.tsx:232:          <text x="220" y="122" fill={color} fontSize="5" fontWeight="950" textAnchor="start" className="font-mono opacity-50">𐎟𐎀 • 090° [O-PLAN]</text>
src/components/CockpitHUD.tsx:233:          <text x="20" y="122" fill={color} fontSize="5" fontWeight="950" textAnchor="end" className="font-mono opacity-50">𐎖𐎔 • 270° [G-COEF]</text>
src/components/CockpitHUD.tsx:237:        <div className="absolute top-[35px] left-[-30px] flex flex-col items-start font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
src/components/CockpitHUD.tsx:238:          <span className="font-black leading-none">AIM_LOCK_A: ACTIVE</span>
src/components/CockpitHUD.tsx:239:          <span className="opacity-60 leading-tight">RANGE: {(2500 - telemetry.altitude * 0.1).toFixed(0)}m</span>
src/components/CockpitHUD.tsx:240:          <div className="flex gap-[1.5px] mt-1 h-1 items-end">
src/components/CockpitHUD.tsx:241:            <div className="w-[1.5px] h-full bg-current" style={{ backgroundColor: color }} />
src/components/CockpitHUD.tsx:242:            <div className="w-[1.5px] h-[60%] bg-current opacity-60" style={{ backgroundColor: color }} />
src/components/CockpitHUD.tsx:243:            <div className="w-[1.5px] h-[30%] bg-current opacity-30" style={{ backgroundColor: color }} />
src/components/CockpitHUD.tsx:244:            <div className="w-[1.5px] h-[90%] bg-current" style={{ backgroundColor: color }} />
src/components/CockpitHUD.tsx:248:        <div className="absolute top-[35px] right-[-30px] flex flex-col items-end font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
src/components/CockpitHUD.tsx:249:          <span className="font-black leading-none">SYS_ALIGN: {alignmentScore}%</span>
src/components/CockpitHUD.tsx:250:          <span className="opacity-60 leading-tight">CHRON_G_LOK: {telemetry.gateProgress}%</span>
src/components/CockpitHUD.tsx:251:          <span className="opacity-50 mt-1 uppercase">EST. 2100_VECTOR</span>
src/components/CockpitHUD.tsx:254:        <div className="absolute bottom-[35px] left-[-30px] flex flex-col items-start font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
src/components/CockpitHUD.tsx:255:          <span className="font-black leading-none">COR_TEMP // {coreTemp}°C</span>
src/components/CockpitHUD.tsx:256:          <div className="flex gap-0.5 mt-0.5 opacity-60">
src/components/CockpitHUD.tsx:257:            <span className="text-[5px]">SYS_MOD //</span>
src/components/CockpitHUD.tsx:258:            <span className="font-bold underline">ACTIVE</span>
src/components/CockpitHUD.tsx:262:        <div className="absolute bottom-[35px] right-[-30px] flex flex-col items-end font-mono text-[5.5px] scale-90 select-none opacity-70" style={{ color }}>
src/components/CockpitHUD.tsx:263:          <span className="font-black leading-none">FILT_EFF // {filterEffect}</span>
src/components/CockpitHUD.tsx:264:          <span className="opacity-50 mt-0.5 select-none text-[5px]">WINDSHIELD_SENS_LNK</span>
src/components/CockpitHUD.tsx:268:        <div className="absolute bottom-[-22px] w-[110px] scale-75 opacity-25">
src/components/CockpitHUD.tsx:269:          <div className="flex gap-[3px] overflow-hidden h-1">
src/components/CockpitHUD.tsx:271:              <div key={i} className="w-1 h-full skew-x-30 shrink-0" style={{ backgroundColor: color }} />
src/components/CockpitHUD.tsx:292:export const SAVANT_THEME_PRESETS: SavantPreset[] = [
src/components/CockpitHUD.tsx:495:export const CockpitHUD: React.FC = () => {
src/components/CockpitHUD.tsx:525:  const radarCanvasRef = useRef<HTMLCanvasElement>(null);
src/components/CockpitHUD.tsx:530:  useEffect(() => {
src/components/CockpitHUD.tsx:543:  useEffect(() => {
src/components/CockpitHUD.tsx:636:  useEffect(() => {
src/components/CockpitHUD.tsx:640:    window.addEventListener('mousemove', trackMouse);
src/components/CockpitHUD.tsx:699:  useEffect(() => {
src/components/CockpitHUD.tsx:797:    window.addEventListener('keydown', handleKeyPress);
src/components/CockpitHUD.tsx:988:  useEffect(() => {
src/components/CockpitHUD.tsx:1077:  useEffect(() => {
src/components/CockpitHUD.tsx:1182:      frameId = requestAnimationFrame(drawRadar);
src/components/CockpitHUD.tsx:1304:    <div id="active-cockpit-hud" className="absolute inset-0 w-full h-full font-mono pointer-events-none text-xs select-none z-10 overflow-hidden">
src/components/CockpitHUD.tsx:1313:            className="absolute inset-0 pointer-events-none z-10"
src/components/CockpitHUD.tsx:1317:              className="absolute left-3 top-20 bottom-3 w-[270px] border border-dashed flex flex-col items-center justify-center transition-all bg-sky-500/5 duration-200 animate-pulse"
src/components/CockpitHUD.tsx:1323:              <div className="flex flex-col items-center gap-1 scale-90 opacity-60">
src/components/CockpitHUD.tsx:1324:                <span className="text-[6.2px] tracking-[0.25em] font-black uppercase text-center" style={{ color: hudColor }}>DOCK LEFT AREA</span>
src/components/CockpitHUD.tsx:1325:                <span className="text-[5px] text-zinc-550 lowercase">snaps navigator & astromap panels</span>
src/components/CockpitHUD.tsx:1331:              className="absolute right-3 top-20 bottom-3 w-[270px] border border-dashed flex flex-col items-center justify-center transition-all bg-sky-500/5 duration-200 animate-pulse"
src/components/CockpitHUD.tsx:1337:              <div className="flex flex-col items-center gap-1 scale-90 opacity-60">
src/components/CockpitHUD.tsx:1338:                <span className="text-[6.2px] tracking-[0.25em] font-black uppercase text-center" style={{ color: hudColor }}>DOCK RIGHT AREA</span>
src/components/CockpitHUD.tsx:1339:                <span className="text-[5px] text-zinc-550 lowercase">snaps flight steering controls matrix</span>
src/components/CockpitHUD.tsx:1345:              className="absolute bottom-3 left-[285px] right-[285px] h-[190px] border border-dashed flex flex-col items-center justify-center transition-all bg-emerald-500/5 duration-200 animate-pulse"
src/components/CockpitHUD.tsx:1351:              <div className="flex flex-col items-center gap-1 scale-90 opacity-60">
src/components/CockpitHUD.tsx:1352:                <span className="text-[6.2px] tracking-[0.25em] font-black uppercase text-center" style={{ color: hudColor }}>TACTICAL WEAPONS DOCK CORE</span>
src/components/CockpitHUD.tsx:1353:                <span className="text-[5px] text-zinc-550 lowercase">snaps tactical armament systems deck</span>
src/components/CockpitHUD.tsx:1367:          className="absolute top-10 left-10 w-11 h-11 rounded-full border bg-[#020306]/92 p-2 pointer-events-auto flex items-center justify-center cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.95)] z-50 transition-all active:scale-95 hover:bg-neutral-900 border-dashed"
src/components/CockpitHUD.tsx:1375:          <Eye className="w-4 h-4 animate-pulse" />
src/components/CockpitHUD.tsx:1385:              className="absolute top-0 left-0 right-0 h-[28px] bg-[#020306]/98 border-b border-zinc-900 flex items-center justify-between px-3 z-50 text-[9px] text-zinc-400 font-mono select-none pointer-events-auto shadow-md"
src/components/CockpitHUD.tsx:1388:              <div className="flex items-center gap-4">
src/components/CockpitHUD.tsx:1391:                  className="font-black text-[10px] px-1 bg-zinc-900 rounded border hover:brightness-125 transition select-none flex items-center gap-1 cursor-pointer"
src/components/CockpitHUD.tsx:1399:                <div className="flex items-center gap-2 text-[8px] font-black">
src/components/CockpitHUD.tsx:1401:                  <div className="relative">
src/components/CockpitHUD.tsx:1404:                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'FILE' ? 'bg-zinc-800 text-white' : ''}`}
src/components/CockpitHUD.tsx:1414:                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
src/components/CockpitHUD.tsx:1419:                            className="w-full text-left px-2 py-1 text-zinc-350 hover:bg-zinc-900 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1422:                            <span className="opacity-40 font-mono">Ctrl+S</span>
src/components/CockpitHUD.tsx:1431:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-900 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1434:                            <span className="opacity-40 font-mono">Alt+R</span>
src/components/CockpitHUD.tsx:1452:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-910 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1455:                            <span className="opacity-40 font-mono">Ctrl+E</span>
src/components/CockpitHUD.tsx:1457:                          <div className="border-t border-zinc-900 my-0.5" />
src/components/CockpitHUD.tsx:1466:                            className="w-full text-left px-2 py-1 text-red-400 hover:bg-red-955/40 rounded flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1469:                            <span className="opacity-50">!]</span>
src/components/CockpitHUD.tsx:1477:                  <div className="relative">
src/components/CockpitHUD.tsx:1480:                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'EDIT' ? 'bg-zinc-800 text-white' : ''}`}
src/components/CockpitHUD.tsx:1490:                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
src/components/CockpitHUD.tsx:1495:                            className="w-full text-left px-2 py-1 text-zinc-350 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1498:                            <span className="opacity-80 text-amber-500 font-mono font-black">{isLayoutLocked ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1502:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1505:                            <span className="opacity-85 text-emerald-400 font-mono font-black">{isSnappingEnabled ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1514:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1517:                            <span className="opacity-40 font-mono">Alt+S</span>
src/components/CockpitHUD.tsx:1519:                          <div className="border-t border-zinc-900 my-0.5" />
src/components/CockpitHUD.tsx:1527:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1530:                            <span className="opacity-85 text-cyan-400 font-mono font-black">{isVentingActive ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1538:                  <div className="relative">
src/components/CockpitHUD.tsx:1541:                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'VIEW' ? 'bg-zinc-800 text-white' : ''}`}
src/components/CockpitHUD.tsx:1551:                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
src/components/CockpitHUD.tsx:1556:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1559:                            <span className="opacity-85 text-cyan-400 font-mono font-black">{isGridVisible ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1561:                          <div className="border-t border-zinc-910 my-0.5" />
src/components/CockpitHUD.tsx:1564:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1567:                            <span className="opacity-80 text-zinc-300 font-mono">{hudScale === 0.85 ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1571:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1574:                            <span className="opacity-80 text-zinc-300 font-mono">{hudScale === 1.0 ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1578:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1581:                            <span className="opacity-80 text-zinc-300 font-mono">{hudScale === 1.15 ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1589:                  <div className="relative">
src/components/CockpitHUD.tsx:1592:                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'WINDOW' ? 'bg-zinc-800 text-white' : ''}`}
src/components/CockpitHUD.tsx:1602:                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
src/components/CockpitHUD.tsx:1607:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1610:                            <span className="opacity-85 text-emerald-450 font-mono">{isNavOpen ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1614:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1617:                            <span className="opacity-85 text-emerald-450 font-mono">{isHelmOpen ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1621:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1624:                            <span className="opacity-85 text-emerald-450 font-mono">{isRadarOpen ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1628:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1631:                            <span className="opacity-85 text-emerald-450 font-mono">{isSynthesisOpen ? '✓' : ''}</span>
src/components/CockpitHUD.tsx:1633:                          <div className="border-t border-zinc-910 my-0.5" />
src/components/CockpitHUD.tsx:1640:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1643:                            <span className="opacity-40 font-mono">Alt+A</span>
src/components/CockpitHUD.tsx:1650:                            className="w-full text-left px-2 py-1 text-zinc-400 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1653:                            <span className="opacity-45 font-mono">Alt+C</span>
src/components/CockpitHUD.tsx:1661:                  <div className="relative">
src/components/CockpitHUD.tsx:1664:                      className={`px-2 py-0.5 rounded transition bg-transparent text-zinc-400 uppercase select-none hover:text-white ${activeDropdown === 'HELP' ? 'bg-zinc-800 text-white' : ''}`}
src/components/CockpitHUD.tsx:1674:                          className="absolute left-0 mt-1.5 w-44 bg-[#0a0b0e] border border-zinc-800 p-1 rounded shadow-2xl flex flex-col gap-0.5 z-50 text-[7px]"
src/components/CockpitHUD.tsx:1679:                            className="w-full text-left px-2 py-1 text-zinc-355 hover:bg-zinc-850 rounded hover:text-white flex items-center justify-between cursor-pointer"
src/components/CockpitHUD.tsx:1682:                            <span className="opacity-40 font-mono">F1</span>
src/components/CockpitHUD.tsx:1684:                          <div className="border-t border-zinc-910 my-0.5" />
src/components/CockpitHUD.tsx:1685:                          <div className="px-2 py-1 text-[5.5px] text-zinc-500 leading-normal">
src/components/CockpitHUD.tsx:1697:              <div className="flex items-center gap-3 text-[7px] border-l pl-3 border-zinc-800">
src/components/CockpitHUD.tsx:1698:                <span className="text-zinc-655 font-extrabold uppercase">ACTIVE PRESET:</span>
src/components/CockpitHUD.tsx:1699:                <span className="text-zinc-350 font-black tracking-widest uppercase" style={{ color: hudColor }}>{activePreset} EDITION</span>
src/components/CockpitHUD.tsx:1703:                  className="rounded px-2 py-0.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-700 hover:text-[#00f2ff] transition-all font-black text-zinc-300 cursor-pointer select-none text-[6.2px] flex items-center gap-1 uppercase"
src/components/CockpitHUD.tsx:1706:                  <Layers className="w-1.5 h-1.5" />
src/components/CockpitHUD.tsx:1712:                  className="rounded px-1 text-zinc-500 hover:text-red-400 bg-zinc-900 border border-zinc-800 hover:border-red-500/30 transition-all cursor-pointer select-none"
src/components/CockpitHUD.tsx:1715:                  <EyeOff className="w-2 h-2" />
src/components/CockpitHUD.tsx:1722:              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
src/components/CockpitHUD.tsx:1724:                <div className="absolute inset-0 flex flex-col justify-between opacity-[0.06]">
src/components/CockpitHUD.tsx:1726:                    <div key={`grid-h-${idx}`} className="w-full h-[1px] border-b border-dashed" style={{ borderColor: `${hudColor}` }} />
src/components/CockpitHUD.tsx:1730:                <div className="absolute inset-0 flex justify-between opacity-[0.06]">
src/components/CockpitHUD.tsx:1732:                    <div key={`grid-v-${idx}`} className="h-full w-[1px] border-r border-dashed" style={{ borderColor: `${hudColor}` }} />
src/components/CockpitHUD.tsx:1736:                <div className="absolute top-[28px] left-0 right-0 h-3 bg-zinc-950/70 border-b border-zinc-900/50 flex justify-between px-10 text-[5px] text-zinc-650 font-mono leading-none items-center self-center opacity-70">
src/components/CockpitHUD.tsx:1745:                <div className="absolute top-[40px] left-0 bottom-0 w-3 bg-zinc-950/70 border-r border-zinc-900/50 flex flex-col justify-between py-10 text-[5px] text-zinc-650 font-mono items-center opacity-70">
src/components/CockpitHUD.tsx:1757:              className="absolute top-24 left-3 w-[36px] bg-[#020306]/98 border border-zinc-900 rounded-lg flex flex-col items-center gap-1.5 py-3 pointer-events-auto z-40 shadow-[0_12px_45px_rgba(0,0,0,0.98)]"
src/components/CockpitHUD.tsx:1785:                    className={`group relative w-7 h-7 rounded flex items-center justify-center transition-all cursor-pointer ${
src/components/CockpitHUD.tsx:1793:                    <IconComponent className="w-3 h-3" />
src/components/CockpitHUD.tsx:1795:                    <span className="absolute bottom-0.5 right-0.5 text-[4px] leading-none text-zinc-650 font-extrabold group-hover:text-zinc-400 select-none">
src/components/CockpitHUD.tsx:1799:                    <div className="absolute left-10 scale-0 group-hover:scale-100 transition-all origin-left delay-500 bg-[#020306]/98 border border-zinc-800 rounded px-2 py-1 w-36 pointer-events-none text-left z-50 shadow-2xl flex flex-col gap-0.5">
src/components/CockpitHUD.tsx:1800:                      <span className="text-[6.5px] tracking-wide font-black uppercase" style={{ color: hudColor }}>
src/components/CockpitHUD.tsx:1803:                      <p className="text-[5.5px] text-zinc-400 leading-snug font-normal normal-case">
src/components/CockpitHUD.tsx:1815:                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 pointer-events-auto">
src/components/CockpitHUD.tsx:1820:                    className="w-[360px] bg-[#020306]/98 border rounded-xl overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.99)] font-mono flex flex-col"
src/components/CockpitHUD.tsx:1823:                    <div className="flex items-center justify-between px-3 py-2 border-b bg-zinc-950 border-zinc-900">
src/components/CockpitHUD.tsx:1824:                      <div className="flex items-center gap-1.5">
src/components/CockpitHUD.tsx:1825:                        <BookOpen className="w-3 h-3" style={{ color: hudColor }} />
src/components/CockpitHUD.tsx:1826:                        <span className="text-[7.2px] font-black tracking-widest text-zinc-300">COCKPIT_OS : HELPMAP</span>
src/components/CockpitHUD.tsx:1830:                        className="text-zinc-550 hover:text-white transition cursor-pointer"
src/components/CockpitHUD.tsx:1832:                        <X className="w-3 h-3" />
src/components/CockpitHUD.tsx:1836:                    <div className="p-3.5 flex flex-col gap-2 text-[6.8px] leading-relaxed text-zinc-300">
src/components/CockpitHUD.tsx:1837:                      <p className="text-zinc-500 border-b border-zinc-900 pb-0.5 mb-1 font-bold text-[5.8px]">
src/components/CockpitHUD.tsx:1841:                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-bold">
src/components/CockpitHUD.tsx:1842:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-550">ZOOM CANV:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>Z</kbd></div>
src/components/CockpitHUD.tsx:1843:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-550">EYEDROPPER:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>I</kbd></div>
src/components/CockpitHUD.tsx:1844:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-550">MOVE VIEW:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>V</kbd></div>
src/components/CockpitHUD.tsx:1845:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">SCAN PROB:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>S</kbd></div>
src/components/CockpitHUD.tsx:1846:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">LASER RETI:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>L</kbd></div>
src/components/CockpitHUD.tsx:1847:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">SPOTLIGHT:</span><kbd className="text-[#00f2ff] bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]" style={{ color: hudColor }}>O</kbd></div>
src/components/CockpitHUD.tsx:1848:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">SAVE WORK:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">Ctrl+S</kbd></div>
src/components/CockpitHUD.tsx:1849:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">GRID DRAW:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">Ctrl+'</kbd></div>
src/components/CockpitHUD.tsx:1850:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">HELP CHART:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">F1</kbd></div>
src/components/CockpitHUD.tsx:1851:                        <div className="flex justify-between border-b border-zinc-900/60 pb-0.5"><span className="text-zinc-555">STRESS SHAK:</span><kbd className="text-zinc-450 bg-zinc-900 border border-zinc-800 px-1 rounded-sm text-[5.5px]">Alt+S</kbd></div>
src/components/CockpitHUD.tsx:1854:                      <div className="mt-2 bg-black/60 p-2 rounded border border-zinc-900 flex flex-col gap-1 text-[5.8px]">
src/components/CockpitHUD.tsx:1855:                        <span className="font-extrabold uppercase" style={{ color: hudColor }}>CREATIVE ADOBE CONTROLS:</span>
src/components/CockpitHUD.tsx:1856:                        <p className="text-zinc-400 font-normal leading-normal">
src/components/CockpitHUD.tsx:1862:                    <div className="bg-zinc-950 py-2 border-t border-zinc-900 px-3 flex items-center justify-center">
src/components/CockpitHUD.tsx:1865:                        className="text-[6px] font-black tracking-widest px-4 py-1 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 hover:brightness-110 rounded cursor-pointer transition select-none text-white focus:outline-none"
src/components/CockpitHUD.tsx:1878:                <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50 pointer-events-auto select-none">
src/components/CockpitHUD.tsx:1883:                    className="w-[530px] max-w-full bg-[#020306]/98 border rounded-xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.99)] font-mono flex flex-col"
src/components/CockpitHUD.tsx:1887:                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b bg-zinc-950 border-zinc-900/60 select-none">
src/components/CockpitHUD.tsx:1888:                      <div className="flex items-center gap-2">
src/components/CockpitHUD.tsx:1889:                        <Layers className="w-3.5 h-3.5 animate-pulse" style={{ color: hudColor }} />
src/components/CockpitHUD.tsx:1890:                        <div className="flex flex-col">
src/components/CockpitHUD.tsx:1891:                          <span className="text-[7.6px] font-black tracking-[0.15em] text-white">SAVANT_BRAND // COGNITIVE PRESETS MATRIX</span>
src/components/CockpitHUD.tsx:1892:                          <span className="text-[4.5px] text-zinc-550 font-bold uppercase tracking-wider font-mono">BIOMEMBRANE CALIBRATION HUB • 20 INTERACTIVE OPTIONS</span>
src/components/CockpitHUD.tsx:1897:                        className="text-zinc-500 hover:text-white transition cursor-pointer"
src/components/CockpitHUD.tsx:1899:                        <X className="w-3.5 h-3.5" />
src/components/CockpitHUD.tsx:1904:                    <div className="p-4 flex flex-col gap-3 overflow-y-auto max-h-[380px] scrollbar-thin">
src/components/CockpitHUD.tsx:1905:                      <p className="text-zinc-550 leading-relaxed text-[5.8px] border-b border-zinc-900/60 pb-1.5 uppercase font-bold">
src/components/CockpitHUD.tsx:1909:                      <div className="grid grid-cols-5 gap-2">
src/components/CockpitHUD.tsx:1926:                              className={`relative p-2 rounded-lg border text-left cursor-pointer transition-all duration-150 flex flex-col justify-between h-[64px] group ${
src/components/CockpitHUD.tsx:1938:                                className="absolute top-1 right-1.5 text-[5.5px] font-black tracking-widest opacity-80"
src/components/CockpitHUD.tsx:1945:                                <span className="text-[5.5px] text-zinc-500 font-extrabold block uppercase leading-none group-hover:text-zinc-400">
src/components/CockpitHUD.tsx:1948:                                <span className="text-[6.5px] text-zinc-200 font-black tracking-tight block truncate mt-0.5" style={{ color: isActive ? preset.primary : undefined }}>
src/components/CockpitHUD.tsx:1954:                              <div className="flex gap-1 items-center mt-1">
src/components/CockpitHUD.tsx:1955:                                <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ backgroundColor: preset.primary }} />
src/components/CockpitHUD.tsx:1956:                                <span className="w-1.5 h-1.5 rounded-full shrink-0 opacity-40" style={{ backgroundColor: preset.secondary }} />
src/components/CockpitHUD.tsx:1958:                                  <span className="text-[4px] font-black uppercase text-zinc-400 ml-auto leading-none">ACTIVE</span>
src/components/CockpitHUD.tsx:1970:                          <div className="mt-2 bg-zinc-950 p-3 rounded-lg border border-zinc-900 flex gap-3.5 items-center">
src/components/CockpitHUD.tsx:1973:                              className="w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm select-none shrink-0" 
src/components/CockpitHUD.tsx:1978:                            <div className="flex flex-col gap-0.5 leading-normal">
src/components/CockpitHUD.tsx:1979:                              <span className="text-[5px] text-zinc-500 font-black uppercase font-mono">CURRENT SECTOR SPECTRAL RESOLUTION:</span>
src/components/CockpitHUD.tsx:1980:                              <span className="text-[7.5px] font-black uppercase tracking-wider text-white" style={{ color: currentPreset.primary }}>
src/components/CockpitHUD.tsx:1983:                              <p className="text-[6.2px] text-zinc-400 font-normal leading-relaxed">
src/components/CockpitHUD.tsx:1993:                    <div className="bg-zinc-950 py-2.5 border-t border-zinc-900/60 px-4 flex items-center justify-between">
src/components/CockpitHUD.tsx:1994:                      <div className="flex gap-1.5 items-center text-[5px] text-zinc-500 font-bold uppercase select-none font-mono">
src/components/CockpitHUD.tsx:2001:                        className="text-[6.2px] font-black tracking-widest px-4 py-1.5 bg-zinc-900 border hover:bg-zinc-800 hover:brightness-110 rounded cursor-pointer transition select-none text-white focus:outline-none uppercase"
src/components/CockpitHUD.tsx:2013:            <div className="absolute top-[38px] left-1/2 -translate-x-1/2 pointer-events-auto z-40 flex items-center gap-3">
src/components/CockpitHUD.tsx:2015:                className="bg-[#020306]/95 border px-4 py-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex items-center gap-4 font-mono text-[7px]"
src/components/CockpitHUD.tsx:2022:                <div className="flex items-center gap-1.5 border-r pr-3 border-zinc-800 shrink-0">
src/components/CockpitHUD.tsx:2023:                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
src/components/CockpitHUD.tsx:2024:                  <span className="text-zinc-400 font-extrabold uppercase select-none tracking-widest text-[5.8px] mr-1">SYS_ONLINE</span>
src/components/CockpitHUD.tsx:2027:                  <div className="flex gap-1 items-center bg-zinc-950 px-1.5 py-0.5 rounded-md border border-zinc-900 leading-none">
src/components/CockpitHUD.tsx:2028:                    <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse shadow-[0_0_4px_#ef4444]" style={{ animationDuration: '0.9s' }} />
src/components/CockpitHUD.tsx:2029:                    <span className="w-1 h-1 rounded-full bg-orange-400 animate-pulse shadow-[0_0_4px_#fb923c]" style={{ animationDuration: '1.3s' }} />
src/components/CockpitHUD.tsx:2030:                    <span className="w-1 h-1 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_4px_#facc15]" style={{ animationDuration: '0.7s' }} />
src/components/CockpitHUD.tsx:2031:                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_4px_#34d399]" style={{ animationDuration: '1.5s' }} />
src/components/CockpitHUD.tsx:2032:                    <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_4px_#22d3ee]" style={{ animationDuration: '1.1s' }} />
src/components/CockpitHUD.tsx:2037:                <div className="flex items-center gap-1.5 matches-desktop">
src/components/CockpitHUD.tsx:2038:                  <span className="text-zinc-550 font-bold uppercase select-none text-[5.8px]">WORKSPACE:</span>
src/components/CockpitHUD.tsx:2048:                    className="bg-black/95 text-[6px] px-2 py-0.5 font-mono font-black border uppercase rounded-full hover:bg-zinc-950 cursor-pointer pointer-events-auto outline-none transition-all mr-1"
src/components/CockpitHUD.tsx:2061:                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer font-black uppercase text-[5.8px] ${
src/components/CockpitHUD.tsx:2067:                    {isLayoutLocked ? <Lock className="w-2 h-2" /> : <Unlock className="w-2 h-2" />}
src/components/CockpitHUD.tsx:2073:                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all cursor-pointer font-black uppercase text-[5.8px] bg-zinc-950/60 relative text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/30 ${
src/components/CockpitHUD.tsx:2077:                    <Save className="w-2 h-2" />
src/components/CockpitHUD.tsx:2083:                <div className="flex items-center gap-1 border-l pl-3 border-zinc-800">
src/components/CockpitHUD.tsx:2084:                  <span className="text-zinc-550 font-bold uppercase select-none text-[5.8px]">PANELS:</span>
src/components/CockpitHUD.tsx:2087:                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isNavOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
src/components/CockpitHUD.tsx:2091:                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isHelmOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
src/components/CockpitHUD.tsx:2095:                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isSynthesisOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
src/components/CockpitHUD.tsx:2099:                    className={`px-1.5 py-0.5 rounded text-[5.5px] font-black uppercase border transition-all cursor-pointer ${isRadarOpen ? 'border-emerald-555/30 text-emerald-405 bg-emerald-500/10' : 'border-zinc-800 text-zinc-600 bg-transparent'}`}
src/components/CockpitHUD.tsx:2104:                <div className="flex items-center gap-2 border-l pl-3 border-zinc-800">
src/components/CockpitHUD.tsx:2105:                  <span className="text-zinc-550 font-bold uppercase text-[5.8px]">OPTICS_MODEM:</span>
src/components/CockpitHUD.tsx:2106:                  <div className="flex gap-1">
src/components/CockpitHUD.tsx:2121:                          className={`px-2 py-0.5 rounded text-[5.5px] border cursor-pointer font-extrabold transition-all duration-150 ${
src/components/CockpitHUD.tsx:2136:                <div className="flex items-center gap-2 border-l pl-3 border-zinc-800">
src/components/CockpitHUD.tsx:2137:                  <span className="text-zinc-550 font-bold uppercase text-[5.8px]">SPECTRA_FILT:</span>
src/components/CockpitHUD.tsx:2138:                  <div className="flex gap-1">
src/components/CockpitHUD.tsx:2148:                          className={`px-2 py-0.5 rounded text-[5.5px] border cursor-pointer font-extrabold transition-all duration-150 ${
src/components/CockpitHUD.tsx:2172:              className="absolute inset-0 pointer-events-none z-20"
src/components/CockpitHUD.tsx:2177:              <div className="absolute top-24 left-6 pointer-events-none z-20">
src/components/CockpitHUD.tsx:2188:                    requestAnimationFrame(() => {
src/components/CockpitHUD.tsx:2197:                  className="border rounded-[12px] p-2 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex flex-col gap-1.5 font-mono relative transition-shadow duration-200"
src/components/CockpitHUD.tsx:2222:                    className="flex flex-col gap-1 border-b pb-1 select-none cursor-pointer" 
src/components/CockpitHUD.tsx:2226:                    <div className="flex items-center justify-between text-[7px] leading-none">
src/components/CockpitHUD.tsx:2227:                      <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
src/components/CockpitHUD.tsx:2228:                        <Navigation className="w-2.5 h-2.5 animate-pulse text-cyan-400" />
src/components/CockpitHUD.tsx:2232:                      <div className="flex items-center gap-1.5">
src/components/CockpitHUD.tsx:2234:                        <div className="flex items-center gap-1 text-[5.8px] bg-zinc-950/85 px-1 py-0.5 rounded border border-zinc-900 leading-none">
src/components/CockpitHUD.tsx:2235:                          <Layers className="w-2 h-2 text-zinc-500" />
src/components/CockpitHUD.tsx:2236:                          <span className="text-zinc-400 font-bold">OPAC:</span>
src/components/CockpitHUD.tsx:2237:                          <span style={{ color: hudColor }} className="font-black">{Math.round(navOpacity * 100)}%</span>
src/components/CockpitHUD.tsx:2247:                          className={`p-0.5 rounded transition-all cursor-pointer ${navPinned ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-zinc-550 hover:bg-zinc-900 border border-transparent'}`}
src/components/CockpitHUD.tsx:2250:                          {navPinned ? <Pin className="w-2.5 h-2.5" /> : <PinOff className="w-2.5 h-2.5" />}
src/components/CockpitHUD.tsx:2260:                          className={`p-0.5 rounded hover:bg-zinc-900 border border-transparent transition-all cursor-pointer text-zinc-500`}
src/components/CockpitHUD.tsx:2263:                          <ChevronsUpDown className="w-2.5 h-2.5 text-cyan-500" />
src/components/CockpitHUD.tsx:2273:                          className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all cursor-pointer flex items-center justify-center"
src/components/CockpitHUD.tsx:2276:                          <X className="w-2.5 h-2.5" />
src/components/CockpitHUD.tsx:2282:                    <div className="flex items-center gap-1.5 mt-0.5 px-0.5">
src/components/CockpitHUD.tsx:2283:                      <span className="text-[5px] text-zinc-500 font-bold">ALPHA:</span>
src/components/CockpitHUD.tsx:2291:                        className="flex-grow h-[3px] rounded-full appearance-none cursor-pointer bg-zinc-800 focus:outline-none"
src/components/CockpitHUD.tsx:2302:                    <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
src/components/CockpitHUD.tsx:2304:                      <div className="flex bg-zinc-950/80 p-0.5 rounded-md border border-zinc-900/60 items-stretch" style={{ gap: '1px' }}>
src/components/CockpitHUD.tsx:2318:                              className={`flex-1 text-center py-1 rounded text-[5px] font-black uppercase transition-all duration-150 cursor-pointer ${
src/components/CockpitHUD.tsx:2333:                        <div className="flex flex-col gap-1.5">
src/components/CockpitHUD.tsx:2335:                          <div className="grid grid-cols-2 gap-1.5 mt-0.5">
src/components/CockpitHUD.tsx:2336:                            <div className="bg-zinc-950/80 p-1 rounded border border-zinc-900/40 flex flex-col justify-center">
src/components/CockpitHUD.tsx:2337:                              <span className="text-[5px] text-zinc-550 font-bold uppercase">VELOCITY</span>
src/components/CockpitHUD.tsx:2338:                              <span className="text-[9.5px] font-black text-white" style={{ textShadow: `0 0 4px ${hudColor}33`, color: hudColor }}>
src/components/CockpitHUD.tsx:2339:                                {telemetry.velocity} <span className="text-[6px] font-medium text-zinc-500">km/h</span>
src/components/CockpitHUD.tsx:2342:                            <div className="bg-zinc-950/80 p-1 rounded border border-zinc-900/40 flex flex-col justify-center relative">
src/components/CockpitHUD.tsx:2343:                              <span className="absolute top-1 right-1 flex h-1 w-1">
src/components/CockpitHUD.tsx:2344:                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
src/components/CockpitHUD.tsx:2345:                                <span className="relative inline-flex rounded-full h-1 w-1 bg-cyan-500"></span>
src/components/CockpitHUD.tsx:2347:                              <span className="text-[5px] text-zinc-550 font-bold uppercase">ALTITUDE</span>
src/components/CockpitHUD.tsx:2348:                              <span className="text-[9.5px] font-black text-zinc-300">
src/components/CockpitHUD.tsx:2349:                                {telemetry.altitude} <span className="text-[6px] font-medium text-zinc-500">m</span>
src/components/CockpitHUD.tsx:2355:                          <div className="bg-zinc-950/80 p-1.5 rounded border border-zinc-900/40 flex flex-col gap-1">
src/components/CockpitHUD.tsx:2356:                            <div className="flex justify-between items-center text-[6px] leading-none">
src/components/CockpitHUD.tsx:2357:                              <span className="text-zinc-500 font-extrabold uppercase">PORTAL TRANSIT GATE {telemetry.currentGate}/5</span>
src/components/CockpitHUD.tsx:2358:                              <span className="font-bold" style={{ color: hudColor }}>{telemetry.gateProgress}%</span>
src/components/CockpitHUD.tsx:2360:                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
src/components/CockpitHUD.tsx:2362:                                className="h-full transition-all duration-300 rounded-full"
src/components/CockpitHUD.tsx:2369:                          <div className="flex items-center gap-2 mt-0.5 pt-1.5 border-t border-zinc-900/40 font-mono">
src/components/CockpitHUD.tsx:2370:                            <div className="relative w-10 h-10 rounded-full border border-zinc-900/40 bg-zinc-950 p-[1px] flex items-center justify-center shrink-0">
src/components/CockpitHUD.tsx:2371:                              <span className="absolute top-[1.2px] text-[4px] uppercase font-bold text-zinc-500 scale-90 leading-none select-none">RADAR</span>
src/components/CockpitHUD.tsx:2376:                                className="w-[38px] h-[38px] rounded-full block"
src/components/CockpitHUD.tsx:2379:                            <div className="flex-1 flex flex-col justify-center text-[6px] leading-tight h-full justify-around font-mono">
src/components/CockpitHUD.tsx:2380:                              <span className="text-zinc-400 font-extrabold uppercase text-[5.8px]">SWEEP RADAR SENSOR</span>
src/components/CockpitHUD.tsx:2381:                              <span className="text-zinc-650">NEURAL CHRONOS SCAN DISTANCE</span>
src/components/CockpitHUD.tsx:2386:                          <div className="mt-1 pt-1.5 border-t border-zinc-900/40">
src/components/CockpitHUD.tsx:2399:                          className="flex flex-col bg-zinc-950/92 rounded border border-zinc-900/70 p-1.5 overflow-hidden relative"
src/components/CockpitHUD.tsx:2402:                          <span className="text-[5px] text-zinc-550 font-black tracking-widest uppercase border-b border-zinc-900 pb-1 flex items-center justify-between">
src/components/CockpitHUD.tsx:2404:                            <span className="animate-pulse text-emerald-400">● LOGGING</span>
src/components/CockpitHUD.tsx:2407:                          <div className="flex-grow overflow-y-auto mt-1 flex flex-col gap-0.5 pr-0.5 custom-scrollbar select-text">
src/components/CockpitHUD.tsx:2409:                              <span className="text-[5.5px] text-zinc-650 italic">Listening for telemetry transmission...</span>
src/components/CockpitHUD.tsx:2412:                                <div key={i} className="text-[5.5px] font-mono leading-[1.3] text-zinc-400 border-b border-zinc-950 py-0.5 last:border-0 hover:text-white">
src/components/CockpitHUD.tsx:2423:                        <div className="flex flex-col gap-2 bg-zinc-950/80 p-1.5 rounded border border-zinc-900/40">
src/components/CockpitHUD.tsx:2425:                          <div className="flex flex-col gap-0.5 select-none text-[5.5px]">
src/components/CockpitHUD.tsx:2426:                            <span className="text-zinc-500 font-bold uppercase">ALCHEMIC CORE GEOLOGY THEME:</span>
src/components/CockpitHUD.tsx:2437:                              className="bg-black text-[6px] p-1 font-mono font-black border uppercase rounded hover:bg-zinc-900 cursor-pointer pointer-events-auto outline-none transition-all"
src/components/CockpitHUD.tsx:2450:                          <div className="flex flex-col gap-1 select-none text-[5.5px]">
src/components/CockpitHUD.tsx:2451:                            <span className="text-zinc-550 font-bold uppercase flex items-center justify-between">
src/components/CockpitHUD.tsx:2453:                              <span className="text-[4.5px] opacity-60">Eyedropper (I)</span>
src/components/CockpitHUD.tsx:2455:                            <div className="grid grid-cols-3 gap-1">
src/components/CockpitHUD.tsx:2473:                                    className={`flex items-center gap-1 p-0.5 rounded border hover:bg-zinc-900 transition text-left cursor-pointer border-transparent ${
src/components/CockpitHUD.tsx:2479:                                    <span className="w-2.5 h-2.5 rounded-sm shrink-0 shadow-sm" style={{ backgroundColor: sw.value }} />
src/components/CockpitHUD.tsx:2480:                                    <span className="text-[4.8px] truncate text-zinc-400 uppercase font-black" style={{ color: active ? sw.value : undefined }}>
src/components/CockpitHUD.tsx:2490:                          <div className="flex flex-col gap-0.5 select-none text-[5.5px]">
src/components/CockpitHUD.tsx:2491:                            <span className="text-zinc-500 font-bold uppercase">INTEGRATED OPTICS FILTER:</span>
src/components/CockpitHUD.tsx:2492:                            <div className="grid grid-cols-4 gap-0.5">
src/components/CockpitHUD.tsx:2507:                                    className={`py-0.5 rounded text-[5px] border cursor-pointer font-extrabold transition-all duration-150 ${
src/components/CockpitHUD.tsx:2522:                          <div className="flex flex-col gap-0.5 select-none text-[5.5px]">
src/components/CockpitHUD.tsx:2523:                            <span className="text-zinc-550 font-bold uppercase">SPECTRA ATMOSPHERE:</span>
src/components/CockpitHUD.tsx:2524:                            <div className="grid grid-cols-5 gap-0.5">
src/components/CockpitHUD.tsx:2534:                                    className={`py-0.5 rounded text-[4.2px] border cursor-pointer font-extrabold transition-all duration-150 ${
src/components/CockpitHUD.tsx:2555:                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
src/components/CockpitHUD.tsx:2580:                        document.addEventListener('mousemove', handleMouseMove);
src/components/CockpitHUD.tsx:2581:                        document.addEventListener('mouseup', handleMouseUp);
src/components/CockpitHUD.tsx:2585:                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
src/components/CockpitHUD.tsx:2595:              <div className="absolute top-24 right-6 pointer-events-none z-20">
src/components/CockpitHUD.tsx:2606:                    requestAnimationFrame(() => {
src/components/CockpitHUD.tsx:2615:                  className="border rounded-[12px] p-2 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex flex-col gap-1.5 font-mono relative transition-shadow duration-200"
src/components/CockpitHUD.tsx:2640:                    className="flex flex-col gap-1 border-b pb-1 select-none cursor-pointer" 
src/components/CockpitHUD.tsx:2644:                    <div className="flex items-center justify-between text-[7px] leading-none text-zinc-400 font-bold">
src/components/CockpitHUD.tsx:2645:                      <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
src/components/CockpitHUD.tsx:2646:                        <SlidersHorizontal className="w-2.5 h-2.5 text-cyan-400" />
src/components/CockpitHUD.tsx:2650:                      <div className="flex items-center gap-1.5">
src/components/CockpitHUD.tsx:2652:                        <div className="flex items-center gap-1 text-[5.8px] bg-zinc-950/85 px-1 py-0.5 rounded border border-zinc-900 leading-none">
src/components/CockpitHUD.tsx:2653:                          <Layers className="w-2 h-2 text-zinc-500" />
src/components/CockpitHUD.tsx:2654:                          <span className="text-zinc-400 font-bold">OPAC:</span>
src/components/CockpitHUD.tsx:2655:                          <span style={{ color: hudColor }} className="font-black">{Math.round(helmOpacity * 100)}%</span>
src/components/CockpitHUD.tsx:2665:                          className={`p-0.5 rounded transition-all cursor-pointer ${helmPinned ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-zinc-550 hover:bg-zinc-900 border border-transparent'}`}
src/components/CockpitHUD.tsx:2668:                          {helmPinned ? <Pin className="w-2.5 h-2.5" /> : <PinOff className="w-2.5 h-2.5" />}
src/components/CockpitHUD.tsx:2678:                          className={`p-0.5 rounded hover:bg-zinc-900 border border-transparent transition-all cursor-pointer text-zinc-500`}
src/components/CockpitHUD.tsx:2681:                          <ChevronsUpDown className="w-2.5 h-2.5 text-cyan-500" />
src/components/CockpitHUD.tsx:2691:                          className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all cursor-pointer flex items-center justify-center flex-shrink-0"
src/components/CockpitHUD.tsx:2694:                          <X className="w-2.5 h-2.5" />
src/components/CockpitHUD.tsx:2700:                    <div className="flex items-center gap-1.5 mt-0.5 px-0.5">
src/components/CockpitHUD.tsx:2701:                      <span className="text-[5px] text-zinc-500 font-bold">ALPHA:</span>
src/components/CockpitHUD.tsx:2709:                        className="flex-grow h-[3px] rounded-full appearance-none cursor-pointer bg-zinc-800 focus:outline-none"
src/components/CockpitHUD.tsx:2720:                    <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
src/components/CockpitHUD.tsx:2722:                      <div className="flex bg-zinc-950/80 p-0.5 rounded-md border border-zinc-900/60 items-stretch" style={{ gap: '1px' }}>
src/components/CockpitHUD.tsx:2735:                              className={`flex-1 text-center py-1 rounded text-[5px] font-black uppercase transition-all duration-150 cursor-pointer ${
src/components/CockpitHUD.tsx:2750:                        <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
src/components/CockpitHUD.tsx:2752:                          <div className="flex flex-col gap-0.5">
src/components/CockpitHUD.tsx:2753:                            <span className="text-[5px] text-zinc-500 font-bold uppercase font-mono">NAVIGATION MODE:</span>
src/components/CockpitHUD.tsx:2754:                            <div className="grid grid-cols-2 gap-1.5">
src/components/CockpitHUD.tsx:2767:                                    className={`py-1 rounded text-[5.2px] font-black tracking-wider border cursor-pointer uppercase transition-all ${
src/components/CockpitHUD.tsx:2779:                            <div className="mt-1 text-[4.3px] uppercase font-sans tracking-tight leading-tight select-none">
src/components/CockpitHUD.tsx:2781:                                <div className="text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-1 rounded animate-pulse">
src/components/CockpitHUD.tsx:2785:                                <div className="text-amber-400 bg-amber-950/20 border border-amber-900/30 p-1 rounded">
src/components/CockpitHUD.tsx:2793:                          <div className="flex flex-col bg-zinc-950/80 p-1 rounded border border-zinc-900/40 gap-0.5 mt-0.5">
src/components/CockpitHUD.tsx:2794:                            <div className="flex justify-between items-center text-[5.2px]">
src/components/CockpitHUD.tsx:2795:                              <span className="text-zinc-500 font-bold uppercase">THRUSTER SENSITIVITY:</span>
src/components/CockpitHUD.tsx:2796:                              <span style={{ color: hudColor }} className="font-extrabold">{telemetry.thrusterSensitivity.toFixed(1)}x</span>
src/components/CockpitHUD.tsx:2807:                              className="w-full h-1 rounded bg-zinc-800 appearance-none cursor-pointer focus:outline-none"
src/components/CockpitHUD.tsx:2815:                          <div className="flex flex-col gap-1 bg-zinc-950/85 p-1.5 rounded border border-zinc-900/40">
src/components/CockpitHUD.tsx:2816:                            <div className="flex justify-between items-center text-[5.8px]">
src/components/CockpitHUD.tsx:2817:                              <span className="text-zinc-500 font-bold uppercase">ATMOSPHERIC PLASMA SHIELDS:</span>
src/components/CockpitHUD.tsx:2818:                              <span className="font-black text-amber-400">{Math.round(telemetry.shieldCap)}%</span>
src/components/CockpitHUD.tsx:2820:                            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden relative">
src/components/CockpitHUD.tsx:2822:                                className="h-full transition-all duration-300 rounded-full"
src/components/CockpitHUD.tsx:2833:                          <div className="flex justify-between items-center bg-zinc-950/70 p-1 rounded border border-zinc-900/40 text-[5px] font-extrabold text-zinc-500 uppercase leading-none mt-0.5">
src/components/CockpitHUD.tsx:2835:                            <span className="text-emerald-400 font-extrabold">SECURE [100%]</span>
src/components/CockpitHUD.tsx:2842:                        <div className="flex flex-col gap-1.5 animate-[fadeIn_0.15s_ease-out]">
src/components/CockpitHUD.tsx:2845:                          <div className="flex flex-col items-center justify-center p-2 relative bg-zinc-950/65 rounded-[10px] border border-zinc-900/40 gap-1 select-none">
src/components/CockpitHUD.tsx:2846:                            <div className="absolute top-1 left-2 text-[4.5px] text-zinc-500 font-black uppercase tracking-wider">HOLO-DRIFT STICK</div>
src/components/CockpitHUD.tsx:2847:                            <div className="absolute top-1 right-2 text-[4.5px] text-zinc-555 font-bold uppercase font-mono">{isDragging ? "ENGAGED" : "CENTER_PIN"}</div>
src/components/CockpitHUD.tsx:2851:                              className="relative w-20 h-20 rounded-full border border-dashed flex items-center justify-center cursor-crosshair select-none overflow-hidden touch-none"
src/components/CockpitHUD.tsx:2883:                              <div className="absolute inset-x-0 h-[1px] border-t border-dotted opacity-20" style={{ borderColor: hudColor }} />
src/components/CockpitHUD.tsx:2884:                              <div className="absolute inset-y-0 w-[1px] border-l border-dotted opacity-20" style={{ borderColor: hudColor }} />
src/components/CockpitHUD.tsx:2887:                              <div className="absolute w-12 h-12 rounded-full border border-dotted opacity-10" style={{ borderColor: hudColor }} />
src/components/CockpitHUD.tsx:2888:                              <div className="absolute w-6 h-6 rounded-full border border-dotted opacity-15" style={{ borderColor: hudColor }} />
src/components/CockpitHUD.tsx:2892:                                <svg className="absolute inset-0 w-full h-full pointer-events-none">
src/components/CockpitHUD.tsx:2908:                                className="absolute w-6 h-6 rounded-full flex items-center justify-center border shadow-xl cursor-default"
src/components/CockpitHUD.tsx:2919:                                <span className="text-[6px] font-black pointer-events-none select-none">𐎟</span>
src/components/CockpitHUD.tsx:2924:                            <div className="flex gap-1.5 mt-0.5 select-none text-[5px] font-extrabold text-zinc-550 items-center font-mono">
src/components/CockpitHUD.tsx:2926:                              <span className="opacity-30">•</span>
src/components/CockpitHUD.tsx:2932:                          <div className="flex gap-1 border-t border-zinc-900 pt-1">
src/components/CockpitHUD.tsx:2937:                                className="flex-grow py-1 px-1 text-black font-extrabold text-[#020306] text-center text-[7px] rounded-md cursor-pointer uppercase transition-all animate-pulse"
src/components/CockpitHUD.tsx:2942:                              <div className="flex flex-col gap-1 flex-grow">
src/components/CockpitHUD.tsx:2943:                                <span className="text-[5px] text-zinc-500 font-black uppercase tracking-wider text-center leading-none">WARP INJECTOR POWER</span>
src/components/CockpitHUD.tsx:2944:                                <div className="flex gap-1 justify-stretch w-full">
src/components/CockpitHUD.tsx:2948:                                    className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 text-[5.8px] font-bold text-center rounded bg-[#102d1a] border border-[#1b5e34]/50 text-[#4af28b] cursor-pointer transition-all active:scale-95 ${
src/components/CockpitHUD.tsx:2953:                                    <span className="text-[4.2px] font-bold opacity-80">{Math.floor(warpEnergy.low)}%</span>
src/components/CockpitHUD.tsx:2958:                                    className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 text-[5.8px] font-bold text-center rounded bg-[#2e1c0c] border border-[#523314]/50 text-[#ffa23a] cursor-pointer transition-all active:scale-95 ${
src/components/CockpitHUD.tsx:2963:                                    <span className="text-[4.2px] font-bold opacity-80">{Math.floor(warpEnergy.med)}%</span>
src/components/CockpitHUD.tsx:2968:                                    className={`flex-1 flex flex-col items-center justify-center py-1 px-0.5 text-[5.8px] font-bold text-center rounded bg-[#330f12] border border-[#591b20]/50 text-[#ff5f65] cursor-pointer transition-all active:scale-95 ${
src/components/CockpitHUD.tsx:2973:                                    <span className="text-[4.2px] font-bold opacity-80">{Math.floor(warpEnergy.high)}%</span>
src/components/CockpitHUD.tsx:2987:                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
src/components/CockpitHUD.tsx:3012:                        document.addEventListener('mousemove', handleMouseMove);
src/components/CockpitHUD.tsx:3013:                        document.addEventListener('mouseup', handleMouseUp);
src/components/CockpitHUD.tsx:3017:                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
src/components/CockpitHUD.tsx:3028:              <div className="absolute top-[380px] left-6 pointer-events-none z-20">
src/components/CockpitHUD.tsx:3039:                    requestAnimationFrame(() => {
src/components/CockpitHUD.tsx:3048:                  className="border rounded-[12px] p-2 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.95)] flex flex-col gap-1.5 font-mono relative transition-shadow duration-200"
src/components/CockpitHUD.tsx:3073:                    className="flex flex-col gap-1 border-b pb-1 select-none cursor-pointer" 
src/components/CockpitHUD.tsx:3077:                    <div className="flex items-center justify-between text-[7px] leading-none">
src/components/CockpitHUD.tsx:3078:                      <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
src/components/CockpitHUD.tsx:3079:                        <Compass className="w-2.5 h-2.5 animate-spin text-cyan-400" />
src/components/CockpitHUD.tsx:3083:                      <div className="flex items-center gap-1.5">
src/components/CockpitHUD.tsx:3085:                        <div className="flex items-center gap-1 text-[5.8px] bg-zinc-950/85 px-1 py-0.5 rounded border border-zinc-900 leading-none">
src/components/CockpitHUD.tsx:3086:                          <Layers className="w-2 h-2 text-zinc-500" />
src/components/CockpitHUD.tsx:3087:                          <span className="text-zinc-400 font-bold">OPAC:</span>
src/components/CockpitHUD.tsx:3088:                          <span style={{ color: hudColor }} className="font-black">{Math.round(radarOpacity * 100)}%</span>
src/components/CockpitHUD.tsx:3098:                          className={`p-0.5 rounded transition-all cursor-pointer ${radarPinned ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 'text-zinc-550 hover:bg-zinc-900 border border-transparent'}`}
src/components/CockpitHUD.tsx:3101:                          {radarPinned ? <Pin className="w-2.5 h-2.5 text-amber-500" /> : <PinOff className="w-2.5 h-2.5" />}
src/components/CockpitHUD.tsx:3111:                          className={`p-0.5 rounded hover:bg-zinc-900 border border-transparent transition-all cursor-pointer text-zinc-500`}
src/components/CockpitHUD.tsx:3114:                          <ChevronsUpDown className="w-2.5 h-2.5 text-[#00f2ff]" style={{ color: hudColor }} />
src/components/CockpitHUD.tsx:3124:                          className="p-0.5 rounded text-zinc-650 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-all cursor-pointer"
src/components/CockpitHUD.tsx:3126:                          <X className="w-2.5 h-2.5" />
src/components/CockpitHUD.tsx:3132:                    <div className="flex items-center gap-1.5 mt-1 select-none pointer-events-auto" onClick={e => e.stopPropagation()}>
src/components/CockpitHUD.tsx:3133:                      <span className="text-[5px] text-zinc-550 uppercase">HUD_MATT_ALPHA:</span>
src/components/CockpitHUD.tsx:3141:                        className="w-full h-1 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-500 focus:outline-none"
src/components/CockpitHUD.tsx:3149:                    <div className="flex flex-col gap-1.5 mt-1">
src/components/CockpitHUD.tsx:3163:                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
src/components/CockpitHUD.tsx:3188:                        document.addEventListener('mousemove', handleMouseMove);
src/components/CockpitHUD.tsx:3189:                        document.addEventListener('mouseup', handleMouseUp);
src/components/CockpitHUD.tsx:3193:                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
src/components/CockpitHUD.tsx:3204:              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 pointer-events-none z-30">
src/components/CockpitHUD.tsx:3215:                    requestAnimationFrame(() => {
src/components/CockpitHUD.tsx:3228:                  className="bg-[#020306]/92 border rounded-t-[18px] rounded-b-[10px] p-2.5 pointer-events-auto shadow-[0_12px_45px_rgba(0,0,0,0.98)] flex flex-col gap-1.5 font-mono cursor-grab active:cursor-grabbing"
src/components/CockpitHUD.tsx:3243:                  <div className="flex items-center justify-between border-b pb-1 text-[7.5px] leading-none text-zinc-400" style={{ borderColor: `${hudColor}20` }}>
src/components/CockpitHUD.tsx:3244:                    <span className="font-extrabold tracking-widest flex items-center gap-1" style={{ color: hudColor }}>
src/components/CockpitHUD.tsx:3245:                      <Target className="w-2.5 h-2.5 animate-pulse text-red-500" />
src/components/CockpitHUD.tsx:3246:                      Weapons Matrix System <span className="text-[5.5px] font-normal opacity-60 tracking-normal select-none font-sans">({isLayoutLocked ? "LOCKED" : "DRAGGABLE"})</span>
src/components/CockpitHUD.tsx:3249:                    <div className="flex items-center gap-2">
src/components/CockpitHUD.tsx:3250:                      <span className="text-zinc-500 font-extrabold text-[7px]" style={{ color: `${hudColor}bb` }}>Active Combat Mode</span>
src/components/CockpitHUD.tsx:3258:                        className="p-0.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-all cursor-pointer pointer-events-auto flex items-center justify-center"
src/components/CockpitHUD.tsx:3261:                        <X className="w-2.5 h-2.5" />
src/components/CockpitHUD.tsx:3337:                      <div className="flex gap-2.5 h-[56px] items-stretch">
src/components/CockpitHUD.tsx:3339:                        <div className="grid grid-cols-7 gap-1 flex-1">
src/components/CockpitHUD.tsx:3349:                                className={`relative flex flex-col items-center justify-between text-center p-1 h-full rounded-lg border transition-all duration-300 cursor-pointer ${
src/components/CockpitHUD.tsx:3360:                                  className="text-[6.5px] font-black uppercase tracking-tight"
src/components/CockpitHUD.tsx:3368:                                  className="w-5 h-[1.5px] rounded-full my-0.5"
src/components/CockpitHUD.tsx:3373:                                  className="text-[5.5px] font-bold tracking-tighter uppercase opacity-80"
src/components/CockpitHUD.tsx:3384:                        <div className="flex items-center gap-2 border-l pl-3 border-zinc-900 h-full" style={{ borderColor: `${hudColor}20` }}>
src/components/CockpitHUD.tsx:3385:                          <div className="flex flex-col text-left gap-0.5 font-mono w-[115px] leading-none text-[5.8px]">
src/components/CockpitHUD.tsx:3386:                            <div className="text-zinc-500 uppercase tracking-tighter">SPEC OUT: <span className="font-bold text-zinc-300">CORE DECK</span></div>
src/components/CockpitHUD.tsx:3387:                            <div className="whitespace-nowrap overflow-hidden text-ellipsis text-zinc-400">AMMO: <span className="font-extrabold uppercase" style={{ color: activeWeaponObj.accent }}>{activeWeaponObj.sub}</span></div>
src/components/CockpitHUD.tsx:3388:                            <div className="text-zinc-400">CALIBER: <span className="text-zinc-300 font-extrabold">{activeWeaponObj.caliber}</span></div>
src/components/CockpitHUD.tsx:3389:                            <div className="text-zinc-400 text-[5.2px] leading-tight select-none text-zinc-500 whitespace-nowrap overflow-hidden text-ellipsis">{activeWeaponObj.discharge}</div>
src/components/CockpitHUD.tsx:3397:                            className="relative overflow-hidden px-2.5 py-1.5 h-[34px] w-[82px] rounded-md border font-black text-[6.8px] tracking-[0.12em] uppercase cursor-pointer select-none transition-all duration-200 hover:brightness-110 active:scale-95 text-white"
src/components/CockpitHUD.tsx:3406:                            <div className="absolute bottom-0 left-0 h-[2px] w-full animate-pulse" style={{ backgroundColor: activeWeaponObj.accent }} />
src/components/CockpitHUD.tsx:3416:                      className="absolute bottom-1 right-1 w-3.5 h-3.5 cursor-se-resize flex items-end justify-end select-none pointer-events-auto z-50"
src/components/CockpitHUD.tsx:3441:                        document.addEventListener('mousemove', handleMouseMove);
src/components/CockpitHUD.tsx:3442:                        document.addEventListener('mouseup', handleMouseUp);
src/components/CockpitHUD.tsx:3446:                      <svg width="8" height="8" viewBox="0 0 8 8" className="opacity-60 hover:opacity-100 transition-opacity animate-pulse" style={{ color: hudColor, fill: 'currentColor' }}>
src/components/CockpitHUD.tsx:3469:              className="absolute bottom-0 left-0 right-0 h-[24px] bg-[#020306]/98 border-t border-zinc-900 pointer-events-auto z-50 flex items-center justify-between px-3 select-none text-[8px] font-mono font-black"
src/components/CockpitHUD.tsx:3472:              <div className="flex items-center gap-3">
src/components/CockpitHUD.tsx:3473:                <div className="flex items-center gap-1 text-zinc-550">
src/components/CockpitHUD.tsx:3474:                  <MousePointer className="w-2.5 h-2.5" />
src/components/CockpitHUD.tsx:3477:                <span className="text-zinc-800">|</span>
src/components/CockpitHUD.tsx:3478:                <div className="flex items-center gap-1.5 font-extrabold uppercase" style={{ color: hudColor }}>
src/components/CockpitHUD.tsx:3479:                  <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
src/components/CockpitHUD.tsx:3487:                className="hidden md:flex items-center gap-1.5 font-extrabold tracking-wider transition-colors duration-350"
src/components/CockpitHUD.tsx:3491:                    <AlertTriangle className="w-2.5 h-2.5 text-amber-500 animate-bounce" />
src/components/CockpitHUD.tsx:3500:              <div className="flex items-center gap-3 text-zinc-550">
src/components/CockpitHUD.tsx:3503:                  className={`hover:text-white transition uppercase text-[7px] cursor-pointer ${isGridVisible ? 'text-zinc-200' : ''}`}
src/components/CockpitHUD.tsx:3507:                <span className="text-zinc-800">|</span>
src/components/CockpitHUD.tsx:3510:                  className={`hover:text-white transition uppercase text-[7px] cursor-pointer ${isSnappingEnabled ? 'text-zinc-200' : ''}`}
src/components/CockpitHUD.tsx:3514:                <span className="text-zinc-800">|</span>
src/components/CockpitHUD.tsx:3515:                <span className="font-extrabold uppercase">ZOOM: {Math.round(hudScale * 100)}%</span>
src/App.tsx:13:const CockpitLayout: React.FC = () => {
src/App.tsx:26:      className="relative w-full h-screen overflow-hidden bg-black select-none font-mono"
src/App.tsx:42:        <div className="absolute inset-0 z-10 transition-all duration-1000 opacity-100 saturate-100 pointer-events-auto">
src/App.tsx:49:          className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-auto transition-opacity duration-500"
src/App.tsx:57:          className="absolute inset-0 z-10 transition-opacity duration-500"
src/App.tsx:69:export default function App() {
src/contexts/AppStateContext.tsx:1:import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
src/contexts/AppStateContext.tsx:66:export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
src/contexts/AppStateContext.tsx:164:  useEffect(() => {
src/contexts/AppStateContext.tsx:210:export const useAppState = () => {
