import React, { useState, useEffect } from 'react';
import { PlantProfile, CareTask } from '../types';
import { audio } from '../utils/audio';
import {
  CheckSquare,
  Square,
  Plus,
  Bell,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  Droplets,
  Wind,
  RotateCw,
  Scissors,
  Trash2,
  BellRing,
} from 'lucide-react';

interface TasksRemindersViewProps {
  plant: PlantProfile;
  tasks: CareTask[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: CareTask) => void;
  onDeleteTask: (id: string) => void;
}

export const TasksRemindersView: React.FC<TasksRemindersViewProps> = ({
  plant,
  tasks,
  onToggleTask,
  onAddTask,
  onDeleteTask,
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'urgent'>('pending');
  const [isAdding, setIsAdding] = useState(false);
  const [hasNotificationPermission, setHasNotificationPermission] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [priority, setPriority] = useState<CareTask['priority']>('normal');
  const [type, setType] = useState<CareTask['type']>('water');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setHasNotificationPermission(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationAccess = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setHasNotificationPermission(perm === 'granted');
      if (perm === 'granted') {
        audio.playSuccessChime();
        new Notification('PlantTwin JARVIS OS', {
          body: 'Botanical notification protocol initialized. Due care reminders will alert here.',
        });
      }
    } else {
      alert('Desktop notifications are not supported in this browser.');
    }
  };

  const plantTasks = tasks.filter((t) => t.plantId === plant.id);

  const filteredTasks = plantTasks.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'urgent') return !t.completed && t.priority === 'urgent';
    return true;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    audio.playBeep(750, 0.05);

    const newTask: CareTask = {
      id: `task-${Date.now()}`,
      plantId: plant.id,
      title: title.trim(),
      dueDate: new Date(dueDate).toISOString(),
      completed: false,
      priority,
      type,
    };

    onAddTask(newTask);
    setIsAdding(false);
    setTitle('');
  };

  const getTaskIcon = (t: CareTask['type']) => {
    switch (t) {
      case 'water':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'mist':
        return <Wind className="w-4 h-4 text-sky-400" />;
      case 'fertilize':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'rotate':
        return <RotateCw className="w-4 h-4 text-indigo-400" />;
      case 'prune':
        return <Scissors className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 font-mono">
            <Bell className="w-5 h-5 text-indigo-400" />
            CARE PROTOCOLS & REMINDERS
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Synchronized botanical task scheduler for {plant.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!hasNotificationPermission && (
            <button
              onClick={requestNotificationAccess}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono transition-all"
              title="Enable desktop notifications"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>Enable Browser Alerts</span>
            </button>
          )}

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-950 transition-all font-mono"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reminder</span>
          </button>
        </div>
      </div>

      {/* Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleCreateTask}
          className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-5 backdrop-blur-md shadow-2xl space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono font-semibold text-indigo-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> SCHEDULE BOTANICAL REMINDER
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-slate-400 hover:text-slate-200 font-mono"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-mono text-slate-400 mb-1">TASK DESCRIPTION</label>
              <input
                type="text"
                required
                placeholder="e.g. Deep soak pot in sink & drain thoroughly"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">CARE CATEGORY</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="water">Watering</option>
                <option value="mist">Foliar Mist</option>
                <option value="fertilize">Nutrient Feed</option>
                <option value="rotate">Rotate Pot</option>
                <option value="prune">Prune / Inspection</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">PRIORITY</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">TARGET DEADLINE DATE</label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white shadow-lg shadow-indigo-950 font-mono"
            >
              Schedule Reminder
            </button>
          </div>
        </form>
      )}

      {/* Task Filters */}
      <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-2 w-fit">
        {(['pending', 'urgent', 'completed', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-all ${
              filter === f
                ? 'bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {f} ({plantTasks.filter((t) => {
              if (f === 'pending') return !t.completed;
              if (f === 'completed') return t.completed;
              if (f === 'urgent') return !t.completed && t.priority === 'urgent';
              return true;
            }).length})
          </button>
        ))}
      </div>

      {/* Task Cards */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center text-slate-400 font-mono text-xs">
            NO CARE TASKS CURRENTLY IN QUEUE FOR THIS FILTER.
          </div>
        ) : (
          filteredTasks.map((t) => {
            const dateObj = new Date(t.dueDate);
            const isOverdue = !t.completed && dateObj.getTime() < Date.now();

            return (
              <div
                key={t.id}
                className={`bg-slate-900/60 border rounded-2xl p-4 backdrop-blur-md transition-all flex items-center justify-between gap-4 ${
                  t.completed
                    ? 'border-slate-800/60 opacity-60'
                    : isOverdue
                    ? 'border-rose-500/40 bg-rose-950/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <button
                    onClick={() => {
                      audio.playBeep(t.completed ? 440 : 880, 0.05);
                      onToggleTask(t.id);
                    }}
                    className="text-slate-400 hover:text-cyan-400 transition-colors shrink-0"
                  >
                    {t.completed ? (
                      <CheckSquare className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1 rounded-md bg-slate-800 border border-slate-700/60">
                        {getTaskIcon(t.type)}
                      </span>
                      <span
                        className={`text-sm font-medium font-sans truncate ${
                          t.completed ? 'line-through text-slate-400' : 'text-slate-100'
                        }`}
                      >
                        {t.title}
                      </span>
                      {t.priority === 'urgent' && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          URGENT
                        </span>
                      )}
                      {isOverdue && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 border border-rose-800">
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> Due: {dateObj.toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteTask(t.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-950/20 shrink-0"
                  title="Remove Task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
