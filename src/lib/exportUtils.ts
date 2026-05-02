import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-hot-toast';

/**
 * Utility to download data as a CSV file.
 * @param data Array of objects to export
 * @param filename Name of the file (without extension)
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    toast.error('No data available to export.');
    return;
  }

  try {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`${filename}.csv downloaded securely.`);
    }
  } catch (error) {
    console.error('CSV Export failed:', error);
    toast.error('Failed to generate CSV file.');
  }
};

/**
 * Utility to download data as a formatted PDF.
 * @param title Title printed at the top of the PDF
 * @param columns Array of column headers (e.g. ['Date', 'Amount', 'Category'])
 * @param data Array of row data matching the columns (e.g. [['2024-01-01', '$50', 'Feed']])
 * @param filename Name of the file (without extension)
 */
export const exportToPDF = (title: string, columns: string[], data: any[][], filename: string) => {
  if (!data || data.length === 0) {
    toast.error('No data available to export.');
    return;
  }

  try {
    const doc = new jsPDF();

    // Add Logo or Header Styling
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Braes Creek Estate', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(title, 14, 30);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 36);

    // AutoTable for data
    autoTable(doc, {
      startY: 42,
      head: [columns],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [24, 24, 27] }, // Dark charcoal matching the UI
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [244, 244, 245] },
    });

    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success(`${filename}.pdf downloaded securely.`);
  } catch (error) {
    console.error('PDF Export failed:', error);
    toast.error('Failed to generate PDF file.');
  }
};
