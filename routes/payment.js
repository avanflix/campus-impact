const express = require('express');
const router = express.Router();
const crypto = require('crypto');

let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.warn('Razorpay module not found. Run: npm install');
}

// Initialize Razorpay instance
function getRazorpayInstance() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

// POST /api/payment/create-order
router.post('/create-order', async (req, res) => {
  try {
    const { teamName, teamLeader, email, phone, college, members } = req.body;

    // Validate required fields
    if (!teamName || !teamLeader || !email || !phone || !college) {
      return res.status(400).json({ 
        success: false, 
        error: 'All fields are required' 
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({ 
        success: false, 
        error: 'Payment gateway not configured. Please add Razorpay keys to .env file.' 
      });
    }

    const amount = parseInt(process.env.REGISTRATION_AMOUNT) || 39900; // ₹399 in paise

    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        teamName,
        teamLeader,
        email,
        college,
        phone
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      teamData: { teamName, teamLeader, email, phone, college, members }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create payment order. Please try again.' 
    });
  }
});

// POST /api/payment/verify
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Missing payment details' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment verified — save to DB here if needed
      res.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        message: 'Payment verified successfully!'
      });
    } else {
      res.status(400).json({ success: false, error: 'Payment verification failed' });
    }

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, error: 'Verification error' });
  }
});

// GET /api/payment/config — send public key to frontend
router.get('/config', (req, res) => {
  res.json({ 
    keyId: process.env.RAZORPAY_KEY_ID || '',
    amount: parseInt(process.env.REGISTRATION_AMOUNT) || 39900,
    currency: 'INR'
  });
});

module.exports = router;
