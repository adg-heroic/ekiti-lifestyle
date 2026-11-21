import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

type Move = { x: number; z: number };
type GameStatus = { message: string; x: number; z: number; nearKiosk: boolean; nearHome: boolean; nearJob: boolean; nearMarket: number; nearCampus: string };
type Needs = { hunger: number; thirst: number; energy: number; fun: number; social: number; hygiene: number; bladder: number };
type HomeObjectAction = 'sleep' | 'shower' | 'cook' | 'sit' | 'dance' | 'movie' | 'read-hustle' | 'read-charisma' | 'use-toilet';
type HomeObjectData = { id: string; name: string; room: string; description: string; emoji: string; actions: Array<{ label: string; detail: string; duration: string; action: HomeObjectAction }> };
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
  const floor = new THREE.Mesh(new THREE.BoxGeometry(14.4, 0.18, 12.4), makeMaterial('#b98f67'));
  floor.position.set(0, 0.02, 2.8); floor.receiveShadow = true; room.add(floor);
  const wall = (x: number, z: number, w: number, d: number, color = '#e8ddc8') => {
    const part = new THREE.Mesh(new THREE.BoxGeometry(w, 2.8, d), makeMaterial(color));
    part.position.set(x, 1.4, z); part.castShadow = true; part.receiveShadow = true; room.add(part);
  };
  wall(-7.2, 2.8, 0.18, 12.4); wall(7.2, 2.8, 0.18, 12.4); wall(0, 9, 14.4, 0.18);
  wall(-4.7, -3.4, 5.0, 0.18); wall(4.7, -3.4, 5.0, 0.18);
  wall(-1.0, 5.9, 0.16, 5.8, '#d8c7ad'); wall(4.9, 5.9, 0.16, 5.8, '#d8c7ad'); wall(1.95, 3.05, 5.9, 0.16, '#d8c7ad');
  const addFurniture = (x: number, y: number, z: number, w: number, h: number, d: number, color: string, homeObject?: HomeObjectData) => {
    const item = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), makeMaterial(color));
    item.position.set(x, y + h / 2, z); item.castShadow = true; item.receiveShadow = true;
    if (homeObject) item.userData.homeObject = homeObject;
    room.add(item); return item;
  };
  addFurniture(-2.7, 0.12, 4.25, 2.35, 0.42, 2.55, '#704a36', { id: 'bed', name: 'Comfortable Bed', room: 'Bedroom', emoji: '🛏️', description: 'Your bed is where you recover after a long day in Ado-Ekiti.', actions: [{ label: 'Sleep', detail: 'Restore energy and recover from the day.', duration: '15 sec', action: 'sleep' }] });
  addFurniture(-2.7, 0.36, 4.2, 2.18, 0.18, 2.35, '#e5d6bd');
  addFurniture(-2.7, 0.52, 3.25, 0.82, 0.16, 0.55, '#f5eee0');
  addFurniture(-3.65, 0.12, 1.15, 1.1, 2.1, 0.8, '#81563a');
  addFurniture(2.55, 0.12, 4.65, 2.7, 0.55, 1.05, '#47766c', { id: 'sofa', name: 'Living Room Sofa', room: 'Living Room', emoji: '🛋️', description: 'A comfortable place to rest, enjoy a film or spend a quiet moment.', actions: [{ label: 'Kick back & relax', detail: 'Take a short break on the sofa.', duration: '9 sec', action: 'sit' }, { label: 'Nap on sofa', detail: 'Recover some energy.', duration: '15 sec', action: 'sleep' }, { label: 'Watch a movie', detail: 'Enjoy a film and unwind.', duration: '12 sec', action: 'movie' }] });
  addFurniture(2.55, 0.62, 4.95, 2.7, 0.72, 0.28, '#568b7e');
  addFurniture(1.95, 0.12, 2.95, 1.45, 0.38, 0.78, '#8b603e');
  addFurniture(2.65, 0.12, 1.35, 2.25, 0.42, 0.35, '#513c32');
  addFurniture(2.65, 0.56, 1.35, 1.45, 0.85, 0.08, '#202b2d', { id: 'television', name: 'Living Room Television', room: 'Living Room', emoji: '📺', description: 'Put your feet up and enjoy entertainment at home.', actions: [{ label: 'Watch a movie', detail: 'Spend time enjoying a film.', duration: '12 sec', action: 'movie' }, { label: 'Dance to music', detail: 'Move to your favourite sounds.', duration: '10 sec', action: 'dance' }] });
  addFurniture(2.9, 0.12, -0.05, 2.0, 0.95, 0.85, '#9a7653', { id: 'kitchen-counter', name: 'Kitchen Counter', room: 'Kitchen', emoji: '🍲', description: 'Prepare a meal using ingredients in your bag.', actions: [{ label: 'Cook a meal', detail: 'Use one snack or fruit and restore hunger.', duration: '12 sec', action: 'cook' }] });
  addFurniture(3.55, 0.12, 0.55, 1.75, 1.75, 0.72, '#d9dedb', { id: 'fridge', name: 'Kitchen Refrigerator', room: 'Kitchen', emoji: '🧊', description: 'Check your kitchen and prepare something with the ingredients you have.', actions: [{ label: 'Prepare a meal', detail: 'Use one snack or fruit from your bag.', duration: '12 sec', action: 'cook' }] });
  addFurniture(1.95, 0.12, -0.05, 0.75, 0.88, 0.72, '#45494a');
  addFurniture(-0.25, 0.68, 2.35, 1.45, 0.12, 1.0, '#946a45');
  addFurniture(-0.72, 0.12, 1.75, 0.38, 0.62, 0.38, '#76533a');
  addFurniture(0.22, 0.12, 2.95, 0.38, 0.62, 0.38, '#76533a');
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.16, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffe2a0', emissive: '#8b612b', emissiveIntensity: 0.7 }));
  bulb.position.set(0, 2.55, 2.8); room.add(bulb);
  const light = new THREE.PointLight('#ffe1b0', 1.15, 13); light.position.set(0, 2.35, 2.8); room.add(light);
  const windowGlass = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: '#8fc4d0', roughness: 0.25 }));
  windowGlass.position.set(-7.08, 1.65, 3.0); room.add(windowGlass);
  addFurniture(5.9, 0.12, 7.3, 1.45, 0.12, 1.35, '#9ccbd0', { id: 'shower', name: 'Bathroom Shower', room: 'Bathroom', emoji: '🚿', description: 'Freshen up after exploring the city or finishing a shift.', actions: [{ label: 'Take a shower', detail: 'Restore hygiene.', duration: '10 sec', action: 'shower' }] });
  addFurniture(5.95, 0.12, 5.0, 0.72, 0.82, 0.55, '#f1eee4', { id: 'toilet', name: 'Bathroom Toilet', room: 'Bathroom', emoji: '🚽', description: 'A private bathroom essential in your home.', actions: [{ label: 'Use the bathroom', detail: 'Take care of your personal needs.', duration: '8 sec', action: 'use-toilet' }] });
  addFurniture(5.95, 0.12, 6.0, 0.58, 0.35, 0.5, '#e8e5dc');
  addFurniture(-6.05, 0.12, 7.05, 0.65, 1.75, 1.5, '#805638', { id: 'bookcase', name: 'Home Bookcase', room: 'Study Nook', emoji: '📚', description: 'Read and develop your knowledge while relaxing at home.', actions: [{ label: 'Read a business book', detail: 'Build your Hustle skill.', duration: '11 sec', action: 'read-hustle' }, { label: 'Read a novel', detail: 'Develop your Charisma skill.', duration: '11 sec', action: 'read-charisma' }] });
  addFurniture(-5.2, 0.12, 1.3, 1.5, 0.72, 0.75, '#916744', { id: 'study-desk', name: 'Study Desk', room: 'Study Nook', emoji: '📝', description: 'A quiet place to study, read and improve your skills.', actions: [{ label: 'Study business', detail: 'Build your Hustle skill.', duration: '12 sec', action: 'read-hustle' }, { label: 'Read for confidence', detail: 'Develop your Charisma skill.', duration: '12 sec', action: 'read-charisma' }] });
  addFurniture(2.9, 0.12, 7.6, 1.15, 0.82, 0.55, '#d9dedb');
  scene.add(room); room.visible = false; return room;
}

