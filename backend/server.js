console.log("Server file loaded successfully");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const PDFDocument = require("pdfkit");  

require("dotenv").config();
const mongoose = require("mongoose");
const Product = require("./models/Product");
const authRoutes = require("./routes/auth");

const nodemailer = require("nodemailer");
const User = require("./models/User");
const Order = require("./models/Order");
const Cart = require("./models/Cart");


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_NAME,
    pass: process.env.GMAIL_PASS
  }
});


const express = require("express");
const app = express();
const cors = require("cors");
const path = require("path");



app.use(cors());
app.use(express.json());

const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);



mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB Connected");
    console.log("MONGODB_URL:", process.env.MONGODB_URL); 
  }
)
  .catch((err) => console.log("MongoDB connection error:", err));


// mongoose
//   .connect("mongodb://127.0.0.1:27017/skincareDB")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((err) => console.log(err));



cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log("Cloudinary Config:");
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  },
});

const upload = multer({ storage });



function generateGSTInvoice(order, user) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    const GST_RATE = 0.18;
    const CGST_RATE = 0.09;
    const SGST_RATE = 0.09;

    const invoiceNo = `INV-${order._id.toString().slice(-6).toUpperCase()}`;
    const date = new Date(order.createdAt).toLocaleDateString("en-IN");


    doc
      .fontSize(18)
      .text("SKINCARE", { align: "center" })
      .fontSize(12)
      .text("GST INVOICE", { align: "center" })
      .moveDown();

    
    doc.fontSize(10);

    doc.text(`Invoice No: ${invoiceNo}`, 40, 100);
    doc.text(`Date: ${date}`, 40, 115);
    doc.text(`Payment: ${order.paymentMethod}`, 40, 130);

    doc.text(`Customer: ${user.name}`, 300, 100);
    doc.text(`Phone: ${order.address.phone}`, 300, 115);
    doc.text(`Address: ${order.address.address}`, 300, 130);

    doc.moveDown(3);

  
    const tableTop = 180;

    doc
      .font("Helvetica-Bold")
      .text("No", 40, tableTop)
      .text("Product", 80, tableTop)
      .text("Qty", 250, tableTop)
      .text("Price", 300, tableTop)
      .text("Total", 400, tableTop);

    doc.moveTo(40, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    let y = tableTop + 25;
    let subtotal = 0;

    doc.font("Helvetica");

    order.items.forEach((item, index) => {
      const total = item.price * item.quantity;
      subtotal += total;

      doc.text(index + 1, 40, y);
      doc.text(item.name, 80, y, { width: 150 });
      doc.text(item.quantity, 250, y);
      doc.text(`Rs.${item.price}`, 300, y);
      doc.text(`Rs.${total}`, 400, y);

      y += 20;
    });

    doc.moveTo(40, y).lineTo(550, y).stroke();

  
    const taxable = subtotal / (1 + GST_RATE);
    const cgst = taxable * CGST_RATE;
    const sgst = taxable * SGST_RATE;

    y += 20;

    doc.text(`Subtotal: Rs.${subtotal.toFixed(2)}`, 350, y);
    y += 15;
    doc.text(`Taxable: Rs.${taxable.toFixed(2)}`, 350, y);
    y += 15;
    doc.text(`CGST (9%): Rs.${cgst.toFixed(2)}`, 350, y);
    y += 15;
    doc.text(`SGST (9%): Rs.${sgst.toFixed(2)}`, 350, y);

    y += 25;

    doc
      .font("Helvetica-Bold")
      .text(`Grand Total: Rs.${order.totalAmount.toFixed(2)}`, 350, y);

   
    doc.moveDown(3);
    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Thank you for your purchase!", { align: "center" })
      .text("This is a computer-generated invoice.", { align: "center" });

    doc.end();
  });
}

module.exports = { generateGSTInvoice };

app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    console.log("FILE:", req.file);

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
      image: req.file.path,
    });
  } catch (err) {
    console.log("UPLOAD ERROR:", err);
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

  app.post("/api/placeOrder", async (req, res) => {
  console.log("Place Order API Called");

  const { userId, address, paymentMethod } = req.body;

  try {

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;
    cart.items.forEach(item => {
      totalAmount += item.price * item.quantity;
    });


    let paymentStatus = paymentMethod === "Online Payment" ? "Paid" : "Pending";


    const newOrder = new Order({
      userId,
      items: cart.items,
      address,
      paymentMethod,
      paymentStatus,
      totalAmount,
      status: "Placed"
    });

    await newOrder.save();
    console.log("Order saved:", newOrder._id);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    let invoiceBuffer = null;
    try {
      invoiceBuffer = await generateGSTInvoice(newOrder, user);
    } catch (error) {
      console.log("Invoice generation failed");
    }

    const invoiceNo = `INV-${newOrder._id.toString().slice(-8).toUpperCase()}`;

    // 7. Send email
    await transporter.sendMail({
      from: '"Skincare" <your-email@gmail.com>',
      to: user.email,
      subject: `Order Confirmation - ${invoiceNo}`,
      html: `
        <h2>Order Placed Successfully</h2>
        <p>Hello ${user.name},</p>
        <p>Your order has been placed.</p>
        <p><b>Invoice:</b> ${invoiceNo}</p>
        <p><b>Total:</b> Rs. ${totalAmount}</p>
        <p><b>Payment:</b> ${paymentMethod}</p>
      `,
      attachments: invoiceBuffer
        ? [
            {
              filename: `${invoiceNo}.pdf`,
              content: invoiceBuffer
            }
          ]
        : []
    });

    console.log("Email sent");


    await Cart.findOneAndDelete({ userId });


    res.json({ message: "Order placed successfully" });

  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ message: "Something went wrong" });
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
      from: '"Skincare" <saichandana026@gmail.com>',
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