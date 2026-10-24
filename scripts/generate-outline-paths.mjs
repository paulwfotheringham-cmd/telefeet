/**
 * One-off generator: Natural Earth 110m countries → opaque outline SVG paths.
 * Run: node scripts/generate-outline-paths.mjs > lib/funquiz/outline-paths.generated.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ISO_BY_ASSET = {
  o001: "ITA",
  o002: "NOR",
  o003: "CHL",
  o004: "JPN",
  o005: "MEX",
  o006: "EGY",
  o007: "IND",
  o008: "BRA",
  o009: "AUS",
  o010: "CAN",
  o011: "FRA",
  o012: "DEU",
  o013: "GBR",
  o014: "ESP",
  o015: "TUR",
  o016: "ZAF",
  o017: "NGA",
  o018: "KEN",
  o019: "THA",
  o020: "VNM",
  o021: "IDN",
  o022: "PHL",
  o023: "CHN",
  o024: "RUS",
  o025: "UKR",
  o026: "POL",
  o027: "SWE",
  o028: "FIN",
  o029: "GRC",
  o030: "PRT",
  o031: "ARG",
  o032: "COL",
  o033: "PER",
  o034: "VEN",
  o035: "IRN",
  o036: "SAU",
  o037: "ISR",
  o038: "PAK",
  o039: "BGD",
  o040: "NPL",
  o041: "NZL",
  o042: "MDG",
  o043: "MAR",
  o044: "DZA",
  o045: "ETH",
  o046: "COD",
  o047: "AGO",
  o048: "CUB",
  o049: "IRL",
  o050: "ROU",
};

function allCoords(geometry) {
  const pts = [];
  const walk = (c) => {
    if (typeof c[0] === "number") {
      pts.push(c);
      return;
    }
    for (const child of c) walk(child);
  };
  walk(geometry.coordinates);
  return pts;
}

function boundsFromCoords(pts) {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  for (const [lon, lat] of pts) {
    minLon = Math.min(minLon, lon);
    maxLon = Math.max(maxLon, lon);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }
  return [minLon, minLat, maxLon, maxLat];
}

function project(lon, lat, bounds, width, height, pad) {
  const [minLon, minLat, maxLon, maxLat] = bounds;
  const w = maxLon - minLon || 1;
  const h = maxLat - minLat || 1;
  const scale = Math.min((width - 2 * pad) / w, (height - 2 * pad) / h);
  const x = pad + (lon - minLon) * scale;
  const y = pad + (maxLat - lat) * scale;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function coordsToPath(coords, bounds) {
  const parts = [];
  const walk = (c) => {
    if (typeof c[0][0] === "number") {
      const ring = c;
      const pts = ring.map(([lon, lat]) => project(lon, lat, bounds, 120, 100, 8));
      if (pts.length < 3) return;
      parts.push(`M${pts[0][0]},${pts[0][1]}L${pts.slice(1).map((p) => `${p[0]},${p[1]}`).join("L")}Z`);
      return;
    }
    for (const child of c) walk(child);
  };
  walk(coords);
  return parts.join(" ");
}

async function main() {
  const res = await fetch(
    "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
  );
  if (!res.ok) throw new Error(`Fetch failed ${res.status}`);
  const geo = await res.json();
  const byIso = new Map();
  for (const f of geo.features) {
    const iso = f.properties?.ADM0_A3 ?? f.properties?.ISO_A3;
    if (iso && iso !== "-99") byIso.set(iso, f);
  }

  const entries = {};
  for (const [assetKey, iso] of Object.entries(ISO_BY_ASSET)) {
    const f = byIso.get(iso);
    if (!f) {
      console.error(`Missing feature for ${iso} (${assetKey})`);
      process.exit(1);
    }
    const bounds = boundsFromCoords(allCoords(f.geometry));
    const d = coordsToPath(f.geometry.coordinates, bounds);
    if (!d) {
      console.error(`Empty path for ${iso}`);
      process.exit(1);
    }
    entries[assetKey] = { viewBox: "0 0 120 100", d };
  }

  const outPath = join(__dirname, "../lib/funquiz/outline-paths.ts");
  const body = `/** Auto-generated from Natural Earth 110m (public domain). Do not edit by hand — run scripts/generate-outline-paths.mjs */
export type OutlineSvg = { viewBox: string; d: string };

export const OUTLINE_SVG_BY_ASSET: Record<string, OutlineSvg> = ${JSON.stringify(entries, null, 2)};

export function getOutlineSvg(assetId: string): OutlineSvg | null {
  return OUTLINE_SVG_BY_ASSET[assetId] ?? null;
}
`;
  writeFileSync(outPath, body, "utf8");
  console.error(`Wrote ${outPath} with ${Object.keys(entries).length} outlines`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
