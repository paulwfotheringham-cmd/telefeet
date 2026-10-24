/**
 * Live integration: TELEFEET host should return 401 on unauthenticated auth health.
 * Does not use secrets.
 */
import assert from "node:assert/strict";
import { checkSupabaseHostReachable } from "../lib/funquiz/supabase-host-check";

const url = "https://zjrcshsrotzorexkundd.supabase.co";

checkSupabaseHostReachable(url)
  .then((result) => {
    assert.equal(result.ok, true, `expected host reachable, got ${result.reason}`);
    assert.equal(result.ref, "zjrcshsrotzorexkundd");
    console.log("supabase-host-check integration OK");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
