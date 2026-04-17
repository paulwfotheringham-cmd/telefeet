import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function parseEnvFile(raw) {
  /** @type {Record<string, string>} */
  const out = {};
  const text = stripBom(raw);
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const k = t.slice(0, i).trim();
    const v = t.slice(i + 1).trim();
    out[k] = v;
  }
  return out;
}

function stripBom(buf) {
  if (Buffer.isBuffer(buf)) {
    if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
      return buf.slice(2).toString("utf16le");
    }
    if (buf.length >= 3 && buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
      return buf.slice(3).toString("utf8");
    }
    return buf.toString("utf8");
  }
  return String(buf);
}

export function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!fs.existsSync(p)) return {};
  const buf = fs.readFileSync(p);
  const env = parseEnvFile(buf);
  for (const [k, v] of Object.entries(env)) {
    if (!process.env[k]) process.env[k] = v;
  }
  return env;
}
