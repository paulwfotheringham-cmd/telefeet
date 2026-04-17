import { INTAKE_STEPS } from "@/lib/patient-intake/steps";
import type { PatientIntakePayload } from "@/lib/types/patient-intake";

export function buildIntakePayload(
  answers: Record<string, string>,
): PatientIntakePayload | null {
  for (const step of INTAKE_STEPS) {
    if (!String(answers[step.fieldKey] ?? "").trim()) {
      return null;
    }
  }

  return {
    demographics: {
      fullName: answers["demographics.fullName"].trim(),
      dateOfBirth: answers["demographics.dateOfBirth"].trim(),
      gender: answers["demographics.gender"].trim(),
      address: answers["demographics.address"].trim(),
      phoneHome: answers["demographics.phoneHome"].trim(),
      phoneMobile: answers["demographics.phoneMobile"].trim(),
      email: answers["demographics.email"].trim(),
      emergencyContactName: answers["demographics.emergencyContactName"].trim(),
      emergencyContactPhone: answers["demographics.emergencyContactPhone"].trim(),
      pcpInformation: answers["demographics.pcpInformation"].trim(),
    },
    clinical: {
      chiefComplaint: answers["clinical.chiefComplaint"].trim(),
      medicalConditions: answers["clinical.medicalConditions"].trim(),
      currentMedications: answers["clinical.currentMedications"].trim(),
      allergies: answers["clinical.allergies"].trim(),
      surgicalHistory: answers["clinical.surgicalHistory"].trim(),
    },
    podiatric: {
      footExamFindings: answers["podiatric.footExamFindings"].trim(),
      skinNailPathology: answers["podiatric.skinNailPathology"].trim(),
      gaitBiomechanics: answers["podiatric.gaitBiomechanics"].trim(),
      footwearInspection: answers["podiatric.footwearInspection"].trim(),
    },
  };
}
