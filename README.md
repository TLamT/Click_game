# 🖱️ Click Challenge

> 反應速度訓練遊戲 — A reaction-speed training game designed for **elderly people and people with disabilities**.

This is a simple, accessible click/tap game built to help train and maintain reaction speed. The goal is straightforward: **tap the target as many times as you can before the 30-second timer runs out.**

👉 **[Play the Game Here](https://click-game-tan.vercel.app)**

---

## 🎯 Purpose

The game is designed as a **reaction-speed training tool**, not a competitive speed-clicking benchmark:

- **For the elderly** — keeps hand–eye coordination and fine motor response active in a low-pressure, fun way.
- **For people with disabilities** — every interaction is a single, gentle tap. No double-clicks, no drag, no keyboard shortcuts, no precise aim required.
- **Progress feedback** — clear score, combo, and personal best tracking give users a sense of improvement over time.

---

## ✨ Features

- ⏱️ **30-second countdown** — one round is short enough to stay engaging and easy to repeat.
- 🎯 **Large, easy-to-hit target** — an 84&nbsp;px circle that is far bigger than typical game targets, and never spawns off-screen.
- 🔥 **Combo streak** — quick successive hits build a combo counter for extra motivation.
- ✏️ **Player name** — enter your name before a round so your scores are credited to you.
- ⏱️ **Adjustable round time** — choose from **5 to 120 seconds** to match each person's ability level.
- 🏆 **Leaderboard** — the top 8 scores are saved locally (per browser) with the player's name.
- 🏅 **Best score** — your personal best is tracked separately and highlighted on a new record.
- 🖼️ **Custom target image** — users (or carers) can upload their own image, e.g. a familiar photo, to make the target more recognizable.
- 🌓 **High-contrast dark theme** — large type, clear color separation, and a distraction-free layout.
- 📱 **Touch-friendly** — works on phones and tablets; no double-tap zoom interference.

---

## ♿ Accessibility-first Design

The interface was deliberately designed around the needs of its audience:

| Consideration | Implementation |
| --- | --- |
| Single simple interaction | One button — just tap the target |
| Generous target size | 84&nbsp;px circle, clamped inside the play area |
| Smooth, predictable motion | Target glides between positions instead of teleporting |
| Clear visual feedback | Pop animation + live score/combo counters |
| Screen-reader support | Accessible labels (`aria-label`, semantic buttons) |
| Keyboard users | Visible focus outlines on all controls |
| Motion-safe defaults | Subtle, short animations; no flashing or strobing |
| Reduced motor load | No double-click, no drag, no timing-critical multi-tap |

---

## 🛠️ Tech Stack

- **Framework**: [React](https://react.dev/) 19
- **Build tool**: Create React App (react-scripts 5)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + custom CSS3 animations
- **Testing**: Jest + React Testing Library
- **Deployment**: [Vercel](https://vercel.com)

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play locally.

### Testing

```bash
npm test
```

Runs the test suite (game flow, timer, scoring, and best-score persistence).

### Production build

```bash
npm run build
```

Builds an optimized bundle into the `build/` folder, ready to deploy.

---

## 🗺️ Roadmap

Ideas to make the game even more suitable for its audience:

- [ ] **Adjustable difficulty** — target size options (round time is already adjustable from 5–120s).
- [ ] **Reduced-motion mode** — respect `prefers-reduced-motion` for users with vestibular sensitivity.
- [ ] **Audio & haptic feedback** — gentle sound / vibration on each hit.
- [ ] **Progress tracking** — a simple chart of best scores over days/weeks to show improvement.
- [ ] **High-contrast & color-blind themes** — alternative visual schemes.
- [ ] **Single-switch support** — compatibility with adaptive switches (spacebar / external switch input).
- [ ] **Traditional Chinese UI** — 繁體中文介面，方便本地長者使用。
- [ ] **Cross-device leaderboard** — sync scores via a backend so carers can compare across devices.

---

## 📂 Project Structure

```
src/
├── App.js            # Game logic & UI (idle / playing / game over states)
├── App.test.js       # Automated tests for the game flow
├── index.css         # Theme, layout, animations, accessibility styles
├── index.js          # App entry point
└── ...
```

---

## 📄 License

Feel free to use, modify, and share this project for educational and non-commercial purposes.
