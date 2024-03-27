import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";
import getRealGrade from "@/utils/getRealGrade";
import { Period } from "@/types";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const sessionId = cookies().get("sessionId")?.value;

    const startTime = new Date();

    var apacheToken;

    const schedule = await fetch(
      `https://aspen.cpsd.us/aspen/studentScheduleContextList.do?navkey=myInfo.sch.list`,
      {
        headers: {
          Cookie: `JSESSIONID=${sessionId}`,
        },
      },
    ).then((res) => res.text()).then((html) => {
      const $ = cheerio.load(html);

      const apacheInput = $("input");
      apacheToken = apacheInput.attr("value");

      // console.log(apacheToken);

      const schedule: Period[] = [];

      const tableRows = $("#contentArea > table:nth-child(2) > tbody > tr:nth-child(1) > td.contentContainer > table:nth-child(2) > tbody > tr:nth-child(6) > td > div > table > tbody > tr > td > table > tbody > tr");

      tableRows.each((index, row) => {
        const classInfo = $(row).find("td:nth-child(2) > table > tbody > tr > td").html()?.split("<br>").map((str) => str.trim());

        const timeInfo = $(row).find("td:nth-child(1) > table > tbody > tr:nth-child(2) > td").text().split(" - ").map((str) => str.trim());
        console.log(timeInfo);

        if (classInfo) {
          const period: Period = {
            startTime: timeInfo[0],
            endTime: timeInfo[1],
            name: classInfo[1],
            teacher: classInfo[2],
            room: classInfo[3],
          };

          schedule.push(period);
        }
      });

      return schedule;
    })

    console.log(JSON.stringify(schedule, null, 2));

    cookies().set("apacheToken", apacheToken ? apacheToken : "");
    cookies().set("scheduleData", JSON.stringify(schedule));

    const endTime = new Date();
    const elapsedTime = endTime.getTime() - startTime.getTime();
    console.log("scraped class data in", elapsedTime, "ms");

    cookies().set("classDataQ3", JSON.stringify(schedule));

    return NextResponse.json({ text: "Scraped Schedule" }, { status: 200 });
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
