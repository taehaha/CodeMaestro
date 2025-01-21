// eslint-disable-next-line no-unused-vars
import { createSlice,createAsyncThunk } from '@reduxjs/toolkit';
// eslint-disable-next-line no-unused-vars
import { getRoomList,getRoomDetail } from '../api/RoomApi';

// axios는 주석처리
// export const fetchRoomList = createAsyncThunk("room/getRoomList", async () => {
//   const response = await getRoomList()
//   return response;
// })

// export const fetchRoomDetail = createAsyncThunk("user/getRoomDetail", async ()=> {
//   const response = await getRoomDetail()
//   return response;
// })

const roomSlice = createSlice({
    name: "room",
    initialState: {
      roomList: [],
      detailRoomInfo: {},
    },
    reducers: {    
        tempRoomList: (state, action) => {
        state.roomList = action.payload;},
    
        tempRoomDetail: (state, action) => {
        state.detailRoomInfo = action.payload;},
        },

    }) 

export default roomSlice.reducer;
