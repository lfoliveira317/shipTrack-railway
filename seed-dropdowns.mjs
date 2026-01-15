import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

console.log('\n=== Seeding Dropdown Reference Data ===\n');

// Create database connection
const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

// Comprehensive reference data
const suppliersData = [
  'Acme Manufacturing Co.',
  'Global Supplies Inc.',
  'Pacific Trading Company',
  'Eastern Imports Ltd.',
  'Westside Wholesale',
  'Northern Distributors',
  'Southern Exports LLC',
  'Central Manufacturing',
  'Metro Suppliers',
  'Coastal Trading Partners',
  'Mountain View Imports',
  'Riverside Manufacturing',
  'Summit Trading Co.',
  'Valley Wholesale Group',
  'Harbor Imports Inc.',
  'Skyline Exports Ltd.',
  'Horizon Trading Company',
  'Pioneer Suppliers',
  'Gateway Manufacturing',
  'Crossroads Distributors',
];

const carriersData = [
  'Maersk Line',
  'MSC (Mediterranean Shipping Company)',
  'CMA CGM',
  'COSCO Shipping',
  'Hapag-Lloyd',
  'ONE (Ocean Network Express)',
  'Evergreen Line',
  'Yang Ming Marine Transport',
  'HMM (Hyundai Merchant Marine)',
  'ZIM Integrated Shipping',
  'PIL (Pacific International Lines)',
  'Wan Hai Lines',
  'OOCL (Orient Overseas Container Line)',
  'APL (American President Lines)',
  'Matson Navigation',
  'Hamburg Süd',
  'K Line',
  'MOL (Mitsui O.S.K. Lines)',
  'NYK Line',
  'Zim',
];

const portsData = [
  // Major Asian Ports
  { name: 'Shanghai, China', code: 'CNSHA', type: 'loading' },
  { name: 'Shenzhen, China', code: 'CNSZX', type: 'loading' },
  { name: 'Ningbo-Zhoushan, China', code: 'CNNGB', type: 'loading' },
  { name: 'Guangzhou, China', code: 'CNGZH', type: 'loading' },
  { name: 'Qingdao, China', code: 'CNTAO', type: 'loading' },
  { name: 'Tianjin, China', code: 'CNTXG', type: 'loading' },
  { name: 'Hong Kong', code: 'HKHKG', type: 'loading' },
  { name: 'Singapore', code: 'SGSIN', type: 'loading' },
  { name: 'Busan, South Korea', code: 'KRPUS', type: 'loading' },
  { name: 'Tokyo, Japan', code: 'JPTYO', type: 'loading' },
  { name: 'Yokohama, Japan', code: 'JPYOK', type: 'loading' },
  { name: 'Kaohsiung, Taiwan', code: 'TWKHH', type: 'loading' },
  { name: 'Ho Chi Minh City, Vietnam', code: 'VNSGN', type: 'loading' },
  { name: 'Bangkok, Thailand', code: 'THBKK', type: 'loading' },
  { name: 'Manila, Philippines', code: 'PHMNL', type: 'loading' },
  { name: 'Jakarta, Indonesia', code: 'IDJKT', type: 'loading' },
  
  // Major North American Ports
  { name: 'Los Angeles, CA, USA', code: 'USLAX', type: 'discharge' },
  { name: 'Long Beach, CA, USA', code: 'USLGB', type: 'discharge' },
  { name: 'New York/New Jersey, USA', code: 'USNYC', type: 'discharge' },
  { name: 'Savannah, GA, USA', code: 'USSAV', type: 'discharge' },
  { name: 'Houston, TX, USA', code: 'USHOU', type: 'discharge' },
  { name: 'Seattle, WA, USA', code: 'USSEA', type: 'discharge' },
  { name: 'Oakland, CA, USA', code: 'USOAK', type: 'discharge' },
  { name: 'Charleston, SC, USA', code: 'USCHS', type: 'discharge' },
  { name: 'Norfolk, VA, USA', code: 'USORF', type: 'discharge' },
  { name: 'Miami, FL, USA', code: 'USMIA', type: 'discharge' },
  { name: 'Vancouver, BC, Canada', code: 'CAVAN', type: 'discharge' },
  { name: 'Montreal, QC, Canada', code: 'CAMTR', type: 'discharge' },
  
  // Major European Ports
  { name: 'Rotterdam, Netherlands', code: 'NLRTM', type: 'discharge' },
  { name: 'Antwerp, Belgium', code: 'BEANR', type: 'discharge' },
  { name: 'Hamburg, Germany', code: 'DEHAM', type: 'discharge' },
  { name: 'Felixstowe, UK', code: 'GBFXT', type: 'discharge' },
  { name: 'Southampton, UK', code: 'GBSOU', type: 'discharge' },
  { name: 'Le Havre, France', code: 'FRLEH', type: 'discharge' },
  { name: 'Barcelona, Spain', code: 'ESBCN', type: 'discharge' },
  { name: 'Valencia, Spain', code: 'ESVLC', type: 'discharge' },
  { name: 'Genoa, Italy', code: 'ITGOA', type: 'discharge' },
  { name: 'Piraeus, Greece', code: 'GRPIR', type: 'discharge' },
  
  // Middle East & Africa
  { name: 'Dubai, UAE', code: 'AEDXB', type: 'discharge' },
  { name: 'Jebel Ali, UAE', code: 'AEJEA', type: 'discharge' },
  { name: 'Port Said, Egypt', code: 'EGPSD', type: 'discharge' },
  { name: 'Durban, South Africa', code: 'ZADUR', type: 'discharge' },
  
  // South America
  { name: 'Santos, Brazil', code: 'BRSSZ', type: 'discharge' },
  { name: 'Buenos Aires, Argentina', code: 'ARBUE', type: 'discharge' },
  
  // Australia & Oceania
  { name: 'Sydney, Australia', code: 'AUSYD', type: 'discharge' },
  { name: 'Melbourne, Australia', code: 'AUMEL', type: 'discharge' },
  { name: 'Auckland, New Zealand', code: 'NZAKL', type: 'discharge' },
];

