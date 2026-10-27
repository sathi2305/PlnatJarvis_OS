# PlantTwin JARVIS OS — V14 Advanced Edition Changelog

## Upgrades & Integrated Systems

### 1. Unified Architecture & Interface (Served at `/`)
- **Three-Zone Dashboard Layout**:
  - **Zone 1 (Left)**: JARVIS & Plant AI console with reactive audio orb (STANDBY, LISTENING, SPEAKING, ALERT, ONLINE), typewriter chat feed, quick prompt chips, and command input.
  - **Zone 2 (Center)**: Interactive 3D Plant Digital Twin canvas with shaded leaves, natural swaying, glowing halo aura, live callout lines, rain simulation cloud with ripples, and photo-to-twin upload analyzer.
  - **Zone 3 (Right)**: Twin telemetry panel featuring 4 circular animated gauge rings (Hydration %, Vigor /100, Root Zone Temp °C, Humidity %), live 60-second sparkline chart with 30% alert line, and interactive task checklist.
- **Classic OS Dashboard Link (`/classic.html`)**: Complete multi-view dashboard with Three.js 3D model, watering ledger, botanical diary, schedule tasks, weather, growth lab, diagnostics, and calculator.

### 2. Multi-Lingual Voice Assistant (JARVIS)
- **Automatic Wake Word**: Listens for `"Hey Jarvis"` in supported browsers (Chrome/Edge via Web Speech API) plus fallback text console.
- **6 Supported Languages**: English, Tamil (`ta-IN`), Hindi (`hi-IN`), Malayalam (`ml-IN`), Telugu (`te-IN`), and Kannada (`kn-IN`).
- **Commands**:
  - `make it rain`: starts cloud rain effect, gradually increases hydration, and logs hydration event.
  - `status`: reports current hydration, vigor, temperature, humidity, and lighting lux.
  - `show 60 days` / `show <N> days`: adjusts illustrative time machine slider.
  - `light 1200`: sets simulated target lux illumination.
  - `remind me to <task> in 30 minutes`: schedules care reminder in task list.
  - `weather in <city>`: fetches live Open-Meteo meteorological report.
  - `what's the news today`: provides curated headlines.
  - `gestures`: displays hand gesture navigation guidance.
  - `stop/start camera`: toggles MediaPipe hand tracking.
  - `stop/start listening`: pauses or resumes wake word listener.

### 3. Google MediaPipe Hands Gesture Control
- **Offline Bundling**: Locally bundled MediaPipe Hands (`public/vendor/mediapipe/`) with automated CDN fallback.
- **Hand Overlay**: Small mirror camera view (`#hw`) displaying 21-landmark skeleton and detected gesture label.
- **Implemented Gestures**:
  - **Wave**: JARVIS responds with a spoken and typed greeting.
  - **Open Palm Held High (~1s)**: Triggers the rain cycle, watering the plant.
  - **Swipe Palm Left / Right**: Moves the Plant Time Machine slider by ±15 days.
  - **Fist over plant + move**: Rotates and zooms the 3D digital twin.
  - **Point (Index finger extended)**: Moves the futuristic HUD cursor (`#hc`).
  - **Pinch (Thumb + Index)**: Freezes cursor position and clicks the targeted UI element.
- **Guidance & Diagnostics**: Clear prompts (`"🖐 HAND: SHOW YOUR PALM"`, `"MOVE CLOSER (40-60cm)"`, `"NEEDS HTTPS OR LOCALHOST"`).

### 4. Plant Digital Twin & Photo Analyzer
- **Photo to Twin**: Measures leaf greenness, hue, elongation, and silhouette edge ratio directly in the browser to rebuild the twin into one of 4 morphological architectures (`broad`, `strap`, `small`, `rosette`).
- **Rainfall Simulation**: Replaces watering buttons with natural rainfall clouds, streaks, and pot soil ripples.
- **Plant Time Machine**: Illustrative simulation from Day 0 to Day 90 showing growth expansion.

### 5. Grounded Plant AI Chatbot
- **Separate Chat Stream**: Plant-only assistance tab with independent history.
- **11-Species Built-in Botanical Knowledge Base**: Boston Fern, Monstera Deliciosa, Snake Plant, Peace Lily, Fiddle Leaf Fig, Golden Pothos, ZZ Plant, Spider Plant, Jade Plant, Calathea, Aloe Vera.
- **Honest Boundary**: Clear disclosure that advice is retrieval-grounded and educational, with explicit recommendations to consult a veterinary professional or local nursery for pet emergencies.

### 6. Safe PC Controls (Windows Backend)
- **Fixed Allowlist**: `sleep`, `lock`, `shutdown`, `restart`, `open_drive`, `cancel_shutdown`.
- **Safety Window**: 30-second cancellation window for shutdown and restart (`"cancel shutdown"`).
- **Loopback & OS Verification**: Refuses shell execution; honestly identifies non-Windows environments.

### 7. Deliverables & Artifacts
- `index.html`: Advanced Gesture + Voice digital twin served at `/` and `/advanced.html`.
- `classic.html`: Multi-view classic OS dashboard.
- `offline.html`: Offline workspace dashboard.
- `check.html`: Dedicated sensor and permissions diagnostics laboratory.
- `404.html`: Themed botanic-cybernetic fallback page.
- `assets/config.js`: Runtime configuration (`window.PLANTTWIN_API_BASE_URL`).
- `PlantTwin-JARVIS-standalone.html`: Single-file zero-dependency offline workspace.
- `deploy-ready.zip`: Deployment bundle with `index.html` at root level.
- `full-project.zip`: Complete project source archive.

---

## V15 — Two-Hand AR Spatial Tracking & Diagnostics Upgrade
- **Two-Hand AI Spatial Engine**: MediaPipe Hands tracking engine upgraded to 2 concurrent hands (`maxNumHands: 2`). Left hand controls bio-core illumination and rainfall; Right hand controls 3D plant yaw/pitch orbit; Bimanual hand separation governs distance zoom (0.6x to 2.2x); Dual-hand linkage renders a high-tech cyan/amber laser energy beam with resonant bio-sync particle burst.
- **Project Rebranding**: Upgraded plant species identity to **AURA-VITA Bio-Neural Twin** (*Cybernetic Nephrolepis Synapse*), removing all legacy generic naming across headers and UI callouts.
- **Strict UI Button Compliance**: Enforced zero-manual-button rule for water, hand control, wake word, microphone, and rotate. UI restricted strictly to permitted controls: 2 chat tabs, quick prompt shortcuts, text box + Send, language selector, fullscreen button, photo picker, and reminder Done buttons.
- **Dedicated Sensor Diagnostics Lab (`check.html`)**: Added standalone testing lab evaluating HTTPS context, iframe container policy, microphone hardware & live VU meter, camera stream preview, and Web Speech API, with step-by-step unblocking directions for Chrome, Edge, Safari, and Firefox.
- **Windows PC Controls**: Fixed allowlist covering `sleep`, `lock`, `shutdown /s /t 30`, `restart /r /t 30`, `cancel_shutdown`, `open_drive`, `taskmgr`, `explorer`, `powershell`, `cmd`, `calc`, `notepad`, `settings`, `volume_up`, `volume_down`, `mute`.
- **Runtime Config (`assets/config.js`)**: Implemented relative path config with localhost protection on remote domains.

