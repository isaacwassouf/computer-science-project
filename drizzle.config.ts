import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	driver: 'mysql2',
	dbCredentials: {
		host: process.env.DB_HOST ?? 'localhost',
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE ?? 'database'
	}
} satisfies Config;
