import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export function exportProjectAsPDF(project: any) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(project.name || 'Project', 14, 20);
  doc.setFontSize(12);

  autoTable(doc, {
    startY: 30,
    head: [['Task', 'Status', 'Due Date']],
    body: project.tasks?.map((task: any) => [
      task.name,
      task.status,
      task.dueDate
    ]) || []
  });

  doc.save(`${project.name || 'project'}.pdf`);
}

export function exportProjectAsCSV(project: any) {
  const csv = Papa.unparse({
    fields: ['Task', 'Status', 'Due Date'],
    data: project.tasks?.map((task: any) => [
      task.name,
      task.status,
      task.dueDate
    ]) || []
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${project.name || 'project'}.csv`);
  link.click();
}