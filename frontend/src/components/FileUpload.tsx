interface FileUploadProps {
  label: string;
  required?: boolean;
  onFileSelect: (file: File | null) => void;
}

function FileUpload({ label, required, onFileSelect }: FileUploadProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onFileSelect(file);
  };

  return (
    <div className="file-upload">
      <label>
        {label} {required && <span className="required">*</span>}
      </label>
      <input type="file" accept=".csv" onChange={handleChange} />
    </div>
  );
}

export default FileUpload;