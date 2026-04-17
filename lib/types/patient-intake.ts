/**
 * Guided intake captured from the add-patient chat flow.
 * Stored on `patients.intake_json`.
 */
export type PatientIntakeDemographics = {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  phoneHome: string;
  phoneMobile: string;
  email: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  pcpInformation: string;
};

export type PatientIntakeClinical = {
  chiefComplaint: string;
  medicalConditions: string;
  currentMedications: string;
  allergies: string;
  surgicalHistory: string;
};

export type PatientIntakePodiatric = {
  footExamFindings: string;
  skinNailPathology: string;
  gaitBiomechanics: string;
  footwearInspection: string;
};

export type PatientIntakePayload = {
  demographics: PatientIntakeDemographics;
  clinical: PatientIntakeClinical;
  podiatric: PatientIntakePodiatric;
};

export type IntakeFieldPath =
  | `demographics.${keyof PatientIntakeDemographics}`
  | `clinical.${keyof PatientIntakeClinical}`
  | `podiatric.${keyof PatientIntakePodiatric}`;
