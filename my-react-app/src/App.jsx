import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import Profile from "./components/Profile";
import ProtectedRoute from "./components/ProtectedRoute";

import Register from "./pages/Register";
import Home from "./pages/Home";
import Footer from "./components/Footer";

import Navigator from "./components/Navigator.jsx";
import Search from "./components/Search"; 
import Carousel from "./components/Carousel";
import slides from "./data/CarouselData.json"; 
import About from "./pages/About";


import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AddProduct from "./pages/AddProduct.jsx";
import ManageProduct from "./pages/ManageProduct.jsx";
import UpdateProduct from "./pages/UpdateProduct.jsx";

import Cart from "./pages/Cart";
import ProductPage from "./pages/ProductPage";

import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";


function App() {
  return (

    <BrowserRouter>
      <div className="App">

        <Routes>

          <Route path="/" element={
            <>
              <Navigator />
              <Carousel data={slides} />

              <Home />
              <Footer />
            </>
          } />

          <Route path="/search" element={<Search />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />


        <Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/manage-products" element={<ManageProduct />} />
          <Route path="/update-product/:id" element={<UpdateProduct/>}/>
          <Route path="/product/:id" element={<ProductPage />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
           <Route path="/admin-orders" element={<AdminOrders />} />


        </Routes>
        
        
      </div>
    </BrowserRouter>

  );
}

export default App;