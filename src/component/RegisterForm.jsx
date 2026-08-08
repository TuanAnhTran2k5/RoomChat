import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import Input from "./Input";
import Button from "./Button";
import { UserPlus } from "lucide-react";

export function RegisterForm() {
  const navigate = useNavigate();
  const { user, register, error, resetError } = useAuth();
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/chat-page");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error === "User already exists" ? "Tên đăng nhập đã tồn tại!" : error);
      resetError();
    }
  }, [error, resetError]);

  const validate = () => {
    const tempErrors = {};
    if (username.trim().length < 6) {
      tempErrors.username = "Username phải có ít nhất 6 ký tự";
    }
    if (password.length < 8) {
      tempErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (password !== confirmPassword) {
      tempErrors.confirmPassword = "Mật khẩu nhập lại không khớp!";
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      const result = await register(username, password);
      if (result.meta.requestStatus === "fulfilled") {
        toast.success("Đăng ký thành công! Hãy đăng nhập.");
        navigate("/login");
      }
    } catch (err) {
      toast.error("Đăng ký thất bại, vui lòng thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/50 backdrop-blur-lg border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col items-center mb-8">
        <div className="p-3 bg-indigo-600/20 rounded-xl mb-3 border border-indigo-500/30">
          <UserPlus className="h-6 w-6 text-indigo-400" />
        </div>
        <h2 className="text-white font-bold text-2xl text-center">Tạo Tài Khoản</h2>
        <p className="text-white/60 text-sm mt-1">Đăng ký nhanh chóng trong 1 nốt nhạc</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="text-sm font-semibold text-white/80 block mb-2">Tên đăng nhập</label>
          <Input
            placeholder="Tối thiểu 6 ký tự..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-white/80 block mb-2">Mật khẩu</label>
          <Input
            type="password"
            placeholder="Tối thiểu 8 ký tự..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-white/80 block mb-2">Nhập lại mật khẩu</label>
          <Input
            type="password"
            placeholder="Xác nhận mật khẩu..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            required
            disabled={submitting}
          />
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={submitting}
        >
          {submitting ? "Đang tạo tài khoản..." : "Đăng Ký"}
        </Button>
      </form>
      
      <p className="text-white/60 text-center mt-6 text-sm">
        Bạn đã có tài khoản?{" "}
        <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default RegisterForm;
