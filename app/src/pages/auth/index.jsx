import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Signin from "./signin";
import Signup from "./signup";

const Auth = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="signin" replace />} />
      <Route path="/signin" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default Auth;
