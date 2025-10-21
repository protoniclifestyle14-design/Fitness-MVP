import { Pool } from 'pg';
import mockPool from './mock-pool';

// Use mock pool if DATABASE_URL is not set or USE_MOCK_DB is true
const useMockDb = !process.env.DATABASE_URL || process.env.USE_MOCK_DB === 'true';

let pool: any;

if (useMockDb) {
  console.log('⚠️  Using MOCK database (no real database connection)');
  pool = mockPool;
} else {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database error:', err);
    process.exit(-1);
  });
}

export default pool;