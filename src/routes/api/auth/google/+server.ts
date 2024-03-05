import type { RequestHandler } from '../$types';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT } from '$env/static/private';
import {PUBLIC_GOOGLE_OPENID_CONFIG_URL, PUBLIC_FALLBACK_GOOGLE_AUTHORIZATION_ENDPOINT } from '$env/static/public';

export const GET: RequestHandler = async ({fetch}) => {
	// discover the google auth URL
	const googleOpenIDConfigURL = new URL(PUBLIC_GOOGLE_OPENID_CONFIG_URL);
	const googleOpenIDConfigResponse = await fetch(googleOpenIDConfigURL.toString());
	const googleOpenIDConfigData = await googleOpenIDConfigResponse.json();

	// create an arbitrary state
	const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	// get the auth URL
	const googleAuthorizationURL = new URL(googleOpenIDConfigData?.authorization_endpoint ?? PUBLIC_FALLBACK_GOOGLE_AUTHORIZATION_ENDPOINT); 
	googleAuthorizationURL.searchParams.append('client_id', GOOGLE_CLIENT_ID);
	googleAuthorizationURL.searchParams.append('redirect_uri', GOOGLE_REDIRECT);
	googleAuthorizationURL.searchParams.append('response_type', 'code');
	googleAuthorizationURL.searchParams.append('scope', 'openid profile email');
	googleAuthorizationURL.searchParams.append('state', state);

	return new Response(JSON.stringify({
		url: googleAuthorizationURL.toString(),
	}), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'set-cookie': `state=${state}; Path=/api/auth/google/callback; HttpOnly; SameSite=Lax; Max-Age=600;`,
		},
	});
};