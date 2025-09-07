# 🌱 Green Miles

![Cover](./public/selfie.jpg)

**Green Miles** is a sustainability-driven app that rewards you for walking along greenways.  
Your steps turn into points that can be redeemed to **plant real trees** or enjoy eco-friendly rewards — directly contributing to a greener planet.  

With **AR** you can scan local ecosystems and trees to learn how much CO₂ they absorb, and with **VR** you can visit the forest where your planted trees grow — making sustainability tangible and personal.

---

## 📸 Demo

[▶️ Watch the demo on YouTube](https://youtu.be/jENykx-CXHI)

---

## ✨ Features

- 🚶 **Walk & Earn** – Points for distance on green routes.
- 🌳 **Plant Real Trees** – Redeem points; track your trees in a VR gallery.
- 🍎 **Eco Rewards** – Exchange points for sustainable goodies.
- 🗺 **Green Routes** – Curated routes or design your own with Google Maps.
- 🌬 **Air Quality Bonus** – Cleaner air = more points.
- 📷 **AR Tree Scan** – Measure trunk width (DBH) and estimate CO₂/O₂.
- 🕶 **VR Forest** – 360° views of locations where your trees grow.

---

## 🛠 Tech Stack

**Frontend**
- Next.js (React + TypeScript)
- Tailwind CSS

**Mobile / Camera**
- Web APIs: `navigator.mediaDevices`, Canvas
- AR overlays & particle viz (air quality)
- (Optional) WebXR experiments

**Backend / APIs**
- Next.js API routes (Node.js)
- Google Maps Platform (Maps, Geocoding, Directions)
- OpenWeather (Air quality / PM2.5, weather basics)

**Other**
- 360Cities VR embeds for immersive panoramas
- Vercel for deployment

---

## 🚀 Quick Start

```bash
git clone https://github.com/your-username/green-miles.git
cd green-miles
npm install
npm run dev
