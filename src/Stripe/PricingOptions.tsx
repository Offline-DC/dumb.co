import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import './PricingOptions.css';

interface Product {
  id: string;
  object: string;
  active: boolean;
  attributes: string[];
  created: number;
  default_price: string;
  description: string;
  images: string[];
  livemode: boolean;
  marketing_features: string[];
  metadata: Record<string, unknown>;
  name: string;
  package_dimensions: null | unknown;
  shippable: null | boolean;
  statement_descriptor: null | string;
  tax_code: string;
  type: string;
  unit_label: null | string;
  updated: number;
  url: null | string;
}

interface Recurring {
  interval: string;
  interval_count: number;
  meter: null | unknown;
  trial_period_days: null | number;
  usage_type: string;
}

interface Price {
  id: string;
  object: string;
  active: boolean;
  billing_scheme: string;
  created: number;
  currency: string;
  custom_unit_amount: null | unknown;
  livemode: boolean;
  lookup_key: null | string;
  metadata: Record<string, unknown>;
  nickname: null | string;
  product: Product;
  recurring: Recurring | null;
  tax_behavior: string;
  tiers_mode: null | unknown;
  transform_quantity: null | unknown;
  type: string;
  unit_amount: number;
  unit_amount_decimal: string;
}

interface PricesResponse {
  object: string;
  data: Price[];
  has_more: boolean;
  url: string;
}

export default function PricingOptions() {
  const [searchParams] = useSearchParams();
  const currentPriceId = searchParams.get('price_id');
  const [pricingOptions, setPricingOptions] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const apiUrl = import.meta.env.VITE_PAYMENT_API_URL;
        const response = await axios.get<PricesResponse>(`${apiUrl}/stripe/prices`);
        
        // Find the current price
        const currentPrice = response.data.data.find(price => price.id === currentPriceId);
        
        if (currentPrice) {
          // Filter prices for the same product and active status
          const relatedPrices = response.data.data.filter(
            price => price.product.id === currentPrice.product.id && price.active
          );
          setPricingOptions(relatedPrices);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setLoading(false);
      }
    };

    if (currentPriceId) {
      fetchPrices();
    } else {
      setLoading(false);
    }
  }, [currentPriceId]);

  if (loading || pricingOptions.length === 0) {
    return null;
  }

  const getIntervalLabel = (price: Price): string => {
    if (!price.recurring) {
      return 'one-time';
    }
    
    if (price.recurring.interval === 'year') {
      return 'yearly';
    }
    
    if (price.recurring.interval === 'month') {
      return 'monthly';
    }
    
    return price.recurring.interval;
  };

  const handlePriceSelect = (priceId: string) => {
    if (priceId !== currentPriceId) {
      window.location.href = `/checkout?price_id=${priceId}`;
    }
  };

  return (
    <div className="pricing-options">
      <h4>Pricing Options</h4>
      <div className="pricing-options-list">
        {pricingOptions.map(price => {
          const isSelected = price.id === currentPriceId;
          return (
            <button
              key={price.id}
              onClick={() => handlePriceSelect(price.id)}
              className={`pricing-option ${isSelected ? 'selected' : ''}`}
              type="button"
            >
              <span className="pricing-interval">{getIntervalLabel(price)}</span>
              <span className="pricing-amount">
                ${(price.unit_amount / 100).toFixed(2)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
