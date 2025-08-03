import * as XLSX from 'xlsx';

export async function parseSchedule(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'xlsx') {
    return parseExcel(file);
  } else if (extension === 'xml') {
    return parseMSProjectXML(file);
  } else {
    throw new Error('Unsupported file type');
  }
}

async function parseExcel(file: File) {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
  return sheet;
}

async function parseMSProjectXML(file: File) {
  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  
  const tasks = Array.from(xmlDoc.getElementsByTagName('Task')).map(task => ({
    name: task.getElementsByTagName('Name')[0]?.textContent || '',
    start: task.getElementsByTagName('Start')[0]?.textContent || '',
    finish: task.getElementsByTagName('Finish')[0]?.textContent || '',
  }));

  return tasks;
}