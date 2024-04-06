import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, res: NextResponse) {
    const startTime = new Date();

    const sessionId = cookies().get("sessionId")?.value;
    cookies().delete("sessionId");
    cookies().delete("apacheToken");
    cookies().delete("classDataQ1");
    cookies().delete("classDataQ2");
    cookies().delete("classDataQ3");
    cookies().delete("classDataQ4");
    cookies().delete("scheduleData");

    await fetch("https://aspen.cpsd.us/aspen/logout.do", {
        headers: {
            "Cookie": `JSESSIONID=${sessionId}`,
        },
        redirect: "manual",
    });

    const endTime = new Date();
    const time = endTime.getTime() - startTime.getTime();
    console.log(`\x1b[32m ✓\x1b[0m Logged out in`, time, `ms`);

    return NextResponse.json(
        { text: "Logged out." },
        { status: 200 }
    );
}
