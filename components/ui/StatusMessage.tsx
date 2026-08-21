type StatusMessageProps = {
  type?: "error" | "success" | "info";
  children: React.ReactNode;
};

const styles = {
  error:
    "border-[#f2c6be] bg-[#fff6f4] text-[#a63d2b] dark:border-[#6a3028] dark:bg-[#2a1714] dark:text-[#ff9a88]",
  success:
    "border-[#c7e7d4] bg-[#f1fbf5] text-[#1f6a3d] dark:border-[#3b82f6] dark:bg-[#1e3a5f] dark:text-[#bfdbfe]",
  info:
    "border-[#d7ded7] bg-white text-[#4d5b50] dark:border-[#31445f] dark:bg-[#172033] dark:text-[#dbe7f6]",
};

export function StatusMessage({ type = "info", children }: StatusMessageProps) {
  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </p>
  );
}
