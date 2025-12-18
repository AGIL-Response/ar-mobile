/**
 * Date formatting utilities
 * Single Responsibility: Format dates for chat UI
 */

/**
 * Check if two dates are on different days
 */
export function isDifferentDay(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() !== d2.getTime();
}

/**
 * Format date separator text for chat messages
 */
export function formatDateSeparator(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date);
  const messageDateStr = messageDate.toDateString();
  const todayStr = today.toDateString();
  const yesterdayStr = yesterday.toDateString();

  if (messageDateStr === todayStr) {
    return 'Today';
  } else if (messageDateStr === yesterdayStr) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: messageDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
}

