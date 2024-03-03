import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest, res: NextResponse) {
    cookies().set({
        name: "classData",
        value: "",
    });
    
    return NextResponse.json(
        { text: "Logged out." },
        { status: 200 }
    );
}
