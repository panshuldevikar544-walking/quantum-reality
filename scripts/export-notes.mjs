// Writes SPEAKER_NOTES.md from src/content/scenes.ts (run: npm run notes).
// Requires Node 22.18+ (built-in TypeScript type stripping).
import { writeFileSync } from 'node:fs'

const { SCENES } = await import('../src/content/scenes.ts')
let words = 0
const out = ['# Quantum Reality: speaker notes', '']
for (const s of SCENES) {
  out.push(`## ${String(s.number).padStart(2, '0')}. ${s.title}`, '')
  s.steps.forEach((st, i) => {
    words += st.say.split(/\s+/).length
    out.push(`**Reveal ${i + 1}.** _${st.cue}_`, '', st.say, '')
  })
  if (s.transition) out.push(`> Bridge: ${s.transition}`, '')
}
out.push('---', '', `${words} words, about ${Math.round(words / 140)}–${Math.round(words / 120)} minutes spoken.`, '')
writeFileSync(new URL('../SPEAKER_NOTES.md', import.meta.url), out.join('\n'))
console.log(`SPEAKER_NOTES.md written (${words} words)`)
