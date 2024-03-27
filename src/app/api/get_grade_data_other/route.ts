import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";

export default async function GET(req: NextRequest, res: NextResponse) {
    try {
        const sessionId = cookies().get("sessionId")?.value;
        var apacheToken = cookies().get("apacheToken")?.value;

        const quarter = 3;

        const quarter_table: { [key: string]: string } = {
            Q1: "GTM0000000C1s8",
            Q2: "GTM0000000C1s9",
            Q3: "GTM0000000C1sA",
            Q4: "GTM0000000C1sB",
        };

        const termOid = quarter_table[quarter];

        const startTimeClasses = new Date();

        for (var i = 0; i < 3; i++) {
            const classesList = await fetch("https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list", {
                headers: {
                    Cookie: `JSESSIONID=${sessionId}`,
                },
            });
        }
        

    } catch (error) {
        console.error(error);
        return NextResponse.error;
    }
}
// pass in current quarter 
// for now, just pass in Q3
// get sessionId and apacheToken from cookies
// for loop:
//   fetch data from aspen using POST method
//   parse data and save as variable in array of full data
//   get new apache token and save
// split into separate arrays and put into cookies