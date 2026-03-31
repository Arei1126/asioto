export type SensorPermissionState = 'unknown' | 'granted' | 'denied' | 'unsupported'

export type SoundMode = 'square' | 'file'

export interface MotionSample {
  x: number
  y: number
  z: number
  timestamp: number
}

export interface StepEvent {
  timestamp: number
  intensity: number
  isStairStep: boolean
}

export interface StepDetectorConfig {
  stepThreshold: number
  refractoryMs: number
  gravityAlpha: number
  smoothAlpha: number
  stairVerticalThreshold: number
}

export const defaultStepDetectorConfig: StepDetectorConfig = {
  stepThreshold: 1.18,
  refractoryMs: 280,
  gravityAlpha: 0.1,
  smoothAlpha: 0.32,
  stairVerticalThreshold: 0.8,
}
