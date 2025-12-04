import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { KafkaProducerService } from './kafka/kafka.producer';
import { KafkaConsumerService } from './kafka/kafka.consumer';

/**
 * MessagingModule provides Kafka-based event messaging
 * for inter-service communication in the microservices architecture
 */
@Module({
  providers: [
    KafkaProducerService,
    KafkaConsumerService,
    MessagingService,
  ],
  exports: [MessagingService],
})
export class MessagingModule {}
