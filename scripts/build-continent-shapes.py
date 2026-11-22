"""Build the seven continent silhouettes from Natural Earth 110m countries.

Source (public domain):
https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson

Russia is split near longitude 60 so Europe and Asia get the shapes used in school.
Far-off territories, such as French Guiana, are left off the home continent.

Usage: python3 scripts/build-continent-shapes.py /path/to/ne_110m_admin_0_countries.geojson
"""

import json
import math
import sys
from pathlib import Path

NAMES = [
    "Africa",
    "Antarctica",
    "Asia",
    "Europe",
    "North America",
    "Oceania",
    "South America",
]
DISPLAY = {
    "Africa": "Africa",
    "Antarctica": "Antarctica",
    "Asia": "Asia",
    "Europe": "Europe",
    "North America": "North America",
    "Oceania": "Australia",
    "South America": "South America",
}
WIDTH = 240
HEIGHT = 160
PAD = 14
RUSSIA_SPLIT = 60.0
NEAR_DEGREES = 32.0


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


def close_ring(ring):
    if len(ring) < 3:
        return ring
    if ring[0] != ring[-1]:
        return [*ring, ring[0]]
    return ring


def clip_ring(ring, limit, side):
    def inside(point):
        return point[0] <= limit if side == "west" else point[0] >= limit

    def crossing(start, end):
        span = end[0] - start[0]
        if span == 0:
            return (limit, start[1])
        ratio = (limit - start[0]) / span
        return (limit, start[1] + ratio * (end[1] - start[1]))

    output = []
    for index in range(len(ring) - 1):
        start, end = ring[index], ring[index + 1]
        start_in, end_in = inside(start), inside(end)
        if start_in and end_in:
            output.append(end)
        elif start_in and not end_in:
            output.append(crossing(start, end))
        elif not start_in and end_in:
            output.append(crossing(start, end))
            output.append(end)
        elif inside(start) and not output:
            output.append(start)
    if not output:
        return []
    output = close_ring(output)
    if len(output) < 4 or ring_area(output) < 0.05:
        return []
    return output


def clip_polygon(polygon, limit, side):
    clipped = []
    for ring in polygon:
        next_ring = clip_ring(close_ring(ring), limit, side)
        if next_ring:
            clipped.append(next_ring)
    if not clipped or ring_area(clipped[0]) < 0.2:
        return None
    return clipped


def keep_nearby(parts):
    """parts: list of (label, polygon). Keep the main landmass and nearby pieces."""
    ranked = sorted(parts, key=lambda item: ring_area(item[1][0]), reverse=True)
    kept = [ranked[0]]
    rest = ranked[1:]
    changed = True
    while changed:
        changed = False
        still = []
        for label, polygon in rest:
            point = centroid(polygon[0])
            close = False
            for _, kept_polygon in kept:
                other = centroid(kept_polygon[0])
                distance = math.hypot(point[0] - other[0], point[1] - other[1])
                if distance <= NEAR_DEGREES and ring_area(polygon[0]) >= 0.15:
                    close = True
                    break
            if close:
                kept.append((label, polygon))
                changed = True
            else:
                still.append((label, polygon))
        rest = still
    return kept


def project_lonlat(lon, lat):
    return lon, lat


def project_antarctica(lon, lat):
    if lat < -89.2:
        return 0.0, 0.0
    lat_r = math.radians(lat)
    lon_r = math.radians(lon)
    scale = math.cos(lat_r) / (1.0 - math.sin(lat_r))
    return scale * math.sin(lon_r), -scale * math.cos(lon_r)


def path_for(polygons, project):
    projected = []
    points = []
    for polygon in polygons:
        next_polygon = []
        for ring in polygon:
            mapped = [project(lon, lat) for lon, lat in ring]
            if len(mapped) >= 4:
                next_polygon.append(mapped)
                points.extend(mapped)
        if next_polygon:
            projected.append(next_polygon)
    min_x = min(point[0] for point in points)
    max_x = max(point[0] for point in points)
    min_y = min(point[1] for point in points)
    max_y = max(point[1] for point in points)
    span_x = max(max_x - min_x, 0.01)
    span_y = max(max_y - min_y, 0.01)
    scale = min((WIDTH - PAD * 2) / span_x, (HEIGHT - PAD * 2) / span_y)
    origin_x = (WIDTH - span_x * scale) / 2
    origin_y = (HEIGHT - span_y * scale) / 2

    commands = []
    for polygon in projected:
        for ring in polygon:
            first = ring[0]
            x = origin_x + (first[0] - min_x) * scale
            y = origin_y + (max_y - first[1]) * scale
            command = f"M{x:.1f} {y:.1f}"
            for px, py in ring[1:]:
                command += f"L{origin_x + (px - min_x) * scale:.1f} {origin_y + (max_y - py) * scale:.1f}"
            commands.append(command + "Z")
    return "".join(commands)


def main():
    data = json.loads(Path(sys.argv[1]).read_text())
    buckets = {name: [] for name in NAMES}
    for feature in data["features"]:
        admin = feature["properties"]["ADMIN"]
        continent = feature["properties"]["CONTINENT"]
        geometry = feature["geometry"]
        polygons = geometry["coordinates"] if geometry["type"] == "MultiPolygon" else [geometry["coordinates"]]
        if admin == "Russia":
            for polygon in polygons:
                west = clip_polygon(polygon, RUSSIA_SPLIT, "west")
                east = clip_polygon(polygon, RUSSIA_SPLIT, "east")
                if west:
                    buckets["Europe"].append(("Russia", west))
                if east:
                    buckets["Asia"].append(("Russia", east))
            continue
        if continent not in buckets:
            continue
        for polygon in polygons:
            if ring_area(polygon[0]) < 0.05:
                continue
            buckets[continent].append((admin, polygon))

    root = Path(__file__).resolve().parents[1]
    shapes = {}
    lines = ["export const CONTINENT_ROUNDS = 7;", "", "export const CONTINENTS = ["]
    for name in NAMES:
        parts = buckets[name]
        if name == "Antarctica":
            kept = parts
            project = project_antarctica
        else:
            kept = keep_nearby(parts)
            project = project_lonlat
        labels = sorted({label for label, _ in kept})
        print(f"{name}: {len(kept)} parts from {', '.join(labels)}")
        title = DISPLAY[name]
        country_id = slug(title)
        shapes[country_id] = path_for([polygon for _, polygon in kept], project)
        lines.append(f'  {{ id: "{country_id}", title: "{title}" }},')
    lines.extend(["] as const;", "", 'export type ContinentId = (typeof CONTINENTS)[number]["id"];', ""])
    (root / "lib/draw-the-continent/continents.ts").write_text("\n".join(lines))
    shape_lines = [
        'import type { ContinentId } from "./continents";',
        "",
        "export const CONTINENT_SHAPES: Record<ContinentId, string> = {",
    ]
    for continent_id, path in shapes.items():
        shape_lines.append(f'  "{continent_id}": "{path}",')
    shape_lines.extend(["};", ""])
    (root / "lib/draw-the-continent/shapes.ts").write_text("\n".join(shape_lines))
    print("wrote", len(shapes), "continents")


if __name__ == "__main__":
    main()
