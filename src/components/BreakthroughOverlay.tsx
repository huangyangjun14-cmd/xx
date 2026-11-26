import React, { useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { CULTIVATION_REALMS } from '../types/cultivation';

interface BreakthroughOverlayProps {
  realmLevel: number | null;
  onClose: () => void;
  onSwitchRealm: (level: number) => void;
}

const BREAKTHROUGH_LORE: Record<
  number,
  { phenomenon: string; subtitle: string }
> = {
  1: {
    phenomenon: '引气入体 · 灵脉初开',
    subtitle: '天地游离灵气循经入窍，凡胎初褪，正式踏入修仙大道。',
  },
  2: {
    phenomenon: '灵气化液 · 青玉筑基',
    subtitle: '丹田灵气凝为液态灵泉，洗髓伐毛，铸就稳固青玉道基。',
  },
  3: {
    phenomenon: '真火淬炼 · 虚丹凝实',
    subtitle: '三昧真火绕丹炉百转千炼，一颗炽金金丹破雾而出，威压四野。',
  },
  4: {
    phenomenon: '碎丹成婴 · 紫府显圣',
    subtitle: '金丹咔嚓碎裂，紫金元婴破壳而出，紫府星枢随之大放光明。',
  },
  5: {
    phenomenon: '天人交感 · 四象聚灵',
    subtitle: '元神贯通星穹四象，百里天地灵气如鲸吞般倒灌入阵。',
  },
  6: {
    phenomenon: '须弥折跃 · 破虚凝实',
    subtitle: '虚空法则层层折叠又瞬间绽开，须弥纳芥子，神念动摇乾坤。',
  },
  7: {
    phenomenon: '法相天地 · 金篆归位',
    subtitle: '巍峨法相顶天立地，十二金篆法剑贯通上下，万法不侵。',
  },
  8: {
    phenomenon: '紫霄天劫 · 十二灵珠',
    subtitle: '九霄紫电轰然淬体，劫云散尽现十二灵珠，已立人界灵界之巅。',
  },
  9: {
    phenomenon: '玄天仙窍 · 万剑朝宗',
    subtitle: '仙界天门宏开，玄天星穹大阵与九大仙窍齐鸣，万道金青仙芒直贯九霄证真仙！',
  },
};

export const BreakthroughOverlay: React.FC<BreakthroughOverlayProps> = ({
  realmLevel,
  onClose,
  onSwitchRealm,
}) => {
  const [replayCount, setReplayCount] = React.useState(0);

  useEffect(() => {
    if (realmLevel === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [realmLevel, onClose]);

  if (realmLevel === null) return null;

  const realm = CULTIVATION_REALMS.find((r) => r.level === realmLevel) ?? CULTIVATION_REALMS[0];
  const lore = BREAKTHROUGH_LORE[realm.level] ?? BREAKTHROUGH_LORE[1];
  const p = realm.primaryColor;
  const s = realm.secondaryColor;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070A0D]/92 backdrop-blur-md p-4 overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label={`${realm.name}突破异象`}
    >
      {/* Top Bar Controls inside Showcase */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setReplayCount((c) => c + 1);
            onSwitchRealm(realm.level);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[#C9A96A]/25 bg-[#141B20]/80 text-[#EDE6D6] hover:bg-[#C9A96A]/15 transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重播异象</span>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭突破动画"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[#C9A96A] text-[#0B0F12] font-medium hover:bg-[#D8BA7E] transition-colors cursor-pointer whitespace-nowrap shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          <span>收功归位</span>
        </button>
      </div>

      {/* Central Animated SVG Breakthrough Phenomenon (keyed by realm.level + replayCount) */}
      <div
        key={`bt-anim-${realm.level}-${replayCount}`}
        className="relative w-full max-w-[540px] aspect-square flex items-center justify-center"
      >
        <svg viewBox="0 0 600 600" className="w-full h-full overflow-visible">
          <defs>
            <radialGradient id="btAuraGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={p} stopOpacity="0.45" />
              <stop offset="55%" stopColor={s} stopOpacity="0.16" />
              <stop offset="100%" stopColor="#070A0D" stopOpacity="0" />
            </radialGradient>
            <filter id="btGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Ambient Explosion Halo */}
          <circle cx="300" cy="300" r="270" fill="url(#btAuraGrad)" className="animate-bt-core" />

          {/* Expanding Shockwave Rings (Present in all realms, intensity scales) */}
          <g style={{ transformOrigin: '300px 300px' }} className="animate-bt-shockwave">
            <circle cx="300" cy="300" r="190" fill="none" stroke={p} strokeWidth="2.5" />
          </g>
          {realm.level >= 2 && (
            <g style={{ transformOrigin: '300px 300px' }} className="animate-bt-shockwave-delayed">
              <circle
                cx="300"
                cy="300"
                r="225"
                fill="none"
                stroke={s}
                strokeWidth="1.6"
                strokeDasharray="12 8"
              />
            </g>
          )}

          {/* REALM 1: 炼气期 — 12 Converging Qi Rays */}
          {realm.level === 1 && (
            <g className="animate-spin-cw-slow" style={{ transformOrigin: '300px 300px' }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="300"
                  y1="75"
                  x2="300"
                  y2="215"
                  stroke={p}
                  strokeWidth="2"
                  strokeLinecap="round"
                  opacity="0.7"
                  transform={`rotate(${i * 30} 300 300)`}
                />
              ))}
            </g>
          )}

          {/* REALM 2: 筑基期 — Liquid Jade Vortex Swirls */}
          {realm.level === 2 && (
            <g className="animate-spin-cw-med" style={{ transformOrigin: '300px 300px' }} filter="url(#btGlow)">
              {Array.from({ length: 6 }).map((_, i) => (
                <path
                  key={i}
                  d="M 300 300 Q 380 220 300 100"
                  fill="none"
                  stroke={i % 2 === 0 ? p : s}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  opacity="0.82"
                  transform={`rotate(${i * 60} 300 300)`}
                />
              ))}
            </g>
          )}

          {/* REALM 3: 结丹期 — Samadhi True Flame Petals Forging the Golden Core */}
          {realm.level === 3 && (
            <g className="animate-spin-ccw-slow" style={{ transformOrigin: '300px 300px' }} filter="url(#btGlow)">
              {Array.from({ length: 8 }).map((_, i) => (
                <path
                  key={i}
                  d="M 300 70 Q 345 145 300 220 Q 255 145 300 70 Z"
                  fill={i % 2 === 0 ? p : s}
                  fillOpacity="0.28"
                  stroke={s}
                  strokeWidth="1.8"
                  transform={`rotate(${i * 45} 300 300)`}
                />
              ))}
              <circle cx="300" cy="300" r="88" fill={p} fillOpacity="0.22" stroke={s} strokeWidth="3" />
            </g>
          )}

          {/* REALM 4: 元婴期 — Shattered Core + Violet Hexagram Star Seal */}
          {realm.level === 4 && (
            <g filter="url(#btGlow)">
              <g className="animate-spin-cw-med" style={{ transformOrigin: '300px 300px' }}>
                <polygon
                  points="300,88 483,405 117,405"
                  fill="none"
                  stroke={p}
                  strokeWidth="2.5"
                />
                <polygon
                  points="300,512 483,195 117,195"
                  fill="none"
                  stroke={s}
                  strokeWidth="2.5"
                />
              </g>
              {Array.from({ length: 6 }).map((_, i) => {
                const rad = ((i * 60 - 90) * Math.PI) / 180;
                return (
                  <circle
                    key={i}
                    cx={300 + 212 * Math.cos(rad)}
                    cy={300 + 212 * Math.sin(rad)}
                    r="6"
                    fill={s}
                  />
                );
              })}
            </g>
          )}

          {/* REALM 5: 化神期 — Four Cardinal Celestial Pillars + 12-Star Constellation */}
          {realm.level === 5 && (
            <g filter="url(#btGlow)">
              {[0, 90, 180, 270].map((deg) => (
                <g key={deg} transform={`rotate(${deg} 300 300)`}>
                  <line x1="300" y1="30" x2="300" y2="210" stroke={p} strokeWidth="4" opacity="0.85" />
                  <circle cx="300" cy="68" r="10" fill="#070A0D" stroke={s} strokeWidth="2.5" />
                </g>
              ))}
              <g className="animate-spin-ccw-slow" style={{ transformOrigin: '300px 300px' }}>
                <polygon
                  points={Array.from({ length: 12 })
                    .map((_, i) => {
                      const rad = ((i * 30 - 90) * Math.PI) / 180;
                      const r = i % 2 === 0 ? 230 : 175;
                      return `${300 + r * Math.cos(rad)},${300 + r * Math.sin(rad)}`;
                    })
                    .join(' ')}
                  fill="none"
                  stroke={s}
                  strokeWidth="1.8"
                />
              </g>
            </g>
          )}

          {/* REALM 6: 炼虚期 — Multi-Axis Spatial Fold Ellipses */}
          {realm.level === 6 && (
            <g filter="url(#btGlow)">
              {[0, 45, 90, 135].map((deg, idx) => (
                <g
                  key={deg}
                  className={idx % 2 === 0 ? 'animate-spin-cw-med' : 'animate-spin-ccw-slow'}
                  style={{ transformOrigin: '300px 300px' }}
                >
                  <ellipse
                    cx="300"
                    cy="300"
                    rx="255"
                    ry="95"
                    transform={`rotate(${deg} 300 300)`}
                    fill="none"
                    stroke={idx % 2 === 0 ? p : s}
                    strokeWidth="2"
                    strokeDasharray="16 8"
                  />
                </g>
              ))}
            </g>
          )}

          {/* REALM 7: 合体期 — Heaven-Earth Pillar + 12 Golden Seal Swords */}
          {realm.level === 7 && (
            <g filter="url(#btGlow)">
              <rect
                x="252"
                y="0"
                width="96"
                height="600"
                fill={p}
                fillOpacity="0.12"
                className="animate-bt-beam"
                style={{ transformOrigin: '300px 300px' }}
              />
              <g className="animate-spin-ccw-fast" style={{ transformOrigin: '300px 300px' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <g key={i} transform={`rotate(${i * 30} 300 300)`}>
                    <polygon
                      points="300,56 290,115 300,132 310,115"
                      fill={i % 2 === 0 ? p : s}
                      fillOpacity="0.78"
                    />
                  </g>
                ))}
              </g>
            </g>
          )}

          {/* REALM 8: 大乘期 — Purple-Gold Tribulation Thunderbolts + 12 Spirit Pearls */}
          {realm.level === 8 && (
            <g filter="url(#btGlow)">
              <g className="animate-bt-lightning">
                {Array.from({ length: 8 }).map((_, i) => (
                  <g key={i} transform={`rotate(${i * 45} 300 300)`}>
                    <polyline
                      points="300,14 282,66 312,86 286,142 308,162 296,204"
                      fill="none"
                      stroke={i % 2 === 0 ? p : s}
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ))}
              </g>
              <g className="animate-spin-cw-med" style={{ transformOrigin: '300px 300px' }}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const rad = ((i * 30) * Math.PI) / 180;
                  return (
                    <circle
                      key={i}
                      cx={300 + 215 * Math.cos(rad)}
                      cy={300 + 215 * Math.sin(rad)}
                      r="7"
                      fill={i % 2 === 0 ? s : p}
                    />
                  );
                })}
              </g>
            </g>
          )}

          {/* REALM 9: 真仙境 — 天门星穹柱 + 八角双玄阵 + 万剑归宗仙芒 + 九大仙窍 */}
          {realm.level === 9 && (
            <g filter="url(#btGlow)">
              {/* Vertical Immortal Gate Light Beam + Flanking Architectural Pillars */}
              <rect
                x="234"
                y="0"
                width="132"
                height="600"
                fill="url(#btAuraGrad)"
                className="animate-bt-beam"
                style={{ transformOrigin: '300px 300px' }}
              />
              <line x1="234" y1="0" x2="234" y2="600" stroke={s} strokeWidth="1" opacity="0.38" />
              <line x1="366" y1="0" x2="366" y2="600" stroke={s} strokeWidth="1" opacity="0.38" />

              {/* Outer Counter-Rotating Armillary Calibration Ring */}
              <g className="animate-spin-ccw-fast" style={{ transformOrigin: '300px 300px' }}>
                <circle
                  cx="300"
                  cy="300"
                  r="268"
                  fill="none"
                  stroke={s}
                  strokeWidth="1.8"
                  strokeDasharray="24 8 4 8"
                  opacity="0.88"
                />
                <circle
                  cx="300"
                  cy="300"
                  r="252"
                  fill="none"
                  stroke={p}
                  strokeWidth="1"
                  strokeDasharray="2 10"
                  opacity="0.7"
                />
              </g>

              {/* Twin Interlocking Octagram Sacred Arrays */}
              <g className="animate-spin-cw-med" style={{ transformOrigin: '300px 300px' }}>
                {[0, 45].map((rot, idx) => (
                  <polygon
                    key={`bt9-sq-${rot}`}
                    points={Array.from({ length: 4 })
                      .map((_, i) => {
                        const rad = ((i * 90 + rot - 90) * Math.PI) / 180;
                        return `${300 + 236 * Math.cos(rad)},${300 + 236 * Math.sin(rad)}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={idx === 0 ? p : s}
                    strokeWidth="2"
                    opacity="0.85"
                  />
                ))}

                {/* 24 Sharp Flying-Sword / Celestial Rays */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const isMajor = i % 2 === 0;
                  return (
                    <g key={`bt9-sword-${i}`} transform={`rotate(${i * 15} 300 300)`}>
                      <line
                        x1="300"
                        y1={isMajor ? '52' : '88'}
                        x2="300"
                        y2="176"
                        stroke={isMajor ? p : s}
                        strokeWidth={isMajor ? '2' : '1.1'}
                        strokeLinecap="round"
                        opacity={isMajor ? '0.92' : '0.55'}
                      />
                      {isMajor && (
                        <polygon
                          points="300,34 294,54 300,64 306,54"
                          fill={i % 4 === 0 ? p : s}
                          opacity="0.95"
                        />
                      )}
                    </g>
                  );
                })}
              </g>

              {/* 9 Orbiting Immortal Apertures (九大仙窍星珠) */}
              <g className="animate-spin-ccw-slow" style={{ transformOrigin: '300px 300px' }}>
                <circle
                  cx="300"
                  cy="300"
                  r="192"
                  fill="none"
                  stroke={p}
                  strokeWidth="1.2"
                  strokeOpacity="0.55"
                />
                {Array.from({ length: 9 }).map((_, i) => {
                  const rad = ((i * 40 - 90) * Math.PI) / 180;
                  const cx = 300 + 192 * Math.cos(rad);
                  const cy = 300 + 192 * Math.sin(rad);
                  return (
                    <g key={`bt9-orb-${i}`}>
                      <circle cx={cx} cy={cy} r="9" fill="#070A0D" stroke={s} strokeWidth="2" />
                      <circle cx={cx} cy={cy} r="4" fill={p} />
                    </g>
                  );
                })}
              </g>
            </g>
          )}

          {/* Central Breakthrough Seal */}
          <g className="animate-bt-core" style={{ transformOrigin: '300px 300px' }}>
            <circle
              cx="300"
              cy="300"
              r="112"
              fill="#0B0F12"
              fillOpacity="0.88"
              stroke={p}
              strokeWidth="2.5"
            />
            <circle
              cx="300"
              cy="300"
              r="98"
              fill="none"
              stroke={s}
              strokeWidth="1"
              strokeOpacity="0.65"
            />
          </g>
        </svg>

        {/* Crisp Centered Breakthrough Typography */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12 pointer-events-none animate-bt-text">
          <span
            className="text-xs tracking-[0.25em] font-medium"
            style={{ color: s }}
          >
            境界突破 · 第 {realm.level} 境
          </span>
          <h2
            className="mt-2 text-4xl sm:text-5xl font-bold tracking-wider text-[#EDE6D6]"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {realm.name}
          </h2>
          <p className="mt-2 text-sm font-medium" style={{ color: p }}>
            {lore.phenomenon}
          </p>
        </div>
      </div>

      {/* Bottom Lore & All-9 Breakthrough Switcher */}
      <div className="relative z-20 max-w-[680px] w-full text-center mt-2 animate-bt-text">
        <p className="text-sm text-[#9BA39E] leading-relaxed mb-4 px-4">
          {lore.subtitle}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-1.5 px-2">
          {CULTIVATION_REALMS.map((r) => {
            const active = r.level === realm.level;
            return (
              <button
                key={r.level}
                type="button"
                onClick={() => onSwitchRealm(r.level)}
                className={`px-3 py-1.5 text-xs rounded-md border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'text-[#0B0F12] font-semibold border-transparent'
                    : 'bg-[#141B20]/80 border-[#C9A96A]/20 text-[#9BA39E] hover:text-[#EDE6D6]'
                }`}
                style={active ? { backgroundColor: r.primaryColor } : undefined}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
