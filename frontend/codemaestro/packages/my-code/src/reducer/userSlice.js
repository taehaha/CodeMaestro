// userSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { signin, signout, getUserInfo } from "../api/AuthApi";
import { getFriendsInfo } from "../api/FriendApi";
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
    title: "로그아웃",
    text: "로그아웃이 완료되었습니다.",
    icon: "success",
    iconColor:"#5FD87D",
    width: "500px",
    background: "#f8f9fa",
    confirmButtonColor: "#FFCC00",
    confirmButtonText: "확인",
    customClass: {
      popup: "swal-custom-popup",       // 전체 팝업 스타일
      title: "swal-custom-title",       // 제목 스타일
      htmlContainer: "swal-custom-text", // 본문 텍스트 스타일
      confirmButton: "swal-custom-button" // 버튼 스타일
    }
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
  return response;
});

// 4) 친구 목록 조회
export const getFriends = createAsyncThunk("user/getFriends", async (userId) => {
  const response = await getFriendsInfo(userId);
  return response;
})


// Slice
const userSlice = createSlice({
  name: "user",
  initialState: {
    myInfo: {},
    isLoggedIn: false,
    friends: [],
  },
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    // 세션 만료 등으로 인한 강제 로그아웃 시 호출하여 상태를 변경할 수 있음

    setLoggedOut: (state) => {
      state.myInfo = null;
      state.isLoggedIn = false;
    },
  },


  extraReducers: (builder) => {
    // 로그인 성공
    builder.addCase(loginUser.fulfilled, (state, action) => {
      if (action.payload?.status === 200) {
        // console.log(action.payload);        
        state.isLoggedIn = true;
        state.myInfo = getMyInfo();
      }
    });

    // 로그아웃 성공
    builder.addCase(logoutUser.fulfilled,  (state) => {
      state.myInfo =  null;
      state.isLoggedIn = false;
    });

    // 내 정보 조회
    builder.addCase(getMyInfo.fulfilled, (state, action) => {
      state.myInfo = action.payload;
    });
    builder.addCase(getMyInfo.rejected, (state, action) => {
      console.error("유저 정보 요청 실패:", action.error.message);
    });

    builder.addCase(getFriends.fulfilled, (state, action) => {
      state.friends = action.payload;
    });

  },
});

export const { setLoggedOut,setLoggedIn, logout } = userSlice.actions;
export default userSlice.reducer;
