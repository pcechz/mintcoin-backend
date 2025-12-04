import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import * as duration from 'dayjs/plugin/duration';
import * as relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);
dayjs.extend(relativeTime);

/**
 * Date utility functions using dayjs
 */
export class DateUtils {
  /**
   * Get current timestamp in ISO format
   */
  static now(): string {
    return dayjs().toISOString();
  }

  /**
   * Get current date object
   */
  static nowDate(): Date {
    return new Date();
  }

  /**
   * Add time to current date
   */
  static addTime(
    amount: number,
    unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
  ): Date {
    return dayjs().add(amount, unit).toDate();
  }

  /**
   * Subtract time from current date
   */
  static subtractTime(
    amount: number,
    unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
  ): Date {
    return dayjs().subtract(amount, unit).toDate();
  }

  /**
   * Calculate difference between two dates in specified unit
   */
  static diff(
    date1: Date | string,
    date2: Date | string,
    unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year' = 'second',
  ): number {
    return dayjs(date1).diff(dayjs(date2), unit);
  }

  /**
   * Format date to string
   */
  static format(date: Date | string, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).format(format);
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: Date | string): boolean {
    return dayjs(date).isBefore(dayjs());
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: Date | string): boolean {
    return dayjs(date).isAfter(dayjs());
  }

  /**
   * Check if date is expired
   */
  static isExpired(expiryDate: Date | string): boolean {
    return this.isPast(expiryDate);
  }

  /**
   * Get relative time (e.g., "2 hours ago", "in 3 days")
   */
  static fromNow(date: Date | string): string {
    return dayjs(date).fromNow();
  }

  /**
   * Convert to Nigerian timezone (WAT - West Africa Time)
   */
  static toNigerianTime(date: Date | string): Date {
    return dayjs(date).tz('Africa/Lagos').toDate();
  }

  /**
   * Get start of day
   */
  static startOfDay(date?: Date | string): Date {
    return dayjs(date).startOf('day').toDate();
  }

  /**
   * Get end of day
   */
  static endOfDay(date?: Date | string): Date {
    return dayjs(date).endOf('day').toDate();
  }

  /**
   * Calculate duration in seconds
   */
  static durationInSeconds(start: Date | string, end: Date | string): number {
    return this.diff(end, start, 'second');
  }

  /**
   * Calculate duration in minutes
   */
  static durationInMinutes(start: Date | string, end: Date | string): number {
    return this.diff(end, start, 'minute');
  }

  /**
   * Check if date is within range
   */
  static isBetween(
    date: Date | string,
    start: Date | string,
    end: Date | string,
  ): boolean {
    const d = dayjs(date);
    return d.isAfter(start) && d.isBefore(end);
  }
}
