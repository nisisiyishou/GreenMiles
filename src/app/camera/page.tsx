"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";

/**
 * Air Quality Visualization Page
 * - Opens rear camera with AR overlay
 * - Shows PM2.5, CO2, and wind data
 * - Natural particle visualization
 * - Ultra-minimal transparent UI for mobile
 */

type EnvResp = {
  pm25: number | null;
  co2_ppm: number | null;
  wind_speed?: number | null;
  wind_deg?: number | null;
};

export default function CameraPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fogCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);
  const [co2, setCo2] = useState<number | null>(null);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [windDeg, setWindDeg] = useState<number | null>(null);
  const [busyRoad, setBusyRoad] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  
  // UI visibility states (same as tree app)
  const [uiHidden, setUiHidden] = useState(false);
  const [uiOpacity, setUiOpacity] = useState(1);
  const hideTimer = useRef<number | null>(null);

  // Long press to hide UI
  const handleMouseDown = useCallback(() => {
    hideTimer.current = window.setTimeout(() => setUiHidden(true), 600);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setUiHidden(false);
  }, []);

  // Auto-fade UI after inactivity
  useEffect(() => {
    let t: number | null = null;
    const bump = () => {
      setUiOpacity(1);
      if (t) clearTimeout(t);
      t = window.setTimeout(() => setUiOpacity(0.18), 3000);
    };
    const el = document;
    const events = ["mousemove", "mousedown", "touchstart", "keydown"];
    events.forEach(e => el.addEventListener(e, bump as any, { passive: true } as any));
    bump();
    return () => {
      if (t) clearTimeout(t);
      events.forEach(e => el.removeEventListener(e, bump as any));
    };
  }, []);

  // Open camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          await videoRef.current.play().catch(() => {});
        }
      } catch (e: any) {
        setErr(`Camera error: ${e?.message || e}`);
      }
    })();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  // Get geolocation
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setErr("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (e) => setErr(`Location error: ${e.message}`),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
    );
  }, []);

  // Simulate API call (replace with real API)
  useEffect(() => {
    let mounted = true;
    if (!coords) return;

    const load = async () => {
      try {
        setLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulated data (replace with real API call)
        if (!mounted) return;
        setPm25(12.5 + Math.random() * 20);
        setCo2(400 + Math.random() * 200 + (busyRoad ? 100 : 0));
        setWindSpeed(2 + Math.random() * 5);
        setWindDeg(Math.random() * 360);
        setErr(null);
      } catch (e: any) {
        if (mounted) setErr(`Data error: ${e?.message || e}`);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 30000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [coords, busyRoad]);

  // Color mapping functions
  function mapPM25(pm: number | null) {
    if (pm == null) return { tint: "#BFC6CC", score: 0.0, label: "—" };
    if (pm <= 12)   return { tint: "#DDE7F0", score: 0.12, label: "Good" };
    if (pm <= 35)   return { tint: "#BBD4E8", score: 0.35, label: "Moderate" };
    if (pm <= 55)   return { tint: "#F4D06F", score: 0.60, label: "Sensitive" };
    if (pm <= 150)  return { tint: "#E59D5A", score: 0.78, label: "Unhealthy" };
    return              { tint: "#D16B6B", score: 0.90, label: "Very Unhealthy" };
  }
  
  function mapCO2(co2: number | null) {
    if (co2 == null) return { tint: "#BFC6CC", score: 0.0, label: "—" };
    if (co2 <= 500)  return { tint: "#DDE7F0", score: 0.12, label: "Good" };
    if (co2 <= 700)  return { tint: "#BBD4E8", score: 0.35, label: "Moderate" };
    if (co2 <= 1000) return { tint: "#F4D06F", score: 0.60, label: "Sensitive" };
    return               { tint: "#D16B6B", score: 0.85, label: "Unhealthy" };
  }

  function combineAir(pm: number | null, co2: number | null) {
    const a = mapPM25(pm);
    const b = mapCO2(co2);
    const worst = a.score >= b.score ? a : b;
    const alpha = 0.25 + worst.score * 0.5;
    return { tint: worst.tint, alpha, pm: a, co2: b };
  }

  function hexToRgb(hex: string) {
    const h = hex.replace("#", "");
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function toWindVector(deg: number | null, speed: number | null) {
    if (deg == null || speed == null) return { dir: { x: 0.3, y: 0.1 }, speedPxPerSec: 15 };
    const rad = ((deg + 180) * Math.PI) / 180;
    const x = Math.sin(rad);
    const y = Math.cos(rad);
    const speedPxPerSec = 15 + Math.min(8, Math.max(0, speed)) * 15;
    return { dir: { x, y }, speedPxPerSec };
  }

  const combo = useMemo(() => combineAir(pm25, co2), [pm25, co2]);
  const windVec = useMemo(() => toWindVector(windDeg, windSpeed), [windDeg, windSpeed]);

  // Animate fog canvas
  useEffect(() => {
    const canvas = fogCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement as HTMLElement | null;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement as Element);
    
    const qualityScore = combo.pm.score >= combo.co2.score ? combo.pm.score : combo.co2.score;
    const mode = qualityScore >= 0.35 ? "leaf" : "mist";
    
    const NUM = mode === "mist" ? 160 : 120;
    const particles = Array.from({ length: NUM }, () => {
      const sizeMax = 8 + combo.pm.score * 6 + combo.co2.score * 6;
      const baseSize = mode === "mist" 
        ? 3 + Math.random() * (4 + qualityScore * 3)
        : 4 + Math.random() * sizeMax;
        
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: baseSize,
        vx: 0,
        vy: 0,
        seed: Math.random() * 1000,
        alpha: mode === "mist" 
          ? 0.15 + Math.random() * 0.2 * (1 + qualityScore)
          : 0.2 + Math.random() * 0.25 * (1 + qualityScore),
      };
    });
    
    const tintRGB = hexToRgb(combo.tint);

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const time = performance.now();
      const { width: W, height: H } = canvas;

      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, W, H);

      const pxPerFrame = (windVec.speedPxPerSec / 60) || 0;
      const dir = windVec.dir;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const t = time / 1000;
        
        const wobbleFactor = 0.2 * (1 + qualityScore * 0.5);
        const wobbleX = wobbleFactor * Math.sin(t * 0.5 + p.seed);
        const wobbleY = wobbleFactor * 0.5 * Math.cos(t * 0.7 + p.seed * 0.8);
        
        p.vx = dir.x * pxPerFrame + wobbleX;
        p.vy = dir.y * pxPerFrame + wobbleY;
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -p.r * 2) p.x = W + p.r;
        if (p.x > W + p.r * 2) p.x = -p.r;
        if (p.y < -p.r * 2) p.y = H + p.r;
        if (p.y > H + p.r * 2) p.y = -p.r;
        
        if (mode === "leaf") {
          const tilt = Math.atan2(dir.y, dir.x);
          const breath = 0.85 + 0.15 * Math.sin(t + p.seed);
          const rx = p.r * 1.3 * breath;
          const ry = p.r * 0.4;
          
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(tilt);
          ctx.beginPath();
          
          const particleAlpha = Math.min(0.65, p.alpha * combo.alpha * 0.8);
          ctx.fillStyle = `rgba(${tintRGB.r},${tintRGB.g},${tintRGB.b},${particleAlpha})`;
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI*2);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.beginPath();
          const particleAlpha = Math.min(0.55, p.alpha * combo.alpha * 0.7);
          ctx.fillStyle = `rgba(${tintRGB.r},${tintRGB.g},${tintRGB.b},${particleAlpha})`;
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [combo.tint, combo.alpha, combo.pm.score, combo.co2.score, windVec.dir.x, windVec.dir.y, windVec.speedPxPerSec]);

  // Export photo
  const takePhoto = () => {
    const v = videoRef.current;
    const fog = fogCanvasRef.current;
    const c = exportCanvasRef.current;
    if (!v || !fog || !c) return;

    const vw = v.videoWidth || 1280;
    const vh = v.videoHeight || 720;
    c.width = vw; c.height = vh;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, vw, vh);
    ctx.globalAlpha = 1;
    ctx.drawImage(fog, 0, 0, vw, vh);

    const gradient = ctx.createLinearGradient(16, 16, 16, 180);
    gradient.addColorStop(0, 'rgba(0,0,0,0.85)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.65)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(16, 16, 380, 160, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,255,136,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, 16, 380, 160, 12);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px system-ui";
    ctx.fillText("🌬️ Air Quality Report", 32, 48);
    
    ctx.font = "14px system-ui";
    ctx.fillStyle = "#00FF88";
    ctx.fillText(`PM2.5: ${pm25?.toFixed(1) || "—"} μg/m³`, 32, 78);
    
    ctx.fillStyle = "#88DDFF";
    ctx.fillText(`CO₂: ${co2 ? Math.round(co2) : "—"} ppm`, 32, 103);
    
    ctx.fillStyle = "#FFD700";
    if (typeof windSpeed === "number" && typeof windDeg === "number") {
      ctx.fillText(`Wind: ${windSpeed.toFixed(1)} m/s @ ${Math.round(windDeg)}°`, 32, 128);
    }
    
    ctx.fillStyle = "#aaa";
    ctx.fillText(`Location: ${coords?.lat.toFixed(4)}, ${coords?.lon.toFixed(4)}`, 32, 153);

    const url = c.toDataURL("image/jpeg", 0.92);
    const a = document.createElement("a");
    a.href = url;
    a.download = `air_${Date.now()}.jpg`;
    a.click();
  };

  const getQualityEmoji = (score: number): string => {
    if (score < 0.2) return '😊';
    if (score < 0.4) return '🙂';
    if (score < 0.6) return '😐';
    if (score < 0.8) return '😷';
    return '☠️';
  };

  const pm25Status = useMemo(() => mapPM25(pm25), [pm25]);
  const co2Status = useMemo(() => mapCO2(co2), [co2]);
  const overallScore = Math.max(pm25Status.score, co2Status.score);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full h-screen max-w-[500px] overflow-hidden bg-[#111]">
        {/* Camera video */}
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {/* Fog canvas overlay */}
        <canvas ref={fogCanvasRef} className="absolute inset-0 pointer-events-none z-10" />

        {/* Top status bar - ultra minimal */}
        <div className="absolute top-4 left-4 right-4 z-20 bg-white/10 backdrop-blur-[2px] rounded-full px-4 py-2 border border-white/10"
             style={{ opacity: uiHidden ? 0 : uiOpacity }}>
          <div className="flex items-center justify-between text-white/75 text-xs font-medium">
            <span>{getQualityEmoji(overallScore)} Air Quality</span>
            <span>PM2.5: {pm25?.toFixed(1) || "—"} | CO₂: {co2 ? Math.round(co2) : "—"}</span>
          </div>
        </div>

        {/* Main data card - ultra minimal glass */}
        {!loading && !err && (
          <div 
            className="absolute top-16 right-4 w-[260px] rounded-2xl p-3 bg-white/10 backdrop-blur-[2px] hover:bg-white/10 hover:backdrop-blur-[4px] border border-white/20 text-white/95 transition-all"
            style={{
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              opacity: uiHidden ? 0 : uiOpacity
            }}
          >
            <h2 className="text-lg font-bold text-white/85 mb-3 flex items-center gap-2" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
              🌬️ Air Monitor
            </h2>
            
            <div className="space-y-2">
              {/* PM2.5 */}
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">PM2.5</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                    {pm25Status.label}
                  </span>
                </div>
                <div className="text-xl font-bold text-white/85" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                  {pm25?.toFixed(1) || "—"}
                  <span className="text-xs font-normal text-white/50 ml-1">μg/m³</span>
                </div>
              </div>
              
              {/* CO2 */}
              <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/60">CO₂</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                    {co2Status.label}
                  </span>
                </div>
                <div className="text-xl font-bold text-white/85" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                  {co2 ? Math.round(co2) : "—"}
                  <span className="text-xs font-normal text-white/50 ml-1">ppm</span>
                </div>
              </div>
              
              {/* Wind */}
              {(windSpeed !== null || windDeg !== null) && (
                <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                  <div className="text-xs text-white/60 mb-0.5">Wind</div>
                  <div className="text-sm font-medium text-white/75">
                    {windSpeed?.toFixed(1) || "—"} m/s @ {windDeg ? Math.round(windDeg) : "—"}°
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Bottom controls - ultra minimal */}
        <div 
          className="absolute left-4 bottom-4 z-20 rounded-2xl border px-4 py-3
                     bg-white/10 hover:bg-white/10 backdrop-blur-[2px] hover:backdrop-blur-[4px]
                     border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all"
          style={{ opacity: uiHidden ? 0 : uiOpacity }}
        >
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => setUiHidden(v => !v)}
              className="px-2.5 py-1.5 rounded-full text-xs border border-white/20 text-white/70 hover:bg-white/10"
            >
              {uiHidden ? "Show" : "👁️"}
            </button>
            
            <button 
              onClick={takePhoto}
              disabled={loading || !!err}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all
                         border border-cyan-300/60 text-cyan-200 hover:bg-cyan-400/10 disabled:opacity-50"
            >
              📸 Photo
            </button>
            
            <button 
              onClick={() => location.reload()}
              className="px-3 py-2 rounded-full text-sm border border-white/20 text-white/70 bg-transparent hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
          
          {/* Settings */}
          <div className="flex items-center gap-2 text-white/70 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={busyRoad}
                onChange={(e) => setBusyRoad(e.target.checked)}
                className="w-4 h-4 rounded accent-cyan-300 opacity-60"
              />
              <span style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>Busy road (+CO₂)</span>
            </label>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            <div className="bg-black/60 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-5 h-5 rounded-full border-2 border-t-cyan-300 border-r-cyan-300 border-b-transparent border-l-transparent animate-spin"></div>
                <span className="text-sm">Loading air data...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error display */}
        {err && (
          <div className="absolute top-4 left-4 right-4 bg-red-900/80 text-white p-3 rounded-lg z-30">
            {err}
          </div>
        )}
        
        {/* Touch area for long press to hide UI */}
        <div 
          className="absolute inset-0 z-[5]"
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchEnd={handleMouseUp}
          onTouchCancel={handleMouseUp}
          style={{ pointerEvents: loading || err ? 'none' : 'auto' }}
        />
      </div>

      {/* Hidden export canvas */}
      <canvas ref={exportCanvasRef} style={{ display: "none" }} />
    </div>
  );
}