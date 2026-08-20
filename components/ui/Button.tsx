import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#17201a] text-white shadow-sm hover:bg-[#263228] focus-visible:outline-[#17201a] dark:bg-[#f7fbf6] dark:text-[#101711] dark:hover:bg-[#dbe7dd]",
  secondary:
    "border border-[#d7ded7] bg-white text-[#17201a] hover:bg-[#f3f6f2] focus-visible:outline-[#4f8f7c] dark:border-[#334238] dark:bg-[#162019] dark:text-[#f7fbf6] dark:hover:bg-[#1d2a22]",
  ghost:
    "text-[#4d5b50] hover:bg-[#eef3ef] focus-visible:outline-[#4f8f7c] dark:text-[#c5d0c7] dark:hover:bg-[#1d2a22]",
  danger:
    "border border-[#f2c6be] bg-[#fff6f4] text-[#a63d2b] hover:bg-[#ffeae6] focus-visible:outline-[#d15b47] dark:border-[#6a3028] dark:bg-[#2a1714] dark:text-[#ff9a88] dark:hover:bg-[#3a1f1b]",
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
