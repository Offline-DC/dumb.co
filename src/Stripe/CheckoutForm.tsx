import React, { useState, useEffect } from "react";
import {
  PaymentElement,
  ShippingAddressElement,
  BillingAddressElement,
  useCheckout
} from '@stripe/react-stripe-js/checkout';
import './CheckoutForm.css';
import PricingOptions from './PricingOptions';

interface EmailValidationResult {
    isValid: boolean;
    message: string | null;
}

interface EmailInputProps {
    checkout: any;
    email: string;
    setEmail: (email: string) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

interface PhoneInputProps {
    phone: string;
    setPhone: (phone: string) => void;
    error: string | null;
    setError: (error: string | null) => void;
}

const validateEmail = async (email: string, checkout: any): Promise<EmailValidationResult> => {
    const updateResult = await checkout.updateEmail(email);
    const isValid = updateResult.type !== "error";

    return { isValid, message: !isValid ? updateResult.error.message : null };
}

const EmailInput: React.FC<EmailInputProps> = ({ checkout, email, setEmail, error, setError }) => {
  const handleBlur = async () => {
    if (!email) {
      setError('Email is required');
      return;
    }

    const { isValid, message } = await validateEmail(email, checkout);
    if (!isValid) {
      setError(message);
    }
  };

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setEmail(e.target.value);
};

  return (
    <>
      <label>
        <h4>Email</h4>
        <input
          id="email"
          type="text"
          value={email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={error ? "error" : ""}
          placeholder="your@email.com"
        />
      </label>
      {error && <div id="email-errors">{error}</div>}
    </>
  );
};

const validatePhone = (phone: string): { isValid: boolean; cleanedPhone: string; message: string | null } => {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 0) {
    return { isValid: false, cleanedPhone: '', message: 'Phone number is required' };
  }
  
  if (cleaned.length !== 10) {
    return { isValid: false, cleanedPhone: cleaned, message: 'Phone number must be 10 digits' };
  }
  
  return { isValid: true, cleanedPhone: cleaned, message: null };
};

