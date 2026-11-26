import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { RealmClock } from './components/RealmClock';
import { MeditationPanel } from './components/MeditationPanel';
import { PlannerPanel } from './components/PlannerPanel';
import { CultivationLog, AppBackupPayload } from './components/CultivationLog';
import { BreakthroughOverlay } from './components/BreakthroughOverlay';
import {
  BREATHING_PATTERNS,
  BreathingPatternKey,
  CULTIVATION_REALMS,
  CULTIVATION_TECHNIQUES,
  CultivationTask,
  CultivationTechnique,
  getCurrentShichen,
  getRealmForMinutes,
  SessionRecord,
  SoundscapeType,
  TechniqueKey,
  THEME_PALETTES,
  ThemePaletteKey,
} from './types/cultivation';
import { soundEngine } from './utils/soundEngine';

type NavTab = 'timer' | 'meditation' | 'planner' | 'log';

const STORAGE_KEYS = {
  TASKS: 'taixu_mortal_tasks_v2',
  RECORDS: 'taixu_mortal_records_v2',
  BELL: 'taixu_bell_v1',
  MODE: 'taixu_color_mode_v1',
  PALETTE: 'taixu_palette_v1',
};

const DEFAULT_TASKS: CultivationTask[] = [
  {
    id: 'starter-1',
    title: '晨起长春功吐纳定神',
    minutes: 15,
    technique: 'changchun',
    scheduledTime: '07:30',
    priority: 'normal',
    completed: false,
    createdAt: Date.now() - 3600000 * 3,
  },
  {
    id: 'starter-2',
    title: '青元剑诀凝神研习主业',
    minutes: 25,
    technique: 'qingyuan',
    scheduledTime: '09:30',
    priority: 'high',
    completed: false,
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'starter-3',
    title: '大衍诀神识推演复盘',
    minutes: 45,
    technique: 'dayan',
    scheduledTime: '21:00',
    priority: 'normal',
    completed: false,
    createdAt: Date.now() - 3600000,
  },
];

const QUICK_PRESETS = [
  { label: '一炷香', minutes: 15 },
  { label: '小周天', minutes: 25 },
  { label: '大周天', minutes: 45 },
  { label: '半时辰', minutes: 60 },
];

function loadInitialTasks(): CultivationTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_TASKS;
}

