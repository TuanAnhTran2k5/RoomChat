import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import RegisterForm from "../component/RegisterForm";

function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex justify-center items-center bg-[#0a0c10] relative overflow-hidden px-4">
      {/* Nút quay lại trang chủ ở góc trên trái */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 z-20 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/65 hover:text-white flex items-center gap-2 text-xs font-semibold backdrop-blur-md transition-all duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Quay lại trang chủ
      </Link>

      {/* Hiệu ứng đốm sáng background (Glow Effect) */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-fuchsia-600/10 blur-[100px] pointer-events-none"></div>
      
      <RegisterForm />
    </div>
  );
}

export default RegisterPage;
