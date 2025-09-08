// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppPlayer from "./components/AppPlayer";
import PlayerDetail from "./components/PlayerDetail";

function App() {
  return (
    <Router>
      <div style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<AppPlayer />} />
          <Route path="/players/:id" element={<PlayerDetail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
