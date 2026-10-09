import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config({ quiet: true });

const connectionString = process.env.DATABASE_URL;
// connectionTimeoutMillis: pg waits forever for a connection by default, so an unreachable
// database would hang every request (and /ready) instead of failing fast (ERR-02).
const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export default prisma;
