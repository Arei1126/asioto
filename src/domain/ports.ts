import type {
  MotionSample,
  SensorPermissionState,
  SoundMode,
  StepEvent,
} from './entities'

export interface MotionSensorPort {
  getPermissionState(): Promise<SensorPermissionState>
  requestPermission(): Promise<SensorPermissionState>
  start(onSample: (sample: MotionSample) => void): void
  stop(): void
}

export interface FootstepPlayerPort {
  getMode(): SoundMode
  setMode(mode: SoundMode): void
  unlock(): Promise<void>
  loadFile(file: File): Promise<void>
  play(step: StepEvent): Promise<void>
}
