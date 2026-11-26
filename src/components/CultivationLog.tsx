import React, { useRef, useState } from 'react';
import { Download, Upload, Trash2, Eye, Sparkles } from 'lucide-react';
import {
  CULTIVATION_REALMS,
  CULTIVATION_TECHNIQUES,
  CultivationTask,
  getRealmForMinutes,
  SessionRecord,
  ThemePaletteKey,
} from '../types/cultivation';

export interface AppBackupPayload {
  version: number;
  exportedAt: string;
  realm: string;
  totalMinutes: number;
  tasks: CultivationTask[];
  sessions: SessionRecord[];
  settings?: {
    isDark: boolean;
    palette: ThemePaletteKey;
    bellEnabled: boolean;
  };
}

interface CultivationLogProps {
  tasks: CultivationTask[];
  records: SessionRecord[];
  totalMinutes: number;
  completedTasksCount: number;
  isDark: boolean;
  palette: ThemePaletteKey;
  bellEnabled: boolean;
  onClearRecords: () => void;
  onImportBackup: (data: AppBackupPayload) => void;
  onSelectRealmPreview: (level: number) => void;
  onTriggerBreakthrough: (level: number) => void;
}

export const CultivationLog: React.FC<CultivationLogProps> = ({
  tasks,
  records,
  totalMinutes,
  completedTasksCount,
  isDark,
  palette,
  bellEnabled,
  onClearRecords,
  onImportBackup,
  onSelectRealmPreview,
  onTriggerBreakthrough,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [transferNotice, setTransferNotice] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const realmInfo = getRealmForMinutes(totalMinutes);

  const handleExport = () => {
    const payload: AppBackupPayload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      realm: realmInfo.current.name,
      totalMinutes,
      tasks,
      sessions: records,
      settings: {
        isDark,
        palette,
        bellEnabled,
      },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taixu-xuanpan-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTransferNotice('已导出全部软件数据（功课、修行记录、境界与主题配置），请在浏览器下载目录查看。');
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppBackupPayload>;
      if (!Array.isArray(parsed.sessions) || !Array.isArray(parsed.tasks)) {
        setTransferNotice('导入失败：文件格式不符，请选择太虚玄盘导出的 JSON 数据文件。');
        return;
      }
      onImportBackup({
        version: parsed.version ?? 2,
        exportedAt: parsed.exportedAt ?? new Date().toISOString(),
        realm: parsed.realm ?? '炼气期',
        totalMinutes: parsed.totalMinutes ?? 0,
        tasks: parsed.tasks,
        sessions: parsed.sessions,
        settings: parsed.settings,
      });
      setTransferNotice(`已成功载入测试数据（${parsed.tasks.length} 项功课，${parsed.sessions.length} 条记录）。`);
    } catch {
      setTransferNotice('导入失败：无法解析该 JSON 文件。');
    }
  };

  return (
    <div className="max-w-[1060px] mx-auto flex flex-col gap-8">
      {/* Top Realm Summary & Breakthrough Progress */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs text-[var(--theme-accent)]">当前实修境界 · 凡人九境</span>
            <h1
              className="mt-1.5 text-3xl font-semibold text-[var(--text-primary)]"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {realmInfo.current.name} · {realmInfo.current.stage}
            </h1>
            <p className="mt-2 text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              {realmInfo.current.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 shrink-0 pt-2 sm:pt-0">
            <div>
              <div className="text-xs text-[var(--text-muted)]">累计静修</div>
              <div className="mt-1 text-xl font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                {totalMinutes} <span className="text-xs font-normal text-[var(--text-secondary)]">分</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">闭关次数</div>
              <div className="mt-1 text-xl font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                {records.length} <span className="text-xs font-normal text-[var(--text-secondary)]">次</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-[var(--text-muted)]">已成功课</div>
              <div className="mt-1 text-xl font-mono font-semibold tabular-nums text-[var(--text-primary)]">
                {completedTasksCount} <span className="text-xs font-normal text-[var(--text-secondary)]">项</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakthrough Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-[var(--text-secondary)] tabular-nums mb-2">
            <span>
              {realmInfo.next
                ? `距离突破「${realmInfo.next.name}」`
                : '已证真仙大道'}
            </span>
            <span className="font-mono text-[var(--theme-accent)]">
              {realmInfo.next
                ? `${totalMinutes} / ${realmInfo.next.minMinutes} 分钟 (${realmInfo.progressPercent}%)`
                : `${totalMinutes} 分钟`}
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-[var(--bg-inset)] border border-[var(--border-hairline)] overflow-hidden">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${realmInfo.progressPercent}%`,
                background: `linear-gradient(90deg, ${
                  isDark ? realmInfo.current.primaryColor : realmInfo.current.dayPrimaryColor
                }, ${
                  realmInfo.next
                    ? isDark
                      ? realmInfo.next.primaryColor
                      : realmInfo.next.dayPrimaryColor
                    : isDark
                      ? realmInfo.current.secondaryColor
                      : realmInfo.current.daySecondaryColor
                })`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 9-Realm Evolution Gallery */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
            凡人九境阵盘图鉴
          </h2>
          <span className="text-xs text-[var(--text-muted)]">可观想任意境界时钟样式或演练突破异象</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CULTIVATION_REALMS.map((r) => {
            const reached = totalMinutes >= r.minMinutes;
            const cPrimary = isDark ? r.primaryColor : r.dayPrimaryColor;
            const cSecondary = isDark ? r.secondaryColor : r.daySecondaryColor;
            return (
              <div
                key={r.level}
                className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-5 flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cPrimary, opacity: reached ? 1 : 0.45 }}
                      />
                      <h3
                        className="text-base font-semibold text-[var(--text-primary)]"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {r.name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-[var(--text-muted)]">
                      {r.minMinutes} 分钟
                    </span>
                  </div>
                  <div className="mt-1 text-xs" style={{ color: cSecondary }}>
                    {r.titleStyle} · {r.stage}
                  </div>
                  <p className="mt-2 text-xs text-[var(--text-secondary)] leading-relaxed">
                    {r.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[var(--border-hairline)]">
                  <button
                    type="button"
                    onClick={() => onSelectRealmPreview(r.level)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--theme-accent-soft)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>观想时钟</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTriggerBreakthrough(r.level)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--border-strong)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>突破动画</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Session History & Data Transfer */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-hairline)] rounded-xl p-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
          <h2 className="text-base font-semibold text-[var(--text-primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
            近期闭关玉简 · 数据备份
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImportFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>导入数据</span>
            </button>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-[var(--border-strong)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent-soft)] cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出全部数据</span>
            </button>

            {records.length > 0 && !confirmClear && (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border border-[#C84B31]/35 text-[#C84B31] hover:bg-[#C84B31]/10 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空</span>
              </button>
            )}

            {confirmClear && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearRecords();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 text-xs rounded bg-[#C84B31] text-white cursor-pointer"
                >
                  确认清空
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 text-xs rounded border border-[var(--border-hairline)] text-[var(--text-secondary)] cursor-pointer"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

        {transferNotice && (
          <div className="px-3.5 py-2.5 rounded-md bg-[var(--bg-inset)] border border-[var(--border-hairline)] flex items-center justify-between gap-3 text-xs text-[var(--text-primary)]">
            <span>{transferNotice}</span>
            <button
              type="button"
              onClick={() => setTransferNotice(null)}
              className="text-[var(--theme-accent)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              关闭
            </button>
          </div>
        )}

        <div className="flex flex-col divide-y divide-[var(--border-hairline)]">
          {records.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-[var(--text-secondary)]">尚无闭关修行记录</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">完成一次闭关计时或吐纳冥想后，将自动铭刻于此。</p>
            </div>
          ) : (
            records.map((rec) => {
              const techObj =
                CULTIVATION_TECHNIQUES.find((t) => t.key === rec.technique) ??
                CULTIVATION_TECHNIQUES[0];
              const dateStr = new Date(rec.completedAt).toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              });
              const modeLabel =
                rec.mode === 'meditation' ? '吐纳冥想' : rec.mode === 'stopwatch' ? '正念顺计' : '闭关倒计';

              return (
                <div key={rec.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                  <div className="min-w-0">
                    <div className="text-sm text-[var(--text-primary)] truncate">{rec.title}</div>
                    <div className="mt-0.5 text-[var(--text-secondary)] flex items-center gap-2">
                      <span>{techObj.name}</span>
                      <span aria-hidden="true">·</span>
                      <span>{modeLabel}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{dateStr}</span>
                    </div>
                  </div>
                  <div className="font-mono tabular-nums text-sm text-[var(--theme-accent)] whitespace-nowrap shrink-0">
                    +{rec.minutes} 分
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
