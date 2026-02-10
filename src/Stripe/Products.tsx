import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Products.css';

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

interface ProductsResponse {
  object: string;
  data: Product[];
  has_more: boolean;
  url: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const apiUrl = import.meta.env.VITE_PAYMENT_API_URL;
        const response = await axios.get<ProductsResponse>(`${apiUrl}/stripe/products`);
        setProducts(response.data.data.filter(product => product.active));
        setLoading(false);
      } catch (err) {
        setError('Failed to load products');
        setLoading(false);
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return <div className="products-container"><div className="loading">Loading products...</div></div>;
  }

  if (error) {
    return <div className="products-container"><div className="error">Error: {error}</div></div>;
  }

  return (
    <div className="products-container">
      <h1>Products</h1>
      <div className="products-list">
        <ul>
          {products.map(product => (
            <li key={product.id}>
              <span className="product-name">{product.name}</span>
              <Link to={`/checkout?price_id=${product.default_price}`}>
                Buy Now
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
