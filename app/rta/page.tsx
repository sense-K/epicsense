import type { Metadata } from "next";
import { fetchSeasonList, fetchPopularHeroes, fetchHeroJson, type E7PopularHero } from "@/lib/e7api";
import { normalizeFromJson, mergePopularData, type NormalizedHero } from "@/lib/normalizeHeroes";
import RtaBoard from "@/components/rta/RtaBoard";

export const metadata: Metadata = {
  title: "에픽세븐 실레나 픽 추천 - Epic Sense RTA 서포터",
  description: "에픽세븐 실시간 아레나 드래프트를 도와주는 픽 추천 도구. 시너지 영웅, 카운터 영웅을 실시간으로 확인하세요.",
};

export default async function RtaPage() {
  let heroes: NormalizedHero[] = [];
  let popularData: E7PopularHero[] = [];
  let seasonCode = "";

  try {
    const [heroJson, seasons] = await Promise.all([
      fetchHeroJson("ko"),
      fetchSeasonList(),
    ]);
    seasonCode = seasons.find((s) => s.is_now_season === 1)?.season_code ?? seasons[0]?.season_code ?? "";
    const [championData, masterData] = await Promise.all([
      fetchPopularHeroes(seasonCode, "champion"),
      fetchPopularHeroes(seasonCode, "master"),
    ]);
    popularData = championData;
    heroes = mergePopularData(normalizeFromJson(heroJson), championData);
  } catch {
    // API 실패 시 빈 배열 (RtaBoard에서 목업으로 폴백)
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-main)" }}>
      <RtaBoard heroes={heroes} popularData={popularData} seasonCode={seasonCode} />
    </div>
  );
}
