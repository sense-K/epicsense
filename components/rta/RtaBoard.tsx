"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { heroImageUrl } from "@/lib/heroImage";
import {
  MOCK_HEROES,
  ELEMENT_LABEL,
  ELEMENT_IMG,
  CLASS_LABEL,
  CLASS_IMG,
  ELEMENT_COLOR,
  ELEMENT_BG,
  type Hero,
  type Element,
  type HeroClass,
} from "./mockHeroes";
import type { NormalizedHero } from "@/lib/normalizeHeroes";

// 픽 순서: true = 내 턴, false = 상대 턴
const PICK_ORDER = {
  first: [true, false, false, true, true, false, false, true, true, false],
  second: [false, true, true, false, false, true, true, false, false, true],
};

const PRE_BAN_OPTIONS = [1, 2, 3, 4];
const SEASON_OPTIONS = ["S25 (현재)", "S24", "S23"];
const GRADE_OPTIONS = ["챔피언", "그랜드마스터", "마스터"];

// 시너지/카운터 목업
const MOCK_SYNERGY = ["비브리스", "설화", "린", "타마린느", "아리에스타"];
const MOCK_COUNTER = ["세레아", "임페리우스", "드리젤", "카이로스", "라그나르"];

function HeroAvatar({ hero, size = 56 }: { hero: Hero; size?: number }) {
  const iconSize = Math.round(size * 0.32);
  const starSize = Math.round(size * 0.25);
  const starMargin = Math.round(starSize * -0.3);
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full overflow-hidden w-full h-full relative"
        style={{
          background: ELEMENT_BG[hero.element],
          border: `2px solid ${ELEMENT_COLOR[hero.element]}`,
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
      {/* 좌상단: 직업 */}
      <div className="absolute -top-1 -left-1 rounded-full overflow-hidden" style={{ width: iconSize, height: iconSize, background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.2)" }}>
        <Image src={CLASS_IMG[hero.heroClass]} alt="" width={iconSize} height={iconSize} unoptimized />
      </div>
      {/* 우상단: 속성 */}
      <div className="absolute -top-1 -right-1 rounded-full overflow-hidden" style={{ width: iconSize, height: iconSize, background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.2)" }}>
        <Image src={ELEMENT_IMG[hero.element]} alt="" width={iconSize} height={iconSize} unoptimized />
      </div>
      {/* 하단 중앙: 별 등급 */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center" style={{ bottom: Math.round(size * -0.05) }}>
        {Array.from({ length: hero.stars }).map((_, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src="/icons/star/star1.svg" alt="" width={starSize} height={starSize} style={{ marginRight: i < hero.stars - 1 ? starMargin : 0 }} />
        ))}
      </div>
    </div>
  );
}

function PickSlot({
  hero,
  pickNum,
  isActive,
  isMine,
  isEmpty,
}: {
  hero: Hero | null;
  pickNum: number;
  isActive: boolean;
  isMine: boolean;
  isEmpty: boolean;
}) {
  const activeColor = isMine ? "var(--color-primary)" : "var(--color-danger)";

  return (
    <div
      className="rounded-xl p-2 flex flex-col items-center gap-1.5 transition-all"
      style={{
        background: isActive
          ? isMine
            ? "rgba(59,130,246,0.1)"
            : "rgba(239,68,68,0.1)"
          : "var(--bg-card)",
        border: `2px solid ${
          isActive ? activeColor : hero ? (isMine ? "rgba(59,130,246,0.3)" : "rgba(239,68,68,0.3)") : "var(--color-border)"
        }`,
        animation: isActive ? "pulse-border 1.5s infinite" : undefined,
      }}
    >
      <span className="text-[10px]" style={{ color: isActive ? activeColor : "var(--text-sub)" }}>
        {pickNum}픽
      </span>
      {hero ? (
        <>
          <HeroAvatar hero={hero} size={48} />
          <span className="text-[10px] font-medium text-center leading-tight" style={{ color: "var(--text-base)" }}>
            {hero.name}
          </span>
          {hero.pickRate && (
            <span className="text-[9px]" style={{ color: "var(--text-sub)" }}>
              {hero.pickRate}%
            </span>
          )}
        </>
      ) : (
        <div
          className="rounded-lg flex items-center justify-center"
          style={{
            width: 48,
            height: 48,
            background: isActive ? (isMine ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)") : "rgba(255,255,255,0.04)",
            border: `1.5px dashed ${isActive ? activeColor : "var(--color-border)"}`,
          }}
        >
          {isActive && (
            <span style={{ color: activeColor, fontSize: 18 }}>+</span>
          )}
        </div>
      )}
    </div>
  );
}

// NormalizedHero → mockHeroes의 Hero 타입으로 변환
function toHero(h: NormalizedHero): Hero {
  return {
    code: h.code,
    name: h.name,
    element: h.element,
    heroClass: h.heroClass,
    stars: h.stars,
    pickRate: h.pickRate,
  };
}

export default function RtaBoard({ heroes: heroesFromServer = [] }: { heroes?: NormalizedHero[] }) {
  // 실제 데이터 있으면 사용, 없으면 목업 폴백
  const allHeroes: Hero[] = heroesFromServer.length > 0
    ? heroesFromServer.map(toHero)
    : MOCK_HEROES;

  const [isFirstPick, setIsFirstPick] = useState(true);
  const [preBans, setPreBans] = useState(1);
  const [season, setSeason] = useState(SEASON_OPTIONS[0]);
  const [grade, setGrade] = useState(GRADE_OPTIONS[0]);
  const [currentTurn, setCurrentTurn] = useState(0); // 0-indexed
  const [myPicks, setMyPicks] = useState<(Hero | null)[]>(Array(5).fill(null));
  const [oppPicks, setOppPicks] = useState<(Hero | null)[]>(Array(5).fill(null));
  const [usedCodes, setUsedCodes] = useState<Set<string>>(new Set());
  const [filterElement, setFilterElement] = useState<Element | "all">("all");
  const [filterClass, setFilterClass] = useState<HeroClass | "all">("all");

  const pickOrder = isFirstPick ? PICK_ORDER.first : PICK_ORDER.second;
  const isMyTurn = currentTurn < 10 ? pickOrder[currentTurn] : null;

  const myPickIndices = pickOrder
    .map((isMine, i) => ({ isMine, turn: i }))
    .filter((x) => x.isMine)
    .map((x) => x.turn + 1); // 1-indexed pick nums

  const oppPickIndices = pickOrder
    .map((isMine, i) => ({ isMine, turn: i }))
    .filter((x) => !x.isMine)
    .map((x) => x.turn + 1);

  const filteredHeroes = useMemo(() => {
    return allHeroes.filter((h) => {
      if (filterElement !== "all" && h.element !== filterElement) return false;
      if (filterClass !== "all" && h.heroClass !== filterClass) return false;
      return true;
    });
  }, [filterElement, filterClass, allHeroes]);

  function handleHeroPick(hero: Hero) {
    if (usedCodes.has(hero.code)) return;
    if (currentTurn >= 10) return;

    const newUsed = new Set(usedCodes);
    newUsed.add(hero.code);
    setUsedCodes(newUsed);

    if (pickOrder[currentTurn]) {
      const idx = myPicks.findIndex((p) => p === null);
      if (idx !== -1) {
        const newPicks = [...myPicks];
        newPicks[idx] = hero;
        setMyPicks(newPicks);
      }
    } else {
      const idx = oppPicks.findIndex((p) => p === null);
      if (idx !== -1) {
        const newPicks = [...oppPicks];
        newPicks[idx] = hero;
        setOppPicks(newPicks);
      }
    }
    setCurrentTurn(currentTurn + 1);
  }

  function handleReset() {
    setCurrentTurn(0);
    setMyPicks(Array(5).fill(null));
    setOppPicks(Array(5).fill(null));
    setUsedCodes(new Set());
  }

  function getMySlotPickNum(slotIdx: number) {
    const myTurns = pickOrder
      .map((isMine, i) => ({ isMine, turn: i }))
      .filter((x) => x.isMine);
    return myTurns[slotIdx] ? myTurns[slotIdx].turn + 1 : slotIdx * 2 + 1;
  }

  function getOppSlotPickNum(slotIdx: number) {
    const oppTurns = pickOrder
      .map((isMine, i) => ({ isMine, turn: i }))
      .filter((x) => !x.isMine);
    return oppTurns[slotIdx] ? oppTurns[slotIdx].turn + 1 : slotIdx * 2 + 2;
  }

  function getMyActiveSlot() {
    if (isMyTurn !== true) return -1;
    return myPicks.findIndex((p) => p === null);
  }

  function getOppActiveSlot() {
    if (isMyTurn !== false) return -1;
    return oppPicks.findIndex((p) => p === null);
  }

  const isDone = currentTurn >= 10;

  const turnLabel = isDone
    ? "드래프트 완료"
    : isMyTurn
    ? `${currentTurn + 1}픽 — 내 영웅을 선택하세요`
    : `${currentTurn + 1}픽 — 상대 영웅을 입력하세요`;

  const turnColor = isDone ? "var(--text-sub)" : isMyTurn ? "var(--color-primary)" : "var(--color-danger)";

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      {/* 설정 바 */}
      <div
        className="rounded-xl p-3 mb-3 flex flex-wrap gap-2 items-center"
        style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
      >
        {/* 픽 순서 */}
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
          {["선픽", "후픽"].map((label, i) => {
            const val = i === 0;
            return (
              <button
                key={label}
                onClick={() => { setIsFirstPick(val); handleReset(); }}
                className="px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  background: isFirstPick === val ? "var(--color-primary)" : "transparent",
                  color: isFirstPick === val ? "#fff" : "var(--text-sub)",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* 프리밴 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: "var(--text-sub)" }}>프리밴</span>
          <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--color-border)" }}>
            {PRE_BAN_OPTIONS.map((n) => (
              <button
                key={n}
                onClick={() => setPreBans(n)}
                className="w-8 py-1.5 text-sm transition-colors"
                style={{
                  background: preBans === n ? "var(--color-primary)" : "transparent",
                  color: preBans === n ? "#fff" : "var(--text-sub)",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 시즌 */}
        <select
          value={season}
          onChange={(e) => setSeason(e.target.value)}
          className="text-sm px-2 py-1.5 rounded-lg"
          style={{
            background: "var(--bg-main)",
            color: "var(--text-base)",
            border: "1px solid var(--color-border)",
          }}
        >
          {SEASON_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>

        {/* 등급 */}
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="text-sm px-2 py-1.5 rounded-lg"
          style={{
            background: "var(--bg-main)",
            color: "var(--text-base)",
            border: "1px solid var(--color-border)",
          }}
        >
          {GRADE_OPTIONS.map((g) => <option key={g}>{g}</option>)}
        </select>

        <button
          onClick={handleReset}
          className="ml-auto px-3 py-1.5 rounded-lg text-sm transition-colors hover:opacity-80"
          style={{ background: "rgba(100,116,139,0.2)", color: "var(--text-sub)" }}
        >
          전체 초기화
        </button>
      </div>

      {/* 턴 인디케이터 */}
      <div
        className="rounded-xl px-4 py-3 mb-3 flex items-center justify-center gap-2"
        style={{
          background: isDone ? "var(--bg-card)" : isMyTurn ? "rgba(59,130,246,0.08)" : "rgba(239,68,68,0.08)",
          border: `1px solid ${isDone ? "var(--color-border)" : isMyTurn ? "rgba(59,130,246,0.3)" : "rgba(239,68,68,0.3)"}`,
        }}
      >
        {!isDone && (
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: turnColor, animation: "pulse 1.5s infinite" }}
          />
        )}
        <span className="font-semibold text-sm" style={{ color: turnColor }}>
          {turnLabel}
        </span>
        {/* 픽 순서 미니 인디케이터 */}
        <div className="ml-4 hidden sm:flex gap-1">
          {pickOrder.map((isMine, i) => (
            <div
              key={i}
              className="w-5 h-5 rounded text-[9px] flex items-center justify-center font-bold"
              style={{
                background: i < currentTurn
                  ? "rgba(255,255,255,0.1)"
                  : i === currentTurn
                  ? isMine ? "var(--color-primary)" : "var(--color-danger)"
                  : "transparent",
                border: `1px solid ${
                  i === currentTurn
                    ? isMine ? "var(--color-primary)" : "var(--color-danger)"
                    : "var(--color-border)"
                }`,
                color: i < currentTurn ? "var(--text-sub)" : i === currentTurn ? "#fff" : "var(--text-sub)",
                opacity: i < currentTurn ? 0.4 : 1,
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* 메인 3열 */}
      <div className="flex gap-3">
        {/* 내 픽 패널 */}
        <div
          className="w-24 md:w-28 flex-shrink-0 rounded-xl p-2 flex flex-col gap-2"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(59,130,246,0.2)" }}
        >
          <div className="text-center">
            <span className="text-xs font-semibold" style={{ color: "var(--color-primary)" }}>내 픽</span>
          </div>
          {myPicks.map((hero, i) => {
            const pickNum = getMySlotPickNum(i);
            const isActive = getMyActiveSlot() === i;
            return (
              <PickSlot
                key={i}
                hero={hero}
                pickNum={pickNum}
                isActive={isActive}
                isMine={true}
                isEmpty={!hero}
              />
            );
          })}
        </div>

        {/* 중앙: 영웅 그리드 + 추천 */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* 필터 */}
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterElement("all")}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                background: filterElement === "all" ? "var(--color-primary)" : "var(--bg-card)",
                color: filterElement === "all" ? "#fff" : "var(--text-sub)",
                border: "1px solid var(--color-border)",
              }}
            >
              전체
            </button>
            {(Object.keys(ELEMENT_LABEL) as Element[]).map((el) => (
              <button
                key={el}
                onClick={() => setFilterElement(filterElement === el ? "all" : el)}
                className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
                style={{
                  background: filterElement === el ? ELEMENT_COLOR[el] : "var(--bg-card)",
                  color: filterElement === el ? "#fff" : ELEMENT_COLOR[el],
                  border: `1px solid ${filterElement === el ? ELEMENT_COLOR[el] : "var(--color-border)"}`,
                }}
              >
                {ELEMENT_LABEL[el]}
              </button>
            ))}
            <div className="w-px mx-1" style={{ background: "var(--color-border)" }} />
            {(Object.keys(CLASS_LABEL) as HeroClass[]).map((cls) => (
              <button
                key={cls}
                onClick={() => setFilterClass(filterClass === cls ? "all" : cls)}
                className="px-2.5 py-1 rounded-full text-xs transition-colors"
                style={{
                  background: filterClass === cls ? "rgba(255,255,255,0.15)" : "var(--bg-card)",
                  color: filterClass === cls ? "var(--text-base)" : "var(--text-sub)",
                  border: `1px solid ${filterClass === cls ? "rgba(255,255,255,0.3)" : "var(--color-border)"}`,
                }}
              >
                {CLASS_LABEL[cls]}
              </button>
            ))}
          </div>

          {/* 영웅 그리드 */}
          <div
            className="rounded-xl p-3"
            style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
          >
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
              {filteredHeroes.map((hero) => {
                const isUsed = usedCodes.has(hero.code);
                return (
                  <button
                    key={hero.code}
                    onClick={() => handleHeroPick(hero)}
                    disabled={isUsed || isDone}
                    className="rounded-xl overflow-hidden transition-all hover:scale-[1.03] hover:shadow-lg"
                    style={{
                      opacity: isUsed ? 0.3 : 1,
                      cursor: isUsed || isDone ? "not-allowed" : "pointer",
                      background: "var(--bg-main)",
                      border: `1px solid var(--color-border)`,
                    }}
                    title={hero.name}
                  >
                    <div className="pt-3 px-3 flex justify-center">
                      <div className="relative" style={{ width: 80, height: 80 }}>
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
                            className="object-cover object-top"
                            unoptimized
                          />
                        </div>
                        <div className="absolute -top-1 -left-1 w-6 h-6 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                          <Image src={CLASS_IMG[hero.heroClass]} alt="" width={24} height={24} unoptimized />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                          <Image src={ELEMENT_IMG[hero.element]} alt="" width={24} height={24} unoptimized />
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center" style={{ bottom: -4 }}>
                          {Array.from({ length: hero.stars }).map((_, i) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img key={i} src="/icons/star/star1.svg" alt="" width={20} height={19} style={{ marginRight: i < hero.stars - 1 ? -6 : 0 }} />
                          ))}
                        </div>
                      </div>
                    </div>
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* 추천 영역 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 시너지 */}
            <div
              className="rounded-xl p-3"
              style={{ background: "var(--bg-card)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              <h3 className="text-xs font-semibold mb-2.5" style={{ color: "var(--color-primary)" }}>
                ⚡ 함께 쓰면 좋은 영웅
              </h3>
              {MOCK_SYNERGY.map((name, i) => (
                <div key={name} className="flex items-center gap-2 mb-1.5 last:mb-0">
                  <span className="text-xs w-4 text-right" style={{ color: "var(--text-sub)" }}>{i + 1}</span>
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.15)", color: "var(--color-primary)" }}
                  >
                    {name.slice(0, 2)}
                  </div>
                  <span className="text-xs flex-1 truncate" style={{ color: "var(--text-base)" }}>{name}</span>
                  <span className="text-[10px]" style={{ color: "var(--color-primary)" }}>
                    {(45 - i * 6).toFixed(1)}%
                  </span>
                </div>
              ))}
              <p className="text-[9px] mt-2" style={{ color: "var(--text-sub)" }}>
                스마일게이트 공식 전적 · {grade} · {season}
              </p>
            </div>

            {/* 카운터 */}
            <div
              className="rounded-xl p-3"
              style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <h3 className="text-xs font-semibold mb-2.5" style={{ color: "var(--color-danger)" }}>
                🛡️ 카운터 추천
              </h3>
              {MOCK_COUNTER.map((name, i) => (
                <div key={name} className="flex items-center gap-2 mb-1.5 last:mb-0">
                  <span className="text-xs w-4 text-right" style={{ color: "var(--text-sub)" }}>{i + 1}</span>
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                    style={{ background: "rgba(239,68,68,0.15)", color: "var(--color-danger)" }}
                  >
                    {name.slice(0, 2)}
                  </div>
                  <span className="text-xs flex-1 truncate" style={{ color: "var(--text-base)" }}>{name}</span>
                  <span className="text-[10px]" style={{ color: "var(--color-danger)" }}>
                    {(62 - i * 4).toFixed(1)}%
                  </span>
                </div>
              ))}
              <p className="text-[9px] mt-2" style={{ color: "var(--text-sub)" }}>
                스마일게이트 공식 전적 · {grade} · {season}
              </p>
            </div>
          </div>
        </div>

        {/* 상대 픽 패널 */}
        <div
          className="w-24 md:w-28 flex-shrink-0 rounded-xl p-2 flex flex-col gap-2"
          style={{ background: "var(--bg-card)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <div className="text-center">
            <span className="text-xs font-semibold" style={{ color: "var(--color-danger)" }}>상대 픽</span>
          </div>
          {oppPicks.map((hero, i) => {
            const pickNum = getOppSlotPickNum(i);
            const isActive = getOppActiveSlot() === i;
            return (
              <PickSlot
                key={i}
                hero={hero}
                pickNum={pickNum}
                isActive={isActive}
                isMine={false}
                isEmpty={!hero}
              />
            );
          })}
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
