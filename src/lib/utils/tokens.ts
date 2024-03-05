import type { User } from '$lib/db/types';
import { JWT_SECRET } from '$env/static/private';
import jwt from 'jsonwebtoken';

export const createUserToken = (data: User): string => {
	return jwt.sign(JSON.stringify(data), JWT_SECRET);
};
