import React, { useState } from 'react';
import { PlantProfile, WeatherData } from '../types';
import { ThreePlantTwin } from './ThreePlantTwin';
import { JarvisAssistant } from './JarvisAssistant';
import { D3HealthTrendChart } from './D3HealthTrendChart';
import { audio } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Droplets,
  Wind,
  Sparkles,
  RotateCw,
  Scissors,
  Download,
  AlertTriangle,
  Sun,
  Thermometer,
  HeartPulse,
  Clock,
  Compass,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface DashboardProps {
  plant: PlantProfile;
  weather?: WeatherData | null;
  onUpdatePlant: (updated: PlantProfile) => void;
  onLogWatering: (amountMl: number, type: 'water' | 'mist' | 'fertilizer', note: string) => void;
  onOpenTools: () => void;
  onAddTask: (taskTitle: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  plant,
  weather,
  onUpdatePlant,
  onLogWatering,
  onOpenTools,
  onAddTask,
}) => {
  const [isWateringAnim, setIsWateringAnim] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleWater = () => {
    audio.playWaterDrop();
    setIsWateringAnim(true);
    setTimeout(() => setIsWateringAnim(false), 2500);

    // Launch celebratory moisture confetti
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#38bdf8', '#0ea5e9', '#06b6d4', '#10b981'],
    });

    const newMoisture = Math.min(100, plant.moisturePercent + 35);
    const newHealth = Math.min(100, plant.healthScore + 3);
    const updated: PlantProfile = {
      ...plant,
      moisturePercent: newMoisture,
      healthScore: newHealth,
      lastWatered: new Date().toISOString(),
    };

    onUpdatePlant(updated);
    onLogWatering(250, 'water', 'Hydrated via JARVIS quick action');
    showToast(`Hydration complete: Moisture +35% (Now ${newMoisture}%)`);
  };

  const handleMist = () => {
    audio.playWaterDrop();
    const newMoisture = Math.min(100, plant.moisturePercent + 8);
    const updated: PlantProfile = {
      ...plant,
      moisturePercent: newMoisture,
      lastMisted: new Date().toISOString(),
    };
    onUpdatePlant(updated);
    onLogWatering(50, 'mist', 'Foliar mist applied');
    showToast(`Foliar misting recorded. Relative humidity boosted.`);
  };

  const handleFertilize = () => {
    audio.playSuccessChime();
    const newHealth = Math.min(100, plant.healthScore + 5);
    const updated: PlantProfile = {
      ...plant,
      healthScore: newHealth,
      lastFertilized: new Date().toISOString(),
    };
    onUpdatePlant(updated);
    onLogWatering(100, 'fertilizer', 'Balanced liquid nitrogen/potassium feed');
    showToast(`Fertilizer applied. Plant vigor upgraded to ${newHealth}%.`);
  };

  const handleRotate = () => {
    audio.playBeep(600, 0.08);
    const newDeg = (plant.rotationDeg + 90) % 360;
    const updated: PlantProfile = {
      ...plant,
      rotationDeg: newDeg,
    };
    onUpdatePlant(updated);
    showToast(`Rotated pot by 90° (Total azimuth: ${newDeg}°).`);
  };

  const handlePrune = () => {
    audio.playBeep(750, 0.08);
    const newHealth = Math.min(100, plant.healthScore + 2);
    const updated: PlantProfile = {
      ...plant,
      healthScore: newHealth,
    };
    onUpdatePlant(updated);
    showToast(`Grooming complete: Senescent foliage removed.`);
  };

  const handleExportJson = () => {
    audio.playSuccessChime();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(plant, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${plant.name.replace(/\s+/g, '_')}_DigitalTwin.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${plant.name} JSON profile successfully.`);
  };

  // Calculate days since last watered
  const lastWateredDate = new Date(plant.lastWatered);
  const daysSinceWatered = Math.max(0, Math.floor((Date.now() - lastWateredDate.getTime()) / (1000 * 60 * 60 * 24)));
  const daysUntilWater = Math.max(0, plant.wateringIntervalDays - daysSinceWatered);

  // Moisture color mapping
  const getMoistureBadge = () => {
    if (plant.moisturePercent < 25) {
      return { text: 'CRITICALLY LOW', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
    if (plant.moisturePercent < 45) {
      return { text: 'MODERATE', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
    }
    if (plant.moisturePercent <= 80) {
      return { text: 'OPTIMAL ZONE', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
    return { text: 'SATURATED', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
  };

  const moistureBadge = getMoistureBadge();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 bg-slate-900 border border-cyan-500/60 text-slate-100 px-4 py-2.5 rounded-xl shadow-2xl backdrop-blur-md animate-fade-in font-mono text-xs">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Plant Vitals Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Moisture */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" /> SOIL MOISTURE
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${moistureBadge.color}`}>
              {moistureBadge.text}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">{plant.moisturePercent}%</span>
            <span className="text-xs text-slate-400 font-mono">vol</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                plant.moisturePercent < 25
                  ? 'bg-rose-500'
                  : plant.moisturePercent < 45
                  ? 'bg-amber-400'
                  : plant.moisturePercent <= 80
                  ? 'bg-emerald-400'
                  : 'bg-cyan-400'
              }`}
              style={{ width: `${plant.moisturePercent}%` }}
            />
          </div>
        </div>

        {/* Health Score */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" /> HEALTH VITALITY
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {plant.healthScore >= 80 ? 'THRIVING' : plant.healthScore >= 60 ? 'STABLE' : 'STRESSED'}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">{plant.healthScore}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-emerald-400 transition-all duration-500"
              style={{ width: `${plant.healthScore}%` }}
            />
          </div>
        </div>

        {/* Hydration Countdown */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> WATER CADENCE
            </span>
            <span className="text-[10px] font-mono text-slate-400">EVERY {plant.wateringIntervalDays}D</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              {daysUntilWater === 0 ? 'DUE TODAY' : `${daysUntilWater}d`}
            </span>
            <span className="text-xs text-slate-400 font-mono">{daysUntilWater === 0 ? '' : 'remaining'}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono truncate">
            Last: {daysSinceWatered === 0 ? 'Today' : `${daysSinceWatered} day(s) ago`}
          </p>
        </div>

        {/* Ambient Light & Pot */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> LIGHT / POT
            </span>
            <span className="text-[10px] font-mono text-slate-400">{plant.potSizeCm}cm</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold font-mono text-amber-300 tracking-tight uppercase">
              {plant.sunlightPref} Light
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {plant.indoor ? 'Indoor Specimen' : 'Outdoor Specimen'} • Azimuth {plant.rotationDeg}°
          </p>
        </div>
      </div>

      {/* Main Interactive Twin + JARVIS Console Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Plant Twin Canvas & Quick Action Toolbar */}
        <div className="lg:col-span-7 space-y-4">
          <ThreePlantTwin
            plant={plant}
            isWateringAnim={isWateringAnim}
            onRotationChange={(deg) => {
              onUpdatePlant({ ...plant, rotationDeg: deg });
            }}
          />

          {/* Quick Actions Panel */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> JARVIS Quick Botanical Actions
              </h4>
              <button
                onClick={handleExportJson}
                className="flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors"
                title="Export plant twin profile to JSON"
              >
                <Download className="w-3.5 h-3.5" />
                <span>EXPORT JSON</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {/* Water */}
              <button
                onClick={handleWater}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition-all group"
              >
                <Droplets className="w-5 h-5 group-hover:scale-110 transition-transform text-cyan-400" />
                <span className="text-xs font-mono font-medium">Water (250ml)</span>
              </button>

              {/* Mist */}
              <button
                onClick={handleMist}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 hover:border-sky-400 transition-all group"
              >
                <Wind className="w-5 h-5 group-hover:scale-110 transition-transform text-sky-400" />
                <span className="text-xs font-mono font-medium">Mist Fronds</span>
              </button>

              {/* Fertilize */}
              <button
                onClick={handleFertilize}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400 transition-all group"
              >
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform text-emerald-400" />
                <span className="text-xs font-mono font-medium">Feed Nutrients</span>
              </button>

              {/* Rotate 90 deg */}
              <button
                onClick={handleRotate}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400 transition-all group"
              >
                <RotateCw className="w-5 h-5 group-hover:rotate-90 transition-transform text-indigo-400" />
                <span className="text-xs font-mono font-medium">Rotate 90°</span>
              </button>

              {/* Prune */}
              <button
                onClick={handlePrune}
                className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/80 hover:border-slate-600 transition-all group"
              >
                <Scissors className="w-5 h-5 group-hover:scale-110 transition-transform text-slate-300" />
                <span className="text-xs font-mono font-medium">Prune Leaf</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Multilingual Voice & AI Botanical Assistant */}
        <div className="lg:col-span-5 h-[540px]">
          <JarvisAssistant
            plant={plant}
            onQuickAction={(action) => {
              if (action === 'water') handleWater();
              if (action === 'mist') handleMist();
              if (action === 'fertilize') handleFertilize();
              if (action === 'rotate') handleRotate();
            }}
            onAddTask={onAddTask}
          />
        </div>
      </div>

      {/* D3 30-Day Physiological Vigor Trend Line Chart */}
      <D3HealthTrendChart plant={plant} />
    </div>
  );
};
