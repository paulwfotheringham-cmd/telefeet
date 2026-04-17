import { createAdminClient } from "@/lib/supabase/admin";

export type CareHomeSummary = { id: string; label: string; nurseCount: number };

export type AffiliateSummary = { id: string; label: string; memberCount: number };

export async function listCareHomesForCompany(): Promise<CareHomeSummary[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("care_home_id, full_name")
    .eq("role", "client")
    .not("care_home_id", "is", null);

  if (error || !data?.length) return [];

  const map = new Map<string, { names: string[]; count: number }>();
  for (const row of data) {
    const id = row.care_home_id as string;
    if (!id) continue;
    const entry = map.get(id) ?? { names: [], count: 0 };
    entry.count += 1;
    if (row.full_name) entry.names.push(row.full_name as string);
    map.set(id, entry);
  }

  const summaries: CareHomeSummary[] = [];
  for (const [id, { names, count }] of map) {
    let label = names[0] ?? `Care home ${id.slice(0, 8)}…`;
    try {
      const { data: ch } = await admin
        .from("care_homes")
        .select("name")
        .eq("id", id)
        .maybeSingle();
      if (ch?.name) label = ch.name as string;
    } catch {
      // optional table
    }
    summaries.push({ id, label, nurseCount: count });
  }

  return summaries.sort((a, b) => a.label.localeCompare(b.label));
}

export async function listAffiliatesForCompany(): Promise<AffiliateSummary[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("affiliate_id, full_name")
    .eq("role", "affiliate")
    .not("affiliate_id", "is", null);

  if (error || !data?.length) return [];

  const map = new Map<string, { names: string[]; count: number }>();
  for (const row of data) {
    const id = row.affiliate_id as string;
    if (!id) continue;
    const entry = map.get(id) ?? { names: [], count: 0 };
    entry.count += 1;
    if (row.full_name) entry.names.push(row.full_name as string);
    map.set(id, entry);
  }

  const summaries: AffiliateSummary[] = [];
  for (const [id, { names, count }] of map) {
    let label = names[0] ?? `Affiliate ${id.slice(0, 8)}…`;
    try {
      const { data: af } = await admin
        .from("affiliates")
        .select("name")
        .eq("id", id)
        .maybeSingle();
      if (af?.name) label = af.name as string;
    } catch {
      // optional table
    }
    summaries.push({ id, label, memberCount: count });
  }

  return summaries.sort((a, b) => a.label.localeCompare(b.label));
}
