import { EventPayload, OutboundEvent } from 'packages/common/src/events/event-types';

export const AUTH_EVENT_EXCHANGE = 'auth.events';
export const AUTH_USER_REGISTERED_ROUTING_KEY = 'auth.user.registered';

export interface AuthUserRegisteredPayload extends EventPayload {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export type AuthRegisterEvent = OutboundEvent<
  typeof AUTH_USER_REGISTERED_ROUTING_KEY,
  AuthUserRegisteredPayload
>;
