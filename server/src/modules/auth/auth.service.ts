import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { AUTH } from '../../shared/config/constants';
import { env, isDevelopment } from '../../shared/config/env';
import { rateLimitService } from '../../shared/cache/rate-limiter.service';
import { redis, REDIS_TTL } from '../../shared/cache/redis.client';
import { emailService } from '../../shared/services/email.service';
import { createHash, generateOTP, generateToken, generateUUID } from '../../shared/utils/crypto';
import {
  BadRequestError,
  RateLimitError,
  UnauthorizedError,
  ConflictError,
} from '../../shared/utils/api-error';
import { log } from '../../shared/utils/logger';
import { userService, type User } from '../users/user.service';
import { AuthRepository } from './auth.repository';

interface StoredSignupData {
  email: string;
  name: string;
  passwordHash: string;
  country: string;
  language: string;
  otp: string;
  attempts: number;
}

interface StoredPasswordResetData {
  email: string;
  otp: string;
  attempts: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const BCRYPT_ROUNDS = 12;

class AuthService {
  private readonly repository = new AuthRepository();

  /**
   * Step 1: Signup - Create pending user and send OTP to email
   */
  public async signup(input: {
    name: string;
    email: string;
    password: string;
    country: string;
    language: string;
  }): Promise<{ expiresIn: number; debugOtp?: string }> {
    const emailLower = input.email.toLowerCase();
    const emailHash = createHash(emailLower);

    // Check if user already exists
    const existingUser = await userService.findByEmail(emailLower);
    if (existingUser && existingUser.emailVerified) {
      throw new ConflictError('Email already registered');
    }

    // Rate limiting
    const isLocked = await redis.exists(this.getOtpLockKey(emailHash));
    if (isLocked) {
      throw new RateLimitError('OTP temporarily locked due to too many attempts');
    }

    const rateLimit = await rateLimitService.checkOTPRequestLimit(emailHash);
    if (!rateLimit.allowed) {
      throw new RateLimitError('OTP request limit exceeded');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    // Generate OTP
    const otp = generateOTP(AUTH.OTP_LENGTH);

    // Store signup data temporarily
    const signupData: StoredSignupData = {
      email: emailLower,
      name: input.name,
      passwordHash,
      country: input.country,
      language: input.language,
      otp,
      attempts: 0,
    };

    await redis.set(this.getSignupKey(emailHash), signupData, REDIS_TTL.OTP);

    // Send OTP email before responding so delivery errors are surfaced to the client.
    await this.dispatchSignupOtp(emailLower, otp, input.name);

    return {
      expiresIn: AUTH.OTP_EXPIRY_SECONDS,
      debugOtp: isDevelopment ? otp : undefined,
    };
  }

  /**
   * Step 2: Verify email with OTP and create user
   */
  public async verifyEmail(input: {
    email: string;
    otp: string;
  }): Promise<TokenPair & { user: User }> {
    const emailLower = input.email.toLowerCase();
    const emailHash = createHash(emailLower);

    // Rate limiting
    const rateLimit = await rateLimitService.checkOTPVerifyLimit(emailHash);
    if (!rateLimit.allowed) {
      throw new RateLimitError('OTP verification limit exceeded');
    }

    const signupKey = this.getSignupKey(emailHash);
    const signupData = await redis.getObject<StoredSignupData>(signupKey);

    if (!signupData) {
      throw new BadRequestError('OTP expired or not requested. Please sign up again.');
    }

    if (signupData.otp !== input.otp) {
      signupData.attempts += 1;

      if (signupData.attempts >= AUTH.MAX_OTP_ATTEMPTS) {
        await redis.delete(signupKey);
        await redis.set(this.getOtpLockKey(emailHash), '1', AUTH.OTP_LOCK_SECONDS);
        throw new RateLimitError('OTP locked due to repeated invalid attempts');
      }

      const ttl = await redis.getTTL(signupKey);
      await redis.set(signupKey, signupData, ttl > 0 ? ttl : REDIS_TTL.OTP);
      throw new BadRequestError('Invalid OTP');
    }

    // Clear OTP data
    await redis.delete(signupKey);
    await redis.delete(this.getOtpLockKey(emailHash));

    // Create user
    const user = await userService.createUser({
      id: generateUUID(),
      email: signupData.email,
      passwordHash: signupData.passwordHash,
      name: signupData.name,
      language: signupData.language,
      country: signupData.country,
      emailVerified: true,
    });

    log.info('User created successfully', { userId: user.id, email: this.maskEmail(user.email!) });

    const tokens = await this.issueTokenPair(user);
    return {
      ...tokens,
      user,
    };
  }

  /**
   * Login with email and password
   */
  public async login(input: {
    email: string;
    password: string;
  }): Promise<TokenPair & { user: User }> {
    const emailLower = input.email.toLowerCase();

    const userRecord = await userService.findByEmailWithPassword(emailLower);
    if (!userRecord || !userRecord.password_hash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!userRecord.email_verified) {
      throw new UnauthorizedError('Email not verified. Please complete signup.');
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(input.password, userRecord.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const user = await userService.getById(userRecord.id);

    log.info('User logged in successfully', { userId: user.id });

    const tokens = await this.issueTokenPair(user);
    return {
      ...tokens,
      user,
    };
  }

  /**
   * Step 1: Forgot password - Send OTP to email
   */
  public async forgotPasswordRequest(input: {
    email: string;
  }): Promise<{ expiresIn: number; debugOtp?: string }> {
    const emailLower = input.email.toLowerCase();
    const emailHash = createHash(emailLower);

    // Check if user exists
    const user = await userService.findByEmail(emailLower);
    if (!user || !user.emailVerified) {
      // Don't reveal if email exists for security
      throw new BadRequestError('If this email is registered, you will receive a password reset code.');
    }

    // Rate limiting
    const isLocked = await redis.exists(this.getOtpLockKey(emailHash));
    if (isLocked) {
      throw new RateLimitError('OTP temporarily locked due to too many attempts');
    }

    const rateLimit = await rateLimitService.checkOTPRequestLimit(emailHash);
    if (!rateLimit.allowed) {
      throw new RateLimitError('OTP request limit exceeded');
    }

    // Generate OTP
    const otp = generateOTP(AUTH.OTP_LENGTH);

    const resetData: StoredPasswordResetData = {
      email: emailLower,
      otp,
      attempts: 0,
    };

    await redis.set(this.getPasswordResetKey(emailHash), resetData, REDIS_TTL.OTP);

    // Send password reset OTP email
    await this.dispatchPasswordResetOtp(emailLower, otp, user.name || undefined);

    return {
      expiresIn: AUTH.OTP_EXPIRY_SECONDS,
      debugOtp: isDevelopment ? otp : undefined,
    };
  }

  /**
   * Step 2: Verify OTP and reset password
   */
  public async forgotPasswordReset(input: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const emailLower = input.email.toLowerCase();
    const emailHash = createHash(emailLower);

    // Rate limiting
    const rateLimit = await rateLimitService.checkOTPVerifyLimit(emailHash);
    if (!rateLimit.allowed) {
      throw new RateLimitError('OTP verification limit exceeded');
    }

    const resetKey = this.getPasswordResetKey(emailHash);
    const resetData = await redis.getObject<StoredPasswordResetData>(resetKey);

    if (!resetData) {
      throw new BadRequestError('OTP expired or not requested. Please request a new code.');
    }

    if (resetData.otp !== input.otp) {
      resetData.attempts += 1;

      if (resetData.attempts >= AUTH.MAX_OTP_ATTEMPTS) {
        await redis.delete(resetKey);
        await redis.set(this.getOtpLockKey(emailHash), '1', AUTH.OTP_LOCK_SECONDS);
        throw new RateLimitError('OTP locked due to repeated invalid attempts');
      }

      const ttl = await redis.getTTL(resetKey);
      await redis.set(resetKey, resetData, ttl > 0 ? ttl : REDIS_TTL.OTP);
      throw new BadRequestError('Invalid OTP');
    }

    // Clear OTP data
    await redis.delete(resetKey);
    await redis.delete(this.getOtpLockKey(emailHash));

    // Get user and update password
    const user = await userService.findByEmail(emailLower);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const newPasswordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
    await userService.updatePassword(user.id, newPasswordHash);

    log.info('Password reset successfully', { userId: user.id });

    return {
      message: 'Password reset successfully',
    };
  }

  /**
   * Resend OTP for signup or password reset
   */
  public async resendOtp(input: {
    email: string;
    type: 'signup' | 'password-reset';
  }): Promise<{ expiresIn: number; debugOtp?: string }> {
    const emailLower = input.email.toLowerCase();
    const emailHash = createHash(emailLower);

    // Rate limiting
    const isLocked = await redis.exists(this.getOtpLockKey(emailHash));
    if (isLocked) {
      throw new RateLimitError('OTP temporarily locked due to too many attempts');
    }

    const rateLimit = await rateLimitService.checkOTPRequestLimit(emailHash);
    if (!rateLimit.allowed) {
      throw new RateLimitError('OTP request limit exceeded');
    }

    const newOtp = generateOTP(AUTH.OTP_LENGTH);

    if (input.type === 'signup') {
      const signupKey = this.getSignupKey(emailHash);
      const signupData = await redis.getObject<StoredSignupData>(signupKey);

      if (!signupData) {
        throw new BadRequestError('No pending signup found. Please start signup again.');
      }

      signupData.otp = newOtp;
      signupData.attempts = 0;
      await redis.set(signupKey, signupData, REDIS_TTL.OTP);

      await this.dispatchSignupOtp(emailLower, newOtp, signupData.name);
    } else {
      const resetKey = this.getPasswordResetKey(emailHash);
      const resetData = await redis.getObject<StoredPasswordResetData>(resetKey);

      if (!resetData) {
        throw new BadRequestError('No pending password reset found. Please request again.');
      }

      resetData.otp = newOtp;
      resetData.attempts = 0;
      await redis.set(resetKey, resetData, REDIS_TTL.OTP);

      const user = await userService.findByEmail(emailLower);
      await this.dispatchPasswordResetOtp(emailLower, newOtp, user?.name || undefined);
    }

    return {
      expiresIn: AUTH.OTP_EXPIRY_SECONDS,
      debugOtp: isDevelopment ? newOtp : undefined,
    };
  }

  public async refreshAccessToken(refreshToken: string): Promise<TokenPair & { user: User }> {
    const tokenHash = createHash(refreshToken);
    const tokenRecord = await this.repository.findActiveRefreshToken(tokenHash);

    if (!tokenRecord) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    await this.repository.revokeRefreshToken(tokenRecord.id);

    const user = await userService.getById(tokenRecord.user_id);
    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user };
  }

  private async issueTokenPair(user: User): Promise<TokenPair> {
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        country: user.country,
        language: user.language,
        type: 'access',
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] },
    );

