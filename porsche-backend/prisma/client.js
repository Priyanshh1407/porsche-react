import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const connectionString = process.env.DATABASE_URL;
// connectionTimeoutMillis: pg waits forever for a connection by default, so an unreachable
// database would hang every request (and /ready) instead of failing fast (ERR-02).
// TimeZone=UTC: timestamps are stored as UTC without a zone, and raw SQL compares them with now(),
// which Postgres evaluates in the session time zone. A server set to local time (e.g. a default
// Windows install) would shift leases, retries and analytics windows by hours.
export const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000, options: '-c TimeZone=UTC' });
// A dropped idle connection (database restart, failover, network blip) is emitted as 'error' on the
// pool. Unhandled, Node treats it as fatal and the whole API crashed; logged, pg simply opens a new
// connection for the next query.
pool.on('error', (err) => console.error('Idle database connection lost:', err.message));
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
