# Secret Santa Assigner

A full-stack application that automates Secret Santa assignments for a company's
employees, avoiding self-assignment and repeats of the previous year's pairing.

## Overview

Employees upload a CSV of names/emails (and optionally last year's assignments).
The app generates a valid one-to-one Secret Santa pairing for everyone, shows the
result in the browser, and provides a downloadable CSV.

## Tech Stack

- **Backend:** Node.js, TypeScript, Express, Jest
- **Frontend:** React, TypeScript, Vite, Axios
- **CSV parsing:** csv-parse / csv-stringify
- **File uploads:** Multer

## Architecture
backend/
├── src/
│   ├── models/          # Employee, Assignment — domain entities with built-in validation
│   ├── services/        # CsvReaderService, CsvWriterService, SecretSantaAssigner, AssignmentValidator
│   ├── controllers/     # Express request handlers (thin — delegate to services)
│   ├── routes/          # API route definitions
│   ├── middleware/       # Centralized error handling
│   ├── errors/           # Custom typed errors
│   └── server.ts
├── tests/                # Jest unit tests, one suite per service
frontend/
├── src/
│   ├── components/       # FileUpload, ResultsTable (presentational, no business logic)
│   ├── api/               # Thin API client wrapping axios calls
│   └── App.tsx            # Owns all state; orchestrates the upload → assign → download flow

The core matching logic (`SecretSantaAssigner`) has no knowledge of HTTP, files, or
CSV — it operates purely on `Employee[]` / `Assignment[]` objects. This means it's
testable in isolation and could be reused behind a CLI, a queue worker, or a
different transport without any changes.

## Algorithm

`SecretSantaAssigner` uses a randomized retry approach:

1. Shuffle the employee list to produce a candidate "secret child" order.
2. Pair each employee (in original order) with the corresponding shuffled employee.
3. Validate the candidate against all constraints via `AssignmentValidator`:
   - no one is assigned to themselves
   - every employee appears as a secret child exactly once
   - no pairing repeats the previous year's assignment for that employee
4. If validation fails, reshuffle and retry (up to 1000 attempts).
5. If no valid assignment can be found (e.g. impossible constraints with a very
   small employee list), the service throws `AssignmentFailedError` with a clear
   message rather than looping forever.

This approach was chosen over a graph-matching algorithm because for realistic
employee-list sizes it converges almost instantly, and is significantly simpler
to read, test, and explain than a bipartite matching implementation, while still
being provably correct via the validator.

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm

### Backend

```bash
cd backend
npm install
npm run dev
```

Server runs at `http://localhost:3001`.

### Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Running Tests

```bash
cd backend
npm test
```

Covers: CSV parsing (valid/invalid input, missing columns, missing optional file),
assignment validation rules, the assignment algorithm (including edge cases like
impossible constraints), and CSV writing.

## Usage

1. Open the frontend in your browser.
2. Upload an **Employees CSV** with columns `Employee_Name, Employee_EmailID`.
3. Optionally upload a **Previous Year's Assignments CSV** with columns
   `Employee_Name, Employee_EmailID, Secret_Child_Name, Secret_Child_EmailID`.
4. Click **Assign Secret Santas**.
5. Review the pairings in the results table and click **Download result CSV**
   to save the output file.

## API

### `POST /api/assign`
Multipart form data:
- `employees` (required): employees CSV file
- `previous` (optional): previous year's assignments CSV file

Response:
```json
{
  "assignments": [
    {
      "Employee_Name": "...",
      "Employee_EmailID": "...",
      "Secret_Child_Name": "...",
      "Secret_Child_EmailID": "..."
    }
  ],
  "downloadUrl": "/api/download/result-<timestamp>.csv"
}
```

### `GET /api/download/:filename`
Downloads the generated result CSV.

## Error Handling

Custom error types (`CsvParseError`, `InvalidInputError`, `AssignmentFailedError`)
are mapped to appropriate HTTP status codes by centralized Express middleware:
- `400` — invalid input (malformed CSV, missing required columns, bad file)
- `422` — well-formed request but constraints made assignment impossible
- `500` — unexpected server error

## Known Limitations / Future Improvements

- CSV parsing assumes comma-delimited files; a production version could
  auto-detect delimiters (tab, semicolon) for more resilient uploads.
- No persistent storage — each run is stateless. A production version could add
  a database to automatically track assignment history across multiple years
  instead of requiring manual upload of the previous year's file.
- No authentication — acceptable for this challenge's scope, but a real
  multi-tenant deployment would need it.