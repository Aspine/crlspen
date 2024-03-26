import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { Assignment, Class } from "@/types";
import cheerio from "cheerio";

function getGradeFromString(grade: string): number | null {
  const gradeRegex = /([0-9]*\.?[0-9]*)/g;
  const matches = grade.match(gradeRegex);
  if (matches && !isNaN(parseFloat(matches[0]))) {
    return parseFloat(matches[0]);
  } else {
    return null;
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const reqBody = await req.json();
  const { quarter } = reqBody;

  const quarter_table: { [key: string]: string } = {
    Q1: "GTM0000000C1s8",
    Q2: "GTM0000000C1s9",
    Q3: "GTM0000000C1sA",
    Q4: "GTM0000000C1sB",
  };

  try {
    const sessionId = cookies().get("sessionId")?.value;
    var apacheToken = cookies().get("apacheToken")?.value;

    // console.log(quarter, sessionId, apacheToken);

    const termOid = quarter_table[quarter];

    console.log(termOid);

    const startTimeClasses = new Date();

    const classesList = await fetch(
      `https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list`,
      {
        headers: {
          Cookie: `JSESSIONID=${sessionId}`,
        },
      },
    ).then((res) => res.text()).then((html) => {
      console.log(html)

      const $ = cheerio.load(html);

      const apacheInput = $("input");
      apacheToken = apacheInput.attr("value");

      // console.log(apacheToken);

      const classes: any[] = [];

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
          teacher,
          grade,
          room,
        });
      });

      return classes;
    })

    cookies().set("apacheToken", apacheToken ? apacheToken : "");

    const endTimeClasses = new Date();
    const elapsedTimeClasses =
    endTimeClasses.getTime() - startTimeClasses.getTime();
    console.log("scraped class data in", elapsedTimeClasses, "ms");

    cookies().set("classDataQ3", JSON.stringify(classesList));

    return NextResponse.json({ text: classesList }, { status: 200 });
  } catch (error) {
    console.error("Error during scraping:", error);
    if (res.status) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    } else {
      console.error("res object does not have a status function");
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
