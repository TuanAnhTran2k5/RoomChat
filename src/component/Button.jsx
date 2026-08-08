import React from "react";
import { cn } from "../utils/cn";

const Button = React.forwardRef(({ 
  className, 
  variant = "primary", 
  size = "md", 
  type = "button", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_4px_12px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)]",
    secondary: "bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10",
    outline: "border border-white/20 hover:bg-white/5 text-white",
    ghost: "hover:bg-white/5 text-white/80 hover:text-white",
    danger: "bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_12px_rgba(244,63,94,0.3)]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  return (
    <button
      ref={ref}
      type={type}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;
export { Button };
