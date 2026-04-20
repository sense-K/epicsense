import Link from "next/link";

const features = [
  {
    icon: "⚔️",
    title: "실레나 서포터",
    desc: "실시간 아레나 드래프트 중 시너지·카운터 영웅을 바로 확인하세요.",
    href: "/rta",
    cta: "바로가기",
    soon: false,
  },
  {
    icon: "📖",
    title: "영웅 도감",
    desc: "전체 영웅의 장비 세팅, 추천 스탯 구간, 시너지 영웅을 한눈에.",
    href: "/heroes",
    cta: "바로가기",
    soon: false,
  },
  {
    icon: "🛡️",
    title: "장비 추천",
    desc: "획득한 장비의 옵션을 입력하면 최적의 영웅을 자동으로 추천.",
    href: "/gear-recommend",
    cta: "준비 중",
    soon: true,
  },
  {
    icon: "🔨",
    title: "장비 강화 서포터",
    desc: "현재 강화 수치 입력만으로 계속 강화할지 바로 판단해드려요.",
    href: "/gear-enhance",
    cta: "준비 중",
    soon: true,
  },
];

export default function HomePage() {
  return (
    <>
      {/* 히어로 섹션 */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            에픽세븐 유저를 위한
            <br />
            <span style={{ color: "var(--color-primary)" }}>게임 도구 플랫폼</span>
          </h1>
          <p className="text-lg mb-8" style={{ color: "var(--text-sub)" }}>
            실시간 아레나 픽 추천, 장비 세팅, 강화 서포터를 무료로 제공합니다.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/rta"
              className="px-6 py-3 rounded-lg font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--color-primary)" }}
            >
              실레나 서포터 바로가기
            </Link>
            <Link
              href="/heroes"
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{
                background: "var(--bg-card)",
                color: "var(--text-base)",
                border: "1px solid var(--color-border)",
              }}
            >
              영웅 도감 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 기능 카드 */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <div
              key={f.href}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              <span className="text-3xl">{f.icon}</span>
              <h2 className="font-bold text-base">{f.title}</h2>
              <p className="text-sm flex-1" style={{ color: "var(--text-sub)" }}>{f.desc}</p>
              {f.soon ? (
                <span
                  className="text-xs px-3 py-1.5 rounded-md w-fit"
                  style={{ background: "rgba(100,116,139,0.2)", color: "var(--text-sub)" }}
                >
                  {f.cta}
                </span>
              ) : (
                <Link
                  href={f.href}
                  className="text-sm px-3 py-1.5 rounded-md w-fit font-medium transition-opacity hover:opacity-80"
                  style={{ background: "rgba(59,130,246,0.15)", color: "var(--color-primary)" }}
                >
                  {f.cta} →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
