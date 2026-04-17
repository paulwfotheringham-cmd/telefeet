import type { IntakeFieldPath } from "@/lib/types/patient-intake";

export type IntakeStep = {
  /** Dot path matching PatientIntakePayload nesting */
  fieldKey: IntakeFieldPath;
  /** Assistant message (Markdown-style ** for emphasis) */
  prompt: string;
};

export const INTAKE_WELCOME = `**TeleFeet intake assistant**

I'll ask a series of questions across **demographics**, **clinical history**, and **podiatric assessment**. Your answers appear in this thread as you go — be as concise as you like; you can refine the record later.

Let's begin with **patient demographic information**.`;

export const INTAKE_STEPS: readonly IntakeStep[] = [
  {
    fieldKey: "demographics.fullName",
    prompt: "What is the patient's **full legal name** (as it should appear in records)?",
  },
  {
    fieldKey: "demographics.dateOfBirth",
    prompt: "**Date of birth** — please give day/month/year (or age if DOB unknown).",
  },
  {
    fieldKey: "demographics.gender",
    prompt: "**Gender** — how should we record this in the chart?",
  },
  {
    fieldKey: "demographics.address",
    prompt: "**Address** — home address including postcode where applicable.",
  },
  {
    fieldKey: "demographics.phoneHome",
    prompt: "**Home telephone** (or type *none* if not applicable).",
  },
  {
    fieldKey: "demographics.phoneMobile",
    prompt: "**Mobile telephone** (or *none*).",
  },
  {
    fieldKey: "demographics.email",
    prompt: "**Email** for the patient (or *none*).",
  },
  {
    fieldKey: "demographics.emergencyContactName",
    prompt: "**Emergency contact — full name**.",
  },
  {
    fieldKey: "demographics.emergencyContactPhone",
    prompt: "**Emergency contact phone number**.",
  },
  {
    fieldKey: "demographics.pcpInformation",
    prompt:
      "**Primary care physician (PCP)** — please include name, practice or surgery, and contact phone if known.",
  },
  {
    fieldKey: "clinical.chiefComplaint",
    prompt:
      "**2 · Clinical & medical history**\n\n**Chief complaint** — what is the **primary reason** for this visit (e.g. foot pain, lesion, nail concern)?",
  },
  {
    fieldKey: "clinical.medicalConditions",
    prompt:
      "**Medical conditions** — especially **diabetes**, **circulation / vascular issues**, and **arthritis**, plus any others that affect foot health.",
  },
  {
    fieldKey: "clinical.currentMedications",
    prompt: "**Current medications** — please include **doses** where you know them.",
  },
  {
    fieldKey: "clinical.allergies",
    prompt: "**Allergies** — medications, **latex**, **adhesives**, or other relevant allergies (*none* if none).",
  },
  {
    fieldKey: "clinical.surgicalHistory",
    prompt: "**Surgical history** — any **previous foot or ankle surgery** (or *none*).",
  },
  {
    fieldKey: "podiatric.footExamFindings",
    prompt:
      "**3 · Podiatric assessment**\n\n**Foot examination** — summarise **neurological**, **vascular (circulation)**, and **dermatological** findings.",
  },
  {
    fieldKey: "podiatric.skinNailPathology",
    prompt:
      "**Skin / nail pathology** — ulcers, callosities, infections, or other lesions worth documenting.",
  },
  {
    fieldKey: "podiatric.gaitBiomechanics",
    prompt:
      "**Gait & biomechanics** — how does the patient walk? Note **varus / valgus** or other alignment findings if observed.",
  },
  {
    fieldKey: "podiatric.footwearInspection",
    prompt:
      "**Footwear** — current shoe **type**, **size**, and any **wear patterns** you've inspected.",
  },
] as const;
