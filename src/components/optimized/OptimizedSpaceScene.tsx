import React, { memo, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type ThemeId =
  | 'CHROME_BLOOD'
  | 'GOLD_GUNMETAL'
  | 'OBSIDIAN_MOTTLED'
  | 'CARBON_VIOLET'
  | 'OPAL_STARDUST'
  | 'IRON_GREEN'
  | 'QUICKSILVER_COPPER';

type Rock = {
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  sx: number; sy: number; sz: number;
  spinX: number; spinY: number; spinZ: number;
  scale: number;
  health: number;
  hitFlash: number;
};

type ThemeSpec = {
  tint: number;
  accent: number;
  fog: number;
  roughness: number;
  metalness: number;
  exposure: number;
};

const THEME: Record<string, ThemeSpec> = {
  CHROME_BLOOD: { tint: 0x9a8f88, accent: 0xef4444, fog: 0x040203, roughness: .70, metalness: .24, exposure: 1.05 },
  GOLD_GUNMETAL: { tint: 0xb48a4d, accent: 0xf59e0b, fog: 0x050402, roughness: .78, metalness: .18, exposure: 1.08 },
  OBSIDIAN_MOTTLED: { tint: 0x20232b, accent: 0x00f2ff, fog: 0x010306, roughness: .92, metalness: .07, exposure: 1.12 },
  CARBON_VIOLET: { tint: 0x342a3d, accent: 0xd946ef, fog: 0x030105, roughness: .95, metalness: .05, exposure: 1.08 },
  OPAL_STARDUST: { tint: 0x9fb5c5, accent: 0xfb923c, fog: 0x050403, roughness: .80, metalness: .06, exposure: 1.14 },
  IRON_GREEN: { tint: 0x59655e, accent: 0x10b981, fog: 0x010504, roughness: .76, metalness: .18, exposure: 1.06 },
  QUICKSILVER_COPPER: { tint: 0x8d8780, accent: 0xf97316, fog: 0x050302, roughness: .66, metalness: .25, exposure: 1.07 },
  DEFAULT: { tint: 0x20232b, accent: 0x00f2ff, fog: 0x020305, roughness: .90, metalness: .08, exposure: 1.1 }
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const getTheme = (id?: string) => THEME[id || ''] || THEME.DEFAULT;

const extractFirstMesh = (root: THREE.Object3D): THREE.Mesh => {
  let found: THREE.Mesh | null = null;
  root.traverse((obj) => {
    if (!found && (obj as THREE.Mesh).isMesh) found = obj as THREE.Mesh;
  });
  if (!found) throw new Error('No mesh found in /assets/ast/ast.glb');
  return found;
};

const normalizeGeometry = (geometry: THREE.BufferGeometry) => {
  const g = geometry.clone();
  g.computeVertexNormals();
  g.computeBoundingBox();
  g.computeBoundingSphere();
  g.center();
  const r = g.boundingSphere?.radius || 1;
  const s = r > 0 ? 1 / r : 1;
  g.scale(s, s, s);
  g.computeBoundingSphere();
  return g;
};

const makeStarLayer = (
  scene: THREE.Scene,
  count: number,
  zMin: number,
  zMax: number,
  size: number,
  opacity: number,
  accent: number,
  drift: number
) => {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const base = new THREE.Color(0xdceeff);
  const warm = new THREE.Color(0xffd6a3);
  const accentColor = new THREE.Color(accent);

  for (let i = 0; i < count; i++) {
    pos[i * 3] = rand(-5200, 5200);
    pos[i * 3 + 1] = rand(-2600, 2600);
    pos[i * 3 + 2] = rand(zMin, zMax);

    const c = Math.random() < 0.07 ? accentColor : Math.random() < 0.18 ? warm : base;
    const pulse = rand(0.55, 1);
    col[i * 3] = c.r * pulse;
    col[i * 3 + 1] = c.g * pulse;
    col[i * 3 + 2] = c.b * pulse;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size,
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  return { points, geo, mat, drift, baseX: rand(-400, 400), baseY: rand(-180, 180) };
};

export const OptimizedSpaceScene: React.FC = memo(() => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let raf = 0;

    const coarse = window.matchMedia?.('(pointer: coarse)').matches;
    const lowMemory = (navigator as any).deviceMemory && (navigator as any).deviceMemory <= 4;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const startTheme = (localStorage.getItem('savant_asteroid_theme') || 'OBSIDIAN_MOTTLED') as ThemeId;
    let theme = getTheme(startTheme);

    const flight = { speed: 1, strafe: 0, lift: 0, yaw: 0 };
    const spotlightConfig = { enabled: true, intensity: 7.5, distance: 1050, angle: 18 };
    const weaponState = { flash: 0, weapon: 'PULSE' };

    const renderer = new THREE.WebGLRenderer({
      antialias: !coarse,
      alpha: false,
      powerPreference: 'high-performance'
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse || lowMemory ? 1.1 : 1.55));
    renderer.setSize(mount.clientWidth || window.innerWidth, mount.clientHeight || window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = theme.exposure;
    renderer.shadowMap.enabled = !(coarse || lowMemory);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(theme.fog);
    scene.fog = new THREE.FogExp2(theme.fog, 0.00066);

    const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 10000);
    camera.position.set(0, 72, 720);

    const ambient = new THREE.AmbientLight(0x425061, 0.18);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff1cd, 5.15);
    sun.position.set(-1450, 960, 680);
    sun.target.position.set(180, -70, -320);
    sun.castShadow = !(coarse || lowMemory);
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 3200;
    sun.shadow.camera.left = -1100;
    sun.shadow.camera.right = 1100;
    sun.shadow.camera.top = 1100;
    sun.shadow.camera.bottom = -1100;
    scene.add(sun, sun.target);

    const coldRim = new THREE.DirectionalLight(theme.accent, 2.2);
    coldRim.position.set(980, 300, -820);
    scene.add(coldRim);

    const warmBounce = new THREE.PointLight(0xff884a, 0.58, 1900);
    warmBounce.position.set(420, -360, -560);
    scene.add(warmBounce);

    const shipSpot = new THREE.SpotLight(0xe8fbff, spotlightConfig.intensity, spotlightConfig.distance, THREE.MathUtils.degToRad(spotlightConfig.angle), 0.55, 1.15);
    shipSpot.position.set(0, 26, 260);
    shipSpot.target.position.set(0, -26, -620);
    scene.add(shipSpot, shipSpot.target);

    const weaponLight = new THREE.PointLight(0x9ffbff, 0, 700);
    weaponLight.position.set(0, 20, 130);
    scene.add(weaponLight);

    const starLayers = [
      makeStarLayer(scene, coarse || lowMemory ? 1600 : 4600, -7600, -5200, 0.72, 0.58, theme.accent, 3),
      makeStarLayer(scene, coarse || lowMemory ? 1300 : 3600, -5200, -3100, 0.92, 0.52, theme.accent, 9),
      makeStarLayer(scene, coarse || lowMemory ? 900 : 2600, -3100, -1500, 1.18, 0.38, theme.accent, 24),
      makeStarLayer(scene, coarse || lowMemory ? 600 : 1800, -1500, -650, 0.66, 0.22, theme.accent, 58)
    ];

    const makeNebula = (color: number, opacity: number, x: number, y: number, z: number, rotY: number, w = 4200, h = 1280) => {
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
      mesh.position.set(x, y, z);
      mesh.rotation.set(0.18, rotY, 0.12);
      scene.add(mesh);
      return { mesh, mat };
    };

    const nebulaA = makeNebula(theme.accent, 0.024, -1120, 360, -2600, -0.46);
    const nebulaB = makeNebula(0xffb65c, 0.016, 1260, -420, -3300, 0.36, 3800, 1000);

    const beamMat = new THREE.LineBasicMaterial({ color: 0xa7f3ff, transparent: true, opacity: 0 });
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 10, 180),
      new THREE.Vector3(0, -20, -940)
    ]);
    const beam = new THREE.Line(beamGeo, beamMat);
    scene.add(beam);

    const loader = new GLTFLoader();
    const disposables: Array<THREE.BufferGeometry | THREE.Material> = [];
    let instanced: THREE.InstancedMesh | null = null;
    let asteroidMaterial: THREE.Material | null = null;
    let baseMaterialColor = new THREE.Color(0xffffff);
    let rocks: Rock[] = [];

    const applyThemeLive = (nextThemeId: string) => {
      theme = getTheme(nextThemeId);
      localStorage.setItem('savant_asteroid_theme', nextThemeId);

      scene.background = new THREE.Color(theme.fog);
      scene.fog = new THREE.FogExp2(theme.fog, 0.00066);
      renderer.toneMappingExposure = theme.exposure;
      coldRim.color.setHex(theme.accent);
      nebulaA.mat.color.setHex(theme.accent);

      if (asteroidMaterial instanceof THREE.MeshStandardMaterial) {
        asteroidMaterial.color.copy(baseMaterialColor).multiply(new THREE.Color(theme.tint));
        asteroidMaterial.roughness = Math.max(asteroidMaterial.roughness ?? theme.roughness, theme.roughness);
        asteroidMaterial.metalness = Math.min(asteroidMaterial.metalness ?? theme.metalness, theme.metalness);
        asteroidMaterial.envMapIntensity = 1.25;
        asteroidMaterial.needsUpdate = true;
      }
    };

    const respawnRock = (rock: Rock) => {
      rock.x = -1500 - Math.random() * 440;
      rock.y = -540 + Math.random() * 260;
      rock.z = -1600 + Math.random() * 2100;
      rock.vx = rand(0.28, 1.85);
      rock.vy = rand(0.04, 0.34);
      rock.health = 1;
      rock.hitFlash = 0;
    };

    const hitNearestRock = (weapon: string) => {
      if (!rocks.length) return;

      let best = -1;
      let bestScore = Infinity;

      for (let i = 0; i < rocks.length; i++) {
        const r = rocks[i];
        const dx = Math.abs(r.x);
        const dy = Math.abs(r.y);
        const zScore = Math.abs(r.z + 320) * 0.18;
        const score = dx + dy * 1.25 + zScore;
        if (score < bestScore) {
          bestScore = score;
          best = i;
        }
      }

      if (best >= 0) {
        const rock = rocks[best];
        rock.hitFlash = 1;
        rock.health -= weapon === 'RAIL' ? 1.2 : weapon === 'LANCE' ? 0.8 : weapon === 'FLAK' ? 0.7 : 0.55;
        if (rock.health <= 0) respawnRock(rock);
      }

      weaponState.flash = weapon === 'LANCE' ? 0.42 : 0.26;
      weaponState.weapon = weapon;
    };

    const onTheme = (e: Event) => {
      const custom = e as CustomEvent<{ theme?: ThemeId }>;
      if (custom.detail?.theme) applyThemeLive(custom.detail.theme);
    };

    const onSpot = (e: Event) => {
      const custom = e as CustomEvent<Partial<typeof spotlightConfig>>;
      Object.assign(spotlightConfig, custom.detail || {});
    };

    const onFlight = (e: Event) => {
      const custom = e as CustomEvent<Partial<typeof flight>>;
      Object.assign(flight, custom.detail || {});
    };

    const onFire = (e: Event) => {
      const custom = e as CustomEvent<{ weapon?: string }>;
      hitNearestRock(custom.detail?.weapon || 'PULSE');
    };

    window.addEventListener('savant-asteroid-theme', onTheme);
    window.addEventListener('savant-spotlight-config', onSpot);
    window.addEventListener('savant-flight-command', onFlight);
    window.addEventListener('savant-weapon-fire', onFire);

    loader.load(
      '/assets/ast/ast.glb',
      (gltf) => {
        if (disposed) return;

        const source = extractFirstMesh(gltf.scene);
        const geometry = normalizeGeometry(source.geometry);
        disposables.push(geometry);

        const sourceMaterial = Array.isArray(source.material) ? source.material[0] : source.material;
        asteroidMaterial = sourceMaterial.clone();
        if (asteroidMaterial instanceof THREE.MeshStandardMaterial) {
          baseMaterialColor = asteroidMaterial.color.clone();
          asteroidMaterial.roughness = Math.max(asteroidMaterial.roughness ?? theme.roughness, theme.roughness);
          asteroidMaterial.metalness = Math.min(asteroidMaterial.metalness ?? theme.metalness, theme.metalness);
          asteroidMaterial.envMapIntensity = 1.25;
        }
        asteroidMaterial.needsUpdate = true;
        disposables.push(asteroidMaterial);

        const count = coarse || lowMemory ? 230 : 700;
        instanced = new THREE.InstancedMesh(geometry, asteroidMaterial, count);
        instanced.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        instanced.frustumCulled = false;
        instanced.castShadow = !(coarse || lowMemory);
        instanced.receiveShadow = true;
        scene.add(instanced);

        const dummy = new THREE.Object3D();
        rocks = Array.from({ length: count }, () => ({
          x: rand(-1500, 1500),
          y: rand(-540, 470),
          z: rand(-1600, 520),
          vx: rand(0.28, 1.85),
          vy: rand(0.04, 0.34),
          vz: rand(-0.04, 0.04),
          rx: rand(0, Math.PI),
          ry: rand(0, Math.PI),
          rz: rand(0, Math.PI),
          sx: rand(0.78, 1.38),
          sy: rand(0.72, 1.24),
          sz: rand(0.78, 1.46),
          spinX: rand(-0.006, 0.006),
          spinY: rand(-0.008, 0.008),
          spinZ: rand(-0.006, 0.006),
          scale: rand(8, 31) * (Math.random() > 0.95 ? 1.85 : 1),
          health: 1,
          hitFlash: 0
        }));

        applyThemeLive(startTheme);

        let last = performance.now();

        const animate = (now: number) => {
          raf = requestAnimationFrame(animate);

          const dt = Math.min(0.033, (now - last) / 1000);
          last = now;

          const t = now * 0.001;
          const motion = reducedMotion ? 0.25 : 1;
          const speed = Math.max(0.08, flight.speed);

          starLayers.forEach((layer, index) => {
            const parallax = 0.005 + index * 0.015;
            layer.points.position.x = layer.baseX + ((camera.position.x * parallax) - t * layer.drift * speed * motion) % (1600 + index * 520);
            layer.points.position.y = layer.baseY + camera.position.y * (0.003 + index * 0.008);
            layer.points.rotation.z = Math.sin(t * 0.015 + index) * 0.004;
          });

          nebulaA.mesh.position.x = -1120 + Math.sin(t * 0.030) * 38 - t * 4 * motion;
          nebulaB.mesh.position.x = 1260 + Math.cos(t * 0.026) * 28 - t * 2 * motion;

          shipSpot.visible = spotlightConfig.enabled;
          shipSpot.intensity = spotlightConfig.intensity;
          shipSpot.distance = spotlightConfig.distance;
          shipSpot.angle = THREE.MathUtils.degToRad(spotlightConfig.angle);
          shipSpot.position.set(flight.strafe * 55, 26 + flight.lift * 34, 260);
          shipSpot.target.position.set(flight.strafe * 110 + flight.yaw * 120, -28 + flight.lift * 80, -720);

          weaponState.flash = Math.max(0, weaponState.flash - dt * 1.9);
          beamMat.opacity = weaponState.flash;
          weaponLight.intensity = weaponState.flash * 8.5;
          beam.visible = weaponState.flash > 0.02;

          for (let i = 0; i < rocks.length; i++) {
            const r = rocks[i];

            r.x += (r.vx * speed + Math.max(0, flight.strafe) * 0.12) * 60 * dt * motion;
            r.y += (r.vy + flight.lift * 0.025) * 60 * dt * motion;
            r.z += (r.vz - (speed - 1) * 0.08) * 60 * dt * motion;

            r.rx += r.spinX * 60 * dt * motion;
            r.ry += r.spinY * 60 * dt * motion;
            r.rz += r.spinZ * 60 * dt * motion;

            r.hitFlash = Math.max(0, r.hitFlash - dt * 2.8);

            if (r.x > 1600 || r.y > 620 || r.z < -1750 || r.z > 700) respawnRock(r);

            const flashScale = 1 + r.hitFlash * 0.22;

            dummy.position.set(r.x, r.y, r.z);
            dummy.rotation.set(r.rx, r.ry, r.rz);
            dummy.scale.set(r.scale * r.sx * flashScale, r.scale * r.sy * flashScale, r.scale * r.sz * flashScale);
            dummy.updateMatrix();
            instanced!.setMatrixAt(i, dummy.matrix);
          }

          instanced!.instanceMatrix.needsUpdate = true;

          camera.position.x = Math.sin(t * 0.075) * 38 + flight.strafe * 48;
          camera.position.y = 72 + Math.sin(t * 0.061) * 12 + flight.lift * 34;
          camera.position.z = 720 - (speed - 1) * 54;
          camera.lookAt(90 + flight.yaw * 120, -24 + flight.lift * 34, -280);

          renderer.render(scene, camera);
        };

        raf = requestAnimationFrame(animate);
      },
      undefined,
      (error) => console.error('[SAVANT] failed to load asteroid GLB', error)
    );

    const resize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('savant-asteroid-theme', onTheme);
      window.removeEventListener('savant-spotlight-config', onSpot);
      window.removeEventListener('savant-flight-command', onFlight);
      window.removeEventListener('savant-weapon-fire', onFire);
      mount.replaceChildren();

      starLayers.forEach((s) => {
        s.geo.dispose();
        s.mat.dispose();
      });

      nebulaA.mesh.geometry.dispose();
      nebulaB.mesh.geometry.dispose();
      nebulaA.mat.dispose();
      nebulaB.mat.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="sv-optimized-space-scene" aria-hidden="true" />;
});

OptimizedSpaceScene.displayName = 'OptimizedSpaceScene';
