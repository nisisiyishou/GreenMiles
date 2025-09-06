"use client";

import React, { useState } from "react";

// Tree data type
interface TreeData {
  id: number;
  species: string;
  emoji: string;
  location: string;
  age: number;
  height: number;
  co2PerYear: number;
  status: string;
  vrUrl: string;
}

// Sample tree data
const treeData: TreeData[] = [
  {
    id: 1,
    species: "Douglas Fir",
    emoji: "🌲",
    location: "Pacific Northwest Forest, Oregon",
    age: 3,
    height: 4.5,
    co2PerYear: 48,
    status: "Thriving",
    vrUrl: "https://www.360cities.net/embed_iframe/forest-37"
  },
  {
    id: 2,
    species: "Oak Tree",
    emoji: "🍃",
    location: "Black Forest, Germany",
    age: 5,
    height: 6.2,
    co2PerYear: 62,
    status: "Healthy",
    vrUrl: "https://www.360cities.net/embed_iframe/forest-49"
  },
  {
    id: 3,
    species: "Maple Tree",
    emoji: "🌳",
    location: "Boreal Forest, Canada",
    age: 4,
    height: 5.8,
    co2PerYear: 55,
    status: "Excellent",
    vrUrl: "https://www.360cities.net/embed_iframe/forest-53"
  }
];

