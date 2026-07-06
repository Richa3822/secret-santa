
import { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import { CsvReaderService } from '../services/CsvReaderService';
import { CsvWriterService } from '../services/CsvWriterService';
import { AssignmentValidator } from '../services/AssignmentValidator';
import { SecretSantaAssigner } from '../services/SecretSantaAssigner';

export class SecretSantaController {
  constructor(
    private readonly reader: CsvReaderService,
    private readonly writer: CsvWriterService,
    private readonly assigner: SecretSantaAssigner
  ) {}

  assign = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const files = req.files as { [field: string]: Express.Multer.File[] };
      const employeesFile = files?.employees?.[0];
      const previousFile = files?.previous?.[0];

      if (!employeesFile) {
        res.status(400).json({ error: 'employees.csv file is required' });
        return;
      }

      const employees = this.reader.readEmployees(employeesFile.path);
      const previousAssignments = previousFile
        ? this.reader.readPreviousAssignments(previousFile.path)
        : [];

      const result = this.assigner.assign(employees, previousAssignments);

      const outputPath = path.join(
        __dirname,
        '../../outputs',
        `result-${Date.now()}.csv`
      );
      this.writer.write(result, outputPath);

      res.status(200).json({
        assignments: result.map((a) => a.toCsvRow()),
        downloadUrl: `/api/download/${path.basename(outputPath)}`,
      });
    } catch (err) {
      next(err); // delegate to centralized error handler
    }
  };
}