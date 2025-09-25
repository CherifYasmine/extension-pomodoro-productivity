// --- Block websites during Focus mode (Manifest V3) ---
// Canonical Pomodoro state: { phase: 'focus' | 'break' | 'long-break' | 'idle', running: boolean, ... }
let cachedPomodoroState = { phase: 'idle', running: false };
let cachedBlockedSites: string[] = [];

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

chrome.storage.local.get(['pomodoroState', 'blockedSites'], res => {
  if (res.pomodoroState) cachedPomodoroState = res.pomodoroState;
  if (Array.isArray(res.blockedSites)) cachedBlockedSites = res.blockedSites;
  updateBlockingRules();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local') {
    let changed = false;
    if (changes.pomodoroState && changes.pomodoroState.newValue) {
      cachedPomodoroState = changes.pomodoroState.newValue;
      changed = true;
    }
    if (changes.blockedSites && Array.isArray(changes.blockedSites.newValue)) {
      cachedBlockedSites = changes.blockedSites.newValue;
      changed = true;
    }
    if (changed) updateBlockingRules();
  }
});
