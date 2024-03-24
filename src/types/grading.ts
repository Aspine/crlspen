export interface Grade {
  grade: number | null;
  credits: number;
  ap: boolean;
}

export interface GradePair {
  pre: number;
  post: number;
}

export type GPAType = "fWeighted" | "fUnweighted" | "hUnweighted";

export interface Class {
  name: string;
  teacher: string;
  grade: number | null;
  room: string;
  ap: boolean;
  credits: number;
}

export interface ClassWithAssignments extends Class {
  assignments: Assignment[];
}

export interface Assignment {
  name: string;
  dueDate: string;
  gradeCategory: string;
  grade: number | null;
}
