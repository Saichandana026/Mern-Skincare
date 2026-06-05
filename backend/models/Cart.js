const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
      quantity: Number,
      gstRate: Number
    },
  ],
});

module.exports = mongoose.model("Cart", CartSchema);