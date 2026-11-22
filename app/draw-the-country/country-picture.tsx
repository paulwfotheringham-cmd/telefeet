import React, { type ReactNode } from "react";
import { COUNTRIES, type CountryId } from "@/lib/draw-the-country/countries";
import { COUNTRY_SHAPES } from "@/lib/draw-the-country/shapes";

const TITLES = new Map(COUNTRIES.map((country) => [country.title, country.id]));

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

export function CountryPicture({ name }: { name: string }) {
  const id = TITLES.get(name as (typeof COUNTRIES)[number]["title"]);
  if (!id) return null;
  return (
    <Frame label={`Answer: ${name}`}>
      <path fill="#0e7490" fillRule="evenodd" d={COUNTRY_SHAPES[id as CountryId]} />
    </Frame>
  );
}
