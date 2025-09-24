
# Focus Productivity Pomodoro Extension

**A Chrome extension for focused work, with Pomodoro timer, daily main task, and dynamic greeting.**

Built with React, TypeScript, and Vite (Manifest V3).

**Features:**

- Dynamic greeting (Good morning/afternoon/evening) with your editable name
- One "Main Task" for the day (strike-through when completed)
- Pomodoro Focus Mode: Focus, Short Break, Long Break (every 4th cycle)
- Fully persistent: all state (name, task, timer, settings) saved in chrome.storage
- Adjustable durations for focus, break, and long break (via settings)
- Pause/resume and auto-continue cycles
- Long break after every 4 focus sessions
- Consistent experience in popup and new tab
- Sound and notification on every phase change (can be toggled in settings)
- Modern, minimal UI


## Key Features Table

| Feature      | Details |
|--------------|---------|
| Greeting     | Dynamic by time of day, editable name |
| Main Task    | One focus task per day, strike-through on complete |
| Pomodoro     | Focus/Break/Long Break, auto-cycles, pause/resume |
| Durations    | All durations configurable in settings |
| Persistence  | All state saved in chrome.storage.local |
| Notifications| Sound + desktop notification on phase change |
| Sync         | Popup and new tab always in sync |


## Quick Description (for GitHub)

> A Chrome extension for focused productivity: Pomodoro timer, daily main task, and dynamic greeting. Fully persistent, customizable, and beautifully minimal. Works in both popup and new tab.

---

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


## Possible Future Enhancements

- Session stats/history
- Optional dark/light themes
- More notification/sound options


## License

MIT
