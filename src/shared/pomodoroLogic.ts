// --- Notification & Sound helpers ---
export function playPhaseSound(phase: string) {
  new Audio('/sounds/notification.wav').play();
}

export function showPhaseNotification(phase: string) {
  const titles: Record<string, string> = {
    focus: 'Focus Time!',
    break: 'Break Time!',
    'long-break': 'Long Break!',
    idle: 'Pomodoro Stopped'
  };
  const bodies: Record<string, string> = {
    focus: 'Stay focused and crush your goals!',
    break: 'Take a short break and recharge.',
    'long-break': 'Enjoy a longer break—you earned it!',
    idle: 'Session ended.'
  };
  if (window.Notification && Notification.permission === 'granted') {
    new Notification(titles[phase] || 'Pomodoro', { body: bodies[phase] || '', icon: '/icon128.png' });
  } else if (window.Notification && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

export const CYCLES_BEFORE_LONG_BREAK = 4;

export type CanonicalPhase = 'focus' | 'break' | 'long-break' | 'idle';
export interface PomodoroStateCanonical {
  phase: CanonicalPhase;
  endsAt: number | null;
  running: boolean;
  pausedAt?: number | null;
  cycle: number; // completed focus sessions in current set
}

export interface Durations {
  focus: number; break: number; long: number;
}

export const DEFAULT_DURATIONS: Durations = { focus: 25, break: 5, long: 15 };

export function normalizeDurations(raw: any): Durations {
  if (!raw) return DEFAULT_DURATIONS;
  return {
    focus: Number(raw.focus ?? raw.work) || DEFAULT_DURATIONS.focus,
    break: Number(raw.break ?? raw.short) || DEFAULT_DURATIONS.break,
    long: Number(raw.long) || DEFAULT_DURATIONS.long,
  };
}

export function computeDisplayCycle(state: PomodoroStateCanonical): number {
  const completed = state.cycle || 0;
  // During an active/paused focus show completed+1 up to 4
  if (state.phase === 'focus' && (state.running || state.pausedAt)) {
    const next = (completed % CYCLES_BEFORE_LONG_BREAK) + 1;
    return next === 0 ? 1 : next;
  }
  const modded = completed % CYCLES_BEFORE_LONG_BREAK;
  // If we've completed a full set (e.g. cycle=4) and are on a break/long-break/idle, display 4 not 0.
  if (modded === 0 && completed > 0) return CYCLES_BEFORE_LONG_BREAK;
  return modded;
}

export function startFocus(state: PomodoroStateCanonical, durations: Durations, now = Date.now()): PomodoroStateCanonical {
  return {
    ...state,
    phase: 'focus',
    running: true,
    pausedAt: null,
    endsAt: now + durations.focus * 60 * 1000,
  };
}

export function startBreakPhase(state: PomodoroStateCanonical, durations: Durations, now = Date.now()): PomodoroStateCanonical {
  const nextCycle = state.cycle + 1; // increment after finished focus BEFORE calling this
  const needsLong = nextCycle % CYCLES_BEFORE_LONG_BREAK === 0;
  return {
    ...state,
    phase: needsLong ? 'long-break' : 'break',
    running: true,
    pausedAt: null,
    endsAt: now + (needsLong ? durations.long : durations.break) * 60 * 1000,
    cycle: nextCycle,
  };
}

// Manual break start (user clicks Break tab) should NOT increment cycle; it is a voluntary interruption.
export function manualStartBreak(state: PomodoroStateCanonical, durations: Durations, longBreak = false, now = Date.now()): PomodoroStateCanonical {
  return {
    ...state,
    phase: longBreak ? 'long-break' : 'break',
    running: true,
    pausedAt: null,
    endsAt: now + (longBreak ? durations.long : durations.break) * 60 * 1000,
    cycle: state.cycle // unchanged
  };
}

export function startNextFocusAfterBreak(state: PomodoroStateCanonical, durations: Durations, now = Date.now()): PomodoroStateCanonical {
  return {
    ...state,
    phase: 'focus',
    running: true,
    pausedAt: null,
    endsAt: now + durations.focus * 60 * 1000,
  };
}

export function pauseState(state: PomodoroStateCanonical, now = Date.now()): PomodoroStateCanonical {
  if (!state.running || !state.endsAt) return state;
  const remaining = state.endsAt - now;
  return { ...state, running: false, pausedAt: remaining, endsAt: null };
}

export function resumeState(state: PomodoroStateCanonical, now = Date.now()): PomodoroStateCanonical {
  if (state.running || !state.pausedAt) return state;
  return { ...state, running: true, endsAt: now + state.pausedAt, pausedAt: null };
}

export function stopState(): PomodoroStateCanonical {
  return { phase: 'idle', endsAt: null, running: false, pausedAt: null, cycle: 0 };
}

export function autoTransition(state: PomodoroStateCanonical, durations: Durations, now = Date.now()): PomodoroStateCanonical | null {
  if (!state.running || !state.endsAt) return null;
  if (now < state.endsAt) return null;
  if (state.phase === 'focus') {
    return startBreakPhase(state, durations, now);
  }
  if (state.phase === 'break' || state.phase === 'long-break') {
    return startNextFocusAfterBreak(state, durations, now);
  }
  return null;
}

export function persistState(next: PomodoroStateCanonical) {
  chrome.storage.local.set({ pomodoroState: next });
}

export function readState(callback: (s: PomodoroStateCanonical, d: Durations) => void) {
  chrome.storage.local.get(['pomodoroState','pomodoroDurations'], (res) => {
    const durations = normalizeDurations(res.pomodoroDurations);
    const base: PomodoroStateCanonical = res.pomodoroState || stopState();
    callback(base, durations);
  });
}
