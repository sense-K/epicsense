const PROXY_BASE = process.env.NEXT_PUBLIC_E7_PROXY_URL ?? "http://localhost:8787";

async function e7fetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const url = `${PROXY_BASE}/api/e7/${endpoint}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`e7api error: ${res.status} ${endpoint}`);
  const json = await res.json() as { code: number; message: string; value: { result_body: T } };
  if (json.code !== 0) throw new Error(`e7api code ${json.code}: ${json.message}`);
  return json.value.result_body;
}

const HERO_JSON_URL = "https://static-pubcomm.onstove.com/gameRecord/epic7/epic7_hero.json";

// ──────────────────────────────────────────────
// 타입 정의 (실제 API 응답 기준)
// ──────────────────────────────────────────────

export interface E7HeroJson {
  code: string;
  grade: string;       // "3" | "4" | "5"
  name: string;
  job_cd: string;      // warrior | knight | mage | ranger | assassin | manauser
  attribute_cd: string; // fire | ice | wind | light | dark
}

export async function fetchHeroJson(lang = "ko"): Promise<E7HeroJson[]> {
  const res = await fetch(HERO_JSON_URL, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`hero json fetch error: ${res.status}`);
  const json = await res.json() as Record<string, E7HeroJson[]>;
  // c0001(메르세데스 구버전), c1005 제외 (사이트 원본 로직 그대로)
  return (json[lang] ?? json["ko"]).filter(
    (h) => h.code !== "c0001" && h.code !== "c1005"
  );
}

export interface E7Season {
  season_code: string;
  name: string;
  is_now_season: number;
  startDate: string;
  endDate: string;
}

export interface E7PopularHero {
  hero_code: string;
  hero_names: Record<string, string>;  // { hero_code: name }
  pick_rate: number;
  win_rate: number;
  ban_rate: number;
  use_rank: number;
  equip: string[];         // 장비 세트 코드
  with_heroes: string[];   // 시너지 영웅 코드
  hard_heroes: string[];   // 카운터 영웅 코드
}

// ability 값은 "콤마 구분 숫자 문자열" (10개 구간)
export interface E7HeroAnalysisRaw {
  heroCode: string;
  seasonCode: string;
  abillity: {
    att: string;      // 공격력
    def: string;      // 방어력
    max_hp: string;   // 생명력
    speed: string;    // 속도
    cri: string;      // 치명확률
    cri_dmg: string;  // 치명피해
    acc: string;      // 효과적중
    res: string;      // 효과저항
  };
  equip: Array<{
    rank: number;
    equip_list: string[];
    rate: number;
    win_rate: number;
  }>;
  ban: Array<{ num: number; rate: number }>;
  pick: Array<{ num: number; rate: number }>;
}

// ──────────────────────────────────────────────
// API 함수
// ──────────────────────────────────────────────

export async function fetchSeasonList(): Promise<E7Season[]> {
  return e7fetch<E7Season[]>("getSeasonList", { lang: "ko" });
}

export async function fetchPopularHeroes(
  seasonCode: string,
  gradeCode: string
): Promise<E7PopularHero[]> {
  return e7fetch<E7PopularHero[]>("getPopularHero", {
    season_code: seasonCode,
    grade_code: gradeCode,
    lang: "ko",
  });
}

// 여러 티어 병렬 fetch 후 병합 (더 많은 영웅 커버)
export async function fetchAllHeroes(seasonCode: string): Promise<E7PopularHero[]> {
  const grades = ["champion", "master", "gold", "silver"];
  const results = await Promise.allSettled(
    grades.map((g) => fetchPopularHeroes(seasonCode, g))
  );

  // champion 기준으로 hero_code → 데이터 맵, 나머지는 hero_names만 병합
  const heroMap = new Map<string, E7PopularHero>();

  results.forEach((r) => {
    if (r.status !== "fulfilled") return;
    r.value.forEach((h) => {
      if (!heroMap.has(h.hero_code)) {
        heroMap.set(h.hero_code, { ...h });
      } else {
        // hero_names만 보강
        const existing = heroMap.get(h.hero_code)!;
        existing.hero_names = { ...h.hero_names, ...existing.hero_names };
      }
      // 연관 영웅 이름도 hero_names에 누적
      const entry = heroMap.get(h.hero_code)!;
      entry.hero_names = { ...h.hero_names, ...entry.hero_names };
    });
  });

  return Array.from(heroMap.values());
}

export async function fetchHeroAnalysis(
  heroCode: string,
  seasonCode: string,
  gradeCode: string
): Promise<E7HeroAnalysisRaw> {
  return e7fetch<E7HeroAnalysisRaw>("getHeroAnalysis", {
    hero_code: heroCode,
    season_code: seasonCode,
    grade_code: gradeCode,
    lang: "ko",
  });
}
