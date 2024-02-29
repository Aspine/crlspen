import puppeteer from "puppeteer-core";
import Chromium from "@sparticuz/chromium";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import delay from "@/utils/delay";

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

    // log in to aspen
    await page.goto("https://aspen.cpsd.us/aspen/logon.do", {
      waitUntil: "networkidle2",
    });

    await page.type("#username", usernameString);
    await page.type("#password", passwordString);
    await page.click("#logonButton");

    // scrape class data

    await page.goto(
      "https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list",
    );

    const classes = await page.evaluate(() => {
      const classRows = document.querySelectorAll(
        "table > tbody > tr.listCell",
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
        const grade = row
          .querySelector("td:nth-child(8)")
          ?.textContent?.replace(/\n/g, "");

        return {
          className,
          teacherName,
          room,
          grade,
        };
      });
    });

    await browser.close();

    console.log(classes);

    // send class data to client
    if (classes.length <= 0) { // my kinda shit way of checking if the login failed, E.G. login was wrong. Make this better later
      console.log("IT DONDA WORKA?!");
      return NextResponse.redirect("/", 302); // redirect back to login page, cus, yk, do that! (im tired ok? this dont have to make sense, as long as it doesn't error)
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
        { status: 500 },
      );
    } else {
      console.error("res object does not have a status function");
    }

    console.log(error)

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
