"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, LogOut } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

type AppHeaderProps = {
  email: string;
  name: string | null;
  username: string;
};

export function AppHeader({ email, name, username }: AppHeaderProps) {
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
    <header className="border-b border-white/80 bg-white/[0.78] backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#17201a] text-white">
            <Dumbbell size={22} aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#647067]">Calendario Gym</p>
            <h1 className="text-xl font-semibold text-[#17201a]">Plan semanal</h1>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-semibold text-[#17201a]">
              {name || username}
            </p>
            <p className="truncate text-xs text-[#647067]">
              @{username || email}
            </p>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={handleSignOut}
            disabled={isSigningOut}
            icon={<LogOut size={17} aria-hidden="true" />}
          >
            Cerrar sesion
          </Button>
        </div>
      </div>
    </header>
  );
}
