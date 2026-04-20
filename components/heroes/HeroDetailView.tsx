"use client";

import Link from "next/link";
import Image from "next/image";
import { ELEMENT_LABEL, ELEMENT_IMG, ELEMENT_ICON, CLASS_LABEL, CLASS_IMG, ELEMENT_COLOR, ELEMENT_BG } from "@/components/rta/mockHeroes";
import type { StatInfo } from "./mockHeroDetail";
import type { HeroDetailData as HeroDetail } from "@/lib/buildHeroDetail";
import { heroImageUrl } from "@/lib/heroImage";

function StatBar({ value, max }: { value: number; max: number }) {
  return (
    <div className="flex-1 rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div
        className="rounded-full h-1.5 transition-all"
        style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: "var(--color-primary)" }}
      />
    </div>
  );
}


export default function HeroDetailView({ hero }: { hero: HeroDetail }) {
  const validStats = (hero.stats ?? []).filter((s) => s.isValid);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* 뒤로가기 */}
      <Link
        href="/heroes"
        className="inline-flex items-center gap-1.5 text-sm mb-5 hover:opacity-80 transition-opacity"
        style={{ color: "var(--text-sub)" }}
      >
        ← 영웅 도감으로
      </Link>

      {/* 히어로 프로필 배너 */}
      <div
        className="rounded-2xl p-6 mb-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${ELEMENT_BG[hero.element]}, var(--bg-card))`,
          border: `1px solid ${ELEMENT_COLOR[hero.element]}40`,
        }}
      >
        <div className="flex items-start gap-5">
          {/* 동그라미 초상화 + 오버레이 아이콘 */}
          <div className="relative flex-shrink-0" style={{ width: 100, height: 100 }}>
            <div
              className="rounded-full overflow-hidden w-full h-full relative"
              style={{
                background: ELEMENT_BG[hero.element],
                border: `3px solid ${ELEMENT_COLOR[hero.element]}`,
              }}
            >
              <Image
                src={heroImageUrl(hero.code)}
                alt={hero.name}
                fill
                className="object-cover object-top"
                unoptimized
              />
            </div>
            {/* 좌상단: 직업 아이콘 */}
            <div className="absolute -top-1 -left-1 w-7 h-7 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <Image src={CLASS_IMG[hero.heroClass]} alt={CLASS_LABEL[hero.heroClass]} width={28} height={28} unoptimized />
            </div>
            {/* 우상단: 속성 아이콘 */}
            <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.25)" }}>
              <Image src={ELEMENT_IMG[hero.element]} alt={ELEMENT_LABEL[hero.element]} width={28} height={28} unoptimized />
            </div>
            {/* 하단 중앙: 별 등급 */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center" style={{ bottom: -5 }}>
              {Array.from({ length: hero.stars }).map((_, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src="/icons/star/star1.svg" alt="" width={22} height={21} style={{ marginRight: i < hero.stars - 1 ? -6 : 0 }} />
              ))}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-base)" }}>{hero.name}</h1>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: ELEMENT_BG[hero.element], color: ELEMENT_COLOR[hero.element] }}
              >
                {ELEMENT_ICON[hero.element]} {ELEMENT_LABEL[hero.element]}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "rgba(255,255,255,0.08)", color: "var(--text-sub)" }}
              >
                <Image src={CLASS_IMG[hero.heroClass]} alt={CLASS_LABEL[hero.heroClass]} width={14} height={14} unoptimized />
                {CLASS_LABEL[hero.heroClass]}
              </span>
              <span className="text-xs" style={{ color: "#eab308" }}>{"★".repeat(hero.stars)}</span>
            </div>

            <p className="text-sm mb-4 line-clamp-2" style={{ color: "var(--text-sub)" }}>{hero.lore}</p>

            {/* 주요 지표 */}
            <div className="flex flex-wrap gap-4">
              {[
                { label: "픽률", value: hero.pickRate != null ? `${hero.pickRate}%` : "-", color: "var(--color-primary)" },
                { label: "승률", value: hero.winRate != null ? `${hero.winRate.toFixed(1)}%` : "-", color: "var(--color-success)" },
                { label: "밴률", value: hero.banRate != null ? `${hero.banRate}%` : "-", color: "var(--color-danger)" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-[11px] mb-0.5" style={{ color: "var(--text-sub)" }}>{stat.label}</p>
                  <p className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 왼쪽 컬럼 */}
        <div className="lg:col-span-2 space-y-4">
            {/* 추천 세팅 스탯 */}
          <section
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">추천 세팅 스탯</h2>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{ background: "rgba(59,130,246,0.15)", color: "var(--color-primary)" }}
              >
                유효 옵션 {validStats.length}개
              </span>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--color-border)" }}>
              {hero.stats.map((stat, i) => {
                const total = stat.buckets.reduce((s, b) => s + b.count, 0);
                const peakCount = Math.max(...stat.buckets.map((b) => b.count));
                const fillPct = total > 0 ? Math.round((peakCount / total) * 100) : 0;
                return (
                  <div
                    key={stat.key}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderTop: i > 0 ? "1px solid var(--color-border)" : undefined,
                      background: stat.isValid ? "rgba(59,130,246,0.06)" : "var(--bg-card)",
                    }}
                  >
                    {stat.iconUrl && (
                      <Image src={stat.iconUrl} alt={stat.label} width={18} height={18} unoptimized />
                    )}
                    <span
                      className="text-sm font-semibold"
                      style={{ width: 64, flexShrink: 0, color: stat.isValid ? "var(--color-primary)" : "var(--text-sub)" }}
                    >
                      {stat.label}
                    </span>
                    <div className="flex-1 rounded-full h-1.5" style={{ background: "var(--color-border)" }}>
                      <div
                        className="rounded-full h-1.5 transition-all"
                        style={{
                          width: `${fillPct}%`,
                          background: stat.isValid ? "var(--color-primary)" : "var(--text-sub)",
                        }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold"
                      style={{ width: 72, textAlign: "right", flexShrink: 0, color: stat.isValid ? "var(--color-primary)" : "var(--text-sub)" }}
                    >
                      {stat.recommendedRange}
                    </span>
                    {stat.isValid && (
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: "rgba(59,130,246,0.15)", color: "var(--color-primary)" }}
                      >
                        추천
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 주요 장비 세트 */}
          <section
            className="rounded-xl p-5"
            style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
          >
            <h2 className="text-base font-bold mb-4">주요 착용 세트</h2>
            <div className="space-y-3">
              {hero.gearSets.map((gs, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs w-4" style={{ color: "var(--text-sub)" }}>{i + 1}</span>
                  <div className="flex gap-2 flex-1 flex-wrap">
                    {gs.sets.map((s, j) => (
                      <div key={j} className="flex items-center gap-1.5">
                        {gs.setImgs?.[j] && (
                          <Image src={gs.setImgs[j]} alt={s} width={24} height={24} unoptimized />
                        )}
                        <span
                          className="text-xs px-2 py-1 rounded-md font-medium"
                          style={{ background: "rgba(59,130,246,0.12)", color: "var(--color-primary)" }}
                        >
                          {s}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span style={{ color: "var(--text-sub)" }}>사용률</span>
                    <span style={{ color: "var(--text-base)" }}>{gs.useRate}%</span>
                    <StatBar value={gs.useRate} max={50} />
                    <span style={{ color: "var(--text-sub)" }}>승률</span>
                    <span style={{ color: gs.winRate >= 52 ? "var(--color-success)" : "var(--text-sub)" }}>
                      {gs.winRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 스킬 */}
          {hero.skills && hero.skills.length > 0 && (
            <section
              className="rounded-xl p-5"
              style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
            >
              <h2 className="text-base font-bold mb-4">스킬 정보</h2>
              <div className="space-y-3">
                {hero.skills.map((skill, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border)" }}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          background: i === hero.skills!.length - 1 ? "rgba(234,179,8,0.15)" : "rgba(255,255,255,0.08)",
                          color: i === hero.skills!.length - 1 ? "#eab308" : "var(--text-sub)",
                        }}
                      >
                        {i === 0 ? "일반" : i === hero.skills!.length - 1 ? "궁극기" : `스킬 ${i}`}
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "var(--text-base)" }}>{skill.name}</span>
                      {skill.cooldown && (
                        <span className="text-[10px] ml-auto" style={{ color: "var(--text-sub)" }}>
                          쿨타임 {skill.cooldown}턴
                        </span>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-sub)" }}>{skill.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* 오른쪽 컬럼 */}
        <div className="space-y-4">
          {/* 함께 쓰면 좋은 영웅 */}
          <section
            className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid rgba(59,130,246,0.2)" }}
          >
            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--color-primary)" }}>
              ⚡ 함께 쓰면 좋은 영웅
            </h2>
            {hero.synergy.map((s, i) => (
              <Link key={s.code} href={`/heroes/${s.code}`}>
                <div className="flex items-center gap-2 mb-2 last:mb-0 hover:opacity-80 transition-opacity">
                  <span className="text-xs w-4 text-right" style={{ color: "var(--text-sub)" }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.15)" }}>
                    <Image src={heroImageUrl(s.code)} alt={s.name} fill className="object-cover object-top" unoptimized />
                  </div>
                  <span className="text-sm flex-1 truncate" style={{ color: "var(--text-base)" }}>{s.name}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--color-primary)" }}>
                    {s.rate.toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </section>

          {/* 상대하기 어려운 영웅 */}
          <section
            className="rounded-xl p-4"
            style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.2)" }}
          >
            <h2 className="text-sm font-bold mb-3" style={{ color: "var(--color-danger)" }}>
              🛡️ 상대하기 어려운 영웅
            </h2>
            {hero.counter.map((c, i) => (
              <Link key={c.code} href={`/heroes/${c.code}`}>
                <div className="flex items-center gap-2 mb-2 last:mb-0 hover:opacity-80 transition-opacity">
                  <span className="text-xs w-4 text-right" style={{ color: "var(--text-sub)" }}>{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg overflow-hidden relative flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.15)" }}>
                    <Image src={heroImageUrl(c.code)} alt={c.name} fill className="object-cover object-top" unoptimized />
                  </div>
                  <span className="text-sm flex-1 truncate" style={{ color: "var(--text-base)" }}>{c.name}</span>
                  <span className="text-xs font-medium" style={{ color: "var(--color-danger)" }}>
                    {c.winRate.toFixed(1)}%
                  </span>
                </div>
              </Link>
            ))}
          </section>

          {/* 실레나 서포터 바로가기 */}
          <Link href="/rta">
            <div
              className="rounded-xl p-4 cursor-pointer hover:opacity-90 transition-opacity"
              style={{
                background: "linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))",
                border: "1px solid rgba(59,130,246,0.3)",
              }}
            >
              <p className="text-xs font-semibold mb-1" style={{ color: "var(--color-primary)" }}>
                ⚔️ 실레나에서 이 영웅으로 픽해보기
              </p>
              <p className="text-xs" style={{ color: "var(--text-sub)" }}>
                실레나 서포터에서 {hero.name}을 활용한 드래프트를 시뮬레이션해보세요.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
