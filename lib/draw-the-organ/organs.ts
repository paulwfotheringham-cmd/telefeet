export const ORGAN_ROUNDS = 6;

export const ORGANS = [
  { id: "heart", title: "Heart" },
  { id: "brain", title: "Brain" },
  { id: "lungs", title: "Lungs" },
  { id: "liver", title: "Liver" },
  { id: "stomach", title: "Stomach" },
  { id: "kidneys", title: "Kidneys" },
  { id: "intestines", title: "Intestines" },
  { id: "eye", title: "Eye" },
  { id: "ear", title: "Ear" },
  { id: "hand", title: "Hand" },
  { id: "foot", title: "Foot" },
  { id: "skull", title: "Skull" },
  { id: "spine", title: "Spine" },
  { id: "ribs", title: "Rib cage" },
  { id: "bladder", title: "Bladder" },
  { id: "pancreas", title: "Pancreas" },
  { id: "spleen", title: "Spleen" },
  { id: "diaphragm", title: "Diaphragm" },
  { id: "teeth", title: "Teeth" },
] as const;

export type OrganId = (typeof ORGANS)[number]["id"];
