import { useEffect } from "react";
import Phone from "./Phone/Phone";
import OfflineMode from "./OfflineMode";
import DumbDumb from "./DumbDumb.tsx";
import Dashboard from "./Dashboard.tsx";
import Support from "./Support";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Internship from "./Internship/Internship.tsx";
import NotFound from "./NotFound";

export const OFFLINE_PHONE_NUMBER = "844-633-5463";

// 🔥 Create one QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60, // 1 minute
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "auto .5rem",
          maxWidth: "100%",
        }}
      >
        <BrowserRouter>
          <RouteChangeTracker />
          <Routes>
            <Route path="/" element={<Phone />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dumbdown" element={<DumbDumb />} />
            <Route path="/setup" element={<OfflineMode />} />
            <Route path="/support" element={<Support />} />
            <Route path="/internship" element={<Internship />} />
            <Route path="/press" element={<Phone initialScreen="press" />} />
            <Route
              path="/dumbhouse"
              element={<Phone initialScreen="dumbhouse" />}
            />
            <Route
              path="/intern"
              element={<Phone initialScreen="internship" />}
            />
            <Route
              path="/phone"
              element={<Phone initialScreen="dumbphone I" />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </QueryClientProvider>
  );
}

export default App;
