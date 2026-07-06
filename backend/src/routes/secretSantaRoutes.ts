import { Router } from 'express';
import multer from 'multer';
import * as path from 'path';
import { SecretSantaController } from '../controllers/SecretSantaController';
import { CsvReaderService } from '../services/CsvReaderService';
import { CsvWriterService } from '../services/CsvWriterService';
import { AssignmentValidator } from '../services/AssignmentValidator';
import { SecretSantaAssigner } from '../services/SecretSantaAssigner';

const router = Router();

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
});

const controller = new SecretSantaController(
  new CsvReaderService(),
  new CsvWriterService(),
  new SecretSantaAssigner(new AssignmentValidator())
);

router.post(
  '/assign',
  upload.fields([
    { name: 'employees', maxCount: 1 },
    { name: 'previous', maxCount: 1 },
  ]),
  controller.assign
);

router.get('/download/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../../outputs', req.params.filename);
  res.download(filePath);
});

export default router;