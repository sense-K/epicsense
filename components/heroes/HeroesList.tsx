"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ELEMENT_LABEL, ELEMENT_IMG, CLASS_LABEL, CLASS_IMG, ELEMENT_COLOR, ELEMENT_BG, type Element, type HeroClass } from "@/components/rta/mockHeroes";
import type { NormalizedHero } from "@/lib/normalizeHeroes";
import { heroImageUrl } from "@/lib/heroImage";

export default function HeroesList({ heroes }: { heroes: NormalizedHero[] }) {
  const [search, setSearch] = useState("");
  const [filterEls, setFilterEls] = useState<Set<Element>>(new Set());
  const [filterCls, setFilterCls] = useState<Set<HeroClass>>(new Set());

  function toggleEl(el: Element) {
    setFilterEls((prev) => { const next = new Set(prev); next.has(el) ? next.delete(el) : next.add(el); return next; });
  }
  function toggleCls(cls: HeroClass) {
    setFilterCls((prev) => { const next = new Set(prev); next.has(cls) ? next.delete(cls) : next.add(cls); return next; });
  }

  const filtered = useMemo(() => {
    return heroes.filter((h) => {
      if (search && !h.name.includes(search)) return false;
      if (filterEls.size > 0 && !filterEls.has(h.element)) return false;
      if (filterCls.size > 0 && !filterCls.has(h.heroClass)) return false;
      return true;
    });
  }, [search, filterEls, filterCls, heroes]);

  const isAllActive = filterEls.size === 0 && filterCls.size === 0;

  return (
    <div>
      {/* 검색 + 필터 */}
      <div
        className="rounded-xl p-4 mb-5 space-y-3"
        style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
      >
        <input
          type="text"
          placeholder="영웅 이름 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
          style={{
            background: "var(--bg-main)",
            color: "var(--text-base)",
            border: "1px solid var(--color-border)",
          }}
        />

        <div className="flex flex-wrap gap-1.5">
          <FilterChip
            label="전체"
            active={isAllActive}
            onClick={() => { setFilterEls(new Set()); setFilterCls(new Set()); }}
          />
          {(Object.keys(ELEMENT_LABEL) as Element[]).map((el) => (
            <FilterChip
              key={el}
              label={ELEMENT_LABEL[el]}
              active={filterEls.has(el)}
              color={ELEMENT_COLOR[el]}
              icon={ELEMENT_IMG[el]}
              onClick={() => toggleEl(el)}
            />
          ))}

          <div className="w-px mx-1 self-stretch" style={{ background: "var(--color-border)" }} />

          {(Object.keys(CLASS_LABEL) as HeroClass[]).map((cls) => (
            <FilterChip
              key={cls}
              label={CLASS_LABEL[cls]}
              icon={CLASS_IMG[cls]}
              active={filterCls.has(cls)}
              isClass
              onClick={() => toggleCls(cls)}
            />
          ))}
        </div>
      </div>

      <p className="text-sm mb-3" style={{ color: "var(--text-sub)" }}>
        총 <span style={{ color: "var(--text-base)", fontWeight: 600 }}>{filtered.length}</span>명
      </p>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "var(--text-sub)" }}>
          검색 결과가 없어요
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
          {filtered.map((hero) => (
            <Link key={hero.code} href={`/heroes/${hero.code}`}>
              <div
                className="rounded-xl overflow-hidden cursor-pointer transition-all hover:scale-[1.03] hover:shadow-lg group"
                style={{
                  background: "var(--bg-card)",
                  border: `1px solid var(--color-border)`,
                }}
              >
                {/* 초상화 + 오버레이 아이콘 */}
                <div className="pt-3 px-3 flex justify-center">
                  <div className="relative" style={{ width: 80, height: 80 }}>
                    {/* 초상화 */}
                    <div
                      className="relative overflow-hidden rounded-full w-full h-full"
                      style={{
                        background: ELEMENT_BG[hero.element],
                        border: `3px solid ${ELEMENT_COLOR[hero.element]}`,
                      }}
                    >
                      <Image
                        src={heroImageUrl(hero.code)}
                        alt={hero.name}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
                        sizes="80px"
                        unoptimized
                      />
                    </div>
                    {/* 좌상단: 직업 아이콘 */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <Image src={CLASS_IMG[hero.heroClass]} alt={CLASS_LABEL[hero.heroClass]} width={24} height={24} unoptimized />
                    </div>
                    {/* 우상단: 속성 아이콘 */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                      <Image src={ELEMENT_IMG[hero.element]} alt={ELEMENT_LABEL[hero.element]} width={24} height={24} unoptimized />
                    </div>
                    {/* 하단 중앙: 별 등급 */}
                    <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center" style={{ bottom: -4 }}>
                      {Array.from({ length: hero.stars }).map((_, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src="/icons/star/star1.svg" alt="" width={20} height={19} style={{ marginRight: i < hero.stars - 1 ? -6 : 0 }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 이름 */}
                <div className="px-2.5 pb-3 pt-3 text-center">
                  <p className="text-xs font-semibold leading-tight truncate" style={{ color: "var(--text-base)" }}>
                    {hero.name}
                  </p>
                  {hero.pickRate && (
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--color-primary)" }}>
                      픽률 {hero.pickRate.toFixed(1)}%
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  label, active, color, icon, isClass, onClick,
}: {
  label: string; active: boolean; color?: string; icon?: string; isClass?: boolean; onClick: () => void;
}) {
  const activeBg = isClass ? "var(--text-base)" : (color ?? "var(--color-primary)");
  const activeBorder = isClass ? "var(--text-base)" : (color ?? "var(--color-primary)");
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors flex items-center gap-1"
      style={{
        background: active ? activeBg : "transparent",
        color: active ? "#fff" : (color ?? "var(--text-sub)"),
        border: `1px solid ${active ? activeBorder : "var(--color-border)"}`,
      }}
    >
      {icon && (
        <Image
          src={icon} alt={label} width={13} height={13} unoptimized
          style={{ filter: active && isClass ? "brightness(0) invert(1)" : "none" }}
        />
      )}
      {label}
    </button>
  );
}
