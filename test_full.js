async function runFullTestSuite() {
  console.log('==================================================');
  console.log('🚀 RUNNING OUTRANK FULL END-TO-END VERIFICATION');
  console.log('==================================================');

  // 1. Initial Leaderboard
  const lb1 = await (await fetch('http://localhost:3000/api/leaderboard')).json();
  console.log(`\n[1] Initial Leaderboard: ${lb1.items.length} items loaded.`);
  console.log(`    #1 is ${lb1.items[0].domain} with $${lb1.items[0].totalBidAmount}`);
  console.log(`    #2 is ${lb1.items[1].domain} with $${lb1.items[1].totalBidAmount}`);

  // 2. OpenGraph Scraper
  const scrapeRes = await (await fetch('http://localhost:3000/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://trycomp.ai' }),
  })).json();
  console.log(`\n[2] Scraper Test for existing URL:`);
  console.log(`    Title: "${scrapeRes.metadata.title}"`);
  console.log(`    Recognized existing total: $${scrapeRes.existing.totalBidAmount}`);

  // 3. Cumulative Outbid Test:
  // Item #2 (lathire.com) currently has $3,100.
  // Let's add $7,000 to lathire.com so its cumulative total becomes $10,100, which beats #1 trycomp.ai ($10,000)!
  console.log(`\n[3] Testing Cumulative Outbid:`);
  console.log(`    Adding $7,000 to lathire.com (currently $3,100)...`);
  const bidRes = await (await fetch('http://localhost:3000/api/bid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://lathire.com',
      email: 'contact@lathire.com',
      amount: 7000,
      provider: 'DEV_SIMULATOR',
    }),
  })).json();

  // Complete the payment transaction
  await fetch('http://localhost:3000' + bidRes.checkoutUrl, { redirect: 'manual' });

  // 4. Verify Leaderboard Rankings
  const lb2 = await (await fetch('http://localhost:3000/api/leaderboard')).json();
  console.log(`\n[4] Updated Rankings after cumulative bid:`);
  console.log(`    #1: ${lb2.items[0].domain} ($${lb2.items[0].totalBidAmount})`);
  console.log(`    #2: ${lb2.items[1].domain} ($${lb2.items[1].totalBidAmount})`);

  if (lb2.items[0].domain !== 'lathire.com' || lb2.items[0].totalBidAmount !== 10100) {
    throw new Error(`Cumulative outbid assertion failed! Expected lathire.com at #1 with $10100, got ${lb2.items[0].domain} with $${lb2.items[0].totalBidAmount}`);
  }
  console.log(`    ✅ Cumulative rank jump confirmed! lathire.com claimed #1 with $10,100 total!`);

  // 5. Test Outbound Click Tracking
  console.log(`\n[5] Testing Click Tracking for #${lb2.items[0].domain}:`);
  const initialClicks = lb2.items[0].clickCount;
  const clickRes = await fetch(`http://localhost:3000/api/r/${lb2.items[0].id}`, { redirect: 'manual' });
  const redirectTarget = clickRes.headers.get('location');
  console.log(`    Redirected to: ${redirectTarget}`);

  const lb3 = await (await fetch('http://localhost:3000/api/leaderboard')).json();
  console.log(`    Clicks before: ${initialClicks} -> Clicks after: ${lb3.items[0].clickCount}`);
  if (lb3.items[0].clickCount !== initialClicks + 1) {
    throw new Error('Click count did not increment!');
  }
  console.log(`    ✅ Click tracking verified!`);

  // 6. Test Admin Moderation Queue
  console.log(`\n[6] Testing Admin Moderation API:`);
  const adminStats = await (await fetch('http://localhost:3000/api/admin/stats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: 'supersecretadmin123' }),
  })).json();
  console.log(`    Admin Stats: Total Revenue: $${adminStats.stats.totalRevenue}, Pending Queue: ${adminStats.stats.pendingCount}, Approved: ${adminStats.stats.approvedCount}`);

  console.log('\n==================================================');
  console.log('🎉 ALL INTEGRATION & BUSINESS LOGIC TESTS PASSED!');
  console.log('==================================================');
}

runFullTestSuite().catch((e) => {
  console.error('Test error:', e);
  process.exit(1);
});
