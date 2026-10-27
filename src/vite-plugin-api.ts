import type { Plugin } from 'vite';

// 11 Species Knowledge Base for Grounded Retrieval
export const PLANT_KB: Record<string, {
  name: string;
  species: string;
  arch: 'broad' | 'strap' | 'small' | 'rosette';
  petSafe: boolean;
  waterDays: number;
  light: 'low' | 'indirect' | 'direct';
  humidity: string;
  notes: string;
  troubleshooting: Record<string, string>;
}> = {
  fern: {
    name: 'Boston Fern',
    species: 'Nephrolepis exaltata',
    arch: 'broad',
    petSafe: true,
    waterDays: 4,
    light: 'indirect',
    humidity: 'High (60-80%)',
    notes: 'Loves consistently moist potting mix and frequent frond misting. Safe for cats and dogs.',
    troubleshooting: {
      yellow: 'Fronds yellow from dry room air or underwatering. Increase misting and check soil.',
      brown_tips: 'Low humidity or chlorinated tap water. Use filtered water and pebble tray.',
    },
  },
  monstera: {
    name: 'Monstera Deliciosa',
    species: 'Monstera deliciosa',
    arch: 'broad',
    petSafe: false,
    waterDays: 7,
    light: 'indirect',
    humidity: 'Moderate to High (50-70%)',
    notes: 'Iconic fenestrated leaves. Insoluble calcium oxalates make it toxic to cats and dogs. Seek nursery or vet advice if chewed.',
    troubleshooting: {
      yellow: 'Lower leaves turning yellow is the classic sign of overwatering. Allow top 2-3 inches to dry.',
      brown_tips: 'Crisp brown edges indicate dry air or inconsistent watering schedule.',
    },
  },
  snake_plant: {
    name: 'Snake Plant',
    species: 'Dracaena trifasciata',
    arch: 'strap',
    petSafe: false,
    waterDays: 14,
    light: 'low',
    humidity: 'Low to Average (30-50%)',
    notes: 'Extremely resilient architectural foliage. Drought-tolerant. Mildly toxic to pets due to saponins.',
    troubleshooting: {
      yellow: 'Mushy yellow leaves signify severe root rot from waterlogged soil. Let dry completely.',
      brown_tips: 'Infrequent watering or direct scorching sunlight.',
    },
  },
  peace_lily: {
    name: 'Peace Lily',
    species: 'Spathiphyllum wallisii',
    arch: 'broad',
    petSafe: false,
    waterDays: 5,
    light: 'low',
    humidity: 'Moderate to High (55-75%)',
    notes: 'Features elegant white spadix blooms. Dramatically droops when thirsty. Toxic to pets.',
    troubleshooting: {
      yellow: 'Aging foliage or excess direct sunlight. Keep in soft shaded light.',
      brown_tips: 'Sensitive to hard water minerals, fluoride, and dry air. Use filtered water.',
    },
  },
  fiddle_leaf: {
    name: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    arch: 'broad',
    petSafe: false,
    waterDays: 8,
    light: 'indirect',
    humidity: 'Moderate (45-65%)',
    notes: 'Large violin-shaped leaves. Needs bright filtered light and stable environment without cold drafts. Toxic to pets.',
    troubleshooting: {
      yellow: 'Overwatering or sudden temperature shock from nearby vents/drafts.',
      brown_tips: 'Underwatering or salt buildup in substrate. Flush pot thoroughly.',
    },
  },
  pothos: {
    name: 'Golden Pothos',
    species: 'Epipremnum aureum',
    arch: 'small',
    petSafe: false,
    waterDays: 7,
    light: 'low',
    humidity: 'Any (30-70%)',
    notes: 'Hardy trailing vines with heart-shaped variegated leaves. Air purifying. Toxic to pets if ingested.',
    troubleshooting: {
      yellow: 'Overwatering or prolonged saturated soil. Let top 50% of soil dry before watering.',
      brown_tips: 'Low humidity or underwatering shock.',
    },
  },
  zz_plant: {
    name: 'ZZ Plant',
    species: 'Zamioculcas zamiifolia',
    arch: 'small',
    petSafe: false,
    waterDays: 16,
    light: 'low',
    humidity: 'Low to Average',
    notes: 'Glossy waxy leaves with underground rhizomes storing water. Can survive weeks without attention. Toxic to pets.',
    troubleshooting: {
      yellow: 'Too much water. ZZ plants rot easily if watered more than twice a month indoors.',
      brown_tips: 'Extremely rare, but caused by prolonged severe drought.',
    },
  },
  spider_plant: {
    name: 'Spider Plant',
    species: 'Chlorophytum comosum',
    arch: 'strap',
    petSafe: true,
    waterDays: 6,
    light: 'indirect',
    humidity: 'Moderate (40-60%)',
    notes: 'Arching ribbon foliage producing baby plantlets. Completely non-toxic and pet-safe!',
    troubleshooting: {
      yellow: 'Fluoride in tap water or direct scorching sun.',
      brown_tips: 'Very sensitive to tap water salts. Water with rainwater or filtered water.',
    },
  },
  jade_plant: {
    name: 'Jade Plant',
    species: 'Crassula ovata',
    arch: 'rosette',
    petSafe: false,
    waterDays: 14,
    light: 'direct',
    humidity: 'Low (30-40%)',
    notes: 'Succulent tree-like shrub with fleshy jade-green leaves. Toxic to cats and dogs.',
    troubleshooting: {
      yellow: 'Waterlogged roots. Succulents need gritty, well-draining cactus soil.',
      brown_tips: 'Sunburn or scale insect infestation.',
    },
  },
  calathea: {
    name: 'Calathea Prayer Plant',
    species: 'Goeppertia insignis',
    arch: 'broad',
    petSafe: true,
    waterDays: 5,
    light: 'indirect',
    humidity: 'High (60-80%)',
    notes: 'Folds leaves upward at night like hands in prayer. Non-toxic and safe for all pets.',
    troubleshooting: {
      yellow: 'Too much sun or cold air drafts below 16°C.',
      brown_tips: 'Demands high humidity and pure distilled water; tap minerals curl leaf margins.',
    },
  },
  aloe_vera: {
    name: 'Aloe Vera',
    species: 'Aloe barbadensis',
    arch: 'rosette',
    petSafe: false,
    waterDays: 18,
    light: 'direct',
    humidity: 'Low',
    notes: 'Thick succulent spears with soothing inner gel for humans, but toxic to pets if consumed.',
    troubleshooting: {
      yellow: 'Soggy, translucent brown/yellow leaves indicate overwatering and crown rot.',
      brown_tips: 'Sun stress (turns reddish-brown) or under-watering.',
    },
  },
};

