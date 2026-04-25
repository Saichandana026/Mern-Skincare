console.log("Server file loaded successfully");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const cors = require("cors");
const multer = require("multer");
const path = require("path");

const Product = require("./models/Product");
const authRoutes = require("./routes/auth");

const app = express();

const nodemailer = require("nodemailer");
const User = require("./models/User");
const Order = require("./models/Order");
const Cart = require("./models/Cart");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "saichandana2604@gmail.com",
    pass: "swtl jifh plql xnjv" 
  }
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);

app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/api/auth", authRoutes);


mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));


// mongoose
//   .connect("mongodb://127.0.0.1:27017/skincareDB")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "products", 
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage: storage });


app.post("/upload", upload.single("image"), (req, res) => {
  try {
    res.json({
      image: req.file.path, 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
});

app.post("/add-product", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.json({ message: "Product added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding product" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

app.put("/update-product/:id", async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Product updated" });
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/delete-product/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

app.post("/addToCart", async (req, res) => {
  const { productId, name, price, image, quantity, userId } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, name, price, image, quantity }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, name, price, image, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Error adding to cart" });
  }
});

app.get("/cart/:userId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: "Error fetching cart" });
  }
});

app.put("/cart/:userId/:productId", async (req, res) => {
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.productId === req.params.productId
    );

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i.productId !== req.params.productId
      );
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

app.delete("/cart/:userId/:productId", async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.params.userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId !== req.params.productId
    );

    await cart.save();
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

app.delete("/cart/:userId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Clear failed" });
  }
});

app.post("/placeOrder", async (req, res) => {
  console.log("PLACE ORDER API HIT");
  console.log("Body:", req.body);

  const { userId, address, paymentMethod, email } = req.body;

  try {
    const cart = await Cart.findOne({ userId });

    console.log("Cart Found:", cart);

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let paymentStatus;

    if (paymentMethod === "Online Payment") {
      paymentStatus = "Paid";
    } else {
      paymentStatus = "Pending"; 
    }

    const order = new Order({
      userId,
      items: cart.items,
      address,
      paymentMethod,
      paymentStatus,
      totalAmount: total,
      status: "Placed"
    });

    await order.save();

    console.log("Order Saved:", order);

    const user = await User.findById(order.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const mailOptions = {
      from: '"Skincare" <saichandana2604@gmail.com>',
      to: user.email,
      subject: "Order Confirmation",
      html: `
        <h2>Order Placed Successfully </h2>
        <p>Hello ${user.name},</p>
        <p>Your order has been placed.</p>
        <p><b>Total Amount:</b> ${total}</p>
        <p><b>Payment Method:</b> ${paymentMethod}</p>
        <p><b>Address:</b>  ${order.address.address},${order.address.phone}, ${order.address.pincode}</p>
        <p>Thank you for shopping with us!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    console.log("Email sent successfully");

    await Cart.findOneAndDelete({ userId });

    res.json({ message: "Order placed & email sent successfully" });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.status(500).json({ message: "Order failed" });
  }
});



app.get("/admin-orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});


app.put("/update-order/:id", async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();
   
    const user = await User.findById(order.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const mailOptions = {
      from: '"Skincare" <saichandana2604@gmail.com>',
      to: user.email,
      subject: "Order Status Updated",
      html: `
        <h2>Order Update</h2>
        <p>Hello ${user.name},</p>
        <p>Your order status has been updated.</p>
        <p><strong>Status:</strong> ${status}</p>
        <p>Thank you for shopping with us!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Order updated and email sent successfully" });

  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Error updating order" });
  }
});

app.delete("/delete-order/:id", async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("Delete order error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

app.get("/search", async (req, res) => {
  try {
    let query = req.query.q;

    console.log("Search Query:", query);

  
    if (!query || typeof query !== "string") {
      return res.json([]);
    }

    query = query.trim();

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const searchRegex = new RegExp(escapedQuery.split(" ").join("|"), "i");

    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { category: searchRegex }
      ]
    })
      .limit(10) 
      .select("name price image");

    res.json(products);

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ message: "Search failed" });
  }
});


//API for particular user order

app.get("/my-orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

app.get("/api/admin/dashboard", async (req, res) => {
  try {
  
    const users = await User.countDocuments();

   
    const orders = await Order.countDocuments();

    const paidOrders = await Order.find({
      paymentStatus: "Paid"
    });

    const totalPayment = paidOrders.reduce(
      (sum, item) => sum + item.totalAmount,
      0
    );

   
    const salesCount = paidOrders.length;


    const months = [
      "Jan", "Feb", "Mar", "Apr",
      "May", "Jun", "Jul", "Aug",
      "Sep", "Oct", "Nov", "Dec"
    ];

    let salesData = [];

    for (let i = 0; i < 12; i++) {
      const monthOrders = paidOrders.filter(order => {
        return new Date(order.createdAt).getMonth() === i;
      });

      salesData.push({
        month: months[i],
        sales: monthOrders.length
      });
    }

   
    const allUsers = await User.find();

    let signupData = [];

    for (let i = 0; i < 12; i++) {
      const count = allUsers.filter(user => {
        if (!user._id.getTimestamp) return false;

        return user._id.getTimestamp().getMonth() === i;
      }).length;

      signupData.push({
        date: months[i],
        users: count
      });
    }

    res.json({
      stats: {
        users,
        orders,
        totalPayment,
        salesCount
      },
      salesData,
      signupData
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Dashboard error"
    });
  }
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});