export default function Footer() {
  return (
    <footer
      className="border-t mt-auto py-8 px-4"
      style={{ background: "var(--bg-card)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-7xl mx-auto text-center space-y-2">
        <p className="font-semibold" style={{ color: "var(--color-primary)" }}>Epic Sense</p>
        <p className="text-xs" style={{ color: "var(--text-sub)" }}>
          This is a fan site and is not affiliated with Smilegate.
        </p>
        <p className="text-xs" style={{ color: "var(--text-sub)" }}>
          © 2026 Epic Sense. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
