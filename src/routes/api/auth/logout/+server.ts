import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
	cookies.delete('userToken', { path: '/' });

	return new Response('Logged out', { status: 200, statusText: 'OK' });
};
