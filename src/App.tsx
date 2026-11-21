import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Move = { x: number; z: number };
type GameStatus = { message: string; x: number; z: number; nearKiosk: boolean; nearHome: boolean; nearJob: boolean };
type Needs = { hunger: number; thirst: number; energy: number; hygiene: number };
type ResidentProfile = { id: number; name: string; age: number; role: string; greeting: string; day: string; localTip: string };

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


function buildStarterInterior(scene: THREE.Scene) {
  const room = new THREE.Group();
  const floor = new THREE.Mesh(new THREE.BoxGeometry(8.4, 0.18, 6.4), makeMaterial('#b98f67'));
  floor.position.set(0, 0.02, 2.8); floor.receiveShadow = true; room.add(floor);
  const wall = (x: number, z: number, w: number, d: number, color = '#e8ddc8') => {
    const part = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, d), makeMaterial(color));
    part.position.set(x, 1.4, z); part.castShadow = true; part.receiveShadow = true; room.add(part);
  };
  wall(-4.2, 2.8, 0.18, 6.4); wall(4.2, 2.8, 0.18, 6.4); wall(0, 6, 8.4, 0.18);
  wall(-2.55, -0.4, 3.3, 0.18); wall(2.55, -0.4, 3.3, 0.18);
  const addFurniture = (x: number, y: number, z: number, w: number, h: number, d: number, color: string) => {
    const item = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeMaterial(color));
    item.position.set(x, y + h / 2, z); item.castShadow = true; item.receiveShadow = true; room.add(item);
  };
  addFurniture(-2.7, 0.12, 4.25, 2.35, 0.42, 2.55, '#704a36');
  addFurniture(-2.7, 0.36, 4.2, 2.18, 0.18, 2.35, '#e5d6bd');
  addFurniture(-2.7, 0.52, 3.25, 0.82, 0.16, 0.55, '#f5eee0');
  addFurniture(-3.65, 0.12, 1.15, 1.1, 2.1, 0.8, '#81563a');
  addFurniture(2.55, 0.12, 4.65, 2.7, 0.55, 1.05, '#47766c');
  addFurniture(2.55, 0.62, 4.95, 2.7, 0.72, 0.28, '#568b7e');
  addFurniture(1.95, 0.12, 2.95, 1.45, 0.38, 0.78, '#8b603e');
  addFurniture(2.65, 0.12, 1.35, 2.25, 0.42, 0.35, '#513c32');
  addFurniture(2.65, 0.56, 1.35, 1.45, 0.85, 0.08, '#202b2d');
  addFurniture(2.9, 0.12, -0.05, 2.0, 0.95, 0.85, '#9a7653');
  addFurniture(3.55, 0.12, 0.55, 0.72, 1.75, 0.72, '#d9dedb');
  addFurniture(1.95, 0.12, -0.05, 0.75, 0.88, 0.72, '#45494a');
  addFurniture(-0.25, 0.68, 2.35, 1.45, 0.12, 1.0, '#946a45');
  addFurniture(-0.72, 0.12, 1.75, 0.38, 0.62, 0.38, '#76533a');
  addFurniture(0.22, 0.12, 2.95, 0.38, 0.62, 0.38, '#76533a');
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffe2a0', emissive: '#8b612b', emissiveIntensity: 0.7 }));
  bulb.position.set(0, 2.55, 2.8); room.add(bulb);
  const light = new THREE.PointLight('#ffe1b0', 1.15, 13); light.position.set(0, 2.35, 2.8); room.add(light);
  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: '#8fc4d0', roughness: 0.25 }));
  windowGlass.position.set(-4.08, 1.65, 3.0); room.add(windowGlass);
  scene.add(room); room.visible = false; return room;
}

