#!/usr/bin/env python3
"""Create a Stripe Checkout Session for selected pricing plan.
Requires STRIPE_SECRET_KEY in env and STRIPE_PREMIUM_PRICE_ID etc. set for product prices.
"""
import os
import stripe
import sys

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
if not stripe.api_key:
    print('STRIPE_SECRET_KEY not set')
    sys.exit(1)

PLAN = sys.argv[1] if len(sys.argv) > 1 else 'core_saas'

PRICE_MAP = {
    'core_saas': os.getenv('STRIPE_PREMIUM_PRICE_ID'),
    'gold': os.getenv('STRIPE_GOLD_PRICE_ID'),
    'trusted_badge': os.getenv('STRIPE_TRUSTED_BADGE_PRICE_ID')
}

price_id = PRICE_MAP.get(PLAN)
if not price_id:
    print('Unknown plan or price id not set for', PLAN)
    sys.exit(1)

session = stripe.checkout.Session.create(
    line_items=[{
        'price': price_id,
        'quantity': 1,
    }],
    mode='subscription',
    success_url='https://example.com/success',
    cancel_url='https://example.com/cancel',
)

print('Checkout URL:', session.url)
