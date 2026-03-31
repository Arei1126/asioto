import type { SensorPermissionState, SoundMode } from '../domain/entities'

export type StepKind = 'flat' | 'stairs'

export interface AppState {
  isRunning: boolean
  permission: SensorPermissionState
  stepCount: number
  threshold: number
  soundMode: SoundMode
  hasAudioFile: boolean
  lastStepKind: StepKind | null
  lastStepAt: number | null
  error: string | null
}

export const initialAppState: AppState = {
  isRunning: false,
  permission: 'unknown',
  stepCount: 0,
  threshold: 1.18,
  soundMode: 'square',
  hasAudioFile: false,
  lastStepKind: null,
  lastStepAt: null,
  error: null,
}
