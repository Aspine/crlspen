export interface Grade {
    grade: number | null;
    credits: number;
    ap: boolean;
}

export interface GradePair {
    pre: number;
    post: number;
}

export type GPAType = 'fWeighted' | 'fUnweighted' | 'hUnweighted' | "hWeighted";

export interface ClassData {
    teacherName: string;
    className: string;
    grade: string;
    room: string;
    realGrade: number | null;
}
