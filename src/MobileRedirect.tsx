import { useEffect } from "react";

const MOBILE_URL = "https://dumb-co.gigs.com";

export default function MobileRedirect() {
  useEffect(() => {
    window.location.replace(MOBILE_URL);
  }, []);

  return null;
}
