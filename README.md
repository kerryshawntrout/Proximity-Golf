# ⛳ Proximity Golf

**Proximity Golf** is a mobile-first Progressive Web App (PWA) designed for golf performance tracking and approach strategy. By shifting focus away from raw score pressure during a round and toward hitting targeted approach rings, golfers can make smarter tactical decisions, track true proximity metrics, and receive actionable practice feedback.

---

## 🎯 The Precision Approach System

Traditional score tracking often masks the quality of approach shots. **Proximity Golf** measures approach performance using concentric target zones relative to the hole:

| Ring Name | Target Distance | Strategic Focus |
| :--- | :--- | :--- |
| **On Green (GIR)** | Green in Regulation | Direct hole access / putting surface |
| **Bullseye** | 30 Yards | High precision / scoring range |
| **Inner Ring** | 50 Yards | Controlled approach / solid scoring zone |
| **Mid Ring** | 70 Yards | Mid-range approach control |
| **Outer Ring** | 100 Yards | Layup target / wide collection zone |
| **Off Target** | > 100 Yards | Missed approach outside designated zones |

---

## 📊 Core Features

* **Real-Time Round Tracking:** Record hole par, target ring achieved, up & downs from target zones, first putt distances (in paces), total putts, penalties, and hole scores.
* **Dynamic Practice Generator:** Automatically evaluates your last 5 rounds to recommend focused practice drills (e.g., Target Ring accuracy, Short Game Up & Down performance, or Lag Putt speed control).
* **Offline-First PWA Support:** Built with a dedicated Service Worker so you can track rounds seamlessly on courses with low or zero cellular coverage.
* **Data Privacy & Export:** All round data is persisted locally in your browser via `localStorage`. Easily export complete round histories to `.csv` files for further analysis.

---

## 🛠️ Technology Stack

* **Frontend:** Single-file Vanilla HTML5, CSS3, and JavaScript (ES6+).
* **Storage:** Native browser `localStorage` for round drafts and persistent historical logs.
* **PWA Infrastructure:** Custom `manifest.json` for home screen installation and `service-worker.js` for offline caching.
* **Hosting:** Optimized for free zero-configuration hosting via **GitHub Pages**, Netlify, or Vercel.

---

## 🚀 Quick Setup & Installation

1. **Deploying to GitHub Pages:**
   * Push `index.html`, `manifest.json`, `service-worker.js`, and `README.md` to a public GitHub repository.
   * Go to **Settings** > **Pages** in your repository.
   * Under **Branch**, select `main` (or `master`) and click **Save**.

2. **Installing on Mobile Devices:**
   * **iOS (Safari):** Open your live GitHub Pages URL $\rightarrow$ tap **Share** $\rightarrow$ select **Add to Home Screen**.
   * **Android (Chrome):** Open your live GitHub Pages URL $\rightarrow$ tap **Menu** (three dots) $\rightarrow$ select **Install App** or **Add to Home Screen**.

---

*Icon asset courtesy of [Freepik - Flaticon](https://www.flaticon.com/).*
