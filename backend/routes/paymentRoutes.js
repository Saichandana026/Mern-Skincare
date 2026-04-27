const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");


const razorpay = new Razorpay({
  key_id: "rzp_test_SaXaAbphuqEtxN",
  key_secret: "in1xV77zn4puDfmzD3O3s3J5",
});


router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `order_${Date.now()}`
    });

    res.json(order);
    

  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

router.post("/verify", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing payment details" });
  }

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    console.log("VERIFY BODY:", req.body);
    return res.json({ success: true });
  } else {
    return res.status(400).json({ success: false });
  }
});



module.exports = router;

