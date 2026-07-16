const express = require('express');
const router = express.Router();

// GET /config — public, no auth. Frontend uses this to know if/where to send
// people to upgrade. Returns null if LemonSqueezy isn't configured yet.
router.get('/', (req, res) => {
  const storeUrl = process.env.LEMONSQUEEZY_STORE_URL;
  const variantId = process.env.LEMONSQUEEZY_VARIANT_ID;

  const checkoutBaseUrl = storeUrl && variantId ? `${storeUrl}/checkout/buy/${variantId}` : null;

  res.json({ checkoutBaseUrl });
});

module.exports = router;