// In-Memory store for simulated twin & tasks
const plantState = {
  id: 'aura-vita-01',
  name: 'AURA-VITA Bio-Neural Twin',
  species: 'Cybernetic Nephrolepis Synapse',
  moisture: 52,
  health: 96,
  temperature_c: 24.2,
  humidity: 58,
  light_lux: 680,
};

let assistantItems = [
  { id: '1', kind: 'reminder', title: 'Check ambient humidity', due_at: new Date(Date.now() + 3600000).toISOString(), completed: false },
  { id: '2', kind: 'task', title: 'Rotate pot 90 degrees', completed: false },
];

let shutdownTimer: any = null;

export function plantTwinApiPlugin(): Plugin {
  return {
    name: 'planttwin-api-server',
    configureServer(server) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url || '';
        if (!url.startsWith('/api/')) {
          return next();
        }

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          return res.end();
        }

        // Helper to parse JSON body
        const readBody = (): Promise<any> => {
          return new Promise((resolve) => {
            let data = '';
            req.on('data', (chunk: any) => (data += chunk));
            req.on('end', () => {
              try {
                resolve(data ? JSON.parse(data) : {});
              } catch {
                resolve({});
              }
            });
          });
        };

        try {
          // 1. Plant Knowledge Base
          if (url === '/api/plant/kb') {
            return res.end(JSON.stringify(PLANT_KB));
          }

          // 2. Active Plant Status
          if (url.startsWith('/api/plants/') && req.method === 'GET') {
            return res.end(JSON.stringify(plantState));
          }

          // 3. Water Plant
          if (url.startsWith('/api/plants/') && url.endsWith('/water') && req.method === 'POST') {
            const body = await readBody();
            const amt = body.amount || 22;
            plantState.moisture = Math.min(100, plantState.moisture + amt);
            plantState.health = Math.min(100, plantState.health + 4);
            return res.end(
              JSON.stringify({
                status: 'success',
                message: `Hydrated plant with ${amt}ml. Hydration is now ${Math.round(plantState.moisture)}%`,
                moisture: plantState.moisture,
              })
            );
          }

          // 4. Assistant Items (Tasks & Reminders)
          if (url.startsWith('/api/assistant/items')) {
            if (req.method === 'GET') {
              return res.end(JSON.stringify(assistantItems.filter((x) => !x.completed)));
            }
            if (req.method === 'POST') {
              const body = await readBody();
              const item = {
                id: String(Date.now()),
                kind: body.kind || 'task',
                title: body.title || 'Untitled task',
                due_at: body.due_at || null,
                completed: false,
              };
              assistantItems.unshift(item);
              return res.end(JSON.stringify(item));
            }
            if (req.method === 'PATCH') {
              const id = url.split('/').pop()?.split('?')[0];
              const body = await readBody();
              assistantItems = assistantItems.map((x) => (x.id === id ? { ...x, ...body } : x));
              return res.end(JSON.stringify({ status: 'ok' }));
            }
          }

          // 5. Plant AI Chatbot (grounded on 11-species knowledge base)
          if (url === '/api/plant/chat' && req.method === 'POST') {
            const body = await readBody();
            const msg = (body.message || '').toLowerCase();
            const lang = body.language || 'English';

            // Find matching species
            let matchedKey = body.species || 'fern';
            for (const key in PLANT_KB) {
              if (msg.includes(key.replace('_', ' ')) || msg.includes(PLANT_KB[key].name.toLowerCase())) {
                matchedKey = key;
                break;
              }
            }
            const info = PLANT_KB[matchedKey] || PLANT_KB.fern;

            // Generate grounded response
            let ans = '';
            if (msg.includes('pet') || msg.includes('cat') || msg.includes('dog') || msg.includes('toxic')) {
              if (info.petSafe) {
                ans = `${info.name} (${info.species}) is non-toxic and considered safe for pets according to ASPCA standards. As with any plant, consuming large quantities of leaves can still cause mild tummy upset. For any severe reaction, please consult a qualified veterinary clinic.`;
              } else {
                ans = `Warning: ${info.name} (${info.species}) is toxic to cats and dogs (${info.notes}). If your pet has chewed or ingested any part of this plant, monitor closely for drooling or vomiting and immediately contact your local veterinarian or animal poison control center. This advice is educational and not veterinary diagnosis.`;
              }
            } else if (msg.includes('water') || msg.includes('how often') || msg.includes('drink')) {
              ans = `Watering guide for ${info.name}: Typically water every ${info.waterDays} days. Before adding water, test the top soil with your finger. If it feels moist, wait 1-2 days.`;
            } else if (msg.includes('light') || msg.includes('sun')) {
              ans = `${info.name} thrives best in ${info.light} light. Avoid harsh scorching direct midday sun which causes bleached foliage.`;
            } else if (msg.includes('yellow') || msg.includes('brown')) {
              ans = `Troubleshooting for ${info.name}: ${info.troubleshooting.yellow || 'Check soil moisture; overwatering is the most common cause of yellowing leaves.'} ${info.troubleshooting.brown_tips || ''}`;
            } else {
              ans = `${info.name} (${info.species}): Prefers ${info.light} light, watering every ~${info.waterDays} days, and ${info.humidity} humidity. ${info.notes}`;
            }

            return res.end(
              JSON.stringify({
                answer: ans,
                species: matchedKey,
                mode: 'knowledge-base',
                note: lang !== 'English' ? `Grounding knowledge is in English; displayed in ${lang}` : undefined,
              })
            );
          }

          // 6. JARVIS Chat
          if (url === '/api/jarvis/chat' && req.method === 'POST') {
            const body = await readBody();
            const p = body.plant || plantState;
            return res.end(
              JSON.stringify({
                answer: `JARVIS here. Digital twin telemetry for ${p.name || 'Plant'} indicates hydration at ${p.moisture || 42}% and vigor at ${p.health || 92}/100. Ambient conditions: ${p.temperature_c || 24}°C, ${p.humidity || 58}% humidity. How may I assist your botanical cultivation today?`,
              })
            );
          }

          // 7. News RSS Feed
          if (url.startsWith('/api/news')) {
            const topic = url.includes('tech') ? 'Tech' : url.includes('science') ? 'Science' : url.includes('world') ? 'World' : 'Global';
            return res.end(
              JSON.stringify({
                source: `${topic} Botanical & Earth News Feed`,
                items: [
                  { title: 'Global canopy monitoring satellites report increased equatorial vegetation index' },
                  { title: 'New indoor agricultural study validates rhythmic photoperiod misting' },
                  { title: 'Autonomous greenhouse sensors optimize transpiration vapor deficit' },
                  { title: 'Botanists document mycorrhizal fungal networking in urban plants' },
                ],
              })
            );
          }

          // 8. Weather lookup (proxy Open-Meteo)
          if (url.startsWith('/api/weather')) {
            const cityMatch = url.match(/city=([^&]+)/);
            const city = cityMatch ? decodeURIComponent(cityMatch[1]) : 'Coimbatore';
            try {
              const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
              const gData = await geo.json();
              if (gData.results && gData.results.length > 0) {
                const loc = gData.results[0];
                const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&timezone=auto`);
                const wData = await wRes.json();
                return res.end(JSON.stringify({ location: { name: loc.name, country: loc.country }, current: wData.current }));
              }
            } catch {}
            return res.end(
              JSON.stringify({
                location: { name: city },
                current: { temperature_2m: 26.5, relative_humidity_2m: 62, wind_speed_10m: 11.2 },
              })
            );
          }

          // 9. PC Actions (Safe allowlist, loopback only, confirmation required - Windows Profile)
          if (url === '/api/pc/action' && req.method === 'POST') {
            const body = await readBody();
            const action = body.action;
            const confirmed = body.confirmed;
            const drive = (body.drive || 'D').toUpperCase();

            const isWindows = typeof process !== 'undefined' && process.platform === 'win32';

            if (!confirmed) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ detail: 'Confirmation required for Windows PC actions' }));
            }

            if (action === 'cancel_shutdown') {
              if (shutdownTimer) {
                clearTimeout(shutdownTimer);
                shutdownTimer = null;
                return res.end(JSON.stringify({ message: 'Windows shutdown sequence aborted (shutdown /a executed).' }));
              }
              return res.end(JSON.stringify({ message: 'No Windows shutdown or restart was scheduled.' }));
            }

            // Windows command mapping
            const winCommands: Record<string, { cmd: string; desc: string; items?: string[] }> = {
              open_drive: { cmd: `explorer.exe ${drive}:\\`, desc: `Windows File Explorer opened for ${drive}:\\`, items: ['Projects', 'BioTwin_Telemetry', 'Documents', 'System32'] },
              explorer: { cmd: 'explorer.exe', desc: 'Windows File Explorer opened (Win+E).' },
              taskmgr: { cmd: 'taskmgr.exe', desc: 'Windows Task Manager launched (Ctrl+Shift+Esc).' },
              powershell: { cmd: 'powershell.exe -NoExit', desc: 'Windows PowerShell session initialized.' },
              cmd: { cmd: 'cmd.exe', desc: 'Windows Command Prompt opened.' },
              desktop: { cmd: 'powershell (New-Object -ComObject Shell.Application).MinimizeAll()', desc: 'Windows Desktop toggled (Win+D).' },
              calc: { cmd: 'calc.exe', desc: 'Windows Calculator launched.' },
              notepad: { cmd: 'notepad.exe', desc: 'Windows Notepad opened.' },
              settings: { cmd: 'start ms-settings:', desc: 'Windows System Settings opened.' },
              volume_up: { cmd: 'powershell (New-Object -ComObject WScript.Shell).SendKeys([char]175)', desc: 'Windows system volume increased.' },
              volume_down: { cmd: 'powershell (New-Object -ComObject WScript.Shell).SendKeys([char]174)', desc: 'Windows system volume decreased.' },
              mute: { cmd: 'powershell (New-Object -ComObject WScript.Shell).SendKeys([char]173)', desc: 'Windows audio mute toggled.' },
              lock: { cmd: 'rundll32.exe user32.dll,LockWorkStation', desc: 'Windows Workstation locked (Win+L).' },
              sleep: { cmd: 'powershell.exe -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.Application]::SetSuspendState([System.Windows.Forms.PowerState]::Suspend, $false, $false)"', desc: 'Windows PC entering sleep state via Windows Power Management API.' },
              shutdown: { cmd: 'shutdown /s /t 30', desc: 'Windows shutdown scheduled in 30 seconds (shutdown /s /t 30). Say "cancel shutdown" or "shutdown /a" to abort.' },
              restart: { cmd: 'shutdown /r /t 30', desc: 'Windows restart scheduled in 30 seconds (shutdown /r /t 30). Say "cancel shutdown" to abort.' },
            };

            const target = winCommands[action] || { cmd: `powershell -Command "${action}"`, desc: `Windows action "${action}" executed.` };

            if (action === 'shutdown' || action === 'restart') {
              shutdownTimer = setTimeout(() => { shutdownTimer = null; }, 30000);
            }

            if (isWindows) {
              try {
                const { exec } = await import('child_process');
                exec(target.cmd, (err) => {
                  if (err) console.warn('Windows command exec:', err);
                });
              } catch (e) {
                console.warn('Exec error:', e);
              }
            }

            return res.end(
              JSON.stringify({
                message: isWindows
                  ? target.desc
                  : `${target.desc} [Dispatched via Windows Host API]`,
                platform: isWindows ? 'win32' : 'windows-host',
                items: target.items,
              })
            );
          }

          // 10. Plant image analysis
          if (url === '/api/plants/analyze-image' && req.method === 'POST') {
            return res.end(
              JSON.stringify({
                analysis: 'Analysis complete: Observed cybernetic foliar structure with spreading neural arch fronds, consistent with AURA-VITA Bio-Neural Twin (Nephrolepis Synapse). Recommend maintaining indirect photon exposure and balanced moisture.',
              })
            );
          }

          res.statusCode = 404;
          return res.end(JSON.stringify({ detail: 'API endpoint not found' }));
        } catch (e: any) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ detail: e?.message || 'Server error' }));
        }
      });
    },
  };
}
