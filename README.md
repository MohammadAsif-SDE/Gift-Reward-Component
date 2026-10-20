<p align="center">
  <img src="preview.gif" alt="3D Rewards Celebration preview" width="900">
</p>

<h1 align="center">3D Rewards Celebration</h1>

<p align="center">
  An interactive reward moment that opens a 3D gift and celebrates the claim with confetti, a reward card, and an animated points counter.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React 18">
  <img src="https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white" alt="TypeScript 5.5">
  <img src="https://img.shields.io/badge/Three.js-0.170-000000?logo=threedotjs&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/GSAP-3.12-88CE02?logo=greensock&logoColor=white" alt="GSAP">
</p>

<p align="center">
  <a href="#overview">Overview</a>
  ·
  <a href="#getting-started">Getting Started</a>
  ·
  <a href="#interaction-flow">Interaction Flow</a>
  ·
  <a href="#deployment">Deployment</a>
</p>

## Overview

This React component demonstrates a polished daily-reward interaction. A user taps the 3D gift, the lid lifts away, a reward card rises from the box, and a full-screen celebration overlay reveals the claimed reward.

The experience includes:

- A dark radial background with ambient gold particles
- A real-time Three.js gift-box scene rendered into a React component
- Gold, orange, white, and rim lighting for a premium reward aesthetic
- GSAP timeline choreography for the gift opening
- Canvas-based confetti with circles, rectangles, and stars
- A reward card entrance with shimmer and animated `+500` points
- Dismissible celebration overlay with responsive layout
- Resize handling and renderer cleanup for the WebGL scene

## Tech stack

- **React 18 + TypeScript** — component state, callbacks, and typed props
- **Vite 5** — development server and production builds
- **Three.js** — gift geometry, materials, camera, lights, and renderer
- **GSAP** — 3D opening timeline and overlay animations
- **Tailwind CSS** — utility styles and responsive layout
- **Emotion** — available styling dependency from the source template

## Requirements

- Node.js (an active LTS release)
- npm
- A browser with WebGL and Canvas support

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

Vite will print the local URL in the terminal, usually `http://localhost:5173`.

### 3. Create a production build

```bash
npm run build
```

### 4. Preview the production build

```bash
npm run preview
```

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production bundle locally |
| `npm run lint` | Run ESLint across JavaScript and TypeScript source files |

## Project structure

```text
.
├── public/                         # Static files served from the site root
├── src/
│   ├── components/
│   │   ├── CelebrationOverlay.tsx  # Confetti, reward card, and dismiss behavior
│   │   └── RewardScene.tsx         # Three.js gift scene and opening timeline
│   ├── App.tsx                     # Page shell and celebration state
│   ├── index.css                   # Tailwind imports and keyframe animations
│   └── index.tsx                   # React entry point
├── index.html                      # HTML shell and page title
├── package.json                    # Scripts and dependencies
├── tailwind.config.js              # Tailwind configuration
├── postcss.config.js               # PostCSS configuration
├── tsconfig.json                   # TypeScript configuration
└── vite.config.ts                  # Vite configuration
```

## Interaction flow

1. **Idle state** — the daily-reward heading, 3D gift, ambient particles, and “Tap to open” hint are visible.
2. **Opening state** — the gift squashes, bounces, launches its lid, brightens the inner light, and raises the reward card.
3. **Celebration state** — the overlay appears with confetti, a shimmering reward card, and a points counter animating to `+500`.
4. **Dismissal** — the user closes the overlay and returns to the initial page state.

## Customization

### Reward behavior

The opening choreography, lighting, gift geometry, and Three.js lifecycle are implemented in [`src/components/RewardScene.tsx`](src/components/RewardScene.tsx). Change the reward callback, points value, or timeline there.

### Celebration overlay

Update confetti colors, particle count, timing, reward copy, and dismissal animation in [`src/components/CelebrationOverlay.tsx`](src/components/CelebrationOverlay.tsx).

### Page presentation

The title, daily-reward label, background gradients, ambient particles, and scene sizing are configured in [`src/App.tsx`](src/App.tsx). Global keyframes are in [`src/index.css`](src/index.css).

## Current integration notes

- The reward is local UI state; it is not connected to an account, wallet, points ledger, or backend.
- The `+500` amount is hard-coded for demonstration.
- The reward card and dismiss action are visual interactions only.
- Particle positions and sizes are generated with `Math.random()` during render, so the decorative layout is intentionally non-deterministic.
- WebGL and Canvas performance depends on the device and browser.

## Quality checks

```bash
npm run lint
npm run build
```

## Deployment

This is a static Vite application. Deploy the generated `dist/` directory to Vercel, Netlify, GitHub Pages, or any static web server.

| Setting | Value |
| --- | --- |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `dist` |

## License

No license has been declared for this project yet. Add a `LICENSE` file before distributing it.
