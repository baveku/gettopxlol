const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data for Outrank...');

  await prisma.clickLog.deleteMany();
  await prisma.bidTransaction.deleteMany();
  await prisma.item.deleteMany();
  await prisma.siteSetting.deleteMany();

  await prisma.siteSetting.createMany({
    data: [
      { key: 'min_bid_increment', value: '1' },
      { key: 'takeover_price_multiplier', value: '2' },
      { key: 'takeover_duration_hours', value: '3' },
      { key: 'admin_require_approval', value: 'true' },
    ]
  });

  const sampleItems = [
    {
      url: 'https://trycomp.ai',
      domain: 'trycomp.ai',
      title: 'trycomp.ai',
      description: 'Automate SOC 2, ISO 27001, HIPAA, and GDPR. 580+ integrations, 1,000+ companies, audit-ready in days, with audit and pentest included.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=trycomp.ai&sz=128',
      email: 'founder@trycomp.ai',
      totalBidAmount: 10000,
      status: 'APPROVED',
      clickCount: 8243,
      createdAt: new Date(Date.now() - 10 * 3600 * 1000),
    },
    {
      url: 'https://lathire.com',
      domain: 'lathire.com',
      title: 'lathire.com',
      description: 'LatHire is Latin America\'s largest talent marketplace. Hire vetted tech and generalist professionals in as little as 24 hours, for up to 80% less.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=lathire.com&sz=128',
      email: 'contact@lathire.com',
      totalBidAmount: 3100,
      status: 'APPROVED',
      clickCount: 1486,
      createdAt: new Date(Date.now() - 7 * 3600 * 1000),
    },
    {
      url: 'https://mytb.ai',
      domain: 'mytb.ai',
      title: 'mytb.ai',
      description: 'Automated, accurate, actionable bookkeeping and trial balance software for modern accounting firms.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=mytb.ai&sz=128',
      email: 'team@mytb.ai',
      totalBidAmount: 2999,
      status: 'APPROVED',
      clickCount: 742,
      createdAt: new Date(Date.now() - 7 * 3600 * 1000 + 30 * 60 * 1000),
    },
    {
      url: 'https://joinklover.com',
      domain: 'joinklover.com',
      title: 'joinklover.com',
      description: 'Need cash fast? Klover lets you get a cash advance of up to $750 in minutes — no interest, no credit check. Download the app today.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=joinklover.com&sz=128',
      email: 'growth@joinklover.com',
      totalBidAmount: 2000,
      status: 'APPROVED',
      clickCount: 1641,
      createdAt: new Date(Date.now() - 10 * 3600 * 1000 + 15 * 60 * 1000),
    },
    {
      url: 'https://peptiprices.com',
      domain: 'peptiprices.com',
      title: 'peptiprices.com',
      description: 'Find the best prices for research peptides including Retatrutide, Tirzepatide, BPC-157, and more across verified suppliers with real-time stock.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=peptiprices.com&sz=128',
      email: 'support@peptiprices.com',
      totalBidAmount: 1275,
      status: 'APPROVED',
      clickCount: 171,
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    },
    {
      url: 'https://evomarketing.co',
      domain: 'evomarketing.co',
      title: 'evomarketing.co',
      description: 'Mass UGC that compounds into revenue and acquisition channels you own, not rent. EVO is the pioneer in creating organic content for growth.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=evomarketing.co&sz=128',
      email: 'hi@evomarketing.co',
      totalBidAmount: 1250,
      status: 'APPROVED',
      clickCount: 490,
      createdAt: new Date(Date.now() - 7 * 3600 * 1000),
    },
    {
      url: 'https://fiber.so',
      domain: 'fiber.so',
      title: 'fiber.so',
      description: 'The private wallet for your stablecoins. Fast, secure, and confidential.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=fiber.so&sz=128',
      email: 'founders@fiber.so',
      totalBidAmount: 1029,
      status: 'APPROVED',
      clickCount: 673,
      createdAt: new Date(Date.now() - 10 * 3600 * 1000),
    },
    {
      url: 'https://prelint.com',
      domain: 'prelint.com',
      title: 'prelint.com',
      description: 'Prelint reviews your product specifications on every pull request. Catch product drift, inconsistencies, and misalignment before they ship.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=prelint.com&sz=128',
      email: 'alex@prelint.com',
      totalBidAmount: 1028,
      status: 'APPROVED',
      clickCount: 1766,
      createdAt: new Date(Date.now() - 10 * 3600 * 1000 + 40 * 60 * 1000),
    },
    {
      url: 'https://neocam.app',
      domain: 'neocam.app',
      title: 'neocam.app',
      description: 'Transform your photos into beautiful pixelated masterpieces with NeoCam. Create custom palettes and apply retro dithering effects.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=neocam.app&sz=128',
      email: 'support@neocam.app',
      totalBidAmount: 1027,
      status: 'APPROVED',
      clickCount: 1018,
      createdAt: new Date(Date.now() - 11 * 3600 * 1000),
    },
    {
      url: 'https://trycodus.com',
      domain: 'trycodus.com',
      title: 'trycodus.com',
      description: 'A crew of autonomous agents per person, routed by a Brain and checked by each other. Coding, SEO, video, research and support in one desktop app.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=trycodus.com&sz=128',
      email: 'team@trycodus.com',
      totalBidAmount: 1026,
      status: 'APPROVED',
      clickCount: 14127,
      createdAt: new Date(Date.now() - 12 * 3600 * 1000),
    },
  ];

  for (const item of sampleItems) {
    const created = await prisma.item.create({ data: item });
    await prisma.bidTransaction.create({
      data: {
        itemId: created.id,
        amount: item.totalBidAmount,
        paymentProvider: 'POLAR',
        providerTxId: 'seed_' + Math.random().toString(36).substring(7),
        status: 'COMPLETED',
        payerEmail: item.email,
      }
    });
  }

  // Create one pending item for admin queue testing
  const pending = await prisma.item.create({
    data: {
      url: 'https://awesome-ai-tool.io',
      domain: 'awesome-ai-tool.io',
      title: 'Awesome AI Tool',
      description: 'The next generation AI assistant for indie makers and high-velocity engineering teams.',
      faviconUrl: 'https://www.google.com/s2/favicons?domain=awesome-ai-tool.io&sz=128',
      email: 'maker@awesome-ai-tool.io',
      totalBidAmount: 500,
      status: 'PENDING',
      clickCount: 0,
    }
  });

  await prisma.bidTransaction.create({
    data: {
      itemId: pending.id,
      amount: 500,
      paymentProvider: 'DEV_SIMULATOR',
      providerTxId: 'seed_pending_1',
      status: 'COMPLETED',
      payerEmail: pending.email,
    }
  });

  console.log('Database seeded successfully with ' + (sampleItems.length + 1) + ' items.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
