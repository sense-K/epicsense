"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Image from "next/image";
import { heroImageUrl } from "@/lib/heroImage";
import {
  MOCK_HEROES,
  ELEMENT_LABEL,
  ELEMENT_IMG,
  CLASS_IMG,
  ELEMENT_COLOR,
  ELEMENT_BG,
  type Hero,
  type Element,
  type HeroClass,
} from "./mockHeroes";
import type { NormalizedHero } from "@/lib/normalizeHeroes";
import { fetchPopularHeroes, type E7PopularHero } from "@/lib/e7api";

const PICK_ORDER = {
  first:  [true, false, false, true, true, false, false, true, true, false],
  second: [false, true, true, false, false, true, true, false, false, true],
};

const PRE_BAN_OPTIONS = [0, 1, 2, 3, 4];
const GRADE_OPTIONS: { label: string; code: string }[] = [
  { label: "레전드",  code: "legend" },
  { label: "엠페러",  code: "emperor" },
  { label: "워로드",  code: "warlord" },
  { label: "챔피언",  code: "champion" },
];

const C = {
  bg: "#f1f5fb",
  card: "#ffffff",
  cardAlt: "#f8fafc",
  border: "#dde5f0",
  myBlue: "#3b82f6",
  myBlueBg: "rgba(59,130,246,0.08)",
  oppRed: "#ef4444",
  oppRedBg: "rgba(239,68,68,0.07)",
  banRed: "#dc2626",
  text: "#1e293b",
  sub: "#64748b",
  subLight: "#94a3b8",
  yellow: "#d97706",
};

function useIsLandscape() {
  const [isLandscape, setIsLandscape] = useState(false);
  useEffect(() => {
    const check = () => setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 520);
    check();
    window.addEventListener("resize", check);
    window.screen?.orientation?.addEventListener?.("change", check);
    return () => {
      window.removeEventListener("resize", check);
      window.screen?.orientation?.removeEventListener?.("change", check);
    };
  }, []);
  return isLandscape;
}

// 인게임 스타일 픽 카드
function PickCard({ hero, pickNum, isActive, isMine, onRemove, compact = false }: {
  hero: Hero | null; pickNum: number; isActive: boolean; isMine: boolean; onRemove?: () => void; compact?: boolean;
}) {
  const accentColor = isMine ? C.myBlue : C.oppRed;
  const accentBg = isMine ? C.myBlueBg : C.oppRedBg;
  const h = compact ? 54 : 110;

  return (
    <div className="relative rounded-xl overflow-hidden flex-shrink-0 transition-all"
      style={{ width: "100%", height: h, cursor: hero ? "pointer" : "default" }}
      onClick={hero ? onRemove : undefined}
      title={hero ? "클릭하면 선택 해제" : undefined}>
      {hero ? (
        <>
          <div className="absolute inset-0" style={{ background: ELEMENT_BG[hero.element] }}>
            <Image src={heroImageUrl(hero.code)} alt={hero.name} fill className="object-cover object-top" unoptimized />
          </div>
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }} />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center group">
            <span className="text-white text-xl opacity-0 group-hover:opacity-100 transition-opacity font-bold">✕</span>
          </div>
          <div className="absolute top-1 left-1 rounded-md px-1 py-0.5"
            style={{ background: accentColor, fontSize: 8, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
            {pickNum}픽
          </div>
          {!compact && (
            <div className="absolute top-1 right-1 rounded-full overflow-hidden"
              style={{ width: 16, height: 16, background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <Image src={CLASS_IMG[hero.heroClass]} alt="" width={16} height={16} unoptimized />
            </div>
          )}
          {!compact && (
            <div className="absolute bottom-0 left-0 right-0 px-1 pb-1">
              <p className="text-white text-[9px] font-bold leading-tight truncate text-center">{hero.name}</p>
            </div>
          )}
          <div className="absolute top-0 bottom-0 left-0 w-0.5" style={{ background: ELEMENT_COLOR[hero.element] }} />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-0.5 rounded-xl"
          style={{ background: isActive ? accentBg : "rgba(255,255,255,0.03)", border: `1.5px dashed ${isActive ? accentColor : C.border}` }}>
          <span style={{ fontSize: 9, fontWeight: 600, color: isActive ? accentColor : C.subLight }}>{pickNum}픽</span>
          {isActive && <span style={{ color: accentColor, fontSize: 16, lineHeight: 1 }}>+</span>}
        </div>
      )}
    </div>
  );
}

// 밴 슬롯
function BanSlot({ hero, onRemove, size = 44 }: { hero: Hero | null; onRemove?: () => void; size?: number }) {
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      {hero ? (
        <div className="relative cursor-pointer group/ban w-full h-full" onClick={onRemove} title="밴 해제">
          <div className="w-full h-full rounded-full overflow-hidden"
            style={{ border: `2px solid ${C.banRed}`, background: ELEMENT_BG[hero.element] }}>
            <Image src={heroImageUrl(hero.code)} alt={hero.name} fill className="object-cover object-top grayscale" unoptimized />
          </div>
          <div className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{ background: "rgba(220,38,38,0.5)" }}>
            <span style={{ color: "#fff", fontSize: size * 0.28, fontWeight: 900 }}>✕</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-black/0 group-hover/ban:bg-black/40 transition-all" />
        </div>
      ) : (
        <div className="w-full h-full rounded-full"
          style={{ border: `1.5px dashed rgba(220,38,38,0.4)`, background: "rgba(220,38,38,0.06)" }} />
      )}
    </div>
  );
}

