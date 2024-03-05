import { migrate } from 'drizzle-orm/mysql2/migrator';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function main() {
	const connection = await mysql.createConnection({
		host: process.env.DB_HOST ?? 'localhost',
		user: process.env.DB_USERNAME,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE ?? 'database',
		multipleStatements: true
	});

	const db = drizzle(connection);

	console.log('Running migrations');

	await migrate(db, { migrationsFolder: './drizzle' });

	console.log('Migrated successfully');

	await connection.end();

	process.exit(0);
}

main().catch((e) => {
	console.error('Migration failed');
	console.error(e);
	process.exit(1);
});
