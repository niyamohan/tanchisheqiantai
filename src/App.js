import { useState, useEffect } from "react";

const GRID_SIZE = 10;

function App() {
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState([]);

  useEffect(() => {
    startGame();
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const startGame = async () => {
    const res = await fetch("http://localhost:8081/game/start", { method: "POST" });
    const data = await res.json();
    setSnake(data.snake);
    setFood(data.food);
  };

  const handleKeyPress = async (event) => {
    let direction = null;
    if (event.key === "ArrowUp") direction = "up";
    if (event.key === "ArrowDown") direction = "down";
    if (event.key === "ArrowLeft") direction = "left";
    if (event.key === "ArrowRight") direction = "right";
    if (!direction) return;

    const res = await fetch(`http://localhost:8081/game/move/${direction}`, { method: "POST" });
    const data = await res.json();
    setSnake(data.snake);
    setFood(data.food);
  };

  return (
    <div>
      <h1>贪吃蛇</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
          gap: "2px",
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(([sx, sy]) => sx === x && sy === y);
          const isFood = food[0] === x && food[1] === y;
          return (
            <div
              key={i}
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: isSnake ? "green" : isFood ? "red" : "white",
                border: "1px solid black",
              }}
            />
          );
        })}
      </div>
      <button onClick={startGame}>重新开始</button>
    </div>
  );
}

export default App;
