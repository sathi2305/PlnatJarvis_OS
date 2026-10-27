import React, { useState, useRef, useEffect } from 'react';
import { PlantProfile, JarvisMessage } from '../types';
import { audio } from '../utils/audio';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Bot,
  Sparkles,
  ShieldCheck,
  Droplets,
  Sun,
  Activity,
  Trash2,
} from 'lucide-react';

interface JarvisAssistantProps {
  plant: PlantProfile;
  onQuickAction: (action: 'water' | 'mist' | 'fertilize' | 'rotate') => void;
  onAddTask?: (taskTitle: string) => void;
}

export const JarvisAssistant: React.FC<JarvisAssistantProps> = ({
  plant,
  onQuickAction,
  onAddTask,
}) => {
  const [messages, setMessages] = useState<JarvisMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: `Greetings. I am JARVIS, your botanical neural intelligence. Digital twin telemetry for **${plant.name}** (${plant.species}) is synced at ${plant.healthScore}% health score. How may I assist your cultivation today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Setup Web Speech API recognition if supported
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            handleUserSend(transcript);
          }
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [plant]);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please type your query below.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      audio.playJarvisActivate();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleUserSend = (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    audio.playBeep(700, 0.05);

    const userMsg: JarvisMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    // Generate smart response from JARVIS botanical neural engine
    setTimeout(() => {
      const { response, action } = generateJarvisResponse(query, plant);
      const assistantMsg: JarvisMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionTriggered: action,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Execute action if matched
      if (action === 'water') {
        onQuickAction('water');
      } else if (action === 'mist') {
        onQuickAction('mist');
      } else if (action === 'fertilize') {
        onQuickAction('fertilize');
      } else if (action === 'rotate') {
        onQuickAction('rotate');
      } else if (action?.startsWith('task:')) {
        const title = action.replace('task:', '');
        onAddTask?.(title);
      }

      if (voiceEnabled) {
        setIsSpeaking(true);
        audio.speakJarvis(stripMarkdown(response), () => {
          setIsSpeaking(false);
        });
      } else {
        audio.playSuccessChime();
      }
    }, 450);
  };

  const clearChat = () => {
    audio.playBeep(400, 0.05);
    setMessages([
      {
        id: 'reset-1',
        role: 'assistant',
        content: `Console buffer cleared. Botanical neural network ready for ${plant.name}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/70 border border-slate-800 rounded-2xl backdrop-blur-md overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100 tracking-wide font-mono">
                JARVIS BOTANICAL OS
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Twin Link: {plant.name} • Moisture {plant.moisturePercent}%
            </p>
          </div>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              if (voiceEnabled) audio.stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-lg text-xs border transition-all ${
              voiceEnabled
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
            title={voiceEnabled ? 'Mute JARVIS Voice' : 'Enable JARVIS Voice'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={clearChat}
            className="p-2 rounded-lg text-xs bg-slate-900 text-slate-500 border border-slate-800 hover:text-rose-400 hover:border-rose-900/50 transition-all"
            title="Clear Chat Stream"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/40 flex items-center gap-2 overflow-x-auto text-[11px] font-mono">
        <span className="text-slate-500 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-cyan-400" /> PROMPTS:
        </span>
        <button
          onClick={() => handleUserSend('Water the plant now')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-all"
        >
          💧 Water now
        </button>
        <button
          onClick={() => handleUserSend('Is this plant safe for pets?')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-all"
        >
          🐾 Pet safety
        </button>
        <button
          onClick={() => handleUserSend('Why do plant leaves turn yellow?')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-all"
        >
          🍂 Yellow leaves
        </button>
        <button
          onClick={() => handleUserSend('Check current telemetry and diagnostics')}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800/60 hover:bg-cyan-950/60 text-slate-300 hover:text-cyan-300 border border-slate-700/60 transition-all"
        >
          📊 Diagnostics
        </button>
      </div>

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 min-h-[220px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            } space-y-1`}
          >
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 px-1">
              <span>{msg.role === 'user' ? 'OPERATOR' : 'JARVIS PROTOCOL'}</span>
              <span>•</span>
              <span>{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-xs shadow-md shadow-cyan-900/30'
                  : 'bg-slate-950/80 text-slate-200 border border-slate-800/90 rounded-tl-xs shadow-sm font-sans'
              }`}
            >
              <div
                className="prose prose-invert prose-sm max-w-none space-y-2"
                dangerouslySetInnerHTML={{ __html: formatMessageMarkdown(msg.content) }}
              />

              {msg.actionTriggered && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <Activity className="w-3 h-3" />
                  <span>ACTION EXECUTED: [{msg.actionTriggered.toUpperCase()}]</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isListening && (
          <div className="flex items-center gap-2.5 text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 p-2.5 rounded-xl animate-pulse">
            <Mic className="w-4 h-4 animate-bounce" />
            <span>JARVIS AUDIO SENSOR ACTIVE: Listening to voice input...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Console */}
      <div className="p-3 bg-slate-950/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={toggleMic}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-slate-700'
            }`}
            title={isListening ? 'Stop Listening' : 'Speak to JARVIS'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask JARVIS regarding ${plant.name} care, diagnostics, or commands...`}
            className="flex-1 bg-slate-900/90 border border-slate-800 focus:border-cyan-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all font-sans"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 disabled:hover:bg-cyan-600 text-white font-medium shadow-md shadow-cyan-950 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- HELPER BOTANICAL LOGIC ENGINE ---
function generateJarvisResponse(query: string, plant: PlantProfile): { response: string; action?: string } {
  const q = query.toLowerCase();

  // 1. Direct Action: Water
  if (q.includes('water') && (q.includes('now') || q.includes('the plant') || q.includes('log') || q.includes('hydrate'))) {
    return {
      response: `Dispensing hydration telemetry. Added 250ml water log to **${plant.name}**. Soil moisture index updated. Current hydration will absorb across root rhizomes over the next 4 hours.`,
      action: 'water',
    };
  }

  // 2. Direct Action: Mist
  if (q.includes('mist') || q.includes('humidity spray')) {
    return {
      response: `Foliar mist applied to **${plant.name}**. Ambient surface humidity temporarily boosted by +28%. This helps prevent crispy brown leaf margins.`,
      action: 'mist',
    };
  }

  // 3. Direct Action: Rotate
  if (q.includes('rotate') || q.includes('turn pot')) {
    return {
      response: `Rotating digital twin 90°. Balanced phototropism ensures symmetrical frond and stem distribution toward ambient light sources.`,
      action: 'rotate',
    };
  }

  // 4. Pet Safety / Toxicity
  if (q.includes('pet') || q.includes('cat') || q.includes('dog') || q.includes('toxic') || q.includes('poison')) {
    if (plant.speciesType === 'fern') {
      return {
        response: `**Pet Safety Protocol: SAFE** ✅\n\nTrue Boston Fern (*Nephrolepis exaltata*) is completely **non-toxic to cats and dogs** according to ASPCA veterinary toxicology standards. If pets chew on fronds, it may cause mild digestive irritation from fiber, but contains no systemic toxins.`,
      };
    } else if (plant.speciesType === 'monstera') {
      return {
        response: `**Pet Safety Protocol: TOXIC** ⚠️\n\n*Monstera deliciosa* contains insoluble calcium oxalate crystals. Chewing on foliage causes intense oral burning, excessive drooling, swelling of the mouth/tongue, and vomiting in both cats and dogs. Recommend elevating on a high plant stand out of reach.`,
      };
    } else if (plant.speciesType === 'peace_lily') {
      return {
        response: `**Pet Safety Protocol: TOXIC** ⚠️\n\nPeace Lily (*Spathiphyllum*) contains calcium oxalate crystals causing acute oral pain, difficulty swallowing, and gastrointestinal distress for pets. Keep strictly away from felines and canines.`,
      };
    } else if (plant.speciesType === 'snake_plant') {
      return {
        response: `**Pet Safety Protocol: MILDLY TOXIC** ⚠️\n\nSnake Plant (*Sansevieria*) contains saponins that can trigger nausea, vomiting, and salivation if consumed by pets.`,
      };
    } else {
      return {
        response: `For **${plant.species}**, standard precautionary measures are advised. Non-toxic varieties like Boston Fern, Calathea, Spider Plants, and Peperomia are safest around curious animals.`,
      };
    }
  }

  // 5. Diagnostics: Yellow Leaves
  if (q.includes('yellow') || q.includes('chlorosis')) {
    return {
      response: `**Yellow Leaf Diagnostic Matrix**:\n\n1. **Overwatering (Most Frequent)**: Check if lower leaves are mushy or pale yellow. If moisture is above 80% for >5 consecutive days, root aeration is compromised.\n2. **Underwatering**: Leaves turn pale, crisp, and curl inward with brittle soil.\n3. **Light Deprivation**: Leaves lose chlorophyll synthesis efficiency.\n\n*Telemetry status for ${plant.name}: Moisture is at ${plant.moisturePercent}%, Health is ${plant.healthScore}%.* Maintain moisture between 45% and 75%.`,
    };
  }

  // 6. Diagnostics: Brown Tips
  if (q.includes('brown tip') || q.includes('crispy') || q.includes('dry tip')) {
    return {
      response: `**Crisp / Brown Edge Analysis**:\n\n- **Dry Air / Low Humidity**: ${plant.species} prefers relative humidity >50%. Regular misting or a pebble tray helps immensely.\n- **Tap Water Salts**: Chlorine, fluoride, and hard mineral deposits accumulate in leaf tips. Use filtered or rainwater.\n- **Direct Sun Scorching**: Ensure sunlight exposure aligns with **${plant.sunlightPref}** lighting.`,
    };
  }

  // 7. General Diagnostics / Telemetry
  if (q.includes('diagnostic') || q.includes('telemetry') || q.includes('status') || q.includes('health') || q.includes('scan')) {
    const moistureStatus =
      plant.moisturePercent < 25 ? 'CRITICALLY DRY' : plant.moisturePercent > 80 ? 'SATURATED' : 'OPTIMAL';
    return {
      response: `**${plant.name} Full Telemetry Report**:\n\n- **Health Vitality**: ${plant.healthScore}/100\n- **Moisture Level**: ${plant.moisturePercent}% [${moistureStatus}]\n- **Light Preference**: ${plant.sunlightPref.toUpperCase()} light\n- **Pot Diameter**: ${plant.potSizeCm}cm ceramic\n- **Watering Interval**: Every ${plant.wateringIntervalDays} days\n- **Estimated Next Hydration**: Due in ~${Math.max(1, Math.round(plant.wateringIntervalDays * (plant.moisturePercent / 100)))} day(s).`,
    };
  }

  // 8. Pests
  if (q.includes('pest') || q.includes('bug') || q.includes('mite') || q.includes('gnat') || q.includes('scale')) {
    return {
      response: `**Pest Neutralization Protocol**:\n\n- **Fungus Gnats**: Allow top 2 inches of soil to completely dry between waterings. Use sticky yellow traps.\n- **Spider Mites (Fine Webbing)**: Wipe down both sides of leaves with cold water and dilute neem oil (1 tsp neem + 2 drops mild dish soap per 500ml water).\n- **Mealybugs (Cottony spots)**: Dab directly with a cotton swab soaked in 70% isopropyl alcohol.`,
    };
  }

  // 9. Multilingual greetings & general questions
  if (q.includes('hola') || q.includes('gracias') || q.includes('planta')) {
    return {
      response: `¡Hola! Sistema JARVIS conectado. La planta **${plant.name}** tiene una salud del ${plant.healthScore}%. ¿Deseas regar, consultar iluminación o revisar el diagnóstico botánico?`,
    };
  }
  if (q.includes('bonjour') || q.includes('salut')) {
    return {
      response: `Bonjour! Système JARVIS en ligne. Votre plante **${plant.name}** affiche ${plant.healthScore}% de vitalité. Que puis-je faire pour vous aujourd'hui?`,
    };
  }
  if (q.includes('guten tag') || q.includes('hallo')) {
    return {
      response: `Guten Tag! JARVIS Betriebssystem ist bereit. **${plant.name}** Vitalitätswert liegt bei ${plant.healthScore}%. Wie kann ich behilflich sein?`,
    };
  }

  // Default intelligent assistant response
  return {
    response: `Acknowledged. I've processed your query regarding **${plant.name}**. To maintain prime physiological condition, ensure consistent ambient moisture (${plant.sunlightPref} light), check the soil before adding water, and rotate the pot periodically for uniform foliage growth. Let me know if you need specific advice on pest control, fertilizing, or repotting.`,
  };
}

function formatMessageMarkdown(content: string): string {
  // Convert markdown bold, bullet points, headers into clean HTML
  let formatted = content
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-cyan-300 font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="text-slate-300">$1</em>')
    .replace(/\n\n/g, '<p class="mt-2"></p>')
    .replace(/\n- (.*?)/g, '<li class="ml-3 list-disc text-slate-300">$1</li>');

  return formatted;
}

function stripMarkdown(text: string): string {
  return text.replace(/[*#_`]/g, '').replace(/\n+/g, ' ');
}
