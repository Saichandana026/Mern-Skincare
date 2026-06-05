// components/Layout.jsx

import React from "react";
import Navigator from "./Navigator";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <>
      <Navigator />
      {children}
      <Footer />
    </>
  );
};

export default Layout;