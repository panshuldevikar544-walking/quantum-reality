# Quantum Reality

A cinematic, interactive presentation that teaches the fundamentals of quantum computing in eight scenes (about 6 minutes spoken). Built for a live talk on a laptop connected to a projector: the presenter controls every reveal, and the 3D stage animates the ideas.

Runs entirely offline: no backend, account, API key, CDN or font service. Fonts are bundled, sound is synthesised in the browser, and every visual is procedural.

## Run it

Requires Node.js 20.19+ (22 recommended).

```bash
npm install
npm run dev        # http://localhost:5173
```

For the talk itself, use the optimised build:

```bash
npm run build
npm run preview    # http://localhost:4173
```

The `dist/` folder can be served by any static web server (`npx serve dist`, `python -m http.server` inside `dist`, etc.). Opening `dist/index.html` directly from the file system will not work, because browsers block JavaScript modules on `file://` URLs.

**Before presenting:** open the page, press **F** for fullscreen, and press **→** to begin. Press **N** for your notes, or open them in a separate window from the notes panel and drag that window onto your laptop screen while the projector shows the stage.

## Keyboard

| Key | Action |
| --- | --- |
| → , Space, Page Down | Next reveal, then next scene |
| ← , Page Up | Previous reveal or scene |
| Home | Restart at scene 1 |
| End | Jump to scene 8 |
| F | Fullscreen on or off |
| M | Sound on or off (off by default) |
| Esc | Close the open panel, or exit fullscreen |
| N | Presenter notes |
| G | Scene navigator (then 1–8 to jump) |
| P | Pause or resume all animation |
| R | Restart the current scene |
| A | Optional autoplay on or off |
| L | Lower-motion mode |
| ? or H | Keyboard help |

Presentation clickers work (they send Page Up and Page Down). On touch screens, swipe left or right. Holding a key never races through slides, and rapid presses are throttled.

## The eight scenes

1. **The hook**: one particle in the dark becomes a field and a sphere; title reveal.
2. **Bits vs. qubits**: a classical bit flips between 0 and 1; the digits fly to become the poles of a Bloch sphere.
3. **Superposition**: large Bloch sphere, |ψ⟩ = α|0⟩ + β|1⟩, normalisation, a clearly flagged coin analogy, and live θ/φ sliders with probability bars.
4. **Measurement**: a probe pulse collapses the state to 0 or 1. Demo: pick a state, measure once or 100 times, compare the histogram with |α|² and |β|².
5. **Entanglement**: two distant qubits, a shared-state visual (labelled as conceptual), the Bell state |Φ⁺⟩, and a synchronised measurement with the "correlation, not communication" point.
6. **Entanglement in action**: "Measure pair" demo with Qubit A and Qubit B outcomes and a 00/01/10/11 tally, plus why the correlations matter.
7. **Why it matters**: a network grows from one particle as computing, cryptography, sensing and networking are revealed.
8. **Finale**: bits, state vector, waves, the entangled pair and the network converge on the sphere. THANK YOU stays on screen until you move.

## Scientific notes

- States use the Bloch parameterisation |ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩, so P(0) = cos²(θ/2) and P(1) = sin²(θ/2). The phase φ changes the visual and the interference pattern but never the computational-basis probabilities.
- Every measurement uses the browser's cryptographic random number generator (`crypto.getRandomValues`). Each shot re-prepares the state.
- Bell-pair measurements of |Φ⁺⟩ give 00 or 11 with probability ½ each and never 01 or 10. The visuals never show anything travelling from one qubit to the other, and the scene states that the correlation cannot carry a message. Scene 6 notes that matching results in a single basis could be mimicked classically; the quantum advantage appears across several bases (Bell tests).
- The demos are labelled as an educational model, not a hardware simulation.

## Architecture

```
src/
  content/scenes.ts        Scene titles, reveal steps, autoplay timings, speaker notes
  state/store.ts           Tiny external store: navigation, demos, settings
  lib/quantum.ts           Qubit and Bell-state math, CSPRNG sampling
  lib/easing.ts            Shared easing, timing and damping (one motion language)
  three/
    Stage.tsx              The single persistent WebGL canvas
    Director.tsx           Advances the timeline clock (pause, pacing) and detects events
    choreography.ts        One table: where every actor should be in every scene and reveal
    world.ts               Per-frame targets shared with actors (no React re-renders)
    shaders.ts             GLSL: particles with depth-of-field, fresnel shells, waves, streams
    actors/                QuantumSphere, BlochSphere, ParticleField, WaveField,
                           EnergyStreams, EntangledPair, QuantumNetwork, ClassicalBits, …
  scenes/                  DOM overlay for each scene (text, equations, demos)
  ui/                      Reveal primitive, math typography, demos, 2D fallback stage
  shell/                   HUD, navigator, presenter notes and window, keyboard,
                           autoplay, audio wiring, presenter-window sync
  audio/AudioEngine.ts     Procedural Web Audio soundtrack and effects
```

**Why it moves smoothly.** All 3D actors stay mounted for the whole talk. The Director computes targets from the choreography table every frame, and each actor eases toward its targets. Objects shared between scenes (the sphere, the qubit, the pair, the network) therefore glide from one scene's composition to the next instead of cutting.

**Performance.** About 5,000 GPU-animated particles in one draw call, additive glows instead of a post-processing pass, adaptive resolution when frame rate drops, a capped pixel ratio, and rendering fully stopped while the tab is hidden. three.js loads lazily after the interface paints.

**Accessibility.** Respects `prefers-reduced-motion` (and an **L** toggle), visible focus rings, keyboard-operable controls, readable contrast with text shadows over 3D, and a 2D SVG fallback stage when WebGL is unavailable (test it with `?nogl`).

## Editing content

Change wording, reveal counts or notes in `src/content/scenes.ts`. If you add or remove a reveal, update the matching scene overlay in `src/scenes/` and, if 3D actors should react, `src/three/choreography.ts`. Regenerate the printable notes with `npm run notes`.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Type-check and production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | Lint with oxlint |
| `npm run notes` | Regenerate `SPEAKER_NOTES.md` from the content file |

## Deploy to Vercel

The repo includes `vercel.json`, so Vercel needs no settings: import the repository at vercel.com/new and press Deploy. It runs `npm run build` and serves `dist/`. Every push to `main` redeploys automatically.
