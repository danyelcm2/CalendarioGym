import { Dumbbell } from "lucide-react";
import { Suspense } from "react";

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-3 py-5 sm:px-4 sm:py-10">
      <div className="fixed right-3 top-3 sm:right-5 sm:top-5">
        <ThemeToggle />
      </div>
      <section className="w-full max-w-md rounded-[24px] border border-white/70 bg-white/[0.86] p-5 shadow-[0_24px_70px_rgba(23,32,26,0.12)] backdrop-blur sm:rounded-[28px] sm:p-7 md:p-9 dark:border-[#29425f] dark:bg-[#122033]/[0.88]">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#17201a] text-white sm:size-11 dark:bg-[#f8fbff] dark:text-[#0f172a]">
            <Dumbbell size={21} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#637064] dark:text-[#b8c6d8]">
              Calendario Gym
            </p>
            <h1 className="text-xl font-semibold text-[#17201a] sm:text-2xl dark:text-[#f8fbff]">
              Cambiar contrasena
            </h1>
          </div>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </section>
    </main>
  );
}
