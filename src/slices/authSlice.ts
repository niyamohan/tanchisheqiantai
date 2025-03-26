import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthState { // 确保这个接口是 `export` 的
  loggedIn: boolean;
  username: string;
}

const initialState: AuthState = {
  loggedIn: false,
  username: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.loggedIn = true;
      state.username = action.payload;
    },
    logout: (state) => {
      state.loggedIn = false;
      state.username = "";
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer; // 确保默认导出 reducer
