import { parse, unparse } from 'papaparse';

export async function jsonToCSV(json: Record<string, any>): Promise<string> {
  // Flatten the JSON structure into rows
  const rows = [];
  
  // Add headers
  const headers = ['Category', 'Subcategory', 'Value'];
  rows.push(headers);
  
  // Recursive function to flatten nested JSON
  function flattenJSON(obj: any, category = '', subcategory = '') {
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        flattenJSON(obj[key], category || key, category ? key : '');
      } else {
        rows.push([category || key, subcategory || '', obj[key].toString()]);
      }
    }
  }
  
  flattenJSON(json);
  
  // Convert to CSV
  return unparse(rows);
} 