import { Injectable, Logger } from '@nestjs/common';
import { KafkaProducerService } from './kafka/kafka.producer';
import { KafkaConsumerService, MessageHandler } from './kafka/kafka.consumer';
import { BaseEvent } from '@app/events';

/**
 * Unified messaging service that wraps Kafka producer and consumer
 * Provides a simple interface for publishing and subscribing to events
 */
@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    private readonly producer: KafkaProducerService,
    private readonly consumer: KafkaConsumerService,
  ) {}

  /**
   * Publish an event to a topic
   */
  async publish<T extends BaseEvent>(
    topic: string,
    event: Omit<T, 'eventId' | 'timestamp' | 'version'>,
  ): Promise<void> {
    try {
      await this.producer.publish(topic, event);
      this.logger.debug(`Event published to topic: ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to publish event to topic: ${topic}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to topics
   */
  async subscribe(topics: string | string[]): Promise<void> {
    const topicsArray = Array.isArray(topics) ? topics : [topics];
    await this.consumer.subscribe({ topics: topicsArray });
  }

  /**
   * Register a handler for a specific event type
   */
  on(eventType: string, handler: MessageHandler): void {
    this.consumer.registerHandler(eventType, handler);
  }

  /**
   * Check messaging system health
   */
  async checkHealth(): Promise<{
    producer: boolean;
    consumer: boolean;
    healthy: boolean;
  }> {
    const producerConnected = this.producer.isProducerConnected();
    const consumerConnected = this.consumer.isConsumerConnected();

    return {
      producer: producerConnected,
      consumer: consumerConnected,
      healthy: producerConnected && consumerConnected,
    };
  }
}
