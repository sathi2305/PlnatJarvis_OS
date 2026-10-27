import React, { useState } from 'react';
import { PlantProfile, WateringRecord } from '../types';
import { audio } from '../utils/audio';
import {
  Droplets,
  Plus,
  Calendar,
  Sparkles,
  Wind,
  Download,
  Filter,
  BarChart2,
  Trash2,
} from 'lucide-react';

interface WateringLogViewProps {
  plant: PlantProfile;
  records: WateringRecord[];
  onAddRecord: (record: WateringRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const WateringLogView: React.FC<WateringLogViewProps> = ({
  plant,
  records,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'water' | 'mist' | 'fertilizer'>('all');

  // Form State
  const [amountMl, setAmountMl] = useState(250);
  const [type, setType] = useState<'water' | 'mist' | 'fertilizer'>('water');
  const [note, setNote] = useState('');

  const plantRecords = records.filter((r) => r.plantId === plant.id);
  const filtered = filterType === 'all' ? plantRecords : plantRecords.filter((r) => r.type === filterType);

  // Statistics
  const totalMl = plantRecords
    .filter((r) => r.type === 'water')
    .reduce((acc, curr) => acc + curr.amountMl, 0);
  const waterCount = plantRecords.filter((r) => r.type === 'water').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    audio.playWaterDrop();

    const newRecord: WateringRecord = {
      id: `w-${Date.now()}`,
      plantId: plant.id,
      timestamp: new Date().toISOString(),
      amountMl: Number(amountMl),
      type,
      note: note.trim() || undefined,
    };

    onAddRecord(newRecord);
    setIsAdding(false);
    setNote('');
  };

  const handleExportCsv = () => {
    audio.playBeep(800, 0.05);
    const headers = 'ID,PlantID,Timestamp,Type,AmountML,Note\n';
    const rows = plantRecords
      .map(
        (r) =>
          `"${r.id}","${r.plantId}","${r.timestamp}","${r.type}",${r.amountMl},"${(r.note || '').replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plant.name.replace(/\s+/g, '_')}_Watering_Log.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Hydration Telemetry Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>TOTAL LIQUID INGESTION</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {totalMl.toLocaleString()} <span className="text-xs text-slate-400 font-sans font-normal">ml</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Across recorded lifecycle</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>WATERING EVENTS</span>
            <BarChart2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white tracking-tight">
            {waterCount} <span className="text-xs text-slate-400 font-sans font-normal">sessions</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Cadence: ~{plant.wateringIntervalDays} days target</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
            <span>CURRENT SOIL HYDRATION</span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-300 tracking-tight">
            {plant.moisturePercent}% <span className="text-xs text-slate-400 font-sans font-normal">saturation</span>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Optimal target: 50% - 75%</p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-sm sm:text-base text-slate-100 font-mono">
              HYDRATION LEDGER: {plant.name.toUpperCase()}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter buttons */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs font-mono">
              {(['all', 'water', 'mist', 'fertilizer'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                    filterType === t
                      ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">CSV</span>
            </button>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white transition-all shadow-md shadow-cyan-950"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Water</span>
            </button>
          </div>
        </div>

        {/* Add Record Modal / Expansion */}
        {isAdding && (
          <form
            onSubmit={handleSubmit}
            className="p-4 bg-slate-950/80 border-b border-slate-800 space-y-4 animate-fade-in"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">EVENT TYPE</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value="water">Deep Water (Root Soak)</option>
                  <option value="mist">Foliar Mist (Ambient)</option>
                  <option value="fertilizer">Nutrient Feed (Fertilizer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">VOLUME (ML)</label>
                <input
                  type="number"
                  min="10"
                  max="3000"
                  step="10"
                  value={amountMl}
                  onChange={(e) => setAmountMl(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">OBSERVATION / NOTE</label>
                <input
                  type="text"
                  placeholder="e.g. Room was warm; soil felt bone dry"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white shadow-md shadow-cyan-950 font-mono"
              >
                Save Log Entry
              </button>
            </div>
          </form>
        )}

        {/* Ledger Entries */}
        <div className="divide-y divide-slate-800/80">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              NO HYDRATION RECORDS MATCH CRITERIA.
            </div>
          ) : (
            filtered.map((r) => {
              const dateObj = new Date(r.timestamp);
              return (
                <div
                  key={r.id}
                  className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${
                        r.type === 'water'
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : r.type === 'mist'
                          ? 'bg-sky-500/10 border-sky-500/30 text-sky-400'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      }`}
                    >
                      {r.type === 'water' ? (
                        <Droplets className="w-4 h-4" />
                      ) : r.type === 'mist' ? (
                        <Wind className="w-4 h-4" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-semibold text-slate-200 capitalize font-mono">
                          {r.type}
                        </span>
                        <span className="text-xs font-mono font-medium text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded-md border border-cyan-800/40">
                          {r.amountMl} ml
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 font-sans">
                        {r.note || 'Regular scheduled care event'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px] font-mono text-slate-400">
                      <div>{dateObj.toLocaleDateString()}</div>
                      <div className="text-slate-500">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>

                    <button
                      onClick={() => onDeleteRecord(r.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-950/30"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
