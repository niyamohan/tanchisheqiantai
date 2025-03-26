import { configureStore } from "@reduxjs/toolkit";
import authReducer, { AuthState } from "./slices/authSlice"; // 确保 AuthState 被导出
import gameReducer, { GameState } from "./slices/gameSlice"; // 确保 GameState 被导出

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer,
  },
});

export type RootState = {
  auth: AuthState;
  game: GameState;
};

export type AppDispatch = typeof store.dispatch;
