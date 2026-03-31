import {
  defaultStepDetectorConfig,
  type MotionSample,
  type StepDetectorConfig,
  type StepEvent,
} from './entities'

export class StepDetector {
  private config: StepDetectorConfig
  private gravity = { x: 0, y: 0, z: 0 }
  private smoothMagnitude = 0
  private smoothVertical = 0
  private previousSmoothMagnitude = 0
  private refractoryUntil = 0

  constructor(config: Partial<StepDetectorConfig> = {}) {
    this.config = { ...defaultStepDetectorConfig, ...config }
  }

  setConfig(partial: Partial<StepDetectorConfig>): void {
    this.config = { ...this.config, ...partial }
  }

  getConfig(): StepDetectorConfig {
    return { ...this.config }
  }

  handleSample(sample: MotionSample): StepEvent | null {
    const { gravityAlpha, smoothAlpha, stepThreshold, refractoryMs, stairVerticalThreshold } = this.config

    this.gravity.x = (1 - gravityAlpha) * this.gravity.x + gravityAlpha * sample.x
    this.gravity.y = (1 - gravityAlpha) * this.gravity.y + gravityAlpha * sample.y
    this.gravity.z = (1 - gravityAlpha) * this.gravity.z + gravityAlpha * sample.z

    const linearX = sample.x - this.gravity.x
    const linearY = sample.y - this.gravity.y
    const linearZ = sample.z - this.gravity.z

    const magnitude = Math.sqrt(linearX ** 2 + linearY ** 2 + linearZ ** 2)
    this.smoothMagnitude = (1 - smoothAlpha) * this.smoothMagnitude + smoothAlpha * magnitude

    const gravityNorm = Math.hypot(this.gravity.x, this.gravity.y, this.gravity.z) || 1
    const vertical =
      (linearX * this.gravity.x + linearY * this.gravity.y + linearZ * this.gravity.z) / gravityNorm
    this.smoothVertical = (1 - smoothAlpha) * this.smoothVertical + smoothAlpha * vertical

    const crossedThreshold =
      this.previousSmoothMagnitude <= stepThreshold && this.smoothMagnitude > stepThreshold
    const outsideRefractory = sample.timestamp >= this.refractoryUntil

    this.previousSmoothMagnitude = this.smoothMagnitude

    if (!crossedThreshold || !outsideRefractory) {
      return null
    }

    this.refractoryUntil = sample.timestamp + refractoryMs

    return {
      timestamp: sample.timestamp,
      intensity: this.smoothMagnitude,
      isStairStep: this.smoothVertical > stairVerticalThreshold,
    }
  }
}
