import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerInterface from "./PlayerInterface";
import AdminInterface from "./AdminInterface";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PlayerInterface />} />
        <Route path="/admin" element={<AdminInterface />} />
      </Routes>
    </Router>
  );
}

export default App;


















