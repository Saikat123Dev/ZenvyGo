import { Router } from 'express';
import { validateBody } from '../../shared/middleware/validate.middleware';
import { asyncHandler } from '../../shared/utils/async-handler';
import { successResponse } from '../../shared/utils/api-response';
import { authService } from './auth.service';
import {
  refreshTokenSchema,
  signupSchema,
  verifyEmailSchema,
  loginSchema,
  forgotPasswordRequestSchema,
  forgotPasswordResetSchema,
  resendOtpSchema,
} from './auth.schemas';

const router = Router();

// Signup - Step 1: Register and send OTP
router.post(
  '/auth/signup',
  validateBody(signupSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.signup(req.body);
    return successResponse(res, result, 'Verification code sent to your email');
  }),
);

// Signup - Step 2: Verify email with OTP
router.post(
  '/auth/verify-email',
  validateBody(verifyEmailSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(req.body);
    return successResponse(res, result, 'Email verified successfully');
  }),
);

// Login with email and password
router.post(
  '/auth/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return successResponse(res, result, 'Logged in successfully');
  }),
);

// Forgot Password - Step 1: Request OTP
router.post(
  '/auth/forgot-password/request',
  validateBody(forgotPasswordRequestSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.forgotPasswordRequest(req.body);
    return successResponse(res, result, 'Password reset code sent to your email');
  }),
);

// Forgot Password - Step 2: Verify OTP and reset password
router.post(
  '/auth/forgot-password/reset',
  validateBody(forgotPasswordResetSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.forgotPasswordReset(req.body);
    return successResponse(res, result, 'Password reset successfully');
  }),
);

// Resend OTP
router.post(
  '/auth/resend-otp',
  validateBody(resendOtpSchema),
  asyncHandler(async (req, res) => {
    // Determine type based on existence of pending signup or password reset
    const result = await authService.resendOtp({
      email: req.body.email,
      type: req.body.type || 'signup', // Default to signup
    });
    return successResponse(res, result, 'Verification code resent');
  }),
);

// Refresh token
router.post(
  '/auth/refresh',
  validateBody(refreshTokenSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    return successResponse(res, result, 'Tokens refreshed');
  }),
);

export const authRouter = router;
