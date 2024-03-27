'use client'

import React, { useState, useEffect } from "react";
import NavBar from "@/components/navBar";
import calculateGpa from "@/utils/getGpa";
import { Class } from "@/types";
import getCredits from "@/utils/getCredits";
import LoadingScreen from "@/components/loadingScreen";

export default function Home() {
  const [classData, setClassData] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setClassData(JSON.parse(
      decodeURIComponent(document.cookie.split(';').find(cookie => cookie.trim().startsWith("classDataQ3="))?.split('=')[1] || "[]")
    ));

    setLoading(false);
  });
  
  const gpaInput = classData.map((data) => {
    return {
      grade: data.grade,
      credits: getCredits(data.name),
      ap: data.name.startsWith("AP"),
    };
  });

  const hUnweightedGpa = calculateGpa(gpaInput, "hUnweighted");
  const fUnweightedGpa = calculateGpa(gpaInput, "fUnweighted");
  const fWeightedGpa = calculateGpa(gpaInput, "fWeighted");

  useEffect(() => {
    async function backgroundScrape() {
      await fetch("/api/get_schedule_data", {
        method: "GET",
      });
    }

    backgroundScrape();
  }, ["/api/get_schedule_data/"])

  return (
    loading ? <LoadingScreen loadText="Parsing Grades..." /> :
    <main>
      <NavBar />
      <div className="page-main">
        <div className="gpa-container">
          <div className="gpa-box hUnweightedGpa">
            <p>Q3 100 Scale: {hUnweightedGpa.toFixed(2)}</p>
          </div>
          <div className="gpa-box fWeightedGpa">
            <p>Q3 Weighted: {fWeightedGpa.toFixed(2)}</p>
          </div>
          <div className="gpa-box fUnweightedGpa">
            <p>Q3 Unweighted: {fUnweightedGpa.toFixed(2)}</p>
          </div>
        </div>
        <table className="grades-table">
          <tbody>
            <tr>
              <th>TEACHERS</th>
              <th>CLASS</th>
              <th>GRADE</th>
              <th>RM.</th>
            </tr>
            {classData.map((data, index) => (
              <tr key={index}>
                <td>{data.teacher}</td>
                <td>{data.name}</td>
                <td className={data.grade !== null ? (data.grade >= 100 ? "hGrade" : "") : ""}>
                  {data.grade !== null ? data.grade.toFixed(2) : "-"}
                </td>
                <td>{data.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
