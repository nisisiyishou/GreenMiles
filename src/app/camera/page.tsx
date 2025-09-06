// app/camera/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";

type EnvResp = { pm25: number };

// Toggle: true = use backend proxy (/api/env), false = direct OpenWeather API
const USE_PROXY = true;
const PROXY_BASE = "/api"; // Example: /api/env?lat=..&lon=..
const OW_KEY = ""; // Only for demo, better hide in backend

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [pm25, setPm25] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Open device camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // prefer rear camera
          audio: false,
        });
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play();
        }
      } catch (e: any) {
        setErr(`Camera error: ${e?.message || e}`);
      }
    })();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // Get geolocation → fetch PM2.5 data
  useEffect(() => {
    let mounted = true;
    if (!("geolocation" in navigator)) {
      setErr("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          setLoading(true);
          const { latitude, longitude } = pos.coords;
          let value: number | null = null;

          if (USE_PROXY) {
            // Recommended: call your backend API
            const r = await fetch(`${PROXY_BASE}/env?lat=${latitude}&lon=${longitude}`, { cache: "no-store" });
            const j: EnvResp = await r.json();
            value = typeof j?.pm25 === "number" ? j.pm25 : null;
          } else {
            // Demo only: direct call to OpenWeather
            const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${OW_KEY}`;
            const r = await fetch(url);
            const j = await r.json();
            value = j?.list?.[0]?.components?.pm2_5 ?? null;
          }

          if (mounted) setPm25(value);
        } catch (e: any) {
          if (mounted) setErr(`PM2.5 fetch error: ${e?.message || e}`);
        } finally {
          if (mounted) setLoading(false);
        }
      },
      (e) => {
        setErr(`Geolocation error: ${e.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const { tint, alpha, label } = mapPM25(pm25);

  // Take snapshot: draw video + overlay to canvas, then download as JPEG
  const takePhoto = () => {
    const v = videoRef.current;
    const c = canvasRef.current;
    if (!v || !c) return;
    const w = v.videoWidth || 1280;
    const h = v.videoHeight || 720;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // Draw current video frame
    ctx.drawImage(v, 0, 0, w, h);

    // Draw fog overlay
    ctx.fillStyle = hexToRgba(tint, alpha);
    ctx.fillRect(0, 0, w, h);

    // Draw HUD box
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(16, 16, 320, 90);
    ctx.fillStyle = "#fff";
    ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText("Air Quality", 28, 42);
    ctx.font = "bold 20px system-ui, -apple-system, Segoe UI, Roboto";
    ctx.fillText(pm25 != null ? `PM2.5: ${pm25.toFixed(1)} μg/m³` : "PM2.5: —", 28, 70);

    // Trigger download
    const url = c.toDataURL("image/jpeg", 0.92);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pm_${Date.now()}.jpg`;
    a.click();
  };

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <video ref={videoRef} playsInline muted style={styles.video} />

        {/* Fog overlay */}
        <div
          style={{
            ...styles.fog,
            backgroundColor: hexToRgba(tint, alpha),
          }}
        />

        {/* HUD display */}
        <div style={styles.hud}>
          <div style={styles.hudTitle}>Air Quality</div>
          {loading ? (
            <div style={styles.hudText}>Loading…</div>
          ) : err ? (
            <div style={styles.hudText}>{err}</div>
          ) : (
            <>
              <div style={styles.hudValue}>
                PM2.5: {pm25 != null ? pm25.toFixed(1) : "—"} μg/m³
              </div>
              <span style={{ ...styles.badge, backgroundColor: tint }}>{label}</span>
            </>
          )}
        </div>

        {/* Bottom buttons */}
        <div style={styles.bottom}>
          <button style={styles.btn} onClick={takePhoto}>Take Photo</button>
          <button
            style={{ ...styles.btn, ...styles.ghost }}
            onClick={() => location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Hidden canvas for snapshot export */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

/* ==== Helpers ==== */

// Map PM2.5 to color/opacity/label
function mapPM25(pm: number | null) {
  if (pm == null) return { tint: "#555555", alpha: 0.15, label: "—" };
  if (pm <= 12)   return { tint: "#2ECC71", alpha: 0.10, label: "Good" };
  if (pm <= 35)   return { tint: "#B5CC34", alpha: 0.18, label: "Moderate" };
  if (pm <= 55)   return { tint: "#F1C40F", alpha: 0.25, label: "Unhealthy (Sensitive)" };
  if (pm <= 150)  return { tint: "#E67E22", alpha: 0.35, label: "Unhealthy" };
  return              { tint: "#E74C3C", alpha: 0.45, label: "Very Unhealthy" };
}

// Convert hex color to rgba string with alpha
function hexToRgba(hex: string, alpha = 0.3) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100dvh", background: "#000", color: "#fff", display: "grid", placeItems: "center" },
  wrap: { position: "relative", width: "min(92vw, 960px)", aspectRatio: "16 / 9", background: "#111", borderRadius: 16, overflow: "hidden", border: "1px solid #222" },
  video: { width: "100%", height: "100%", objectFit: "cover" },
  fog: { position: "absolute", inset: 0 } as React.CSSProperties,
  hud: {
    position: "absolute", left: 16, right: 16, top: 16,
    background: "rgba(0,0,0,0.45)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 12, padding: 12
  },
  hudTitle: { fontSize: 16, fontWeight: 600, opacity: 0.95 },
  hudText: { fontSize: 14, opacity: 0.9 },
  hudValue: { fontSize: 18, fontWeight: 700, marginTop: 4 },
  badge: {
    display: "inline-block", marginTop: 8, padding: "4px 8px", borderRadius: 8,
    color: "#000", fontWeight: 700
  },
  bottom: { position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", gap: 12, justifyContent: "center" },
  btn: { background: "#16a34a", border: "none", color: "#fff", padding: "10px 16px", borderRadius: 999, fontWeight: 700, cursor: "pointer" },
  ghost: { background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.35)" }
};
