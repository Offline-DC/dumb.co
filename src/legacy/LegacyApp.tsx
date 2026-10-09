/**
 * The older React pages -- downloads, setup, support, the internship -- as
 * one small app, mounted on each of their pages by src/pages/[...legacy].astro.
 * The new site (/, /shop, /faq ...) is Astro and doesn't go through here.
 * Analytics is in the page head (src/site/Analytics.astro), not react-ga4.
 */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import OfflineMode from "../OfflineMode";
import Support from "../Support";
import Internship from "../Internship/Internship.tsx";
import NotFound from "../NotFound";
import AndroidDownload from "../Android/AndroidDownload.tsx";
import AppsDownload from "../Android/AppsDownload.tsx";
import DesktopDownload from "../Desktop/DesktopDownload.tsx";
import AppRedirect from "../AppRedirect.tsx";
import FSADownload from "../FSA/FSADownload.tsx";
import SpotifyLink from "../Link/SpotifyLink.tsx";
import CenteredShell from "../CenteredLayout.tsx";
import "../App.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 1000 * 60 } },
});

export default function LegacyApp() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route element={<CenteredShell />}>
            <Route path="/dumbdown" element={<AppRedirect />} />
            <Route path="/setup" element={<OfflineMode />} />
            <Route path="/support" element={<Support />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/android" element={<AndroidDownload />} />
            <Route path="/apps" element={<AppsDownload />} />
            <Route path="/signin" element={<DesktopDownload />} />
            <Route path="/desktop-signin" element={<DesktopDownload />} />
            <Route path="/desktop" element={<DesktopDownload />} />
            <Route path="/app" element={<AppRedirect />} />
            <Route path="/fsa" element={<FSADownload />} />
            {/* Spotify sign-in hand-off for the dumbphone: the phone's WebView
                can't render Spotify's consent page (src/Link/SpotifyLink.tsx) */}
            <Route path="/link" element={<SpotifyLink />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
