import { useEffect } from "react";

const IOS_URL = "https://apps.apple.com/us/app/dumb-down/id6754464163";
const ANDROID_URL =
  "https://play.google.com/store/apps/details?id=com.offlineinc.dumbdown&hl=en_US";

/**
 * Sniffs the user agent and redirects to the matching store listing.
 * Android → Play Store; everything else (iOS, desktop, unknown) → App Store.
 */
function resolveTarget(): string {
  if (typeof navigator === "undefined") return IOS_URL;
  const ua = navigator.userAgent || "";
  if (/android/i.test(ua)) return ANDROID_URL;
  return IOS_URL;
}

export default function AppRedirect() {
  useEffect(() => {
    window.location.replace(resolveTarget());
  }, []);

  return null;
}
