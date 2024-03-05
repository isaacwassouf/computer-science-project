import {
	PUBLIC_GOOGLE_OIDC_CONFIG_URL,
	PUBLIC_GOOGLE_ID_TOKEN_ISSUER,
    PUBLIC_FALLBACK_GOOGLE_JWKS_URL,
    PUBLIC_FALLBACK_GOOGLE_TOKEN_ENDPOINT,
} from '$env/static/public';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT, GOOGLE_CLIENT_SECRET } from '$env/static/private';
import jwksClient, { JwksClient, type SigningKey } from 'jwks-rsa';
import jwt, { type JwtHeader, type JwtPayload, type SigningKeyCallback } from 'jsonwebtoken';
import { error } from '@sveltejs/kit';

interface TokenResponse {
	access_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
	id_token: string;
}

export const getGoogleOIDCAttributeURL = async (attribute: string, fallback:string): Promise<URL> => {
	try {
        // the google openID config discovery URL
		const googleOpenIDConfigURL = new URL(PUBLIC_GOOGLE_OIDC_CONFIG_URL);
		// fetch the google openID config
		const googleOpenIDConfigResponse = await fetch(googleOpenIDConfigURL.toString());

		// if the request fails, use the fallback token endpoint
		if (!googleOpenIDConfigResponse.ok) {
			error(401, 'Failed to fetch Google OpenID config');
		}

		// parse the response to json
		const googleOpenIDConfigData = await googleOpenIDConfigResponse.json();

		return new URL(googleOpenIDConfigData?.[attribute] ?? fallback);
	} catch (e) {
		return new URL(fallback);
	}
};

export const validateIDTokenSignature = async (idToken: string): Promise<JwtPayload> => {
	const jwksUrl = await getGoogleOIDCAttributeURL('jwks_uri', PUBLIC_FALLBACK_GOOGLE_JWKS_URL);

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

export const getIDTokenIssuerOptions = (): string[] => {
	return PUBLIC_GOOGLE_ID_TOKEN_ISSUER.split(',');
};

export const verifyIDToken = async (idToken: string): Promise<JwtPayload> => {
	// validate the signature
	const payload = await validateIDTokenSignature(idToken);

	// verify the issuer claim
	const idTokenIssuerOptions = getIDTokenIssuerOptions();
	if (!idTokenIssuerOptions.includes(payload?.iss ?? '')) {
		error(403, 'Invalid ID token issuer');
	}

	// verify the audience claim
	if (payload.aud !== GOOGLE_CLIENT_ID) {
		error(403, 'Invalid ID token audience');
	}

	// verify the expiration time
	if ((payload?.exp ?? 0) < Math.floor(Date.now() / 1000)) {
		error(403, 'Expired ID token');
	}

	return payload;
};

export const exchangeCodeWithTokens = async (code: string): Promise<TokenResponse> => {
	// discover the google token endpoint
	const googleTokenEndpoint = await getGoogleOIDCAttributeURL('token_endpoint', PUBLIC_FALLBACK_GOOGLE_TOKEN_ENDPOINT);
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
		error(401, 'Failed to exchange the code for the tokens');
	}

	return await tokenRequest.json();
};
