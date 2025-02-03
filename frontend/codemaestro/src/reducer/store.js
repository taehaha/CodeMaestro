// store.js
import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// userSlice의 기본 export는 reducer 함수이므로, 이름을 userReducer로 변경
import userReducer from "./userSlice";
import roomReducer from "./roomSlice";

const userPersistConfig = {
  key: "persistedUser",
  storage,
};

const roomPersistConfig = {
  key: "persistedRoom",
  storage,
};

const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedRoomReducer = persistReducer(roomPersistConfig, roomReducer);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    room: persistedRoomReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export default store;
