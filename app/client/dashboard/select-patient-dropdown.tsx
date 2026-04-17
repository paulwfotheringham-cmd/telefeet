"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  options: readonly string[];
  selectedPatient: string | null;
};

export function SelectPatientDropdown({ options, selectedPatient }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      value={selectedPatient ?? ""}
      onChange={(e) => {
        const next = new URLSearchParams(searchParams.toString());
        const value = e.target.value.trim();
        if (value) {
          next.set("patient", value);
        } else {
          next.delete("patient");
        }
        const query = next.toString();
        const href = query ? `${pathname}?${query}` : pathname;
        router.push(href, { scroll: false });
        router.refresh();
      }}
      className="mt-1 w-full max-w-[220px] rounded-lg border border-white/20 bg-black/80 px-2.5 py-2 text-xs text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
      aria-label="Select patient"
    >
      <option value="">Choose patient</option>
      {options.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
}
