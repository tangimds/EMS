import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import List from "./list";
import View from "./view";
import Edit from "./edit";

const Experiments = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="list" replace />} />
      <Route path="/list" element={<List />} />
      <Route path="/:id" element={<View />} />
      <Route path="/:id/edit" element={<Edit />} />
    </Routes>
  );
};

export default Experiments;
