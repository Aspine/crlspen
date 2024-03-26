"use client";

import React, { useState } from "react";
import Image from "next/image";
import falconImage from "@/../public/falcon.png";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTos, setAgreeTos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Setting Up...");

  const handleCheckboxChange = () => {
    setAgreeTos(!agreeTos);
  };

  const handleLogin = async (event: any) => {
    event.preventDefault(); // prevent the form from refreshing the page
    setLoading(true);
    setLoadingText("Logging In...");

    // different fetch url for dev and prod
    // const response = await fetch("/api/get_data", { // prod
    const response = await fetch("/api/login/", {
      // dev
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {

      setLoadingText("Fetching Grades...");

      const gradesResponse = await fetch("/api/get_grade_data/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quarter: "Q3" }),
      });

      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();
        console.log(gradesData);

        // redirect to the gradebook page
        window.location.href = "/gradebook";
      }
    }
  };

  return (
    <main className="loginPage">
      {loading ? (
        <div className="loading-screen">
          <h1>{loadingText}</h1>
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
