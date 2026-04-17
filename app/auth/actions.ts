"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { portalDashboardPath, type Portal } from "@/lib/portal";
import type { PortalRole } from "@/lib/types/profile";

export type SignInState = { error?: string };

export async function signInToPortal(
  _prev: SignInState | undefined,
  formData: FormData,
): Promise<SignInState> {
  const portal = formData.get("portal") as Portal | null;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!portal || !["client", "company", "affiliate"].includes(portal)) {
    return { error: "Invalid portal." };
  }
  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = createClient();

  const { error: signError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signError) {
    return { error: signError.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Could not sign in." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile?.role) {
    await supabase.auth.signOut();
    return { error: "No profile found for this account." };
  }

  const role = profile.role as PortalRole;

  if (role !== portal) {
    await supabase.auth.signOut();
    return { error: "You do not have access to this portal." };
  }

  revalidatePath("/", "layout");
  redirect(portalDashboardPath(portal));
}

export async function signOut(formData: FormData) {
  const portal = formData.get("portal") as Portal | null;
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  if (portal && ["client", "company", "affiliate"].includes(portal)) {
    redirect(`/${portal}/login`);
  }
  redirect("/");
}
