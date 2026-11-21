import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Move = { x: number; z: number };
type GameStatus = { message: string; x: number; z: number };

function makeMaterial(color: string, roughness = 1) {
  return new THREE.MeshStandardMaterial({ color, roughness });
}

function addBox(scene: THREE.Scene, x: number, y: number, z: number, w: number, h: number, d: number, color: string) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeMaterial(color));
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

function addTree(scene: THREE.Scene, x: number, z: number) {
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 1.5, 7), makeMaterial('#795238'));
  trunk.position.set(x, 0.75, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), makeMaterial('#43875a'));
  crown.position.set(x, 2.05, z);
  crown.scale.set(1, 1.15, 1);
  crown.castShadow = true;
  scene.add(crown);
  const highlight = new THREE.Mesh(new THREE.IcosahedronGeometry(0.58, 1), makeMaterial('#68a968'));
  highlight.position.set(x - 0.38, 2.38, z - 0.12);
  scene.add(highlight);
}

function buildWorld(scene: THREE.Scene) {
  scene.background = new THREE.Color('#a9d6dc');
  scene.fog = new THREE.Fog('#a9d6dc', 28, 75);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), makeMaterial('#8eb879'));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // A broad local road with sandy shoulders and a simple paved footpath.
  addBox(scene, 0, 0.015, -10, 80, 0.06, 7, '#555b59');
  addBox(scene, 0, 0.05, -10, 80, 0.025, 0.12, '#e9d9a8');
  addBox(scene, 0, 0.025, -5.4, 80, 0.05, 1.2, '#c9b995');
  addBox(scene, 0, 0.025, -14.6, 80, 0.05, 1.2, '#c9b995');
  for (let x = -34; x < 38; x += 8) addBox(scene, x, 0.055, -10, 3.2, 0.025, 0.12, '#f4e7bd');

  // Starter home: cream walls, terracotta roof, porch and front door.
  addBox(scene, 0, 0, 2.8, 9, 3.4, 7, '#e8d7b6');
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.7, 2.6, 4), makeMaterial('#a9573e'));
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 0.82;
  roof.position.set(0, 4.55, 2.8);
  roof.castShadow = true;
  scene.add(roof);
  addBox(scene, 0, 0, -1.05, 3.2, 0.18, 1.25, '#b78b62');
  addBox(scene, 0, 0.18, -1.45, 0.9, 1.8, 0.12, '#70472f');
  addBox(scene, -2.65, 1.35, -0.76, 1.25, 0.9, 0.12, '#8fc4d0');
  addBox(scene, 2.65, 1.35, -0.76, 1.25, 0.9, 0.12, '#8fc4d0');

  // Yard fence and entrance gap.
  for (let x = -8; x <= 8; x += 1.5) {
    if (Math.abs(x) < 1.4) continue;
    addBox(scene, x, 0, 7.1, 0.12, 0.9, 0.12, '#e6d5b4');
  }
  addBox(scene, -4.9, 0, 7.1, 6.2, 0.75, 0.12, '#d9c39b');
  addBox(scene, 4.9, 0, 7.1, 6.2, 0.75, 0.12, '#d9c39b');

  // Neighbouring homes establish the beginning of a larger street.
  addBox(scene, -13, 0, 1.8, 6.5, 2.8, 5.8, '#d6b28c');
  const roofLeft = new THREE.Mesh(new THREE.ConeGeometry(5, 1.8, 4), makeMaterial('#647b68'));
  roofLeft.rotation.y = Math.PI / 4; roofLeft.position.set(-13, 3.7, 1.8); scene.add(roofLeft);
  addBox(scene, 14, 0, 2.1, 7, 3, 6, '#d9c8a3');
  const roofRight = new THREE.Mesh(new THREE.ConeGeometry(5.4, 2, 4), makeMaterial('#8c5541'));
  roofRight.rotation.y = Math.PI / 4; roofRight.position.set(14, 3.9, 2.1); scene.add(roofRight);

  for (const [x, z] of [[-10, -3], [10, -3], [-18, -15], [18, -16], [-18, 9], [19, 9], [-7, 14], [8, 15]] as number[][]) {
    addTree(scene, x, z);
  }

  // A small roadside kiosk, the first future interaction point.
  addBox(scene, 7.2, 0, -6.5, 3.2, 2.5, 2.4, '#d5a36e');
  addBox(scene, 7.2, 2.5, -6.5, 3.8, 0.22, 3, '#4e7655');
  addBox(scene, 7.2, 1.2, -5.25, 2.1, 0.85, 0.12, '#6b9a85');
  return { kiosk: new THREE.Vector3(7.2, 0, -6.5) };
}

