import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchSeasonList, fetchPopularHeroes, fetchHeroAnalysis } from "@/lib/e7api";
import { normalizeFromPopular } from "@/lib/normalizeHeroes";
import { buildHeroDetailFromApi, type HeroDetailData } from "@/lib/buildHeroDetail";
import HeroDetailView from "@/components/heroes/HeroDetailView";

interface Props {
  params: Promise<{ hero_code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { hero_code } = await params;
  try {
    const seasons = await fetchSeasonList();
    const latestSeason = seasons.find((s) => s.is_now_season === 1)?.season_code ?? seasons[0]?.season_code ?? "";
    const popular = await fetchPopularHeroes(latestSeason, "champion");
    const heroes = normalizeFromPopular(popular);
    const hero = heroes.find((h) => h.code === hero_code);
    if (!hero) return {};
    return {
      title: `${hero.name} 장비 세팅 & 스탯 - Epic Sense 에픽세븐 영웅 도감`,
      description: `${hero.name}의 주요 장비 세트, 추천 스탯 구간, 시너지 영웅을 확인하세요.`,
    };
  } catch {
    return {};
  }
}

export default async function HeroDetailPage({ params }: Props) {
  const { hero_code } = await params;
  let detail: HeroDetailData | null = null;

  try {
    const seasons = await fetchSeasonList();
    const latestSeason = seasons.find((s) => s.is_now_season === 1)?.season_code ?? seasons[0]?.season_code ?? "";

    const popular = await fetchPopularHeroes(latestSeason, "champion");
    const heroes = normalizeFromPopular(popular);
    const hero = heroes.find((h) => h.code === hero_code);
    if (!hero) return notFound();

    // 전체 영웅 이름 맵
    const heroNameMap = new Map(heroes.map((h) => [h.code, h.name]));

    const analysis = await fetchHeroAnalysis(hero_code, latestSeason, "champion");
    detail = buildHeroDetailFromApi(hero, analysis, heroNameMap);
  } catch {
    const { findHeroByCode } = await import("@/components/heroes/mockHeroDetail");
    const mock = findHeroByCode(hero_code);
    if (!mock) return notFound();
    detail = mock as HeroDetailData;
  }

  return <HeroDetailView hero={detail} />;
}
