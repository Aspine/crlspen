import getGradeFromString from "./getGradeFromString";
import { Class } from "@/types";
import cheerio from "cheerio";

export default async function getClassData(
  sessionId: string,
  apacheToken: string | undefined,
): Promise<Class[]> {
  const requestHeaders: HeadersInit = new Headers();
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("Cookie", `JSESSIONID=${sessionId};`);

  return await fetch(
    "https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list",
    {
      method: "GET",
      headers: requestHeaders,
    },
  )
    .then((response) => {
      console.log("test");
      console.log(response);
      return response.text();
    })
    .then(function (html) {
      console.log(html);

      const $ = cheerio.load(html);

      const apacheInput = $("input");
      apacheToken = apacheInput.attr("value");
      console.log(apacheToken);

      const classes: Class[] = [];

      const tableRows = $("table > tbody > tr.listCell");

      tableRows.each((index, row) => {
        const name = $(row).find("td:nth-child(6)").text().replace(/\n/g, "");
        const teacherRaw = $(row)
          .find("td:nth-child(4)")
          .text()
          .replace(/\n/g, "");
        const gradeRaw = $(row)
          .find("td:nth-child(8)")
          .text()
          .replace(/\n/g, "");
        const room = $(row).find("td:nth-child(5)").text().replace(/\n/g, "");

        const teacher = teacherRaw
          ?.split(";")
          .map((name) => {
            const [lastName, firstName] = name
              .trim()
              .split(",")
              .map((name) => name.trim());
            return firstName && lastName
              ? `${firstName} ${lastName}`
              : name.trim();
          })
          .join(", ");

        const grade = getGradeFromString(gradeRaw);

        classes.push({
          name,
          credits: 10,
          teacher,
          grade,
          room,
          ap: false,
        });
      });

      return classes;
    });
}
