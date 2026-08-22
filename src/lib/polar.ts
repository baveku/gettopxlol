let cachedProductId: string | null = null;

export async function getOrCreatePolarProductId(polarToken: string): Promise<string> {
  if (process.env.POLAR_PRODUCT_ID) {
    return process.env.POLAR_PRODUCT_ID.trim();
  }

  if (cachedProductId) {
    return cachedProductId;
  }

  // 1. Try to list existing products in Polar Organization
  try {
    const listRes = await fetch('https://api.polar.sh/v1/products/?is_archived=false', {
      headers: {
        'Authorization': `Bearer ${polarToken.trim()}`,
        'Accept': 'application/json',
      },
    });

    if (listRes.ok) {
      const data = await listRes.json();
      if (data.items && data.items.length > 0 && data.items[0]?.id) {
        const prodId = String(data.items[0].id);
        cachedProductId = prodId;
        return prodId;
      }
    }
  } catch (err) {
    console.warn('Error listing Polar products:', err);
  }

  // 2. If no product exists yet, auto-create a default Pay-to-Rank product
  try {
    const createRes = await fetch('https://api.polar.sh/v1/products/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${polarToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'GetTopX — Pay-to-Rank Spotlight Bid',
        description: 'Real-time spotlight leaderboard bid on GetTopX (gettopx.lol)',
        prices: [
          {
            type: 'one_time',
            amount_type: 'custom',
            minimum_amount: 200,
            currency: 'usd',
          },
        ],
      }),
    });

    if (createRes.ok) {
      const createdData = await createRes.json();
      if (createdData.id) {
        const newId = String(createdData.id);
        cachedProductId = newId;
        return newId;
      }
    }
  } catch (createErr) {
    console.warn('Error auto-creating Polar product:', createErr);
  }

  throw new Error('Please create a Product in your Polar.sh Dashboard or set POLAR_PRODUCT_ID in Vercel settings.');
}
