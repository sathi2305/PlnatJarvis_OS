import React, { useState } from 'react';
import { PlantProfile, DiaryEntry } from '../types';
import { audio } from '../utils/audio';
import {
  BookOpen,
  Plus,
  Image as ImageIcon,
  Smile,
  Sparkles,
  AlertCircle,
  TrendingUp,
  Trash2,
  Calendar,
} from 'lucide-react';

interface PlantDiaryViewProps {
  plant: PlantProfile;
  entries: DiaryEntry[];
  onAddEntry: (entry: DiaryEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const PlantDiaryView: React.FC<PlantDiaryViewProps> = ({
  plant,
  entries,
  onAddEntry,
  onDeleteEntry,
}) => {
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<DiaryEntry['mood']>('thriving');
  const [growthStageCm, setGrowthStageCm] = useState<number>(24);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const plantEntries = entries.filter((e) => e.plantId === plant.id);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    audio.playSuccessChime();

    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      plantId: plant.id,
      date: new Date().toISOString(),
      title: title.trim(),
      content: content.trim(),
      growthStageCm: Number(growthStageCm) || undefined,
      mood,
      photoUrl: photoUrl || undefined,
    };

    onAddEntry(newEntry);
    setIsAdding(false);
    setTitle('');
    setContent('');
    setPhotoUrl('');
  };

  const getMoodBadge = (m: DiaryEntry['mood']) => {
    switch (m) {
      case 'thriving':
        return { label: 'Thriving', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'blooming':
        return { label: 'New Growth / Bloom', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'stable':
        return { label: 'Stable', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      case 'wilting':
        return { label: 'Wilting / Thirsty', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'pest_alert':
        return { label: 'Pest Alert', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            BOTANICAL CHRONICLE & DIARY
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Documenting physiological stages, node evolutions, and foliage observations for {plant.name}
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-lg shadow-emerald-950 transition-all font-mono"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Add New Entry Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> RECORD BOTANICAL OBSERVATION
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-200 font-mono"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">ENTRY TITLE</label>
              <input
                type="text"
                required
                placeholder="e.g. Unfurled fourth central frond, roots inspected"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">OBSERVED MOOD / STATE</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="thriving">Thriving (Vibrant)</option>
                <option value="blooming">New Growth / Bloom</option>
                <option value="stable">Stable (Maintenance)</option>
                <option value="wilting">Wilting / Stressed</option>
                <option value="pest_alert">Pest Alert (Underleaf)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">CANOPY / HEIGHT (CM)</label>
              <input
                type="number"
                min="1"
                max="500"
                value={growthStageCm}
                onChange={(e) => setGrowthStageCm(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>PLANT PHOTO ATTACHMENT</span>
                {photoUrl && <span className="text-emerald-400 text-[10px]">Image Loaded</span>}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-mono file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">DETAILED FIELD NOTES</label>
            <textarea
              required
              rows={3}
              placeholder="Record details on leaf texture, soil odor, drainage, new shoots, or pest interventions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-sans resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-xs font-mono text-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white shadow-lg shadow-emerald-950 font-mono"
            >
              Commit Entry to OS
            </button>
          </div>
        </form>
      )}

      {/* Diary Timeline Entries */}
      <div className="space-y-4">
        {plantEntries.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs">
            NO JOURNAL ENTRIES RECORDED FOR THIS PLANT YET. CLICK "NEW JOURNAL ENTRY" TO LOG GROWTH.
          </div>
        ) : (
          plantEntries.map((entry) => {
            const badge = getMoodBadge(entry.mood);
            const dateObj = new Date(entry.date);
            return (
              <div
                key={entry.id}
                className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 backdrop-blur-md shadow-xl transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-100 font-mono">
                      {entry.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {dateObj.toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => onDeleteEntry(entry.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-950/20"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className={entry.photoUrl ? 'md:col-span-3 space-y-2' : 'md:col-span-4 space-y-2'}>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {entry.content}
                    </p>

                    {entry.growthStageCm && (
                      <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 pt-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Canopy Stage: {entry.growthStageCm} cm</span>
                      </div>
                    )}
                  </div>

                  {entry.photoUrl && (
                    <div className="md:col-span-1 rounded-xl overflow-hidden border border-slate-800 max-h-48">
                      <img
                        src={entry.photoUrl}
                        alt="Plant growth milestone"
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
