export type TechniqueKey =
  | 'changchun'
  | 'qingyuan'
  | 'dayan'
  | 'fansheng'
  | 'bixie'
  | 'sanzhuan';

export interface CultivationTechnique {
  key: TechniqueKey;
  name: string;
  tag: string;
  presetMinutes: number;
  verse: string;
}

export const CULTIVATION_TECHNIQUES: CultivationTechnique[] = [
  {
    key: 'changchun',
    name: '长春功',
    tag: '吐纳入门',
    presetMinutes: 15,
    verse: '木气生生不息，绵长温和，最宜每日吐纳筑基。',
  },
  {
    key: 'qingyuan',
    name: '青元剑诀',
    tag: '专注研习',
    presetMinutes: 25,
    verse: '青竹蜂云，剑气凝练，一念聚气破除繁杂。',
  },
  {
    key: 'dayan',
    name: '大衍诀',
    tag: '推演神识',
    presetMinutes: 45,
    verse: '神识分化，一心多用而井然有序，推演万法不乱。',
  },
  {
    key: 'sanzhuan',
    name: '三转重元功',
    tag: '温养调息',
    presetMinutes: 20,
    verse: '散功重凝，去芜存菁，令根基愈发浑厚稳固。',
  },
  {
    key: 'bixie',
    name: '辟邪神雷',
    tag: '攻坚破难',
    presetMinutes: 50,
    verse: '金弧辟邪，疾如雷霆，直击要务斩断拖延心魔。',
  },
  {
    key: 'fansheng',
    name: '梵圣真魔功',
    tag: '深度闭关',
    presetMinutes: 60,
    verse: '法相庄严，百炼成钢，长时间深潜闭关必成大器。',
  },
];

export interface ShichenInfo {
  branch: string;
  name: string;
  range: string;
  startHour: number;
  organNote: string;
}

export const SHICHEN_LIST: ShichenInfo[] = [
  { branch: '子', name: '子时', range: '23:00–01:00', startHour: 23, organNote: '一阳初生 · 宜入静安寝' },
  { branch: '丑', name: '丑时', range: '01:00–03:00', startHour: 1, organNote: '太阴深沉 · 养血归元' },
  { branch: '寅', name: '寅时', range: '03:00–05:00', startHour: 3, organNote: '朝气萌动 · 清气上升' },
  { branch: '卯', name: '卯时', range: '05:00–07:00', startHour: 5, organNote: '日出东方 · 宜吐纳迎曦' },
  { branch: '辰', name: '辰时', range: '07:00–09:00', startHour: 7, organNote: '晨光初定 · 宜开启功课' },
  { branch: '巳', name: '巳时', range: '09:00–11:00', startHour: 9, organNote: '阳气渐盛 · 宜专注研习' },
  { branch: '午', name: '午时', range: '11:00–13:00', startHour: 11, organNote: '日中极阳 · 宜小憩养神' },
  { branch: '未', name: '未时', range: '13:00–15:00', startHour: 13, organNote: '日仄静思 · 宜推演整理' },
  { branch: '申', name: '申时', range: '15:00–17:00', startHour: 15, organNote: '金气清朗 · 宜攻坚破难' },
  { branch: '酉', name: '酉时', range: '17:00–19:00', startHour: 17, organNote: '暮色收摄 · 宜复盘功课' },
  { branch: '戌', name: '戌时', range: '19:00–21:00', startHour: 19, organNote: '夜幕初合 · 宜盘坐静心' },
  { branch: '亥', name: '亥时', range: '21:00–23:00', startHour: 21, organNote: '百脉归宁 · 宜敛神收功' },
];

export function getCurrentShichen(date: Date = new Date()): { current: ShichenInfo; index: number } {
  const hour = date.getHours();
  const index = Math.floor(((hour + 1) % 24) / 2);
  return { current: SHICHEN_LIST[index], index };
}

export type ThemePaletteKey = 'gold' | 'jade' | 'violet' | 'cinnabar';

export interface ThemePaletteOption {
  key: ThemePaletteKey;
  name: string;
  swatchDark: string;
  swatchLight: string;
}

