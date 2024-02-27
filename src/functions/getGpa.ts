import gpaTable from "@/../public/gpaTable.json"

interface Grade {
    grade: number;
    credits: number;
    ap: boolean;
}

interface GradePair {
    pre: number;
    post: number;
}

function calculateGPA(grades: Grade[]): number {
    var totalGrade: number = 0;
    var totalCredits: number = 0;

    for (let key in grades) {
        var obj = grades[key];

        for (let gradePair: GradePair in gpaTable) {
            var pre = gradePair;

        }        
    }

    return totalGrade / totalCredits;
}

export default calculateGPA;