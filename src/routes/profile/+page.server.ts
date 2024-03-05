import { JWT_SECRET } from '$env/static/private';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import jwt from 'jsonwebtoken';

export const load: PageServerLoad = ({ cookies }) => {
	const userToken = cookies.get('userToken');

	if (!userToken) {
		redirect(304, '/auth');
	}

	// decode the user token
	const user = jwt.verify(userToken, JWT_SECRET);

	return { user };
};
