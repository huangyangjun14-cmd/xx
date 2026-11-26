import React, { useState } from 'react';
import { Wind, Play, Pause, RotateCcw, RefreshCw, Volume2 } from 'lucide-react';
import {
  BREATHING_PATTERNS,
  BreathingPatternKey,
  MEDITATION_VERSES,
  SOUNDSCAPES,
  SoundscapeType,
} from '../types/cultivation';

interface MeditationPanelProps {
  patternKey: BreathingPatternKey;
  onChangePattern: (key: BreathingPatternKey) => void;
  isMeditating: boolean;
  onToggleMeditate: () => void;
  onResetMeditation: () => void;
  breathPhaseLabel: string;
  breathCycleCount: number;
  soundscape: SoundscapeType;
  onChangeSoundscape: (s: SoundscapeType) => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
  meditationDurationMinutes: number;
  onChangeMeditationDuration: (mins: number) => void;
}

export const MeditationPanel: React.FC<MeditationPanelProps> = ({
  patternKey,
  onChangePattern,
  isMeditating,
  onToggleMeditate,
  onResetMeditation,
  breathPhaseLabel,
  breathCycleCount,
  soundscape,
  onChangeSoundscape,
  volume,
  onChangeVolume,
  meditationDurationMinutes,
  onChangeMeditationDuration,
}) => {
  const [verseIdx, setVerseIdx] = useState(0);
  const [imgError, setImgError] = useState(false);

  const activePattern = BREATHING_PATTERNS.find((p) => p.key === patternKey) ?? BREATHING_PATTERNS[0];

  const handleNextVerse = () => {
    setVerseIdx((prev) => (prev + 1) % MEDITATION_VERSES.length);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Incense & Stillness Atmospheric Banner (measured dark scrim guarantees legibility in both Day & Night) */}
      <div className="relative h-36 rounded-lg overflow-hidden border border-[var(--border-hairline)] bg-[#0B0F12]">
        {!imgError ? (
          <img
            src="/src/assets/images/jade_incense_meditation_1795662075193.jpg"
            alt="古铜香炉与青玉静坐冥想案几"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center opacity-80"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#141B20] to-[#0B0F12]">
            <Wind className="w-8 h-8 text-[#4E9F8D]/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F12]/92 via-[#0B0F12]/55 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-[#8CD3C3]">静心箴言</p>
            <p className="mt-0.5 text-sm text-[#EDE6D6] leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
              {MEDITATION_VERSES[verseIdx]}
            </p>
          </div>
          <button
            type="button"
            onClick={handleNextVerse}
            aria-label="更换静心箴言"
            className="p-2 rounded-md border border-[#C9A96A]/30 bg-[#0B0F12]/75 text-[#E5CA8B] hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Breathing Rhythm Selection */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>吐纳呼吸节奏</span>
          <span className="font-mono tabular-nums text-[var(--theme-secondary)]">
            {isMeditating ? `${breathPhaseLabel} · 已调息 ${breathCycleCount} 周天` : '待开启调息'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {BREATHING_PATTERNS.map((pattern) => {
            const active = pattern.key === patternKey;
            return (
              <button
                key={pattern.key}
                type="button"
                onClick={() => onChangePattern(pattern.key)}
                className={`p-3 text-left rounded-md border transition-colors cursor-pointer ${
                  active
                    ? 'bg-[var(--theme-accent-soft)] border-[var(--theme-accent)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-inset)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="text-xs font-semibold text-[var(--text-primary)] whitespace-nowrap">{pattern.name}</div>
                <div className="mt-1 text-[11px] font-mono tabular-nums text-[var(--theme-accent)]">{pattern.subtitle}</div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--text-secondary)]">{activePattern.description}</p>
      </div>

      {/* Meditation Session Duration */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span>静坐时长</span>
          <span className="font-mono tabular-nums text-[var(--text-primary)]">{meditationDurationMinutes} 分钟</span>
        </div>
        <input
          type="range"
          min={5}
          max={60}
          step={5}
          disabled={isMeditating}
          value={meditationDurationMinutes}
          onChange={(e) => onChangeMeditationDuration(Number(e.target.value))}
          aria-label="静坐时长（分钟）"
          className="w-full accent-[var(--theme-accent)] cursor-pointer disabled:opacity-50"
        />
      </div>

      {/* Ambient Soundscape */}
      <div className="flex flex-col gap-3 pt-4 border-t border-[var(--border-hairline)]">
        <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
            <Volume2 className="w-4 h-4 text-[var(--theme-accent)]" />
            环境灵音
          </span>
          <span className="font-mono tabular-nums">音量：{Math.round(volume * 100)}%</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {SOUNDSCAPES.map((item) => {
            const active = soundscape === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeSoundscape(item.id)}
                className={`px-3 py-2 text-xs rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[var(--theme-accent-soft)] border-[var(--theme-accent)] text-[var(--text-primary)] font-medium'
                    : 'bg-[var(--bg-inset)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </div>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => onChangeVolume(Number(e.target.value))}
          aria-label="环境音音量"
          className="w-full accent-[var(--theme-accent)] cursor-pointer"
        />
      </div>

      {/* Primary Meditation Actions */}
      <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleMeditate}
          className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-md bg-[var(--theme-accent)] text-[var(--theme-accent-fg)] hover:bg-[var(--theme-accent-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          {isMeditating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isMeditating ? '暂停冥想' : '开始吐纳冥想'}</span>
        </button>

        <button
          type="button"
          onClick={onResetMeditation}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-md border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--theme-accent-soft)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置</span>
        </button>
      </div>
    </div>
  );
};
