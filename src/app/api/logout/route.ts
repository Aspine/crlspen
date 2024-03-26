import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, res: NextResponse) {
    cookies().set({
        name: "classDataQ3",
        value: "",
        expires: new Date(0),
    });

    cookies().set({
        name: "sessionId",
        value: "",
        expires: new Date(0),
    });

    cookies().set({
        name: "apacheToken",
        value: "",
        expires: new Date(0),
    });
    
    return NextResponse.json(
        { text: "Logged out." },
        { status: 200 }
    );
}
