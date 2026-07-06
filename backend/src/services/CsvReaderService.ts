import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import { EmployeeCsvRow, PreviousAssignmentCsvRow } from '../interfaces/types';
import { CsvParseError } from '../errors/SecretSantaErrors';
import { Employee } from '../models/Employee';
import { Assignment } from '../models/Assignment';

export class CsvReaderService {
  readEmployees(filePath: string): Employee[] {
    const rows = this.parseFile<EmployeeCsvRow>(filePath, [
      'Employee_Name',
      'Employee_EmailID',
    ]);

    return rows.map((row, index) => {
      try {
        return new Employee(row.Employee_Name, row.Employee_EmailID);
      } catch (err) {
        throw new CsvParseError(
          `Invalid employee data at row ${index + 2}: ${(err as Error).message}`
        );
      }
    });
  }

  readPreviousAssignments(filePath: string): Assignment[] {
    if (!fs.existsSync(filePath)) {
      return []; // previous assignments are optional
    }

    const rows = this.parseFile<PreviousAssignmentCsvRow>(filePath, [
      'Employee_Name',
      'Employee_EmailID',
      'Secret_Child_Name',
      'Secret_Child_EmailID',
    ]);

    return rows.map((row, index) => {
      try {
        const employee = new Employee(row.Employee_Name, row.Employee_EmailID);
        const secretChild = new Employee(
          row.Secret_Child_Name,
          row.Secret_Child_EmailID
        );
        return new Assignment(employee, secretChild);
      } catch (err) {
        throw new CsvParseError(
          `Invalid previous assignment at row ${index + 2}: ${(err as Error).message}`
        );
      }
    });
  }

  private parseFile<T>(filePath: string, requiredColumns: string[]): T[] {
    if (!fs.existsSync(filePath)) {
      throw new CsvParseError(`File not found: ${filePath}`);
    }

    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      throw new CsvParseError(`Failed to read file: ${filePath}`);
    }

    let records: T[];
    try {
      records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    } catch (err) {
      throw new CsvParseError(`Malformed CSV in ${filePath}: ${(err as Error).message}`);
    }

    if (records.length === 0) {
      throw new CsvParseError(`No data rows found in ${filePath}`);
    }

    const actualColumns = Object.keys(records[0] as object);
    const missingColumns = requiredColumns.filter(
      (col) => !actualColumns.includes(col)
    );
    if (missingColumns.length > 0) {
      throw new CsvParseError(
        `Missing required columns in ${filePath}: ${missingColumns.join(', ')}`
      );
    }

    return records;
  }
}