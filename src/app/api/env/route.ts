// app/api/env/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/env?lat=...&lon=...
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  // Hard-coded API key (ok for testing, unsafe for production)
  const key = "c338d0cdc271992d36cf16df7c70adf4";

  const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch from OpenWeather" }, { status: res.status });
    }

    const data = await res.json();
    const pm25 = data?.list?.[0]?.components?.pm2_5 ?? null;

    return NextResponse.json({ pm25 });
  } catch (err) {
    return NextResponse.json({ error: "Internal fetch error" }, { status: 500 });
  }
}
