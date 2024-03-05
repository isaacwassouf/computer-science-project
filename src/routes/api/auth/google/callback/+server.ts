import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	PUBLIC_GOOGLE_OPENID_CONFIG_URL,
	PUBLIC_FALLBACK_GOOGLE_TOKEN_ENDPOINT,
	PUBLIC_FALLBACK_GOOGLE_JWKS_URL,
	PUBLIC_GOOGLE_ID_TOKEN_ISSUER
} from '$env/static/public';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import jwksClient, { JwksClient, type SigningKey } from 'jwks-rsa';
import jwt, { type JwtHeader, type JwtPayload, type SigningKeyCallback } from 'jsonwebtoken';

interface TokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
	id_token: string;
}

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
	console.log(payload.name);

	return new Response('Hello, world!');
};

/**
 * Discover the Google token endpoint
 *
 * @returns {Promise<URL>} The Google token endpoints
 */
const discoverTokenEndpoint = async (): Promise<URL> => {
	try {
		const googleOpenIDConfigURL = new URL(PUBLIC_GOOGLE_OPENID_CONFIG_URL);
		// fetch the google openID config
		const googleOpenIDConfigResponse = await fetch(googleOpenIDConfigURL.toString());

		// if the request fails, use the fallback token endpoint
		if (!googleOpenIDConfigResponse.ok) {
			throw new Error('Failed to fetch Google OpenID config');
		}

		// parse the response to json
		const googleOpenIDConfigData = await googleOpenIDConfigResponse.json();

		return new URL(googleOpenIDConfigData?.token_endpoint ?? PUBLIC_FALLBACK_GOOGLE_TOKEN_ENDPOINT);
	} catch (e) {
		return new URL(PUBLIC_FALLBACK_GOOGLE_TOKEN_ENDPOINT);
	}
};

/**
 * Exchange the code for tokens
 *
 * @param code
 * @returns Promise<TokenResponse>
 */
const exchangeCodeWithTokens = async (code: string): Promise<TokenResponse> => {
	// discover the google token endpoint
	const googleTokenEndpoint = await discoverTokenEndpoint();
	// prepare the request body data to suite application/x-www-form-urlencoded
	const requestBody = new URLSearchParams();
	// append the required data
	requestBody.append('code', code);
	requestBody.append('client_id', GOOGLE_CLIENT_ID);
	requestBody.append('client_secret', GOOGLE_CLIENT_SECRET);
	requestBody.append('redirect_uri', GOOGLE_REDIRECT);
	requestBody.append('grant_type', 'authorization_code');

	const tokenRequest = await fetch(googleTokenEndpoint.toString(), {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded'
		},
		body: requestBody
	});

	if (!tokenRequest.ok) {
		error(400, 'Failed to exchange the code for the tokens');
	}

	return await tokenRequest.json();
};

/**
 * Discover the Google token endpoint
 *
 * @returns {Promise<URL>} The Google token endpoints
 */
const discoverJwksUrl = async (): Promise<URL> => {
	try {
		const googleOpenIDConfigURL = new URL(PUBLIC_GOOGLE_OPENID_CONFIG_URL);
		// fetch the google openID config
		const googleOpenIDConfigResponse = await fetch(googleOpenIDConfigURL.toString());

		// if the request fails, use the fallback token endpoint
		if (!googleOpenIDConfigResponse.ok) {
			throw new Error('Failed to fetch Google OpenID config');
		}

		// parse the response to json
		const googleOpenIDConfigData = await googleOpenIDConfigResponse.json();

		return new URL(googleOpenIDConfigData?.jwks_uri ?? PUBLIC_FALLBACK_GOOGLE_JWKS_URL);
	} catch (e) {
		return new URL(PUBLIC_FALLBACK_GOOGLE_JWKS_URL);
	}
};

const getIDTokenIssuerOptions = (): string[] => {
	return PUBLIC_GOOGLE_ID_TOKEN_ISSUER.split(',');
};

const validateIDTokenSignature = async (idToken: string): Promise<JwtPayload> => {
	const jwksUrl = await discoverJwksUrl();

	// create a jwks client
	const client: JwksClient = jwksClient({
		jwksUri: jwksUrl.toString()
	});

	const getKey = (header: JwtHeader, callback: SigningKeyCallback) => {
		client.getSigningKey(header.kid, (err: Error | null, key?: SigningKey) => {
			const signingKey = key?.getPublicKey() || key?.getPublicKey();
			callback(err, signingKey);
		});
	};

	return new Promise((resolve, reject) => {
		jwt.verify(idToken, getKey, (err, decoded) => {
			if (err) {
				reject(err);
			}
			resolve(decoded as JwtPayload);
		});
	});
};

/**
 * Verify the ID token
 *
 * @param idToken
 * @returns Promise<JwtPayload>
 */
const verifyIDToken = async (idToken: string): Promise<JwtPayload> => {
	// validate the signature
	const payload = await validateIDTokenSignature(idToken);
	console.log(payload);

	// verify the issuer claim
	const idTokenIssuerOptions = getIDTokenIssuerOptions();
	if (!idTokenIssuerOptions.includes(payload?.iss ?? '')) {
		error(401, 'Invalid ID token issuer');
	}

	// verify the audience claim
	if (payload.aud !== GOOGLE_CLIENT_ID) {
		error(401, 'Invalid ID token audience');
	}

	// verify the expiration time
	if ((payload?.exp ?? 0) < Math.floor(Date.now() / 1000)) {
		error(401, 'Expired ID token');
	}

	return payload;
};
