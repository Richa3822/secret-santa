import * as fs from 'fs';
import * as path from 'path';
import { CsvWriterService } from '../services/CsvWriterService';
import { Employee } from '../models/Employee';
import { Assignment } from '../models/Assignment';

describe('CsvWriterService', () => {
  const writer = new CsvWriterService();
  const testOutputPath = path.join(__dirname, 'temp-output', 'result.csv');

  afterEach(() => {
    const dir = path.dirname(testOutputPath);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('writes a valid CSV file with correct headers and rows', () => {
    const alice = new Employee('Alice', 'alice@acme.com');
    const bob = new Employee('Bob', 'bob@acme.com');
    const assignments = [new Assignment(alice, bob)];

    const outputPath = writer.write(assignments, testOutputPath);
    const content = fs.readFileSync(outputPath, 'utf-8');

    expect(content).toContain('Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID');
    expect(content).toContain('Alice,alice@acme.com,Bob,bob@acme.com');
  });

  it('throws when given an empty assignment list', () => {
    expect(() => writer.write([], testOutputPath)).toThrow();
  });
});