import { BaseEvent } from '../base/base.event';

/**
 * Gift sent event
 */
export interface GiftSentEvent extends BaseEvent {
  eventType: 'gift.sent';
  payload: {
    giftId: string;
    senderId: string;
    receiverId: string;
    giftType: string;
    costCoins: number;
    context: {
      type: 'livestream' | 'chat' | 'profile';
      contextId: string;
    };
    animationUrl?: string;
  };
}

/**
 * Gift received event
 */
export interface GiftReceivedEvent extends BaseEvent {
  eventType: 'gift.received';
  payload: {
    giftId: string;
    receiverId: string;
    senderId: string;
    giftType: string;
    earningsCoins: number;
    platformCommission: number;
  };
}

/**
 * Gift combo triggered event
 */
export interface GiftComboTriggeredEvent extends BaseEvent {
  eventType: 'gift.combo.triggered';
  payload: {
    comboId: string;
    senderId: string;
    receiverId: string;
    giftType: string;
    comboCount: number;
    totalCoins: number;
    bonusMultiplier: number;
  };
}
