"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ELEMENT_LABEL, ELEMENT_IMG, CLASS_LABEL, CLASS_IMG,
  ELEMENT_COLOR, ELEMENT_BG,
  type Element, type HeroClass,
} from "@/components/rta/mockHeroes";
import type { NormalizedHero } from "@/lib/normalizeHeroes";
import { heroImageUrl } from "@/lib/heroImage";

// ─── 스탯 정의 ──────────────────────────────────
export const STAT_LIST = [
  { key: "att_pct",  label: "공격력%",   short: "공%"  },
  { key: "def_pct",  label: "방어력%",   short: "방%"  },
  { key: "hp_pct",   label: "생명력%",   short: "체%"  },
  { key: "spd",      label: "속도",      short: "속도" },
  { key: "crit",     label: "치명확률",  short: "치확" },
  { key: "crit_dmg", label: "치명피해",  short: "치피" },
  { key: "eff",      label: "효과적중",  short: "효적" },
  { key: "eff_res",  label: "효과저항",  short: "효저" },
] as const;

export type StatKey = (typeof STAT_LIST)[number]["key"];

// ─── 직업별 선호 스탯 ─────────────────────────────
const CLASS_VALID: Record<HeroClass, StatKey[]> = {
  warrior: ["att_pct", "hp_pct", "def_pct", "spd", "crit", "crit_dmg", "eff"],
  knight:  ["hp_pct", "def_pct", "spd", "eff_res"],
  mage:    ["att_pct", "spd", "eff", "crit", "crit_dmg"],
  ranger:  ["att_pct", "crit", "crit_dmg", "spd"],
  thief:   ["att_pct", "crit", "crit_dmg", "spd", "eff"],
  soul:    ["hp_pct", "spd", "eff", "eff_res"],
};

function getValidOptions(hero: NormalizedHero): StatKey[] {
  return CLASS_VALID[hero.heroClass] ?? [];
}

function matchScore(hero: NormalizedHero, selected: Set<StatKey>): number {
  if (selected.size === 0) return 0;
  const valid = getValidOptions(hero);
  return [...selected].filter((s) => valid.includes(s)).length;
}

