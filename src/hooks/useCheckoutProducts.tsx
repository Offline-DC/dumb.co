import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../utils/fetchHeper";
import type { PricesResponse, StripePrice } from "./types/stripe";

const PRODUCT_ID = "prod_UQ1Bprm8yhZ1TR";

function isCheckoutProductPrice(price: StripePrice): boolean {
  const product = price.product;
  return price.active && product.active && product.id === PRODUCT_ID;
}

export function useCheckoutProducts() {
  return useQuery<StripePrice[]>({
    queryKey: ["checkoutProducts"],
    queryFn: async () => {
      const apiUrl = import.meta.env.VITE_PAYMENT_API_URL as string | undefined;
      if (!apiUrl) {
        throw new Error("Missing VITE_PAYMENT_API_URL");
      }

      const response = await apiFetch<PricesResponse>(
        `${apiUrl}/stripe/prices`,
      );

      const matching = response.data.filter(isCheckoutProductPrice);

      // A single product can have multiple active prices in Stripe, which would
      // otherwise render one duplicate card per price. Keep just one price per
      // product (preferring the product's default price) so it shows once.
      const byProduct = new Map<string, StripePrice>();
      for (const price of matching) {
        const existing = byProduct.get(price.product.id);
        const isDefault = price.product.default_price === price.id;
        if (!existing || isDefault) {
          byProduct.set(price.product.id, price);
        }
      }

      return Array.from(byProduct.values());
    },
    staleTime: 5 * 60 * 1000,
  });
}
