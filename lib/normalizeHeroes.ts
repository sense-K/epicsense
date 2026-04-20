import type { E7PopularHero, E7HeroJson } from "./e7api";
import type { Element, HeroClass } from "@/components/rta/mockHeroes";

export interface NormalizedHero {
  code: string;
  name: string;
  element: Element;
  heroClass: HeroClass;
  stars: 3 | 4 | 5;
  pickRate?: number;
  winRate?: number;
  banRate?: number;
  rank?: number;
  synergyHeroCodes?: string[];
  counterHeroCodes?: string[];
  equipSets?: string[];
}

const ATTR_MAP: Record<string, Element> = {
  fire: "fire",
  ice: "ice",
  wind: "earth",
  light: "light",
  dark: "dark",
};

const JOB_MAP: Record<string, HeroClass> = {
  warrior: "warrior",
  knight: "knight",
  mage: "mage",
  ranger: "ranger",
  assassin: "thief",
  manauser: "soul",
};

function gradeToStars(grade: string): 3 | 4 | 5 {
  const n = parseInt(grade);
  return (n === 3 || n === 4 || n === 5) ? n as 3 | 4 | 5 : 5;
}

// epic7_hero.json 기준으로 전체 영웅 목록 생성
export function normalizeFromJson(heroes: E7HeroJson[]): NormalizedHero[] {
  return heroes.map((h) => ({
    code: h.code,
    name: h.name,
    element: ATTR_MAP[h.attribute_cd] ?? "fire",
    heroClass: JOB_MAP[h.job_cd] ?? "warrior",
    stars: gradeToStars(h.grade),
  }));
}

// RTA popular 데이터로 픽률/승률/시너지 등 보강
export function mergePopularData(
  heroes: NormalizedHero[],
  popular: E7PopularHero[]
): NormalizedHero[] {
  const popMap = new Map(popular.map((h) => [h.hero_code, h]));
  return heroes.map((h) => {
    const pop = popMap.get(h.code);
    if (!pop) return h;
    return {
      ...h,
      pickRate: pop.pick_rate,
      winRate: pop.win_rate,
      banRate: pop.ban_rate,
      rank: pop.use_rank,
      synergyHeroCodes: pop.with_heroes,
      counterHeroCodes: pop.hard_heroes,
      equipSets: pop.equip,
    };
  }).sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999));
}

// 하위 호환용 (RTA 페이지에서만 사용)
export function normalizeFromPopular(heroes: E7PopularHero[]): NormalizedHero[] {
  const heroMap = new Map<string, NormalizedHero>();
  heroes.forEach((h) => {
    if (!heroMap.has(h.hero_code)) {
      const name = h.hero_names[h.hero_code] ?? h.hero_code;
      heroMap.set(h.hero_code, {
        code: h.hero_code,
        name,
        element: ATTR_MAP[h.hero_code] ?? "fire",
        heroClass: "warrior",
        stars: 5,
        pickRate: h.pick_rate,
        winRate: h.win_rate,
        banRate: h.ban_rate,
        rank: h.use_rank,
        synergyHeroCodes: h.with_heroes,
        counterHeroCodes: h.hard_heroes,
        equipSets: h.equip,
      });
    }
    Object.entries(h.hero_names).forEach(([code, name]) => {
      if (!heroMap.has(code)) {
        heroMap.set(code, {
          code, name,
          element: "fire",
          heroClass: "warrior",
          stars: 5,
        });
      }
    });
  });
  return Array.from(heroMap.values()).sort((a, b) => (a.rank ?? 999) - (b.rank ?? 999));
}
