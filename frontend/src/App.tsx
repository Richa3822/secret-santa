import axios from 'axios';
import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ResultsTable from './components/ResultsTable';
import { SecretSantaApi, type AssignmentRow } from './api/secretSantaApi';
import './App.css';

function App() {
  const [employeesFile, setEmployeesFile] = useState<File | null>(null);
  const [previousFile, setPreviousFile] = useState<File | null>(null);
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAssign = async () => {
    if (!employeesFile) {
      setError('Please upload an employees CSV file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setAssignments([]);
    setDownloadUrl(null);

    try {
      const result = await SecretSantaApi.assign(employeesFile, previousFile);
      setAssignments(result.assignments);
      setDownloadUrl(result.downloadUrl);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.error ?? 'Something went wrong. Please try again.')
        : 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="tag-header">
        <h1>Secret Santa Assigner</h1>
        <p>Upload your employee list to generate this year's pairings.</p>
      </header>

      <div className="card">
        <h2>Upload files</h2>
        <FileUpload label="Employees CSV" required onFileSelect={setEmployeesFile} />
        <FileUpload
          label="Previous year's assignments CSV (optional)"
          onFileSelect={setPreviousFile}
        />
        <button className="btn-primary" onClick={handleAssign} disabled={loading}>
          {loading ? 'Assigning…' : 'Assign Secret Santas'}
        </button>
        {error && <p className="error-banner">{error}</p>}
      </div>

      {assignments.length > 0 && (
        <div className="results-card">
          <h2>This year's pairings</h2>
          <p className="results-subtitle">{assignments.length} employees matched</p>
          <ResultsTable assignments={assignments} />
          {downloadUrl && (
            <div className="download-row">
              <a href={SecretSantaApi.getDownloadUrl(downloadUrl)} download>
                <button className="btn-secondary">Download result CSV</button>
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;