const PhoneInput: React.FC<PhoneInputProps> = ({ phone, setPhone, error, setError }) => {
  const handleBlur = () => {
    if (!phone) {
      setError('Phone number is required');
      return;
    }

    const { isValid, message } = validatePhone(phone);
    if (!isValid) {
      setError(message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setPhone(e.target.value);
  };

  return (
    <>
      <label>
        <h4>Phone Number</h4>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={handleChange}
          onBlur={handleBlur}
          className={error ? "error" : ""}
          placeholder="(404) 123-4567"
        />
      </label>
      {error && <div id="phone-errors">{error}</div>}
    </>
  );
};

const CheckoutForm = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [isUpdatingShipping, setIsUpdatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [shippingProductId, setShippingProductId] = useState<string | null>(null);
  const [billingState, setBillingState] = useState<string | null>(null);

  const checkoutState = useCheckout();

  // Debug: Log checkout state structure
  useEffect(() => {
    if (checkoutState.type === 'success') {
      console.log('Checkout state structure:', checkoutState.checkout);
      console.log('Session ID:', checkoutState.checkout.id);
      console.log('Shipping rate:', checkoutState.checkout.total?.shippingRate);
    }
  }, [checkoutState]);

  if (checkoutState.type === 'loading') {
    return (
      <div className="loading-container">Loading...</div>
    );
  }

  if (checkoutState.type === 'error') {
    return (
      <div className="error-container">Error: {checkoutState.error.message}</div>
    );
  }

interface HandleSubmitEvent extends React.FormEvent<HTMLFormElement> {}

interface ConfirmResult {
    type: 'error' | 'success';
    error?: {
        message: string;
    };
}

const handleShippingAddressChange = async (event: any) => {
    console.log('Full address change event:', JSON.stringify(event, null, 2));
    console.log('Event.value:', event.value);
    console.log('Event.complete:', event.complete);
    
    // Try to extract postal code from various possible locations
    const postalCode = event.value?.address?.postalCode || 
                      event.value?.postalCode || 
                      event.value?.address?.postal_code;
    
    // Extract billing state for tax calculation
    const state = event.value?.address?.state || event.value?.address?.region;
    if (state) {
        console.log('Billing state:', state);
        setBillingState(state);
    }
    
    console.log('Extracted postal code:', postalCode);
    
    // Trigger update if we have a postal code (don't wait for complete)
    if (postalCode && postalCode.length >= 5) {
        console.log('Postal code found, updating shipping...');
        
        setIsUpdatingShipping(true);
        setShippingError(null);

        try {
            // Get the session ID from the checkout state
            if (checkoutState.type !== 'success') {
                throw new Error('Checkout not ready');
            }
            
            const sessionId = checkoutState.checkout.id;
            console.log('Using session ID:', sessionId);

            if (!sessionId) {
                throw new Error('Session ID not found');
            }

            const response = await fetch('http://localhost:3000/stripe/update-shipping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: sessionId,
                    destinationZIPCode: postalCode
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Server error:', errorData);
                throw new Error(errorData.error || 'Failed to update shipping rate');
            }

            const data = await response.json();
            console.log('Shipping updated successfully:', data);
            
            // Store the shipping cost and product ID locally
            setShippingCost(data.shippingAmount);
            setShippingProductId(data.productId);
            
        } catch (error) {
            console.error('Error updating shipping:', error);
            setShippingError(error instanceof Error ? error.message : 'Failed to calculate shipping rate. Please try again.');
        } finally {
            setIsUpdatingShipping(false);
        }
    } else {
        console.log('No valid postal code yet. Waiting for user to enter complete zip code...');
    }
};

const handleBillingAddressChange = async (event: any) => {
    console.log('Billing address change event:', event);
    
    // Extract billing state for tax calculation
    const state = event.value?.address?.state || event.value?.address?.region;
    if (state) {
        console.log('Billing state:', state);
        setBillingState(state);
    }
};

const handleSubmit = async (e: HandleSubmitEvent): Promise<void> => {
        e.preventDefault();

        const {checkout} = checkoutState;
        setIsSubmitting(true);

        // Validate email
        if (!email) {
            setEmailError('Email is required');
            setMessage('Email is required');
            setIsSubmitting(false);
            return;
        }
        const { isValid: emailIsValid, message: emailMessage } = await validateEmail(email, checkout);
        if (!emailIsValid) {
            setEmailError(emailMessage);
            setMessage(emailMessage);
            setIsSubmitting(false);
            return;
        }

        // Validate phone
        const { isValid: phoneIsValid, cleanedPhone, message: phoneMessage } = validatePhone(phone);
        if (!phoneIsValid) {
            setPhoneError(phoneMessage);
            setMessage(phoneMessage);
            setIsSubmitting(false);
            return;
        }

        // Store the cleaned phone number
        setPhone(cleanedPhone);

        // Finalize session with shipping and tax before confirming
        try {
            const subtotalAmount = parseInt(checkoutState.checkout.total.total.amount.replace(/[^0-9]/g, ''));
            const taxAmount = billingState && (billingState.toUpperCase() === 'DC' || billingState.toUpperCase() === 'DISTRICT OF COLUMBIA') 
                ? Math.round(subtotalAmount * 0.06)
                : 0;

            const finalizeResponse = await fetch('http://localhost:3000/stripe/finalize-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId: checkoutState.checkout.id,
                    shippingAmount: shippingCost || 0,
                    taxAmount: taxAmount,
                    billingState: billingState,
                })
            });

            if (!finalizeResponse.ok) {
                console.error('Failed to finalize session');
            } else {
                console.log('Session finalized with shipping and tax');
            }
        } catch (error) {
            console.error('Error finalizing session:', error);
        }

        const confirmResult: ConfirmResult = await checkout.confirm();

        // This point will only be reached if there is an immediate error when
        // confirming the payment. Otherwise, your customer will be redirected to
        // your `return_url`. For some payment methods like iDEAL, your customer will
        // be redirected to an intermediate site first to authorize the payment, then
        // redirected to the `return_url`.
        if (confirmResult.type === 'error' && confirmResult.error) {
            setMessage(confirmResult.error.message);
        }

        setIsSubmitting(false);
    };

    console.log('Checkout State:', checkoutState);

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <img src="/img/barn-star.png" alt="Barn Star" />
        <h1 style={{fontSize: '2rem', fontWeight: '600', color: '#333', fontFamily: 'Arial, sans-serif'}}>Checkout</h1>
      </div>
      
      <form className="checkout-form" onSubmit={handleSubmit}>
        <div className="checkout-content">
          <div className="checkout-left">
            <EmailInput
              checkout={checkoutState.checkout}
              email={email}
              setEmail={setEmail}
              error={emailError}
              setError={setEmailError}
            />
            
            <PhoneInput
              phone={phone}
              setPhone={setPhone}
              error={phoneError}
              setError={setPhoneError}
            />
            
            <div className="shipping-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={sameAsShipping}
                  onChange={(e) => setSameAsShipping(e.target.checked)}
                />
                <span>Billing address is the same as shipping address</span>
              </label>
            </div>
            
            {sameAsShipping ? (
              <div>
                <h4>Billing Address</h4>
                <BillingAddressElement onChange={handleShippingAddressChange}/>
                {isUpdatingShipping && <div className="shipping-message">Calculating shipping...</div>}
                {shippingError && <div className="shipping-error">{shippingError}</div>}
              </div>
            ) : (
              <>
                <div>
                  <h4>Shipping Address</h4>
                  <ShippingAddressElement onChange={handleShippingAddressChange}/>
                  {isUpdatingShipping && <div className="shipping-message">Calculating shipping...</div>}
                  {shippingError && <div className="shipping-error">{shippingError}</div>}
                </div>
                <div>
                  <h4>Billing Address</h4>
                  <BillingAddressElement onChange={handleBillingAddressChange}/>
                </div>
              </>
            )}
          </div>
          
          <div className="checkout-right">
            <PricingOptions />
            
            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="order-details">
                {checkoutState.checkout.lineItems?.map((item: any, index: number) => {
                  // Skip shipping items from line items since we'll show it separately
                  const isShipping = item.name === 'USPS Ground Advantage Shipping';
                  if (isShipping) return null;
                  
                  return (
                    <div key={index} className="order-item">
                      <span className="item-description">{item.name}</span>
                      <span className="item-amount">{item.total.amount}</span>
                    </div>
                  );
                })}
                {/* Show shipping if calculated */}
                {shippingCost !== null && (
                  <div className="order-item">
                    <span className="item-description">Shipping</span>
                    <span className="item-amount">${(shippingCost / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="order-item">
                  <span className="item-description">Tax</span>
                  <span className="item-amount">
                    {(() => {
                      if (!billingState) return 'Enter billing address';
                      
                      // Calculate 6% tax for DC on item cost only (excluding shipping)
                      if (billingState.toUpperCase() === 'DC' || billingState.toUpperCase() === 'DISTRICT OF COLUMBIA') {
                        const subtotalAmount = parseInt(checkoutState.checkout.total.total.amount.replace(/[^0-9]/g, '')) / 100;
                        const taxAmount = subtotalAmount * 0.06;
                        return `$${taxAmount.toFixed(2)}`;
                      }
                      
                      return '$0.00';
                    })()}
                  </span>
                </div>
                <div className="order-total">
                  <span className="total-label">Total</span>
                  <span className="total-amount">
                    {(() => {
                      const subtotalAmount = parseInt(checkoutState.checkout.total.total.amount.replace(/[^0-9]/g, '')) / 100;
                      const shippingAmount = (shippingCost || 0) / 100;
                      let total = subtotalAmount + shippingAmount;
                      
                      // Add 6% tax for DC on item cost only (excluding shipping)
                      if (billingState && (billingState.toUpperCase() === 'DC' || billingState.toUpperCase() === 'DISTRICT OF COLUMBIA')) {
                        const taxAmount = subtotalAmount * 0.06;
                        total = total + taxAmount;
                      }
                      
                      return `$${total.toFixed(2)}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4>Payment</h4>
              <PaymentElement id="payment-element" />
            </div>
          </div>
        </div>
        
        <div className="checkout-button-container">
          <button disabled={isSubmitting} id="submit">
            {isSubmitting ? (
              <div className="spinner"></div>
            ) : (
              "flip off"
            )}
          </button>
        </div>
        
        {/* Show any error or success messages */}
        {message && <div id="payment-message">{message}</div>}
      </form>
      
      <footer className="checkout-footer">
        <div className="checkout-footer-left">
          © {new Date().getFullYear()} Offline Inc.
        </div>
        <div className="checkout-footer-right">
          <a href="/shipping-returns">Shipping & Returns</a>
          <a href="/terms">Terms & Conditions</a>
          <a href="/privacy">Privacy Policy</a>
          <a href="/site-terms">Site Terms</a>
        </div>
      </footer>
    </div>
  );
}

export default CheckoutForm;