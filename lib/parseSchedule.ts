import Papa from 'papaparse';

export async function parseSchedule(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) throw new Error('Invalid file type');

  if (extension === 'csv') {
    return new Promise<any[]>((resolve, reject) => {
      Papa.parse<string[]>(file, {
        skipEmptyLines: true,
        complete: (results) => {
          // results.data is string[][] when header:false (default)
          // Keep the same return shape as before: an array of rows
          resolve(results.data as unknown as any[]);
        },
        error: (err) => reject(err),
      });
    });
  }

  if (extension === 'xlsx' || extension === 'xls') {
    // We intentionally block Excel files due to an unfixed vulnerability in `xlsx`.
    // Ask users to export their sheet as CSV before uploading.
    throw new Error('Excel files (.xlsx/.xls) are temporarily disabled. Please export to CSV and upload the .csv file.');
  }

  throw new Error('Unsupported file type');
}