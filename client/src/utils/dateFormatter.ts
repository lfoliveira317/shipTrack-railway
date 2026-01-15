/**
 * Format date string to display only the date part (YYYY-MM-DD)
 * Removes time component from datetime strings
 */
export function formatDateOnly(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  
  // If it's already in YYYY-MM-DD format, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  // Parse the date and extract only the date part
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }
    
    // Format as YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return dateString; // Return original if parsing fails
  }
}
