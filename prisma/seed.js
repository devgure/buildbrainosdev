const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function upsertPricing() {
  const tiers = [
    {
      key: 'core_saas',
      name: 'Core SaaS (OS)',
      description: 'Per user monthly license (min 50 users)',
      priceCents: 4000,
      interval: 'month',
      metadata: { min_users: 50 }
    },
    {
      key: 'bid_marketplace_low',
      name: 'Bid Marketplace (Low)',
      description: 'Project listing - low tier',
      priceCents: 49900,
      interval: 'one_time',
      metadata: { success_fee_percent: null }
    },
    {
      key: 'bid_marketplace_high',
      name: 'Bid Marketplace (High)',
      description: 'Project listing - high tier',
      priceCents: 499900,
      interval: 'one_time',
      metadata: { success_fee_percent: null }
    },
    {
      key: 'paybrain_fee',
      name: 'PayBrain Transaction Fee',
      description: '1% transaction fee on verified payments',
      priceCents: 0,
      interval: 'metadata',
      metadata: { percent_fee: 1 }
    },
    {
      key: 'saferate_commission',
      name: 'SafeRate Insurance Commission',
      description: '15% commission on premiums',
      priceCents: 0,
      interval: 'metadata',
      metadata: { commission_percent: 15 }
    },
    {
      key: 'enterprise_api',
      name: 'Enterprise API - Custom',
      description: 'Custom pricing for integrations (Procore, Autodesk)',
      priceCents: 0,
      interval: 'metadata',
      metadata: { contact_sales: true }
    }
  ];

  for (const t of tiers) {
    await prisma.pricingPlan.upsert({
      where: { key: t.key },
      update: {
        name: t.name,
        description: t.description,
        priceCents: t.priceCents,
        interval: t.interval,
        metadata: t.metadata
      },
      create: t
    });
    console.log('Upserted', t.key);
  }
}

upsertPricing()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
