import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#17201a] text-white shadow-sm hover:bg-[#263228] focus-visible:outline-[#17201a]",
  secondary:
    "border border-[#d7ded7] bg-white text-[#17201a] hover:bg-[#f3f6f2] focus-visible:outline-[#4f8f7c]",
  ghost:
    "text-[#4d5b50] hover:bg-[#eef3ef] focus-visible:outline-[#4f8f7c]",
  danger:
    "border border-[#f2c6be] bg-[#fff6f4] text-[#a63d2b] hover:bg-[#ffeae6] focus-visible:outline-[#d15b47]",
};

export function Button({
  variant = "primary",
  icon,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
