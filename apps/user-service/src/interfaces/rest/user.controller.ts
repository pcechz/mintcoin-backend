import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { ResponseUtils } from '@app/common';
import { UserService } from '../../application/services';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUsernameDto,
  UserProfileResponse,
  PublicUserResponse,
} from '../../application/dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * Create a new user (called after OTP verification)
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto, @Req() req: Request): Promise<any> {
    const user = await this.userService.createUser(dto);

    const response: UserProfileResponse = this.mapToProfileResponse(user);

    return ResponseUtils.success(response, 'User created successfully');
  }

  /**
   * Get current user profile
   * GET /users/me
   */
  @Get('me')
  async getCurrentUser(@Req() req: Request): Promise<any> {
    // TODO: Get user ID from JWT guard
    const userId = 'temp-user-id';

    const user = await this.userService.getUserById(userId);

    // Update last active
    await this.userService.updateLastActive(userId);

    const response: UserProfileResponse = this.mapToProfileResponse(user);

    return ResponseUtils.success(response, 'Profile retrieved successfully');
  }

  /**
   * Update current user profile
   * PATCH /users/me
   */
  @Patch('me')
  async updateCurrentUser(
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ): Promise<any> {
    // TODO: Get user ID from JWT guard
    const userId = 'temp-user-id';

    const user = await this.userService.updateUser(userId, dto);

    const response: UserProfileResponse = this.mapToProfileResponse(user);

    return ResponseUtils.success(response, 'Profile updated successfully');
  }

  /**
   * Update username
   * PUT /users/me/username
   */
  @Put('me/username')
  async updateUsername(
    @Body() dto: UpdateUsernameDto,
    @Req() req: Request,
  ): Promise<any> {
    // TODO: Get user ID from JWT guard
    const userId = 'temp-user-id';

    const user = await this.userService.updateUsername(userId, dto);

    const response: UserProfileResponse = this.mapToProfileResponse(user);

    return ResponseUtils.success(response, 'Username updated successfully');
  }

  /**
   * Get user by ID (public profile)
   * GET /users/:id
   */
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<any> {
    const user = await this.userService.getUserById(id);

    const response: PublicUserResponse = {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isCreator: user.isCreator,
      kycStatus: user.kycStatus,
    };

    return ResponseUtils.success(response, 'User profile retrieved');
  }

  /**
   * Get user by username (public profile)
   * GET /users/username/:username
   */
  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string): Promise<any> {
    const user = await this.userService.getUserByUsername(username);

    const response: PublicUserResponse = {
      id: user.id,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isCreator: user.isCreator,
      kycStatus: user.kycStatus,
    };

    return ResponseUtils.success(response, 'User profile retrieved');
  }

  /**
   * Map User entity to UserProfileResponse
   */
  private mapToProfileResponse(user: any): UserProfileResponse {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      phoneVerified: user.phoneVerified,
      emailVerified: user.emailVerified,
      username: user.username,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      gender: user.gender,
      ageBracket: user.ageBracket,
      location: user.location,
      interests: user.interests,
      status: user.status,
      lifecycleState: user.lifecycleState,
      isCreator: user.isCreator,
      kycStatus: user.kycStatus,
      kycTier: user.kycTier,
      canEarn: user.canEarn,
      canWithdraw: user.canWithdraw,
      referralCode: user.referralCode,
      profileCompletionPercent: user.profileCompletionPercent,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
