import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import cheerio from "cheerio";
import { Assignment } from "@/types";
import { parse } from "path";
import zlib from "zlib";

export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const startTime = new Date();

        const sessionId = cookies().get("sessionId")?.value;
        var apacheToken = cookies().get("apacheToken")?.value;
        const classesListUnparsed = cookies().get("classDataQ3")?.value;
        const classesList = classesListUnparsed ? JSON.parse(classesListUnparsed) : [];
        const classes = classesList.length;
        var assingmentsList: Assignment[][] = [];

        await fetch("https://aspen.cpsd.us/aspen/portalAssignmentList.do?navkey=academics.classes.list.gcd", {
            headers: {
                Cookie: `JSESSIONID=${sessionId}`
            },
        }).then(res => res.text()).then(html => {
            const $ = cheerio.load(html);

            const assignments: Assignment[] = [];

            const tableRows = $("#dataGrid > table > tbody > tr.listCell");

            tableRows.each((index, row) => {
                const assignmentName = $(row).children("td:nth-child(3)").text();
                const dueDate = $(row).children("td:nth-child(5)").text();
                const category = $(row).children("td:nth-child(2)").text();
                const points = $(row).find("td:nth-child(6) > table > tbody > tr > td:nth-child(2)").text().split("/")[1];
                const earned = $(row).find("td:nth-child(6) > table > tbody > tr > td:nth-child(2)").text().split("/")[0];
                const feedback = $(row).children("td:nth-child(7)").text();

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
                    "gradeTermOid": "GTM0000000C1sA",
                }),
            }).then(res => res.text()).then(html => {
                const $ = cheerio.load(html);

                const assignments: Assignment[] = [];

                const tableRows = $("#dataGrid > table > tbody > tr.listCell");

                tableRows.each((index, row) => {
                    const assignmentName = $(row).children("td:nth-child(3)").text();
                    const dueDate = $(row).children("td:nth-child(5)").text();
                    const category = $(row).children("td:nth-child(2)").text();
                    const points = $(row).find("td:nth-child(6) > table > tbody > tr > td:nth-child(2)").text().split("/")[1];
                    const earned = $(row).find("td:nth-child(6) > table > tbody > tr > td:nth-child(2)").text().split("/")[0];
                    const feedback = $(row).children("td:nth-child(7)").text();

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
                "gradeTermOid": "GTM0000000C1sA",
            }),
        })

        const elapsedTime = new Date().getTime() - startTime.getTime();
        console.log(" ✓ scraped assignments in", elapsedTime, "ms");

        return new Response(JSON.stringify(assingmentsList), { status: 200 });
    } catch (e) {
        console.error(e);
        return new Response("An error occurred.", { status: 500 });
    }
}