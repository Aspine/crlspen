interface Grade {
    grade: number;
    credits: number;
}

function calculateGPA(grades: Grade[]): number {
    let totalGradePoints = 0;
    let totalCredits = 0;

    for (const grade of grades) {
        totalGradePoints += (grade.grade / 25) * grade.credits;
        totalCredits += grade.credits;
    }

    if (totalCredits === 0) {
        return 0;
    }

    return totalGradePoints / totalCredits;
}

export default calculateGPA;