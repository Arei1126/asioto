import type { SoundMode, StepEvent } from '../domain/entities'
import type { FootstepPlayerPort } from '../domain/ports'

export class WebAudioFootstepPlayer implements FootstepPlayerPort {
  private mode: SoundMode = 'square'
  private audioContext: AudioContext | null = null
  private fileBuffer: AudioBuffer | null = null

  getMode(): SoundMode {
    return this.mode
  }

  setMode(mode: SoundMode): void {
    this.mode = mode
  }

  async unlock(): Promise<void> {
    this.audioContext ??= new AudioContext()
    if (this.audioContext.state !== 'running') {
      await this.audioContext.resume()
    }
  }

  async loadFile(file: File): Promise<void> {
    await this.unlock()
    if (!this.audioContext) {
      return
    }

    const buffer = await file.arrayBuffer()
    this.fileBuffer = await this.audioContext.decodeAudioData(buffer)
  }

  async play(step: StepEvent): Promise<void> {
    await this.unlock()
    if (!this.audioContext) {
      return
    }

    if (this.mode === 'file' && this.fileBuffer) {
      this.playFileBuffer(step)
      return
    }

    this.playSquareWave(step)
  }

  private playFileBuffer(step: StepEvent): void {
    if (!this.audioContext || !this.fileBuffer) {
      return
    }

    const source = this.audioContext.createBufferSource()
    const gain = this.audioContext.createGain()
    source.buffer = this.fileBuffer
    source.playbackRate.value = step.isStairStep ? 1.12 : 1

    const now = this.audioContext.currentTime
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.95, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.21)

    source.connect(gain)
    gain.connect(this.audioContext.destination)
    source.start(now)
    source.stop(now + 0.25)
  }

  private playSquareWave(step: StepEvent): void {
    if (!this.audioContext) {
      return
    }

    const now = this.audioContext.currentTime
    const oscillator = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    oscillator.type = 'square'
    const baseFreq = step.isStairStep ? 198 : 140
    oscillator.frequency.setValueAtTime(baseFreq + step.intensity * 16, now)

    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.34, now + 0.008)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)

    oscillator.connect(gain)
    gain.connect(this.audioContext.destination)

    oscillator.start(now)
    oscillator.stop(now + 0.14)
  }
}