// 영웅 카드
function HeroCard({ hero, onClick, disabled, borderColor, size = 64 }: {
  hero: Hero; onClick: () => void; disabled?: boolean; borderColor?: string; size?: number;
}) {
  const iconSize = Math.round(size * 0.34);
  return (
    <button onClick={onClick} disabled={disabled}
      className="rounded-xl overflow-hidden transition-all hover:scale-[1.04] hover:shadow-xl w-full flex-shrink-0"
      style={{ cursor: disabled ? "not-allowed" : "pointer", background: C.cardAlt, border: `1px solid ${borderColor ?? C.border}` }}
      title={hero.name}>
      <div className="flex justify-center" style={{ paddingTop: 8, paddingLeft: 6, paddingRight: 6 }}>
        <div className="relative" style={{ width: size, height: size }}>
          <div className="relative overflow-hidden rounded-full w-full h-full"
            style={{ background: ELEMENT_BG[hero.element], border: `3px solid ${ELEMENT_COLOR[hero.element]}` }}>
            <Image src={heroImageUrl(hero.code)} alt={hero.name} fill className="object-cover object-top" unoptimized />
          </div>
          <div className="absolute -top-1 -left-1 rounded-full overflow-hidden"
            style={{ width: iconSize, height: iconSize, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Image src={CLASS_IMG[hero.heroClass]} alt="" width={iconSize} height={iconSize} unoptimized />
          </div>
          <div className="absolute -top-1 -right-1 rounded-full overflow-hidden"
            style={{ width: iconSize, height: iconSize, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
            <Image src={ELEMENT_IMG[hero.element]} alt="" width={iconSize} height={iconSize} unoptimized />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center" style={{ bottom: -3 }}>
            {Array.from({ length: hero.stars }).map((_, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src="/icons/star/star1.svg" alt="" width={Math.round(size * 0.25)} height={Math.round(size * 0.25)}
                style={{ marginRight: i < hero.stars - 1 ? Math.round(size * -0.07) : 0 }} />
            ))}
          </div>
        </div>
      </div>
      <div className="px-1 pb-1.5 pt-2 text-center">
        <p style={{ fontSize: size < 56 ? 9 : 10, fontWeight: 600, color: C.text, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {hero.name}
        </p>
      </div>
    </button>
  );
}

// 가로 스크롤 추천 줄 (landscape용)
function HorizRecsRow({ heroes, label, color, bgColor, borderColor, onPick, usedCodes, isDone }: {
  heroes: Hero[]; label: string; color: string; bgColor: string; borderColor: string;
  onPick: (h: Hero) => void; usedCodes: Set<string>; isDone: boolean;
}) {
  if (heroes.length === 0) return null;
  return (
    <div className="rounded-xl px-2 py-1.5" style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      <p className="text-[9px] font-bold mb-1" style={{ color }}>{label}</p>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
        {heroes.map((hero) => (
          <div key={hero.code} style={{ width: 48, flexShrink: 0 }}>
            <HeroCard hero={hero} onClick={() => onPick(hero)}
              disabled={usedCodes.has(hero.code) || isDone}
              borderColor={borderColor} size={40} />
          </div>
        ))}
      </div>
    </div>
  );
}

function toHero(h: NormalizedHero): Hero {
  return { code: h.code, name: h.name, element: h.element, heroClass: h.heroClass, stars: h.stars, pickRate: h.pickRate, banRate: h.banRate };
}

export default function RtaBoard({ heroes: heroesFromServer = [], popularData: initialPopularData = [], seasonCode = "" }: {
  heroes?: NormalizedHero[]; popularData?: E7PopularHero[]; seasonCode?: string;
}) {
  const allHeroes: Hero[] = heroesFromServer.length > 0 ? heroesFromServer.map(toHero) : MOCK_HEROES;
  const isLandscape = useIsLandscape();

  const [isFirstPick, setIsFirstPick] = useState(true);
  const [preBans, setPreBans] = useState(1);
  const [grade, setGrade] = useState("champion");
  const [popularData, setPopularData] = useState<E7PopularHero[]>(initialPopularData);
  const [gradeLoading, setGradeLoading] = useState(false);
  const gradeCache = useState(() => new Map<string, E7PopularHero[]>())[0];

  const [bans, setBans] = useState<Hero[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [myPicks, setMyPicks] = useState<(Hero | null)[]>(Array(5).fill(null));
  const [oppPicks, setOppPicks] = useState<(Hero | null)[]>(Array(5).fill(null));
  const [usedCodes, setUsedCodes] = useState<Set<string>>(new Set());
  const [filterElements, setFilterElements] = useState<Set<Element>>(new Set());
  const [filterClasses, setFilterClasses] = useState<Set<HeroClass>>(new Set());

  const inBanPhase = bans.length < preBans;

  const matchupMap = useMemo(() => {
    const map = new Map<string, { with: string[]; hard: string[] }>();
    popularData.forEach((h) => map.set(h.hero_code, { with: h.with_heroes, hard: h.hard_heroes }));
    return map;
  }, [popularData]);

  const pickOrder = isFirstPick ? PICK_ORDER.first : PICK_ORDER.second;
  const isMyTurn = currentTurn < 10 ? pickOrder[currentTurn] : null;
  const isDone = !inBanPhase && currentTurn >= 10;

  const getRecommendations = useCallback((picks: (Hero | null)[], type: "with" | "hard"): Hero[] => {
    const scoreMap = new Map<string, number>();
    picks.filter(Boolean).forEach((hero) => {
      const matchup = matchupMap.get(hero!.code);
      if (!matchup) return;
      matchup[type].forEach((code, idx) => {
        scoreMap.set(code, (scoreMap.get(code) ?? 0) + (matchup[type].length - idx));
      });
    });
    return Array.from(scoreMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .filter(([code]) => !usedCodes.has(code))
      .slice(0, 5)
      .map(([code]) => allHeroes.find((h) => h.code === code))
      .filter(Boolean) as Hero[];
  }, [matchupMap, usedCodes, allHeroes]);

  const synergyHeroes = useMemo(() => getRecommendations(myPicks, "with"), [getRecommendations, myPicks]);
  const counterHeroes = useMemo(() => getRecommendations(oppPicks, "hard"), [getRecommendations, oppPicks]);

  const firstPickRecs = useMemo(() => {
    const withCount = new Map<string, number>();
    popularData.forEach((h) => { h.with_heroes.forEach((code) => { withCount.set(code, (withCount.get(code) ?? 0) + 1); }); });
    return [...allHeroes].filter((h) => (withCount.get(h.code) ?? 0) > 0)
      .sort((a, b) => (withCount.get(b.code) ?? 0) - (withCount.get(a.code) ?? 0))
      .slice(0, 20).filter((h) => !usedCodes.has(h.code)).slice(0, 5);
  }, [allHeroes, popularData, usedCodes]);

  const banRecs = useMemo(() => {
    const hardCount = new Map<string, number>();
    popularData.forEach((h) => { h.hard_heroes.forEach((code) => { hardCount.set(code, (hardCount.get(code) ?? 0) + 1); }); });
    return [...allHeroes].filter((h) => (hardCount.get(h.code) ?? 0) > 0)
      .sort((a, b) => (hardCount.get(b.code) ?? 0) - (hardCount.get(a.code) ?? 0))
      .slice(0, 20).filter((h) => !usedCodes.has(h.code)).slice(0, 5);
  }, [allHeroes, popularData, usedCodes]);

  const filteredHeroes = useMemo(() => allHeroes.filter((h) => {
    if (usedCodes.has(h.code)) return false;
    if (filterElements.size > 0 && !filterElements.has(h.element)) return false;
    if (filterClasses.size > 0 && !filterClasses.has(h.heroClass)) return false;
    return true;
  }), [filterElements, filterClasses, allHeroes, usedCodes]);

  function handleHeroPick(hero: Hero) {
    if (usedCodes.has(hero.code)) return;
    const newUsed = new Set(usedCodes); newUsed.add(hero.code); setUsedCodes(newUsed);
    if (inBanPhase) { setBans((prev) => [...prev, hero]); return; }
    if (currentTurn >= 10) return;
    if (pickOrder[currentTurn]) {
      const idx = myPicks.findIndex((p) => p === null);
      if (idx !== -1) { const n = [...myPicks]; n[idx] = hero; setMyPicks(n); }
    } else {
      const idx = oppPicks.findIndex((p) => p === null);
      if (idx !== -1) { const n = [...oppPicks]; n[idx] = hero; setOppPicks(n); }
    }
    setCurrentTurn(currentTurn + 1);
  }

  function handleHeroRemove(hero: Hero, isMine: boolean) {
    const picks = isMine ? myPicks : oppPicks;
    const setPicks = isMine ? setMyPicks : setOppPicks;
    const idx = picks.findIndex((p) => p?.code === hero.code);
    if (idx === -1) return;
    const newPicks = [...picks]; newPicks[idx] = null; setPicks(newPicks);
    const newUsed = new Set(usedCodes); newUsed.delete(hero.code); setUsedCodes(newUsed);
    const nm = isMine ? newPicks : myPicks; const no = isMine ? oppPicks : newPicks;
    setCurrentTurn([...nm, ...no].filter(Boolean).length);
  }

  function handleBanRemove(hero: Hero) {
    setBans((prev) => prev.filter((b) => b.code !== hero.code));
    const newUsed = new Set(usedCodes); newUsed.delete(hero.code); setUsedCodes(newUsed);
  }

  function handleReset() {
    setCurrentTurn(0); setMyPicks(Array(5).fill(null)); setOppPicks(Array(5).fill(null));
    setBans([]); setUsedCodes(new Set());
  }

  async function handleGradeChange(gradeCode: string) {
    setGrade(gradeCode);
    if (!seasonCode) return;
    if (gradeCache.has(gradeCode)) { setPopularData(gradeCache.get(gradeCode)!); return; }
    setGradeLoading(true);
    try {
      const data = await fetchPopularHeroes(seasonCode, gradeCode);
      gradeCache.set(gradeCode, data);
      setPopularData(data);
    } catch { } finally { setGradeLoading(false); }
  }

  function toggleElement(el: Element) {
    setFilterElements((prev) => { const next = new Set(prev); next.has(el) ? next.delete(el) : next.add(el); return next; });
  }
  function toggleClass(cls: HeroClass) {
    setFilterClasses((prev) => { const next = new Set(prev); next.has(cls) ? next.delete(cls) : next.add(cls); return next; });
  }

  function getMySlotPickNum(i: number) {
    const t = pickOrder.map((m, j) => ({ m, j })).filter((x) => x.m);
    return (t[i]?.j ?? (i * 2)) + 1;
  }
  function getOppSlotPickNum(i: number) {
    const t = pickOrder.map((m, j) => ({ m, j })).filter((x) => !x.m);
    return (t[i]?.j ?? (i * 2 + 1)) + 1;
  }

  const turnLabel = isDone ? "드래프트 완료"
    : inBanPhase ? `밴 ${bans.length + 1}/${preBans}`
    : isMyTurn ? `${currentTurn + 1}픽 — 내 픽` : `${currentTurn + 1}픽 — 상대 픽`;
  const turnColor = isDone ? C.sub : inBanPhase ? C.banRed : isMyTurn ? C.myBlue : C.oppRed;

  const ELEMENTS = Object.keys(ELEMENT_IMG) as Element[];
  const CLASSES = Object.keys(CLASS_IMG) as HeroClass[];

  const showBanRec = inBanPhase && preBans > 0 && banRecs.length > 0;
  const showFirstPickRec = isFirstPick && !inBanPhase && currentTurn === 0 && firstPickRecs.length > 0;

  // ──────────────────────────────────────────────
  // 모바일 가로 모드 레이아웃
  // ──────────────────────────────────────────────
  if (isLandscape) {
    return (
      <div style={{ background: C.bg, height: "100dvh", display: "flex", flexDirection: "column", overflow: "hidden", padding: "4px 6px" }}>

        {/* 상단 바 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "4px 10px", marginBottom: 4, flexShrink: 0 }}>
          {/* 선/후픽 */}
          <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {["선픽", "후픽"].map((label, i) => (
              <button key={label} onClick={() => { setIsFirstPick(i === 0); handleReset(); }}
                style={{ padding: "2px 10px", fontSize: 11, fontWeight: 700, background: isFirstPick === (i === 0) ? C.myBlue : "transparent", color: isFirstPick === (i === 0) ? "#fff" : C.sub }}>
                {label}
              </button>
            ))}
          </div>
          {/* 프리밴 */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10, color: C.sub }}>밴</span>
            <div style={{ display: "flex", borderRadius: 8, overflow: "hidden", border: `1px solid ${C.border}` }}>
              {PRE_BAN_OPTIONS.map((n) => (
                <button key={n} onClick={() => { setPreBans(n); handleReset(); }}
                  style={{ width: 24, padding: "2px 0", fontSize: 11, fontWeight: 700, background: preBans === n ? C.myBlue : "transparent", color: preBans === n ? "#fff" : C.sub }}>
                  {n}
                </button>
              ))}
            </div>
          </div>
          {/* 등급 */}
          <div style={{ position: "relative" }}>
            <select value={grade} onChange={(e) => handleGradeChange(e.target.value)} disabled={gradeLoading}
              style={{ fontSize: 11, padding: "2px 6px", borderRadius: 6, background: C.cardAlt, color: gradeLoading ? C.subLight : C.text, border: `1px solid ${C.border}` }}>
              {GRADE_OPTIONS.map((g) => <option key={g.code} value={g.code}>{g.label}</option>)}
            </select>
          </div>
          {/* 턴 표시 */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5 }}>
            {!isDone && <span style={{ width: 6, height: 6, borderRadius: "50%", background: turnColor, display: "inline-block", animation: "pulse 1.5s infinite" }} />}
            <span style={{ fontSize: 11, fontWeight: 700, color: turnColor }}>{turnLabel}</span>
          </div>
          {/* 초기화 */}
          <button onClick={handleReset} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: C.cardAlt, color: C.sub, border: `1px solid ${C.border}` }}>초기화</button>
        </div>

        {/* 메인: [내 픽] [센터] [상대 픽] */}
        <div style={{ display: "flex", gap: 6, flex: 1, minHeight: 0 }}>

          {/* 내 픽 */}
          <div style={{ width: 58, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.myBlue, textAlign: "center" }}>내 픽</span>
            {myPicks.map((hero, i) => (
              <PickCard key={i} hero={hero} pickNum={getMySlotPickNum(i)}
                isActive={!inBanPhase && isMyTurn === true && myPicks.findIndex((p) => p === null) === i}
                isMine={true} compact={true}
                onRemove={hero ? () => handleHeroRemove(hero, true) : undefined} />
            ))}
          </div>

          {/* 센터 */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4, overflow: "hidden" }}>

            {/* 밴 추천 or 선픽 추천 */}
            {showBanRec && (
              <HorizRecsRow heroes={banRecs} label="🚫 밴 추천"
                color="#f87171" bgColor="rgba(220,38,38,0.1)" borderColor="rgba(220,38,38,0.35)"
                onPick={handleHeroPick} usedCodes={usedCodes} isDone={isDone} />
            )}
            {showFirstPickRec && (
              <HorizRecsRow heroes={firstPickRecs} label="⭐ 선픽 추천"
                color={C.yellow} bgColor="rgba(245,158,11,0.1)" borderColor="rgba(245,158,11,0.3)"
                onPick={handleHeroPick} usedCodes={usedCodes} isDone={isDone} />
            )}

            {/* 필터 */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "4px 8px", flexShrink: 0, overflowX: "auto", scrollbarWidth: "none" }}>
              <button onClick={() => { setFilterElements(new Set()); setFilterClasses(new Set()); }}
                style={{ padding: "1px 8px", borderRadius: 999, fontSize: 10, fontWeight: 700, flexShrink: 0,
                  background: filterElements.size === 0 && filterClasses.size === 0 ? C.myBlue : "transparent",
                  color: filterElements.size === 0 && filterClasses.size === 0 ? "#fff" : C.sub,
                  border: `1px solid ${filterElements.size === 0 && filterClasses.size === 0 ? C.myBlue : C.border}` }}>
                전체
              </button>
              <div style={{ width: 1, height: 16, background: C.border, flexShrink: 0 }} />
              {ELEMENTS.map((el) => {
                const active = filterElements.has(el);
                return (
                  <button key={el} onClick={() => toggleElement(el)} title={ELEMENT_LABEL[el]}
                    style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? ELEMENT_COLOR[el] + "30" : "transparent",
                      border: `2px solid ${active ? ELEMENT_COLOR[el] : C.border}`,
                      transform: active ? "scale(1.1)" : "scale(1)" }}>
                    <Image src={ELEMENT_IMG[el]} alt={ELEMENT_LABEL[el]} width={14} height={14} unoptimized />
                  </button>
                );
              })}
              <div style={{ width: 1, height: 16, background: C.border, flexShrink: 0 }} />
              {CLASSES.map((cls) => {
                const active = filterClasses.has(cls);
                return (
                  <button key={cls} onClick={() => toggleClass(cls)} title={cls}
                    style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                      background: active ? "#fff" : "transparent",
                      border: `2px solid ${active ? "#fff" : C.border}`,
                      transform: active ? "scale(1.1)" : "scale(1)" }}>
                    <Image src={CLASS_IMG[cls]} alt={cls} width={14} height={14} unoptimized
                      style={{ filter: active ? "none" : "brightness(0.7)" }} />
                  </button>
                );
              })}
            </div>

            {/* 영웅 그리드 */}
            <div style={{ flex: 1, minHeight: 0, background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 6, overflowY: "auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(60px, 1fr))", gap: 6 }}>
                {filteredHeroes.map((hero) => (
                  <HeroCard key={hero.code} hero={hero} onClick={() => handleHeroPick(hero)} disabled={isDone} size={48} />
                ))}
              </div>
            </div>

            {/* 추천 (가로 스크롤) */}
            {!inBanPhase && (synergyHeroes.length > 0 || counterHeroes.length > 0) && (
              <div style={{ display: "flex", flexDirection: "column", gap: 3, flexShrink: 0 }}>
                <HorizRecsRow heroes={synergyHeroes} label="⚡ 시너지"
                  color={C.myBlue} bgColor="rgba(59,130,246,0.12)" borderColor="rgba(59,130,246,0.3)"
                  onPick={handleHeroPick} usedCodes={usedCodes} isDone={isDone} />
                <HorizRecsRow heroes={counterHeroes} label="🛡️ 카운터"
                  color={C.oppRed} bgColor="rgba(239,68,68,0.1)" borderColor="rgba(239,68,68,0.3)"
                  onPick={handleHeroPick} usedCodes={usedCodes} isDone={isDone} />
              </div>
            )}

            {/* 밴 슬롯 */}
            {preBans > 0 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexShrink: 0, padding: "2px 0" }}>
                <span style={{ fontSize: 9, color: C.subLight }}>밴 영웅</span>
                {Array.from({ length: preBans }).map((_, i) => (
                  <BanSlot key={i} hero={bans[i] ?? null} size={32}
                    onRemove={bans[i] ? () => handleBanRemove(bans[i]) : undefined} />
                ))}
              </div>
            )}
          </div>

          {/* 상대 픽 */}
          <div style={{ width: 58, flexShrink: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: C.oppRed, textAlign: "center" }}>상대 픽</span>
            {oppPicks.map((hero, i) => (
              <PickCard key={i} hero={hero} pickNum={getOppSlotPickNum(i)}
                isActive={!inBanPhase && isMyTurn === false && oppPicks.findIndex((p) => p === null) === i}
                isMine={false} compact={true}
                onRemove={hero ? () => handleHeroRemove(hero, false) : undefined} />
            ))}
          </div>
        </div>

        <style jsx global>{`
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        `}</style>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 데스크탑 / 모바일 세로 레이아웃
  // ──────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-3 py-4" style={{ background: C.bg, minHeight: "100vh" }}>

      {/* 턴 인디케이터 */}
      <div className="rounded-2xl px-4 py-2.5 mb-3 flex items-center justify-center gap-2.5"
        style={{
          background: isDone ? C.card : inBanPhase ? "rgba(220,38,38,0.15)" : isMyTurn ? "rgba(59,130,246,0.15)" : "rgba(248,113,113,0.15)",
          border: `1px solid ${isDone ? C.border : inBanPhase ? "rgba(220,38,38,0.4)" : isMyTurn ? "rgba(59,130,246,0.5)" : "rgba(248,113,113,0.5)"}`,
        }}>
        {!isDone && <span className="inline-block w-2 h-2 rounded-full" style={{ background: turnColor, animation: "pulse 1.5s infinite" }} />}
        <span className="font-bold text-sm" style={{ color: turnColor }}>
          {isDone ? "드래프트 완료" : inBanPhase ? `밴 ${bans.length + 1}/${preBans} — 밴할 영웅 선택` : isMyTurn ? `${currentTurn + 1}픽 — 내 영웅 선택` : `${currentTurn + 1}픽 — 상대 영웅 입력`}
        </span>
        {!inBanPhase && (
          <div className="ml-4 hidden sm:flex gap-1">
            {pickOrder.map((isMine, i) => (
              <div key={i} className="w-5 h-5 rounded-md text-[9px] flex items-center justify-center font-bold"
                style={{
                  background: i < currentTurn ? "rgba(255,255,255,0.06)" : i === currentTurn ? (isMine ? C.myBlue : C.oppRed) : "transparent",
                  border: `1px solid ${i === currentTurn ? (isMine ? C.myBlue : C.oppRed) : C.border}`,
                  color: i < currentTurn ? C.subLight : i === currentTurn ? "#fff" : C.sub,
                  opacity: i < currentTurn ? 0.4 : 1,
                }}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 설정 바 */}
      <div className="rounded-2xl p-3 mb-3 flex flex-wrap gap-2 items-center"
        style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          {["선픽", "후픽"].map((label, i) => {
            const val = i === 0;
            return (
              <button key={label} onClick={() => { setIsFirstPick(val); handleReset(); }}
                className="px-4 py-1.5 text-sm font-semibold transition-all"
                style={{ background: isFirstPick === val ? C.myBlue : "transparent", color: isFirstPick === val ? "#fff" : C.sub }}>
                {label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium" style={{ color: C.sub }}>밴 영웅</span>
          <div className="flex rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            {PRE_BAN_OPTIONS.map((n) => (
              <button key={n} onClick={() => { setPreBans(n); handleReset(); }}
                className="w-8 py-1.5 text-sm font-semibold transition-all"
                style={{ background: preBans === n ? C.myBlue : "transparent", color: preBans === n ? "#fff" : C.sub }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <select value={grade} onChange={(e) => handleGradeChange(e.target.value)} disabled={gradeLoading}
            className="text-sm px-3 py-1.5 rounded-xl"
            style={{ background: C.cardAlt, color: gradeLoading ? C.subLight : C.text, border: `1px solid ${C.border}` }}>
            {GRADE_OPTIONS.map((g) => <option key={g.code} value={g.code}>{g.label}</option>)}
          </select>
          {gradeLoading && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs animate-spin" style={{ color: C.myBlue }}>⟳</span>}
        </div>

        <button onClick={handleReset} className="ml-auto px-3 py-1.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{ background: C.cardAlt, color: C.sub, border: `1px solid ${C.border}` }}>
          초기화
        </button>
      </div>

      {/* 메인 3열 */}
      <div className="flex gap-3">
        {/* 내 픽 */}
        <div className="w-24 md:w-28 flex-shrink-0 flex flex-col gap-1.5">
          <div className="text-center mb-0.5"><span className="text-xs font-bold" style={{ color: C.myBlue }}>내 픽</span></div>
          {myPicks.map((hero, i) => (
            <PickCard key={i} hero={hero} pickNum={getMySlotPickNum(i)}
              isActive={!inBanPhase && isMyTurn === true && myPicks.findIndex((p) => p === null) === i}
              isMine={true} onRemove={hero ? () => handleHeroRemove(hero, true) : undefined} />
          ))}
        </div>

        {/* 센터 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2.5">

          {/* 밴 슬롯 */}
          {preBans > 0 && (
            <div className="flex items-center gap-3 rounded-2xl px-4 py-2.5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
              <span className="text-xs font-medium flex-shrink-0" style={{ color: C.subLight }}>밴 영웅</span>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: preBans }).map((_, i) => (
                  <BanSlot key={i} hero={bans[i] ?? null} onRemove={bans[i] ? () => handleBanRemove(bans[i]) : undefined} />
                ))}
              </div>
            </div>
          )}

          {/* 밴 추천 */}
          {showBanRec && (
            <div className="rounded-2xl p-3" style={{ background: "rgba(220,38,38,0.1)", border: `1px solid rgba(220,38,38,0.35)` }}>
              <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: "#f87171" }}>🚫 밴 추천</h3>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
                {banRecs.map((hero) => <HeroCard key={hero.code} hero={hero} onClick={() => handleHeroPick(hero)} disabled={isDone} borderColor="rgba(220,38,38,0.4)" />)}
              </div>
            </div>
          )}

          {/* 선픽 추천 */}
          {showFirstPickRec && (
            <div className="rounded-2xl p-3" style={{ background: "rgba(245,158,11,0.1)", border: `1px solid rgba(245,158,11,0.3)` }}>
              <h3 className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: C.yellow }}>⭐ 선픽 추천</h3>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
                {firstPickRecs.map((hero) => <HeroCard key={hero.code} hero={hero} onClick={() => handleHeroPick(hero)} disabled={isDone} borderColor="rgba(245,158,11,0.4)" />)}
              </div>
            </div>
          )}

          {/* 필터 */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl px-3 py-2" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <button onClick={() => { setFilterElements(new Set()); setFilterClasses(new Set()); }}
              className="px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
              style={{ background: filterElements.size === 0 && filterClasses.size === 0 ? C.myBlue : "transparent", color: filterElements.size === 0 && filterClasses.size === 0 ? "#fff" : C.sub, border: `1px solid ${filterElements.size === 0 && filterClasses.size === 0 ? C.myBlue : C.border}` }}>
              전체
            </button>
            <div className="w-px h-5 mx-0.5" style={{ background: C.border }} />
            {ELEMENTS.map((el) => { const active = filterElements.has(el); return (
              <button key={el} onClick={() => toggleElement(el)} title={ELEMENT_LABEL[el]}
                className="transition-all rounded-full flex items-center justify-center"
                style={{ width: 32, height: 32, background: active ? ELEMENT_COLOR[el] + "30" : "transparent", border: `2px solid ${active ? ELEMENT_COLOR[el] : C.border}`, transform: active ? "scale(1.1)" : "scale(1)" }}>
                <Image src={ELEMENT_IMG[el]} alt={ELEMENT_LABEL[el]} width={18} height={18} unoptimized />
              </button>
            ); })}
            <div className="w-px h-5 mx-0.5" style={{ background: C.border }} />
            {CLASSES.map((cls) => { const active = filterClasses.has(cls); return (
              <button key={cls} onClick={() => toggleClass(cls)} title={cls}
                className="transition-all rounded-full flex items-center justify-center"
                style={{ width: 32, height: 32, background: active ? "#fff" : "transparent", border: `2px solid ${active ? "#fff" : C.border}`, transform: active ? "scale(1.1)" : "scale(1)" }}>
                <Image src={CLASS_IMG[cls]} alt={cls} width={18} height={18} unoptimized style={{ filter: active ? "none" : "brightness(0.7)" }} />
              </button>
            ); })}
          </div>

          {/* 영웅 그리드 */}
          <div className="rounded-2xl p-3 overflow-y-auto" style={{ background: C.card, border: `1px solid ${C.border}`, maxHeight: 280 }}>
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
              {filteredHeroes.map((hero) => <HeroCard key={hero.code} hero={hero} onClick={() => handleHeroPick(hero)} disabled={isDone} />)}
            </div>
          </div>

          {/* 추천 */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-2xl p-3" style={{ background: "rgba(59,130,246,0.12)", border: `1px solid rgba(59,130,246,0.3)` }}>
              <h3 className="text-xs font-bold mb-2" style={{ color: C.myBlue }}>⚡ 시너지 추천</h3>
              {synergyHeroes.length === 0 ? <p className="text-[11px] py-1" style={{ color: C.subLight }}>내 픽에서 영웅을 선택하면 표시돼요</p> : (
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
                  {synergyHeroes.map((hero) => <HeroCard key={hero.code} hero={hero} onClick={() => handleHeroPick(hero)} disabled={usedCodes.has(hero.code) || isDone} borderColor="rgba(59,130,246,0.35)" />)}
                </div>
              )}
            </div>
            <div className="rounded-2xl p-3" style={{ background: "rgba(239,68,68,0.1)", border: `1px solid rgba(239,68,68,0.3)` }}>
              <h3 className="text-xs font-bold mb-2" style={{ color: C.oppRed }}>🛡️ 카운터 추천</h3>
              {counterHeroes.length === 0 ? <p className="text-[11px] py-1" style={{ color: C.subLight }}>상대 픽에서 영웅을 선택하면 표시돼요</p> : (
                <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(84px, 1fr))" }}>
                  {counterHeroes.map((hero) => <HeroCard key={hero.code} hero={hero} onClick={() => handleHeroPick(hero)} disabled={usedCodes.has(hero.code) || isDone} borderColor="rgba(239,68,68,0.35)" />)}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* 상대 픽 */}
        <div className="w-24 md:w-28 flex-shrink-0 flex flex-col gap-1.5">
          <div className="text-center mb-0.5"><span className="text-xs font-bold" style={{ color: C.oppRed }}>상대 픽</span></div>
          {oppPicks.map((hero, i) => (
            <PickCard key={i} hero={hero} pickNum={getOppSlotPickNum(i)}
              isActive={!inBanPhase && isMyTurn === false && oppPicks.findIndex((p) => p === null) === i}
              isMine={false} onRemove={hero ? () => handleHeroRemove(hero, false) : undefined} />
          ))}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      `}</style>
    </div>
  );
}
