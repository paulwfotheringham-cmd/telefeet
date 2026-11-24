"use client";

import Image from "next/image";
import Link from "next/link";

export function CoverTile({
  image,
  title,
  href,
  onClick,
}: {
  image: string;
  title: string;
  href?: string;
  onClick?: () => void;
}) {
  const className =
    "group relative block aspect-[75/41] overflow-hidden rounded-2xl text-left shadow-lg shadow-black/40 ring-1 ring-white/15 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:ring-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200";
  const inner = (
    <>
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, 20vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/5" />
      <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-semibold leading-tight text-white drop-shadow-md sm:text-base">
        {title}
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export function WideChoice({
  image,
  title,
  detail,
  disabled,
  onClick,
}: {
  image: string;
  title: string;
  detail: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group relative block min-h-[10.5rem] overflow-hidden rounded-3xl text-left shadow-xl shadow-black/40 ring-1 ring-white/15 transition duration-300 hover:-translate-y-0.5 hover:ring-amber-200/70 disabled:opacity-60 sm:min-h-[12rem]"
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover transition duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20" />
      <span className="relative flex h-full min-h-[10.5rem] flex-col justify-end p-5 sm:min-h-[12rem] sm:p-6">
        <span className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</span>
        <span className="mt-1 max-w-md text-sm leading-relaxed text-white/80">{detail}</span>
      </span>
    </button>
  );
}
