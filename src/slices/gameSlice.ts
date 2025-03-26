import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface GameState { // 确保这个接口是 `export` 的
  snake: [number, number][];
  food: [number, number];
}

const initialState: GameState = {
  snake: [[5, 5]],
  food: [0, 0],
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
  },
});

export const { setSnake, setFood } = gameSlice.actions;
export default gameSlice.reducer;
