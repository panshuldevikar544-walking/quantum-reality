# Quantum Reality: speaker notes

## 01. What if computers could think differently?

**Reveal 1.** _Darkness. A single particle appears, ripples, and the quantum field opens up around a sphere._

Let the room go quiet for a few seconds. Then: "Every computer you have ever used works with bits. Billions of tiny switches, each one either off or on."

**Reveal 2.** _Title: QUANTUM REALITY, then the subtitle._

"Today I want to show you a machine that plays by different rules. Not a faster version of your laptop, but a different way of processing information."

**Reveal 3.** _Camera pushes toward the sphere. The hook question appears._

"So here is the question: what if computers could think differently? To answer it, we have to start with the smallest unit of information."

> Bridge: Press next to fly through the sphere into the world of bits and qubits.

## 02. Bits vs. qubits

**Reveal 1.** _A classical bit on the left, a faint quantum sphere on the right._

"On the left is a classical bit. On the right, its quantum counterpart, the qubit."

**Reveal 2.** _The bit flips. Caption: a classical bit is 0 or 1 when read._

"A classical bit is always in one definite state. Whenever you read it, you get 0 or you get 1, and reading it doesn't change it."

**Reveal 3.** _The 0 and 1 fly across and become the poles of the Bloch sphere. A state vector appears._

"A qubit is described differently. 0 and 1 become two poles of a sphere, and the qubit's state can point anywhere on it. Those in-between directions are superpositions. It is not secretly storing two classical values at once."

**Reveal 4.** _Labels α and β appear: the state is described by probability amplitudes._

"We describe that state with two numbers called amplitudes, alpha and beta. They are not ordinary probabilities, they can even be complex numbers. Let's see what that means."

> Bridge: Next: superposition, up close.

## 03. Quantum superposition

**Reveal 1.** _The Bloch sphere takes centre stage. Waves and phase colours move around it._

"This is the Bloch sphere, a map of every possible state of a single qubit. The arrow is the state. The colour sweeping around it is the phase."

**Reveal 2.** _Equation |ψ⟩ = α|0⟩ + β|1⟩ and the superposition statement._

"Mathematically, the state psi is alpha times zero plus beta times one. A qubit can exist in a superposition of basis states until it is measured. It is not flickering rapidly between 0 and 1. It is one definite state that simply isn't 0 or 1."

**Reveal 3.** _Normalisation |α|² + |β|² = 1, probabilities, and the coin analogy (flagged as an analogy)._

"Square the size of each amplitude and you get a probability, and they always add up to one. A coin analogy helps a little: a coin is heads or tails. But it is only an analogy. Amplitudes can cancel or reinforce each other, that's interference, and coins can't do that."

**Reveal 4.** _Interactive: drag θ and φ. The vector and probability bars update live._

"Watch: as I tilt the state toward the north pole, the chance of reading 0 goes up. Turning the phase changes the colour but not these probabilities. Phase matters when states interfere, which is where quantum algorithms get their power."

> Bridge: So what happens when we actually look?

## 04. Measurement: the reveal

**Reveal 1.** _The same state. The room gets quieter._

Pause. "Everything so far is the state before we look. Now we measure."

**Reveal 2.** _A measurement pulse hits the qubit. The sphere dims; one outcome glows._

"Measurement produces a definite outcome, a plain 0 or 1. Afterwards the qubit is left in that state; the superposition we prepared is gone."

**Reveal 3.** _Probabilities: P(0) = |α|², P(1) = |β|², with values for this state._

"Which outcome we get is random, but the odds are set by the amplitudes: alpha squared for 0, beta squared for 1. Only an equal superposition is 50–50. This one is not."

**Reveal 4.** _Demo: pick a state, measure once or 100 times, compare the histogram with the prediction._

"Each run prepares the same state again and measures it. One run tells you almost nothing. A hundred runs reveal the amplitudes. Quantum computers are run many times for exactly this reason."

> Bridge: One qubit is interesting. Two qubits can be something stranger.

## 05. Quantum entanglement

**Reveal 1.** _Two qubits, A and B, far apart, each with its own independent orbit._

"Here are two qubits, far apart. Right now each one has its own state, and we can describe them separately."

**Reveal 2.** _A shared structure forms around both; the orbits fall into step. Caption flags it as a conceptual picture._

"Now we entangle them. Entangled qubits share a joint quantum state that cannot be described as independent states of each qubit. The glow is just a picture of that shared description. There is no physical wire."

**Reveal 3.** _Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 and its outcomes._

"The simplest example is this Bell state. Measure both qubits and you get 00 or 11, each half the time. Never 01, never 10."

**Reveal 4.** _Both qubits are measured together and give matching results. Note: correlation, not communication._

"The results always match. But this is not a message. Each side on its own sees a perfectly random 0 or 1, so nobody can use this to send a signal faster than light. The pattern only shows up when you compare notes."

> Bridge: Let's run this for real, many times.

## 06. Entanglement in action

**Reveal 1.** _Measurement demo: press "Measure pair" several times. Tally of 00, 01, 10, 11._

"Every press prepares a fresh Bell pair and measures both qubits. The randomness here is genuine: the browser's cryptographic random generator picks each result. Notice 01 and 10 never appear."

**Reveal 2.** _Statement: correlations that independent classical systems cannot reproduce in every basis._

"To be fair, matching results alone could be faked by a pre-agreed classical rule. The quantum difference appears when you measure in several different bases and compare. Those are Bell tests, and nature breaks the classical limit."

**Reveal 3.** _Why it matters: communication and cryptography, computing, information science._

"These correlations are a resource. They underpin some quantum key distribution schemes, they are created by the entangling gates inside quantum algorithms, and they drive research in quantum information science. Much of this is still research, not everyday technology."

> Bridge: Which brings us to the real question.

## 07. Why should we care?

**Reveal 1.** _A single particle. The question: why should we care?_

"So why should engineers care about any of this?"

**Reveal 2.** _Quantum computing: a circuit forms from light._

"First, computing. For selected problems, like simulating molecules and some optimisation and factoring tasks, quantum algorithms could beat the best known classical methods. Not for everything, and not yet at scale."

**Reveal 3.** _Quantum cryptography and communication: a secure channel._

"Second, communication. Quantum key distribution uses measurement disturbance to reveal eavesdroppers. It already runs on some specialised links."

**Reveal 4.** _Quantum sensing: a sensor picks a tiny signal out of noise._

"Third, sensing. Quantum states are extremely sensitive to their environment, which makes them excellent sensors for magnetic fields, time and gravity."

**Reveal 5.** _Quantum networks: the clusters join into one network._

"And fourth, networks. Researchers are learning to distribute entanglement between distant nodes, a step toward a future quantum internet."

> Bridge: Let's bring it all together.

## 08. The finale

**Reveal 1.** _Everything converges: bits, the state vector, waves, the entangled pair and the network assemble around the sphere._

"Bits. States. Superposition. Measurement. Entanglement. Networks. They all come back to this sphere."

**Reveal 2.** _Statement: the future is not just faster computing._

"The future is not just faster computing. It is a different way of computing, one that uses the rules of nature itself."

**Reveal 3.** _THANK YOU. Any questions? Stays on screen until you move._

"Thank you. I'm happy to take any questions."

---

822 words, about 6–7 minutes spoken.
