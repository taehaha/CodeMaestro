// userSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { signin, signout, signup, getUserInfo } from "../api/AuthApi";
import tokenStorage from "../utils/tokenstorage";
import Swal from "sweetalert2";
// 1) 로그인
export const loginUser = createAsyncThunk(
  "user/login",
  async (payload, { dispatch }) => {
    const response = await signin(payload);
    const accessToken = response.headers["access"];
    if (accessToken) {
      tokenStorage.setAccessToken(accessToken);
      // 로그인 성공 시, 유저 정보를 별도로 불러오기
      dispatch(getMyInfo());
    }
    return response;
  }
);


// 2) 로그아웃
export const logoutUser = createAsyncThunk("user/logout", async () => {
  const res = await signout();
  tokenStorage.removeAccessToken();
  Swal.fire({
    "title":"로그아웃",
    "text":"로그아웃이 완료되었습니다.",
  }).then((result)=>{
    if (result.isConfirmed) {
      window.location.replace("/");
    }
    })
  return res;
});

// 3) 내 정보 조회
export const getMyInfo = createAsyncThunk("user/getMyInfo", async () => {
  const response = await getUserInfo();
  console.log(response);
  
  return response;
});

// Slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    myInfo: {
      id: 'kopybara8421',
      name: '익명의 카피바라 8421',
      email: 'test@test.com',
      description: '오늘도 열심히 코딩합시다',
      tier: 27,
      // profile_image_url,
  },
    isLoggedIn: false,
  },


  extraReducers: (builder) => {
    // 로그인 성공
    builder.addCase(loginUser.fulfilled, (state, action) => {
      if (action.payload?.status === 200) {
        console.log(action.payload);        
        state.isLoggedIn = true;
        state.myInfo = getMyInfo();
      }
    });

    // 로그아웃 성공
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.myInfo = null;
      state.isLoggedIn = false;
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
