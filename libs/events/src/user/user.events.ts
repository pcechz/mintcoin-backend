import { BaseEvent } from '../base/base.event';

/**
 * User profile created event
 */
export interface UserProfileCreatedEvent extends BaseEvent {
  eventType: 'user.profile.created';
  payload: {
    userId: string;
    username: string;
    name: string;
    gender?: string;
    ageBracket?: string;
  };
}

/**
 * User profile updated event
 */
export interface UserProfileUpdatedEvent extends BaseEvent {
  eventType: 'user.profile.updated';
  payload: {
    userId: string;
    updatedFields: string[];
    changes: Record<string, any>;
  };
}

/**
 * User status changed event
 */
export interface UserStatusChangedEvent extends BaseEvent {
  eventType: 'user.status.changed';
  payload: {
    userId: string;
    oldStatus: string;
    newStatus: string;
    reason?: string;
  };
}

/**
 * User suspended event
 */
export interface UserSuspendedEvent extends BaseEvent {
  eventType: 'user.suspended';
  payload: {
    userId: string;
    reason: string;
    suspendedBy: string;
    suspendedUntil?: string;
  };
}

/**
 * User banned event
 */
export interface UserBannedEvent extends BaseEvent {
  eventType: 'user.banned';
  payload: {
    userId: string;
    reason: string;
    bannedBy: string;
    permanent: boolean;
  };
}
