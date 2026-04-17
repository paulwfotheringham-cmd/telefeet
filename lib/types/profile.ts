export type PortalRole = "client" | "company" | "affiliate";

export type Profile = {
  id: string;
  role: PortalRole;
  full_name: string | null;
  care_home_id: string | null;
  affiliate_id: string | null;
  created_at: string;
};
