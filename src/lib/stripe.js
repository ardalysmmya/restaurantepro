// Stripe integration — subscription management
// Requires: VITE_STRIPE_PUBLIC_KEY in .env
// Install: npm install @stripe/stripe-js

const PLANS = {
  starter: {
    name: 'Starter',
    price: 990,
    currency: 'MXN',
    features: ['1 restaurante', 'POS básico', 'Menú digital QR', '5 mesas'],
    priceId: 'price_starter_id',
  },
  pro: {
    name: 'Pro',
    price: 2490,
    currency: 'MXN',
    features: ['3 restaurantes', 'POS + KDS', 'Ingeniería de menú', 'CRM completo', 'Mesas ilimitadas'],
    priceId: 'price_pro_id',
    recommended: true,
  },
  enterprise: {
    name: 'Enterprise',
    price: 4990,
    currency: 'MXN',
    features: ['Restaurantes ilimitados', 'Todo Pro +', 'API acceso', 'Soporte 24/7', 'White label'],
    priceId: 'price_enterprise_id',
  },
};

export function getPlans() {
  return PLANS;
}

export function getPlanByTier(tier) {
  return PLANS[tier] || PLANS.starter;
}

// To implement Stripe:
// 1. Create Stripe products/prices in dashboard
// 2. Replace priceId values above
// 3. Call backend endpoint to create checkout session
// 4. Handle webhook for subscription status updates
// 5. Update subscriptions table in Supabase
