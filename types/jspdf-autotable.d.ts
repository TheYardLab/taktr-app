declare module "jspdf-autotable" {
  import jsPDF from "jspdf";

  declare module "jspdf" {
    interface jsPDF {
      autoTable: (options: any) => jsPDF;
      lastAutoTable: {
        finalY: number;
      };
    }
  }

  export default function autoTable(doc: jsPDF, options: any): jsPDF;
}