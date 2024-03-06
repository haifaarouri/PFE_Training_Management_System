import { configureStore } from "@reduxjs/toolkit";
import authenticatedUserSlice from "./slices/authenticatedUserSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import successMessageSlice from "./slices/successMessageSlice";

const persistConfig = {
  key: "root",
  storage,
};

const persistedUserReducer = persistReducer(
  persistConfig,
  authenticatedUserSlice
);

export const store = configureStore({
  reducer: {
    //reducer contains all slices
    user: persistedUserReducer,
    msg: successMessageSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
