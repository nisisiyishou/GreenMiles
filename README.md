# 🌱 Green Miles

**Green Miles** is a sustainability-driven app that rewards you for walking along greenways.  
Your steps turn into points that can be redeemed to **plant real trees** or enjoy eco-friendly rewards — directly contributing to a greener planet.  

With **AR** you can scan local ecosystems and trees to learn how much CO₂ they absorb, and with **VR** you can visit the forest where your planted trees grow — making sustainability tangible and personal.

---

## 📸 Screenshots / Demo

- [![Watch the demo](https://img.youtube.com/vi/jENykx-CXHI/maxresdefault.jpg)](https://youtu.be/jENykx-CXHI)

---

## ✨ Features

- 🚶 **Walk & Earn**: Collect points for every kilometer walked on green routes.  
- 🌳 **Plant Real Trees**: Redeem points to plant trees and track their growth in VR.  
- 🍎 **Eco Rewards**: Exchange steps for fruits or sustainable products.  
- 🗺 **Curated Routes**: Follow recommended greenways or design your own using Google Maps API.  
- 🌬 **Air Quality Awareness**: Cleaner air = more points, encouraging healthier routes.  
- 📷 **AR Ecosystem Scan**: Aim your phone at a tree, measure its trunk, and estimate daily CO₂ absorption + oxygen production.  
- 🕶 **VR Forest Gallery**: Explore immersive 360° views of the trees you’ve planted.  

---

## 🛠 Tech Stack

**Frontend**
- Next.js (React + TypeScript)
- Tailwind CSS (UI styling)

**Mobile / Camera**
- Web APIs: `navigator.mediaDevices`, Canvas overlays
- AR particle visualization for air quality
- WebXR (experimental tree measurement)

**Backend / APIs**
- Node.js (API routes in Next.js)
- OpenWeather API (PM2.5, air quality)
- Google Maps API (routes, geolocation)

**Other**
- 360Cities VR embeds for immersive forest views
- Vercel (deployment)

---

## 🚀 Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/your-username/green-miles.git
cd green-miles
