import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Move = { x: number; z: number };
type GameStatus = { message: string; x: number; z: number; nearKiosk: boolean; nearHome: boolean; nearJob: boolean };
type Needs = { hunger: number; thirst: number; energy: number; hygiene: number };

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
  scene.fog = new THREE.Fog('#a9d6dc', 34, 92);
  const colliders: Array<{ x: number; z: number; halfX: number; halfZ: number }> = [];
  const block = (x: number, z: number, w: number, d: number) => colliders.push({ x, z, halfX: w / 2, halfZ: d / 2 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), makeMaterial('#8eb879'));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

  // Main neighbourhood road and a cross street create a connected, walkable street grid.
  addBox(scene, 0, 0.015, -10, 92, 0.06, 7, '#555b59');
  addBox(scene, 0, 0.05, -10, 92, 0.025, 0.12, '#e9d9a8');
  addBox(scene, 0, 0.025, -5.4, 92, 0.05, 1.2, '#c9b995');
  addBox(scene, 0, 0.025, -14.6, 92, 0.05, 1.2, '#c9b995');
  for (let x = -42; x < 48; x += 8) addBox(scene, x, 0.055, -10, 3.2, 0.025, 0.12, '#f4e7bd');
  addBox(scene, -25, 0.015, -29, 6, 0.06, 38, '#555b59');
  addBox(scene, -25, 0.05, -29, 0.12, 0.025, 38, '#e9d9a8');
  addBox(scene, -20.4, 0.025, -29, 1.2, 0.05, 38, '#c9b995');
  addBox(scene, -29.6, 0.025, -29, 1.2, 0.05, 38, '#c9b995');

  // Starter home, porch and yard.
  addBox(scene, 0, 0, 2.8, 9, 3.4, 7, '#e8d7b6'); block(0, 2.8, 9.5, 7.5);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6.7, 2.6, 4), makeMaterial('#a9573e'));
  roof.rotation.y = Math.PI / 4; roof.scale.z = 0.82; roof.position.set(0, 4.55, 2.8); roof.castShadow = true; scene.add(roof);
  addBox(scene, 0, 0, -1.05, 3.2, 0.18, 1.25, '#b78b62');
  addBox(scene, 0, 0.18, -1.45, 0.9, 1.8, 0.12, '#70472f');
  addBox(scene, -2.65, 1.35, -0.76, 1.25, 0.9, 0.12, '#8fc4d0');
  addBox(scene, 2.65, 1.35, -0.76, 1.25, 0.9, 0.12, '#8fc4d0');

  // Low compound wall with a wide, deliberate entrance.
  addBox(scene, -4.9, 0, 7.1, 6.2, 0.75, 0.12, '#d9c39b');
  addBox(scene, 4.9, 0, 7.1, 6.2, 0.75, 0.12, '#d9c39b');
  for (let x = -8; x <= 8; x += 1.5) {
    if (Math.abs(x) < 1.4) continue;
    addBox(scene, x, 0, 7.1, 0.12, 0.9, 0.12, '#e6d5b4');
    block(x, 7.1, 0.35, 0.35);
  }
  block(-4.9, 7.1, 6.2, 0.3); block(4.9, 7.1, 6.2, 0.3);

  // Distinct homes along the side streets.
  const home = (x: number, z: number, w: number, d: number, wall: string, roofColor: string) => {
    addBox(scene, x, 0, z, w, 2.8, d, wall); block(x, z, w + 0.7, d + 0.7);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.66, 1.8, 4), makeMaterial(roofColor));
    cap.rotation.y = Math.PI / 4; cap.position.set(x, 3.7, z); cap.castShadow = true; scene.add(cap);
    addBox(scene, x - w * 0.22, 1.2, z - d / 2 - 0.07, 1.05, 0.85, 0.12, '#8fc4d0');
    addBox(scene, x + w * 0.22, 1.2, z - d / 2 - 0.07, 1.05, 0.85, 0.12, '#8fc4d0');
  };
  home(-14, 1.8, 6.5, 5.8, '#d6b28c', '#647b68');
  home(14, 2.1, 7, 6, '#d9c8a3', '#8c5541');
  home(-35, -23, 7, 6, '#e2c49b', '#9b6047');
  home(-14, -27, 7.5, 6, '#cdbb9a', '#6e8061');
  home(13, -26, 7, 6, '#dfc6a5', '#a45f43');
  home(35, -24, 7, 6, '#d4b18d', '#667b69');

  // Roadside kiosks and small shopfronts.
  const shop = (x: number, z: number, wall: string, sign: string) => {
    addBox(scene, x, 0, z, 3.5, 2.5, 2.8, wall); block(x, z, 4.1, 3.4);
    addBox(scene, x, 2.5, z, 4.1, 0.22, 3.3, '#4e7655');
    addBox(scene, x, 1.55, z - 1.45, 2.5, 0.42, 0.12, sign);
    addBox(scene, x, 0.9, z - 1.48, 2.2, 0.75, 0.1, '#6b9a85');
  };
  shop(7.2, -6.5, '#d5a36e', '#f0d18e');
  shop(-7.5, -6.5, '#c98f65', '#e7c37e');
  shop(7, -18, '#d8bd91', '#e7c37e');

  // Trees are kept out of the street corridor and have simple no-walk zones.
  const treeSpots = [[-18,-3],[18,-3],[-40,-13],[-35,-8],[-13,-17],[14,-17],[39,-14],[-40,-34],[-13,-37],[13,-36],[39,-34],[-18,12],[19,12],[-8,17],[9,17]] as number[][];
  for (const [x, z] of treeSpots) { addTree(scene, x, z); block(x, z, 1.8, 1.8); }

  // Streetlights and simple roadside planting add scale without heavy assets.
  for (const [x,z] of [[-18,-10],[18,-10],[-25,-18],[-25,-37]] as number[][]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.1,4,6), makeMaterial('#46534a'));
    pole.position.set(x,2,z); scene.add(pole);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.12,0.28), makeMaterial('#e8d8a5'));
    lamp.position.set(x,4,z); scene.add(lamp); block(x,z,0.7,0.7);
  }
  return { kiosk: new THREE.Vector3(7.2, 0, -6.5), colliders };
}
function App() {
  const hostRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef<HTMLDivElement>(null);
  const cameraDragRef = useRef({ pointerId: -1, x: 0, y: 0 });
  const cameraLookRef = useRef({ yaw: 0, pitch: 0.62 });
  const moveRef = useRef<Move>({ x: 0, z: 0 });
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState<GameStatus>({ message: 'Welcome to your new home in Ado-Ekiti.', x: 0, z: 12, nearKiosk: false, nearHome: false, nearJob: false });
  const [shopOpen, setShopOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [jobOpen, setJobOpen] = useState(false);
  const [jobWorking, setJobWorking] = useState(false);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [needs, setNeeds] = useState<Needs>({ hunger: 82, thirst: 78, energy: 90, hygiene: 88 });
  const needsRef = useRef(needs);
  useEffect(() => { needsRef.current = needs; }, [needs]);
  const [wallet, setWallet] = useState(12000);
  const jobPay = 2500;
  useEffect(() => {
    if (!jobWorking) return;
    const timer = window.setInterval(() => setWorkSeconds((seconds) => {
      if (seconds <= 1) {
        window.clearInterval(timer);
        setJobWorking(false);
        setWallet((cash) => cash + jobPay);
        setNeeds((n) => ({ ...n, energy: Math.max(0, n.energy - 14), hunger: Math.max(0, n.hunger - 8), thirst: Math.max(0, n.thirst - 10), hygiene: Math.max(0, n.hygiene - 4) }));
        setStatus((s) => ({ ...s, message: `Shift complete! You earned ₦${jobPay.toLocaleString('en-NG')}.` }));
        return 0;
      }
      return seconds - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [jobWorking]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const shopItems = [{ id: 'water', name: 'Cold sachet water', detail: 'A quick refreshment', price: 100, emoji: '💧' }, { id: 'snack', name: 'Local snacks', detail: 'A small street-side bite', price: 350, emoji: '🥟' }, { id: 'softdrink', name: 'Soft drink', detail: 'Chilled bottle', price: 500, emoji: '🥤' }, { id: 'fruit', name: 'Fresh fruit', detail: 'Seasonal fruit portion', price: 250, emoji: '🍊' }];
  const performHomeAction = (action: 'sleep' | 'shower' | 'cook') => {
    if (action === 'sleep') {
      setNeeds((n) => ({ ...n, energy: 100, hunger: Math.max(0, n.hunger - 12), thirst: Math.max(0, n.thirst - 12) }));
      setStatus((s) => ({ ...s, message: 'You had a good rest. Energy restored!' }));
    } else if (action === 'shower') {
      setNeeds((n) => ({ ...n, hygiene: 100, energy: Math.max(0, n.energy - 4) }));
      setStatus((s) => ({ ...s, message: 'Fresh and clean. Hygiene restored!' }));
    } else {
      const ingredient = (inventory.snack || 0) > 0 ? 'snack' : (inventory.fruit || 0) > 0 ? 'fruit' : '';
      if (!ingredient) {
        setStatus((s) => ({ ...s, message: 'You need local snacks or fresh fruit from the kiosk to cook.' }));
        return;
      }
      setInventory((items) => ({ ...items, [ingredient]: Math.max(0, (items[ingredient] || 0) - 1) }));
      setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + 48), energy: Math.max(0, n.energy - 3) }));
      setStatus((s) => ({ ...s, message: 'Meal ready! Your hunger has eased.' }));
    }
  };

  const consumeItem = (id: 'water' | 'softdrink' | 'snack' | 'fruit') => {
    if ((inventory[id] || 0) < 1) return;
    setInventory((items) => ({ ...items, [id]: Math.max(0, (items[id] || 0) - 1) }));
    if (id === 'water') {
      setNeeds((n) => ({ ...n, thirst: Math.min(100, n.thirst + 42) }));
      setStatus((s) => ({ ...s, message: 'You drank some water. Thirst refreshed!' }));
    } else if (id === 'softdrink') {
      setNeeds((n) => ({ ...n, thirst: Math.min(100, n.thirst + 30), hunger: Math.min(100, n.hunger + 5) }));
      setStatus((s) => ({ ...s, message: 'You enjoyed a cold drink. Thirst eased!' }));
    } else {
      const isFruit = id === 'fruit';
      setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + (isFruit ? 24 : 30)), thirst: Math.min(100, n.thirst + (isFruit ? 8 : 0)) }));
      setStatus((s) => ({ ...s, message: isFruit ? 'Fresh fruit eaten. Hunger eased!' : 'You enjoyed a local snack. Hunger eased!' }));
    }
  };

  const buyItem = (item: typeof shopItems[number]) => {
    if (wallet < item.price) return;
    setWallet((cash) => cash - item.price);
    setInventory((items) => ({ ...items, [item.id]: (items[item.id] || 0) + 1 }));
    setStatus((s) => ({ ...s, message: `${item.name} added to your bag.` }));
  };

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

    const { kiosk, colliders } = buildWorld(scene);
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

    // Lightweight neighbourhood residents: simple original low-poly walkers.
    const pedestrians = [0, 1, 2, 3].map((index) => {
      const resident = new THREE.Group();
      const palette = ['#bd754d', '#d6b16f', '#6b8e75', '#9b789c'];
      const shirt = new THREE.Mesh(new THREE.CapsuleGeometry(0.3, 0.55, 3, 7), makeMaterial(palette[index]));
      shirt.position.y = 1.02;
      shirt.castShadow = true;
      resident.add(shirt);
      const face = new THREE.Mesh(new THREE.SphereGeometry(0.25, 9, 8), makeMaterial('#8f573b'));
      face.position.y = 1.78;
      face.castShadow = true;
      resident.add(face);
      const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.255, 8, 7, 0, Math.PI * 2, 0, Math.PI * 0.55), makeMaterial('#28211d'));
      hairCap.position.y = 1.88;
      resident.add(hairCap);
      const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.52, 0.19), makeMaterial('#39485e'));
      leftLeg.position.set(-0.13, 0.34, 0);
      const rightLeg = leftLeg.clone();
      rightLeg.position.x = 0.13;
      resident.add(leftLeg, rightLeg);
      resident.position.set(-38 + index * 19, 0, index % 2 === 0 ? -8.2 : -11.8);
      resident.userData = { phase: index * 0.23, speed: 0.035 + index * 0.004, leftLeg, rightLeg };
      scene.add(resident);
      return resident;
    });

    const clock = new THREE.Clock();
    const target = new THREE.Vector3();
    const cameraRay = new THREE.Raycaster();
    const cameraDirection = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    let frame = 0;
    let lastUi = 0;
    let lastNeedsTick = 0;
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
      const elapsed = clock.elapsedTime;
      pedestrians.forEach((resident) => {
        const { phase, speed, leftLeg, rightLeg } = resident.userData as {
          phase: number; speed: number; leftLeg: THREE.Mesh; rightLeg: THREE.Mesh;
        };
        const progress = ((elapsed * speed + phase) % 2);
        const travel = progress <= 1 ? progress : 2 - progress;
        resident.position.x = -39 + travel * 78;
        resident.rotation.y = progress <= 1 ? Math.PI / 2 : -Math.PI / 2;
        leftLeg.rotation.x = Math.sin(elapsed * 7 + phase * 12) * 0.42;
        rightLeg.rotation.x = -leftLeg.rotation.x;
        resident.position.y = Math.abs(Math.sin(elapsed * 7 + phase * 12)) * 0.035;
      });
      // Translate movement into the camera's horizontal facing direction.
      // This keeps joystick-forward moving toward the centre of the view after the player rotates the camera.
      const localX = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + moveRef.current.x;
      const localZ = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0) + moveRef.current.z;
      const yaw = cameraLookRef.current.yaw;
      const inputX = localX * Math.cos(yaw) + localZ * Math.sin(yaw);
      const inputZ = -localX * Math.sin(yaw) + localZ * Math.cos(yaw);
      const direction = new THREE.Vector3(inputX, 0, inputZ);
      if (direction.lengthSq() > 0.01) {
        direction.normalize();
        const currentNeeds = needsRef.current;
        const energyFactor = currentNeeds.energy < 15 ? 0.62 : currentNeeds.energy < 35 ? 0.82 : 1;
        const hungerFactor = currentNeeds.hunger < 15 ? 0.82 : 1;
        const thirstFactor = currentNeeds.thirst < 15 ? 0.72 : currentNeeds.thirst < 30 ? 0.88 : 1;
        const movementSpeed = 5.2 * energyFactor * hungerFactor * thirstFactor;
        const stepX = direction.x * delta * movementSpeed;
        const stepZ = direction.z * delta * movementSpeed;
        const canStandAt = (x: number, z: number) =>
          x >= -45 && x <= 45 && z >= -48 && z <= 22 &&
          !colliders.some((obstacle) =>
            Math.abs(x - obstacle.x) < obstacle.halfX + 0.42 &&
            Math.abs(z - obstacle.z) < obstacle.halfZ + 0.42
          );
        // Resolve each axis separately so the player can slide along walls.
        if (canStandAt(player.position.x + stepX, player.position.z)) player.position.x += stepX;
        if (canStandAt(player.position.x, player.position.z + stepZ)) player.position.z += stepZ;
        player.rotation.y = Math.atan2(direction.x, direction.z);
      }
      target.set(player.position.x, 1.2, player.position.z);
      const look = cameraLookRef.current;
      const orbitDistance = 10;
      const desiredCamera = new THREE.Vector3(
        player.position.x + Math.sin(look.yaw) * Math.cos(look.pitch) * orbitDistance,
        player.position.y + 1.2 + Math.sin(look.pitch) * orbitDistance,
        player.position.z + Math.cos(look.yaw) * Math.cos(look.pitch) * orbitDistance
      );
      cameraDirection.copy(desiredCamera).sub(target).normalize();
      cameraRay.set(target, cameraDirection);
      cameraRay.far = 10;
      const cameraHits = cameraRay.intersectObjects(scene.children, true)
        .filter((hit) => hit.distance > 1.35 && hit.object !== player);
      // Pull the camera forward when a wall, tree or roof blocks the follow view.
      const safeDistance = cameraHits.length ? Math.max(3.2, cameraHits[0].distance - 0.75) : 10;
      cameraPosition.copy(target).addScaledVector(cameraDirection, safeDistance);
      camera.position.lerp(cameraPosition, 1 - Math.exp(-7 * delta));
      camera.lookAt(target);
      renderer.render(scene, camera);

      if (performance.now() - lastUi > 250) {
        lastUi = performance.now();
        const nearKiosk = player.position.distanceTo(kiosk) < 3.2;
        const nearJob = Math.hypot(player.position.x + 7.5, player.position.z + 4.2) < 4.2;
        const nearHome = Math.hypot(player.position.x, player.position.z + 1.7) < 2.8;
        setStatus((s) => ({ ...s, x: Math.round(player.position.x), z: Math.round(player.position.z), nearKiosk, nearHome, nearJob }));
      }
      if (elapsed - lastNeedsTick >= 5) {
        lastNeedsTick = elapsed;
        setNeeds((n) => ({ hunger: Math.max(0, n.hunger - 0.18), thirst: Math.max(0, n.thirst - 0.24), energy: Math.max(0, n.energy - 0.12), hygiene: Math.max(0, n.hygiene - 0.10) }));
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


  const startCameraLook = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    cameraDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
  };

  const moveCameraLook = (event: React.PointerEvent<HTMLDivElement>) => {
    if (cameraDragRef.current.pointerId !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - cameraDragRef.current.x;
    const dy = event.clientY - cameraDragRef.current.y;
    cameraDragRef.current.x = event.clientX;
    cameraDragRef.current.y = event.clientY;
    cameraLookRef.current.yaw -= dx * 0.008;
    cameraLookRef.current.pitch = THREE.MathUtils.clamp(cameraLookRef.current.pitch + dy * 0.006, 0.18, 1.18);
  };

  const stopCameraLook = (event: React.PointerEvent<HTMLDivElement>) => {
    cameraDragRef.current.pointerId = -1;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const updateJoystick = (event: React.PointerEvent<HTMLDivElement>) => {
    const base = joystickRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const radius = 42;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy);
    const scale = distance > radius ? radius / distance : 1;
    const x = (dx * scale) / radius;
    const y = (dy * scale) / radius;
    moveRef.current = { x, z: y };
    setJoystickPosition({ x: dx * scale, y: dy * scale });
  };

  const startJoystick = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };

  const stopJoystick = () => {
    moveRef.current = { x: 0, z: 0 };
    setJoystickPosition({ x: 0, y: 0 });
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
        <div className="player-card"><div className="player-avatar">👤</div><div><b>Dami</b><small>New resident</small></div><span className="cash">₦{wallet.toLocaleString("en-NG")}</span></div>
        <div className="world-tip">{status.message}</div>
        <div className="needs-panel" aria-label="Player needs">{([['HUNGER', needs.hunger, '🍲'], ['THIRST', needs.thirst, '💧'], ['ENERGY', needs.energy, '⚡'], ['HYGIENE', needs.hygiene, '🧼']] as const).map(([label, value, emoji]) => <div className="need-row" key={label}><span>{emoji} {label}</span><div className="need-track"><i style={{ width: `${value}%` }} /></div><b>{Math.round(value)}%</b></div>)}</div>
        {status.nearKiosk && !shopOpen && <button className="interact-prompt" onClick={() => setShopOpen(true)}>🛍️ OPEN KIOSK <span>Tap to shop</span></button>}
        {status.nearJob && !jobOpen && !jobWorking && <button className="job-interact-prompt" onClick={() => setJobOpen(true)}>💼 JOB BOARD <span>Tap to find work</span></button>}
        {status.nearHome && !homeOpen && <button className="home-interact-prompt" onClick={() => setHomeOpen(true)}>🏠 HOME <span>Tap to take care of yourself</span></button>}
        {jobOpen && <div className="shop-backdrop" role="presentation"><section className="job-panel" role="dialog" aria-modal="true" aria-label="Local job centre"><div className="shop-heading"><div><small>ADO-EKITI · COMMUNITY JOB BOARD</small><h2>Find a day's work</h2><p>Take a short neighbourhood delivery shift.</p></div><button className="shop-close" onClick={() => setJobOpen(false)} aria-label="Close jobs">×</button></div><div className="job-offer"><span>🛵</span><div><b>Neighbourhood Errand Assistant</b><small>Collect and deliver local orders around the area</small><strong>₦{jobPay.toLocaleString('en-NG')} per shift</strong></div></div><div className="job-requirements"><b>SHIFT DETAILS</b><span>Duration: 30 seconds (prototype)</span><span>Energy and hydration are used while working</span><span>Payment arrives when the shift is completed</span></div><button className="start-shift" onClick={() => { setJobOpen(false); setWorkSeconds(30); setJobWorking(true); setStatus((s) => ({ ...s, message: 'You started a delivery shift. Keep going!' })); }}>START SHIFT · EARN ₦{jobPay.toLocaleString('en-NG')}</button></section></div>}
        {jobWorking && <div className="working-banner"><span>🛵 ON DELIVERY SHIFT</span><b>{workSeconds}s remaining</b><small>Keep exploring — your shift is underway.</small></div>}
        {homeOpen && <div className="shop-backdrop" role="presentation"><section className="home-panel" role="dialog" aria-modal="true" aria-label="Home interactions"><div className="shop-heading"><div><small>YOUR HOME · ADO-EKITI</small><h2>Take care of yourself</h2><p>Rest, freshen up or prepare a meal.</p></div><button className="shop-close" onClick={() => setHomeOpen(false)} aria-label="Close home menu">×</button></div><div className="home-actions"><button onClick={() => performHomeAction('sleep')}><span>🛏️</span><b>Sleep</b><small>Restore energy</small></button><button onClick={() => performHomeAction('shower')}><span>🚿</span><b>Take a shower</b><small>Restore hygiene</small></button><button onClick={() => performHomeAction('cook')}><span>🍲</span><b>Cook a meal</b><small>Use 1 snack or fruit</small></button></div><div className="home-consumables"><b>USE ITEMS FROM YOUR BAG</b>{([{ id: 'water', label: 'Drink water', emoji: '💧' }, { id: 'softdrink', label: 'Drink soft drink', emoji: '🥤' }, { id: 'snack', label: 'Eat local snack', emoji: '🥟' }, { id: 'fruit', label: 'Eat fruit', emoji: '🍊' }] as const).map((item) => <button key={item.id} disabled={!(inventory[item.id] || 0)} onClick={() => consumeItem(item.id)}><span>{item.emoji}</span>{item.label}<small>×{inventory[item.id] || 0}</small></button>)}</div><div className="home-inventory">Items are used from your bag. Cooking uses one snack or fruit.</div></section></div>}
        {shopOpen && <div className="shop-backdrop" role="presentation"><section className="shop-panel" role="dialog" aria-modal="true" aria-label="Neighbourhood kiosk"><div className="shop-heading"><div><small>ADO-EKITI · STREET KIOSK</small><h2>Neighbourhood Store</h2><p>Pick up something for the road.</p></div><button className="shop-close" onClick={() => setShopOpen(false)} aria-label="Close shop">×</button></div><div className="shop-wallet">YOUR WALLET <strong>₦{wallet.toLocaleString("en-NG")}</strong></div><div className="shop-items">{shopItems.map((item) => <article className="shop-item" key={item.id}><div className="shop-emoji">{item.emoji}</div><div className="shop-item-copy"><b>{item.name}</b><small>{item.detail}</small><small className="owned">In bag: {inventory[item.id] || 0}</small></div><div className="shop-buy"><strong>₦{item.price.toLocaleString("en-NG")}</strong><button onClick={() => buyItem(item)} disabled={wallet < item.price}>BUY</button></div></article>)}</div><p className="shop-note">Prototype purchases update your demo wallet and bag for this session.</p></section></div> }
        <div className="touch-controls" aria-label="Virtual joystick movement control">
          <div
            ref={joystickRef}
            className="joystick-base"
            onPointerDown={startJoystick}
            onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) updateJoystick(event); }}
            onPointerUp={stopJoystick}
            onPointerCancel={stopJoystick}
            onLostPointerCapture={stopJoystick}
            role="application"
            aria-label="Drag joystick to move"
          >
            <span className="joystick-ring" />
            <span className="joystick-knob" style={{ transform: `translate(calc(-50% + ${joystickPosition.x}px), calc(-50% + ${joystickPosition.y}px))` }} />
          </div>
        </div>
        <div
          className="camera-look-area"
          onPointerDown={startCameraLook}
          onPointerMove={moveCameraLook}
          onPointerUp={stopCameraLook}
          onPointerCancel={stopCameraLook}
          aria-label="Drag to rotate camera"
        ><span className="camera-look-hint">DRAG TO LOOK</span></div>
        <div className="control-hint">WASD / ARROW KEYS <span>•</span> JOYSTICK + LOOK ON MOBILE</div>
        <div className="coordinate">X {status.x} · Z {status.z}</div>
      </section>
      <footer className="bottom-bar"><span><i /> 3D WORLD PROTOTYPE</span><span>BUILD YOUR LIFE. OWN YOUR FUTURE. EXPLORE YOUR CITY.</span><span>v0.2.0</span></footer>
    </main>
  );
}

export default App;