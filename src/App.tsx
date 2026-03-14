import React, { useEffect, useState, useCallback, useRef } from "react";
import { Input, Button, message, Card, Typography, Space, Form, Modal, Table } from "antd";
import { UserOutlined, LockOutlined, LogoutOutlined, ReloadOutlined, TrophyOutlined, BarChartOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "./store";
import { login, logout } from "./slices/authSlice";
import { setSnake, setFood, setGameOver, resetGame } from "./slices/gameSlice";
import "./App.css";

const { Title, Text } = Typography;
const GRID_SIZE = 10;
const MOVE_INTERVAL = 400; // 400ms 移动一次
type Position = [number, number];

interface Ranking {
  username: string;
  highScore: number;
}

function App() {
  const dispatch = useDispatch();
  const loggedIn = useSelector((state: RootState) => state.auth.loggedIn);
  const username = useSelector((state: RootState) => state.auth.username);
  const snake = useSelector((state: RootState) => state.game.snake);
  const food = useSelector((state: RootState) => state.game.food);
  const isGameOver = useSelector((state: RootState) => state.game.isGameOver);

  const [inputUsername, setInputUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRankings, setShowRankings] = useState(false);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  
  const directionRef = useRef<string | null>(null);

  const startGame = useCallback(async () => {
    if (!username) return;
    try {
      const res = await fetch(`http://localhost:8081/game/start?username=${username}`, { method: "POST" });
      const data = await res.json();
      dispatch(setSnake(data.snake));
      dispatch(setFood(data.food));
      dispatch(setGameOver(false));
      directionRef.current = null;
    } catch (error) {
      message.error("无法启动游戏，请检查后端连接");
    }
  }, [dispatch, username]);

  const moveSnake = useCallback(async (dir: string | null) => {
    if (!username || isGameOver) return;
    try {
      const targetDir = dir || "none";
      const res = await fetch(`http://localhost:8081/game/move/${targetDir}?username=${username}`, { method: "POST" });
      const data = await res.json();
      
      dispatch(setSnake(data.snake));
      dispatch(setFood(data.food));
      if (data.isGameOver) {
        dispatch(setGameOver(true));
      }
    } catch (error) {
      console.error("Move error:", error);
    }
  }, [dispatch, username, isGameOver]);

  const fetchRankings = async () => {
    setRankingLoading(true);
    try {
      const res = await fetch("http://localhost:8081/game/rankings");
      const data = await res.json();
      setRankings(data);
      setShowRankings(true);
    } catch (error) {
      message.error("无法获取排行榜数据");
    } finally {
      setRankingLoading(false);
    }
  };

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isGameOver) return;
    let newDir: string | null = null;
    if (event.key === "ArrowUp") newDir = "up";
    if (event.key === "ArrowDown") newDir = "down";
    if (event.key === "ArrowLeft") newDir = "left";
    if (event.key === "ArrowRight") newDir = "right";
    if (newDir) {
      event.preventDefault();
      directionRef.current = newDir;
      moveSnake(newDir);
    }
  }, [isGameOver, moveSnake]);

  useEffect(() => {
    if (loggedIn && !isGameOver) {
      const timer = setInterval(() => {
        moveSnake(directionRef.current);
      }, MOVE_INTERVAL);
      return () => clearInterval(timer);
    }
  }, [loggedIn, isGameOver, moveSnake]);

  useEffect(() => {
    if (loggedIn) {
      if (snake.length <= 1 && !isGameOver && directionRef.current === null) {
        startGame();
      }
      window.addEventListener("keydown", handleKeyPress);
      return () => window.removeEventListener("keydown", handleKeyPress);
    }
  }, [loggedIn, handleKeyPress, startGame, snake.length, isGameOver]);

  const handleLogin = async () => {
    if (!inputUsername || !password) {
      message.error("请输入用户名和密码");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8081/game/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: inputUsername, password }),
      });
      const data = await res.json();
      if (data.status === "200") {
        dispatch(login(inputUsername));
        message.success("登录成功！");
      } else {
        message.error("账号或密码错误");
      }
    } catch (error) {
      message.error("登录失败，请检查后端连接");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(resetGame());
    message.info("已登出");
  };

  const score = (snake.length - 1) * 10;

  const rankingColumns = [
    { title: '排名', dataIndex: 'index', key: 'index', render: (_: any, __: any, index: number) => index + 1 },
    { title: '玩家', dataIndex: 'username', key: 'username' },
    { title: '最高分', dataIndex: 'highScore', key: 'highScore', sorter: (a: Ranking, b: Ranking) => a.highScore - b.highScore, defaultSortOrder: 'descend' as const },
  ];

  return (
    <div className="App">
      {!loggedIn ? (
        <div className="login-container">
          <Card title={<Title level={3} style={{ textAlign: "center", margin: 0 }}>贪吃蛇大作战</Title>} bordered={false}>
            <Form layout="vertical" onFinish={handleLogin}>
              <Form.Item label="用户名" required><Input prefix={<UserOutlined />} placeholder="请输入用户名" value={inputUsername} onChange={(e) => setInputUsername(e.target.value)} size="large" /></Form.Item>
              <Form.Item label="密码" required><Input.Password prefix={<LockOutlined />} placeholder="请输入密码" value={password} onChange={(e) => setPassword(e.target.value)} size="large" /></Form.Item>
              <Form.Item><Button type="primary" htmlType="submit" loading={loading} block size="large">登录游戏</Button></Form.Item>
            </Form>
          </Card>
        </div>
      ) : (
        <div className="game-container">
          <div className="user-info">
            <Space><UserOutlined /><Text strong>{username}</Text></Space>
            <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout}>退出</Button>
          </div>

          <div className="game-header">
            <Title level={2} style={{ margin: 0 }}>贪吃蛇</Title>
            <div className="score-display">得分: {score}</div>
          </div>

          <div className="grid-board" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 22px)`, gap: "2px" }}>
            {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
              const x = i % GRID_SIZE;
              const y = Math.floor(i / GRID_SIZE);
              const isSnakeHead = snake.length > 0 && snake[0][0] === x && snake[0][1] === y;
              const isSnakeBody = snake.slice(1).some(([sx, sy]) => sx === x && sy === y);
              const isFood = food[0] === x && food[1] === y;
              let cellClass = "cell cell-empty";
              if (isSnakeHead) cellClass = "cell cell-snake-head";
              else if (isSnakeBody) cellClass = "cell cell-snake";
              else if (isFood) cellClass = "cell cell-food";
              return <div key={i} className={cellClass} />;
            })}
          </div>

          <div className="game-controls">
            <Space>
              <Button type="primary" icon={<ReloadOutlined />} onClick={startGame} size="large">重新开始</Button>
              <Button icon={<BarChartOutlined />} onClick={fetchRankings} size="large">排行榜</Button>
            </Space>
            <div style={{ marginTop: "10px" }}><Text type="secondary">使用方向键控制，蛇会自动前进</Text></div>
          </div>

          <Modal
            title={<Title level={3}><TrophyOutlined style={{ color: '#faad14' }} /> 游戏结束</Title>}
            open={isGameOver}
            onOk={startGame}
            onCancel={() => dispatch(setGameOver(false))}
            footer={[
              <Button key="rank" icon={<BarChartOutlined />} onClick={fetchRankings}>查看排名</Button>,
              <Button key="restart" type="primary" onClick={startGame}>再来一局</Button>
            ]}
            centered
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff' }}>{score}</div>
              <Text type="secondary">最终得分</Text>
            </div>
          </Modal>

          <Modal
            title={<Title level={3}><BarChartOutlined /> 全球排行榜</Title>}
            open={showRankings}
            onOk={() => setShowRankings(false)}
            onCancel={() => setShowRankings(false)}
            width={500}
            footer={[<Button key="close" type="primary" onClick={() => setShowRankings(false)}>知道了</Button>]}
          >
            <Table 
              dataSource={rankings} 
              columns={rankingColumns} 
              pagination={false} 
              size="small" 
              loading={rankingLoading}
              rowKey="username"
            />
          </Modal>
        </div>
      )}
    </div>
  );
}

export default App;
