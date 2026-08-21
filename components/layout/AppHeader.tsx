"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { AccentColorPicker } from "@/components/ui/AccentColorPicker";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { WeightUnitToggle } from "@/components/ui/WeightUnitToggle";
import { createClient } from "@/lib/supabase/client";

type AppHeaderProps = {
  email: string;
  name: string | null;
  username: string;
  title?: string;
};

export function AppHeader({
  email,
  name,
  username,
  title = "Plan semanal",
}: AppHeaderProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth");
    router.refresh();
  }

  return (
    <header className="border-b border-white/80 bg-white/[0.78] backdrop-blur dark:border-[#31445f] dark:bg-[#111827]/[0.82]">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-2 px-2.5 py-3 sm:gap-3 sm:px-5 md:px-8 md:py-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-[#17201a] text-white sm:size-11 dark:bg-[#dbeafe] dark:text-[#0f172a]">
            <Dumbbell size={21} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="hidden text-sm font-medium text-[#647067] sm:block dark:text-[#b8c6d8]">Calendario Gym</p>
            <h1 className="max-w-[5.5rem] truncate text-base font-semibold text-[#17201a] sm:max-w-none sm:text-xl dark:text-[#f8fbff]">
              {title}
            </h1>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold text-[#17201a] dark:text-[#f8fbff]">
              {name || username}
            </p>
            <p className="truncate text-xs text-[#647067] dark:text-[#b8c6d8]">
              @{username || email}
            </p>
          </div>
          <AccentColorPicker />
          <WeightUnitToggle />
          <ThemeToggle />
          <Button
            type="button"
            variant="secondary"
            onClick={handleSignOut}
            disabled={isSigningOut}
            icon={<LogOut size={17} aria-hidden="true" />}
            className="min-h-10 px-2 sm:min-h-11 sm:px-4"
          >
            <span className="hidden sm:inline">Cerrar sesion</span>
            <span className="sr-only sm:hidden">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
