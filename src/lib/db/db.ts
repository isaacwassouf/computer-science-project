import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { DB_DATABASE, DB_PASSWORD, DB_USERNAME, DB_HOST } from '$env/static/private';
import * as schema from '$lib/db/schema';

export const connection = await mysql.createConnection({
	host: DB_HOST,
	user: DB_USERNAME,
	database: DB_DATABASE,
	password: DB_PASSWORD,
	multipleStatements: true
});

export const db = drizzle(connection, { schema, mode: 'default' });
