"use client";

import React, { useState, useEffect } from "react";

export default function Home() {
  function GetGrades(quarter: string): string {
    const [state, setState] = useState("etst");

    useEffect(() => {
      async function fetchData() {
        const response = await fetch("/api/get_grade_data/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quarter: "Q1" }),
        });
        const data = await response.json();
        console.log(data);
        setState(JSON.stringify(data.text, null, 2));
      }

      fetchData();
    }, []);

    return state;
  }

  const state = GetGrades("Q1");

  return (
    <div>
      <h1>Gradebook</h1>
      <p>Welcome to the Gradebook app!</p>
      <p>State: {state}</p>
    </div>
  );
}
