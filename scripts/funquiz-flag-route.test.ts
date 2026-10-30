import assert from "node:assert/strict";
import { GET } from "../app/api/funquiz/flag/[iso2]/route";

async function run() {
  const ok = await GET(new Request("http://local/api/funquiz/flag/jp"), {
    params: { iso2: "jp" },
  });
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("content-type"), "image/png");
  const bytes = await ok.arrayBuffer();
  assert.ok(bytes.byteLength > 100, "expected PNG payload");

  const bad = await GET(new Request("http://local/api/funquiz/flag/xx"), {
    params: { iso2: "xx" },
  });
  assert.equal(bad.status, 404);
}

run()
  .then(() => console.log("funquiz-flag-route.test.ts OK"))
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
