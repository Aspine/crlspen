import React from "react";
import NavBar from "@/components/navBar";
import calculateGpa from "@/utils/getGpa";
import { Class } from "@/types";
import getCredits from "@/utils/getCredits";
import { cookies } from "next/headers";

export default function Home() {
  const classData: Class[] = JSON.parse(
    cookies().get("classDataQ3")?.value || "[]"
  )

  console.log(JSON.stringify(classData))

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

  if (!classData) return <div>Loading...</div>;

  return (
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
        <h1>Q3</h1>
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
