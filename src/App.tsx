import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import ReactGA from "react-ga4";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import Phone from "./Phone/Phone";
import OfflineMode from "./OfflineMode";
import DumbDumb from "./DumbDumb.tsx";
import Support from "./Support";
import MonthOffline from "./MonthOffline.tsx";
import Internship from "./Internship/Internship.tsx";
import NotFound from "./NotFound";
import AndroidDownload from "./Android/AndroidDownload.tsx";
import AppsDownload from "./Android/AppsDownload.tsx";
import AppRedirect from "./AppRedirect.tsx";
import MobileRedirect from "./MobileRedirect.tsx";

import "./App.css";
import CenteredShell from "./CenteredLayout.tsx";
import FAQs from "./FAQs.tsx";

export const OFFLINE_PHONE_NUMBER = "844-633-5463";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60,
    },
  },
});

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return null;
}

function App() {
  ReactGA.initialize("G-J6NFHL9D1L");

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RouteChangeTracker />

        <Routes>
          <Route element={<CenteredShell />}>
            <Route path="/" element={<Phone />} />
            <Route path="/dumbdown" element={<DumbDumb />} />
            <Route path="/setup" element={<OfflineMode />} />
            <Route path="/support" element={<Support />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/month-offline" element={<MonthOffline />} />
            <Route path="/press" element={<Phone initialScreen="press" />} />
            <Route
              path="/dumbhouse"
              element={<Phone initialScreen="dumbhouse" />}
            />
            <Route
              path="/phone"
              element={<Phone initialScreen="dumbphone 2" />}
            />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/android" element={<AndroidDownload />} />
            <Route path="/apps" element={<AppsDownload />} />
            <Route path="/app" element={<AppRedirect />} />
            <Route path="/mobile" element={<MobileRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
