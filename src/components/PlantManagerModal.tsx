import React, { useState } from 'react';
import { PlantProfile, PlantSpeciesType, SunlightPreference } from '../types';
import { audio } from '../utils/audio';
import {
  Sprout,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  X,
  Sparkles,
} from 'lucide-react';

interface PlantManagerModalProps {
  plants: PlantProfile[];
  activePlantId: string;
  onSelectPlant: (id: string) => void;
  onAddPlant: (plant: PlantProfile) => void;
  onDeletePlant: (id: string) => void;
  onClose: () => void;
}

const SPECIES_PRESETS: {
  label: string;
  species: string;
  speciesType: PlantSpeciesType;
  potSizeCm: number;
  sunlightPref: SunlightPreference;
  wateringIntervalDays: number;
  notes: string;
}[] = [
  {
    label: 'Boston Fern',
    species: 'Nephrolepis exaltata',
    speciesType: 'fern',
    potSizeCm: 18,
    sunlightPref: 'indirect',
    wateringIntervalDays: 4,
    notes: 'Loves high humidity, safe for pets.',
  },
  {
    label: 'Monstera Deliciosa',
    species: 'Monstera deliciosa',
    speciesType: 'monstera',
    potSizeCm: 25,
    sunlightPref: 'indirect',
    wateringIntervalDays: 7,
    notes: 'Iconic split leaves, likes bright indirect light.',
  },
  {
    label: 'Snake Plant / Mother-in-Law Tongue',
    species: 'Dracaena trifasciata',
    speciesType: 'snake_plant',
    potSizeCm: 20,
    sunlightPref: 'low',
    wateringIntervalDays: 14,
    notes: 'Extremely drought tolerant, purifies indoor air.',
  },
  {
    label: 'Peace Lily',
    species: 'Spathiphyllum wallisii',
    speciesType: 'peace_lily',
    potSizeCm: 18,
    sunlightPref: 'low',
    wateringIntervalDays: 5,
    notes: 'Elegant white blooms, droops dramatically when thirsty.',
  },
  {
    label: 'Jade Succulent',
    species: 'Crassula ovata',
    speciesType: 'succulent',
    potSizeCm: 15,
    sunlightPref: 'direct',
    wateringIntervalDays: 12,
    notes: 'Thick succulent foliage, allow soil to dry completely.',
  },
  {
    label: 'Fiddle Leaf Fig',
    species: 'Ficus lyrata',
    speciesType: 'ficus',
    potSizeCm: 30,
    sunlightPref: 'indirect',
    wateringIntervalDays: 8,
    notes: 'Broad architectural violin leaves, dislikes drafts.',
  },
];

export const PlantManagerModal: React.FC<PlantManagerModalProps> = ({
  plants,
  activePlantId,
  onSelectPlant,
  onAddPlant,
  onDeletePlant,
  onClose,
}) => {
  const [isCreating, setIsCreating] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1);
  const [potSizeCm, setPotSizeCm] = useState(20);
  const [indoor, setIndoor] = useState(true);
  const [sunlightPref, setSunlightPref] = useState<SunlightPreference>('indirect');
  const [intervalDays, setIntervalDays] = useState(7);
  const [notes, setNotes] = useState('');

  const handleApplyPreset = (idx: number) => {
    setSelectedPresetIndex(idx);
    const p = SPECIES_PRESETS[idx];
    setName(p.label);
    setPotSizeCm(p.potSizeCm);
    setSunlightPref(p.sunlightPref);
    setIntervalDays(p.wateringIntervalDays);
    setNotes(p.notes);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    audio.playSuccessChime();

    const preset = SPECIES_PRESETS[selectedPresetIndex];
    const newPlant: PlantProfile = {
      id: `plant-${Date.now()}`,
      name: name.trim(),
      species: preset.species,
      speciesType: preset.speciesType,
      potSizeCm: Number(potSizeCm),
      indoor,
      sunlightPref,
      wateringIntervalDays: Number(intervalDays),
      healthScore: 90,
      moisturePercent: 60,
      lastWatered: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      notes: notes.trim() || preset.notes,
      isProtected: false,
      rotationDeg: 0,
    };

    onAddPlant(newPlant);
    onSelectPlant(newPlant.id);
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <Sprout className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base sm:text-lg font-bold font-mono text-slate-100">
              BOTANICAL TWIN REGISTRY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Plants List */}
        {!isCreating ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                ACTIVE DIGITAL SPECIMENS ({plants.length})
              </span>
              <button
                onClick={() => {
                  handleApplyPreset(1);
                  setIsCreating(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono text-white transition-all shadow-md shadow-emerald-950"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Plant</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {plants.map((p) => {
                const isActive = p.id === activePlantId;
                return (
                  <div
                    key={p.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      isActive
                        ? 'bg-slate-800/80 border-cyan-500/60 shadow-lg shadow-cyan-950/20'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div
                      onClick={() => {
                        onSelectPlant(p.id);
                        audio.playBeep(880, 0.05);
                      }}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold font-mono text-slate-100">{p.name}</span>
                        {p.isProtected && (
                          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                            <ShieldCheck className="w-3 h-3" /> PROTECTED STARTER
                          </span>
                        )}
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> LINKED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {p.species} • {p.healthScore}% Vitality • Moisture {p.moisturePercent}%
                      </p>
                    </div>

                    {!p.isProtected && (
                      <button
                        onClick={() => {
                          audio.playBeep(350, 0.08);
                          onDeletePlant(p.id);
                        }}
                        className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all shrink-0"
                        title="Delete Plant Specimen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Create Form */
          <form onSubmit={handleCreate} className="space-y-4 animate-fade-in">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                SELECT BOTANICAL PRESET
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SPECIES_PRESETS.map((preset, idx) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleApplyPreset(idx)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs font-mono ${
                      selectedPresetIndex === idx
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold truncate">{preset.label}</div>
                    <div className="text-[10px] text-slate-500 truncate">{preset.species}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">PLANT CUSTOM NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Living Room Monstera"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">POT DIAMETER (CM)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={potSizeCm}
                  onChange={(e) => setPotSizeCm(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">LIGHT PREFERENCE</label>
                <select
                  value={sunlightPref}
                  onChange={(e) => setSunlightPref(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="low">Low Light</option>
                  <option value="indirect">Bright Indirect</option>
                  <option value="direct">Direct Sunlight</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">WATER CADENCE (DAYS)</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={intervalDays}
                  onChange={(e) => setIntervalDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">ENVIRONMENT</label>
                <select
                  value={indoor ? 'indoor' : 'outdoor'}
                  onChange={(e) => setIndoor(e.target.value === 'indoor')}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="indoor">Indoor Houseplant</option>
                  <option value="outdoor">Outdoor / Patio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">NOTES</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-sans resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-mono text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-mono font-medium text-white shadow-lg shadow-emerald-950"
              >
                Register & Synchronize Twin
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
