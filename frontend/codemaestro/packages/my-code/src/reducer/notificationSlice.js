// features/notifications/notificationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFriendRequest } from '../api/FriendApi';
import { getGroupRequest } from '../api/GroupApi';
// 비동기 thunk: 서버의 알림 목록을 가져옵니다.

export const fetchRequests = async (userId) => {
    try {
      // 친구 요청과 그룹 요청을 병렬로 호출
      const [friendRequests, groupRequests] = await Promise.all([
        getFriendRequest(userId),
        getGroupRequest(userId),
      ]);
  
      // 각 요청 객체에 type 태그를 추가합니다.
      const friendRequestsTagged = friendRequests.map((item) => ({
        ...item,
        type: "friend",
      }));
  
      const groupRequestsTagged = groupRequests.map((item) => ({
        ...item,
        type: "group",
      }));
  
      // 두 배열을 합쳐 반환합니다.
      return [...friendRequestsTagged, ...groupRequestsTagged];
    } catch (error) {
      console.error("요청 목록 통합 중 오류 발생", error);
      return [];
    }
  };


  export const fetchNotifications = createAsyncThunk(
    "notifications/fetchAllRequests",
    async (userId, thunkAPI) => {
      try {
        const requests = await fetchRequests(userId);
        return requests;
      } catch (error) {
        return thunkAPI.rejectWithValue("요청 목록을 불러오는데 실패했습니다.");
      }
    }
  );

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],      // 알림 객체 배열
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    // (개별 알림 추가가 필요한 경우 사용)
    addNotification: (state, action) => {
      state.items.push(action.payload);
    },
    // 알림 하나 제거 (예: 수락/거절 후)
    removeNotification: (state, action) => {
      state.items = state.items.filter(notification => notification.requestId !== action.payload);
    },
    // 전체 알림 클리어
    clearNotifications: state => {
      state.items = [];
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // 전체 목록을 최신 데이터로 덮어씁니다.
        state.items = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { addNotification, removeNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
