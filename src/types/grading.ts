export interface Grade {
    grade: number | null;
    credits: number;
    ap: boolean;
}

export interface GradePair {
    pre: number;
    post: number;
}

export type GPAType = 'fWeighted' | 'fUnweighted' | 'hUnweighted';

export interface ClassData {
    teacherName: string;
    className: string;
    grade: number | null;
    room: string;
}

export interface ClassDataWithAssignments extends ClassData {
    assignments: Assignment[];
}

export interface Assignment {
    name: string;
    dueDate: string;
    gradeCategory: string;
    grade: number | null;
}