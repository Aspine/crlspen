'use client'

import React from "react";
import NavBar from "@/components/navBar";

export default function Dashboard() {
  return (
    <main>
      <NavBar />
      <div className="dashboard">
        <div className="gpa-card dashboard-card">
          <div className="gpa-card-main-text">GPA</div>
        </div>
      </div>
    </main>
  );
}