export default function getRealGrade(grade: string): number | null {
    const gradeRegex = /([0-9]*\.?[0-9]*)/g;
    const matches = grade.match(gradeRegex);
    if (matches && !isNaN(parseFloat(matches[0]))) {
      return parseFloat(matches[0]);
    } else {
      return null;
    }
}