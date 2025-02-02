// userSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { signin, signout, signup, getUserInfo } from "../api/AuthApi";
import tokenStorage from "../utils/tokenstorage";
// 1) 로그인
export const loginUser = createAsyncThunk("user/login", async (payload) => {
  const response = await signin(payload);
  const accessToken = response.headers['access-token'];

  if (accessToken) {
    // 메모리에 저장 (가장 중요한 부분)
    tokenStorage.setAccessToken(accessToken);
  }

  return response; 
});

// 2) 로그아웃
export const logoutUser = createAsyncThunk("user/logout", async () => {
  const res = await signout();
  return res;
});

// 3) 내 정보 조회
export const getMyInfo = createAsyncThunk("user/getMyInfo", async () => {
  const response = await getUserInfo();
  return response;
});

// Slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    myInfo: null,
    isLoggedIn: false,
  },
  reducers: {
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    TempgetMyInfo: (state, action) => {
      state.myInfo = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.myInfo = null;
      state.isLoggedIn = false;
      },
  },
  extraReducers: (builder) => {
    // 로그인 성공
    builder.addCase(loginUser.fulfilled, (state, action) => {
      if (action.payload?.status === 200) {
        state.isLoggedIn = true;
        // state.accessToken = action.payload.token; // 제거하거나 사용 안 함
        state.myInfo = action.payload.user; // 백엔드 응답에 user 정보가 있다면
      }
    });

    // 로그아웃 성공
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.myInfo = null;
      state.isLoggedIn = false;
      tokenStorage.removeAccessToken();
    });

    // 내 정보 조회
    builder.addCase(getMyInfo.fulfilled, (state, action) => {
      state.myInfo = action.payload;
    });
    builder.addCase(getMyInfo.rejected, (state, action) => {
      console.error("유저 정보 요청 실패:", action.error.message);
    });
  },
});

export const { TempgetMyInfo, logout } = userSlice.actions;
export default userSlice.reducer;
