import { MOCK_HEROES, type Hero } from "@/components/rta/mockHeroes";

export interface GearSet {
  sets: string[];
  setImgs?: string[];
  useRate: number;
  winRate: number;
}

export interface StatBucket {
  label: string;   // "180~199"
  count: number;
}

export interface StatInfo {
  key: string;
  label: string;
  iconUrl?: string;
  buckets: StatBucket[];
  isValid: boolean;
  recommendedRange: string;
}

export interface Skill {
  name: string;
  desc: string;
  cooldown?: number;
}

export interface HeroDetail extends Hero {
  banRate: number;
  winRate: number;
  gearSets: GearSet[];
  stats: StatInfo[];
  synergy: Array<{ name: string; rate: number }>;
  counter: Array<{ name: string; winRate: number }>;
  skills: Skill[];
  lore: string;
}

const GEAR_SET_PRESETS: GearSet[][] = [
  [
    { sets: ["신속", "신속"], useRate: 38.2, winRate: 54.1 },
    { sets: ["신속", "반격"], useRate: 21.4, winRate: 51.8 },
    { sets: ["신속", "저항"], useRate: 14.7, winRate: 52.3 },
    { sets: ["고집", "신속"], useRate: 11.2, winRate: 49.6 },
    { sets: ["저항", "저항"], useRate: 7.1, winRate: 48.2 },
  ],
  [
    { sets: ["분노", "치명"], useRate: 42.1, winRate: 55.3 },
    { sets: ["분노", "신속"], useRate: 24.8, winRate: 52.7 },
    { sets: ["치명", "치명"], useRate: 16.3, winRate: 50.1 },
    { sets: ["분노", "저항"], useRate: 9.4, winRate: 48.9 },
    { sets: ["신속", "치명"], useRate: 5.7, winRate: 47.2 },
  ],
  [
    { sets: ["고집", "고집"], useRate: 35.6, winRate: 53.8 },
    { sets: ["고집", "신속"], useRate: 28.3, winRate: 52.1 },
    { sets: ["저항", "고집"], useRate: 18.9, winRate: 50.4 },
    { sets: ["신속", "신속"], useRate: 10.2, winRate: 48.7 },
    { sets: ["고집", "반격"], useRate: 6.1, winRate: 47.3 },
  ],
];

function makeBuckets(peak: number, label: string): StatBucket[] {
  const labels = ["~149", "150~164", "165~179", "180~199", "200~214", "215~229", "230~244", "245~259", "260~274", "275~"];
  return labels.map((l, i) => {
    const diff = Math.abs(i - peak);
    return { label: l, count: Math.max(5, Math.round(300 * Math.exp(-0.5 * diff * diff))) };
  });
}

function isValidStat(buckets: StatBucket[]): boolean {
  const maxIdx = buckets.reduce((best, b, i) => b.count > buckets[best].count ? i : best, 0);
  return maxIdx >= 5;
}

const STAT_PRESETS: StatInfo[][] = [
  // 딜러형
  [
    { key: "spd", label: "속도", buckets: makeBuckets(6, "spd"), isValid: true, recommendedRange: "215~229" },
    { key: "atk", label: "공격력%", buckets: makeBuckets(7, "atk"), isValid: true, recommendedRange: "245~259" },
    { key: "cc", label: "치명확률", buckets: makeBuckets(8, "cc"), isValid: true, recommendedRange: "260~274" },
    { key: "cd", label: "치명피해", buckets: makeBuckets(7, "cd"), isValid: true, recommendedRange: "245~259" },
    { key: "hp", label: "생명력%", buckets: makeBuckets(2, "hp"), isValid: false, recommendedRange: "165~179" },
    { key: "def", label: "방어력%", buckets: makeBuckets(1, "def"), isValid: false, recommendedRange: "150~164" },
    { key: "eff", label: "효과적중", buckets: makeBuckets(1, "eff"), isValid: false, recommendedRange: "150~164" },
    { key: "res", label: "효과저항", buckets: makeBuckets(1, "res"), isValid: false, recommendedRange: "150~164" },
  ],
  // 탱커형
  [
    { key: "spd", label: "속도", buckets: makeBuckets(5, "spd"), isValid: true, recommendedRange: "200~214" },
    { key: "hp", label: "생명력%", buckets: makeBuckets(8, "hp"), isValid: true, recommendedRange: "260~274" },
    { key: "def", label: "방어력%", buckets: makeBuckets(9, "def"), isValid: true, recommendedRange: "275~" },
    { key: "res", label: "효과저항", buckets: makeBuckets(7, "res"), isValid: true, recommendedRange: "245~259" },
    { key: "atk", label: "공격력%", buckets: makeBuckets(1, "atk"), isValid: false, recommendedRange: "150~164" },
    { key: "cc", label: "치명확률", buckets: makeBuckets(1, "cc"), isValid: false, recommendedRange: "150~164" },
    { key: "cd", label: "치명피해", buckets: makeBuckets(1, "cd"), isValid: false, recommendedRange: "150~164" },
    { key: "eff", label: "효과적중", buckets: makeBuckets(2, "eff"), isValid: false, recommendedRange: "165~179" },
  ],
  // 서포터형
  [
    { key: "spd", label: "속도", buckets: makeBuckets(8, "spd"), isValid: true, recommendedRange: "260~274" },
    { key: "hp", label: "생명력%", buckets: makeBuckets(6, "hp"), isValid: true, recommendedRange: "215~229" },
    { key: "res", label: "효과저항", buckets: makeBuckets(7, "res"), isValid: true, recommendedRange: "245~259" },
    { key: "eff", label: "효과적중", buckets: makeBuckets(2, "eff"), isValid: false, recommendedRange: "165~179" },
    { key: "atk", label: "공격력%", buckets: makeBuckets(1, "atk"), isValid: false, recommendedRange: "150~164" },
    { key: "def", label: "방어력%", buckets: makeBuckets(3, "def"), isValid: false, recommendedRange: "180~199" },
    { key: "cc", label: "치명확률", buckets: makeBuckets(1, "cc"), isValid: false, recommendedRange: "150~164" },
    { key: "cd", label: "치명피해", buckets: makeBuckets(1, "cd"), isValid: false, recommendedRange: "150~164" },
  ],
];

