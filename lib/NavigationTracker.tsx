"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";

export default function NavigationTracker() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const knownPages = [
    "Home",
    "LocalNews",
    "WorldNews",
    "FootballNews",
    "LiveScores",
    "MarketplaceCars",
    "MarketplaceHouses",
    "MarketplaceLand",
    "ListingDetail",
    "Dashboard",
    "AdminPanel",
  ];

  useEffect(() => {
    const pathSegment = pathname === "/" ? "Home" : pathname.replace(/^\//, "").split("/")[0];
    const pageName = knownPages.find((key) => key.toLowerCase() === pathSegment.toLowerCase()) || null;

    if (isAuthenticated && pageName) {
      base44.appLogs.logUserInApp(pageName).catch(() => {
      });
    }
  }, [pathname, isAuthenticated]);

  return null;
}
