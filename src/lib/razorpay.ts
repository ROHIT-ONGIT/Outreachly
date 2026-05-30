import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const PLANS = {
  FREE: {
    name: "Free",
    leadsPerMonth: 50,
    senderAccounts: 1,
    planId: null,
    priceInPaise: 0,
  },
  STARTER: {
    name: "Starter",
    leadsPerMonth: 500,
    senderAccounts: 1,
    planId: process.env.RAZORPAY_STARTER_PLAN_ID!,
    priceInPaise: 990000, // ₹9,900/mo
  },
  GROWTH: {
    name: "Growth",
    leadsPerMonth: 2000,
    senderAccounts: 3,
    planId: process.env.RAZORPAY_GROWTH_PLAN_ID!,
    priceInPaise: 1990000, // ₹19,900/mo
  },
  PRO: {
    name: "Pro",
    leadsPerMonth: Infinity,
    senderAccounts: 10,
    planId: process.env.RAZORPAY_PRO_PLAN_ID!,
    priceInPaise: 2990000, // ₹29,900/mo
  },
} as const;
