const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning all mock items and click logs...');
  await prisma.clickLog.deleteMany();
  await prisma.bidTransaction.deleteMany();
  await prisma.item.deleteMany();
  
  console.log('Ensuring default site settings...');
  await prisma.siteSetting.deleteMany();
  await prisma.siteSetting.createMany({
    data: [
      { key: 'min_bid_increment', value: '1' },
      { key: 'takeover_price_multiplier', value: '2' },
      { key: 'takeover_duration_hours', value: '3' },
      { key: 'admin_require_approval', value: 'false' }, // instant approval for real bids
    ]
  });

  const count = await prisma.item.count();
  console.log(`Database is now completely clean! Total items: ${count}`);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
