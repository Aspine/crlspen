import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";
import { Assignment } from "@/types";
import { parse } from "path";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const startTime = new Date();

        const sessionId = cookies().get("sessionId")?.value;
        var apacheToken = cookies().get("apacheToken")?.value;
        const classesListUnparsed  = cookies().get("classDataQ3")?.value;
        const classesList = classesListUnparsed ? JSON.parse(classesListUnparsed) : [];
        const classes = classesList.length;

        console.log(classes)

        await fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do", {
            headers: {
                Cookie: `JSESSIONID=${sessionId}`
            },
            method: "GET",
            // body: new URLSearchParams({
            //     "org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
            //     "userEvent": "view",
            //     "userParam": "",
            //     "gradeTermOid": "GTM0000000C1sA",
            // })
        }).then(res => res.text()).then(html => {
            const $ = cheerio.load(html);

            console.log($.text().trim());

            const apacheInput = $("input");
            apacheToken = apacheInput.attr("value");
        });

        const assignmentsList = await fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do", {
            headers: {
                Cookie: `JSESSIONID=${sessionId}`
            },
            method: "POST",
            body: new URLSearchParams({
                "org.apache.struts.taglib.html.TOKEN": apacheToken ? apacheToken : "",
                "userEvent": "60",
                "userParam": "",
                "gradeTermOid": "GTM0000000C1sA",
            }),
        }).then(res => res.text()).then(html => {
            const $ = cheerio.load(html);

            console.log($.text().trim());

            const assignments: Assignment[] = [];

            const tableRows = $("#dataGrid > table > tbody > tr.listCell");

            tableRows.each((index, row) => {
                const assignmentName = $(row).children("td:nth-child(3)").text().trim();
                const dueDate = $(row).children("td:nth-child(5)").text().trim();
                const category = $(row).children("td:nth-child(2)").text().trim();
                const points = $(row).find("td:nth-child(6) > table > tbody > tr > td:nth-child(2)").text().split("/")[1].trim();
                const earned = $(row).find("td:nth-child(6) > table > tbody > tr > td:nth-child(2)").text().split("/")[0].trim();
                const feedback = $(row).children("td:nth-child(7)").text().trim();

                if (assignmentName) {

                    const assignment = {
                        name: assignmentName,
                        dueDate: dueDate ? dueDate : null,
                        gradeCategory: category ? category : null,
                        points: points ? parseFloat(points) : null,
                        earned: earned ? parseFloat(earned) : null,
                        feedback: feedback ? feedback : null
                    };

                    assignments.push(assignment);
                }

            })

            return assignments;
        });

        console.log(assignmentsList);

        const elapsedTime = new Date().getTime() - startTime.getTime();
        console.log("scraped assignments in", elapsedTime, "ms");

        return new Response("Hello, world!", { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response("An error occurred.", { status: 500 });
    }
}