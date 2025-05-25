export const parseSQL = (sqlText) => {
  const tables = [];
  const createTableRegex = /CREATE TABLE (\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = createTableRegex.exec(sqlText)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];

    const columns = [];
    const foreignKeys = [];

    const lines = columnsBlock.split(",\n").map(line => line.trim());

    lines.forEach(line => {
      const isPrimaryKeyLine = line.toUpperCase().startsWith("PRIMARY KEY");
      const isForeignKeyLine = line.toUpperCase().startsWith("FOREIGN KEY");

      if (isPrimaryKeyLine) {
        const pkCols = line.match(/\((.*?)\)/)?.[1].split(",").map(c => c.trim()) || [];
        pkCols.forEach(pk => {
          const col = columns.find(c => c.name === pk);
          if (col) col.isPrimary = true;
        });
        return;
      }

      if (isForeignKeyLine) {
        const fkMatch = line.match(/FOREIGN KEY \((\w+)\) REFERENCES (\w+)/i);
        if (fkMatch) {
          const [, fkCol, referencedTable] = fkMatch;
          const col = columns.find(c => c.name === fkCol);
          if (col) {
            col.references = referencedTable;
            col.isForeign = true;
          }
        }
        return;
      }

      const colMatch = line.match(/^(\w+)\s+([\w()]+)(.*)/);
      if (!colMatch) return;

      const [, name, type, rest] = colMatch;
      const isPrimary = /PRIMARY KEY/.test(rest.toUpperCase());

      columns.push({
        name,
        type: type.toUpperCase(),
        isPrimary,
        isForeign: false,
        references: null,
      });
    });

    tables.push({
      tableName,
      columns,
    });
  }

  return tables;
};