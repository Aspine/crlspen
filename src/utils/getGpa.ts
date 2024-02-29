import gpaTable from "@/../public/gpaTable.json"
import { Grade, GPAType } from "@/types"

export default function calculateGPA(grades: Grade[], type: GPAType): number {
    var totalGrade: number = 0;
    var totalCredits: number = 0;

    grades.forEach((obj) => {
        if (obj.grade == null) { return };
        let added = false;
        if (type == "hUnweighted") {
            totalGrade += obj.grade * obj.credits;
            totalCredits += obj.credits;
            return;
        }
        for (let i = 0; i < gpaTable.length && !added; i++) {
            const gradePair = gpaTable[i];
            if (obj.grade >= gradePair.pre) {
                totalGrade += gradePair.post * obj.credits;
                if (obj.ap && type == "fWeighted") { totalGrade += 1 * obj.credits };
                totalCredits += obj.credits;
                added = true;
            }
        }
    });

    if (totalCredits === 0) return 0;
    return totalGrade / totalCredits;
}
