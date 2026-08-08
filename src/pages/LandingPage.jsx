import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { MessageSquare, Shield, Zap, ArrowRight } from "lucide-react";
import Button from "../component/Button";
const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate("/chat");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0c10] text-white overflow-x-hidden relative flex flex-col justify-between select-none">
      {/* Background Glow Effects */}
      <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[150px] pointer-events-none"></div>

      {/* 1. HEADER / NAVIGATION */}
      <header className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <img src="/LogoTuanAnhNoBg.png" alt="RoomChat Logo" className="w-9 h-9 object-contain" />
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            RoomChat
          </span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link to="/chat">
              <Button size="sm" variant="secondary" className="text-xs">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-semibold text-white/75 hover:text-white transition-colors">
                Đăng Nhập
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-xs shadow-md">
                  Đăng Ký
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <main className="w-full max-w-7xl mx-auto px-6 py-8 md:py-16 flex-1 flex flex-col md:flex-row items-center gap-12 z-10">
        {/* Left Hero Content */}
        <div className="flex-1 flex flex-col items-start text-left space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            <span className="text-xs text-white/80 font-medium">Bảo mật realtime 100%</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight sm:leading-none tracking-tight bg-gradient-to-br from-white via-white to-white/50 bg-clip-text text-transparent"
          >
            Kết Nối Tức Thì<br />
            <span className="bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              Trò Chuyện Realtime
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white/60 text-base sm:text-lg max-w-lg leading-relaxed"
          >
            Nền tảng chat nhóm thời gian thực thế hệ mới. Được xây dựng trên kiến trúc bảo mật RLS bảo vệ tin nhắn, tích hợp Supabase và thiết kế kính mờ Glassmorphism thời thượng.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button
              onClick={handleStart}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_24px_rgba(99,102,241,0.4)] w-full sm:w-auto"
            >
              Bắt đầu trò chuyện <ArrowRight className="w-4 h-4" />
            </Button>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <GithubIcon className="w-4 h-4" /> GitHub
              </Button>
            </a>
          </motion.div>
        </div>

        {/* Right Hero Preview Card (Viền Gradient chạy đa sắc) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-72 h-72 md:w-[360px] md:h-[360px] shrink-0 relative gradient-border-wrapper shadow-[0_0_50px_rgba(99,102,241,0.25)] hidden md:flex"
        >
          <div className="gradient-border-inner p-8">
            {/* Ảnh Logo Tuan Anh đúc chìm 3D cố định ở tâm hố */}
            <motion.img
              src="/LogoTuanAnhNoBg.png"
              alt="Tuan Anh Logo"
              className="w-[78%] h-[78%] object-contain select-none"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      </main>

      {/* 3. FEATURES SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 border-t border-white/5 z-10 grid grid-cols-1 md:grid-cols-3 gap-8 shrink-0">
        <div className="flex flex-col space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
          <div className="p-3 bg-indigo-600/20 rounded-xl border border-indigo-500/30 w-fit">
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="font-bold text-lg text-white">Realtime Tức Thì</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Tin nhắn gửi đi hiển thị ngay lập tức tới mọi người dùng nhờ kết nối Supabase Realtime Channels tốc độ cao.
          </p>
        </div>

        <div className="flex flex-col space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
          <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30 w-fit">
            <Shield className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="font-bold text-lg text-white">Bảo Mật RLS</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Áp dụng phân quyền Row Level Security trực tiếp trên database. Đảm bảo dữ liệu tin nhắn không thể bị can thiệp trái phép.
          </p>
        </div>

        <div className="flex flex-col space-y-3 p-6 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300">
          <div className="p-3 bg-fuchsia-600/20 rounded-xl border border-fuchsia-500/30 w-fit">
            <MessageSquare className="w-5 h-5 text-fuchsia-400" />
          </div>
          <h3 className="font-bold text-lg text-white">Giao Diện Sang Xịn</h3>
          <p className="text-white/60 text-sm leading-relaxed">
            Ứng ứng dụng thiết kế Glassmorphism kính mờ và hệ thống theme màu tối xanh đen sẫm mang đậm tính công nghệ.
          </p>
        </div>
      </section>

      {/* 4. FOOTER */}
      <footer className="w-full border-t border-white/5 py-6 text-center text-xs text-white/40 shrink-0 z-10">
        &copy; {new Date().getFullYear()} RoomChat. Developed by Tuấn Anh.
      </footer>
    </div>
  );
}

export default LandingPage;
