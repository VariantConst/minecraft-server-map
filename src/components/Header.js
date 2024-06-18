// src/components/Header.js
import React from "react";
import { Link } from "react-router-dom";

function Header() {
  return (
    <header className="bg-black bg-opacity-10 backdrop-blur-md text-white p-4 shadow-lg text-xl">
      <nav className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-extrabold tracking-wide">NormHub</div>
        <ul className="flex space-x-6">
          <li>
            <Link
              to="/"
              className="relative transition-all duration-300 ease-in-out transform hover:-translate-y-2"
            >
              首页
              <span className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 ease-in-out hover:scale-x-105"></span>
            </Link>
          </li>
          <li>
            <Link
              to="/map"
              className="relative transition-all duration-300 ease-in-out transform hover:-translate-y-2"
            >
              导航
              <span className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 transition-transform duration-300 ease-in-out hover:scale-x-105"></span>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
