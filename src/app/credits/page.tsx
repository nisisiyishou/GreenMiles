"use client";

import React, { useMemo, useState } from "react";

// Points Page for Next.js App Router (app/points/page.tsx)
// - Mobile-first (vertical) layout
// - Shows current points
// - Lists rewards with required points and a right-aligned Redeem button
// - No external UI libs required; styled with Tailwind CSS

// Example reward catalog — replaced with different sapling types
const REWARDS = [
  {
    id: "oak-sapling",
    name: "Oak Sapling",
    cost: 300,
    description: "Redeem an oak tree sapling to be planted.",
  },
  {
    id: "maple-sapling",
    name: "Maple Sapling",
    cost: 500,
    description: "Redeem a maple tree sapling to be planted.",
  },
  {
    id: "cherry-sapling",
    name: "Cherry Blossom Sapling",
    cost: 800,
    description: "Redeem a cherry blossom sapling to be planted.",
  },
  {
    id: "pine-sapling",
    name: "Pine Sapling",
    cost: 1000,
    description: "Redeem a pine tree sapling to be planted.",
  },
];

export default function PointsPage() {
  // In a real app, fetch this from your API or user session
  const [points, setPoints] = useState<number>(700);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const sortedRewards = useMemo(
    () => [...REWARDS].sort((a, b) => a.cost - b.cost),
    []
  );

  const handleRedeem = async (rewardId: string, cost: number, name: string) => {
    if (busyId) return;
    if (points < cost) {
      setMessage("Not enough credits to redeem this.");
      return;
    }
    try {
      setBusyId(rewardId);
      // Simulate API call
      await new Promise((r) => setTimeout(r, 650));
      setPoints((p) => p - cost);
      setMessage(`Redeemed: ${name}! 🎉`);
    } catch (e) {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto max-w-md p-4 pb-24 min-h-[100dvh] bg-white text-gray-900">
      {/* Header / Balance */}
      <section className="sticky top-0 z-10 -mx-4 mb-3 bg-white/80 backdrop-blur border-b border-gray-100 p-4">
        <h1 className="text-2xl font-semibold">My Credits</h1>
        <div className="mt-2 flex items-end gap-2">
          <span className="text-4xl font-bold tabular-nums text-[#63bf76]">{points}</span>
          <span className="text-sm text-gray-500 mb-1">credits</span>
        </div>
        {/* Optional progress to next cheapest reward */}
        <NextGoal points={points} rewards={sortedRewards} />
      </section>

      {/* Notice / Toast (simple) */}
      {message && (
        <div
          role="status"
          className="mb-3 rounded-xl border border-[#63bf76]/30 bg-[#63bf76]/10 px-3 py-2 text-sm text-gray-800"
        >
          {message}
        </div>
      )}

      {/* Rewards List */}
      <section className="space-y-3">
        {sortedRewards.map((r) => {
          const affordable = points >= r.cost;
          const disabled = busyId === r.id || !affordable;
          return (
            <article
              key={r.id}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <h2 className="truncate text-base font-medium">{r.name}</h2>
                <p className="mt-0.5 text-sm text-gray-500 truncate">{r.description}</p>
                <div className="mt-2 text-sm">
                  <span className="font-semibold tabular-nums text-[#63bf76]">{r.cost}</span>
                  <span className="text-gray-500"> credits required</span>
                </div>
              </div>

              {/* Right-aligned Redeem button */}
              <button
                onClick={() => handleRedeem(r.id, r.cost, r.name)}
                disabled={disabled}
                className={
                  "ml-auto inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition " +
                  (disabled
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#63bf76] text-white active:scale-[0.98]")
                }
              >
                {busyId === r.id ? "Processing…" : affordable ? "Redeem" : "Not enough"}
              </button>
            </article>
          );
        })}
      </section>

      {/* Footer spacing for safe area on mobile */}
      <div className="h-24" />
    </main>
  );
}

function NextGoal({
  points,
  rewards,
}: {
  points: number;
  rewards: { id: string; name: string; cost: number }[];
}) {
  const next = rewards.find((r) => r.cost > points);
  if (!next) return null;
  const need = next.cost - points;
  const cheapest = rewards[0]?.cost ?? 1;
  const pct = Math.min(100, Math.max(0, Math.round((points / next.cost) * 100)));

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          Next goal: <span className="font-medium text-[#63bf76]">{next.name}</span>
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full bg-[#63bf76]"
          style={{ width: `${pct}%` }}
          aria-hidden
        />
      </div>
      <p className="mt-1 text-xs text-gray-500">
        You need <span className="font-medium text-[#63bf76] tabular-nums">{need}</span> more credits.
      </p>
    </div>
  );
}
