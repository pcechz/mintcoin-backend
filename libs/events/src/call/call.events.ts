import { BaseEvent } from '../base/base.event';

/**
 * Call initiated event
 */
export interface CallInitiatedEvent extends BaseEvent {
  eventType: 'call.initiated';
  payload: {
    callId: string;
    callerId: string;
    calleeId: string;
    type: 'audio' | 'video';
  };
}

/**
 * Call started event
 */
export interface CallStartedEvent extends BaseEvent {
  eventType: 'call.started';
  payload: {
    callId: string;
    callerId: string;
    calleeId: string;
    startTime: string;
    ratePerMinute: number;
  };
}

/**
 * Call ended event
 */
export interface CallEndedEvent extends BaseEvent {
  eventType: 'call.ended';
  payload: {
    callId: string;
    callerId: string;
    calleeId: string;
    endTime: string;
    duration: number;
    totalCoinsCharged: number;
    totalEarned: number;
    endReason: 'user_disconnect' | 'insufficient_funds' | 'timeout' | 'error';
  };
}

/**
 * Call billing tick event (fired every 10-30 seconds during call)
 */
export interface CallBillingTickEvent extends BaseEvent {
  eventType: 'call.billing.tick';
  payload: {
    callId: string;
    callerId: string;
    calleeId: string;
    coinsDeducted: number;
    remainingBalance: number;
    elapsedSeconds: number;
  };
}

/**
 * Call insufficient funds event
 */
export interface CallInsufficientFundsEvent extends BaseEvent {
  eventType: 'call.billing.insufficient_funds';
  payload: {
    callId: string;
    callerId: string;
    calleeId: string;
    requiredCoins: number;
    availableCoins: number;
    elapsedSeconds: number;
  };
}
