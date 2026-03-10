import { useState, useEffect, useRef, useCallback } from "react";
import { IconDeviceMobile } from "@tabler/icons-react";

type Direction = "up" | "down" | "left" | "right";
type Point = { x: number; y: number };

export type DirInput = { dir: Direction; n: number };

const COLS = 12;
const ROWS = 15;
const INITIAL_SPEED = 200;
const SPEED_DECREMENT = 25;
const MIN_SPEED = 80;

const INITIAL_SNAKE: Point[] = [
  { x: 6, y: 7 },
  { x: 6, y: 8 },
  { x: 6, y: 9 },
];

function randomFood(snake: Point[]): Point {
  let food: Point;
  do {
    food = {
      x: Math.floor(Math.random() * COLS),
      y: Math.floor(Math.random() * ROWS),
    };
  } while (snake.some((s) => s.x === food.x && s.y === food.y));
  return food;
}

type Props = {
  dirInput: DirInput | null;
  onGameEnd: () => void;
};

function SnakeGame({ dirInput, onGameEnd }: Props) {
  const initialFood = useRef(randomFood(INITIAL_SNAKE));

  const stateRef = useRef({
    snake: INITIAL_SNAKE,
    food: initialFood.current,
    dir: "up" as Direction,
    pendingDir: "up" as Direction,
    score: 0,
    speed: INITIAL_SPEED,
  });

  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Point>(initialFood.current);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [gameOver, setGameOver] = useState(false);

  const onGameEndRef = useRef(onGameEnd);
  useEffect(() => {
    onGameEndRef.current = onGameEnd;
  });

  // Update pending direction on each button press
  useEffect(() => {
    if (!dirInput || gameOver) return;
    const current = stateRef.current.dir;
    const { dir } = dirInput;
    // Prevent reversing direction
    if (
      (dir === "up" && current === "down") ||
      (dir === "down" && current === "up") ||
      (dir === "left" && current === "right") ||
      (dir === "right" && current === "left")
    )
      return;
    stateRef.current.pendingDir = dir;
  }, [dirInput, gameOver]);

  const tick = useCallback(() => {
    const s = stateRef.current;
    s.dir = s.pendingDir;

    const head = s.snake[0];
    const newHead: Point = {
      x: head.x + (s.dir === "right" ? 1 : s.dir === "left" ? -1 : 0),
      y: head.y + (s.dir === "down" ? 1 : s.dir === "up" ? -1 : 0),
    };

    // Out of bounds — game over
    if (newHead.x < 0 || newHead.x >= COLS || newHead.y < 0 || newHead.y >= ROWS) {
      setGameOver(true);
      return;
    }

    const ateFood = newHead.x === s.food.x && newHead.y === s.food.y;
    const newSnake = ateFood
      ? [newHead, ...s.snake]
      : [newHead, ...s.snake.slice(0, -1)];

    stateRef.current.snake = newSnake;

    if (ateFood) {
      const newScore = s.score + 1;
      const newFood = randomFood(newSnake);
      const newSpeed = Math.max(MIN_SPEED, s.speed - SPEED_DECREMENT);
      stateRef.current.score = newScore;
      stateRef.current.food = newFood;
      stateRef.current.speed = newSpeed;
      setScore(newScore);
      setFood(newFood);
      setSpeed(newSpeed);
    }

    setSnake([...newSnake]);
  }, []);

  // Game loop — restarts when speed changes
  useEffect(() => {
    if (gameOver) return;
    const id = setInterval(tick, speed);
    return () => clearInterval(id);
  }, [speed, gameOver, tick]);

  // Return to phone home after game over
  useEffect(() => {
    if (!gameOver) return;
    const timer = setTimeout(() => onGameEndRef.current(), 3000);
    return () => clearTimeout(timer);
  }, [gameOver]);

  const snakeSet = new Set(snake.map((s) => `${s.x},${s.y}`));

  if (gameOver) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          gap: "6px",
          color: "#000",
          textAlign: "center",
          padding: "1rem",
        }}
      >
        <div style={{ fontSize: "1.2rem", fontWeight: "bold", letterSpacing: "0.05em" }}>
          GAME OVER
        </div>
        <div style={{ fontSize: "1rem" }}>
          <IconDeviceMobile size={14} style={{ verticalAlign: "middle", marginRight: 4 }} />
          {score}
        </div>
        <div style={{ fontSize: "0.65rem", marginTop: "8px", color: "#444" }}>
          returning to menu...
        </div>
      </div>
    );
  }

  const cells = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const key = `${x},${y}`;
      const isHead = snake[0].x === x && snake[0].y === y;
      const isBody = !isHead && snakeSet.has(key);
      const isFood = food.x === x && food.y === y;

      cells.push(
        <div
          key={key}
          style={{
            background: isHead ? "#1a1a1a" : isBody ? "#444" : "transparent",
            borderRadius: isHead ? "2px" : isBody ? "1px" : 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isFood && <IconDeviceMobile size={24} color="#222" />}
        </div>
      );
    }
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          textAlign: "center",
          fontSize: "0.65rem",
          color: "#333",
          padding: "2px 0",
          borderBottom: "1px solid rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "3px",
          flexShrink: 0,
        }}
      >
        <IconDeviceMobile size={10} />
        {score}
      </div>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          overflow: "hidden",
        }}
      >
        {cells}
      </div>
    </div>
  );
}

export default SnakeGame;
