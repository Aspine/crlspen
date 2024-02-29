import puppeteer from "puppeteer";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import delay from "@/utils/delay";
import { ClassData, ClassDataWithAssignments, Assignment } from "@/types";

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

    // parse username and password from request body
    console.log(reqBody);

    const { username, password } = reqBody;

    const usernameString = String(username);
    const passwordString = String(password);

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // log in to aspen
        await page.goto("https://aspen.cpsd.us/aspen/logon.do", {
            waitUntil: "networkidle2",
        });

        await page.type("#username", usernameString);
        await page.type("#password", passwordString);
        await page.click("#logonButton");

        await delay(250);

        await page.goto(
            "https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list"
        );

        // scrape class data
        const classes = await page.evaluate(() => {
            const classRows = document.querySelectorAll(
                "table > tbody > tr.listCell"
            );

            return Array.from(classRows).map((row) => {
                const className = row
                    .querySelector("td:nth-child(6)")
                    ?.textContent?.replace(/\n/g, "");
                const teacherName = row
                    .querySelector("td:nth-child(4)")
                    ?.textContent?.replace(/\n/g, "");
                const room = row
                    .querySelector("td:nth-child(5)")
                    ?.textContent?.replace(/\n/g, "");
                const gradeString = row
                    .querySelector("td:nth-child(8)")
                    ?.textContent?.replace(/\n/g, "");

                var grade: number | null;

                const gradeRegex = /([0-9]*\.?[0-9]*)/g;
                const matches = gradeString?.match(gradeRegex);
                if (matches && !isNaN(parseFloat(matches[0]))) {
                    grade = parseFloat(matches[0]);
                } else {
                    grade = null;
                }

                return {
                    className,
                    teacherName,
                    room,
                    grade,
                    assignments: [],
                };
            });
        });

        await page.goto(
            "https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd"
        );

        var fullClassData: ClassDataWithAssignments[] = [];

        for (let i = 0; i < classes.length; i++) {
            console.log("Scraping assignments for", classes[i].className);

            const tableRows = await page.evaluate(() => {
                if (document.querySelector("table > tbody > tr.listCell > td > div.listNoRecordsText")) {
                    console.log("No records found");
                    return [];
                }

                const rows = document.querySelectorAll(
                    "table > tbody > tr.listCell"
                )

                return Array.from(rows).map((row) => {
                    const name = row
                        .querySelector("td:nth-child(3)")
                        ?.textContent?.replace(/\n/g, "");
                    const dueDate = row
                        .querySelector("td:nth-child(5)")
                        ?.textContent?.replace(/\n/g, "");
                    const gradeCategory = row
                        .querySelector("td:nth-child(2)")
                        ?.textContent?.replace(/\n/g, "");
                    const gradeString = row
                        .querySelector("td:nth-child(6) > table > tbody > tr > td > div > span")
                        ?.textContent?.replace(/\n/g, "");

                    var grade: number | null;

                    const gradeRegex = /([0-9]*\.?[0-9]*)/g;
                    const matches = gradeString?.match(gradeRegex);
                    if (matches && !isNaN(parseFloat(matches[0]))) {
                        grade = parseFloat(matches[0]);
                    } else {
                        grade = null;
                    }

                    return {
                        name,
                        dueDate,
                        gradeCategory,
                        grade,
                    };
                });
            });

            // classes[i].assignments = tableRows;
            console.log(tableRows);

            await page.click("button#nextButton");
            await delay(1000);
        }

        

        // scrape schedule data

        const currentDate = new Date();
        const formattedDate =
            currentDate.getMonth() +
            1 +
            "/" +
            currentDate.getDate() +
            "/" +
            currentDate.getFullYear();

        await page.goto(
            "https://aspen.cpsd.us/aspen/studentScheduleContextList.do?navkey=myInfo.sch.list"
        );

        await delay(250);

        const source = await page.content();

        const currentSchedule = await page.evaluate(() => {
            const scheduleRows = Array.from(
                document.querySelectorAll(
                    "table > tbody > tr > td > table > tbody > tr:not(.listHeader)"
                )
            );
            const scheduleDetails = scheduleRows.map((row) => {
                const period = row.querySelector("td:first-child th")?.textContent?.match(/\d+/)?.[0];
                const scheduleDetailCell = row.querySelector(
                    "td:nth-child(2) td"
                );
                /*
                    return {
                        className,
                        teacherName,
                        room,
                        period,
                    };
                */
            });
            return scheduleDetails.filter((detail) => detail);
        });

        /* 
                    My way of doing it jsut for reference, I don't think it succesfully scraped off page.
          await page.goto(
        `https://aspen.cpsd.us/aspen/studentScheduleMatrix.do?navkey=myInfo.sch.matrix&termOid=&schoolOid=&k8Mode=&viewDate=${dateString}&userEvent=0`,
        { waitUntil: "networkidle2" }
    );

    // scrape schedule data
    const schedule = await page.evaluate(() => {
      const scheduleRows = document.querySelectorAll("tr");
      return Array.from(scheduleRows).map((row) => {
        const detailsElement = row.querySelector("td[style='width: 125px']");
        const details = detailsElement ? detailsElement.innerHTML.split('<br>') : null;
        const time = row.querySelector("td[align='center']")?.textContent?.trim();

        if (details) {
          return {
            classCode: details[0],
            className: details[1],
            teacherName: details[2],
            room: details[3],
            time,
          };
        }
      }).filter(Boolean); // filter out undefined items
    });

    await browser.close();

    console.log(classes);
    console.log(schedule);

    // send class and schedule data to client
    */
    
        cookies().set("classData", JSON.stringify(classes));
    // cookies().set("scheduleData", JSON.stringify(schedule));
    

        await browser.close();

        console.log(classes);

        console.log(currentSchedule);

        // send class data to client
        if (classes.length <= 0) {
            // login failed
            console.log("IT DONDA WORKA?!");
            return NextResponse.redirect("/", 302); // redirect back to login page,
        } else {
            console.log("IT WORKA?!");
            cookies().set("classData", JSON.stringify(classes));
            return NextResponse.json({ text: classes }, { status: 200 });
        }
    } catch (error) {
        console.error("Error during scraping:", error);
        if (res.status) {
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        } else {
            console.error("res object does not have a status function");
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
