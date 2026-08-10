import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";

const GAME_DURATION = 30;

beforeEach(() => {
  window.localStorage.clear();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

// Skip past the 3-2-1-GO! countdown (step by step so each chained
// setTimeout is flushed by React before scheduling the next one)
function skipCountdown() {
  for (let i = 0; i < 4; i += 1) {
    act(() => {
      jest.advanceTimersByTime(1000);
    });
  }
}

// Click Start and skip past the 3-2-1-GO! countdown
function startGame() {
  fireEvent.click(screen.getByRole("button", { name: /start game/i }));
  skipCountdown();
}

test("shows the start screen with a start button", () => {
  render(<App />);
  expect(
    screen.getByRole("button", { name: /start game/i })
  ).toBeInTheDocument();
  expect(screen.getByTestId("score")).toHaveTextContent("0");
  expect(screen.getByTestId("timer")).toHaveTextContent(`${GAME_DURATION}s`);
});

test("counts down 3-2-1-GO before the game starts", () => {
  render(<App />);
  fireEvent.click(screen.getByRole("button", { name: /start game/i }));

  expect(screen.getByText("3")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(screen.getByText("2")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(screen.getByText("1")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(screen.getByText("GO!")).toBeInTheDocument();

  act(() => {
    jest.advanceTimersByTime(1000);
  });
  expect(screen.getByRole("button", { name: /target/i })).toBeInTheDocument();
});

test("starting the game shows the target and does not award a free point", () => {
  render(<App />);
  startGame();

  expect(screen.getByRole("button", { name: /target/i })).toBeInTheDocument();
  expect(screen.getByTestId("score")).toHaveTextContent("0");
});

test("clicking the target increases the score", () => {
  render(<App />);
  startGame();

  const target = screen.getByRole("button", { name: /target/i });
  fireEvent.click(target);
  fireEvent.click(target);
  fireEvent.click(target);

  expect(screen.getByTestId("score")).toHaveTextContent("3");
});

test("timer counts down during the game", () => {
  render(<App />);
  startGame();

  act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(screen.getByTestId("timer")).toHaveTextContent("28s");
});

test("shows game over after the time runs out", () => {
  render(<App />);
  startGame();

  act(() => {
    jest.advanceTimersByTime(GAME_DURATION * 1000);
  });

  expect(screen.getByText(/game over/i)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /play again/i })).toBeInTheDocument();
});

test("stops counting once the game is over", () => {
  render(<App />);
  startGame();

  act(() => {
    jest.advanceTimersByTime(GAME_DURATION * 1000);
  });

  act(() => {
    jest.advanceTimersByTime(5000);
  });

  expect(screen.getByTestId("timer")).toHaveTextContent("0s");
});

test("saves the score as a new best score", () => {
  render(<App />);
  startGame();

  const target = screen.getByRole("button", { name: /target/i });
  fireEvent.click(target);
  fireEvent.click(target);
  fireEvent.click(target);

  act(() => {
    jest.advanceTimersByTime(GAME_DURATION * 1000);
  });

  expect(screen.getByTestId("final-score")).toHaveTextContent("3");
  expect(screen.getByTestId("result-message")).toHaveTextContent(
    /new best score/i
  );
  expect(window.localStorage.getItem("clickGameBest")).toBe("3");
});

test("restarting from game over begins a fresh game", () => {
  render(<App />);
  startGame();

  const target = screen.getByRole("button", { name: /target/i });
  fireEvent.click(target);
  fireEvent.click(target);

  act(() => {
    jest.advanceTimersByTime(GAME_DURATION * 1000);
  });

  fireEvent.click(screen.getByRole("button", { name: /play again/i }));
  skipCountdown();

  expect(screen.getByRole("button", { name: /target/i })).toBeInTheDocument();
  expect(screen.getByTestId("score")).toHaveTextContent("0");
  expect(screen.getByTestId("timer")).toHaveTextContent(`${GAME_DURATION}s`);
});

test("lets the player set the round time", () => {
  render(<App />);

  const timeInput = screen.getByLabelText(/time/i);
  fireEvent.change(timeInput, { target: { value: "10" } });

  expect(screen.getByTestId("timer")).toHaveTextContent("10s");

  fireEvent.click(screen.getByRole("button", { name: /start game/i }));
  skipCountdown();

  expect(screen.getByRole("button", { name: /target/i })).toBeInTheDocument();
  expect(screen.getByTestId("timer")).toHaveTextContent("10s");

  act(() => {
    jest.advanceTimersByTime(10 * 1000);
  });

  expect(screen.getByText(/game over/i)).toBeInTheDocument();
});

test("clamps the round time to the allowed range", () => {
  render(<App />);

  const timeInput = screen.getByLabelText(/time/i);
  fireEvent.change(timeInput, { target: { value: "999" } });
  expect(screen.getByTestId("timer")).toHaveTextContent("120s");

  fireEvent.change(timeInput, { target: { value: "-3" } });
  expect(screen.getByTestId("timer")).toHaveTextContent("5s");
});

test("records the player's name and score in the leaderboard", () => {
  render(<App />);

  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: "小明" },
  });
  startGame();

  const target = screen.getByRole("button", { name: /target/i });
  fireEvent.click(target);
  fireEvent.click(target);
  fireEvent.click(target);

  act(() => {
    jest.advanceTimersByTime(GAME_DURATION * 1000);
  });

  const list = screen.getByRole("list");
  expect(list.textContent).toContain("小明");
  expect(list.textContent).toContain("3");
  expect(window.localStorage.getItem("clickGameLeaderboard")).toContain("小明");
  expect(window.localStorage.getItem("clickGameLeaderboard")).toContain("3");
});

test("sorts the leaderboard by score and keeps the top entries", () => {
  window.localStorage.setItem(
    "clickGameLeaderboard",
    JSON.stringify([{ name: "阿婆", score: 2, duration: 30 }])
  );

  render(<App />);

  fireEvent.change(screen.getByLabelText(/name/i), {
    target: { value: "阿公" },
  });
  startGame();

  const target = screen.getByRole("button", { name: /target/i });
  fireEvent.click(target);
  fireEvent.click(target);
  fireEvent.click(target);
  fireEvent.click(target);
  fireEvent.click(target);

  act(() => {
    jest.advanceTimersByTime(GAME_DURATION * 1000);
  });

  const entries = screen.getAllByRole("listitem");
  expect(entries[0].textContent).toContain("阿公");
  expect(entries[0].textContent).toContain("5");
  expect(entries[1].textContent).toContain("阿婆");
  expect(entries[1].textContent).toContain("2");
});

test("does not record a zero-score round in the leaderboard", () => {
  render(<App />);
  startGame();

  act(() => {
    jest.advanceTimersByTime(GAME_DURATION * 1000);
  });

  expect(window.localStorage.getItem("clickGameLeaderboard")).toBeNull();
  expect(screen.getByText(/未有紀錄/i)).toBeInTheDocument();
});