export const THEME_PALETTES: ThemePaletteOption[] = [
  { key: 'gold', name: '鎏金古铜', swatchDark: '#C9A96A', swatchLight: '#A57C2E' },
  { key: 'jade', name: '青竹灵玉', swatchDark: '#4E9F8D', swatchLight: '#1E7563' },
  { key: 'violet', name: '紫府星辉', swatchDark: '#A78BFA', swatchLight: '#6D4AC9' },
  { key: 'cinnabar', name: '丹砂赤霞', swatchDark: '#DE7854', swatchLight: '#B34722' },
];

export interface CultivationRealm {
  level: number;
  name: string;
  stage: string;
  minMinutes: number;
  titleStyle: string;
  primaryColor: string;
  secondaryColor: string;
  dayPrimaryColor: string;
  daySecondaryColor: string;
  description: string;
}

/**
 * 境界体系参考《凡人修仙传》：
 * 炼气 -> 筑基 -> 结丹 -> 元婴 -> 化神 -> 炼虚 -> 合体 -> 大乘 -> 真仙
 */
export const CULTIVATION_REALMS: CultivationRealm[] = [
  {
    level: 1,
    name: '炼气期',
    stage: '十三层圆满',
    minMinutes: 0,
    titleStyle: '玄铁素环',
    primaryColor: '#8CA39B',
    secondaryColor: '#5C6F68',
    dayPrimaryColor: '#4A6159',
    daySecondaryColor: '#364A43',
    description: '初入仙途，采天地游离灵气入体，时钟呈古朴玄铁单环。',
  },
  {
    level: 2,
    name: '筑基期',
    stage: '液化道基',
    minMinutes: 60,
    titleStyle: '青玉双环',
    primaryColor: '#4E9F8D',
    secondaryColor: '#98D8C8',
    dayPrimaryColor: '#1E7563',
    daySecondaryColor: '#155447',
    description: '灵气化液筑成仙基，时钟浮现青竹灵玉双环与流转清纹。',
  },
  {
    level: 3,
    name: '结丹期',
    stage: '凝成金丹',
    minMinutes: 180,
    titleStyle: '赤金丹轮',
    primaryColor: '#D49B42',
    secondaryColor: '#F3CA7A',
    dayPrimaryColor: '#A66E18',
    daySecondaryColor: '#7D4E0D',
    description: '虚丹凝实，三昧真火绕丹运转，时钟化出炽金法轮与火纹内环。',
  },
  {
    level: 4,
    name: '元婴期',
    stage: '碎丹成婴',
    minMinutes: 420,
    titleStyle: '紫府星枢',
    primaryColor: '#A78BFA',
    secondaryColor: '#E5CA8B',
    dayPrimaryColor: '#6D4AC9',
    daySecondaryColor: '#9A6E24',
    description: '破丹出婴，神游太虚，时钟生出三重紫金星枢与六角秘纹。',
  },
  {
    level: 5,
    name: '化神期',
    stage: '人界绝巅',
    minMinutes: 900,
    titleStyle: '四象天象盘',
    primaryColor: '#38BDF8',
    secondaryColor: '#E0B860',
    dayPrimaryColor: '#0284C7',
    daySecondaryColor: '#A16207',
    description: '炼化天地灵气，沟通星辰四象，时钟演为四重天象灵脉阵列。',
  },
  {
    level: 6,
    name: '炼虚期',
    stage: '虚空凝实',
    minMinutes: 1800,
    titleStyle: '须弥折跃阵',
    primaryColor: '#2DD4BF',
    secondaryColor: '#818CF8',
    dayPrimaryColor: '#0F766E',
    daySecondaryColor: '#4338CA',
    description: '初涉灵界虚空法则，时钟外环化出双轴交错的须弥空间星轨。',
  },
  {
    level: 7,
    name: '合体期',
    stage: '法相天地',
    minMinutes: 3000,
    titleStyle: '法相金轮',
    primaryColor: '#F59E0B',
    secondaryColor: '#FDE68A',
    dayPrimaryColor: '#B45309',
    daySecondaryColor: '#78350F',
    description: '元婴与法相合一，法则金篆显化，时钟呈现六重交错金篆法轮。',
  },
  {
    level: 8,
    name: '大乘期',
    stage: '冠绝灵界',
    minMinutes: 4800,
    titleStyle: '紫霄雷莲盘',
    primaryColor: '#C084FC',
    secondaryColor: '#FBBF24',
    dayPrimaryColor: '#7E22CE',
    daySecondaryColor: '#B45309',
    description: '渡劫飞升在即，紫霄神雷绕盘噼啪流转，十二灵珠共鸣生辉。',
  },
  {
    level: 9,
    name: '真仙境',
    stage: '玄天仙窍',
    minMinutes: 7200,
    titleStyle: '玄天仙盘',
    primaryColor: '#FDE047',
    secondaryColor: '#5EEAD4',
    dayPrimaryColor: '#B45309',
    daySecondaryColor: '#0F766E',
    description: '飞升真仙之境，九大仙窍圆满共鸣，时钟化作玄天星穹大阵与万剑仙芒环绕。',
  },
];

