import puppeteer from "puppeteer";
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

  console.log(reqBody);

  const { username, password } = reqBody;

  const usernameString = String(username);
  const passwordString = String(password);

  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto("https://aspen.cpsd.us/aspen/logon.do", {
      waitUntil: "networkidle2",
    });

    await page.type("#username", usernameString);
    await page.type("#password", passwordString);
    await page.click("#logonButton");

    await delay(500);

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
