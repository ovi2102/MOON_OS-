# MOON_OS

> Modular Organization and Observational Network Operating System — a space-themed personal dashboard.

Short, local-first productivity dashboard with tasks, habits, a focus timer, file viewer, and music player.

## Features
- Space-themed dashboard with a 3D wireframe moon (Three.js)
- Task list (add / complete / delete) with constellation visualization
- Habit tracker with 7-day boxes
- Focus timer (start / pause / stop) that accumulates total time
- Embedded file viewer for PDFs, images, and videos
- Local music player (load local audio files, play, pause, seek)
- Editable operator profile (name + agent ID) saved in `localStorage`
- Local persistence for tasks, habits, and total time via `localStorage`

## Quick Start
Requirements: Node.js

1. Install dependencies:

```bash
npm install
```

2. Run the Electron app:

```bash
npm start
```

3. Open as a regular webpage (optional):

- You can host the folder on GitHub Pages or any static server and open `index.html` in a browser.
- Note: `main.js` is the Electron entrypoint and is only used when running the Electron app.

## Browser compatibility notes
- `renderer.js` contains only browser-safe code (Three.js, DOM APIs). There are no direct `require('electron')` calls in the renderer.
- Some behaviors differ between Electron and a browser:
  - Loading local files via the file input (`<input type="file">`) requires user interaction in a browser; you cannot programmatically read arbitrary local files from the filesystem.
  - Embedding local files into an `<iframe>` may be restricted depending on the browser and hosting method (CORS / file:// limitations). Prefer hosting files on the same origin or using the file-picker flow.

## Profile (operator) editing
- Click `EDIT_PROFILE` on the dashboard to change the displayed name and agent ID.
- Values are stored in `localStorage` under the key `moon_profile`.
- To reset defaults, clear that item from the browser DevTools Application → Local Storage, or update `getDefaultProfile()` in `renderer.js`.

## Where to change defaults
- Default profile values are defined in `renderer.js` in `getDefaultProfile()`.

## Contributing
- Small patches welcome. Keep UI and behavior consistent with the current style.
