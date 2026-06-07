export const isSameCalendarDay = (dateA, dateB = new Date()) => {
  if (!dateA) return false;
  const a = new Date(dateA);
  const b = new Date(dateB);
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');
