const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
const fs = require('fs');

// Windows / ISP DNS often blocks Atlas SRV — use public DNS for mongodb+srv
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

let memoryServer = null;

/** @type {'atlas'|'local'|'memory-persistent'|'memory'} */
let dbMode = 'atlas';

const getDbMode = () => dbMode;

/** Direct connection (no SRV) — use when DNS SRV fails; same cluster as MONGO_URI */
const ATLAS_DIRECT_URI =
  process.env.MONGO_URI_DIRECT ||
  'mongodb://hotel:hotel123@ac-1lje4zh-shard-00-00.kvspgjz.mongodb.net:27017,ac-1lje4zh-shard-00-01.kvspgjz.mongodb.net:27017,ac-1lje4zh-shard-00-02.kvspgjz.mongodb.net:27017/luxurystay?ssl=true&authSource=admin&retryWrites=true&w=majority';

const connectUri = async (uri, label) => {
  await mongoose.disconnect().catch(() => {});
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 20000,
  });
  console.log(`MongoDB Connected (${label}): ${conn.connection.host}`);
  console.log(`Database: ${conn.connection.name}`);
  return label;
};

const fetchPublicIp = () =>
  new Promise((resolve, reject) => {
    const https = require('https');
    https
      .get('https://api.ipify.org', (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve(data.trim()));
      })
      .on('error', reject);
    setTimeout(() => reject(new Error('timeout')), 5000);
  });

const printAtlasHelp = async () => {
  let ip = 'your current public IP';
  let previousIp = '';
  const ipFile = path.join(__dirname, '..', '.data', 'last-public-ip.txt');

  try {
    ip = await fetchPublicIp();
    if (fs.existsSync(ipFile)) {
      previousIp = fs.readFileSync(ipFile, 'utf8').trim();
    }
    fs.mkdirSync(path.dirname(ipFile), { recursive: true });
    fs.writeFileSync(ipFile, ip, 'utf8');
  } catch {
    /* ignore */
  }

  console.log('');
  console.log('━━ Atlas fix (required for your OLD cloud data) ━━');
  console.log('1. Open https://cloud.mongodb.com → Network Access');
  console.log(`2. Add THIS IP now: ${ip}`);
  if (previousIp && previousIp !== ip) {
    console.log(`   ⚠ Your IP changed (${previousIp} → ${ip}). Old whitelist entries will NOT work.`);
  }
  console.log('   Best fix: Allow 0.0.0.0/0 (Access from anywhere) so WiFi/mobile changes never break again.');
  console.log('3. Wait 1–2 minutes, then restart: npm start');
  console.log('4. You must see: DB mode: atlas');
  console.log('   Quick helper: powershell -ExecutionPolicy Bypass -File scripts/atlas-fix.ps1');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
};

const connectDB = async () => {
  const atlasSrv = process.env.MONGO_URI;
  const localUri =
    process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/luxurystay';

  if (!atlasSrv) {
    throw new Error('MONGO_URI is missing in backend/.env');
  }

  // 1a) Atlas via mongodb+srv (with Google DNS)
  try {
    await connectUri(atlasSrv, 'Atlas SRV');
    dbMode = 'atlas';
    console.log('✓ Using Atlas — your saved hotel data will load.');
    return;
  } catch (error) {
    console.error(`Atlas SRV failed: ${error.message}`);
  }

  // 1b) Atlas via direct hosts (no SRV DNS needed)
  try {
    await connectUri(ATLAS_DIRECT_URI, 'Atlas direct');
    dbMode = 'atlas';
    console.log('✓ Using Atlas (direct) — your saved hotel data will load.');
    return;
  } catch (error) {
    console.error(`Atlas direct failed: ${error.message}`);
    await printAtlasHelp();
  }

  // 2) Local MongoDB
  try {
    await connectUri(localUri, 'local');
    dbMode = 'local';
    console.log('✓ Using local MongoDB — data persists on this PC.');
    return;
  } catch (error) {
    console.error(`Local MongoDB failed: ${error.message}`);
  }

  if (process.env.NODE_ENV === 'production' && process.env.USE_MEMORY_DB !== 'true') {
    throw new Error(
      'Cannot reach Atlas or local MongoDB. Fix Atlas Network Access or start local Mongo.'
    );
  }

  // 3) Dev fallback — persistent folder, or fresh in-memory if locked/corrupt
  console.log('');
  console.log('⚠️  Atlas unreachable — using LOCAL dev database.');
  console.log('   Your OLD Atlas data is still in the cloud; fix Network Access to load it.');
  console.log('');

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const dataDir = path.join(__dirname, '..', '.data', 'dev-mongo');
  const lockFile = path.join(dataDir, 'mongod.lock');

  const connectMemory = async (server) => {
    const memUri = server.getUri('luxurystay');
    await mongoose.connect(memUri, { serverSelectionTimeoutMS: 12000 });
    console.log(`MongoDB Connected (dev): ${mongoose.connection.host}`);
    console.log(`Database: ${mongoose.connection.name}`);
  };

  const tryPersistent = async () => {
    fs.mkdirSync(dataDir, { recursive: true });
    memoryServer = await MongoMemoryServer.create({
      instance: {
        dbPath: dataDir,
        storageEngine: 'wiredTiger',
      },
    });
    dbMode = 'memory-persistent';
    await connectMemory(memoryServer);
    console.log(`Data folder: ${dataDir}`);
  };

  try {
    await tryPersistent();
    return;
  } catch (error) {
    const msg = error.message || '';
    const locked =
      msg.includes('DBPathInUse') ||
      msg.includes('mongod.lock') ||
      msg.includes('lock file');
    const parseErr = msg.includes('JSON') || msg.includes('StdoutInstanceError');

    if (memoryServer) {
      await memoryServer.stop().catch(() => {});
      memoryServer = null;
    }

    if (locked || parseErr) {
      console.warn(
        locked
          ? 'Dev DB folder is locked (another mongod running). Using fresh in-memory DB.'
          : 'Dev DB folder may be corrupt. Using fresh in-memory DB.'
      );
      if (locked && fs.existsSync(lockFile)) {
        try {
          fs.unlinkSync(lockFile);
        } catch {
          /* still in use */
        }
      }
    } else {
      throw error;
    }
  }

  memoryServer = await MongoMemoryServer.create();
  dbMode = 'memory';
  await connectMemory(memoryServer);
  console.log('(Session-only DB — restart re-seeds default logins)');
};

module.exports = connectDB;
module.exports.getDbMode = getDbMode;
