// Background service worker logic for persistent Pomodoro timer
// This keeps time even if popup is closed.

interface PomodoroState {
  phase: 'work' | 'short-break' | 'long-break' | 'idle';
  endsAt: number | null;
  cycle: number;
  running: boolean;
}

const WORK_MIN = 25;
const SHORT_BREAK_MIN = 5;
const LONG_BREAK_MIN = 15;
const CYCLES_BEFORE_LONG_BREAK = 4;

const initialState: PomodoroState = { phase: 'idle', endsAt: null, cycle: 0, running: false };

async function getState(): Promise<PomodoroState> {
  return new Promise(resolve => {
    chrome.storage.local.get(['pomodoroState'], (res: { pomodoroState?: PomodoroState }) => {
      resolve(res.pomodoroState || initialState);
    });
  });
}

function saveState(state: PomodoroState) {
  chrome.storage.local.set({ pomodoroState: state });
}

function durationFor(phase: PomodoroState['phase']): number {
  switch (phase) {
    case 'work': return WORK_MIN * 60 * 1000;
    case 'short-break': return SHORT_BREAK_MIN * 60 * 1000;
    case 'long-break': return LONG_BREAK_MIN * 60 * 1000;
    default: return 0;
  }
}

async function maybeTransition() {
  const state = await getState();
  if (!state.running || !state.endsAt) return;
  if (Date.now() >= state.endsAt) {
    if (state.phase === 'work') {
      const nextCycle = state.cycle + 1;
      const needsLong = nextCycle % CYCLES_BEFORE_LONG_BREAK === 0;
      const nextPhase: PomodoroState['phase'] = needsLong ? 'long-break' : 'short-break';
      const newState: PomodoroState = { phase: nextPhase, cycle: nextCycle, running: true, endsAt: Date.now() + durationFor(nextPhase) };
      saveState(newState);
      notifyPhase(nextPhase);
    } else {
      const newState: PomodoroState = { ...state, phase: 'idle', running: false, endsAt: null };
      saveState(newState);
      notifyPhase('idle');
    }
  }
}

function notifyPhase(phase: PomodoroState['phase']) {
  const title = phase === 'work' ? 'Focus session' : phase === 'idle' ? 'Session complete' : 'Break started';
  const message = phase === 'work' ? 'Time to focus!' : phase === 'idle' ? 'All done.' : 'Relax for a bit.';
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icon128.png',
    title,
    message
  });
}

chrome.runtime.onMessage.addListener((msg: any, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
  if (msg.type === 'POMODORO_COMMAND') {
    (async () => {
      const state = await getState();
      if (msg.command === 'START' && msg.phase) {
        const newState: PomodoroState = { phase: msg.phase, running: true, cycle: state.cycle, endsAt: Date.now() + durationFor(msg.phase) };
        saveState(newState);
        notifyPhase(msg.phase);
        sendResponse(newState);
      } else if (msg.command === 'STOP') {
        const newState: PomodoroState = { ...state, running: false, phase: 'idle', endsAt: null };
        saveState(newState);
        sendResponse(newState);
      } else if (msg.command === 'GET_STATE') {
        sendResponse(state);
      }
    })();
    return true; // async
  }
});

// Periodic check
setInterval(maybeTransition, 1000);
