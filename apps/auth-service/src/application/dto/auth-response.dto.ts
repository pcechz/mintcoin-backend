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
  };
  tokens: AuthTokens;
  sessionId: string;
}

export class OtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
  attemptsRemaining?: number;
}
