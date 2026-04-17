import type { NextRequest } from "next/server";

export type Portal = "client" | "company" | "affiliate";

/**
 * Resolves which portal the request belongs to.
 * Path-based for now; add subdomain host checks when domains go live.
 */
export function getPortalFromRequest(request: NextRequest): Portal | null {
  const host =
    (request.headers.get("host") ?? "").split(":")[0]?.toLowerCase() ?? "";

  if (host.startsWith("client.")) return "client";
  if (host.startsWith("affiliate.")) return "affiliate";
  if (host.startsWith("company.") || host.startsWith("internal.")) {
    return "company";
  }

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.toLowerCase();
  if (root && host && host !== root && !host.startsWith("localhost")) {
    const suffix = `.${root}`;
    if (host.endsWith(suffix)) {
      const sub = host.slice(0, host.length - suffix.length);
      if (sub === "client") return "client";
      if (sub === "affiliate") return "affiliate";
      if (sub === "company" || sub === "internal") return "company";
    }
  }

  const path = request.nextUrl.pathname;
  if (path.startsWith("/client")) return "client";
  if (path.startsWith("/company")) return "company";
  if (path.startsWith("/affiliate")) return "affiliate";

  return null;
}

export function portalLoginPath(portal: Portal): string {
  return `/${portal}/login`;
}

export function portalDashboardPath(portal: Portal): string {
  return `/${portal}/dashboard`;
}
