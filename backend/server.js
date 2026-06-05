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
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

  
    const invoiceNo = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
    const date      = new Date(order.createdAt).toLocaleDateString("en-IN");
    const pageW     = 595 - 80; 

    //header
    doc.fontSize(20).font("Helvetica-Bold").text("SKINCARE", 40, 40);

    doc.fontSize(9).font("Helvetica")
      .text("Corporate Office:",        400, 40)
      .text("Skincare Pvt Ltd",         400, 52)
      .text("Mangalore, Karnataka, India",         400, 64)

    // divider
    doc.moveTo(40, 118).lineTo(555, 118).lineWidth(1).stroke();

    //RECEIPT TITLE
    doc.fontSize(13).font("Helvetica-Bold").text("OFFICIAL RECEIPT", 40, 128);

    //  (two columns)
    doc.fontSize(9).font("Helvetica-Bold");
    const col1x = 40, col2x = 310, metaY = 152;
    const lineH = 14;

    // Left column
    doc.text("Invoice #:",   col1x, metaY);
    doc.text("Order ID:",    col1x, metaY + lineH);
    doc.text("Date:",        col1x, metaY + lineH * 2);
    doc.text("Payment:",     col1x, metaY + lineH * 3);
    doc.text("Status:",      col1x, metaY + lineH * 4);

    doc.font("Helvetica");
    doc.text(invoiceNo,                   col1x + 65, metaY);
    doc.text(order._id.toString(),        col1x + 65, metaY + lineH,    { width: 200 });
    doc.text(date,                        col1x + 65, metaY + lineH * 2);
    doc.text(order.paymentMethod || "COD",col1x + 65, metaY + lineH * 3);
    doc.text(order.status || "Pending",   col1x + 65, metaY + lineH * 4);

    // Right column
    doc.font("Helvetica-Bold");
    doc.text("Shipping:",      col2x, metaY);
    doc.text("Estimated:",     col2x, metaY + lineH);
    doc.text("Shipping Cost:", col2x, metaY + lineH * 2);
    doc.text("Phone:",         col2x, metaY + lineH * 3);

    doc.font("Helvetica");
    doc.text("Standard Delivery",    col2x + 80, metaY);
    doc.text("3-5 Days",             col2x + 80, metaY + lineH);
    doc.text("Free",                 col2x + 80, metaY + lineH * 2);
    doc.text("+91 8152861670",       col2x + 80, metaY + lineH * 3);

    // divider
    const afterMetaY = metaY + lineH * 6 + 8;
    doc.moveTo(40, afterMetaY).lineTo(555, afterMetaY).lineWidth(0.5).stroke();

    //  ADDRESS
    const billY = afterMetaY + 10;
    doc.fontSize(9).font("Helvetica-Bold").text("Billed To:", 40, billY);
    doc.font("Helvetica")
      .text(user.name || "Customer",                                   40, billY + 13)
      .text(order.address?.address || "",                              40, billY + 26, { width: 300 })
      .text(`Phone: ${order.address?.phone || ""}`,                   40, billY + 50);

    // divider
    const tableStartY = billY + 68;
    doc.moveTo(40, tableStartY).lineTo(555, tableStartY).lineWidth(0.5).stroke();

    // TABLE HEADER 
    const cols = {
      item:  { x: 40,  w: 170 },
      qty:   { x: 215, w: 35  },
      price: { x: 255, w: 55  },
      base:  { x: 315, w: 55  },
      cgst:  { x: 375, w: 45  },
      sgst:  { x: 425, w: 45  },
      total: { x: 475, w: 55  },
    };

    const thY = tableStartY + 8;
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("Item",  cols.item.x,  thY, { width: cols.item.w });
    doc.text("Qty",   cols.qty.x,   thY, { width: cols.qty.w,   align: "center" });
    doc.text("Price", cols.price.x, thY, { width: cols.price.w, align: "right"  });
    doc.text("Base",  cols.base.x,  thY, { width: cols.base.w,  align: "right"  });
    doc.text("CGST",  cols.cgst.x,  thY, { width: cols.cgst.w,  align: "right"  });
    doc.text("SGST",  cols.sgst.x,  thY, { width: cols.sgst.w,  align: "right"  });
    doc.text("Total", cols.total.x, thY, { width: cols.total.w, align: "right"  });

    doc.moveTo(40, thY + 16).lineTo(555, thY + 16).lineWidth(0.5).stroke();

    // TABLE ROWS
    let rowY    = thY + 24;
    let subtotal = 0;

    doc.font("Helvetica").fontSize(9);

    order.items.forEach((item) => {
    const qty = item.quantity || 1;
    const price = item.price || 0;

    const base = price * qty;

    const gstRate = item.gstRate || 0; 

    const gst = (base * gstRate) / 100;
    const cgst = gst / 2;
    const sgst = gst / 2;

    const total = base + gst;

    subtotal += total;

      doc.text(item.name,            cols.item.x,  rowY, { width: cols.item.w });
      doc.text(String(qty),          cols.qty.x,   rowY, { width: cols.qty.w,   align: "center" });
      doc.text(price.toFixed(2),     cols.price.x, rowY, { width: cols.price.w, align: "right"  });
      doc.text(base.toFixed(2),      cols.base.x,  rowY, { width: cols.base.w,  align: "right"  });
      doc.text(cgst.toFixed(2),      cols.cgst.x,  rowY, { width: cols.cgst.w,  align: "right"  });
      doc.text(sgst.toFixed(2),      cols.sgst.x,  rowY, { width: cols.sgst.w,  align: "right"  });
      doc.text(total.toFixed(2),     cols.total.x, rowY, { width: cols.total.w, align: "right"  });

      rowY += 20;
    });

    doc.moveTo(40, rowY).lineTo(555, rowY).lineWidth(0.5).stroke();

    // TOTALS 
   

  let taxable = 0;
  let totalGST = 0;

  order.items.forEach(item => {
    const base = item.price * item.quantity;
    const gst = (base * (item.gstRate || 0)) / 100;

    taxable += base;
    totalGST += gst;
  });

    const totLabelX = 360, totValX = 460, totValW = 80;

    rowY += 14;
    doc.fontSize(9).font("Helvetica");
    doc.text("Taxable Subtotal:",    totLabelX, rowY);
    doc.text(`Rs.${taxable.toFixed(2)}`,  totValX, rowY, { width: totValW, align: "right" });

    rowY += 14;
    doc.text("Total Tax (GST):", totLabelX, rowY);
    doc.text(`Rs.${totalGST.toFixed(2)}`, totValX, rowY, { width: totValW, align: "right" });

    rowY += 14;
    doc.text("Shipping:",            totLabelX, rowY);
    doc.text("FREE",                 totValX,   rowY, { width: totValW, align: "right" });

    rowY += 18;
    doc.moveTo(355, rowY).lineTo(555, rowY).lineWidth(0.5).stroke();
    rowY += 10;

    doc.fontSize(11).font("Helvetica-Bold");
    doc.text("Grand Total:",              totLabelX, rowY);
    doc.text(`Rs.${subtotal.toFixed(2)}`, totValX,   rowY, { width: totValW, align: "right" });

    // FOOTER 
    doc.moveTo(40, rowY + 40).lineTo(555, rowY + 40).lineWidth(0.5).stroke();

    doc.fontSize(9).font("Helvetica")
      .text("Thank you for shopping with Skincare!", 40, rowY + 50, { align: "center", width: pageW });
     
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
  const { productId, name, price, image, quantity, userId, gstRate } = req.body;

  try {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, name, price, image, quantity, gstRate }],
      });
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, name, price, image, quantity, gstRate });
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


    for (const item of cart.items) {
          const product = await Product.findById(item.productId);

          if (!product || product.quantity === 0) {
            return res.status(400).json({
              message: `${product?.name || "Product"} is out of stock`
            });
          }

          if (product.quantity < item.quantity) {
            return res.status(400).json({
              message: `Only ${product.quantity} items available for ${product.name}`
            });
          }
        }


    let subtotal = 0;
    let totalGST = 0;

    cart.items.forEach(item => {
      const itemTotal = item.price * item.quantity;
      const gst = (itemTotal * (item.gstRate || 0)) / 100;

      subtotal += itemTotal;
      totalGST += gst;
    });

    const grandTotal = subtotal + totalGST;
    let paymentStatus = paymentMethod === "Online Payment" ? "Paid" : "Pending";


    const newOrder = new Order({
      userId,
      items: cart.items,
      address,
      paymentMethod,
      paymentStatus,
      totalAmount: grandTotal,
      totalGST,
      status: "Pending"
    });

    await newOrder.save();

    for (const item of cart.items) {
      const product = await Product.findById(item.productId);

      if (!product) continue;

     
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }


      product.quantity -= item.quantity;
      await product.save();
    }

    cart.items = [];
    await cart.save();

  
    console.log("Order saved:", newOrder._id);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

   
    let invoiceBuffer = null;
    try {
      invoiceBuffer = await generateGSTInvoice(newOrder, user);
    } catch (error) {
      console.log("Invoice generation failed:", error.message);
    }

    const invoiceNo = `INV-${newOrder._id.toString().slice(-8).toUpperCase()}`;

  
    try {
      await transporter.sendMail({
        from: '"Skincare" <saichandana026@gmail.com>',
        to: user.email,
        subject: `Order Confirmation - ${invoiceNo}`,
        html: `
          <h2>Order Placed Successfully</h2>
          <p>Hello ${user.name},</p>
          <p>Your order has been placed.</p>
          <p><b>Invoice:</b> ${invoiceNo}</p>
          <p><b>Total:</b> Rs. ${grandTotal.toFixed(2)}</p>
          <p><b>Payment:</b> ${paymentMethod}</p>
        `,
        attachments: invoiceBuffer
          ? [{ filename: `${invoiceNo}.pdf`, content: invoiceBuffer }]
          : []
      });
      console.log("Email sent to:", user.email);
    } catch (mailErr) {
      console.error("Email sending failed:", mailErr.message);
      
    }

    
    res.json({ success: true, message: "Order placed successfully" });

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