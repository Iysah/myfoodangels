/**
 * Formats a date string into a standard format
 * @param date - The date string to format (can be in various formats)
 * @param format - Optional format string (default: 'MMM DD, YYYY')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, format: string = 'MMM DD, YYYY'): string => {
  if (!date) {
    console.warn('No date provided to formatDate');
    return 'Date not available';
  }

  // Handle special string values
  if (typeof date === 'string' && date.toLowerCase() === 'till date') {
    return 'Present';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatDate:', date);
    return 'Invalid Date';
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  return format
    .replace('MMM', month)
    .replace('DD', day.toString().padStart(2, '0'))
    .replace('YYYY', year.toString());
};

/**
 * Formats a date string into a standard time format
 * @param date - The date string to format
 * @param format - Optional format string (default: 'hh:mm A')
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date, format: string = 'hh:mm A'): string => {
  if (!date) {
    console.warn('No date provided to formatTime');
    return 'Time not available';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatTime:', date);
    return 'Invalid Time';
  }

  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format

  return format
    .replace('hh', formattedHours.toString().padStart(2, '0'))
    .replace('mm', minutes.toString().padStart(2, '0'))
    .replace('A', ampm);
};

/**
 * Formats a date string into a relative time format (e.g., "2h ago", "3d ago")
 * @param date - The date string to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) {
    console.warn('No date provided to formatRelativeTime');
    return 'Time not available';
  }

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date provided to formatRelativeTime:', date);
    return 'Invalid Time';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}y ago`;
}; 

