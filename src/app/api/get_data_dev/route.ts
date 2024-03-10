import puppeteer from "puppeteer";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import delay from "@/utils/delay";
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
    // parse username and password from request body
    
    const reqBody = await req.json();

    const { username, password } = reqBody;

    const usernameString = String(username);
    const passwordString = String(password);

    try {
        const startTimeLogin = new Date();

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // log in to aspen
        await page.goto("https://aspen.cpsd.us/aspen/logon.do", {
            waitUntil: "domcontentloaded",
        });

        var apacheToken;

        console.log(apacheToken);

        await page.type("#username", usernameString);
        await page.type("#password", passwordString);
        await page.click("#logonButton");

        await delay(250);

        const browserCookies = await page.cookies();

        const jsessionid = browserCookies.find(cookie => cookie.name === "JSESSIONID")?.value;

        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json');
        requestHeaders.set('Cookie', browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '));

        const endTimeLogin = new Date();
        const elapsedTimeLogin = endTimeLogin.getTime() - startTimeLogin.getTime();
        console.log("logged in in", elapsedTimeLogin, "ms");

        page.goto("https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list", {
            waitUntil: "domcontentloaded",
        });

        // get class data

        const startTimeClasses = new Date();

        const classesCurrent: Class[] = await fetch("https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list", {
            method: "GET",
            headers: requestHeaders,
        }).then((res) => res.text()).then(function(html) {

            const $ = cheerio.load(html);

            const apacheInput = $("input")
            apacheToken = apacheInput.attr("value");

            console.log(apacheToken);

            const classes: any[] = [];

            const tableRows = $("table > tbody > tr.listCell");

            tableRows.each((index, row) => {
                const name = $(row).find("td:nth-child(6)").text().replace(/\n/g, "");
                const teacherRaw = $(row).find("td:nth-child(4)").text().replace(/\n/g, "");
                const gradeRaw = $(row).find("td:nth-child(8)").text().replace(/\n/g, "");
                const room = $(row).find("td:nth-child(5)").text().replace(/\n/g, "");

                const teacher = teacherRaw?.split(";").map((name) => {
                    const [lastName, firstName] = name.trim().split(",").map((name) => name.trim());
                    return firstName && lastName ? `${firstName} ${lastName}` : name.trim();
                }).join(", ");

                const grade = getGradeFromString(gradeRaw);

                classes.push({
                    name,
                    teacher,
                    grade,
                    room,
                });
            });

            return classes;

        });

        browser.close();

        cookies().set("classData", JSON.stringify(classesCurrent));

        const endTimeClasses = new Date();
        const elapsedTimeClasses = endTimeClasses.getTime() - startTimeClasses.getTime();
        console.log("scraped class data in", elapsedTimeClasses, "ms");

        const classesLast = await fetch('https://aspen.cpsd.us/aspen/portalClassList.do', {
            method: 'POST',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
              'Accept-Language': 'en-US,en;q=0.9',
              'Content-Type': 'application/x-www-form-urlencoded',
              'Cookie': `JSESSIONID=${jsessionid}; deploymentId=ma-cambridge`,
            },
            body: `org.apache.struts.taglib.html.TOKEN=${apacheToken}&userEvent=950&userParam=&operationId=&deploymentId=ma-cambridge&scrollX=0&scrollY=0&formFocusField=termFilter&formContents=&formContentsDirty=&maximized=false&menuBarFindInputBox=&selectedStudentOid=STD0000006wB3O&jumpToSearch=&initialSearch=&yearFilter=current&termFilter=GTM0000000C1s9&allowMultipleSelection=true&scrollDirection=&fieldSetName=Default+Fields&fieldSetOid=fsnX2Cls++++++&filterDefinitionId=%23%23%23all&basedOnFilterDefinitionId=&filterDefinitionName=filter.allRecords&sortDefinitionId=default&sortDefinitionName=Schedule+term&editColumn=&editEnabled=false&runningSelection=`
          })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            const $ = cheerio.load(data);

            const classes: any[] = [];

            const tableRows = $("table > tbody > tr.listCell");

            tableRows.each((index, row) => {
                const name = $(row).find("td:nth-child(6)").text().replace(/\n/g, "");
                const teacherRaw = $(row).find("td:nth-child(4)").text().replace(/\n/g, "");
                const gradeRaw = $(row).find("td:nth-child(8)").text().replace(/\n/g, "");
                const room = $(row).find("td:nth-child(5)").text().replace(/\n/g, "");

                const teacher = teacherRaw?.split(";").map((name) => {
                    const [lastName, firstName] = name.trim().split(",").map((name) => name.trim());
                    return firstName && lastName ? `${firstName} ${lastName}` : name.trim();
                }).join(", ");

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
        .catch(error => {
            console.error('There was an error!', error);
        });

        console.log(classesLast);

        cookies().set("classDataLast", JSON.stringify(classesLast));
          
        // console.log(assignmentTest);

        // scrape assignment data

        // const startTimeAssignments = new Date();

        // await page.goto(
        //     "https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd"
        // );

        // var assignmentsData: Assignment[][] = [];

        // for (let i = 0; i < classes.length; i++) {

        //     const tableRows = await page.evaluate(() => {
        //         if (document.querySelector("table > tbody > tr.listCell > td > div.listNoRecordsText")) {
        //             console.log("No records found");
        //             return [];
        //         }

        //         const rows = document.querySelectorAll(
        //             "table > tbody > tr.listCell"
        //         )

        //         return Array.from(rows).map((row) => {
        //             const name = row
        //                 .querySelector("td:nth-child(3)")
        //                 ?.textContent?.replace(/\n/g, "") || "";
        //             const dueDate = row
        //                 .querySelector("td:nth-child(5)")
        //                 ?.textContent?.replace(/\n/g, "") || "";
        //             const gradeCategory = row
        //                 .querySelector("td:nth-child(2)")
        //                 ?.textContent?.replace(/\n/g, "") || "";
        //             const gradeString = row
        //                 .querySelector("td:nth-child(6) > table > tbody > tr > td > div > span")
        //                 ?.textContent?.replace(/\n/g, "");

        //             var grade: number | null;

        //             const gradeRegex = /([0-9]*\.?[0-9]*)/g;
        //             const matches = gradeString?.match(gradeRegex);
        //             if (matches && !isNaN(parseFloat(matches[0]))) {
        //                 grade = parseFloat(matches[0]);
        //             } else {
        //                 grade = null;
        //             }

        //             return {
        //                 name,
        //                 dueDate,
        //                 gradeCategory,
        //                 grade,
        //             };
        //         });
        //     });

        //     // classes[i].assignments = tableRows;
        //     // console.log(tableRows);

        //     assignmentsData.push(tableRows);

        //     await page.click("button#nextButton");
        //     await delay(750);
        // }

        // const fullClassData = classes.map((classData, index) => {
        //     return {
        //         ...classData,
        //         assignments: assignmentsData[index],
        //     };
        // })

        // const endTimeAssignments = new Date();
        // const elapsedTimeAssignments = endTimeAssignments.getTime() - startTimeAssignments.getTime();
        // console.log("scraped assignment data in", elapsedTimeAssignments, "ms");

        // scrape schedule data

        // const startTimeSchedule = new Date();

        // await page.goto(
        //     "https://aspen.cpsd.us/aspen/studentScheduleContextList.do?navkey=myInfo.sch.list"
        // );
        // await delay(250);

        // const currentSchedule = await page.evaluate(() => {
        //     const tableRows = document.querySelectorAll(
        //         "table > tbody > tr > td > table > tbody > tr:not(.listHeader)"
        //     );

        //     console.log(tableRows);
        // });

        // await browser.close();

        // const endTimeSchedule = new Date();
        // const elapsedTimeSchedule = endTimeSchedule.getTime() - startTimeSchedule.getTime();
        // console.log("scraped schedule data in", elapsedTimeSchedule, "ms");

        // const elapsedTimeTotal = endTimeSchedule.getTime() - startTimeLogin.getTime();
        // console.log("total time elapsed:", elapsedTimeTotal, "ms");

        // send class data to client
        if (classesCurrent.length <= 0) {
            // login failed
            console.log("IT DONDA WORKA?!");
            return NextResponse.redirect("/", 302); // redirect back to login page,
        } else {
            console.log("IT WORKA?!");
            return NextResponse.json({ text: classesLast }, { status: 200 });
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
