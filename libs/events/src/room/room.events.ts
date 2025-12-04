import { BaseEvent } from '../base/base.event';

/**
 * Room created event
 * Rooms are chat-based group rooms (like 2go) where multiple users can chat together
 * Not to be confused with audio/video calls which are handled by Call Service
 */
export interface RoomCreatedEvent extends BaseEvent {
  eventType: 'room.created';
  payload: {
    roomId: string;
    hostId: string;
    title: string;
    description?: string;
    category?: string;
    visibility: 'public' | 'private';
    isPaid: boolean;
    entryFeeCoins?: number;
    maxParticipants?: number;
  };
}

/**
 * Room started event
 */
export interface RoomStartedEvent extends BaseEvent {
  eventType: 'room.started';
  payload: {
    roomId: string;
    hostId: string;
    startTime: string;
  };
}

/**
 * Room ended event
 */
export interface RoomEndedEvent extends BaseEvent {
  eventType: 'room.ended';
  payload: {
    roomId: string;
    hostId: string;
    endTime: string;
    duration: number;
    totalParticipants: number;
    totalRevenue: number;
  };
}

/**
 * Room joined event
 */
export interface RoomJoinedEvent extends BaseEvent {
  eventType: 'room.joined';
  payload: {
    roomId: string;
    userId: string;
    joinTime: string;
    paidEntry: boolean;
    amountPaid?: number;
  };
}

/**
 * Room left event
 */
export interface RoomLeftEvent extends BaseEvent {
  eventType: 'room.left';
  payload: {
    roomId: string;
    userId: string;
    leaveTime: string;
    duration: number;
  };
}
