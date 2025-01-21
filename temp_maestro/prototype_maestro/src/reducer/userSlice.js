import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import persistReducer from 'redux-persist/lib/persistReducer';
import storage from 'redux-persist/lib/storage';
// import { login, logout, getUserInfo } from "../api/userApi";

// export const logoutUser = createAsyncThunk("user/logout", async () => {
//   await logout()
//   return true;
// })

// export const getMyInfo = createAsyncThunk("user/getMyInfo", async ()=> {
//   const response = await getUserInfo()
//   return response;
// })

const userSlice = createSlice(
  {
  
  name: "user",
  initialState: {
    accessToken: null,
    myInfo: null,
    isLoggedIn: false,
  },
  reducers: {
    getMyInfo: (state, action) => {
      // access 토큰으로 유저 정보 확인 api 보내고, res를 set하는 형식
      state.myInfo = action.payload;
      state.isLoggedIn = true;},

      logout: (state) => {
        state.myInfo = null; // 유저 정보 초기화
        state.isLoggedIn = false; // 로그인 상태 초기화
      },
  },

  // extraReducers: (builder) => {

  //   //로그아웃 후 추가동작. 비동기 작업 후 상태관리는 reducer가 아닌 extrareducer에서 addcase로 처리
  //   builder.addCase(logoutUser.fulfilled, (state) => {
  //     state.myInfo = null;
  //     state.isLoggedIn = false;

  //   builder.addCase(getMyInfo.fulfilled, (state, action)=> {
  //     state.myInfo = action.payload;
  //     state.isLoggedIn = true
  //   })
  //   })
  // }
});

const persistConfig = {
    key: 'user',
    storage,
  };

const persistedReducer = persistReducer(persistConfig, userSlice.reducer);

export const { getMyInfo, logout } = userSlice.actions; // 액션 내보내기 지금은 더미 테스트용

export default persistedReducer; // 리듀서 기본 내보내기
