import { BaseEvent } from '../base/base.event';

/**
 * User registered event
 */
export interface UserRegisteredEvent extends BaseEvent {
  eventType: 'auth.user.registered';
  payload: {
    userId: string;
    phone?: string;
    email?: string;
    referralCode?: string;
    deviceId: string;
    ipAddress: string;
  };
}

/**
 * User login event
 */
export interface UserLoginEvent extends BaseEvent {
  eventType: 'auth.user.login';
  payload: {
    userId: string;
    deviceId: string;
    ipAddress: string;
    loginMethod: 'phone' | 'email';
  };
}

/**
 * User logout event
 */
export interface UserLogoutEvent extends BaseEvent {
  eventType: 'auth.user.logout';
  payload: {
    userId: string;
    sessionId: string;
    deviceId: string;
  };
}

/**
 * Session created event
 */
export interface SessionCreatedEvent extends BaseEvent {
  eventType: 'auth.session.created';
  payload: {
    sessionId: string;
    userId: string;
    deviceId: string;
    expiresAt: string;
  };
}

/**
 * Session revoked event
 */
export interface SessionRevokedEvent extends BaseEvent {
  eventType: 'auth.session.revoked';
  payload: {
    sessionId: string;
    userId: string;
    reason: 'logout' | 'expired' | 'security' | 'admin';
  };
}