function buildResident(index: number) {
  const resident = new THREE.Group();
  const designs = [
    { skin: '#70432f', shirt: '#d5a45f', lower: '#263b50', hair: '#211b18', style: 'afro', role: 'trader', name: 'Bisi', age: 34, greeting: 'Ẹ káàárọ̀! Welcome, neighbour. I sell provisions around here.', day: 'I run a small provisions stall. Mornings are busy, especially when students pass by.', localTip: 'Try the roadside kiosk when you need a quick drink or snack.' },
    { skin: '#8f573b', shirt: '#397c70', lower: '#49344d', hair: '#241d1a', style: 'wrap', role: 'resident', name: 'Mama Tola', age: 52, greeting: 'Ah, my dear! It is good to see a new face in the area.', day: 'I look after my home and check on the neighbours. We try to keep this street peaceful.', localTip: 'People around here know one another. A friendly greeting goes a long way.' },
    { skin: '#5c392b', shirt: '#e6dfcf', lower: '#344b70', hair: '#191614', style: 'short', role: 'worker', name: 'Tunde', age: 29, greeting: 'How far, my guy? Just taking a short break from work.', day: 'I do maintenance jobs around the neighbourhood. There is always something to fix.', localTip: 'Check the community job board if you want to earn some extra cash.' },
    { skin: '#a66b4d', shirt: '#b95d48', lower: '#343d50', hair: '#30221b', style: 'braids', role: 'student', name: 'Kemi', age: 21, greeting: 'Hi! You must be one of the new residents. Nice to meet you.', day: 'I am a student. I usually head out for classes and meet friends later in the day.', localTip: 'The main road is the easiest way to find your bearings around this part of town.' },
    { skin: '#794a36', shirt: '#668b50', lower: '#76543c', hair: '#211a17', style: 'cap', role: 'resident', name: 'Ayo', age: 26, greeting: 'Oga, welcome o! Hope you are settling in well.', day: 'I help people with errands and deliveries whenever I can find a job.', localTip: 'The job board has a starter delivery shift you can try.' }
  ];
  const design = designs[index % designs.length];
  const skin = makeMaterial(design.skin);
  const shirt = makeMaterial(design.shirt);
  const lower = makeMaterial(design.lower);
  const hair = makeMaterial(design.hair);
  const shoe = makeMaterial('#292b2b');
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.31, 0.62, 6, 12), shirt);
  torso.position.y = 1.16; torso.castShadow = true; torso.receiveShadow = true; resident.add(torso);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.13, 0.2, 12), skin);
  neck.position.y = 1.65; neck.castShadow = true; resident.add(neck);
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.025, 6, 16), makeMaterial(design.shirt));
  collar.rotation.x = Math.PI / 2; collar.position.set(0, 1.55, 0.015); resident.add(collar);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.285, 20, 16), skin);
  head.scale.set(1, 1.08, 0.96); head.position.y = 1.91; head.castShadow = true; resident.add(head);
  const shoulderL = new THREE.Mesh(new THREE.SphereGeometry(0.19, 12, 10), shirt);
  const shoulderR = shoulderL.clone();
  shoulderL.scale.set(1.15, 0.86, 0.9); shoulderR.scale.copy(shoulderL.scale);
  shoulderL.position.set(-0.25, 1.43, 0); shoulderR.position.set(0.25, 1.43, 0);
  resident.add(shoulderL, shoulderR);
  const earGeo = new THREE.SphereGeometry(0.065, 8, 6);
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(earGeo, skin); ear.position.set(side * 0.27, 1.91, 0); resident.add(ear);
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.047, 12, 10), makeMaterial('#f4e9dc'));
    eyeWhite.scale.set(1, 0.72, 0.48);
    eyeWhite.position.set(side * 0.105, 1.965, 0.249); resident.add(eyeWhite);
    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.025, 10, 8), makeMaterial('#38251d'));
    iris.position.set(side * 0.105, 1.963, 0.272); resident.add(iris);
    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), makeMaterial('#100e0d'));
    pupil.position.set(side * 0.105, 1.963, 0.284); resident.add(pupil);
    const brow = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, 0.075, 3, 6), hair);
    brow.rotation.z = side * -0.12; brow.position.set(side * 0.105, 2.035, 0.247); resident.add(brow);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 7, 6), skin);
  nose.scale.set(0.8, 1.15, 0.8); nose.position.set(0, 1.88, 0.285); resident.add(nose);
  const noseBridge = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), skin);
  noseBridge.scale.set(0.72, 1.65, 0.72); noseBridge.position.set(0, 1.91, 0.275); resident.add(noseBridge);
  const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.012, 0.075, 3, 7), makeMaterial('#542d28'));
  mouth.rotation.z = Math.PI / 2; mouth.position.set(0, 1.79, 0.273); resident.add(mouth);
  const lowerLip = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), makeMaterial('#8b5147'));
  lowerLip.scale.set(1.2, 0.35, 0.35); lowerLip.position.set(0, 1.765, 0.27); resident.add(lowerLip);

  if (design.style === 'afro' || design.style === 'braids') {
    const crown = new THREE.Mesh(new THREE.SphereGeometry(design.style === 'afro' ? 0.34 : 0.29, 10, 8), hair);
    crown.scale.set(1, design.style === 'afro' ? 0.82 : 0.62, 1); crown.position.set(0, 2.12, -0.015); resident.add(crown);
    if (design.style === 'braids') {
      for (const side of [-1, 1]) for (let n = 0; n < 4; n++) {
        const braid = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.04, 0.64, 8), hair);
        braid.position.set(side * (0.19 + n * 0.025), 1.78 - n * 0.055, -0.035 - n * 0.045);
        braid.rotation.z = side * -0.12; braid.castShadow = true; resident.add(braid);
        const bead = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), makeMaterial('#c99b55'));
        bead.position.set(side * (0.19 + n * 0.025), 1.46 - n * 0.055, -0.035 - n * 0.045); resident.add(bead);
      }
    }
  } else if (design.style === 'wrap') {
    const wrap = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 8), makeMaterial('#e3a9a0'));
    wrap.scale.set(1.08, 0.58, 1.02); wrap.position.set(0, 2.14, -0.015); resident.add(wrap);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 7), makeMaterial('#c77f79'));
    knot.position.set(0, 2.28, -0.2); resident.add(knot);
  } else if (design.style === 'cap') {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 0.13, 10), makeMaterial('#c7a46b'));
    cap.position.set(0, 2.13, 0); resident.add(cap);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.035, 0.2), makeMaterial('#b58c55'));
    brim.position.set(0, 2.08, 0.17); resident.add(brim);
  } else {
    const closeHair = new THREE.Mesh(new THREE.SphereGeometry(0.29, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.52), hair);
    closeHair.position.set(0, 2.03, -0.015); resident.add(closeHair);
  }

  const leftArm = new THREE.Group(); leftArm.position.set(-0.34, 1.42, 0);
  const rightArm = new THREE.Group(); rightArm.position.set(0.34, 1.42, 0);
  for (const [pivot, side] of [[leftArm, -1], [rightArm, 1]] as Array<[THREE.Group, number]>) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.105, 0.42, 3, 7), shirt);
    arm.position.set(0, -0.27, 0); arm.rotation.z = side * -0.08; arm.castShadow = true; pivot.add(arm);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.095, 7, 6), skin);
    hand.position.set(0, -0.56, 0.015); pivot.add(hand);
  }
  resident.add(leftArm, rightArm);
  // Character-specific accessories make each resident recognisable at a glance.
  if (design.name === 'Kemi') {
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.58, 0.22), makeMaterial('#6b526f'));
    backpack.position.set(0, 1.22, -0.27); backpack.castShadow = true; resident.add(backpack);
    for (const side of [-1, 1]) {
      const strap = new THREE.Mesh(new THREE.CapsuleGeometry(0.025, 0.34, 3, 6), makeMaterial('#d4b58c'));
      strap.position.set(side * 0.22, 1.3, 0.12); strap.rotation.z = side * -0.16; resident.add(strap);
    }
  }
  if (design.name === 'Ayo') {
    const strap = new THREE.Mesh(new THREE.CapsuleGeometry(0.035, 0.78, 3, 7), makeMaterial('#3d3932'));
    strap.position.set(0.12, 1.17, 0.08); strap.rotation.z = -0.48; resident.add(strap);
    const bag = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.46, 0.2), makeMaterial('#b58b43'));
    bag.position.set(-0.28, 0.94, 0.12); bag.castShadow = true; resident.add(bag);
  }
  if (design.name === 'Tunde') {
    const vestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.055, 0.025), makeMaterial('#e8c85b'));
    vestStripe.position.set(0, 1.18, 0.302); resident.add(vestStripe);
    const toolPouch = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.2, 0.12), makeMaterial('#74543b'));
    toolPouch.position.set(-0.22, 0.91, 0.18); resident.add(toolPouch);
  }

  const leftLeg = new THREE.Group(); leftLeg.position.set(-0.145, 0.72, 0);
  const rightLeg = new THREE.Group(); rightLeg.position.set(0.145, 0.72, 0);
  for (const pivot of [leftLeg, rightLeg]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.42, 3, 7), lower);
    leg.position.y = -0.29; leg.castShadow = true; pivot.add(leg);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.11, 0.32), shoe);
    foot.position.set(0, -0.58, 0.07); pivot.add(foot);
  }
  resident.add(leftLeg, rightLeg);

  // Small outfit details help silhouettes read differently at normal phone viewing distance.
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.14, 0.025), makeMaterial(design.role === 'worker' ? '#d8d0bd' : design.shirt));
  pocket.position.set(0.16, 1.28, 0.29); resident.add(pocket);
  if (design.role === 'trader') {
    const wrapper = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.29, 0.42, 9), makeMaterial('#b35f48'));
    wrapper.position.set(0, 0.57, 0); resident.add(wrapper);
  }
  resident.userData = {
    phase: index * 0.31,
    speed: 0.032 + index * 0.003,
    leftLeg, rightLeg, leftArm, rightArm, torso,
    role: design.role,
    profile: { id: index, name: design.name, age: design.age, role: design.role === 'trader' ? 'Provisions trader' : design.role === 'worker' ? 'Maintenance worker' : design.role === 'student' ? 'Student' : 'Neighbour', greeting: design.greeting, day: design.day, localTip: design.localTip } satisfies ResidentProfile
  };
  return resident;
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
  const isInsideRef = useRef(false);
  const interiorRef = useRef<THREE.Group | null>(null);
  const outdoorObjectsRef = useRef<THREE.Object3D[]>([]);
  const playerRef = useRef<THREE.Group | null>(null);
  const cameraDragRef = useRef({ pointerId: -1, x: 0, y: 0 });
  const cameraLookRef = useRef({ yaw: 0, pitch: 0.62 });
  const moveRef = useRef<Move>({ x: 0, z: 0 });
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState<GameStatus>({ message: 'Welcome to your new home in Ado-Ekiti.', x: 0, z: 12, nearKiosk: false, nearHome: false, nearJob: false });
  const [shopOpen, setShopOpen] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [insideHome, setInsideHome] = useState(false);
  const [nearbyResident, setNearbyResident] = useState<ResidentProfile | null>(null);
  const [talkingTo, setTalkingTo] = useState<ResidentProfile | null>(null);
  const [dialogueLine, setDialogueLine] = useState('');
  const [jobOpen, setJobOpen] = useState(false);
  const [jobWorking, setJobWorking] = useState(false);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [needs, setNeeds] = useState<Needs>({ hunger: 82, thirst: 78, energy: 90, hygiene: 88 });
  const [gameClock, setGameClock] = useState({ day: 1, hour: 8, minute: 0 });
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
  const interior = buildStarterInterior(scene);
  interiorRef.current = interior;
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
    playerRef.current = player;
    // Distinct stylized residents: original Nigerian street characters with varied faces, hair and outfits.
    const pedestrians = [0, 1, 2, 3, 4].map((index) => {
      const resident = buildResident(index);
      resident.position.set(-8 + index * 4, 0, index % 2 === 0 ? 8.2 : 10.4);
      scene.add(resident);
      return resident;
    });
    outdoorObjectsRef.current = scene.children.filter((object) => object !== hemi && object !== sun && object !== player && object !== interior);

    const clock = new THREE.Clock();
    const nightSky = new THREE.Color('#17243b');
    const daySky = new THREE.Color('#a9d6dc');
    const currentSky = new THREE.Color();
    const target = new THREE.Vector3();
    const cameraRay = new THREE.Raycaster();
    const cameraDirection = new THREE.Vector3();
    const cameraPosition = new THREE.Vector3();
    let frame = 0;
    let lastUi = 0;
    let lastNeedsTick = 0;
    let lastClockUi = -1;
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
      const totalGameMinutes = 8 * 60 + elapsed * 2;
      const gameMinutes = Math.floor(totalGameMinutes) % 1440;
      const gameHour = Math.floor(gameMinutes / 60);
      if (Math.floor(elapsed) !== lastClockUi) {
        lastClockUi = Math.floor(elapsed);
        setGameClock({ day: 1 + Math.floor(totalGameMinutes / 1440), hour: gameHour, minute: gameMinutes % 60 });
      }
      const daylight = THREE.MathUtils.clamp((Math.sin(((gameHour - 6) / 12) * Math.PI) + 0.12) / 1.12, 0.08, 1);
      sun.intensity = 0.22 + daylight * 2.25;
      hemi.intensity = 0.45 + daylight * 1.65;
      sun.color.setHSL(0.10, 0.42, 0.58 + daylight * 0.25);
      currentSky.copy(nightSky).lerp(daySky, daylight);
      scene.background = currentSky;
      scene.fog.color.copy(currentSky);
      pedestrians.forEach((resident) => {
        const { phase, leftLeg, rightLeg, leftArm, rightArm } = resident.userData as {
          phase: number; leftLeg: THREE.Group; rightLeg: THREE.Group;
          leftArm: THREE.Group; rightArm: THREE.Group;
        };
        const profile = resident.userData.profile as ResidentProfile;
        const playerDistance = Math.hypot(player.position.x - resident.position.x, player.position.z - resident.position.z);
        const nearbyPerson = pedestrians.some((other) => other !== resident &&
          Math.hypot(other.position.x - resident.position.x, other.position.z - resident.position.z) < 1.05);
        const shouldPause = playerDistance < 2.7 || nearbyPerson;
        const facingPlayer = playerDistance < 2.7;
        let gait = 0;

        const blockedAt = (x: number, z: number) => colliders.some((obstacle) =>
          Math.abs(x - obstacle.x) < obstacle.halfX + 0.48 &&
          Math.abs(z - obstacle.z) < obstacle.halfZ + 0.48
        );
        const daytime = gameHour >= 7 && gameHour < 18;
        const deliveryStops: Array<[number, number]> = [[11, -9.4], [24, -8.2], [28, -18], [-18, -9.5]];
        let destination: [number, number];
        if (profile.id === 0) destination = daytime ? [11, -9.4] : [-10, 8.2];
        else if (profile.id === 1) destination = gameHour >= 18 || gameHour < 6 ? [-10, 8.2] : [-10, 4.5];
        else if (profile.id === 2) destination = daytime ? [-11, -3.2] : [-9, 9.5];
        else if (profile.id === 3) destination = daytime ? [-25, -18] : [-9, 9.5];
        else destination = daytime ? deliveryStops[Math.floor(elapsed / 24) % deliveryStops.length] : [-9, 9.5];
        if (facingPlayer) {
          resident.rotation.y = Math.atan2(player.position.x - resident.position.x, player.position.z - resident.position.z);
        } else if (!nearbyPerson) {
          const dx = destination[0] - resident.position.x;
          const dz = destination[1] - resident.position.z;
          const distance = Math.hypot(dx, dz);
          if (distance > 0.45) {
            const step = Math.min(distance, delta * (profile.id === 4 ? 2.25 : 1.8));
            const nextX = resident.position.x + (dx / distance) * step;
            const nextZ = resident.position.z + (dz / distance) * step;
            if (!blockedAt(nextX, nextZ)) {
              resident.position.x = nextX;
              resident.position.z = nextZ;
              resident.rotation.y = Math.atan2(dx, dz);
              gait = Math.sin(elapsed * 7 + phase * 12);
            } else {
              const sideSteps: Array<[number, number]> = [[nextX, resident.position.z], [resident.position.x, nextZ]];
              const clearStep = sideSteps.find(([x, z]) => !blockedAt(x, z));
              if (clearStep) {
                resident.position.set(clearStep[0], 0, clearStep[1]);
                resident.rotation.y = Math.atan2(dx, dz);
                gait = Math.sin(elapsed * 7 + phase * 12);
              }
            }
          }
        }
        leftLeg.rotation.x = gait * 0.38;
        rightLeg.rotation.x = -gait * 0.38;
        leftArm.rotation.x = -gait * 0.2;
        rightArm.rotation.x = gait * 0.2;
        resident.position.y = shouldPause ? 0 : Math.abs(gait) * 0.018;
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
        const canStandAt = (x: number, z: number) => isInsideRef.current
          ? x >= -3.65 && x <= 3.65 && z >= 0.05 && z <= 5.45
          : x >= -45 && x <= 45 && z >= -48 && z <= 22 && !colliders.some((obstacle) => Math.abs(x - obstacle.x) < obstacle.halfX + 0.42 && Math.abs(z - obstacle.z) < obstacle.halfZ + 0.42);
        if (canStandAt(player.position.x + stepX, player.position.z)) player.position.x += stepX;
        if (canStandAt(player.position.x, player.position.z + stepZ)) player.position.z += stepZ;
        player.rotation.y = Math.atan2(direction.x, direction.z);
      }
      target.set(player.position.x, 1.2, player.position.z);
      const look = cameraLookRef.current;
      const orbitDistance = isInsideRef.current ? 6 : 10;
      const desiredCamera = isInsideRef.current
        ? new THREE.Vector3(player.position.x + Math.sin(look.yaw) * 5.5, player.position.y + 7.2, player.position.z + Math.cos(look.yaw) * 5.5)
        : new THREE.Vector3(
            player.position.x + Math.sin(look.yaw) * Math.cos(look.pitch) * orbitDistance,
            player.position.y + 1.2 + Math.sin(look.pitch) * orbitDistance,
            player.position.z + Math.cos(look.yaw) * Math.cos(look.pitch) * orbitDistance
          );
      cameraDirection.copy(desiredCamera).sub(target).normalize();
      cameraRay.set(target, cameraDirection);
      cameraRay.far = 10;
      const cameraHits = isInsideRef.current ? [] : cameraRay.intersectObjects(scene.children, true)
        .filter((hit) => hit.distance > 1.35 && hit.object !== player);
      // Pull the camera forward when a wall, tree or roof blocks the follow view.
      const safeDistance = cameraHits.length ? Math.max(3.2, cameraHits[0].distance - 0.75) : 10;
      cameraPosition.copy(target).addScaledVector(cameraDirection, safeDistance);
      camera.position.lerp(cameraPosition, 1 - Math.exp(-7 * delta));
      camera.lookAt(target);
      renderer.render(scene, camera);

      if (performance.now() - lastUi > 250) {
        lastUi = performance.now();
        const nearKiosk = !isInsideRef.current && player.position.distanceTo(kiosk) < 3.2;
        const nearJob = !isInsideRef.current && Math.hypot(player.position.x + 7.5, player.position.z + 4.2) < 4.2;
        const nearHome = isInsideRef.current || Math.hypot(player.position.x, player.position.z + 1.7) < 2.8;
        let closest: { profile: ResidentProfile; distance: number } | null = null;
        if (!isInsideRef.current) {
          for (const resident of pedestrians) {
            const distance = Math.hypot(player.position.x - resident.position.x, player.position.z - resident.position.z);
            if (distance < 5.8 && (!closest || distance < closest.distance)) {
              closest = { profile: resident.userData.profile as ResidentProfile, distance };
            }
          }
        }
        setNearbyResident(closest?.profile ?? null);
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
      playerRef.current = null;
      interiorRef.current = null;
      outdoorObjectsRef.current = [];
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
        <div className="day-chip"><span className="live-dot" /> ADO-EKITI <b>DAY {String(gameClock.day).padStart(2, '0')} · {String(gameClock.hour).padStart(2, '0')}:{String(gameClock.minute).padStart(2, '0')}</b></div>
      </header>
      <section className="game-stage">
        <div className="world" ref={hostRef} aria-label="3D Ekiti Lifestyle world" />
        <div className="location-tag"><span>⌖</span><div><b>YOUR NEIGHBOURHOOD</b><small>Ado-Ekiti, Ekiti State</small></div></div>
        <div className="player-card"><div className="player-avatar">👤</div><div><b>Dami</b><small>New resident</small></div><span className="cash">₦{wallet.toLocaleString("en-NG")}</span></div>
        <div className="world-tip">{status.message}</div>
        <div className="needs-panel" aria-label="Player needs">{([['HUNGER', needs.hunger, '🍲'], ['THIRST', needs.thirst, '💧'], ['ENERGY', needs.energy, '⚡'], ['HYGIENE', needs.hygiene, '🧼']] as const).map(([label, value, emoji]) => <div className="need-row" key={label}><span>{emoji} {label}</span><div className="need-track"><i style={{ width: `${value}%` }} /></div><b>{Math.round(value)}%</b></div>)}</div>
        {status.nearKiosk && !shopOpen && <button className="interact-prompt" onClick={() => setShopOpen(true)}>🛍️ OPEN KIOSK <span>Tap to shop</span></button>}
        {nearbyResident && !talkingTo && !shopOpen && !homeOpen && !jobOpen && <button className="resident-interact-prompt" onClick={() => { setTalkingTo(nearbyResident); setDialogueLine(nearbyResident.greeting); }}>💬 TALK TO {nearbyResident.name.toUpperCase()} <span>{nearbyResident.role} · Tap to greet</span></button>}
        {status.nearJob && !jobOpen && !jobWorking && <button className="job-interact-prompt" onClick={() => setJobOpen(true)}>💼 JOB BOARD <span>Tap to find work</span></button>}
        {status.nearHome && !homeOpen && !insideHome && <button className="home-interact-prompt" onClick={() => { isInsideRef.current = true; playerRef.current?.position.set(0, 0, 2.8); outdoorObjectsRef.current.forEach((object) => { object.visible = false; }); if (interiorRef.current) interiorRef.current.visible = true; setInsideHome(true); setHomeOpen(false); setStatus((s) => ({ ...s, message: 'Welcome inside. Explore your home and make yourself comfortable.' })); }}>🏠 ENTER YOUR HOME <span>Tap to go inside</span></button>}
        {insideHome && <><div className="interior-label">YOUR HOME · INSIDE</div><button className="interior-exit" onClick={() => { isInsideRef.current = false; if (interiorRef.current) interiorRef.current.visible = false; outdoorObjectsRef.current.forEach((object) => { object.visible = true; }); playerRef.current?.position.set(0, 0, -1.7); setInsideHome(false); setHomeOpen(false); setStatus((s) => ({ ...s, message: 'You stepped outside into your neighbourhood.' })); }}>EXIT HOME ↗</button>{status.nearHome && !homeOpen && <button className="home-interact-prompt" onClick={() => setHomeOpen(true)}>🏡 HOME ACTIONS <span>Sleep · shower · prepare food</span></button>}</>}
        {talkingTo && <div className="shop-backdrop" role="presentation"><section className="resident-panel" role="dialog" aria-modal="true" aria-label={`Conversation with ${talkingTo.name}`}><div className="shop-heading"><div><small>ADO-EKITI · NEIGHBOURHOOD</small><h2>{talkingTo.name}</h2><p>{talkingTo.age} years old · {talkingTo.role}</p></div><button className="shop-close" onClick={() => setTalkingTo(null)} aria-label="End conversation">×</button></div><div className="resident-dialogue"><span>💬</span><p>{dialogueLine}</p></div><div className="resident-topics"><button onClick={() => setDialogueLine(talkingTo.day)}>How is your day going?</button><button onClick={() => setDialogueLine(talkingTo.localTip)}>Tell me about this neighbourhood</button></div><button className="start-shift resident-goodbye" onClick={() => { setTalkingTo(null); setStatus((s) => ({ ...s, message: `You said goodbye to ${talkingTo.name}.` })); }}>NICE TALKING TO YOU</button></section></div>}
        {jobOpen && <div className="shop-backdrop" role="presentation"><section className="job-panel" role="dialog" aria-modal="true" aria-label="Local job centre"><div className="shop-heading"><div><small>ADO-EKITI · COMMUNITY JOB BOARD</small><h2>Find a day's work</h2><p>Take a short neighbourhood delivery shift.</p></div><button className="shop-close" onClick={() => setJobOpen(false)} aria-label="Close jobs">×</button></div><div className="job-offer"><span>🛵</span><div><b>Neighbourhood Errand Assistant</b><small>Collect and deliver local orders around the area</small><strong>₦{jobPay.toLocaleString('en-NG')} per shift</strong></div></div><div className="job-requirements"><b>SHIFT DETAILS</b><span>Duration: 30 seconds (prototype)</span><span>Energy and hydration are used while working</span><span>Payment arrives when the shift is completed</span></div><button className="start-shift" onClick={() => { setJobOpen(false); setWorkSeconds(30); setJobWorking(true); setStatus((s) => ({ ...s, message: 'You started a delivery shift. Keep going!' })); }}>START SHIFT · EARN ₦{jobPay.toLocaleString('en-NG')}</button></section></div>}
        {jobWorking && <div className="working-banner"><span>🛵 ON DELIVERY SHIFT</span><b>{workSeconds}s remaining</b><small>Keep exploring — your shift is underway.</small></div>}
        {homeOpen && <div className="shop-backdrop" role="presentation"><section className="home-panel" role="dialog" aria-modal="true" aria-label="Home interactions"><div className="shop-heading"><div><small>YOUR HOME · ADO-EKITI</small><h2>What would you like to do?</h2><p>Your bedroom, living area and kitchen are ready.</p></div><button className="shop-close" onClick={() => setHomeOpen(false)} aria-label="Close home menu">×</button></div><div className="home-actions"><button onClick={() => performHomeAction('sleep')}><span>🛏️</span><b>Sleep</b><small>Restore energy</small></button><button onClick={() => performHomeAction('shower')}><span>🚿</span><b>Take a shower</b><small>Restore hygiene</small></button><button onClick={() => performHomeAction('cook')}><span>🍲</span><b>Cook a meal</b><small>Use 1 snack or fruit</small></button></div><div className="home-consumables"><b>USE ITEMS FROM YOUR BAG</b>{([{ id: 'water', label: 'Drink water', emoji: '💧' }, { id: 'softdrink', label: 'Drink soft drink', emoji: '🥤' }, { id: 'snack', label: 'Eat local snack', emoji: '🥟' }, { id: 'fruit', label: 'Eat fruit', emoji: '🍊' }] as const).map((item) => <button key={item.id} disabled={!(inventory[item.id] || 0)} onClick={() => consumeItem(item.id)}><span>{item.emoji}</span>{item.label}<small>×{inventory[item.id] || 0}</small></button>)}</div><div className="home-inventory">Items are used from your bag. Cooking uses one snack or fruit.</div></section></div>}
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