    const refreshToken = generateToken(48);
    const refreshTokenId = generateUUID();
    const refreshTokenHash = createHash(refreshToken);
    const expiresAt = this.getRefreshTokenExpiryDate();

    await this.repository.createRefreshToken({
      id: refreshTokenId,
      userId: user.id,
      tokenHash: refreshTokenHash,
      expiresAt,
    });
    await this.repository.pruneUserRefreshTokens(user.id, refreshTokenId);

    return { accessToken, refreshToken };
  }

  private async dispatchSignupOtp(email: string, otp: string, name: string): Promise<void> {
    if (env.OTP_DRIVER === 'disabled') {
      log.info('OTP dispatch skipped because OTP_DRIVER=disabled', { email: this.maskEmail(email) });
      return;
    }

    if (env.OTP_DRIVER === 'email') {
      try {
        await emailService.sendOTP(email, otp, name);
        log.info('Signup OTP sent via email successfully', { email: this.maskEmail(email) });
      } catch (error: any) {
        log.error('Failed to send signup OTP email', {
          email: this.maskEmail(email),
          error: error.message,
        });
        if (!isDevelopment) {
          throw new Error('Failed to send OTP email. Please try again later.');
        }
      }
      return;
    }

    // Mock driver for development
    log.info('OTP generated using mock driver', { email: this.maskEmail(email), otp });
  }

