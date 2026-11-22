"""Build country silhouette paths from Natural Earth 110m admin-0 GeoJSON.

Source (public domain):
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson

Usage: python3 scripts/build-country-shapes.py /path/to/ne_110m_admin_0_countries.geojson
"""

import json
import sys
from pathlib import Path

PICKS = [
    ("Italy", "Italy"),
    ("United Kingdom", "United Kingdom"),
    ("Ireland", "Ireland"),
    ("France", "France"),
    ("Spain", "Spain"),
    ("Portugal", "Portugal"),
    ("Germany", "Germany"),
    ("Greece", "Greece"),
    ("Norway", "Norway"),
    ("Sweden", "Sweden"),
    ("Finland", "Finland"),
    ("Iceland", "Iceland"),
    ("Poland", "Poland"),
    ("Ukraine", "Ukraine"),
    ("Japan", "Japan"),
    ("China", "China"),
    ("India", "India"),
    ("South Korea", "South Korea"),
    ("Thailand", "Thailand"),
    ("Vietnam", "Vietnam"),
    ("Indonesia", "Indonesia"),
    ("Philippines", "Philippines"),
    ("Australia", "Australia"),
    ("New Zealand", "New Zealand"),
    ("United States of America", "United States"),
    ("Canada", "Canada"),
    ("Mexico", "Mexico"),
    ("Brazil", "Brazil"),
    ("Argentina", "Argentina"),
    ("Chile", "Chile"),
    ("Cuba", "Cuba"),
    ("Egypt", "Egypt"),
    ("Morocco", "Morocco"),
    ("South Africa", "South Africa"),
    ("Madagascar", "Madagascar"),
    ("Nigeria", "Nigeria"),
    ("Kenya", "Kenya"),
    ("Turkey", "Turkey"),
    ("Saudi Arabia", "Saudi Arabia"),
    ("Russia", "Russia"),
]

WIDTH = 240
HEIGHT = 160
PAD = 14


def slug(title: str) -> str:
    return title.lower().replace(" ", "-")


def ring_area(ring):
    area = 0.0
    for index in range(len(ring) - 1):
        x1, y1 = ring[index]
        x2, y2 = ring[index + 1]
        area += x1 * y2 - x2 * y1
    return abs(area) / 2


def centroid(ring):
    return (
        sum(point[0] for point in ring) / len(ring),
        sum(point[1] for point in ring) / len(ring),
    )


def bbox(ring):
    lons = [point[0] for point in ring]
    lats = [point[1] for point in ring]
    return min(lons), min(lats), max(lons), max(lats)


def near(main_box, point):
    min_lon, min_lat, max_lon, max_lat = main_box
    lon_pad = max(6.0, (max_lon - min_lon) * 0.22)
    lat_pad = max(4.0, (max_lat - min_lat) * 0.28)
    lon, lat = point
    return (min_lon - lon_pad) <= lon <= (max_lon + lon_pad) and (min_lat - lat_pad) <= lat <= (max_lat + lat_pad)


def keep_parts(polygons):
    ranked = sorted(polygons, key=lambda polygon: ring_area(polygon[0]), reverse=True)
    main = ranked[0]
    main_area = ring_area(main[0])
    main_box = bbox(main[0])
    kept = [main]
    for polygon in ranked[1:]:
        outer = polygon[0]
        area = ring_area(outer)
        if area < main_area * 0.015:
            continue
        if not near(main_box, centroid(outer)):
            continue
        kept.append(polygon)
    return kept


def path_for(polygons):
    points = [point for polygon in polygons for point in polygon[0]]
    min_lon = min(point[0] for point in points)
    max_lon = max(point[0] for point in points)
    min_lat = min(point[1] for point in points)
    max_lat = max(point[1] for point in points)
    span_lon = max(max_lon - min_lon, 0.01)
    span_lat = max(max_lat - min_lat, 0.01)
    scale = min((WIDTH - PAD * 2) / span_lon, (HEIGHT - PAD * 2) / span_lat)
    used_w = span_lon * scale
    used_h = span_lat * scale
    origin_x = (WIDTH - used_w) / 2
    origin_y = (HEIGHT - used_h) / 2

    def project(lon, lat):
        x = origin_x + (lon - min_lon) * scale
        y = origin_y + (max_lat - lat) * scale
        return x, y

    commands = []
    for polygon in polygons:
        for ring in polygon:
            if len(ring) < 4:
                continue
            projected = [project(lon, lat) for lon, lat in ring]
            head = f"M{projected[0][0]:.1f} {projected[0][1]:.1f}"
            lines = "".join(f"L{x:.1f} {y:.1f}" for x, y in projected[1:])
            commands.append(head + lines + "Z")
    return "".join(commands)


def main():
    source = Path(sys.argv[1])
    data = json.loads(source.read_text())
    by_admin = {feature["properties"]["ADMIN"]: feature for feature in data["features"]}
    root = Path(__file__).resolve().parents[1]
    shapes = {}
    lines = ["export const COUNTRY_ROUNDS = 20;", "", "export const COUNTRIES = ["]
    for admin, title in PICKS:
        feature = by_admin[admin]
        geometry = feature["geometry"]
        polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
        kept = keep_parts(polygons)
        country_id = slug(title)
        shapes[country_id] = path_for(kept)
        lines.append(f'  {{ id: "{country_id}", title: "{title}" }},')
        print(f"{title}: kept {len(kept)}/{len(polygons)} path {len(shapes[country_id])} chars")
    lines.extend(["] as const;", "", 'export type CountryId = (typeof COUNTRIES)[number]["id"];', ""])
    (root / "lib/draw-the-country/countries.ts").write_text("\n".join(lines))
    shape_lines = ["import type { CountryId } from \"./countries\";", "", "export const COUNTRY_SHAPES: Record<CountryId, string> = {"]
    for country_id, path in shapes.items():
        shape_lines.append(f'  "{country_id}": "{path}",')
    shape_lines.extend(["};", ""])
    (root / "lib/draw-the-country/shapes.ts").write_text("\n".join(shape_lines))
    print("wrote", len(shapes), "countries")


if __name__ == "__main__":
    main()
