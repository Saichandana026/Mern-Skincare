const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  image: {
    type: String,
    default: ""
  },

  quantity: {
    type: Number,
    required: true,
    min: 0
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  description: {
    type: String,
    required: true,
    trim: true
  }
},
{
  timestamps: true
}
);

module.exports = mongoose.model("Product", ProductSchema);