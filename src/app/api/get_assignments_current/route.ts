import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";
import { Assignment } from "@/types";
import { getCurrentQuarterOid } from "@/utils/getCurrentQuarter";
import { processAssignments } from "@/utils/processData";

export async function GET(req: NextRequest, res: NextResponse) {
	try {
		const startTime = new Date();

		const sessionId = cookies().get("sessionId")?.value;
		var apacheToken = cookies().get("apacheToken")?.value;
		const classesUnparsed = cookies().get("classDataLength")?.value;
		const classes: number = classesUnparsed ? +classesUnparsed | 0 : 0;
		var assingmentsList: Assignment[][] = [];

		await fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
			headers: {
				Cookie: `JSESSIONID=${sessionId}`
			},
		}).then(res => res.text()).then(html => {
			const { assignments, more } = processAssignments(html);

			if (more) {
				fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
					headers: {
						Cookie: `JSESSIONID=${sessionId}`
					},
					method: "POST",
					body: new URLSearchParams({
						"org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
						"userEvent": "10",
						"gradeTermOid": getCurrentQuarterOid(),
					}),
				}).then(async res => {
					const html = await res.text();

					assignments.push(...processAssignments(html).assignments);
				});

				fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
					headers: {
						Cookie: `JSESSIONID=${sessionId}`
					},
					method: "POST",
					body: new URLSearchParams({
						"org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
						"userEvent": "20",
						"gradeTermOid": getCurrentQuarterOid(),
					}),
				});
			}

			assingmentsList.push(assignments);
		});

		for (let i = 0; i < classes - 1; i++) {
			await fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
				headers: {
					Cookie: `JSESSIONID=${sessionId}`
				},
				method: "POST",
				body: new URLSearchParams({
					"org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
					"userEvent": "60",
					"gradeTermOid": getCurrentQuarterOid(),
				}),
			}).then(res => res.text()).then(async html => {
				const { assignments, more } = processAssignments(html);

				if (more) {
					fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
						headers: {
							Cookie: `JSESSIONID=${sessionId}`
						},
						method: "POST",
						body: new URLSearchParams({
							"org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
							"userEvent": "10",
							"gradeTermOid": getCurrentQuarterOid(),
						}),
					}).then(async res => {
						const html = await res.text();

						assignments.push(...processAssignments(html).assignments);
					});

					fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
						headers: {
							Cookie: `JSESSIONID=${sessionId}`
						},
						method: "POST",
						body: new URLSearchParams({
							"org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
							"userEvent": "20",
							"gradeTermOid": getCurrentQuarterOid(),
						}),
					});
				}

				assingmentsList.push(assignments);
			});
		}

		await fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
			headers: {
				Cookie: `JSESSIONID=${sessionId}`
			},
			method: "POST",
			body: new URLSearchParams({
				"org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
				"userEvent": "80",
				"gradeTermOid": getCurrentQuarterOid(),
			}),
		})

		console.log(assingmentsList);

		const elapsedTime = new Date().getTime() - startTime.getTime();
		console.log("\x1b[32m ✓\x1b[0m scraped assignments in", elapsedTime, "ms");
		return new Response(JSON.stringify(assingmentsList), { status: 200 });
	} catch (e) {
		console.error(e);
		return new Response("An error occurred.", { status: 500 });
	}
}