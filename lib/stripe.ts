import Stripe from 'stripe';

const stripeApiKey = process.env.STRIPE_API_KEY || '';

export const stripe = new Stripe(stripeApiKey, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
