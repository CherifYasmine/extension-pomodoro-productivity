
# Focus Productivity Pomodoro Extension

**A Chrome extension for focused work, with Pomodoro timer, daily main task, and dynamic greeting.**

Built with React, TypeScript, and Vite (Manifest V3).

**Features:**
- One "Main Task" for the day (strike-through when completed)
- Pomodoro Focus Mode: Focus, Short Break, Long Break (every 4th cycle)
- Adjustable durations for focus, break, and long break (via settings)
- Pause/resume and auto-continue cycles
- Block distracting websites during Focus mode (customizable list)
- Light/Dark/Auto theme support (system or manual override)

---

## Development

Install deps:

```bash
npm install
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


MIT
