const User = require('../models/User');
const Room = require('../models/Room');

const USERS = [
  { name: 'System Admin', email: 'admin@luxurystay.com', password: 'password123', role: 'Admin' },
  { name: 'Receptionist', email: 'reception@luxurystay.com', password: 'password123', role: 'Receptionist' },
  {
    name: 'Housekeeping Staff',
    email: 'housekeeping@luxurystay.com',
    password: 'password123',
    role: 'Housekeeping Staff',
  },
  { name: 'Guest Demo', email: 'guest@luxurystay.com', password: 'password123', role: 'Guest' },
];

const SAMPLE_ROOMS = [
  {
    number: '01',
    type: 'Deluxe King',
    status: 'Available',
    floor: '1st Floor',
    price: 320,
    amenities: ['King Bed', 'City View', 'Mini Bar'],
    images: ['https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  {
    number: '02',
    type: 'Executive Suite',
    status: 'Available',
    floor: '2nd Floor',
    price: 520,
    amenities: ['Living Area', 'Jacuzzi', 'Concierge'],
    images: ['https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  {
    number: '03',
    type: 'Standard Queen',
    status: 'Available',
    floor: '1st Floor',
    price: 220,
    amenities: ['Queen Bed', 'Work Desk'],
    images: ['https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
];

const bcrypt = require('bcryptjs');

/**
 * Dev fallback DB: guarantee default logins work (password123).
 * Atlas data is left untouched when dbMode is atlas.
 */
const ensureDevCredentials = async (dbMode) => {
  if (dbMode === 'atlas') return false;

  let fixed = false;
  for (const u of USERS) {
    let user = await User.findOne({ email: u.email }).select('+password');
    if (!user) {
      await User.create(u);
      fixed = true;
      continue;
    }
    const passwordOk = await bcrypt.compare(u.password, user.password);
    if (!passwordOk || user.role !== u.role) {
      user.password = u.password;
      user.role = u.role;
      user.name = u.name;
      await user.save();
      fixed = true;
    }
  }
  if (fixed) {
    console.log('✓ Dev logins ready: admin@luxurystay.com / password123');
  }
  return fixed;
};

/**
 * Ensure minimum users + rooms exist (runs after connect).
 */
const seedDatabaseIfEmpty = async (dbMode = 'atlas') => {
  let seeded = false;

  const userCount = await User.countDocuments();
  if (userCount === 0) {
    for (const u of USERS) {
      await User.create(u);
    }
    console.log('✓ Seeded default users (admin, reception, housekeeping, guest)');
    seeded = true;
  } else {
    seeded = (await ensureDevCredentials(dbMode)) || seeded;
  }

  const roomCount = await Room.countDocuments();
  if (roomCount === 0) {
    await Room.insertMany(SAMPLE_ROOMS);
    console.log('✓ Seeded sample rooms (01, 02, 03)');
    seeded = true;
  }

  if (seeded && dbMode !== 'atlas') {
    console.log('');
    console.log('Login: admin@luxurystay.com / password123');
    console.log('');
  }

  return seeded;
};

module.exports = { seedDatabaseIfEmpty, ensureDevCredentials };
