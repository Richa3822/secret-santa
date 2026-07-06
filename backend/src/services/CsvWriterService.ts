import { stringify } from 'csv-stringify/sync';
import * as fs from 'fs';
import * as path from 'path';
import { CsvParseError } from '../errors/SecretSantaErrors';
import { Assignment } from '../models/Assignment';

export class CsvWriterService {
  write(assignments: Assignment[], outputPath: string): string {
    if (assignments.length === 0) {
      throw new CsvParseError('Cannot write an empty assignment list to CSV');
    }

    const rows = assignments.map((a) => a.toCsvRow());

    let csvContent: string;
    try {
      csvContent = stringify(rows, {
        header: true,
        columns: [
          'Employee_Name',
          'Employee_EmailID',
          'Secret_Child_Name',
          'Secret_Child_EmailID',
        ],
      });
    } catch (err) {
      throw new CsvParseError(`Failed to generate CSV: ${(err as Error).message}`);
    }

    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      fs.writeFileSync(outputPath, csvContent, 'utf-8');
    } catch (err) {
      throw new CsvParseError(`Failed to write output file: ${(err as Error).message}`);
    }

    return outputPath;
  }
}