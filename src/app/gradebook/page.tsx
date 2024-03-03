import React from "react";
import { cookies } from "next/headers";
import NavBar from "@/components/navBar";
import calculateGpa from "@/utils/getGpa";
import { ClassData, ClassDataWithAssignments } from "@/types";

export default function Home() {
  const classData: ClassDataWithAssignments[] = JSON.parse(cookies().get("classData")?.value || "[]");
  console.log(classData);

  const gpaInput = classData.map((data) => {
    return {
      grade: data.grade,
      credits: 10,
      ap: data.name.startsWith("AP")
    };
  });

  console.log(gpaInput);

  const hUnweightedGpa = calculateGpa(gpaInput, "hUnweighted");
  const fUnweightedGpa = calculateGpa(gpaInput, "fUnweighted");
  const fWeightedGpa = calculateGpa(gpaInput, "fWeighted");

  console.log(classData);

  return (
    <main>
      <NavBar />
      <div className="page-main">
        <div className="gpa-container">
          <div className="gpa-box hUnweightedGpa">
            <p>100 Scale: {hUnweightedGpa.toFixed(2)}</p>
          </div>
          <div className="gpa-box fWeightedGpa">
            <p>Weighted: {fWeightedGpa.toFixed(2)}</p>
          </div>
          <div className="gpa-box fUnweightedGpa">
            <p>Unweighted: {fUnweightedGpa.toFixed(2)}</p>
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
                <td className={data.grade === 100 ? "hGrade" : ""}>{data.grade !== null ? data.grade.toFixed(2) : "-"}</td>
                <td>{data.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
