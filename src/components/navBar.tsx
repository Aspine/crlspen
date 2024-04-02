import React from "react";

export default function NavBar() {

  return (
    <div className="navbar">
      <a href="/" className="title-link"><h1>CRLSpen</h1></a>
      <div className="navlinks">
        <a href="/gradebook">Grades</a>
        <a href="/schedule">Schedule</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}