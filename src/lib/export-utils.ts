/**
 * Utility for exporting data to CSV format
 * @param data Array of objects to export
 * @param filename Name of the file to download
 */
export const exportToCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.warn("No data provided for export");
    return;
  }

  // Get all unique keys from all objects in the array
  const allKeys = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
  
  // Create headers row
  const headers = allKeys.join(',');
  
  // Create data rows
  const rows = data.map(obj => {
    return allKeys.map(key => {
      const val = obj[key] ?? '';
      // Escape strings containing commas, quotes or newlines
      if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  }).join('\n');
  
  const csvContent = `${headers}\n${rows}`;
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
