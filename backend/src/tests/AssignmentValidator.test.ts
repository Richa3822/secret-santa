import { Assignment } from "../models/Assignment";
import { Employee } from "../models/Employee";
import { AssignmentValidator } from "../services/AssignmentValidator";

describe('AssignmentValidator', () => {
  let validator: AssignmentValidator;
  let alice: Employee, bob: Employee, carol: Employee;

  beforeEach(() => {
    validator = new AssignmentValidator();
    alice = new Employee('Alice', 'alice@acme.com');
    bob = new Employee('Bob', 'bob@acme.com');
    carol = new Employee('Carol', 'carol@acme.com');
  });

  it('returns true for a valid assignment set', () => {
    const employees = [alice, bob, carol];
    const candidate = [
      new Assignment(alice, bob),
      new Assignment(bob, carol),
      new Assignment(carol, alice),
    ];

    expect(validator.isValid(candidate, employees, [])).toBe(true);
  });

  it('returns false if a secret child is assigned more than once', () => {
    const employees = [alice, bob, carol];
    const candidate = [
      new Assignment(alice, bob),
      new Assignment(carol, bob), // bob assigned twice
    ];

    expect(validator.isValid(candidate, employees, [])).toBe(false);
  });

  it('returns false if the candidate set size does not match employee count', () => {
    const employees = [alice, bob, carol];
    const candidate = [new Assignment(alice, bob)];

    expect(validator.isValid(candidate, employees, [])).toBe(false);
  });

  it('returns false if a pairing repeats last year\'s assignment', () => {
    const employees = [alice, bob, carol];
    const previous = [new Assignment(alice, bob)];
    const candidate = [
      new Assignment(alice, bob), // same as last year
      new Assignment(bob, carol),
      new Assignment(carol, alice),
    ];

    expect(validator.isValid(candidate, employees, previous)).toBe(false);
  });

  it('allows a pairing that was not the previous assignment for that employee', () => {
    const employees = [alice, bob, carol];
    const previous = [new Assignment(alice, bob)];
    const candidate = [
      new Assignment(alice, carol), // different from last year
      new Assignment(bob, alice),
      new Assignment(carol, bob),
    ];

    expect(validator.isValid(candidate, employees, previous)).toBe(true);
  });
});