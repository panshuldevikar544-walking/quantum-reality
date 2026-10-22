import type { ComponentType } from 'react'
import { Reveal } from '../ui/Reveal'
import { ChannelGlyph, CircuitGlyph, NetworkGlyph, SensorGlyph } from './AppGlyphs'

const AREAS: { title: string; line: string; Glyph: ComponentType }[] = [
  { title: 'Quantum computing', line: 'Potentially useful for selected problems, such as simulating molecules.', Glyph: CircuitGlyph },
  {
    title: 'Cryptography and communication',
    line: 'Quantum principles support specialised security protocols, like key distribution.',
    Glyph: ChannelGlyph,
  },
  { title: 'Quantum sensing', line: 'Fragile quantum states make extremely sensitive measurements.', Glyph: SensorGlyph },
  { title: 'Quantum networks', line: 'Research toward distributing entanglement between distant nodes.', Glyph: NetworkGlyph },
]

/** Scene 7 overlay: four application areas, revealed one at a time. */
export function Scene07Why({ step }: { step: number }) {
  return (
    <div className="ov">
      <div className="why-col">
        <Reveal show className={`why-head${step > 0 ? ' is-compact' : ''}`} delay={0.4} duration={1.4}>
          <h2>Why should we care?</h2>
        </Reveal>
        <div className="areas" role="list">
          {AREAS.map(({ title, line, Glyph }, i) => {
            const n = i + 1
            return (
              <Reveal key={title} show={step >= n} delay={0.15}>
                <div role="listitem" className={`area${step === n ? ' is-current' : ''}`}>
                  <Glyph />
                  <div>
                    <h3>{title}</h3>
                    <p>{line}</p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
        <Reveal show={step >= 4} className="why-foot" delay={1.2}>
          <p className="aside">Not faster at everything: an advantage only where quantum effects fit the problem.</p>
        </Reveal>
      </div>
    </div>
  )
}
