import * as creditsTable from "@/../public/credits.json";

interface ClassInfo {
  name: string;
  credits: number;
}

export default function getCredits(className: string): number {
  const classInfo: ClassInfo | undefined = creditsTable.find(
    (classObj: ClassInfo) => classObj.name === className,
  );
  return classInfo ? classInfo.credits : 10; // Default to 10 if class not found
}
