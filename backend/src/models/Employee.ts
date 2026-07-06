export class Employee {
  constructor(
    public readonly name: string,
    public readonly email: string
  ) {
    if (!name?.trim()) {
      throw new Error('Employee name cannot be empty');
    }
    if (!email?.trim() || !Employee.isValidEmail(email)) {
      throw new Error(`Invalid email for employee "${name}": ${email}`);
    }
  }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  equals(other: Employee): boolean {
    return this.email.toLowerCase() === other.email.toLowerCase();
  }
}