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

      return response.data.filter(isCheckoutProductPrice);
    },
    staleTime: 5 * 60 * 1000,
  });
}
