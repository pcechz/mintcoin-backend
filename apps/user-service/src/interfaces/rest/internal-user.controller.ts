import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ResponseUtils, UserStatus } from '@app/common';
import { UserService } from '../../application/services';
import {
  BootstrapUserDto,
  LookupUserByIdentifierDto,
  RecordLoginActivityDto,
} from '../../application/dto';
import { InternalApiGuard } from '../guards/internal-api.guard';
import { User } from '../../domain/entities';

@Controller('users/internal')
@UseGuards(InternalApiGuard)
export class InternalUserController {
  constructor(private readonly userService: UserService) {}

  @Post('lookup')
  async lookupByIdentifier(@Body() dto: LookupUserByIdentifierDto) {
    const user = await this.userService.findByIdentifier(dto.identifier, dto.identifierType);

    return ResponseUtils.success(
      { user: user ? this.mapToIdentityResponse(user) : null },
      user ? 'User found' : 'User not found',
    );
  }

  @Post('bootstrap')
  async bootstrapUser(@Body() dto: BootstrapUserDto) {
    const user = await this.userService.bootstrapUserFromAuth(dto);

    return ResponseUtils.success(
      { user: this.mapToIdentityResponse(user) },
      'User ready for onboarding',
    );
  }

  @Post('record-login')
  async recordLogin(@Body() dto: RecordLoginActivityDto) {
    const user = await this.userService.recordLoginActivity(dto.userId, dto);

    return ResponseUtils.success(
      { user: this.mapToIdentityResponse(user) },
      'Login activity recorded',
    );
  }

  private mapToIdentityResponse(user: User) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      username: user.username,
      status: user.status,
      lifecycleState: user.lifecycleState,
      profileCompletionPercent: user.profileCompletionPercent,
      referralCode: user.referralCode,
      needsOnboarding:
        user.status === UserStatus.PENDING_SETUP || user.profileCompletionPercent < 60,
    };
  }
}