export default function VRForestGallery() {
  const [selectedVR, setSelectedVR] = useState<string | null>(null);
  
  // Calculate stats
  const totalTrees = treeData.length;
  const uniqueSpecies = new Set(treeData.map(t => t.species.split(' ')[0])).size;
  const totalCO2 = (treeData.reduce((sum, tree) => sum + tree.co2PerYear, 0) / 1000).toFixed(1);

  const openVR = (url: string) => {
    setSelectedVR(url);
    document.body.style.overflow = 'hidden';
  };

  const closeVR = () => {
    setSelectedVR(null);
    document.body.style.overflow = 'auto';
  };

  // Close on ESC key
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVR();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Header */}
      <div className="text-center py-12 px-4 bg-black/20 backdrop-blur-md border-b border-white/10">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          🌳 My VR Forest Gallery
        </h1>
        <p className="text-white/80 mt-2">Explore your planted trees in 360° virtual reality</p>
        
        {/* Stats */}
        <div className="flex justify-center gap-4 md:gap-8 mt-8 flex-wrap">
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <div className="text-3xl font-bold text-green-400">{totalTrees}</div>
            <div className="text-sm text-white/70">Trees Planted</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <div className="text-3xl font-bold text-green-400">{uniqueSpecies}</div>
            <div className="text-sm text-white/70">Different Species</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20">
            <div className="text-3xl font-bold text-green-400">{totalCO2}</div>
            <div className="text-sm text-white/70">Tons CO₂/Year</div>
          </div>
        </div>
      </div>

      {/* Tree Gallery */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {treeData.map((tree, index) => (
            <div 
              key={tree.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 hover:border-green-400/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-green-400/20"
              style={{
                animation: `fadeInUp 0.6s ease forwards`,
                animationDelay: `${index * 0.1}s`,
                opacity: 0
              }}
            >
              {/* VR Preview (clean card) */}
              <div
                className="relative h-64 bg-black cursor-pointer group overflow-hidden rounded-t-2xl"
                onClick={() => openVR(tree.vrUrl)}
              >
                {/* shift & bleed the iframe so top/bottom UI are out of view */}
                <iframe
                  src={tree.vrUrl}
                  className="absolute border-0 pointer-events-none"
                  style={{
                    top: '-90px',                 // 上移把顶部工具条推出去
                    left: '-10px',                // 左右各出血一点
                    width: 'calc(100% + 20px)',
                    height: 'calc(100% + 220px)', // 增高以防露白
                    outline: 'none',
                    transform: 'translateZ(0)',
                  }}
                  allowFullScreen
                />

                {/* 顶部整宽遮罩 */}
                <div
                  className="absolute left-0 right-0 top-0 pointer-events-none"
                  style={{ height: 90, background: 'linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0))' }}
                />
                {/* 底部整宽遮罩 */}
                <div
                  className="absolute left-0 right-0 bottom-0 pointer-events-none"
                  style={{ height: 90, background: 'linear-gradient(0deg, rgba(0,0,0,0.85), rgba(0,0,0,0))' }}
                />
                {/* 全域轻遮罩 */}
                <div className="absolute inset-0 bg-black/35 pointer-events-none" />

                {/* 360° VIEW 徽章 */}
                <div className="absolute left-4 bottom-4 pointer-events-none">
                  <div className="bg-green-400 text-black px-3 py-1 rounded-lg font-semibold text-sm">
                    360° VIEW
                  </div>
                </div>

                {/* hover 微暗效果 */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
              </div>

              {/* Tree Info */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">{tree.emoji}</span>
                  <h3 className="text-2xl font-bold text-white">{tree.species}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-white/70 mb-4">
                  <span>📍</span>
                  <span className="text-sm">{tree.location}</span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-white/60">Age</div>
                    <div className="text-lg font-semibold text-green-400">{tree.age} years</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-white/60">Height</div>
                    <div className="text-lg font-semibold text-green-400">{tree.height}m</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-white/60">CO₂/year</div>
                    <div className="text-lg font-semibold text-green-400">{tree.co2PerYear}kg</div>
                  </div>
                  <div className="bg-black/20 rounded-lg p-3">
                    <div className="text-xs text-white/60">Status</div>
                    <div className="text-lg font-semibold text-green-400">{tree.status}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* VR Modal */}
      {selectedVR && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) closeVR(); }}
        >
          <button 
            onClick={closeVR}
            className="absolute top-4 right-4 bg-white/20 hover:bg-red-500/50 text-white px-4 py-2 rounded-lg border border-white/30 transition-colors z-50"
          >
            ✕ Close
          </button>

          {/* 裁切容器：圆角 + overflow-hidden */}
          <div
            className="relative w-full max-w-6xl h-[80vh] rounded-xl overflow-hidden"
            style={{ boxShadow: "none", background: "#000" }}
          >
            {/* 让 iframe 四边出血，并再多上移 */}
            <iframe
              src={selectedVR}
              allowFullScreen
              className="absolute border-0"
              style={{
                top: "-130px",                  // 再多上移
                left: "-12px",                  // 左右各溢出 12px
                width: "calc(100% + 24px)",    // 防止左右细线
                height: "calc(100% + 300px)",  // 高度充足
                outline: "none",
                transform: "translateZ(0)",
              }}
            />

            {/* —— 点击阻断层（避免点到内置按钮） —— */}
            {/* 顶部整条工具栏区域 */}
            <div className="absolute left-0 right-0 top-0" style={{ height: 140, pointerEvents: "auto" }} />
            {/* 右上角按钮群 */}
            <div className="absolute" style={{ top: 8, right: 8, width: 260, height: 56, pointerEvents: "auto" }} />
            {/* 左下角罗盘区域 */}
            <div className="absolute" style={{ left: 8, bottom: 8, width: 200, height: 200, pointerEvents: "auto" }} />
            {/* 右下角作者信息 */}
            <div className="absolute" style={{ right: 8, bottom: 8, width: 260, height: 80, pointerEvents: "auto" }} />

            {/* —— 视觉遮挡（只遮视觉，不吃点击） —— */}
            {/* 顶部整宽遮罩：把左上那条半透明标题条完全盖掉 */}
            <div
              className="absolute left-0 right-0 top-0 pointer-events-none"
              style={{
                height: 140,
                background: "linear-gradient(180deg, rgba(0,0,0,0.9), rgba(0,0,0,0))",
              }}
            />

            {/* 左侧竖向遮罩：消掉左缘那条淡淡的阴影/线 */}
            <div
              className="absolute top-0 bottom-0 left-0 pointer-events-none"
              style={{
                width: 28,
                background: "linear-gradient(90deg, rgba(0,0,0,0.7), rgba(0,0,0,0))",
              }}
            />

            {/* 底部整条渐变：盖住底缘与罗盘阴影 */}
            <div
              className="absolute left-0 right-0 bottom-0 pointer-events-none"
              style={{
                height: 120,
                background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))",
              }}
            />
            {/* 左下角加强遮罩：确保罗盘完全不可见 */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: 0,
                bottom: 0,
                width: 240,
                height: 180,
                background: "radial-gradient(180px 150px at 0 100%, rgba(0,0,0,0.95), rgba(0,0,0,0))",
              }}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}