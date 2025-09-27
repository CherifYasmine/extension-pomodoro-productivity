// Offscreen document script: receives a runtime message to play a sound.
// MV3 service workers cannot directly play audio reliably, so we use an offscreen document.

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === 'PLAY_PHASE_SOUND') {
    const audio = new Audio('/sounds/notification.wav');
    audio.currentTime = 0;
    audio.play().then(() => sendResponse({ ok: true })).catch(err => sendResponse({ ok: false, error: String(err) }));
    return true; // async
  }
});
