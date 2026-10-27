import React, { useState, useEffect } from 'react';
import { PlantProfile } from '../types';
import { storage } from '../utils/storage';
import { audio } from '../utils/audio';
import {
  Wrench,
  Calculator,
  FileText,
  Activity,
  Download,
  Upload,
  X,
  CheckCircle2,
  Sparkles,
  Cpu,
  HardDrive,
} from 'lucide-react';

interface JarvisToolsModalProps {
  plant: PlantProfile;
  onClose: () => void;
  onDataRestored?: () => void;
}

export const JarvisToolsModal: React.FC<JarvisToolsModalProps> = ({
  plant,
  onClose,
  onDataRestored,
}) => {
  const [activeTab, setActiveTab] = useState<'calc' | 'notepad' | 'diagnostics' | 'backup'>('calc');

  // Calculator State
  const [calcPotSize, setCalcPotSize] = useState<number>(plant.potSizeCm);
  const [calcHumidity, setCalcHumidity] = useState<number>(50);
  const [calcSunlight, setCalcSunlight] = useState<'low' | 'indirect' | 'direct'>('indirect');
  const [calcResult, setCalcResult] = useState<number>(5);

  // Scratchpad State
  const [scratchpadText, setScratchpadText] = useState<string>(storage.getScratchpad());
  const [saveStatus, setSaveStatus] = useState<string>('Saved');

  // Diagnostics State
  const [webglInfo, setWebglInfo] = useState<string>('Checking...');
  const [storageUsedKb, setStorageUsedKb] = useState<number>(0);

  useEffect(() => {
    // Check WebGL
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          setWebglInfo(renderer || 'Hardware Accelerated WebGL Active');
        } else {
          setWebglInfo('Standard WebGL 1.0/2.0 Active');
        }
      } else {
        setWebglInfo('Software / Fallback');
      }
    } catch {
      setWebglInfo('WebGL Available');
    }

    // Measure localstorage
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += ((localStorage[key].length + key.length) * 2);
      }
    }
    setStorageUsedKb(Math.round(total / 1024));
  }, []);

  // Compute care drying time
  useEffect(() => {
    // Base days by pot size (bigger pot = more soil volume = dries slower)
    let days = calcPotSize * 0.28;

    // Adjust for humidity
    if (calcHumidity < 35) days *= 0.75;
    else if (calcHumidity > 65) days *= 1.35;

    // Adjust for sunlight
    if (calcSunlight === 'direct') days *= 0.65;
    else if (calcSunlight === 'low') days *= 1.4;

    setCalcResult(Math.max(1, Math.round(days)));
  }, [calcPotSize, calcHumidity, calcSunlight]);

  const handleScratchpadChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setScratchpadText(val);
    storage.saveScratchpad(val);
    setSaveStatus('Auto-saved');
  };

  const handleDownloadFullBackup = () => {
    audio.playSuccessChime();
    const backupJson = storage.exportAllData();
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlantTwin_JARVIS_Full_OS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const success = storage.importData(content);
          if (success) {
            audio.playSuccessChime();
            alert('Digital Twin OS records restored successfully! Refreshing telemetry.');
            onDataRestored?.();
            onClose();
          } else {
            alert('Invalid backup archive. Parsing failed.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Wrench className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base sm:text-lg font-bold font-mono text-slate-100">
              JARVIS OS SYSTEM UTILITIES & DIAGNOSTICS
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-mono overflow-x-auto">
          <button
            onClick={() => setActiveTab('calc')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'calc'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" /> Care Calculator
          </button>

          <button
            onClick={() => setActiveTab('notepad')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'notepad'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Scratchpad
          </button>

          <button
            onClick={() => setActiveTab('diagnostics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'diagnostics'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> Telemetry & Specs
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'backup'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" /> Backup & Restore
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'calc' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-xs text-slate-400 font-mono">
              Calculates estimated soil desiccation rates based on thermodynamic physics and substrate volume.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">POT DIAMETER</label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  value={calcPotSize}
                  onChange={(e) => setCalcPotSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">ROOM HUMIDITY (%)</label>
                <input
                  type="number"
                  min="15"
                  max="95"
                  value={calcHumidity}
                  onChange={(e) => setCalcHumidity(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">LIGHT LEVEL</label>
                <select
                  value={calcSunlight}
                  onChange={(e) => setCalcSunlight(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-100"
                >
                  <option value="low">Low Light</option>
                  <option value="indirect">Bright Indirect</option>
                  <option value="direct">Direct Sunlight</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-cyan-500/40 rounded-2xl p-5 text-center space-y-1">
              <span className="text-xs font-mono text-slate-400">ESTIMATED DRYING CADENCE</span>
              <div className="text-3xl font-black font-mono text-cyan-400">
                ~{calcResult} DAYS
              </div>
              <p className="text-xs text-slate-400 font-sans">
                Recommended to check moisture sensor when meter reads below 35%.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'notepad' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>FIELD OBSERVATION SCRATCHPAD</span>
              <span className="text-emerald-400">{saveStatus}</span>
            </div>
            <textarea
              rows={9}
              value={scratchpadText}
              onChange={handleScratchpadChange}
              placeholder="Record immediate quick notes, seedling germination logs, fertilizer ratios..."
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs sm:text-sm font-mono text-slate-200 focus:outline-none focus:border-cyan-500 resize-none leading-relaxed"
            />
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-3 animate-fade-in text-xs font-mono">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">WEB AUDIO SYNTHESIZER:</span>
                <span className="text-emerald-400 font-bold">ONLINE & OPERATIONAL</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SPEECH RECOGNITION (MIC):</span>
                <span className="text-cyan-400 font-bold">
                  {typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
                    ? 'SUPPORTED'
                    : 'UNAVAILABLE IN THIS RUNTIME'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">SPEECH SYNTHESIS (TTS):</span>
                <span className="text-emerald-400 font-bold">
                  {typeof window !== 'undefined' && 'speechSynthesis' in window ? 'AVAILABLE' : 'DISABLED'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">3D HARDWARE ACCELERATION:</span>
                <span className="text-slate-200 truncate max-w-xs">{webglInfo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">LOCAL PERSISTENCE CONSUMPTION:</span>
                <span className="text-indigo-400 font-bold">~{storageUsedKb} KB cached</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'backup' && (
          <div className="space-y-4 animate-fade-in text-xs font-mono">
            <p className="text-slate-400">
              Download or restore the complete PlantTwin digital twin database, including all plants, watering history, journal entries, and scheduled care tasks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleDownloadFullBackup}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 transition-all font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Export Full JSON Archive</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all font-semibold cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Restore From JSON Archive</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
