import * as XLSX from 'xlsx';

export async function parseSchedule(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) throw new Error('Invalid file type');

  if (extension === 'csv') {
    return new Promise<any[]>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => row.split(','));
        resolve(rows);
      };
      reader.readAsText(file);
    });
  } else if (extension === 'xlsx' || extension === 'xls') {
    return new Promise<any[]>((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        resolve(json);
      };
      reader.readAsArrayBuffer(file);
    });
  } else {
    throw new Error('Unsupported file type');
  }
}