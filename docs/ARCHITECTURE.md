# Ekiti Lifestyle — Technical Architecture

**Vision:** A browser-based, 3D open-world life simulation set in an Ekiti-inspired version of Ado-Ekiti. The game is an original project; Lagos Life is a genre and feature-depth inspiration, not a source for copied code, art, names, maps, or assets.

## Current repository baseline

The default branch currently contains a single index.html prototype. It draws a small 2D room and yard with the Canvas 2D API, stores player progress in localStorage, and implements basic movement, needs, actions, and daily goals in one inline script. It is a useful proof of concept, but it is not yet a 3D engine or an open world.

**Migration rule:** preserve the prototype on main; build the 3D foundation on a feature branch and migrate in small, testable steps. Do not replace the working prototype until the new build can run reliably on desktop and mobile.

## Recommended stack

- **Vite + TypeScript:** development server, build pipeline, typed game code.
- **Three.js:** WebGL rendering, scene graph, camera, lighting, materials, and asset loading.
- **React:** menus, HUD, character setup, inventory, map, settings, and accessible interface.
- **Blender:** original low-poly / stylized 3D models, UVs, and animation exports.
- **GLTF/GLB:** runtime model format; compress textures and geometry when the asset pipeline is established.
- **Local save first:** versioned save data in IndexedDB (with a small localStorage fallback for settings). Cloud accounts and multiplayer are later milestones, not launch dependencies.
- **Supabase later (optional):** authentication, cloud saves, and backend services once the single-player game has a stable data model.

Avoid adding a physics engine, multiplayer framework, or large asset library until the basic playable loop is proven. Start with simple collision volumes and a small original asset set; evaluate Rapier when physical interactions require it.

## Runtime architecture

    React Application
    ├── UI Layer
    │   ├── Main menu / character creation
    │   ├── HUD (money, needs, time, prompts)
    │   ├── Inventory / phone / map
    │   └── Settings and accessibility
    └── Game Client
        ├── Game Runtime (lifecycle, clock, input)
        ├── Three.js Renderer
        │   ├── Scene / camera / lighting
        │   ├── World & district streaming
        │   ├── Player controller
        │   ├── NPCs & interactions
        │   └── Asset manager (GLB, textures, audio)
        ├── Simulation Systems
        │   ├── Needs & daily routine
        │   ├── Economy / jobs / businesses
        │   ├── Housing / property
        │   ├── Relationships / reputation
        │   └── Quests / events
        └── Persistence
            ├── Versioned player save
            └── Local settings

Keep simulation rules independent from rendering. The same needs, economy, and interaction logic should work even if a model or scene is replaced.

## Open-world strategy

Do not attempt to build all of Ado-Ekiti at once. Create a compact, connected, fictionalized district inspired by recognizable Ekiti streets, architecture, vegetation, signage, markets, and community spaces. Use a world-coordinate system and divide the map into streamable districts/chunks. Initially load one small district and its neighbouring cells; add portals/doors for interiors.

Initial vertical slice:
1. Starter home and yard.
2. One walkable street with sidewalks and road crossings.
3. Small shop / market stall.
4. A public/community space.
5. One NPC with a simple conversation and interaction.
6. One job/activity that changes the player's money and needs.

## Player and controls

- Third-person follow camera with camera collision and adjustable sensitivity.
- Keyboard/mouse controls on desktop.
- Touch joystick plus context-sensitive interaction button on phones.
- Optional controller support later.
- Player movement, camera, and interaction must be tested on the Redmi 14C-class Android device and desktop browsers.
- Use simple colliders and clear interaction ranges; never rely on tiny touch targets.

## Performance and accessibility targets

- Responsive layout and controls on small screens.
- Start with stylized low-poly assets, limited dynamic lights, baked lighting where practical, and compressed textures.
- Use instancing for repeated trees, street props, and crowds.
- Load district assets progressively; show a loading state and recover gracefully from asset failures.
- Provide graphics settings (quality, shadows, render scale) and a reduced-motion option.
- Aim for stable playability before increasing visual detail. Profile on the actual target phone rather than assuming desktop performance predicts mobile performance.

## Milestones

### M0 — Safe migration foundation
- Add Vite, TypeScript, React, and Three.js build setup.
- Keep the existing prototype accessible as a legacy/demo route or preserve it on the default branch.
- Establish lint/type-check/build scripts and a clear source folder layout.

### M1 — 3D playable courtyard
- Render a 3D starter yard and simple house exterior.
- Add a controllable player capsule/placeholder and third-person camera.
- Add desktop and touch movement; confirm no blank-screen issue on mobile.

### M2 — First connected street
- Add collision, walkable road/sidewalk, a few buildings, trees, and a transition into one interior.
- Add a context interaction system and one NPC.

### M3 — Life simulation loop
- Port needs, time, money, daily goals, and one paid activity into rendering-independent systems.
- Add versioned local save/load and a new-game flow.

### M4 — Expandable city systems
- Add housing/property, employment, businesses, transport, relationships, and more districts in separate modules.
- Add NPC schedules and lightweight world events.

### M5 — Online features
- Only after the offline game is stable: accounts, cloud saves, then carefully scoped multiplayer with authoritative server-side state for shared actions.

## Proposed source layout

    src/
      app/                 # React app shell and routes
      ui/                  # HUD, menus, dialogs, touch controls
      game/
        core/              # runtime, clock, input, events
        rendering/         # Three.js renderer, camera, lighting
        world/             # districts, chunks, buildings, environment
        player/            # controller, camera rig, interactions
        entities/          # NPCs, vehicles, interactables
        simulation/        # needs, economy, jobs, relationships, quests
        persistence/       # save schema, migrations, local storage
        assets/            # asset manifest and loaders
      styles/
    public/
      assets/
        models/
        textures/
        audio/
    docs/

## Definition of done for the first 3D milestone

- A clean production build succeeds.
- The 3D courtyard loads without console errors.
- The player can walk, stop, and turn using keyboard and touch controls.
- The camera follows smoothly and does not clip through the ground.
- The scene is usable on desktop and a mid-range Android phone.
- The old 2D prototype remains recoverable until the new vertical slice is verified.
