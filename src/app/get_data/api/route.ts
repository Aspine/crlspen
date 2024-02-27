import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function delay(time: number) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time);
  });
}

export async function POST(req: NextRequest, res: NextResponse) {
  const reqBody = await req.json();

  // parse username and password from request body

  const { username, password } = reqBody;

  const usernameString = String(username);
  const passwordString = String(password);

  try {
    // set up puppeteer

    chromium.setGraphicsMode = false;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: false,
    });

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
      "https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list",
    );

    // scrape class data

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
          .querySelector("td:nth-child(8  )")
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

    cookies().set("classData", JSON.stringify(classes));

    return NextResponse.json({ text: classes }, { status: 200 });
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
