import { useEffect, useState } from "react";
import { cookies } from "next/headers";
import NavBar from "@/components/navBar";
import calculateGpa from "@/utils/getGpa";
import { ClassWithAssignments } from "@/types";
import cheerio from "cheerio";
import { Class } from "@/types";
import getClassData from "@/utils/getClassData";

export default function Home() {
  const [classData, setClassData] = useState<Class[]>([]);
  const [fWeightedGpa, setFWeightedGpa] = useState(0);
  const [fUnweightedGpa, setFUnweightedGpa] = useState(0);
  const [hUnweightedGpa, setHUnweightedGpa] = useState(0);

  useEffect(() => {
    const sessionId = cookies().get("JSESSIONID")?.value;

    if (sessionId) {
      getClassData(sessionId, "").then((data) => {
        setClassData(data);
        setFWeightedGpa(calculateGpa(data, "fWeighted"));
        setFUnweightedGpa(calculateGpa(data, "fUnweighted"));
        setHUnweightedGpa(calculateGpa(data, "hUnweighted"));
      });
    }
  });

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
