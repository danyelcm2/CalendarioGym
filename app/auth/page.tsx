import { Dumbbell } from "lucide-react";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function AuthPage() {
  return (
    <main className="flex min-h-svh items-center justify-center px-3 py-5 sm:px-4 sm:py-10">
      <section className="w-full max-w-md rounded-[24px] border border-white/70 bg-white/[0.86] p-5 shadow-[0_24px_70px_rgba(23,32,26,0.12)] backdrop-blur sm:rounded-[28px] sm:p-7 md:p-9">
        <div className="mb-6 flex items-center gap-3 sm:mb-8">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#17201a] text-white sm:size-11">
            <Dumbbell size={21} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#637064]">Calendario Gym</p>
            <h1 className="text-xl font-semibold text-[#17201a] sm:text-2xl">
              Organiza tu semana
            </h1>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </section>
    </main>
  );
}
