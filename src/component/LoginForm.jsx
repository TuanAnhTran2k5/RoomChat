import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import Input from "./Input";
import Button from "./Button";
import { LogIn } from "lucide-react";

export function LoginForm() {
  const navigate = useNavigate();
  const { user, login, error, resetError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/chat-page");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error === "Invalid login credentials" ? "Tài khoản hoặc mật khẩu không chính xác!" : error);
      resetError();
    }
  }, [error, resetError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.warning("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    
    setSubmitting(true);
    try {
      const result = await login(username, password);
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Đăng nhập thành công!");
        navigate("/chat-page");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/50 backdrop-blur-lg border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-indigo-600/20 rounded-xl mb-3 border border-indigo-500/30">
          <LogIn className="h-6 w-6 text-indigo-400" />
        </div>
        <h2 className="text-white font-bold text-2xl text-center">Chào Mừng Trở Lại</h2>
        <p className="text-white/60 text-sm mt-1">Đăng nhập để kết nối với phòng chat</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-white/80 block mb-2">Tên đăng nhập</label>
          <Input
            placeholder="Nhập username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-white/80 block mb-2">Mật khẩu</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={submitting}
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={submitting}
        >
          {submitting ? "Đang xử lý..." : "Đăng Nhập"}
        </Button>
      </form>
      
      <p className="text-white/60 text-center mt-6 text-sm">
        Bạn chưa có tài khoản?{" "}
        <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default LoginForm;