function loadInitialRecords(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  return [];
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('timer');
  const [now, setNow] = useState<Date>(() => new Date());

  // Theme Mode (Day / Night) & Color Palette
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MODE);
      return saved ? saved === 'dark' : true;
    } catch {
      return true;
    }
  });
  const [palette, setPalette] = useState<ThemePaletteKey>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PALETTE) as ThemePaletteKey | null;
      return saved && THEME_PALETTES.some((p) => p.key === saved) ? saved : 'gold';
    } catch {
      return 'gold';
    }
  });

  // Core Clock & Technique State
  const [selectedTechnique, setSelectedTechnique] = useState<TechniqueKey>('qingyuan');
  const [previewRealmLevel, setPreviewRealmLevel] = useState<number | null>(null);
  const [timerMode, setTimerMode] = useState<'timer' | 'stopwatch'>('timer');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [taskTitle, setTaskTitle] = useState<string>('专注研习');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Meditation State
  const [breathPatternKey, setBreathPatternKey] = useState<BreathingPatternKey>('box');
  const [isMeditating, setIsMeditating] = useState<boolean>(false);
  const [meditationMinutes, setMeditationMinutes] = useState<number>(15);
  const [meditationElapsed, setMeditationElapsed] = useState<number>(0);
  const [soundscape, setSoundscape] = useState<SoundscapeType>('none');
  const [volume, setVolume] = useState<number>(0.4);
  const [bellEnabled, setBellEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BELL);
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Planner & Logs State
  const [tasks, setTasks] = useState<CultivationTask[]>(loadInitialTasks);
  const [records, setRecords] = useState<SessionRecord[]>(loadInitialRecords);
  const [completionBanner, setCompletionBanner] = useState<string | null>(null);
  const [breakthroughRealm, setBreakthroughRealm] = useState<number | null>(null);

  const lastTickRef = useRef<number | null>(null);
  const lastBreathPhaseRef = useRef<string>('');

  // Sync Day/Night class and Palette attribute on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-palette', palette);
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, isDark ? 'dark' : 'light');
      localStorage.setItem(STORAGE_KEYS.PALETTE, palette);
    } catch {
      // ignore
    }
  }, [isDark, palette]);

  // Persist tasks, records, bell preference
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BELL, String(bellEnabled));
    } catch {
      // ignore
    }
  }, [bellEnabled]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    soundEngine.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (soundscape === 'none') {
      soundEngine.stopAmbient();
    } else {
      soundEngine.startAmbient(soundscape);
    }
    return () => {
      soundEngine.stopAmbient();
    };
  }, [soundscape]);

  const totalMinutes = useMemo(
    () => records.reduce((sum, r) => sum + r.minutes, 0),
    [records]
  );
  const completedTasksCount = useMemo(
    () => tasks.filter((t) => t.completed).length,
    [tasks]
  );
  const realmInfo = getRealmForMinutes(totalMinutes);
  const displayRealmLevel = previewRealmLevel ?? realmInfo.current.level;
  const isPreviewing =
    previewRealmLevel !== null && previewRealmLevel !== realmInfo.current.level;

  const recordCompletion = (
    mins: number,
    mode: 'timer' | 'meditation' | 'stopwatch',
    title: string,
    technique: TechniqueKey
  ) => {
    const validMins = Math.max(1, Math.round(mins));
    const prevRealm = getRealmForMinutes(totalMinutes).current;
    const nextRealm = getRealmForMinutes(totalMinutes + validMins).current;

    const newRecord: SessionRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim() || '静心修行',
      minutes: validMins,
      mode,
      technique,
      completedAt: Date.now(),
    };
    setRecords((prev) => [newRecord, ...prev]);

    if (activeTaskId && mode !== 'meditation') {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeTaskId ? { ...t, completed: true } : t))
      );
      setActiveTaskId(null);
    }

    if (nextRealm.level > prevRealm.level) {
      setPreviewRealmLevel(null);
      setBreakthroughRealm(nextRealm.level);
      if (bellEnabled) {
        soundEngine.playBreakthroughSound(nextRealm.level);
      }
      setCompletionBanner(
        `境界突破！恭喜晋升「${nextRealm.name}」，时钟阵纹已演化为「${nextRealm.titleStyle}」。`
      );
    } else {
      if (bellEnabled) {
        soundEngine.playBronzeBell(1.0, 0.5);
      }
      setCompletionBanner(`本次「${newRecord.title}」圆满收功，修为进益 +${validMins} 分钟。`);
    }
  };

  // Timer / Meditation loop
  const anyActive = isRunning || isMeditating;
  useEffect(() => {
    if (!anyActive) {
      lastTickRef.current = null;
      return;
    }

    lastTickRef.current = Date.now();
    const interval = window.setInterval(() => {
      const currentTs = Date.now();
      const prevTs = lastTickRef.current ?? currentTs;
      const deltaSec = (currentTs - prevTs) / 1000;
      lastTickRef.current = currentTs;

      if (isRunning) {
        setElapsedSeconds((prev) => {
          const next = prev + deltaSec;
          if (timerMode === 'timer' && next >= durationMinutes * 60) {
            setIsRunning(false);
            recordCompletion(durationMinutes, 'timer', taskTitle, selectedTechnique);
            return 0;
          }
          return next;
        });
      }

      if (isMeditating) {
        setMeditationElapsed((prev) => {
          const next = prev + deltaSec;
          if (next >= meditationMinutes * 60) {
            setIsMeditating(false);
            const patternObj = BREATHING_PATTERNS.find((p) => p.key === breathPatternKey);
            recordCompletion(
              meditationMinutes,
              'meditation',
              patternObj ? patternObj.name : '吐纳冥想',
              selectedTechnique
            );
            return 0;
          }
          return next;
        });
      }
    }, 200);

    return () => window.clearInterval(interval);
  });

  const activeBreathPattern = useMemo(
    () => BREATHING_PATTERNS.find((p) => p.key === breathPatternKey) ?? BREATHING_PATTERNS[0],
    [breathPatternKey]
  );

  const breathState = useMemo(() => {
    const { inhale, holdIn, exhale, holdOut } = activeBreathPattern;
    const cycleTotal = inhale + holdIn + exhale + holdOut;
    const cycleCount = Math.floor(meditationElapsed / cycleTotal);
    const pos = meditationElapsed % cycleTotal;

    let phaseKey = 'inhale';
    let label = '吸气 · 纳灵';
    let scale = 1.0;
    let secondsLeft = inhale;

    if (pos < inhale) {
      phaseKey = 'inhale';
      label = '吸气 · 纳灵';
      scale = 0.85 + 0.25 * (pos / inhale);
      secondsLeft = Math.ceil(inhale - pos);
    } else if (pos < inhale + holdIn) {
      phaseKey = 'holdIn';
      label = '屏息 · 凝丹';
      scale = 1.1;
      secondsLeft = Math.ceil(inhale + holdIn - pos);
    } else if (pos < inhale + holdIn + exhale) {
      phaseKey = 'exhale';
      label = '呼气 · 归元';
      scale = 1.1 - 0.25 * ((pos - inhale - holdIn) / exhale);
      secondsLeft = Math.ceil(inhale + holdIn + exhale - pos);
    } else {
      phaseKey = 'holdOut';
      label = '虚静 · 停息';
      scale = 0.85;
      secondsLeft = Math.ceil(cycleTotal - pos);
    }

    return { phaseKey, label, scale, secondsLeft, cycleCount };
  }, [activeBreathPattern, meditationElapsed]);

  useEffect(() => {
    if (!isMeditating) {
      lastBreathPhaseRef.current = '';
      return;
    }
    if (lastBreathPhaseRef.current !== breathState.phaseKey) {
      if (bellEnabled && lastBreathPhaseRef.current !== '') {
        if (breathState.phaseKey === 'inhale') soundEngine.playBreathCue(true);
        if (breathState.phaseKey === 'exhale') soundEngine.playBreathCue(false);
      }
      lastBreathPhaseRef.current = breathState.phaseKey;
    }
  }, [breathState.phaseKey, isMeditating, bellEnabled]);

  useEffect(() => {
    if (isMeditating) {
      const rem = Math.max(0, Math.ceil(meditationMinutes * 60 - meditationElapsed));
      const m = String(Math.floor(rem / 60)).padStart(2, '0');
      const s = String(rem % 60).padStart(2, '0');
      document.title = `${m}:${s} 吐纳中 · 太虚玄盘`;
    } else if (isRunning) {
      const targetSec =
        timerMode === 'timer'
          ? Math.max(0, Math.ceil(durationMinutes * 60 - elapsedSeconds))
          : Math.floor(elapsedSeconds);
      const m = String(Math.floor(targetSec / 60)).padStart(2, '0');
      const s = String(targetSec % 60).padStart(2, '0');
      document.title = `${m}:${s} · 太虚玄盘`;
    } else {
      document.title = '太虚玄盘 — 修仙境界计时钟';
    }
  }, [isRunning, isMeditating, timerMode, durationMinutes, elapsedSeconds, meditationMinutes, meditationElapsed]);

  const isMeditationView = activeTab === 'meditation' || isMeditating;
  const dialMode: 'timer' | 'meditation' | 'stopwatch' = isMeditationView
    ? 'meditation'
    : timerMode;

  let dialDisplaySeconds = 0;
  let dialProgress = 0;

  if (dialMode === 'meditation') {
    const totalSec = meditationMinutes * 60;
    dialDisplaySeconds = Math.max(0, Math.ceil(totalSec - meditationElapsed));
    dialProgress = totalSec > 0 ? meditationElapsed / totalSec : 0;
  } else if (dialMode === 'timer') {
    const totalSec = durationMinutes * 60;
    dialDisplaySeconds = Math.max(0, Math.ceil(totalSec - elapsedSeconds));
    dialProgress = totalSec > 0 ? elapsedSeconds / totalSec : 0;
  } else {
    dialDisplaySeconds = Math.floor(elapsedSeconds);
    dialProgress = (elapsedSeconds % 60) / 60;
  }

  const { current: currentShichen, index: shichenIndex } = getCurrentShichen(now);
  const activeTechObj =
    CULTIVATION_TECHNIQUES.find((t) => t.key === selectedTechnique) ??
    CULTIVATION_TECHNIQUES[0];
  const displayRealmObj =
    CULTIVATION_REALMS.find((r) => r.level === displayRealmLevel) ?? CULTIVATION_REALMS[0];

  // Handlers
  const handleSelectTechnique = (tech: CultivationTechnique) => {
    setSelectedTechnique(tech.key);
    if (!isRunning && !isMeditating) {
      setDurationMinutes(tech.presetMinutes);
      setTaskTitle(tech.tag);
      setActiveTaskId(null);
      setElapsedSeconds(0);
    }
    setActiveTab('timer');
  };

  const handleToggleTimerRun = () => {
    setCompletionBanner(null);
    if (isMeditating) setIsMeditating(false);
    if (!isRunning && bellEnabled && elapsedSeconds === 0) {
      soundEngine.playBronzeBell(1.1, 0.35);
    }
    setIsRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setElapsedSeconds(0);
  };

  const handleQuickCompleteTimer = () => {
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    setIsRunning(false);
    setElapsedSeconds(0);
    recordCompletion(mins, timerMode, taskTitle, selectedTechnique);
  };

  const handleToggleMeditation = () => {
    setCompletionBanner(null);
    if (isRunning) setIsRunning(false);
    if (!isMeditating && bellEnabled && meditationElapsed === 0) {
      soundEngine.playBronzeBell(0.92, 0.35);
    }
    setIsMeditating((prev) => !prev);
  };

  const handleResetMeditation = () => {
    setIsMeditating(false);
    setMeditationElapsed(0);
  };

  const handlePrimaryHeaderAction = () => {
    if (activeTab === 'meditation') {
      handleToggleMeditation();
    } else {
      if (activeTab !== 'timer') setActiveTab('timer');
      handleToggleTimerRun();
    }
  };

  const handleAddTask = (newTask: Omit<CultivationTask, 'id' | 'completed' | 'createdAt'>) => {
    const task: CultivationTask = {
      ...newTask,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      completed: false,
      createdAt: Date.now(),
    };
    setTasks((prev) => [task, ...prev]);
  };

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const handleLoadTaskIntoTimer = (task: CultivationTask) => {
    setIsRunning(false);
    setIsMeditating(false);
    setElapsedSeconds(0);
    setTimerMode('timer');
    setSelectedTechnique(task.technique);
    setDurationMinutes(task.minutes);
    setTaskTitle(task.title);
    setActiveTaskId(task.id);
    setActiveTab('timer');
  };

  const handleTriggerBreakthrough = (level: number) => {
    setBreakthroughRealm(level);
    if (bellEnabled) {
      soundEngine.playBreakthroughSound(level);
    }
  };

  const handleImportBackup = (backup: AppBackupPayload) => {
    setTasks(backup.tasks);
    setRecords(backup.sessions);
    if (backup.settings) {
      setIsDark(backup.settings.isDark);
      setPalette(backup.settings.palette);
      setBellEnabled(backup.settings.bellEnabled);
    }
    setPreviewRealmLevel(null);
  };

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'timer', label: '计时钟' },
    { id: 'meditation', label: '吐纳冥想' },
    { id: 'planner', label: '功课规划' },
    { id: 'log', label: '境界修行' },
  ];

  const modernClockStr = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col overflow-x-hidden transition-colors duration-200">
      {/* Atmospheric Mountain Ink Backdrop (adapts seamlessly to Day Parchment & Night Obsidian) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/src/assets/images/xianxia_ink_mountains_1795662076657.jpg"
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isDark ? 'opacity-20' : 'opacity-[0.07] invert'
          }`}
        />
        <div
          className="absolute inset-0"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 50% 42%, rgba(11,15,18,0.4) 0%, rgba(11,15,18,0.88) 70%, #0B0F12 100%)'
              : 'radial-gradient(circle at 50% 42%, rgba(243,238,227,0.5) 0%, rgba(243,238,227,0.92) 72%, #F3EEE3 100%)',
          }}
        />
      </div>

      {/* Top Bar Contract: 3 zones (Wordmark — 4 Nav Links — 1 Primary Action) */}
      <header
        className="relative z-10 border-b border-[var(--border-hairline)] backdrop-blur-md transition-colors duration-200"
        style={{ backgroundColor: 'var(--bg-header)' }}
      >
        <div className="max-w-[1320px] mx-auto px-6 py-3.5 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('timer');
            }}
            className="text-xl font-semibold tracking-wider text-[var(--theme-accent)] whitespace-nowrap shrink-0"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            太虚玄盘
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm" aria-label="主导航">
            {navItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b ${
                    active
                      ? 'text-[var(--text-primary)] border-[var(--theme-accent)] font-medium'
                      : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handlePrimaryHeaderAction}
              className="px-4 py-2 text-xs font-medium rounded-md bg-[var(--theme-accent)] text-[var(--theme-accent-fg)] hover:bg-[var(--theme-accent-hover)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {activeTab === 'meditation'
                ? isMeditating
                  ? '暂停冥想'
                  : '开始冥想'
                : isRunning
                  ? '暂停计时'
                  : '开始计时'}
            </button>
          </div>
        </div>

        <nav
          className="md:hidden flex items-center justify-around border-t border-[var(--border-hairline)] px-4 py-2 text-xs"
          aria-label="移动端导航"
        >
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-2 py-1 whitespace-nowrap shrink-0 cursor-pointer ${
                  active ? 'text-[var(--theme-accent)] font-medium' : 'text-[var(--text-secondary)]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Workspace Appearance Toolbar: Day/Night Mode + 4 Xianxia Color Themes */}
      <div className="relative z-10 max-w-[1320px] w-full mx-auto px-4 sm:px-6 pt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="text-[var(--theme-accent)] font-medium" style={{ fontFamily: 'var(--font-serif)' }}>
            {currentShichen.name}
          </span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{modernClockStr}</span>
          <span aria-hidden="true">·</span>
          <span className="hidden sm:inline">{currentShichen.organNote}</span>
          <span className="hidden sm:inline" aria-hidden="true">·</span>
          <span
            className="tabular-nums"
            style={{
              color: isDark ? displayRealmObj.primaryColor : displayRealmObj.dayPrimaryColor,
            }}
          >
            实修：{realmInfo.current.name}（{totalMinutes}分）
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* 4 Color Palette Swatches */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)]"
            role="group"
            aria-label="主题色韵切换"
          >
            {THEME_PALETTES.map((p) => {
              const active = p.key === palette;
              const swatch = isDark ? p.swatchDark : p.swatchLight;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPalette(p.key)}
                  title={p.name}
                  aria-label={`切换${p.name}主题`}
                  aria-pressed={active}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'text-[var(--text-primary)] font-medium bg-[var(--bg-inset)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: swatch }}
                  />
                  <span className="hidden sm:inline">{p.name.slice(0, 2)}</span>
                </button>
              );
            })}
          </div>

          {/* Day / Night Toggle */}
          <button
            type="button"
            onClick={() => setIsDark((d) => !d)}
            aria-label={isDark ? '切换为白昼宣纸模式' : '切换为玄墨夜观模式'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--bg-surface)] border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--theme-accent)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                <span>白昼</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-[var(--theme-accent)]" />
                <span>夜观</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Routed by Functional Zone */}
      <main className="relative z-10 flex-1 max-w-[1320px] w-full mx-auto px-4 sm:px-6 py-5 lg:py-8">
        {/* ZONE 1: HOMEPAGE — PURE CENTERED REALM CLOCK */}
        {activeTab === 'timer' && (
          <section className="max-w-[760px] mx-auto flex flex-col items-center">
            <RealmClock
              realmLevel={displayRealmLevel}
              isPreviewing={isPreviewing}
              isDark={isDark}
              currentShichenIndex={shichenIndex}
              displaySeconds={dialDisplaySeconds}
              progress={dialProgress}
              isRunning={isRunning || isMeditating}
              mode={dialMode}
              activeTitle={taskTitle || '静心修行'}
              techniqueName={activeTechObj.name}
            />

            {/* Minimal, Spacious Clock Controls Beneath */}
            <div className="mt-5 w-full max-w-[600px] flex flex-col items-center gap-4">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleTimerRun}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md bg-[var(--theme-accent)] text-[var(--theme-accent-fg)] hover:bg-[var(--theme-accent-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isRunning ? '暂停计时' : '开始计时'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm rounded-md border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--theme-accent-soft)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重置</span>
                </button>

                {Math.floor(elapsedSeconds) >= 60 && (
                  <button
                    type="button"
                    onClick={handleQuickCompleteTimer}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm rounded-md border border-[var(--theme-secondary)] text-[var(--theme-secondary)] hover:bg-[var(--theme-accent-soft)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>提前收功</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setBellEnabled((b) => !b)}
                  aria-label={bellEnabled ? '关闭钟磬提示音' : '开启钟磬提示音'}
                  className="p-2.5 rounded-md border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer shrink-0"
                >
                  {bellEnabled ? (
                    <Volume2 className="w-4 h-4 text-[var(--theme-accent)]" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Compact Mode & Duration Presets Strip */}
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <div className="inline-flex items-center p-0.5 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-md">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRunning(false);
                      setElapsedSeconds(0);
                      setTimerMode('timer');
                    }}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                      timerMode === 'timer'
                        ? 'bg-[var(--theme-accent-soft)] text-[var(--text-primary)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    倒计时
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRunning(false);
                      setElapsedSeconds(0);
                      setTimerMode('stopwatch');
                    }}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                      timerMode === 'stopwatch'
                        ? 'bg-[var(--theme-accent-soft)] text-[var(--text-primary)] font-medium'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    正念顺计
                  </button>
                </div>

                {timerMode === 'timer' && (
                  <div className="inline-flex items-center gap-1">
                    {QUICK_PRESETS.map((p) => (
                      <button
                        key={p.minutes}
                        type="button"
                        disabled={isRunning}
                        onClick={() => {
                          setDurationMinutes(p.minutes);
                          setElapsedSeconds(0);
                        }}
                        className={`px-2.5 py-1 rounded-md border transition-colors cursor-pointer disabled:opacity-45 whitespace-nowrap ${
                          durationMinutes === p.minutes
                            ? 'bg-[var(--theme-accent-soft)] border-[var(--theme-accent)] text-[var(--text-primary)] font-medium'
                            : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                        }`}
                      >
                        {p.minutes}分
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Clean Realm Switcher + Breakthrough Trigger */}
              <div className="w-full flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-[var(--border-hairline)]">
                <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-hairline)] overflow-x-auto max-w-full">
                  {CULTIVATION_REALMS.map((r) => {
                    const active = r.level === displayRealmLevel;
                    const unlocked = r.level <= realmInfo.current.level;
                    const rColor = isDark ? r.primaryColor : r.dayPrimaryColor;
                    return (
                      <button
                        key={r.level}
                        type="button"
                        onClick={() =>
                          setPreviewRealmLevel(
                            r.level === realmInfo.current.level ? null : r.level
                          )
                        }
                        className={`px-2 py-1 text-[11px] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          active
                            ? 'font-semibold'
                            : unlocked
                              ? 'text-[var(--text-primary)] hover:bg-[var(--bg-inset)]'
                              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                        }`}
                        style={
                          active
                            ? {
                                backgroundColor: rColor,
                                color: isDark ? '#0B0F12' : '#FCF9F2',
                              }
                            : undefined
                        }
                      >
                        {r.name.replace('期', '').replace('境', '')}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerBreakthrough(displayRealmLevel)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-[var(--border-strong)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>演练突破</span>
                </button>
              </div>

              {isPreviewing && (
                <div className="flex items-center gap-3 text-xs text-[var(--theme-secondary)]">
                  <span>当前观想「{displayRealmObj.name} · {displayRealmObj.titleStyle}」</span>
                  <button
                    type="button"
                    onClick={() => setPreviewRealmLevel(null)}
                    className="underline underline-offset-4 hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    回到实修境界
                  </button>
                </div>
              )}

              {completionBanner && (
                <div
                  role="status"
                  className="w-full max-w-[520px] px-4 py-3 rounded-lg bg-[var(--bg-surface)] border border-[var(--theme-secondary)] flex items-center justify-between gap-4 text-xs text-[var(--text-primary)]"
                >
                  <span>{completionBanner}</span>
                  <button
                    type="button"
                    onClick={() => setCompletionBanner(null)}
                    className="text-[var(--theme-secondary)] hover:text-[var(--text-primary)] whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    知晓
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ZONE 2: DEDICATED MEDITATION SANCTUARY */}
        {activeTab === 'meditation' && (
          <section className="max-w-[1160px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 flex flex-col items-center">
              <RealmClock
                realmLevel={displayRealmLevel}
                isPreviewing={isPreviewing}
                isDark={isDark}
                currentShichenIndex={shichenIndex}
                displaySeconds={dialDisplaySeconds}
                progress={dialProgress}
                isRunning={isMeditating}
                mode="meditation"
                activeTitle={activeBreathPattern.name}
                techniqueName={activeTechObj.name}
                breathPhaseLabel={breathState.label}
                breathScale={isMeditating ? breathState.scale : 1}
                breathSecondsLeft={breathState.secondsLeft}
              />
            </div>

            <div className="lg:col-span-6 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-6">
              <MeditationPanel
                patternKey={breathPatternKey}
                onChangePattern={(key) => {
                  setBreathPatternKey(key);
                  setMeditationElapsed(0);
                }}
                isMeditating={isMeditating}
                onToggleMeditate={handleToggleMeditation}
                onResetMeditation={handleResetMeditation}
                breathPhaseLabel={breathState.label}
                breathCycleCount={breathState.cycleCount}
                soundscape={soundscape}
                onChangeSoundscape={setSoundscape}
                volume={volume}
                onChangeVolume={setVolume}
                meditationDurationMinutes={meditationMinutes}
                onChangeMeditationDuration={(mins) => {
                  setMeditationMinutes(mins);
                  setMeditationElapsed(0);
                }}
              />
            </div>
          </section>
        )}

        {/* ZONE 3: DEDICATED TIME & TASK PLANNER */}
        {activeTab === 'planner' && (
          <PlannerPanel
            tasks={tasks}
            selectedTechnique={selectedTechnique}
            onSelectTechnique={handleSelectTechnique}
            onAddTask={handleAddTask}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onLoadIntoTimer={handleLoadTaskIntoTimer}
            activeTaskId={activeTaskId}
          />
        )}

        {/* ZONE 4: DEDICATED REALM GALLERY & CULTIVATION LOG */}
        {activeTab === 'log' && (
          <CultivationLog
            tasks={tasks}
            records={records}
            totalMinutes={totalMinutes}
            completedTasksCount={completedTasksCount}
            isDark={isDark}
            palette={palette}
            bellEnabled={bellEnabled}
            onClearRecords={() => setRecords([])}
            onImportBackup={handleImportBackup}
            onSelectRealmPreview={(lvl) => {
              setPreviewRealmLevel(lvl === realmInfo.current.level ? null : lvl);
              setActiveTab('timer');
            }}
            onTriggerBreakthrough={handleTriggerBreakthrough}
          />
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="relative z-10 border-t border-[var(--border-hairline)] py-4 px-6">
        <div className="max-w-[1320px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <span>太虚玄盘 · 凡人九境修仙计时钟</span>
          <span>数据仅保存于本地浏览器</span>
        </div>
      </footer>

      <BreakthroughOverlay
        realmLevel={breakthroughRealm}
        onClose={() => setBreakthroughRealm(null)}
        onSwitchRealm={(lvl) => handleTriggerBreakthrough(lvl)}
      />
    </div>
  );
}
