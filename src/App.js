import { useState, useEffect } from "react";
import { Input, Button, message } from "antd";

const GRID_SIZE = 10;

function App() {
  const [snake, setSnake] = useState([]);
  const [food, setFood] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (loggedIn) {
      startGame();
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [loggedIn]);

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

  const handleLogin = async () => {
    const res = await fetch("http://localhost:8081/game/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    
    if (data.status === "200") {
      message.success("登录成功！");
      setLoggedIn(true);
    } else {
      message.error("账号或密码错误");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!loggedIn ? (
        <div style={{ maxWidth: "300px", margin: "auto" }}>
          <h2>用户登录</h2>
          <Input 
            placeholder="用户名" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            style={{ marginBottom: "10px" }} 
          />
          <Input.Password 
            placeholder="密码" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ marginBottom: "10px" }} 
          />
          <Button type="primary" onClick={handleLogin} block>登录</Button>
        </div>
      ) : (
        <div>
          <h1>贪吃蛇</h1>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`,
              gap: "2px",
              justifyContent: "center",
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
          <Button onClick={startGame} style={{ marginTop: "10px" }}>重新开始</Button>
        </div>
      )}
    </div>
  );
}

export default App;
