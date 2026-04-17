/**
 * Enables full auto-run for Cursor Agent (no per-tool "Run" prompts):
 * - composerState.yoloEnableRunEverything = true
 * - modes4[].fullAutoRun = true for modes that already have autoRun (agent, triage)
 *
 * Quit Cursor completely, run this from Windows Terminal:
 *   node scripts/enable-cursor-autorun.mjs
 * Then start Cursor again.
 */
import { DatabaseSync } from "node:sqlite";
import fs from "fs";

const dbPath =
  "C:/Users/Usuario/AppData/Roaming/Cursor/User/globalStorage/state.vscdb";
const backupPath = `${dbPath}.bak-${Date.now()}`;

if (!fs.existsSync(dbPath)) {
  console.error("Missing:", dbPath);
  process.exit(1);
}

fs.copyFileSync(dbPath, backupPath);
console.log("Backup:", backupPath);

const db = new DatabaseSync(dbPath);

function valueToString(raw) {
  if (raw == null) return null;
  if (Buffer.isBuffer(raw)) return raw.toString("utf8");
  if (typeof raw === "string") return raw;
  if (raw instanceof Uint8Array) return Buffer.from(raw).toString("utf8");
  return null;
}

const all = db.prepare("SELECT key, value FROM ItemTable").all();

let updated = 0;
for (const row of all) {
  const str = valueToString(row.value);
  if (!str || !str.includes('"composerState"')) continue;

  let data;
  try {
    data = JSON.parse(str);
  } catch {
    continue;
  }

  if (!data.composerState) continue;

  const cs = data.composerState;
  let changed = false;

  if (cs.yoloEnableRunEverything !== true) {
    cs.yoloEnableRunEverything = true;
    changed = true;
  }

  if (Array.isArray(cs.modes4)) {
    for (const m of cs.modes4) {
      if (m && m.autoRun === true && m.fullAutoRun !== true) {
        m.fullAutoRun = true;
        changed = true;
        console.log("Set fullAutoRun for mode:", m.id);
      }
    }
  }

  if (!changed) {
    console.log("Already fully enabled for key:", row.key);
    continue;
  }

  const newJson = JSON.stringify(data);
  db.prepare("UPDATE ItemTable SET value = ? WHERE key = ?").run(
    newJson,
    row.key,
  );
  updated++;
}

db.close();
console.log("Done. Rows updated:", updated);
if (updated === 0) {
  console.warn("Nothing to update (unexpected).");
} else {
  console.log(
    "\nQuit Cursor completely, then reopen so this loads from disk.",
  );
}
