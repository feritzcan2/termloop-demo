const escape = (value) => {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

export function toCsv(rows, columns) {
  const header = columns.map(escape).join(',');
  const body = rows.map((row) => columns.map((c) => escape(row[c])).join(','));
  return [header, ...body].join('\n');
}
