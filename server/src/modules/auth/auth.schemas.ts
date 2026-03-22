import { z } from 'zod';

// Signup - Step 1: Register with email, password, and name
export const signupSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  country: z.string().trim().min(2).max(3).default('US'),
  language: z.enum(['en', 'ar']).optional().default('en'),
});

// Signup - Step 2: Verify email with OTP
export const verifyEmailSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otp: z.string().trim().length(6),
});

// Login: Email and password
export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// Forgot Password - Step 1: Request OTP
export const forgotPasswordRequestSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
});

// Forgot Password - Step 2: Verify OTP and reset password
export const forgotPasswordResetSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  otp: z.string().trim().length(6),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

// Resend OTP
export const resendOtpSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  type: z.enum(['signup', 'password-reset']).optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(20),
});
