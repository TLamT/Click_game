# 🖱️ Rapid Clicker Challenge

A fast-paced interactive web game designed to test user reflexes and clicking speed, built with a focus on **DOM manipulation** and **real-time state synchronization**.

👉 **[Play the Game Here](https://click-game-tan.vercel.app)**

---

## 🚀 Engineering Highlights

*   **Precise Timer Logic**: Implemented a countdown system using `setInterval` to manage game duration and ensure accurate score tracking.
*   **Dynamic DOM Updates**: Utilized high-frequency DOM manipulation to reflect score changes instantly as the user interacts with the UI.
*   **Game State Management**: Built a robust state machine to handle "Idle", "Playing", and "Game Over" phases, ensuring a smooth user flow.
*   **Performance Optimization**: Minimized layout thrashing by optimizing event listeners for rapid user inputs.

## 🛠️ Tech Stack

*   **Logic**: Vanilla JavaScript (ES6+)
*   **Styling**: CSS3 (Animations & Hover Effects)
*   **Structure**: HTML5
*   **Deployment**: Vercel

## 🧠 Key Challenges & Solutions

### 1. Handling High-Frequency Inputs
**Challenge**: Rapid clicking can sometimes lead to inconsistent score updates if not handled correctly.
**Solution**: Implemented a robust event handling mechanism that ensures every valid click is captured and processed without blocking the main UI thread.

### 2. Synchronization of Timer and Score
**Challenge**: Ensuring the game stops exactly when the timer reaches zero while disabling further inputs.
**Solution**: Integrated a "Game Controller" function that clears intervals and removes event listeners immediately upon expiration of the timer to prevent "late-click" scoring.

## 📅 Roadmap

- [ ] **Leaderboard**: Integrate **Firebase** or **LocalStorage** to save top scores.
- [ ] **Difficulty Levels**: Add different modes with varying target sizes or shorter time limits.
- [ ] **Sound Effects**: Implement the Web Audio API for satisfying click feedback.
- [ ] **Visual Polish**: Add a "Combo" multiplier system for consecutive fast clicks.

---

### Getting Started

```bash
# Clone the repository
git clone https://github.com

# Open index.html in your browser
open index.html
