import type { Metadata } from "next";
import { MOCK_HEROES } from "@/components/rta/mockHeroes";
import type { NormalizedHero } from "@/lib/normalizeHeroes";
import AdminGate from "@/components/gear-recommend/AdminGate";
import GearRecommend from "@/components/gear-recommend/GearRecommend";

export const metadata: Metadata = {
  title: "장비 주인 찾기 - Epic Sense",
  description: "장비 옵션을 선택하면 해당 스탯이 유효한 영웅을 추천해드려요.",
};

// 관리자 전용 페이지 — mock 데이터로 UI 미리보기
const heroes: NormalizedHero[] = MOCK_HEROES.map((h) => ({
  code: h.code,
  name: h.name,
  element: h.element,
  heroClass: h.heroClass,
  stars: h.stars,
  pickRate: h.pickRate,
}));

export default function GearRecommendPage() {
  return (
    <AdminGate>
      <GearRecommend heroes={heroes} />
    </AdminGate>
  );
}
