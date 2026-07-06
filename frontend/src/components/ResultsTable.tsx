import type { AssignmentRow } from "../api/secretSantaApi";

interface ResultsTableProps {
  assignments: AssignmentRow[];
}

function ResultsTable({ assignments }: ResultsTableProps) {
  if (assignments.length === 0) return null;

  return (
    <table>
      <thead>
        <tr>
          <th>Giver</th>
          <th></th>
          <th>Secret child</th>
        </tr>
      </thead>
      <tbody>
        {assignments.map((row, i) => (
          <tr key={i}>
            <td>
              <span className="name">{row.Employee_Name}</span>
              <span className="email">{row.Employee_EmailID}</span>
            </td>
            <td className="arrow-cell">→</td>
            <td>
              <span className="name">{row.Secret_Child_Name}</span>
              <span className="email">{row.Secret_Child_EmailID}</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ResultsTable;