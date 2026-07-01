import { leavePolicy } from "@/interfaces";
import { AccuralFrequency } from "@/interfaces";

const POLICIES: leavePolicy[] = [
  {
    id: "1",
    policyName: "Earned Leave",
    description: "XYZ",
    accural: 1,
    accuralFrequency: AccuralFrequency.Monthly,
    sandwich: true,
    capped: 18,
  },
  {
    id: "2",
    policyName: "Casual Leave",
    description: "XYZ",
    accural: 2,
    accuralFrequency: AccuralFrequency.Quarterly,
    sandwich: false,
    maxApply: 2,
  },
  {
    id: "3",
    policyName: "Exam Leave",
    description: "XYZ",
    accural: 0,
    accuralFrequency: AccuralFrequency.Monthly,
    sandwich: false,
  },
  {
    id: "4",
    policyName: "Un-Paid Leave",
    description: "XYZ",
    accural: 0,
    accuralFrequency: AccuralFrequency.Monthly,
    sandwich: false,
  },
];
export default POLICIES;
