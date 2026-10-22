/**
 * Procedural soundtrack built entirely with the Web Audio API.
 * No audio files are loaded, so there is nothing to license or fail to fetch.
 *
 * The context is only created inside `enable()`, which is always called from a
 * user gesture (click or key press), so browser autoplay rules are respected.
 */

const MASTER_LEVEL = 0.22 // classroom-friendly ceiling

/** Root drone frequency per scene: a slow harmonic journey through the talk. */
const SCENE_ROOTS = [55, 55, 61.74, 49, 58.27, 58.27, 65.41, 55]

export class AudioEngine {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private sfxBus: GainNode | null = null
  private droneOscs: OscillatorNode[] = []
  private droneFilter: BiquadFilterNode | null = null
  private enabled = false
  private hiddenSuspended = false

  get isEnabled() {
    return this.enabled
  }

  get supported() {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window)
  }

  async enable(scene = 0) {
    if (!this.supported) return false
    if (!this.ctx) this.build()
    const ctx = this.ctx!
    if (ctx.state !== 'running') {
      try {
        await ctx.resume()
      } catch {
        return false
      }
    }
    this.enabled = true
    this.setScene(scene, 0.1)
    const g = this.master!.gain
    g.cancelScheduledValues(ctx.currentTime)
    g.setValueAtTime(g.value, ctx.currentTime)
    g.linearRampToValueAtTime(MASTER_LEVEL, ctx.currentTime + 2.5)
    return true
  }

  disable() {
    this.enabled = false
    if (!this.ctx || !this.master) return
    const ctx = this.ctx
    const g = this.master.gain
    g.cancelScheduledValues(ctx.currentTime)
    g.setValueAtTime(g.value, ctx.currentTime)
    g.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    window.setTimeout(() => {
      if (!this.enabled) ctx.suspend().catch(() => {})
    }, 700)
  }

  /** Pause audio while the tab is hidden; resume when it returns. */
  setHidden(hidden: boolean) {
    if (!this.ctx) return
    if (hidden && this.ctx.state === 'running') {
      this.hiddenSuspended = true
      this.ctx.suspend().catch(() => {})
    } else if (!hidden && this.hiddenSuspended) {
      this.hiddenSuspended = false
      if (this.enabled) this.ctx.resume().catch(() => {})
    }
  }

  destroy() {
    this.enabled = false
    this.droneOscs.forEach((o) => {
      try {
        o.stop()
      } catch {
        /* already stopped */
      }
    })
    this.ctx?.close().catch(() => {})
    this.ctx = null
  }

  /* ----------------------------------------------------------------------- */

  private build() {
    const Ctor: typeof AudioContext =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    this.ctx = ctx

    const master = ctx.createGain()
    master.gain.value = 0
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -14
    limiter.ratio.value = 6
    master.connect(limiter).connect(ctx.destination)
    this.master = master

    // Shared space: a procedurally generated reverb impulse.
    const reverb = ctx.createConvolver()
    reverb.buffer = this.impulse(3.4, 2.6)
    const wet = ctx.createGain()
    wet.gain.value = 0.55
    reverb.connect(wet).connect(master)

    const sfx = ctx.createGain()
    sfx.gain.value = 0.9
    sfx.connect(master)
    sfx.connect(reverb)
    this.sfxBus = sfx

    // Drone: root, fifth and octave sines through a breathing low-pass.
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 420
    filter.Q.value = 0.7
    this.droneFilter = filter
    const droneGain = ctx.createGain()
    droneGain.gain.value = 0.5
    filter.connect(droneGain)
    droneGain.connect(master)
    droneGain.connect(reverb)

    const voices: [number, OscillatorType, number, number][] = [
      [1, 'sine', 0.55, 0],
      [1.5, 'sine', 0.22, 4],
      [2, 'triangle', 0.08, -6],
      [3.01, 'sine', 0.035, 3],
    ]
    for (const [mult, type, level, detune] of voices) {
      const osc = ctx.createOscillator()
      osc.type = type
      osc.frequency.value = SCENE_ROOTS[0] * mult
      osc.detune.value = detune
      const g = ctx.createGain()
      g.gain.value = level
      osc.connect(g).connect(filter)
      osc.start()
      ;(osc as OscillatorNode & { mult: number }).mult = mult
      this.droneOscs.push(osc)
    }

    // Slow LFO on the filter: the drone "breathes" every ~16 s.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.06
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 180
    lfo.connect(lfoGain).connect(filter.frequency)
    lfo.start()

    // Airy texture: band-passed noise with its own slow swell.
    const noise = ctx.createBufferSource()
    noise.buffer = this.noiseBuffer(4)
    noise.loop = true
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.value = 1400
    band.Q.value = 0.8
    const air = ctx.createGain()
    air.gain.value = 0.012
    const airLfo = ctx.createOscillator()
    airLfo.frequency.value = 0.035
    const airLfoGain = ctx.createGain()
    airLfoGain.gain.value = 0.008
    airLfo.connect(airLfoGain).connect(air.gain)
    noise.connect(band).connect(air)
    air.connect(master)
    air.connect(reverb)
    noise.start()
    airLfo.start()
  }

  setScene(scene: number, glide = 3) {
    if (!this.ctx) return
    const root = SCENE_ROOTS[scene] ?? SCENE_ROOTS[0]
    const t = this.ctx.currentTime
    for (const osc of this.droneOscs) {
      const mult = (osc as OscillatorNode & { mult: number }).mult
      osc.frequency.setTargetAtTime(root * mult, t, glide / 3)
    }
    // Measurement scene is quieter and darker.
    const cutoff = scene === 3 ? 260 : scene === 7 ? 560 : 420
    this.droneFilter?.frequency.setTargetAtTime(cutoff, t, 1.5)
  }

  /* ---------------------------- sound effects ---------------------------- */

  private canPlay() {
    return this.enabled && !!this.ctx && this.ctx.state === 'running' && !!this.sfxBus
  }

  /** Soft energy pulse for reveal steps. */
  pulse(pitch = 1) {
    if (!this.canPlay()) return
    const ctx = this.ctx!
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660 * pitch, t)
    osc.frequency.exponentialRampToValueAtTime(330 * pitch, t + 0.5)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.09, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
    osc.connect(g).connect(this.sfxBus!)
    osc.start(t)
    osc.stop(t + 1)
  }

  /** Airy whoosh for scene transitions. */
  whoosh(duration = 1.4) {
    if (!this.canPlay()) return
    const ctx = this.ctx!
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer(duration + 0.2)
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.Q.value = 1.2
    f.frequency.setValueAtTime(300, t)
    f.frequency.exponentialRampToValueAtTime(2400, t + duration * 0.6)
    f.frequency.exponentialRampToValueAtTime(600, t + duration)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.16, t + duration * 0.5)
    g.gain.linearRampToValueAtTime(0, t + duration)
    src.connect(f).connect(g).connect(this.sfxBus!)
    src.start(t)
    src.stop(t + duration + 0.2)
  }

  /** Restrained low impact for major reveals. */
  impact() {
    if (!this.canPlay()) return
    const ctx = this.ctx!
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(110, t)
    osc.frequency.exponentialRampToValueAtTime(38, t + 1.2)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.32, t + 0.015)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2)
    osc.connect(g).connect(this.sfxBus!)
    osc.start(t)
    osc.stop(t + 2.3)

    const n = ctx.createBufferSource()
    n.buffer = this.noiseBuffer(1.5)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(1800, t)
    lp.frequency.exponentialRampToValueAtTime(120, t + 1.2)
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.12, t)
    ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.4)
    n.connect(lp).connect(ng).connect(this.sfxBus!)
    n.start(t)
    n.stop(t + 1.5)
  }

  /** Bell-like tone for a measurement outcome. 0 and 1 have different pitches. */
  chime(outcome: 0 | 1, delay = 0, level = 1) {
    if (!this.canPlay()) return
    const ctx = this.ctx!
    const t = ctx.currentTime + delay
    const base = outcome === 0 ? 523.25 : 392
    for (const [mult, amp] of [
      [1, 0.08],
      [2.76, 0.025],
      [5.4, 0.01],
    ] as const) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = base * mult
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(amp * level, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 2.4 / mult + 0.3)
      osc.connect(g).connect(this.sfxBus!)
      osc.start(t)
      osc.stop(t + 3)
    }
  }

  /** Rising shimmer, used when a shared (entangled) state forms. */
  shimmer() {
    if (!this.canPlay()) return
    const ctx = this.ctx!
    const t = ctx.currentTime
    ;[0, 0.12, 0.24, 0.36].forEach((d, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = [440, 554.37, 659.25, 880][i]
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t + d)
      g.gain.linearRampToValueAtTime(0.03, t + d + 0.2)
      g.gain.exponentialRampToValueAtTime(0.0001, t + d + 2.5)
      osc.connect(g).connect(this.sfxBus!)
      osc.start(t + d)
      osc.stop(t + d + 2.6)
    })
  }

  /* ------------------------------ buffers ------------------------------- */

  private noiseBuffer(seconds: number) {
    const ctx = this.ctx!
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    return buf
  }

  private impulse(seconds: number, decay: number) {
    const ctx = this.ctx!
    const len = Math.ceil(ctx.sampleRate * seconds)
    const buf = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c)
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
    return buf
  }
}

export const audio = new AudioEngine()
