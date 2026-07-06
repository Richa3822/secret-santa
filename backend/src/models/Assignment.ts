import { Employee } from './Employee';

export class Assignment {
  constructor(
    public readonly employee: Employee,
    public readonly secretChild: Employee
  ) {
    if (employee.equals(secretChild)) {
      throw new Error(
        `Invalid assignment: ${employee.name} cannot be their own secret child`
      );
    }
  }

  toCsvRow(): Record<string, string> {
    return {
      Employee_Name: this.employee.name,
      Employee_EmailID: this.employee.email,
      Secret_Child_Name: this.secretChild.name,
      Secret_Child_EmailID: this.secretChild.email,
    };
  }
}