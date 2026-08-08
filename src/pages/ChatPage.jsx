import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { useChat } from "../hooks/useChat";
import { 
  createRoom, sendMessage, setCurrentRoom, updateRoomName, deleteRoom,
  fetchRoomMembers, inviteMemberToRoom, removeMemberFromRoom, fetchAllUsers
} from "../store/slices/chatSlice";
import { updateUserProfile } from "../store/slices/authSlice";
import { useScrollToBottom } from "../hooks/useScrollToBottom";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import MessageBox from "../component/MessageBox";
import Input from "../component/Input";
import Button from "../component/Button";
import { cn } from "../utils/cn";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "../component/Dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../component/DropdownMenu";
import { 
  LogOut, Plus, Send, Hash, Search, MessageSquare, Loader2, ArrowLeft, 
  MoreVertical, Edit3, Trash2, Camera, Settings, User, Lock, Globe, UserPlus, UserMinus
} from "lucide-react";

dayjs.extend(relativeTime);

function ChatPage() {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const { rooms, currentRoom, messages, loadingRooms, loadingMessages } = useChat();

  // Lấy các state phục vụ quản lý phòng Private từ Redux Store
  const { roomMembers, allUsers, loadingMembers, loadingUsers } = useSelector((state) => state.chat);

  // State Tạo phòng
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [roomValue, setRoomValue] = useState("");
  const [isPrivateValue, setIsPrivateValue] = useState(false); // Checkbox phòng Private

  // State Mời thành viên vào phòng Private
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteSearchQuery, setInviteSearchQuery] = useState("");

  // State Chỉnh sửa phòng
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [editRoomNameValue, setEditRoomNameValue] = useState("");
  const [targetRoomForEdit, setTargetRoomForEdit] = useState(null);

  // State Xác nhận xóa phòng
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [targetRoomForDelete, setTargetRoomForDelete] = useState(null);

  // State Chỉnh sửa Profile cá nhân
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState("");
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const fileInputRef = useRef(null);

  // State Nhắn tin & Tìm kiếm
  const [chatValue, setChatValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // useEffect: Tải thành viên của phòng khi đổi sang phòng Private
  useEffect(() => {
    if (currentRoom?.id && currentRoom?.is_private) {
      dispatch(fetchRoomMembers(currentRoom.id));
    }
  }, [currentRoom?.id, currentRoom?.is_private, dispatch]);

  // useEffect: Tải danh sách user & thành viên khi mở Modal Mời bạn bè
  useEffect(() => {
    if (isInviteOpen) {
      dispatch(fetchAllUsers());
      if (currentRoom?.id) {
        dispatch(fetchRoomMembers(currentRoom.id));
      }
    }
  }, [isInviteOpen, currentRoom?.id, dispatch]);

  // Tự động scroll xuống dưới khi có tin nhắn mới
  const chatContainerRef = useScrollToBottom(messages);

  // Đồng bộ thông tin cá nhân vào state khi mở Modal Profile
  useEffect(() => {
    if (user && isProfileOpen) {
      setProfileUsername(user.username || "");
      setAvatarPreviewUrl(user.avatar_url || "");
      setSelectedAvatarFile(null);
    }
  }, [user, isProfileOpen]);

  // 1. Logic CRUD - Tạo phòng mới
  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomValue.trim()) return;

    try {
      const result = await dispatch(createRoom({ roomName: roomValue.trim(), isPrivate: isPrivateValue }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Tạo phòng thành công!");
        setRoomValue("");
        setIsPrivateValue(false);
        setIsCreateOpen(false);
      } else {
        toast.error("Không thể tạo phòng chat!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  // 2. Logic CRUD - Mở modal sửa tên phòng
  const handleOpenEditRoomModal = (room, e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click chọn phòng
    setTargetRoomForEdit(room);
    setEditRoomNameValue(room.name);
    setIsEditRoomOpen(true);
  };

  // 3. Logic CRUD - Thực thi sửa tên phòng
  const handleUpdateRoomName = async (e) => {
    e.preventDefault();
    if (!editRoomNameValue.trim() || !targetRoomForEdit) return;

    try {
      const result = await dispatch(
        updateRoomName({ roomId: targetRoomForEdit.id, newName: editRoomNameValue.trim() })
      );
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Đổi tên phòng thành công!");
        setIsEditRoomOpen(false);
        setTargetRoomForEdit(null);
      } else {
        toast.error("Lỗi khi đổi tên phòng!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  // 4. Logic CRUD - Mở modal xác nhận xóa phòng
  const handleOpenDeleteConfirm = (room, e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click chọn phòng
    setTargetRoomForDelete(room);
    setIsDeleteConfirmOpen(true);
  };

  // 5. Logic CRUD - Thực thi xóa phòng
  const handleDeleteRoom = async () => {
    if (!targetRoomForDelete) return;

    try {
      const result = await dispatch(deleteRoom(targetRoomForDelete.id));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Đã xóa phòng chat!");
        setIsDeleteConfirmOpen(false);
        setTargetRoomForDelete(null);
      } else {
        toast.error("Không thể xóa phòng chat!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  // 6. Logic CRUD - Chỉnh sửa Profile & Upload File
  const handleSelectAvatarFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedAvatarFile(file);
      // Tạo URL ảo để hiển thị xem trước ảnh ngay lập tức
      setAvatarPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileUsername.trim()) {
      toast.warning("Tên hiển thị không được bỏ trống!");
      return;
    }

    setUpdatingProfile(true);
    try {
      const result = await dispatch(
        updateUserProfile({
          username: profileUsername.trim(),
          avatarFile: selectedAvatarFile
        })
      );
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Cập nhật thông tin cá nhân thành công!");
        setIsProfileOpen(false);
      } else {
        toast.error(result.payload || "Lỗi khi cập nhật thông tin!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    } finally {
      setUpdatingProfile(false);
    }
  };

  // 7. Logic - Nhắn tin
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatValue.trim() || !currentRoom) return;

    const content = chatValue.trim();
    setChatValue(""); // Optimistic UI
    setSending(true);

    try {
      await dispatch(sendMessage({ roomId: currentRoom.id, content }));
    } catch (err) {
      toast.error("Không thể gửi tin nhắn!");
    } finally {
      setSending(false);
    }
  };

  // 8. Logic Mời & Trục xuất thành viên trong phòng Private
  const handleInviteMember = async (userId) => {
    if (!currentRoom?.id) return;
    try {
      const result = await dispatch(inviteMemberToRoom({ roomId: currentRoom.id, userId }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Mời thành viên thành công!");
      } else {
        toast.error("Thành viên này đã ở trong phòng hoặc lỗi!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleKickMember = async (userId) => {
    if (!currentRoom?.id) return;
    try {
      const result = await dispatch(removeMemberFromRoom({ roomId: currentRoom.id, userId }));
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Đã trục xuất thành viên khỏi phòng!");
      } else {
        toast.error("Không thể trục xuất thành viên!");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra!");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("Đã đăng xuất!");
    } catch (err) {
      toast.error("Không thể đăng xuất!");
    }
  };

  const handleSelectRoom = (room) => {
    if (currentRoom?.id !== room.id) {
      dispatch(setCurrentRoom(room));
    }
    setIsSidebarOpen(false); // Đóng sidebar trên mobile
  };

  const filteredRooms = rooms?.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="w-full h-dvh bg-[#0a0c10] flex overflow-hidden text-white relative">
      {/* Hiệu ứng đốm sáng Aurora Glow làm nền huyền ảo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none z-0"></div>

      {/* 1. SIDEBAR PHÒNG CHAT */}
      <div 
        className={cn(
          "w-full md:w-80 h-full bg-[#151926]/40 border-r border-white/5 flex flex-col backdrop-blur-xl transition-all duration-300 md:flex shrink-0 z-10",
          isSidebarOpen ? "flex" : "hidden"
        )}
      >
        {/* User Profile Header (Click avatar để sửa Profile) */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div 
            onClick={() => setIsProfileOpen(true)}
            className="flex items-center gap-3 cursor-pointer group hover:opacity-90 transition-opacity"
            title="Chỉnh sửa thông tin cá nhân"
          >
            <div className="relative">
              <img
                src={user?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.username}`}
                alt="avatar"
                className="w-10 h-10 rounded-full border border-indigo-500/20 bg-zinc-800 object-cover group-hover:border-indigo-500/50 transition-colors"
              />
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Settings className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm truncate max-w-[120px] group-hover:text-indigo-300 transition-colors">{user?.username}</span>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Trực tuyến
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="p-2 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 cursor-pointer"
            title="Đăng xuất"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Add Room */}
        <div className="p-4 flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white backdrop-blur-md"
            />
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-[0_4px_12px_rgba(99,102,241,0.3)]">
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tạo Phòng Chat Mới</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateRoom} className="space-y-4 mt-2">
                <Input
                  placeholder="Nhập tên phòng chat..."
                  value={roomValue}
                  onChange={(e) => setRoomValue(e.target.value)}
                  required
                  autoFocus
                />
                
                {/* Chọn chế độ riêng tư */}
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="text-xs font-semibold text-white">Chế độ riêng tư</span>
                    <span className="text-[10px] text-white/50">Chỉ người được mời mới có thể tham gia</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isPrivateValue} 
                      onChange={(e) => setIsPrivateValue(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <DialogClose asChild>
                    <Button variant="ghost">Hủy</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-md">Tạo phòng</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          <div className="text-[10px] font-bold text-white/30 px-3 py-2 uppercase tracking-wider">
            Phòng Chat ({filteredRooms?.length || 0})
          </div>

          {loadingRooms ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-white/40">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
              <span className="text-xs">Đang tải phòng...</span>
            </div>
          ) : filteredRooms?.length === 0 ? (
            <div className="text-center text-xs text-white/40 py-8">Không tìm thấy phòng</div>
          ) : (
            filteredRooms?.map((room) => (
              <div
                key={room.id}
                onClick={() => handleSelectRoom(room)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer border border-transparent mb-1 group/room",
                  currentRoom?.id === room.id
                    ? "bg-gradient-to-r from-indigo-500/80 to-purple-600/80 text-white font-semibold shadow-[0_4px_15px_rgba(99,102,241,0.25)] border-white/10"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2.5 truncate flex-1">
                  {room.is_private ? (
                    <Lock className="w-3.5 h-3.5 text-amber-400/60 shrink-0" title="Phòng riêng tư" />
                  ) : (
                    <Hash className="w-4 h-4 text-white/40 shrink-0" title="Phòng công khai" />
                  )}
                  <span className="text-sm truncate text-left">{room.name}</span>
                </div>
                
                {/* Menu Sửa/Xóa phòng (Chỉ hiển thị cho chủ phòng khi hover) */}
                {room.created_by === user?.id && (
                  <div className="opacity-70 hover:opacity-100 transition-opacity z-20" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className={cn(
                          "p-1 rounded-lg transition-colors cursor-pointer outline-none",
                          currentRoom?.id === room.id
                            ? "text-white hover:bg-white/25"
                            : "text-white/50 hover:text-white hover:bg-white/10"
                        )}>
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[120px]">
                        <DropdownMenuItem onClick={(e) => handleOpenEditRoomModal(room, e)}>
                          <Edit3 className="w-3.5 h-3.5" /> Đổi tên
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleOpenDeleteConfirm(room, e)} 
                          className="text-rose-400 hover:text-rose-300"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xóa phòng
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. KHU VỰC CHAT CHÍNH */}
      <div 
        className={cn(
          "flex-1 h-full flex flex-col bg-[#0e111a]/85 backdrop-blur-xl transition-all duration-300 md:flex z-10",
          !isSidebarOpen ? "flex" : "hidden"
        )}
      >
        {currentRoom ? (
          <>
            {/* Room Header */}
            <div className="h-[73px] border-b border-white/5 px-4 md:px-6 flex items-center justify-between bg-[#151926]/40 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all md:hidden cursor-pointer"
                  title="Quay lại danh sách phòng"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                
                <div className="p-2.5 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                  {currentRoom.is_private ? (
                    <Lock className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Hash className="w-5 h-5 text-indigo-400" />
                  )}
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center">
                    <h3 className="font-bold text-sm md:text-base text-white truncate max-w-[120px] sm:max-w-none">{currentRoom.name}</h3>
                    {currentRoom.is_private ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20 select-none ml-2 shrink-0">Riêng tư</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 select-none ml-2 shrink-0">Công khai</span>
                    )}
                  </div>
                  <span className="text-[10px] text-white/40">Hộp thoại realtime bảo mật</span>
                </div>
              </div>

              {/* Nút Mời Bạn Bè (Chỉ hiện cho chủ phòng trong phòng Private) */}
              {currentRoom.is_private && currentRoom.created_by === user?.id && (
                <Button 
                  onClick={() => setIsInviteOpen(true)}
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1.5 border-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 hover:bg-indigo-500/10 rounded-xl px-3.5 py-2 text-xs transition-all cursor-pointer font-semibold shadow-sm"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mời bạn bè</span>
                </Button>
              )}
            </div>

            {/* Messages Area */}
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 chat-bg-pattern"
            >
              {loadingMessages ? (
                <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-white/40">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <span className="text-sm">Đang tải tin nhắn...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full w-full flex flex-col items-center justify-center text-white/30 gap-3">
                  <div className="p-4 bg-white/5 rounded-full border border-white/10">
                    <MessageSquare className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-sm font-medium">Bắt đầu cuộc trò chuyện tại #{currentRoom.name}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <MessageBox
                    key={message.id}
                    message={message.content}
                    name={message?.user_id === user?.id ? user?.username : (message?.user?.username || "Anonymous")}
                    avatar={message?.user_id === user?.id ? user?.avatar_url : message?.user?.avatar_url}
                    time={dayjs(message.created_at).format("HH:mm")}
                    sentByCurrentUser={message?.user_id === user?.id}
                  />
                ))
              )}
            </div>

            {/* Message Input Box */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-[#151926]/40 border-t border-white/5 flex gap-3 items-center px-4 md:px-6 backdrop-blur-md shrink-0"
            >
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={`Nhắn tin tại #${currentRoom.name}...`}
                  value={chatValue}
                  onChange={(e) => setChatValue(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white"
                  disabled={sending}
                  required
                />
              </div>
              <Button
                type="submit"
                className="p-3 rounded-xl shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-[0_4px_12px_rgba(99,102,241,0.35)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.5)] transition-all duration-300"
                disabled={sending || !chatValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-white/30 gap-4 p-6 text-center">
            <div className="p-4 bg-white/5 rounded-full border border-white/10 relative shadow-[0_0_30px_rgba(99,102,241,0.05)]">
              <img src="/LogoTuanAnhNoBg.png" alt="Logo" className="w-16 h-16 object-contain animate-pulse drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-wide">Chưa Chọn Phòng Chat</h3>
            <p className="text-sm max-w-xs text-white/50 leading-relaxed">Hãy chọn một phòng chat từ thanh bên trái hoặc tạo phòng mới để bắt đầu kết nối.</p>
          </div>
        )}
      </div>

      {/* =======================================================
          DIALOGS / MODALS HỆ THỐNG (CRUD & PROFILE)
          ======================================================= */}

      {/* 1. Modal Chỉnh sửa Tên phòng */}
      <Dialog open={isEditRoomOpen} onOpenChange={setIsEditRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi Tên Phòng Chat</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateRoomName} className="space-y-4 mt-2">
            <Input
              placeholder="Nhập tên phòng mới..."
              value={editRoomNameValue}
              onChange={(e) => setEditRoomNameValue(e.target.value)}
              required
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <DialogClose asChild>
                <Button variant="ghost">Hủy</Button>
              </DialogClose>
              <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-md">Cập nhật</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Modal Xác nhận Xóa phòng */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-rose-500">Xóa Phòng Chat?</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-white/70">
            Bạn có chắc chắn muốn xóa phòng chat <strong className="text-white">#{targetRoomForDelete?.name}</strong> không? Hành động này sẽ xóa toàn bộ tin nhắn liên quan và không thể khôi phục.
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <DialogClose asChild>
              <Button variant="ghost">Hủy</Button>
            </DialogClose>
            <Button 
              variant="danger" 
              onClick={handleDeleteRoom}
              className="shadow-md"
            >
              Xóa phòng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 3. Modal Chỉnh sửa Thông tin cá nhân */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Chỉnh Sửa Thông Tin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateProfile} className="space-y-5 mt-2 flex flex-col items-center">
            {/* Chọn Avatar */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative w-24 h-24 rounded-full border-2 border-indigo-500/30 overflow-hidden cursor-pointer group bg-zinc-800"
            >
              <img
                src={avatarPreviewUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileUsername}`}
                alt="Avatar Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-1 text-[10px] font-bold">
                <Camera className="w-4 h-4 text-white/80" />
                <span>Đổi ảnh</span>
              </div>
            </div>
            
            {/* Input file ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleSelectAvatarFile}
              accept="image/*"
              className="hidden"
            />

            <div className="w-full text-left">
              <label className="text-xs font-semibold text-white/60 block mb-2">Tên hiển thị</label>
              <Input
                placeholder="Nhập tên mới..."
                value={profileUsername}
                onChange={(e) => setProfileUsername(e.target.value)}
                required
                disabled={updatingProfile}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4 w-full">
              <DialogClose asChild>
                <Button variant="ghost" disabled={updatingProfile}>Hủy</Button>
              </DialogClose>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none shadow-md"
                disabled={updatingProfile}
              >
                {updatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* 4. Modal Quản lý & Mời thành viên phòng riêng tư */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="sm:max-w-md max-h-[90vh] flex flex-col gap-4 overflow-hidden">
          <DialogHeader className="shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-indigo-400" />
              Thành Viên Phòng #{currentRoom?.name}
            </DialogTitle>
          </DialogHeader>

          {/* Ô Tìm kiếm thành viên để mời */}
          <div className="relative shrink-0 mt-2">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm bạn bè trong hệ thống..."
              value={inviteSearchQuery}
              onChange={(e) => setInviteSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all text-white backdrop-blur-md"
            />
          </div>

          {/* Danh sách bạn bè và thành viên */}
          <div className="flex-1 overflow-y-auto max-h-[280px] pr-1 space-y-2 mt-2">
            {loadingUsers || loadingMembers ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-white/40">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                <span className="text-xs">Đang tải danh sách...</span>
              </div>
            ) : (
              (() => {
                // Lọc danh sách user (loại trừ chính mình)
                const filteredUsers = allUsers.filter(u => 
                  u.id !== user?.id && 
                  u.username.toLowerCase().includes(inviteSearchQuery.toLowerCase())
                );

                if (filteredUsers.length === 0) {
                  return <div className="text-center text-xs text-white/40 py-8">Không tìm thấy người dùng nào</div>;
                }

                return filteredUsers.map((userItem) => {
                  const isMember = roomMembers.some(m => m.user?.id === userItem.id);
                  
                  return (
                    <div 
                      key={userItem.id} 
                      className="flex items-center justify-between p-2.5 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={userItem.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userItem.username}`} 
                          alt="avatar" 
                          className="w-8 h-8 rounded-full border border-white/10 object-cover bg-zinc-800"
                        />
                        <span className="text-xs font-semibold text-white">{userItem.username}</span>
                      </div>

                      {isMember ? (
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 select-none">Đã tham gia</span>
                          <button 
                            onClick={() => handleKickMember(userItem.id)}
                            className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer outline-none"
                            title="Xóa khỏi phòng"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleInviteMember(userItem.id)}
                          className="px-3 py-1.5 text-[10px] font-bold bg-indigo-500 hover:bg-indigo-600 border-none rounded-lg cursor-pointer h-auto"
                        >
                          Mới
                        </Button>
                      )}
                    </div>
                  );
                });
              })()
            )}
          </div>

          <div className="flex justify-end gap-3 mt-4 shrink-0">
            <DialogClose asChild>
              <Button variant="ghost">Đóng</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default ChatPage;
