#!/usr/bin/env python3
"""Create Stripe products/prices for configured monetization tiers.
Run with STRIPE_SECRET_KEY in environment.
"""
import os
import stripe

stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
if not stripe.api_key:
    print('STRIPE_SECRET_KEY not set in environment')
    raise SystemExit(1)

# Pricing definitions (adapted from user input)
PRICING = [
    {
        'key': 'core_saas',
        'name': 'Core SaaS (OS)',
        'description': 'Per user monthly license (min 50 users)',
        'amount_cents': 4000,
        'interval': 'month'
    },
    {
        'key': 'bid_marketplace_low',
        'name': 'Bid Marketplace (low)',
        'description': 'Low-end project listing fee',
        'amount_cents': 49900,
        'interval': 'one_time'
    },
    {
        'key': 'bid_marketplace_high',
        'name': 'Bid Marketplace (high)',
        'description': 'High-end project listing fee',
        'amount_cents': 499900,
        'interval': 'one_time'
    },
    {
        'key': 'paybrain_fee',
        'name': 'PayBrain transaction fee (1%)',
        'description': 'Percent-based fee; create as metadata',
        'amount_cents': 0,
        'interval': 'metadata'
    },
]

created = []
for p in PRICING:
    print('Creating product', p['key'])
    product = stripe.Product.create(name=p['name'], description=p['description'])
    if p['interval'] == 'one_time':
        price = stripe.Price.create(unit_amount=p['amount_cents'], currency='usd', product=product.id)
    elif p['interval'] == 'month':
        price = stripe.Price.create(unit_amount=p['amount_cents'], currency='usd', recurring={'interval':'month'}, product=product.id)
    else:
        price = None
    created.append({'key': p['key'], 'product': product.id, 'price': price.id if price else None})
    print(' ->', created[-1])

print('Done. Save these IDs in your .env as STRIPE_*_PRICE_ID')
