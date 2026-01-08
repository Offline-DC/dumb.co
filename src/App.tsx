import { useEffect } from "react";
import Phone from "./Phone/Phone";
import OfflineMode from "./OfflineMode";
import DumbDumb from "./DumbDumb.tsx";
import Dashboard from "./Dashboard.tsx";
import Support from "./Support";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import ReactGA from "react-ga4";
import "./App.css";
import { filterProps } from "@mantine/core";

export const OFFLINE_PHONE_NUMBER = "844-633-5463";

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

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return null;
}

function App() {
  ReactGA.initialize("G-J6NFHL9D1L");
  return (
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
          <Route
            path="/phone"
            element={
              <ExternalRedirect url="https://shop.offline.community/products/offline-dumbphone-1" />
            }
          />
          <Route path="/press" element={<Phone initialScreen="press" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
