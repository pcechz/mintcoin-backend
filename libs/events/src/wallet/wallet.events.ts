import { BaseEvent } from '../base/base.event';

/**
 * Coins purchased event
 */
export interface CoinsPurchasedEvent extends BaseEvent {
  eventType: 'coins.purchased';
  payload: {
    userId: string;
    walletId: string;
    amountCoins: number;
    amountPaid: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
  };
}

/**
 * Coins spent event
 */
export interface CoinsSpentEvent extends BaseEvent {
  eventType: 'coins.spent';
  payload: {
    userId: string;
    walletId: string;
    amountCoins: number;
    spentOn: 'call' | 'gift' | 'room' | 'livestream' | 'other';
    recipientId?: string;
    reference: string;
  };
}

/**
 * Coins earned event
 */
export interface CoinsEarnedEvent extends BaseEvent {
  eventType: 'coins.earned';
  payload: {
    userId: string;
    walletId: string;
    amountCoins: number;
    earnedFrom: 'call' | 'gift' | 'room' | 'livestream' | 'referral';
    senderId?: string;
    platformCommission: number;
    reference: string;
  };
}

/**
 * Wallet credited event
 */
export interface WalletCreditedEvent extends BaseEvent {
  eventType: 'wallet.credited';
  payload: {
    walletId: string;
    userId: string;
    amountCoins: number;
    walletType: 'main' | 'earnings';
    reason: string;
    reference: string;
    balanceAfter: number;
  };
}

/**
 * Wallet debited event
 */
export interface WalletDebitedEvent extends BaseEvent {
  eventType: 'wallet.debited';
  payload: {
    walletId: string;
    userId: string;
    amountCoins: number;
    walletType: 'main' | 'earnings';
    reason: string;
    reference: string;
    balanceAfter: number;
  };
}

/**
 * Wallet withdrawal requested event
 */
export interface WalletWithdrawalRequestedEvent extends BaseEvent {
  eventType: 'wallet.withdrawal.requested';
  payload: {
    withdrawalId: string;
    userId: string;
    walletId: string;
    amountCoins: number;
    amountFiat: number;
    currency: string;
    bankAccount: {
      bankCode: string;
      accountNumber: string;
      accountName: string;
    };
  };
}

/**
 * Wallet withdrawal processed event
 */
export interface WalletWithdrawalProcessedEvent extends BaseEvent {
  eventType: 'wallet.withdrawal.processed';
  payload: {
    withdrawalId: string;
    userId: string;
    amountFiat: number;
    currency: string;
    status: 'success' | 'failed';
    reference: string;
  };
}
