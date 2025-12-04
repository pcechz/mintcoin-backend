import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessagingService } from '@app/messaging';
import { EVENT_TOPICS } from '@app/events';
import { User } from '../../domain/entities';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUsernameDto,
  BootstrapUserDto,
  RecordLoginActivityDto,
} from '../dto';
import { CryptoUtils, UserStatus, UserLifecycleState, KycStatus, KycTier } from '@app/common';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly messagingService: MessagingService,
  ) {}

  /**
   * Create a new user
   */
  async createUser(dto: CreateUserDto): Promise<User> {
    // Check if username already exists
    const existingUsername = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const normalizedPhone = this.normalizePhone(dto.phone);
    const normalizedEmail = this.normalizeEmail(dto.email);

    // Check if phone/email already exists
    if (normalizedPhone) {
      const existingPhone = await this.userRepository.findOne({
        where: { phone: normalizedPhone },
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }
    }

    if (normalizedEmail) {
      const existingEmail = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });

      if (existingEmail) {
        throw new ConflictException('Email already registered');
      }
    }

    // Generate referral code
    const referralCode = await this.generateUniqueReferralCode(dto.username);

    // Handle referred by
    let referredByUserId: string | undefined;
    if (dto.referredByCode) {
      const referrer = await this.userRepository.findOne({
        where: { referralCode: dto.referredByCode },
      });

      if (referrer) {
        referredByUserId = referrer.id;
      }
    }

    // Create user
    const user = this.userRepository.create({
      phone: normalizedPhone,
      email: normalizedEmail,
      phoneVerified: Boolean(normalizedPhone),
      emailVerified: Boolean(normalizedEmail),
      username: dto.username,
      name: dto.name,
      avatarUrl: dto.avatarUrl,
      bio: dto.bio,
      gender: dto.gender,
      ageBracket: dto.ageBracket,
      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      location: dto.location,
      interests: dto.interests,
      status: UserStatus.ACTIVE,
      lifecycleState: UserLifecycleState.NEW_USER,
      isCreator: false,
      kycStatus: KycStatus.NOT_STARTED,
      kycTier: KycTier.TIER_0,
      canEarn: false,
      canWithdraw: false,
      referralCode,
      referredByCode: dto.referredByCode,
      referredByUserId,
      deviceId: dto.deviceId,
      ipAddress: dto.ipAddress,
      registrationSource: 'mobile_app',
    });

    user.profileCompletionPercent = this.calculateProfileCompletionFromUser(user);
    this.updateStatusFromProfile(user);

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User created: ${savedUser.id} (${savedUser.username})`);

    // Publish user created event
    await this.messagingService.publish(EVENT_TOPICS.USER.PROFILE_CREATED, {
      eventType: EVENT_TOPICS.USER.PROFILE_CREATED,
      payload: {
        userId: savedUser.id,
        username: savedUser.username,
        name: savedUser.name,
        gender: savedUser.gender,
        ageBracket: savedUser.ageBracket,
      },
    });

    // Publish user registered event
    await this.messagingService.publish(EVENT_TOPICS.AUTH.USER_REGISTERED, {
      eventType: EVENT_TOPICS.AUTH.USER_REGISTERED,
      payload: {
        userId: savedUser.id,
        phone: savedUser.phone,
        email: savedUser.email,
        referralCode: savedUser.referralCode,
        deviceId: savedUser.deviceId || 'unknown',
        ipAddress: savedUser.ipAddress || 'unknown',
      },
    });

    return savedUser;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by username
   */
  async getUserByUsername(username: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  /**
   * Get user by phone
   */
  async getUserByPhone(phone: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { phone },
    });
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find user by identifier (phone/email)
   */
  async findByIdentifier(
    identifier: string,
    identifierType: 'phone' | 'email',
  ): Promise<User | null> {
    if (identifierType === 'phone') {
      const normalized = this.normalizePhone(identifier);
      if (!normalized) {
        return null;
      }

      return this.userRepository.findOne({ where: { phone: normalized } });
    }

    const normalized = this.normalizeEmail(identifier);
    if (!normalized) {
      return null;
    }

    return this.userRepository.findOne({ where: { email: normalized } });
  }

  /**
   * Bootstrap user record after OTP verification (called by Auth Service)
   */
  async bootstrapUserFromAuth(dto: BootstrapUserDto): Promise<User> {
    const existing = await this.findByIdentifier(dto.identifier, dto.identifierType);
    if (existing) {
      return existing;
    }

    const normalizedIdentifier =
      dto.identifierType === 'phone'
        ? this.normalizePhone(dto.identifier)
        : this.normalizeEmail(dto.identifier);

    if (!normalizedIdentifier) {
      throw new BadRequestException('Invalid identifier supplied');
    }

    const generatedUsername = await this.generateSystemUsername(normalizedIdentifier);
    const referralCode = await this.generateUniqueReferralCode(generatedUsername);

    const provisionalName =
      dto.identifierType === 'phone'
        ? `User ${normalizedIdentifier.slice(-4)}`
        : `${normalizedIdentifier.split('@')[0] || 'New User'}`;

    const user = this.userRepository.create({
      phone: dto.identifierType === 'phone' ? normalizedIdentifier : undefined,
      email: dto.identifierType === 'email' ? normalizedIdentifier : undefined,
      phoneVerified: dto.identifierType === 'phone',
      emailVerified: dto.identifierType === 'email',
      username: generatedUsername,
      name: provisionalName,
      status: UserStatus.PENDING_SETUP,
      lifecycleState: UserLifecycleState.NEW_USER,
      isCreator: false,
      kycStatus: KycStatus.NOT_STARTED,
      kycTier: KycTier.TIER_0,
      referralCode,
      deviceId: dto.deviceId,
      ipAddress: dto.ipAddress,
      registrationSource: 'mobile_app',
      profileCompletionPercent: 0,
    });

    user.profileCompletionPercent = this.calculateProfileCompletionFromUser(user);
    this.updateStatusFromProfile(user);

    return this.userRepository.save(user);
  }

  /**
   * Record login activity from Auth Service
   */
  async recordLoginActivity(
    userId: string,
    metadata: RecordLoginActivityDto,
  ): Promise<User> {
    const user = await this.getUserById(userId);

    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.deviceId = metadata.deviceId || user.deviceId;
    user.ipAddress = metadata.ipAddress || user.ipAddress;

    this.updateStatusFromProfile(user);

    return this.userRepository.save(user);
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.getUserById(userId);

    // Track changes for event
    const changes: Record<string, any> = {};
    const updatedFields: string[] = [];

    if (dto.name && dto.name !== user.name) {
      user.name = dto.name;
      changes.name = dto.name;
      updatedFields.push('name');
    }

    if (dto.avatarUrl && dto.avatarUrl !== user.avatarUrl) {
      user.avatarUrl = dto.avatarUrl;
      changes.avatarUrl = dto.avatarUrl;
      updatedFields.push('avatarUrl');
    }

    if (dto.bio !== undefined && dto.bio !== user.bio) {
      user.bio = dto.bio;
      changes.bio = dto.bio;
      updatedFields.push('bio');
    }

    if (dto.gender && dto.gender !== user.gender) {
      user.gender = dto.gender;
      changes.gender = dto.gender;
      updatedFields.push('gender');
    }

    if (dto.ageBracket && dto.ageBracket !== user.ageBracket) {
      user.ageBracket = dto.ageBracket;
      changes.ageBracket = dto.ageBracket;
      updatedFields.push('ageBracket');
    }

    if (dto.dateOfBirth) {
      const newDate = new Date(dto.dateOfBirth);
      if (!user.dateOfBirth || newDate.getTime() !== user.dateOfBirth.getTime()) {
        user.dateOfBirth = newDate;
        changes.dateOfBirth = dto.dateOfBirth;
        updatedFields.push('dateOfBirth');
      }
    }

    if (dto.location && dto.location !== user.location) {
      user.location = dto.location;
      changes.location = dto.location;
      updatedFields.push('location');
    }

    if (dto.interests) {
      user.interests = dto.interests;
      changes.interests = dto.interests;
      updatedFields.push('interests');
    }

    // Recalculate profile completion
    user.profileCompletionPercent = this.calculateProfileCompletionFromUser(user);
    this.updateStatusFromProfile(user);

    const savedUser = await this.userRepository.save(user);

    if (updatedFields.length > 0) {
      this.logger.log(`User updated: ${userId} - ${updatedFields.join(', ')}`);

      // Publish profile updated event
      await this.messagingService.publish(EVENT_TOPICS.USER.PROFILE_UPDATED, {
        eventType: EVENT_TOPICS.USER.PROFILE_UPDATED,
        payload: {
          userId: savedUser.id,
          updatedFields,
          changes,
        },
      });
    }

    return savedUser;
  }

  /**
   * Update username
   */
  async updateUsername(userId: string, dto: UpdateUsernameDto): Promise<User> {
    const user = await this.getUserById(userId);

    // Check if new username is already taken
    const existing = await this.userRepository.findOne({
      where: { username: dto.username },
    });

    if (existing && existing.id !== userId) {
      throw new ConflictException('Username already taken');
    }

    const oldUsername = user.username;
    user.username = dto.username;
    user.profileCompletionPercent = this.calculateProfileCompletionFromUser(user);
    this.updateStatusFromProfile(user);

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`Username updated: ${userId} (${oldUsername} → ${dto.username})`);

    return savedUser;
  }

  /**
   * Update user lifecycle state
   */
  async updateLifecycleState(userId: string, state: UserLifecycleState): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { lifecycleState: state },
    );
  }

  /**
   * Mark user as creator
   */
  async promoteToCreator(userId: string): Promise<User> {
    const user = await this.getUserById(userId);

    user.isCreator = true;
    user.lifecycleState = UserLifecycleState.CREATOR;

    const savedUser = await this.userRepository.save(user);

    this.logger.log(`User promoted to creator: ${userId}`);

    return savedUser;
  }

  /**
   * Suspend user
   */
  async suspendUser(
    userId: string,
    reason: string,
    suspendedUntil?: Date,
  ): Promise<void> {
    const user = await this.getUserById(userId);

    user.isSuspended = true;
    user.suspendedAt = new Date();
    user.suspendedUntil = suspendedUntil;
    user.suspendedReason = reason;

    await this.userRepository.save(user);

    this.logger.warn(`User suspended: ${userId} - ${reason}`);

    // Publish suspended event
    await this.messagingService.publish(EVENT_TOPICS.USER.SUSPENDED, {
      eventType: EVENT_TOPICS.USER.SUSPENDED,
      payload: {
        userId,
        reason,
        suspendedBy: 'system',
        suspendedUntil: suspendedUntil?.toISOString(),
      },
    });
  }

  /**
   * Ban user
   */
  async banUser(userId: string, reason: string): Promise<void> {
    const user = await this.getUserById(userId);

    user.isBanned = true;
    user.bannedAt = new Date();
    user.bannedReason = reason;

    await this.userRepository.save(user);

    this.logger.warn(`User banned: ${userId} - ${reason}`);

    // Publish banned event
    await this.messagingService.publish(EVENT_TOPICS.USER.BANNED, {
      eventType: EVENT_TOPICS.USER.BANNED,
      payload: {
        userId,
        reason,
        bannedBy: 'system',
        permanent: true,
      },
    });
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string): Promise<void> {
    await this.userRepository.update(
      { id: userId },
      { lastActiveAt: new Date() },
    );
  }

  private normalizePhone(phone?: string): string | undefined {
    return phone ? phone.replace(/\s+/g, '') : undefined;
  }

  private normalizeEmail(email?: string): string | undefined {
    return email ? email.trim().toLowerCase() : undefined;
  }

  private updateStatusFromProfile(user: User): void {
    if (
      user.status === UserStatus.PENDING_SETUP &&
      user.profileCompletionPercent >= 60
    ) {
      user.status = UserStatus.ACTIVE;
    }
  }

  private async generateSystemUsername(seed: string): Promise<string> {
    const base = seed.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'mint';

    for (let attempt = 0; attempt < 5; attempt++) {
      const suffix = CryptoUtils.generateRandomString(3);
      const candidate = `${base.slice(-6)}${suffix}`.toLowerCase();

      const existing = await this.userRepository.findOne({
        where: { username: candidate },
      });

      if (!existing) {
        return candidate;
      }
    }

    return CryptoUtils.generateReferralCode('user', 6).toLowerCase();
  }

  /**
   * Generate unique referral code
   */
  private async generateUniqueReferralCode(username: string): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      const prefix = username.substring(0, 4).toUpperCase();
      code = CryptoUtils.generateReferralCode(prefix, 4);
      attempts++;

      const existing = await this.userRepository.findOne({
        where: { referralCode: code },
      });

      if (!existing) {
        return code;
      }
    } while (attempts < maxAttempts);

    // Fallback to fully random code
    return CryptoUtils.generateReferralCode('', 8);
  }

  /**
   * Calculate profile completion from user entity
   */
  private calculateProfileCompletionFromUser(user: User): number {
    let completed = 0;
    const total = 10;

    if (user.username) completed++;
    if (user.name) completed++;
    if (user.phone || user.email) completed++;
    if (user.avatarUrl) completed++;
    if (user.bio) completed++;
    if (user.gender) completed++;
    if (user.ageBracket) completed++;
    if (user.dateOfBirth) completed++;
    if (user.location) completed++;
    if (user.interests && user.interests.length > 0) completed++;

    return Math.round((completed / total) * 100);
  }
}