function App() {
  const hostRef = useRef<HTMLDivElement>(null);
  const moveRef = useRef<Move>({ x: 0, z: 0 });
  const [status, setStatus] = useState<GameStatus>({ message: 'Welcome to your new home in Ado-Ekiti.', x: 0, z: 12 });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    } catch {
      setStatus((s) => ({ ...s, message: 'This browser could not start WebGL. Try updating your browser or using a device with WebGL support.' }));
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.domElement.className = 'world-canvas';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, host.clientWidth / host.clientHeight, 0.1, 120);
    camera.position.set(0, 8, 20);

    const hemi = new THREE.HemisphereLight('#e8f7ff', '#64734e', 2.1);
    scene.add(hemi);
    const sun = new THREE.DirectionalLight('#fff0d3', 2.4);
    sun.position.set(-12, 22, 12);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 24; sun.shadow.camera.bottom = -24;
    scene.add(sun);

    const { kiosk } = buildWorld(scene);
    const player = new THREE.Group();
    const skin = makeMaterial('#8f573b');
    const shirt = makeMaterial('#287f70');
    const trousers = makeMaterial('#344b70');
    const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.75, 4, 8), shirt);
    body.position.y = 1.05; body.castShadow = true; player.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), skin);
    head.position.y = 1.9; head.castShadow = true; player.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), makeMaterial('#25201d'));
    hair.position.y = 2.04; player.add(hair);
    const legs = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.55, 0.32), trousers);
    legs.position.y = 0.34; player.add(legs);
    player.position.set(0, 0, 12);
    scene.add(player);

    const clock = new THREE.Clock();
    const target = new THREE.Vector3();
    let frame = 0;
    let lastUi = 0;
    let active = true;
    const keys = new Set<string>();
    const onKeyDown = (event: KeyboardEvent) => {
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(event.key.toLowerCase())) {
        event.preventDefault(); keys.add(event.key.toLowerCase());
      }
    };
    const onKeyUp = (event: KeyboardEvent) => keys.delete(event.key.toLowerCase());
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const resize = () => {
      if (!host) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const animate = () => {
      if (!active) return;
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.04);
      const inputX = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + moveRef.current.x;
      const inputZ = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0) + moveRef.current.z;
      const direction = new THREE.Vector3(inputX, 0, inputZ);
      if (direction.lengthSq() > 0.01) {
        direction.normalize();
        player.position.addScaledVector(direction, delta * 5.2);
        player.position.x = THREE.MathUtils.clamp(player.position.x, -35, 35);
        player.position.z = THREE.MathUtils.clamp(player.position.z, -24, 24);
        player.rotation.y = Math.atan2(direction.x, direction.z);
      }
      target.set(player.position.x, 1.2, player.position.z);
      const desiredCamera = new THREE.Vector3(player.position.x, player.position.y + 7, player.position.z + 10);
      camera.position.lerp(desiredCamera, 1 - Math.exp(-5 * delta));
      camera.lookAt(target);
      renderer.render(scene, camera);

      if (performance.now() - lastUi > 250) {
        lastUi = performance.now();
        setStatus((s) => ({ ...s, x: Math.round(player.position.x), z: Math.round(player.position.z) }));
      }
      if (player.position.distanceTo(kiosk) < 3) {
        // Interaction prompt is presented by the UI layer below.
      }
    };
    animate();

    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  const setDirection = (x: number, y: number) => {
    moveRef.current = { x, z: y };
  };

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark">E</span><div><strong>EKITI LIFESTYLE</strong><small>A LIFE IN ADO-EKITI</small></div></div>
        <div className="day-chip"><span className="live-dot" /> WORLD PREVIEW <b>DAY 01 · 08:00</b></div>
      </header>
      <section className="game-stage">
        <div className="world" ref={hostRef} aria-label="3D Ekiti Lifestyle world" />
        <div className="location-tag"><span>⌖</span><div><b>YOUR NEIGHBOURHOOD</b><small>Ado-Ekiti, Ekiti State</small></div></div>
        <div className="player-card"><div className="player-avatar">👤</div><div><b>Dami</b><small>New resident</small></div><span className="cash">₦12,000</span></div>
        <div className="world-tip">{status.message}</div>
        <div className="touch-controls" aria-label="Touch movement controls">
          <div className="joystick">
            <button className="joy up" onPointerDown={() => setDirection(0, -1)} onPointerUp={() => setDirection(0, 0)} onPointerLeave={() => setDirection(0, 0)} aria-label="Move forward">▲</button>
            <button className="joy left" onPointerDown={() => setDirection(-1, 0)} onPointerUp={() => setDirection(0, 0)} onPointerLeave={() => setDirection(0, 0)} aria-label="Move left">◀</button>
            <button className="joy down" onPointerDown={() => setDirection(0, 1)} onPointerUp={() => setDirection(0, 0)} onPointerLeave={() => setDirection(0, 0)} aria-label="Move backward">▼</button>
            <button className="joy right" onPointerDown={() => setDirection(1, 0)} onPointerUp={() => setDirection(0, 0)} onPointerLeave={() => setDirection(0, 0)} aria-label="Move right">▶</button>
          </div>
        </div>
        <div className="control-hint">WASD / ARROW KEYS <span>•</span> TOUCH PAD ON MOBILE</div>
        <div className="coordinate">X {status.x} · Z {status.z}</div>
      </section>
      <footer className="bottom-bar"><span><i /> 3D WORLD PROTOTYPE</span><span>BUILD YOUR LIFE. OWN YOUR FUTURE. EXPLORE YOUR CITY.</span><span>v0.2.0</span></footer>
    </main>
  );
}

export default App;