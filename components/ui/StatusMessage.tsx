type StatusMessageProps = {
  type?: "error" | "success" | "info";
  children: React.ReactNode;
};

const styles = {
  error: "border-[#f2c6be] bg-[#fff6f4] text-[#a63d2b]",
  success: "border-[#c7e7d4] bg-[#f1fbf5] text-[#1f6a3d]",
  info: "border-[#d7ded7] bg-white text-[#4d5b50]",
};

export function StatusMessage({ type = "info", children }: StatusMessageProps) {
  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm ${styles[type]}`}>
      {children}
    </p>
  );
}
