import { redirect } from "next/navigation";

import { AppHeader } from "@/components/layout/AppHeader";
import { PlansDashboard } from "@/components/plans/PlansDashboard";
import { createClient } from "@/lib/supabase/server";

export default async function PlansPage() {
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
        title="Mis planes"
      />
      <PlansDashboard userId={user.id} />
    </main>
  );
}