export function getRealmForMinutes(totalMinutes: number): {
  current: CultivationRealm;
  next: CultivationRealm | null;
  progressPercent: number;
} {
  let current = CULTIVATION_REALMS[0];
  let next: CultivationRealm | null = CULTIVATION_REALMS[1];

  for (let i = 0; i < CULTIVATION_REALMS.length; i++) {
    if (totalMinutes >= CULTIVATION_REALMS[i].minMinutes) {
      current = CULTIVATION_REALMS[i];
      next = CULTIVATION_REALMS[i + 1] ?? null;
    }
  }

  if (!next) {
    return { current, next: null, progressPercent: 100 };
  }

  const span = next.minMinutes - current.minMinutes;
  const gained = totalMinutes - current.minMinutes;
  const progressPercent = Math.min(100, Math.max(0, Math.round((gained / span) * 100)));

  return { current, next, progressPercent };
}

export type BreathingPatternKey = 'box' | 'relax' | 'smooth';

export interface BreathingPattern {
  key: BreathingPatternKey;
  name: string;
  subtitle: string;
  inhale: number;
  holdIn: number;
  exhale: number;
  holdOut: number;
  description: string;
}

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    key: 'box',
    name: '四象吐纳法',
    subtitle: '4 · 4 · 4 · 4 秒',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    description: '吸、停、呼、息四段等长，令心神快速归于平稳。',
  },
  {
    key: 'relax',
    name: '太清深息法',
    subtitle: '4 · 7 · 8 · 0 秒',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    description: '长呼缓降心火，适合夜深烦躁或睡前收功。',
  },
  {
    key: 'smooth',
    name: '周天调息法',
    subtitle: '5 · 2 · 5 · 2 秒',
    inhale: 5,
    holdIn: 2,
    exhale: 5,
    holdOut: 2,
    description: '柔和绵长，适合久坐研习与常规静坐调息。',
  },
];

export type SoundscapeType = 'none' | 'wind' | 'rain' | 'stream' | 'drone';

export interface SoundscapeOption {
  id: SoundscapeType;
  name: string;
  desc: string;
}

export const SOUNDSCAPES: SoundscapeOption[] = [
  { id: 'none', name: '万籁俱寂', desc: '无环境音，仅保留钟磬提示' },
  { id: 'wind', name: '松风拂林', desc: '山林微风吹拂松涛的柔和白噪' },
  { id: 'rain', name: '夜雨听竹', desc: '细密绵长的竹林夜雨声' },
  { id: 'stream', name: '幽谷灵泉', desc: '低频澄澈的林间流水回响' },
  { id: 'drone', name: '太古清音', desc: '低沉悠远的泛音嗡鸣共鸣' },
];

export interface CultivationTask {
  id: string;
  title: string;
  minutes: number;
  technique: TechniqueKey;
  scheduledTime: string;
  priority: 'high' | 'normal' | 'low';
  completed: boolean;
  createdAt: number;
}

export interface SessionRecord {
  id: string;
  title: string;
  minutes: number;
  mode: 'timer' | 'meditation' | 'stopwatch';
  technique: TechniqueKey;
  completedAt: number;
}

export const MEDITATION_VERSES: string[] = [
  '大道无形，生育天地；大道无情，运行日月。',
  '修仙本是逆天而行，唯心定神闲者可破万劫。',
  '外物虽繁，守一不移；神识清明，则万物皆备于我。',
  '静坐常思修行路，不攀外魔，一呼一吸皆成周天。',
  '水静则明，心静则清，一念归元而灵气自聚。',
  '少思寡欲，神气内守，一炷香间亦可得大自在。',
];
