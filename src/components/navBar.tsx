import React from "react";
import daysLeft from "@/utils/daysLeft";

export default function NavBar() {
  const days = daysLeft();

  return (
    <div className="navbar">
      <a href="/gradebook" className="title-link"><h1>CRLSpen</h1></a>
      {/* <div className="daysLeft">
        <p>{days} days left</p>
      </div> */}
      <div className="navlinks">
        <a href="/gradebook">Grades</a>
        <a href="/events">Events</a>
        <a href="/reports">Reports</a>
        <a href="/logout">Logout</a>
      </div>
    </div>
  );
}