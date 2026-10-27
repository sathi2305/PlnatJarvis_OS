import React, { useState, useEffect } from 'react';
import {
  PlantProfile,
  WateringRecord,
  DiaryEntry,
  CareTask,
  WeatherData,
} from './types';
import { storage } from './utils/storage';
import { audio } from './utils/audio';

// Components
import { Dashboard } from './components/Dashboard';
import { WateringLogView } from './components/WateringLogView';
import { PlantDiaryView } from './components/PlantDiaryView';
import { TasksRemindersView } from './components/TasksRemindersView';
import { WeatherView } from './components/WeatherView';
import { GrowthLabView } from './components/GrowthLabView';
import { PlantManagerModal } from './components/PlantManagerModal';
import { JarvisToolsModal } from './components/JarvisToolsModal';

// Icons
import {
  Cpu,
  LayoutDashboard,
  Droplets,
  BookOpen,
  CheckSquare,
  Sun,
  FastForward,
  Wrench,
  ChevronDown,
  Volume2,
  VolumeX,
  Moon,
  Sparkles,
  Menu,
  X,
  Compass,
} from 'lucide-react';

export const App: React.FC = () => {
  // 1. Core State
  const [plants, setPlants] = useState<PlantProfile[]>(() => storage.getPlants());
  const [activePlantId, setActivePlantId] = useState<string>(() => storage.getActivePlantId());
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'watering' | 'diary' | 'tasks' | 'weather' | 'growth_lab'
  >('dashboard');

  const [wateringLogs, setWateringLogs] = useState<WateringRecord[]>(() => storage.getWateringLogs());
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>(() => storage.getDiaryEntries());
  const [tasks, setTasks] = useState<CareTask[]>(() => storage.getTasks());
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // UI state
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isPlantManagerOpen, setIsPlantManagerOpen] = useState<boolean>(false);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);

  // Uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format uptime for HUD
  const formatUptime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find active plant profile (fallback to first plant)
  const activePlant = plants.find((p) => p.id === activePlantId) || plants[0];

  // Sync to storage
  const handleUpdatePlant = (updated: PlantProfile) => {
    const next = plants.map((p) => (p.id === updated.id ? updated : p));
    setPlants(next);
    storage.savePlants(next);
  };

  const handleSelectPlant = (id: string) => {
    setActivePlantId(id);
    storage.setActivePlantId(id);
    audio.playBeep(880, 0.05);
  };

  const handleAddPlant = (newPlant: PlantProfile) => {
    const next = [...plants, newPlant];
    setPlants(next);
    storage.savePlants(next);
  };

  const handleDeletePlant = (id: string) => {
    const plantToDelete = plants.find((p) => p.id === id);
    if (plantToDelete?.isProtected) return;
    const next = plants.filter((p) => p.id !== id);
    setPlants(next);
    storage.savePlants(next);
    if (activePlantId === id && next.length > 0) {
      setActivePlantId(next[0].id);
      storage.setActivePlantId(next[0].id);
    }
  };

  const handleAddWateringRecord = (record: WateringRecord) => {
    const next = [record, ...wateringLogs];
    setWateringLogs(next);
    storage.saveWateringLogs(next);
  };

  const handleDeleteWateringRecord = (id: string) => {
    const next = wateringLogs.filter((r) => r.id !== id);
    setWateringLogs(next);
    storage.saveWateringLogs(next);
  };

  const handleAddDiaryEntry = (entry: DiaryEntry) => {
    const next = [entry, ...diaryEntries];
    setDiaryEntries(next);
    storage.saveDiaryEntries(next);
  };

  const handleDeleteDiaryEntry = (id: string) => {
    const next = diaryEntries.filter((e) => e.id !== id);
    setDiaryEntries(next);
    storage.saveDiaryEntries(next);
  };

  const handleToggleTask = (id: string) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(next);
    storage.saveTasks(next);
  };

  const handleAddTask = (newTask: CareTask) => {
    const next = [newTask, ...tasks];
    setTasks(next);
    storage.saveTasks(next);
  };

  const handleDeleteTask = (id: string) => {
    const next = tasks.filter((t) => t.id !== id);
    setTasks(next);
    storage.saveTasks(next);
  };

  const handleQuickAddTask = (title: string) => {
    const newTask: CareTask = {
      id: `task-${Date.now()}`,
      plantId: activePlant.id,
      title,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      priority: 'normal',
      type: 'water',
    };
    handleAddTask(newTask);
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.setSoundEnabled(next);
    if (next) audio.playBeep(880, 0.05);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    audio.playBeep(520, 0.05);
  };

  // Nav Items
  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Plant Twin HUD', icon: LayoutDashboard },
    { id: 'watering', label: 'Hydration Ledger', icon: Droplets },
    { id: 'diary', label: 'Botanical Diary', icon: BookOpen },
    { id: 'tasks', label: 'Care Protocols', icon: CheckSquare },
    { id: 'weather', label: 'Microclimate', icon: Sun },
    { id: 'growth_lab', label: 'Growth Lab', icon: FastForward },
  ] as const;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-100 hud-grid'
          : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top OS Navigation Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl px-4 py-2.5 flex items-center justify-between transition-colors ${
          theme === 'dark'
            ? 'bg-slate-950/80 border-slate-800/80'
            : 'bg-white/80 border-slate-200'
        }`}
      >
        {/* Left: Branding & Twin OS Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-md shadow-emerald-950/20">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold font-mono tracking-tight text-sm sm:text-base text-slate-100">
                  PLANT<span className="text-emerald-400">TWIN</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                  JARVIS OS V13
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400 hidden sm:block">
                UPTIME: {formatUptime(uptimeSeconds)} • NEURAL BOTANICAL CORE
              </p>
            </div>
          </div>
        </div>

        {/* Center: Active Plant Selector Pill */}
        <div className="hidden md:flex items-center gap-2">
          <div
            onClick={() => setIsPlantManagerOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all text-xs font-mono"
            title="Click to switch or manage plant specimens"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-semibold">{activePlant.name}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">{activePlant.healthScore}% HP</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </div>
        </div>

        {/* Right: OS Utility Icons & Theme */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Weather Indicator */}
          {weather && (
            <div
              onClick={() => setActiveTab('weather')}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-cyan-300 cursor-pointer transition-all"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{weather.city.split(',')[0]}</span>
              <span className="text-cyan-400 font-bold">{weather.tempC}°C</span>
            </div>
          )}

          {/* Link to Advanced Gesture & Voice Digital Twin */}
          <a
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-all font-semibold"
            title="Switch to Advanced Gesture + Voice Twin"
          >
            <span>🖐 Advanced JARVIS</span>
          </a>

          {/* Plant Specimen Manager trigger */}
          <button
            onClick={() => setIsPlantManagerOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/80 text-slate-300 hover:text-cyan-300 border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all"
            title="Manage Digital Twin Plants"
          >
            <span className="hidden sm:inline">Plants</span>
            <span className="text-[10px] px-1 rounded bg-slate-800 text-cyan-400">
              {plants.length}
            </span>
          </button>

          {/* OS Tools & Diagnostics */}
          <button
            onClick={() => setIsToolsOpen(true)}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-slate-700 text-xs transition-all"
            title="JARVIS OS Utilities & Telemetry"
          >
            <Wrench className="w-4 h-4" />
          </button>

          {/* Audio Sound FX Toggle */}
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs transition-all ${
              soundEnabled
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-slate-900/80 text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'Mute System Audio' : 'Unmute System Audio'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Appearance Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-amber-400 border border-slate-800 hover:border-slate-700 text-xs transition-all"
            title="Toggle Light/Dark Theme"
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main OS Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Desktop Sidebar Navigation */}
        <aside
          className={`hidden md:flex flex-col gap-2 shrink-0 transition-all duration-300 ${
            isSidebarOpen ? 'w-56' : 'w-16'
          }`}
        >
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 backdrop-blur-md space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    audio.playBeep(isActive ? 500 : 700, 0.04);
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all select-none ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 glow-cyan'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  } ${!isSidebarOpen && 'justify-center'}`}
                  title={item.label}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {isSidebarOpen && <span className="truncate">{item.label}</span>}
                </button>
              );
            })}
          </div>

          {/* Digital Twin Status Card in Sidebar */}
          {isSidebarOpen && (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-400 text-[10px]">
                <span>TWIN STATUS</span>
                <span className="text-emerald-400">ONLINE</span>
              </div>
              <div className="font-semibold text-slate-100 truncate">{activePlant.name}</div>
              <div className="text-[11px] text-slate-400">{activePlant.species}</div>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">MOISTURE:</span>
                <span className="text-cyan-400 font-bold">{activePlant.moisturePercent}%</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">HEALTH:</span>
                <span className="text-emerald-400 font-bold">{activePlant.healthScore}/100</span>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <span className="font-mono font-bold text-slate-100">NAVIGATION MENU</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-mono ${
                        isActive
                          ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                setIsPlantManagerOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 text-center"
            >
              Manage Plants & Switch Specimen
            </button>
          </div>
        )}

        {/* Content Viewport */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <Dashboard
              plant={activePlant}
              weather={weather}
              onUpdatePlant={handleUpdatePlant}
              onLogWatering={(amountMl, type, note) => {
                handleAddWateringRecord({
                  id: `w-${Date.now()}`,
                  plantId: activePlant.id,
                  timestamp: new Date().toISOString(),
                  amountMl,
                  type,
                  note,
                });
              }}
              onOpenTools={() => setIsToolsOpen(true)}
              onAddTask={handleQuickAddTask}
            />
          )}

          {activeTab === 'watering' && (
            <WateringLogView
              plant={activePlant}
              records={wateringLogs}
              onAddRecord={handleAddWateringRecord}
              onDeleteRecord={handleDeleteWateringRecord}
            />
          )}

          {activeTab === 'diary' && (
            <PlantDiaryView
              plant={activePlant}
              entries={diaryEntries}
              onAddEntry={handleAddDiaryEntry}
              onDeleteEntry={handleDeleteDiaryEntry}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksRemindersView
              plant={activePlant}
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherView
              plant={activePlant}
              weather={weather}
              onUpdateWeather={setWeather}
            />
          )}

          {activeTab === 'growth_lab' && <GrowthLabView plant={activePlant} />}
        </main>
      </div>

      {/* Plant Manager Modal */}
      {isPlantManagerOpen && (
        <PlantManagerModal
          plants={plants}
          activePlantId={activePlantId}
          onSelectPlant={handleSelectPlant}
          onAddPlant={handleAddPlant}
          onDeletePlant={handleDeletePlant}
          onClose={() => setIsPlantManagerOpen(false)}
        />
      )}

      {/* JARVIS OS Tools Modal */}
      {isToolsOpen && (
        <JarvisToolsModal
          plant={activePlant}
          onClose={() => setIsToolsOpen(false)}
          onDataRestored={() => {
            setPlants(storage.getPlants());
            setActivePlantId(storage.getActivePlantId());
            setWateringLogs(storage.getWateringLogs());
            setDiaryEntries(storage.getDiaryEntries());
            setTasks(storage.getTasks());
          }}
        />
      )}
    </div>
  );
};

export default App;
