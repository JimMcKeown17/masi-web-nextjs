import type { ReactNode } from "react";

import { PortalNav } from "@/components/impact/data-portal/PortalNav";
import Footer from "@/components/layout/Footer";

// Shared chrome for the portal's programme pages. This is a route-group layout:
// it wraps every page under (shell)/ but NOT the sibling iframe at
// /impact/data-portal (which stays bare and untouched until the Slice 5 cutover).
// The (shell) group is invisible in the URL, so routes stay clean
// (e.g. /impact/data-portal/zazi-izandi).
export default function PortalShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PortalNav />
      {children}
      <Footer />
    </>
  );
}
