import React, { type ReactNode } from "react";
import { CONTINENTS, type ContinentId } from "@/lib/draw-the-continent/continents";
import { CONTINENT_SHAPES } from "@/lib/draw-the-continent/shapes";

const TITLES = new Map(CONTINENTS.map((continent) => [continent.title, continent.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

export function ContinentPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof CONTINENTS)[number]["title"]);
  if (!id) return null;
  return (
    <Frame label={`Answer: ${name}`}>
      <path fill="#047857" fillRule="evenodd" d={CONTINENT_SHAPES[id as ContinentId]} />
    </Frame>
  );
}
