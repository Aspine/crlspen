"use client";

import React, { useState } from "react";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTos, setAgreeTos] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckboxChange = () => {
    setAgreeTos(!agreeTos);
  };

  const handleLogin = async () => {
    setLoading(true);

    // different fetch url for dev and prod
    // const response = await fetch("/api/get_data", { // prod
    const response = await fetch("/api/get_data_dev/", { // dev
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
        <div className="loading-screen">Loading...</div>
      ) : (
        <div className="login-box" onSubmit={handleLogin}>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
          <br />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
          <div className="loginSplash">
            Welcome to the beta of CRLSpen!
            <br />
            This is actively being worked on,
            <br />
            check out the <a href="https://github.com/Aspine/CRLSpen">repository on our github</a>!
            <br />
            <br />
          </div>
          {/* <div className="inline-display-div">
          <p>I agree to the TOS:</p>
          <input
            type="checkbox"
            name="tosAgree"
            checked={agreeTos}
            onChange={handleCheckboxChange}
            required
          />
          </div> */}
          <button className="loginSubmissionButton" type="submit" onClick={handleLogin}>
            Login
          </button>
        </div>
      )}
    </main>
  );
}
