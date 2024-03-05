import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exchangeCodeWithTokens, verifyIDToken } from '$lib/utils/google-oidc';
import type { JwtPayload } from 'jsonwebtoken';

export const GET: RequestHandler = async ({ cookies, url }) => {
	// get the code and state from the query string
	const code = url.searchParams.get('code') ?? '';
	const state = url.searchParams.get('state');
	// get the state from the cookie
	const cookieState = cookies.get('state');

	// check if the state returned is the same as the one in the cookie
	if (state !== cookieState) {
		error(403, 'Invalid state');
	}

    // exchange the code for tokens
    const tokens = await exchangeCodeWithTokens(code);

    // verify the id token
    const payload: JwtPayload = await verifyIDToken(tokens.id_token);
    
    return new Response('Hello, world!');
};