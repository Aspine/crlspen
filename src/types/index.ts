export * from "./grading";
export * from "./schedule";

export interface Student {
  name: string;
  grade: number;
  classes: (string | undefined)[] | null;
}

export type studentDataRequest = {
  sessionId: string;
  apacheToken: string | undefined;
  classes: "current" | "all" | undefined;
  schedule: boolean;
  assignments: boolean;
};
