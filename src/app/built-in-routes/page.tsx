"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

// Great Routes Page for Next.js App Router (app/great-routes/page.tsx)
// - Mobile-first vertical layout
// - Lists built-in routes
// - Each route shows: name, estimated walking time, and a right-aligned Start button
// - Brand color: #63bf76
// - Tailwind CSS for styling

// Example routes — replace with real data from your API
const ROUTES = [
  {
    id: "river-greenway",
    name: "River Greenway",
    durationMinutes: 25,
    distanceKm: 2.4,
    aqiTag: "Good",
  },
  {
    id: "old-town-park-loop",
    name: "Old Town Park Loop",
    durationMinutes: 40,
    distanceKm: 3.8,
    aqiTag: "Great",
  },
  {
    id: "museum-to-garden",
    name: "Museum → Botanical Garden",
    durationMinutes: 55,
    distanceKm: 4.6,
    aqiTag: "Good",
  },
  {
    id: "hilltop-canopy-walk",
    name: "Hilltop Canopy Walk",
    durationMinutes: 80,
    distanceKm: 6.2,
    aqiTag: "Excellent",
  },
];

export default function GreatRoutesPage() {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...ROUTES].sort((a, b) => a.durationMinutes - b.durationMinutes),
    []
  );

  const handleStart = async (routeId: string) => {
    if (busyId) return;
    setBusyId(routeId);
    // Simulate pre-navigation setup (e.g., permissions, loading GPX/AR overlays)
    await new Promise((r) => setTimeout(r, 500));
    setBusyId(null);
    // Navigate to your navigation screen, pass the routeId via query
    router.push(`/navigate?routeId=${encodeURIComponent(routeId)}`);
  };

  return (
    <main className="mx-auto max-w-md p-4 pb-24 min-h-[100dvh] bg-white text-gray-900">
      {/* Header */}
      <header className="-mx-4 sticky top-0 z-10 border-b border-gray-100 bg-white/80 backdrop-blur p-4">
        <h1 className="text-2xl font-semibold">Great Routes</h1>
        <p className="mt-1 text-sm text-gray-500">Curated green routes with better air quality and scenery.</p>
      </header>

      {/* Routes list */}
      <section className="mt-3 space-y-3">
        {sorted.map((r) => (
          <article
            key={r.id}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 p-4 shadow-sm"
          >
            <div className="flex min-w-0 flex-1 flex-col">
              <h2 className="truncate text-base font-medium">{r.name}</h2>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {formatMinutes(r.durationMinutes)}
                </span>
                <span>•</span>
                <span className="tabular-nums">{r.distanceKm.toFixed(1)} km</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <AqiDot aqi={r.aqiTag} /> {r.aqiTag}
                </span>
              </div>
            </div>

            {/* Right-aligned Start button */}
            <button
              onClick={() => handleStart(r.id)}
              disabled={busyId === r.id}
              className={
                "ml-auto inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition " +
                (busyId === r.id
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-[#63bf76] text-white active:scale-[0.98]")
              }
            >
              {busyId === r.id ? "Starting…" : "Start"}
            </button>
          </article>
        ))}
      </section>

      {/* Footer spacing for safe area on mobile */}
      <div className="h-24" />
    </main>
  );
}

function formatMinutes(mins: number) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

function ClockIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className + " text-[#63bf76]"}
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function AqiDot({ aqi }: { aqi: string }) {
  const color =
    aqi === "Excellent"
      ? "bg-[#63bf76]"
      : aqi === "Great"
      ? "bg-[#63bf76]"
      : aqi === "Good"
      ? "bg-emerald-400"
      : "bg-gray-300";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} aria-hidden />;
}
