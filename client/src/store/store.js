import { configureStore } from '@reduxjs/toolkit';
import roomReducer from "../reducer/roomReducer";

// 스토어 생성
const store = configureStore({
  reducer: {
    roomInfo: roomReducer
  }
});

export default store;