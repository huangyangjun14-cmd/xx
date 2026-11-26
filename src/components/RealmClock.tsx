import React from 'react';
import { CULTIVATION_REALMS, SHICHEN_LIST } from '../types/cultivation';

interface RealmClockProps {
  /** Active display realm level (1..9), either real or previewed */
  realmLevel: number;
  isPreviewing: boolean;
  isDark: boolean;
  currentShichenIndex: number;
  displaySeconds: number;
  progress: number;
  isRunning: boolean;
  mode: 'timer' | 'meditation' | 'stopwatch';
  activeTitle: string;
  techniqueName: string;
  breathPhaseLabel?: string;
  breathScale?: number;
  breathSecondsLeft?: number;
}

function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const RealmClock: React.FC<RealmClockProps> = ({
  realmLevel,
  isPreviewing,
  isDark,
  currentShichenIndex,
  displaySeconds,
  progress,
  isRunning,
  mode,
  activeTitle,
  techniqueName,
  breathPhaseLabel,
  breathScale = 1,
  breathSecondsLeft,
}) => {
  const realm = CULTIVATION_REALMS.find((r) => r.level === realmLevel) ?? CULTIVATION_REALMS[0];
  const rawPrimary = isDark ? realm.primaryColor : realm.dayPrimaryColor;
  const secondary = isDark ? realm.secondaryColor : realm.daySecondaryColor;
  const primary =
    mode === 'meditation' && realmLevel <= 2
      ? isDark
        ? '#4E9F8D'
        : '#1E7563'
      : rawPrimary;

  const progressRadius = 132;
  const circumference = 2 * Math.PI * progressRadius;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - clampedProgress);

  const markerAngleRad = ((-90 + clampedProgress * 360) * Math.PI) / 180;
  const markerX = 320 + progressRadius * Math.cos(markerAngleRad);
  const markerY = 320 + progressRadius * Math.sin(markerAngleRad);

  const dialSurfaceCore = isDark ? '#141B21' : '#FCF9F2';
  const dialSurfaceMid = isDark ? '#0E1318' : '#EFE8D8';
  const dialSurfaceOuter = isDark ? '#090D10' : '#E3DAC6';
  const innerCircleFill = isDark ? '#0B1014' : '#FCF9F2';
  const textMain = isDark ? '#EDE6D6' : '#1C221F';
  const textMuted = isDark ? '#9BA39E' : '#4B5550';
  const shichenMuted = isDark ? '#7D8782' : '#6C7570';

  return (
    <div className="relative flex items-center justify-center w-full max-w-[540px] mx-auto aspect-square select-none">
      {/* Escalating Realm Aura Backdrop */}
      <div
        className={`absolute inset-6 rounded-full pointer-events-none transition-all duration-700 ${
          realmLevel >= 5 ? 'animate-aura-pulse' : ''
        }`}
        style={{
          background:
            realmLevel >= 8
              ? `radial-gradient(circle, ${primary}30 0%, ${secondary}18 44%, transparent 74%)`
              : realmLevel >= 4
                ? `radial-gradient(circle, ${primary}24 0%, ${secondary}10 45%, transparent 72%)`
                : `radial-gradient(circle, ${primary}18 0%, transparent 68%)`,
          opacity: isRunning ? 1 : 0.72,
        }}
      />

      <svg
        viewBox="0 0 640 640"
        className="w-full h-full overflow-visible"
        role="img"
        aria-label={`太虚玄盘 · ${realm.name}计时钟`}
      >
        <defs>
          <radialGradient id="realmDialSurface" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={dialSurfaceCore} />
            <stop offset="68%" stopColor={dialSurfaceMid} />
            <stop offset="100%" stopColor={dialSurfaceOuter} />
          </radialGradient>

          <linearGradient id="realmStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primary} stopOpacity="0.95" />
            <stop offset="50%" stopColor={secondary} stopOpacity="0.85" />
            <stop offset="100%" stopColor={primary} stopOpacity="0.95" />
          </linearGradient>

          <filter id="realmGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={realmLevel >= 7 ? '4.5' : '2.5'} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* LEVEL 9: 真仙境 Outer Immortal Crown Halo */}
        {realmLevel >= 9 && (
          <g
            className="animate-spin-cw-slow pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
            filter="url(#realmGlow)"
          >
            <circle
              cx="320"
              cy="320"
              r="306"
              fill="none"
              stroke="url(#realmStrokeGrad)"
              strokeWidth="1.2"
              strokeDasharray="18 10 4 10"
              opacity="0.7"
            />
            {Array.from({ length: 24 }).map((_, i) => {
              const deg = i * 15;
              const rad = (deg * Math.PI) / 180;
              const x1 = 320 + 298 * Math.cos(rad);
              const y1 = 320 + 298 * Math.sin(rad);
              const x2 = 320 + 314 * Math.cos(rad);
              const y2 = 320 + 314 * Math.sin(rad);
              return (
                <line
                  key={`l9-ray-${i}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={i % 2 === 0 ? primary : secondary}
                  strokeWidth={i % 2 === 0 ? '2' : '1'}
                  opacity="0.75"
                />
              );
            })}
          </g>
        )}

        {/* LEVEL 8+: 大乘期 Purple-Gold Tribulation Lightning Arcs */}
        {realmLevel >= 8 && (
          <g
            className="animate-spin-ccw-slow pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
            filter="url(#realmGlow)"
          >
            <circle
              cx="320"
              cy="320"
              r="292"
              fill="none"
              stroke={primary}
              strokeWidth="1.2"
              strokeDasharray="6 14"
              opacity="0.65"
            />
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = i * 45;
              return (
                <g key={`l8-bolt-${i}`} transform={`rotate(${angle} 320 320)`}>
                  <polyline
                    points="320,24 314,38 324,42 317,56"
                    fill="none"
                    stroke={i % 2 === 0 ? primary : secondary}
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.88"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* Base Disc & Rim (scales visual brilliance with realmLevel) */}
        <circle
          cx="320"
          cy="320"
          r="282"
          fill="url(#realmDialSurface)"
          stroke={realmLevel >= 3 ? 'url(#realmStrokeGrad)' : primary}
          strokeWidth={realmLevel >= 6 ? '2' : '1.4'}
          strokeOpacity={realmLevel >= 4 ? '0.8' : '0.45'}
        />

        {/* LEVEL 6+: 炼虚期 Dual-Axis Interlocking Void Space Ellipses */}
        {realmLevel >= 6 && (
          <g className="pointer-events-none" opacity={realmLevel >= 8 ? '0.68' : '0.52'}>
            <g
              className="animate-spin-cw-slow"
              style={{ transformOrigin: '320px 320px' }}
            >
              <ellipse
                cx="320"
                cy="320"
                rx="236"
                ry="118"
                transform="rotate(32 320 320)"
                fill="none"
                stroke={primary}
                strokeWidth="1.2"
                strokeDasharray="8 6"
              />
            </g>
            <g
              className="animate-spin-ccw-slow"
              style={{ transformOrigin: '320px 320px' }}
            >
              <ellipse
                cx="320"
                cy="320"
                rx="236"
                ry="118"
                transform="rotate(-32 320 320)"
                fill="none"
                stroke={secondary}
                strokeWidth="1.2"
                strokeDasharray="8 6"
              />
            </g>
          </g>
        )}

        {/* 60-division Jiazi Compass Ticks (Always present, sharpens with realm) */}
        <g aria-hidden="true">
          {Array.from({ length: 60 }).map((_, i) => {
            const deg = i * 6;
            const isMajor = i % 5 === 0;
            const rOuter = 276;
            const rInner = isMajor ? 264 : 270;
            const rad = ((deg - 90) * Math.PI) / 180;
            return (
              <line
                key={`tick-${i}`}
                x1={320 + rInner * Math.cos(rad)}
                y1={320 + rInner * Math.sin(rad)}
                x2={320 + rOuter * Math.cos(rad)}
                y2={320 + rOuter * Math.sin(rad)}
                stroke={primary}
                strokeOpacity={isMajor ? 0.65 : 0.22}
                strokeWidth={isMajor ? 1.5 : 1}
              />
            );
          })}
        </g>

        {/* Twelve Shichen (十二时辰) Ring */}
        <circle
          cx="320"
          cy="320"
          r="228"
          fill="none"
          stroke={primary}
          strokeOpacity="0.22"
          strokeWidth="1"
        />
        <g aria-label="十二时辰刻度">
          {SHICHEN_LIST.map((shichen, idx) => {
            const angleDeg = idx * 30;
            const rad = ((angleDeg - 90) * Math.PI) / 180;
            const textR = 247;
            const tx = 320 + textR * Math.cos(rad);
            const ty = 320 + textR * Math.sin(rad);
            const isCurrent = idx === currentShichenIndex;

            const divRad = ((angleDeg - 105) * Math.PI) / 180;
            const dx1 = 320 + 228 * Math.cos(divRad);
            const dy1 = 320 + 228 * Math.sin(divRad);
            const dx2 = 320 + 266 * Math.cos(divRad);
            const dy2 = 320 + 266 * Math.sin(divRad);

            return (
              <g key={shichen.branch}>
                <line
                  x1={dx1}
                  y1={dy1}
                  x2={dx2}
                  y2={dy2}
                  stroke={primary}
                  strokeOpacity="0.14"
                  strokeWidth="1"
                />
                {isCurrent && (
                  <circle
                    cx={tx}
                    cy={ty}
                    r="15"
                    fill={primary}
                    fillOpacity="0.16"
                    stroke={primary}
                    strokeOpacity="0.78"
                    strokeWidth="1.2"
                  />
                )}
                <text
                  x={tx}
                  y={ty}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isCurrent ? textMain : shichenMuted}
                  fontSize={isCurrent ? '14' : '12'}
                  fontWeight={isCurrent ? '600' : '400'}
                  style={{ fontFamily: 'var(--font-serif)' }}
                >
                  {shichen.branch}
                </text>
              </g>
            );
          })}
        </g>

        {/* LEVEL 2+: 筑基期 Double Jade / Spirit Ring */}
        {realmLevel >= 2 && (
          <g
            className="animate-spin-cw-slow pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
          >
            <circle
              cx="320"
              cy="320"
              r="218"
              fill="none"
              stroke={primary}
              strokeWidth="1.4"
              strokeDasharray="24 8 4 8"
              strokeOpacity="0.55"
            />
            {Array.from({ length: 12 }).map((_, i) => {
              const rad = ((i * 30) * Math.PI) / 180;
              return (
                <circle
                  key={`l2-dot-${i}`}
                  cx={320 + 218 * Math.cos(rad)}
                  cy={320 + 218 * Math.sin(rad)}
                  r={realmLevel >= 8 ? '4' : '2.2'}
                  fill={i % 2 === 0 ? primary : secondary}
                  opacity={realmLevel >= 8 ? '0.9' : '0.65'}
                  filter={realmLevel >= 8 && isDark ? 'url(#realmGlow)' : undefined}
                />
              );
            })}
          </g>
        )}

        {/* LEVEL 7+: 合体期 Twelve Golden Seal Spear Motifs */}
        {realmLevel >= 7 && (
          <g
            className="animate-spin-ccw-fast pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
            filter={isDark ? 'url(#realmGlow)' : undefined}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={`l7-seal-${i}`} transform={`rotate(${i * 30} 320 320)`}>
                <polygon
                  points="320,104 315,116 320,122 325,116"
                  fill="none"
                  stroke={i % 2 === 0 ? primary : secondary}
                  strokeWidth="1.3"
                  opacity="0.82"
                />
              </g>
            ))}
          </g>
        )}

        {/* LEVEL 9: 真仙境 玄天星穹大阵 · 八角双星轨 + 九大仙窍 + 精密仙芒刻度 */}
        {realmLevel >= 9 && (
          <g
            className="animate-spin-cw-med pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
            filter={isDark ? 'url(#realmGlow)' : undefined}
          >
            {/* Interlocking Octagram Star-Array */}
            {[0, 45].map((rot, idx) => (
              <polygon
                key={`l9-octa-${rot}`}
                points={Array.from({ length: 4 })
                  .map((_, i) => {
                    const rad = ((i * 90 + rot - 90) * Math.PI) / 180;
                    return `${320 + 206 * Math.cos(rad)},${320 + 206 * Math.sin(rad)}`;
                  })
                  .join(' ')}
                fill="none"
                stroke={idx === 0 ? primary : secondary}
                strokeWidth="1.25"
                strokeOpacity="0.72"
              />
            ))}

            {/* 24 Precision Immortal Sword-Needle Verniers */}
            {Array.from({ length: 24 }).map((_, i) => {
              const isMajor = i % 3 === 0;
              return (
                <g key={`l9-ray-${i}`} transform={`rotate(${i * 15} 320 320)`}>
                  <line
                    x1="320"
                    y1={isMajor ? '106' : '124'}
                    x2="320"
                    y2="146"
                    stroke={i % 2 === 0 ? primary : secondary}
                    strokeWidth={isMajor ? '1.8' : '1'}
                    strokeLinecap="round"
                    opacity={isMajor ? '0.88' : '0.45'}
                  />
                  {isMajor && (
                    <polygon
                      points="320,98 317,108 320,113 323,108"
                      fill={i % 2 === 0 ? primary : secondary}
                      opacity="0.9"
                    />
                  )}
                </g>
              );
            })}

            {/* 9 Luminous Immortal Aperture Nodes (九大仙窍) */}
            {Array.from({ length: 9 }).map((_, i) => {
              const rad = ((i * 40 - 90) * Math.PI) / 180;
              const cx = 320 + 174 * Math.cos(rad);
              const cy = 320 + 174 * Math.sin(rad);
              return (
                <g key={`l9-aperture-${i}`}>
                  <circle cx={cx} cy={cy} r="4.8" fill={innerCircleFill} stroke={secondary} strokeWidth="1.3" />
                  <circle cx={cx} cy={cy} r="2" fill={primary} />
                </g>
              );
            })}
          </g>
        )}

        {/* LEVEL 5+: 化神期 Four Celestial Cardinal Constellation & 12-gon Leylines */}
        {realmLevel >= 5 && (
          <g
            className="animate-spin-ccw-slow pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
          >
            <polygon
              points={Array.from({ length: 12 })
                .map((_, i) => {
                  const rad = ((i * 30 - 90) * Math.PI) / 180;
                  const r = i % 2 === 0 ? 202 : 178;
                  return `${320 + r * Math.cos(rad)},${320 + r * Math.sin(rad)}`;
                })
                .join(' ')}
              fill="none"
              stroke={secondary}
              strokeWidth="1"
              strokeOpacity="0.5"
            />
            {[0, 90, 180, 270].map((deg) => {
              const rad = ((deg - 90) * Math.PI) / 180;
              const cx = 320 + 202 * Math.cos(rad);
              const cy = 320 + 202 * Math.sin(rad);
              return (
                <g key={`l5-cardinal-${deg}`}>
                  <circle cx={cx} cy={cy} r="5.5" fill={innerCircleFill} stroke={primary} strokeWidth="1.6" />
                  <circle cx={cx} cy={cy} r="2.2" fill={secondary} />
                </g>
              );
            })}
          </g>
        )}

        {/* LEVEL 4+: 元婴期 Nascent Soul Hexagram Star Seal */}
        {realmLevel >= 4 && (
          <g
            className="animate-spin-cw-med pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
          >
            <polygon
              points={[0, 120, 240]
                .map((deg) => {
                  const rad = ((deg - 90) * Math.PI) / 180;
                  return `${320 + 190 * Math.cos(rad)},${320 + 190 * Math.sin(rad)}`;
                })
                .join(' ')}
              fill="none"
              stroke={primary}
              strokeWidth="1.2"
              strokeOpacity="0.6"
            />
            <polygon
              points={[60, 180, 300]
                .map((deg) => {
                  const rad = ((deg - 90) * Math.PI) / 180;
                  return `${320 + 190 * Math.cos(rad)},${320 + 190 * Math.sin(rad)}`;
                })
                .join(' ')}
              fill="none"
              stroke={secondary}
              strokeWidth="1.2"
              strokeOpacity="0.55"
            />
          </g>
        )}

        {/* LEVEL 3+: 结丹期 Golden Core Radiant Dharma Ring */}
        {realmLevel >= 3 && (
          <g
            className="animate-spin-ccw-slow pointer-events-none"
            style={{ transformOrigin: '320px 320px' }}
          >
            <circle
              cx="320"
              cy="320"
              r="164"
              fill="none"
              stroke={primary}
              strokeWidth="1.2"
              strokeDasharray="10 6"
              strokeOpacity="0.6"
            />
            {Array.from({ length: 8 }).map((_, i) => (
              <g key={`l3-petal-${i}`} transform={`rotate(${i * 45} 320 320)`}>
                <path
                  d="M 320 148 L 325 162 L 320 168 L 315 162 Z"
                  fill={i % 2 === 0 ? primary : secondary}
                  fillOpacity="0.72"
                />
              </g>
            ))}
          </g>
        )}

        {/* Progress Track & Active Qi Progress Arc */}
        <circle
          cx="320"
          cy="320"
          r={progressRadius}
          fill={innerCircleFill}
          stroke={primary}
          strokeOpacity="0.18"
          strokeWidth="5"
        />
        <circle
          cx="320"
          cy="320"
          r={progressRadius}
          fill="none"
          stroke={realmLevel >= 4 ? 'url(#realmStrokeGrad)' : primary}
          strokeWidth={realmLevel >= 6 ? '5.5' : '4.5'}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 320 320)"
          filter={realmLevel >= 5 && isDark ? 'url(#realmGlow)' : undefined}
          style={{
            transition: 'stroke-dashoffset 300ms linear, stroke 300ms ease',
          }}
        />

        {/* Orbiting energy pearl on progress tip */}
        {clampedProgress > 0 && (
          <circle
            cx={markerX}
            cy={markerY}
            r={realmLevel >= 7 ? '6' : '5'}
            fill={textMain}
            stroke={primary}
            strokeWidth="2.2"
            filter={realmLevel >= 5 && isDark ? 'url(#realmGlow)' : undefined}
          />
        )}

        {/* Inner Core Halo */}
        <circle
          cx="320"
          cy="320"
          r="116"
          fill="none"
          stroke={primary}
          strokeOpacity={realmLevel >= 5 ? '0.35' : '0.16'}
          strokeWidth="1"
        />

        {/* Breathing Aura Ring during Meditation Mode */}
        {mode === 'meditation' && (
          <circle
            cx="320"
            cy="320"
            r="102"
            fill={primary}
            fillOpacity="0.08"
            stroke={primary}
            strokeOpacity="0.55"
            strokeWidth="1.6"
            style={{
              transform: `scale(${breathScale})`,
              transformOrigin: '320px 320px',
              transition: 'transform 450ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        )}

        {/* Central Typography (Guaranteed high contrast at every realm in Day & Night) */}
        <text
          x="320"
          y="258"
          textAnchor="middle"
          fill={secondary}
          fontSize="13"
          letterSpacing="2"
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {mode === 'meditation' && breathPhaseLabel
            ? breathPhaseLabel
            : `${realm.name} · ${realm.titleStyle}${isPreviewing ? '（观想）' : ''}`}
        </text>

        <text
          x="320"
          y="316"
          textAnchor="middle"
          dominantBaseline="central"
          fill={textMain}
          fontSize={displaySeconds >= 3600 ? '44' : '56'}
          fontWeight="600"
          className="tabular-nums"
          style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}
        >
          {formatClock(displaySeconds)}
        </text>

        <text
          x="320"
          y="372"
          textAnchor="middle"
          fill={textMuted}
          fontSize="13"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {mode === 'meditation' && breathSecondsLeft !== undefined && isRunning
            ? `当前呼吸节点剩余 ${breathSecondsLeft} 秒`
            : `${techniqueName} · ${activeTitle.length > 12 ? `${activeTitle.slice(0, 12)}…` : activeTitle}`}
        </text>
      </svg>
    </div>
  );
};
