"use client";

import { useMemo, useState } from "react";

export type PatientRow = {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  medicalConditions: string;
  chiefComplaint: string;
  location: string;
};

type Props = {
  patients: PatientRow[];
};

export function PatientDatabaseView({ patients }: Props) {
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("all");
  const [location, setLocation] = useState("all");

  const locations = useMemo(
    () => ["all", ...new Set(patients.map((p) => p.location).filter(Boolean))],
    [patients],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) => {
      const okSearch =
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.chiefComplaint.toLowerCase().includes(q) ||
        p.medicalConditions.toLowerCase().includes(q);
      const okGender = gender === "all" || p.gender === gender;
      const okLocation = location === "all" || p.location === location;
      return okSearch && okGender && okLocation;
    });
  }, [patients, search, gender, location]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 rounded-2xl border border-brand-line bg-brand-surface p-4 ring-1 ring-brand-gold/10 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-brand-muted">
          Search
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, complaint, condition"
            className="rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-brand-muted">
          Gender
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
          >
            <option value="all">All</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs uppercase tracking-wide text-brand-muted">
          Location
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-xl border border-brand-line bg-brand-panel px-3 py-2.5 text-sm text-brand-cream outline-none transition focus:border-brand-gold focus:ring-2 focus:ring-brand-gold/20"
          >
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc === "all" ? "All locations" : loc}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="overflow-hidden rounded-2xl border border-brand-line bg-brand-surface ring-1 ring-brand-gold/10">
        <div className="grid grid-cols-6 border-b border-brand-line bg-brand-panel/70 px-4 py-3 text-xs uppercase tracking-wide text-brand-muted">
          <span>Patient</span>
          <span>DOB</span>
          <span>Gender</span>
          <span>Chief complaint</span>
          <span>Medical conditions</span>
          <span>Location</span>
        </div>
        <div className="divide-y divide-brand-line">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-sm text-brand-muted">No patients match the selected filters.</p>
          ) : (
            filtered.map((p) => (
              <div key={p.id} className="grid grid-cols-6 gap-3 px-4 py-4 text-sm">
                <span className="font-medium text-brand-cream">{p.fullName}</span>
                <span>{p.dateOfBirth || "-"}</span>
                <span>{p.gender || "-"}</span>
                <span className="text-brand-cream/85">{p.chiefComplaint || "-"}</span>
                <span className="text-brand-cream/85">{p.medicalConditions || "-"}</span>
                <span>{p.location || "-"}</span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
