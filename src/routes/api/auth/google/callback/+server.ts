import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {PUBLIC_GOOGLE_OPENID_CONFIG_URL, PUBLIC_FALLBACK_GOOGLE_TOKEN_ENDPOINT} from '$env/static/public';
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT, GOOGLE_CLIENT_SECRET } from '$env/static/private';

interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
    scope: string;
    id_token: string;
}

export const GET: RequestHandler = async ({cookies, url}) => {
    // get the code and state from the query string
    const code= url.searchParams.get('code') ?? '';
    const state = url.searchParams.get('state');
    // get the state from the cookie
    const cookieState = cookies.get('state');

    // check if the state returned is the same as the one in the cookie
    if (state !== cookieState) {
        error(403, 'Invalid state');
    }

    // exchange the code for tokens
    const tokens = await exchangeCodeWithTokens(code);

    return new Response('Hello, world!');
};

/**
 * Discover the Google token endpoint
 * 
 * @returns {Promise<URL>} The Google token endpoints
 */
const discoverTokenEndpoint = async (): Promise<URL> => {
    try{
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
    }catch(e){
        return new URL(PUBLIC_FALLBACK_GOOGLE_TOKEN_ENDPOINT);
    }
}

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
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestBody,
    });

    if (!tokenRequest.ok) {
        error(400, 'Failed to exchange the code for the tokens');
    }

    return await tokenRequest.json();
}