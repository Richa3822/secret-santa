import { AssignmentFailedError, InvalidInputError } from "../errors/SecretSantaErrors";
import { Assignment } from "../models/Assignment";
import { Employee } from "../models/Employee";
import { AssignmentValidator } from "../services/AssignmentValidator";
import { SecretSantaAssigner } from "../services/SecretSantaAssigner";

describe('SecretSantaAssigner', () => {
  let assigner: SecretSantaAssigner;
  let validator: AssignmentValidator;

  beforeEach(() => {
    validator = new AssignmentValidator();
    assigner = new SecretSantaAssigner(validator);
  });

  it('assigns every employee exactly one secret child', () => {
    const employees = [
      new Employee('Alice', 'alice@acme.com'),
      new Employee('Bob', 'bob@acme.com'),
      new Employee('Carol', 'carol@acme.com'),
      new Employee('Dave', 'dave@acme.com'),
    ];

    const result = assigner.assign(employees);

    expect(result.length).toBe(employees.length);
    expect(validator.isValid(result, employees, [])).toBe(true);
  });

  it('never assigns someone to themselves', () => {
    const employees = [
      new Employee('Alice', 'alice@acme.com'),
      new Employee('Bob', 'bob@acme.com'),
      new Employee('Carol', 'carol@acme.com'),
    ];

    // run many times since it's randomized — catch flaky self-assignment bugs
    for (let i = 0; i < 50; i++) {
      const result = assigner.assign(employees);
      for (const a of result) {
        expect(a.employee.equals(a.secretChild)).toBe(false);
      }
    }
  });

  it('avoids repeating the previous year\'s pairing', () => {
    const alice = new Employee('Alice', 'alice@acme.com');
    const bob = new Employee('Bob', 'bob@acme.com');
    const carol = new Employee('Carol', 'carol@acme.com');
    const employees = [alice, bob, carol];
    const previous = [new Assignment(alice, bob)];

    for (let i = 0; i < 50; i++) {
      const result = assigner.assign(employees, previous);
      const aliceAssignment = result.find((a) => a.employee.equals(alice));
      expect(aliceAssignment?.secretChild.equals(bob)).toBe(false);
    }
  });

  it('throws InvalidInputError with fewer than 2 employees', () => {
    const employees = [new Employee('Alice', 'alice@acme.com')];

    expect(() => assigner.assign(employees)).toThrow(InvalidInputError);
  });

  it('throws AssignmentFailedError when constraints make it impossible', () => {
    const alice = new Employee('Alice', 'alice@acme.com');
    const bob = new Employee('Bob', 'bob@acme.com');
    const employees = [alice, bob];
    // with only 2 people, the only valid derangement is alice->bob, bob->alice
    // if THAT was last year's pairing (both directions), it's now impossible
    const previous = [new Assignment(alice, bob), new Assignment(bob, alice)];

    expect(() => assigner.assign(employees, previous)).toThrow(AssignmentFailedError);
  });
});