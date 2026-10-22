import { anchorRef } from '../three/anchorRegistry'
import { Ket, V } from './MathText'

/**
 * Labels that follow 3D objects. Rendered once, positioned every frame by
 * the actors that own them (via placeAnchor).
 */
export function AnchoredLabels() {
  return (
    <div className="anchors" aria-hidden="true">
      <div ref={anchorRef('bloch-0')} className="anchor bloch-label">
        <span className="bloch-amp">
          <V>α</V>
        </span>
        <Ket>0</Ket>
      </div>
      <div ref={anchorRef('bloch-1')} className="anchor bloch-label">
        <span className="bloch-amp">
          <V>β</V>
        </span>
        <Ket>1</Ket>
      </div>
      <div ref={anchorRef('bit-0')} className="anchor bit-digit">
        0
      </div>
      <div ref={anchorRef('bit-1')} className="anchor bit-digit">
        1
      </div>
      <div ref={anchorRef('pair-a-label')} className="anchor pair-label">
        Qubit A
      </div>
      <div ref={anchorRef('pair-b-label')} className="anchor pair-label">
        Qubit B
      </div>
      <div ref={anchorRef('pair-a-out')} className="anchor pair-outcome" />
      <div ref={anchorRef('pair-b-out')} className="anchor pair-outcome" />
    </div>
  )
}