  private async dispatchPasswordResetOtp(email: string, otp: string, name?: string): Promise<void> {
    if (env.OTP_DRIVER === 'disabled') {
      log.info('OTP dispatch skipped because OTP_DRIVER=disabled', { email: this.maskEmail(email) });
      return;
    }

    if (env.OTP_DRIVER === 'email') {
      try {
        await emailService.sendPasswordResetOTP(email, otp, name);
        log.info('Password reset OTP sent via email successfully', { email: this.maskEmail(email) });
      } catch (error: any) {
        log.error('Failed to send password reset OTP email', {
          email: this.maskEmail(email),
          error: error.message,
        });
        if (!isDevelopment) {
          throw new Error('Failed to send OTP email. Please try again later.');
        }
      }
      return;
    }

    // Mock driver for development
    log.info('Password reset OTP generated using mock driver', { email: this.maskEmail(email), otp });
  }

  private getSignupKey(emailHash: string): string {
    return `auth:signup:${emailHash}`;
  }

  private getPasswordResetKey(emailHash: string): string {
    return `auth:password_reset:${emailHash}`;
  }

  private getOtpLockKey(emailHash: string): string {
    return `auth:otp_lock:${emailHash}`;
  }

  private getRefreshTokenExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    return expiresAt;
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    if (!localPart || !domain) return '***@***.***';

    const maskedLocal = localPart.length > 3
      ? `${localPart.slice(0, 2)}***${localPart.slice(-1)}`
      : `${localPart[0]}***`;

    return `${maskedLocal}@${domain}`;
  }
}

export const authService = new AuthService();
