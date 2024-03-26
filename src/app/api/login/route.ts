import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";

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

    cookies().set("sessionId", sessionId ? sessionId : "");

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

    const newLoginText = await newLoginPage.text();
    const $new = cheerio.load(newLoginText);
    const apacheInputNew = $new("input");
    apacheToken = apacheInputNew.attr("value");

    console.log("Apache Token:", apacheToken);
    cookies().set("apacheToken", apacheToken ? apacheToken : "");

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
