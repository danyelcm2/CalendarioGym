import { Dumbbell } from "lucide-react";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function AuthPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-[28px] border border-white/70 bg-white/[0.86] p-7 shadow-[0_24px_70px_rgba(23,32,26,0.12)] backdrop-blur md:p-9">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#17201a] text-white">
            <Dumbbell size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#637064]">Calendario Gym</p>
            <h1 className="text-2xl font-semibold text-[#17201a]">
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
