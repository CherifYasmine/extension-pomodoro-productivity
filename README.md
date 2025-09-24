# Focus Productivity Pomodoro Extension

A Chrome Manifest V3 extension built with React + Vite that shows:

- Live clock with HH:MM:SS
- Dynamic greeting (Good morning/afternoon/evening) with your name (editable)
- One "Main Task" for the day (strike-through when completed)
- Pomodoro style Focus Mode (work / short break / long break cycles)
- Persistent state via chrome.storage
- Notifications when sessions or breaks start/end

## Features

| Feature | Details |
|---------|---------|
| Greeting | Automatically changes by time of day, double-click name to edit |
| Main Task | Add one focus task; checkbox toggles completion (strike-through) |
| Pomodoro | Work (25m), Short Break (5m), Long Break (15m every 4th cycle) |
| Persistence | Name, task, and pomodoro state saved in local storage |
| Notifications | System notification when a phase transitions |

## Development

Install deps and run dev server (popup runs in a small Vite dev window; background built separately at build time):

```bash
npm install
npm run dev
```

Vite dev won't load directly as an extension. To test the extension you must build:

```bash
npm run build
```

This outputs to `dist/`.

## Load in Chrome

1. Build: `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist` folder

## Project Structure

```
public/manifest.json         # Extension manifest (copied to dist root)
src/background/background.ts # Service worker (built to dist/background.js)
src/popup/popup.html         # Popup HTML entry (becomes dist/popup.html)
src/popup/popup.tsx          # React entrypoint for popup UI
```

## Future Enhancements

- Configurable durations
- Sound/vibration alerts
- Stats/history of completed sessions
- Optional dark/light themes

## License

MIT
