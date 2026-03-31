import { StepDetector } from '../domain/StepDetector'
import type { SoundMode } from '../domain/entities'
import type { FootstepPlayerPort, MotionSensorPort } from '../domain/ports'
import { initialAppState, type AppState, type StepKind } from './types'

type Listener = (state: AppState) => void

export class FootstepController {
  private readonly sensor: MotionSensorPort
  private readonly player: FootstepPlayerPort
  private readonly detector: StepDetector
  private readonly listeners = new Set<Listener>()
  private state: AppState

  constructor(sensor: MotionSensorPort, player: FootstepPlayerPort) {
    this.sensor = sensor
    this.player = player
    this.detector = new StepDetector({ stepThreshold: initialAppState.threshold })
    this.state = { ...initialAppState }
  }

  getState(): AppState {
    return this.state
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    listener(this.state)

    return () => {
      this.listeners.delete(listener)
    }
  }

  async refreshPermission(): Promise<void> {
    const permission = await this.sensor.getPermissionState()
    this.setState({ permission })
  }

  async start(): Promise<void> {
    if (this.state.isRunning) {
      return
    }

    await this.player.unlock()

    let permission = await this.sensor.getPermissionState()
    if (permission !== 'granted') {
      permission = await this.sensor.requestPermission()
    }

    this.setState({ permission })

    if (permission !== 'granted') {
      this.setState({
        error: 'モーションセンサーの許可が必要です。',
      })
      return
    }

    this.sensor.start((sample) => {
      const step = this.detector.handleSample(sample)
      if (!step) {
        return
      }

      const kind: StepKind = step.isStairStep ? 'stairs' : 'flat'
      void this.player.play(step)
      this.setState({
        stepCount: this.state.stepCount + 1,
        lastStepKind: kind,
        lastStepAt: step.timestamp,
        error: null,
      })
    })

    this.setState({ isRunning: true, error: null })
  }

  stop(): void {
    this.sensor.stop()
    this.setState({ isRunning: false })
  }

  setThreshold(next: number): void {
    this.detector.setConfig({ stepThreshold: next })
    this.setState({ threshold: next })
  }

  setSoundMode(mode: SoundMode): void {
    this.player.setMode(mode)
    this.setState({ soundMode: mode })
  }

  async loadSoundFile(file: File): Promise<void> {
    await this.player.loadFile(file)
    this.player.setMode('file')
    this.setState({
      soundMode: 'file',
      hasAudioFile: true,
      error: null,
    })
  }

  resetCounter(): void {
    this.setState({
      stepCount: 0,
      lastStepAt: null,
      lastStepKind: null,
    })
  }

  private setState(patch: Partial<AppState>): void {
    this.state = { ...this.state, ...patch }
    for (const listener of this.listeners) {
      listener(this.state)
    }
  }
}
