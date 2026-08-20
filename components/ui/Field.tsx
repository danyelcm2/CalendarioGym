import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
};

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-[#d9e0d8] bg-white px-4 py-3 text-base text-[#17201a] outline-none transition placeholder:text-[#9aa39a] focus:border-[#4f8f7c] focus:ring-4 focus:ring-[#4f8f7c]/[0.15] sm:text-sm dark:border-[#334238] dark:bg-[#101711] dark:text-[#f7fbf6] dark:placeholder:text-[#6f7d72]";

export function Field({ label, id, className = "", ...props }: FieldProps) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-[#354239] dark:text-[#d7e0d8]">
      {label}
      <input id={id} className={`${fieldClass} ${className}`} {...props} />
    </label>
  );
}

export function TextArea({
  label,
  id,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    <label htmlFor={id} className="block text-sm font-medium text-[#354239] dark:text-[#d7e0d8]">
      {label}
      <textarea
        id={id}
        className={`${fieldClass} min-h-28 resize-none ${className}`}
        {...props}
      />
    </label>
  );
}
