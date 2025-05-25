import { useState, useEffect } from "react";
import "./App.css";

const DAY_COLOR = "#fffff0";
const DAY_BALL_COLOR = "#111111";
const NIGHT_COLOR = "#111111";
const NIGHT_BALL_COLOR = "#fffff0";
const SQUARE_SIZE = 25;
const MIN_SPEED = 5;
const MAX_SPEED = 10;
const GRID_COLS = 24; // e.g. 600px / 25px
const GRID_ROWS = 24; // e.g. 600px / 25px
const CANVAS_WIDTH = GRID_COLS * SQUARE_SIZE;
const CANVAS_HEIGHT = GRID_ROWS * SQUARE_SIZE;

function createInitialGrid() {
  const grid = [];
  for (let i = 0; i < GRID_ROWS; i++) {
    grid[i] = [];
    for (let j = 0; j < GRID_COLS; j++) {
      grid[i][j] = j < GRID_COLS / 2 ? DAY_COLOR : NIGHT_COLOR;
    }
  }
  return grid;
}

function getInitialBalls() {
  return [
    {
      x: CANVAS_WIDTH / 4,
      y: CANVAS_HEIGHT / 2,
      dx: 8,
      dy: -8,
      reverseColor: DAY_COLOR,
      ballColor: DAY_BALL_COLOR,
    },
    {
      x: (CANVAS_WIDTH / 4) * 3,
      y: CANVAS_HEIGHT / 2,
      dx: -8,
      dy: 8,
      reverseColor: NIGHT_COLOR,
      ballColor: NIGHT_BALL_COLOR,
    },
  ];
}

function App() {
  const [grid, setGrid] = useState(createInitialGrid());
  const [balls, setBalls] = useState(getInitialBalls());
  const [isRunning, setIsRunning] = useState(false);
  const [scores, setScores] = useState({ day: 0, night: 0 });

  // Helper: clamp speed
  function clampSpeed(val) {
    if (val > 0) return Math.max(MIN_SPEED, Math.min(val, MAX_SPEED));
    return Math.min(-MIN_SPEED, Math.max(val, -MAX_SPEED));
  }

  // Game loop
  useEffect(() => {
    if (!isRunning) return;
    let animationId;
    function step() {
      setBalls((prevBalls) => {
        return prevBalls.map((ball) => {
          let { x, y, dx, dy, reverseColor, ballColor } = ball;
          let newDx = dx;
          let newDy = dy;
          let newX = x + dx;
          let newY = y + dy;
          let bounced = false;
          // Check 8 points around the ball's circumference
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const checkX = newX + Math.cos(angle) * (SQUARE_SIZE / 2);
            const checkY = newY + Math.sin(angle) * (SQUARE_SIZE / 2);
            const i = Math.floor(checkY / SQUARE_SIZE);
            const j = Math.floor(checkX / SQUARE_SIZE);
            if (
              i >= 0 &&
              i < GRID_ROWS &&
              j >= 0 &&
              j < GRID_COLS &&
              grid[i][j] !== reverseColor
            ) {
              // Color the cell
              setGrid((oldGrid) => {
                const copy = oldGrid.map((row) => [...row]);
                copy[i][j] = reverseColor;
                return copy;
              });
              // Bounce direction
              if (Math.abs(Math.cos(angle)) > Math.abs(Math.sin(angle))) {
                newDx = -newDx;
              } else {
                newDy = -newDy;
              }
              bounced = true;
              break;
            }
          }
          // Bounce off canvas edges
          if (
            newX + newDx > CANVAS_WIDTH - SQUARE_SIZE / 2 ||
            newX + newDx < SQUARE_SIZE / 2
          ) {
            newDx = -newDx;
            bounced = true;
          }
          if (
            newY + newDy > CANVAS_HEIGHT - SQUARE_SIZE / 2 ||
            newY + newDy < SQUARE_SIZE / 2
          ) {
            newDy = -newDy;
            bounced = true;
          }
          // Add randomness
          newDx += Math.random() * 0.02 - 0.01;
          newDy += Math.random() * 0.02 - 0.01;
          newDx = clampSpeed(newDx);
          newDy = clampSpeed(newDy);
          return {
            ...ball,
            x: newX,
            y: newY,
            dx: newDx,
            dy: newDy,
          };
        });
      });
      animationId = requestAnimationFrame(step);
    }
    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [isRunning, grid]);

  // Score calculation
  useEffect(() => {
    let day = 0,
      night = 0;
    for (let i = 0; i < GRID_ROWS; i++) {
      for (let j = 0; j < GRID_COLS; j++) {
        if (grid[i][j] === DAY_COLOR) day++;
        if (grid[i][j] === NIGHT_COLOR) night++;
      }
    }
    setScores({ day, night });
  }, [grid]);

  // Reset game
  function startGame() {
    setGrid(createInitialGrid());
    setBalls(getInitialBalls());
    setIsRunning(true);
  }

  return (
    <div className="game-container">
      <div
        style={{
          position: "relative",
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          margin: "0 auto",
          background: "#F1F6F4",
        }}
      >
        {/* Render grid */}
        {grid.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                position: "absolute",
                left: j * SQUARE_SIZE,
                top: i * SQUARE_SIZE,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
                background: cell,
                boxSizing: "border-box",
                border: "1px solid #eee",
              }}
            />
          ))
        )}
        {/* Render balls */}
        {balls.map((ball, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              left: ball.x - SQUARE_SIZE / 2,
              top: ball.y - SQUARE_SIZE / 2,
              width: SQUARE_SIZE,
              height: SQUARE_SIZE,
              borderRadius: "50%",
              background: ball.ballColor,
              boxShadow: "0 0 8px 2px #0002",
              zIndex: 10,
            }}
          />
        ))}
      </div>
      <div className="controls">
        <button onClick={startGame} disabled={isRunning}>
          Start Game
        </button>
        <div className="scores">
          <span>Day Score: {scores.day}</span>
          <span>Night Score: {scores.night}</span>
        </div>
      </div>
    </div>
  );
}

export default App;
