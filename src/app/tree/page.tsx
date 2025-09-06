"use client";

import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";

/**
 * Tree Measurement Page
 * - Measure tree DBH (Diameter at Breast Height) using camera
 * - Calculate CO2 absorption and O2 production
 * - Visual overlay with measurement tools
 */

export type SpeciesPreset = "generic" | "broadleaf" | "conifer" | "fast";

export type EstimateResult = {
  dbh_cm: number;
  co2_g_day_min: number;
  co2_g_day_max: number;
  o2_g_day_min: number;
  o2_g_day_max: number;
  co2_kg_year_min: number;
  co2_kg_year_max: number;
  o2_kg_year_min: number;
  o2_kg_year_max: number;
  inputs: {
    distance_cm: number;
    hFOV_deg: number;
    species: SpeciesPreset;
    lightFactor: number;
  };
};

export default function TreeMeasurePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  
  const [active, setActive] = useState(false);
  const [points, setPoints] = useState<{x:number;y:number}[]>([]);
  const [distanceCm, setDistanceCm] = useState(200);
  const [hFOVdeg, setHFOVdeg] = useState(63);
  const [species, setSpecies] = useState<SpeciesPreset>("generic");
  const [lightFactor, setLightFactor] = useState(1.0);
  const [estimate, setEstimate] = useState<EstimateResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  
  // UI visibility states
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

  // Helper functions for FOV
  function applyFovPreset(p: number) { 
    const v = Math.max(45, Math.min(90, p));
    setHFOVdeg(v);
  }

  function suggestFovByAspect() {
    const v = videoRef.current;
    if (!v) { applyFovPreset(63); return; }
    const rect = v.getBoundingClientRect();
    const aspect = rect.width / Math.max(1, rect.height);
    const guess = aspect > 1.9 ? 65 : aspect > 1.7 ? 63 : 60;
    applyFovPreset(guess);
  }

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

  // Repaint measurement line and UI
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const parent = c.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    c.width = rect.width;
    c.height = rect.height;

    ctx.clearRect(0, 0, c.width, c.height);

    // Measurement guide
    if (active) {
      // Semi-transparent overlay
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.fillRect(0, 0, c.width, c.height);
      
      // Clear area for measurement
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(c.width/4, c.height/3, c.width/2, c.height/3);
      ctx.globalCompositeOperation = "source-over";
      
      // Instruction text
      const gradient = ctx.createLinearGradient(0, 40, 0, 100);
      gradient.addColorStop(0, 'rgba(0,0,0,0.8)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 40, c.width, 60);
      
      ctx.fillStyle = "#fff";
      ctx.font = "16px system-ui";
      ctx.textAlign = "center";
      if (points.length === 0) {
        ctx.fillText("📏 Tap the LEFT edge of the tree trunk at chest height", c.width/2, 70);
      } else if (points.length === 1) {
        ctx.fillText("📏 Now tap the RIGHT edge of the tree trunk", c.width/2, 70);
      } else {
        ctx.fillText("✅ Measurement complete! Tap 'Calculate' to see results", c.width/2, 70);
      }
      ctx.textAlign = "left";
    }

    // Draw measurement line
    if (points.length >= 1) {
      ctx.fillStyle = "#00FF88";
      ctx.strokeStyle = "#00FF88";
      ctx.lineWidth = 3;
      ctx.shadowBlur = 10;
      ctx.shadowColor = "#00FF88";
      
      for (let i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Crosshair
        ctx.beginPath();
        ctx.moveTo(points[i].x - 15, points[i].y);
        ctx.lineTo(points[i].x + 15, points[i].y);
        ctx.moveTo(points[i].x, points[i].y - 15);
        ctx.lineTo(points[i].x, points[i].y + 15);
        ctx.stroke();
      }
      
      // Measurement line
      if (points.length === 2) {
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Show pixel distance
        const dx = points[1].x - points[0].x;
        const dy = points[1].y - points[0].y;
        const pxLen = Math.sqrt(dx*dx + dy*dy);
        const midX = (points[0].x + points[1].x) / 2;
        const midY = (points[0].y + points[1].y) / 2;
        
        ctx.fillStyle = "rgba(0,0,0,0.7)";
        ctx.fillRect(midX - 40, midY - 25, 80, 30);
        ctx.fillStyle = "#00FF88";
        ctx.font = "14px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(`${pxLen.toFixed(0)} px`, midX, midY - 5);
        ctx.textAlign = "left";
      }
      
      ctx.shadowBlur = 0;
    }
  }, [active, points]);

  // Handle canvas clicks
  const onCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!active) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (points.length >= 2) {
      setPoints([{x, y}]);
    } else {
      setPoints(prev => [...prev, {x, y}]);
    }
  };

  // Core measurement calculations
  function pixelToCm(pixelLen: number, distance_cm: number, hFOV_deg: number, videoW_css: number) {
    const hFOV = (hFOV_deg * Math.PI) / 180;
    const focal_px = (videoW_css / 2) / Math.tan(hFOV / 2);
    return distance_cm * (pixelLen / focal_px);
  }

  function kRangeBySpecies(sp: SpeciesPreset) {
    switch (sp) {
      case "broadleaf": return {kMin: 0.02, kMax: 0.04};
      case "conifer":   return {kMin: 0.018, kMax: 0.035};
      case "fast":      return {kMin: 0.03, kMax: 0.06};
      default:          return {kMin: 0.02, kMax: 0.04};
    }
  }

  function estimateFromDBH(dbh_cm: number) {
    const {kMin, kMax} = kRangeBySpecies(species);
    const annualKgMin = kMin * dbh_cm * dbh_cm;
    const annualKgMax = kMax * dbh_cm * dbh_cm;

    let co2_kg_year_min = annualKgMin * lightFactor;
    let co2_kg_year_max = annualKgMax * lightFactor;
    
    let co2_g_day_min = (co2_kg_year_min * 1000) / 365;
    let co2_g_day_max = (co2_kg_year_max * 1000) / 365;

    const o2_g_day_min = co2_g_day_min * 0.727;
    const o2_g_day_max = co2_g_day_max * 0.727;
    const o2_kg_year_min = co2_kg_year_min * 0.727;
    const o2_kg_year_max = co2_kg_year_max * 0.727;

    return {
      co2_g_day_min, co2_g_day_max, 
      o2_g_day_min, o2_g_day_max,
      co2_kg_year_min, co2_kg_year_max,
      o2_kg_year_min, o2_kg_year_max
    };
  }

  const calculate = () => {
    if (!active || points.length !== 2) return;
    const c = canvasRef.current;
    const v = videoRef.current;
    if (!c || !v) return;

    const videoRect = v.getBoundingClientRect();
    const dx = points[1].x - points[0].x;
    const dy = points[1].y - points[0].y;
    const pxLen = Math.sqrt(dx*dx + dy*dy);

    const dbh_cm = pixelToCm(pxLen, distanceCm, hFOVdeg, videoRect.width);
    const est = estimateFromDBH(dbh_cm);

    const result: EstimateResult = {
      dbh_cm,
      co2_g_day_min: +est.co2_g_day_min.toFixed(1),
      co2_g_day_max: +est.co2_g_day_max.toFixed(1),
      o2_g_day_min: +est.o2_g_day_min.toFixed(1),
      o2_g_day_max: +est.o2_g_day_max.toFixed(1),
      co2_kg_year_min: +est.co2_kg_year_min.toFixed(1),
      co2_kg_year_max: +est.co2_kg_year_max.toFixed(1),
      o2_kg_year_min: +est.o2_kg_year_min.toFixed(1),
      o2_kg_year_max: +est.o2_kg_year_max.toFixed(1),
      inputs: { distance_cm: distanceCm, hFOV_deg: hFOVdeg, species, lightFactor }
    };

    setEstimate(result);
    setActive(false);
  };

  const takePhoto = () => {
    const v = videoRef.current;
    const canvas = canvasRef.current;
    const c = exportCanvasRef.current;
    if (!v || !canvas || !c || !estimate) return;

    const vw = v.videoWidth || 1280;
    const vh = v.videoHeight || 720;
    c.width = vw; c.height = vh;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(v, 0, 0, vw, vh);

    // Draw measurement overlay
    ctx.drawImage(canvas, 0, 0, vw, vh);

    // Add data overlay
    const gradient = ctx.createLinearGradient(16, 16, 16, 200);
    gradient.addColorStop(0, 'rgba(0,0,0,0.85)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.65)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(16, 16, 380, 180, 12);
    ctx.fill();

    ctx.strokeStyle = 'rgba(0,255,136,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(16, 16, 380, 180, 12);
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px system-ui";
    ctx.fillText("🌳 Tree Environmental Impact", 32, 48);
    
    ctx.font = "14px system-ui";
    ctx.fillStyle = "#00FF88";
    ctx.fillText(`DBH: ${estimate.dbh_cm.toFixed(1)} cm`, 32, 78);
    
    ctx.fillStyle = "#88DDFF";
    ctx.fillText(`Daily CO₂ absorption: ${estimate.co2_g_day_min}-${estimate.co2_g_day_max} g`, 32, 103);
    ctx.fillText(`Daily O₂ production: ${estimate.o2_g_day_min}-${estimate.o2_g_day_max} g`, 32, 128);
    
    ctx.fillStyle = "#FFD700";
    ctx.fillText(`Yearly: ${estimate.co2_kg_year_min}-${estimate.co2_kg_year_max} kg CO₂`, 32, 153);
    ctx.fillText(`Species: ${species} | Light: ${lightFactor}x`, 32, 178);

    const url = c.toDataURL("image/jpeg", 0.92);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tree_${Date.now()}.jpg`;
    a.click();
  };

  const getSpeciesEmoji = (sp: SpeciesPreset) => {
    switch(sp) {
      case "broadleaf": return "🍃";
      case "conifer": return "🌲";
      case "fast": return "🌱";
      default: return "🌳";
    }
  };

  // Tiny tooltip badge component
  const InfoBadge = ({ text }: { text: string }) => (
    <span className="relative group inline-flex items-center justify-center ml-1 align-middle">
      <span className="w-4 h-4 rounded-full bg-white/20 text-white/90 border border-white/30 text-[10px] leading-4 text-center cursor-help font-bold">?</span>
      <span className="pointer-events-none absolute z-50 hidden group-hover:block whitespace-pre-wrap text-xs left-1/2 -translate-x-1/2 bottom-full mb-2
                       bg-black/85 backdrop-blur text-white px-3 py-2 rounded-lg shadow-lg max-w-[260px] border border-white/10">
        {text}
      </span>
    </span>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="relative w-full h-screen max-w-[500px] overflow-hidden bg-[#111]">
        {/* Camera video */}
        <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

        {/* Measurement canvas overlay */}
        <canvas ref={canvasRef} className="absolute inset-0 z-10" onClick={onCanvasClick} />

        {/* Top instruction bar - ultra minimal */}
        {active && (
          <div className="absolute top-4 left-4 right-4 z-20 bg-white/10 backdrop-blur-[2px] rounded-full px-4 py-2 border border-white/10"
               style={{ opacity: uiHidden ? 0 : uiOpacity }}>
            <div className="text-white/75 text-xs font-medium text-center" style={{textShadow: '0 1px 2px rgba(0,0,0,0.4)'}}>
              Distance: {distanceCm}cm | FOV: {hFOVdeg}° | {getSpeciesEmoji(species)} {species}
            </div>
          </div>
        )}

        {/* Results card - ultra minimal glass */}
        {estimate && !active && (
          <div 
            className="absolute top-4 right-4 w-[320px] rounded-2xl p-4 bg-white/10 backdrop-blur-[2px] hover:bg-white/10 hover:backdrop-blur-[4px] border border-white/20 text-white/95 transition-all"
            style={{
              boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
              opacity: uiHidden ? 0 : uiOpacity
            }}
          >
            <div className="mb-3">
              <h2 className="text-xl font-bold text-white/85 flex items-center gap-2" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                🌳 Tree Impact
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/20">
                  {estimate.dbh_cm.toFixed(1)} cm
                </span>
              </h2>
            </div>
            
            <div className="space-y-3">
              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <div className="text-xs text-white/60 font-medium mb-1">Daily Impact</div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-sm text-green-300/80">CO₂</div>
                    <div className="text-lg font-bold text-white/85" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                      {estimate.co2_g_day_min}-{estimate.co2_g_day_max}
                      <span className="text-xs font-normal text-white/50 ml-1">g</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-cyan-300/80">O₂</div>
                    <div className="text-lg font-bold text-white/85" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                      {estimate.o2_g_day_min}-{estimate.o2_g_day_max}
                      <span className="text-xs font-normal text-white/50 ml-1">g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Control panel - ultra minimal glass */}
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
              onClick={() => { setActive(!active); setPoints([]); setEstimate(null); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all
                         border ${active ? "border-red-300/60 text-red-200 hover:bg-red-400/10"
                                         : "border-emerald-300/60 text-emerald-200 hover:bg-emerald-400/10"}`}
            >
              {active ? "Cancel" : "Measure"}
            </button>
            
            {active && (
              <>
                <button
                  onClick={() => setPoints([])}
                  className="px-3 py-2 rounded-full text-sm border border-white/20 text-white/70 bg-transparent hover:bg-white/10"
                >
                  Reset
                </button>
                <button
                  onClick={calculate}
                  className="px-3 py-2 rounded-full text-sm border border-emerald-300/50 text-emerald-200 bg-transparent hover:bg-emerald-400/10 disabled:opacity-50"
                  disabled={points.length !== 2}
                >
                  Calculate
                </button>
              </>
            )}
            
            {estimate && !active && (
              <button
                onClick={takePhoto}
                className="px-3 py-2 rounded-full text-sm border border-cyan-300/50 text-cyan-200 bg-transparent hover:bg-cyan-400/10"
              >
                📸
              </button>
            )}
          </div>

          {/* Settings - ultra minimal */}
          <div className="grid grid-cols-1 gap-2.5 text-xs">
            <label className="flex items-center gap-2 text-white/70">
              <span className="w-16 text-[11px] flex items-center" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                Distance
                <InfoBadge text={`How far you're standing from the tree trunk.
Recommended: 2 meters (200 cm).
Stand back far enough to see the whole trunk width clearly.
Measure at chest height (1.3m) for standard DBH.`}/>
              </span>
              <input 
                type="number" 
                min={50}
                max={500}
                className="w-16 bg-transparent border border-white/20 rounded px-2 py-1
                          text-white/80 placeholder-white/40 focus:outline-none focus:border-emerald-300/50 text-xs"
                value={distanceCm} 
                onChange={e => setDistanceCm(Math.max(50, Math.min(500, +e.target.value || 0)))} 
              />
              <span className="text-white/50 text-[11px]">cm</span>
            </label>
            
            <label className="flex items-center gap-2 text-white/70">
              <span className="w-16 text-[11px] flex items-center" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                FOV
                <InfoBadge text={`FOV = Field of View (viewing angle).
Determines how wide the real world appears on your screen.
Most phone rear cameras: 60–70°.
This helps convert pixel measurements to real centimeters.`}/>
              </span>
              <input 
                type="number" 
                className="w-16 bg-transparent border border-white/20 rounded px-2 py-1
                          text-white/80 focus:border-emerald-300/50 focus:outline-none text-xs"
                value={hFOVdeg} 
                onChange={e => setHFOVdeg(Math.max(45, Math.min(90, +e.target.value || 0)))} 
              />
              <span className="text-white/50 text-[11px]">°</span>
              <div className="flex gap-1 ml-auto">
                <button onClick={() => applyFovPreset(63)} className="px-1.5 py-0.5 text-[10px] rounded border border-white/20 text-white/60 hover:bg-white/10">63°</button>
                <button onClick={suggestFovByAspect} className="px-1.5 py-0.5 text-[10px] rounded border border-emerald-300/30 text-emerald-200 hover:bg-emerald-400/10">Auto</button>
              </div>
            </label>
            
            <label className="flex items-center gap-2 text-white/70">
              <span className="w-16 text-[11px] flex items-center" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                Species
                <InfoBadge text={`Tree type affects CO₂ absorption rates.
Broadleaf: Oak, maple, etc.
Conifer: Pine, spruce, etc.
Fast-growing: Willow, poplar, etc.`}/>
              </span>
              <select 
                className="flex-1 bg-transparent border border-white/20 rounded px-2 py-1
                          text-white/80 focus:border-emerald-300/50 text-xs [&>option]:bg-gray-800"
                value={species} 
                onChange={e => setSpecies(e.target.value as SpeciesPreset)}
              >
                <option value="generic">Generic</option>
                <option value="broadleaf">Broadleaf</option>
                <option value="conifer">Conifer</option>
                <option value="fast">Fast-grow</option>
              </select>
            </label>
            
            <label className="flex items-center gap-2 text-white/70">
              <span className="w-16 text-[11px] flex items-center" style={{textShadow: '0 1px 2px rgba(0,0,0,.35)'}}>
                Light
                <InfoBadge text={`Adjust for tree's sun exposure.
0.8x = Shaded area
1.0x = Normal sunlight
1.2x = Full sun all day`}/>
              </span>
              <input 
                type="range" 
                min={0.8} 
                max={1.2} 
                step={0.02}
                value={lightFactor} 
                onChange={e => setLightFactor(+e.target.value)}
                className="flex-1 accent-emerald-300 opacity-60 h-1" 
              />
              <span className="w-10 text-right text-emerald-300/80 text-[11px] font-bold">{lightFactor.toFixed(1)}×</span>
            </label>
          </div>
        </div>

        {/* Error display */}
        {err && (
          <div className="absolute top-4 left-2 right-2 bg-red-900/80 text-white p-3 rounded-lg z-30">
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
          style={{ pointerEvents: active ? 'none' : 'auto' }}
        />
      </div>

      {/* Hidden export canvas */}
      <canvas ref={exportCanvasRef} style={{ display: "none" }} />
    </div>
  );
}