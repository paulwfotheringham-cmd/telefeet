import assert from "node:assert/strict";
import { supabaseProjectRefFromUrl } from "../lib/funquiz/supabase-host-check";

assert.equal(
  supabaseProjectRefFromUrl("https://abc123.supabase.co"),
  "abc123",
);
assert.equal(supabaseProjectRefFromUrl("not-a-url"), null);
console.log("supabase-host-check unit OK");
