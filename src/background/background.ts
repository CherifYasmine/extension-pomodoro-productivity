// --- Block websites during Focus mode & drive Pomodoro lifecycle (Manifest V3) ---
// Canonical Pomodoro state: { phase: 'focus' | 'break' | 'long-break' | 'idle', running: boolean, endsAt?: number, cycle?: number }

import { autoTransition, normalizeDurations, CYCLES_BEFORE_LONG_BREAK } from '../shared/pomodoroLogic';

let cachedPomodoroState: any = { phase: 'idle', running: false, endsAt: null, cycle: 0 };
let cachedBlockedSites: string[] = [];
let lastNotifiedKey: string | null = null; // phase@endsAt to prevent duplicates

// Ensure we have an offscreen document for audio playback when needed
async function ensureOffscreen() {
  if (!(chrome.offscreen)) return; // Browser might not yet support
  const existing = await chrome.offscreen.hasDocument?.().catch(()=>false);
  if (existing) return;
  try {
    await chrome.offscreen.createDocument({
      justification: 'Play notification sounds when Pomodoro phase changes',
      reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
      url: 'offscreen.html'
    });
  } catch (e) {
    // swallow; not critical for notifications, only sound
  }
}

function phaseTitle(phase: string) {
  return phase === 'focus' ? 'Focus Time!' : phase === 'break' ? 'Break Time!' : phase === 'long-break' ? 'Long Break!' : 'Pomodoro Stopped';
}
function phaseBody(phase: string) {
  return phase === 'focus' ? 'Stay focused and crush your goals!' : phase === 'break' ? 'Take a short break and recharge.' : phase === 'long-break' ? 'Enjoy a longer break—you earned it!' : 'Session ended.';
}

function scheduleAlarm(state: any) {
  if (state?.running && state?.endsAt) {
    chrome.alarms.create('pomodoroPhaseEnd', { when: state.endsAt });
  } else {
    chrome.alarms.clear('pomodoroPhaseEnd');
  }
}

function maybeNotifyPhase(state: any, opts: { notifications: boolean; sound: boolean }) {
  const key = state.phase + '@' + (state.endsAt ?? 'none');
  if (lastNotifiedKey === key) return; // already notified this exact phase instance
  lastNotifiedKey = key;
  if (opts.notifications) {
    chrome.notifications.create('pomodoro-phase', {
      type: 'basic',
      iconUrl: 'icon128.png',
      title: phaseTitle(state.phase),
      message: phaseBody(state.phase)
    });
  }
  if (opts.sound) {
    // send message to offscreen to play sound
    ensureOffscreen().then(() => {
      chrome.runtime.sendMessage({ type: 'PLAY_PHASE_SOUND' });
    });
  }
}

function updateBlockingRules() {
  // Remove all previous rules
  chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: Array.from({length: 100}, (_, i) => i + 1) }, () => {
    // Only add rules if Focus mode is active
    if (cachedPomodoroState.running && cachedPomodoroState.phase === 'focus' && cachedBlockedSites.length) {
      const rules = cachedBlockedSites.map((site, idx) => ({
        id: idx + 1,
        priority: 1,
        action: {
          type: "redirect" as const,
          redirect: {
            extensionPath: "/blocked.html"
          }
        },
        condition: {
          urlFilter: `*://*.${site}/*`,
          resourceTypes: ["main_frame" as const]
        }
      }));
      chrome.declarativeNetRequest.updateDynamicRules({ addRules: rules }, () => {});
    }
  });
}

chrome.storage.local.get(['pomodoroState', 'blockedSites', 'pomodoroNotifications', 'pomodoroSound', 'pomodoroDurations'], res => {
  if (res.pomodoroState) cachedPomodoroState = res.pomodoroState;
  if (Array.isArray(res.blockedSites)) cachedBlockedSites = res.blockedSites;
  // schedule alarm for current state
  scheduleAlarm(cachedPomodoroState);
  updateBlockingRules();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    let changed = false;
    if (changes.pomodoroState && changes.pomodoroState.newValue) {
      cachedPomodoroState = changes.pomodoroState.newValue;
      scheduleAlarm(cachedPomodoroState);
      changed = true;
    }
    if (changes.blockedSites && Array.isArray(changes.blockedSites.newValue)) {
      cachedBlockedSites = changes.blockedSites.newValue;
      changed = true;
    }
    if (changed) updateBlockingRules();
  }
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'pomodoroPhaseEnd') {
    chrome.storage.local.get(['pomodoroState','pomodoroDurations','pomodoroNotifications','pomodoroSound'], res => {
      const state = res.pomodoroState;
      if (!state) return;
      const durations = normalizeDurations(res.pomodoroDurations);
      const next = autoTransition(state, durations, Date.now());
      if (next) {
        chrome.storage.local.set({ pomodoroState: next }, () => {
          maybeNotifyPhase(next, { notifications: res.pomodoroNotifications !== false, sound: res.pomodoroSound !== false });
        });
      } else {
        // If no transition (rare timing mismatch) reschedule if still running
        scheduleAlarm(state);
      }
    });
  }
});
