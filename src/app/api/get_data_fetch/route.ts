import puppeteer from "puppeteer-core";
import Chromium from "@sparticuz/chromium";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import delay from "@/utils/delay";
import { Assignment, Student } from "@/types";
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

    // parse username and password from request body
    console.log(reqBody);

    const { username, password } = reqBody;

    const usernameString = String(username);
    const passwordString = String(password);

    try {
        const browser = await puppeteer.launch({
            args: Chromium.args,
            defaultViewport: Chromium.defaultViewport,
            executablePath: await Chromium.executablePath(),
            headless: true,
        });
        const page = await browser.newPage();

        // log in to aspen and get session ID

        await page.goto("https://aspen.cpsd.us/aspen/logon.do", {
            waitUntil: "networkidle2",
        });

        await page.type("#username", usernameString);
        await page.type("#password", passwordString);
        await page.click("#logonButton");

        await delay(250);

        const browserCookies = await page.cookies();

        browser.close();

        console.log(browserCookies);

        const requestHeaders: HeadersInit = new Headers();
        requestHeaders.set('Content-Type', 'application/json');
        requestHeaders.set('Cookie', browserCookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; '));

        // get class data

        const classes = await fetch("https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list", {
            method: "GET",
            headers: requestHeaders,
        }).then((res) => res.text()).then(function(html) {

            const $ = cheerio.load(html);

            const classes: any[] = [];

            const tableRows = $("table > tbody > tr.listCell");

            tableRows.each((index, row) => {
                const name = $(row).find("td:nth-child(6)").text().replace(/\n/g, "");
                const teacherRaw = $(row).find("td:nth-child(4)").text().replace(/\n/g, "");
                const gradeRaw = $(row).find("td:nth-child(8)").text().replace(/\n/g, "");
                const roomRaw = $(row).find("td:nth-child(5)").text().replace(/\n/g, "");

                const teacher = teacherRaw?.split(";").map((name) => {
                    const [lastName, firstName] = name.trim().split(",").map((name) => name.trim());
                    return firstName && lastName ? `${firstName} ${lastName}` : name.trim();
                }).join(", ");

                const grade = getGradeFromString(gradeRaw);

                const room = parseInt(roomRaw);

                classes.push({
                    name,
                    teacher,
                    grade,
                    room,
                });
            });

            console.log(JSON.stringify(classes, null, 2));

            return classes;

        });

        cookies().set("classData", JSON.stringify(classes));

        // scrape assignment data

        // yet to be done

        // send class data back to client

        if (classes.length <= 0) {
            // login failed
            console.log("IT DONDA WORKA?!");
            return NextResponse.redirect("/", 302); // redirect back to login page,
        } else {
            console.log("IT WORKA?!");
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
