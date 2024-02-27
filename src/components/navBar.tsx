import React from "react";

export default function NavBar() {
  return (
    <div className="navbar">
      <a href="/dashboard" className="title-link"><h1>Aspine2</h1></a>
      <div className="navlinks">
        <a href="/gradebook">Grades</a>
        <a href="/events">Events</a>
        <a href="/reports">Reports</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}