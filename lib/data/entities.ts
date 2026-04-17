import { createAdminClient } from "@/lib/supabase/admin";

export async function getCareHomeDisplayName(careHomeId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("care_homes")
      .select("name")
      .eq("id", careHomeId)
      .maybeSingle();
    if (!error && data?.name) return data.name as string;
  } catch {
    // table may not exist yet
  }
  return `Care home ${careHomeId.slice(0, 8)}…`;
}

export async function getAffiliateDisplayName(affiliateId: string) {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("affiliates")
      .select("name")
      .eq("id", affiliateId)
      .maybeSingle();
    if (!error && data?.name) return data.name as string;
  } catch {
    // table may not exist yet
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("profiles")
      .select("full_name")
      .eq("role", "affiliate")
      .eq("affiliate_id", affiliateId)
      .limit(1);
    if (!error && data?.[0]?.full_name) return data[0].full_name as string;
  } catch {
    // ignore
  }

  return `Affiliate ${affiliateId.slice(0, 8)}…`;
}
