import { cookies } from "next/headers";
import cheerio from "cheerio";
import { Period } from "@/types";

export async function getScheduleData() {
  try {
    const sessionId = cookies().get("sessionId")?.value;

    const startTime = new Date();

    var apacheToken;

    var schedule;

    await fetch(
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

      const scheduleData: Period[] = [];

      const tableRows = $("#contentArea > table:nth-child(2) > tbody > tr:nth-child(1) > td.contentContainer > table:nth-child(2) > tbody > tr:nth-child(6) > td > div > table > tbody > tr > td > table > tbody > tr");

      tableRows.each((index, row) => {
        const classInfo = $(row).find("td:nth-child(2) > table > tbody > tr > td").html()?.split("<br>").map((str) => str.trim());

        const timeInfo = $(row).find("td:nth-child(1) > table > tbody > tr:nth-child(2) > td").text().split(" - ").map((str) => str.trim());

        if (classInfo) {
          const period: Period = {
            startTime: timeInfo[0],
            endTime: timeInfo[1],
            name: classInfo[1],
            teacher: classInfo[2],
            room: classInfo[3],
          };

          scheduleData.push(period);
        }
      });

      schedule = scheduleData;
    })

    console.log(JSON.stringify(schedule, null, 2));

    // cookies().set("apacheToken", apacheToken ? apacheToken : "");
    // cookies().set("scheduleData", JSON.stringify(schedule));

    const endTime = new Date();
    const elapsedTime = endTime.getTime() - startTime.getTime();
    console.log("scraped schedele in", elapsedTime, "ms");

  } catch (error) {
    console.error("Error during scraping:", error);
  }
}
