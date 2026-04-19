import type { Metadata } from "next";
import { fetchSeasonList, fetchPopularHeroes, fetchHeroJson } from "@/lib/e7api";
import { normalizeFromJson, mergePopularData, type NormalizedHero } from "@/lib/normalizeHeroes";
import RtaBoard from "@/components/rta/RtaBoard";

export const metadata: Metadata = {
  title: "에픽세븐 실레나 픽 추천 - Epic Sense RTA 서포터",
  description: "에픽세븐 실시간 아레나 드래프트를 도와주는 픽 추천 도구. 시너지 영웅, 카운터 영웅을 실시간으로 확인하세요.",
};

export default async function RtaPage() {
  let heroes: NormalizedHero[] = [];

  try {
    const [heroJson, seasons] = await Promise.all([
      fetchHeroJson("ko"),
      fetchSeasonList(),
    ]);
    const latestSeason = seasons.find((s) => s.is_now_season === 1)?.season_code ?? seasons[0]?.season_code ?? "";
    const popular = await fetchPopularHeroes(latestSeason, "champion");
    heroes = mergePopularData(normalizeFromJson(heroJson), popular);
  } catch {
    // API 실패 시 빈 배열 (RtaBoard에서 목업으로 폴백)
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <RtaBoard heroes={heroes} />
    </div>
  );
}
