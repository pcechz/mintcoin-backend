import { BaseEvent } from '../base/base.event';

/**
 * Room message sent event
 * Messages sent in group chat rooms
 */
export interface RoomMessageSentEvent extends BaseEvent {
  eventType: 'room.message.sent';
  payload: {
    messageId: string;
    roomId: string;
    senderId: string;
    content: string;
    messageType: 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'gif';
    mediaUrl?: string;
    replyToMessageId?: string;
  };
}

/**
 * Room message deleted event
 */
export interface RoomMessageDeletedEvent extends BaseEvent {
  eventType: 'room.message.deleted';
  payload: {
    messageId: string;
    roomId: string;
    deletedBy: string;
  };
}

/**
 * User typing in room event
 */
export interface RoomUserTypingEvent extends BaseEvent {
  eventType: 'room.user.typing';
  payload: {
    roomId: string;
    userId: string;
    isTyping: boolean;
  };
}

/**
 * Room member role changed event (admin, moderator, member)
 */
export interface RoomMemberRoleChangedEvent extends BaseEvent {
  eventType: 'room.member.role_changed';
  payload: {
    roomId: string;
    userId: string;
    oldRole: 'host' | 'admin' | 'moderator' | 'member';
    newRole: 'host' | 'admin' | 'moderator' | 'member';
    changedBy: string;
  };
}
