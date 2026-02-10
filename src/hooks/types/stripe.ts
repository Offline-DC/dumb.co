export type StripeList<T> = {
  object: "list";
  data: T[];
  has_more: boolean;
  url: string;
};

export type StripeRecurring = {
  interval: "day" | "week" | "month" | "year";
  interval_count: number;
  meter: string | null;
  trial_period_days: number | null;
  usage_type: "licensed" | "metered";
} | null;

export type StripeProductMetadata = {
  dumbco_website_checkout?: string;
  dumbco_website_row?: string;
} & Record<string, unknown>;

export type StripeProduct = {
  id: string;
  object: "product";
  active: boolean;
  attributes: string[];
  created: number;
  default_price: string | null;
  description: string | null;
  images: string[];
  livemode: boolean;
  marketing_features: string[];
  metadata: StripeProductMetadata;
  name: string;
  package_dimensions: unknown | null;
  shippable: boolean | null;
  statement_descriptor: string | null;
  tax_code: string | null;
  type: string;
  unit_label: string | null;
  updated: number;
  url: string | null;
};

export type StripePrice = {
  id: string;
  object: "price";
  active: boolean;
  billing_scheme: "per_unit" | "tiered";
  created: number;
  currency: string;
  custom_unit_amount: unknown | null;
  livemode: boolean;
  lookup_key: string | null;
  metadata: Record<string, unknown>;
  nickname: string | null;
  product: StripeProduct;

  recurring: StripeRecurring;
  tax_behavior: "exclusive" | "inclusive" | "unspecified" | null;
  tiers_mode: "graduated" | "volume" | null;
  transform_quantity: unknown | null;
  type: "one_time" | "recurring";
  unit_amount: number | null;
  unit_amount_decimal: string | null;
};

export type PricesResponse = StripeList<StripePrice>;

export type CheckoutProduct = StripeProduct & {
  prices: StripePrice[];
};
