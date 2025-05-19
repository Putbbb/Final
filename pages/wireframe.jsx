// pages/wireframe.jsx
import { useEffect, useState } from "react";
import WireframeFromSQL from "../components/WireframeFromSQL";
import { parseSQL } from "../utils/sqlParser";

export default function WireframePage() {
  const [sql, setSql] = useState("");
  const [parsed, setParsed] = useState([]);

  useEffect(() => {
    // Automatically get SQL from localStorage
    const storedSql = localStorage.getItem("generatedSQL");
    if (storedSql) {
      setSql(storedSql);
      const parsedResult = parseSQL(storedSql);
      setParsed(parsedResult);
    }
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Wireframe Preview</h1>
      {parsed.length === 0 ? (
        <p className="text-gray-600">No SQL found. Please generate an ER diagram first.</p>
      ) : (
        <WireframeFromSQL parsedTables={parsed} />
      )}
    </div>
  );
}
