import { DataSource, QueryRunner } from 'typeorm';

/**
 * Database utility functions
 */
export class DatabaseUtils {
  /**
   * Execute operations in a transaction
   */
  static async executeInTransaction<T>(
    dataSource: DataSource,
    callback: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await callback(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Check if database connection is alive
   */
  static async checkConnection(dataSource: DataSource): Promise<boolean> {
    try {
      await dataSource.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get database size in MB
   */
  static async getDatabaseSize(dataSource: DataSource, dbName: string): Promise<number> {
    const result = await dataSource.query(`
      SELECT pg_database_size('${dbName}') as size;
    `);
    return result[0]?.size ? result[0].size / (1024 * 1024) : 0; // Convert to MB
  }

  /**
   * Get table row count
   */
  static async getTableRowCount(dataSource: DataSource, tableName: string): Promise<number> {
    const result = await dataSource.query(`
      SELECT COUNT(*) as count FROM ${tableName};
    `);
    return parseInt(result[0]?.count || '0', 10);
  }

  /**
   * Truncate table (use with caution!)
   */
  static async truncateTable(
    dataSource: DataSource,
    tableName: string,
    cascade: boolean = false,
  ): Promise<void> {
    const cascadeClause = cascade ? 'CASCADE' : '';
    await dataSource.query(`TRUNCATE TABLE ${tableName} ${cascadeClause};`);
  }

  /**
   * Generate a checksum for data integrity
   */
  static generateChecksum(data: any): string {
    const crypto = require('crypto');
    const json = JSON.stringify(data);
    return crypto.createHash('sha256').update(json).digest('hex');
  }

  /**
   * Verify checksum
   */
  static verifyChecksum(data: any, expectedChecksum: string): boolean {
    const actualChecksum = this.generateChecksum(data);
    return actualChecksum === expectedChecksum;
  }
}
