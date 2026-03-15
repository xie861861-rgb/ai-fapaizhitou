import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../../data/ai-fapaizhitou.db');

let db: SqlJsDatabase | null = null;
let dbInitPromise: Promise<SqlJsDatabase> | null = null;

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

async function initSql(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }
  
  return db;
}

function saveDb(): void {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbPath, buffer);
  }
}

// Auto-save every 30 seconds
setInterval(() => {
  try {
    saveDb();
  } catch (e) {
    console.error('Auto-save failed:', e);
  }
}, 30000);

export async function initDatabase(): Promise<void> {
  if (dbInitPromise) {
    await dbInitPromise;
    return;
  }
  
  dbInitPromise = initSql();
  const database = await dbInitPromise;
  
  // Create tables
  database.run(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
      avatar TEXT,
      phone TEXT,
      points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  database.run(`
    -- User tokens table
    CREATE TABLE IF NOT EXISTS user_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  database.run(`
    -- Properties table (司法拍卖房产)
    CREATE TABLE IF NOT EXISTS properties (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      starting_price REAL NOT NULL,
      evaluation_price REAL NOT NULL,
      ai_predicted_price REAL,
      current_price REAL,
      area REAL NOT NULL,
      floor TEXT,
      built_date TEXT,
      usage_type TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'auctioning', 'sold', 'cancelled')),
      auction_date TEXT,
      time_left TEXT,
      risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high')),
      difficulty_rating INTEGER DEFAULT 3 CHECK(difficulty_rating >= 1 AND difficulty_rating <= 5),
      loan_max_loan REAL,
      loan_down_payment REAL,
      loan_monthly_payment REAL,
      tags TEXT,
      images TEXT,
      property_type TEXT CHECK(property_type IN ('commercial', 'residential')),
      profit_potential REAL,
      description TEXT,
      court TEXT,
      case_number TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  database.run(`
    -- Analyses table (AI分析记录)
    CREATE TABLE IF NOT EXISTS analyses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      property_id INTEGER NOT NULL,
      user_id INTEGER,
      ai_predicted_price REAL,
      risk_level TEXT,
      risk_factors TEXT,
      investment_rating REAL,
      recommendations TEXT,
      market_analysis TEXT,
      loan_analysis TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (property_id) REFERENCES properties(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  database.run(`
    -- Favorites table (收藏)
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      property_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id),
      UNIQUE(user_id, property_id)
    );
  `);

  database.run(`
    -- Browse history (浏览历史)
    CREATE TABLE IF NOT EXISTS browse_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      property_id INTEGER NOT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (property_id) REFERENCES properties(id)
    );
  `);

  database.run(`
    -- Recharge orders (充值订单)
    CREATE TABLE IF NOT EXISTS recharge_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      points INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'cancelled')),
      payment_method TEXT,
      order_no TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      paid_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  database.run(`
    -- Password reset codes (密码找回验证码)
    CREATE TABLE IF NOT EXISTS password_reset_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  // Create indexes
  database.run('CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);');
  database.run('CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);');
  database.run('CREATE INDEX IF NOT EXISTS idx_analyses_property ON analyses(property_id);');
  database.run('CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);');
  database.run('CREATE INDEX IF NOT EXISTS idx_browse_history_user ON browse_history(user_id);');

  // Insert sample data if empty
  const result = database.exec('SELECT COUNT(*) as count FROM properties');
  const count = result[0]?.values[0]?.[0] as number || 0;
  
  if (count === 0) {
    insertSampleData(database);
  }
  
  saveDb();
  console.log('📊 Database tables created successfully');
}

function insertSampleData(database: SqlJsDatabase): void {
  const sampleProperties = [
    {
      title: '汤臣一品 顶层复式豪华住宅',
      location: '上海市浦东新区花园石桥路28弄',
      starting_price: 82450000,
      evaluation_price: 110200000,
      ai_predicted_price: 108500000,
      area: 434.5,
      floor: '42 / 55 层',
      built_date: '2019.05.12',
      usage_type: '成套住宅',
      status: 'auctioning',
      time_left: '4天 12小时',
      risk_level: 'low',
      difficulty_rating: 2,
      loan_max_loan: 55000000,
      loan_down_payment: 27450000,
      loan_monthly_payment: 285000,
      tags: JSON.stringify(['产证清晰', '无租赁', '二拍房源']),
      images: JSON.stringify(['https://picsum.photos/seed/tcyp1/1200/800', 'https://picsum.photos/seed/tcyp2/800/600']),
      property_type: 'residential',
      profit_potential: 31.6,
      description: '汤臣一品顶层复式，俯瞰陆家嘴全景',
      court: '上海市浦东新区人民法院',
      case_number: '(2026)沪0115执12345号'
    },
    {
      title: '静安国际金融中心 2201室',
      location: '上海市静安区',
      starting_price: 12400000,
      evaluation_price: 18000000,
      ai_predicted_price: 16500000,
      area: 180.5,
      floor: '22 / 45 层',
      built_date: '2015.08.20',
      usage_type: '办公',
      status: 'auctioning',
      time_left: '2天 08小时',
      risk_level: 'low',
      difficulty_rating: 1,
      loan_max_loan: 8000000,
      loan_down_payment: 4400000,
      loan_monthly_payment: 42000,
      tags: JSON.stringify(['产证清晰', '无租赁', '二拍房源']),
      images: JSON.stringify(['https://picsum.photos/seed/jafc1/1200/800']),
      property_type: 'commercial',
      profit_potential: 32.4,
      description: '核心商务区写字楼',
      court: '上海市静安区人民法院',
      case_number: '(2026)沪0106执54321号'
    },
    {
      title: '滨江花园别墅 12号楼',
      location: '上海市浦东新区',
      starting_price: 8100000,
      evaluation_price: 10000000,
      ai_predicted_price: 9500000,
      area: 260.0,
      floor: '1-3 层',
      built_date: '2010.03.15',
      usage_type: '住宅',
      status: 'auctioning',
      time_left: '5天 04小时',
      risk_level: 'medium',
      difficulty_rating: 4,
      loan_max_loan: 5000000,
      loan_down_payment: 3100000,
      loan_monthly_payment: 26000,
      tags: JSON.stringify(['学区优质', '高溢价区域']),
      images: JSON.stringify(['https://picsum.photos/seed/bjhy1/1200/800']),
      property_type: 'residential',
      profit_potential: 18.2,
      description: '滨江花园别墅区',
      court: '上海市浦东新区人民法院',
      case_number: '(2026)沪0115执98765号'
    },
    {
      title: '中心公园景观公寓 14C',
      location: '上海市黄浦区',
      starting_price: 5200000,
      evaluation_price: 7000000,
      ai_predicted_price: 6500000,
      area: 95.0,
      floor: '14 / 32 层',
      built_date: '2018.11.10',
      usage_type: '住宅',
      status: 'auctioning',
      time_left: '1天 15小时',
      risk_level: 'low',
      difficulty_rating: 2,
      loan_max_loan: 3500000,
      loan_down_payment: 1700000,
      loan_monthly_payment: 18000,
      tags: JSON.stringify(['快速变现', '地铁沿线']),
      images: JSON.stringify(['https://picsum.photos/seed/zxgy1/1200/800']),
      property_type: 'residential',
      profit_potential: 24.5,
      description: '黄浦区核心地段',
      court: '上海市黄浦区人民法院',
      case_number: '(2026)沪0101执11111号'
    }
  ];

  for (const property of sampleProperties) {
    database.run(`
      INSERT INTO properties (
        title, location, starting_price, evaluation_price, ai_predicted_price,
        area, floor, built_date, usage_type, status, time_left,
        risk_level, difficulty_rating, loan_max_loan, loan_down_payment, loan_monthly_payment,
        tags, images, property_type, profit_potential, description, court, case_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      property.title, property.location, property.starting_price, property.evaluation_price, property.ai_predicted_price,
      property.area, property.floor, property.built_date, property.usage_type, property.status, property.time_left,
      property.risk_level, property.difficulty_rating, property.loan_max_loan, property.loan_down_payment, property.loan_monthly_payment,
      property.tags, property.images, property.property_type, property.profit_potential, property.description, property.court, property.case_number
    ]);
  }
  
  console.log('📊 Sample data inserted');
}

// Helper functions for sql.js
export function dbRun(sql: string, params: any[] = []): void {
  const database = getDb();
  database.run(sql, params);
  saveDb();
}

export function dbGet(sql: string, params: any[] = []): any {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

export function dbAll(sql: string, params: any[] = []): any[] {
  const database = getDb();
  const stmt = database.prepare(sql);
  stmt.bind(params);
  const results: any[] = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function dbExec(sql: string): void {
  const database = getDb();
  database.run(sql);
  saveDb();
}
