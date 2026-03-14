import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameState {
  snake: [number, number][];
  food: [number, number];
  isGameOver: boolean;
}

const initialState: GameState = {
  snake: [[5, 5]],
  food: [0, 0],
  isGameOver: false,
};

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setSnake: (state, action: PayloadAction<[number, number][]>) => {
      state.snake = action.payload;
    },
    setFood: (state, action: PayloadAction<[number, number]>) => {
      state.food = action.payload;
    },
    setGameOver: (state, action: PayloadAction<boolean>) => {
      state.isGameOver = action.payload;
    },
    resetGame: (state) => {
      state.snake = [[5, 5]];
      state.food = [0, 0];
      state.isGameOver = false;
    }
  },
});

export const { setSnake, setFood, setGameOver, resetGame } = gameSlice.actions;
export default gameSlice.reducer;
