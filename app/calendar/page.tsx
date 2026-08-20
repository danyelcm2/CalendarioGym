import { redirect } from "next/navigation";

import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { AppHeader } from "@/components/layout/AppHeader";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name,email,username")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <main className="min-h-screen">
      <AppHeader
        email={profile?.email ?? user.email ?? ""}
        name={profile?.name ?? null}
        username={profile?.username ?? ""}
      />
      <WeeklyCalendar userId={user.id} />
    </main>
  );
}
