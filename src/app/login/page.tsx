"use client";

import React, { useState, createRef, useEffect } from "react";
import Image from "next/image";
import falconImage from "@/../public/falcon.png";
import LoadingScreen from "@/components/loadingScreen";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTos, setAgreeTos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Setting Up...");
  const pwdRef = React.createRef<HTMLInputElement>();
  const [sessionId, setSessionId] = useState("");
  const [apacheToken, setApacheToken] = useState("");
  const [invalidLogin, setInvalidLogin] = useState(false);

  const handleCheckboxChange = () => {
    setAgreeTos(!agreeTos);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      pwdRef.current?.focus();
    }
  };

  useEffect(() => {
    // get the session id and apache token
    const fetchSessionData = async () => {
      const response = await fetch("/api/login/get_id/", {
        // no request body needed, only using post to avoid caching
        method: "POST"
      });
      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setApacheToken(data.apacheToken);
      }
    };
    
    fetchSessionData();
  }, []);

  console.log(sessionId, apacheToken);

  function handleSubmit() {
    if (!password || !username) {
      setInvalidLogin(true);
    } else {
      handleLogin(event);
    }
  }

  const handleLogin = async (event: any) => {
    event.preventDefault(); // prevent the form from refreshing the page
    setLoading(true);
    setLoadingText("Logging In...");

    // different fetch url for dev and prod
    // const response = await fetch("/api/get_data", { // prod
    const response = await fetch("/api/login/post_credentials/", {
      // dev
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, sessionId, apacheToken }),
    });

    if (response.ok) {

      setLoadingText("Fetching Grades...");

      const gradesResponse = await fetch("/api/get_grade_data_current/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      if (gradesResponse.ok) {
        const gradesData = await gradesResponse.json();

        // redirect to the gradebook page
        window.location.href = "/gradebook";
      }
    } else if (response.status === 400) {
      await setLoading(false);
      await setInvalidLogin(true);
    }
    else {
      alert("An error occurred");
    }
  };

  return (
    <main className="loginPage">
      {loading ? (
        <LoadingScreen loadText={loadingText} />
      ) : (
        <div className="login-box" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            onKeyDown={handleKeyPress}
          />
          <br />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            ref={pwdRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                  handleSubmit();
              }
            }}
          />
          {invalidLogin ? (
            <div className="loginErrorTxt">
              Your username or password was invalid!
            </div>
          ) : (<div></div>)}
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
              onClick={handleSubmit}
            >
              Login
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
