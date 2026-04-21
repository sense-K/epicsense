"use client";

import { useState, useEffect } from "react";

const ADMIN_PW = "epicsense2025";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("gear-admin") === "1") setUnlocked(true);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PW) {
      sessionStorage.setItem("gear-admin", "1");
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "var(--bg-card)", border: "1px solid var(--color-border)" }}
      >
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔒</div>
          <h2 className="text-lg font-bold mb-1">관리자 전용 페이지</h2>
          <p className="text-sm" style={{ color: "var(--text-sub)" }}>
            비밀번호를 입력하세요
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(false); }}
            placeholder="비밀번호"
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
            style={{
              background: "var(--bg-main)",
              color: "var(--text-base)",
              border: `1px solid ${error ? "#ef4444" : "var(--color-border)"}`,
            }}
          />
          {error && (
            <p className="text-xs" style={{ color: "#ef4444" }}>비밀번호가 틀렸어요</p>
          )}
          <button
            type="submit"
            className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--color-primary)" }}
          >
            확인
          </button>
        </form>
      </div>
    </div>
  );
}
