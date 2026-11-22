import React, { type ReactNode } from "react";
import type { OrganId } from "@/lib/draw-the-organ/organs";

function Frame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" role="img" aria-label={label} className="aspect-[3/2] w-full">
      <rect width="240" height="160" fill="#f8fafc" />
      {children}
    </svg>
  );
}

const bone = "#e7e5e4";
const boneLine = "#57534e";

export function morePicture(id: OrganId, label: string): ReactNode | null {
  switch (id) {
    case "gallbladder":
      return (
        <Frame label={label}>
          <path fill="#65a30d" d="M148 36c22 8 34 36 22 68-10 26-40 34-54 16-16-22-6-58 10-76 8-10 14-14 22-8z" />
          <path fill="#84cc16" d="M146 52c10 6 16 20 10 36-8-8-14-20-10-36z" />
        </Frame>
      );
    case "appendix":
      return (
        <Frame label={label}>
          <path fill="#fda4af" d="M48 48h108c18 0 32 14 32 32v28H48V48z" />
          <path fill="#e11d48" d="M156 104c22 6 36 22 28 36-10 6-26-4-36-16-8-10-4-16 8-20z" />
        </Frame>
      );
    case "esophagus":
      return (
        <Frame label={label}>
          <rect x="106" y="16" width="28" height="86" rx="14" fill="#fb7185" />
          <ellipse cx="120" cy="118" rx="40" ry="22" fill="#e11d48" />
        </Frame>
      );
    case "trachea":
      return (
        <Frame label={label}>
          <rect x="102" y="16" width="36" height="72" rx="12" fill="#fecdd3" stroke="#9f1239" strokeWidth="4" />
          {[32, 48, 64].map((y) => (
            <path key={y} d={`M108 ${y}h24`} stroke="#9f1239" strokeWidth="3" />
          ))}
          <path fill="none" stroke="#fb7185" strokeWidth="12" strokeLinecap="round" d="M112 88c-20 16-36 28-48 36M128 88c20 16 36 28 48 36" />
        </Frame>
      );
    case "thyroid":
      return (
        <Frame label={label}>
          <path fill="#e11d48" d="M120 46c-10 2-18 22-34 30-18 10-22 32-8 44 16 14 40 4 48-12 8 16 32 26 48 12 14-12 10-34-8-44-16-8-24-28-34-30-4 10-8 10-12 0z" />
          <rect x="112" y="28" width="16" height="28" rx="6" fill="#fda4af" />
        </Frame>
      );
    case "prostate":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="46" rx="34" ry="20" fill="#f9a8d4" />
          <ellipse cx="120" cy="102" rx="30" ry="24" fill="#a21caf" />
          <path fill="none" stroke="#86198f" strokeWidth="3" d="M100 90c8 8 32 8 40 0" />
        </Frame>
      );
    case "uterus":
      return (
        <Frame label={label}>
          <path fill="#f472b6" d="M120 36c26 0 44 20 44 44 0 30-18 50-44 60-26-10-44-30-44-60 0-24 18-44 44-44z" />
          <path fill="none" stroke="#be185d" strokeWidth="6" strokeLinecap="round" d="M78 70c-20-8-36-6-48 8M162 70c20-8 36-6 48 8" />
        </Frame>
      );
    case "ovaries":
      return (
        <Frame label={label}>
          <ellipse cx="62" cy="80" rx="28" ry="20" fill="#f472b6" />
          <ellipse cx="178" cy="80" rx="28" ry="20" fill="#f472b6" />
          <path fill="none" stroke="#be185d" strokeWidth="5" d="M90 80c16-24 44-24 60 0" />
        </Frame>
      );
    case "tongue":
      return (
        <Frame label={label}>
          <path fill="#fb7185" d="M58 48h124c8 0 16 10 16 24 0 36-28 58-78 58S42 108 42 72c0-14 8-24 16-24z" />
          <path fill="none" stroke="#9f1239" strokeWidth="3" d="M120 58v58" />
        </Frame>
      );
    case "adrenals":
      return (
        <Frame label={label}>
          <path fill="#facc15" d="M48 108l28-52 28 52z" />
          <path fill="#eab308" d="M136 108l28-52 28 52z" />
        </Frame>
      );
    case "mandible":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="10" d="M48 42h144v28c0 36-28 58-72 58S48 106 48 70V42z" />
          <path fill="#fff" d="M70 48h12v16H70zM92 48h12v16H92zM114 48h12v16h-12zM136 48h12v16h-12zM158 48h12v16h-12z" />
        </Frame>
      );
    case "sternum":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M96 22h48l12 22v74l-36 24-36-24V44z" />
        </Frame>
      );
    case "clavicle":
      return (
        <Frame label={label}>
          <path fill="none" stroke={bone} strokeWidth="16" strokeLinecap="round" d="M36 96c28-46 70-46 96-8 18 26 42 34 72 8" />
        </Frame>
      );
    case "scapula":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M64 36l108 16-28 88-90-28z" />
          <path fill="none" stroke={boneLine} strokeWidth="4" d="M80 52l70 54" />
        </Frame>
      );
    case "humerus":
      return (
        <Frame label={label}>
          <circle cx="120" cy="26" r="16" fill={bone} stroke={boneLine} strokeWidth="3" />
          <rect x="108" y="40" width="24" height="78" rx="12" fill={bone} stroke={boneLine} strokeWidth="3" />
          <ellipse cx="120" cy="128" rx="30" ry="14" fill={bone} stroke={boneLine} strokeWidth="3" />
        </Frame>
      );
    case "radius":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M108 28c10-10 28-6 30 10 2 40-4 70 8 90 4 8-8 18-22 14-16-4-22-20-18-40 4-28-2-58 2-74z" />
        </Frame>
      );
    case "ulna":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M96 48c0-20 22-28 36-16 8 8 6 18-2 24v62c0 14-18 24-32 16-10-6-12-18-4-26V52z" />
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M124 24c16 0 22 14 10 24h-28c-4-10 4-24 18-24z" />
        </Frame>
      );
    case "pelvis":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M36 58c16-24 152-24 168 0 6 28-12 48-32 66-14 8-22 6-36-4-8-14-12-14-20 0-14 10-22 12-36 4-20-18-38-38-44-66z" />
          <circle cx="78" cy="96" r="12" fill="#f8fafc" />
          <circle cx="162" cy="96" r="12" fill="#f8fafc" />
        </Frame>
      );
    case "sacrum":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M78 28h84L120 138z" />
          <path fill="none" stroke={boneLine} strokeWidth="3" d="M90 52h60M96 74h48M104 96h32" />
        </Frame>
      );
    case "femur":
      return (
        <Frame label={label}>
          <circle cx="156" cy="26" r="14" fill={bone} stroke={boneLine} strokeWidth="3" />
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M142 36c-16 10-28 22-28 36 0 8 16 10 22 4 8 8 10 40 8 62-2 16-24 22-36 12-8-6-6-16 2-22 10-28 8-52-4-70 2-10 16-22 36-22z" />
        </Frame>
      );
    case "patella":
      return (
        <Frame label={label}>
          <ellipse cx="120" cy="80" rx="38" ry="46" fill={bone} stroke={boneLine} strokeWidth="3" />
          <path fill="none" stroke={boneLine} strokeWidth="3" d="M96 70c16 12 32 12 48 0" />
        </Frame>
      );
    case "tibia":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M86 28h68l-8 18v78l-18 16-22-12V48z" />
        </Frame>
      );
    case "fibula":
      return (
        <Frame label={label}>
          <path fill={bone} stroke={boneLine} strokeWidth="3" d="M112 24h16l6 16v88l-14 12-16-10V40z" />
        </Frame>
      );
    case "hand-bones":
      return (
        <Frame label={label}>
          <g fill={bone} stroke={boneLine} strokeWidth="3">
            <ellipse cx="120" cy="118" rx="36" ry="22" />
            <rect x="86" y="48" width="12" height="52" rx="6" />
            <rect x="106" y="28" width="12" height="70" rx="6" />
            <rect x="126" y="36" width="12" height="62" rx="6" />
            <rect x="146" y="52" width="12" height="48" rx="6" />
            <rect x="64" y="78" width="28" height="12" rx="6" transform="rotate(-30 78 84)" />
          </g>
        </Frame>
      );
    case "foot-bones":
      return (
        <Frame label={label}>
          <g fill={bone} stroke={boneLine} strokeWidth="3">
            <ellipse cx="128" cy="108" rx="48" ry="22" />
            <rect x="70" y="62" width="12" height="36" rx="6" />
            <rect x="92" y="42" width="12" height="48" rx="6" />
            <rect x="114" y="36" width="12" height="52" rx="6" />
            <rect x="136" y="46" width="12" height="44" rx="6" />
            <rect x="156" y="60" width="12" height="34" rx="6" />
          </g>
        </Frame>
      );
    default:
      return null;
  }
}
