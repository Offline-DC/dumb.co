import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/fetchHeper";
import type {
  CheckoutProduct,
  PricesResponse,
  StripePrice,
} from "./types/stripe";

function isCheckoutProductPrice(price: StripePrice): boolean {
  const product = price.product;

  return (
    price.active &&
    product.active &&
    product.metadata?.dumbco_website_checkout === "true"
  );
}

function getProductRow(product: {
  metadata?: { dumbco_website_row?: string };
}): number {
  const raw = product.metadata?.dumbco_website_row;
  const n = raw == null ? Number.POSITIVE_INFINITY : Number(raw);
  return Number.isFinite(n) ? n : Number.POSITIVE_INFINITY;
}

export function useCheckoutProducts() {
  return useQuery<CheckoutProduct[]>({
    queryKey: ["checkoutProducts"],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_PAYMENT_API_URL as string | undefined;
      if (!apiUrl) {
        throw new Error("Missing VITE_PAYMENT_API_URL");
      }

      const response = await apiFetch<PricesResponse>(
        `${apiUrl}/stripe/prices`,
      );

      // 1) filter
      const eligiblePrices = response.data.filter(isCheckoutProductPrice);

      // 2)
      const byProductId = new Map<string, CheckoutProduct>();

      for (const price of eligiblePrices) {
        const product = price.product;

        const existing = byProductId.get(product.id);
        if (!existing) {
          byProductId.set(product.id, { ...product, prices: [price] });
        } else {
          existing.prices.push(price);
        }
      }

      const products = Array.from(byProductId.values());

      // 3) sort products by dumbco_website_row
      products.sort((a, b) => getProductRow(a) - getProductRow(b));

      return products;
    },
    staleTime: 5 * 60 * 1000,
  });
}
