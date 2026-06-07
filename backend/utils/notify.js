const Notification = require('../models/Notification');

/**
 * Create an in-app notification for a role (non-blocking).
 */
const notifyRole = async ({ title, message, type = 'Alert', recipientRole = 'Admin' }) => {
  try {
    if (!title?.trim() || !message?.trim()) return;
    await Notification.create({
      title: title.trim(),
      message: message.trim(),
      type: type || 'Alert',
      recipientRole: recipientRole || 'Admin',
    });
  } catch (err) {
    console.error('Notification create failed:', err.message);
  }
};

/** Always notify Admin */
const notifyAdmin = async (opts) => notifyRole({ ...opts, recipientRole: 'Admin' });

/**
 * Notify Admin + optional other roles (e.g. Receptionist).
 */
const notifyEvent = async ({ title, message, type = 'Alert', alsoNotify = [] }) => {
  await notifyAdmin({ title, message, type });
  for (const role of alsoNotify) {
    if (role && role !== 'Admin') {
      await notifyRole({ title, message, type, recipientRole: role });
    }
  }
};

module.exports = { notifyRole, notifyAdmin, notifyEvent };
