import puppeteer from "puppeteer";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import delay from "@/utils/delay";
import { Assignment, Class } from "@/types";
import cheerio from "cheerio";

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

        const apacheToken = await page.evaluate(() => {
            const apacheTokenInput = document.querySelector("input");
            const apacheToken = apacheTokenInput?.getAttribute("value");
            return apacheToken;
        });

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

        console.log("jsessionid:", jsessionid);
        console.log("apacheToken:", apacheToken);

        cookies().set("JSESSIONID", jsessionid as string);

        return NextResponse.json({ text: `session_id: ${jsessionid} \napache_token: ${apacheToken}` }, { status: 200 });
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
