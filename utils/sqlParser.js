export const parseSQL = (sqlText) => {
  const tables = [];
  const createTableRegex = /CREATE TABLE (\w+)\s*\(([\s\S]*?)\);/gi;
  let match;

  while ((match = createTableRegex.exec(sqlText)) !== null) {
    const tableName = match[1];
    const columnsBlock = match[2];

    const columns = [];
    const lines = columnsBlock.split(",\n").map(line => line.trim());

    lines.forEach(line => {
      const isPrimaryKeyLine = line.toUpperCase().startsWith("PRIMARY KEY");
      if (isPrimaryKeyLine) return;

      const colMatch = line.match(/^(\w+)\s+(\w+(?:\(\d+\))?)(.*)/);
      if (!colMatch) return;

      const [, name, type, rest] = colMatch;
      const isPrimary = /PRIMARY KEY/.test(rest.toUpperCase());
      const isForeign = /FOREIGN KEY/.test(rest.toUpperCase());

      columns.push({
        name,
        type,
        isPrimary,
        isForeign
      });
    });

    tables.push({
      tableName,
      columns
    });
  }

  return tables;
};