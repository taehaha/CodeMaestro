import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { signin,signout,signup,getUserInfo } from "../api/AuthApi";


// 로그인, 로그아웃, 정보 가져오기 비동기요청

export const getMyInfo = createAsyncThunk("user/getMyInfo", async ()=> {
  const response = await getUserInfo()
  return response;
})

export const loginUser = createAsyncThunk("user/login", async (payload) => {
  const dispatch = useDispatch()
  await signin(payload)
  dispatch(getMyInfo())
  return true;
})

export const logoutUser = createAsyncThunk("user/logout", async () => {
  await signout()
  return true;
})

const userSlice = createSlice(
  {
  
  name: "user",

  initialState: {
    accessToken: null,
    myInfo: null,
    isLoggedIn: false,
  },

  reducers: {
    setIsLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },

    TempgetMyInfo: (state, action) => {
      // access 토큰으로 유저 정보 확인 api 보내고, res를 set하는 형식
      // 얘네 둘은 연결되면 바로 지워야함
      state.myInfo = action.payload;
      state.isLoggedIn = true;},

      logout: (state) => {
        state.myInfo = null; // 유저 정보 초기화
        state.isLoggedIn = false; // 로그인 상태 초기화
      },
  },

  extraReducers: (builder) => {
    //로그아웃 후 추가동작. 비동기 작업 후 상태관리는 reducer가 아닌 extrareducer에서 addcase로 처리
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.myInfo = null;
      state.isLoggedIn = false;
    });

    builder.addCase(getMyInfo.fulfilled, (state, action)=> {
      state.myInfo = action.payload;
    });

    builder.addCase(getMyInfo.rejected, (state, action) => {
      console.error("유저 정보 요청 실패:", action.error.message);
    });
    }
  }
);



export const { TempgetMyInfo, logout } = userSlice.actions; // 액션 내보내기 지금은 더미 테스트용

export default userSlice.reducer; // 리듀서 기본 내보내기
