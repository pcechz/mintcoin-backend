# Shared Libraries - Implementation Guide

All shared libraries have been implemented and are ready to use across your microservices.

## 📚 Available Libraries

### 1. `@app/persistence` - Database & TypeORM

**Purpose:** Provides base entities, repositories, and database utilities for all services.

**Key Features:**
- `BaseEntity` - Common fields (id, timestamps, soft delete, versioning)
- `BaseRepository` - CRUD operations, pagination, transactions
- `DatabaseUtils` - Transaction helpers, checksums, health checks
- `@Transactional()` decorator for automatic transaction wrapping

**Usage Example:**
```typescript
import { BaseEntity, BaseRepository } from '@app/persistence';
import { Entity, Column } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  @Column()
  name: string;

  @Column()
  email: string;
}

// In your service
const users = await repository.paginate(1, 20, {
  where: { status: 'active' }
});
```

---

### 2. `@app/events` - Event Definitions

**Purpose:** All event types and topics for Kafka messaging, aligned with PRD.

**Key Features:**
- `BaseEvent` interface with metadata
- `EVENT_TOPICS` - All Kafka topics organized by domain
- Event interfaces for: Auth, User, Wallet, Ledger, Room, Call, Gift, etc.

**Usage Example:**
```typescript
import {
  UserRegisteredEvent,
  EVENT_TOPICS,
  CoinsPurchasedEvent
} from '@app/events';

// Publishing an event
const event: Omit<UserRegisteredEvent, 'eventId' | 'timestamp' | 'version'> = {
  eventType: EVENT_TOPICS.AUTH.USER_REGISTERED,
  payload: {
    userId: 'user-123',
    phone: '+2348012345678',
    referralCode: 'PETER123',
    deviceId: 'device-xyz',
    ipAddress: '192.168.1.1',
  },
  metadata: {
    correlationId: 'corr-123',
    userId: 'user-123',
  },
};
```

---

### 3. `@app/messaging` - Kafka Integration

**Purpose:** Unified interface for publishing and consuming Kafka events.

**Key Features:**
- `KafkaProducerService` - Publish events to Kafka
- `KafkaConsumerService` - Subscribe and consume events
- `MessagingService` - Simple wrapper for both producer and consumer
- Auto-reconnection, transaction support, health checks

**Usage Example:**
```typescript
import { MessagingService } from '@app/messaging';
import { EVENT_TOPICS } from '@app/events';

export class UserService {
  constructor(private readonly messaging: MessagingService) {}

  async createUser(data: CreateUserDto) {
    // Create user...

    // Publish event
    await this.messaging.publish(EVENT_TOPICS.USER.PROFILE_CREATED, {
      eventType: EVENT_TOPICS.USER.PROFILE_CREATED,
      payload: {
        userId: user.id,
        username: user.username,
        name: user.name,
      },
    });
  }
}

// In a consumer service
export class NotificationService implements OnModuleInit {
  constructor(private readonly messaging: MessagingService) {}

  async onModuleInit() {
    // Subscribe to topics
    await this.messaging.subscribe([
      EVENT_TOPICS.USER.PROFILE_CREATED,
      EVENT_TOPICS.COINS.PURCHASED,
    ]);

    // Register handlers
    this.messaging.on(EVENT_TOPICS.USER.PROFILE_CREATED, async (event) => {
      console.log('New user created:', event.payload);
      // Send welcome notification
    });
  }
}
```

---

### 4. `@app/common` - Utilities & Constants

**Purpose:** Shared utilities, constants, and helper functions.

**Key Features:**

#### **Constants** (from PRD)
- `UserStatus`, `UserLifecycleState`
- `KycTier`, `KycStatus`
- `WalletType`, `TransactionType`
- `RoomVisibility`, `RoomMemberRole`, `CallType`, `PaymentMethod`
- `ECONOMIC_CONSTANTS` - Commission rates, coin rates, billing intervals
- `RATE_LIMITS`, `PAGINATION_DEFAULTS`

