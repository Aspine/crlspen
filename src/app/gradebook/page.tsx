import React from "react";
import { cookies } from "next/headers";
import NavBar from "@/components/navBar";
import calculateGpa from "@/utils/getGpa";
import { ClassWithAssignments } from "@/types";
import getCredits from "@/utils/getCredits";

export default function Home() {
  const classData: ClassWithAssignments[] = JSON.parse(
    cookies().get("classData")?.value || "[]",
  );

  const classDataLast: ClassWithAssignments[] = JSON.parse(
    cookies().get("classDataLast")?.value || "[]",
  );

  const gpaInput = classData.map((data) => {
    return {
      grade: data.grade,
      credits: getCredits(data.name),
      ap: data.name.startsWith("AP"),
    };
  });

  console.log(gpaInput);

  const gpaInputLast = classDataLast.map((data) => {
    return {
      grade: data.grade,
      credits: getCredits(data.name),
      ap: data.name.startsWith("AP"),
    };
  });

  console.log(gpaInputLast);

  const hUnweightedGpa = calculateGpa(gpaInput, "hUnweighted");
  const fUnweightedGpa = calculateGpa(gpaInput, "fUnweighted");
  const fWeightedGpa = calculateGpa(gpaInput, "fWeighted");

  const hUnweightedGpaLast = calculateGpa(gpaInputLast, "hUnweighted");
  const fUnweightedGpaLast = calculateGpa(gpaInputLast, "fUnweighted");
  const fWeightedGpaLast = calculateGpa(gpaInputLast, "fWeighted");

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
        <div className="gpa-container">
          <div className="gpa-box hUnweightedGpa">
            <p>Q2 100 Scale: {hUnweightedGpaLast.toFixed(2)}</p>
          </div>
          <div className="gpa-box fWeightedGpa">
            <p>Q2 Weighted: {fWeightedGpaLast.toFixed(2)}</p>
          </div>
          <div className="gpa-box fUnweightedGpa">
            <p>Q2 Unweighted: {fUnweightedGpaLast.toFixed(2)}</p>
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
                <td className={data.grade === 100 ? "hGrade" : ""}>
                  {data.grade !== null ? data.grade.toFixed(2) : "-"}
                </td>
                <td>{data.room}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h1>Q2</h1>
        <table className="grades-table">
          <tbody>
            <tr>
              <th>TEACHERS</th>
              <th>CLASS</th>
              <th>GRADE</th>
              <th>RM.</th>
            </tr>
            {classDataLast.map((data, index) => (
              <tr key={index}>
                <td>{data.teacher}</td>
                <td>{data.name}</td>
                <td className={data.grade === 100 ? "hGrade" : ""}>
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
