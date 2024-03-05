import { db } from '$lib/db/db';
import { users } from '$lib/db/schema';
import type { User } from '$lib/db/types';
import type { JwtPayload } from 'jsonwebtoken';

export const handleDatabaseInsertion = async (payload: JwtPayload) => {
	// check if the user already exists in the database
	const user: User = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.email, payload.email)
	});

	// if the user does not exist, insert it into the database
	if (!user) {
		await db.insert(users).values({
			email: payload.email,
			image_url: payload.picture,
			name: payload.name
		});
	}
};
