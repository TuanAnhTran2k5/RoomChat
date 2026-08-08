import React, { useState } from "react";
import { cn } from "../utils/cn";
import { Eye, EyeOff } from "lucide-react";

const Input = React.forwardRef(({ className, type = "text", error, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const isPasswordType = type === "password";
  // Nếu là password và state showPassword = true thì chuyển sang hiển thị text để xem mật khẩu
  const currentType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full flex flex-col gap-1.5">
      <div className="relative w-full">
        <input
          type={currentType}
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200 text-sm backdrop-blur-md",
            isPasswordType && "pr-11", // Chừa khoảng trống bên phải cho nút con mắt
            error && "border-rose-500/50 focus:border-rose-500/50 focus:ring-rose-500/50",
            className
          )}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white/80 transition-colors cursor-pointer flex items-center justify-center"
            title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <span className="text-xs text-rose-400 font-medium pl-1">{error}</span>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;
export { Input };