const SKILL_PRESETS: Skill[][] = [
  [
    { name: "일반 공격", desc: "적에게 공격력의 100% 피해를 입힙니다." },
    { name: "연계 강타", desc: "적에게 공격력의 180% 피해를 입히고, 방어력을 1턴 감소시킵니다.", cooldown: 4 },
    { name: "궁극기: 폭풍의 일격", desc: "모든 적에게 공격력의 250% 피해를 입히고, 전투 불능 상태의 적에게 추가 피해를 입힙니다. 적을 처치하면 쿨타임이 초기화됩니다.", cooldown: 5 },
  ],
  [
    { name: "일반 공격", desc: "적에게 공격력의 100% 피해를 입힙니다." },
    { name: "빙결의 화살", desc: "적에게 공격력의 200% 피해를 입히고 15% 확률로 빙결시킵니다.", cooldown: 3 },
    { name: "궁극기: 눈보라", desc: "모든 적에게 공격력의 300% 피해를 입힙니다. 빙결된 적에게는 추가 피해를 입힙니다.", cooldown: 6 },
  ],
  [
    { name: "일반 공격", desc: "적에게 공격력의 100% 피해를 입힙니다." },
    { name: "보호막 생성", desc: "아군 전체에게 최대 생명력의 15% 보호막을 부여하고 1턴 무적을 부여합니다.", cooldown: 4 },
    { name: "궁극기: 신성한 가호", desc: "아군 전체의 생명력을 최대 생명력의 30% 회복하고 부활 효과를 부여합니다.", cooldown: 7 },
  ],
];

const SYNERGY_PRESETS = [
  ["비브리스", "설화", "린", "타마린느", "아리에스타"],
  ["세레아", "임페리우스", "드리젤", "카이로스", "라그나르"],
  ["아룬카", "라필", "루나", "지젤", "레이니아"],
  ["페르시발", "도로시", "벨로나", "샬롯", "클라비스"],
];

const COUNTER_PRESETS = [
  ["세레아", "임페리우스", "드리젤", "카이로스", "라그나르"],
  ["비브리스", "설화", "페르시발", "린", "도로시"],
  ["아리에스타", "레이니아", "무브리스", "루나", "벨로나"],
  ["샬롯", "지젤", "라필", "클라비스", "미레스트"],
];

const LORES = [
  "먼 북방의 설원에서 태어난 전사. 어린 시절부터 탁월한 전투 본능을 보였으며, 수많은 전장을 누비며 전설적인 이름을 얻게 되었다.",
  "고대 마법 아카데미의 수석 졸업생. 지식에 대한 끝없는 탐구심을 가지고 있으며, 강력한 마법으로 동료들을 지원한다.",
  "어둠 속에서 빛을 찾아 헤매는 방랑자. 과거의 상처를 안고 살아가지만, 仲간들을 위해서라면 목숨도 아끼지 않는다.",
];

function getHeroDetail(hero: Hero, index: number): HeroDetail {
  const preset = index % 3;
  return {
    ...hero,
    banRate: Math.round((hero.pickRate ?? 10) * 0.6 * 10) / 10,
    winRate: 48 + Math.random() * 8,
    gearSets: GEAR_SET_PRESETS[preset],
    stats: STAT_PRESETS[preset].map((s) => ({ ...s, isValid: isValidStat(s.buckets) })),
    synergy: SYNERGY_PRESETS[preset % 4].map((name, i) => ({ name, rate: 45 - i * 5 })),
    counter: COUNTER_PRESETS[preset % 4].map((name, i) => ({ name, winRate: 62 - i * 4 })),
    skills: SKILL_PRESETS[preset],
    lore: LORES[preset],
  };
}

export const HERO_DETAILS: HeroDetail[] = MOCK_HEROES.map((h, i) => getHeroDetail(h, i));

export function findHeroByCode(code: string): HeroDetail | undefined {
  return HERO_DETAILS.find((h) => h.code === code);
}
