// src/App.js
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import WelcomeComponent from "./components/WelcomeComponent";
import MapComponent from "./components/MapComponent";
import Header from "./components/Header";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div>
          <Routes>
            <Route path="/" element={<WelcomeComponent />} />
            <Route path="/map" element={<MapComponent />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
