'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  CreditCardIcon,
  CheckIcon,
  StarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Initialize Stripe with fallback
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : Promise.resolve(null);

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: string;
  stripePriceId: string;
  features: string[];
  recommended?: boolean;
}

interface SubscriptionPageProps {
  currentPlan?: string;
  onSubscriptionSuccess?: () => void;
}

// Payment form component
function PaymentForm({ plan, onSuccess }: { plan: Plan; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create subscription checkout session
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId: plan.id,
          trialDays: 14
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId
      });

      if (error) {
        throw new Error(error.message);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Subscribe to {plan.name}</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          ${plan.price}<span className="text-sm font-normal text-gray-500">/{plan.interval}</span>
        </div>
        <p className="text-gray-600 mb-4">{plan.description}</p>
        <ul className="space-y-2">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Start Free Trial - Then $${plan.price}/${plan.interval}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        14-day free trial • Cancel anytime • Secure payment by Stripe
      </p>
    </form>
  );
}

// One-time payment form component
function OneTimePaymentForm({ amount, description, onSuccess }: {
  amount: number;
  description: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/billing/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount,
          description,
          currency: 'usd'
        })
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment');
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardElement
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess();
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <div className="text-2xl font-bold text-blue-600 mb-2">
          ${amount.toFixed(2)}
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
}

// Main subscription component
export default function SubscriptionPage({ currentPlan, onSubscriptionSuccess }: SubscriptionPageProps) {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'subscription' | 'one-time'>('subscription');
  const [oneTimeAmount, setOneTimeAmount] = useState(100);
  const [oneTimeDescription, setOneTimeDescription] = useState('One-time payment');
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
    // Check if Stripe is properly configured
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Payment system is not configured. Please contact support.');
    }
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/billing/plans');
      const data = await response.json();
      
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan: Plan) => {
    if (stripeError) {
      alert(stripeError);
      return;
    }
    setSelectedPlan(plan);
    setPaymentMode('subscription');
    setShowPaymentForm(true);
  };

  const handleOneTimePayment = () => {
    if (stripeError) {
      alert(stripeError);
      return;
    }
    setPaymentMode('one-time');
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    onSubscriptionSuccess?.();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business. Start with a 14-day free trial, 
          cancel anytime.
        </p>
      </div>

      {stripeError && (
        <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Payment System Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{stripeError}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showPaymentForm ? (
        <>
          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 ${
                  plan.recommended 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200'
                }`}
              >
                {plan.recommended && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center">
                      <StarIcon className="h-4 w-4 mr-1" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-500">
                      /{plan.interval}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.recommended
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  } ${
                    currentPlan === plan.id 
                      ? 'opacity-50 cursor-not-allowed' 
                      : ''
                  }`}
                  disabled={currentPlan === plan.id}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Start Free Trial'}
                </button>
              </div>
            ))}
          </div>

          {/* One-time Payment Option */}
          <div className="bg-gray-50 rounded-2xl p-8 text-center">
            <SparklesIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              One-Time Payment
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Need a custom solution or want to make a one-time payment? 
              We accept payments for custom projects, additional services, or premium features.
            </p>
            
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount ($)
                </label>
                <input
                  type="number"
                  value={oneTimeAmount}
                  onChange={(e) => setOneTimeAmount(Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={oneTimeDescription}
                  onChange={(e) => setOneTimeDescription(e.target.value)}
                  className="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="What is this payment for?"
                />
              </div>
            </div>

            <button
              onClick={handleOneTimePayment}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <CreditCardIcon className="h-5 w-5 inline mr-2" />
              Make Payment
            </button>
          </div>
        </>
      ) : (
        <div className="max-w-md mx-auto">
          <Elements stripe={stripePromise}>
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <button
                onClick={() => setShowPaymentForm(false)}
                className="mb-6 text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Plans
              </button>

              {paymentMode === 'subscription' && selectedPlan ? (
                <PaymentForm
                  plan={selectedPlan}
                  onSuccess={handlePaymentSuccess}
                />
              ) : (
                <OneTimePaymentForm
                  amount={oneTimeAmount}
                  description={oneTimeDescription}
                  onSuccess={handlePaymentSuccess}
                />
              )}
            </div>
          </Elements>
        </div>
      )}

      {/* Trust indicators */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 mb-4">
          Trusted by thousands of businesses worldwide
        </p>
        <div className="flex items-center justify-center space-x-6 text-gray-400">
          <div className="flex items-center">
            <CreditCardIcon className="h-6 w-6 mr-2" />
            <span className="text-sm">Secured by Stripe</span>
          </div>
          <div className="flex items-center">
            <CheckIcon className="h-6 w-6 mr-2" />
            <span className="text-sm">PCI Compliant</span>
          </div>
          <div className="flex items-center">
            <StarIcon className="h-6 w-6 mr-2" />
            <span className="text-sm">256-bit SSL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
