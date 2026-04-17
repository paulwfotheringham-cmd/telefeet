import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { PortalRole } from "@/lib/types/profile";

type SearchParams = { viewAs?: string };

/**
 * Legacy URL `/client/dashboard/add-patient` → guided intake.
 */
export default async function AddPatientPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/client/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role as PortalRole | undefined;
  if (!role) {
    redirect("/client/login");
  }

  const viewAs = searchParams.viewAs;
  const isCompanyView =
    role === "company" && typeof viewAs === "string" && viewAs.length > 0;

  if (role === "company" && !isCompanyView) {
    redirect("/company/dashboard");
  }

  const q =
    isCompanyView && viewAs
      ? `?viewAs=${encodeURIComponent(viewAs)}`
      : "";
  redirect(`/client/dashboard/add-patient/intake${q}`);
}
