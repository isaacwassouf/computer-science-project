import { mysqlTable, bigint, varchar, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
	fullName: varchar('full_name', { length: 256 }),
	email: varchar('email', { length: 256 }).unique(),
	image_url: text('image_url'),
	created_at: bigint('created_at', { mode: 'number' }).notNull()
});
