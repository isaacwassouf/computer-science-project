import { mysqlTable, bigint, varchar, text } from 'drizzle-orm/mysql-core';

export const users = mysqlTable('users', {
	id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
	name: varchar('name', { length: 256 }).notNull(),
	email: varchar('email', { length: 256 }).unique().notNull(),
	image_url: text('image_url')
});
