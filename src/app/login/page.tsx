"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import falconImage from "@/../public/falcon.png";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTos, setAgreeTos] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRef = useRef();

  const handleCheckboxChange = () => {
    setAgreeTos(!agreeTos);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      passwordRef.current.focus();
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault(); // prevent the form from refreshing the page
    setLoading(true);

    // different fetch url for dev and prod
    // const response = await fetch("/api/get_data", { // prod
    const response = await fetch("/api/new/", {
      // dev
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const data = await response.json();
      window.location.href = "/gradebook";
    } else {
      console.log("Login failed");
    }

    setLoading(false);
  };

  return (
    <main className="loginPage">
      {loading ? (
        <div className="loading-screen">
          <Image
            src={falconImage}
            alt="loading"
            width={100}
            height={100}
            className="loading-image"
          />
        </div>
      ) : (
        <form className="login-box" onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            onKeyPress={handleKeyPress}
          />
          <br />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            ref={passwordRef}
          />
          <div className="loginSplash">
            Welcome to the beta of CRLSpen!
            <br />
            This is actively being worked on,
            <br />
            check out the{" "}
            <a href="https://github.com/Aspine/CRLSpen">
              repository on our github
            </a>
            !
            <br />
            <br />
            <button
              className="loginSubmissionButton"
              type="submit"
            >
              Login
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
