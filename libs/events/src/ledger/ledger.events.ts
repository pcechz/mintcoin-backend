import { BaseEvent } from '../base/base.event';

/**
 * Transaction types for ledger
 */
export type TransactionType =
  | 'COIN_PURCHASE'
  | 'COIN_SPEND'
  | 'COIN_EARN'
  | 'WITHDRAWAL'
  | 'REFUND'
  | 'COMMISSION'
  | 'ADJUSTMENT';

/**
 * Ledger transaction created event
 */
export interface LedgerTransactionCreatedEvent extends BaseEvent {
  eventType: 'ledger.transaction.created';
  payload: {
    transactionId: string;
    userId: string;
    walletId: string;
    walletType: 'main' | 'earnings';
    amount: number;
    transactionType: TransactionType;
    category: string;
    narration: string;
    reference: string;
    checksum: string;
    balanceBefore: number;
    balanceAfter: number;
  };
}

/**
 * Ledger transaction failed event
 */
export interface LedgerTransactionFailedEvent extends BaseEvent {
  eventType: 'ledger.transaction.failed';
  payload: {
    transactionId: string;
    userId: string;
    reason: string;
    attemptedAmount: number;
    attemptedType: TransactionType;
  };
}
