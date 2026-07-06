import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface AssignmentRow {
  Employee_Name: string;
  Employee_EmailID: string;
  Secret_Child_Name: string;
  Secret_Child_EmailID: string;
}

export interface AssignResponse {
  assignments: AssignmentRow[];
  downloadUrl: string;
}

export class SecretSantaApi {
  static async assign(
    employeesFile: File,
    previousFile: File | null
  ): Promise<AssignResponse> {
    const formData = new FormData();
    formData.append('employees', employeesFile);
    if (previousFile) {
      formData.append('previous', previousFile);
    }

    const response = await axios.post<AssignResponse>(
      `${API_BASE_URL}/assign`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );

    return response.data;
  }

  static getDownloadUrl(downloadUrl: string): string {
    return `http://localhost:3001${downloadUrl}`;
  }
}