import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, Play, Search } from 'lucide-react';
import {
  CULTIVATION_TECHNIQUES,
  CultivationTask,
  CultivationTechnique,
  TechniqueKey,
} from '../types/cultivation';

interface PlannerPanelProps {
  tasks: CultivationTask[];
  selectedTechnique: TechniqueKey;
  onSelectTechnique: (tech: CultivationTechnique) => void;
  onAddTask: (task: Omit<CultivationTask, 'id' | 'completed' | 'createdAt'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onLoadIntoTimer: (task: CultivationTask) => void;
  activeTaskId: string | null;
}

export const PlannerPanel: React.FC<PlannerPanelProps> = ({
  tasks,
  selectedTechnique,
  onSelectTechnique,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onLoadIntoTimer,
  activeTaskId,
}) => {
  const [title, setTitle] = useState('');
  const [minutes, setMinutes] = useState(25);
  const [technique, setTechnique] = useState<TechniqueKey>(selectedTechnique);
  const [scheduledTime, setScheduledTime] = useState('20:00');
  const [priority, setPriority] = useState<'high' | 'normal' | 'low'>('normal');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask({
      title: trimmed,
      minutes: Math.max(5, Math.min(180, minutes)),
      technique,
      scheduledTime,
      priority,
    });
    setTitle('');
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending' && t.completed) return false;
    if (filter === 'completed' && !t.completed) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
      return false;
    }
    return true;
  });

  const pendingMinutes = tasks.filter((t) => !t.completed).reduce((sum, t) => sum + t.minutes, 0);
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="max-w-[960px] mx-auto flex flex-col gap-8">
      {/* Page Title & Quick Technique Templates */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-hairline)]">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            功课规划
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] tabular-nums">
            待修 {tasks.length - completedCount} 项 · 预计 {pendingMinutes} 分钟 · 已成 {completedCount} 项
          </p>
        </div>

        {/* Quick Technique Templates to jump directly into Clock */}
        <div className="flex flex-wrap items-center gap-2">
          {CULTIVATION_TECHNIQUES.map((tech) => {
            const active = tech.key === selectedTechnique;
            return (
              <button
                key={tech.key}
                type="button"
                onClick={() => {
                  setTechnique(tech.key);
                  setMinutes(tech.presetMinutes);
                  onSelectTechnique(tech);
                }}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[var(--theme-accent-soft)] border-[var(--theme-accent)] text-[var(--text-primary)] font-medium'
                    : 'bg-[var(--bg-surface)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tech.name} · {tech.presetMinutes}分
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Zone Planner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Add New Task Card */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-6 flex flex-col gap-4"
        >
          <h2 className="text-base font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
            拟定新功课
          </h2>

          <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
            <span>功课名称</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：研读专业典籍、算法推演..."
              maxLength={50}
              className="w-full px-3.5 py-2.5 text-sm bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--theme-accent)]"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
            <span>对应修行功法</span>
            <select
              value={technique}
              onChange={(e) => setTechnique(e.target.value as TechniqueKey)}
              className="px-3 py-2 text-sm bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--theme-accent)]"
            >
              {CULTIVATION_TECHNIQUES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.name}（{t.tag}）
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>预计时长（分）</span>
              <input
                type="number"
                min={5}
                max={180}
                step={5}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value) || 25)}
                className="px-3 py-2 text-sm font-mono tabular-nums bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
              <span>计划时段</span>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="px-3 py-2 text-sm font-mono tabular-nums bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs text-[var(--text-secondary)]">
            <span>缓急权重</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'high' | 'normal' | 'low')}
              className="px-3 py-2 text-sm bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-md text-[var(--text-primary)] focus:outline-none focus:border-[var(--theme-accent)]"
            >
              <option value="high">要务（优先破关）</option>
              <option value="normal">常修（日常功课）</option>
              <option value="low">闲课（随心安排）</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={!title.trim()}
            className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-md bg-[var(--theme-accent)] text-[var(--theme-accent-fg)] hover:bg-[var(--theme-accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>列入功课表</span>
          </button>
        </form>

        {/* Right: Task List Container */}
        <div className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-6 flex flex-col gap-5">
          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
            <div className="inline-flex items-center p-1 bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-lg">
              {[
                { id: 'all', label: '全部' },
                { id: 'pending', label: '待修' },
                { id: 'completed', label: '已成' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id as 'all' | 'pending' | 'completed')}
                  className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    filter === tab.id
                      ? 'bg-[var(--theme-accent-soft)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative flex-1 min-w-[180px] max-w-[260px]">
              <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="检索功课..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-[var(--bg-inset)] border border-[var(--border-hairline)] rounded-md text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--theme-accent)]"
              />
            </div>
          </div>

          {/* Spacious Task Rows */}
          <div className="flex flex-col divide-y divide-[var(--border-hairline)]">
            {filteredTasks.length === 0 ? (
              <div className="py-14 text-center">
                <p className="text-sm text-[var(--text-secondary)]">暂无符合条件的功课安排</p>
                <p className="mt-1.5 text-xs text-[var(--text-muted)]">在左侧拟定功课与时长，即可列入院落日程。</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const techObj =
                  CULTIVATION_TECHNIQUES.find((t) => t.key === task.technique) ??
                  CULTIVATION_TECHNIQUES[0];
                const isLoaded = activeTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    className={`py-4 flex items-center justify-between gap-4 transition-colors ${
                      isLoaded ? 'bg-[var(--theme-accent-soft)] -mx-3 px-3 rounded-lg' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => onToggleTask(task.id)}
                        aria-label={task.completed ? '标记为未完成' : '标记为已完成'}
                        className="mt-0.5 text-[var(--text-secondary)] hover:text-[var(--theme-secondary)] transition-colors cursor-pointer shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-[var(--theme-secondary)]" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`text-base truncate ${
                            task.completed ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--text-secondary)] tabular-nums">
                          <span>{techObj.name}</span>
                          <span aria-hidden="true">·</span>
                          <span>{task.minutes} 分钟</span>
                          <span aria-hidden="true">·</span>
                          <span>{task.scheduledTime}</span>
                          {task.priority === 'high' && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-[#C84B31] dark:text-[#EA8F6F]">要务</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!task.completed && (
                        <button
                          type="button"
                          onClick={() => onLoadIntoTimer(task)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                            isLoaded
                              ? 'bg-[var(--theme-accent-soft)] border-[var(--theme-accent)] text-[var(--text-primary)]'
                              : 'border-[var(--border-strong)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)]'
                          }`}
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{isLoaded ? '已在计时' : '载入计时钟'}</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        aria-label="删除功课"
                        className="p-2 rounded-md text-[var(--text-muted)] hover:text-[#C84B31] transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
