export function exportCsv(
  filename: string,
  rows: Array<Record<string, string | number | boolean | null | undefined>>
) {
  const headers = Array.from(new Set(rows.flatMap(r => Object.keys(r))));
  const csv = [headers.join(',')]
    .concat(rows.map(r => headers.map(h => cell(r[h])).join(',')))
    .join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function cell(v: any) {
  if (v == null) return '';
  const s = String(v).replace(/"/g, '""');
  return /[,"\n]/.test(s) ? `"${s}"` : s;
}
