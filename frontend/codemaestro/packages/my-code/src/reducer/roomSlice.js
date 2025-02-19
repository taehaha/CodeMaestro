import { createSlice } from '@reduxjs/toolkit';

const roomSlice = createSlice({
  name: "room",
  initialState: {
    roomList: [],
    detailRoomInfo: {},
    setting: {
      camera: false,
      audio: false,
      accesscode: null,
    },
  },
  reducers: {
    // setting 객체를 업데이트하기 위한 리듀서
    updateSetting: (state, action) => {
      // action.payload로 전달된 값만 바꿔치기
      state.setting = {
        ...state.setting,
        ...action.payload, 
      };
    },
  },
});

export const { updateSetting } = roomSlice.actions;
export default roomSlice.reducer;
