import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord, RecordMetadata } from 'kafkajs';
import { BaseEvent } from '@app/events';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaProducerService.name);
  private kafka: Kafka;
  private producer: Producer;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'mintcoin-backend');

    this.kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        retries: parseInt(this.configService.get<string>('KAFKA_RETRY_ATTEMPTS', '5')),
        initialRetryTime: parseInt(this.configService.get<string>('KAFKA_RETRY_DELAY', '3000')),
      },
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      transactionTimeout: 30000,
    });
  }

  async onModuleInit() {
    try {
      await this.producer.connect();
      this.isConnected = true;
      this.logger.log('Kafka Producer connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Producer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.producer.disconnect();
      this.isConnected = false;
      this.logger.log('Kafka Producer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Producer', error);
    }
  }

  /**
   * Publish a single event
   */
  async publish<T extends BaseEvent>(topic: string, event: Omit<T, 'eventId' | 'timestamp' | 'version'>): Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      throw new Error('Kafka Producer is not connected');
    }

    const enrichedEvent: BaseEvent = {
      ...event,
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      version: '1.0',
    } as T;

    try {
      const result = await this.producer.send({
        topic,
        messages: [
          {
            key: enrichedEvent.metadata?.userId || enrichedEvent.eventId,
            value: JSON.stringify(enrichedEvent),
            headers: {
              'event-type': enrichedEvent.eventType,
              'event-id': enrichedEvent.eventId,
              'correlation-id': enrichedEvent.metadata?.correlationId || enrichedEvent.eventId,
            },
          },
        ],
      });

      this.logger.debug(`Published event to topic ${topic}: ${enrichedEvent.eventType}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to publish event to topic ${topic}`, error);
      throw error;
    }
  }

  /**
   * Publish multiple events in a batch
   * Returns metadata for each published record
   */
  async publishBatch(records: ProducerRecord[]): Promise<RecordMetadata[]> {
    if (!this.isConnected) {
      throw new Error('Kafka Producer is not connected');
    }

    try {
      const results = await this.producer.sendBatch({
        topicMessages: records,
      });

      this.logger.debug(`Published batch of ${records.length} events`);
      return results;
    } catch (error) {
      this.logger.error('Failed to publish batch', error);
      throw error;
    }
  }

  /**
   * Publish event with transaction support
   */
  async publishTransaction<T extends BaseEvent>(
    topic: string,
    events: Omit<T, 'eventId' | 'timestamp' | 'version'>[],
  ): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka Producer is not connected');
    }

    const transaction = await this.producer.transaction();

    try {
      for (const event of events) {
        const enrichedEvent: BaseEvent = {
          ...event,
          eventId: uuidv4(),
          timestamp: new Date().toISOString(),
          version: '1.0',
        } as T;

        await transaction.send({
          topic,
          messages: [
            {
              key: enrichedEvent.metadata?.userId || enrichedEvent.eventId,
              value: JSON.stringify(enrichedEvent),
              headers: {
                'event-type': enrichedEvent.eventType,
                'event-id': enrichedEvent.eventId,
              },
            },
          ],
        });
      }

      await transaction.commit();
      this.logger.debug(`Published transaction with ${events.length} events to ${topic}`);
    } catch (error) {
      await transaction.abort();
      this.logger.error('Failed to publish transaction, aborted', error);
      throw error;
    }
  }

  /**
   * Check if producer is connected
   */
  isProducerConnected(): boolean {
    return this.isConnected;
  }
}
