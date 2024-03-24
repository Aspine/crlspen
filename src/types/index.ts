export * from "./grading";
export * from "./schedule";

export interface Student {
    name: string;
    grade: number;
    classes: (string | undefined)[] | null;
}