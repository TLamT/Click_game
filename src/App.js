import { useEffect, useRef, useState } from "react";

const DEFAULT_DURATION = 30;
const MIN_DURATION = 5;
const MAX_DURATION = 120;
const TARGET_SIZE = 84;
const TARGET_PAD = TARGET_SIZE / 2 + 6;
const COMBO_WINDOW = 1400;
const COUNTDOWN_START = 3;
const BEST_KEY = "clickGameBest";
const LEADERBOARD_KEY = "clickGameLeaderboard";
const MAX_ENTRIES = 8;

// Deterministic confetti pieces for the game-over screen
const CONFETTI = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: (i * 8.3 + 4) % 100,
  delay: (i * 0.18) % 1.2,
  duration: 2.4 + (i % 3) * 0.5,
  hue: (i * 60) % 360,
}));

function randomPosition(arenaEl) {
  if (!arenaEl) return { top: "50%", left: "50%" };

  const rect = arenaEl.getBoundingClientRect();
  const maxTop = Math.max(rect.height - TARGET_PAD * 2, 0);
  const maxLeft = Math.max(rect.width - TARGET_PAD * 2, 0);

  return {
    top: `${TARGET_PAD + Math.random() * maxTop}px`,
    left: `${TARGET_PAD + Math.random() * maxLeft}px`,
  };
}

function readBestScore() {
  const value = Number(window.localStorage.getItem(BEST_KEY));
  return Number.isFinite(value) ? value : 0;
}

function readLeaderboard() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEADERBOARD_KEY));
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // ignore corrupted data
  }
  return [];
}

