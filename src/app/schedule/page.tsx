import React from "react";
import { cookies } from "next/headers";
import NavBar from "@/components/navBar";
import { Period } from "@/types";

export default function Schedule() {
  const scheduleCookie = cookies().get("scheduleData");
  const scheduleData: Period[] = scheduleCookie ? JSON.parse(scheduleCookie.value) : [];

  return (
    <main>
      <NavBar />
      <div className="page-main">
        <table className="schedule-table">
          <tbody>
            {scheduleData.map((data, index) => (
              <tr key={index} style={{
                backgroundColor: data.color ? data.color : "white",
                color: "black",
              }}>
                <td>{data.startTime} - {data.endTime}</td>
                <td>
                  {data.name}
                  <br />
                  {data.teacher}
                  <br />
                  RM. {data.room}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
