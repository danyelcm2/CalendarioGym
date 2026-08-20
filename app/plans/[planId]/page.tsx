import { notFound, redirect } from "next/navigation";

import { WeeklyCalendar } from "@/components/calendar/WeeklyCalendar";
import { AppHeader } from "@/components/layout/AppHeader";
import { createClient } from "@/lib/supabase/server";

type PlanPageProps = {
  params: Promise<{
    planId: string;
  }>;
};

export default async function PlanPage({ params }: PlanPageProps) {
  const { planId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const [{ data: profile }, { data: plan }] = await Promise.all([
    supabase
      .from("profiles")
      .select("name,email,username")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("workout_plans")
      .select("*")
      .eq("id", planId)
      .maybeSingle(),
  ]);

  if (!plan) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      <AppHeader
        email={profile?.email ?? user.email ?? ""}
        name={profile?.name ?? null}
        username={profile?.username ?? ""}
      />
      <WeeklyCalendar userId={user.id} planId={plan.id} planName={plan.name} />
    </main>
  );
}
