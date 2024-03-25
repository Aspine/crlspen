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

    const loginPage = await fetch("https://aspen.cpsd.us/aspen/logon.do");

    const loginText = await loginPage.text();
    const $ = cheerio.load(loginText);
    const apacheInput = $("input");
    var apacheToken = apacheInput.attr("value");

    const loginCookies = loginPage.headers.get("set-cookie");
    const sessionId = loginCookies?.split(";")[0].split("=")[1];

    console.log("Session ID:", sessionId);
    console.log("Apache Token:", apacheToken);

    const endTimeLogin = new Date();
    const elapsedTimeLogin = endTimeLogin.getTime() - startTimeLogin.getTime();
    console.log("logged in in", elapsedTimeLogin, "ms");

    const newLoginPage = await fetch("https://aspen.cpsd.us/aspen/logon.do", {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua":
          '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie: "JSESSIONID=" + sessionId,
        Referer: `https://aspen.cpsd.us/aspen/logon.do;jsessionid=${sessionId}`,
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: `org.apache.struts.taglib.html.TOKEN=${apacheToken}&userEvent=930&userParam=&operationId=&deploymentId=ma-cambridge&scrollX=0&scrollY=0&formFocusField=username&mobile=false&SSOLoginDone=&username=${usernameString}&password=${passwordString}`,
      method: "POST",
    });

    // get class data

    const startTimeClasses = new Date();

    const classesCurrent: Class[] = await fetch(
      "https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list",
      {
        method: "GET",
        headers: {
          cookie: "JSESSIONID=" + sessionId,
        },
      },
    )
      .then((res) => res.text())
      .then(function (html) {
        const $ = cheerio.load(html);

        const apacheInput = $("input");
        apacheToken = apacheInput.attr("value");

        // console.log(apacheToken);

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
      });

    // console.log(classesCurrent);

    cookies().set("classData", JSON.stringify(classesCurrent));

    const endTimeClasses = new Date();
    const elapsedTimeClasses =
      endTimeClasses.getTime() - startTimeClasses.getTime();
    console.log("scraped class data in", elapsedTimeClasses, "ms");

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
        body: `org.apache.struts.taglib.html.TOKEN=${apacheToken}&userEvent=950&userParam=&operationId=&deploymentId=ma-cambridge&scrollX=0&scrollY=0&formFocusField=termFilter&formContents=&formContentsDirty=&maximized=false&menuBarFindInputBox=&selectedStudentOid=STD0000006wB3O&jumpToSearch=&initialSearch=&yearFilter=current&termFilter=GTM0000000C1s9&allowMultipleSelection=true&scrollDirection=&fieldSetName=Default+Fields&fieldSetOid=fsnX2Cls++++++&filterDefinitionId=%23%23%23all&basedOnFilterDefinitionId=&filterDefinitionName=filter.allRecords&sortDefinitionId=default&sortDefinitionName=Schedule+term&editColumn=&editEnabled=false&runningSelection=`,
      },
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
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

    cookies().set("classDataLast", JSON.stringify(classesLast));
    return NextResponse.json({ text: sessionId }, { status: 200 });
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