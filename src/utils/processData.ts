import { Assignment } from '@/types';
import { load } from 'cheerio';

export function processAssignments(html: string): {
    assignments: Assignment[],
    more: boolean
} {
    const $ = load(html);

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

    const recordsCount = parseInt($("#totalRecordsCount")?.text() || "0");

    return {
        assignments,
        more: recordsCount > 25
    }
}