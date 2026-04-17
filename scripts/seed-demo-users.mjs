/**
 * Creates demo Auth users + profiles (idempotent: skips existing emails).
 */
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./load-env.mjs";

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEMO_CARE_HOME_ID = "11111111-1111-1111-1111-111111111111";
const DEMO_AFFILIATE_ID = "22222222-2222-2222-2222-222222222222";

const demoUsers = [
  {
    email: "nurse@demo.telefeet.local",
    password: "DemoNurse2026!",
    meta: {
      role: "client",
      full_name: "Demo Nurse",
      care_home_id: DEMO_CARE_HOME_ID,
    },
  },
  {
    email: "staff@demo.telefeet.local",
    password: "DemoStaff2026!",
    meta: {
      role: "company",
      full_name: "Demo Internal Staff",
    },
  },
  {
    email: "podiatrist@demo.telefeet.local",
    password: "DemoAffiliate2026!",
    meta: {
      role: "affiliate",
      full_name: "Demo Podiatrist",
      affiliate_id: DEMO_AFFILIATE_ID,
    },
  },
];

async function findUserIdByEmail(email) {
  let page = 1;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email === email);
    if (u) return u.id;
    if (data.users.length < 200) break;
    page += 1;
  }
  return null;
}

for (const u of demoUsers) {
  const existingId = await findUserIdByEmail(u.email);
  if (existingId) {
    const { error } = await admin.from("profiles").upsert(
      {
        id: existingId,
        role: u.meta.role,
        full_name: u.meta.full_name ?? null,
        care_home_id: u.meta.care_home_id ?? null,
        affiliate_id: u.meta.affiliate_id ?? null,
      },
      { onConflict: "id" },
    );
    if (error) {
      console.error(`[seed] profile upsert failed for ${u.email}:`, error.message);
      process.exit(1);
    }
    console.log(`[seed] updated profile for existing user ${u.email}`);
    continue;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: u.meta,
  });

  if (error) {
    console.error(`[seed] createUser ${u.email}:`, error.message);
    process.exit(1);
  }

  const uid = data.user?.id;
  if (!uid) {
    console.error(`[seed] no user id for ${u.email}`);
    process.exit(1);
  }

  const { error: pErr } = await admin.from("profiles").upsert(
    {
      id: uid,
      role: u.meta.role,
      full_name: u.meta.full_name ?? null,
      care_home_id: u.meta.care_home_id ?? null,
      affiliate_id: u.meta.affiliate_id ?? null,
    },
    { onConflict: "id" },
  );

  if (pErr) {
    console.error(`[seed] profile upsert ${u.email}:`, pErr.message);
    process.exit(1);
  }

  console.log(`[seed] created ${u.email} (${u.meta.role})`);
}

console.log("[seed] done. Demo logins:");
for (const u of demoUsers) {
  console.log(`  ${u.email} / ${u.password} → /${u.meta.role === "client" ? "client" : u.meta.role === "company" ? "company" : "affiliate"}/login`);
}
