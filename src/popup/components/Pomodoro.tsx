import { useCallback, useEffect, useState } from 'react';
import {
  normalizeDurations,
  PomodoroStateCanonical,
  startFocus,
  pauseState,
  resumeState,
  stopState,
  autoTransition,
  persistState,
  readState,
  computeDisplayCycle,
  CYCLES_BEFORE_LONG_BREAK,
  startBreakPhase
} from '../../shared/pomodoroLogic';

// We keep canonical state directly; compute display strings when rendering.
const initialState: PomodoroStateCanonical = { phase: 'idle', endsAt: null, running: false, cycle: 0 };

function formatTime(msRemaining: number) {
  const totalSec = Math.max(0, Math.floor(msRemaining / 1000));
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export const Pomodoro: React.FC = () => {
  const [state, setState] = useState<PomodoroStateCanonical>(initialState);
  const [tick, setTick] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [durations, setDurations] = useState(normalizeDurations(null));

  // Pull state from background (if implemented) else local fallback
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    readState((s, d) => { setState(s); setDurations(d); });
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.pomodoroState && changes.pomodoroState.newValue) setState(changes.pomodoroState.newValue as PomodoroStateCanonical);
      if (changes.pomodoroDurations && changes.pomodoroDurations.newValue) {
        setDurations(normalizeDurations(changes.pomodoroDurations.newValue));
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      clearInterval(interval);
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const persist = (next: PomodoroStateCanonical) => { persistState(next); setState(next); };

  const startPhase = useCallback((phase: 'focus' | 'break' | 'long-break') => {
    readState((raw, durs) => {
      let base = raw;
      // If we request a break manually, treat as immediate post-focus break incrementing cycle
      if (phase === 'focus') {
        persist(startFocus(base, durs));
      } else if (phase === 'break') {
        // Manually start short break: increment cycle like a completed focus
        const withInc: PomodoroStateCanonical = { ...base, phase: 'focus' }; // fake previous phase
        const next = startBreakPhase(withInc, durs);
        persist({ ...next, phase: 'break' });
      } else {
        persist({ ...base, phase: 'long-break', running: true, pausedAt: null, endsAt: Date.now() + durs.long * 60 * 1000 });
      }
    });
  }, []);

  const stop = () => persist(stopState());

  const pause = () => readState((raw) => { if (raw.phase !== 'idle') persist(pauseState(raw)); });
  const resume = () => readState((raw) => { if (raw.phase !== 'idle') persist(resumeState(raw)); });

  // Auto transition + cycle increment only after completed work session.
  // Now: automatically run breaks and next focus to mirror new tab behavior.
  useEffect(() => {
    if (!state.running || !state.endsAt) return;
    const maybe = autoTransition(state, durations);
    if (maybe) persist(maybe);
  }, [state, tick, durations]);

  const remainingMs = state.running && state.endsAt ? state.endsAt - Date.now() : state.pausedAt || 0;

  const startWork = () => startPhase('focus');
  const startBreak = () => startPhase('break');
  const startLongBreak = () => startPhase('long-break');

  return (
    <div className="pomodoro">
      <h2>Focus Mode</h2>
      <div className="status">
  {state.phase === 'idle' ? 'Idle' : (state.phase === 'focus' ? 'Work' : state.phase === 'break' ? 'Short Break' : 'Long Break')}
      </div>
  <div className="time">{(state.running && remainingMs > 0) || state.pausedAt ? formatTime(remainingMs) : '--:--'}</div>
      <div className="controls">
        {state.phase === 'idle' && (
          <>
            <button onClick={() => startPhase('focus')}>Start Work</button>
            <button onClick={() => startPhase('break')}>Short Break</button>
            <button onClick={() => startPhase('long-break')}>Long Break</button>
          </>
        )}
        {state.phase !== 'idle' && state.running && <>
          <button onClick={stop}>Stop</button>
          <button onClick={pause}>Pause</button>
        </>}
        {state.phase !== 'idle' && !state.running && state.pausedAt != null && <button onClick={resume}>Resume</button>}
      </div>
      <div className="meta">
        {(() => {
          // Mirror new tab display semantics: state.cycle counts completed focus sessions.
          // While in an active/paused work session, show current session number = completed + 1.
          const display = computeDisplayCycle(state);
          return `Cycle: ${display}/${CYCLES_BEFORE_LONG_BREAK}`;
        })()}
      </div>
    </div>
  );
};
