import React from "react";
import { cookies } from "next/headers";
import NavBar from "@/components/navBar";

export default function Home() {
  const classData = JSON.parse(cookies().get("classData").value);
  console.log(classData);

  for (let item of classData) {
    const gradeRegex = /([0-9]*\.?[0-9]*)/g;
    const matches = item.grade.match(gradeRegex);
    if (matches && !isNaN(parseFloat(matches[0]))) {
      item.realGrade = parseFloat(matches[0]); // Assuming you want to store the first numerical match as realGrade
    } else {
      item.realGrade = null; // Or any default value if no valid grade is found
    }
  }  

  for (let item of classData) {
    const teachers = item.teacherName.split(';').map(teacher => {
      const [lastName, firstName] = teacher.trim().split(',').map(name => name.trim());
      return firstName && lastName ? `${firstName} ${lastName}` : teacher.trim();
    });
    item.teacherName = teachers.join(', ');
  }
  
  console.log(classData);

  return (
    <main>
      <NavBar />
      <table className="grades-table">
        <tbody> {/* Move the <tr> element inside the <tbody> element */}
          <tr>
            <th>TEACHER</th>
            <th>CLASS</th>
            <th>GRADE</th>
            <th>RM.</th>
            {/* Add more table headers for other properties */}
          </tr>
          {classData.map((data, index) => (
            <tr key={index}>
              <td>{data.teacherName}</td>
              <td>{data.className}</td>
              <td>{data.realGrade !== null ? data.realGrade.toFixed(2) : "-"}</td>
              <td>{data.room}</td>
              {/* Add more table cells for other properties */}
            </tr>
          ))}
        </tbody>
      </table>
      
    </main>
  );
}
