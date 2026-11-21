# Ekiti Lifestyle

A browser-based 3D open-world life-simulation prototype set in an Ekiti-inspired Ado-Ekiti. This is an original project; other life-simulation games are inspiration for the genre, not sources for copied code or assets.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Production build

```bash
npm run build
npm run preview
```

The production files are generated in `dist/`.

## Controls

- **Desktop:** WASD or arrow keys.
- **Mobile:** on-screen directional pad.

## Current prototype

The first 3D milestone includes a stylized starter home, yard, roadside, neighbouring buildings, trees, a kiosk, a third-person follow camera, and keyboard/touch movement.

The previous 2D prototype is preserved on the default branch while this 3D migration is developed on `architecture/3d-open-world-foundation`.

## Hosting

For a Render Static Site:
- Build command: `npm install && npm run build`
- Publish directory: `dist`

For GitHub Pages, configure the deployment workflow to install dependencies, run `npm run build`, and publish `dist/`.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the technical plan and milestones.
