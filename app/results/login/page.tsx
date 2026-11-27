import { redirect } from "next/navigation";

/** Password gate removed — keep URL for bookmarks. */
export default function ResultsLoginRedirectPage() {
  redirect("/results");
}
