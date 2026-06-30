import { redirect } from "next/navigation";

// The Zazi page moved into the portal shell during Slice 1.5. This old preview
// URL now forwards to its canonical home so existing links keep working. Safe to
// delete once nobody references /impact/data-portal/preview.
export default function DataPortalPreviewRedirect() {
  redirect("/impact/data-portal/zazi-izandi");
}