// ─── 메인 컴포넌트 ────────────────────────────────
export default function GearRecommend({ heroes }: { heroes: NormalizedHero[] }) {
  const [selectedStats, setSelectedStats] = useState<Set<StatKey>>(new Set());
  const [filterEl, setFilterEl] = useState<Element | null>(null);
  const [filterCls, setFilterCls] = useState<HeroClass | null>(null);
  const [showAll, setShowAll] = useState(false);

  function toggleStat(key: StatKey) {
    setSelectedStats((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setShowAll(false);
  }

  const results = useMemo(() => {
    if (selectedStats.size === 0) return [];
    return heroes
      .filter((h) => h.stars === 5)
      .filter((h) => !filterEl || h.element === filterEl)
      .filter((h) => !filterCls || h.heroClass === filterCls)
      .map((h) => ({ hero: h, score: matchScore(h, selectedStats), total: selectedStats.size }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score || (b.hero.pickRate ?? 0) - (a.hero.pickRate ?? 0));
  }, [selectedStats, filterEl, filterCls, heroes]);

  const displayed = showAll ? results : results.slice(0, 24);
  const hasMore = results.length > 24 && !showAll;

  const perfect = results.filter((r) => r.score === r.total).length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* 타이틀 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">장비 주인 찾기</h1>
        <p className="text-sm" style={{ color: "var(--text-sub)" }}>
          장비의 세부 옵션을 선택하면 해당 스탯이 유효한 영웅을 추천해드려요
        </p>
      </div>

      {/* 스탯 선택 패널 */}
      <div
        className="rounded-xl p-5 mb-5"
        style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--text-sub)" }}>
          보조 옵션 선택 <span className="font-normal">(여러 개 선택 가능)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {STAT_LIST.map(({ key, label }) => {
            const active = selectedStats.has(key);
            return (
              <button
                key={key}
                onClick={() => toggleStat(key)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: active ? "var(--color-primary)" : "var(--bg-main)",
                  color: active ? "#fff" : "var(--text-sub)",
                  border: `1.5px solid ${active ? "var(--color-primary)" : "var(--color-border)"}`,
                  transform: active ? "scale(1.05)" : "scale(1)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {selectedStats.size > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span className="text-xs" style={{ color: "var(--text-sub)" }}>
              선택된 옵션:
            </span>
            {[...selectedStats].map((key) => {
              const stat = STAT_LIST.find((s) => s.key === key)!;
              return (
                <span
                  key={key}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: "rgba(59,130,246,0.15)", color: "var(--color-primary)" }}
                >
                  {stat.label}
                  <button
                    onClick={() => toggleStat(key)}
                    className="opacity-60 hover:opacity-100 transition-opacity leading-none"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            <button
              onClick={() => { setSelectedStats(new Set()); setShowAll(false); }}
              className="text-xs px-2 py-0.5 rounded"
              style={{ color: "var(--text-sub)", border: "1px solid var(--color-border)" }}
            >
              초기화
            </button>
          </div>
        )}
      </div>

      {/* 결과 영역 */}
      {selectedStats.size === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
        >
          <div className="text-4xl mb-3">⚔️</div>
          <p className="font-semibold mb-1">보조 옵션을 선택해주세요</p>
          <p className="text-sm" style={{ color: "var(--text-sub)" }}>
            선택한 옵션이 모두 유효한 영웅을 우선 추천해드려요
          </p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-sub)" }}>
          매칭되는 영웅이 없어요
        </div>
      ) : (
        <>
          {/* 필터 + 결과 수 */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-1.5">
              {/* 속성 필터 */}
              {(Object.keys(ELEMENT_LABEL) as Element[]).map((el) => (
                <button
                  key={el}
                  onClick={() => setFilterEl(filterEl === el ? null : el)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: filterEl === el ? ELEMENT_COLOR[el] : "var(--bg-card)",
                    border: `1.5px solid ${filterEl === el ? ELEMENT_COLOR[el] : "var(--color-border)"}`,
                    opacity: filterEl && filterEl !== el ? 0.4 : 1,
                  }}
                  title={ELEMENT_LABEL[el]}
                >
                  <Image src={ELEMENT_IMG[el]} alt={ELEMENT_LABEL[el]} width={16} height={16} unoptimized />
                </button>
              ))}
              <div className="w-px mx-0.5 self-stretch" style={{ background: "var(--color-border)" }} />
              {/* 직업 필터 */}
              {(Object.keys(CLASS_LABEL) as HeroClass[]).map((cls) => (
                <button
                  key={cls}
                  onClick={() => setFilterCls(filterCls === cls ? null : cls)}
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: filterCls === cls ? "var(--text-base)" : "var(--bg-card)",
                    border: `1.5px solid ${filterCls === cls ? "var(--text-base)" : "var(--color-border)"}`,
                    opacity: filterCls && filterCls !== cls ? 0.4 : 1,
                  }}
                  title={CLASS_LABEL[cls]}
                >
                  <Image
                    src={CLASS_IMG[cls]} alt={CLASS_LABEL[cls]} width={16} height={16} unoptimized
                    style={{ filter: filterCls === cls ? "brightness(0) invert(1)" : "none" }}
                  />
                </button>
              ))}
            </div>

            <p className="text-sm" style={{ color: "var(--text-sub)" }}>
              {results.length}명 중
              <span className="font-bold mx-1" style={{ color: "var(--color-primary)" }}>
                완전 일치 {perfect}명
              </span>
            </p>
          </div>

          {/* 영웅 그리드 */}
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))" }}>
            {displayed.map(({ hero, score, total }) => {
              const isPerfect = score === total;
              return (
                <Link key={hero.code} href={`/heroes/${hero.code}`}>
                  <div
                    className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg group"
                    style={{
                      background: "var(--bg-card)",
                      border: `1.5px solid ${isPerfect ? "var(--color-primary)" : "var(--color-border)"}`,
                      boxShadow: isPerfect ? "0 0 0 1px var(--color-primary)" : "none",
                    }}
                  >
                    {/* 이미지 */}
                    <div className="pt-3 px-3 flex justify-center">
                      <div className="relative" style={{ width: 72, height: 72 }}>
                        <div
                          className="relative overflow-hidden rounded-full w-full h-full"
                          style={{
                            background: ELEMENT_BG[hero.element],
                            border: `2.5px solid ${ELEMENT_COLOR[hero.element]}`,
                          }}
                        >
                          <Image
                            src={heroImageUrl(hero.code)}
                            alt={hero.name}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                            sizes="72px"
                            unoptimized
                          />
                        </div>
                        {/* 직업 아이콘 */}
                        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)" }}>
                          <Image src={CLASS_IMG[hero.heroClass]} alt="" width={20} height={20} unoptimized />
                        </div>
                        {/* 속성 아이콘 */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)" }}>
                          <Image src={ELEMENT_IMG[hero.element]} alt="" width={20} height={20} unoptimized />
                        </div>
                      </div>
                    </div>

                    {/* 이름 + 매칭 점수 */}
                    <div className="px-2 pb-3 pt-2 text-center">
                      <p className="text-xs font-semibold leading-tight truncate mb-1.5" style={{ color: "var(--text-base)" }}>
                        {hero.name}
                      </p>
                      {/* 매칭 바 */}
                      <div className="flex gap-0.5 justify-center">
                        {Array.from({ length: total }).map((_, i) => (
                          <div
                            key={i}
                            className="h-1 rounded-full flex-1"
                            style={{
                              background: i < score ? "var(--color-primary)" : "var(--color-border)",
                              maxWidth: 14,
                            }}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] mt-1" style={{ color: isPerfect ? "var(--color-primary)" : "var(--text-sub)" }}>
                        {score}/{total} 일치
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 더보기 */}
          {hasMore && (
            <div className="text-center mt-6">
              <button
                onClick={() => setShowAll(true)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                style={{
                  background: "var(--bg-card)",
                  color: "var(--text-sub)",
                  border: "1px solid var(--color-border)",
                }}
              >
                나머지 {results.length - 24}명 더 보기
              </button>
            </div>
          )}

          {/* 안내 */}
          <p className="text-center text-xs mt-6" style={{ color: "var(--text-sub)", opacity: 0.6 }}>
            직업별 선호 스탯 기준으로 매칭됩니다 · 영웅 빌드에 따라 다를 수 있어요
          </p>
        </>
      )}
    </div>
  );
}
