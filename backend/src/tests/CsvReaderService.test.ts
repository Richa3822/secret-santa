import * as fs from 'fs';
import * as path from 'path';
import { CsvReaderService } from '../services/CsvReaderService';
import { CsvParseError } from '../errors/SecretSantaErrors';

describe('CsvReaderService', () => {
  const reader = new CsvReaderService();
  const tempDir = path.join(__dirname, 'temp-csv');

  beforeEach(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const writeFile = (filename: string, content: string): string => {
    const filePath = path.join(tempDir, filename);
    fs.writeFileSync(filePath, content, 'utf-8');
    return filePath;
  };

  describe('readEmployees', () => {
    it('parses valid employee rows', () => {
      const filePath = writeFile(
        'employees.csv',
        'Employee_Name,Employee_EmailID\nAlice,alice@acme.com\nBob,bob@acme.com'
      );

      const employees = reader.readEmployees(filePath);

      expect(employees.length).toBe(2);
      expect(employees[0].name).toBe('Alice');
      expect(employees[0].email).toBe('alice@acme.com');
    });

    it('throws CsvParseError when the file does not exist', () => {
      expect(() => reader.readEmployees(path.join(tempDir, 'missing.csv'))).toThrow(
        CsvParseError
      );
    });

    it('throws CsvParseError when required columns are missing', () => {
      const filePath = writeFile('bad-columns.csv', 'Name,Email\nAlice,alice@acme.com');

      expect(() => reader.readEmployees(filePath)).toThrow(CsvParseError);
    });

    it('throws CsvParseError when the file has no data rows', () => {
      const filePath = writeFile('empty.csv', 'Employee_Name,Employee_EmailID\n');

      expect(() => reader.readEmployees(filePath)).toThrow(CsvParseError);
    });

    it('throws CsvParseError with row context when an email is invalid', () => {
      const filePath = writeFile(
        'invalid-email.csv',
        'Employee_Name,Employee_EmailID\nAlice,not-an-email'
      );

      expect(() => reader.readEmployees(filePath)).toThrow(CsvParseError);
      expect(() => reader.readEmployees(filePath)).toThrow(/row 2/);
    });
  });

  describe('readPreviousAssignments', () => {
    it('returns an empty array when the file does not exist (optional input)', () => {
      const result = reader.readPreviousAssignments(
        path.join(tempDir, 'does-not-exist.csv')
      );

      expect(result).toEqual([]);
    });

    it('parses valid previous assignment rows', () => {
      const filePath = writeFile(
        'previous.csv',
        'Employee_Name,Employee_EmailID,Secret_Child_Name,Secret_Child_EmailID\n' +
          'Alice,alice@acme.com,Bob,bob@acme.com'
      );

      const assignments = reader.readPreviousAssignments(filePath);

      expect(assignments.length).toBe(1);
      expect(assignments[0].employee.name).toBe('Alice');
      expect(assignments[0].secretChild.name).toBe('Bob');
    });

    it('throws CsvParseError when previous assignments file is malformed', () => {
      const filePath = writeFile(
        'bad-previous.csv',
        'Employee_Name,Employee_EmailID\nAlice,alice@acme.com'
      );

      expect(() => reader.readPreviousAssignments(filePath)).toThrow(CsvParseError);
    });
  });
});