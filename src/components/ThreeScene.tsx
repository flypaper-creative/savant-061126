import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useAppState } from '../contexts/AppStateContext';

export const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const {
    phase,
    asteroidTheme,
    telemetry,
    opticMode,
    filterEffect,
    setLoadingProgress,
    addTelemetryLog,
    updateTelemetry,
    triggerScreenShake,
  } = useAppState();

  // Reference hooks to bypass hook dependencies inside requestAnimationFrame loops
  const stateRef = useRef({
    theme: asteroidTheme,
    optic: opticMode,
    filter: filterEffect,
    telemetry: telemetry,
  });

  useEffect(() => {
    stateRef.current.theme = asteroidTheme;
  }, [asteroidTheme]);

  useEffect(() => {
    stateRef.current.optic = opticMode;
  }, [opticMode]);

  useEffect(() => {
    stateRef.current.filter = filterEffect;
  }, [filterEffect]);

  useEffect(() => {
    stateRef.current.telemetry = telemetry;
  }, [telemetry]);

  // Keep mouse steering offsets
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseRef.current.targetX = x * 2.5; // steer factor
      mouseRef.current.targetY = -y * 1.8; // inverted flight vector
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || window.innerHeight;

    // --- SETUP SCENE, ACCURATE COCKPIT CAMERA & RENDER ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#020203');
    scene.fog = new THREE.FogExp2('#020203', 0.015);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 150);
    camera.position.set(0, 0, 8); // position behind the grid windshield

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35; // cinematic glow exposure
    mountRef.current.appendChild(renderer.domElement);

    // --- COCKPIT INTERSTELLAR LIGHTING ---
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.08);
    scene.add(ambientLight);

    // Dynamic brand tactical spotlight
    const spotLight = new THREE.SpotLight('#00f2ff', 24, 75, Math.PI / 3.5, 0.45, 1);
    spotLight.position.set(0, 10, 15);
    scene.add(spotLight);

    // Secondary warm fill backlight for high-fidelity contour profiling
    const backlight = new THREE.DirectionalLight('#ffffff', 2.5);
    backlight.position.set(-8, -5, -12);
    scene.add(backlight);

    // Red laser tracking target light
    const redTargetLight = new THREE.PointLight('#ff0033', 8, 30);
    redTargetLight.position.set(0, 0, 0);
    scene.add(redTargetLight);

    // --- GLB AUTHORITATIVE LOADER ---
    const loader = new GLTFLoader();
    let masterGeom: THREE.BufferGeometry | null = null;
    let loadedMesh: THREE.Mesh | null = null;

    setLoadingProgress(15);
    addTelemetryLog('LOAD_ENG: ACCESSING MASTER GEOMETRY ASSET public/assets/ast/ast.glb');

    // Create a pool of asteroid objects
    interface AsteroidNode {
      mesh: THREE.Mesh;
      baseSpeed: number;
      spinX: number;
      spinY: number;
      spinZ: number;
      wobbleOffset: number;
      sizeScalar: number;
      driftX: number;
      driftY: number;
      idName: string;
    }

    const asteroidsList: AsteroidNode[] = [];
    const asteroidsGroup = new THREE.Group();
    scene.add(asteroidsGroup);

    // High performance procedurally generated fallback geometry if GLTF fails or is slow to mount
    const createProceduralAlternative = () => {
      const geom = new THREE.DodecahedronGeometry(1.0, 3);
      // deform normal vectors slightly for jagged physical look
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);
        const noise = 0.95 + Math.sin(x * 4) * 0.12 * Math.cos(y * 4);
        pos.setXYZ(i, x * noise, y * noise, z * noise);
      }
      geom.computeVertexNormals();
      return geom;
    };

    // Load master asset ONCE
    loader.load(
      '/assets/ast/ast.glb',
      (gltf) => {
        addTelemetryLog('LOAD_ENG: AUTHORITATIVE GLB LOADED SUCCESSFULLY. PARSING ROOT MESH.');
        setLoadingProgress(60);

        // Extract master mesh geometry
        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && !masterGeom) {
            loadedMesh = child as THREE.Mesh;
            masterGeom = loadedMesh.geometry.clone();
            addTelemetryLog('LOAD_ENG: UNIQUE RETRIEVAL CONSTRUCTED. MASTER ASSET SYNC COMPLETE.');
          }
        });

        if (!masterGeom) {
          addTelemetryLog('LOAD_ENG: MESH EMPTY IN GLTF, DEFLECTING INSTANCE TO HIGH-POLY CORE');
          masterGeom = createProceduralAlternative();
        }

        initializeAsteroidField(masterGeom);
      },
      (xhr) => {
        if (xhr.total > 0) {
          const prog = Math.round((xhr.loaded / xhr.total) * 45) + 15;
          setLoadingProgress(prog);
        }
      },
      (error) => {
        console.warn('GLTFLoader error - deploying high-quality deterministic geometry fallback:', error);
        addTelemetryLog('LOAD_ENG: DETECTED STANDBY LATENT PATH. DEPLOYING DESIGNER SUBDIVISION GEOMETRY.');
        masterGeom = createProceduralAlternative();
        initializeAsteroidField(masterGeom);
      }
    );

    // Deploy pool of cloned asteroids from the authorized single source
    const initializeAsteroidField = (geometry: THREE.BufferGeometry) => {
      const poolCount = 135;

      const baseMaterial = new THREE.MeshStandardMaterial({
        roughness: 0.85,
        metalness: 0.1,
        flatShading: true,
      });

      addTelemetryLog(`INIT_ENG: GENERATING DEEP ASTEROID FIELD MATRIX [POOL_SIZE: ${poolCount}]`);

      for (let i = 0; i < poolCount; i++) {
        const mesh = new THREE.Mesh(geometry, baseMaterial.clone());
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Spread in a large space cone matching the cockpit perspective
        const xOffset = (Math.random() - 0.5) * 55;
        const yOffset = (Math.random() - 0.5) * 45;
        const zOffset = -(Math.random() * 140); // disperse deep into focus fold

        mesh.position.set(xOffset, yOffset, zOffset);

        // Deterministic size scaling
        const sizeScalar = 0.35 + Math.random() * 3.4;
        mesh.scale.set(sizeScalar, sizeScalar, sizeScalar);

        // Deterministic rotations and drift trajectory vectors
        const spinX = (Math.random() - 0.5) * 0.8;
        const spinY = (Math.random() - 0.5) * 0.8;
        const spinZ = (Math.random() - 0.5) * 0.8;
        const baseSpeed = 10 + Math.random() * 25; // individual velocity offset
        const wobbleOffset = Math.random() * Math.PI * 2;
        const driftX = (Math.random() - 0.5) * 0.15;
        const driftY = (Math.random() - 0.5) * 0.15;

        // Custom named tag identifiers for cockpit telemetry dashboard
        const names = ['BR-VO', 'XI-ON', 'OM-GA', 'KR-ON', 'TA-UR', 'NE-XO', 'ZE-SP', 'PH-X', 'AL-PH', 'SI-GM'];
        const idName = `${names[Math.floor(Math.random() * names.length)]}-${100 + Math.floor(Math.random() * 899)}`;

        asteroidsGroup.add(mesh);
        asteroidsList.push({
          mesh,
          baseSpeed,
          spinX,
          spinY,
          spinZ,
          wobbleOffset,
          sizeScalar,
          driftX,
          driftY,
          idName,
        });
      }

      setLoadingProgress(100);
      addTelemetryLog('SYSTEM_CORE: CINEMATIC ENGINE FULLY ENGAGED & SECURED');
    };

    // Deep field starlight mesh
    const starGeom = new THREE.BufferGeometry();
    const starCount = 380;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 140;
      starPositions[i+1] = (Math.random() - 0.5) * 120;
      starPositions[i+2] = -(Math.random() * 150);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.12,
      color: '#ffffff',
      transparent: true,
      opacity: 0.55,
    });
    const starSystem = new THREE.Points(starGeom, starMat);
    scene.add(starSystem);

    // --- PROCEDURAL STYLING THEME MAPS ---
    const applyThemeToAsteroidMaterial = (mat: THREE.MeshStandardMaterial) => {
      const activeTheme = stateRef.current.theme;
      mat.wireframe = false;
      mat.bumpScale = 0.08;

      switch (activeTheme) {
        case 'CHROME_BLOOD':
          mat.color.set('#222222');
          mat.emissive.set('#550005');
          mat.roughness = 0.04;
          mat.metalness = 1.0;
          break;
        case 'GOLD_GUNMETAL':
          mat.color.set('#eab308');
          mat.emissive.set('#160a00');
          mat.roughness = 0.28;
          mat.metalness = 0.95;
          break;
        case 'OBSIDIAN_MOTTLED':
          mat.color.set('#18181b');
          mat.emissive.set('#000000');
          mat.roughness = 0.92;
          mat.metalness = 0.0;
          break;
        case 'CARBON_VIOLET':
          mat.color.set('#a855f7');
          mat.emissive.set('#2a003f');
          mat.roughness = 0.38;
          mat.metalness = 0.85;
          break;
        case 'OPAL_STARDUST':
          mat.color.set('#22d3ee');
          mat.emissive.set('#082f49');
          mat.roughness = 0.15;
          mat.metalness = 0.75;
          break;
        case 'IRON_GREEN':
          mat.color.set('#10b981');
          mat.emissive.set('#022c22');
          mat.roughness = 0.5;
          mat.metalness = 0.9;
          break;
        case 'QUICKSILVER_COPPER':
          mat.color.set('#f97316');
          mat.emissive.set('#1c0a00');
          mat.roughness = 0.18;
          mat.metalness = 0.95;
          break;
        default:
          mat.color.set('#888888');
          mat.emissive.set('#000000');
          mat.roughness = 0.8;
          mat.metalness = 0.15;
      }
    };

    // --- ANIMATION / RENDER CYCLE ---
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      frameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1); // clamp delta
      const time = clock.getElapsedTime();

      // Steering camera physics
      const m = mouseRef.current;
      m.x += (m.targetX - m.x) * 0.06;
      m.y += (m.targetY - m.y) * 0.06;
      
      // smooth glide & bank camera rotation
      camera.position.x = m.x * 2.5;
      camera.position.y = m.y * 1.5;
      camera.rotation.z = -m.x * 0.08; // bank rotation
      camera.lookAt(0, 0, -50 + m.x * 10);

      // Core variables
      const activeTheme = stateRef.current.theme;
      const activeOptic = stateRef.current.optic;
      const speedSetting = stateRef.current.telemetry.velocity; // velocity slider value (200 - 1200)
      const flightFactor = Math.max(0.1, speedSetting / 1200);

      // Spotlight styling colors
      let spotlightColor = '#ffffff';
      if (activeTheme === 'CHROME_BLOOD') spotlightColor = '#f43f5e';
      else if (activeTheme === 'GOLD_GUNMETAL') spotlightColor = '#fbbf24';
      else if (activeTheme === 'OBSIDIAN_MOTTLED') spotlightColor = '#a1a1aa';
      else if (activeTheme === 'CARBON_VIOLET') spotlightColor = '#c084fc';
      else if (activeTheme === 'OPAL_STARDUST') spotlightColor = '#67e8f9';
      else if (activeTheme === 'IRON_GREEN') spotlightColor = '#34d399';
      else if (activeTheme === 'QUICKSILVER_COPPER') spotlightColor = '#ff8f3d';

      spotLight.color.set(spotlightColor);
      redTargetLight.color.set(spotlightColor);

      let closestDist = 999;
      let closestName = 'NONE';

      // Move asteroids and generate cinematic flow
      asteroidsList.forEach((ast) => {
        const mesh = ast.mesh;
        const mat = mesh.material as THREE.MeshStandardMaterial;

        // Position coordinates transformation
        // faster velocity = faster flow
        mesh.position.z += delta * ast.baseSpeed * 2.8 * flightFactor;
        mesh.position.x += ast.driftX * delta * 5 * flightFactor;
        mesh.position.y += ast.driftY * delta * 5 * flightFactor;

        // Individual spins
        mesh.rotation.x += ast.spinX * delta * 0.8;
        mesh.rotation.y += ast.spinY * delta * 0.8;
        mesh.rotation.z += ast.spinZ * delta * 0.3;

        // Reset elements passing behind cockpit view
        if (mesh.position.z > 14) {
          mesh.position.z = -120; // reset deep field
          mesh.position.x = (Math.random() - 0.5) * 52;
          mesh.position.y = (Math.random() - 0.5) * 44;
          ast.baseSpeed = 8 + Math.random() * 24;
        }

        // Apply visual theme styling
        applyThemeToAsteroidMaterial(mat);

        // Apply Optics Modes dynamically (No procedural clutter)
        if (activeOptic === 'ECHO_PULSE') {
          mat.wireframe = true;
          mat.emissive.set(spotlightColor);
          mat.emissiveIntensity = 1.0;
        } else if (activeOptic === 'BIO_THERM') {
          // Custom thermal depth coding: closer is yellow-red, far is blue-purple
          const normDepth = Math.max(0, Math.min(1, (mesh.position.z + 120) / 130)); // 0 (near) to 1 (far)
          const thermColor = new THREE.Color().lerpColors(
            new THREE.Color('#ffde00'), // near: burning hot
            new THREE.Color('#3b0066'), // far: icy vacuum
            1 - normDepth
          );
          mat.color.copy(thermColor);
          mat.emissive.copy(thermColor).multiplyScalar(0.28);
        } else if (activeOptic === 'VOID_DRIVE') {
          mat.color.set('#000000');
          mat.emissive.set(spotlightColor);
          mat.emissiveIntensity = 4.0; // intense neon contours
        }

        // Check distance to cockpit laser tracker origin (0, 0, 0)
        const dist = mesh.position.distanceTo(camera.position);

        // If very close, trigger dynamic warning shake and flash alerts!
        if (dist < 12.5 && mesh.position.z < camera.position.z) {
          const ratio = (13 - dist) / 6; // intensity
          if (ratio > 0.1) {
            triggerScreenShake(ratio * 0.15); // gentle camera rattle when brushing past asteroids
          }
        }

        if (mesh.position.z < camera.position.z && dist < closestDist) {
          closestDist = dist;
          closestName = ast.idName;
        }
      });

      // Update HUD telemetry values in context securely
      if (asteroidsList.length > 0 && Math.random() < 0.12) {
        updateTelemetry({
          nearestAsteroidDist: Math.floor(closestDist * 10), // map dist to visual meters
          nearestAsteroidName: closestName,
        });
      }

      // Animate hyper-speed stars passing
      const positions = starGeom.attributes.position.array as Float32Array;
      for (let i = 0; i < starCount * 3; i += 3) {
        positions[i+2] += delta * 45 * flightFactor; // stars flow backwards
        if (positions[i+2] > 10) {
          positions[i+2] = -120;
          positions[i] = (Math.random() - 0.5) * 140;
          positions[i+1] = (Math.random() - 0.5) * 120;
        }
      }
      starGeom.attributes.position.needsUpdate = true;

      // Animate laser search dot on closest asteroid
      if (closestName !== 'NONE') {
        const closestAst = asteroidsList.find(a => a.idName === closestName);
        if (closestAst) {
          redTargetLight.position.copy(closestAst.mesh.position).add(new THREE.Vector3(0, 0, 2.5));
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // --- WINDOW SIZE UPDATE ---
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // --- RETIRE MEMORY DISPENSATION ---
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);

      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {}
      }

      // Dispose children nodes
      asteroidsList.forEach((ast) => {
        asteroidsGroup.remove(ast.mesh);
        ast.mesh.geometry.dispose();
        if (Array.isArray(ast.mesh.material)) {
          ast.mesh.material.forEach((m) => m.dispose());
        } else {
          ast.mesh.material.dispose();
        }
      });

      scene.remove(asteroidsGroup);
      scene.remove(starSystem);
      starGeom.dispose();
      starMat.dispose();
      ambientLight.dispose();
      spotLight.dispose();
      backlight.dispose();
      redTargetLight.dispose();
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      className="absolute inset-0 w-full h-full -z-10 bg-black pointer-events-none" 
      id="threejs-flight-viewport" 
    />
  );
};
