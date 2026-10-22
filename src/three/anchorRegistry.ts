/**
 * Registry of DOM labels that follow 3D objects. Kept free of three.js so the
 * interface shell can render labels without pulling in the 3D engine.
 */
const elements = new Map<string, HTMLElement>()

export function anchorRef(name: string) {
  return (el: HTMLElement | null) => {
    if (el) elements.set(name, el)
    else elements.delete(name)
  }
}

export function getAnchor(name: string): HTMLElement | undefined {
  return elements.get(name)
}
