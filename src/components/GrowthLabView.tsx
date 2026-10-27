import React, { useState } from 'react';
import { PlantProfile, SimulationParams } from '../types';
import { ThreePlantTwin } from './ThreePlantTwin';
import { audio } from '../utils/audio';
import {
  FastForward,
  Clock,
  Sparkles,
  Sun,
  Droplets,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Zap,
} from 'lucide-react';

interface GrowthLabViewProps {
  plant: PlantProfile;
}

export const GrowthLabView: React.FC<GrowthLabViewProps> = ({ plant }) => {
  const [params, setParams] = useState<SimulationParams>({
    daysAhead: 30,
    wateringFrequencyDays: plant.wateringIntervalDays,
    sunlightExposure: 'balanced',
    fertilizerUsed: true,
  });

  // Calculate simulated projections
  const calculateProjection = () => {
    let health = plant.healthScore;
    let growthCm = 0;
    const warnings: string[] = [];

    // Watering impact
    const diff = params.wateringFrequencyDays - plant.wateringIntervalDays;
    if (params.wateringFrequencyDays <= 2) {
      // Overwatering
      health -= 28;
      warnings.push('Overwatering Protocol: Anaerobic microbial buildup in potting mix. Root rot risk elevated.');
    } else if (params.wateringFrequencyDays >= 12) {
      // Dehydration
      health -= 25;
      warnings.push('Severe Drought Stress: Stomatal closure, cell turgor loss, frond edge desiccation.');
    } else {
      health += 4;
      growthCm += (params.daysAhead / 30) * 3.5;
    }

    // Sunlight impact
    if (params.sunlightExposure === 'intense' && plant.sunlightPref !== 'direct') {
      health -= 18;
      warnings.push('Photobleaching & Leaf Scorch: Ultraviolet radiation exceeds chlorophyll saturation threshold.');
    } else if (params.sunlightExposure === 'low' && plant.sunlightPref === 'direct') {
      health -= 12;
      warnings.push('Etiolation Risk: Pale, elongated stems seeking light.');
    } else {
      growthCm += (params.daysAhead / 30) * 2;
    }

    // Fertilizer impact
    if (params.fertilizerUsed) {
      health += 5;
      growthCm += (params.daysAhead / 30) * 2.5;
    }

    health = Math.max(15, Math.min(100, Math.round(health)));
    growthCm = Math.max(0, Math.round(growthCm * 10) / 10);

    return { health, growthCm, warnings };
  };

  const projection = calculateProjection();

  // Create simulated plant twin for 3D render
  const simulatedPlant: PlantProfile = {
    ...plant,
    healthScore: projection.health,
    moisturePercent:
      params.wateringFrequencyDays <= 2
        ? 95
        : params.wateringFrequencyDays >= 12
        ? 15
        : 65,
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
            <FastForward className="w-5 h-5 text-cyan-400" />
            GROWTH LAB & PLANT TIME MACHINE
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Illustrative temporal scenario projection engine (simulated digital twin models)
          </p>
        </div>

        <button
          onClick={() => {
            audio.playBeep(450, 0.05);
            setParams({
              daysAhead: 30,
              wateringFrequencyDays: plant.wateringIntervalDays,
              sunlightExposure: 'balanced',
              fertilizerUsed: true,
            });
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-5">
            <h3 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4" /> Environmental Simulation Parameters
            </h3>

            {/* Time horizon */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" /> TEMPORAL HORIZON
                </span>
                <span className="text-cyan-400 font-bold">+{params.daysAhead} DAYS</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[7, 30, 90].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => {
                      audio.playBeep(600 + days * 2, 0.04);
                      setParams({ ...params, daysAhead: days });
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-semibold transition-all border ${
                      params.daysAhead === days
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 glow-cyan'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    +{days} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Watering frequency */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> WATERING CADENCE
                </span>
                <span className="text-cyan-400 font-bold">
                  Every {params.wateringFrequencyDays} days
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="16"
                step="1"
                value={params.wateringFrequencyDays}
                onChange={(e) =>
                  setParams({ ...params, wateringFrequencyDays: Number(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                <span className="text-rose-400">Overwatered (1-2d)</span>
                <span className="text-emerald-400">Ideal ({plant.wateringIntervalDays}d)</span>
                <span className="text-amber-400">Drought (12-16d)</span>
              </div>
            </div>

            {/* Sunlight Exposure */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> LIGHT EXPOSURE
                </span>
                <span className="text-amber-300 font-bold uppercase">{params.sunlightExposure}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'balanced', 'intense'] as const).map((light) => (
                  <button
                    key={light}
                    type="button"
                    onClick={() => {
                      audio.playBeep(700, 0.04);
                      setParams({ ...params, sunlightExposure: light });
                    }}
                    className={`py-2 rounded-xl text-xs font-mono font-semibold capitalize transition-all border ${
                      params.sunlightExposure === light
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {light}
                  </button>
                ))}
              </div>
            </div>

            {/* Fertilizer Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-mono text-slate-200">Balanced Nutrient Feeding</div>
                  <div className="text-[11px] text-slate-400">Regular micro-dose nitrogen & trace minerals</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  audio.playBeep(650, 0.04);
                  setParams({ ...params, fertilizerUsed: !params.fertilizerUsed });
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                  params.fertilizerUsed
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {params.fertilizerUsed ? 'ENABLED' : 'DISABLED'}
              </button>
            </div>
          </div>

          {/* Projection Outcomes */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Predicted Vitality in +{params.daysAhead} Days
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">PROJECTED HEALTH</span>
                <div className="text-2xl font-bold font-mono text-white flex items-baseline gap-1">
                  <span
                    className={
                      projection.health >= 80
                        ? 'text-emerald-400'
                        : projection.health >= 55
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }
                  >
                    {projection.health}
                  </span>
                  <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block mb-1">CANOPY EXTENSION</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 flex items-baseline gap-1">
                  +{projection.growthCm} <span className="text-xs text-slate-400 font-normal">cm</span>
                </div>
              </div>
            </div>

            {/* Warnings list */}
            {projection.warnings.length > 0 ? (
              <div className="space-y-2 pt-2">
                {projection.warnings.map((warn, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-xs font-mono text-rose-300 flex items-start gap-2.5"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/30 text-xs font-mono text-emerald-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Optimal simulation conditions: Robust root and foliage expansion expected.</span>
              </div>
            )}
          </div>
        </div>

        {/* 3D Simulated Twin Column */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-mono text-slate-400">
              SIMULATED TWIN RENDERING (+{params.daysAhead} DAYS)
            </span>
            <span className="text-xs font-mono text-cyan-400">
              VITALITY: {projection.health}%
            </span>
          </div>

          <ThreePlantTwin plant={simulatedPlant} />

          <p className="text-[11px] font-mono text-slate-500 text-center">
            * Note: Simulation scenarios are illustrative computational projections and do not replace real-world sensor telemetry.
          </p>
        </div>
      </div>
    </div>
  );
};
