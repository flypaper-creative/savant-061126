import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { useAppState } from '../contexts/AppStateContext';
import { useAudio } from '../hooks/useAudio';
import { AsteroidTheme, AppPhase } from '../types';

interface AsteroidMaps {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  metalnessMap: THREE.CanvasTexture;
}

const CinematicLensShader = {
  name: 'CinematicLensShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uChromAb: { value: 0.0016 }, // elegant baseline chromatic fringing
    uGrainIntensity: { value: 0.016 }, // gritty film grain
    uTime: { value: 0.0 },
    uVignette: { value: 0.42 }, // cozy, narrow cockpit lens shadowing
    uDistortion: { value: 0.035 }, // barrel curvature
    uColorRange: { value: 1.05 },
    uGlitch: { value: 0.0 } // dynamic glitch value
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uChromAb;
    uniform float uGrainIntensity;
    uniform float uTime;
    uniform float uVignette;
    uniform float uDistortion;
    uniform float uColorRange;
    uniform float uGlitch;
    varying vec2 vUv;

    // Standard ACES Filmic Tone Mapping Curve (Narkowicz 2015)
    vec3 ACESFilm(vec3 x) {
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    // High frequency film noise/grain generator
    float filmGrainHash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 coord = vUv - 0.5;
      float r2 = dot(coord, coord);
      
      // Horizontal jitter drift (analog glitch shearing) based on uGlitch and uTime
      float glitchShift = 0.0;
      if (uGlitch > 0.0) {
        // High frequency scanline shearing bands
        float shearTrigger = sin(vUv.y * 220.0 + uTime * 65.0) * cos(vUv.y * 380.0 - uTime * 42.0);
        if (shearTrigger > 1.75 - uGlitch * 0.90) {
          glitchShift = sin(uTime * 32.0) * uGlitch * 0.024;
        }
        // Digital block displacement
        float blockTrigger = fract(sin(floor(vUv.y * 12.0) * 43758.5453 + uTime * 4.0));
        if (blockTrigger < uGlitch * 0.16) {
          glitchShift += sin(uTime * 95.0) * uGlitch * 0.042;
        }
      }

      // Cinematic barrel/fisheye lens distortion
      vec2 distortedCoord = vUv + coord * (uDistortion * r2 + uDistortion * 1.8 * r2 * r2);
      distortedCoord.x += glitchShift;
      
      // Smoothly scaled zoom factor to ensure edge-to-edge rendering with no edge-trim artifacts
      float zoomFactor = 1.0 - (uDistortion * 0.28);
      vec2 zoomedDistortedCoord = (distortedCoord - 0.5) * zoomFactor + 0.5;
      
      // Multi-tap Chromatic Aberration (RGB pixel fringing split)
      float currentAb = uChromAb + (uGlitch * 0.038);
      vec2 redUv = zoomedDistortedCoord - coord * currentAb;
      vec2 greenUv = zoomedDistortedCoord;
      vec2 blueUv = zoomedDistortedCoord + coord * currentAb;
      
      // Sample colored textures separately with clamped edges to prevent border bleed-through
      float rChannel = texture2D(tDiffuse, clamp(redUv, 0.001, 0.999)).r;
      float gChannel = texture2D(tDiffuse, clamp(greenUv, 0.001, 0.999)).g;
      float bChannel = texture2D(tDiffuse, clamp(blueUv, 0.001, 0.999)).b;
      
      vec4 baseColor = vec4(rChannel, gChannel, bChannel, 1.0);
      
      // Apply beautiful contrast color curve enhancements
      baseColor.rgb = pow(baseColor.rgb, vec3(uColorRange));
      
      // 1. Apply ACES Filmic Tone Mapping for authentic organic cinematography
      baseColor.rgb = ACESFilm(baseColor.rgb * 1.08);
      
      // 2. Gritty Industrial "Blade Runner" grading & desaturation
      // Split tones: Cold industrial-slate shadow blacks vs warm sodium/amber highlights, combined with subtle desaturation
      float luminance = dot(baseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      
      vec3 desat = vec3(luminance);
      baseColor.rgb = mix(baseColor.rgb, desat, 0.22); // Elegant 22% desaturation
      
      vec3 industrialSlateShadows = vec3(0.010, 0.020, 0.032); // Deep slate-teal
      vec3 sodiumHighlights = vec3(1.04, 0.88, 0.74);          // Gritty amber-copper flare warm-up
      baseColor.rgb = mix(industrialSlateShadows, baseColor.rgb * sodiumHighlights, smoothstep(-0.06, 0.48, luminance));

      // 3. Scanline stripes baked directly into 3D camera layer
      float scanline = sin(zoomedDistortedCoord.y * 1100.0) * 0.018;
      baseColor.rgb -= scanline;

      // 4. Fine photorealistic film grain micro-flicker
      float noiseVal = filmGrainHash(zoomedDistortedCoord + vec2(uTime * 0.08, uTime * 0.12));
      baseColor.rgb += (noiseVal - 0.5) * (uGrainIntensity + uGlitch * 0.10);

      // 5. Realistic Lens Dust & micro-scratches appearing in flares
      float dustPattern = fract(sin(dot(floor(zoomedDistortedCoord * 720.0), vec2(42.32, 107.545))) * 8439.12);
      if (dustPattern > 0.99984) {
        float dustGlow = sin(uTime * 1.5 + dustPattern * 80.0) * 0.5 + 0.5;
        baseColor.rgb += vec3(0.26 * dustGlow);
      }

      // 6. Photographic Vignette
      float vignetteFactor = 1.0 - smoothstep(0.38, 1.32, length(coord * 1.85));
      baseColor.rgb *= mix(1.0 - uVignette, 1.0, vignetteFactor);

      gl_FragColor = baseColor;
    }
  `
};

const WarpTunnelShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uSpeed: { value: 4.5 },
    uWarpTransition: { value: 0.0 },
    uColor: { value: new THREE.Color(0x00f2ff) }
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vPosition;
    void main() {
      vUv = uv;
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uSpeed;
    uniform float uWarpTransition;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vPosition;

    // Direct, fast pseudo-random noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    void main() {
      // Infinite scrolling down the tunnel using uTime and uSpeed
      float scrollSpeed = uTime * uSpeed;
      
      // Calculate dual spiral angles for helically-warped streaking
      float spiralShear1 = vUv.x * 32.0 + vUv.y * 12.0 - scrollSpeed * 2.5;
      float spiralShear2 = vUv.x * 48.0 - vUv.y * 18.0 - scrollSpeed * 4.0;
      float spiralShear3 = vUv.x * 16.0 + vUv.y * 6.0 - scrollSpeed * 1.5;

      // Sample independent streaking octaves
      float streakIntensity1 = noise(vec2(spiralShear1, vUv.y * 0.15));
      float streakIntensity2 = noise(vec2(spiralShear2, vUv.y * 0.25));
      float streakIntensity3 = noise(vec2(spiralShear3, vUv.y * 0.05));
      
      // Shape streaking edges via high exponent power and smoothsteps
      float s1 = pow(smoothstep(0.42, 0.85, streakIntensity1), 3.5) * 2.2;
      float s2 = pow(smoothstep(0.48, 0.90, streakIntensity2), 4.2) * 3.0;
      float s3 = pow(smoothstep(0.35, 0.75, streakIntensity3), 2.5) * 1.5;

      // Beautiful multi-tone hyperspace spectral coloring
      vec3 cyanColor = uColor;                  // Radiant HUD color
      vec3 indigoColor = vec3(0.55, 0.12, 1.0);  // High-energy deep royal violet
      vec3 hotWhite = vec3(1.0, 1.0, 1.0);       // Thermonuclear bright white core
      
      vec3 finalCol = (cyanColor * s1 + indigoColor * s2 + hotWhite * s3) * uWarpTransition;
      
      // Smoothly fade out edges at tunnel entrances and exits to hide cylinder flat-ends
      float edgeFade = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
      
      // Base transparency based on streaking velocity and transition progress
      float alpha = clamp((s1 * 0.5 + s2 * 0.7 + s3 * 0.9) * edgeFade * uWarpTransition, 0.0, 0.96);
      
      gl_FragColor = vec4(finalCol, alpha);
    }
  `
};

const ParallaxStarShader = {
  uniforms: {
    uTime: { value: 0.0 },
    uSpeedAccum: { value: 0.0 },
    uDriftOffset: { value: new THREE.Vector2(0, 0) },
    uWarpTransition: { value: 0.0 },
    uSpeedFactor: { value: 0.0 },
    uPhaseCode: { value: 2.0 },
    uTexture: { value: null as THREE.Texture | null }
  },
  vertexShader: `
    uniform float uTime;
    uniform float uSpeedAccum;
    uniform vec2 uDriftOffset;
    uniform float uWarpTransition;
    uniform float uSpeedFactor;
    uniform float uPhaseCode;

    attribute float aLayerIndex;

    varying vec3 vColor;
    varying float vAlpha;
    varying float vTwinkle;

    void main() {
      // Base color defaults to original vertex attribute color
      vec3 baseColor = color;
      
      // Start with initial static coordinate position
      vec3 transformed = position;
      
      // Compute completely deterministic pseudo-random hash weights based on starlight vectors
      float layerHash = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 2315.545);
      float speedHash = fract(sin(dot(position.yz, vec2(91.244, 43.125))) * 875.413);
      
      // Continuous layered distribution
      float layerFactor = 0.15 + 0.85 * layerHash;
      float speedMultiplier = 0.8 + 0.4 * speedHash;
      
      // Compute independent movement parameters for exactly 3 parallax layers in front of nebula
      float speedMult = 1.0;
      float parallaxMult = 1.0;
      float sizeMult = 1.0;
      float alphaMult = 1.0;
      
      if (aLayerIndex < 1.5) {
        // Layer 1: Distant background stars (subtle, quiet drift)
        speedMult = 0.08;
        parallaxMult = 0.15;
        sizeMult = 0.75;
        alphaMult = 0.55;
        // Deep hot Class O/B shifts: deep indigos and space purples
        baseColor = mix(vec3(0.40, 0.15, 0.65), vec3(0.18, 0.38, 0.75), layerHash);
      } else if (aLayerIndex < 2.5) {
        // Layer 2: Mid-depth field stars (moderate velocity and lateral drift)
        speedMult = 0.65;
        parallaxMult = 0.95;
        sizeMult = 1.30;
        alphaMult = 0.82;
        // Cozy amber, yellow, and pure white stars
        baseColor = mix(vec3(0.98, 0.75, 0.45), vec3(0.98, 0.98, 0.98), layerHash);
      } else {
        // Layer 3: Close-range foreground star clusters (extremely fast & high steering responsiveness!)
        speedMult = 2.45;
        parallaxMult = 3.65; // Massive drift movement indicating steering visually
        sizeMult = 2.40;
        alphaMult = 1.00;
        // Radiant Class-O supergiant neon blues and vivid magentas
        baseColor = mix(vec3(0.35, 0.85, 1.0), vec3(0.95, 0.35, 1.0), layerHash);
      }
      
      // Pass final layer-specific color to the fragment shader
      vColor = baseColor;
      
      // Move forward down the channel based on speed accum and our parallax layer factor
      transformed.z += uSpeedAccum * speedMultiplier * layerFactor * speedMult;
      
      // Rotate coordinates list slowly on BOOT phase to convey a warm diagnostic radar scan
      if (uPhaseCode == 0.0) {
        float rotAngle = uTime * 0.015;
        float cosA = cos(rotAngle);
        float sinA = sin(rotAngle);
        float rx = transformed.x * cosA - transformed.y * sinA;
        float ry = transformed.x * sinA + transformed.y * cosA;
        transformed.x = rx;
        transformed.y = ry;
      }
      
      // Wrap coordinates beautifully when they approach too close or drift too far
      float zRange = 700.0;
      float zOffset = -600.0;
      transformed.z = mod(transformed.z - zOffset, zRange) + zOffset;
      
      // Destination phase pulls/scales stars towards center of the portal
      if (uPhaseCode == 3.0) {
        float contraction = 1.0 - 0.25 * smoothstep(-600.0, -50.0, transformed.z);
        transformed.x *= contraction;
        transformed.y *= contraction;
      }
      
      // Dynamic depth-based parallax factor
      float depthProgress = (transformed.z - zOffset) / zRange;
      float parallaxFactor = (0.02 + 0.98 * pow(depthProgress, 1.8)) * parallaxMult;
      
      // Wrap X coordinates dynamically with steering and hover parallax
      float xRange = 230.0;
      float xOffset = -115.0;
      transformed.x = mod(transformed.x - uDriftOffset.x * parallaxFactor - xOffset, xRange) + xOffset;
      
      // Wrap Y coordinates dynamically with steering and hover parallax
      float yRange = 190.0;
      float yOffset = -95.0;
      transformed.y = mod(transformed.y - uDriftOffset.y * parallaxFactor - yOffset, yRange) + yOffset;
      
      // Projection view transformation
      vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Apply perspective-aware sizing which increases with speed and uSpeedFactor
      float baseSize = 1.6;
      float speedSizeBoost = 1.0 + uSpeedFactor * 0.85;
      gl_PointSize = (baseSize * 15.0 / max(1.0, -mvPosition.z)) * (0.8 + 0.4 * speedMultiplier) * speedSizeBoost * sizeMult;
      
      // Expand coordinates and halo sizing when entering hyperspace transition
      gl_PointSize += uWarpTransition * 6.5;
      
      // Alpha distance/perspective fade limits to ensure stars don't pop abruptly
      float nearFade = smoothstep(0.0, 50.0, -mvPosition.z);
      float farFade = smoothstep(600.0, 450.0, -mvPosition.z);
      vAlpha = nearFade * farFade * (0.45 + 0.55 * layerFactor) * alphaMult;
      
      // Organic shimmering/twinkling frequency increases with speed
      float sparkleSpeed = (2.4 + 3.6 * speedHash) * (1.0 + uSpeedFactor * 1.5);
      if (uPhaseCode == 3.0) {
        // Slow peaceful cosmic rhythm on destination arrived
        sparkleSpeed = 1.0 + 1.2 * speedHash;
      }
      vTwinkle = 0.45 + 0.55 * sin(uTime * sparkleSpeed + layerHash * 12.5);
    }
  `,
  fragmentShader: `
    uniform sampler2D uTexture;
    uniform float uSpeedFactor;
    uniform float uWarpTransition;
    varying vec3 vColor;
    varying float vAlpha;
    varying float vTwinkle;

    void main() {
      // Sample circular starlight mask
      vec4 texColor = texture2D(uTexture, gl_PointCoord);
      
      // Apply beautiful Doppler shift spectral color shifts based on current speed!
      vec3 DopplerColor = vColor;
      if (uSpeedFactor > 0.05) {
        // Blend in icy-cyan/blue shift as we speed up, or hot white
        DopplerColor = mix(vColor, vec3(0.55, 0.85, 1.0), clamp(uSpeedFactor * 0.48, 0.0, 0.75));
      }
      if (uWarpTransition > 0.05) {
        // Bright shining white/vivid blue core during hyperspace transition
        DopplerColor = mix(DopplerColor, vec3(1.0, 1.0, 1.0), uWarpTransition * 0.85);
      }

      // Combine vertex colors, twinkling intensity, and circular mask
      vec3 finalColor = DopplerColor * (1.0 + 0.35 * vTwinkle);
      gl_FragColor = vec4(finalColor * texColor.rgb, vAlpha * texColor.a * (0.55 + 0.45 * vTwinkle));
    }
  `
};

/**
 * Triggers a beautiful glowing wireframe energy shield deflect ring centered at the cockpit viewpoint upon asteroid collision.
 */
function createShieldImpactEffect(scene: THREE.Scene, camera: THREE.Camera, colorHex: string) {
  const geom = new THREE.SphereGeometry(14.0, 24, 24);
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(colorHex),
    wireframe: true,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const shieldMesh = new THREE.Mesh(geom, mat);
  
  // Pos slightly in front of camera
  shieldMesh.position.copy(camera.position);
  const forwardDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  shieldMesh.position.addScaledVector(forwardDir, 11);
  
  scene.add(shieldMesh);
  
  // Animate scale expanding and wireframe transparency fading out
  gsap.to(shieldMesh.scale, {
    x: 2.4,
    y: 2.4,
    z: 2.4,
    duration: 0.7,
    ease: 'power3.out',
  });
  
  gsap.to(mat, {
    opacity: 0.0,
    duration: 0.7,
    ease: 'power3.out',
    onComplete: () => {
      scene.remove(shieldMesh);
      geom.dispose();
      mat.dispose();
    },
  });
}

/**
 * Helper to ensure a BufferGeometry contains all attributes required for normal mapping,
 * iridescence, and standard procedural rendering.
 * Specifically satisfies Three.js internal `computeTangents()` requirements:
 * index !== null, position !== undefined, normal !== undefined, uv !== undefined.
 */
function ensureAttributesAndTangents(geom: THREE.BufferGeometry): THREE.BufferGeometry {
  const posAttr = geom.attributes.position;
  if (!posAttr) return geom;

  // 1. Ensure normals exist
  if (!geom.attributes.normal) {
    geom.computeVertexNormals();
  }

  // 2. Ensure UV coordinates exist (e.g. spherical projection fallback)
  if (!geom.attributes.uv) {
    const count = posAttr.count;
    const uvs = new Float32Array(count * 2);
    const tv = new THREE.Vector3();
    for (let j = 0; j < count; j++) {
      tv.fromBufferAttribute(posAttr, j).normalize();
      const u = 0.5 + Math.atan2(tv.z, tv.x) / (2 * Math.PI);
      const v = 0.5 + Math.asin(tv.y) / Math.PI;
      uvs[j * 2] = u;
      uvs[j * 2 + 1] = v;
    }
    geom.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  }

  // 3. Ensure index attribute exists (some Polyhedral/BufferGeometries are unindexed)
  if (!geom.index) {
    const count = posAttr.count;
    const indices = new Uint32Array(count);
    for (let j = 0; j < count; j++) {
      indices[j] = j;
    }
    geom.setIndex(new THREE.BufferAttribute(indices, 1));
  }

  // 4. Safely precompute tangents
  try {
    geom.computeTangents();
  } catch (err) {
    // Fail silently
  }

  return geom;
}

const mapCache = new Map<number, AsteroidMaps>();

// Helper to generate an upgraded, hyper-photorealistic procedural asteroid canvas texture maps pack (cached and optimized to 512px)
function createAsteroidMaps(colorHex: number): AsteroidMaps {
  if (mapCache.has(colorHex)) {
    return mapCache.get(colorHex)!;
  }
  const size = 1024;
  
  // 1. Color map Canvas
  const colCanvas = document.createElement('canvas');
  colCanvas.width = size;
  colCanvas.height = size;
  const colCtx = colCanvas.getContext('2d');
  
  // 2. Bump/Height map Canvas
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bumpCtx = bumpCanvas.getContext('2d');
  
  // 3. Roughness map Canvas
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d');

  // 4. Metalness map Canvas
  const metalCanvas = document.createElement('canvas');
  metalCanvas.width = size;
  metalCanvas.height = size;
  const metalCtx = metalCanvas.getContext('2d');

  // 5. Normal map Canvas
  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const normCtx = normCanvas.getContext('2d');

  if (!colCtx || !bumpCtx || !roughCtx || !metalCtx || !normCtx) {
    const dummyTex = new THREE.CanvasTexture(colCanvas);
    const fallbackMaps = { map: dummyTex, bumpMap: dummyTex, normalMap: dummyTex, roughnessMap: dummyTex, metalnessMap: dummyTex };
    mapCache.set(colorHex, fallbackMaps);
    return fallbackMaps;
  }
  
  // Extract RGB channels of basic base color
  const rBase = (colorHex >> 16) & 255;
  const gBase = (colorHex >> 8) & 255;
  const bBase = colorHex & 255;
  
  colCtx.fillStyle = `rgb(${rBase}, ${gBase}, ${bBase})`;
  colCtx.fillRect(0, 0, size, size);
  
  bumpCtx.fillStyle = 'rgb(127, 127, 127)'; // Neutral mid height
  bumpCtx.fillRect(0, 0, size, size);
  
  roughCtx.fillStyle = 'rgb(240, 240, 240)'; // High standard roughness for dusty space rocks (240/255 = ~0.94)
  roughCtx.fillRect(0, 0, size, size);

  metalCtx.fillStyle = 'rgb(10, 10, 10)'; // Low metalness (10/255 = ~0.04) for standard basalt rock
  metalCtx.fillRect(0, 0, size, size);
  
  // Layer fine organic, rotated-octave mineral noise
  const colImg = colCtx.getImageData(0, 0, size, size);
  const bumpImg = bumpCtx.getImageData(0, 0, size, size);
  const roughImg = roughCtx.getImageData(0, 0, size, size);
  const metalImg = metalCtx.getImageData(0, 0, size, size);
  
  const colData = colImg.data;
  const bumpData = bumpImg.data;
  const roughData = roughImg.data;
  const metalData = metalImg.data;
  
  // Upgraded mineral noise with stratification waves and erosion valleys
  const evalMineralNoise = (x: number, y: number) => {
    // Octave 1: broad structural layers
    const x1 = x * 0.004;
    const y1 = y * 0.004;
    const h1 = Math.sin(x1) * Math.cos(y1);
    
    // Octave 2 (rotated by ~45 deg): medium gentle valleys
    const x2 = (x * 0.707 + y * 0.707) * 0.010;
    const y2 = (-x * 0.707 + y * 0.707) * 0.010;
    const h2 = Math.sin(x2) * Math.cos(y2) * 0.35;
    
    // Octave 3 (rotated by ~120 deg): smooth undulating contours
    const x3 = (x * 0.5 - y * 0.866) * 0.022;
    const y3 = (x * 0.866 + y * 0.5) * 0.022;
    const h3 = Math.sin(x3) * Math.cos(y3) * 0.15;
    
    // Rock Stratification Layer: diagonal bands across the rock representing ancient sedimentary compression!
    const stratificationWave = Math.sin(x * 0.035 - y * 0.015) * 0.16;

    // Combined rugged profile
    const heightVal = h1 + h2 + h3 + stratificationWave * 0.65;
    
    // Crevice dust / Regolith accumulation check
    const isDustyCrevice = heightVal < -0.18;
    
    // Ambient Occlusion: Darken the deep crevices and valleys (where height is low)
    const occlusion = Math.max(0.24, Math.min(1.0, (heightVal + 1.1) * 0.55));
    
    // High base roughness for ancient porous silicate structures
    let roughness = Math.max(0.85, Math.min(1.0, 0.94 - (heightVal * 0.04)));
    let metalness = 0.03;
    
    if (isDustyCrevice) {
      roughness = 0.98; // super powdery porous carbonaceous regolith dust
    }
    
    return { height: heightVal, roughness, metalness, occlusion, stratificationWave };
  };

  for (let i = 0; i < colData.length; i += 4) {
    const idx = i / 4;
    const x = idx % size;
    const y = Math.floor(idx / size);
    
    const { height, roughness, metalness, occlusion, stratificationWave } = evalMineralNoise(x, y);
    
    // Convert base color to a highly realistic desaturated basalt rock base
    const brightness = (rBase * 0.299 + gBase * 0.587 + bBase * 0.114);
    let r = brightness * 0.82;
    let g = brightness * 0.82;
    let b = brightness * 0.85; // cool slate/basalt default
    
    // Apply sedimentary stratification banding in neutral greys
    if (stratificationWave > 0) {
      const bandFactor = 1.0 + stratificationWave * 0.25;
      r *= bandFactor * 1.02;
      g *= bandFactor; 
      b *= bandFactor * 0.98;
    } else {
      const bandFactor = 1.0 + stratificationWave * 0.20;
      r *= bandFactor * 0.96;
      g *= bandFactor * 0.98;
      b *= bandFactor * 1.04; // cooler dark basalt slate band
    }
    
    // Apply realistic pale grey-tan regolith dust accumulation in deep crevices
    if (height < -0.18) {
      const blend = Math.min(0.85, Math.abs(height + 0.18) * 3.5);
      r = r * (1.0 - blend) + 125 * blend;
      g = g * (1.0 - blend) + 120 * blend;
      b = b * (1.0 - blend) + 115 * blend; // muted dusty greyish-clay
    }

    // High frequency micro-grain basalt pores
    const microGrain = (Math.sin(x * 63.2 + y * 97.4) * 12345.67 % 1) * 3;
    r += microGrain;
    g += microGrain;
    b += microGrain;

    let finalRoughness = roughness;
    let finalMetalness = metalness;

    // Organic weathered nickel-iron veins winding across the rocks
    const oreNoise = Math.sin(x * 0.055) * Math.sin(y * 0.055) + Math.cos(x * 0.12 - y * 0.04) * 0.35;
    const isOreVein = oreNoise > 0.58;
    
    if (isOreVein) {
      finalRoughness = 0.55; // slightly smoother metallic facets but still weathered
      finalMetalness = 0.38; // realistic raw nickel-iron meteoritic metal content
      const blendFactor = Math.min(1.0, (oreNoise - 0.58) * 4.0);
      const greyAlloy = (r + g + b) / 3 * 1.35; // brightened steel-grey metal highlight
      r = r * (1.0 - blendFactor) + greyAlloy * blendFactor;
      g = g * (1.0 - blendFactor) + (greyAlloy + 2) * blendFactor; 
      b = b * (1.0 - blendFactor) + (greyAlloy + 6) * blendFactor; // matte metallic nickel-steel
    }
    
    // Apply Ambient Occlusion!
    colData[i] = Math.max(0, Math.min(255, r * occlusion));
    colData[i + 1] = Math.max(0, Math.min(255, g * occlusion));
    colData[i + 2] = Math.max(0, Math.min(255, b * occlusion));
    
    // Bump Map
    bumpData[i] = Math.max(0, Math.min(255, 127 + height * 120));
    bumpData[i + 1] = Math.max(0, Math.min(255, 127 + height * 120));
    bumpData[i + 2] = Math.max(0, Math.min(255, 127 + height * 120));
    
    // Roughness Map
    roughData[i] = Math.max(0, Math.min(255, finalRoughness * 255));
    roughData[i + 1] = Math.max(0, Math.min(255, finalRoughness * 255));
    roughData[i + 2] = Math.max(0, Math.min(255, finalRoughness * 255));
    
    // Metalness Map
    metalData[i] = Math.max(0, Math.min(255, finalMetalness * 255));
    metalData[i + 1] = Math.max(0, Math.min(255, finalMetalness * 255));
    metalData[i + 2] = Math.max(0, Math.min(255, finalMetalness * 255));
  }
  
  colCtx.putImageData(colImg, 0, 0);
  bumpCtx.putImageData(bumpImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);
  metalCtx.putImageData(metalImg, 0, 0);
  
  // Draw physical carbon micro-fissures and tectonic fracture networks
  const veinsCount = 18 + Math.floor(Math.random() * 12);
  for (let f = 0; f < veinsCount; f++) {
    let cx = Math.random() * size;
    let cy = Math.random() * size;
    
    const lineWidth = 1.0 + Math.random() * 2.5;
    colCtx.lineWidth = lineWidth;
    bumpCtx.lineWidth = lineWidth;
    roughCtx.lineWidth = lineWidth;
    metalCtx.lineWidth = lineWidth;
    
    // Muted dark carbon cracks and fracture grooves
    colCtx.strokeStyle = 'rgba(3, 3, 3, 0.95)';
    bumpCtx.strokeStyle = 'rgb(12, 12, 15)'; // deeply depressed crevice
    roughCtx.strokeStyle = 'rgb(245, 245, 245)'; // dry cracked rim edges
    metalCtx.strokeStyle = 'rgb(1, 1, 1)';
    
    colCtx.beginPath();
    bumpCtx.beginPath();
    roughCtx.beginPath();
    metalCtx.beginPath();
    
    colCtx.moveTo(cx, cy);
    bumpCtx.moveTo(cx, cy);
    roughCtx.moveTo(cx, cy);
    metalCtx.moveTo(cx, cy);
    
    const steps = 8 + Math.floor(Math.random() * 8);
    for (let s = 0; s < steps; s++) {
      cx += (Math.random() - 0.5) * 350;
      cy += (Math.random() - 0.5) * 350;
      
      colCtx.lineTo(cx, cy);
      bumpCtx.lineTo(cx, cy);
      roughCtx.lineTo(cx, cy);
      metalCtx.lineTo(cx, cy);
    }
    colCtx.stroke();
    bumpCtx.stroke();
    roughCtx.stroke();
    metalCtx.stroke();
  }
  
  // Draw hyper-realistic 3D impact craters with tiered stepped rims
  const craterCount = 28 + Math.floor(Math.random() * 15);
  for (let c = 0; c < craterCount; c++) {
    const cx = Math.random() * size;
    const cy = Math.random() * size;
    const r = 35 + Math.random() * 115;
    
    const lx = -r * 0.12;
    const ly = -r * 0.12;
    
    // Rim color shading (dark dusty edges, rugged)
    const rimGrad = colCtx.createRadialGradient(cx + lx, cy + ly, r * 0.75, cx, cy, r);
    rimGrad.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
    rimGrad.addColorStop(0.88, 'rgba(40, 40, 40, 0.45)'); // muted dark gray dusty rim
    rimGrad.addColorStop(1, 'rgba(2, 2, 4, 0.92)'); // dark outer crater falloff
    colCtx.fillStyle = rimGrad;
    colCtx.beginPath(); colCtx.arc(cx, cy, r, 0, Math.PI * 2); colCtx.fill();
    
    // Rim height bump extrusion in height map
    const bumpRimGrad = bumpCtx.createRadialGradient(cx, cy, r * 0.75, cx, cy, r);
    bumpRimGrad.addColorStop(0, 'rgb(127, 127, 127)');
    bumpRimGrad.addColorStop(0.88, 'rgb(155, 155, 160)'); // subtly raised rim
    bumpRimGrad.addColorStop(1, 'rgb(80, 80, 85)');      // outer slope
    bumpCtx.fillStyle = bumpRimGrad;
    bumpCtx.beginPath(); bumpCtx.arc(cx, cy, r, 0, Math.PI * 2); bumpCtx.fill();
    
    // Pit interior bowl shadow
    const shadowGrad = colCtx.createRadialGradient(cx - lx, cy - ly, r * 0.1, cx, cy, r * 0.85);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)'); // obsidian-black pit shadow
    shadowGrad.addColorStop(0.7, 'rgba(3, 3, 5, 0.98)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');
    colCtx.fillStyle = shadowGrad;
    colCtx.beginPath(); colCtx.arc(cx, cy, r * 0.85, 0, Math.PI * 2); colCtx.fill();
    
    // Put solid black indentation in the middle of crater to make it extremely clear and simulate depth indentations
    colCtx.fillStyle = 'rgba(1, 1, 2, 0.99)';
    colCtx.beginPath(); colCtx.arc(cx, cy, r * 0.52, 0, Math.PI * 2); colCtx.fill();
    
    // Pit interior depression bowl (dark/0 is deep crater cavity)
    const bumpShadowGrad = bumpCtx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 0.82);
    bumpShadowGrad.addColorStop(0, 'rgb(5, 5, 8)'); // ultra deep hollow floor
    bumpShadowGrad.addColorStop(0.75, 'rgb(40, 40, 45)');
    bumpShadowGrad.addColorStop(1, 'rgb(127, 127, 127)');
    bumpCtx.fillStyle = bumpShadowGrad;
    bumpCtx.beginPath(); bumpCtx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); bumpCtx.fill();
    
    // Roughness inside craters (dry space dust)
    roughCtx.fillStyle = 'rgb(255, 255, 255)'; 
    roughCtx.beginPath(); roughCtx.arc(cx, cy, r * 0.78, 0, Math.PI * 2); roughCtx.fill();

    // Metalness inside craters (zero metallic content)
    metalCtx.fillStyle = 'rgb(0, 0, 0)';
    metalCtx.beginPath(); metalCtx.arc(cx, cy, r * 0.78, 0, Math.PI * 2); metalCtx.fill();
  }

  
  // 6. Generate a gorgeous, hyper-detailed Normal Map directly from the final bumpMap!
  const finalBumpImg = bumpCtx.getImageData(0, 0, size, size);
  const finalBumpData = finalBumpImg.data;
  
  const normImg = normCtx.createImageData(size, size);
  const normData = normImg.data;
  
  const normalStrength = 4.5; // Controls depth of normal map shading
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      
      const xLeft = x > 0 ? x - 1 : size - 1;
      const xRight = x < size - 1 ? x + 1 : 0;
      const yUp = y > 0 ? y - 1 : size - 1;
      const yDown = y < size - 1 ? y + 1 : 0;
      
      const hLeft = finalBumpData[(y * size + xLeft) * 4];
      const hRight = finalBumpData[(y * size + xRight) * 4];
      const hUp = finalBumpData[(yUp * size + x) * 4];
      const hDown = finalBumpData[(yDown * size + x) * 4];
      
      const dx = (hRight - hLeft) / 255.0;
      const dy = (hDown - hUp) / 255.0;
      
      const nx = -dx * normalStrength;
      const ny = -dy * normalStrength;
      const nz = 1.0;
      
      const rLen = 1.0 / Math.sqrt(nx * nx + ny * ny + nz * nz);
      const nnx = nx * rLen;
      const nny = ny * rLen;
      const nnz = nz * rLen;
      
      normData[idx] = Math.floor((nnx * 0.5 + 0.5) * 255);
      normData[idx + 1] = Math.floor((nny * 0.5 + 0.5) * 255);
      normData[idx + 2] = Math.floor((nnz * 0.5 + 0.5) * 255);
      normData[idx + 3] = 255;
    }
  }
  normCtx.putImageData(normImg, 0, 0);

  const mapTex = new THREE.CanvasTexture(colCanvas);
  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  const normalTex = new THREE.CanvasTexture(normCanvas);
  const roughTex = new THREE.CanvasTexture(roughCanvas);
  const metalTex = new THREE.CanvasTexture(metalCanvas);
  
  mapTex.wrapS = THREE.RepeatWrapping; mapTex.wrapT = THREE.RepeatWrapping;
  bumpTex.wrapS = THREE.RepeatWrapping; bumpTex.wrapT = THREE.RepeatWrapping;
  normalTex.wrapS = THREE.RepeatWrapping; normalTex.wrapT = THREE.RepeatWrapping;
  roughTex.wrapS = THREE.RepeatWrapping; roughTex.wrapT = THREE.RepeatWrapping;
  metalTex.wrapS = THREE.RepeatWrapping; metalTex.wrapT = THREE.RepeatWrapping;
  
  const maps = {
    map: mapTex,
    bumpMap: bumpTex,
    normalMap: normalTex,
    roughnessMap: roughTex,
    metalnessMap: metalTex,
  };
  mapCache.set(colorHex, maps);
  return maps;
}

