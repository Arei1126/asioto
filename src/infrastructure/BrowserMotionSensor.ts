import type { MotionSample, SensorPermissionState } from '../domain/entities'
import type { MotionSensorPort } from '../domain/ports'

type DeviceMotionWithPermission = typeof DeviceMotionEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>
}

export class BrowserMotionSensor implements MotionSensorPort {
  private onSample: ((sample: MotionSample) => void) | null = null

  private readonly onDeviceMotion = (event: DeviceMotionEvent): void => {
    const source = event.accelerationIncludingGravity ?? event.acceleration
    if (!source) {
      return
    }

    this.onSample?.({
      x: source.x ?? 0,
      y: source.y ?? 0,
      z: source.z ?? 0,
      timestamp: event.timeStamp || performance.now(),
    })
  }

  async getPermissionState(): Promise<SensorPermissionState> {
    if (typeof window === 'undefined' || typeof window.DeviceMotionEvent === 'undefined') {
      return 'unsupported'
    }

    const ctor = window.DeviceMotionEvent as DeviceMotionWithPermission
    if (typeof ctor.requestPermission === 'function') {
      return 'unknown'
    }

    return 'granted'
  }

  async requestPermission(): Promise<SensorPermissionState> {
    if (typeof window === 'undefined' || typeof window.DeviceMotionEvent === 'undefined') {
      return 'unsupported'
    }

    const ctor = window.DeviceMotionEvent as DeviceMotionWithPermission
    if (typeof ctor.requestPermission !== 'function') {
      return 'granted'
    }

    try {
      const result = await ctor.requestPermission()
      return result === 'granted' ? 'granted' : 'denied'
    } catch {
      return 'denied'
    }
  }

  start(onSample: (sample: MotionSample) => void): void {
    this.onSample = onSample
    window.addEventListener('devicemotion', this.onDeviceMotion, { passive: true })
  }

  stop(): void {
    window.removeEventListener('devicemotion', this.onDeviceMotion)
    this.onSample = null
  }
}
