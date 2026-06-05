const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: String,
  category: String,
  image: String,
  quantity: Number,
  price: Number,
  description: String,
  gstRate: Number
}, { timestamps: true });

module.exports = mongoose.model("Product", ProductSchema);