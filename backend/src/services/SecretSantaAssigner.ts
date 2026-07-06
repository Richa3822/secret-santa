import { AssignmentValidator } from "./AssignmentValidator";
import {
  AssignmentFailedError,
  InvalidInputError,
} from "../errors/SecretSantaErrors";
import { Employee } from "../models/Employee";
import { Assignment } from "../models/Assignment";

export class SecretSantaAssigner {
  private static readonly MAX_ATTEMPTS = 1000;

  constructor(private readonly validator: AssignmentValidator) {}

  assign(
    employees: Employee[],
    previousAssignments: Assignment[] = [],
  ): Assignment[] {
    if (employees.length < 2) {
      throw new InvalidInputError(
        "Need at least 2 employees to run Secret Santa",
      );
    }

    for (
      let attempt = 0;
      attempt < SecretSantaAssigner.MAX_ATTEMPTS;
      attempt++
    ) {
      const candidate = this.generateCandidate(employees);
      if (
        candidate &&
        this.validator.isValid(candidate, employees, previousAssignments)
      ) {
        return candidate;
      }
    }

    throw new AssignmentFailedError(
      `Could not find a valid assignment after ${SecretSantaAssigner.MAX_ATTEMPTS} attempts. ` +
        `This can happen with very small employee lists combined with previous-year constraints.`,
    );
  }

  private generateCandidate(employees: Employee[]): Assignment[] | null {
    const shuffledChildren = this.shuffle([...employees]);
    try {
      return employees.map(
        (employee, index) => new Assignment(employee, shuffledChildren[index]),
      );
    } catch {
      return null; // self-assignment occurred, signal retry
    }
  }

  private shuffle(array: Employee[]): Employee[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