// Generate a soft radial glow circular starlight texture to prevent square particles
function createStarTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(235, 245, 255, 0.85)');
    grad.addColorStop(0.55, 'rgba(160, 200, 255, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 16, 16);
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

// Helper to generate a breathtaking, highly detailed procedural fractal flame explosion texture on the fly
function createFractalExplosionTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Solid deep space dark foundation
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 1024, 1024);
    
    const cx = 512;
    const cy = 512;
    
    // 1. Cosmic background star field for spatial depth
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    for (let s = 0; s < 200; s++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 1024;
      const size = 0.5 + Math.random() * 2.0;
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Switch composition mode for hyper-bright glowing psychedelic overlapping
    ctx.globalCompositeOperation = 'screen';
    
    // 2. Cosmic Nebular Dust Clouds (Vibrant, volumetric, psychedelic, multi-layered)
    // Overlapping neon cyans, hot pinks, electric purples, vibrant oranges and lime tints
    const psyColors = [
      { r: 0, g: 255, b: 242, a: 0.18 },   // Electric Cyan
      { r: 255, g: 0, b: 128, a: 0.18 },   // Hot Magenta/Pink
      { r: 138, g: 43, b: 226, a: 0.14 },  // Violet
      { r: 255, g: 140, b: 0, a: 0.16 },   // Solar Deep Orange
      { r: 0, g: 255, b: 127, a: 0.12 },   // Radiant Lime/Mint
    ];
    
    for (let c = 0; c < 380; c++) {
      const angle = Math.random() * Math.PI * 2;
      // Exponential cluster to form organic galaxy spiral arms
      const radius = Math.pow(Math.random(), 1.4) * 460;
      const bx = cx + Math.cos(angle) * radius + (Math.random() - 0.5) * 70;
      const by = cy + Math.sin(angle) * radius + (Math.random() - 0.5) * 70;
      
      const theme = psyColors[c % psyColors.length];
      const cloudSize = 20 + (1.0 - radius / 500) * 85 + Math.random() * 25;
      
      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, cloudSize);
      grad.addColorStop(0, `rgba(${theme.r}, ${theme.g}, ${theme.b}, ${theme.a * 1.6})`);
      grad.addColorStop(0.45, `rgba(${theme.r * 0.7}, ${theme.g * 0.7}, ${theme.b * 0.7}, ${theme.a * 0.55})`);
      grad.addColorStop(1.0, 'rgba(0,0,0,0)');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(bx, by, cloudSize, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // 3. Central blinding psychedelic Nova core
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 220);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.12, 'rgba(255, 235, 255, 1.0)');
    coreGrad.addColorStop(0.25, 'rgba(0, 255, 255, 0.90)');   // Electric Cyan Ring
    coreGrad.addColorStop(0.48, 'rgba(255, 0, 180, 0.80)');   // Vivid Hot Magenta
    coreGrad.addColorStop(0.75, 'rgba(120, 0, 255, 0.65)');   // Ultraviolet Halo
    coreGrad.addColorStop(1.0, 'rgba(0,0,0,0)');
    ctx.fillStyle = coreGrad;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // 4. Breathtaking High-fidelity recursive fractal branching
    // An intricate 24-tendril magnetic flux recursive fractal flower (IFS structure) mimicking starfire filaments
    const numTendrils = 24;
    for (let t = 0; t < numTendrils; t++) {
      const baseAngle = (t / numTendrils) * Math.PI * 2;
      
      const drawFractalBranch = (x1: number, y1: number, angle: number, length: number, depth: number) => {
        if (depth <= 0) return;
        
        // Add rotational curl (swirl factor) to simulate black hole gravity warping the plasma
        const curlAngle = angle + Math.sin(depth * 0.45 + t * 0.15) * 0.18;
        const x2 = x1 + Math.cos(curlAngle) * length;
        const y2 = y1 + Math.sin(curlAngle) * length;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        
        // Highly saturated psychedelic neon stroke colors mapped per recursion depth tier
        let strokeColor = '';
        if (depth === 6) strokeColor = 'rgba(255, 255, 255, 0.95)'; // Incandescent White core filaments
        else if (depth === 5) strokeColor = 'rgba(0, 255, 240, 0.85)'; // Radiant Electric Cyan
        else if (depth === 4) strokeColor = 'rgba(255, 0, 160, 0.80)'; // Psychedelic Hot Pink
        else if (depth === 3) strokeColor = 'rgba(180, 0, 255, 0.65)'; // Violet Space-bending plasma
        else if (depth === 2) strokeColor = 'rgba(255, 215, 0, 0.55)';  // Radiant Gold
        else strokeColor = 'rgba(0, 255, 120, 0.42)'; // Neon Mint tips
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = depth * 1.6;
        ctx.stroke();
        
        // Dynamic branching ratios with asymmetrical splits
        const forkAngle = 0.36 + Math.sin(t * 0.6) * 0.10;
        drawFractalBranch(x2, y2, angle + forkAngle, length * 0.77, depth - 1);
        drawFractalBranch(x2, y2, angle - forkAngle, length * 0.77, depth - 1);
      };
      
      const startR = 85;
      const sx = cx + Math.cos(baseAngle) * startR;
      const sy = cy + Math.sin(baseAngle) * startR;
      drawFractalBranch(sx, sy, baseAngle, 175, 6); // 6-depth rich recursive structure
    }
    
    // 5. Giant Quasar Rays (high-energy cosmic starlight bursting outwards)
    const numRays = 80;
    for (let r = 0; r < numRays; r++) {
      const angle = (r / numRays) * Math.PI * 2 + Math.random() * 0.04;
      const length = 190 + Math.random() * 340;
      const x2 = cx + Math.cos(angle) * length;
      const y2 = cy + Math.sin(angle) * length;
      
      const rayGrad = ctx.createLinearGradient(cx, cy, x2, y2);
      rayGrad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      if (r % 3 === 0) {
        rayGrad.addColorStop(0.3, 'rgba(0, 255, 255, 0.50)');
        rayGrad.addColorStop(0.65, 'rgba(255, 0, 200, 0.20)');
      } else if (r % 3 === 1) {
        rayGrad.addColorStop(0.3, 'rgba(255, 0, 180, 0.50)');
        rayGrad.addColorStop(0.65, 'rgba(120, 0, 255, 0.20)');
      } else {
        rayGrad.addColorStop(0.3, 'rgba(255, 195, 0, 0.45)');
        rayGrad.addColorStop(0.65, 'rgba(0, 255, 120, 0.15)');
      }
      rayGrad.addColorStop(1, 'rgba(0,0,0,0)');
      
      ctx.strokeStyle = rayGrad;
      ctx.lineWidth = 1.0 + Math.random() * 3.0;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper to generate a procedural high-fidelity lens flare or radial starlight gradient
function createFlareTexture(type: 'radial' | 'horizontal'): THREE.Texture {
  const canvas = document.createElement('canvas');
  if (type === 'radial') {
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const cx = 512;
      const cy = 512;
      
      // Clear with soft black to support blend operations
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Base radial solar glow
      const baseGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 512);
      baseGrad.addColorStop(0, '#ffffff');
      baseGrad.addColorStop(0.05, '#fff6e0'); // Hot white-yellow
      baseGrad.addColorStop(0.12, '#ffaa00'); // Hot gold
      baseGrad.addColorStop(0.25, 'rgba(255, 80, 0, 0.75)'); // Intense red-orange
      baseGrad.addColorStop(0.5, 'rgba(180, 30, 0, 0.35)'); // Deep crimson
      baseGrad.addColorStop(0.8, 'rgba(0, 150, 200, 0.15)'); // Outer cool cyan halo matching attachment!
      baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, 1024, 1024);
      
      // Draw detailed concentric plasma filaments (as represented in the golden attachment bubble)
      const numRings = 24;
      ctx.globalCompositeOperation = 'screen';
      for (let rIdx = 0; rIdx < numRings; rIdx++) {
        const radius = 80 + rIdx * 14;
        const opacity = 0.15 + (1 - rIdx / numRings) * 0.45;
        
        ctx.strokeStyle = `rgba(${255 - rIdx * 3}, ${160 - rIdx * 4}, ${40 - rIdx * 2}, ${opacity})`;
        ctx.lineWidth = 1.5 + Math.random() * 2.5;
        ctx.beginPath();
        
        const numPoints = 80;
        for (let pIdx = 0; pIdx <= numPoints; pIdx++) {
          const angle = (pIdx / numPoints) * Math.PI * 2;
          // Add complex wavy frequency offsets matching the organic plasma turbulence
          const noiseFactor = Math.sin(angle * 7.0 + rIdx * 1.5) * 4.5 + Math.cos(angle * 12.0) * 2.0;
          const px = cx + Math.cos(angle) * (radius + noiseFactor);
          const py = cy + Math.sin(angle) * (radius + noiseFactor);
          if (pIdx === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
      }
      
      // Overlay high frequency stardust sparks/burst radial lines for volumetric reality
      const numSpurs = 120;
      for (let sIdx = 0; sIdx < numSpurs; sIdx++) {
        const angle = Math.random() * Math.PI * 2;
        const len = 100 + Math.random() * 220;
        const targetX = cx + Math.cos(angle) * len;
        const targetY = cy + Math.sin(angle) * len;
        const opacity = 0.08 + Math.random() * 0.15;
        
        const spurGrad = ctx.createLinearGradient(cx, cy, targetX, targetY);
        spurGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        spurGrad.addColorStop(0.3, 'rgba(255, 140, 20, 0.2)');
        spurGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.strokeStyle = spurGrad;
        ctx.lineWidth = 0.5 + Math.random() * 1.5;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();
      }
    }
  } else {
    // Horizontal anamorphic light beam matching the attachment exactly
    canvas.width = 2048;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const cw = 2048;
      const ch = 256;
      
      // Horizontal fade linear streak
      const grad = ctx.createLinearGradient(0, ch / 2, cw, ch / 2);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.2, 'rgba(0, 160, 255, 0.0)');
      grad.addColorStop(0.35, 'rgba(0, 200, 255, 0.25)'); // Glowing cyan sides
      grad.addColorStop(0.46, 'rgba(130, 240, 255, 0.8)'); // Extreme hot cyan core side
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 1.0)');   // Blinding white center focus
      grad.addColorStop(0.54, 'rgba(130, 240, 255, 0.8)');
      grad.addColorStop(0.65, 'rgba(0, 200, 255, 0.25)');
      grad.addColorStop(0.8, 'rgba(0, 160, 255, 0.0)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, ch / 2 - 40, cw, 80);
      
      // Sharp, intense central beam overlay
      const beamGrad = ctx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, 80);
      beamGrad.addColorStop(0, '#ffffff');
      beamGrad.addColorStop(0.2, 'rgba(255, 255, 255, 1.0)');
      beamGrad.addColorStop(0.6, 'rgba(0, 242, 255, 0.4)');
      beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = beamGrad;
      ctx.globalCompositeOperation = 'screen';
      ctx.fillRect(cw / 2 - 200, ch / 2 - 100, 400, 200);
      
      // Add extra vertical pinch and glare focus overlay
      const radialGrad = ctx.createLinearGradient(cw / 2, 0, cw / 2, ch);
      radialGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      radialGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
      radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = radialGrad;
      ctx.fillRect(0, ch / 2 - 12, cw, 24);
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper to generate a sharp glowing 2D shockwave ring texture with psychedelic multi-band symmetry
function createShockwaveTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = 512;
    const cy = 512;
    
    ctx.clearRect(0, 0, 1024, 1024);
    
    // First pass: Hot pink to turquoise ionization backdrop
    const thermalGrad = ctx.createRadialGradient(cx, cy, 120, cx, cy, 380);
    thermalGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    thermalGrad.addColorStop(0.35, 'rgba(255, 0, 128, 0.12)'); // hot magenta ionization
    thermalGrad.addColorStop(0.70, 'rgba(0, 242, 255, 0.08)');  // neon cyan halo
    thermalGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = thermalGrad;
    ctx.fillRect(0, 0, 1024, 1024);

    // Second pass: Intense multi-band main shock front
    const grad = ctx.createRadialGradient(cx, cy, 280, cx, cy, 512);
    grad.addColorStop(0, 'rgba(0, 210, 255, 0)');
    grad.addColorStop(0.35, 'rgba(0, 210, 255, 0.05)');
    grad.addColorStop(0.72, 'rgba(0, 242, 255, 0.72)'); // Neon electric cyan edge
    grad.addColorStop(0.85, 'rgba(255, 255, 255, 1.0)'); // White-hot core thermal peak
    grad.addColorStop(0.92, 'rgba(255, 0, 110, 0.85)');  // Sizzling magenta backing plasma
    grad.addColorStop(0.97, 'rgba(255, 130, 0, 0.45)');   // Golden flame outermost crown
    grad.addColorStop(1.0, 'rgba(120, 0, 255, 0)');
    
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1024, 1024);
    
    // Turn on screen composite mode for high-luminosity additive details
    ctx.globalCompositeOperation = 'screen';

    // Draw 12-fold symmetrical discharge spokes of the stellar mandala/kaleidoscope
    ctx.strokeStyle = 'rgba(255, 0, 140, 0.28)'; // Intense glowing magenta spokes
    ctx.lineWidth = 1.8;
    for (let s = 0; s < 12; s++) {
      const angle = (s * 2 * Math.PI) / 12;
      const startRadius = 240;
      const endRadius = 500;
      const sx = cx + Math.cos(angle) * startRadius;
      const sy = cy + Math.sin(angle) * startRadius;
      const ex = cx + Math.cos(angle) * endRadius;
      const ey = cy + Math.sin(angle) * endRadius;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.stroke();
    }

    // Thin sacred-geometry structural hexagon outline
    ctx.strokeStyle = 'rgba(0, 242, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let h = 0; h <= 6; h++) {
      const angle = (h * 2 * Math.PI) / 6;
      const px = cx + Math.cos(angle) * 360;
      const py = cy + Math.sin(angle) * 360;
      if (h === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    
    // Draw wavy energy discharge rings for extreme photorealistic depth
    for (let rIdx = 0; rIdx < 5; rIdx++) {
      ctx.strokeStyle = `rgba(0, 242, 255, ${0.15 - rIdx * 0.025})`;
      ctx.lineWidth = 3.0 + rIdx * 2.0;
      ctx.beginPath();
      const radius = 380 + rIdx * 20;
      const numPoints = 64;
      for (let pIdx = 0; pIdx <= numPoints; pIdx++) {
        const angle = (pIdx / numPoints) * Math.PI * 2;
        const noiseFactor = Math.sin(angle * 12.0) * 8.0;
        const px = cx + Math.cos(angle) * (radius + noiseFactor);
        const py = cy + Math.sin(angle) * (radius + noiseFactor);
        if (pIdx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper to generate a sharp glowing diamond/shard texture for energetic debris shards
function createDebrisSparkTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = 32;
    const cy = 32;
    ctx.clearRect(0, 0, 64, 64);
    
    // Draw a sharp glowing diamond/shard spark
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 28);
    ctx.quadraticCurveTo(cx, cy, cx + 28, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + 28);
    ctx.quadraticCurveTo(cx, cy, cx - 28, cy);
    ctx.closePath();
    ctx.fill();
    
    // Smooth out-of-focus soft outer glow
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.7)');
    grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 32, 0, Math.PI * 2);
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Global cache for the debris spark texture to prevent recreating on every single explosion
let debrisSparkTextureCache: THREE.Texture | null = null;
const getDebrisSparkTexture = (): THREE.Texture => {
  if (!debrisSparkTextureCache) {
    debrisSparkTextureCache = createDebrisSparkTexture();
  }
  return debrisSparkTextureCache;
};

// Spawn a transient particle system representing debris shards that rotate and fade out
function spawnExplosionDebrisShards(
  scene: THREE.Scene,
  position: THREE.Vector3,
  scaleVal: number,
  transientList: any[],
  parentDrift?: THREE.Vector3,
  isSupernova: boolean = false
) {
  // Count: scale the volume of particles based on size of asteroid & whether it is part of the massive supernova
  const particleCount = isSupernova ? 55 + Math.floor(Math.random() * 35) : 34 + Math.floor(Math.random() * 20);
  
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const velocities: THREE.Vector3[] = [];

  // Supernova explosions and asteroid shattering are highly energetic and psychedelic!
  // Cosmic psychedelic palette: orchid neon pink, neon magenta, electric cyan, vivid amethyst, acid lime, sunburst orange-gold
  const colorsPalette = [
    new THREE.Color(0xff00ff), // Vivid Hot Magenta
    new THREE.Color(0x00ffff), // Brilliant Electric Cyan
    new THREE.Color(0x8a2be2), // Blue Violet / Amethyst
    new THREE.Color(0xff007f), // Neon Rose
    new THREE.Color(0x39ff14), // Acid/Electric Green
    new THREE.Color(0xff4500), // Vibrant Orange/Red
    new THREE.Color(0xffffff), // Hot Star White
  ];

  for (let i = 0; i < particleCount; i++) {
    const radius = 0.10 * scaleVal * (0.8 + Math.random() * 0.7);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    
    const dx = radius * Math.sin(phi) * Math.cos(theta);
    const dy = radius * Math.sin(phi) * Math.sin(theta);
    const dz = radius * Math.cos(phi);

    positions[i * 3] = position.x + dx;
    positions[i * 3 + 1] = position.y + dy;
    positions[i * 3 + 2] = position.z + dz;

    // Fast spherical expansion velocity!
    const speed = (isSupernova ? 32.0 : 7.0) + Math.random() * (isSupernova ? 48.0 : 13.0);
    const vDir = new THREE.Vector3(dx, dy, dz).normalize();
    const vel = vDir.multiplyScalar(speed);
    if (parentDrift) {
      vel.add(parentDrift);
    }
    if (isSupernova) {
      // Powerful forward propel to pass right through and beyond the camera view (Z > 15)
      vel.z += 110.0 + Math.random() * 150.0;
      vel.multiplyScalar(2.2);
    }
    velocities.push(vel);

    // Pick a highly colorful, psychedelic color
    const colIdx = Math.floor(Math.random() * colorsPalette.length);
    const col = colorsPalette[colIdx].clone();

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: isSupernova ? 4.5 : 2.5,
    map: getDebrisSparkTexture(),
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    vertexColors: true
  });

  const points = new THREE.Points(geom, mat);
  scene.add(points);

  // Random spin speed for the entire rotating particle system
  const rotVel = new THREE.Vector3(
    (Math.random() - 0.5) * 8.0,
    (Math.random() - 0.5) * 8.0,
    (Math.random() - 0.5) * 8.0
  );

  transientList.push({
    points,
    velocities,
    age: 0,
    maxAge: (isSupernova ? 5.5 : 1.4) + Math.random() * (isSupernova ? 3.0 : 0.8),
    rotVel,
    drag: isSupernova ? 0.995 : 0.95
  });
}

