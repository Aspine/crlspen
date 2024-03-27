import React from "react";
import { cookies } from "next/headers";
import NavBar from "@/components/navBar";
import { Period } from "@/types";

export default function Schedule() {
  const scheduleCookie = cookies().get("scheduleData");
  const scheduleData: Period[] = scheduleCookie ? JSON.parse(scheduleCookie.value) : [];

  console.log(scheduleData);

  return (
    <main>
      <NavBar />
      <table className="schedule-table">
        <tbody>
          <tr>
            <th>TIME</th>
            <th>SUBJECT</th>
            <th>TEACHER</th>
            <th>ROOM</th>
          </tr>
          {scheduleData.map((data, index) => (
            <tr key={index}>
              <td>{data.startTime} - {data.endTime}</td>
              <td>{data.name}</td>
              <td>{data.teacher}</td>
              <td>{data.room}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
