import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import chatReducer from "./slices/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Tắt check serializable cho Supabase Session object để tránh warning log phiền phức
        ignoredActions: ["auth/checkSession/fulfilled", "auth/signInUser/fulfilled"],
        ignoredPaths: ["auth.session"],
      },
    }),
});

export default store;
