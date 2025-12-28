/**
 * @file Service for proxying authentication requests to the auth-service.
 * @module gateway-service/auth-proxy
 */

import { HttpError } from '@chatapp/common';
import axios from 'axios';
import { env } from '@/config/env';

/**
 * Axios client configured for the authentication service.
 */
const client = axios.create({
  baseURL: env.AUTH_SERVICE_URL,
  timeout: 5000,
});

/**
 * Constant headers for internal authentication with the auth-service.
 */
const authHeader = {
  headers: {
    'x-internal-token': env.INTERNAL_API_TOKEN,
  },
} as const;

/**
 * Represents the structure of authentication tokens.
 */
export interface AuthTokens {
  /** The access token for authenticating requests. */
  accessToken: string;
  /** The refresh token for obtaining new access tokens. */
  refreshToken: string;
}

/**
 * Represents the structure of user data returned from the auth service.
 */
export interface UserData {
  /** The unique identifier for the user. */
  id: string;
  /** The user's email address. */
  email: string;
  /** The user's display name. */
  displayName: string;
  /** The timestamp when the user was created. */
  createdAt: string;
}

/**
 * Represents the complete authentication response, including tokens and user data.
 */
export interface AuthResponse extends AuthTokens {
  /** The authenticated user's data. */
  user: UserData;
}

/**
 * Payload for the user registration endpoint.
 */
export interface RegisterPayload {
  /** The email for the new user. */
  email: string;
  /** The password for the new user. */
  password: string;
  /** The display name for the new user. */
  displayName: string;
}

/**
 * Payload for the user login endpoint.
 */
export interface LoginPayload {
  /** The user's email. */
  email: string;
  /** The user's password. */
  password: string;
}

/**
 * Payload for the token refresh endpoint.
 */
export interface RefreshPayload {
  /** The refresh token to be used for generating new tokens. */
  refreshToken: string;
}

/**
 * Payload for the token revocation endpoint.
 */
export interface RevokePayload {
  /** The ID of the user whose tokens should be revoked. */
  userId: string;
}

/**
 * Resolves a user-friendly error message from an Axios error response.
 * @param status - The HTTP status code of the error response.
 * @param data - The data from the error response.
 * @returns A user-friendly error message string.
 */
const resolvedMessage = (status: number, data: unknown): string => {
  if (typeof data === 'object' && data && 'message' in data) {
    const message = (data as Record<string, unknown>)['message'];
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return status >= 500
    ? 'Authentication service is unavailable'
    : 'An error occurred while processing the request';
};

/**
 * Handles Axios errors by converting them into `HttpError` instances.
 * This ensures consistent error handling for requests to the auth service.
 * @param error - The error caught from an Axios request.
 * @throws {HttpError} Throws an `HttpError` with a status and message derived from the Axios error.
 */
const handleAxiosError = (error: unknown): never => {
  if (!axios.isAxiosError(error) || !error.response) {
    throw new HttpError(500, 'Authentication service is unavailable');
  }

  const { status, data } = error.response as { status: number; data: unknown };

  throw new HttpError(status, resolvedMessage(status, data));
};

/**
 * A proxy service for interacting with the authentication microservice.
 * It abstracts the logic of making HTTP requests and handling errors.
 */
export const authProxyService = {
  /**
   * Sends a registration request to the auth service.
   * @param payload - The registration data.
   * @returns A promise that resolves with the authentication response.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await client.post<AuthResponse>('/auth/register', payload, authHeader);
      return response.data;
    } catch (error) {
      return handleAxiosError(error);
    }
  },
};