#### **DateUtils**
```typescript
import { DateUtils } from '@app/common';

// Get current time
const now = DateUtils.now(); // ISO string

// Add time
const futureDate = DateUtils.addTime(5, 'minute');

// Calculate duration
const duration = DateUtils.durationInMinutes(startTime, endTime);

// Nigerian timezone
const watTime = DateUtils.toNigerianTime(new Date());
```

#### **ResponseUtils**
```typescript
import { ResponseUtils } from '@app/common';

// Success response
return ResponseUtils.success(userData, 'User created successfully');

// Error response
return ResponseUtils.error('User not found', 'NOT_FOUND');

// Paginated response
return ResponseUtils.paginated(users, total, page, limit);

// Validation error
return ResponseUtils.validationError(errors);
```

#### **CryptoUtils**
```typescript
import { CryptoUtils } from '@app/common';

// Generate OTP
const otp = CryptoUtils.generateOTP(6); // "123456"

// Generate referral code
const refCode = CryptoUtils.generateReferralCode('PETER', 8); // "PETERABCD1234"

// Hash password
const hash = await CryptoUtils.hashPassword('password123');

// Compare password
const isValid = await CryptoUtils.comparePassword('password123', hash);

// Generate HMAC (for payment webhooks)
const signature = CryptoUtils.generateHMAC(data, secret);

// Generate checksum (for ledger integrity)
const checksum = CryptoUtils.generateChecksum(transaction);

// Encrypt sensitive data
const { encrypted, iv, tag } = CryptoUtils.encrypt(nin, encryptionKey);
```

---

## 🎯 Using Libraries in Your Services

### Step 1: Import in your service module

```typescript
// apps/user-service/src/user-service.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@app/config';
import { PersistenceModule } from '@app/persistence';
import { MessagingModule } from '@app/messaging';

@Module({
  imports: [
    ConfigModule,
    PersistenceModule,
    MessagingModule,
  ],
  // ... rest of your module
})
export class UserServiceModule {}
```

### Step 2: Use in your services

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingService } from '@app/messaging';
import { EVENT_TOPICS } from '@app/events';
import { ResponseUtils, CryptoUtils } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly messaging: MessagingService,
  ) {}

  async sendOTP(phone: string) {
    // Generate OTP
    const otp = CryptoUtils.generateOTP(6);

    // Save to database
    // Send SMS

    // Publish event
    await this.messaging.publish(EVENT_TOPICS.AUTH.OTP_SENT, {
      eventType: EVENT_TOPICS.AUTH.OTP_SENT,
      payload: { phone, expiresAt: DateUtils.addTime(5, 'minute') },
    });

    return ResponseUtils.success({ message: 'OTP sent successfully' });
  }
}
```

---

## 📊 Library Dependencies

These libraries depend on each other in this order:
1. `@app/config` (base - no dependencies)
2. `@app/common` (depends on config)
3. `@app/persistence` (depends on config)
4. `@app/events` (depends on config)
5. `@app/messaging` (depends on config, events)

All services should import them in their modules to use the functionality.

---

## ✅ What's Ready

- ✅ Base entity and repository patterns
- ✅ All event definitions from PRD
- ✅ Kafka producer/consumer setup
- ✅ Utility functions (date, crypto, responses)
- ✅ All constants from PRD (statuses, enums, economic values)
- ✅ Transaction support
- ✅ Health checks
- ✅ Pagination helpers

---

## 🚀 Next Steps

Now that shared libraries are ready, you can:

1. **Start implementing service entities:**
   - User Service entities (User, Profile)
   - Auth Service entities (Session, OtpCode)
   - Wallet Service entities (Wallet, Transaction)
   - Ledger Service entities (LedgerEntry)

2. **Implement core flows:**
   - User registration + OTP verification
   - JWT authentication
   - Dual wallet creation
   - Coin purchase flow

3. **Test event publishing:**
   - Start a service
   - Publish an event
   - Subscribe from another service
   - Verify Kafka topics in Kafka UI (http://localhost:8080)

---

## 📖 Additional Resources

- PRD: `/Users/mac/Documents/mintcoin/BackendPRD.rtf`
- Environment Config: `.env`
- Kafka UI: http://localhost:8080
- PgAdmin: http://localhost:5050

All infrastructure is running and ready. Just run `yarn install` and start building!
