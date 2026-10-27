# PlantTwin JARVIS OS

**Release package: V12** — local-development source, backend, frontend source/build assets, Windows scripts and automated checks.

PlantTwin JARVIS OS combines a plant-care dashboard, an interactive procedural 3D plant illustration, a multilingual JARVIS assistant, plant diaries, watering logs, tasks/reminders, weather lookup and an optional Windows app launcher. The interface includes dark/light appearance, collapsible desktop navigation and mobile navigation.

## V13 Advanced edition
After starting backend + frontend, open **http://localhost:5173/advanced.html** for the combined JARVIS + 3D Plant Twin workspace (no CDN needed). See `V13_CHANGELOG.md`.

## Requirements
- Python 3.11+ (Python 3.12 recommended)
- Node.js 20+
- Internet access for the full React/Three.js dashboard, weather, and optional AI-provider calls; an included standalone offline workspace runs without external JavaScript modules

## Quick start on Windows
1. Extract the ZIP file.
2. Open the extracted `PlantTwin-JARVIS-OS` folder in VS Code.
3. Run `START_PLANTTWIN_WINDOWS.bat` (it installs backend Python dependencies and opens backend/frontend terminals; the frontend build does not need npm package installation).
4. Open the frontend URL printed by the script, normally `http://localhost:5173`.

If the start script is not suitable, open two PowerShell terminals. The frontend source includes a checked-in transpiled ESM release and Node built-in build/server scripts so `npm run build` works without downloading npm packages. The frontend manifest also declares the React, Lucide, Three.js and TypeScript dependencies for normal connected development. React, React DOM, Lucide icons and Three.js are loaded from esm.sh in the browser, so the browser still needs internet access.

**Terminal 1 — backend**
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
API health: `http://127.0.0.1:8000/health`; interactive API docs: `http://127.0.0.1:8000/docs`.

**Terminal 2 — frontend**
```powershell
cd frontend
npm run dev
```
Open `http://localhost:5173`.

Build and verify the static frontend without installing npm dependencies:
```powershell
cd frontend
npm run build
npm run check
```
`npm run build` writes `frontend/dist`. It uses the TypeScript transpiler when available; otherwise it builds from checked-in transpiled release assets. `npm run verify` builds the app, syntax-checks the compiled JS, checks required assets and probes the local static server. The production page currently maps React, Lucide and Three.js through `esm.sh`; therefore the browser needs internet access for those modules. If the modules cannot load, the page displays recovery instructions with a link to `offline.html`. The standalone offline workspace includes a CSS plant twin, local plant diary, watering log, task list, basic rule-based JARVIS answers, voice input where supported, and an illustrative growth score. Offline-mode data stays in this browser and is not synced to the backend.

For semantic TypeScript checking (requires installed npm dependencies and internet access on the first install):
```powershell
cd frontend
npm install
npm run typecheck
```

## Optional AI provider
Copy the server-side configuration example and edit it:
```powershell
Copy-Item backend/.env.example backend/.env
```
Set `JARVIS_API_KEY`, and configure `JARVIS_BASE_URL`, `JARVIS_MODEL` and (if different) `JARVIS_VISION_MODEL`. The API key must stay in `backend/.env` or a server environment variable; never add it to `frontend/.env` or commit a real key. Without a key, the assistant uses its limited rule-based plant-care guidance and photo analysis returns an explicit configuration error.

## Features
- Drag the 3D illustration to rotate it; the model is procedural rather than a scan of the real plant.
- Add/select/delete plant profiles (the starter Fern profile is protected).
- Log watering, write diary entries, review tasks and reminders, and export the active plant plus visible diary entries to JSON.
- Use Growth Lab and Plant Time Machine for illustrative scenarios; these are not biological forecasts.
- Look up current outdoor weather by city through Open-Meteo; no weather API key is needed.
- Use browser voice and notifications where supported. Grant microphone/notification permissions when asked.
- Optional local Windows launcher is limited to Notepad, Calculator and VS Code and requires confirmation.

## Windows reminders while the browser is closed
Run PowerShell from the project root (the folder containing this README):
```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\INSTALL_WINDOWS_REMINDERS.ps1
```
The scheduled task checks due, incomplete reminders every minute and shows a native Windows popup. The user must be logged in and the PC awake. To remove the task:
```powershell
Unregister-ScheduledTask -TaskName "PlantTwin JARVIS Reminder Checker" -Confirm:$false
```
The Windows reminder checker and browser notification checker avoid repeating the same deadline. Rescheduling a reminder can produce a new alert.

## Persistence and privacy
SQLite is created at `backend/data/planttwin.db` on first start. Set `PLANTTWIN_DB_PATH` to change it; a relative override is resolved from the `backend` directory. Plant photos are forwarded to the configured vision provider for analysis and are not saved by this API endpoint. Review your provider's privacy and retention terms before sending photos.

## Deployment and security
Example Vercel/Render configuration files are provided, but production deployment is not fully verified. Cloud hosts may use ephemeral storage; configure persistent managed storage before relying on saved records. The local demo API does not implement user accounts, user isolation or rate limits. The included frontend server now binds to 127.0.0.1 by default. Do not expose the API to the public internet until authentication, user isolation, rate limits and deployment controls are added and tested. Set `CORS_ORIGINS` to the exact frontend origin(s) you trust.

## Full local verification (Windows)
From the project root, run `VERIFY_ALL_WINDOWS.bat`. It compiles the Python files, runs the backend tests against isolated temporary databases, builds the frontend and checks its served assets. No `npm install` is required for that local verification path.

## Tests
```powershell
cd backend
python -m pip install -r requirements.txt
python -m pytest -q
```

## Verification note
V12 includes 20 backend tests, isolated temporary test databases, Python compilation checks, a dependency-free frontend build/verification script, and a local static-server smoke test. This is a static ESM build, not a locally bundled framework bundle: browser modules are fetched from esm.sh, and real-browser CDN/runtime testing remains unverified in the network-restricted build environment. See `IMPLEMENTATION_STATUS.md` for the remaining production limitations.
