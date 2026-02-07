import { type ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "error" | "info" | "default";
  size?: "sm" | "md";
  children: ReactNode;
  icon?: ReactNode;
}

const variants = {
  success: "bg-green-500/20 text-green-400 border-green-500/30",
  warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
  info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  default: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const sizes = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

export function Badge({
  variant = "default",
  size = "sm",
  children,
  icon,
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-medium rounded-full border
        ${variants[variant]}
        ${sizes[size]}
      `}>
      {icon}
      {children}
    </span>
  );
}
