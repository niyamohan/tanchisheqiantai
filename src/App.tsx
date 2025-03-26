import React, { useEffect, useState, useCallback } from "react";
import { Input, Button, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import { login, logout } from "./slices/authSlice";
import { setSnake, setFood } from "./slices/gameSlice";

const GRID_SIZE = 10;
type Position = [number, number];

function App() {
  const dispatch = useDispatch();
  const loggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const username = useSelector((state: RootState) => state.auth.username);
  const snake = useSelector((state: RootState) => state.game.snake);
  const food = useSelector((state: RootState) => state.game.food);

  // 存储用户名和密码
  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState("");

  const startGame = useCallback(async () => {
    const res = await fetch("http://localhost:8081/game/start", { method: "POST" });
    const data: { snake: Position[]; food: Position } = await res.json();
    dispatch(setSnake(data.snake));
    dispatch(setFood(data.food));
  }, [dispatch]);

  const handleKeyPress = useCallback(async (event: KeyboardEvent) => {
    let direction: "up" | "down" | "left" | "right" | null = null;
    if (event.key === "ArrowUp") direction = "up";
    if (event.key === "ArrowDown") direction = "down";
    if (event.key === "ArrowLeft") direction = "left";
    if (event.key === "ArrowRight") direction = "right";
    if (!direction) return;

    const res = await fetch(`http://localhost:8081/game/move/${direction}`, { method: "POST" });
    const data: { snake: Position[]; food: Position } = await res.json();
    dispatch(setSnake(data.snake));
    dispatch(setFood(data.food));
  }, [dispatch]);

  useEffect(() => {
    if (loggedIn) {
      startGame();
      const handleKey = (event: KeyboardEvent) => handleKeyPress(event);
      window.addEventListener("keydown", handleKey);

      // 清理事件监听器
      return () => {
        window.removeEventListener("keydown", handleKey);
      };
    }

    return undefined; // 解决 ts(7030) 错误
  }, [loggedIn, handleKeyPress, startGame]);

  const handleLogin = async () => {
    if (!inputUsername || !password) {
      message.error("请输入用户名和密码");
      return;
    }

    const res = await fetch("http://localhost:8081/game/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: inputUsername, password }),
    });

    const data: { status: string } = await res.json();

    if (data.status === "200") {
      dispatch(login(inputUsername));
      message.success("登录成功！");
    } else {
      message.error("账号或密码错误");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    message.info("已登出");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {!loggedIn ? (
        <div style={{ maxWidth: "300px", margin: "auto" }}>
          <h2>用户登录</h2>
          <Input
            placeholder="用户名"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Input.Password
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "10px" }}
          />
          <Button type="primary" onClick={handleLogin} block>
            登录
          </Button>
        </div>
      ) : (
        <div>
          <h1>贪吃蛇</h1>
          <p>欢迎，{username}！</p>
          <Button onClick={handleLogout}>登出</Button>
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
          <Button onClick={startGame} style={{ marginTop: "10px" }}>
            重新开始
          </Button>
        </div>
      )}
    </div>
  );
}

export default App;
