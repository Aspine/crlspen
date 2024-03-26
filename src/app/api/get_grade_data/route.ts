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
    const apacheToken = cookies().get("apacheToken")?.value;

    console.log(quarter, sessionId, apacheToken);

    const termOid = quarter_table[quarter];

    const startTimeClasses = new Date();

    const classesLast = await fetch(
      "https://aspen.cpsd.us/aspen/portalClassList.do",
      {
        method: "POST",
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "en-US,en;q=0.9",
          "Content-Type": "application/x-www-form-urlencoded",
          Cookie: `JSESSIONID=${sessionId}; deploymentId=ma-cambridge`,
        },
        body: `org.apache.struts.taglib.html.TOKEN=${apacheToken}&userEvent=950&userParam=&operationId=&deploymentId=ma-cambridge&scrollX=0&scrollY=0&formFocusField=termFilter&formContents=&formContentsDirty=&maximized=false&menuBarFindInputBox=&selectedStudentOid=STD0000006wB3O&jumpToSearch=&initialSearch=&yearFilter=current&termFilter=${termOid}&allowMultipleSelection=true&scrollDirection=&fieldSetName=Default+Fields&fieldSetOid=fsnX2Cls++++++&filterDefinitionId=%23%23%23all&basedOnFilterDefinitionId=&filterDefinitionName=filter.allRecords&sortDefinitionId=default&sortDefinitionName=Schedule+term&editColumn=&editEnabled=false&runningSelection=`,
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        console.log(data);

        const $ = cheerio.load(data);

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
      .catch((error) => {
        console.error("There was an error!", error);
      });

    console.log(classesLast);

    // console.log(classesCurrent);

    cookies().set("classData", JSON.stringify(classesLast));

    const endTimeClasses = new Date();
    const elapsedTimeClasses =
      endTimeClasses.getTime() - startTimeClasses.getTime();
    console.log("scraped class data in", elapsedTimeClasses, "ms");

    return NextResponse.json({ text: classesLast }, { status: 200 });
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
