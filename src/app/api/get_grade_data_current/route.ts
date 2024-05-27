import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";
import getRealGrade from "@/utils/getRealGrade";

export async function GET(req: NextRequest, res: NextResponse) {
	try {
		const sessionId = cookies().get("sessionId")?.value;
		var apacheToken = cookies().get("apacheToken")?.value;

		const startTimeClasses = new Date();

		const classesList = await fetch(
			`https://aspen.cpsd.us/aspen/portalClassList.do?navkey=academics.classes.list`,
			{
				headers: {
					Cookie: `JSESSIONID=${sessionId}`,
				},
			},
		).then((res) => res.text()).then((html) => {
			const $ = cheerio.load(html);

			if (html.includes("You are not logged on or your session has expired.")) {
				throw new Error("Session expired");
			}

			const apacheInput = $("input");
			apacheToken = apacheInput.attr("value");

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

				const grade = getRealGrade(gradeRaw);

				classes.push({
					name,
					teacher,
					grade,
					room,
				});
			});

			return classes;
		});

		cookies().set("apacheToken", apacheToken ? apacheToken : "");

		const endTimeClasses = new Date();
		const elapsedTimeClasses =
			endTimeClasses.getTime() - startTimeClasses.getTime();
		console.log("\x1b[32m ✓\x1b[0m scraped class data in", elapsedTimeClasses, "ms");

		// cookies().set("classDataQ3", JSON.stringify(classesList));
		cookies().set("classDataLength", String(classesList.length));

		return NextResponse.json({ text: classesList }, { status: 200 });
	} catch (error) {
		console.error("Error during scraping:", error);

		return NextResponse.json({ text: "An error occurred" }, { status: 500 });
	}
}
