import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { supabase } from "../config/supabase";
import { 
  fetchRooms, 
  fetchMessages, 
  addRealtimeMessage, 
  fetchProfileForRealtime, 
  updateMessageUserProfile 
} from "../store/slices/chatSlice";

export function useChat() {
  const dispatch = useDispatch();
  const { rooms, currentRoom, messages, loadingRooms, loadingMessages } = useSelector((state) => state.chat);

  // 1. Tải danh sách phòng lúc khởi động và thiết lập realtime lắng nghe lời mời
  useEffect(() => {
    dispatch(fetchRooms());

    const membersChannel = supabase
      .channel("realtime-room-members-global")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_members"
        },
        async (payload) => {
          const { eventType, new: newRecord, old: oldRecord } = payload;
          const { data: { session } } = await supabase.auth.getSession();
          const currentUserId = session?.user?.id;
          if (!currentUserId) return;

          // Nếu mình được thêm (INSERT) hoặc bị xóa (DELETE) khỏi phòng, tự động reload danh sách phòng
          if (
            (eventType === "INSERT" && newRecord.user_id === currentUserId) ||
            (eventType === "DELETE" && oldRecord && oldRecord.user_id === currentUserId)
          ) {
            dispatch(fetchRooms());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membersChannel);
    };
  }, [dispatch]);

  // 2. Tải tin nhắn khi đổi phòng chat và thiết lập realtime channel
  useEffect(() => {
    if (!currentRoom?.id) return;

    // Fetch tin nhắn lịch sử của phòng
    dispatch(fetchMessages(currentRoom.id));

    // Thiết lập Realtime Channel nhận tin nhắn mới
    const channelName = `realtime-room-${currentRoom.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          // Bỏ filter ở server-side để đảm bảo kết nối realtime hoạt động ổn định 100%
        },
        async (payload) => {
          const newMsg = payload.new;
          
          // Lọc ở client-side: chỉ nhận tin nhắn thuộc phòng chat hiện tại
          if (newMsg.room_id !== currentRoom.id) return;
          
          // Tạo tin nhắn thô để hiển thị ngay lập tức (optimistic UI)
          const messageWithTempUser = {
            id: newMsg.id,
            content: newMsg.content,
            created_at: newMsg.created_at,
            user_id: newMsg.user_id,
            user: null
          };

          dispatch(addRealtimeMessage(messageWithTempUser));

          // Lấy profile user gửi tin nhắn (sử dụng cache trong thunk)
          const profileResult = await dispatch(fetchProfileForRealtime(newMsg.user_id));
          if (profileResult.payload) {
            dispatch(updateMessageUserProfile({
              userId: newMsg.user_id,
              userProfile: profileResult.payload
            }));
          }
        }
      )
      .subscribe();

    // Dọn dẹp channel khi đổi phòng hoặc unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRoom?.id, dispatch]);

  return {
    rooms,
    currentRoom,
    messages,
    loadingRooms,
    loadingMessages,
  };
}

export default useChat;
