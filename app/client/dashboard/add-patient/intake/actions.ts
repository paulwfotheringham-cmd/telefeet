"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { buildIntakePayload } from "@/lib/patient-intake/build-payload";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { PatientIntakePayload } from "@/lib/types/patient-intake";
import type { PortalRole } from "@/lib/types/profile";

export type SaveIntakeState = { error?: string };

export async function savePatientIntake(
  answers: Record<string, string>,
  viewAs: string | null,
): Promise<SaveIntakeState> {
  const payload: PatientIntakePayload | null = buildIntakePayload(answers);
  if (!payload) {
    return { error: "Intake is incomplete. Please answer every question." };
  }

  const fullName = payload.demographics.fullName;
  if (!fullName) {
    return { error: "Patient full name is required." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in." };
  }

  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role, care_home_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileErr || !profile?.role) {
    return { error: "Could not load your profile." };
  }

  const role = profile.role as PortalRole;

  if (role === "client") {
    const careHomeId = profile.care_home_id as string | null;
    if (!careHomeId) {
      return {
        error:
          "Your account is not linked to a care home. Ask your administrator to set care_home_id on your profile.",
      };
    }

    const { error } = await supabase.from("patients").insert({
      care_home_id: careHomeId,
      full_name: fullName,
      notes: "Guided intake (chat assistant).",
      intake_json: payload,
      created_by: user.id,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/client/dashboard");
    redirect("/client/dashboard");
  }

  if (role === "company") {
    if (!viewAs) {
      return {
        error:
          "Missing care home — open intake from the client dashboard while viewing as a home.",
      };
    }

    const admin = createAdminClient();
    const { data: clients, error: listErr } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "client")
      .eq("care_home_id", viewAs)
      .limit(1);

    if (listErr || !clients?.length) {
      return { error: "You cannot add patients for this care home." };
    }

    const { error } = await admin.from("patients").insert({
      care_home_id: viewAs,
      full_name: fullName,
      notes: "Guided intake (chat assistant).",
      intake_json: payload,
      created_by: user.id,
    });

    if (error) {
      return { error: error.message };
    }

    revalidatePath("/client/dashboard");
    redirect(`/client/dashboard?viewAs=${encodeURIComponent(viewAs)}`);
  }

  return { error: "You do not have permission to add patients." };
}
