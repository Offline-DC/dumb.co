import React, { useState } from "react";
import {
  PaymentElement,
  ShippingAddressElement,
  BillingAddressElement,
  useCheckout
} from '@stripe/react-stripe-js/checkout';
import './CheckoutForm.css';

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

  const checkoutState = useCheckout();

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
                <BillingAddressElement/>
              </div>
            ) : (
              <>
                <div>
                  <h4>Shipping Address</h4>
                  <ShippingAddressElement/>
                </div>
                <div>
                  <h4>Billing Address</h4>
                  <BillingAddressElement/>
                </div>
              </>
            )}
          </div>
          
          <div className="checkout-right">
            <div className="order-summary">
              <h4>Order Summary</h4>
              <div className="order-details">
                {checkoutState.checkout.lineItems?.map((item: any, index: number) => (
                  <div key={index} className="order-item">
                    <span className="item-description">{item.name}</span>
                    <span className="item-amount">{item.total.amount}</span>
                  </div>
                ))}
                <div className="order-item">
                  <span className="item-description">Shipping</span>
                  <span className="item-amount">{checkoutState.checkout.total.shippingRate.amount}</span>
                </div>
                <div className="order-item">
                  <span className="item-description">Tax</span>
                  <span className="item-amount">
                    {checkoutState.checkout.tax?.status === 'requires_billing_address' 
                      ? 'Calculating...' 
                      : checkoutState.checkout.total.taxExclusive.amount}
                  </span>
                </div>
                <div className="order-total">
                  <span className="total-label">Total</span>
                  <span className="total-amount">
                    {checkoutState.checkout.total.total.amount}
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