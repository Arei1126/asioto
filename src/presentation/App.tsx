import { useEffect, useMemo, useState } from 'react'
import { FootstepController } from '../application/createFootstepController'
import type { AppState } from '../application/types'
import { BrowserMotionSensor } from '../infrastructure/BrowserMotionSensor'
import { WebAudioFootstepPlayer } from '../infrastructure/WebAudioFootstepPlayer'
import './App.css'

function formatPermissionLabel(state: AppState['permission']): string {
  if (state === 'granted') return 'sensor: granted'
  if (state === 'denied') return 'sensor: denied'
  if (state === 'unsupported') return 'sensor: unsupported'
  return 'sensor: unknown'
}

export function App() {
  const controller = useMemo(
    () => new FootstepController(new BrowserMotionSensor(), new WebAudioFootstepPlayer()),
    [],
  )
  const [state, setState] = useState<AppState>(controller.getState())

  useEffect(() => {
    const unsubscribe = controller.subscribe(setState)
    void controller.refreshPermission()

    return () => {
      controller.stop()
      unsubscribe()
    }
  }, [controller])

  return (
    <main className="app">
      <section className="panel">
        <header className="header">
          <h1 className="brand">ASIOTO</h1>
          <p className="muted">minimal step sound pwa</p>
        </header>

        <section className="counter" aria-live="polite">
          <p className="label">step count</p>
          <p className="counter-value">{state.stepCount}</p>
          <div className="status-row">
            <span className={`badge ${state.isRunning ? 'ok' : ''}`}>
              {state.isRunning ? 'running' : 'idle'}
            </span>
            <span className="badge">{formatPermissionLabel(state.permission)}</span>
            <span className="badge">
              last step: {state.lastStepKind ? (state.lastStepKind === 'stairs' ? 'stairs-like' : 'flat') : '-'}
            </span>
          </div>
        </section>

        <section className="controls">
          <div className="row">
            <div className="block">
              <label className="label" htmlFor="threshold">
                sensitivity threshold ({state.threshold.toFixed(2)})
              </label>
              <input
                id="threshold"
                type="range"
                min="0.8"
                max="2.2"
                step="0.01"
                value={state.threshold}
                onChange={(event) => controller.setThreshold(Number(event.target.value))}
              />
            </div>

            <div className="block">
              <label className="label" htmlFor="sound-mode">
                sound source
              </label>
              <select
                id="sound-mode"
                value={state.soundMode}
                onChange={(event) =>
                  controller.setSoundMode(event.target.value === 'file' ? 'file' : 'square')
                }
              >
                <option value="square">Square wave (default)</option>
                <option value="file" disabled={!state.hasAudioFile}>
                  Audio file {state.hasAudioFile ? '' : '(load first)'}
                </option>
              </select>
              <input
                type="file"
                accept="audio/*"
                onChange={(event) => {
                  const file = event.target.files?.[0]
                  if (!file) {
                    return
                  }
                  void controller.loadSoundFile(file)
                }}
              />
            </div>
          </div>

          <div className="actions">
            <button className="primary" type="button" onClick={() => void controller.start()}>
              Start sensing
            </button>
            <button type="button" onClick={() => controller.stop()}>
              Stop
            </button>
            <button type="button" onClick={() => controller.resetCounter()}>
              Reset counter
            </button>
          </div>
        </section>

        <p className="muted">
          階段判定は加速度の鉛直成分から推定する簡易モードです。高度センサー連携は拡張ポイントとして後続実装できます。
        </p>

        {state.error && <p className="error">{state.error}</p>}
      </section>
    </main>
  )
}
