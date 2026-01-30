import {useEffect, useMemo } from "react";
import Phone from "./Phone/Phone";
import OfflineMode from "./OfflineMode";
import DumbDumb from "./DumbDumb.tsx";
import Dashboard from "./Dashboard.tsx";
import Support from "./Support";
import { BrowserRouter, Routes, Route, useLocation, useSearchParams } from "react-router-dom";
import ReactGA from "react-ga4";
import "./App.css";
import Internship from "./Internship/Internship.tsx";
import {loadStripe} from '@stripe/stripe-js';
import {
  CheckoutProvider
} from '@stripe/react-stripe-js/checkout';
import CheckoutForm from './Stripe/CheckoutForm.tsx';
import Confirmation from './Stripe/Confirmation.tsx';
export const OFFLINE_PHONE_NUMBER = "844-633-5463";

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

function ExternalRedirect({ url }: { url: string }) {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return null;
}

const createCheckoutSession = async (priceId: string, quantity: number = 1) => {
  const response = await fetch(`${paymentApiUrl}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ priceId, quantity }),
  });

  const { clientSecret } = await response.json();
  return clientSecret;
};

function CheckoutWrapper() {
  const [searchParams] = useSearchParams();
  const priceId = searchParams.get('price_id');

  const promise = useMemo(() => {
    if (!priceId) {
      console.error('No price_id provided in URL');
      return Promise.resolve(null);
    }

    return createCheckoutSession(priceId)
      .catch((error) => {
        console.error('Error creating payment intent:', error);
        return null;
      });
  }, [priceId]);

  const appearance = {
    theme: 'flat' as const,
  };

  if (!priceId) {
    return <div>Error: No price_id provided in URL</div>;
  }

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        clientSecret: promise,
        elementsOptions: {appearance},
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
          <Route path="/checkout/" element={<CheckoutWrapper />} />
          <Route path="/confirmation" element={<ConfirmationWrapper />} />
          <Route path="/" element={<Phone />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dumbdown" element={<DumbDumb />} />
          <Route path="/setup" element={<OfflineMode />} />
          <Route path="/support" element={<Support />} />
          <Route path="/internship" element={<Internship />} />
          <Route
            path="/phone"
            element={
              <ExternalRedirect url="https://shop.offline.community/products/offline-dumbphone-1" />
            }
          />
          <Route path="/press" element={<Phone initialScreen="press" />} />
          <Route
            path="/dumbhouse"
            element={<Phone initialScreen="dumbhouse" />}
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
