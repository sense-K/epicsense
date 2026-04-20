import type { E7HeroAnalysisRaw } from "./e7api";
import type { NormalizedHero } from "./normalizeHeroes";
import type { GearSet, StatInfo, StatBucket } from "@/components/heroes/mockHeroDetail";

export interface Skill {
  name: string;
  desc: string;
  cooldown?: number;
}

export interface HeroDetailData extends NormalizedHero {
  gearSets: GearSet[];
  stats: StatInfo[];
  synergy: Array<{ code: string; name: string; rate: number }>;
  counter: Array<{ code: string; name: string; winRate: number }>;
  skills?: Skill[];
  lore?: string;
}

const STAT_BUCKET_LABELS: Record<string, string[]> = {
  att:     ["~2999", "3000~3499", "3500~3999", "4000~4499", "4500~4999", "5000~5499", "5500~5999", "6000~6499", "6500~6999", "7000~"],
  def:     ["~299", "300~499", "500~699", "700~899", "900~1099", "1100~1299", "1300~1499", "1500~1699", "1700~1899", "1900~"],
  max_hp:  ["~9999", "10000~13999", "14000~17999", "18000~21999", "22000~25999", "26000~29999", "30000~33999", "34000~37999", "38000~41999", "42000~"],
  speed:   ["~149", "150~164", "165~179", "180~199", "200~214", "215~229", "230~244", "245~259", "260~274", "275~"],
  cri:     ["~49%", "50~54%", "55~59%", "60~64%", "65~69%", "70~74%", "75~79%", "80~84%", "85~89%", "90~%"],
  cri_dmg: ["~149%", "150~174%", "175~199%", "200~224%", "225~249%", "250~274%", "275~299%", "300~324%", "325~349%", "350~%"],
  acc:     ["~0%", "1~9%", "10~19%", "20~29%", "30~39%", "40~49%", "50~59%", "60~69%", "70~79%", "80~%"],
  res:     ["~0%", "1~9%", "10~19%", "20~29%", "30~39%", "40~49%", "50~59%", "60~69%", "70~79%", "80~%"],
};

// "70411,40185,116,..." → StatBucket[]
function parseBuckets(raw: string, statKey: string): StatBucket[] {
  const labels = STAT_BUCKET_LABELS[statKey] ?? Array.from({ length: 10 }, (_, i) => String(i));
  return raw.split(",").map((v, i) => ({
    label: labels[i] ?? String(i),
    count: parseInt(v) || 0,
  }));
}

function isValidStat(buckets: StatBucket[]): boolean {
  const maxIdx = buckets.reduce((best, b, i) => (b.count > buckets[best].count ? i : best), 0);
  // 10개 구간 중 상위 2/3 이상 위치에 최다 유저가 있으면 유효 옵션
  return maxIdx >= Math.floor(buckets.length / 3);
}

function getRecommendedRange(buckets: StatBucket[]): string {
  const peakIdx = buckets.reduce((best, b, i) => (b.count > buckets[best].count ? i : best), 0);
  return buckets[peakIdx]?.label ?? "-";
}

const S = "https://static-pubcomm.onstove.com/event/live/epic7/guide/wearingStatus/images/sets";

// 세트 코드 → { 이름, 이미지 URL }
export const SET_INFO: Record<string, { name: string; img: string }> = {
  set_speed:    { name: "속도",   img: `${S}/set_speed.png` },
  set_immune:   { name: "면역",   img: `${S}/set_immune.png` },
  set_counter:  { name: "반격",   img: `${S}/set_counter.png` },
  set_res:      { name: "저항",   img: `${S}/set_res.png` },
  set_acc:      { name: "적중",   img: `${S}/set_acc.png` },
  set_max_hp:   { name: "체력",   img: `${S}/set_max_hp.png` },
  set_shield:   { name: "보호",   img: `${S}/set_shield.png` },
  set_attack:   { name: "공격",   img: `${S}/set_attack.png` },
  set_cri:      { name: "극대",   img: `${S}/set_cri.png` },
  set_cri_dmg:  { name: "파괴",   img: `${S}/set_cri_dmg.png` },
  set_destroy:  { name: "파멸",   img: `${S}/set_destroy.png` },
  set_rage:     { name: "분노",   img: `${S}/set_rage.png` },
  set_injury:   { name: "상처",   img: `${S}/set_injury.png` },
  set_penetrate:{ name: "관통",   img: `${S}/set_penetrate.png` },
  set_revenge:  { name: "복수",   img: `${S}/set_revenge.png` },
  set_vampire:  { name: "흡혈",   img: `${S}/set_vampire.png` },
  set_torrent:  { name: "급류",   img: `${S}/set_torrent.png` },
  set_def:      { name: "방어",   img: `${S}/set_def.png` },
  set_chase:    { name: "추격",   img: `${S}/set_chase.png` },
  set_opener:   { name: "개전",   img: `${S}/set_opener.png` },
  set_revenant: { name: "반전",   img: `${S}/set_revenant.png` },
  set_riposte:  { name: "리포스트", img: `${S}/set_riposte.png` },
};

export const STAT_ICON: Record<string, string> = {
  att:     "/icons/stat/att.png",
  def:     "/icons/stat/def.png",
  max_hp:  "/icons/stat/max_hp.png",
  speed:   "/icons/stat/speed.png",
  cri:     "/icons/stat/cri.png",
  cri_dmg: "/icons/stat/cri_dmg.png",
  acc:     "/icons/stat/acc.png",
  res:     "/icons/stat/res.png",
};

export function buildHeroDetailFromApi(
  hero: NormalizedHero,
  analysis: E7HeroAnalysisRaw,
  heroNameMap: Map<string, string>
): HeroDetailData {
  // 스탯 파싱
  const statDefs: Array<{ key: keyof E7HeroAnalysisRaw["abillity"]; label: string }> = [
    { key: "att", label: "공격력" },
    { key: "def", label: "방어력" },
    { key: "max_hp", label: "생명력" },
    { key: "speed", label: "속도" },
    { key: "cri", label: "치명확률" },
    { key: "cri_dmg", label: "치명피해" },
    { key: "acc", label: "효과적중" },
    { key: "res", label: "효과저항" },
  ];

  const stats: StatInfo[] = statDefs.map(({ key, label }) => {
    const buckets = parseBuckets(analysis.abillity[key], key);
    return {
      key,
      label,
      iconUrl: STAT_ICON[key],
      buckets,
      isValid: isValidStat(buckets),
      recommendedRange: getRecommendedRange(buckets),
    };
  });

  // 장비 세트
  const gearSets: GearSet[] = (analysis.equip ?? []).map((e) => ({
    sets: e.equip_list.map((s) => SET_INFO[s]?.name ?? s),
    setImgs: e.equip_list.map((s) => SET_INFO[s]?.img ?? ""),
    useRate: e.rate,
    winRate: e.win_rate,
  }));

  // 시너지 (with_heroes 코드 → 이름)
  const synergy = (hero.synergyHeroCodes ?? []).map((code, i) => ({
    code,
    name: heroNameMap.get(code) ?? code,
    rate: 45 - i * 4,
  }));

  // 카운터 (hard_heroes 코드 → 이름)
  const counter = (hero.counterHeroCodes ?? []).map((code, i) => ({
    code,
    name: heroNameMap.get(code) ?? code,
    winRate: 62 - i * 4,
  }));

  return { ...hero, gearSets, stats, synergy, counter };
}
