import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../config/supabase";

// Helper chuyển đổi username thành email ảo để tương thích với Supabase Auth
const getFakeEmail = (username) => `${username.toLowerCase().trim()}@roomchat.com`;

// 1. Kiểm tra session hiện tại (Auto login khi load trang)
export const checkSession = createAsyncThunk(
  "auth/checkSession",
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) return null;

      // Lấy thêm profile thông tin công khai của user
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      return {
        session,
        user: {
          id: session.user.id,
          email: session.user.email,
          username: profile?.username || session.user.user_metadata?.username,
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url,
        }
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 2. Thunk Đăng Ký
export const signUpUser = createAsyncThunk(
  "auth/signUpUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const email = getFakeEmail(username);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
          }
        }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 3. Thunk Đăng Nhập
export const signInUser = createAsyncThunk(
  "auth/signInUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const email = getFakeEmail(username);
      const { data: { session, user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Lấy profile thông tin công khai
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return {
        session,
        user: {
          id: user.id,
          email: user.email,
          username: profile?.username || user.user_metadata?.username,
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        }
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 4. Thunk Đăng Xuất
export const signOutUser = createAsyncThunk(
  "auth/signOutUser",
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return null;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 5. Thunk Cập nhật thông tin cá nhân & Upload Avatar lên Supabase Storage
export const updateUserProfile = createAsyncThunk(
  "auth/updateUserProfile",
  async ({ username, avatarFile }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const currentUser = state.auth.user;
      if (!currentUser) throw new Error("Chưa đăng nhập");

      let publicUrl = currentUser.avatar_url;

      // Nếu có chọn file ảnh mới -> xử lý upload lên Supabase Storage
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile, {
            cacheControl: "3600",
            upsert: true
          });

        if (uploadError) throw uploadError;

        // Lấy public URL của ảnh vừa upload
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        publicUrl = data.publicUrl;
      }

      // Cập nhật thông tin vào bảng profiles công khai
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .update({
          username,
          avatar_url: publicUrl
        })
        .eq("id", currentUser.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Đồng bộ thông tin mới vào user metadata của Supabase Auth
      await supabase.auth.updateUser({
        data: {
          username,
          avatar_url: publicUrl
        }
      });

      return {
        id: currentUser.id,
        email: currentUser.email,
        username: profile.username,
        avatar_url: profile.avatar_url
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  user: null,
  session: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Check Session
      .addCase(checkSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSession.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.session = action.payload.session;
        } else {
          state.user = null;
          state.session = null;
        }
      })
      .addCase(checkSession.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.session = null;
      })
      
      // Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Sign In
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Sign Out
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.session = null;
        state.loading = false;
      })

      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = false; // Không bật loading xoay vòng toàn app khi cập nhật profile để tránh gián đoạn chat
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
