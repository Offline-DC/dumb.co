import { useEffect, useMemo, useState } from "react";
import Phone from "./Phone/Phone";
import OfflineMode from "./OfflineMode";
import DumbDumb from "./DumbDumb.tsx";
import Dashboard from "./Dashboard.tsx";
import Support from "./Support";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import ReactGA from "react-ga4";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./App.css";
import Internship from "./Internship/Internship.tsx";
import NotFound from "./NotFound";
export const OFFLINE_PHONE_NUMBER = "844-633-5463";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js/checkout";
import CheckoutForm from "./Stripe/CheckoutForm.tsx";
import Confirmation from "./Stripe/Confirmation.tsx";
import Products from "./Stripe/Products.tsx";

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

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const paymentApiUrl = import.meta.env.VITE_PAYMENT_API_URL;

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

const createCheckoutSession = async (priceId: string, quantity: number = 1) => {
  const response = await fetch(
    `${paymentApiUrl}/stripe/create-payment-intent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ priceId, quantity }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create checkout session: ${response.status} ${response.statusText}. ${errorText}`,
    );
  }

  const data = await response.json();
  return data.clientSecret;
};

function CheckoutWrapper() {
  const [searchParams] = useSearchParams();
  const priceId = searchParams.get("price_id");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!priceId) {
      setError("No price_id provided in URL");
      setIsLoading(false);
      return;
    }

    createCheckoutSession(priceId)
      .then((secret) => {
        setClientSecret(secret);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setError(error.message || "Failed to create checkout session");
        setIsLoading(false);
      });
  }, [priceId]);

  const appearance = {
    theme: "flat" as const,
  };

  if (isLoading) {
    return <div>Loading checkout...</div>;
  }

  if (error || !clientSecret) {
    return <div>Error: {error || "Failed to initialize checkout"}</div>;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        clientSecret: clientSecret,
        elementsOptions: { appearance },
      }}
    >
      <CheckoutForm />
    </CheckoutProvider>
  );
}

function ConfirmationWrapper() {
  // Confirmation component doesn't need CheckoutProvider
  // It fetches session status directly from the backend
  return <Confirmation />;
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
            <Route path="/checkout/" element={<CheckoutWrapper />} />
            <Route path="/confirmation" element={<ConfirmationWrapper />} />
            <Route path="/products" element={<Products />} />
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
