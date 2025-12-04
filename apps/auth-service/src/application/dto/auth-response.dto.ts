export class AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthResponse {
  user: {
    id: string;
    phone?: string;
    email?: string;
    username?: string;
    status: string;
    profileCompletionPercent?: number;
  };
  tokens: AuthTokens;
  sessionId: string;
  needsProfileCompletion: boolean;
}

export class OtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  attemptsRemaining?: number;
  verificationToken?: string;
  otpId?: string;
  expiresAt?: string;
}
