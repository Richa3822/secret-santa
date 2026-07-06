import { Assignment } from "../models/Assignment";
import { Employee } from "../models/Employee";

export class AssignmentValidator {
  /**
   * Checks a full candidate assignment set against all rules:
   * - no self-assignment
   * - each employee assigned exactly once
   * - each secret child assigned exactly once
   * - no repeat of previous year's pairing
   */
  isValid(
    candidate: Assignment[],
    employees: Employee[],
    previousAssignments: Assignment[]
  ): boolean {
    if (candidate.length !== employees.length) return false;

    const assignedChildren = new Set<string>();
    const previousPairKey = new Set(
      previousAssignments.map((a) => this.pairKey(a.employee, a.secretChild))
    );

    for (const assignment of candidate) {
      if (assignment.employee.equals(assignment.secretChild)) {
        return false; // self-assignment
      }

      const childKey = assignment.secretChild.email.toLowerCase();
      if (assignedChildren.has(childKey)) {
        return false; // secret child reused
      }
      assignedChildren.add(childKey);

      const key = this.pairKey(assignment.employee, assignment.secretChild);
      if (previousPairKey.has(key)) {
        return false; // repeats last year's pairing
      }
    }

    return true;
  }

  private pairKey(employee: Employee, secretChild: Employee): string {
    return `${employee.email.toLowerCase()}=>${secretChild.email.toLowerCase()}`;
  }
}