export const generateInvoiceNumber = (inputDate) => {
  let dateStr;

  // If a YYYY-MM-DD string is provided, use it directly
  if (typeof inputDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
    dateStr = inputDate;
  }
  // If a Date object is provided, convert safely to local date
  else if (inputDate instanceof Date) {
    const y = inputDate.getFullYear();
    const m = String(inputDate.getMonth() + 1).padStart(2, '0');
    const d = String(inputDate.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }
  // Fallback to today's local date
  else {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  }

  // Convert YYMMDD
  const compactDate = dateStr.slice(2).replace(/-/g, '');

  const suffix = Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase();

  return `INV-${compactDate}-${suffix}`;
};
