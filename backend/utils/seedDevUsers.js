const User = require('../models/User');

const DEV_USERS = [
  { name: 'System Admin', email: 'admin@luxurystay.com', password: 'password123', role: 'Admin' },
  {
    name: 'Housekeeping Staff',
    email: 'housekeeping@luxurystay.com',
    password: 'password123',
    role: 'Housekeeping Staff',
  },
  { name: 'Receptionist', email: 'reception@luxurystay.com', password: 'password123', role: 'Receptionist' },
];

const seedDevUsers = async () => {
  if (process.env.SEED_DEV_USERS !== 'true') return;

  const count = await User.countDocuments();
  if (count > 0) return;

  for (const user of DEV_USERS) {
    await User.create(user);
  }

  console.log('Default logins created (first run only):');
  console.log('  Admin: admin@luxurystay.com / password123');
  console.log('  Housekeeping: housekeeping@luxurystay.com / password123 → http://localhost:5173/housekeeping');
};

module.exports = seedDevUsers;
