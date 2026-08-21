import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[#17201a] text-white shadow-sm hover:bg-[#263228] focus-visible:outline-[#17201a] dark:bg-[#dbeafe] dark:text-[#0f172a] dark:hover:bg-[#bfdbfe]",
  secondary:
    "border border-[#d7ded7] bg-white text-[#17201a] hover:bg-[#f3f6f2] focus-visible:outline-[var(--accent)] dark:border-[#31445f] dark:bg-[#172033] dark:text-[#f8fbff] dark:hover:bg-[#22314a]",
  ghost:
    "text-[#4d5b50] hover:bg-[#eef3ef] focus-visible:outline-[var(--accent)] dark:text-[#dbe7f6] dark:hover:bg-[#22314a]",
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