function App() {
  const [phase, setPhase] = useState("idle"); // idle | countdown | playing | over
  const [countdown, setCountdown] = useState(COUNTDOWN_START);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [position, setPosition] = useState({ top: "50%", left: "50%" });
  const [image, setImage] = useState(null);
  const [combo, setCombo] = useState(0);
  const [hitKey, setHitKey] = useState(0);
  const [bestScore, setBestScore] = useState(readBestScore);
  const [isNewBest, setIsNewBest] = useState(false);

  const [name, setName] = useState("");
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [leaderboard, setLeaderboard] = useState(readLeaderboard);
  const [lastRank, setLastRank] = useState(null);

  const timerRef = useRef(null);
  const arenaRef = useRef(null);
  const comboRef = useRef(null);

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const clearCombo = () => {
    if (comboRef.current) {
      clearTimeout(comboRef.current);
      comboRef.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      clearCombo();
    };
  }, []);

  // Countdown → start the real game
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 0) {
      const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(id);
    }

    // countdown reached 0: show "GO!" briefly, then play
    const id = setTimeout(() => {
      setPhase("playing");
      setPosition(randomPosition(arenaRef.current));
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => Math.max(0, t - 1));
      }, 1000);
    }, 800);
    return () => clearTimeout(id);
  }, [phase, countdown]);

  // End the game when the clock hits zero
  useEffect(() => {
    if (phase !== "playing" || timeLeft > 0) return;

    clearTimer();
    const prevBest = readBestScore();
    const next = Math.max(prevBest, score);
    window.localStorage.setItem(BEST_KEY, String(next));
    setBestScore(next);
    setIsNewBest(score > prevBest);

    // Record the round in the leaderboard (only scores > 0)
    if (score > 0) {
      const entry = { name: name.trim() || "匿名", score, duration };
      const nextList = [...leaderboard, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_ENTRIES);
      const rank = nextList.indexOf(entry) + 1;
      window.localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(nextList));
      setLeaderboard(nextList);
      setLastRank(rank);
    }

    setPhase("over");
  }, [phase, timeLeft, score, name, duration, leaderboard]);

  // Combo decays after a short pause between clicks
  useEffect(() => {
    if (combo > 0) {
      clearCombo();
      comboRef.current = setTimeout(() => setCombo(0), COMBO_WINDOW);
    }
    return clearCombo;
  }, [combo]);

  const isInputDisabled = phase === "countdown" || phase === "playing";

  const startGame = () => {
    clearTimer();
    clearCombo();
    setScore(0);
    setTimeLeft(duration);
    setCombo(0);
    setIsNewBest(false);
    setLastRank(null);
    setCountdown(COUNTDOWN_START);
    setPhase("countdown");
  };

  const handleTargetClick = () => {
    setScore((s) => s + 1);
    setCombo((c) => c + 1);
    setHitKey((k) => k + 1);
    setPosition(randomPosition(arenaRef.current));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result);
    reader.readAsDataURL(file);
  };

  const handleDurationChange = (event) => {
    const raw = Number(event.target.value);
    if (!Number.isFinite(raw)) return;
    const value = Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.round(raw)));
    setDuration(value);
    if (phase === "idle") setTimeLeft(value);
  };

  const progress = (timeLeft / duration) * 100;
  const timerTone =
    timeLeft <= 10 ? "timer-critical" : timeLeft <= 20 ? "timer-warning" : "";

  return (
    <div className="game-shell">
      <main className="game-container">
        <header className="game-header">
          <div>
            <h1 className="game-title">Click Challenge</h1>
            <p className="game-subtitle">反應速度訓練 · Reaction Training</p>
          </div>
          <div className="best-score" data-testid="best-score">
            <span className="best-score-icon" aria-hidden="true">
              🏆
            </span>
            Best {bestScore}
          </div>
        </header>

        <div className="settings-row">
          <label className="setting-field">
            <span className="setting-label">👤 Name 名字</span>
            <input
              className="setting-input"
              type="text"
              value={name}
              maxLength={12}
              placeholder="輸入名字"
              disabled={isInputDisabled}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label className="setting-field">
            <span className="setting-label">⏱️ Time 時間</span>
            <input
              className="setting-input"
              type="number"
              min={MIN_DURATION}
              max={MAX_DURATION}
              value={duration}
              disabled={isInputDisabled}
              onChange={handleDurationChange}
            />
            <span className="setting-hint">{MIN_DURATION}–{MAX_DURATION} 秒</span>
          </label>
        </div>

        <div className="game-layout">
          <div className="game-main">
            <section className="hud" aria-label="Game stats">
              <div className="hud-chip">
                <span className="hud-icon" aria-hidden="true">
                  🎯
                </span>
                <span className="hud-label">Score</span>
                <span key={score} className="hud-value" data-testid="score">
                  {score}
                </span>
              </div>
              <div className="hud-chip">
                <span className="hud-icon" aria-hidden="true">
                  ⏱️
                </span>
                <span className="hud-label">Time</span>
                <span
                  key={timeLeft}
                  className="hud-value hud-time"
                  data-testid="timer"
                >
                  {timeLeft}s
                </span>
              </div>
              <div
                className={`hud-chip ${combo >= 3 ? "hud-chip-combo-active" : ""}`}
              >
                <span className="hud-icon" aria-hidden="true">
                  🔥
                </span>
                <span className="hud-label">Combo</span>
                <span
                  key={combo}
                  className="hud-value hud-combo"
                  data-testid="combo"
                >
                  x{combo}
                </span>
              </div>
            </section>

            <div className="timer-bar" aria-hidden="true">
              <div
                className={`timer-bar-fill ${timerTone}`}
                style={{ width: `${progress}%` }}
              />
            </div>

            <section className="arena" ref={arenaRef} data-testid="arena">
              {phase === "idle" && (
                <div className="overlay">
                  <div className="idle-emoji" aria-hidden="true">
                    🎯
                  </div>
                  <h2 className="overlay-title">Ready?</h2>
                  <p className="overlay-desc">
                    撳中間個圓形，越快越好！You have {duration} seconds — tap
                    the target as fast as you can. Chain quick hits to build a
                    combo.
                  </p>
                  <button className="btn-primary" onClick={startGame}>
                    Start Game
                  </button>
                  <label className="upload-label">
                    {image ? "Change target image" : "Upload custom target"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  {image && (
                    <button className="btn-ghost" onClick={() => setImage(null)}>
                      Use default target
                    </button>
                  )}
                </div>
              )}

              {phase === "countdown" && (
                <div className="overlay overlay-countdown">
                  <div
                    key={countdown}
                    className={`countdown-number ${
                      countdown === 0 ? "countdown-number-go" : ""
                    }`}
                  >
                    {countdown === 0 ? "GO!" : countdown}
                  </div>
                  <p className="overlay-desc">準備好未？Get ready…</p>
                </div>
              )}

              {phase === "playing" && (
                <button
                  aria-label="target"
                  className="target"
                  data-testid="target"
                  style={{
                    top: position.top,
                    left: position.left,
                    backgroundImage: image ? `url(${image})` : undefined,
                  }}
                  onClick={handleTargetClick}
                >
                  <span key={hitKey} className="target-pop" aria-hidden="true" />
                </button>
              )}

              {phase === "over" && (
                <div className="overlay">
                  <div className="confetti" aria-hidden="true">
                    {CONFETTI.map((c) => (
                      <span
                        key={c.id}
                        className="confetti-piece"
                        style={{
                          left: `${c.left}%`,
                          animationDelay: `${c.delay}s`,
                          animationDuration: `${c.duration}s`,
                          background: `hsl(${c.hue}, 90%, 60%)`,
                        }}
                      />
                    ))}
                  </div>
                  <div className="trophy" aria-hidden="true">
                    🏆
                  </div>
                  <h2 className="overlay-title">Game Over</h2>
                  <p className="overlay-score" data-testid="final-score">
                    {score}
                  </p>
                  <p className="overlay-desc" data-testid="result-message">
                    {isNewBest
                      ? "🎉 New best score!"
                      : `Best score: ${bestScore}`}
                  </p>
                  <button className="btn-primary" onClick={startGame}>
                    Play Again
                  </button>
                </div>
              )}
            </section>
          </div>

          <aside className="leaderboard" aria-label="Ranking">
            <h2 className="leaderboard-title">🏆 排行榜 Ranking</h2>
            {leaderboard.length === 0 ? (
              <p className="leaderboard-empty">
                未有紀錄 — 玩一局啦！
                <br />
                Play a game to set a record!
              </p>
            ) : (
              <ol className="leaderboard-list">
                {leaderboard.map((entry, i) => (
                  <li
                    key={`${entry.name}-${entry.score}-${i}`}
                    className={`leaderboard-entry ${
                      i + 1 === lastRank ? "leaderboard-entry-current" : ""
                    }`}
                  >
                    <span
                      className={`leaderboard-rank ${
                        i < 3 ? `leaderboard-rank-${i + 1}` : ""
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="leaderboard-name">{entry.name}</span>
                    <span className="leaderboard-score">{entry.score}</span>
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;
