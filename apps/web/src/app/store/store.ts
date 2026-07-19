import { configureStore } from '@reduxjs/toolkit';
import { sessionReducer } from '@/entities/session';
import { chatReducer } from '@/entities/conversation';

export const makeStore = () =>
  configureStore({
    reducer: {
      session: sessionReducer,
      chat: chatReducer,
    },
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