const statusesData = [
  'Pending',
  'Booked',
  'In transit',
  'Loaded',
  'Departed',
  'At sea',
  'Arrived at port',
  'Customs clearance',
  'Out for delivery',
  'Delivered',
  'Delayed',
  'On hold',
  'Cancelled',
];

try {
  // Seed Suppliers
  console.log('Seeding suppliers...');
  for (const supplierName of suppliersData) {
    await connection.execute(
      'INSERT IGNORE INTO suppliers (name) VALUES (?)',
      [supplierName]
    );
  }
  const [suppliersResult] = await connection.execute('SELECT COUNT(*) as count FROM suppliers');
  console.log(`✅ Suppliers: ${suppliersResult[0].count} records`);

  // Seed Carriers
  console.log('Seeding carriers...');
  for (const carrierName of carriersData) {
    await connection.execute(
      'INSERT IGNORE INTO carriers (name) VALUES (?)',
      [carrierName]
    );
  }
  const [carriersResult] = await connection.execute('SELECT COUNT(*) as count FROM carriers');
  console.log(`✅ Carriers: ${carriersResult[0].count} records`);

  // Seed Ports
  console.log('Seeding ports...');
  for (const port of portsData) {
    await connection.execute(
      'INSERT IGNORE INTO ports (name, code, type) VALUES (?, ?, ?)',
      [port.name, port.code, port.type]
    );
  }
  const [portsResult] = await connection.execute('SELECT COUNT(*) as count FROM ports');
  console.log(`✅ Ports: ${portsResult[0].count} records`);

  console.log('\n=== Seeding Complete ===');
  console.log(`Total suppliers: ${suppliersResult[0].count}`);
  console.log(`Total carriers: ${carriersResult[0].count}`);
  console.log(`Total ports: ${portsResult[0].count}`);
  console.log('\nAll dropdown reference data has been populated successfully!');

} catch (error) {
  console.error('\n❌ Error seeding data:', error);
  process.exit(1);
} finally {
  await connection.end();
}
