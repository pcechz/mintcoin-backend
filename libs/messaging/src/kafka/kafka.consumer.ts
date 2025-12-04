import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload, ConsumerSubscribeTopics } from 'kafkajs';

export interface MessageHandler {
  (payload: any): Promise<void>;
}

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaConsumerService.name);
  private kafka: Kafka;
  private consumer: Consumer;
  private isConnected = false;
  private messageHandlers = new Map<string, MessageHandler[]>();

  constructor(private readonly configService: ConfigService) {
    const brokers = this.configService
      .get<string>('KAFKA_BROKERS', 'localhost:9092')
      .split(',');
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID', 'mintcoin-backend');
    const groupId = this.configService.get<string>('KAFKA_GROUP_ID', 'mintcoin-group');

    this.kafka = new Kafka({
      clientId,
      brokers,
      retry: {
        retries: parseInt(this.configService.get<string>('KAFKA_RETRY_ATTEMPTS', '5')),
        initialRetryTime: parseInt(this.configService.get<string>('KAFKA_RETRY_DELAY', '3000')),
      },
    });

    this.consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
  }

  async onModuleInit() {
    try {
      await this.consumer.connect();
      this.isConnected = true;
      this.logger.log('Kafka Consumer connected successfully');

      // Start consuming if there are registered handlers
      if (this.messageHandlers.size > 0) {
        await this.startConsuming();
      }
    } catch (error) {
      this.logger.error('Failed to connect Kafka Consumer', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.consumer.disconnect();
      this.isConnected = false;
      this.logger.log('Kafka Consumer disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting Kafka Consumer', error);
    }
  }

  /**
   * Subscribe to specific topics
   */
  async subscribe(topics: ConsumerSubscribeTopics): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka Consumer is not connected');
    }

    await this.consumer.subscribe(topics);
    this.logger.log(`Subscribed to topics: ${JSON.stringify(topics)}`);
  }

  /**
   * Register a message handler for a specific event type
   */
  registerHandler(eventType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, []);
    }

    this.messageHandlers.get(eventType).push(handler);
    this.logger.log(`Registered handler for event type: ${eventType}`);
  }

  /**
   * Start consuming messages
   */
  private async startConsuming(): Promise<void> {
    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });

    this.logger.log('Kafka Consumer started consuming messages');
  }

  /**
   * Handle incoming messages
   */
  private async handleMessage(payload: EachMessagePayload): Promise<void> {
    const { topic, partition, message } = payload;

    try {
      const eventType = message.headers?.['event-type']?.toString();
      const eventData = JSON.parse(message.value.toString());

      this.logger.debug(
        `Received message from topic ${topic}, partition ${partition}, event type: ${eventType}`,
      );

      // Find and execute handlers for this event type
      const handlers = this.messageHandlers.get(eventType) || [];

      for (const handler of handlers) {
        try {
          await handler(eventData);
        } catch (error) {
          this.logger.error(
            `Error executing handler for event type ${eventType}`,
            error.stack,
          );
          // Continue processing other handlers even if one fails
        }
      }
    } catch (error) {
      this.logger.error('Error processing message', error.stack);
      // Optionally: send to dead letter queue
    }
  }

  /**
   * Commit offsets manually (if auto-commit is disabled)
   */
  async commitOffsets(offsets: any): Promise<void> {
    await this.consumer.commitOffsets(offsets);
  }

  /**
   * Pause consumption
   */
  async pause(topics: Array<{ topic: string; partitions?: number[] }>): Promise<void> {
    this.consumer.pause(topics);
    this.logger.log(`Paused consumption for topics: ${JSON.stringify(topics)}`);
  }

  /**
   * Resume consumption
   */
  async resume(topics: Array<{ topic: string; partitions?: number[] }>): Promise<void> {
    this.consumer.resume(topics);
    this.logger.log(`Resumed consumption for topics: ${JSON.stringify(topics)}`);
  }

  /**
   * Check if consumer is connected
   */
  isConsumerConnected(): boolean {
    return this.isConnected;
  }
}
