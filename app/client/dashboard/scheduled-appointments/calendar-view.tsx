"use client";

import { useEffect, useMemo, useState } from "react";

type PatientOption = {
  id: string;
  fullName: string;
};

type Props = {
  patients: PatientOption[];
  initialPatientName: string | null;
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthValue(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-").map(Number);
  const dt = new Date(year, month - 1, 1);
  return dt.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function monthChoices(): string[] {
  const base = new Date();
  base.setDate(1);
  const items: string[] = [];
  for (let i = -3; i <= 8; i += 1) {
    const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
    items.push(monthValue(d));
  }
  return items;
}

function daysForMonth(value: string): Array<number | null> {
  const [year, month] = value.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const totalDays = new Date(year, month, 0).getDate();
  const grid: Array<number | null> = [];
  for (let i = 0; i < first.getDay(); i += 1) {
    grid.push(null);
  }
  for (let d = 1; d <= totalDays; d += 1) {
    grid.push(d);
  }
  while (grid.length % 7 !== 0) {
    grid.push(null);
  }
  return grid;
}

export function ScheduledAppointmentsCalendar({
  patients,
  initialPatientName,
}: Props) {
  const [selectedPatient, setSelectedPatient] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(monthValue(new Date()));
  const months = useMemo(() => monthChoices(), []);
  const days = useMemo(() => daysForMonth(selectedMonth), [selectedMonth]);

  useEffect(() => {
    if (!initialPatientName) return;
    const match = patients.find(
      (p) => p.fullName.toLowerCase() === initialPatientName.toLowerCase(),
    );
    if (match) {
      setSelectedPatient(match.id);
    }
  }, [initialPatientName, patients]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-2xl border border-white/10 bg-[#0a0a0a] p-4 ring-1 ring-[#d4af37]/10 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
          Patient
          <select
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
          >
            <option value="all">All patients</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.fullName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wide text-white/70">
          Month
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-white/15 bg-black px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20"
          >
            {months.map((value) => (
              <option key={value} value={value}>
                {monthLabel(value)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b] ring-1 ring-[#d4af37]/10">
        <header className="border-b border-white/10 bg-white/[0.02] px-4 py-3">
          <p className="text-sm tracking-wide text-white/80">
            {monthLabel(selectedMonth)} ·{" "}
            <span className="text-[#d4af37]">
              {selectedPatient === "all"
                ? "All patients"
                : patients.find((p) => p.id === selectedPatient)?.fullName ?? "Selected patient"}
            </span>
          </p>
        </header>

        <div className="grid grid-cols-7 border-b border-white/10">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => (
            <div
              key={`${idx}-${day ?? "empty"}`}
              className="min-h-[96px] border-b border-r border-white/10 p-2 text-xs last:border-r-0"
            >
              {day ? (
                <>
                  <p className="font-semibold text-white">{day}</p>
                  <p className="mt-2 text-[11px] text-white/35">No appointments</p>
                </>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
