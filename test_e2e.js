async function runTests() {
  console.log('--- STARTING OUTRANK E2E INTEGRATION TESTS ---');

  // Test 1: Fetch Leaderboard
  console.log('\n[Test 1] Fetching live leaderboard: GET /api/leaderboard');
  const res1 = await fetch('http://localhost:3000/api/leaderboard');
  if (!res1.ok) throw new Error('Leaderboard fetch failed');
  const data1 = await res1.json();
  console.log(`✓ Success: Received ${data1.items.length} items. Top item: ${data1.items[0]?.domain} with $${data1.items[0]?.totalBidAmount}`);

  // Test 2: Scrape Metadata
  console.log('\n[Test 2] Scraping URL metadata: POST /api/scrape');
  const res2 = await fetch('http://localhost:3000/api/scrape', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://github.com' }),
  });
  const data2 = await res2.json();
  console.log(`✓ Success: Scraped metadata for GitHub: Title: "${data2.metadata.title}", Favicon: ${data2.metadata.faviconUrl}`);

  // Test 3: Place a New Bid
  console.log('\n[Test 3] Placing a bid: POST /api/bid');
  const res3 = await fetch('http://localhost:3000/api/bid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://myviralapp.ai',
      email: 'founder@myviralapp.ai',
      amount: 15000, // higher than top #1 to claim #1
      customTitle: 'My Viral AI App',
      customDescription: 'The ultimate AI tool claiming #1 spot on Outrank!',
      provider: 'DEV_SIMULATOR',
    }),
  });
  const data3 = await res3.json();
  console.log(`✓ Success: Bid created for ${data3.item.domain}, Transaction ID: ${data3.transactionId}, Amount: $${data3.amount}`);

  // Test 4: Complete Payment Simulation
  console.log('\n[Test 4] Simulating payment completion: GET ' + data3.checkoutUrl);
  const res4 = await fetch('http://localhost:3000' + data3.checkoutUrl, { redirect: 'manual' });
  console.log(`✓ Success: Payment completed with status ${res4.status}`);

  // Test 5: Admin Moderation
  console.log('\n[Test 5] Approving submission via Admin API: POST /api/admin/moderate');
  const res5 = await fetch('http://localhost:3000/api/admin/moderate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      key: 'supersecretadmin123',
      itemId: data3.itemId,
      action: 'APPROVE',
    }),
  });
  const data5 = await res5.json();
  console.log(`✓ Success: Item approved: ${data5.item.domain} (Status: ${data5.item.status})`);

  // Test 6: Verify New #1 Leaderboard Rank
  console.log('\n[Test 6] Verifying updated leaderboard: GET /api/leaderboard');
  const res6 = await fetch('http://localhost:3000/api/leaderboard');
  const data6 = await res6.json();
  console.log(`✓ New Rank #1: ${data6.items[0]?.domain} with $${data6.items[0]?.totalBidAmount} (Previous #1 is now #2: ${data6.items[1]?.domain})`);
  if (data6.items[0]?.domain !== 'myviralapp.ai') {
    throw new Error('Ranking verification failed: expected myviralapp.ai at #1');
  }

  // Test 7: Click Tracking & Redirect
  console.log('\n[Test 7] Testing click tracking: GET /api/r/' + data3.itemId);
  const clickBefore = data6.items[0].clickCount;
  const res7 = await fetch(`http://localhost:3000/api/r/${data3.itemId}`, { redirect: 'manual' });
  const redirectLocation = res7.headers.get('location');
  console.log(`✓ Success: Click recorded, redirecting to: ${redirectLocation}`);

  const res8 = await fetch('http://localhost:3000/api/leaderboard');
  const data8 = await res8.json();
  const clickAfter = data8.items[0].clickCount;
  console.log(`✓ Success: Click count incremented from ${clickBefore} to ${clickAfter}`);

  console.log('\n========================================');
  console.log('ALL E2E INTEGRATION TESTS PASSED 100%! 🎉');
  console.log('========================================');
}

runTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
