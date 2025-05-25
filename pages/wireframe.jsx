import React, { useEffect, useState } from "react";
import WireframeFromSQL from "../components/WireframeFromSQL";
import { parseSQL } from "../utils/sqlParser";

export default function WireframePage() {
  const [sql, setSql] = useState("");
  const [parsed, setParsed] = useState([]);
  const [fileName, setFileName] = useState("Untitled");

  useEffect(() => {
    const storedSql = localStorage.getItem("generatedSQL");
    const storedName = localStorage.getItem("projectName");
    if (storedSql) {
      setSql(storedSql);
      setParsed(parseSQL(storedSql));
    }
    if (storedName) {
      setFileName(storedName);
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
