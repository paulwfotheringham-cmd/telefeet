import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  createMiddlewareSupabase,
  createServiceRoleClient,
} from "@/lib/supabase/middleware";
import {
  getPortalFromRequest,
  portalDashboardPath,
  portalLoginPath,
  type Portal,
} from "@/lib/portal";
import type { PortalRole } from "@/lib/types/profile";
import {
  RESULTS_COOKIE,
  verifyResultsCookieEdge,
} from "@/lib/games311/results-auth-edge";

const DASHBOARD_SUFFIX = "/dashboard";

function isDashboardPath(pathname: string, portal: Portal): boolean {
  return pathname === portalDashboardPath(portal);
}

function isResultsProtected(pathname: string): boolean {
  if (pathname === "/results/login") return false;
  if (pathname === "/api/games311/results/login") return false;
  if (pathname.startsWith("/results")) return true;
  if (pathname.startsWith("/api/games311/results")) return true;
  return false;
}

async function fetchProfileRole(
  userId: string,
): Promise<{ role: PortalRole } | null> {
  const admin = createServiceRoleClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data?.role) return null;
  return { role: data.role as PortalRole };
}

async function hasClientForCareHome(careHomeId: string): Promise<boolean> {
  const admin = createServiceRoleClient();
  if (!admin) return false;
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "client")
    .eq("care_home_id", careHomeId)
    .limit(1);
  if (error) return false;
  return Boolean(data?.length);
}

async function hasAffiliateProfile(affiliateId: string): Promise<boolean> {
  const admin = createServiceRoleClient();
  if (!admin) return false;
  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "affiliate")
    .eq("affiliate_id", affiliateId)
    .limit(1);
  if (error) return false;
  return Boolean(data?.length);
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isResultsProtected(pathname)) {
    const cookie = request.cookies.get(RESULTS_COOKIE)?.value;
    const ok = await verifyResultsCookieEdge(cookie);
    if (!ok) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const login = new URL("/results/login", request.url);
      login.searchParams.set("next", pathname + request.nextUrl.search);
      return NextResponse.redirect(login);
    }
    return NextResponse.next();
  }

  const portal = getPortalFromRequest(request);

  if (!portal || !pathname.endsWith(DASHBOARD_SUFFIX)) {
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareSupabase(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const login = new URL(portalLoginPath(portal), request.url);
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(login);
  }

  const profile = await fetchProfileRole(user.id);
  if (!profile) {
    await supabase.auth.signOut();
    const login = new URL(portalLoginPath(portal), request.url);
    return NextResponse.redirect(login);
  }

  const viewAs = request.nextUrl.searchParams.get("viewAs");

  if (portal === "client") {
    if (profile.role === "client") {
      return response;
    }
    if (profile.role === "company") {
      if (!viewAs) return response;
      const ok = await hasClientForCareHome(viewAs);
      if (!ok) {
        return NextResponse.redirect(
          new URL(portalDashboardPath("company"), request.url),
        );
      }
      return response;
    }
    return NextResponse.redirect(
      new URL(portalLoginPath(profile.role), request.url),
    );
  }

  if (portal === "affiliate") {
    if (profile.role === "affiliate") {
      return response;
    }
    if (profile.role === "company") {
      if (!viewAs) return response;
      const ok = await hasAffiliateProfile(viewAs);
      if (!ok) {
        return NextResponse.redirect(
          new URL(portalDashboardPath("company"), request.url),
        );
      }
      return response;
    }
    return NextResponse.redirect(
      new URL(portalLoginPath(profile.role), request.url),
    );
  }

  if (portal === "company") {
    if (profile.role !== "company") {
      return NextResponse.redirect(
        new URL(portalLoginPath(profile.role), request.url),
      );
    }
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/results",
    "/results/:path*",
    "/api/games311/results/:path*",
    "/client/dashboard",
    "/client/dashboard/:path*",
    "/company/dashboard",
    "/company/dashboard/:path*",
    "/affiliate/dashboard",
    "/affiliate/dashboard/:path*",
  ],
};
