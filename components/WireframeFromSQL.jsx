import React from "react";
import styles from "../styles/wireframe.module.css";

export default function WireframeFromSQL({ parsedTables }) {
  if (!parsedTables || parsedTables.length === 0) {
    return <div className="p-8 text-gray-500">No tables found.</div>;
  }

  return (
    <div className={styles.container}>
      <aside className={styles.sidebar}>
        <h2>Entity Overview</h2>
        {parsedTables.map((table) => (
          <div key={table.tableName}>
            <h3>{table.tableName}</h3>
            {table.columns.map((col) => (
              <div key={col.name}>{col.name}</div>
            ))}
          </div>
        ))}
      </aside>

      <main className={styles.main}>
        <input className={styles.searchBar} placeholder="Search..." />

        <h2 className="text-xl font-semibold mb-4">Simulated Views</h2>
        <div className={styles.cardGrid}>
          {parsedTables.map((table) => (
            <div key={table.tableName} className={styles.card}>
              <h3>{table.tableName}</h3>

              {table.columns.map((col) => {
                const name = col.name;
                const lower = name.toLowerCase();

                const isPK = col.isKey;
                const isFK = !!col.references;
                const isDate = lower.includes("date");
                const isText = lower.includes("desc") || lower.includes("content");
                const isBoolean =
                  lower.startsWith("is_") || lower.startsWith("has") || lower.startsWith("can_");

                if (isPK) {
                  return (
                    <div key={name}>
                      <label>
                        <strong>ID:</strong> #{name} (auto-generated)
                      </label>
                    </div>
                  );
                }

                if (isFK) {
                  return (
                    <div key={name}>
                      <label>
                        <strong>{name}:</strong>{" "}
                        <select>
                          <option>Choose {col.references}</option>
                        </select>
                      </label>
                    </div>
                  );
                }

                if (isDate) {
                  return (
                    <div key={name}>
                      <label>
                        <strong>{name}:</strong>{" "}
                        <input type="date" placeholder={name} />
                      </label>
                    </div>
                  );
                }

                if (isBoolean) {
                  return (
                    <div key={name}>
                      <label>
                        <input type="checkbox" /> {name}
                      </label>
                    </div>
                  );
                }

                if (isText) {
                  return (
                    <div key={name}>
                      <label>
                        <strong>{name}:</strong>{" "}
                        <textarea rows="2" placeholder={name}></textarea>
                      </label>
                    </div>
                  );
                }

                return (
                  <div key={name}>
                    <label>
                      <strong>{name}:</strong>{" "}
                      <input type="text" placeholder={name} />
                    </label>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
