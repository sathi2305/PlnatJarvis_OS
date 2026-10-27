// PlantTwin JARVIS Runtime Configuration
// window.PLANTTWIN_API_BASE_URL: Backend endpoint for Windows PC operations and real-time telemetry.
// Stays EMPTY by default. Never bake http://127.0.0.1 into a public build.
// On non-local hosts, localhost API URLs are ignored to guarantee zero rogue backend calls.
window.PLANTTWIN_API_BASE_URL = window.PLANTTWIN_API_BASE_URL || "";
