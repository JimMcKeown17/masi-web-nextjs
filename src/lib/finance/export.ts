// All cells are display strings, never executable formulas or recomputed money.
export function displayCsv(rows: readonly (readonly string[])[]): string {
  return rows.map(row=>row.map(cell=>`"${(/^[=+@-]|^[\t\r\n]/.test(cell) ? "'"+cell : cell).replaceAll('"','""')}"`).join(",")).join("\r\n");
}
export async function displayExport(rows: readonly (readonly string[])[], format: "csv" | "xlsx"): Promise<Blob> {
  if (format === "csv") return new Blob([displayCsv(rows)],{type:"text/csv;charset=utf-8"});
  const {default: ExcelJS} = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  const sheet=workbook.addWorksheet("Finance");
  for (const row of rows) sheet.addRow([...row]);
  const buffer=await workbook.xlsx.writeBuffer();
  return new Blob([new Uint8Array(buffer)],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
export function downloadFinanceBlob(blob: Blob, filename: string) {
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");link.href=url;link.download=filename;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),0);
}
