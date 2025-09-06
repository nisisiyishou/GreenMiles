// app/api/env/route.ts
import { NextRequest, NextResponse } from "next/server";

// GET /api/env?lat=...&lon=...[&busy=1]
// - Returns: { pm25, co2_ppm, wind_speed, wind_deg }
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  const busy = req.nextUrl.searchParams.get("busy") === "1"; // optional: user toggles "busy road"

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
  }

  // Prefer environment variable; fallback to a hardcoded key for hackathon (NOT for production)
  const key = process.env.OW_KEY || "c338d0cdc271992d36cf16df7c70adf4";

  // OpenWeather endpoints
  const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
  const wxUrl  = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;

  try {
    // Fetch air quality and weather concurrently (no-store = always fresh)
    const [airRes, wxRes] = await Promise.all([
      fetch(airUrl, { cache: "no-store" }),
      fetch(wxUrl,  { cache: "no-store" }),
    ]);

    if (!airRes.ok || !wxRes.ok) {
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const air = await airRes.json();
    const wx  = await wxRes.json();

    // Extract PM2.5 and wind
    const pm25: number | null = air?.list?.[0]?.components?.pm2_5 ?? null;
    const windSpeed: number | null = wx?.wind?.speed ?? null; // m/s
    const windDeg:   number | null = wx?.wind?.deg ?? null;

    // Simple outdoor CO2 estimate (MVP-friendly).
    // Background ~420 ppm; add up to +100 when wind < 2 m/s; +80 if "busy road".
    let co2 = 420;
    if (typeof windSpeed === "number") {
      co2 += Math.max(0, 2 - Math.min(windSpeed, 2)) * 50; // wind 0→+100, wind>=2→+0
    }
    if (busy) co2 += 80; // optional user flag
    co2 = Math.min(Math.round(co2), 1100);

    return NextResponse.json({
      pm25,
      co2_ppm: co2,
      wind_speed: windSpeed,
      wind_deg: windDeg,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal fetch error" }, { status: 500 });
  }
}
