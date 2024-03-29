import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";

export async function getGradeDataOther(quarter: number) {
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
        
        return NextResponse.json({ text: "Scraped Classes" }, { status: 200 })
    } catch (error) {
        console.error(error);
        return NextResponse.error;
    }
}