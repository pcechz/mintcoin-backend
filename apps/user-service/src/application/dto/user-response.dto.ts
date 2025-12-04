export class UserProfileResponse {
  id: string;
  phone?: string;
  email?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  gender?: string;
  ageBracket?: string;
  location?: string;
  interests?: string[];
  status: string;
  lifecycleState: string;
  isCreator: boolean;
  kycStatus: string;
  kycTier: string;
  canEarn: boolean;
  canWithdraw: boolean;
  referralCode: string;
  profileCompletionPercent: number;
  lastActiveAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class PublicUserResponse {
  id: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  isCreator: boolean;
  kycStatus: string;
}
