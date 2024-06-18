// src/components/WelcomeComponent.js
import React from "react";
import { Link } from "react-router-dom";

function WelcomeComponent() {
  return (
    <div className="relative w-full h-screen">
      <img
        src="/images/首页.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover -z-10"
        style={{ minWidth: "100vh", height: "100%" }}
      />
      <div className="relative flex flex-col justify-center items-center text-center text-white h-full">
        <img
          src="/images/logo.webp"
          alt="Logo"
          className="-mt-24 mb-5 w-64 h-64 rounded-xl border-white border-2 shadow-lg shadow-white/50"
        />
        <h1 className="mb-5 text-4xl font-bold">🐮🐎🦊8️⃣</h1>
        <p className="mb-3 text-xl">
          欢迎来到 NormHub，一个 1.21 原版生存服务器。
        </p>
        <p>
          <Link to="/map" className="text-blue-500 font-bold">
            导航地图（仅 PC）
          </Link>{" "}
          |{" "}
          <Link
            to="https://map.variantconst.com"
            className="text-blue-500 font-bold"
          >
            在线地图
          </Link>
        </p>
      </div>
    </div>
  );
}

export default WelcomeComponent;
