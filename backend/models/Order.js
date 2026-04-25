const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: String,

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      image: String,
      quantity: Number,
    },
  ],

  address: {
    name: String,
    phone: Number,
    address: String,
    pincode: Number
  },

  paymentMethod: String,

  paymentStatus: {
    type: String,
    default: "Pending"
  },


  totalAmount: Number,

  status: {
    type: String,
    default: "Paid"
  },
  

 
    createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", OrderSchema);