// Helper to generate a soft circular glow texture for explosion spark embers
function createSparkTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const cx = 16;
    const cy = 16;
    ctx.clearRect(0, 0, 32, 32);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
    grad.addColorStop(0.2, 'rgba(255, 230, 130, 0.9)');
    grad.addColorStop(0.5, 'rgba(255, 110, 20, 0.4)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Helper to generate an awe-inspiring, hyper-photorealistic cosmic nebula cloud with high detail, shock filaments, and obscuring dark dust lanes
function createNebulaTexture(type: 'violet' | 'orange' | 'cyan'): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, 1024, 1024);

    // Turn on screen composite mode for high-luminosity color blends
    ctx.globalCompositeOperation = 'screen';

    // Generates complex, organic cluster-like gas clouds by drawing offset soft gradients
    const drawCloudCluster = (cx: number, cy: number, baseRadius: number, colors: string[]) => {
      const passes = 16; // increased passes for extra volumetric smoke layering
      for (let p = 0; p < passes; p++) {
        const angle = (p / passes) * Math.PI * 2 + Math.random() * 0.5;
        const distance = Math.random() * (baseRadius * 0.60);
        const px = cx + Math.cos(angle) * distance;
        const py = cy + Math.sin(angle) * distance;
        const radius = baseRadius * (0.40 + Math.random() * 0.70);

        const grad = ctx.createRadialGradient(px, py, 0, px, py, radius);
        grad.addColorStop(0, colors[0]);
        grad.addColorStop(0.20, colors[1]);
        grad.addColorStop(0.50, colors[2]);
        grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (type === 'violet') {
      // Hydrogen-Alpha crimson core fading to deep ionized helium amethyst and sapphire boundary
      drawCloudCluster(512, 512, 450, [
        'rgba(145, 15, 185, 0.85)',   // ionized dense purple-crimson
        'rgba(195, 25, 115, 0.62)',   // warm stellar H-alpha neon red-pink
        'rgba(15, 55, 185, 0.45)',    // cold indigo-sapphire boundary
      ]);
      drawCloudCluster(360, 440, 320, [
        'rgba(95, 20, 160, 0.75)',    // sulfur violet gas core
        'rgba(165, 10, 85, 0.52)',    // diffused pink thermal shockwave
        'rgba(0, 0, 0, 0)',
      ]);
      drawCloudCluster(620, 360, 285, [
        'rgba(155, 23, 115, 0.60)',   // high entropy amethyst plume
        'rgba(30, 80, 210, 0.40)',    // outer sapphire dust shell
        'rgba(0, 0, 0, 0)',
      ]);
    } else if (type === 'orange') {
      // Blazing thermonuclear helium-3 cores, volcanic sulfur golds, and hydrogen-alpha crimson clouds
      drawCloudCluster(512, 512, 440, [
        'rgba(240, 62, 2, 0.86)',     // ultra-intense lava orange
        'rgba(245, 172, 4, 0.68)',     // brilliant golden gas vents
        'rgba(182, 10, 15, 0.45)',     // cooling sulfur crimson dust
      ]);
      drawCloudCluster(620, 580, 290, [
        'rgba(235, 115, 15, 0.74)',    // solar corona amber waves
        'rgba(190, 25, 10, 0.55)',     // turbulent carbon dust veins
        'rgba(0, 0, 0, 0)',
      ]);
      drawCloudCluster(400, 450, 260, [
        'rgba(250, 205, 155, 0.75)',   // white-hot copper solar nursery
        'rgba(135, 15, 5, 0.42)',      // deep background dark crimson smoke
        'rgba(0, 0, 0, 0)',
      ]);
    } else {
      // Oxygen-III turquoise winds, fast moving helium teal streams, and deep nitrogen sea lines
      drawCloudCluster(512, 512, 420, [
        'rgba(2, 205, 225, 0.85)',    // blinding cyan stellar wind streams
        'rgba(2, 225, 125, 0.65)',    // hot oxygen emerald filaments
        'rgba(12, 45, 195, 0.42)',    // cold background nitrogen violet
      ]);
      drawCloudCluster(400, 600, 280, [
        'rgba(32, 185, 165, 0.72)',   // rich turquoise gas currents
        'rgba(2, 205, 215, 0.55)',    // ionized oxygen teal plume
        'rgba(0, 0, 0, 0)',
      ]);
      drawCloudCluster(620, 440, 250, [
        'rgba(12, 155, 115, 0.68)',   // neon oxygen emerald strands
        'rgba(40, 100, 215, 0.45)',   // deep space azure shadow
        'rgba(0, 0, 0, 0)',
      ]);
    }

    // DRAW SHIFTING COMPLEX IONIZED FILAMENT THREADS (hot localized shock fronts using Canvas blur shadow)
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 10;
    for (let f = 0; f < 18; f++) {
      const glowColor = type === 'violet' 
        ? 'rgba(236, 72, 253, 0.70)' 
        : type === 'orange' 
          ? 'rgba(251, 146, 60, 0.70)' 
          : 'rgba(45, 212, 235, 0.70)';
      
      ctx.strokeStyle = glowColor;
      ctx.shadowColor = glowColor;
      
      ctx.beginPath();
      let x = Math.random() * 260 + 382;
      let y = Math.random() * 260 + 382;
      ctx.moveTo(x, y);
      for (let s = 0; s < 10; s++) {
        const cp1x = x + (Math.random() - 0.5) * 130;
        const cp1y = y + (Math.random() - 0.5) * 130;
        const cp2x = x + (Math.random() - 0.5) * 130;
        const cp2y = y + (Math.random() - 0.5) * 130;
        x += (Math.random() - 0.5) * 100;
        y += (Math.random() - 0.5) * 100;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
      }
      ctx.stroke();
    }
    
    // Reset canvas shadow filter to prevent blurring subsequent drawings
    ctx.shadowBlur = 0;

    // DRAW SPECTACULAR OBSCURING DARK COAL DUST LANES (blots out the glowing plasma, creating true 3D volumetric feel!)
    // We switch back to normal blending so dark colors are painted on top of the glowing background!
    ctx.globalCompositeOperation = 'source-over';
    
    const dustLanesCount = 5 + Math.floor(Math.random() * 4);
    for (let d = 0; d < dustLanesCount; d++) {
      const cx = 200 + Math.random() * 624;
      const cy = 200 + Math.random() * 624;
      const r = 160 + Math.random() * 150;
      
      // Draw a soft charcoal/soot cloud gradient to blot out gas glow underneath
      const dustGrad = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r);
      dustGrad.addColorStop(0, 'rgba(8, 7, 6, 0.94)'); // near-opaque absolute dust blocking
      dustGrad.addColorStop(0.40, 'rgba(15, 12, 10, 0.81)'); // dark chocolate cosmic soil
      dustGrad.addColorStop(0.72, 'rgba(26, 22, 20, 0.42)'); // wispy dark ash margins
      dustGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      
      ctx.fillStyle = dustGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // High density of cosmic nursery micro stardust grains
    ctx.globalCompositeOperation = 'screen';
    for (let s = 0; s < 280; s++) {
      const sx = Math.random() * 1024;
      const sy = Math.random() * 1024;
      const r = Math.random() * 1.8;
      const opacity = 0.25 + Math.random() * 0.75;
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Stable static colors for the thermology cooling animation
const COOL_BASE_COLOR = new THREE.Color(0x030305);
const HOT_HEAT_COLOR = new THREE.Color(0xffaa22);
const EMISSIVE_CYAN_COLOR = new THREE.Color(0x00f2ff);
const EMISSIVE_WHITE_COLOR = new THREE.Color(0xffffff);

export const ThreeScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    phase,
    pilotConfig,
    telemetry,
    opticMode,
    filterEffect,
    screenShake,
    setPhase,
    addTelemetryLog,
    addError,
    triggerScreenShake,
    updateTelemetry,
    setLoadingProgress,
    spotlightActive,
    spotlightIntensity,
    spotlightColor,
    spotlightAngle,
    asteroidTheme,
  } = useAppState();

  const { playWarpWhoosh, playPassagePulse, playDiagnosticBlip, playNearMissSwoosh } = useAudio();

  // Keep refs for rendering accesses
  const phaseRef = useRef(phase);
  const opticModeRef = useRef(opticMode);
  const filterEffectRef = useRef(filterEffect);
  const telemetryRef = useRef(telemetry);
  const colorRef = useRef(pilotConfig.hudColor);
  const spotlightActiveRef = useRef(spotlightActive);
  const spotlightIntensityRef = useRef(spotlightIntensity);
  const spotlightColorRef = useRef(spotlightColor);
  const spotlightAngleRef = useRef(spotlightAngle);
  const screenShakeRef = useRef(screenShake);

  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => {
    if (phase === 'FLIGHT') {
      shipPosRef.current.set(0, 0, -50);
      shipVRef.current.set(0, 0, 0);
      hasLoggedExitFieldRef.current = false;
      hasLoggedEnterFieldRef.current = true;
    }
  }, [phase]);
  useEffect(() => { opticModeRef.current = opticMode; }, [opticMode]);
  useEffect(() => { filterEffectRef.current = filterEffect; }, [filterEffect]);
  useEffect(() => { telemetryRef.current = telemetry; }, [telemetry]);
  useEffect(() => { colorRef.current = pilotConfig.hudColor; }, [pilotConfig.hudColor]);
  useEffect(() => { spotlightActiveRef.current = spotlightActive; }, [spotlightActive]);
  useEffect(() => { spotlightIntensityRef.current = spotlightIntensity; }, [spotlightIntensity]);
  useEffect(() => { spotlightColorRef.current = spotlightColor; }, [spotlightColor]);
  useEffect(() => { spotlightAngleRef.current = spotlightAngle; }, [spotlightAngle]);
  useEffect(() => { screenShakeRef.current = screenShake; }, [screenShake]);

  const asteroidThemeRef = useRef<AsteroidTheme>(asteroidTheme);

  const getSkyColorsForTheme = (theme: AsteroidTheme) => {
    switch (theme) {
      case 'CHROME_BLOOD':
        return {
          nebula1: new THREE.Color(0xb20000),      // blood red
          nebula2: new THREE.Color(0x590000),      // dark crimson
          nebula3: new THREE.Color(0xff4d4d),      // red flare
          background: new THREE.Color(0x100101),   // blood red void
        };
      case 'GOLD_GUNMETAL':
        return {
          nebula1: new THREE.Color(0x3a4556),      // gunmetal grey
          nebula2: new THREE.Color(0x1e2530),      // dark charcoal
          nebula3: new THREE.Color(0x535f72),      // steel grey
          background: new THREE.Color(0x050609),   // slate void
        };
      case 'OBSIDIAN_MOTTLED':
        return {
          nebula1: new THREE.Color(0xd4af37),      // gold dust
          nebula2: new THREE.Color(0xc0c0c0),      // silver dust
          nebula3: new THREE.Color(0xbfa555),      // gold highlights
          background: new THREE.Color(0x06050b),   // obsidian void
        };
      case 'CARBON_VIOLET':
        return {
          nebula1: new THREE.Color(0x4c0519),      // wine
          nebula2: new THREE.Color(0x6b21a8),      // electric violet
          nebula3: new THREE.Color(0xd946ef),      // magenta
          background: new THREE.Color(0x0c011a),   // grid void
        };
      case 'OPAL_STARDUST':
        return {
          nebula1: new THREE.Color(0xfba875),      // peach
          nebula2: new THREE.Color(0xacd2e6),      // pastel blue
          nebula3: new THREE.Color(0xc5aed5),      // lavender
          background: new THREE.Color(0x0c0817),   // opal void
        };
      case 'IRON_GREEN':
        return {
          nebula1: new THREE.Color(0x15803d),      // bio green
          nebula2: new THREE.Color(0x14532d),      // forest green
          nebula3: new THREE.Color(0x22c55e),      // vibrant radioactive green
          background: new THREE.Color(0x011405),   // toxic void
        };
      case 'QUICKSILVER_COPPER':
        return {
          nebula1: new THREE.Color(0xc2410c),      // flaming copper
          nebula2: new THREE.Color(0x7c2d12),      // magma rust
          nebula3: new THREE.Color(0xea580c),      // solar flare
          background: new THREE.Color(0x120300),   // plasma void
        };
      default:
        return {
          nebula1: new THREE.Color(0x1d4ed8),
          nebula2: new THREE.Color(0xd97736),
          nebula3: new THREE.Color(0x111827),
          background: new THREE.Color(0x000103),
        };
    }
  };

  const updateAsteroidMaterials = (theme: AsteroidTheme) => {
    if (!asteroidsRef.current || asteroidsRef.current.length === 0) return;
    
    asteroidsRef.current.forEach((rock) => {
      if (rock.material instanceof THREE.MeshPhysicalMaterial) {
        const mat = rock.material;
        
        switch (theme) {
          case 'CHROME_BLOOD':
            // Anorthosite Highlands (Dusty pale lunar highlands type rock)
            mat.color.setHex(0xbabac0);
            mat.metalness = 0.05;
            mat.roughness = 0.85; 
            mat.clearcoat = 0.0;  
            mat.clearcoatRoughness = 1.0; 
            mat.specularIntensity = 0.25;
            mat.iridescence = 0.0;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
            mat.bumpScale = 1.8;
            break;
            
          case 'GOLD_GUNMETAL':
            // Chondrite Basalt (Rich deep charcoal stone)
            mat.color.setHex(0x3a3a3d);
            mat.metalness = 0.08;
            mat.roughness = 0.82; 
            mat.clearcoat = 0.0;
            mat.clearcoatRoughness = 1.0;
            mat.specularIntensity = 0.22;
            mat.iridescence = 0.0;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
            mat.bumpScale = 2.2;
            break;
            
          case 'OBSIDIAN_MOTTLED':
            // Carbonaceous Chondrite (Matte coal-black ancient matrix rock)
            mat.color.setHex(0x1a1a1c);
            mat.metalness = 0.04;
            mat.roughness = 0.90; 
            mat.clearcoat = 0.0;
            mat.clearcoatRoughness = 1.0;
            mat.specularIntensity = 0.20;
            mat.iridescence = 0.0;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
            mat.bumpScale = 1.6;
            break;
            
          case 'CARBON_VIOLET':
            // Nickel-Iron Core (Weathered grey metal octahedral structure with stony silicate inclusions)
            mat.color.setHex(0x6e6e73);
            mat.metalness = 0.45;
            mat.roughness = 0.60; 
            mat.clearcoat = 0.0;
            mat.clearcoatRoughness = 1.0;
            mat.specularIntensity = 0.38;
            mat.iridescence = 0.0;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
            mat.bumpScale = 2.0;
            break;
            
          case 'OPAL_STARDUST':
            // Silicate Breccia (Variegated angular rock clasts cemented in dark grey matrix)
            mat.color.setHex(0x48484a);
            mat.metalness = 0.06;
            mat.roughness = 0.78; 
            mat.clearcoat = 0.0;
            mat.clearcoatRoughness = 1.0;
            mat.specularIntensity = 0.24;
            mat.iridescence = 0.0;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
            mat.bumpScale = 1.9;
            break;
            
          case 'IRON_GREEN':
            // Olivine Pallasite (Stony-iron mixture of olivine crystals in nickel-iron lattice)
            mat.color.setHex(0x323c34);
            mat.metalness = 0.12;
            mat.roughness = 0.80;
            mat.clearcoat = 0.0;
            mat.clearcoatRoughness = 1.0;
            mat.specularIntensity = 0.28;
            mat.iridescence = 0.0;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
            mat.bumpScale = 1.8;
            break;
            
          case 'QUICKSILVER_COPPER':
            // Regolith Dust (Heavily pulverized dusty light-brown space soil covers)
            mat.color.setHex(0x4e463f);
            mat.metalness = 0.03;
            mat.roughness = 0.92; 
            mat.clearcoat = 0.0;
            mat.clearcoatRoughness = 1.0;
            mat.specularIntensity = 0.18;
            mat.iridescence = 0.0;
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0.0;
            mat.bumpScale = 2.4;
            break;
        }
        
        mat.needsUpdate = true;
      }
    });

    if (instancedAsteroidsRef.current && instancedAsteroidsRef.current.material instanceof THREE.MeshPhysicalMaterial) {
      const mat = instancedAsteroidsRef.current.material;
      switch (theme) {
        case 'CHROME_BLOOD':
          mat.color.setHex(0xbabac0);
          mat.metalness = 0.05;
          mat.roughness = 0.85; 
          mat.clearcoat = 0.0;  
          mat.clearcoatRoughness = 1.0; 
          mat.specularIntensity = 0.25;
          mat.iridescence = 0.0;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.bumpScale = 1.8;
          break;
        case 'GOLD_GUNMETAL':
          mat.color.setHex(0x3a3a3d);
          mat.metalness = 0.08;
          mat.roughness = 0.82; 
          mat.clearcoat = 0.0;
          mat.clearcoatRoughness = 1.0;
          mat.specularIntensity = 0.22;
          mat.iridescence = 0.0;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.bumpScale = 2.2;
          break;
        case 'OBSIDIAN_MOTTLED':
          mat.color.setHex(0x1a1a1c);
          mat.metalness = 0.04;
          mat.roughness = 0.90; 
          mat.clearcoat = 0.0;
          mat.clearcoatRoughness = 1.0;
          mat.specularIntensity = 0.20;
          mat.iridescence = 0.0;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.bumpScale = 1.6;
          break;
        case 'CARBON_VIOLET':
          mat.color.setHex(0x6e6e73);
          mat.metalness = 0.45;
          mat.roughness = 0.60; 
          mat.clearcoat = 0.0;
          mat.clearcoatRoughness = 1.0;
          mat.specularIntensity = 0.38;
          mat.iridescence = 0.0;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.bumpScale = 2.0;
          break;
        case 'OPAL_STARDUST':
          mat.color.setHex(0x48484a);
          mat.metalness = 0.06;
          mat.roughness = 0.78; 
          mat.clearcoat = 0.0;
          mat.clearcoatRoughness = 1.0;
          mat.specularIntensity = 0.24;
          mat.iridescence = 0.0;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.bumpScale = 1.9;
          break;
        case 'IRON_GREEN':
          mat.color.setHex(0x323c34);
          mat.metalness = 0.12;
          mat.roughness = 0.80;
          mat.clearcoat = 0.0;
          mat.clearcoatRoughness = 1.0;
          mat.specularIntensity = 0.28;
          mat.iridescence = 0.0;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.bumpScale = 1.8;
          break;
        case 'QUICKSILVER_COPPER':
          mat.color.setHex(0x4e463f);
          mat.metalness = 0.03;
          mat.roughness = 0.92; 
          mat.clearcoat = 0.0;
          mat.clearcoatRoughness = 1.0;
          mat.specularIntensity = 0.18;
          mat.iridescence = 0.0;
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0.0;
          mat.bumpScale = 2.4;
          break;
      }
      mat.needsUpdate = true;
    }
  };

  // Subtly shift ambient environment lighting color based on the current phase (lerps smoothly)
  const shiftAmbientColor = (currentPhase: AppPhase, delta: number) => {
    if (!ambientLightRef.current) return;
    
    // Choose the target color based on phase
    let targetHex = 0x111622; // Default cool dark blue-grey
    
    switch (currentPhase) {
      case 'BOOT':
        targetHex = 0x05132d; // Cooler blue (deep submarine/cold diagnostic)
        break;
      case 'INIT':
        targetHex = 0x071e1b; // Cool medical/radar teal-cyan
        break;
      case 'FLIGHT':
        targetHex = 0x221307; // Warmer ambient amber-gold (warm cockpit/stellar light integration)
        break;
      case 'DESTINATION':
        targetHex = 0x160a28; // Regal deep space violet/purple
        break;
      case 'EXIT':
        targetHex = 0x2c0505; // Hot reactor crimson / nuclear starlight
        break;
      default:
        targetHex = 0x111622;
    }
    
    const targetColor = new THREE.Color(targetHex);
    // Smoothly interpolate the ambient light's color toward targetColor
    ambientLightRef.current.color.lerp(targetColor, delta * 1.5);
  };

  useEffect(() => {
    asteroidThemeRef.current = asteroidTheme;
    updateAsteroidMaterials(asteroidTheme);
    
    if (sceneRef.current) {
      const cls = getSkyColorsForTheme(asteroidTheme);
      sceneRef.current.background = cls.background;
    }
  }, [asteroidTheme]);

  // Three.js Core Objects
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const lensPassRef = useRef<ShaderPass | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  
  // Dynamic 3D assets list
  const logoModelRef = useRef<THREE.Group | null>(null);
  const asteroidsRef = useRef<THREE.Mesh[]>([]);
  const activeBulletsRef = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; color: string; duration: number; age: number; type: string }[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const debrisFieldRef = useRef<{ mesh: THREE.Mesh; vel: THREE.Vector3; rotVel: THREE.Vector3; age: number }[]>([]);
  const transientExplosionsRef = useRef<{
    points: THREE.Points;
    velocities: THREE.Vector3[];
    age: number;
    maxAge: number;
    rotVel: THREE.Vector3;
    drag: number;
  }[]>([]);
  const starsRef = useRef<THREE.Points | null>(null);
  const permanentNebulaRef = useRef<THREE.Mesh | null>(null);
  const instancedAsteroidsRef = useRef<THREE.InstancedMesh | null>(null);
  const warpLinesRef = useRef<THREE.LineSegments | null>(null);
  const warpBaseCoordsRef = useRef<Float32Array | null>(null);
  const warpShaderTunnelRef = useRef<THREE.Mesh<THREE.CylinderGeometry, THREE.ShaderMaterial> | null>(null);
  const bootTimeElapsedRef = useRef<number>(0.0);
  const initTimeElapsedRef = useRef<number>(0.0);
  const cameraApproachProgressRef = useRef<number>(0.0);
  const dustBeltRef = useRef<THREE.Points | null>(null);
  const gateMeshRef = useRef<THREE.Group | null>(null);
  const coreMeshRef = useRef<THREE.Group | null>(null);
  const logoWidthRef = useRef<number>(5.0); // Perfect container for dynamic padding math
  const logoScaleRef = useRef<number>(0.001);
  const logoHeatRef = useRef<number>(1.0);
  const logoZRef = useRef<number>(-200);
  const logoSpinSpeedRef = useRef<number>(-0.25);
  const glassDustMeshRef = useRef<THREE.Points | null>(null);
  const glassDustSpeedsRef = useRef<Float32Array | null>(null);
  const meteorShowerRef = useRef<THREE.LineSegments | null>(null);
  const meteorSpeedsRef = useRef<Float32Array | null>(null);
  const meteorOffsetsRef = useRef<Float32Array | null>(null);
  const meteorDirsRef = useRef<Float32Array | null>(null);
  const meteorAgesRef = useRef<Float32Array | null>(null);
  
  // High-fidelity procedural fractal textures and physical animation states for realistic cosmic kinematics
  const fractalTextureRef = useRef<THREE.Texture | null>(null);
  const logoPhysicsActive = useRef<boolean>(false);
  const logoZ = useRef<number>(-300.0);
  const logoVelZ = useRef<number>(0.0);
  const logoRotY = useRef<number>(0.0);
  const logoRotVelY = useRef<number>(0.0);
  
  const explosionSparksRef = useRef<THREE.Points | null>(null);
  const explosionRingSparksRef = useRef<THREE.Points | null>(null);
  
  // Lights
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const explosionLightRef = useRef<THREE.PointLight | null>(null);
  const shipSpotlightRef = useRef<THREE.SpotLight | null>(null);
  const spotlightConeRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);

  const shockwaveZRef = useRef<number>(-500.0);
  const shockwaveActiveRef = useRef<boolean>(false);

  const geoDodecSharedRef = useRef<THREE.DodecahedronGeometry | null>(null);
  const geoIcosSharedRef = useRef<THREE.IcosahedronGeometry | null>(null);
  const geoTetraSharedRef = useRef<THREE.TetrahedronGeometry | null>(null);
  const matMoltenSharedRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const matCrustSharedRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const matBasaltSharedRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Blinding white screen flash overlay reference
  const flashOverlayRef = useRef<HTMLDivElement | null>(null);

  // GSAP Timeline Tracker for the 16-second cinematic intro
  const cinematicTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const [skipTimerVisible, setSkipTimerVisible] = useState(false);
  const [cinematicRemaining, setCinematicRemaining] = useState(16);

  // Pilot steering vectors tracking
  const shipVelocityRef = useRef(new THREE.Vector3(0, 0, 0));
  const gForceOffsetRef = useRef(new THREE.Vector3(0, 0, 0));
  const userControlledPosRef = useRef(new THREE.Vector3(0, 0, 0));
  const lastTelemetryUpdateRef = useRef<number>(0);
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Advanced physical ship coordinate and velocity trackers in absolute 3D space
  const shipPosRef = useRef(new THREE.Vector3(0, 0, -50)); // Starting position Z = -50
  const shipVRef = useRef(new THREE.Vector3(0, 0, 0)); // Newtonian velocity vector
  const hasLoggedExitFieldRef = useRef(false);
  const hasLoggedEnterFieldRef = useRef(true);
  const lastAutoEvasionLogRef = useRef<number>(0);
  const glitchFactorRef = useRef<number>(0.0); // Procedural glitch decay tracker
  const chromaticFringingRef = useRef<number>(0.0016); // Local chromatic fringing target

  // Warp effect states persistent tracking
  const warpStateRef = useRef<{ active: boolean; level: 'low' | 'med' | 'high' | 'none'; transition: number }>({
    active: false,
    level: 'none',
    transition: 0.0
  });

  // Custom warp transition triggers, entrance visual flashes, and exit materialize wave timelines
  const prevWarpActiveRef = useRef<boolean>(false);
  const warpStartEffectTimerRef = useRef<number>(0.0);
  const warpExitEffectTimerRef = useRef<number>(0.0);
  const flightGridGroupRef = useRef<THREE.Group | null>(null);
  const tacticalSpaceGridRef = useRef<THREE.GridHelper | null>(null);

  // Parallax star shader accumulated kinematics
  const starSpeedAccumRef = useRef<number>(0.0);
  const starDriftOffsetRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

  // Pointer mouse coordinates for dynamic starfield parallax
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  // Persistent flight time tracker to animate camera closer to the asteroids throughout the flight
  const flightTimeRef = useRef<number>(0.0);
  const shockwaveHitRef = useRef<boolean>(false);
  const localCameraShakeRef = useRef<number>(0.0);

  useEffect(() => {
    // Utility to create high-gain waveshaper distortion for raw industrial overdrive clipping
    const makeDistorCurve = (amount = 45) => {
      const n_samples = 44100;
      const curve = new Float32Array(n_samples);
      const deg = Math.PI / 180;
      for (let i = 0; i < n_samples; ++i) {
        const x = (i * 2) / n_samples - 1;
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    };

    const playProceduralShootAudio = (weaponType: string) => {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtxClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        const now = ctx.currentTime;
        
        // Setup shared saturation and distortion units
        const saturation = ctx.createWaveShaper();
        saturation.curve = makeDistorCurve(55);
        
        const masterGainNode = ctx.createGain();
        masterGainNode.connect(ctx.destination);
        saturation.connect(masterGainNode);

        switch (weaponType) {
          case 'CHROME_BLOOD': {
            // Aggressive double-sawtooth gun with metallic transient snap
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const duration = 0.20;

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(450, now);
            osc1.frequency.exponentialRampToValueAtTime(65, now + duration);

            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(445, now); // slightly detuned for deep beating
            osc2.frequency.exponentialRampToValueAtTime(60, now + duration);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc1.connect(saturation);
            osc2.connect(saturation);
            gain.connect(masterGainNode);
            saturation.connect(gain);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
            break;
          }
          case 'GOLD_GUNMETAL': {
            // Heavy rivet driver: thudding low-end thump + sharp metal clang
            const subOsc = ctx.createOscillator();
            const clangOsc = ctx.createOscillator();
            const duration = 0.16;

            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(140, now);
            subOsc.frequency.linearRampToValueAtTime(32, now + duration);

            clangOsc.type = 'sawtooth';
            clangOsc.frequency.setValueAtTime(980, now); // high metallic ring
            clangOsc.frequency.exponentialRampToValueAtTime(400, now + duration * 0.5);

            const gainLine = ctx.createGain();
            gainLine.gain.setValueAtTime(0, now);
            gainLine.gain.linearRampToValueAtTime(0.24, now + 0.002);
            gainLine.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            subOsc.connect(gainLine);
            clangOsc.connect(saturation);
            saturation.connect(gainLine);
            gainLine.connect(masterGainNode);

            subOsc.start(now);
            clangOsc.start(now);
            subOsc.stop(now + duration);
            clangOsc.stop(now + duration);
            break;
          }
          case 'OBSIDIAN_MOTTLED': {
            // Void railgun charge & release sweep (distorted analog square scream)
            const osc = ctx.createOscillator();
            const sub = ctx.createOscillator();
            const duration = 0.28;

            osc.type = 'square';
            osc.frequency.setValueAtTime(60, now);
            osc.frequency.exponentialRampToValueAtTime(950, now + duration);

            sub.type = 'sine';
            sub.frequency.setValueAtTime(45, now);
            sub.frequency.exponentialRampToValueAtTime(120, now + duration);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.25, now + 0.015);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(saturation);
            sub.connect(gain); // Keep sub-bass clean for structural room shaking
            saturation.connect(gain);
            gain.connect(masterGainNode);

            osc.start(now);
            sub.start(now);
            osc.stop(now + duration);
            sub.stop(now + duration);
            break;
          }
          case 'CARBON_VIOLET': {
            // Sizzled mechanical laser beam (noise burst + resonant feedback filter sweep)
            const osc = ctx.createOscillator();
            const duration = 0.15;
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1400, now);
            osc.frequency.linearRampToValueAtTime(550, now + duration);

            // Sweeping bandpass noise layer
            const bSize = ctx.sampleRate * duration;
            const b = ctx.createBuffer(1, bSize, ctx.sampleRate);
            const bData = b.getChannelData(0);
            for (let i = 0; i < bSize; i++) {
              bData[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = b;

            const noiseFilter = ctx.createBiquadFilter();
            noiseFilter.type = 'bandpass';
            noiseFilter.Q.setValueAtTime(12, now);
            noiseFilter.frequency.setValueAtTime(2200, now);
            noiseFilter.frequency.exponentialRampToValueAtTime(600, now + duration);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.12, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(saturation);
            noise.connect(noiseFilter);
            noiseFilter.connect(gain);
            saturation.connect(gain);
            gain.connect(masterGainNode);

            osc.start(now);
            noise.start(now);
            osc.stop(now + duration);
            noise.stop(now + duration);
            break;
          }
          case 'OPAL_STARDUST': {
            // Distorted high-freq tachyon needle (crystalline spike)
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const duration = 0.18;

            osc1.type = 'sine';
            osc1.frequency.setValueAtTime(2200, now);
            osc1.frequency.exponentialRampToValueAtTime(320, now + duration);

            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(2245, now); // glassy detuning

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.14, now + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc1.connect(saturation);
            osc2.connect(saturation);
            saturation.connect(gain);
            gain.connect(masterGainNode);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
            break;
          }
          case 'IRON_GREEN': {
            // Toxic engine splutter (dissonant square low-end mortar)
            const osc = ctx.createOscillator();
            const sub = ctx.createOscillator();
            const duration = 0.30;

            osc.type = 'square';
            osc.frequency.setValueAtTime(170, now);
            osc.frequency.linearRampToValueAtTime(22, now + duration);

            sub.type = 'triangle';
            sub.frequency.setValueAtTime(85, now);
            sub.frequency.linearRampToValueAtTime(110, now + duration); // inverse drone rub

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.22, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(saturation);
            sub.connect(saturation);
            saturation.connect(gain);
            gain.connect(masterGainNode);

            osc.start(now);
            sub.start(now);
            osc.stop(now + duration);
            sub.stop(now + duration);
            break;
          }
          case 'QUICKSILVER_COPPER': {
            // Detroit industrial slag pulse
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const duration = 0.24;

            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(280, now);
            osc1.frequency.exponentialRampToValueAtTime(80, now + duration);

            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(450, now); // dissonance ring
            osc2.frequency.exponentialRampToValueAtTime(120, now + duration);

            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.18, now + 0.004);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc1.connect(saturation);
            osc2.connect(saturation);
            saturation.connect(gain);
            gain.connect(masterGainNode);

            osc1.start(now);
            osc2.start(now);
            osc1.stop(now + duration);
            osc2.stop(now + duration);
            break;
          }
          default: {
            const osc = ctx.createOscillator();
            const duration = 0.15;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(500, now);
            osc.frequency.linearRampToValueAtTime(100, now + duration);
            
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.14, now + 0.002);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(saturation);
            saturation.connect(gain);
            gain.connect(masterGainNode);

            osc.start(now);
            osc.stop(now + duration);
          }
        }
      } catch (err) {}
    };

    const playProceduralExplosionAudio = () => {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtxClass) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtxClass();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }
        
        const now = ctx.currentTime;
        const duration = 0.58; // slightly longer, cinematic decay
        
        // Setup central clipping/saturation waveshaper
        const saturation = ctx.createWaveShaper();
        saturation.curve = makeDistorCurve(75);
        saturation.oversample = '4x';

        // MASTER OUTPUT CONTROL
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.24, now + 0.015);
        masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        masterGain.connect(ctx.destination);

        // LAYER 1: Deep sub-harmonic structural boom
        const boomOsc = ctx.createOscillator();
        boomOsc.type = 'sine';
        boomOsc.frequency.setValueAtTime(95, now);
        boomOsc.frequency.exponentialRampToValueAtTime(22, now + duration);

        const boomGain = ctx.createGain();
        boomGain.gain.setValueAtTime(0.35, now);
        boomGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        
        boomOsc.connect(boomGain);
        boomGain.connect(masterGain); // clean line bypass to prevent sub mud

        // LAYER 2: Distorted grinding core shatter
        const coreOsc = ctx.createOscillator();
        coreOsc.type = 'sawtooth';
        coreOsc.frequency.setValueAtTime(160, now);
        coreOsc.frequency.linearRampToValueAtTime(26, now + duration * 0.8);

        const coreGain = ctx.createGain();
        coreGain.gain.setValueAtTime(0.28, now);
        coreGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

        coreOsc.connect(saturation);
        saturation.connect(coreGain);
        coreGain.connect(masterGain);

        // LAYER 3: White noise hull fragmentation / dust jet spray
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const bData = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          bData[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.Q.setValueAtTime(4.0, now);
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(40, now + duration);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.40, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(masterGain);

        // LAYER 4: High-frequency alloy metallic ringers (debris hitting shields / metal armor fractures)
        const metalOsc1 = ctx.createOscillator();
        const metalOsc2 = ctx.createOscillator();
        
        metalOsc1.type = 'triangle';
        metalOsc1.frequency.setValueAtTime(880, now);
        metalOsc1.frequency.linearRampToValueAtTime(415, now + duration * 0.4);

        metalOsc2.type = 'sine';
        metalOsc2.frequency.setValueAtTime(2135, now); // glassy alloy dissonances
        
        const metalGain = ctx.createGain();
        metalGain.gain.setValueAtTime(0.16, now);
        metalGain.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.35);

        metalOsc1.connect(saturation);
        metalOsc2.connect(saturation);
        saturation.connect(metalGain);
        metalGain.connect(masterGain);

        // Start all generators perfectly in sync
        boomOsc.start(now);
        coreOsc.start(now);
        noise.start(now);
        metalOsc1.start(now);
        metalOsc2.start(now);

        boomOsc.stop(now + duration);
        coreOsc.stop(now + duration);
        noise.stop(now + duration);
        metalOsc1.stop(now + duration);
        metalOsc2.stop(now + duration);
      } catch (err) {}
    };

    const shatterAsteroid = (rock: THREE.Mesh) => {
      if (!rock.visible) return;
      const scene = sceneRef.current;
      if (!scene) return;
      const uData = rock.userData;
      const rockScale = rock.scale.x;
      const shardCount = 8 + Math.floor(Math.random() * 6);

      const defaultGeom = new THREE.DodecahedronGeometry(1.0, 0);
      const defaultMat = new THREE.MeshStandardMaterial({ color: 0x161514 });

      for (let f = 0; f < shardCount; f++) {
        const size = (0.12 + Math.random() * 0.35) * rockScale * 0.65;
        const fragMesh = new THREE.Mesh(defaultGeom, defaultMat);
        fragMesh.scale.setScalar(size);
        fragMesh.userData = { isShared: true };

        fragMesh.position.copy(rock.position);
        fragMesh.position.x += (Math.random() - 0.5) * size * 2.5;
        fragMesh.position.y += (Math.random() - 0.5) * size * 2.5;
        fragMesh.position.z += (Math.random() - 0.5) * size * 2.5;

        const outward = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize();

        const blastForce = 60.0 + Math.random() * 80.0;
        const pushVelocity = outward.multiplyScalar(blastForce);
        pushVelocity.z += 5.0 + Math.random() * 25.0;

        const finalVel = uData.driftVector ? uData.driftVector.clone().add(pushVelocity) : pushVelocity;
        const finalRot = new THREE.Vector3(
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40,
          (Math.random() - 0.5) * 40
        );

        fragMesh.castShadow = false;
        fragMesh.receiveShadow = false;
        scene.add(fragMesh);

        debrisFieldRef.current.push({
          mesh: fragMesh,
          vel: finalVel,
          rotVel: finalRot,
          age: 0,
          duration: 3.5 + Math.random() * 2.5,
          drag: 0.985
        } as any);
      }

      try {
        const explosionF = (window as any).spawnExplosionDebrisShards || spawnExplosionDebrisShards;
        if (typeof explosionF === 'function') {
          explosionF(
            scene,
            rock.position,
            rockScale,
            transientExplosionsRef.current,
            uData.driftVector,
            true
          );
        }
      } catch (err) {}

      rock.visible = false;
      playProceduralExplosionAudio();
    };

    const handleFireWeapon = (e: Event) => {
      const customEvent = e as CustomEvent;
      const weaponType = customEvent.detail?.weaponType || asteroidThemeRef.current;
      
      const camera = cameraRef.current;
      const scene = sceneRef.current;
      if (!camera || !scene) return;

      let geom: THREE.BufferGeometry;
      let mat: THREE.Material;
      let speed = 400;
      let maxAge = 2.0;
      let colorHex = 0x00f2ff;

      switch (weaponType) {
        case 'CHROME_BLOOD':
          colorHex = 0xff2d2d;
          geom = new THREE.SphereGeometry(1.2, 8, 8);
          mat = new THREE.MeshBasicMaterial({ color: colorHex });
          speed = 360;
          break;
        case 'GOLD_GUNMETAL':
          colorHex = 0xf59e0b;
          geom = new THREE.CylinderGeometry(0.3, 0.3, 8, 4);
          geom.rotateX(Math.PI / 2);
          mat = new THREE.MeshBasicMaterial({ color: colorHex });
          speed = 680;
          break;
        case 'OBSIDIAN_MOTTLED':
          colorHex = 0x00f2ff;
          geom = new THREE.TorusGeometry(1.1, 0.25, 6, 12);
          mat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.9 });
          speed = 300;
          break;
        case 'CARBON_VIOLET':
          colorHex = 0xd946ef;
          geom = new THREE.CylinderGeometry(0.15, 0.15, 10, 4);
          geom.rotateX(Math.PI / 2);
          mat = new THREE.MeshBasicMaterial({ color: colorHex });
          speed = 750;
          break;
        case 'OPAL_STARDUST':
          colorHex = 0xfdba74;
          geom = new THREE.IcosahedronGeometry(0.8, 0);
          mat = new THREE.MeshBasicMaterial({ color: colorHex });
          speed = 350;
          break;
        case 'IRON_GREEN':
          colorHex = 0x22c55e;
          geom = new THREE.SphereGeometry(1.5, 6, 6);
          mat = new THREE.MeshBasicMaterial({ color: colorHex });
          speed = 310;
          break;
        case 'QUICKSILVER_COPPER':
          colorHex = 0xf97316;
          geom = new THREE.ConeGeometry(0.5, 3.2, 4);
          geom.rotateX(Math.PI / 2);
          mat = new THREE.MeshBasicMaterial({ color: colorHex });
          speed = 460;
          break;
        default:
          geom = new THREE.SphereGeometry(0.5, 6, 6);
          mat = new THREE.MeshBasicMaterial({ color: 0x00f2ff });
      }

      const mesh = new THREE.Mesh(geom, mat);
      const sideOffset = (activeBulletsRef.current.length % 2 === 0 ? 1 : -1);
      const startPos = new THREE.Vector3(
        camera.position.x + 4.2 * sideOffset,
        camera.position.y - 1.2,
        camera.position.z - 3.5
      );
      mesh.position.copy(startPos);
      
      const dir = new THREE.Vector3(
        pointerRef.current.x * 38.0,
        pointerRef.current.y * 28.0,
        -250.0
      ).normalize();
      
      const vel = dir.clone().multiplyScalar(speed);
      mesh.lookAt(mesh.position.clone().add(dir));
      scene.add(mesh);

      activeBulletsRef.current.push({
        mesh,
        vel,
        color: '#' + colorHex.toString(16),
        duration: maxAge,
        age: 0,
        type: weaponType
      });

      playProceduralShootAudio(weaponType);
    };

    const handleCanvasClick = (evt: MouseEvent) => {
      if (evt.target === canvasRef.current) {
        window.dispatchEvent(new CustomEvent('ship-fire-weapon'));
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyS', 'KeyA', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysPressedRef.current[e.code] = true;
      if (e.code === 'Space') {
        window.dispatchEvent(new CustomEvent('ship-fire-weapon'));
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };
    const handleThrustOverride = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { dirX, dirY } = customEvent.detail;
      if (dirX !== undefined) shipVelocityRef.current.x += dirX * 1.5;
      if (dirY !== undefined) shipVelocityRef.current.y += dirY * 1.5;
    };
    const handleWarpActive = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { active, level } = customEvent.detail;
      warpStateRef.current.active = active;
      warpStateRef.current.level = level;
      
      // Smooth warp visual transitions using GSAP
      gsap.to(warpStateRef.current, {
        transition: active ? 1.0 : 0.0,
        duration: active ? 1.8 : 2.6,
        ease: active ? 'power2.out' : 'power2.inOut',
      });

      if (active) {
        // Synchronous colorful propulsion streaks projecting from bottom sides
        confetti({
          particleCount: 70,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ['#00f2ff', '#00ffaa', '#3b82f6', '#ffffff'],
          scalar: 1.1,
          drift: 0.2,
        });
        confetti({
          particleCount: 70,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ['#00f2ff', '#00ffaa', '#3b82f6', '#ffffff'],
          scalar: 1.1,
          drift: -0.2,
        });
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Scale mouse center range: -1.0 to 1.0 (with safe width/height tracking)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.current.targetX = x;
      pointerRef.current.targetY = y;
    };

    const handlePointerLeave = () => {
      // Smoothly snap back to origin/center focus
      pointerRef.current.targetX = 0;
      pointerRef.current.targetY = 0;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('ship-thrust-override', handleThrustOverride);
    window.addEventListener('ship-warp-active', handleWarpActive);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    window.addEventListener('ship-fire-weapon', handleFireWeapon);
    window.addEventListener('click', handleCanvasClick);

    // Save asteroid shatter function globally to allow other elements to triggers it
    (window as any).shatterAsteroidGlobal = shatterAsteroid;

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('ship-thrust-override', handleThrustOverride);
      window.removeEventListener('ship-warp-active', handleWarpActive);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('ship-fire-weapon', handleFireWeapon);
      window.removeEventListener('click', handleCanvasClick);
      delete (window as any).shatterAsteroidGlobal;
    };
  }, []);

  // Initialize Scene
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    let isMounted = true;

    // Measure dimensions safely with safe fallbacks to avoid 0-divided Infinity or NaN aspect ratios
    const width = containerRef.current.clientWidth || window.innerWidth || 1024;
    const height = containerRef.current.clientHeight || window.innerHeight || 768;
    const aspect = height > 0 ? (width / height) : 1;

    // Set up renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Beautiful high-fidelity soft shadows
    
    // Cinema-Grade Color Calibration & Advanced ACES Tone Mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25; // Rich highlight compression
    if ('sRGBEncoding' in THREE) {
      (renderer as any).outputEncoding = (THREE as any).sRGBEncoding;
    } else if ('SRGBColorSpace' in THREE) {
      (renderer as any).outputColorSpace = (THREE as any).SRGBColorSpace;
    }
    
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    sceneRef.current = scene;

    // Initialize pre-allocated shared geometries and materials for shockwave-triggered asteroid fragmentation
    geoDodecSharedRef.current = new THREE.DodecahedronGeometry(1.0, 0);
    geoIcosSharedRef.current = new THREE.IcosahedronGeometry(1.0, 1);
    geoTetraSharedRef.current = new THREE.TetrahedronGeometry(1.0, 0);

    matMoltenSharedRef.current = new THREE.MeshStandardMaterial({
      color: 0xff3800, // volcanic magma lava-orange
      emissive: 0xff2a00,
      emissiveIntensity: 8.5,
      roughness: 0.92,
      metalness: 0.15,
      flatShading: true
    });

    matCrustSharedRef.current = new THREE.MeshStandardMaterial({
      color: 0x161514, // near-black charred crust
      roughness: 0.95,
      metalness: 0.1,
      flatShading: true
    });

    matBasaltSharedRef.current = new THREE.MeshStandardMaterial({
      color: 0x242220, // rugged weathered basaltic dark-gray rock
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true
    });

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      aspect,
      0.1,
      1000
    );
    camera.position.set(0, 0.4, 14); // Cinematic starting coordinate
    cameraRef.current = camera;

    // Set up high-precision Cinematic Post-Processing Pipeline
    const composer = new EffectComposer(renderer);
    composer.setSize(width, height);
    
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // Unreal Bloom Pass: Beautiful, physics-accurate halo glow around core/engines/explosions
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.5,  // strength
      0.4,  // radius
      0.85  // threshold (only bright source highlights will glow)
    );
    composer.addPass(bloomPass);
    bloomPassRef.current = bloomPass;
    
    // Custom Cinematic Lens Shader Pass (Chromatic Aberration, Film Grain, Vignette, Barrel Distortion, Color Grading)
    const lensPass = new ShaderPass(CinematicLensShader);
    lensPass.uniforms.uChromAb.value = 0.0;
    lensPass.uniforms.uGrainIntensity.value = 0.0;
    lensPass.uniforms.uDistortion.value = 0.035; // Very subtle lens distortion
    lensPass.uniforms.uVignette.value = 0.0;
    lensPass.uniforms.uColorRange.value = 1.05;
    composer.addPass(lensPass);
    lensPassRef.current = lensPass;
    
    composerRef.current = composer;

    // Setup Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x111622, 0.35); // Increased to soften harsh crevices and reduce flash contrasts
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Volumetric 3D Space Haze & Atmospheric Depth Fog
    scene.fog = new THREE.FogExp2(0x000103, 0.0022);

    // Soft wide-angle cinematic back-bounce glow (suggests light reflected from surrounding dense nebulae core)
    const skyGlowBounce = new THREE.DirectionalLight(0x4a5de8, 1.4); 
    skyGlowBounce.position.set(180, -30, -100);
    scene.add(skyGlowBounce);

    // Soft scattering back-fill light (suggests sunlight scattering through the dense warm cosmic dust belt lanes)
    const dustScatterLight = new THREE.DirectionalLight(0xffaa44, 1.2);
    dustScatterLight.position.set(-180, 50, -120);
    scene.add(dustScatterLight);

    // Celestial Nebula Rim Glow (representing highly ambient deep purple/crimson light reflecting off space rocks from a nearby emission nebula)
    const nebulaRimLight = new THREE.DirectionalLight(0xa855f7, 1.0);
    nebulaRimLight.position.set(0, -90, -150);
    scene.add(nebulaRimLight);

    // Warm star back light (mimicking an epic central sun/star in the far background casting dramatic silhouettes and edge highlights!)
    const keyLight = new THREE.DirectionalLight(0xffedd5, 5.5); // reduced to soften the overall glaring highlight intensity
    keyLight.position.set(0, 15, -210); // Shines directly from the background towards the camera, casting epic rim rays
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048; // Crisp, high-performance ultra-detailed shadow maps
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 10;
    keyLight.shadow.camera.far = 400;
    keyLight.shadow.bias = -0.0003; // Prevents shadow acne artifacts
    
    // Set up wide orthographic shadow camera frustum matching the asteroid flight area
    const d = 50;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    scene.add(keyLight);

    // Dynamic cyber HUD teal fill light (ambient glow inside cockpit / complementary reflection)
    const fillLight = new THREE.DirectionalLight(0x00f2ff, 1.1); // Subdued fill for high-vibrancy tech-glow shadows
    fillLight.position.set(20, 5, 10);
    scene.add(fillLight);

    // Intense high-latitude rim light (magenta/purple stardust scatter rim)
    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.4); // lessened for realistic outline levels
    rimLight.position.set(-10, -25, -50);
    scene.add(rimLight);

    // Ensure the camera is added to the scene so child lights render correctly
    scene.add(camera);

    // Pilot spotlight has been removed as per user's explicit request
    shipSpotlightRef.current = null;
    spotlightConeRef.current = null;

    // Dynamic Explosion Point Light Source (warm Golden White)
    const explosionLight = new THREE.PointLight(0xffedd5, 0, 600);
    explosionLight.position.set(0, 0, -500);
    scene.add(explosionLight);
    explosionLightRef.current = explosionLight;

    // 1. Add Photorealistic Multicolored Starfield (75000 particle points)
    const starCount = 75000;
    const starGeometry = new THREE.BufferGeometry();
    const starCoords = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starLayers = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      // Scatter coordinates across an immense, clinically epic cosmic background grid
      starCoords[idx] = (Math.random() - 0.5) * 1100;     // X (extended from 110)
      starCoords[idx + 1] = (Math.random() - 0.5) * 900;  // Y (extended from 100)
      starCoords[idx + 2] = (Math.random() - 0.5) * 700 - 250; // Z (extended from -140 range further back!)

      // Assign organic celestial star spectral profiles:
      const prob = Math.random();
      if (prob < 0.28) {
        // Deep hot Class O/B stars (Brilliant Icy Blue)
        starColors[idx] = 0.72;
        starColors[idx + 1] = 0.85;
        starColors[idx + 2] = 1.0;
      } else if (prob < 0.44) {
        // Soft Class K dwarf/giant stars (Gentle Amber Orange)
        starColors[idx] = 1.0;
        starColors[idx + 1] = 0.74;
        starColors[idx + 2] = 0.55;
      } else if (prob < 0.52) {
        // M-class hypergiant highlights (Crimson Ruby Sparkles)
        starColors[idx] = 1.0;
        starColors[idx + 1] = 0.42;
        starColors[idx + 2] = 0.38;
      } else {
        // Pure high-temperature white stars (Standard celestial white)
        starColors[idx] = 0.98;
        starColors[idx + 1] = 0.98;
        starColors[idx + 2] = 0.98;
      }

      // Distribute stars proportionally across exactly 3 high-contrast parallax layers
      const rand = Math.random();
      if (rand < 0.35) {
        starLayers[i] = 1.0;  // Layer 1: Distant background stars (subtle steering drift)
      } else if (rand < 0.72) {
        starLayers[i] = 2.0;  // Layer 2: Mid-depth field stars (moderate responsiveness)
      } else {
        starLayers[i] = 3.0;  // Layer 3: Close-range foreground star clusters (high velocity & massive steering shear!)
      }
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(starCoords, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('aLayerIndex', new THREE.BufferAttribute(starLayers, 1));

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uSpeedAccum: { value: 0.0 },
        uDriftOffset: { value: new THREE.Vector2(0, 0) },
        uWarpTransition: { value: 0.0 },
        uSpeedFactor: { value: 0.0 },
        uPhaseCode: { value: 2.0 },
        uTexture: { value: createStarTexture() }
      },
      vertexShader: ParallaxStarShader.vertexShader,
      fragmentShader: ParallaxStarShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      vertexColors: true,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    starsRef.current = stars;

    // 1B. Create a high-fidelity dynamic Hyperspace Streak Field (Line Segments)
    const warpLineCount = 800;
    const warpGeometry = new THREE.BufferGeometry();
    const warpCoords = new Float32Array(warpLineCount * 2 * 3); // 2 points per segment (start + end), 3 values each
    const warpColors = new Float32Array(warpLineCount * 2 * 3);
    const warpBaseCoords = new Float32Array(warpLineCount * 3); // 1 baseline coordinate set per segment (x, y, z)

    for (let i = 0; i < warpLineCount; i++) {
       const idx = i * 2 * 3;
      
      // Scatter initial positions in a wider radial channel (cylinder format around Z)
      const radius = 12 + Math.random() * 55;
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = (Math.random() - 0.5) * 160 - 60; // scattered depth

      // Set baseline coordinates
      warpBaseCoords[i * 3] = x;
      warpBaseCoords[i * 3 + 1] = y;
      warpBaseCoords[i * 3 + 2] = z;

      // Start vertex (head of the streak)
      warpCoords[idx] = x;
      warpCoords[idx + 1] = y;
      warpCoords[idx + 2] = z;

      // End vertex (tail of the streak - starts same as head)
      warpCoords[idx + 3] = x;
      warpCoords[idx + 4] = y;
      warpCoords[idx + 5] = z;

      // Classify beautiful spectral core-color trails
      const prob = Math.random();
      let r = 1.0, g = 1.0, b = 1.0;
      if (prob < 0.35) {
        // Bright cyan plasma tails
        r = 0.15; g = 0.90; b = 1.0;
      } else if (prob < 0.65) {
        // High-energy deep sapphire blue
        r = 0.10; g = 0.45; b = 1.0;
      } else if (prob < 0.85) {
        // Intense thermonuclear golden/amber orange
        r = 1.0; g = 0.65; b = 0.20;
      }
      
      // Head color (fully radiant)
      warpColors[idx] = r;
      warpColors[idx + 1] = g;
      warpColors[idx + 2] = b;

      // Tail color (slow fade out to create real trailing dynamic gradient)
      warpColors[idx + 3] = r * 0.12;
      warpColors[idx + 4] = g * 0.12;
      warpColors[idx + 5] = b * 0.12;
    }

    warpGeometry.setAttribute('position', new THREE.BufferAttribute(warpCoords, 3));
    warpGeometry.setAttribute('color', new THREE.BufferAttribute(warpColors, 3));

    const warpMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.0, // Fades in smoothly as speed/acceleration increases
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const warpLines = new THREE.LineSegments(warpGeometry, warpMaterial);
    warpLines.visible = false; // Completely removed streaking stars from the beginning
    scene.add(warpLines);
    warpLinesRef.current = warpLines;
    warpBaseCoordsRef.current = warpBaseCoords;

    // 2. Add Lattice Grid (Hidden until activated)
    const gridHelper = new THREE.GridHelper(100, 50, 0x00f2ff, 0x002244);
    gridHelper.position.set(0, -2, -20);
    gridHelper.visible = false;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // 2A. Ultra-dense Interstellar Dust Clouds (Multispectral nebular particulate points)
    const dustCount = 1000;
    const dustGeometry = new THREE.BufferGeometry();
    const dustCoords = new Float32Array(dustCount * 3);
    const dustColors = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustCoords[i] = (Math.random() - 0.5) * 150;     // X
      dustCoords[i + 1] = (Math.random() - 0.5) * 150; // Y
      dustCoords[i + 2] = (Math.random() - 0.5) * 200 - 100; // Z
      const mixedColor = new THREE.Color().setHSL(0.55 + Math.random() * 0.12, 0.95, 0.45);
      dustColors[i] = mixedColor.r;
      dustColors[i + 1] = mixedColor.g;
      dustColors[i + 2] = mixedColor.b;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustCoords, 3));
    dustGeometry.setAttribute('color', new THREE.BufferAttribute(dustColors, 3));
    const dustMaterial = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustClouds = new THREE.Points(dustGeometry, dustMaterial);
    // Removed to fulfill request: "Remove colorful groups of dots around the asteroids."
    // scene.add(dustClouds);

    // 2B. Warp Speed Trajectory rings (Hexagonal cockpit-surrounding highway structures)
    const warpTunnelGroup = new THREE.Group();
    const tunnelRingsList: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>[] = [];
    const tunnelRingCount = 12;
    for (let i = 0; i < tunnelRingCount; i++) {
      const ringGeom = new THREE.TorusGeometry(5.2, 0.03, 4, 6);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x00f2ff),
        transparent: true,
        opacity: 0,
        wireframe: true,
      });
      const ringMesh = new THREE.Mesh(ringGeom, ringMat);
      ringMesh.position.set(0, 0, -10 - (i * 12));
      warpTunnelGroup.add(ringMesh);
      tunnelRingsList.push(ringMesh);
    }
    scene.add(warpTunnelGroup);

    // 2B.ii Custom Shader-Based High-Velocity Warp Jump Tunnel
    const warpTunnelRadius = 14.0; // Surrounds the camera and cockpit beautifully
    const warpTunnelLength = 400.0;
    const warpTunnelGeom = new THREE.CylinderGeometry(warpTunnelRadius, warpTunnelRadius, warpTunnelLength, 32, 64, true);
    warpTunnelGeom.rotateX(Math.PI / 2);
    
    const warpTunnelMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uSpeed: { value: 6.0 },
        uWarpTransition: { value: 0.0 },
        uColor: { value: new THREE.Color(pilotConfig.hudColor) }
      },
      vertexShader: WarpTunnelShader.vertexShader,
      fragmentShader: WarpTunnelShader.fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    
    const warpShaderTunnel = new THREE.Mesh(warpTunnelGeom, warpTunnelMat);
    warpShaderTunnel.position.set(0, 0, -185);
    warpShaderTunnel.visible = false;
    scene.add(warpShaderTunnel);
    warpShaderTunnelRef.current = warpShaderTunnel as THREE.Mesh<THREE.CylinderGeometry, THREE.ShaderMaterial>;

    // 2C. Amazing Procedural Fractal Explosion System Setup
    const fractalTexture = createFractalExplosionTexture();
    fractalTextureRef.current = fractalTexture;

    const videoTexture = fractalTexture;

    // Create concentric, overlapping fractal planes rotating in opposite directions for visual complexity
    const fractalPlaneGeo1 = new THREE.PlaneGeometry(280, 280);
    const fractalPlaneMat1 = new THREE.MeshBasicMaterial({
      map: fractalTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fractalPlane1 = new THREE.Mesh(fractalPlaneGeo1, fractalPlaneMat1);
    fractalPlane1.position.set(0, 0, -500.0);
    fractalPlane1.name = 'fractal1';
    fractalPlane1.visible = false;
    scene.add(fractalPlane1);

    const fractalPlaneGeo2 = new THREE.PlaneGeometry(240, 240);
    const fractalPlaneMat2 = new THREE.MeshBasicMaterial({
      map: fractalTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fractalPlane2 = new THREE.Mesh(fractalPlaneGeo2, fractalPlaneMat2);
    fractalPlane2.position.set(0, 0, -498.0);
    fractalPlane2.rotation.z = Math.PI / 4;
    fractalPlane2.name = 'fractal2';
    fractalPlane2.visible = false;
    scene.add(fractalPlane2);

    const fractalPlaneGeo3 = new THREE.PlaneGeometry(200, 200);
    const fractalPlaneMat3 = new THREE.MeshBasicMaterial({
      map: fractalTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fractalPlane3 = new THREE.Mesh(fractalPlaneGeo3, fractalPlaneMat3);
    fractalPlane3.position.set(0, 0, -499.0);
    fractalPlane3.rotation.z = -Math.PI / 3;
    fractalPlane3.name = 'fractal3';
    fractalPlane3.visible = false;
    scene.add(fractalPlane3);

    // Fully-volumetric amazing expanding fractal sphere to wrap the camera
    const fractalSphereGeo = new THREE.SphereGeometry(140, 32, 24);
    const fractalSphereMat = new THREE.MeshBasicMaterial({
      map: fractalTexture,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const fractalSphere = new THREE.Mesh(fractalSphereGeo, fractalSphereMat);
    fractalSphere.position.set(0, 0, -500.0);
    fractalSphere.name = 'sphere';
    fractalSphere.visible = false;
    scene.add(fractalSphere);
  

    // Procedural Cosmic Glare & Lens Flare overlapping overlays
    const radialGlowTex = createFlareTexture('radial');
    const horizontalFlareTex = createFlareTexture('horizontal');

    const shockwaveTex = createShockwaveTexture();

    const coreGlowGeo = new THREE.PlaneGeometry(300, 300);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      map: radialGlowTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const coreGlowMesh = new THREE.Mesh(coreGlowGeo, coreGlowMat);
    coreGlowMesh.position.set(0, 0, -499.5); // position slightly ahead
    coreGlowMesh.name = 'glow';
    coreGlowMesh.visible = false;
    scene.add(coreGlowMesh);

    const lensFlareGeo = new THREE.PlaneGeometry(900, 160); // extremely wide streak
    const lensFlareMat = new THREE.MeshBasicMaterial({
      map: horizontalFlareTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const lensFlareMesh = new THREE.Mesh(lensFlareGeo, lensFlareMat);
    lensFlareMesh.position.set(0, 0, -499.4); // further forward
    lensFlareMesh.name = 'flare';
    lensFlareMesh.visible = false;
    scene.add(lensFlareMesh);

    // Dynamic 3D Shockwave Rings (Expanding plasma field boundaries)
    const shockwaveGeo = new THREE.PlaneGeometry(160, 160);
    const shockwaveMat1 = new THREE.MeshBasicMaterial({
      map: shockwaveTex,
      transparent: true,
      opacity: 0,
      color: 0x00f2ff, // Electric cyan shockwave!
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shockwave1 = new THREE.Mesh(shockwaveGeo, shockwaveMat1);
    shockwave1.position.set(0, 0, -500.0);
    shockwave1.name = 'shockwave1';
    shockwave1.visible = false;
    scene.add(shockwave1);

    const shockwaveMat2 = new THREE.MeshBasicMaterial({
      map: shockwaveTex,
      transparent: true,
      opacity: 0,
      color: 0xff5a00, // Vibrant neon orange-red plasma boundary!
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const shockwave2 = new THREE.Mesh(shockwaveGeo, shockwaveMat2);
    shockwave2.position.set(0, 0, -500.0);
    shockwave2.rotation.z = Math.PI / 3;
    shockwave2.name = 'shockwave2';
    shockwave2.visible = false;
    scene.add(shockwave2);

    // 2D. Vibrant Volumetric 3D Interstellar Nebulae Clouds (fully integrated inside the scene)
    const numClouds = 22;
    const cloudGroup = new THREE.Group();
    cloudGroup.name = 'volumetricClouds';
    
    // Create soft, fluid 3D gaseous nebulae clouds
    const nebulaTexViolet = createNebulaTexture('violet');
    const nebulaTexOrange = createNebulaTexture('orange');
    const nebulaTexCyan = createNebulaTexture('cyan');
    const cloudTexes = [nebulaTexViolet, nebulaTexOrange, nebulaTexCyan];
    
    for (let c = 0; c < numClouds; c++) {
      const sizeList = [220, 280, 360];
      const cloudSize = sizeList[c % sizeList.length];
      const cloudGeo = new THREE.PlaneGeometry(cloudSize, cloudSize);
      
      const cloudMat = new THREE.MeshBasicMaterial({
        map: cloudTexes[c % cloudTexes.length],
        transparent: true,
        opacity: 0.05 + Math.random() * 0.15, // elegant, subtle volumetric layering
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      
      const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
      
      // Keep within the flight lane coordinate grid:
      const cx = (Math.random() - 0.5) * 450;
      const cy = (Math.random() - 0.5) * 280;
      // Spread them sequentially down the flight path (Z corridor)
      const cz = -150 - (c / numClouds) * 1250 + (Math.random() - 0.5) * 80;
      
      cloudMesh.position.set(cx, cy, cz);
      
      // Random tilt to make them organic and multi-dimensional
      cloudMesh.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      
      cloudGroup.add(cloudMesh);
    }
    scene.add(cloudGroup);

    // 2E. Create a magnificent 3D Ringed Gas Giant Planet inside the deep space corridor
    const planetGroup = new THREE.Group();
    planetGroup.position.set(240, 60, -900); // Placed far down Z axis but fully within scene
    
    const planetGeo = new THREE.SphereGeometry(35, 32, 32);
    
    // Draw high-fidelity atmospheric sand and charcoal bands dynamically
    const planetCanvas = document.createElement('canvas');
    planetCanvas.width = 512;
    planetCanvas.height = 256;
    const pCtx = planetCanvas.getContext('2d');
    if (pCtx) {
      pCtx.fillStyle = '#1c1c1e';
      pCtx.fillRect(0, 0, 512, 256);
      for (let b = 0; b < 24; b++) {
        pCtx.fillStyle = b % 2 === 0 ? '#262629' : b % 3 === 0 ? '#101012' : '#2d2c30';
        const h = Math.random() * 20 + 4;
        const y = Math.random() * 256;
        pCtx.fillRect(0, y, 512, h);
      }
    }
    const planetTex = new THREE.CanvasTexture(planetCanvas);
    const planetMat = new THREE.MeshStandardMaterial({
      map: planetTex,
      roughness: 0.82,
      metalness: 0.08,
    });
    
    const planetMesh = new THREE.Mesh(planetGeo, planetMat);
    planetMesh.castShadow = true;
    planetMesh.receiveShadow = true;
    planetGroup.add(planetMesh);
    
    // Smooth physical outer ring bounds
    const planetaryRingGeo = new THREE.RingGeometry(46, 82, 64);
    planetaryRingGeo.rotateX(Math.PI / 2);
    const planetaryRingMat = new THREE.MeshStandardMaterial({
      color: 0x48484c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      roughness: 0.9,
    });
    const planetaryRingMesh = new THREE.Mesh(planetaryRingGeo, planetaryRingMat);
    planetaryRingMesh.castShadow = true;
    planetaryRingMesh.receiveShadow = true;
    planetGroup.add(planetaryRingMesh);
    
    // Set tilting of physical gas giant planet
    planetGroup.rotation.set(0.25, -0.35, 0.2);
    scene.add(planetGroup);


    // 3. Setup Flight Gates (Torus glowing portals)
    const gateGroup = new THREE.Group();
    for (let i = 0; i < 5; i++) {
      const ringGeom = new THREE.TorusGeometry(3.5, 0.04, 8, 36);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x00f2ff),
        transparent: true,
        opacity: 0.15,
        wireframe: true,
      });
      const gateRing = new THREE.Mesh(ringGeom, ringMat);
      // Place gates sequentially down Z axis
      gateRing.position.set(0, 0, -30 * (i + 1));
      gateRing.name = 'gate';
      gateGroup.add(gateRing);
    }
    scene.add(gateGroup);
    gateMeshRef.current = gateGroup;

    // 4. Setup Asteroids (Procedural high-fidelity asteroid belt matching requested layout)
    const asteroidsList: THREE.Mesh[] = [];
    const asteroidCount = 140; // Reduced to 140 to spread asteroids out and allow ship maneuvers to negotiate path

    // Create pooled physical materials from mapCache beforehand to avoid GPU context loss (realistic basalt and chondrite grays)
    const asteroidColors = [
      0x3e3e40, // Dark basalt gray
      0x272729, // Coal-black carbonaceous chondrite
      0x545456, // Medium stony silicate
      0x2f3032, // Weathered gray-black space rock
      0x444446, // Fine grain slate gray
    ];

    const materialPool = asteroidColors.map((color) => {
      const maps = createAsteroidMaps(color);
      return new THREE.MeshPhysicalMaterial({
        map: maps.map,
        bumpMap: maps.bumpMap,
        bumpScale: 1.5 + Math.random() * 0.9, // Expanded bump depth to carve majestic crags
        normalMap: maps.normalMap,
        normalScale: new THREE.Vector2(5.0, 5.0), // Drastically boosted to render gorgeous razor crags & craters
        roughnessMap: maps.roughnessMap,
        metalnessMap: maps.metalnessMap,
        roughness: 0.82, // Highly diffuse dusty carbonaceous silicate structure
        metalness: 0.08, // Mostly non-conductive rock surface
        clearcoat: 0.0,  // Raw, dry mineral aggregates (no lacquer shine)
        clearcoatRoughness: 1.0,
        sheen: 0.06,
        sheenRoughness: 0.9,
        specularIntensity: 0.22, // Matte, soft scatter highlighting matching photorealism
        specularColor: new THREE.Color(0xd4d4d8), // Muted minerals
        iridescence: 0.0, // No oil-slick rainbow sheen
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0.0,
      });
    });

    const createAsteroidGeometry = () => {
      // High-resolution subdivided geometries to allow carving of detailed, beautiful smoothly-rounded crags and craters
      // Only using highly detailed spheres (No Octahedron, No Dodecahedron, No Box) so no asteroids have square shapes or sharp edges
      const types = [
        () => new THREE.IcosahedronGeometry(1, 3),     // Rugged high-res organic boulder
        () => new THREE.IcosahedronGeometry(1, 4),     // Majestic high-definition potato monolith template
      ];
      const geom = types[Math.floor(Math.random() * types.length)]();
      
      const posAttr = geom.attributes.position;
      const tempV = new THREE.Vector3();
      
      for (let j = 0; j < posAttr.count; j++) {
        tempV.fromBufferAttribute(posAttr, j);
        const len = tempV.length();
        const norm = tempV.clone().normalize();
        
        // Multi-layered cinematic deforming displacement:
        // 1. Broad non-uniform potato undulations (broad lumpy shape)
        const broad = Math.sin(norm.x * 1.8 + norm.y * 1.1) * Math.cos(norm.z * 1.5 - norm.x * 0.9) * 0.26;
        
        // 2. Terraced geological ridges (smooth sedimentation layers, no ribbing)
        const sFreq = norm.x * 3.5 + norm.y * 2.2 + norm.z * 0.9;
        const ridges = Math.sin(sFreq * 5.5) * 0.04;
        
        // 3. Smooth fracture gorges / crack faultzones (continuous soft wave, no sharp steep shelves)
        const fissVal = Math.sin(norm.z * 7.5) * Math.cos(norm.x * 11.0);
        const fractureZone = Math.abs(fissVal) > 0.81 ? -0.12 * Math.pow(Math.abs(fissVal) - 0.81, 1.8) : 0.0;
        
        // 4. Pitted impact crater depressions with custom depth
        const bowl = Math.sin(norm.x * 4.2) * Math.cos(norm.y * 3.8) * Math.sin(norm.z * 4.0);
        const craterDepression = bowl > 0.52 ? -0.20 * Math.pow(bowl - 0.52, 1.6) : 0.0;
        
        // 5. Fine rounded rocky grain (soft micro-bumps)
        const fineCrag = Math.cos(norm.x * 10.0) * Math.sin(norm.y * 11.0) * Math.cos(norm.z * 12.0) * 0.015;
        
        const displacement = broad + ridges + fractureZone + craterDepression + fineCrag;
          
        tempV.addScaledVector(norm, displacement * len);
        posAttr.setXYZ(j, tempV.x, tempV.y, tempV.z);
      }
      
      geom.computeVertexNormals();
      return ensureAttributesAndTangents(geom);
    };

    const sharedInstancedGeometry = createAsteroidGeometry();
    const instancedMasterMesh = new THREE.InstancedMesh(
      sharedInstancedGeometry,
      materialPool[1] || materialPool[0], // realistic dark shared material
      asteroidCount - 1
    );
    instancedMasterMesh.castShadow = true;
    instancedMasterMesh.receiveShadow = true;
    scene.add(instancedMasterMesh);
    instancedAsteroidsRef.current = instancedMasterMesh;

    for (let i = 0; i < asteroidCount; i++) {
      const geometry = createAsteroidGeometry();
      
      // Select random physical material from our optimized pools
      const material = materialPool[Math.floor(Math.random() * materialPool.length)];
      const asteroid = new THREE.Mesh(geometry, material);
      
      // Bounded static physical coordinates across a structured 3D domain (no infinite scrolling!)
      // Distributed from Z = -100 to Z = -1400
      let scaleVal = 1.6 + Math.random() * 6.4;
      if (Math.random() < 0.12) {
        scaleVal = 8.5 + Math.random() * 12.5; // Majestic colossal monoliths
      }
      
      // Center-weighted distribution with lateral escape lanes
      const theta = Math.random() * Math.PI * 2;
      const r = Math.pow(Math.random(), 0.75) * 280; // Radius range up to 280 units
      const initX = Math.cos(theta) * r;
      const y = Math.sin(theta) * r * 0.72;
      
      // Fixed depth coordinate spread sequentially across the field
      const z = -100 - (i / asteroidCount) * 1300 + (Math.random() - 0.5) * 45;

      // Bold, organic non-uniform scaling (ensuring NO pancake/flat uniformly scaled shapes!)
      const shapeType = Math.random();
      let scaleX = scaleVal;
      let scaleY = scaleVal;
      let scaleZ = scaleVal;

      if (shapeType < 0.35) {
        // Cigar / elongated tube boulder shape
        scaleX *= 1.45 + Math.random() * 0.65;
        scaleY *= 0.70 + Math.random() * 0.35;
        scaleZ *= 0.70 + Math.random() * 0.35;
      } else if (shapeType < 0.70) {
        // Wedge / blocky jagged chunk
        scaleX *= 1.15 + Math.random() * 0.45;
        scaleY *= 1.15 + Math.random() * 0.45;
        scaleZ *= 0.70 + Math.random() * 0.35;
      } else {
        // bulky uneven potato boulder coordinates
        scaleX *= 0.85 + Math.random() * 0.45;
        scaleY *= 0.85 + Math.random() * 0.45;
        scaleZ *= 0.85 + Math.random() * 0.45;
      }

      asteroid.scale.set(scaleX, scaleY, scaleZ);
      asteroid.position.set(initX, y, z);
      
      asteroid.castShadow = true;
      asteroid.receiveShadow = true;

      // Local slow-floating drifts matching realistic drift mechanics (orbital drift)
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.015,
        (Math.random() - 0.5) * 0.01
      );

      // Rotating at completely different rates (high-dynamic range of spin rates!)
      const rotateSpeedFactor = 0.0005 + Math.random() * 0.085; 
      const angularVelocity = new THREE.Vector3(
        (Math.random() - 0.5) * rotateSpeedFactor,
        (Math.random() - 0.5) * rotateSpeedFactor,
        (Math.random() - 0.5) * rotateSpeedFactor
      );

      // collision radius
      const radius = Math.max(scaleX, scaleY, scaleZ) * 0.45;

      const wobbleFreqX = 0.3 + Math.random() * 1.0;
      const wobbleFreqY = 0.3 + Math.random() * 1.0;
      const wobbleFreqZ = 0.3 + Math.random() * 1.0;
      const wobblePhaseX = Math.random() * Math.PI * 2;
      const wobblePhaseY = Math.random() * Math.PI * 2;
      const wobblePhaseZ = Math.random() * Math.PI * 2;

      asteroid.userData = {
        driftVector: velocity,
        spin: angularVelocity,
        collisionRadius: radius,
        originalScale: new THREE.Vector3(scaleX, scaleY, scaleZ),
        parallaxDepth: Math.max(0.12, Math.min(1.0, (z - (-1400)) / 1300)),
        hasCollidedCooldown: 0.0,
        hasCollidedWithShipCooldown: 0.0,
        wobbleFreqX,
        wobbleFreqY,
        wobbleFreqZ,
        wobblePhaseX,
        wobblePhaseY,
        wobblePhaseZ
      };

      if (i === 0) {
        scene.add(asteroid);
      } else {
        asteroid.visible = false;
        asteroid.updateMatrix();
        instancedMasterMesh.setMatrixAt(i - 1, asteroid.matrix);
      }
      asteroidsList.push(asteroid);
    }
    instancedMasterMesh.instanceMatrix.needsUpdate = true;
    asteroidsRef.current = asteroidsList;
    updateAsteroidMaterials(asteroidThemeRef.current);

    // 4B. Setup the Hazy Dust Belt (Stardust/Fine debris disk passing through the belt, as seen in the images!)
    const beltDustCount = 2400;
    const beltDustGeo = new THREE.BufferGeometry();
    const beltDustCoords = new Float32Array(beltDustCount * 3);
    const beltDustColors = new Float32Array(beltDustCount * 3);
    
    for (let dIdx = 0; dIdx < beltDustCount; dIdx++) {
      const idx = dIdx * 3;
      // Mirror the asteroid belt scatter bounds in deep space, tightly clustered
      beltDustCoords[idx] = (Math.random() - 0.5) * 640;
      beltDustCoords[idx + 1] = (Math.random() - 0.5) * 42; // clustered near the orbital midline (matches asteroid third-height viewport constraint)
      beltDustCoords[idx + 2] = -130 + Math.random() * 80; // aligned with asteroid belt depth band!
      
      // Warm basalt-dust amber and cosmic silver-slate color profiles
      const isWarm = Math.random() > 0.4;
      if (isWarm) {
        beltDustColors[idx] = 0.85 + Math.random() * 0.15; // R (soft golden/amber)
        beltDustColors[idx + 1] = 0.70 + Math.random() * 0.15; // G
        beltDustColors[idx + 2] = 0.50 + Math.random() * 0.15; // B
      } else {
        beltDustColors[idx] = 0.60 + Math.random() * 0.15; // R (cool gray/slate)
        beltDustColors[idx + 1] = 0.65 + Math.random() * 0.15; // G
        beltDustColors[idx + 2] = 0.75 + Math.random() * 0.15; // B
      }
    }
    
    beltDustGeo.setAttribute('position', new THREE.BufferAttribute(beltDustCoords, 3));
    beltDustGeo.setAttribute('color', new THREE.BufferAttribute(beltDustColors, 3));
    
    const beltDustMat = new THREE.PointsMaterial({
      size: 0.55,
      map: createStarTexture(), // circular gradient texture
      vertexColors: true,
      transparent: true,
      opacity: 0.58, // delicate hazy layer
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const dustBelt = new THREE.Points(beltDustGeo, beltDustMat);
    // Removed to fulfill request: "Remove colorful groups of dots around the asteroids."
    // scene.add(dustBelt);
    dustBeltRef.current = dustBelt;

    // High-resolution HUD-reactive glass dust system inside the vessel cockpit space
    const glassDustCount = 120;
    const glassDustGeo = new THREE.BufferGeometry();
    const glassDustCoords = new Float32Array(glassDustCount * 3);
    const glassDustSpeeds = new Float32Array(glassDustCount * 3);
    
    for (let i = 0; i < glassDustCount; i++) {
      const idx = i * 3;
      glassDustCoords[idx] = (Math.random() - 0.5) * 8.0;      // X
      glassDustCoords[idx + 1] = (Math.random() - 0.5) * 6.0;  // Y
      // Position inside the viewport cone relative to the camera at Z = 7.0
      glassDustCoords[idx + 2] = 1.0 + Math.random() * 5.8;    // Z
      
      glassDustSpeeds[idx] = (Math.random() - 0.5) * 0.15;     // vx
      glassDustSpeeds[idx + 1] = (Math.random() - 0.5) * 0.15; // vy
      glassDustSpeeds[idx + 2] = (Math.random() - 0.3) * 0.1;  // vz
    }
    
    glassDustGeo.setAttribute('position', new THREE.BufferAttribute(glassDustCoords, 3));
    
    // Create the PointsMaterial
    const glassDustMat = new THREE.PointsMaterial({
      size: 0.045, 
      color: new THREE.Color(pilotConfig.hudColor), 
      map: createStarTexture(),
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    
    const glassDustMesh = new THREE.Points(glassDustGeo, glassDustMat);
    scene.add(glassDustMesh);
    glassDustMeshRef.current = glassDustMesh;
    glassDustSpeedsRef.current = glassDustSpeeds;

    // High-performance Cinematic Meteor Shower in Deep Space Background
    const meteorCount = 150; // Boosted count to 150 to restore and amplify a magnificent meteor shower
    const meteorGeo = new THREE.BufferGeometry();
    const meteorPositions = new Float32Array(meteorCount * 2 * 3); // start & end points (6 values per meteor)
    const meteorColors = new Float32Array(meteorCount * 2 * 3);
    const meteorSpeeds = new Float32Array(meteorCount);
    const meteorOffsets = new Float32Array(meteorCount * 3); // base positions to keep track of animating streaks
    const meteorDirs = new Float32Array(meteorCount * 3); // random direction vectors
    const meteorAges = new Float32Array(meteorCount);

    for (let i = 0; i < meteorCount; i++) {
      const idx = i * 2 * 3;
      const offIdx = i * 3;
      
      // Far, scattered across upper left quadrant
      const sx = -220 + Math.random() * 350;
      const sy = 80 + Math.random() * 95;
      const sz = -180 - Math.random() * 150; // very far away
      
      meteorOffsets[offIdx] = sx;
      meteorOffsets[offIdx + 1] = sy;
      meteorOffsets[offIdx + 2] = sz;

      // Assign organic diagonal streaking directions
      const dirX = 1.0 + Math.random() * 1.5; 
      const dirY = -0.7 - Math.random() * 0.8; 
      const dirZ = 0.05 + Math.random() * 0.2;
      const dLength = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
      const dx = dirX / dLength;
      const dy = dirY / dLength;
      const dz = dirZ / dLength;

      meteorDirs[offIdx] = dx;
      meteorDirs[offIdx + 1] = dy;
      meteorDirs[offIdx + 2] = dz;

      const len = 3.5 + Math.random() * 6.5;
      const ex = sx + dx * len;
      const ey = sy + dy * len;
      const ez = sz + dz * len;

      meteorPositions[idx] = sx;
      meteorPositions[idx + 1] = sy;
      meteorPositions[idx + 2] = sz;
      meteorPositions[idx + 3] = ex;
      meteorPositions[idx + 4] = ey;
      meteorPositions[idx + 5] = ez;

      // Classy atmospheric hues: amber gold to deep sky blue
      const spec = Math.random();
      let mr = 0.9, mg = 0.45, mb = 0.15; // default burning gold
      if (spec < 0.35) {
        mr = 0.1; mg = 0.6; mb = 0.95; // glowing sapphire blue
      } else if (spec < 0.60) {
        mr = 0.95; mg = 0.15; mb = 0.1; // thermal carbon crimson tail
      }

      // Bright incandescent tip, fading trail tail
      meteorColors[idx] = mr * 2.5;
      meteorColors[idx + 1] = mg * 2.5;
      meteorColors[idx + 2] = mb * 2.5;
      
      meteorColors[idx + 3] = mr * 0.02;
      meteorColors[idx + 4] = mg * 0.02;
      meteorColors[idx + 5] = mb * 0.01;

      meteorSpeeds[i] = 12 + Math.random() * 18; // Much slower base speeds for elegant cinematic flight
      meteorAges[i] = Math.random() * 8.0; // Random initial ages to organic distribute spiral stages right away
    }

    meteorGeo.setAttribute('position', new THREE.BufferAttribute(meteorPositions, 3));
    meteorGeo.setAttribute('color', new THREE.BufferAttribute(meteorColors, 3));

    const meteorMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const meteorLines = new THREE.LineSegments(meteorGeo, meteorMaterial);
    scene.add(meteorLines);
    meteorShowerRef.current = meteorLines;
    meteorSpeedsRef.current = meteorSpeeds;
    meteorOffsetsRef.current = meteorOffsets;
    meteorDirsRef.current = meteorDirs;
    meteorAgesRef.current = meteorAges;

    // Holographic Space Flight Navigation Interface Grids (Transforms the physical sector into an immersive flight interface console)
    const tacticalSpaceGrid = new THREE.GridHelper(800, 40, 0x00f2ff, 0x0c2535);
    tacticalSpaceGrid.position.set(0, -75, -200);
    if (tacticalSpaceGrid.material instanceof THREE.Material) {
      tacticalSpaceGrid.material.opacity = 0.22;
      tacticalSpaceGrid.material.transparent = true;
      tacticalSpaceGrid.material.depthWrite = false;
    }
    scene.add(tacticalSpaceGrid);
    tacticalSpaceGridRef.current = tacticalSpaceGrid;

    // Frontal holographic range rings to visualize vector flight depth
    const flightGridGroup = new THREE.Group();
    for (let c = 1; c <= 4; c++) {
      const ringGeo = new THREE.RingGeometry(c * 25, c * 25 + 0.3, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x00f2ff,
        opacity: 0.04,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 0, -c * 80);
      flightGridGroup.add(ringMesh);
    }
    scene.add(flightGridGroup);
    flightGridGroupRef.current = flightGridGroup;

    // 5. Create Procedural SAVANT Crystalline Core Fallback
    const coreGroup = new THREE.Group();
    
    // Outer frame mesh (Dodecahedron) - High fidelity physically-based wireframe
    const outerGeom = ensureAttributesAndTangents(new THREE.DodecahedronGeometry(2, 1));
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x030305,                  // Near-black core metal
      metalness: 1.0,                   // Flawless steel reflectivity
      roughness: 0.05,
      emissive: 0x00f2ff,               // Cold fusion neon glow
      emissiveIntensity: 0.8,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    const outerCore = new THREE.Mesh(outerGeom, outerMat);
    coreGroup.add(outerCore);

    // Inner core sphere - Thermodynamic plasma node
    const innerGeom = ensureAttributesAndTangents(new THREE.IcosahedronGeometry(0.8, 0));
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x030305,
      metalness: 1.0,
      roughness: 0.05,
      emissive: 0xff4c00,               // Molten magma orange internal heat bleed
      emissiveIntensity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.01,
      ior: 1.6,
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerCore);

    // Orbiting sat rings
    const satGeom = ensureAttributesAndTangents(new THREE.TorusGeometry(2.3, 0.02, 6, 24));
    const satRing = new THREE.Mesh(satGeom, outerMat);
    satRing.rotation.x = Math.PI / 4;
    coreGroup.add(satRing);

    coreGroup.position.set(0, 0, -200);
    coreGroup.visible = false;
    scene.add(coreGroup);
    coreMeshRef.current = coreGroup;

    // 6. Attempt to Load Savant logo (gltf / glb)
    const loader = new GLTFLoader();
    addTelemetryLog('PROMPT: ATTEMPTING TO RESOLVE SAVANT GLB ASSETS...');
    
    loader.load(
      '/assets/logo7/logo7.glb',
      (gltf) => {
        if (!isMounted) return;
        const wrapper = new THREE.Group();
        wrapper.position.set(0, 0, -200);
        
        // Compute bounding box to perfectly auto-center the logo at its local pivot point
        const box = new THREE.Box3().setFromObject(gltf.scene);
        const center = new THREE.Vector3();
        box.getCenter(center);
        
        // Save raw bounding width of the original object
        const sizeVec = new THREE.Vector3();
        box.getSize(sizeVec);
        logoWidthRef.current = Math.max(1.0, sizeVec.x);
        
        // Shift model scene relative to local pivot to center it
        gltf.scene.position.sub(center);
        wrapper.add(gltf.scene);
        
        wrapper.scale.set(0.01, 0.01, 0.01);
        
        // Enhance materials by making them highly reflective, glossy, and realistic, while preserving the model's actual colors and textures
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // Apply deluxe, master-quality photorealistic black chrome with embedded internal illumination
            child.material = new THREE.MeshPhysicalMaterial({
              color: new THREE.Color(0x030305),        // Highly polished black chrome body carapace
              metalness: 1.0,                         // Complete mirror metallic reflection
              roughness: 0.03,                        // Near zero abrasion friction highlights
              emissive: new THREE.Color(0x00f2ff),     // Deep electric cobalt inner glow
              emissiveIntensity: 0.8,                 // High radiance from inside
              clearcoat: 1.0,                         // Glossy automotive lacquer layer
              clearcoatRoughness: 0.01,               // Flawless, sharp reflection highlights
              ior: 1.62,                              // High index of refraction for dramatic screen reflections
              reflectivity: 1.0,
            });
          }
        });

        wrapper.visible = false;
        scene.add(wrapper);
        logoModelRef.current = wrapper;
        addTelemetryLog('ASSET RESOLUTION CODE 200: SAVANT LOGO GLB LOADED SUCCESSFULLY');
        setLoadingProgress(100);
      },
      (xhr) => {
        if (!isMounted) return;
        if (xhr.total > 0) {
          const progress = Math.round((xhr.loaded / xhr.total) * 100);
          setLoadingProgress(Math.min(99, progress));
        }
      },
      (err) => {
        if (!isMounted) return;
        addTelemetryLog('DIAG_WARN: logo7.glb asset missing. Activating procedural Quantum crystalline Core.');
        
        logoWidthRef.current = 4.6; // Width of orbiting satellite ring
        // Promote core group to acts as Logo!
        logoModelRef.current = coreGroup;
        setLoadingProgress(100);
      }
    );

    // Set up Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        renderer.setSize(width, height);
        if (composerRef.current) {
          composerRef.current.setSize(width, height);
        }
        camera.aspect = height > 0 ? (width / height) : 1;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(containerRef.current);

    // Frame Loop
    let lastTime = performance.now();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const now = performance.now();
      let delta = (now - lastTime) * 0.001;
      // Cap delta limit to avoid movement/physics coordinate explosions when tabs are suspended
      if (isNaN(delta) || delta < 0 || delta > 0.1) {
        delta = 0.016; // 60 FPS fallback
      }
      lastTime = now;

      const currentPhase = phaseRef.current;

      // Subtly shift the ambient environment lighting color based on the current phase
      shiftAmbientColor(currentPhase, delta);

      const currentOptic = opticModeRef.current;
      const currentFilter = filterEffectRef.current;
      const HUDColorHex = colorRef.current;

      const activeColor = new THREE.Color(HUDColorHex);

      // Gently animate and pulsate the glowing mineral ore veins across the active asteroid material pool
      if (materialPool) {
        const pulseFactor = 1.0 + 0.32 * Math.sin(now * 0.0018);
        materialPool.forEach((m) => {
          if (m instanceof THREE.MeshPhysicalMaterial) {
            const themeName = asteroidThemeRef.current;
            let baseIntensity = 1.0;
            if (themeName === 'CHROME_BLOOD') baseIntensity = 8.5;
            else if (themeName === 'GOLD_GUNMETAL') baseIntensity = 9.0;
            else if (themeName === 'OBSIDIAN_MOTTLED') baseIntensity = 10.5;
            else if (themeName === 'CARBON_VIOLET') baseIntensity = 11.5;
            else if (themeName === 'OPAL_STARDUST') baseIntensity = 12.0;
            else if (themeName === 'IRON_GREEN') baseIntensity = 10.0;
            else if (themeName === 'QUICKSILVER_COPPER') baseIntensity = 11.0;
            
            m.emissiveIntensity = baseIntensity * pulseFactor;
          }
        });
      }

      // Trigger custom warm warp visual transition start and exit events
      const currentWarpActive = warpStateRef.current.active;
      if (currentWarpActive && !prevWarpActiveRef.current) {
        // Warp speed begins: Trigger 0.5s entry flash / space distortion bubble
        warpStartEffectTimerRef.current = 0.5;
        warpExitEffectTimerRef.current = 0.0;
        glitchFactorRef.current = 0.98; // Intense horizontal shearing glitch on launch trigger!
      }
      if (!currentWarpActive && prevWarpActiveRef.current) {
        // Warp speed ends: Trigger 1.5s materialisation reconstruct visual effect
        warpExitEffectTimerRef.current = 1.5;
        warpStartEffectTimerRef.current = 0.0;
        glitchFactorRef.current = 0.85; // Deceleration/Materialization static reconstruct jitter!

        // Reset all hidden asteroids so they are structured nicely in front of the camera to materialize!
        asteroidsList.forEach((rock, idx) => {
          if (idx < 50) {
            rock.position.z = -140 - Math.random() * 80;
          } else if (idx < 130) {
            rock.position.z = -220 - Math.random() * 90;
          } else {
            rock.position.z = -315 - Math.random() * 115;
          }

          // Distribute circularly around forward gaze axis
          const radius = 10 + Math.random() * 85;
          const angle = Math.random() * Math.PI * 2;
          rock.position.x = camera.position.x + Math.cos(angle) * radius;
          rock.position.y = camera.position.y + Math.sin(angle) * radius;

          // Prime each asteroid with a materialize timeline
          rock.userData.materializeTime = 1.25;
          rock.visible = true; // Make visible
          rock.scale.set(0.001, 0.001, 0.001); // Start from a tiny grain of singularity
        });
      }
      prevWarpActiveRef.current = currentWarpActive;

      // Decrement special effect timers
      if (warpStartEffectTimerRef.current > 0) {
        warpStartEffectTimerRef.current = Math.max(0, warpStartEffectTimerRef.current - delta);
      }
      if (warpExitEffectTimerRef.current > 0) {
        warpExitEffectTimerRef.current = Math.max(0, warpExitEffectTimerRef.current - delta);
      }

      // Dynamic pilot search spotlight controller
      if (shipSpotlightRef.current && spotlightConeRef.current) {
        const sActive = spotlightActiveRef.current;
        const sIntensity = spotlightIntensityRef.current;
        const sColor = spotlightColorRef.current;
        const sAngle = spotlightAngleRef.current;

        shipSpotlightRef.current.visible = sActive;
        spotlightConeRef.current.visible = sActive;

        if (sActive) {
          const colorObj = new THREE.Color(sColor);
          shipSpotlightRef.current.color = colorObj;

          const coneMesh = spotlightConeRef.current;
          const coneMat = coneMesh.material as any;
          if (coneMat) {
            coneMat.color = colorObj;
            coneMat.opacity = Math.min(0.98, (sIntensity / 12) * 1.55); // Highly dense and radiant volumetric stardust scatter glow
          }

          // Cinematic pilot search spotlight with tightened focus beam (offset raking angles prevent details from washing out)
          const tightAngle = sAngle * 0.38; // Tighten the light cone angle for a focused spotlight beam
          shipSpotlightRef.current.intensity = sIntensity * 60.0; // Boosted intensity multiplier from 12.0 to 60.0 to brilliantly illuminate craggy details
          shipSpotlightRef.current.angle = tightAngle;
          
          // Re-scale volumetric cone diameter according to the tightened spotlight angle
          const tangent = Math.tan(tightAngle);
          const radiusAtEnd = 60 * tangent;
          coneMesh.scale.set(radiusAtEnd / 8, radiusAtEnd / 8, 1);
        }
      }

      // Sweep background star light slightly to simulate organic drift
      keyLight.position.set(
        Math.sin(now * 0.00015) * 4,
        15 + Math.cos(now * 0.0001) * 2,
        -210
      );
      fillLight.position.x = -6 + Math.cos(now * 0.0005) * 3;
      fillLight.position.y = 3 + Math.sin(now * 0.0007) * 2;

      // Handle custom optic styling
      if (currentOptic === 'BIO_THERM') {
        scene.background = new THREE.Color(0x0a0000);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.setHex(0x0a0000);
          (scene.fog as THREE.FogExp2).density = 0.0022;
        }
        ambientLight.color.setHex(0xff3300);
        ambientLight.intensity = 0.40; // brightened soft thermal ambient shadows
        keyLight.color.setHex(0xffaa00);
        keyLight.intensity = 4.8; // beautiful thermal key light
        fillLight.color.setHex(0xff3300);
        fillLight.intensity = 1.1;
        rimLight.color.setHex(0x551100);
        rimLight.intensity = 0.8;
        skyGlowBounce.color.setHex(0xff3300);
        skyGlowBounce.intensity = 1.0;
        dustScatterLight.color.setHex(0xff5500);
        dustScatterLight.intensity = 1.1;
        nebulaRimLight.color.setHex(0xff3300);
        nebulaRimLight.intensity = 0.8;
      } else if (currentOptic === 'ECHO_PULSE') {
        scene.background = new THREE.Color(0x000208);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.setHex(0x000208);
          (scene.fog as THREE.FogExp2).density = 0.0035; // slightly denser radar return look
        }
        ambientLight.color.setHex(0x0055ff);
        ambientLight.intensity = 0.35; // elevated ambient radar
        keyLight.color.setHex(0x00ffff);
        keyLight.intensity = 5.2; // soft bright cyan highlights
        fillLight.color.setHex(0x0055ff);
        fillLight.intensity = 1.3;
        rimLight.color.setHex(0x002244);
        rimLight.intensity = 1.1;
        skyGlowBounce.color.setHex(0x0055ff);
        skyGlowBounce.intensity = 1.2;
        dustScatterLight.color.setHex(0x0088ff);
        dustScatterLight.intensity = 1.4;
        nebulaRimLight.color.setHex(0x0055ff);
        nebulaRimLight.intensity = 1.0;
      } else if (currentOptic === 'VOID_DRIVE') {
        scene.background = new THREE.Color(0xffffff);
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.setHex(0xffffff);
          (scene.fog as THREE.FogExp2).density = 0.001;
        }
        ambientLight.color.setHex(0x000000);
        ambientLight.intensity = 0.0;
        keyLight.color.setHex(0x000000);
        keyLight.intensity = 0.0;
        fillLight.intensity = 0.0;
        rimLight.intensity = 0.0;
        skyGlowBounce.intensity = 0.0;
        dustScatterLight.intensity = 0.0;
        nebulaRimLight.intensity = 0.0;
      } else {
        // STD OPTIC (Each theme now dynamically dictates its own custom cinematic light setup, color balances, and atmospheric features!)
        const tColors = getSkyColorsForTheme(asteroidThemeRef.current);
        scene.background = tColors.background;
        if (scene.fog) {
          (scene.fog as THREE.FogExp2).color.copy(tColors.background);
          (scene.fog as THREE.FogExp2).density = 0.0022; // smooth velvet space fog
        }

        switch (asteroidThemeRef.current) {
          case 'CHROME_BLOOD': {
            // High contrast chrome lighting with solar flare pulse
            const pulse = 1.0;
            ambientLight.color.setHex(0x250202);
            ambientLight.intensity = 0.40;
            
            keyLight.color.setHex(0xf2f5fa); // silver chrome glare
            keyLight.intensity = 5.8 * pulse;
            
            fillLight.color.setHex(0xd10808); // deep blood fill
            fillLight.intensity = 1.6;
            
            rimLight.color.setHex(0xff0a0a); // burning outline corona
            rimLight.intensity = 2.4;
            
            skyGlowBounce.color.setHex(0x8a0303);
            skyGlowBounce.intensity = 1.3;
            
            dustScatterLight.color.setHex(0xff3c00);
            dustScatterLight.intensity = 1.2;
            
            nebulaRimLight.color.setHex(0xd90429);
            nebulaRimLight.intensity = 1.1;
            break;
          }
          case 'GOLD_GUNMETAL': {
            // Warm bronze slate lighting with gold ore vein glare sweeping
            const sweepX = Math.cos(now * 0.0006) * 15;
            fillLight.position.x = sweepX; // moving stardust vein specular sweeps
            ambientLight.color.setHex(0x10151f);
            ambientLight.intensity = 0.35;
            
            keyLight.color.setHex(0xffd54f); // radiant solar yellow
            keyLight.intensity = 5.2;
            
            fillLight.color.setHex(0x4c5e78); // steel-slate fill
            fillLight.intensity = 1.2;
            
            rimLight.color.setHex(0xffa000); // warm copper/gold outer bounds
            rimLight.intensity = 2.0;
            
            skyGlowBounce.color.setHex(0x252a36);
            skyGlowBounce.intensity = 1.0;
            
            dustScatterLight.color.setHex(0xffc107);
            dustScatterLight.intensity = 1.5;
            
            nebulaRimLight.color.setHex(0x455a64);
            nebulaRimLight.intensity = 0.8;
            break;
          }
          case 'OBSIDIAN_MOTTLED': {
            // Highly reflective obsidian glass lighting
            const twinkle = 1.0;
            ambientLight.color.setHex(0x0b0a16);
            ambientLight.intensity = 0.30;
            
            keyLight.color.setHex(0xffffff); // extreme neon-white star beams
            keyLight.intensity = 5.5 * twinkle;
            
            fillLight.color.setHex(0xe3a857); // warm mottled secondary reflection
            fillLight.intensity = 1.4;
            
            rimLight.color.setHex(0xe0e0e0); // silver lining halo
            rimLight.intensity = 2.0;
            
            skyGlowBounce.color.setHex(0x673ab7);
            skyGlowBounce.intensity = 1.2;
            
            dustScatterLight.color.setHex(0xffd54f);
            dustScatterLight.intensity = 1.3;
            
            nebulaRimLight.color.setHex(0x00bcd4);
            nebulaRimLight.intensity = 1.0;
            break;
          }
          case 'CARBON_VIOLET': {
            // Electric synthwave violet / hot pink hyper-contrast
            const pulse = 1.0;
            ambientLight.color.setHex(0x1a0628);
            ambientLight.intensity = 0.38;
            
            keyLight.color.setHex(0xb388ff); 
            keyLight.intensity = 4.8;
            
            fillLight.color.setHex(0xff4081); // hot magenta vents
            fillLight.intensity = 2.2 * pulse;
            
            rimLight.color.setHex(0xe040fb); // electric orchid
            rimLight.intensity = 2.5;
            
            skyGlowBounce.color.setHex(0x00e5ff);
            skyGlowBounce.intensity = 1.4;
            
            dustScatterLight.color.setHex(0x7c4dff);
            dustScatterLight.intensity = 1.5;
            
            nebulaRimLight.color.setHex(0xff1744);
            nebulaRimLight.intensity = 1.1;
            break;
          }
          case 'OPAL_STARDUST': {
            // Dreamy pastel rainbow/peach/lavender atmosphere
            ambientLight.color.setHex(0x112130);
            ambientLight.intensity = 0.45;
            
            keyLight.color.setHex(0xffe0b2); // sunburst peach
            keyLight.intensity = 4.5;
            
            fillLight.color.setHex(0x80f1e3); // pastel mint
            fillLight.intensity = 1.3;
            
            rimLight.color.setHex(0xd1c4e9); // lavender glow
            rimLight.intensity = 2.2;
            
            skyGlowBounce.color.setHex(0xffab91);
            skyGlowBounce.intensity = 1.2;
            
            dustScatterLight.color.setHex(0xb2dfdb);
            dustScatterLight.intensity = 1.1;
            
            nebulaRimLight.color.setHex(0xb39ddb);
            nebulaRimLight.intensity = 1.2;
            break;
          }
          case 'IRON_GREEN': {
            // Uranium/Emerald toxic backscattering
            const wave = 1.0;
            ambientLight.color.setHex(0x032109);
            ambientLight.intensity = 0.38;
            
            keyLight.color.setHex(0x00ff66); // uranium glowing green key rays
            keyLight.intensity = 5.5 * wave;
            
            fillLight.color.setHex(0x8d6e63); // oxidized iron brown
            fillLight.intensity = 1.2;
            
            rimLight.color.setHex(0x00e676); // fluorescent emerald lining
            rimLight.intensity = 2.2;
            
            skyGlowBounce.color.setHex(0x1b5e20);
            skyGlowBounce.intensity = 1.1;
            
            dustScatterLight.color.setHex(0x76ff03);
            dustScatterLight.intensity = 1.3;
            
            nebulaRimLight.color.setHex(0xc6ff00);
            nebulaRimLight.intensity = 0.9;
            break;
          }
          case 'QUICKSILVER_COPPER': {
            // Molten copper eruptions + fluid liquid slate mirror reflections
            const flowSpeed = 1.0;
            ambientLight.color.setHex(0x210c06);
            ambientLight.intensity = 0.40;
            
            keyLight.color.setHex(0xffffff); // quicksilver mirror sheen
            keyLight.intensity = 5.2;
            
            fillLight.color.setHex(0xff5722); // hot magma crevice flare
            fillLight.intensity = 2.0 * flowSpeed;
            
            rimLight.color.setHex(0xff6d00); // scorching copper outline
            rimLight.intensity = 2.8;
            
            skyGlowBounce.color.setHex(0xe64a19);
            skyGlowBounce.intensity = 1.4;
            
            dustScatterLight.color.setHex(0xffb300);
            dustScatterLight.intensity = 1.2;
            
            nebulaRimLight.color.setHex(0xd84315);
            nebulaRimLight.intensity = 1.1;
            break;
          }
          default: {
            ambientLight.color.setHex(0x111622);
            ambientLight.intensity = 0.35;
            keyLight.color.setHex(0xffedd5);
            keyLight.intensity = 5.5;
            fillLight.color.setHex(0x2efaff);
            fillLight.intensity = 1.1;
            rimLight.color.setHex(0xe9d5ff);
            rimLight.intensity = 1.4;
            skyGlowBounce.color.setHex(0x4a5de8);
            skyGlowBounce.intensity = 1.4;
            dustScatterLight.color.setHex(0xffaa44);
            dustScatterLight.intensity = 1.2;
            nebulaRimLight.color.setHex(0xa855f7);
            nebulaRimLight.intensity = 1.0;
            break;
          }
        }
      }

      // Handle filter overlay with an elegant state-preserving cache
      if (currentFilter === 'GHOST') {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat: any) => {
              if (mat.userData === undefined) mat.userData = {};
              if (mat.userData.origTransparent === undefined) {
                mat.userData.origTransparent = mat.transparent || false;
                mat.userData.origWireframe = mat.wireframe || false;
                mat.userData.origOpacity = mat.opacity !== undefined ? mat.opacity : 1.0;
              }
              mat.wireframe = true;
              mat.transparent = true;
              mat.opacity = 0.35;
            });
          }
        });
      } else {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat: any) => {
              if (mat.userData && mat.userData.origTransparent !== undefined) {
                mat.transparent = mat.userData.origTransparent;
                mat.wireframe = mat.userData.origWireframe;
                mat.opacity = mat.userData.origOpacity;
              }
            });
          }
        });
      }

      // Lattice Filter Mode
      gridHelper.visible = (currentFilter === 'LATTICE');

      // Sync color overrides for HUD theme colors
      outerMat.color.copy(activeColor);
      gridHelper.material.color.copy(activeColor);
      tunnelRingsList.forEach((r) => r.material.color.copy(activeColor));
      if (gateMeshRef.current) {
        gateMeshRef.current.children.forEach((meshChild) => {
          if (meshChild instanceof THREE.Mesh) {
            meshChild.material.color.copy(activeColor);
          }
        });
      }

      // Rotate cosmic nebular dust & procedural nebula planes
      if (dustClouds) {
        dustClouds.rotation.y += 0.0002;
        dustClouds.rotation.x += 0.0001;
      }
      const nebPlane1 = scene.getObjectByName('nebula1') as THREE.Mesh | undefined;
      const nebPlane2 = scene.getObjectByName('nebula2') as THREE.Mesh | undefined;
      const nebPlane3 = scene.getObjectByName('nebula3') as THREE.Mesh | undefined;
      
      const themeColors = getSkyColorsForTheme(asteroidThemeRef.current);
      const pulseFactor = 0.88 + Math.sin(performance.now() * 0.0006) * 0.12;

      if (nebPlane1) {
        nebPlane1.rotation.z += 0.015 * delta;
        if (nebPlane1.material instanceof THREE.MeshBasicMaterial) {
          nebPlane1.material.color.copy(themeColors.nebula1).multiplyScalar(pulseFactor);
        }
      }
      if (nebPlane2) {
        nebPlane2.rotation.z -= 0.010 * delta;
        if (nebPlane2.material instanceof THREE.MeshBasicMaterial) {
          nebPlane2.material.color.copy(themeColors.nebula2).multiplyScalar(pulseFactor);
        }
      }
      if (nebPlane3) {
        nebPlane3.rotation.z += 0.006 * delta;
        if (nebPlane3.material instanceof THREE.MeshBasicMaterial) {
          nebPlane3.material.color.copy(themeColors.nebula3).multiplyScalar(pulseFactor);
        }
      }

      // Animate the permanent, massive background celestial nebula with deep-space 360° steering parallax
      const permNeb = scene.getObjectByName('permanentNebula') as THREE.Mesh | undefined;
      if (permNeb) {
        // Center the 360° skysphere around the current camera position to ensure the background covers everything perfectly forever
        permNeb.position.copy(camera.position);

        // Slow cinematic rotation representing the cosmic drift of outer galaxies
        // Rotates on all three axes to feel deeply dimensional and 3-dimensional
        permNeb.rotation.y = (now * 0.0004) - starDriftOffsetRef.current.x * 0.00015;
        permNeb.rotation.x = (now * 0.0002) + starDriftOffsetRef.current.y * 0.00018;
        permNeb.rotation.z += 0.0004 * delta;
      }

      // 1. ACTIVE COCKPIT VIEW & CONTINUOUS FLIGHT SIMULATION (BOOT, INIT, and FLIGHT)
      if (currentPhase === 'BOOT' || currentPhase === 'INIT' || currentPhase === 'FLIGHT') {
        const kp = keysPressedRef.current;
        const speedSetting = telemetryRef.current.velocity;
        
        if (currentPhase === 'FLIGHT') {
          // Read advanced steering parameters from telemetry context
          const fMode = telemetryRef.current.flightMode || 'CRUISE';
          const sens = telemetryRef.current.thrusterSensitivity || 1.0;
          const targetCruiseSpeed = telemetryRef.current.targetSpeedSetting || 600;
          const step = delta * 60;

          // Compute forward step velocity based on mode
          let currentVel = telemetryRef.current.velocity;
          
          if (fMode === 'CRUISE') {
            // Smoothly move towards target speed setting
            currentVel = THREE.MathUtils.lerp(currentVel, targetCruiseSpeed, delta * 2.8);
            if (kp['Space']) {
              currentVel = THREE.MathUtils.lerp(currentVel, 3500, delta * 3.5); // temporary boost override
            } else if (kp['ShiftLeft'] || kp['ShiftRight']) {
              currentVel = THREE.MathUtils.lerp(currentVel, 150, delta * 4.5); // hard brake
            }
            
            // Integrate forward speed towards negative Z - Slower progress for majestic feel (3.2 instead of 7.5)
            const forwardDelta = (currentVel / 3600) * 3.2 * step; 
            shipPosRef.current.z -= forwardDelta;

            // Fluid-elastic velocity tracker for lateral movement
            // Instead of instantaneous translation, keys add/subtract from lateral velocity targets
            const accelX = 0.20 * sens * step; // Lowered for silky smooth heavy flight
            const accelY = 0.14 * sens * step; // Lowered for heavy aircraft inertia feel
            if (kp['KeyA'] || kp['ArrowLeft']) {
              shipVRef.current.x -= accelX;
            }
            if (kp['KeyD'] || kp['ArrowRight']) {
              shipVRef.current.x += accelX;
            }
            if (kp['KeyW'] || kp['ArrowUp']) {
              shipVRef.current.y += accelY;
            }
            if (kp['KeyS'] || kp['ArrowDown']) {
              shipVRef.current.y -= accelY;
            }

            // Intelligent Fly-by-Wire Auto-Evasion Assist: Computerized micro-thrusters nudge
            let autoEvasionX = 0;
            let autoEvasionY = 0;
            asteroidsList.forEach((rock) => {
              const rockZ = rock.position.z;
              const zDiff = shipPosRef.current.z - rockZ;
              if (zDiff > 5 && zDiff < 140) {
                const dist2D = Math.hypot(rock.position.x - shipPosRef.current.x, rock.position.y - shipPosRef.current.y);
                const threatMargin = (rock.userData.collisionRadius || 12) + 24.0; 
                if (dist2D < threatMargin) {
                  const weight = Math.pow(1.0 - (zDiff / 140.0), 2.2);
                  const dx = shipPosRef.current.x - rock.position.x;
                  const dy = shipPosRef.current.y - rock.position.y;
                  if (dist2D > 0.1) {
                    autoEvasionX += (dx / dist2D) * weight * 3.2;
                    autoEvasionY += (dy / dist2D) * weight * 2.4;
                  }
                }
              }
            });
            if (Math.abs(autoEvasionX) > 0.02 || Math.abs(autoEvasionY) > 0.02) {
              shipVRef.current.x += autoEvasionX * step;
              shipVRef.current.y += autoEvasionY * step;
              const now = performance.now();
              if (now - lastAutoEvasionLogRef.current > 7500) {
                lastAutoEvasionLogRef.current = now;
                addTelemetryLog("SYS COMP: COCKPIT COLLISION NUDGE fired side jets!");
              }
            }

            // High automatic self-centering damping for CRUISE mode to feel very controlled yet beautifully elastic
            shipVRef.current.x *= Math.pow(0.85, step);
            shipVRef.current.y *= Math.pow(0.85, step);
            
            // Limit max lateral cruise velocities
            shipVRef.current.x = THREE.MathUtils.clamp(shipVRef.current.x, -7.5, 7.5);
            shipVRef.current.y = THREE.MathUtils.clamp(shipVRef.current.y, -5.5, 5.5);

            // Translate ship position smoothly with inertia damping
            shipPosRef.current.x += shipVRef.current.x * step * 0.32;
            shipPosRef.current.y += shipVRef.current.y * step * 0.32;

            // Sync visual tilt variables using smooth interpolation
            shipVelocityRef.current.x = THREE.MathUtils.lerp(shipVelocityRef.current.x, shipVRef.current.x * 0.20, delta * 3.8);
            shipVelocityRef.current.y = THREE.MathUtils.lerp(shipVelocityRef.current.y, shipVRef.current.y * 0.20, delta * 3.8);
          }
          else if (fMode === 'NEWTONIAN') {
            // Newtonian drifting physics: keys apply thrust accelerations instead of setting positions directly
            const thrustAcc = 0.16 * sens * step;
            if (kp['KeyA'] || kp['ArrowLeft']) shipVRef.current.x -= thrustAcc;
            if (kp['KeyD'] || kp['ArrowRight']) shipVRef.current.x += thrustAcc;
            if (kp['KeyW'] || kp['ArrowUp']) shipVRef.current.y += thrustAcc;
            if (kp['KeyS'] || kp['ArrowDown']) shipVRef.current.y -= thrustAcc;

            // Space accelerates forward (Z velocity negative); Shift brakes (Z velocity positive)
            if (kp['Space']) {
              shipVRef.current.z -= 0.18 * step;
            } else if (kp['ShiftLeft'] || kp['ShiftRight']) {
              shipVRef.current.z += 0.18 * step;
            }

            // Apply friction/drag only slightly to preserve drifting feeling (0.985 instead of 0.95)
            shipVRef.current.x *= Math.pow(0.985, step);
            shipVRef.current.y *= Math.pow(0.985, step);
            shipVRef.current.z *= Math.pow(0.992, step);

            // Newtonian fly-by-wire nudge helper to damp drifting directly into obstacles!
            let autoEvasionX = 0;
            let autoEvasionY = 0;
            asteroidsList.forEach((rock) => {
              const rockZ = rock.position.z;
              const zDiff = shipPosRef.current.z - rockZ;
              if (zDiff > 5 && zDiff < 140) {
                const dist2D = Math.hypot(rock.position.x - shipPosRef.current.x, rock.position.y - shipPosRef.current.y);
                const threatMargin = (rock.userData.collisionRadius || 12) + 24.0;
                if (dist2D < threatMargin) {
                  const weight = Math.pow(1.0 - (zDiff / 140.0), 2.2);
                  const dx = shipPosRef.current.x - rock.position.x;
                  const dy = shipPosRef.current.y - rock.position.y;
                  if (dist2D > 0.1) {
                    autoEvasionX += (dx / dist2D) * weight * 2.8;
                    autoEvasionY += (dy / dist2D) * weight * 2.1;
                  }
                }
              }
            });
            if (Math.abs(autoEvasionX) > 0.02 || Math.abs(autoEvasionY) > 0.02) {
              shipVRef.current.x += autoEvasionX * step;
              shipVRef.current.y += autoEvasionY * step;
              const now = performance.now();
              if (now - lastAutoEvasionLogRef.current > 7500) {
                lastAutoEvasionLogRef.current = now;
                addTelemetryLog("NEWTONIAN STABILIZER: Auto-evasion thruster counter-drift triggered.");
              }
            }

            // Clamp max velocities
            shipVRef.current.x = THREE.MathUtils.clamp(shipVRef.current.x, -16, 16);
            shipVRef.current.y = THREE.MathUtils.clamp(shipVRef.current.y, -12, 12);
            shipVRef.current.z = THREE.MathUtils.clamp(shipVRef.current.z, -28, 4);

            // Translate ship Pos with slightly slower scale for majestic control
            shipPosRef.current.addScaledVector(shipVRef.current, delta * 3.2);
            
            // Map ship speed along Z onto telemetry velocity (e.g. absolute movement speed)
            const absoluteSpeed = Math.floor(Math.abs(shipVRef.current.z) * 120 + 350);
            currentVel = THREE.MathUtils.lerp(currentVel, absoluteSpeed, delta * 3.5);

            // Sync visual tilting triggers with beautiful lag
            shipVelocityRef.current.x = THREE.MathUtils.lerp(shipVelocityRef.current.x, shipVRef.current.x * 0.15, delta * 5.0);
            shipVelocityRef.current.y = THREE.MathUtils.lerp(shipVelocityRef.current.y, shipVRef.current.y * 0.15, delta * 5.0);
          }
          else if (fMode === 'AUTOPILOT') {
            // Computer-driven evasive pathfinding! Multi-vector continuous repulsion fields
            let evadeForceX = 0;
            let evadeForceY = 0;
            let closestDst = 9999;

            asteroidsList.forEach((rock) => {
              const rockZ = rock.position.z;
              // we fly negative Z, so rock is in front if rockZ < shipZ
              const zDiff = shipPosRef.current.z - rockZ;
              if (zDiff > 5 && zDiff < 220) {
                const dist2D = Math.hypot(rock.position.x - shipPosRef.current.x, rock.position.y - shipPosRef.current.y);
                const safeMargin = (rock.userData.collisionRadius || 12) + 38.0;
                
                if (dist2D < safeMargin) {
                  const weight = Math.pow(1.0 - (zDiff / 220.0), 2.0); // exponential repulsion as asteroid gets closer
                  const dx = shipPosRef.current.x - rock.position.x;
                  const dy = shipPosRef.current.y - rock.position.y;
                  
                  if (dist2D > 0.1) {
                    evadeForceX += (dx / dist2D) * weight * 6.5;
                    evadeForceY += (dy / dist2D) * weight * 5.5;
                  } else {
                    evadeForceX += (Math.random() > 0.5 ? 1 : -1) * weight * 6.5;
                    evadeForceY += (Math.random() > 0.5 ? 1 : -1) * weight * 5.5;
                  }
                  
                  if (zDiff < closestDst) {
                    closestDst = zDiff;
                  }
                }
              }
            });

            // If there's no urgent asteroid to dodge, drift gracefully back toward core-center with a gentle sinus wobble
            if (Math.abs(evadeForceX) < 0.05 && Math.abs(evadeForceY) < 0.05) {
              evadeForceX += -shipPosRef.current.x * 0.0035 + Math.sin(now * 0.0006) * 0.15;
              evadeForceY += -shipPosRef.current.y * 0.0035 + Math.cos(now * 0.0005) * 0.10;
            }

            // Smooth neural glide steering
            shipPosRef.current.x += evadeForceX * 5.5 * step;
            shipPosRef.current.y += evadeForceY * 4.8 * step;

            // Auto cruising velocity
            currentVel = THREE.MathUtils.lerp(currentVel, targetCruiseSpeed, delta * 2.5);
            const forwardDelta = (currentVel / 3600) * 3.2 * step; 
            shipPosRef.current.z -= forwardDelta;

            // Map velocity output for smooth cockpit panning/tilts with high fluid lag
            shipVelocityRef.current.x = THREE.MathUtils.lerp(shipVelocityRef.current.x, evadeForceX * 1.5, delta * 6.0);
            shipVelocityRef.current.y = THREE.MathUtils.lerp(shipVelocityRef.current.y, evadeForceY * 1.5, delta * 6.0);
          }

          // Strict boundary bounding boxes (limit the flight arena so players don't fly infinitely outwards)
          shipPosRef.current.x = THREE.MathUtils.clamp(shipPosRef.current.x, -360, 360);
          shipPosRef.current.y = THREE.MathUtils.clamp(shipPosRef.current.y, -260, 260);
          
          if (shipPosRef.current.z > 50) {
            shipPosRef.current.z = 50; // clamp back bounds
          }
          if (shipPosRef.current.z < -1650) {
            shipPosRef.current.z = -1650; // clamp front logo bounds
          }

          // Map onto visual variables so trailing sweeps, debris, stars, and tilt functions respond correctly
          userControlledPosRef.current.x = shipPosRef.current.x;
          userControlledPosRef.current.y = shipPosRef.current.y;

          // Gate Passage / Navigation Milestones tracking!
          const zPos = shipPosRef.current.z;
          let cGate = telemetryRef.current.currentGate;
          let gProg = telemetryRef.current.gateProgress;

          // Detect gate crossings
          if (zPos <= -250 && cGate === 1) {
            cGate = 2;
            addTelemetryLog("NAV_COMPUTER: SPATIAL GATE VECTOR 1 SUCCESSFULY TRAVERSED!");
            try { playPassagePulse(); } catch(e){}
          } else if (zPos <= -500 && cGate === 2) {
            cGate = 3;
            addTelemetryLog("NAV_COMPUTER: SPATIAL GATE VECTOR 2 SUCCESSFULY TRAVERSED!");
            try { playPassagePulse(); } catch(e){}
          } else if (zPos <= -750 && cGate === 3) {
            cGate = 4;
            addTelemetryLog("NAV_COMPUTER: SPATIAL GATE VECTOR 3 SUCCESSFULY TRAVERSED!");
            try { playPassagePulse(); } catch(e){}
          } else if (zPos <= -1000 && cGate === 4) {
            cGate = 5;
            addTelemetryLog("NAV_COMPUTER: SPATIAL GATE VECTOR 4 SUCCESSFULY TRAVERSED!");
            try { playPassagePulse(); } catch(e){}
          } else if (zPos <= -1250 && cGate === 5) {
            if (gProg < 100) {
              gProg = 100;
              addTelemetryLog("NAV_COMPUTER: FINAL ENTRANCE GATE 5 BREACHED! ORBIT CORE IS UNLOCKED.");
              try { playPassagePulse(); } catch(e){}
            }
          }

          // Compute real-time gate compilation percentages
          if (cGate === 1) {
            gProg = Math.max(0, Math.min(100, Math.floor((shipPosRef.current.z - (-50)) / (-200) * 100)));
          } else if (cGate === 2) {
            gProg = Math.max(0, Math.min(100, Math.floor((shipPosRef.current.z - (-250)) / (-250) * 100)));
          } else if (cGate === 3) {
            gProg = Math.max(0, Math.min(100, Math.floor((shipPosRef.current.z - (-500)) / (-250) * 100)));
          } else if (cGate === 4) {
            gProg = Math.max(0, Math.min(100, Math.floor((shipPosRef.current.z - (-750)) / (-250) * 100)));
          } else if (cGate === 5 && zPos > -1250) {
            gProg = Math.max(0, Math.min(100, Math.floor((shipPosRef.current.z - (-1000)) / (-250) * 100)));
          }

          // Log entry/exit events from the asteroid field boundaries (X: [-280, 280], Y: [-180, 180], Z: [-100, -1400])
          const isOutside = zPos < -1400 || Math.abs(shipPosRef.current.x) > 280 || Math.abs(shipPosRef.current.y) > 180;
          if (isOutside) {
            if (!hasLoggedExitFieldRef.current) {
              hasLoggedExitFieldRef.current = true;
              hasLoggedEnterFieldRef.current = false;
              addTelemetryLog("HELM COCKPIT: PILOT HAS LEFT THE CORES DEBRIS OF THE ASTEROID FIELD.");
            }
          } else {
            if (!hasLoggedEnterFieldRef.current) {
              hasLoggedEnterFieldRef.current = true;
              hasLoggedExitFieldRef.current = false;
              addTelemetryLog("HELM COCKPIT: PILOT ENTERING DENSE ASTEROID FIELD BELT.");
            }
          }

          // Calculate closest asteroid proximity
          let nearestDist = 9999;
          let nearestName = "N/A";
          asteroidsList.forEach((rock, idx) => {
            const dist = shipPosRef.current.distanceTo(rock.position);
            if (dist < nearestDist) {
              nearestDist = dist;
              nearestName = `AST-${1200 + idx}`;
            }
          });
          const proximityKm = nearestDist < 1800 ? Math.floor(nearestDist * 0.45 * 10) / 10 : 999;

          // Push metrics down into React context on a thottle
          if (!lastTelemetryUpdateRef.current || now - lastTelemetryUpdateRef.current > 110) {
            lastTelemetryUpdateRef.current = now;
            updateTelemetry({ 
              velocity: Math.floor(currentVel),
              altitude: Math.max(0, Math.floor(1600 + shipPosRef.current.z)), // Countdown distance to destination (Z = -1600 is logo resting point)
              latitude: Math.floor(shipPosRef.current.x),
              longitude: Math.floor(shipPosRef.current.y),
              currentGate: cGate,
              gateProgress: gProg,
              nearestAsteroidDist: isOutside ? 999 : proximityKm,
              nearestAsteroidName: isOutside ? 'N/A' : nearestName
            });
          }

          // Stretch Field of View dynamically during space warp acceleration
          const warpTrans = warpStateRef.current.transition;
          const targetFov = 75 + (warpTrans * 40.0); // up to 115 degrees field of view
          if (Math.abs(camera.fov - targetFov) > 0.05) {
            camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, delta * 4.5);
            camera.updateProjectionMatrix();
          }
        }
      }
        
        // Decelerating drag friction multiplier
        shipVelocityRef.current.multiplyScalar(0.95);

        // Dispatch current steering vector to make the cockpit hud's sub-segments glow and react in real-time
        window.dispatchEvent(new CustomEvent('ship-velocity-vector', {
          detail: {
            x: shipVelocityRef.current.x,
            y: shipVelocityRef.current.y
          }
        }));

        // Smoothly lerp pointer mouse values based on frame delta
        const lerpFactor = Math.min(1.0, delta * 4.8);
        pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * lerpFactor;
        pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * lerpFactor;

        // Smooth physical head-swivel & banking tilting visual feedback based on ship directions velocity
        if (currentPhase !== 'INIT') {
          // Track elapsed flight duration for the active simulation phase
          if (currentPhase === 'FLIGHT' || currentPhase === 'BOOT') {
            flightTimeRef.current += delta;
          }

          // Camera should pan quickly toward the asteroids throughout the animation
          // Smoothly drift the baseline Z position from 7.0 down into the asteroid belt (near -230.0) much faster over 3.0 seconds with a cinematic cubic ease-out
          const flightProgress = Math.min(1.0, flightTimeRef.current / 3.0);
          const easedProgress = 1 - Math.pow(1 - flightProgress, 3);
          const baseZ = THREE.MathUtils.lerp(7.0, -230.0, easedProgress);

          // Add organic cinematic slow breathing/drift dynamics (micro-float camera operator lens simulation)
          const breathingX = Math.sin(now * 0.001) * 0.06;
          const breathingY = Math.cos(now * 0.00085) * 0.045;
          const breathingZ = Math.sin(now * 0.0005) * 0.05;

          // Ship flies in completely different forward directions (swerves on a majestic curve!)
          // Generates a wavy trajectory over time
          const angleX = flightTimeRef.current * 0.28; 
          const angleY = flightTimeRef.current * 0.20; 
          const trajX = Math.sin(angleX) * 28.0 + Math.cos(angleX * 0.4) * 10.0;
          const trajY = Math.cos(angleY) * 14.0 + Math.sin(angleY * 0.4) * 5.0;

          // Update G-force lag offsets (pulling the camera in opposite direction of pilot lateral turns)
          const targetGForceX = -shipVelocityRef.current.x * 3.2;
          const targetGForceY = -shipVelocityRef.current.y * 2.4;
          gForceOffsetRef.current.x += (targetGForceX - gForceOffsetRef.current.x) * Math.min(1.0, delta * 3.6);
          gForceOffsetRef.current.y += (targetGForceY - gForceOffsetRef.current.y) * Math.min(1.0, delta * 3.6);

          if (currentPhase === 'FLIGHT') {
            camera.position.set(
              shipPosRef.current.x + pointerRef.current.x * 20.0 + breathingX + gForceOffsetRef.current.x, 
              shipPosRef.current.y + pointerRef.current.y * 15.0 + breathingY + gForceOffsetRef.current.y, 
              shipPosRef.current.z + breathingZ
            );

            // Propulsion engine high-frequency hull rattling proportional to flight speed
            const currentVelocity = telemetryRef.current ? telemetryRef.current.velocity : 600;
            const velocityRatio = Math.max(0.0, Math.min(1.0, currentVelocity / 3500.0));
            const engineShake = 0.012 * velocityRatio;
            if (engineShake > 0) {
              camera.position.x += (Math.random() - 0.5) * engineShake;
              camera.position.y += (Math.random() - 0.5) * engineShake;
              camera.position.z += (Math.random() - 0.5) * engineShake;
            }
          } else {
            // Apply legacy swerving coordinates + user keyboard actions + pilot's relative mouse pointer offset to avoid asteroids
            camera.position.set(
              trajX + userControlledPosRef.current.x + pointerRef.current.x * 20.0 + breathingX, 
              trajY + userControlledPosRef.current.y + pointerRef.current.y * 15.0 + breathingY, 
              baseZ + breathingZ
            );
          }

          // Compute horizontal/vertical tangent rate of change to bank into swerve curves
          const rateX = 0.28 * 28.0 * Math.cos(angleX) - 0.112 * 10.0 * Math.sin(angleX * 0.4);
          const rateY = -0.20 * 14.0 * Math.sin(angleY) + 0.08 * 5.0 * Math.cos(angleY * 0.4);

          camera.rotation.set(0, 0, 0);
          // High-aerospace banking: bank-roll into lateral swerves and pointer steering
          camera.rotation.z = -rateX * 0.015 - shipVelocityRef.current.x * 0.35 - pointerRef.current.x * 0.12; // Bank Roll (enhanced tilt multiplier)
          camera.rotation.y = -rateX * 0.012 - shipVelocityRef.current.x * 0.18 - pointerRef.current.x * 0.14; // Yaw swivel (increased responsiveness)
          camera.rotation.x = rateY * 0.014 + shipVelocityRef.current.y * 0.22 + pointerRef.current.y * 0.10;  // Pitch tilt (aggressive look vertical)
        } else {
          // Add subtle mouse shift even during logo introduction approach
          camera.position.x += pointerRef.current.x * 0.35 * delta;
          camera.position.y += pointerRef.current.y * 0.35 * delta;
          camera.rotation.set(0, 0, 0);
          camera.rotation.z = -pointerRef.current.x * 0.04;
          camera.rotation.y = -pointerRef.current.x * 0.06;
          camera.rotation.x = pointerRef.current.y * 0.05;
        }

        // Apply cinematic lens breathing and focal-depth compression based on speed and dynamic cockpit turns
        const currentLevelVelocity = (telemetryRef.current && telemetryRef.current.velocity) ? telemetryRef.current.velocity : 600;
        const levelVelocityRatio = Math.max(0.0, Math.min(1.0, currentLevelVelocity / 3500.0));
        
        // Micro-oscillations matching engine vibrations and pilot breathing cycles
        const lensPulseFactor = Math.sin(now * 0.0019) * 0.38;
        
        // FOV compression under high travel rates: decrease FOV from 75 to 64 at max velocity,
        // but widen during sharp horizontal/vertical cockpit turning sweeps (simulating peripheral visual awareness focus shifts)
        const turnGForceStrength = Math.hypot(shipVelocityRef.current.x, shipVelocityRef.current.y);
        const warpTrans = warpStateRef.current ? warpStateRef.current.transition : 0.0;
        const targetFOV = 75.0 - (levelVelocityRatio * 13.0) + (turnGForceStrength * 6.5) - (warpTrans * 16.0) + lensPulseFactor;
        
        camera.fov = THREE.MathUtils.lerp(camera.fov || 75.0, targetFOV, 0.06);
        camera.updateProjectionMatrix();
        
        // Track boot or init speed decay for cinematic slow down at the beginning
        let bootSpeedDecay = 1.0;
        if (currentPhase === 'BOOT') {
          bootTimeElapsedRef.current += delta;
          bootSpeedDecay = Math.max(0.12, Math.exp(-bootTimeElapsedRef.current / 8.5));
        } else {
          bootTimeElapsedRef.current = 0.0;
        }

        let initSpeedDecay = 1.0;
        if (currentPhase === 'INIT') {
          initTimeElapsedRef.current += delta;
          const t = initTimeElapsedRef.current;
          const progress = Math.min(1.0, t / 4.0); // Exact 4.0 seconds duration
          initSpeedDecay = Math.pow(1.0 - progress, 2.5); // High-fidelity easing curve
        } else {
          initTimeElapsedRef.current = 0.0;
        }

        let vel = telemetryRef.current.velocity;
        if (currentPhase === 'BOOT') {
          vel = 1200 + 4800 * bootSpeedDecay;
        } else if (currentPhase === 'INIT') {
          vel = 1200 + 7200 * initSpeedDecay; // Decays from warp speed down to baseline cruise speed

          // Dynamic responsive closest camera Z calculation based on actual model width and dynamic aspect ratio
          let rawWidth = logoWidthRef.current;
          if (isNaN(rawWidth) || !isFinite(rawWidth) || rawWidth <= 0) {
            rawWidth = 5.0;
          }
          const finalLogoWidth = rawWidth * 0.28;             // Logo final scale starts at 28
          const requiredWidth = finalLogoWidth + 20;          // Dynamic boundary margins
          
          let aspect = camera.aspect;
          if (isNaN(aspect) || !isFinite(aspect) || aspect <= 0) {
            aspect = (window.innerWidth && window.innerHeight) ? (window.innerWidth / window.innerHeight) : 1.777;
          }
          
          const fovRad = (camera.fov * Math.PI) / 180;
          const divisor = 2 * aspect * Math.tan(fovRad / 2);
          let requiredDistance = 35;
          if (divisor > 0) {
            requiredDistance = requiredWidth / divisor;
          }
          
          const logoRestingZ = -330.0; // Pushed back further matching targetZ positioning logic
          const closestCameraZ = logoRestingZ + Math.max(15, requiredDistance);
          
          let dynamicClampedCameraZ = Math.min(logoRestingZ + 75, Math.max(logoRestingZ + 15, closestCameraZ));
          if (isNaN(dynamicClampedCameraZ) || !isFinite(dynamicClampedCameraZ)) {
            dynamicClampedCameraZ = logoRestingZ + 35; // Safe default framing math
          }

          // Interpolated camera Z positioning matching GSAP approach progress for perfect responsive real-time framing
          if (cameraApproachProgressRef.current > 0.0) {
            camera.position.z = THREE.MathUtils.lerp(7.0, dynamicClampedCameraZ, cameraApproachProgressRef.current);
            camera.position.y = THREE.MathUtils.lerp(0.1, 0.0, cameraApproachProgressRef.current);
          }
        }
        
        // Real-time shockwave hit detection and camera shake reaction
        if (shockwaveActiveRef.current && !shockwaveHitRef.current) {
          const shockwaveZ = shockwaveZRef.current;
          // When shockwave wavefront reaches the camera's Z coordinate
          if (shockwaveZ >= camera.position.z - 3.5) {
            shockwaveHitRef.current = true;
            localCameraShakeRef.current = 1.0; // Prime 3D camera coordinate jitter
            triggerScreenShake(24.0);         // Violent HUD CSS vibration (was disabled)
          }
        }

        // Decay and apply 3D camera jitter offset
        if (localCameraShakeRef.current > 0.0) {
          localCameraShakeRef.current -= delta * 1.5; // decays over 0.66 seconds
          if (localCameraShakeRef.current < 0.0) localCameraShakeRef.current = 0.0;
          
          const shakeVal = localCameraShakeRef.current * 1.8; // intense coordinate offset
          camera.position.x += (Math.random() - 0.5) * shakeVal;
          camera.position.y += (Math.random() - 0.5) * shakeVal;
          camera.position.z += (Math.random() - 0.5) * shakeVal;
        }
        
        // Lagged inertia reaction of the entire starfield points cloud to cockpit turns
        if (starsRef.current) {
          const targetRotY = -shipVelocityRef.current.x * 0.05 - pointerRef.current.x * 0.035;
          const targetRotX = shipVelocityRef.current.y * 0.05 + pointerRef.current.y * 0.035;
          const targetRotZ = -shipVelocityRef.current.x * 0.03;
          
          starsRef.current.rotation.y += (targetRotY - starsRef.current.rotation.y) * 0.08;
          starsRef.current.rotation.x += (targetRotX - starsRef.current.rotation.x) * 0.08;
          starsRef.current.rotation.z += (targetRotZ - starsRef.current.rotation.z) * 0.08;
          
          // Continuous galactic spin
          starsRef.current.rotation.z += 0.0012 * delta;
        }

        // Determine the forward flight starlight speed
        let starZSpeed = 0.04; // default slight majestic forward cruise drift
        if (currentPhase === 'BOOT') {
          starZSpeed = (vel / 1000) * 1.6;
        } else if (currentPhase === 'INIT') {
          // Slowly decay the star speed from rapid streak down to cruise drift over 4 seconds
          starZSpeed = (vel / 1000) * 0.5;
        } else if (currentPhase === 'FLIGHT') {
          // Active space flight speed based on velocity - highly responsive and dynamic!
          // Real-time exponential scaling based on current velocity
          const normalVelocity = Math.max(0, telemetryRef.current.velocity);
          starZSpeed = 0.005 + Math.pow(normalVelocity / 1100, 1.9) * 0.28;
        }

        // Hyper-drive warp speed jump boost
        if (warpStateRef.current.active || warpStateRef.current.transition > 0.01) {
          const warpTrans = warpStateRef.current.transition;
          starZSpeed += warpTrans * 12.0; // accelerate stars forward to create a rapid warp stream!
        }

        // Accumulate speed progression over time inside our ref to drive deep shader parallax Z
        starSpeedAccumRef.current += starZSpeed * delta * 52.0;

        // Drive dynamic steer/hover parallax drifts on X and Y planes via cumulative tracking
        const steerX = shipVelocityRef.current.x;
        const steerY = shipVelocityRef.current.y;
        starDriftOffsetRef.current.x += (steerX * 42.0 + pointerRef.current.x * 12.0) * delta;
        starDriftOffsetRef.current.y += (steerY * 42.0 + pointerRef.current.y * 10.0) * delta;

        // Sync high-fidelity uniforms into the GPU Parallax Shader Material
        if (starsRef.current && starsRef.current.material instanceof THREE.ShaderMaterial) {
          const starMat = starsRef.current.material;
          if (starMat.uniforms) {
            if (starMat.uniforms.uTime) starMat.uniforms.uTime.value = now * 0.001;
            if (starMat.uniforms.uSpeedAccum) starMat.uniforms.uSpeedAccum.value = starSpeedAccumRef.current;
            if (starMat.uniforms.uDriftOffset && starMat.uniforms.uDriftOffset.value) {
              starMat.uniforms.uDriftOffset.value.copy(starDriftOffsetRef.current);
            }
            if (starMat.uniforms.uWarpTransition) starMat.uniforms.uWarpTransition.value = warpStateRef.current.transition;

            // Map flight phases into numeric codes
            let phaseCode = 2.0; // default FLIGHT
            if (currentPhase === 'BOOT') phaseCode = 0.0;
            else if (currentPhase === 'INIT') phaseCode = 1.0;
            else if (currentPhase === 'FLIGHT') phaseCode = 2.0;
            else if (currentPhase === 'DESTINATION') phaseCode = 3.0;
            else if (currentPhase === 'EXIT') phaseCode = 4.0;

            const currentVelocity = Math.max(0, currentPhase === 'BOOT' ? vel : telemetryRef.current.velocity);
            let speedFactor = Math.min(1.0, currentVelocity / 1100.0);
            if (warpStateRef.current.active) {
              speedFactor += warpStateRef.current.transition * 1.5;
            }

            if (starMat.uniforms.uSpeedFactor) starMat.uniforms.uSpeedFactor.value = speedFactor;
            if (starMat.uniforms.uPhaseCode) starMat.uniforms.uPhaseCode.value = phaseCode;
          }
        }

        // Smoothly drift fine-grained stardust belt particles to reinforce spatial velocity flow and dust density
        if (dustBeltRef.current) {
          const dPos = dustBeltRef.current.geometry.attributes.position;
          let shipSpeedZ = 1.0; 
          if (currentPhase === 'BOOT') {
            shipSpeedZ = 1.0 + (vel / 1200) * 1.5;
          } else if (currentPhase === 'INIT') {
            shipSpeedZ = 0.5;
          } else if (currentPhase === 'FLIGHT') {
            shipSpeedZ = 1.5 + (telemetryRef.current.velocity / 1200) * 3.5;
          }
          
          for (let dIdx = 0; dIdx < 2400; dIdx++) {
            const idx = dIdx * 3;
            // Drifts horizontal flow and forward travel relative speed
            dPos.array[idx] += 4.5 * delta; // slow drift direction X
            dPos.array[idx + 2] += shipSpeedZ * delta; // forward flow direction Z
            
            // Apply parallax yaw/pitch compensation drift
            dPos.array[idx] -= shipVelocityRef.current.x * delta * 25;
            dPos.array[idx + 1] -= shipVelocityRef.current.y * delta * 25;
            
            // Coordinate range wrap
            if (dPos.array[idx] > 320) dPos.array[idx] = -320;
            if (dPos.array[idx] < -320) dPos.array[idx] = 320;
            if (dPos.array[idx + 2] > -50) dPos.array[idx + 2] = -130;
          }
          dPos.needsUpdate = true;
        }

        // Smoothly float the cockpit/glass dust particles right in front of the camera
        if (glassDustMeshRef.current && glassDustSpeedsRef.current) {
          const gPos = glassDustMeshRef.current.geometry.attributes.position;
          const speeds = glassDustSpeedsRef.current;
          
          // Match dynamic HUD color live!
          const gMat = glassDustMeshRef.current.material as THREE.PointsMaterial;
          if (gMat) {
            gMat.color.copy(activeColor);
          }

          for (let gIdx = 0; gIdx < 120; gIdx++) {
            const idx = gIdx * 3;
            
            // Apply extremely gentle Brownian drift velocities
            gPos.array[idx] += speeds[idx] * delta;
            gPos.array[idx + 1] += speeds[idx + 1] * delta;
            gPos.array[idx + 2] += speeds[idx + 2] * delta;
            
            // Add inertial lag whenever the ship pitches, yaws, or rolls
            gPos.array[idx] -= shipVelocityRef.current.x * delta * 0.45;
            gPos.array[idx + 1] -= shipVelocityRef.current.y * delta * 0.45;
            
            // Softly pull particles back slightly on warp boost acceleration
            if (currentPhase === 'BOOT' || (telemetryRef.current && telemetryRef.current.gateProgress > 0 && telemetryRef.current.gateProgress < 100)) {
              gPos.array[idx + 2] += 1.8 * delta;
            }

            // Wrap bounds: if particles exit the close-up viewport bubble, re-instantiate them smoothly
            if (Math.abs(gPos.array[idx]) > 4.5 || Math.abs(gPos.array[idx + 1]) > 3.5 || gPos.array[idx + 2] < 0.6 || gPos.array[idx + 2] > 6.9) {
              gPos.array[idx] = (Math.random() - 0.5) * 8.0;
              gPos.array[idx + 1] = (Math.random() - 0.5) * 6.0;
              gPos.array[idx + 2] = 1.0 + Math.random() * 5.8;
              
              // New random velocities
              speeds[idx] = (Math.random() - 0.5) * 0.15;
              speeds[idx + 1] = (Math.random() - 0.5) * 0.15;
              speeds[idx + 2] = (Math.random() - 0.3) * 0.1;
            }
          }
          gPos.needsUpdate = true;
        }

        // Dynamic, responsive warp/hyperspace lines update
        if (warpLinesRef.current && warpBaseCoordsRef.current) {
          const warpTrans = warpStateRef.current.transition;
          const isVisible = warpTrans > 0.01;
          warpLinesRef.current.visible = isVisible;
          
          const warpGeom = warpLinesRef.current.geometry;
          const warpPos = warpGeom.attributes.position;
          const baseCoords = warpBaseCoordsRef.current;
          
          // Calculate target trial speed and streak stretch length based on current velocity
          const currentVel = vel;
          
          // Set opacity dynamically proportional to warp transition progress
          if (warpLinesRef.current.material instanceof THREE.LineBasicMaterial) {
            warpLinesRef.current.material.opacity = warpTrans * 0.95;
          }

          // Motion translation speed along the Z axis (increases drastically on warp!)
          const trailSpeed = 0.5 + (currentVel / 1000) * 3.5 + (warpTrans * 16.0);
          // Star streaks get shorter rather than fade out over the 4 seconds using initSpeedDecay, or stretch out enormously during active warp
          const streakFactor = currentPhase === 'INIT'
            ? (0.05 + 72.0 * Math.pow(initSpeedDecay, 1.8))
            : (0.3 + (currentVel / 1000) * 8.5) * (1.0 + warpTrans * 15.0); // Stretches enormously on active warp

          for (let i = 0; i < 800; i++) {
            const idx = i * 2 * 3; // segment coordinate start
            
            // High-fidelity individual variance multipliers for dynamic lengths and speeds
            const speedVar = 0.65 + 0.7 * (( (i * 23) % 100 ) / 100.0);
            const streakVar = 0.35 + 1.3 * (( (i * 17) % 100 ) / 100.0);
            const indTrailSpeed = trailSpeed * speedVar;
            const indStreakFactor = streakFactor * streakVar;

            // 1. Progress the unperturbed base position's Z coordinate
            baseCoords[i * 3 + 2] += indTrailSpeed;

            // 2. Wrap around boundary reset if base flies past camera plane
            if (baseCoords[i * 3 + 2] > 14) {
              baseCoords[i * 3 + 2] = -160;
              
              // Regenerate random radial coordinates to prevent repeating alignments
              const radius = 12 + Math.random() * 55;
              const angle = Math.random() * Math.PI * 2;
              baseCoords[i * 3] = Math.cos(angle) * radius;
              baseCoords[i * 3 + 1] = Math.sin(angle) * radius;
            }

            // 3. Dynamic radial steering parallax drift compensation applied to baseline coordinates
            const zHead = baseCoords[i * 3 + 2];
            const depthT = (zHead - (-160)) / (14 - (-160));
            const parallaxFactor = 0.02 + 1.35 * Math.pow(Math.max(0, Math.min(1, depthT)), 1.5);

            if (steerX !== 0) {
              const shift = steerX * delta * 7.5 * parallaxFactor;
              baseCoords[i * 3] -= shift;
            }
            if (steerY !== 0) {
              const shift = steerY * delta * 7.5 * parallaxFactor;
              baseCoords[i * 3 + 1] -= shift;
            }

            const zTail = zHead - indStreakFactor;

            // 4. Wave function based on Z position, individual segment index, and time!
            // Introduce a highly refined, tight spiral / corkscrew 3D wave distortion with high uniform wave cycles
            const waveFreq = 3.8; // High frequency for extra-tight spiral loops along the Z axis
            
            // Closer lines wave more dynamically with larger amplitude, boosting depth perception
            const waveParallaxAmp = 0.3 + 1.2 * Math.pow(Math.max(0, Math.min(1, depthT)), 1.3);
            const baseAmp = 1.1 * waveParallaxAmp; // A tighter radius to make the corkscrewing spiral cohesive and perfectly defined

            // Compute head waves with a perfect 90-degree phase shift for uniform circular spiraling corkscrew
            const timePhase = now * 0.035 + (i * 0.45); // Coordinated high-speed rotation for dynamic spiraling motion
            const headPhaseX = timePhase + (zHead * waveFreq);
            
            const headWaveX = Math.sin(headPhaseX) * baseAmp;
            const headWaveY = Math.cos(headPhaseX) * baseAmp;

            // Compute tail waves (derived from tail's native Z position to bend the tube segment physically!)
            const tailPhaseX = timePhase + (zTail * waveFreq);

            const tailWaveX = Math.sin(tailPhaseX) * baseAmp;
            const tailWaveY = Math.cos(tailPhaseX) * baseAmp;

            // 5. Build dynamic coordinates mapping onto the drawn vertex buffers
            // Head vertex
            warpPos.array[idx] = baseCoords[i * 3] + headWaveX;
            warpPos.array[idx + 1] = baseCoords[i * 3 + 1] + headWaveY;
            warpPos.array[idx + 2] = zHead;

            // Tail vertex
            warpPos.array[idx + 3] = baseCoords[i * 3] + tailWaveX;
            warpPos.array[idx + 4] = baseCoords[i * 3 + 1] + tailWaveY;
            warpPos.array[idx + 5] = zTail;
          }
          warpPos.needsUpdate = true;
        }

        // Dynamic update for high-velocity custom shader warp tunnel and clutter objects visibility
        const isWarpActive = warpStateRef.current.active || warpStateRef.current.transition > 0.01;

        if (glassDustMeshRef.current) {
          glassDustMeshRef.current.visible = !isWarpActive;
        }
        if (meteorShowerRef.current) {
          meteorShowerRef.current.visible = !isWarpActive;
        }
        if (flightGridGroupRef.current) {
          flightGridGroupRef.current.visible = !isWarpActive;
        }
        if (tacticalSpaceGridRef.current) {
          tacticalSpaceGridRef.current.visible = !isWarpActive;
        }

        if (warpShaderTunnelRef.current) {
          const warpTrans = warpStateRef.current.transition;
          const isVisible = warpTrans > 0.01;
          warpShaderTunnelRef.current.visible = isVisible;
          
          if (isVisible) {
            const tunnelMat = warpShaderTunnelRef.current.material;
            tunnelMat.uniforms.uWarpTransition.value = warpTrans;
            tunnelMat.uniforms.uTime.value = now * 0.001;
            tunnelMat.uniforms.uSpeed.value = 4.5 + warpTrans * 12.0;
            
            // Set dynamic pilot's HUD color
            tunnelMat.uniforms.uColor.value.set(HUDColorHex);
            
            // Re-center around camera viewpoint
            warpShaderTunnelRef.current.position.set(camera.position.x, camera.position.y, camera.position.z - 180.0);
          }
        }

        // Spaceflight visual shake logic - DISABLED ("Don't shake screen")
        if (screenShake > 0) {
          // Screen shake completely disabled per user request
        }

        // PORTALS ARE HIDDEN (Prism cyber highways and runways bypassed)
        gateGroup.visible = false;
        warpTunnelGroup.visible = false;

        // Animate procedural asteroids with continuous left-to-right movement and massive theatrical parallax depth
        asteroidsList.forEach((rock, idx) => {
          const uData = rock.userData;
          
          if (uData.hasCollidedCooldown > 0) {
            uData.hasCollidedCooldown -= delta;
          }

          // Asteroids are unlit/matte space rocks, so emissive is kept completely dark at zero under all circumstances
          if (rock.material instanceof THREE.MeshPhysicalMaterial) {
            rock.material.emissiveIntensity = 0.0;
            rock.material.emissive.setHex(0x000000);
          }
          
          // Step multiplier to keep speeds matching the attached component's 60fps equations
          const step = delta * 60;

          // Time tracker to drive erratic, fluid 3D path weaving
          const time = performance.now() * 0.0008;
          // Gentle, cinematic microscopic wave wobble to prevent frantic/erratic jitter
          const wobbleX = Math.sin(time * (uData.wobbleFreqX || 1.0) + (uData.wobblePhaseX || 0)) * 0.03;
          const wobbleY = Math.cos(time * (uData.wobbleFreqY || 1.0) + (uData.wobblePhaseY || 0)) * 0.03;
          const wobbleZ = Math.sin(time * (uData.wobbleFreqZ || 1.0) + (uData.wobblePhaseZ || 0)) * 0.01;

          // Left-to-right velocity scaled by active cockpit speed telemetry
          const activeFlightMultiplier = 0.5 + (telemetryRef.current ? telemetryRef.current.velocity / 1000 : 0.45) * 1.5;
          
          // Multiply drift speed based on parallax depth factors (closer is faster, further is majestic crawl)
          let depthSpeedFactor = 0.45;
          if (idx < 20) {
            depthSpeedFactor = 1.65; // Foreground (Tier 1)
          } else if (idx < 110) {
            depthSpeedFactor = 0.55; // Midground (Tier 2)
          } else {
            depthSpeedFactor = 0.12; // Far background (Tier 3)
          }
          
          const xProgressSpeed = (uData.driftVector.x * activeFlightMultiplier * depthSpeedFactor + wobbleX) * step;

          // Ship's forward approach speed added to asteroid Z motion (moving them towards camera/ship)
          // Slower and tuned down significantly for ultra-fluid, majestic and realistic spaceflight dodging
          let relativeZSpeed = 0.03; // base speed - massively slowed down
          if (currentPhase === 'FLIGHT') {
            relativeZSpeed = 0.12 + (telemetryRef.current ? telemetryRef.current.velocity / 12000.0 : 0.05);
          } else if (currentPhase === 'BOOT' || currentPhase === 'INIT') {
            relativeZSpeed = 0.04 + (telemetryRef.current ? telemetryRef.current.velocity / 25000.0 : 0.02);
          }

          // MASSIVE HYPER-VELOCITY ENGINE ACCELERATION DURING WARP SPEED JUMP
          if (warpStateRef.current.active) {
            const warpTrans = warpStateRef.current.transition;
            relativeZSpeed = (relativeZSpeed + 15.0) * (3.8 + warpTrans * 38.0);
          }

          // Apply kinetic scaling stretching under warpActive or holographic re-crystallisation on exit!
          if (warpStateRef.current.active) {
            const warpTrans = warpStateRef.current.transition;
            // High speed elongation along Z, contraction on X and Y
            const stretchZ = 1.0 + warpTrans * 38.0;
            const squashX = 1.0 / (1.0 + warpTrans * 1.5);
            rock.scale.set(
              uData.originalScale.x * squashX,
              uData.originalScale.y * squashX,
              uData.originalScale.z * stretchZ
            );
          } else if (rock.userData.materializeTime && rock.userData.materializeTime > 0) {
            rock.userData.materializeTime -= delta;
            const mProgress = Math.max(0.0, Math.min(1.0, 1.0 - (rock.userData.materializeTime / 1.25)));
            
            // Draw easing elastic curve so rocks spring forward out of hyperspace singularity
            const springRatio = Math.sin(mProgress * Math.PI * 0.5) * 1.15 - Math.cos(mProgress * Math.PI * 1.5) * 0.15;
            rock.scale.copy(uData.originalScale).multiplyScalar(Math.max(0.001, springRatio));

            if (rock.material instanceof THREE.MeshPhysicalMaterial) {
              const mat = rock.material;
              mat.emissive.copy(activeColor);
              mat.emissiveIntensity = (1.0 - mProgress) * 15.0 + (mProgress * 0.5);
              if (mProgress < 0.45) {
                mat.wireframe = true;
              } else {
                mat.wireframe = false;
              }
            }
          } else {
            // Settle rock attributes to normal in normal flight
            if (rock.userData.materializeTime !== undefined) {
              rock.userData.materializeTime = 0;
            }
            rock.scale.copy(uData.originalScale);
            if (rock.material instanceof THREE.MeshPhysicalMaterial) {
              rock.material.wireframe = false;
            }
          }

          // Continuous move with custom right-to-left velocity, gentle multi-axis wobble, and fast ship forward speed along Z
          rock.position.x += xProgressSpeed;
          rock.position.y += (uData.driftVector.y + wobbleY) * step;
          rock.position.z += ((uData.driftVector.z + wobbleZ) * step) + (relativeZSpeed * step);

          // Apply pilot's steering shift (adds a layer of immersion)
          const zPos = rock.position.z;
          // Dynamically scale depthFactor based on how far in the distance the asteroid is located (Z range from -300 to -140)
          const normZ = Math.max(0, Math.min(1.0, (zPos - (-300)) / 160));
          const depthFactor = 0.08 + 1.22 * normZ * normZ;
          rock.position.x -= shipVelocityRef.current.x * delta * 45 * depthFactor;
          rock.position.y -= shipVelocityRef.current.y * delta * 45 * depthFactor;

          // Check direct interactive collision between the pilot ship (camera) and this asteroid!
          const shipRadius = 6.8; 
          const distToShip = camera.position.distanceTo(rock.position);

          // HIGH-FIDELITY SPATIAL NEAR-MISS SWOOSH SOUND TRIGGER
          const prevZPos = zPos - (((uData.driftVector.z + wobbleZ) * step) + (relativeZSpeed * step));
          const camZ = camera.position.z;
          const didCrossCamZEpisode = (prevZPos < camZ && zPos >= camZ) || (prevZPos > camZ && zPos <= camZ) || (Math.abs(zPos - camZ) < 3.2);

          if (didCrossCamZEpisode && !uData.hasPlayedNearMissSwoosh && currentPhase === 'FLIGHT') {
            uData.hasPlayedNearMissSwoosh = true; // only once per trajectory sweep
            const dx = rock.position.x - camera.position.x;
            const dy = rock.position.y - camera.position.y;
            const clearanceDist = Math.hypot(dx, dy);

            // If asteroid passed close but didn't result in a shield collision
            if (clearanceDist > (uData.collisionRadius + shipRadius) && clearanceDist < 54.0) {
              const panDirection = Math.max(-1.0, Math.min(1.0, dx / 38.0)); // Left vs Right spatial panning
              const proximityVolumeIntensity = Math.max(0.12, 1.0 - (clearanceDist / 54.0)); // tighter is louder

              // Trigger procedural sweep audio
              playNearMissSwoosh(panDirection, proximityVolumeIntensity);

              // Inject microscopic realistic wind-buffeting lens wobble as shock pressure wave hits the chassis
              camera.position.x += dx * 0.045 * proximityVolumeIntensity;
              camera.position.y += dy * 0.045 * proximityVolumeIntensity;

              // Post an elegant minor terminal alert
              if (clearanceDist < 25.0) {
                addTelemetryLog(`HUD DEBRIS CLEARANCE: TIGHT PASS [${Math.round(clearanceDist)}m] BY ${uData.asteroidType || 'ROCK'}`);
              }
            }
          }

          if (distToShip < uData.collisionRadius + shipRadius) {
            if (currentPhase === 'FLIGHT' && (!uData.hasCollidedWithShipCooldown || uData.hasCollidedWithShipCooldown <= 0)) {
              uData.hasCollidedWithShipCooldown = 2.0; // 2 seconds safety shield recalibrating cooldown
              
              // Trigger defensive shield energy deflect ring around the cockpit view
              createShieldImpactEffect(scene, camera, colorRef.current || '#00f2ff');
              
              // Trigger heavy multi-axis cockpit physical camera shake
              triggerScreenShake(3.8);
              glitchFactorRef.current = 1.0; // Max horizontal shearing glitch on immediate impact!

              // Deduct shield capacity
              const currentShield = telemetryRef.current.shieldCap;
              const nextShield = Math.max(0, currentShield - Math.floor(12 + Math.random() * 14));
              
              addTelemetryLog(`HUD COLLISION EXTRUSOR: DIRECT ASTEROID IMPACT REGISTRATION! DEFENSE GRID AT ${nextShield}%`);
              
              if (nextShield <= 0) {
                addError('SYSTEM FAULT: MULTI-AXIS DEFENSIVE SHIELD GRID TOTALLY DISCHARGED!', 'CRITICAL');
              } else {
                addError('COCKPIT IMPACT WARNING: STRUCTURAL BOUNDS PENETRATED BY CHRONOS ANOMALY', 'WARNING');
              }
              
              try {
                playDiagnosticBlip(280, 0.15);
              } catch (e) {
                console.warn('Procedural collision audio fail:', e);
              }

              updateTelemetry({ shieldCap: nextShield });

              // Scale down/damage asteroid mesh on impact
              if (rock.scale.x > 1.2) {
                rock.scale.multiplyScalar(0.72);
                uData.collisionRadius *= 0.72;
              }
            }
          }

          if (uData.hasCollidedWithShipCooldown > 0) {
            uData.hasCollidedWithShipCooldown -= delta;
          }

          // Recycle asteroid if it flies behind the camera/ship along Z
          if (rock.position.z > camera.position.z + 15.0) {
            uData.hasPlayedNearMissSwoosh = false; // Reset swoosh flag
            // Reset back deep into space relative to the camera (always recycle and keep visible)
            if (idx < 60) {
              // Tier 1 (Foreground)
              rock.position.z = camera.position.z - 180 - Math.random() * 120;
            } else if (idx < 290) {
              // Tier 2 (Midground)
              rock.position.z = camera.position.z - 280 - Math.random() * 150;
            } else {
              // Tier 3 (Background)
              rock.position.z = camera.position.z - 450 - Math.random() * 320;
            }
            
            // Randomize X and Y in front of the camera
            const radius = 25 + Math.random() * 125;
            const angle = Math.random() * Math.PI * 2;
            rock.position.x = camera.position.x + Math.cos(angle) * radius;
            rock.position.y = camera.position.y + Math.sin(angle) * radius;
            
            if (!rock.visible) {
              const orig = uData.originalScale || new THREE.Vector3(1, 1, 1);
              rock.scale.copy(orig);
              uData.collisionRadius = Math.max(orig.x, orig.y, orig.z) * 0.45;
              rock.visible = true;
            }
          }

          // Recycle asteroid if it goes off screen on the right (X > 550) because they drift left to right!
          if (rock.position.x > 550) {
            uData.hasPlayedNearMissSwoosh = false; // Reset swoosh flag
            rock.position.x = -550;
            // Spread vertical height proportional to depth (compressed to exactly 1/3 of the vertical viewport)
            const verticalSpread = (75.0 + (1.0 - (uData.parallaxDepth || 0.5)) * 125.0) / 2.5;
            rock.position.y = (Math.random() - 0.5) * verticalSpread;
            
            if (!rock.visible) {
               const orig = uData.originalScale || new THREE.Vector3(1, 1, 1);
               rock.scale.copy(orig);
               uData.collisionRadius = Math.max(orig.x, orig.y, orig.z) * 0.45;
               rock.visible = true;
            }
          }

          // Fallback bounds for extreme navigation steering shifts (recycles to right if steered too far to the left)
          if (rock.position.x < -550) {
            rock.position.x = 550;
          }
          if (Math.abs(rock.position.y) > 160) {
            rock.position.y = -rock.position.y;
          }

          // Update rotations using the procedural angular spins
          rock.rotation.x += uData.spin.x * step;
          rock.rotation.y += uData.spin.y * step;
          rock.rotation.z += uData.spin.z * step;

          // Dynamic progressive physical shattering as the travelling shockwave boundary reaches this asteroid
          if (shockwaveActiveRef.current && rock.visible) {
            const shockwaveZ = shockwaveZRef.current;
            // As shockwave whooshes forward (accelerates from -500 to 25), any asteroid behind it is disintegrated!
            if (rock.position.z <= shockwaveZ) {
              const rockScale = rock.scale.x;
              // Shatter this individual asteroid into a rich cloud of shards
              const shardCount = 6 + Math.floor(Math.random() * 5); // 6-10 solid shards per rock!

              const fragGeom = geoDodecSharedRef.current || new THREE.DodecahedronGeometry(1.0, 0);
              const fragMat = matCrustSharedRef.current || new THREE.MeshStandardMaterial({ color: 0x161514 });

              for (let f = 0; f < shardCount; f++) {
                const size = (0.12 + Math.random() * 0.35) * rockScale * 0.65;
                const fragMesh = new THREE.Mesh(
                  f % 3 === 0 ? (geoIcosSharedRef.current || fragGeom) : f % 3 === 1 ? (geoTetraSharedRef.current || fragGeom) : fragGeom,
                  f % 2 === 0 ? (matMoltenSharedRef.current || fragMat) : fragMat
                );
                fragMesh.scale.setScalar(size);
                fragMesh.userData = { isShared: true };

                fragMesh.position.copy(rock.position);
                fragMesh.position.x += (Math.random() - 0.5) * size * 2.5;
                fragMesh.position.y += (Math.random() - 0.5) * size * 2.5;
                fragMesh.position.z += (Math.random() - 0.5) * size * 2.5;

                // Push shards outwards from explosion centroid (0, 0, -500)
                const outward = new THREE.Vector3().subVectors(fragMesh.position, new THREE.Vector3(0, 0, -500));
                if (outward.lengthSq() < 0.01) outward.set(0, 1, 0);
                outward.normalize();

                // Heavy energetic boost forward so shards fly past the camera!
                const blastForce = 60.0 + Math.random() * 90.0;
                const pushVelocity = outward.multiplyScalar(blastForce);
                // Ensure tremendous forward Z velocity component!
                pushVelocity.z += 125.0 + Math.random() * 95.0;

                const finalVel = uData.driftVector ? uData.driftVector.clone().add(pushVelocity) : pushVelocity;

                const finalRot = new THREE.Vector3(
                  (Math.random() - 0.5) * 45,
                  (Math.random() - 0.5) * 45,
                  (Math.random() - 0.5) * 45
                );

                fragMesh.castShadow = false;
                fragMesh.receiveShadow = false;
                scene.add(fragMesh);

                debrisFieldRef.current.push({
                  mesh: fragMesh,
                  vel: finalVel,
                  rotVel: finalRot,
                  age: 0,
                  duration: 5.5 + Math.random() * 3.5,
                  drag: 0.988 // Coast beyond camera view nicely
                } as any);
              }

              // Spawn a colorful transient stardust particle cloud
              spawnExplosionDebrisShards(
                scene,
                rock.position,
                rockScale,
                transientExplosionsRef.current,
                uData.driftVector,
                true
              );

              // Instantly disintegrate the solid asteroid!
              rock.visible = false;
            }
          }

          if (idx > 0 && instancedAsteroidsRef.current) {
            if (rock.visible) {
              rock.updateMatrix();
              instancedAsteroidsRef.current.setMatrixAt(idx - 1, rock.matrix);
            } else {
              const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
              instancedAsteroidsRef.current.setMatrixAt(idx - 1, zeroMatrix);
            }
          }
        });

        if (instancedAsteroidsRef.current) {
          instancedAsteroidsRef.current.instanceMatrix.needsUpdate = true;
        }

        // 4B. Highly kinetic background meteor shower update
        if (meteorShowerRef.current && meteorSpeedsRef.current && meteorOffsetsRef.current && meteorAgesRef.current) {
          const mGeo = meteorShowerRef.current.geometry;
          const mPos = mGeo.attributes.position;
          const speeds = meteorSpeedsRef.current;
          const offsets = meteorOffsetsRef.current;
          const dirs = meteorDirsRef.current;
          const ages = meteorAgesRef.current;
          const totalMeteors = speeds.length;
          
          for (let mIdx = 0; mIdx < totalMeteors; mIdx++) {
            const idx = mIdx * 2 * 3;
            const offIdx = mIdx * 3;
            
            const mSpeed = speeds[mIdx];
            const dx = dirs ? dirs[offIdx] : 0.85;
            const dy = dirs ? dirs[offIdx + 1] : -0.55;
            const dz = dirs ? dirs[offIdx + 2] : 0.1;
            
            // Advance age phase of each meteor
            ages[mIdx] += delta;
            const t = ages[mIdx];
            
            // Devolve into spiral math based on time
            const t_straight = 4.2; // Go straight for a long scenic while
            
            let dist = 0;
            let R = 0;
            let theta = 0;
            
            if (t < t_straight) {
              // Straight motion stage
              dist = mSpeed * t;
              R = 0;
              theta = 0;
            } else {
              const dt = t - t_straight;
              
              // Devolves into a gradual spiral
              R = 1.1 * Math.pow(dt, 1.3);
              
              // Trajectory moves faster the more they spiral (incremental speed up factor)
              const speedFactor = 1.0 + dt * 0.55 + dt * dt * 0.08;
              dist = mSpeed * t_straight + mSpeed * dt * speedFactor;
              
              // Rotational orbital spinning gets faster/tighter
              theta = dt * 1.5 + dt * dt * 0.35;
            }
            
            // Find perpendicular plane vectors u & v for spiral disc orientation
            let ux = 0;
            let uy = 0;
            let uz = 0;
            
            if (Math.abs(dx) > 0.9) {
              ux = -dy;
              uy = dx;
              uz = 0;
            } else {
              ux = 0;
              uy = -dz;
              uz = dy;
            }
            const uLen = Math.sqrt(ux * ux + uy * uy + uz * uz);
            ux /= uLen;
            uy /= uLen;
            uz /= uLen;
            
            const vx = dy * uz - dz * uy;
            const vy = dz * ux - dx * uz;
            const vz = dx * uy - dy * ux;
            
            // Base starter position
            const sx = offsets[offIdx];
            const sy = offsets[offIdx + 1];
            const sz = offsets[offIdx + 2];
            
            // Match camera reaction steering (diagonally responsive parallax!)
            const steerX = -shipVelocityRef.current.x * delta * 20.0;
            const steerY = -shipVelocityRef.current.y * delta * 20.0;
            
            // Calculate start coordinates
            const curStartX = sx + dx * dist + R * (Math.cos(theta) * ux + Math.sin(theta) * vx) + steerX;
            const curStartY = sy + dy * dist + R * (Math.cos(theta) * uy + Math.sin(theta) * vy) + steerY;
            const curStartZ = sz + dz * dist + R * (Math.cos(theta) * uz + Math.sin(theta) * vz);
            
            // For the trailing segment end point, sample slightly back in time
            const t_trail = t - 0.05;
            let dist_tail = 0;
            let R_tail = 0;
            let theta_tail = 0;
            
            if (t_trail < t_straight) {
              dist_tail = mSpeed * Math.max(0, t_trail);
              R_tail = 0;
              theta_tail = 0;
            } else {
              const dt_tail = t_trail - t_straight;
              const speedFactor_tail = 1.0 + dt_tail * 0.55 + dt_tail * dt_tail * 0.08;
              R_tail = 1.1 * Math.pow(dt_tail, 1.3);
              dist_tail = mSpeed * t_straight + mSpeed * dt_tail * speedFactor_tail;
              theta_tail = dt_tail * 1.5 + dt_tail * dt_tail * 0.35;
            }
            
            const curEndX = sx + dx * dist_tail + R_tail * (Math.cos(theta_tail) * ux + Math.sin(theta_tail) * vx) + steerX;
            const curEndY = sy + dy * dist_tail + R_tail * (Math.cos(theta_tail) * uy + Math.sin(theta_tail) * vy) + steerY;
            const curEndZ = sz + dz * dist_tail + R_tail * (Math.cos(theta_tail) * uz + Math.sin(theta_tail) * vz);
            
            mPos.array[idx] = curStartX;
            mPos.array[idx + 1] = curStartY;
            mPos.array[idx + 2] = curStartZ;
            
            mPos.array[idx + 3] = curEndX;
            mPos.array[idx + 4] = curEndY;
            mPos.array[idx + 5] = curEndZ;
            
            // If the meteor travels entirely off-screen, too close, or exceeds its lifetime, recycle it
            if (curStartY < -220 || curStartX > 550 || curStartZ > 10.0 || t > 15.0) {
              offsets[offIdx] = -300 + Math.random() * 450;
              offsets[offIdx + 1] = 90 + Math.random() * 95;
              offsets[offIdx + 2] = -180 - Math.random() * 150;
              ages[mIdx] = 0.0;
            }
          }
          mPos.needsUpdate = true;
        }

        // ASTEROID-ASTEROID COLLISION CHECKING & DEFLECTIONS
        for (let i = 0; i < asteroidsList.length; i++) {
          const rA = asteroidsList[i];
          if (!rA.visible) continue;
          const uA = rA.userData;
          for (let j = i + 1; j < asteroidsList.length; j++) {
            const rB = asteroidsList[j];
            if (!rB.visible) continue;
            const uB = rB.userData;
            
            const dist = rA.position.distanceTo(rB.position);
            const minDist = uA.collisionRadius + uB.collisionRadius;
            
            if (dist < minDist) {
              // Resolve 3D overlapping contact
              const normal = new THREE.Vector3().subVectors(rA.position, rB.position).normalize();
              const overlap = minDist - dist;
              rA.position.addScaledVector(normal, overlap * 0.5);
              rB.position.addScaledVector(normal, -overlap * 0.5);
              
              // Only trigger dramatic effects & logs if cooldown has expired (prevent infinite re-trigger rendering)
              if ((uA.hasCollidedCooldown || 0) <= 0 && (uB.hasCollidedCooldown || 0) <= 0) {
                uA.hasCollidedCooldown = 1.5; // Prevent collision reactions for 1.5s
                uB.hasCollidedCooldown = 1.5;

                // Elastic bounce deflection calculations
                const kA = uA.driftVector.dot(normal);
                const kB = uB.driftVector.dot(normal);
                const force = kA - kB;
                
                uA.driftVector.addScaledVector(normal, -force);
                uB.driftVector.addScaledVector(normal, force);
                
                // Direct collision results in higher tumbling speed (accel contact torque)
                uA.spin.multiplyScalar(1.25);
                uB.spin.multiplyScalar(1.25);
                uA.spin.clampLength(0.012, 0.45);
                uB.spin.clampLength(0.012, 0.45);
                
                // Compute exact contact collision location
                const collisionPos = new THREE.Vector3().addVectors(rA.position, rB.position).multiplyScalar(0.5);
                
                // 1. Physically scale down both asteroids of the collision to show impact mass destruction!
                const shatterThresholdA = (uA.originalScale ? uA.originalScale.x : 1.0) * 0.42;
                const shatterThresholdB = (uB.originalScale ? uB.originalScale.x : 1.0) * 0.42;
                
                const isAShattered = rA.scale.x * 0.80 < shatterThresholdA;
                const isBShattered = rB.scale.x * 0.80 < shatterThresholdB;
                
                // Increase debris count depending on whether either/both completely shattered to dust!
                const shardsBurstCount = (isAShattered ? 22 : 8) + (isBShattered ? 22 : 8) + Math.floor(Math.random() * 8);
                
                if (isAShattered) {
                  rA.visible = false;
                  addTelemetryLog(`HUD DEBRIS CRITERION: ASTEROID_[${i}] SUCCUMBED TO DIRECT IMPACT & SHATTERED ENTIRELY`);
                } else {
                  rA.scale.multiplyScalar(0.80);
                  uA.collisionRadius *= 0.80;
                }
                
                if (isBShattered) {
                  rB.visible = false;
                  addTelemetryLog(`HUD DEBRIS CRITERION: ASTEROID_[${j}] SUCCUMBED TO DIRECT IMPACT & SHATTERED ENTIRELY`);
                } else {
                  rB.scale.multiplyScalar(0.80);
                  uB.collisionRadius *= 0.80;
                }
                
                // 2. Spawn a rich mixed spray of 3D fragments (basaltic rock fragments & glowing orange thermal sparks)!
                for (let s = 0; s < shardsBurstCount; s++) {
                  const isSpark = Math.random() > 0.40;
                  const shardSize = isSpark ? (0.04 + Math.random() * 0.08) : (0.12 + Math.random() * 0.25);
                  
                  // organic craggy geometries
                  const shardGeom = isSpark ? new THREE.TetrahedronGeometry(shardSize, 0) : new THREE.DodecahedronGeometry(shardSize, 0);
                  
                  let shardMat: THREE.Material;
                  if (isSpark) {
                    // Blinding orange thermal spark
                    shardMat = new THREE.MeshStandardMaterial({
                      color: 0xff3b00,
                      emissive: 0xff5500,
                      emissiveIntensity: 5.0 + Math.random() * 3.0,
                      roughness: 0.15,
                      metalness: 0.9,
                      flatShading: true
                    });
                  } else {
                    // Deep volcanic basalt rocky grey fragment
                    shardMat = new THREE.MeshStandardMaterial({
                      color: 0x3a3431,
                      roughness: 0.98,
                      metalness: 0.1,
                      flatShading: true
                    });
                  }
                  
                  const shardMesh = new THREE.Mesh(shardGeom, shardMat);
                  shardMesh.castShadow = false; // Disabled to prevent GPU overhead
                  shardMesh.receiveShadow = false;
                  
                  // Spawn at collision coordinates with tiny procedural offset dispersion
                  shardMesh.position.copy(collisionPos);
                  shardMesh.position.x += (Math.random() - 0.5) * 0.4;
                  shardMesh.position.y += (Math.random() - 0.5) * 0.4;
                  shardMesh.position.z += (Math.random() - 0.5) * 0.4;
                  
                  // Blast shards along contact normal with radial offset
                  const radialDir = new THREE.Vector3(
                     (Math.random() - 0.5),
                     (Math.random() - 0.5),
                     (Math.random() - 0.5)
                  ).normalize();
                  
                  const pushVel = radialDir.addScaledVector(normal, (Math.random() - 0.5) * 2.5).normalize();
                  const dispersionSpeed = 8.0 + Math.random() * 20.0; // intense physical expulsion velocities
                  const velVec = pushVel.multiplyScalar(dispersionSpeed);
                  
                  const rotVec = new THREE.Vector3(
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 20
                  );
                  
                  scene.add(shardMesh);
                  debrisFieldRef.current.push({ mesh: shardMesh, vel: velVec, rotVel: rotVec, age: 0 });
                }

                // Spawn the transient particle system representing colorful debris shards!
                const parentMomentum = uA.driftVector.clone().add(uB.driftVector).multiplyScalar(0.5);
                spawnExplosionDebrisShards(
                  scene,
                  collisionPos,
                  Math.max(rA.scale.x, rB.scale.x),
                  transientExplosionsRef.current,
                  parentMomentum,
                  false
                );
                
                // Alerts & acoustic crash crunch sounds without screen shake values
                playDiagnosticBlip(240 + Math.random() * 140, 0.15); // low crash crunch sound
                addTelemetryLog(`HUD DEBRIS NOTICE: SECTOR COLLISION RECOGNIZED #[ASTEROID_${i} x ASTEROID_${j}]`);
              }
            }
          }
        }

        // SOLID DEBRIS FIELD PIECES ACCELERATION & EXPIRATION ANIMATION LOOP
        const activeDebris = debrisFieldRef.current;
        for (let d = activeDebris.length - 1; d >= 0; d--) {
          const item = activeDebris[d];
          item.age += delta;
          
          item.mesh.position.addScaledVector(item.vel, delta);
          item.mesh.rotation.x += item.rotVel.x * delta;
          item.mesh.rotation.y += item.rotVel.y * delta;
          
          // Slow drag friction absorption (using custom slow-drag qualities for supernova cinematic persistence!)
          const drag = (item as any).drag !== undefined ? (item as any).drag : 0.96;
          item.vel.multiplyScalar(drag);
          
          const maxAge = (item as any).duration !== undefined ? (item as any).duration : 2.2; // fade timeline in seconds with dynamic duration override
          const ratio = item.age / maxAge;
          if (ratio >= 1.0) {
            scene.remove(item.mesh);
            if (!item.mesh.userData.isShared) {
              item.mesh.geometry.dispose();
              if (item.mesh.material) {
                const mats = Array.isArray(item.mesh.material) ? item.mesh.material : [item.mesh.material];
                mats.forEach((m) => m.dispose());
              }
            }
            activeDebris.splice(d, 1);
          } else {
            item.mesh.scale.setScalar(1.0 - ratio);
            // Dynamic hot ember cooling down over age using emissive heat glow:
            if (item.mesh.material instanceof THREE.MeshStandardMaterial) {
              item.mesh.material.emissiveIntensity = (1.0 - ratio) * 4.5; // scales emission glow over age
            }
          }
        }

        // TRANSIENT EXPLOSION DEBRIS SHARDS PARTICLE SYSTEMS UPDATE LOOP
        const transientExplosions = transientExplosionsRef.current;
        for (let t = transientExplosions.length - 1; t >= 0; t--) {
          const system = transientExplosions[t];
          system.age += delta;
          const ratio = system.age / system.maxAge;

          if (ratio >= 1.0) {
            scene.remove(system.points);
            system.points.geometry.dispose();
            if (system.points.material instanceof THREE.Material) {
              system.points.material.dispose();
            }
            transientExplosions.splice(t, 1);
          } else {
            // 1. Particle field translation & global spinning
            system.points.rotation.x += system.rotVel.x * delta;
            system.points.rotation.y += system.rotVel.y * delta;
            system.points.rotation.z += system.rotVel.z * delta;

            const posAttr = system.points.geometry.attributes.position;
            const posArray = posAttr.array as Float32Array;

            // 2. Continuous outwards delta translation for each spark shard
            for (let i = 0; i < system.velocities.length; i++) {
              const vel = system.velocities[i];
              // apply friction drag
              vel.multiplyScalar(system.drag);
              
              posArray[i * 3] += vel.x * delta;
              posArray[i * 3 + 1] += vel.y * delta;
              posArray[i * 3 + 2] += vel.z * delta;
            }
            posAttr.needsUpdate = true;

            // 3. Smooth cooling-down fade out
            if (system.points.material instanceof THREE.PointsMaterial) {
              system.points.material.opacity = 1.0 - ratio;
              system.points.material.size = system.points.material.size * (1.0 - ratio * 0.05);
            }
          }
        }

        // High fidelity sparks / embers update loop
        if (explosionSparksRef.current) {
          const sparks = explosionSparksRef.current;
          const geom = sparks.geometry;
          const posAttr = geom.attributes.position;
          const uD = (sparks as any).userData;
          
          uD.age += delta;
          const ratio = uD.age / uD.maxAge;
          
          if (ratio >= 1.0) {
            scene.remove(sparks);
            geom.dispose();
            if (sparks.material instanceof THREE.Material) sparks.material.dispose();
            explosionSparksRef.current = null;
          } else {
            const arr = posAttr.array as Float32Array;
            const vels = uD.velocities as THREE.Vector3[];
            for (let i = 0; i < vels.length; i++) {
              const rx = arr[i * 3];
              const ry = arr[i * 3 + 1];
              
              // Apply helical vortex curl based on radial coordinates
              const swirlStrength = 0.5 * (1.0 - ratio); // swirls decay as particles cool
              const tx = -ry * swirlStrength;
              const ty = rx * swirlStrength;

              arr[i * 3] += (vels[i].x + tx) * delta;
              arr[i * 3 + 1] += (vels[i].y + ty) * delta;
              arr[i * 3 + 2] += vels[i].z * delta;
              
              // Apply drag friction deceleration
              vels[i].multiplyScalar(0.975);
            }
            posAttr.needsUpdate = true;
            
            if (sparks.material instanceof THREE.PointsMaterial) {
              sparks.material.opacity = 1.0 - ratio;
              sparks.material.size = 3.5 * (1.0 - ratio * 0.4);
            }
          }
        }

        // High fidelity ring sparks update loop
        if (explosionRingSparksRef.current) {
          const sparks = explosionRingSparksRef.current;
          const geom = sparks.geometry;
          const posAttr = geom.attributes.position;
          const uD = (sparks as any).userData;
          
          uD.age += delta;
          const ratio = uD.age / uD.maxAge;
          
          if (ratio >= 1.0) {
            scene.remove(sparks);
            geom.dispose();
            if (sparks.material instanceof THREE.Material) sparks.material.dispose();
            explosionRingSparksRef.current = null;
          } else {
            const arr = posAttr.array as Float32Array;
            const vels = uD.velocities as THREE.Vector3[];
            for (let i = 0; i < vels.length; i++) {
              const rx = arr[i * 3];
              const ry = arr[i * 3 + 1];

              // Higher strength ring curl simulation
              const swirlStrength = 0.75 * (1.0 - ratio);
              const tx = -ry * swirlStrength;
              const ty = rx * swirlStrength;

              arr[i * 3] += (vels[i].x + tx) * delta;
              arr[i * 3 + 1] += (vels[i].y + ty) * delta;
              arr[i * 3 + 2] += vels[i].z * delta;
              
              // Apply drag friction deceleration (lower drift decay for ring expansion)
              vels[i].multiplyScalar(0.985);
            }
            posAttr.needsUpdate = true;
            
            if (sparks.material instanceof THREE.PointsMaterial) {
              sparks.material.opacity = (1.0 - ratio) * 1.5;
              sparks.material.size = 4.8 * (1.0 - ratio * 0.3);
            }
          }
        }

        // Smooth rotation update for overlapping fractal layers & expanding sphere to mimic organic turbulent gaseous expansion
        const fPlane1 = scene.getObjectByName('fractal1') as THREE.Mesh;
        const fPlane2 = scene.getObjectByName('fractal2') as THREE.Mesh;
        const fPlane3 = scene.getObjectByName('fractal3') as THREE.Mesh;
        const fSphere = scene.getObjectByName('sphere') as THREE.Mesh;

        if (fPlane1 && fPlane1.visible) {
          fPlane1.rotation.z += 0.08 * delta;
          fPlane1.position.x = Math.sin(now * 0.0018) * 0.35;
          fPlane1.position.y = Math.cos(now * 0.0015) * 0.30;
        }
        if (fPlane2 && fPlane2.visible) {
          fPlane2.rotation.z -= 0.12 * delta;
          fPlane2.position.x = -Math.cos(now * 0.0012) * 0.28;
          fPlane2.position.y = Math.sin(now * 0.0014) * 0.25;
        }
        if (fPlane3 && fPlane3.visible) {
          fPlane3.rotation.z += 0.16 * delta;
          fPlane3.position.x = Math.sin(now * 0.0022) * 0.20;
          fPlane3.position.y = -Math.cos(now * 0.0019) * 0.18;
        }
        if (fSphere && fSphere.visible) {
          fSphere.rotation.z += 0.04 * delta;
          fSphere.rotation.y -= 0.03 * delta;
          fSphere.rotation.x += 0.02 * delta;
        }

        // Realistic kinematic update and thermal materials cooling sync for newly emerged logo model (outer space physics)
        if (logoModelRef.current) {
          if (currentPhase === 'INIT') {
            logoModelRef.current.visible = logoPhysicsActive.current;

            if (logoPhysicsActive.current) {
              const targetZ = -480.0;
              const brakingZ = -495.0;
              
              if (logoZ.current < brakingZ) {
                // Outer space physics: coasting with zero atmospheric friction/drag (constant high speed)
              } else if (logoZ.current >= brakingZ && logoZ.current < targetZ) {
                // Retrograde automatic navigational braking thrusters fire to decelerate to a perfect stop at targetZ
                const remainingDistance = targetZ - logoZ.current;
                if (remainingDistance > 0.01) {
                  const requiredDecel = -(logoVelZ.current ** 2) / (2 * remainingDistance);
                  logoVelZ.current += requiredDecel * delta;
                }
              }

              logoZ.current += logoVelZ.current * delta;

              if (logoZ.current >= targetZ - 0.02) {
                logoZ.current = targetZ;
                logoVelZ.current = 0.0;
              }

              // Dynamic physical scale kinetic projection expansion - set max scale to 8.0 containing it deep-space center stage
              logoScaleRef.current += (8.0 - logoScaleRef.current) * 3.5 * delta;
              if (logoScaleRef.current > 8.0) logoScaleRef.current = 8.0;

              // Thermodynamic cooling simulation under Newton's Law of Cooling
              logoHeatRef.current -= logoHeatRef.current * 0.40 * delta;
              if (logoHeatRef.current < 0) logoHeatRef.current = 0.0;

              // Angular physical spin horizontal decay (rotates quickly at first, slows over time in counterclockwise direction)
              logoRotVelY.current -= logoRotVelY.current * 0.45 * delta;
              if (logoRotVelY.current < 0.15) {
                logoRotVelY.current = 0.15; // settles to majestic horizontal planetary drift
              }
              logoRotY.current += logoRotVelY.current * delta;
            }

            logoModelRef.current.position.z = logoZ.current;
            logoModelRef.current.scale.setScalar(logoScaleRef.current);

            const heat = Math.max(0.0, Math.min(1.0, logoHeatRef.current));
            logoModelRef.current.traverse((child) => {
              if (child instanceof THREE.Mesh && child.material) {
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                materials.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                    const baseColor = COOL_BASE_COLOR.clone().lerp(HOT_HEAT_COLOR, heat * 0.95);
                    mat.color.copy(baseColor);

                    const emissiveColor = EMISSIVE_CYAN_COLOR.clone().lerp(EMISSIVE_WHITE_COLOR, heat);
                    mat.emissive.copy(emissiveColor);
                    mat.emissiveIntensity = heat * 50.0; 

                    mat.roughness = 0.02 + heat * 0.35;
                    mat.metalness = 0.98;

                    if (mat instanceof THREE.MeshPhysicalMaterial) {
                      mat.clearcoat = 1.0;
                      mat.clearcoatRoughness = 0.01 + heat * 0.22;
                    }
                  }
                });
              }
            });

            logoModelRef.current.rotation.y = logoRotY.current;
            logoModelRef.current.rotation.x = Math.sin(now * 0.0006) * 0.08; // subtle micro-thruster stabilization wobble
          }
        }

        // Hide inactive elements during operational flight (prevent loop from overriding cinematic logo visibility)
        if (currentPhase !== 'INIT') {
          coreGroup.visible = false;
          if (logoModelRef.current) logoModelRef.current.visible = false;
        }

      // 4. CHRONOS CORE SYNCHRONIZER INTENSIFICATION (DESTINATION / EXIT)
      if (currentPhase === 'DESTINATION' || currentPhase === 'EXIT') {
        coreGroup.visible = true;
        coreGroup.position.set(0, 0, -12);
        
        // Spin fast
        const spinMultiplier = currentPhase === 'EXIT' ? 12 : 3;
        coreGroup.rotation.y += 0.012 * spinMultiplier;
        coreGroup.rotation.x += 0.006 * spinMultiplier;
        
        // Pulsate central core standard light
        innerCore.scale.setScalar(1 + Math.sin(now * 0.01) * 0.15);

        // Slow cinematic camera float for destination elegance
        camera.position.set(
          Math.sin(now * 0.001) * 0.8,
          Math.cos(now * 0.0012) * 0.4,
          2 + Math.cos(now * 0.0008) * 0.5
        );
        camera.lookAt(coreGroup.position);
      }

      // Decay our procedural glitch factor towards 0
      glitchFactorRef.current = Math.max(0, glitchFactorRef.current - 1.4 * delta);
      // Ambient minor scanline fluctuations (signal drops) in operational flight mode representing deep outer space radiation
      if (currentPhase === 'FLIGHT' && Math.random() < 0.0008) {
        glitchFactorRef.current = 0.18 + Math.random() * 0.35;
      }

      // 5. Update Cinematic Shader Uniforms dynamically to keep optical effects and distortion in sync
      if (lensPassRef.current && lensPassRef.current.uniforms) {
        if (lensPassRef.current.uniforms.uTime) lensPassRef.current.uniforms.uTime.value = now;
        
        // Feed our dynamic h-sync line shearing and scan drift glitch
        if (lensPassRef.current.uniforms.uGlitch) {
          lensPassRef.current.uniforms.uGlitch.value = glitchFactorRef.current;
        }

        // Chromatic Aberration dynamic scaling: baseline + speed-stretching + physical shaking
        if (lensPassRef.current.uniforms.uChromAb) {
          const speedFactor = Math.min(1.0, Math.abs(telemetryRef.current.velocity || 0) / 250);
          const currentAb = 0.0016 + (speedFactor * 0.0042) + ((screenShakeRef.current || 0) * 0.014);
          lensPassRef.current.uniforms.uChromAb.value = currentAb;
        }

        // Gritty film grain intensity increases at hyper speed or during high warp transitions
        if (lensPassRef.current.uniforms.uGrainIntensity) {
          const warpTrans = warpStateRef.current.transition;
          lensPassRef.current.uniforms.uGrainIntensity.value = 0.016 + warpTrans * 0.018;
        }

        // Dark vignette shadows contract at warp speed to simulate tunnel-vision G-forces
        if (lensPassRef.current.uniforms.uVignette) {
          const warpTrans = warpStateRef.current.transition;
          lensPassRef.current.uniforms.uVignette.value = 0.42 + warpTrans * 0.18;
        }
        
        let targetDistortion = 0.035;
        if (currentPhase === 'INIT') {
          targetDistortion = 0.050;
        } else if (currentPhase === 'BOOT') {
          targetDistortion = 0.040;
        } else {
          // Standard flight clean curvature + warp speed distortion!
          const warpTrans = warpStateRef.current.transition;
          targetDistortion = 0.035 + (warpTrans * 0.125);
        }

        // Apply custom warp start/exit visual pushes!
        if (warpStartEffectTimerRef.current > 0) {
          const progress = warpStartEffectTimerRef.current / 0.5; // goes 1.0 to 0.0
          targetDistortion += progress * 0.16; // heavy fisheye warp start pull
        }
        if (warpExitEffectTimerRef.current > 0) {
          const progress = warpExitEffectTimerRef.current / 1.5; // goes 1.0 to 0.0
          // Ripple oscillation wave as the ship drops out of warp speed
          targetDistortion += Math.sin(progress * Math.PI) * 0.08;
        }
        
        if (lensPassRef.current.uniforms.uDistortion) {
          lensPassRef.current.uniforms.uDistortion.value = targetDistortion;
        }
      }

      // Sync postprocessing bloom strength organically to the golden thermonuclear explosion flare timeline
      if (bloomPassRef.current) {
        let baseBloom = 1.4;
        if (explosionLightRef.current && explosionLightRef.current.intensity > 0) {
          baseBloom = 1.4 + (explosionLightRef.current.intensity * 0.075);
        }

        // Apply custom start/exit blinding flashing energy halo
        if (warpStartEffectTimerRef.current > 0) {
          const progress = warpStartEffectTimerRef.current / 0.5; // 1.0 to 0.0
          baseBloom += progress * 7.5; // extremely intense entry solar flash
        }
        if (warpExitEffectTimerRef.current > 0) {
          const progress = warpExitEffectTimerRef.current / 1.5; // 1.0 to 0.0
          baseBloom += Math.sin(progress * Math.PI) * 3.8; // exit deceleration shock wave glow
        }

        bloomPassRef.current.strength = baseBloom;
      }

      // Update active weapons ammunition (bullets)
      if (activeBulletsRef.current && activeBulletsRef.current.length > 0) {
        activeBulletsRef.current = activeBulletsRef.current.filter((b) => {
          b.age += delta;
          if (b.age >= b.duration) {
            scene.remove(b.mesh);
            if (b.mesh.geometry) b.mesh.geometry.dispose();
            if (Array.isArray(b.mesh.material)) {
              b.mesh.material.forEach((m) => m.dispose());
            } else if (b.mesh.material) {
              b.mesh.material.dispose();
            }
            return false;
          }

          // Advance position along velocity vector
          b.mesh.position.addScaledVector(b.vel, delta);

          let bulletHit = false;
          // Check collision with asteroids
          for (let i = 0; i < asteroidsList.length; i++) {
            const rock = asteroidsList[i];
            if (!rock || !rock.visible) continue;

            const dist = b.mesh.position.distanceTo(rock.position);
            const collisionThreshold = (rock.userData.collisionRadius || 5.0) + 4.5;

            if (dist < collisionThreshold) {
              // Trigger procedural shattering
              const globalShatter = (window as any).shatterAsteroidGlobal;
              if (typeof globalShatter === 'function') {
                globalShatter(rock);
              } else {
                rock.visible = false;
              }
              
              bulletHit = true;
              triggerScreenShake(2.5); // Add a satisfying kick of screen shake on impact

              // Project the 3D position of collision onto 2D screenspace coordinate
              try {
                const targetCamera = cameraRef.current || camera;
                if (targetCamera) {
                  const projVector = new THREE.Vector3();
                  projVector.copy(rock.position);
                  projVector.project(targetCamera);

                  // Convert NDC (-1 to 1) to screen coordinates (0 to 1)
                  const screenX = (projVector.x * 0.5) + 0.5;
                  const screenY = -(projVector.y * 0.5) + 0.5;

                  const activeTheme = asteroidThemeRef.current || 'GOLD_GUNMETAL';

                  const specColors: Record<string, string[]> = {
                    'CHROME_BLOOD': ['#ff2d2d', '#ef4444', '#b91c1c', '#ffffff'],
                    'GOLD_GUNMETAL': ['#eab308', '#f59e0b', '#78350f', '#fef08a'],
                    'OBSIDIAN_MOTTLED': ['#06b6d4', '#0891b2', '#0c4a6e', '#cffafe'],
                    'CARBON_VIOLET': ['#d946ef', '#c084fc', '#4c1d95', '#fae8ff'],
                    'OPAL_STARDUST': ['#fdba74', '#f97316', '#7c2d12', '#ffedd5'],
                    'IRON_GREEN': ['#22c55e', '#4ade80', '#064e3b', '#dcfce7'],
                    'QUICKSILVER_COPPER': ['#f97316', '#ff8c00', '#1e293b', '#fffbeb'],
                  };

                  const matchedColors = specColors[activeTheme] || ['#ff2d2d', '#eab308', '#06b6d4', '#d946ef'];

                  confetti({
                    particleCount: 30,
                    spread: 50,
                    origin: { x: screenX, y: screenY },
                    colors: matchedColors,
                    gravity: 0.8,
                    ticks: 60,
                    scalar: 0.65
                  });
                }
              } catch (projErr) {
                console.warn('Projection confetti failure:', projErr);
              }
              
              // Increment shield power levels slightly on destroying a threat
              const currentCap = telemetry.shieldCap;
              updateTelemetry({
                shieldCap: Math.min(100, currentCap + 1.5)
              });

              addTelemetryLog(`TACTICAL SECURE: Matter obstruction [AST-${1200 + i}] neutralized by pilot weaponry.`);
              break;
            }
          }

          if (bulletHit) {
            scene.remove(b.mesh);
            if (b.mesh.geometry) b.mesh.geometry.dispose();
            if (Array.isArray(b.mesh.material)) {
              b.mesh.material.forEach((m) => m.dispose());
            } else if (b.mesh.material) {
              b.mesh.material.dispose();
            }
            return false;
          }

          return true;
        });
      }

      if (composerRef.current) {
        composerRef.current.render();
      } else {
        renderer.render(scene, camera);
      }
    };
    
    // Begin Loop
    animate();

    return () => {
      isMounted = false;
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (composerRef.current) {
        composerRef.current.dispose();
      }
      starGeometry.dispose();
      starMaterial.dispose();
      
      // Clean up warp lines
      if (warpLinesRef.current) {
        if (warpLinesRef.current.geometry) warpLinesRef.current.geometry.dispose();
        if (warpLinesRef.current.material) {
          const mats = Array.isArray(warpLinesRef.current.material) ? warpLinesRef.current.material : [warpLinesRef.current.material];
          mats.forEach((m) => m.dispose());
        }
      }
      
      // Clean up shader warp tunnel
      if (warpShaderTunnelRef.current) {
        if (warpShaderTunnelRef.current.geometry) warpShaderTunnelRef.current.geometry.dispose();
        if (warpShaderTunnelRef.current.material) {
          warpShaderTunnelRef.current.material.dispose();
        }
      }
      
      // Clean up explosion sparks
      if (explosionSparksRef.current) {
        scene.remove(explosionSparksRef.current);
        explosionSparksRef.current.geometry.dispose();
        if (explosionSparksRef.current.material) {
          const mats = Array.isArray(explosionSparksRef.current.material) ? explosionSparksRef.current.material : [explosionSparksRef.current.material];
          mats.forEach((m) => m.dispose());
        }
      }

      // Clean up explosion ring sparks
      if (explosionRingSparksRef.current) {
        scene.remove(explosionRingSparksRef.current);
        explosionRingSparksRef.current.geometry.dispose();
        if (explosionRingSparksRef.current.material) {
          const mats = Array.isArray(explosionRingSparksRef.current.material) ? explosionRingSparksRef.current.material : [explosionRingSparksRef.current.material];
          mats.forEach((m) => m.dispose());
        }
      }

      // Dispose procedural fractal texture safely
      if (fractalTextureRef.current) {
        fractalTextureRef.current.dispose();
      }
      
      // Dispose all procedural asteroid geometries
      asteroidsList.forEach((rock) => {
        if (rock.geometry) rock.geometry.dispose();
      });

      // Dispose pooled materials and their high-res dynamic texture canvases safely
      materialPool.forEach((m: any) => {
        if (m.map) m.map.dispose();
        if (m.bumpMap) m.bumpMap.dispose();
        if (m.normalMap) m.normalMap.dispose();
        if (m.roughnessMap) m.roughnessMap.dispose();
        if (m.metalnessMap) m.metalnessMap.dispose();
        m.dispose();
      });

      // Dispose shared stardust belt buffers
      if (beltDustGeo) beltDustGeo.dispose();
      if (beltDustMat) beltDustMat.dispose();

      // Clear the static mapCache to rebuild fresh safe textures on next mount
      mapCache.clear();

      // Dispose newly added pre-allocated shared geometries/materials
      if (geoDodecSharedRef.current) geoDodecSharedRef.current.dispose();
      if (geoIcosSharedRef.current) geoIcosSharedRef.current.dispose();
      if (geoTetraSharedRef.current) geoTetraSharedRef.current.dispose();
      if (matMoltenSharedRef.current) matMoltenSharedRef.current.dispose();
      if (matCrustSharedRef.current) matCrustSharedRef.current.dispose();
      if (matBasaltSharedRef.current) matBasaltSharedRef.current.dispose();
    };
  }, []);

  // COORDINATE AND RUN THE CINEMATIC TIMELINE ON INIT STATE
  useEffect(() => {
    if (phase === 'INIT') {
      // Direct instant jump bypass to remove all explosion and intro kinematics
      setPhase('FLIGHT');
      return;
    }
    const currentPhaseCast = phase as any;
    if (currentPhaseCast !== 'INIT' || !cameraRef.current || !explosionLightRef.current) return;

    addTelemetryLog('MISSION STATUS: INITIATING KINETIC FLIGHT VECTOR CALCULATIONS');
    setSkipTimerVisible(true);

    const camera = cameraRef.current;
    const scene = sceneRef.current;

    // Reset logo custom physics states on begin
    logoPhysicsActive.current = false;
    logoZ.current = -500.0;
    logoVelZ.current = 0.0;
    logoRotY.current = 0.0;
    logoRotVelY.current = 0.0;

    // Initialize properties whenever INIT phase begins
    logoScaleRef.current = 0.001;
    logoHeatRef.current = 1.0;
    logoZRef.current = -200;
    cameraApproachProgressRef.current = 0.0;
    flightTimeRef.current = 0.0;
    shockwaveHitRef.current = false;
    localCameraShakeRef.current = 0.0;

    // Reset components to start
    camera.position.set(0, 0.4, 14);
    camera.fov = 75;
    camera.updateProjectionMatrix();

    if (logoModelRef.current) {
      logoModelRef.current.scale.set(0.001, 0.001, 0.001);
      logoModelRef.current.visible = false;
    }

    const nebPlane1 = scene?.getObjectByName('nebula1') as THREE.Mesh | undefined;
    const nebPlane2 = scene?.getObjectByName('nebula2') as THREE.Mesh | undefined;
    const nebPlane3 = scene?.getObjectByName('nebula3') as THREE.Mesh | undefined;

    if (nebPlane1 && nebPlane1.material instanceof THREE.Material) {
      nebPlane1.material.opacity = 0;
    }
    if (nebPlane2 && nebPlane2.material instanceof THREE.Material) {
      nebPlane2.material.opacity = 0;
    }
    if (nebPlane3 && nebPlane3.material instanceof THREE.Material) {
      nebPlane3.material.opacity = 0;
    }

    // Build timeline using GSAP
    const tl = gsap.timeline({
      onUpdate: () => {
        // Track visual countdown
        const timeElapsed = tl.time();
        setCinematicRemaining(Math.max(0, Math.ceil(16 - timeElapsed)));
      },
      onComplete: () => {
        setSkipTimerVisible(false);
        cleanupCinematicVisuals(scene);
        addTelemetryLog('CINEMATIC INTRO CONCLUDED. QUANTUM SYSTEMS PRIMED & READY.');
        setPhase('FLIGHT');
      }
    });
    cinematicTimelineRef.current = tl;

    // Set initial state of flash overlay
    if (flashOverlayRef.current) {
      tl.set(flashOverlayRef.current, { opacity: 0 }, 0);
    }

    // TIMELINE CONFIGURATION:

    // 0-7s: Camera Approach slowly flying
    tl.to(camera.position, {
      z: 7,
      y: 0.1,
      duration: 7,
      ease: 'sine.inOut',
    }, 0);

    // Subtle camera sway (sine wave)
    tl.to(camera.position, {
      x: 0.25,
      duration: 3.5,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: 1, // repeats once to hit t = 7s
    }, 0);

    // 7.0s: TIMELINE TRANSITION TO LOGO MATRIX
    tl.call(() => {
      // Gentle transition warp sound and log update
      playWarpWhoosh();
      addTelemetryLog('TRANSIT SYSTEM: QUANTUM GATE VECTOR LOCK ACQUIRED AT Z:-200');
      const skipExplosions = true;
      if (skipExplosions) {
        return;
      }

      // 1. Shake HUD screen violently! - DISABLED ("Don't shake screen")
      triggerScreenShake(0);

      // 2. Play explosion pulse & audio cues!
      playWarpWhoosh();
      addTelemetryLog('ALERT_SUPERNOVA: HUGE COSMIC BIG BANG DETECTED AT VECTOR Z:-200!');

      // Pre-allocate shared geometries and materials to eliminate dynamic compilation overhead and prevent browser freezing!
      const geoDodecShared = new THREE.DodecahedronGeometry(1.0, 0);
      const geoIcosShared = new THREE.IcosahedronGeometry(1.0, 1);
      const geoTetraShared = new THREE.TetrahedronGeometry(1.0, 0);

      const matMoltenShared = new THREE.MeshStandardMaterial({
        color: 0xff3800, // volcanic magma lava-orange
        emissive: 0xff2a00,
        emissiveIntensity: 8.5,
        roughness: 0.92,
        metalness: 0.15,
        flatShading: true
      });

      const matCrustShared = new THREE.MeshStandardMaterial({
        color: 0x161514, // near black dark carbonaceous charred outer crust
        roughness: 0.95,
        metalness: 0.1,
        flatShading: true
      });

      const matBasaltShared = new THREE.MeshStandardMaterial({
        color: 0x242220, // rugged weathered basaltic dark-gray rock
        roughness: 0.9,
        metalness: 0.05,
        flatShading: true
      });

      const geomsPool = [geoDodecShared, geoIcosShared, geoTetraShared];
      const matsPool = [matMoltenShared, matCrustShared, matBasaltShared];
      
      // 3. Play and trigger photorealistic background video planes (saves RAM and CPU!)
      if (scene) {
        // Spawn 6400+ hyper-glowing photorealistic stellar sparks points with 8-fold radial symmetry
        const symmetrySectors = 8;
        const sparkCount = 6400; // Divisible by 8 (800 items per sector)
        const sparkPositions = new Float32Array(sparkCount * 3);
        const sparkColors = new Float32Array(sparkCount * 3);
        const sparkVelocities: THREE.Vector3[] = [];

        for (let base = 0; base < sparkCount / symmetrySectors; base++) {
          // Generate an organic base path/point
          const baseX = (Math.random() - 0.5) * 4.0;
          const baseY = (Math.random() - 0.5) * 4.0;
          const baseZOffset = (Math.random() - 0.5) * 6.0;

          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const speed = 65.0 + Math.random() * 235.0;

          const baseVelX = Math.sin(phi) * Math.cos(theta) * speed;
          const baseVelY = Math.sin(phi) * Math.sin(theta) * speed;
          // Substantial forward boost to fly beyond the camera!
          const baseVelZ = Math.cos(phi) * speed + (125.0 + Math.random() * 185.0);

          // Highly vivid, psychedelic color definitions for this symmetric stream
          const baseCol = new THREE.Color();
          const rand = Math.random();
          if (rand > 0.85) {
            baseCol.setRGB(1.0, 0.98, 0.95); // White-hot peak thermal flare
          } else if (rand > 0.65) {
            baseCol.setRGB(1.0, 0.05, 0.55); // Intense hot psychedelic pink/magenta
          } else if (rand > 0.40) {
            baseCol.setRGB(0.0, 0.98, 1.0);  // Brilliant neon cyan
          } else if (rand > 0.18) {
            baseCol.setRGB(1.0, 0.65, 0.0);  // Solar gold-amber
          } else {
            baseCol.setRGB(0.55, 0.0, 1.0);  // High-entropy electric purple
          }

          for (let s = 0; s < symmetrySectors; s++) {
            const angle = (s * 2.0 * Math.PI) / symmetrySectors;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            // Rotate coordinates around Z center to form 8 perfectly symmetric shooting spokes
            const rx = baseX * cosA - baseY * sinA;
            const ry = baseX * sinA + baseY * cosA;

            // Rotate velocities similarly for aligned expansion vector
            const rvx = baseVelX * cosA - baseVelY * sinA;
            const rvy = baseVelX * sinA + baseVelY * cosA;

            const idx = (base * symmetrySectors) + s;
            sparkPositions[idx * 3] = rx;
            sparkPositions[idx * 3 + 1] = ry;
            sparkPositions[idx * 3 + 2] = -500 + baseZOffset;

            sparkVelocities.push(new THREE.Vector3(rvx, rvy, baseVelZ));

            sparkColors[idx * 3] = baseCol.r;
            sparkColors[idx * 3 + 1] = baseCol.g;
            sparkColors[idx * 3 + 2] = baseCol.b;
          }
        }

        const sparkGeom = new THREE.BufferGeometry();
        sparkGeom.setAttribute('position', new THREE.BufferAttribute(sparkPositions, 3));
        sparkGeom.setAttribute('color', new THREE.BufferAttribute(sparkColors, 3));

        const sparkMat = new THREE.PointsMaterial({
          size: 3.5,
          map: createSparkTexture(),
          transparent: true,
          opacity: 1.0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true
        });

        const sparks = new THREE.Points(sparkGeom, sparkMat);
        sparks.name = 'explosion_sparks';
        scene.add(sparks);
        explosionSparksRef.current = sparks;
        (sparks as any).userData = {
          velocities: sparkVelocities,
          age: 0,
          maxAge: 7.2
        };

        // Spawn 3200+ secondary radial expanding ring particles with beautiful 12-fold radial symmetry!
        const ringSymmetry = 12;
        const ringCount = 3240; // Divisible by 12 (270 items per sector)
        const ringPositions = new Float32Array(ringCount * 3);
        const ringColors = new Float32Array(ringCount * 3);
        const ringVelocities: THREE.Vector3[] = [];

        for (let base = 0; base < ringCount / ringSymmetry; base++) {
          const baseAngle = Math.random() * ((Math.PI * 2.0) / ringSymmetry);
          const r = 1.5 + Math.random() * 3.5; // dense starter core ring shape
          const baseZSpread = (Math.random() - 0.5) * 5.0;

          const baseX = Math.cos(baseAngle) * r;
          const baseY = Math.sin(baseAngle) * r;

          // Radial expansion velocity
          const radialSpeed = 105.0 + Math.random() * 255.0;
          const baseVelX = Math.cos(baseAngle) * radialSpeed;
          const baseVelY = Math.sin(baseAngle) * radialSpeed;
          // Substantial forward boost to fly beyond the camera!
          const baseVelZ = (Math.random() - 0.5) * 20.0 + (125.0 + Math.random() * 185.0);

          const baseCol = new THREE.Color();
          const randCol = Math.random();
          if (randCol > 0.85) {
            baseCol.setRGB(1.0, 1.0, 1.0); // Extreme star white core
          } else if (randCol > 0.60) {
            baseCol.setRGB(0.0, 0.95, 1.0); // Brilliant electric neon cyan
          } else if (randCol > 0.35) {
            baseCol.setRGB(1.0, 0.0, 0.85); // Acid magenta pink
          } else if (randCol > 0.15) {
            baseCol.setRGB(1.0, 0.45, 0.0); // Radiant solar lava orange
          } else {
            baseCol.setRGB(0.2, 1.0, 0.4); // Ionic lime turquoise
          }

          for (let s = 0; s < ringSymmetry; s++) {
            const angle = (s * 2.0 * Math.PI) / ringSymmetry;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);

            const rx = baseX * cosA - baseY * sinA;
            const ry = baseX * sinA + baseY * cosA;

            const rvx = baseVelX * cosA - baseVelY * sinA;
            const rvy = baseVelX * sinA + baseVelY * cosA;

            const idx = (base * ringSymmetry) + s;
            ringPositions[idx * 3] = rx;
            ringPositions[idx * 3 + 1] = ry;
            ringPositions[idx * 3 + 2] = -500 + baseZSpread;

            ringVelocities.push(new THREE.Vector3(rvx, rvy, baseVelZ));

            ringColors[idx * 3] = baseCol.r;
            ringColors[idx * 3 + 1] = baseCol.g;
            ringColors[idx * 3 + 2] = baseCol.b;
          }
        }

        const ringGeom = new THREE.BufferGeometry();
        ringGeom.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
        ringGeom.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));

        const ringMat = new THREE.PointsMaterial({
          size: 4.8,
          map: createSparkTexture(),
          transparent: true,
          opacity: 1.0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          vertexColors: true
        });

        const ringSparks = new THREE.Points(ringGeom, ringMat);
        ringSparks.name = 'explosion_ring_sparks';
        scene.add(ringSparks);
        explosionRingSparksRef.current = ringSparks;
        (ringSparks as any).userData = {
          velocities: ringVelocities,
          age: 0,
          maxAge: 7.2
        };
        const coreGlow = scene.getObjectByName('glow') as THREE.Mesh;
        const lensFlare = scene.getObjectByName('flare') as THREE.Mesh;
        const shockwave1 = scene.getObjectByName('shockwave1') as THREE.Mesh;
        const shockwave2 = scene.getObjectByName('shockwave2') as THREE.Mesh;

        // Coordinates traveling shockwave Z position reference for dynamic asteroid destruction
        shockwaveZRef.current = -500.0;
        shockwaveActiveRef.current = true;
        gsap.to(shockwaveZRef, {
          current: 25.0,
          duration: 1.8,
          ease: 'power3.in', // realistic kinetic whoosh acceleration towards the camera!
          onComplete: () => {
            shockwaveActiveRef.current = false;
          }
        });

        // Animate the expanding kinetic shockwaves with helical swirl rotation, whooshing to the camera
        if (shockwave1 && shockwave1.material instanceof THREE.MeshBasicMaterial) {
          const mat = shockwave1.material;
          shockwave1.position.z = -500.0;
          shockwave1.scale.set(10.0, 10.0, 1.0);
          shockwave1.rotation.z = 0;
          mat.opacity = 1.0;
          shockwave1.visible = true;
          
          gsap.to(shockwave1.position, {
            z: 22.0, // flies right past the camera
            duration: 1.8,
            ease: 'power3.in'
          });
          gsap.to(shockwave1.scale, {
            x: 650.0,
            y: 650.0,
            duration: 1.8,
            ease: 'power3.in',
            onComplete: () => { shockwave1.visible = false; }
          });
          gsap.to(shockwave1.rotation, {
            z: Math.PI * 2.5,
            duration: 1.8,
            ease: 'power1.out'
          });
          gsap.to(mat, {
            opacity: 0,
            duration: 1.8,
            ease: 'power3.in'
          });
        }

        if (shockwave2 && shockwave2.material instanceof THREE.MeshBasicMaterial) {
          const mat = shockwave2.material;
          shockwave2.position.z = -500.0;
          shockwave2.scale.set(12.0, 12.0, 1.0);
          shockwave2.rotation.z = Math.PI / 3;
          mat.opacity = 0.8;
          shockwave2.visible = true;
          
          gsap.to(shockwave2.position, {
            z: 25.0,
            duration: 1.9,
            ease: 'power3.in'
          });
          gsap.to(shockwave2.scale, {
            x: 700.0,
            y: 700.0,
            duration: 1.9,
            ease: 'power3.in',
            onComplete: () => { shockwave2.visible = false; }
          });
          gsap.to(shockwave2.rotation, {
            z: -Math.PI * 2.0,
            duration: 1.9,
            ease: 'power1.out'
          });
          gsap.to(mat, {
            opacity: 0,
            duration: 1.9,
            ease: 'power3.in'
          });
        }

        // Animate the Radial Cosmic Glow Plane to simulate 3D shockwave volume expansion
        if (coreGlow && coreGlow.material instanceof THREE.MeshBasicMaterial) {
          const mat = coreGlow.material;
          coreGlow.scale.set(0.1, 0.1, 1.0);
          mat.opacity = 1.0;
          coreGlow.visible = true;

          // Split second bright explosion flash for extreme photorealism
          gsap.to(coreGlow.scale, {
            x: 9.5,
            y: 9.5,
            duration: 0.65,
            ease: 'expo.out',
            onComplete: () => {
              gsap.to(mat, {
                opacity: 0,
                duration: 0.55,
                ease: 'sine.inOut',
                onComplete: () => {
                   coreGlow.visible = false;
                }
              });
            }
          });
        }

        // Animate the Horizontal Anamorphic Lens Flare Line Plane matching the blinding center source beam
        if (lensFlare && lensFlare.material instanceof THREE.MeshBasicMaterial) {
          const mat = lensFlare.material;
          lensFlare.scale.set(0.1, 2.5, 1.0);
          mat.opacity = 1.0;
          lensFlare.visible = true;

          // Razor-sharp split second lens flare flash emission
          gsap.to(lensFlare.scale, {
            x: 12.0,
            duration: 0.12,
            ease: 'expo.out',
            onComplete: () => {
              gsap.to(mat, {
                opacity: 0,
                duration: 0.35,
                ease: 'power3.out',
                onComplete: () => {
                  lensFlare.visible = false;
                }
              });
              gsap.to(lensFlare.scale, {
                x: 14.0,
                y: 0.01, // swift vertical squeeze representing cooling flare lines
                duration: 0.35,
                ease: 'power3.out'
              });
            }
          });
        }

        const fPlane1 = scene.getObjectByName('fractal1') as THREE.Mesh;
        const fPlane2 = scene.getObjectByName('fractal2') as THREE.Mesh;
        const fPlane3 = scene.getObjectByName('fractal3') as THREE.Mesh;
        const fSphere = scene.getObjectByName('sphere') as THREE.Mesh;

        if (fPlane1 && fPlane1.material instanceof THREE.MeshBasicMaterial) {
          const mat = fPlane1.material;
          fPlane1.scale.set(0.1, 0.1, 1.0);
          mat.opacity = 1.0;
          fPlane1.visible = true;
          gsap.to(fPlane1.scale, {
            x: 9.2,
            y: 9.2,
            duration: 2.5,
            ease: 'expo.out'
          });
          gsap.to(mat, {
            opacity: 0,
            duration: 2.5,
            ease: 'power2.out',
            onComplete: () => { fPlane1.visible = false; }
          });
        }

        if (fPlane2 && fPlane2.material instanceof THREE.MeshBasicMaterial) {
          const mat = fPlane2.material;
          fPlane2.scale.set(0.1, 0.1, 1.0);
          mat.opacity = 0.90;
          fPlane2.visible = true;
          gsap.delayedCall(0.08, () => {
            gsap.to(fPlane2.scale, {
              x: 8.0,
              y: 8.0,
              duration: 2.3,
              ease: 'expo.out'
            });
            gsap.to(mat, {
              opacity: 0,
              duration: 2.3,
              ease: 'power2.out',
              onComplete: () => { fPlane2.visible = false; }
            });
          });
        }

        if (fPlane3 && fPlane3.material instanceof THREE.MeshBasicMaterial) {
          const mat = fPlane3.material;
          fPlane3.scale.set(0.1, 0.1, 1.0);
          mat.opacity = 0.95;
          fPlane3.visible = true;
          gsap.delayedCall(0.12, () => {
            gsap.to(fPlane3.scale, {
              x: 7.2,
              y: 7.2,
              duration: 2.2,
              ease: 'expo.out'
            });
            gsap.to(mat, {
              opacity: 0,
              duration: 2.2,
              ease: 'power2.out',
              onComplete: () => { fPlane3.visible = false; }
            });
          });
        }

        if (fSphere && fSphere.material instanceof THREE.MeshBasicMaterial) {
          const mat = fSphere.material;
          fSphere.scale.set(0.01, 0.01, 0.01);
          mat.opacity = 1.0;
          fSphere.visible = true;
          gsap.to(fSphere.scale, {
            x: 13.5,
            y: 13.5,
            z: 13.5,
            duration: 2.7,
            ease: 'expo.out'
          });
          gsap.to(mat, {
            opacity: 0,
            duration: 2.7,
            ease: 'power3.out',
            onComplete: () => { fSphere.visible = false; }
          });
        }

        // Spawn a magnificent, hyper-photorealistic stellar firestorm of 144+ solid 3D debris shards with 6-fold radial symmetry!
        const shardSymmetry = 6;
        const totalShardCount = 144; // 24 * 6
        for (let base = 0; base < totalShardCount / shardSymmetry; base++) {
          const typeIdx = Math.floor(Math.random() * geomsPool.length);
          const matIdx = Math.floor(Math.random() * matsPool.length);
          const shardSize = 0.08 + Math.random() * 0.48; // high variation in chunk scale
          
          const baseX = (Math.random() - 0.5) * 15.0;
          const baseY = (Math.random() - 0.5) * 15.0;
          const baseZ = -500.0;
          
          // Compute true spherical 3D direction vectors (bursts in all 360-degree directions!)
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos((Math.random() * 2) - 1);
          const dx = Math.sin(phi) * Math.cos(theta);
          const dy = Math.sin(phi) * Math.sin(theta);
          const dz = Math.cos(phi);
          
          // Blazing kinetic ejection speeds with wide variety
          const speed = 35.0 + Math.random() * 215.0;
          const baseVel = new THREE.Vector3(dx * speed, dy * speed, dz * speed);
          
          for (let s = 0; s < shardSymmetry; s++) {
            const angle = (s * 2.0 * Math.PI) / shardSymmetry;
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            
            // Rotate base coordinates and velocities around Z centroid to build 6-fold symmetrical streams
            const rx = baseX * cosA - baseY * sinA;
            const ry = baseX * sinA + baseY * cosA;
            
            const rvx = baseVel.x * cosA - baseVel.y * sinA;
            const rvy = baseVel.x * sinA + baseVel.y * cosA;
            
            const shardMesh = new THREE.Mesh(geomsPool[typeIdx], matsPool[matIdx]);
            shardMesh.scale.setScalar(shardSize);
            shardMesh.userData = { isShared: true };
            shardMesh.position.set(rx, ry, baseZ);
            
            // Heavy rotational spinning rates (each shard spins independently for realism)
            const rotVec = new THREE.Vector3(
              (Math.random() - 0.5) * 45,
              (Math.random() - 0.5) * 45,
              (Math.random() - 0.5) * 45
            );
            
            shardMesh.castShadow = false; // Disabled to prevent GPU out-of-memory crashes
            shardMesh.receiveShadow = false;
            scene.add(shardMesh);
            
            // Store customized high-performance values (longer life, lower friction drag) for cinematic expansion!
            debrisFieldRef.current.push({
              mesh: shardMesh,
              vel: new THREE.Vector3(rvx, rvy, baseVel.z + (125.0 + Math.random() * 185.0)), // Boosted forward past camera!
              rotVel: rotVec,
              age: 0,
              duration: 6.5 + Math.random() * 3.5, // custom persistent lifespans
              drag: 0.988 // lower friction drag so they continue coasting into deep space!
            } as any);
          }
        }
      }

      // 4. Asteroid Shattering dynamic check is active! Standard instanced loop is cleared; 
      // Individual asteroids are dynamically split progressively when matched with the traveling shockwave wavefront Z in the main render loop.

      // 5. Trigger Orange/Blue flash light explosion (ambient volumetric glow inside cockpit)
      // Transition from blinding white hot start to orange, then deep space cooling red glow
      if (explosionLightRef.current) {
        const light = explosionLightRef.current;
        light.color.setHex(0xffffff);
        gsap.to(light, {
          intensity: 480, // extremely bright flash
          duration: 0.04, // instant split-second peak
          ease: 'power4.out',
          onComplete: () => {
            gsap.to(light.color, {
              r: 1.0,
              g: 0.35,
              b: 0.0, // warm sunset lava orange shift
              duration: 0.25,
              ease: 'power2.out',
              onComplete: () => {
                gsap.to(light.color, {
                  r: 0.3,
                  g: 0.0,
                  b: 0.0, // slow cooling deep gas red decay
                  duration: 0.55,
                  ease: 'power1.out'
                });
              }
            });
            gsap.to(light, {
              intensity: 0,
              duration: 0.96, // fades back out smoothly and completes precisely inside 1.0 second!
              ease: 'power2.out',
            });
          }
        });
      }

    }, [], 7.0);

    // 7.0s: The brand new logo is dynamically synthesized from the nuclear firestorm!
    tl.call(() => {
      addTelemetryLog('DIAGNOSTICS: NUCLEATION VECTOR DETECTED... SYNTHESIZING LOGO CORE');
      playDiagnosticBlip(920, 0.12);
      
      // Trigger advanced outer space Newtonian kinematics launch state
      logoZ.current = -500.0;
      logoVelZ.current = 110.0; // high rate of speed throwing forward
      logoRotY.current = 0.0;
      logoRotVelY.current = -15.0; // fast horizontal counterclockwise spin (negative Y is horiz CCW relative to camera)
      logoHeatRef.current = 1.0;
      logoScaleRef.current = 0.001;
      logoPhysicsActive.current = true;
    }, [], 7.0);

    // Layered volumetric nebula gaseous cloud fades synced tightly to the main timeline
    if (nebPlane1 && nebPlane1.material) {
      nebPlane1.scale.set(0.01, 0.01, 1.0);
      tl.to(nebPlane1.scale, {
        x: 1.45,
        y: 1.45,
        duration: 6.5,
        ease: 'power2.out',
      }, 7.0);
      tl.to(nebPlane1.material, {
        opacity: 0.92, // Deep-space dark rich psychedelic background
        duration: 4.8,
        ease: 'sine.inOut',
      }, 7.0);
    }
    if (nebPlane2 && nebPlane2.material) {
      nebPlane2.scale.set(0.01, 0.01, 1.0);
      tl.to(nebPlane2.scale, {
        x: 1.35,
        y: 1.35,
        duration: 7.2,
        ease: 'power2.out',
      }, 7.0);
      tl.to(nebPlane2.material, {
        opacity: 0.95, // Rich cinematic glowing boundary
        duration: 5.5,
        ease: 'sine.inOut',
      }, 7.0);
    }
    if (nebPlane3 && nebPlane3.material) {
      nebPlane3.scale.set(0.01, 0.01, 1.0);
      tl.to(nebPlane3.scale, {
        x: 1.25,
        y: 1.25,
        duration: 7.8,
        ease: 'power2.out',
      }, 7.0);
      tl.to(nebPlane3.material, {
        opacity: 0.98, // Bright central hot neon-cyan core
        duration: 6.2,
        ease: 'sine.inOut',
      }, 7.0);
    }

    // 8.5s: SAVANT logo / core emerge sequence when the explosion clears!
    tl.call(() => {
      addTelemetryLog('DIAGNOSTICS: COMPILING QUANTUM VECTOR... SAVANT CORE ONLINE');
      playDiagnosticBlip(920, 0.12);
      
      // Halo corona aura backing to highlight the physical 3D steel of the logo
      if (scene) {
        const coreGlow = scene.getObjectByName('glow') as THREE.Mesh;
        if (coreGlow && coreGlow.material instanceof THREE.MeshBasicMaterial) {
          coreGlow.scale.set(2.4, 2.4, 1.0);
          coreGlow.material.opacity = 0;
          coreGlow.visible = true;
          gsap.to(coreGlow.material, {
            opacity: 0.22, // subtle soft backing halo to make the shiny steel pop!
            duration: 2.5,
            ease: 'sine.out',
          });
        }
      }
    }, [], 8.5);

    // 9.5-15s: Camera Approach to Logo with perfect dynamic padding framing (animating the dynamic progression ref)
    tl.to(cameraApproachProgressRef, {
      current: 1.0,
      duration: 5.5,
      ease: 'power2.inOut',
    }, 9.5);

    tl.to(camera, {
      fov: 75,
      duration: 4.5,
      ease: 'power2.inOut',
      onUpdate: () => camera.updateProjectionMatrix(),
    }, 10.5);

    // 16s: Complete Ready State Buffer
    tl.to({}, { duration: 1 }, 15);

    return () => {
      if (cinematicTimelineRef.current) {
        cinematicTimelineRef.current.kill();
      }
    };
  }, [phase, addTelemetryLog, playWarpWhoosh, playDiagnosticBlip, triggerScreenShake]);

  // Cleanup any lingering visual planes, overlays, and paused background videos immediately
  const cleanupCinematicVisuals = (scene: THREE.Scene) => {
    // 1. Force hide the screen-wide flash overlay
    if (flashOverlayRef.current) {
      flashOverlayRef.current.style.opacity = '0';
      flashOverlayRef.current.style.display = 'none';
    }

    // 2. Dispose/reset procedural textures if needed
    if (fractalTextureRef.current) {
      fractalTextureRef.current.needsUpdate = true;
    }

    // 3. Find and kill/hide all cinematic overlay planes and visual shockwave assets
    const namesToHide = [
      'fractal1',
      'fractal2',
      'fractal3',
      'sphere',
      'glow',
      'flare',
      'shockwave1',
      'shockwave2'
    ];

    namesToHide.forEach((name) => {
      const obj = scene.getObjectByName(name) as THREE.Mesh;
      if (obj) {
        gsap.killTweensOf(obj.scale);
        gsap.killTweensOf(obj);
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((mat) => {
            gsap.killTweensOf(mat);
            if ('opacity' in mat) {
              (mat as any).opacity = 0;
            }
          });
        }
        obj.visible = false;
      }
    });

    // 4. Reset scene background back to black / standard space dark
    scene.background = new THREE.Color(0x000103);
  };

  // Handle skip action immediately
  const handleSkipIntro = () => {
    if (cinematicTimelineRef.current) {
      cinematicTimelineRef.current.progress(1); // Jump right to 100% complete
      setSkipTimerVisible(false);
      if (sceneRef.current) {
        cleanupCinematicVisuals(sceneRef.current);
      }
      addTelemetryLog('SYSTEM OVERRIDE: CINEMATIC SKIPPED BY PILOT');
      playDiagnosticBlip(450, 0.2);
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full bg-black overflow-hidden z-0 select-none">
      <canvas ref={canvasRef} className="block w-full h-full" />
      
      {/* Blinding white flash overlay */}
      <div 
        ref={flashOverlayRef}
        className="absolute inset-0 bg-white pointer-events-none z-[100] opacity-0"
      />
      
      {/* Skip Button HUD Overlay */}
      {phase === 'INIT' && skipTimerVisible && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10 font-mono tracking-tight text-center pointer-events-auto">
          <p className="text-[10px] text-[#00f2ff]/60 uppercase tracking-widest animate-pulse">
            CALIBRATING VECTOR COCKPIT HUD... {cinematicRemaining}S
          </p>
          <button
            id="skip-intro-btn"
            onClick={handleSkipIntro}
            className="px-4 py-1.5 bg-black/80 border border-zinc-800 text-zinc-400 text-[10px] uppercase tracking-wider rounded-md hover:border-[#00f2ff]/60 hover:text-[#00f2ff] hover:shadow-[0_0_10px_rgba(0,242,255,0.2)] transition cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            SKIP_SEQUENCE
          </button>
        </div>
      )}

      {/* Ready state: Initialize Cockpit button appeared after cinematic intro finishes */}
      {phase === 'INIT' && !skipTimerVisible && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10 font-mono tracking-tight text-center pointer-events-auto">
          <p className="text-[10px] text-[#00f2ff] tracking-widest uppercase animate-pulse font-extrabold pb-1">
            COCKPIT_CALIBRATED_NOMINAL // READY_TO_RUN
          </p>
          <button
            id="initialize-cockpit-trigger-btn"
            onClick={() => {
              playWarpWhoosh();
              setPhase('BOOT');
            }}
            className="px-7 py-3.5 bg-black/90 border-2 border-[#00f2ff] text-[#00f2ff] text-xs font-black uppercase tracking-widest rounded-lg hover:bg-[#00f2ff] hover:text-black hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition duration-300 cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            INITIALIZE_COCKPIT_BOOT
          </button>
        </div>
      )}
    </div>
  );
};
