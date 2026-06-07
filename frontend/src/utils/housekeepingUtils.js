export const isMyTask = (task, user) => {
  if (!user || !task) return false;
  const staffId = task.staff?._id || task.staff;
  if (staffId && String(staffId) === String(user._id)) return true;
  if (task.staffName && user.name && task.staffName.trim().toLowerCase() === user.name.trim().toLowerCase()) {
    return true;
  }
  return false;
};

export const getStockStatus = (item) => {
  if (item.quantity <= 0) return 'Critical';
  if (item.quantity <= item.minLevel) return 'Low';
  return 'OK';
};
