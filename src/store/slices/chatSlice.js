import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "../../config/supabase";

// 1. Fetch danh sách phòng chat
export const fetchRooms = createAsyncThunk(
  "chat/fetchRooms",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 2. Fetch tin nhắn theo roomId (Join kèm profile user)
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, created_at, user_id, user:profiles(id, username, avatar_url)")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 3. Tạo phòng mới
export const createRoom = createAsyncThunk(
  "chat/createRoom",
  async ({ roomName, isPrivate = false }, { rejectWithValue, dispatch }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase
        .from("rooms")
        .insert([{ name: roomName, created_by: session?.user?.id, is_private: isPrivate }])
        .select()
        .single();
      if (error) throw error;
      
      // Nếu là phòng Private, tự động đưa chủ phòng vào bảng room_members làm thành viên đầu tiên
      if (isPrivate && session?.user?.id) {
        const { error: memberError } = await supabase
          .from("room_members")
          .insert([{ room_id: data.id, user_id: session.user.id }]);
        if (memberError) throw memberError;
      }

      // Tải lại danh sách phòng
      dispatch(fetchRooms());
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 4. Gửi tin nhắn
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ roomId, content }, { rejectWithValue, getState }) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Chưa đăng nhập");

      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            room_id: roomId,
            content,
            user_id: session.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Lấy profile user hiện tại từ auth state để đính kèm vào tin nhắn trả về
      const state = getState();
      const currentUser = state.auth.user;

      return {
        ...data,
        user: {
          id: currentUser.id,
          username: currentUser.username,
          avatar_url: currentUser.avatar_url
        }
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 5. Thunk cập nhật tên phòng (Chỉ cho phép chủ phòng)
export const updateRoomName = createAsyncThunk(
  "chat/updateRoomName",
  async ({ roomId, newName }, { rejectWithValue, dispatch, getState }) => {
    try {
      const { data, error } = await supabase
        .from("rooms")
        .update({ name: newName })
        .eq("id", roomId)
        .select()
        .single();

      if (error) throw error;

      // Cập nhật lại danh sách phòng
      dispatch(fetchRooms());

      // Nếu phòng đang sửa tên chính là phòng hiện tại, cập nhật currentRoom
      const state = getState();
      if (state.chat.currentRoom && state.chat.currentRoom.id === roomId) {
        dispatch(setCurrentRoom(data));
      }

      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 6. Thunk xóa phòng (Chỉ cho phép chủ phòng)
export const deleteRoom = createAsyncThunk(
  "chat/deleteRoom",
  async (roomId, { rejectWithValue, dispatch, getState }) => {
    try {
      const { error } = await supabase
        .from("rooms")
        .delete()
        .eq("id", roomId);

      if (error) throw error;

      // Xóa phòng thành công, tải lại danh sách phòng
      await dispatch(fetchRooms());

      const state = getState();
      // Nếu xóa chính phòng đang active, tự động chuyển về phòng đầu tiên còn lại
      if (state.chat.currentRoom && state.chat.currentRoom.id === roomId) {
        const updatedRooms = state.chat.rooms.filter((r) => r.id !== roomId);
        if (updatedRooms.length > 0) {
          dispatch(setCurrentRoom(updatedRooms[0]));
        } else {
          dispatch(setCurrentRoom(null));
        }
      }

      return roomId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 7. Thunk hỗ trợ lấy Profile User khi nhận tin nhắn realtime (Client caching logic)
export const fetchProfileForRealtime = createAsyncThunk(
  "chat/fetchProfileForRealtime",
  async (userId, { getState }) => {
    const state = getState();
    
    // Kiểm tra xem có phải là tin nhắn của chính mình không
    if (state.auth.user && state.auth.user.id === userId) {
      return {
        id: state.auth.user.id,
        username: state.auth.user.username,
        avatar_url: state.auth.user.avatar_url
      };
    }

    // Kiểm tra trong cache client
    const existingMsg = state.chat.messages.find(m => m.user_id === userId && m.user);
    if (existingMsg && existingMsg.user) {
      return existingMsg.user;
    }

    const { data } = await supabase
      .from("profiles")
      .select("id, username, avatar_url")
      .eq("id", userId)
      .single();

    return data || { id: userId, username: "Anonymous", avatar_url: "" };
  }
);

// 8. Lấy danh sách thành viên của phòng riêng tư
export const fetchRoomMembers = createAsyncThunk(
  "chat/fetchRoomMembers",
  async (roomId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("room_members")
        .select("id, joined_at, user:profiles(id, username, avatar_url)")
        .eq("room_id", roomId);
      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 9. Mời thành viên mới vào phòng riêng tư
export const inviteMemberToRoom = createAsyncThunk(
  "chat/inviteMemberToRoom",
  async ({ roomId, userId }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("room_members")
        .insert([{ room_id: roomId, user_id: userId }])
        .select("id, joined_at, user:profiles(id, username, avatar_url)")
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 10. Trục xuất thành viên khỏi phòng riêng tư
export const removeMemberFromRoom = createAsyncThunk(
  "chat/removeMemberFromRoom",
  async ({ roomId, userId }, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from("room_members")
        .delete()
        .eq("room_id", roomId)
        .eq("user_id", userId);
      if (error) throw error;
      return userId;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// 11. Lấy danh sách tất cả các user trong hệ thống (profiles) để mời
export const fetchAllUsers = createAsyncThunk(
  "chat/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, avatar_url")
        .order("username", { ascending: true });
      if (error) throw error;
      return data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  roomMembers: [], // Thành viên của phòng hiện tại
  allUsers: [], // Tất cả user trong hệ thống (để chọn khi mời)
  loadingRooms: false,
  loadingMessages: false,
  loadingMembers: false,
  loadingUsers: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      const newRoom = action.payload;
      if (!state.currentRoom || state.currentRoom.id !== newRoom.id) {
        state.currentRoom = newRoom;
        state.messages = []; // Chỉ clear tin nhắn khi thực sự đổi phòng chat
      }
    },
    addRealtimeMessage: (state, action) => {
      const newMsg = action.payload;
      const exists = state.messages.some(m => m.id === newMsg.id);
      if (!exists) {
        state.messages.push(newMsg);
      }
    },
    updateMessageUserProfile: (state, action) => {
      const { userId, userProfile } = action.payload;
      state.messages = state.messages.map(m => {
        if (m.user_id === userId) {
          return { ...m, user: userProfile };
        }
        return m;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loadingRooms = true;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loadingRooms = false;
        state.rooms = action.payload;
        if (!state.currentRoom && action.payload.length > 0) {
          state.currentRoom = action.payload[0];
        }
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loadingRooms = false;
        state.error = action.payload;
      })

      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.payload;
      })
      
      // Send Message (Optimistic UI hiển thị ngay không cần F5)
      .addCase(sendMessage.fulfilled, (state, action) => {
        const newMsg = action.payload;
        const exists = state.messages.some(m => m.id === newMsg.id);
        if (!exists) {
          state.messages.push(newMsg);
        }
      })

      // Fetch Room Members
      .addCase(fetchRoomMembers.pending, (state) => {
        state.loadingMembers = true;
      })
      .addCase(fetchRoomMembers.fulfilled, (state, action) => {
        state.loadingMembers = false;
        state.roomMembers = action.payload;
      })
      .addCase(fetchRoomMembers.rejected, (state, action) => {
        state.loadingMembers = false;
        state.error = action.payload;
      })

      // Invite Member to Room
      .addCase(inviteMemberToRoom.fulfilled, (state, action) => {
        const newMember = action.payload;
        const exists = state.roomMembers.some(m => m.user.id === newMember.user.id);
        if (!exists) {
          state.roomMembers.push(newMember);
        }
      })

      // Remove Member from Room
      .addCase(removeMemberFromRoom.fulfilled, (state, action) => {
        const kickedUserId = action.payload;
        state.roomMembers = state.roomMembers.filter(m => m.user.id !== kickedUserId);
      })

      // Fetch All Users (Profiles)
      .addCase(fetchAllUsers.pending, (state) => {
        state.loadingUsers = true;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.allUsers = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.error = action.payload;
      })
      
      // Đồng bộ profile avatar & username cho tất cả các tin nhắn cũ của chính mình khi cập nhật thành công trong authSlice
      .addMatcher(
        (action) => action.type === "auth/updateUserProfile/fulfilled",
        (state, action) => {
          const updatedUser = action.payload;
          if (updatedUser) {
            state.messages = state.messages.map((m) => {
              if (m.user_id === updatedUser.id) {
                return {
                  ...m,
                  user: {
                    ...m.user,
                    username: updatedUser.username,
                    avatar_url: updatedUser.avatar_url
                  }
                };
              }
              return m;
            });
          }
        }
      );
  }
});

export const { setCurrentRoom, addRealtimeMessage, updateMessageUserProfile } = chatSlice.actions;
export default chatSlice.reducer;