function buildResident(index: number) {
  const resident = new THREE.Group();
  const designs = [
    { skin: '#70432f', shirt: '#d5a45f', lower: '#263b50', hair: '#211b18', style: 'afro', role: 'trader', name: 'Bisi', age: 34, greeting: 'Ẹ káàárọ̀! Welcome, neighbour. I sell provisions around here.', day: 'I run a small provisions stall. Mornings are busy, especially when students pass by.', localTip: 'Try the roadside kiosk when you need a quick drink or snack.' },
    { skin: '#8f573b', shirt: '#397c70', lower: '#49344d', hair: '#241d1a', style: 'wrap', role: 'resident', name: 'Mama Tola', age: 52, greeting: 'Ah, my dear! It is good to see a new face in the area.', day: 'I look after my home and check on the neighbours. We try to keep this street peaceful.', localTip: 'People around here know one another. A friendly greeting goes a long way.' },
    { skin: '#5c392b', shirt: '#e6dfcf', lower: '#344b70', hair: '#191614', style: 'short', role: 'worker', name: 'Tunde', age: 29, greeting: 'How far, my guy? Just taking a short break from work.', day: 'I do maintenance jobs around the neighbourhood. There is always something to fix.', localTip: 'Check the community job board if you want to earn some extra cash.' },
    { skin: '#a66b4d', shirt: '#b95d48', lower: '#343d50', hair: '#30221b', style: 'braids', role: 'student', name: 'Kemi', age: 21, greeting: 'Hi! You must be one of the new residents. Nice to meet you.', day: 'I am a student. I usually head out for classes and meet friends later in the day.', localTip: 'The main road is the easiest way to find your bearings around this part of town.' },
    { skin: '#794a36', shirt: '#668b50', lower: '#76543c', hair: '#211a17', style: 'cap', role: 'resident', name: 'Ayo', age: 26, greeting: 'Oga, welcome o! Hope you are settling in well.', day: 'I help people with errands and deliveries whenever I can find a job.', localTip: 'The job board has a starter delivery shift you can try.' },
    { skin: '#8c5b42', shirt: '#a84e68', lower: '#3d405b', hair: '#201916', style: 'braids', role: 'trader', name: 'Sade', age: 31, greeting: 'Ẹ káàbọ̀! You are welcome. Have you eaten today?', day: 'I help at a fashion and fabric stall. Market days can get really busy.', localTip: 'You can find beautiful fabrics and everyday clothes in the markets.' },
    { skin: '#67402f', shirt: '#4e789c', lower: '#343b43', hair: '#211a17', style: 'short', role: 'worker', name: 'Femi', age: 27, greeting: 'How far? The town is getting busier every week.', day: 'I work around the motor park and help passengers find their buses.', localTip: 'Ask around the main road when you need transport to another part of town.' },
    { skin: '#9a6246', shirt: '#b28a4e', lower: '#394b3e', hair: '#211a17', style: 'afro', role: 'worker', name: 'Kunle', age: 24, greeting: 'Good day! I hope the neighbourhood is treating you well.', day: 'I am learning a trade and spend most afternoons helping at the workshop.', localTip: 'Learning a practical skill can open doors. Keep showing up and practising.' },
    { skin: '#87543d', shirt: '#76558c', lower: '#394b66', hair: '#211a17', style: 'wrap', role: 'student', name: 'Zainab', age: 22, greeting: 'Hi neighbour! Have you visited the campus lately?', day: 'I study during the week and enjoy catching up with friends after lectures.', localTip: 'The campus is lively around class change times.' },
    { skin: '#704631', shirt: '#c16d42', lower: '#344b70', hair: '#211a17', style: 'cap', role: 'resident', name: 'Dele', age: 30, greeting: 'O boy! You should come and relax with us sometime.', day: 'I enjoy football and community gatherings. You will usually find me around the square.', localTip: 'The community square is a good place to meet people and unwind.' }
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

  // A small public square gives the neighbourhood a recognisable social meeting point.
  addBox(scene, 24, 0.025, 8, 18, 0.12, 13, '#c5ad83');
  addBox(scene, 24, 2.7, 8, 9, 0.18, 5, '#9b573d');
  for (const x of [20, 28]) for (const z of [6, 10]) addBox(scene, x, 0.12, z, 0.18, 2.55, 0.18, '#76513a');
  addBox(scene, 24, 0.16, 13.2, 6, 0.42, 0.45, '#76513a');
  addBox(scene, 24, 0.62, 13.2, 6, 0.12, 0.5, '#c28d56');
  addBox(scene, 24, 0.16, 3.4, 5.5, 0.42, 0.45, '#76513a');
  addBox(scene, 24, 0.62, 3.4, 5.5, 0.12, 0.5, '#c28d56');
  addBox(scene, 24, 0.12, 8, 1.1, 0.22, 1.1, '#d5a85f');
  addBox(scene, 24, 0.34, 8, 0.72, 0.22, 0.72, '#f0d6a2');

  // Original low-poly traffic vehicles travel along the main road in both directions.
  const trafficCars: Array<{ group: THREE.Group; speed: number; wheels: THREE.Mesh[] }> = [];
  const createTrafficCar = (x: number, z: number, color: string, speed: number) => {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.72, 1.35), makeMaterial(color));
    body.position.y = 0.72; body.castShadow = true; group.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.62, 1.12), makeMaterial('#b7d3d2', 0.35));
    cabin.position.set(-0.1, 1.36, 0); cabin.castShadow = true; group.add(cabin);
    const wheels: THREE.Mesh[] = [];
    for (const wx of [-0.78, 0.82]) for (const wz of [-0.72, 0.72]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.16, 12), makeMaterial('#242625'));
      wheel.rotation.x = Math.PI / 2; wheel.position.set(wx, 0.34, wz); group.add(wheel); wheels.push(wheel);
    }
    const lampMaterial = makeMaterial('#f5e4ad');
    for (const wz of [-0.42, 0.42]) {
      const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.16, 0.22), lampMaterial);
      lamp.position.set(1.27, 0.78, wz); group.add(lamp);
    }
    group.position.set(x, 0, z); scene.add(group);
    trafficCars.push({ group, speed, wheels });
  };
  createTrafficCar(-35, -8.1, '#d7b34e', 7.2);
  createTrafficCar(12, -11.8, '#477d9a', -6.1);
  createTrafficCar(39, -8.1, '#a9513f', 5.4);
  createTrafficCar(-8, -11.8, '#e0ded5', -7.0);

  // Lightweight rain particles are kept dormant until the player switches the weather.
  const rainPositions = new Float32Array(180 * 3);
  for (let i = 0; i < 180; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * 70;
    rainPositions[i * 3 + 1] = Math.random() * 22;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  const rainGeometry = new THREE.BufferGeometry();
  rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rain = new THREE.Points(rainGeometry, new THREE.PointsMaterial({ color: '#d9efff', size: 0.075, transparent: true, opacity: 0.72 }));
  rain.visible = false; scene.add(rain);

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
  addBox(scene, 0, 0, 2.8, 15, 3.4, 13, '#e8d7b6'); block(0, 2.8, 15.5, 13.5);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(9.2, 2.6, 4), makeMaterial('#a9573e'));
  roof.rotation.y = Math.PI / 4; roof.scale.z = 0.82; roof.position.set(0, 4.55, 2.8); roof.castShadow = true; scene.add(roof);
  addBox(scene, 0, 0, -1.05, 3.2, 0.18, 1.25, '#b78b62');
  addBox(scene, 0, 0.18, -1.45, 0.9, 1.8, 0.12, '#70472f');
  addBox(scene, -2.65, 1.35, -0.76, 1.25, 0.9, 0.12, '#8fc4d0');
  addBox(scene, 2.65, 1.35, -0.76, 1.25, 0.9, 0.12, '#8fc4d0');

  // Low compound wall with a wide, deliberate entrance.
  addBox(scene, -8.0, 0, 9.4, 6.2, 0.75, 0.12, '#d9c39b');
  addBox(scene, 8.0, 0, 9.4, 6.2, 0.75, 0.12, '#d9c39b');
  for (let x = -11; x <= 11; x += 1.5) {
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
  const treeSpots = [[-18,-3],[18,-3],[-40,-13],[-35,-8],[-13,-17],[14,-17],[39,-14],[-13,-37],[-18,12],[19,12],[-8,17],[9,17]] as number[][];
  for (const [x, z] of treeSpots) { addTree(scene, x, z); block(x, z, 1.8, 1.8); }

  // Three substantial, separate Ado-Ekiti market compounds with open walkways.
  // Each site has a clear entrance, multiple covered stall rows, counters, goods displays and traders.
  const marketSites = [
    { name: 'Oja Oba (Erekesan)', x: -40, z: -45, accent: '#a94f3c', sign: '#f0d5a0', type: 0 },
    { name: 'Oja Bisi', x: 10, z: -45, accent: '#397b70', sign: '#f3d48c', type: 1 },
    { name: 'Oja Irona', x: 40, z: -45, accent: '#9a713b', sign: '#f2d8ad', type: 2 }
  ];
  // Access roads connect the market district to the main Ado-Ekiti street.
  for (const roadX of [-47, 5, 40]) {
    addBox(scene, roadX, 0.012, -27, 4.8, 0.045, 34, '#555b59');
    addBox(scene, roadX, 0.045, -27, 0.11, 0.02, 34, '#e9d9a8');
  }
  addBox(scene,-43.5,0.012,-44,7.2,0.045,4.8,'#555b59');
  addBox(scene,7.5,0.012,-44,7.2,0.045,4.8,'#555b59');
  for(const marketX of [-40,10,40]) addBox(scene,marketX,0.012,-51,4.8,0.045,8,'#555b59');
  const market = (x:number,z:number,accent:string,sign:string,type:number) => {
    // A broad paved trading compound and a recognisable entrance frontage.
    addBox(scene,x,0.012,z,23,0.055,20,'#bcae91');
    addBox(scene,x-11.1,0.55,z,0.35,1.1,19,'#b68d64');
    addBox(scene,x+11.1,0.55,z,0.35,1.1,19,'#b68d64');
    addBox(scene,x,0.55,z+9.5,22,1.1,0.35,'#b68d64');
    // Main gate pillars and a large market name board.
    for (const gx of [x-4.8,x+4.8]) addBox(scene,gx,1.25,z-10,0.65,2.5,0.65,'#e0c69c');
    addBox(scene,x,3.15,z-10,10.5,0.75,0.45,accent);
    addBox(scene,x,3.18,z-9.73,9.5,0.12,0.08,sign);
    // Three long covered rows, each with four separately recognisable stalls.
    for (let row=0;row<2;row++) {
      const rowZ=z-4.5+row*9;
      addBox(scene,x,3.15,rowZ,19.2,0.22,3.8,accent);
      for (let col=0;col<4;col++) {
        const sx=x-7.2+col*4.8;
        addBox(scene,sx,1.15,rowZ,3.7,0.22,2.25,'#8a573b');
        block(sx,rowZ,3.8,2.35);
        addBox(scene,sx,1.65,rowZ-1.05,3.75,0.16,0.18,sign);
        addBox(scene,sx-1.72,2.05,rowZ-1.85,0.16,2.1,0.18,accent);
        addBox(scene,sx+1.72,2.05,rowZ-1.85,0.16,2.1,0.18,accent);
        // Small produce / merchandise display crates on the counter.
        const goods = type===0 ? ['#b65d42','#d49a38','#7c9c4b'] : type===1 ? ['#c16b8c','#3d7891','#d3a34f'] : ['#718b62','#a8794e','#9b9b9b'];
        for(let g=0;g<3;g++) addBox(scene,sx-0.9+g*0.9,1.52,rowZ-0.25,0.62,0.55,0.55,goods[g]);
      }
      // Vendor characters stand behind the counter at alternating stalls.
      for(let vendor=0;vendor<2;vendor++){
        const person=buildResident((type*2+row+vendor)%5);
        person.position.set(x-5.0+vendor*9.6,0,rowZ+0.65);
        person.rotation.y=Math.PI;
        scene.add(person);
      }
    }
    // Open central aisles remain wide enough for the player to walk and browse.
    for (let p=0;p<5;p++) {
      const postX=x-9.5+p*4.75;
      addBox(scene,postX,1.8,z-8.0,0.18,3.6,0.18,'#75523c');
      addBox(scene,postX,1.8,z+8.0,0.18,3.6,0.18,'#75523c');
    }
    addBox(scene,x,3.65,z-8.0,20,0.18,4.2,accent);
    addBox(scene,x,3.65,z+8.0,20,0.18,4.2,accent);
  };
  marketSites.forEach((site)=>market(site.x,site.z,site.accent,site.sign,site.type));
  // Campus compounds for UNAD and Ado Polytechnic.
  const campus=(x:number,z:number,wall:string)=>{addBox(scene,x,0,z,13,2.4,9,wall);addBox(scene,x,2.5,z,13.6,0.2,9.5,'#a9573e');block(x-3,z,4.3,5.8);block(x+3,z,4.3,5.8);addBox(scene,x,1.2,z-4.8,5.8,2.1,0.35,'#e9d9bd');addBox(scene,x,2.35,z-4.85,6,0.28,0.45,'#d6a85e');addBox(scene,x-3,0,z,4.3,3.1,5.8,'#d6d0bd');addBox(scene,x+3,0,z,4.3,3.1,5.8,'#c4c9bd');};
  campus(-34,-30,'#d5c49f'); campus(-13,-39,'#c9b99a');
  // Streetlights and simple roadside planting add scale without heavy assets.
  for (const [x,z] of [[-18,-10],[18,-10],[-25,-18],[-25,-37]] as number[][]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.1,4,6), makeMaterial('#46534a'));
    pole.position.set(x,2,z); scene.add(pole);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.65,0.12,0.28), makeMaterial('#e8d8a5'));
    lamp.position.set(x,4,z); scene.add(lamp); block(x,z,0.7,0.7);
  }
  return { kiosk: new THREE.Vector3(7.2, 0, -6.5), colliders, trafficCars, rain };
}
function App() {
  const hostRef = useRef<HTMLDivElement>(null);
  const joystickRef = useRef<HTMLDivElement>(null);
  const isInsideRef = useRef(false);
  const interiorRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const homeTargetsRef = useRef<THREE.Object3D[]>([]);
  const homeRaycasterRef = useRef(new THREE.Raycaster());
  const homePointerRef = useRef(new THREE.Vector2());
  const cameraMovedRef = useRef(false);
  const outdoorObjectsRef = useRef<THREE.Object3D[]>([]);
  const playerRef = useRef<THREE.Group | null>(null);
  const cameraDragRef = useRef({ pointerId: -1, x: 0, y: 0 });
  const cameraLookRef = useRef({ yaw: 0, pitch: 0.62 });
  const moveRef = useRef<Move>({ x: 0, z: 0 });
  const [joystickPosition, setJoystickPosition] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState<GameStatus>({ message: 'Welcome to your new home in Ado-Ekiti.', x: 0, z: 12, nearKiosk: false, nearHome: false, nearJob: false, nearMarket: -1, nearCampus: '' });
  const [shopOpen, setShopOpen] = useState(false);
  const [marketOpen, setMarketOpen] = useState(false);
  const [activeMarket, setActiveMarket] = useState(0);
  const [campusOpen, setCampusOpen] = useState(false);
  const [activeCampus, setActiveCampus] = useState('');
  const [enrolledCampus, setEnrolledCampus] = useState('');
  const [studyCredits, setStudyCredits] = useState(0);
  const [homeOpen, setHomeOpen] = useState(false);
  const [insideHome, setInsideHome] = useState(false);
  const [selectedHomeObject, setSelectedHomeObject] = useState<HomeObjectData | null>(null);
  const [homeSkills, setHomeSkills] = useState({ hustle: 0, charisma: 0 });
  const [mapOpen, setMapOpen] = useState(false);
  const [weather, setWeather] = useState<'sunny' | 'rainy'>('sunny');
  const weatherRef = useRef<'sunny' | 'rainy'>('sunny');
  useEffect(() => { weatherRef.current = weather; }, [weather]);
  const [autoTravel, setAutoTravel] = useState(false);
  const [homeActivity, setHomeActivity] = useState('');
  const autoDestinationRef = useRef<{x:number;z:number}|null>(null);
  const autoPathRef = useRef<Array<[number,number]>>([]);
  const autoPathIndexRef = useRef(0);
  const homeActivityRef = useRef('');
  const [nearbyResident, setNearbyResident] = useState<ResidentProfile | null>(null);
  const [talkingTo, setTalkingTo] = useState<ResidentProfile | null>(null);
  const talkingToRef = useRef<string | null>(null);
  useEffect(() => { talkingToRef.current = talkingTo?.name ?? null; }, [talkingTo]);
  const [dialogueLine, setDialogueLine] = useState('');
  const [jobOpen, setJobOpen] = useState(false);
  const [jobWorking, setJobWorking] = useState(false);
  const [workSeconds, setWorkSeconds] = useState(0);
  const [needs, setNeeds] = useState<Needs>({ hunger: 82, thirst: 78, energy: 90, fun: 84, social: 76, hygiene: 88, bladder: 92 });
  const [gameClock, setGameClock] = useState({ day: 1, hour: 8, minute: 0 });
  const needsRef = useRef(needs);
  useEffect(() => { needsRef.current = needs; }, [needs]);
  const moodScore = Math.round((needs.hunger + needs.thirst + needs.energy + needs.fun + needs.social + needs.hygiene + needs.bladder) / 7);
  const moodLabel = moodScore >= 82 ? 'Excellent' : moodScore >= 65 ? 'Good' : moodScore >= 45 ? 'Okay' : moodScore >= 25 ? 'Low' : 'Miserable';
  const [wallet, setWallet] = useState(12000);
  const [lifeHubOpen, setLifeHubOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState<'overview' | 'needs' | 'skills' | 'people' | 'career' | 'goals'>('overview');
  type PhoneTab = 'home' | 'messages' | 'contacts' | 'bank' | 'jobs' | 'gist';
  type PhoneMessage = { id: number; contact: string; from: string; text: string; day: number; time: string };
  type PhonePost = { id: number; author: string; handle: string; text: string; day: number; likes: number };
  const phoneContacts = ['Bisi', 'Mama Tola', 'Tunde', 'Kemi', 'Ayo', 'Sade', 'Femi', 'Kunle', 'Zainab', 'Dele'];
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [phoneTab, setPhoneTab] = useState<PhoneTab>('home');
  const [phoneContact, setPhoneContact] = useState('Bisi');
  const [phoneDraft, setPhoneDraft] = useState('');
  const [phoneMessages, setPhoneMessages] = useState<PhoneMessage[]>(() => {
    try { return JSON.parse(localStorage.getItem('ekiti-phone-messages-v1') || '[]') as PhoneMessage[]; } catch { return []; }
  });
  const [phoneBankAmount, setPhoneBankAmount] = useState('1000');
  const [phonePostDraft, setPhonePostDraft] = useState('');
  const [phonePosts, setPhonePosts] = useState<PhonePost[]>(() => {
    try {
      const saved = localStorage.getItem('ekiti-phone-posts-v1');
      return saved ? JSON.parse(saved) as PhonePost[] : [
        { id: 1, author: 'Bisi', handle: '@bisi_ere', text: 'Oja Oba is lively this morning. Fresh tomatoes and pepper just arrived! 🍅', day: 1, likes: 8 },
        { id: 2, author: 'Kemi', handle: '@kemik', text: 'Lecture done. Who is around the community square later? 📚', day: 1, likes: 12 },
        { id: 3, author: 'Dele', handle: '@dele_ado', text: 'Small steps every day. A better Ado-Ekiti starts with all of us. 💚', day: 1, likes: 6 }
      ];
    } catch { return []; }
  });
  const [phoneLikedPosts, setPhoneLikedPosts] = useState<number[]>([]);
  const [phoneNotice, setPhoneNotice] = useState('');
  useEffect(() => { try { localStorage.setItem('ekiti-phone-messages-v1', JSON.stringify(phoneMessages)); } catch { /* local save is optional */ } }, [phoneMessages]);
  useEffect(() => { try { localStorage.setItem('ekiti-phone-posts-v1', JSON.stringify(phonePosts)); } catch { /* local save is optional */ } }, [phonePosts]);
  const sendPhoneMessage = () => {
    const message = phoneDraft.trim();
    if (!message) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' });
    const replyMap: Record<string, string[]> = {
      Bisi: ['I hear you! I am around my provisions stall if you want to stop by. 😊', 'No wahala. Hope your day is going well!'],
      'Mama Tola': ['That is good, my dear. Remember to take care of yourself.', 'You are always welcome. Greet the neighbours for me. ❤️'],
      Tunde: ['How far! I will get back to you after this maintenance work.', 'No problem, boss. Let us link up around the neighbourhood.'],
      Kemi: ['Hey! I am just leaving campus. Talk soon! 📚', 'That sounds nice. I will let you know when I am free.'],
      Ayo: ['Oga, I dey! Let me know if you need help with an errand.', 'Sharp! We go talk soon.'],
      Sade: ['Thanks for checking in! The market is busy today.', 'You should come and see the new fabrics when you can.'],
      Femi: ['I am close to the motor park. What is happening?', 'Alright, my guy. Safe movement!'],
      Kunle: ['I am at the workshop learning something new. Keep pushing!', 'Thanks neighbour. One day at a time.'],
      Zainab: ['Hi! I have a little study group later. You can join us.', 'That is thoughtful of you. See you around!'],
      Dele: ['My guy! The square is the place to be later. ⚽', 'You already know! Stay active, stay happy.']
    };
    const reply = replyMap[phoneContact]?.[phoneMessages.filter(m => m.contact === phoneContact).length % 2] ?? 'Thanks for your message. Talk soon!';
    setPhoneMessages(items => [...items, { id: Date.now(), contact: phoneContact, from: 'You', text: message, day: gameClock.day, time }, { id: Date.now() + 1, contact: phoneContact, from: phoneContact, text: reply, day: gameClock.day, time }]);
    setPhoneDraft('');
    setRelationshipScores(scores => ({ ...scores, [phoneContact]: Math.min(100, (scores[phoneContact] || 0) + 2) }));
    setNeeds(n => ({ ...n, social: Math.min(100, n.social + 2) }));
    setPhoneNotice('Message sent. Your friendship grew a little.');
  };
  const createPhonePost = () => {
    const message = phonePostDraft.trim();
    if (!message) return;
    setPhonePosts(posts => [{ id: Date.now(), author: playerLook.name, handle: '@' + playerLook.name.toLowerCase().replace(/[^a-z0-9]/g, ''), text: message, day: gameClock.day, likes: 0 }, ...posts]);
    setPhonePostDraft('');
    setPhoneNotice('Your update is now on Gist!');
  };
  const handlePhoneBank = (kind: 'deposit' | 'withdraw') => {
    const amount = Math.floor(Number(phoneBankAmount));
    if (!Number.isFinite(amount) || amount <= 0) { setPhoneNotice('Enter a valid amount greater than zero.'); return; }
    if (kind === 'deposit' && amount > wallet) { setPhoneNotice('Your wallet does not have enough cash.'); return; }
    if (kind === 'withdraw' && amount > bankSavings) { setPhoneNotice('Your bank balance is not enough.'); return; }
    if (kind === 'deposit') depositMoney(amount); else withdrawMoney(amount);
    setPhoneNotice(kind === 'deposit' ? 'Deposit successful.' : 'Withdrawal successful.');
  };

  const [communityOpen, setCommunityOpen] = useState(false);
  type PlayerLook = { name: string; skin: string; shirt: string; trousers: string; shoes: string; hair: string; hairstyle: 'close' | 'afro' | 'braids' | 'fade' };
  const defaultLook: PlayerLook = { name: 'Dami', skin: '#8f573b', shirt: '#287f70', trousers: '#344b70', shoes: '#292b2b', hair: '#25201d', hairstyle: 'close' };
  const [playerLook, setPlayerLook] = useState<PlayerLook>(() => {
    try { const saved = localStorage.getItem('ekiti-player-look-v1'); return saved ? { ...defaultLook, ...JSON.parse(saved) } : defaultLook; }
    catch { return defaultLook; }
  });
  const [wardrobeOpen, setWardrobeOpen] = useState(false);
  const updatePlayerLook = (patch: Partial<PlayerLook>) => setPlayerLook((look) => ({ ...look, ...patch }));
  const [eventProgress, setEventProgress] = useState<Record<string, string[]>>({});
  const [communityReputation, setCommunityReputation] = useState(0);
  const [eventsAttended, setEventsAttended] = useState(0);
  const [selectedCareer, setSelectedCareer] = useState('Delivery professional');
  const [careerLevel, setCareerLevel] = useState(1);
  const [careerExperience, setCareerExperience] = useState(0);
  const [bankSavings, setBankSavings] = useState(0);
  const [relationshipScores, setRelationshipScores] = useState<Record<string, number>>({ Bisi: 0, 'Mama Tola': 0, Tunde: 0, Kemi: 0, Ayo: 0, Sade: 0, Femi: 0, Kunle: 0, Zainab: 0, Dele: 0 });
  const [propertyLevel, setPropertyLevel] = useState(0);
  const [vehicleOwned, setVehicleOwned] = useState(false);
  const [studentCourse, setStudentCourse] = useState('Business Administration');
  const [examPassed, setExamPassed] = useState(false);
  const [graduated, setGraduated] = useState(false);
  const careerOptions = [
    { name: 'Delivery professional', pay: 2500, icon: '🛵', detail: 'Local deliveries and errands' },
    { name: 'Shop assistant', pay: 3200, icon: '🛍️', detail: 'Customer service and retail' },
    { name: 'Office administrator', pay: 4200, icon: '💼', detail: 'Office and records support' },
    { name: 'Junior web designer', pay: 5500, icon: '💻', detail: 'Build websites for local businesses' }
  ];
  const jobPay = careerOptions.find((career) => career.name === selectedCareer)?.pay ?? 2500;

  const communityEventSchedule = [
    { id: 'hangout', title: 'Neighbourhood Hangout', emoji: '🎉', time: '4:00 PM – 9:00 PM', description: 'A relaxed evening at the community square. Catch up with neighbours, share stories and enjoy the music.', host: 'Dele and Mama Tola', activities: [
      { id: 'greet', label: 'Greet the neighbours', detail: 'Make the rounds and say hello to everyone.', emoji: '👋', friends: { Dele: 5, 'Mama Tola': 5, Bisi: 3 } },
      { id: 'football', label: 'Join the street football chat', detail: 'Talk football and laugh with the local crew.', emoji: '⚽', friends: { Dele: 7, Femi: 5, Tunde: 3 } },
      { id: 'music', label: 'Enjoy the music and dance', detail: 'Join the dancing and lift the atmosphere.', emoji: '💃', friends: { Kemi: 5, Zainab: 5, Sade: 3 } }
    ] },
    { id: 'birthday', title: 'Kemi’s Birthday Party', emoji: '🎂', time: '3:00 PM – 8:00 PM', description: 'Kemi is celebrating with friends and neighbours. There is food, music and plenty of birthday cheer.', host: 'Kemi and Zainab', activities: [
      { id: 'wish', label: 'Give Kemi birthday wishes', detail: 'Make her feel special on her big day.', emoji: '🎁', friends: { Kemi: 8, Zainab: 4 } },
      { id: 'food', label: 'Share party food', detail: 'Sit with the guests and enjoy the celebration.', emoji: '🍲', friends: { Kemi: 5, Bisi: 4, 'Mama Tola': 4 } },
      { id: 'dance', label: 'Join the birthday dance', detail: 'Celebrate with the music and dancing.', emoji: '🥁', friends: { Kemi: 6, Zainab: 5, Dele: 3 } }
    ] },
    { id: 'wedding', title: 'Neighbourhood Wedding', emoji: '💍', time: '12:00 PM – 8:00 PM', description: 'The community has come together for a joyful wedding reception with music, food and dancing.', host: 'Kunle and the families', activities: [
      { id: 'congratulate', label: 'Congratulate the couple', detail: 'Share warm wishes with the newlyweds and their families.', emoji: '💐', friends: { Kunle: 8, 'Mama Tola': 4, Sade: 3 } },
      { id: 'decorate', label: 'Help decorate the venue', detail: 'Lend a hand with the final preparations.', emoji: '🎊', friends: { Kunle: 5, Dele: 5, Femi: 3 } },
      { id: 'asoebi', label: 'Join the reception dancing', detail: 'Celebrate with the guests on the dance floor.', emoji: '🕺', friends: { Kunle: 6, Zainab: 5, Kemi: 4 } }
    ] },
    { id: 'festival', title: 'Ekiti Cultural Festival', emoji: '🪘', time: '10:00 AM – 9:00 PM', description: 'Celebrate local culture with traditional music, dance, food and stories from across Ekiti.', host: 'The Ado-Ekiti community', activities: [
      { id: 'culture-dance', label: 'Watch and join cultural dancing', detail: 'Enjoy the rhythm and join the circle when you are ready.', emoji: '🪘', friends: { Dele: 6, Zainab: 5, Kemi: 4 } },
      { id: 'culture-food', label: 'Taste local festival food', detail: 'Share a plate and discover local favourites.', emoji: '🍛', friends: { Bisi: 5, Sade: 5, 'Mama Tola': 4 } },
      { id: 'stories', label: 'Listen to community stories', detail: 'Hear neighbours share memories and local traditions.', emoji: '📖', friends: { 'Mama Tola': 7, Kunle: 4, Femi: 3 } }
    ] }
  ] as const;
  const currentCommunityEvent = communityEventSchedule[(gameClock.day - 1) % communityEventSchedule.length];
  const currentEventKey = gameClock.day + '-' + currentCommunityEvent.id;
  const completedEventActivities = eventProgress[currentEventKey] || [];
  const atCommunitySquare = Math.hypot(status.x - 24, status.z - 8) < 10;
  const joinCommunityActivity = (activity: (typeof currentCommunityEvent.activities)[number]) => {
    if (completedEventActivities.includes(activity.id) || !atCommunitySquare) return;
    setEventProgress((progress) => ({ ...progress, [currentEventKey]: [...(progress[currentEventKey] || []), activity.id] }));
    setNeeds((n) => ({ ...n, social: Math.min(100,n.social+14), fun: Math.min(100,n.fun+10), energy: Math.max(0,n.energy-2), bladder: Math.max(0,n.bladder-2) }));
    setCommunityReputation((score) => score + 5);
    setRelationshipScores((scores) => {
      const next = { ...scores };
      Object.entries(activity.friends).forEach(([person, points]) => { next[person] = Math.min(100, (next[person] || 0) + points); });
      return next;
    });
    if (completedEventActivities.length === 0) setEventsAttended((count) => count + 1);
    setStatus((value) => ({ ...value, message: 'You joined ' + activity.label.toLowerCase() + '. Your neighbours appreciate you showing up!' }));
  };
  useEffect(() => {
    if (!jobWorking) return;
    const timer = window.setInterval(() => setWorkSeconds((seconds) => {
      if (seconds <= 1) {
        window.clearInterval(timer);
        setJobWorking(false);
        setWallet((cash) => cash + jobPay);
        setCareerExperience((xp) => { const next = xp + 1; if (next % 3 === 0) setCareerLevel((level) => level + 1); return next; });
        setNeeds((n) => ({ ...n, energy: Math.max(0, n.energy - 14), hunger: Math.max(0, n.hunger - 8), thirst: Math.max(0, n.thirst - 10), fun: Math.max(0, n.fun - 5), social: Math.max(0, n.social - 3), hygiene: Math.max(0, n.hygiene - 4), bladder: Math.max(0, n.bladder - 5) }));
        setStatus((s) => ({ ...s, message: `Shift complete! You earned ₦${jobPay.toLocaleString('en-NG')}.` }));
        return 0;
      }
      return seconds - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [jobWorking]);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const shopItems = [{ id: 'water', name: 'Cold sachet water', detail: 'A quick refreshment', price: 100, emoji: '💧' }, { id: 'snack', name: 'Local snacks', detail: 'A small street-side bite', price: 350, emoji: '🥟' }, { id: 'softdrink', name: 'Soft drink', detail: 'Chilled bottle', price: 500, emoji: '🥤' }, { id: 'fruit', name: 'Fresh fruit', detail: 'Seasonal fruit portion', price: 250, emoji: '🍊' }];
  const marketNames = ['Oja Oba (Erekesan)', 'Oja Bisi', 'Oja Irona'];
  const marketProducts = [
    [{id:'market-rice',name:'Local rice (1 mudu)',detail:'Freshly measured staple food',price:1800,emoji:'🍚'},{id:'market-beans',name:'Beans (1 mudu)',detail:'Clean brown beans',price:1600,emoji:'🫘'},{id:'market-garri',name:'Ijebu garri',detail:'A market staple',price:900,emoji:'🥣'},{id:'market-tomato',name:'Fresh tomatoes',detail:'A small basket',price:1200,emoji:'🍅'},{id:'market-yam',name:'Yam tuber',detail:'Fresh farm produce',price:2500,emoji:'🍠'},{id:'market-pepper',name:'Fresh pepper',detail:'Ata rodo and tatashe',price:700,emoji:'🌶️'},{id:'market-palm-oil',name:'Palm oil bottle',detail:'Locally processed palm oil',price:1800,emoji:'🫙'},{id:'market-fish',name:'Smoked fish',detail:'Dried market fish',price:2200,emoji:'🐟'}],
    [{id:'market-shirt',name:'Everyday shirt',detail:'Ready-to-wear clothing',price:4500,emoji:'👕'},{id:'market-fabric',name:'Ankara fabric',detail:'Colourful printed fabric',price:8500,emoji:'🧵'},{id:'market-sandals',name:'Leather sandals',detail:'Locally made footwear',price:6000,emoji:'🩴'},{id:'market-cap',name:'Traditional cap',detail:'Aso-oke style cap',price:3200,emoji:'🧢'},{id:'market-wrapper',name:'Women wrapper',detail:'Printed fabric wrapper',price:7000,emoji:'🧣'},{id:'market-bag',name:'Market bag',detail:'Reusable shopping bag',price:1200,emoji:'👜'},{id:'market-shoes',name:'Casual shoes',detail:'Everyday footwear',price:9500,emoji:'👞'},{id:'market-beads',name:'Coral-style beads',detail:'Traditional accessories',price:3800,emoji:'📿'}],
    [{id:'market-soap',name:'Laundry soap',detail:'Household cleaning',price:850,emoji:'🧼'},{id:'market-bucket',name:'Plastic bucket',detail:'Useful home essential',price:2200,emoji:'🪣'},{id:'market-pan',name:'Cooking pot',detail:'Kitchen cookware',price:6500,emoji:'🍲'},{id:'market-broom',name:'Local broom',detail:'Handmade household broom',price:700,emoji:'🧹'},{id:'market-plate',name:'Plastic plates set',detail:'Everyday kitchenware',price:2800,emoji:'🍽️'},{id:'market-chair',name:'Plastic chair',detail:'Home and shop furniture',price:7500,emoji:'🪑'},{id:'market-lantern',name:'Rechargeable lantern',detail:'Useful during power cuts',price:12000,emoji:'🏮'},{id:'market-basket',name:'Woven basket',detail:'Handmade market basket',price:2400,emoji:'🧺'}]
  ];
  const depositMoney = (amount: number) => {
    if (wallet < amount) return;
    setWallet((cash) => cash - amount);
    setBankSavings((cash) => cash + amount);
    setStatus((v) => ({ ...v, message: `₦${amount.toLocaleString('en-NG')} deposited into your bank account.` }));
  };
  const withdrawMoney = (amount: number) => {
    if (bankSavings < amount) return;
    setBankSavings((cash) => cash - amount);
    setWallet((cash) => cash + amount);
    setStatus((v) => ({ ...v, message: `₦${amount.toLocaleString('en-NG')} withdrawn from your bank account.` }));
  };
  const buyPropertyUpgrade = () => {
    const cost = propertyLevel === 0 ? 35000 : 65000;
    if (propertyLevel >= 2 || wallet < cost) return;
    setWallet((cash) => cash - cost);
    setPropertyLevel((level) => level + 1);
    setStatus((v) => ({ ...v, message: propertyLevel === 0 ? 'You upgraded to a better rented home. Your new place is secured!' : 'You purchased your first home. Welcome to property ownership!' }));
  };
  const buyVehicle = () => {
    if (vehicleOwned || wallet < 80000) return;
    setWallet((cash) => cash - 80000);
    setVehicleOwned(true);
    setStatus((v) => ({ ...v, message: 'You bought a personal car. Your city trips are now faster!' }));
  };
  const takeTaxi = () => {
    if (wallet < 500 || !playerRef.current || insideHome) return;
    setWallet((cash) => cash - 500);
    const destinations = [{ name: 'Oja Oba', x: -40, z: -45 }, { name: 'UNAD', x: -34, z: -30 }, { name: 'Ado Poly', x: -13, z: -39 }, { name: 'Oja Bisi', x: 10, z: -45 }, { name: 'Oja Irona', x: 40, z: -45 }];
    const destination = destinations.reduce((best, point) => Math.hypot(status.x-point.x,status.z-point.z) < Math.hypot(status.x-best.x,status.z-best.z) ? point : best, destinations[0]);
    playerRef.current.position.set(destination.x, 0, destination.z + 5);
    autoDestinationRef.current = null; autoPathRef.current = []; setAutoTravel(false);
    setStatus((v) => ({ ...v, x: destination.x, z: destination.z + 5, message: `Taxi ride complete. You arrived near ${destination.name}.` }));
  };
  const buildRelationship = (person: string, amount: number) => {
    setRelationshipScores((scores) => ({ ...scores, [person]: Math.min(100, (scores[person] || 0) + amount) }));
    setNeeds((n) => ({ ...n, social: Math.min(100, n.social + 9), fun: Math.min(100, n.fun + 3) }));
    setStatus((v) => ({ ...v, message: `You spent quality time with ${person}. Your friendship and social wellbeing improved.` }));
  };
  const sitExam = () => {
    if (studyCredits < 5 || examPassed) return;
    setExamPassed(true);
    setStatus((v) => ({ ...v, message: `You passed your ${studentCourse} assessment at ${enrolledCampus}. Keep going towards graduation!` }));
  };
  const performHomeAction = (action: 'sleep' | 'shower' | 'cook' | 'sit' | 'dance' | 'movie') => {
    homeActivityRef.current=action; setHomeActivity(action);
    if(action==='sit'){
      setNeeds((n)=>({...n,fun:Math.min(100,n.fun+8),energy:Math.min(100,n.energy+3)}));
      setStatus((s)=>({...s,message:'You sat down to relax. Your mood and energy lifted.'}));
    }
    else if(action==='dance'){
      setNeeds((n)=>({...n,fun:Math.min(100,n.fun+22),energy:Math.max(0,n.energy-8),thirst:Math.max(0,n.thirst-4)}));
      setStatus((s)=>({...s,message:'Music is playing — dancing lifted your fun, but used some energy.'}));
    }
    else if(action==='movie'){
      setNeeds((n)=>({...n,fun:Math.min(100,n.fun+20),energy:Math.max(0,n.energy-2)}));
      setStatus((s)=>({...s,message:'Movie night! You feel more entertained and relaxed.'}));
    }
    else if (action === 'sleep') {
      setNeeds((n) => ({ ...n, energy: 100, hunger: Math.max(0, n.hunger - 12), thirst: Math.max(0, n.thirst - 12), fun: Math.min(100,n.fun+5), bladder: Math.max(0,n.bladder-12) }));
      setStatus((s) => ({ ...s, message: 'You had a good rest. Energy restored. Remember to use the bathroom after waking.' }));
    } else if (action === 'shower') {
      setNeeds((n) => ({ ...n, hygiene: 100, energy: Math.max(0, n.energy - 4), fun: Math.min(100,n.fun+3) }));
      setStatus((s) => ({ ...s, message: 'Fresh and clean. Hygiene restored!' }));
    } else {
      const ingredient = (inventory.snack || 0) > 0 ? 'snack' : (inventory.fruit || 0) > 0 ? 'fruit' : '';
      if (!ingredient) {
        setStatus((s) => ({ ...s, message: 'You need local snacks or fresh fruit from the kiosk to cook.' }));
        return;
      }
      setInventory((items) => ({ ...items, [ingredient]: Math.max(0, (items[ingredient] || 0) - 1) }));
      setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + 48), energy: Math.max(0, n.energy - 3), fun: Math.min(100,n.fun+4) }));
      setStatus((s) => ({ ...s, message: 'Meal ready! Your hunger has eased.' }));
    }
  };

  const performFurnitureAction = (action: HomeObjectAction) => {
    setSelectedHomeObject(null);
    if (action === 'read-hustle') { setHomeSkills((skills) => ({ ...skills, hustle: skills.hustle + 1 })); setNeeds((n) => ({ ...n, energy: Math.max(0, n.energy - 2) })); setStatus((s) => ({ ...s, message: 'You finished a business book. Hustle skill improved!' })); }
    else if (action === 'read-charisma') { setHomeSkills((skills) => ({ ...skills, charisma: skills.charisma + 1 })); setStatus((s) => ({ ...s, message: 'You enjoyed a good novel. Charisma skill improved!' })); }
    else if (action === 'use-toilet') { setNeeds((n) => ({ ...n, bladder: 100 })); setStatus((s) => ({ ...s, message: 'Bathroom break complete. Your bladder need is restored.' })); }
    else { performHomeAction(action); }
  };
  const selectHomeObjectAt = (clientX: number, clientY: number) => {
    if (!insideHome || !cameraRef.current || !hostRef.current) return;
    const canvas = hostRef.current.querySelector('canvas'); if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    homePointerRef.current.set(((clientX - bounds.left) / bounds.width) * 2 - 1, -((clientY - bounds.top) / bounds.height) * 2 + 1);
    homeRaycasterRef.current.setFromCamera(homePointerRef.current, cameraRef.current);
    const hit = homeRaycasterRef.current.intersectObjects(homeTargetsRef.current, false)[0];
    const data = hit?.object.userData.homeObject as HomeObjectData | undefined;
    if (data) { setSelectedHomeObject(data); setHomeOpen(false); setStatus((s) => ({ ...s, message: data.name + ' selected. Choose an activity.' })); }
  };
  const consumeItem = (id: 'water' | 'softdrink' | 'snack' | 'fruit') => {
    if ((inventory[id] || 0) < 1) return;
    setInventory((items) => ({ ...items, [id]: Math.max(0, (items[id] || 0) - 1) }));
    if (id === 'water') {
      setNeeds((n) => ({ ...n, thirst: Math.min(100, n.thirst + 42), fun: Math.min(100,n.fun+2) }));
      setStatus((s) => ({ ...s, message: 'You drank some water. Thirst refreshed!' }));
    } else if (id === 'softdrink') {
      setNeeds((n) => ({ ...n, thirst: Math.min(100, n.thirst + 30), hunger: Math.min(100, n.hunger + 5), fun: Math.min(100,n.fun+2) }));
      setStatus((s) => ({ ...s, message: 'You enjoyed a cold drink. Thirst eased!' }));
    } else {
      const isFruit = id === 'fruit';
      setNeeds((n) => ({ ...n, hunger: Math.min(100, n.hunger + (isFruit ? 24 : 30)), thirst: Math.min(100, n.thirst + (isFruit ? 8 : 0)), fun: Math.min(100,n.fun+3) }));
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
    cameraRef.current = camera;
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

    const { kiosk, colliders, trafficCars, rain } = buildWorld(scene);
  const interior = buildStarterInterior(scene);
  interiorRef.current = interior;
  homeTargetsRef.current = [];
  interior.traverse((object) => { if (object.userData.homeObject) homeTargetsRef.current.push(object); });
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
    const shoeMaterial = makeMaterial('#292b2b');
    const shoeLeft = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.13, 0.42), shoeMaterial);
    const shoeRight = shoeLeft.clone();
    shoeLeft.position.set(-0.17, 0.08, 0.08); shoeRight.position.set(0.17, 0.08, 0.08);
    player.add(shoeLeft, shoeRight);
    const styleGroup = new THREE.Group();
    const styleHairMaterial = makeMaterial('#25201d');
    const afro = new THREE.Mesh(new THREE.SphereGeometry(0.38, 12, 10), styleHairMaterial);
    afro.scale.set(1, 0.78, 1); afro.position.y = 2.08; styleGroup.add(afro);
    const fadeTop = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.42), styleHairMaterial);
    fadeTop.position.y = 2.06; styleGroup.add(fadeTop);
    const braids = new THREE.Group();
    const braidMaterial = styleHairMaterial;
    for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
      const braid = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.7, 8), braidMaterial);
      braid.position.set(side * (0.18 + i * 0.025), 1.78 - i * 0.045, -0.05 - i * 0.04);
      braid.rotation.z = side * -0.1; braids.add(braid);
    }
    styleGroup.add(braids); player.add(styleGroup); styleGroup.visible = false;
    player.userData.lookParts = { skin, shirt, trousers, shoeMaterial, hair: hair.material, styleHairMaterial, styleGroup, afro, fadeTop, braids };
    player.position.set(0, 0, 12);
    scene.add(player);
    playerRef.current = player;
    // Distinct stylized residents: original Nigerian street characters with varied faces, hair and outfits.
    const residentStarts: Array<[number, number]> = [
      [-8, 8.2], [-4, 10.4], [0, 8.2], [4, 10.4], [8, 8.2],
      [-15, -6], [15, -6], [-18, 4], [18, 4], [24, 12]
    ];
    const pedestrians = residentStarts.map(([x, z], index) => {
      const resident = buildResident(index);
      resident.position.set(x, 0, z);
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

    // Grid-based navigation lets residents route around buildings and trees.
    const findResidentPath = (startX: number, startZ: number, targetX: number, targetZ: number, blockedAt: (x: number, z: number) => boolean): Array<[number, number]> => {
      const step = 1.5, minX = -45, minZ = -48, maxI = 60, maxJ = 48;
      const cell = (x: number, z: number) => ({ i: THREE.MathUtils.clamp(Math.round((x - minX) / step), 0, maxI), j: THREE.MathUtils.clamp(Math.round((z - minZ) / step), 0, maxJ) });
      const point = (i: number, j: number): [number, number] => [minX + i * step, minZ + j * step];
      const start = cell(startX, startZ), startKey = start.i + ',' + start.j;
      const queue: Array<{ i: number; j: number }> = [start];
      const previous = new Map<string, string | null>([[startKey, null]]);
      const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      let found: string | null = null;
      for (let cursor = 0; cursor < queue.length; cursor++) {
        const current = queue[cursor], key = current.i + ',' + current.j;
        const [x, z] = point(current.i, current.j);
        if (Math.hypot(x - targetX, z - targetZ) <= step * 0.8) { found = key; break; }
        for (const [di, dj] of directions) {
          const i = current.i + di, j = current.j + dj;
          if (i < 0 || i > maxI || j < 0 || j > maxJ) continue;
          const nextKey = i + ',' + j;
          if (previous.has(nextKey)) continue;
          const [nx, nz] = point(i, j);
          if (blockedAt(nx, nz)) continue;
          previous.set(nextKey, key);
          queue.push({ i, j });
        }
      }
      if (!found) return [];
      const path: Array<[number, number]> = [];
      let cursor: string | null = found;
      while (cursor && cursor !== startKey) {
        const [i, j] = cursor.split(',').map(Number);
        path.push(point(i, j));
        cursor = previous.get(cursor) ?? null;
      }
      return path.reverse();
    };

    const animate = () => {
      if (!active) return;
      frame = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.04);
      const elapsed = clock.elapsedTime;
      trafficCars.forEach(({ group, speed, wheels }) => {
        group.position.x += speed * delta;
        if (group.position.x > 50) group.position.x = -50;
        if (group.position.x < -50) group.position.x = 50;
        wheels.forEach((wheel) => { wheel.rotation.z += speed * delta * 1.8; });
      });
      rain.visible = weatherRef.current === 'rainy';
      if (rain.visible) {
        const rainAttribute = rain.geometry.getAttribute('position') as THREE.BufferAttribute;
        const points = rainAttribute.array as Float32Array;
        for (let i = 0; i < points.length; i += 3) {
          points[i + 1] -= 19 * delta;
          points[i] -= 2.2 * delta;
          if (points[i + 1] < 0) {
            points[i] = player.position.x + (Math.random() - 0.5) * 70;
            points[i + 1] = 16 + Math.random() * 8;
            points[i + 2] = player.position.z + (Math.random() - 0.5) * 70;
          }
        }
        rainAttribute.needsUpdate = true;
      }
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
      if (scene.fog) scene.fog.color.copy(currentSky);
      pedestrians.forEach((resident) => {
        const { phase, leftLeg, rightLeg, leftArm, rightArm } = resident.userData as {
          phase: number; leftLeg: THREE.Group; rightLeg: THREE.Group;
          leftArm: THREE.Group; rightArm: THREE.Group;
        };
        const profile = resident.userData.profile as ResidentProfile;
        const playerDistance = Math.hypot(player.position.x - resident.position.x, player.position.z - resident.position.z);
        const profileTalking = talkingToRef.current === profile.name;
        const shouldPause = playerDistance < 2.7 || profileTalking;
        const facingPlayer = playerDistance < 2.7 || profileTalking;
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
        else if (profile.id === 4) destination = daytime ? deliveryStops[Math.floor(elapsed / 24) % deliveryStops.length] : [-9, 9.5];
        else if (profile.id === 5) destination = daytime ? [15, -9.4] : [-14, 5];
        else if (profile.id === 6) destination = daytime ? [24, -18] : [15, 5];
        else if (profile.id === 7) destination = daytime ? [-11, -3.2] : [-14, 5];
        else if (profile.id === 8) destination = daytime ? [-25, -18] : [15, 5];
        else destination = daytime ? [24, 8] : [15, 5];

        const navigation = resident.userData as typeof resident.userData & { navTarget?: string; navPath?: Array<[number, number]>; navIndex?: number };
        const targetKey = destination[0] + ',' + destination[1];
        if (navigation.navTarget !== targetKey) {
          navigation.navTarget = targetKey;
          navigation.navPath = findResidentPath(resident.position.x, resident.position.z, destination[0], destination[1], blockedAt);
          navigation.navIndex = 0;
        }
        if (facingPlayer) {
          resident.rotation.y = Math.atan2(player.position.x - resident.position.x, player.position.z - resident.position.z);
        } else {
          const path = navigation.navPath ?? [];
          let pathIndex = navigation.navIndex ?? 0;
          while (pathIndex < path.length && Math.hypot(path[pathIndex][0] - resident.position.x, path[pathIndex][1] - resident.position.z) < 0.65) pathIndex++;
          navigation.navIndex = pathIndex;
          const waypoint = path[pathIndex] ?? destination;
          const dx = waypoint[0] - resident.position.x, dz = waypoint[1] - resident.position.z;
          const distance = Math.hypot(dx, dz);
          if (distance > 0.18) {
            const movement = Math.min(distance, delta * (profile.id === 4 ? 2.25 : 1.8));
            resident.position.x += (dx / distance) * movement;
            resident.position.z += (dz / distance) * movement;
            resident.rotation.y = Math.atan2(dx, dz);
            gait = Math.sin(elapsed * 7 + phase * 12);
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
      const manualX = (keys.has('d') || keys.has('arrowright') ? 1 : 0) - (keys.has('a') || keys.has('arrowleft') ? 1 : 0) + moveRef.current.x;
      const manualZ = (keys.has('s') || keys.has('arrowdown') ? 1 : 0) - (keys.has('w') || keys.has('arrowup') ? 1 : 0) + moveRef.current.z;
      if(Math.abs(manualX)+Math.abs(manualZ)>0.08 && autoDestinationRef.current){autoDestinationRef.current=null;autoPathRef.current=[];setAutoTravel(false);}
      let localX=manualX,localZ=manualZ;
      if(autoDestinationRef.current&&!isInsideRef.current){const blocked=(x:number,z:number)=>colliders.some((o)=>Math.abs(x-o.x)<o.halfX+0.48&&Math.abs(z-o.z)<o.halfZ+0.48);if(!autoPathRef.current.length){autoPathRef.current=findResidentPath(player.position.x,player.position.z,autoDestinationRef.current.x,autoDestinationRef.current.z,blocked);autoPathIndexRef.current=0;}const path=autoPathRef.current;while(autoPathIndexRef.current<path.length&&Math.hypot(path[autoPathIndexRef.current][0]-player.position.x,path[autoPathIndexRef.current][1]-player.position.z)<0.7)autoPathIndexRef.current++;const waypoint=path[autoPathIndexRef.current];if(waypoint){localX=waypoint[0]-player.position.x;localZ=waypoint[1]-player.position.z;}else{autoDestinationRef.current=null;autoPathRef.current=[];setAutoTravel(false);setStatus((v)=>({...v,message:'You have arrived at your destination.'}));}}
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
        const mood = (currentNeeds.hunger + currentNeeds.thirst + currentNeeds.energy + currentNeeds.fun + currentNeeds.social + currentNeeds.hygiene + currentNeeds.bladder) / 7;
        const moodFactor = mood < 20 ? 0.78 : mood < 40 ? 0.9 : 1;
        const movementSpeed = (autoDestinationRef.current ? 4.3 : 5.2) * energyFactor * hungerFactor * thirstFactor * moodFactor;
        const stepX = direction.x * delta * movementSpeed;
        const stepZ = direction.z * delta * movementSpeed;
        const canStandAt = (x: number, z: number) => isInsideRef.current
          ? x >= -6.65 && x <= 6.65 && z >= -2.9 && z <= 8.35
          : x >= -45 && x <= 45 && z >= -48 && z <= 22 && !colliders.some((obstacle) => Math.abs(x - obstacle.x) < obstacle.halfX + 0.42 && Math.abs(z - obstacle.z) < obstacle.halfZ + 0.42);
        if (canStandAt(player.position.x + stepX, player.position.z)) player.position.x += stepX;
        if (canStandAt(player.position.x, player.position.z + stepZ)) player.position.z += stepZ;
        player.rotation.y = Math.atan2(direction.x, direction.z);
      }
      if(homeActivityRef.current==='dance'){player.position.y=0.08+Math.abs(Math.sin(elapsed*8))*0.16;player.rotation.z=Math.sin(elapsed*8)*0.12;}else if(homeActivityRef.current==='sit'||homeActivityRef.current==='movie'){player.position.y=-0.18;player.rotation.z=0;}else{player.position.y=0;player.rotation.z=0;}
      target.set(player.position.x, 1.2, player.position.z);
      const look = cameraLookRef.current;
      const orbitDistance = isInsideRef.current ? 8 : 10;
      const desiredCamera = isInsideRef.current
        ? new THREE.Vector3(player.position.x + Math.sin(look.yaw) * 7.2, player.position.y + 8.4, player.position.z + Math.cos(look.yaw) * 7.2)
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
        const marketPoints = [[-40,-45],[10,-45],[40,-45]] as const;
        const marketIndex = !isInsideRef.current ? marketPoints.findIndex(([x,z]) => Math.hypot(player.position.x-x,player.position.z-z)<14) : -1;
        const campusPoints = [{name:'UNAD',x:-34,z:-30},{name:'Ado Poly',x:-13,z:-39}];
        const campus = !isInsideRef.current ? campusPoints.find(({x,z})=>Math.hypot(player.position.x-x,player.position.z-z)<9)?.name ?? '' : '';
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
        setStatus((s) => ({ ...s, x: Math.round(player.position.x), z: Math.round(player.position.z), nearKiosk, nearHome, nearJob, nearMarket: marketIndex, nearCampus: campus }));
      }
      if (elapsed - lastNeedsTick >= 5) {
        lastNeedsTick = elapsed;
        setNeeds((n) => ({ ...n, hunger: Math.max(0, n.hunger - 0.18), thirst: Math.max(0, n.thirst - 0.24), energy: Math.max(0, n.energy - 0.12), fun: Math.max(0,n.fun-0.16), social: Math.max(0,n.social-0.08), hygiene: Math.max(0, n.hygiene - 0.10), bladder: Math.max(0,n.bladder-0.22) }));
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
      cameraRef.current = null;
      homeTargetsRef.current = [];
      outdoorObjectsRef.current = [];
    };
  }, []);


  useEffect(() => {
    try { localStorage.setItem('ekiti-player-look-v1', JSON.stringify(playerLook)); } catch { /* Storage may be unavailable. */ }
    const parts = playerRef.current?.userData.lookParts;
    if (!parts) return;
    (parts.skin as THREE.MeshStandardMaterial).color.set(playerLook.skin);
    (parts.shirt as THREE.MeshStandardMaterial).color.set(playerLook.shirt);
    (parts.trousers as THREE.MeshStandardMaterial).color.set(playerLook.trousers);
    (parts.shoeMaterial as THREE.MeshStandardMaterial).color.set(playerLook.shoes);
    (parts.hair as THREE.MeshStandardMaterial).color.set(playerLook.hair);
    (parts.styleHairMaterial as THREE.MeshStandardMaterial).color.set(playerLook.hair);
    const group = parts.styleGroup as THREE.Group;
    group.visible = playerLook.hairstyle !== 'close';
    (parts.afro as THREE.Mesh).visible = playerLook.hairstyle === 'afro';
    (parts.fadeTop as THREE.Mesh).visible = playerLook.hairstyle === 'fade';
    (parts.braids as THREE.Group).visible = playerLook.hairstyle === 'braids';
  }, [playerLook]);

  const startCameraLook = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    cameraDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    cameraMovedRef.current = false;
  };

  const moveCameraLook = (event: React.PointerEvent<HTMLDivElement>) => {
    if (cameraDragRef.current.pointerId !== event.pointerId || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const dx = event.clientX - cameraDragRef.current.x;
    const dy = event.clientY - cameraDragRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) cameraMovedRef.current = true;
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
        <div className="topbar-actions"><button className="wardrobe-toggle" onClick={() => setWardrobeOpen(true)}>👕 STYLE</button><button className="weather-toggle" onClick={() => setWeather(v => v === 'sunny' ? 'rainy' : 'sunny')}>{weather === 'sunny' ? '☀️ SUNNY' : '🌧️ RAINING'}</button><button className="community-toggle" onClick={() => setCommunityOpen(true)}>🎉 COMMUNITY</button><button className="life-hub-toggle" onClick={() => setLifeHubOpen(true)}>👤 LIFE HUB</button><button className="phone-toggle" onClick={() => { setPhoneTab("home"); setPhoneNotice(""); setPhoneOpen(true); }} aria-label="Open in-game smartphone">📱 PHONE</button><div className="day-chip"><span className="live-dot" /> ADO-EKITI <b>DAY {String(gameClock.day).padStart(2, '0')} · {String(gameClock.hour).padStart(2, '0')}:{String(gameClock.minute).padStart(2, '0')}</b></div></div>
      </header>
      <section className="game-stage">
        <div className="world" ref={hostRef} onClick={(event) => selectHomeObjectAt(event.clientX, event.clientY)} aria-label="3D Ekiti Lifestyle world" />
        <div className="location-tag"><span>⌖</span><div><b>YOUR NEIGHBOURHOOD</b><small>Ado-Ekiti, Ekiti State</small></div></div><button className="city-map-toggle" onClick={()=>setMapOpen(true)}>🗺️ CITY MAP</button>
        <button className="player-card player-card-button" onClick={() => {setProfileTab("overview");setProfileOpen(true);}} aria-label="Open character profile"><div className="player-avatar">👤</div><div><b>{playerLook.name}</b><small>{moodLabel} · View profile</small></div><span className="cash">₦{wallet.toLocaleString("en-NG")}</span></button>
        <div className="world-tip">{status.message}</div>
        <div className="needs-panel" aria-label="Player needs">{([['HUNGER', needs.hunger, '🍲'], ['THIRST', needs.thirst, '💧'], ['ENERGY', needs.energy, '⚡'], ['FUN', needs.fun, '🎮'], ['SOCIAL', needs.social, '🤝'], ['HYGIENE', needs.hygiene, '🧼'], ['BLADDER', needs.bladder, '🚻']] as const).map(([label, value, emoji]) => <div className="need-row" key={label}><span>{emoji} {label}</span><div className="need-track"><i className={value < 25 ? 'need-critical' : value < 45 ? 'need-low' : ''} style={{ width: `${value}%` }} /></div><b>{Math.round(value)}%</b></div>)}<div className={`mood-status mood-${moodLabel.toLowerCase()}`}><span>MOOD</span><b>{moodLabel}</b><strong>{moodScore}%</strong></div></div>
        {status.nearKiosk && !shopOpen && <button className="interact-prompt" onClick={() => setShopOpen(true)}>🛍️ OPEN KIOSK <span>Tap to shop</span></button>}
        {status.nearMarket >= 0 && !marketOpen && <button className="market-interact-prompt" onClick={()=>{setActiveMarket(status.nearMarket);setMarketOpen(true);}}>🏪 ENTER {marketNames[status.nearMarket].toUpperCase()} <span>Browse stalls · Buy goods</span></button>}
        {status.nearCampus && !campusOpen && <button className="campus-interact-prompt" onClick={()=>{setActiveCampus(status.nearCampus);setCampusOpen(true);}}>🎓 EXPLORE {status.nearCampus.toUpperCase()} <span>Enrol · Attend a class</span></button>}
        {nearbyResident && !talkingTo && !shopOpen && !homeOpen && !jobOpen && <button className="resident-interact-prompt" onClick={() => { setTalkingTo(nearbyResident); setDialogueLine(nearbyResident.greeting); }}>💬 TALK TO {nearbyResident.name.toUpperCase()} <span>{nearbyResident.role} · Tap to greet</span></button>}
        {status.nearJob && !jobOpen && !jobWorking && <button className="job-interact-prompt" onClick={() => setJobOpen(true)}>💼 JOB BOARD <span>Tap to find work</span></button>}
        {status.nearHome && !homeOpen && !insideHome && <button className="home-interact-prompt" onClick={() => { isInsideRef.current = true; playerRef.current?.position.set(0, 0, 2.8); homeActivityRef.current=''; setHomeActivity(''); outdoorObjectsRef.current.forEach((object) => { object.visible = false; }); if (interiorRef.current) interiorRef.current.visible = true; setInsideHome(true); setHomeOpen(false); setStatus((s) => ({ ...s, message: 'Welcome inside. Explore your home and make yourself comfortable.' })); }}>🏠 ENTER YOUR HOME <span>Tap to go inside</span></button>}
        {insideHome && <><div className="interior-label">YOUR HOME · INSIDE</div><button className="interior-exit" onClick={() => { isInsideRef.current = false; if (interiorRef.current) interiorRef.current.visible = false; outdoorObjectsRef.current.forEach((object) => { object.visible = true; }); playerRef.current?.position.set(0, 0, -1.7); homeActivityRef.current=''; setHomeActivity(''); setInsideHome(false); setHomeOpen(false); setStatus((s) => ({ ...s, message: 'You stepped outside into your neighbourhood.' })); }}>EXIT HOME ↗</button>{status.nearHome && !homeOpen && <button className="home-interact-prompt" onClick={() => setHomeOpen(true)}>🏡 HOME ACTIONS <span>Sleep · shower · prepare food</span></button>}</>}
        {wardrobeOpen && <div className="shop-backdrop" role="presentation"><section className="wardrobe-panel" role="dialog" aria-modal="true" aria-label="Character wardrobe">
          <div className="shop-heading"><div><small>EKITI LIFESTYLE · YOUR IDENTITY</small><h2>Character Studio</h2><p>Make your resident look and feel like you.</p></div><button className="shop-close" onClick={() => setWardrobeOpen(false)} aria-label="Close character studio">×</button></div>
          <label className="wardrobe-name">YOUR NAME<input maxLength={18} value={playerLook.name} onChange={(e) => updatePlayerLook({ name: e.target.value })} placeholder="Enter character name" /></label>
          <div className="wardrobe-section"><b>SKIN TONE</b><div className="wardrobe-swatches">{['#5c392b','#70432f','#8f573b','#a66b4d','#bd8767','#d49b78'].map((color) => <button key={color} aria-label={`Skin tone ${color}`} className={playerLook.skin===color?'chosen':''} style={{background:color}} onClick={() => updatePlayerLook({skin:color})}/>)}</div></div>
          <div className="wardrobe-section"><b>HAIRSTYLE</b><div className="wardrobe-options">{([{id:'close',label:'Low cut',emoji:'💈'},{id:'fade',label:'Fade',emoji:'✂️'},{id:'afro',label:'Afro',emoji:'🌀'},{id:'braids',label:'Braids',emoji:'🪮'}] as const).map((style) => <button key={style.id} className={playerLook.hairstyle===style.id?'chosen':''} onClick={() => updatePlayerLook({hairstyle:style.id})}><span>{style.emoji}</span>{style.label}</button>)}</div></div>
          {([{key:'hair',label:'HAIR COLOUR',colors:['#171412','#35251d','#5b3825','#8b5a35']},{key:'shirt',label:'TOP / SHIRT',colors:['#287f70','#b95d48','#477d9a','#76558c','#d5a45f','#f0e6d2']},{key:'trousers',label:'TROUSERS',colors:['#263b50','#344b70','#49344d','#394b3e','#292b2b']},{key:'shoes',label:'SHOES',colors:['#292b2b','#6a4936','#f0e6d2','#a84e38']}] as const).map((item) => <div className="wardrobe-section" key={item.key}><b>{item.label}</b><div className="wardrobe-swatches">{item.colors.map((color) => <button key={color} aria-label={`${item.label} ${color}`} className={playerLook[item.key]===color?'chosen':''} style={{background:color}} onClick={() => updatePlayerLook({[item.key]:color})}/>)}</div></div>)}
          <div className="wardrobe-footer"><span>✓ Changes save automatically on this device</span><button onClick={() => {setPlayerLook(defaultLook);setStatus(v=>({...v,message:'Your original character appearance has been restored.'}));}}>RESET LOOK</button><button className="wardrobe-done" onClick={() => {setWardrobeOpen(false);setStatus(v=>({...v,message:`Looking good, ${playerLook.name || 'neighbour'}! Your new style is ready.`}));}}>SAVE & RETURN</button></div>
        </section></div>}
        {communityOpen && <div className="shop-backdrop" role="presentation"><section className="community-panel" role="dialog" aria-modal="true" aria-label="Community events"><div className="shop-heading"><div><small>ADO-EKITI · COMMUNITY LIFE</small><h2>Community Events</h2><p>Meet your neighbours and become part of the town.</p></div><button className="shop-close" onClick={() => setCommunityOpen(false)} aria-label="Close community events">×</button></div><div className="community-score"><div><small>COMMUNITY SPIRIT</small><strong>{communityReputation}</strong></div><div><small>EVENTS JOINED</small><strong>{eventsAttended}</strong></div><div><small>TODAY</small><strong>DAY {gameClock.day}</strong></div></div><article className="community-event-card"><div className="community-event-art"><span>{currentCommunityEvent.emoji}</span><small>UP NEXT IN YOUR NEIGHBOURHOOD</small></div><div className="community-event-copy"><span className="community-event-time">📍 COMMUNITY SQUARE · {currentCommunityEvent.time}</span><h3>{currentCommunityEvent.title}</h3><p>{currentCommunityEvent.description}</p><small>Hosted by {currentCommunityEvent.host}</small></div></article>{atCommunitySquare ? <div className="community-arrival"><span>✓ YOU ARE AT THE COMMUNITY SQUARE</span><small>Choose an activity and join in. Each activity can be completed once today.</small></div> : <div className="community-arrival community-not-here"><span>📍 HEAD TO THE COMMUNITY SQUARE</span><small>You need to be at the square to take part in today’s event.</small><button className="community-route" onClick={() => { autoDestinationRef.current={x:24,z:8}; autoPathRef.current=[]; autoPathIndexRef.current=0; setAutoTravel(true); setCommunityOpen(false); }}>WALK TO COMMUNITY SQUARE</button></div>}<div className="community-activities"><h3>Today’s activities</h3>{currentCommunityEvent.activities.map((activity) => <article className="community-activity" key={activity.id}><span className="community-activity-icon">{activity.emoji}</span><div><b>{activity.label}</b><small>{activity.detail}</small></div><button disabled={!atCommunitySquare || completedEventActivities.includes(activity.id)} onClick={() => joinCommunityActivity(activity)}>{completedEventActivities.includes(activity.id) ? 'DONE ✓' : 'JOIN'}</button></article>)}</div><p className="community-footnote">Events rotate with the in-game day. Activities build friendships and community spirit. Progress is saved for this play session.</p></section></div>}{mapOpen && <div className="shop-backdrop" role="presentation"><section className="city-map-panel" role="dialog" aria-modal="true" aria-label="Ado-Ekiti city map"><div className="shop-heading"><div><small>EKITI LIFESTYLE · CITY NAVIGATION</small><h2>Ado-Ekiti Map</h2><p>Tap the map or a destination to walk there automatically.</p></div><button className="shop-close" onClick={()=>setMapOpen(false)}>×</button></div><div className="city-map-canvas" onClick={(e)=>{const r=e.currentTarget.getBoundingClientRect();autoDestinationRef.current={x:-45+(e.clientX-r.left)/r.width*90,z:22-(e.clientY-r.top)/r.height*70};autoPathRef.current=[];autoPathIndexRef.current=0;setAutoTravel(true);setMapOpen(false);setStatus((v)=>({...v,message:'Destination selected. Walking there automatically.'}));}}><span className="map-label map-markets">OJA OBA · OJA BISI · OJA IRONA</span><span className="map-label map-unad">UNAD</span><span className="map-label map-poly">ADO POLY</span><span className="map-you" style={{left:(((status.x+45)/90)*100)+'%',top:(((22-status.z)/70)*100)+'%'}}>YOU</span></div><div className="map-shortcuts"><button onClick={()=>{autoDestinationRef.current={x:-40,z:-45};autoPathRef.current=[];setAutoTravel(true);setMapOpen(false);}}>🛍️ Oja Oba (Erekesan)</button><button onClick={()=>{autoDestinationRef.current={x:10,z:-45};autoPathRef.current=[];setAutoTravel(true);setMapOpen(false);}}>🛍️ Oja Bisi</button><button onClick={()=>{autoDestinationRef.current={x:40,z:-45};autoPathRef.current=[];setAutoTravel(true);setMapOpen(false);}}>🛍️ Oja Irona</button><button onClick={()=>{autoDestinationRef.current={x:-34,z:-30};autoPathRef.current=[];setAutoTravel(true);setMapOpen(false);}}>🎓 UNAD</button><button onClick={()=>{autoDestinationRef.current={x:-13,z:-39};autoPathRef.current=[];setAutoTravel(true);setMapOpen(false);}}>🎓 Ado Poly</button><button onClick={()=>{autoDestinationRef.current={x:24,z:8};autoPathRef.current=[];autoPathIndexRef.current=0;setAutoTravel(true);setMapOpen(false);}}>🎉 Community Square</button></div><button className="start-shift" onClick={()=>{autoDestinationRef.current=null;autoPathRef.current=[];setAutoTravel(false);setMapOpen(false);}}>CLOSE MAP / CANCEL ROUTE</button></section></div>}{autoTravel&&<div className="auto-travel-banner">🚶 WALKING TO DESTINATION · JOYSTICK CANCELS</div>}{talkingTo && <div className="shop-backdrop" role="presentation"><section className="resident-panel" role="dialog" aria-modal="true" aria-label={`Conversation with ${talkingTo.name}`}><div className="shop-heading"><div><small>ADO-EKITI · NEIGHBOURHOOD</small><h2>{talkingTo.name}</h2><p>{talkingTo.age} years old · {talkingTo.role}</p></div><button className="shop-close" onClick={() => setTalkingTo(null)} aria-label="End conversation">×</button></div><div className="resident-social-status"><span>🤝 FRIENDSHIP</span><strong>{relationshipScores[talkingTo.name] || 0}%</strong><small>{(relationshipScores[talkingTo.name] || 0) >= 75 ? 'Close friend' : (relationshipScores[talkingTo.name] || 0) >= 35 ? 'Good friend' : (relationshipScores[talkingTo.name] || 0) >= 10 ? 'Getting familiar' : 'New acquaintance'}</small></div><div className="resident-dialogue"><span>💬</span><p>{dialogueLine}</p></div><div className="resident-topics"><button onClick={() => { setDialogueLine(talkingTo.day); buildRelationship(talkingTo.name, 5); }}>💼 Ask about their day · +5 friendship</button><button onClick={() => { setDialogueLine(talkingTo.localTip); buildRelationship(talkingTo.name, 5); }}>📍 Ask for a local tip · +5 friendship</button><button onClick={() => { setDialogueLine(`That sounds lovely. ${talkingTo.name} smiles and tells you more about life in Ado-Ekiti.`); buildRelationship(talkingTo.name, 8); }}>😊 Share a friendly moment · +8 friendship</button><button onClick={() => { setDialogueLine(`${talkingTo.name} likes the idea of meeting at the community square. Maybe you will see each other there!`); buildRelationship(talkingTo.name, 10); }}>🏡 Invite them to the community square · +10 friendship</button></div><button className="start-shift resident-goodbye" onClick={() => { setTalkingTo(null); setStatus((s) => ({ ...s, message: `You said goodbye to ${talkingTo.name}. Your friendship is now ${relationshipScores[talkingTo.name] || 0}%.` })); }}>NICE TALKING TO YOU</button></section></div>}{jobOpen && <div className="shop-backdrop" role="presentation"><section className="job-panel" role="dialog" aria-modal="true" aria-label="Local job centre"><div className="shop-heading"><div><small>ADO-EKITI · COMMUNITY JOB BOARD</small><h2>Find a day's work</h2><p>Take a short neighbourhood delivery shift.</p></div><button className="shop-close" onClick={() => setJobOpen(false)} aria-label="Close jobs">×</button></div><div className="job-offer"><span>💼</span><div><b>{selectedCareer}</b><small>Complete a neighbourhood work shift and build experience</small><strong>₦{jobPay.toLocaleString('en-NG')} per shift</strong></div></div><div className="job-requirements"><b>SHIFT DETAILS</b><span>Duration: 30 seconds per shift</span><span>Energy and hydration are used while working</span><span>Payment arrives when the shift is completed</span></div><button className="start-shift" onClick={() => { setJobOpen(false); setWorkSeconds(30); setJobWorking(true); setStatus((s) => ({ ...s, message: 'You started a delivery shift. Keep going!' })); }}>START SHIFT · EARN ₦{jobPay.toLocaleString('en-NG')}</button></section></div>}
        {jobWorking && <div className="working-banner"><span>💼 ON {selectedCareer.toUpperCase()} SHIFT</span><b>{workSeconds}s remaining</b><small>Keep exploring — your shift is underway.</small></div>}
        {phoneOpen && <div className="shop-backdrop phone-backdrop" role="presentation"><section className="phone-device" role="dialog" aria-modal="true" aria-label="In-game smartphone">
          <div className="phone-statusbar"><span>● EKITI MOBILE</span><span>DAY {gameClock.day} · {String(gameClock.hour).padStart(2,'0')}:{String(gameClock.minute).padStart(2,'0')}　▮▮▮</span></div>
          <div className="phone-titlebar"><div><small>YOUR SMARTPHONE</small><h2>{phoneTab==='home'?'Good day, '+playerLook.name:({messages:'Messages',contacts:'Contacts',bank:'Ekiti Bank',jobs:'Work & Jobs',gist:'Gist · Social'} as Record<string,string>)[phoneTab]}</h2></div><button className="shop-close" onClick={() => setPhoneOpen(false)} aria-label="Close smartphone">×</button></div>
          {phoneNotice && <div className="phone-notice">{phoneNotice}<button onClick={() => setPhoneNotice('')}>×</button></div>}
          {phoneTab==='home' && <div className="phone-home">
            <div className="phone-welcome"><span>📱</span><div><b>Your life, connected.</b><small>Keep in touch, manage money and follow what's happening in Ado-Ekiti.</small></div></div>
            <div className="phone-balance-row"><div><small>WALLET</small><b>₦{wallet.toLocaleString('en-NG')}</b></div><div><small>EKITI BANK</small><b>₦{bankSavings.toLocaleString('en-NG')}</b></div></div>
            <div className="phone-app-grid">
              {([{id:'messages',icon:'💬',label:'Messages',desc:'Chat with neighbours'},{id:'contacts',icon:'👥',label:'Contacts',desc:'People you know'},{id:'bank',icon:'🏦',label:'Bank',desc:'Deposit & withdraw'},{id:'jobs',icon:'💼',label:'Jobs',desc:'Choose your career'},{id:'gist',icon:'📣',label:'Gist',desc:'Town social feed'}] as const).map(app=><button key={app.id} onClick={() => setPhoneTab(app.id)}><span>{app.icon}</span><b>{app.label}</b><small>{app.desc}</small></button>)}
            </div>
            <div className="phone-footnote">All phone services are part of the Ekiti Lifestyle game simulation. No real calls, payments or internet services are made.</div>
          </div>}
          {phoneTab==='messages' && <div className="phone-body">
            <div className="phone-contact-strip">{phoneContacts.map(name=><button key={name} className={phoneContact===name?'selected':''} onClick={() => setPhoneContact(name)}>{name.slice(0,1)}<small>{name}</small></button>)}</div>
            <div className="phone-chat-heading"><b>Chat with {phoneContact}</b><small>Local resident · Ado-Ekiti</small></div>
            <div className="phone-chat-list">{phoneMessages.filter(m=>m.contact===phoneContact).length===0?<div className="phone-empty">No messages yet. Say hello to {phoneContact}.</div>:phoneMessages.filter(m=>m.contact===phoneContact).map(m=><div key={m.id} className={'phone-bubble '+(m.from==='You'?'sent':'received')}><small>{m.from} · Day {m.day} · {m.time}</small><p>{m.text}</p></div>)}</div>
            <div className="phone-compose"><input value={phoneDraft} onChange={e=>setPhoneDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')sendPhoneMessage();}} placeholder={'Message '+phoneContact+'...'} maxLength={240}/><button onClick={sendPhoneMessage} disabled={!phoneDraft.trim()}>SEND</button></div>
          </div>}
          {phoneTab==='contacts' && <div className="phone-body"><p className="phone-intro">Your saved neighbours and friends. Open a contact to view your connection and send a message.</p><div className="phone-contacts-list">{phoneContacts.map(name=><button key={name} onClick={()=>{setPhoneContact(name);setPhoneTab('messages');}}><span className="phone-contact-avatar">{name.slice(0,1)}</span><span><b>{name}</b><small>{name==='Bisi'?'Provisions trader':name==='Mama Tola'?'Neighbour':name==='Kemi'||name==='Zainab'?'Student':name==='Sade'?'Fashion trader':name==='Femi'?'Motor park worker':name==='Tunde'||name==='Kunle'?'Local worker':name==='Ayo'?'Errand runner':'Community regular'}</small></span><strong>{relationshipScores[name]||0}%</strong><i>›</i></button>)}</div></div>}
          {phoneTab==='bank' && <div className="phone-body"><div className="phone-bank-card"><small>EKITI BANK · SIMULATED ACCOUNT</small><span>Available savings</span><strong>₦{bankSavings.toLocaleString('en-NG')}</strong><div>Account holder: {playerLook.name}</div><small>Game wallet: ₦{wallet.toLocaleString('en-NG')}</small></div><label className="phone-field">AMOUNT (₦)<input type="number" min="1" step="1" value={phoneBankAmount} onChange={e=>setPhoneBankAmount(e.target.value)} /></label><div className="phone-bank-actions"><button onClick={()=>handlePhoneBank('deposit')}>＋ DEPOSIT CASH</button><button onClick={()=>handlePhoneBank('withdraw')}>↗ WITHDRAW</button></div><p className="phone-footnote">Transfers update your in-game wallet and savings immediately. This is fictional game money, not a real bank account.</p></div>}
          {phoneTab==='jobs' && <div className="phone-body"><div className="phone-job-status"><small>CURRENT CAREER</small><b>{selectedCareer}</b><span>Level {careerLevel} · {careerExperience} experience</span></div><p className="phone-intro">Choose a local career path. A shift lasts 30 seconds and pays when completed.</p><div className="phone-job-list">{careerOptions.map(job=><button key={job.name} className={selectedCareer===job.name?'selected':''} onClick={()=>setSelectedCareer(job.name)}><span>{job.icon}</span><div><b>{job.name}</b><small>{job.detail}</small></div><strong>₦{job.pay.toLocaleString('en-NG')}</strong></button>)}</div><button className="phone-primary-action" disabled={jobWorking} onClick={()=>{setPhoneOpen(false);setWorkSeconds(30);setJobWorking(true);setStatus(v=>({...v,message:'You started a '+selectedCareer+' shift from your phone. Keep going!'}));}}> {jobWorking?'SHIFT IN PROGRESS':'START '+selectedCareer.toUpperCase()+' SHIFT'}</button></div>}
          {phoneTab==='gist' && <div className="phone-body"><div className="phone-gist-compose"><textarea value={phonePostDraft} onChange={e=>setPhonePostDraft(e.target.value)} placeholder="What's happening in Ado-Ekiti?" maxLength={240}/><button onClick={createPhonePost} disabled={!phonePostDraft.trim()}>POST UPDATE</button></div><div className="phone-feed">{phonePosts.map(post=><article key={post.id}><div className="phone-post-author"><span>{post.author.slice(0,1)}</span><div><b>{post.author}</b><small>{post.handle} · Day {post.day}</small></div></div><p>{post.text}</p><button className={phoneLikedPosts.includes(post.id)?'liked':''} onClick={()=>{if(!phoneLikedPosts.includes(post.id)){setPhoneLikedPosts(ids=>[...ids,post.id]);setPhonePosts(posts=>posts.map(item=>item.id===post.id?{...item,likes:item.likes+1}:item));}}}>♥ {post.likes} {phoneLikedPosts.includes(post.id)?'Liked':'Like'}</button></article>)}</div><p className="phone-footnote">Gist is a fictional in-game community feed. Posts stay in this browser on this device.</p></div>}
          <nav className="phone-nav" aria-label="Smartphone apps">{([{id:'home',icon:'⌂',label:'Home'},{id:'messages',icon:'✉',label:'Chats'},{id:'contacts',icon:'♙',label:'People'},{id:'bank',icon:'₦',label:'Bank'},{id:'gist',icon:'◎',label:'Gist'}] as const).map(tab=><button key={tab.id} className={phoneTab===tab.id?'active':''} onClick={()=>{setPhoneTab(tab.id);setPhoneNotice('');}}><span>{tab.icon}</span>{tab.label}</button>)}</nav>
        </section></div>}
        {profileOpen && <div className="shop-backdrop profile-backdrop" role="presentation"><section className="profile-panel" role="dialog" aria-modal="true" aria-label="Character profile">
          <div className="shop-heading"><div><small>EKITI LIFESTYLE · CHARACTER PROFILE</small><h2>{playerLook.name}'s Profile</h2><p>Your needs, progress, relationships and next goals.</p></div><button className="shop-close" onClick={() => setProfileOpen(false)} aria-label="Close profile">×</button></div>
          <div className="profile-hero"><div className="profile-avatar">👤</div><div><b>{playerLook.name}</b><span>{moodLabel} mood · Day {gameClock.day}</span><small>Ado-Ekiti resident</small></div><strong>{moodScore}%<small>MOOD</small></strong></div>
          <nav className="profile-tabs" aria-label="Character profile tabs">{([{id:'overview',label:'Overview',icon:'✨'},{id:'needs',label:'Needs',icon:'💚'},{id:'skills',label:'Skills',icon:'📈'},{id:'people',label:'People',icon:'🤝'},{id:'career',label:'Career',icon:'💼'},{id:'goals',label:'Goals',icon:'🎯'}] as const).map(tab=><button key={tab.id} className={profileTab===tab.id?'active':''} onClick={()=>setProfileTab(tab.id)}><span>{tab.icon}</span>{tab.label}</button>)}</nav>
          {profileTab==='overview' && <div className="profile-content"><div className="profile-stat-grid"><div><small>WALLET</small><b>₦{wallet.toLocaleString('en-NG')}</b></div><div><small>BANK SAVINGS</small><b>₦{bankSavings.toLocaleString('en-NG')}</b></div><div><small>CAREER LEVEL</small><b>{careerLevel}</b></div><div><small>FRIENDSHIPS</small><b>{Object.values(relationshipScores).filter(v=>v>0).length}/10</b></div></div><h3>Current life snapshot</h3><p>You're building a life in Ado-Ekiti. Keep your needs balanced, grow your career and make connections across the city.</p><div className="profile-quick-actions"><button onClick={()=>setProfileTab('needs')}>💚 Check my needs</button><button onClick={()=>setProfileTab('goals')}>🎯 View my goals</button><button onClick={()=>{setProfileOpen(false);setLifeHubOpen(true);}}>🏙️ Open Life Hub</button></div></div>}
          {profileTab==='needs' && <div className="profile-content"><h3>Daily wellbeing</h3><p>Look after these needs through food, rest, entertainment and time with people.</p><div className="profile-meter-list">{([['Hunger',needs.hunger,'🍲'],['Thirst',needs.thirst,'💧'],['Energy',needs.energy,'⚡'],['Fun',needs.fun,'🎮'],['Social',needs.social,'🤝'],['Hygiene',needs.hygiene,'🧼'],['Bladder',needs.bladder,'🚻']] as const).map(([name,value,icon])=><div className="profile-meter" key={name}><span>{icon} {name}</span><div><i className={value<25?'critical':value<45?'low':''} style={{width:value+'%'}}/></div><b>{Math.round(value)}%</b></div>)}</div><div className="profile-mood-note">Current mood: <b>{moodLabel}</b> ({moodScore}%)</div></div>}
          {profileTab==='skills' && <div className="profile-content"><h3>Skills & personal growth</h3><p>Your progress reflects the activities and experiences you've completed.</p><div className="profile-skill-row"><span>💪 Hustle & work experience</span><b>{careerExperience} XP</b></div><div className="profile-skill-row"><span>🎭 Community reputation</span><b>{communityReputation}</b></div><div className="profile-skill-row"><span>🎓 Study credits</span><b>{studyCredits}</b></div><div className="profile-skill-row"><span>🎉 Community events</span><b>{eventsAttended}</b></div></div>}
          {profileTab==='people' && <div className="profile-content"><h3>Your neighbourhood connections</h3><p>Friendships grow when you greet neighbours and spend time together.</p><div className="profile-people-list">{Object.entries(relationshipScores).sort((a,b)=>b[1]-a[1]).map(([name,score])=><div key={name}><span>🤝 {name}</span><b>{score}%</b><i><em style={{width:score+'%'}}/></i></div>)}</div></div>}
          {profileTab==='career' && <div className="profile-content"><h3>Work & education</h3><div className="profile-highlight"><small>CURRENT CAREER</small><b>{selectedCareer}</b><span>Level {careerLevel} · {careerExperience} experience</span></div><div className="profile-skill-row"><span>🎓 Course</span><b>{studentCourse}</b></div><div className="profile-skill-row"><span>📚 Graduation</span><b>{examPassed?'Completed':'In progress'}</b></div><button className="profile-primary" onClick={()=>{setProfileOpen(false);setLifeHubOpen(true);}}>Manage career in Life Hub</button></div>}
          {profileTab==='goals' && <div className="profile-content"><h3>Your next milestones</h3><p>Keep progressing through the opportunities around Ado-Ekiti.</p><div className="profile-goal-list"><div><span>💼 Complete a career shift</span><b>{careerExperience>0?'✓ Started':'Not started'}</b></div><div><span>🤝 Build a friendship</span><b>{Object.values(relationshipScores).some(v=>v>=50)?'✓ In progress':'Keep connecting'}</b></div><div><span>🎓 Pass your course exam</span><b>{examPassed?'✓ Completed':'In progress'}</b></div><div><span>🏠 Improve your home</span><b>{propertyLevel>0?'✓ Upgraded':'Not started'}</b></div><div><span>🚗 Own a personal vehicle</span><b>{vehicleOwned?'✓ Owned':'Not started'}</b></div><div><span>🎉 Attend a community event</span><b>{eventsAttended>0?'✓ Attended':'Not started'}</b></div></div></div>}
        </section></div>}
        {lifeHubOpen && <div className="shop-backdrop" role="presentation"><section className="life-hub-panel" role="dialog" aria-modal="true" aria-label="Your life hub">
          <div className="shop-heading"><div><small>EKITI LIFESTYLE · YOUR JOURNEY</small><h2>Your Life Hub</h2><p>Build your future, one decision at a time.</p></div><button className="shop-close" onClick={() => setLifeHubOpen(false)}>×</button></div>
          <div className="life-summary"><div><small>CASH WALLET</small><b>₦{wallet.toLocaleString('en-NG')}</b></div><div><small>BANK SAVINGS</small><b>₦{bankSavings.toLocaleString('en-NG')}</b></div><div><small>CAREER LEVEL</small><b>LEVEL {careerLevel}</b></div></div>
          <section className="life-section"><h3>💼 Career & work</h3><p>Current path: <b>{selectedCareer}</b> · ₦{jobPay.toLocaleString('en-NG')} per shift · {careerExperience} experience</p><div className="life-career-list">{careerOptions.map((career) => <button key={career.name} className={selectedCareer===career.name?'selected':''} onClick={() => {setSelectedCareer(career.name);setStatus(v=>({...v,message:`Career selected: ${career.name}. Visit the job board to start a shift.`}));}}><span>{career.icon}</span><b>{career.name}</b><small>₦{career.pay.toLocaleString('en-NG')} / shift</small></button>)}</div><button className="life-action" disabled={jobWorking} onClick={()=>{setWorkSeconds(30);setJobWorking(true);setLifeHubOpen(false);setStatus(v=>({...v,message:`You started a ${selectedCareer} shift. Work hard!`}));}}>START 30-SECOND SHIFT</button></section>
          <section className="life-section"><h3>🏦 Banking & savings</h3><p>Move money between your wallet and personal savings.</p><div className="life-actions"><button onClick={()=>depositMoney(1000)} disabled={wallet<1000}>Deposit ₦1,000</button><button onClick={()=>withdrawMoney(1000)} disabled={bankSavings<1000}>Withdraw ₦1,000</button><button onClick={()=>depositMoney(5000)} disabled={wallet<5000}>Deposit ₦5,000</button><button onClick={()=>withdrawMoney(5000)} disabled={bankSavings<5000}>Withdraw ₦5,000</button></div></section>
          <section className="life-section"><h3>🏠 Property & home</h3><p>{propertyLevel===0?'You currently live in your starter apartment.':propertyLevel===1?'You have upgraded to a more comfortable rented home.':'You own your home!'}</p><button className="life-action" disabled={propertyLevel>=2||wallet<(propertyLevel===0?35000:65000)} onClick={buyPropertyUpgrade}>{propertyLevel===0?'UPGRADE HOME · ₦35,000':propertyLevel===1?'BUY YOUR HOME · ₦65,000':'PROPERTY OWNED ✓'}</button></section>
          <section className="life-section"><h3>🤝 Friendships</h3><p>Keep in touch with people around Ado-Ekiti. Build trust through conversations and time together.</p><div className="life-friends">{Object.entries(relationshipScores).map(([person,score])=><div key={person}><span>{person}</span><b>{score}%</b><div className="life-progress"><i style={{width:`${score}%`}} /></div><button onClick={()=>buildRelationship(person,20)}>Spend time +20</button></div>)}</div></section>
          <section className="life-section"><h3>🚕 Transport</h3><p>{vehicleOwned?'You own a personal car.':'No personal vehicle yet. Taxis are available around the city.'}</p><div className="life-actions"><button onClick={takeTaxi} disabled={wallet<500||insideHome}>Take taxi · ₦500</button><button onClick={buyVehicle} disabled={vehicleOwned||wallet<80000}>{vehicleOwned?'Car owned ✓':'Buy car · ₦80,000'}</button></div></section>
          <section className="life-section"><h3>🎓 Education</h3><p>{enrolledCampus? `Enrolled at ${enrolledCampus} · ${studentCourse}`:'Visit UNAD or Ado Poly and enrol in a course.'}</p><p>Study credits: <b>{studyCredits}/5</b> · Exam: <b>{examPassed?'Passed':'Not yet passed'}</b> · Graduation: <b>{graduated?'Completed':'In progress'}</b></p>{enrolledCampus&&<button className="life-action" disabled={!examPassed||graduated} onClick={()=>{setGraduated(true);setStatus(v=>({...v,message:`Congratulations! You graduated in ${studentCourse} from ${enrolledCampus}.`}));}}>GRADUATE {examPassed?'🎓':'· PASS EXAM FIRST'}</button>}</section>
        </section></div>}
                 {selectedHomeObject && insideHome && <div className="shop-backdrop" role="presentation"><section className="home-object-panel" role="dialog" aria-modal="true" aria-label={selectedHomeObject.name}><div className="shop-heading"><div><small>{selectedHomeObject.room.toUpperCase()} · HOME INTERACTION</small><h2>{selectedHomeObject.emoji} {selectedHomeObject.name}</h2><p>{selectedHomeObject.description}</p></div><button className="shop-close" onClick={() => setSelectedHomeObject(null)} aria-label="Close furniture actions">×</button></div><div className="home-object-actions">{selectedHomeObject.actions.map((item) => <button key={item.action} onClick={() => performFurnitureAction(item.action)}><span>▶</span><div><b>{item.label}</b><small>{item.detail}</small><small className="home-object-duration">{item.duration} · No charge</small></div></button>)}</div><div className="home-object-skills"><b>HOME SKILLS</b><span>Hustle {homeSkills.hustle}</span><span>Charisma {homeSkills.charisma}</span></div></section></div>}
{homeOpen && <div className="shop-backdrop" role="presentation"><section className="home-panel" role="dialog" aria-modal="true" aria-label="Home interactions"><div className="shop-heading"><div><small>YOUR HOME · ADO-EKITI</small><h2>What would you like to do?</h2><p>Tap individual furniture in the 3D room to see its activities.</p></div><button className="shop-close" onClick={() => setHomeOpen(false)} aria-label="Close home menu">×</button></div><div className="home-actions"><button onClick={() => { setHomeOpen(false); setStatus((s) => ({ ...s, message: 'Tap a bed, sofa, television, kitchen fixture, shower or bookcase to interact.' })); }}><span>🪑</span><b>Select furniture</b><small>Tap objects in the room</small></button><button onClick={() => performHomeAction('sleep')}><span>🛏️</span><b>Sleep</b><small>Restore energy</small></button><button onClick={() => performHomeAction('shower')}><span>🚿</span><b>Take a shower</b><small>Restore hygiene</small></button><button onClick={() => performHomeAction('cook')}><span>🍲</span><b>Cook a meal</b><small>Use 1 snack or fruit</small></button><button onClick={()=>performHomeAction('sit')}><span>🛋️</span><b>Sit & relax</b><small>Use the sofa</small></button><button onClick={()=>performHomeAction('dance')}><span>💃</span><b>Dance</b><small>Move to music</small></button><button onClick={()=>performHomeAction('movie')}><span>📺</span><b>Watch movie</b><small>Movie night</small></button><button onClick={()=>{homeActivityRef.current='';setHomeActivity('');setStatus((s)=>({...s,message:'You stood up and are ready to move.'}));}}><span>🚶</span><b>Stand up</b><small>Return to movement</small></button></div>{homeActivity&&<div className="home-activity-status">CURRENT ACTIVITY: {homeActivity.toUpperCase()} · Choose Stand up to move again.</div>}<div className="home-consumables"><b>USE ITEMS FROM YOUR BAG</b>{([{ id: 'water', label: 'Drink water', emoji: '💧' }, { id: 'softdrink', label: 'Drink soft drink', emoji: '🥤' }, { id: 'snack', label: 'Eat local snack', emoji: '🥟' }, { id: 'fruit', label: 'Eat fruit', emoji: '🍊' }] as const).map((item) => <button key={item.id} disabled={!(inventory[item.id] || 0)} onClick={() => consumeItem(item.id)}><span>{item.emoji}</span>{item.label}<small>×{inventory[item.id] || 0}</small></button>)}</div><div className="home-inventory">Items are used from your bag. Cooking uses one snack or fruit.</div></section></div>}
        {marketOpen && <div className="shop-backdrop" role="presentation"><section className="shop-panel" role="dialog" aria-modal="true" aria-label={marketNames[activeMarket]}><div className="shop-heading"><div><small>ADO-EKITI · OPEN MARKET</small><h2>{marketNames[activeMarket]}</h2><p>{['Foodstuff, grains and fresh produce','Clothing, fabrics and footwear','Household goods and kitchen supplies'][activeMarket]}</p></div><button className="shop-close" onClick={()=>setMarketOpen(false)} aria-label="Close market">×</button></div><div className="shop-wallet">YOUR WALLET <strong>₦{wallet.toLocaleString('en-NG')}</strong></div><div className="shop-items">{marketProducts[activeMarket].map((item)=><article className="shop-item" key={item.id}><div className="shop-emoji">{item.emoji}</div><div className="shop-item-copy"><b>{item.name}</b><small>{item.detail}</small><small className="owned">In bag: {inventory[item.id]||0}</small></div><div className="shop-buy"><strong>₦{item.price.toLocaleString('en-NG')}</strong><button onClick={()=>{if(wallet<item.price)return;setWallet(v=>v-item.price);setInventory(v=>({...v,[item.id]:(v[item.id]||0)+1}));setStatus(v=>({...v,message:`${item.name} purchased at ${marketNames[activeMarket]}.`}));}} disabled={wallet<item.price}>BUY</button></div></article>)}</div><p className="shop-note">Each market specialises in a different range of goods. Purchases are added to your bag.</p></section></div>}
        {campusOpen && <div className="shop-backdrop" role="presentation"><section className="job-panel" role="dialog" aria-modal="true" aria-label={`${activeCampus} campus`}><div className="shop-heading"><div><small>ADO-EKITI · CAMPUS LIFE</small><h2>{activeCampus}</h2><p>Explore campus life and build your education.</p></div><button className="shop-close" onClick={()=>setCampusOpen(false)} aria-label="Close campus">×</button></div><div className="job-offer"><span>🎓</span><div><b>{enrolledCampus===activeCampus?'You are enrolled here':'Become a student'}</b><small>{enrolledCampus===activeCampus?'Attend lessons, pass your exam and graduate.':'Choose this institution and a course to begin your studies.'}</small><strong>{studyCredits} study credits · {examPassed?'Exam passed':'Exam pending'}</strong></div></div>{enrolledCampus!==activeCampus?<><label className="course-label">CHOOSE YOUR COURSE<select value={studentCourse} onChange={e=>setStudentCourse(e.target.value)}><option>Business Administration</option><option>Computer Science</option><option>Mass Communication</option><option>Accounting</option><option>Public Administration</option><option>Computer Engineering</option></select></label><button className="start-shift" onClick={()=>{setEnrolledCampus(activeCampus);setStudyCredits(0);setExamPassed(false);setGraduated(false);setStatus(v=>({...v,message:`You enrolled at ${activeCampus} to study ${studentCourse}. Your student journey begins!`}));}}>ENROL AT {activeCampus.toUpperCase()}</button></>:<><div className="job-requirements"><b>STUDENT LIFE</b><span>Attend classes to earn study credits.</span><span>Classes use some energy and advance your daily routine.</span><span>Earn 5 credits, pass your course assessment and graduate.</span></div><button className="start-shift" onClick={()=>{setStudyCredits(v=>v+1);setNeeds(n=>({...n,energy:Math.max(0,n.energy-8),hunger:Math.max(0,n.hunger-3),fun:Math.max(0,n.fun-2),bladder:Math.max(0,n.bladder-2)}));setStatus(v=>({...v,message:`Class completed at ${activeCampus}. You earned 1 study credit.`}));setCampusOpen(false);}}>ATTEND CLASS · EARN 1 CREDIT</button><button className="campus-switch" disabled={studyCredits<5||examPassed} onClick={sitExam}>SIT COURSE EXAM · 5 CREDITS</button>{examPassed&&<p className="course-success">Course exam passed. Visit your Life Hub to graduate.</p>}<button className="campus-switch" onClick={()=>{setEnrolledCampus('');setStudyCredits(0);setExamPassed(false);setGraduated(false);}}>LEAVE THIS INSTITUTION</button></>}</section></div>}
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
        onClick={(event) => { if (cameraMovedRef.current) { cameraMovedRef.current = false; return; } selectHomeObjectAt(event.clientX, event.clientY); }}><span className="camera-look-hint">DRAG TO LOOK · TAP FURNITURE</span></div>
        <div className="control-hint">WASD / ARROW KEYS <span>•</span> JOYSTICK + LOOK ON MOBILE</div>
        <div className="coordinate">X {status.x} · Z {status.z}</div>
      </section>
      <footer className="bottom-bar"><span><i /> 3D WORLD PROTOTYPE</span><span>BUILD YOUR LIFE. OWN YOUR FUTURE. EXPLORE YOUR CITY.</span><span>v0.2.0</span></footer>
    </main>
  );
}

export default App;