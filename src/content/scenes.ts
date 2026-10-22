/**
 * Presentation content: scene metadata, reveal steps and speaker notes.
 * Rendering code reads from here; nothing visual is defined in this file.
 */

export interface SceneStep {
  /** Presenter-facing description of what this reveal shows. */
  cue: string
  /** Suggested words to say aloud during this reveal. */
  say: string
  /** Seconds to hold this step during optional autoplay (scaled by pacing). */
  dwell: number
}

export interface SceneMeta {
  id: string
  number: number
  title: string
  /** Short name used in the navigator and HUD. */
  short: string
  steps: SceneStep[]
  /** Bridge line into the next scene. */
  transition?: string
}

export const SCENES: SceneMeta[] = [
  {
    id: 'hook',
    number: 1,
    title: 'What if computers could think differently?',
    short: 'The hook',
    steps: [
      {
        cue: 'Darkness. A single particle appears, ripples, and the quantum field opens up around a sphere.',
        say: 'Let the room go quiet for a few seconds. Then: "Every computer you have ever used works with bits. Billions of tiny switches, each one either off or on."',
        dwell: 13,
      },
      {
        cue: 'Title: QUANTUM REALITY, then the subtitle.',
        say: '"Today I want to show you a machine that plays by different rules. Not a faster version of your laptop, but a different way of processing information."',
        dwell: 9,
      },
      {
        cue: 'Camera pushes toward the sphere. The hook question appears.',
        say: '"So here is the question: what if computers could think differently? To answer it, we have to start with the smallest unit of information."',
        dwell: 8,
      },
    ],
    transition: 'Press next to fly through the sphere into the world of bits and qubits.',
  },
  {
    id: 'bits',
    number: 2,
    title: 'Bits vs. qubits',
    short: 'Bits vs. qubits',
    steps: [
      {
        cue: 'A classical bit on the left, a faint quantum sphere on the right.',
        say: '"On the left is a classical bit. On the right, its quantum counterpart, the qubit."',
        dwell: 6,
      },
      {
        cue: 'The bit flips. Caption: a classical bit is 0 or 1 when read.',
        say: '"A classical bit is always in one definite state. Whenever you read it, you get 0 or you get 1, and reading it doesn\'t change it."',
        dwell: 8,
      },
      {
        cue: 'The 0 and 1 fly across and become the poles of the Bloch sphere. A state vector appears.',
        say: '"A qubit is described differently. 0 and 1 become two poles of a sphere, and the qubit\'s state can point anywhere on it. Those in-between directions are superpositions. It is not secretly storing two classical values at once."',
        dwell: 10,
      },
      {
        cue: 'Labels α and β appear: the state is described by probability amplitudes.',
        say: '"We describe that state with two numbers called amplitudes, alpha and beta. They are not ordinary probabilities, they can even be complex numbers. Let\'s see what that means."',
        dwell: 9,
      },
    ],
    transition: 'Next: superposition, up close.',
  },
  {
    id: 'superposition',
    number: 3,
    title: 'Quantum superposition',
    short: 'Superposition',
    steps: [
      {
        cue: 'The Bloch sphere takes centre stage. Waves and phase colours move around it.',
        say: '"This is the Bloch sphere, a map of every possible state of a single qubit. The arrow is the state. The colour sweeping around it is the phase."',
        dwell: 7,
      },
      {
        cue: 'Equation |ψ⟩ = α|0⟩ + β|1⟩ and the superposition statement.',
        say: '"Mathematically, the state psi is alpha times zero plus beta times one. A qubit can exist in a superposition of basis states until it is measured. It is not flickering rapidly between 0 and 1. It is one definite state that simply isn\'t 0 or 1."',
        dwell: 11,
      },
      {
        cue: 'Normalisation |α|² + |β|² = 1, probabilities, and the coin analogy (flagged as an analogy).',
        say: '"Square the size of each amplitude and you get a probability, and they always add up to one. A coin analogy helps a little: a coin is heads or tails. But it is only an analogy. Amplitudes can cancel or reinforce each other, that\'s interference, and coins can\'t do that."',
        dwell: 12,
      },
      {
        cue: 'Interactive: drag θ and φ. The vector and probability bars update live.',
        say: '"Watch: as I tilt the state toward the north pole, the chance of reading 0 goes up. Turning the phase changes the colour but not these probabilities. Phase matters when states interfere, which is where quantum algorithms get their power."',
        dwell: 12,
      },
    ],
    transition: 'So what happens when we actually look?',
  },
  {
    id: 'measurement',
    number: 4,
    title: 'Measurement: the reveal',
    short: 'Measurement',
    steps: [
      {
        cue: 'The same state. The room gets quieter.',
        say: 'Pause. "Everything so far is the state before we look. Now we measure."',
        dwell: 5,
      },
      {
        cue: 'A measurement pulse hits the qubit. The sphere dims; one outcome glows.',
        say: '"Measurement produces a definite outcome, a plain 0 or 1. Afterwards the qubit is left in that state; the superposition we prepared is gone."',
        dwell: 9,
      },
      {
        cue: 'Probabilities: P(0) = |α|², P(1) = |β|², with values for this state.',
        say: '"Which outcome we get is random, but the odds are set by the amplitudes: alpha squared for 0, beta squared for 1. Only an equal superposition is 50–50. This one is not."',
        dwell: 10,
      },
      {
        cue: 'Demo: pick a state, measure once or 100 times, compare the histogram with the prediction.',
        say: '"Each run prepares the same state again and measures it. One run tells you almost nothing. A hundred runs reveal the amplitudes. Quantum computers are run many times for exactly this reason."',
        dwell: 14,
      },
    ],
    transition: 'One qubit is interesting. Two qubits can be something stranger.',
  },
  {
    id: 'entanglement',
    number: 5,
    title: 'Quantum entanglement',
    short: 'Entanglement',
    steps: [
      {
        cue: 'Two qubits, A and B, far apart, each with its own independent orbit.',
        say: '"Here are two qubits, far apart. Right now each one has its own state, and we can describe them separately."',
        dwell: 7,
      },
      {
        cue: 'A shared structure forms around both; the orbits fall into step. Caption flags it as a conceptual picture.',
        say: '"Now we entangle them. Entangled qubits share a joint quantum state that cannot be described as independent states of each qubit. The glow is just a picture of that shared description. There is no physical wire."',
        dwell: 11,
      },
      {
        cue: 'Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 and its outcomes.',
        say: '"The simplest example is this Bell state. Measure both qubits and you get 00 or 11, each half the time. Never 01, never 10."',
        dwell: 9,
      },
      {
        cue: 'Both qubits are measured together and give matching results. Note: correlation, not communication.',
        say: '"The results always match. But this is not a message. Each side on its own sees a perfectly random 0 or 1, so nobody can use this to send a signal faster than light. The pattern only shows up when you compare notes."',
        dwell: 12,
      },
    ],
    transition: 'Let\'s run this for real, many times.',
  },
  {
    id: 'entanglement-action',
    number: 6,
    title: 'Entanglement in action',
    short: 'In action',
    steps: [
      {
        cue: 'Measurement demo: press "Measure pair" several times. Tally of 00, 01, 10, 11.',
        say: '"Every press prepares a fresh Bell pair and measures both qubits. The randomness here is genuine: the browser\'s cryptographic random generator picks each result. Notice 01 and 10 never appear."',
        dwell: 12,
      },
      {
        cue: 'Statement: correlations that independent classical systems cannot reproduce in every basis.',
        say: '"To be fair, matching results alone could be faked by a pre-agreed classical rule. The quantum difference appears when you measure in several different bases and compare. Those are Bell tests, and nature breaks the classical limit."',
        dwell: 11,
      },
      {
        cue: 'Why it matters: communication and cryptography, computing, information science.',
        say: '"These correlations are a resource. They underpin some quantum key distribution schemes, they are created by the entangling gates inside quantum algorithms, and they drive research in quantum information science. Much of this is still research, not everyday technology."',
        dwell: 12,
      },
    ],
    transition: 'Which brings us to the real question.',
  },
  {
    id: 'why',
    number: 7,
    title: 'Why should we care?',
    short: 'Why it matters',
    steps: [
      {
        cue: 'A single particle. The question: why should we care?',
        say: '"So why should engineers care about any of this?"',
        dwell: 5,
      },
      {
        cue: 'Quantum computing: a circuit forms from light.',
        say: '"First, computing. For selected problems, like simulating molecules and some optimisation and factoring tasks, quantum algorithms could beat the best known classical methods. Not for everything, and not yet at scale."',
        dwell: 9,
      },
      {
        cue: 'Quantum cryptography and communication: a secure channel.',
        say: '"Second, communication. Quantum key distribution uses measurement disturbance to reveal eavesdroppers. It already runs on some specialised links."',
        dwell: 8,
      },
      {
        cue: 'Quantum sensing: a sensor picks a tiny signal out of noise.',
        say: '"Third, sensing. Quantum states are extremely sensitive to their environment, which makes them excellent sensors for magnetic fields, time and gravity."',
        dwell: 8,
      },
      {
        cue: 'Quantum networks: the clusters join into one network.',
        say: '"And fourth, networks. Researchers are learning to distribute entanglement between distant nodes, a step toward a future quantum internet."',
        dwell: 8,
      },
    ],
    transition: 'Let\'s bring it all together.',
  },
  {
    id: 'finale',
    number: 8,
    title: 'The finale',
    short: 'Finale',
    steps: [
      {
        cue: 'Everything converges: bits, the state vector, waves, the entangled pair and the network assemble around the sphere.',
        say: '"Bits. States. Superposition. Measurement. Entanglement. Networks. They all come back to this sphere."',
        dwell: 9,
      },
      {
        cue: 'Statement: the future is not just faster computing.',
        say: '"The future is not just faster computing. It is a different way of computing, one that uses the rules of nature itself."',
        dwell: 9,
      },
      {
        cue: 'THANK YOU. Any questions? Stays on screen until you move.',
        say: '"Thank you. I\'m happy to take any questions."',
        dwell: 9999,
      },
    ],
  },
]

export const SCENE_COUNT = SCENES.length

/** Total number of reveal steps across the deck (used by the progress bar). */
export const TOTAL_STEPS = SCENES.reduce((n, s) => n + s.steps.length, 0)

export function globalStepIndex(scene: number, step: number): number {
  let n = 0
  for (let i = 0; i < scene; i++) n += SCENES[i].steps.length
  return n + step
}

/** Index constants so scene-specific code reads clearly. */
export const SCENE = {
  HOOK: 0,
  BITS: 1,
  SUPERPOSITION: 2,
  MEASUREMENT: 3,
  ENTANGLEMENT: 4,
  ENTANGLEMENT_ACTION: 5,
  WHY: 6,
  FINALE: 7,
} as const
