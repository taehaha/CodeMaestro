import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // 로컬 스토리지 사용
import persistedReducer from "./userSlice";

const persistConfig = {
  key: "user", // 저장할 상태의 키
  storage, // 상태를 저장할 스토리지 (로컬 스토리지)
};

const persistedUserReducer = persistReducer(persistConfig, persistedReducer);

const store = configureStore({
  reducer: {
    user: persistedUserReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // 직렬화 검사 비활성화
    }),
});

export const persistor = persistStore(store);
export default store;
