import type { Metadata } from "next";
import { fetchSeasonList, fetchPopularHeroes, fetchHeroJson } from "@/lib/e7api";
import { normalizeFromJson, mergePopularData, type NormalizedHero } from "@/lib/normalizeHeroes";
import HeroesList from "@/components/heroes/HeroesList";

export const metadata: Metadata = {
  title: "에픽세븐 영웅 도감 - Epic Sense",
  description: "에픽세븐 전체 영웅의 장비 세팅, 추천 스탯, 시너지 영웅을 확인하세요.",
};

export default async function HeroesPage() {
  let heroes: NormalizedHero[] = [];

  try {
    const [heroJson, seasons] = await Promise.all([
      fetchHeroJson("ko"),
      fetchSeasonList(),
    ]);
    heroes = normalizeFromJson(heroJson);

    const latestSeason = seasons.find((s) => s.is_now_season === 1)?.season_code ?? seasons[0]?.season_code ?? "";
    const popular = await fetchPopularHeroes(latestSeason, "champion");
    heroes = mergePopularData(heroes, popular);
  } catch {
    const { HERO_DETAILS } = await import("@/components/heroes/mockHeroDetail");
    heroes = HERO_DETAILS.map((h) => ({
      code: h.code,
      name: h.name,
      element: h.element,
      heroClass: h.heroClass,
      stars: h.stars,
      pickRate: h.pickRate,
      winRate: h.winRate,
      banRate: h.banRate,
    }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">영웅 도감</h1>
        <p className="text-sm" style={{ color: "var(--text-sub)" }}>
          에픽세븐 전체 영웅의 장비 세팅, 추천 스탯 구간, 시너지 영웅 정보
        </p>
      </div>
      <HeroesList heroes={heroes} />
    </div>
  );
}
