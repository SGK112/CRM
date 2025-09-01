import { Controller, Post, Body, UseGuards, Request, Get, Req, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { EmailVerificationService } from './email-verification.service';

@ApiTags('Authentication')
// Controller base is '/auth'. With global prefix 'api', most routes are available under '/api/auth/*'.
// We also expose '/auth/google' and '/auth/google/callback' without the prefix (configured in main.ts exclusions)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private emailVerificationService: EmailVerificationService,
  ) {}
  private readonly logger = new Logger('AuthController');

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and workspace' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    
    // Send verification email after successful registration
    if (result.user && result.user.email) {
      try {
        const emailResult = await this.emailVerificationService.sendVerificationEmail({
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName
        });
        this.logger.log(`Verification email send attempted for: ${result.user.email}`);
        if (emailResult?.verificationUrl) {
          // Attach a dev-only hint to the response
          (result as unknown as { verificationUrl?: string }).verificationUrl = emailResult.verificationUrl;
        }
      } catch (emailError: unknown) {
        const stack = typeof emailError === 'object' && emailError && 'stack' in emailError ? String((emailError as { stack?: string }).stack) : undefined;
        this.logger.error('Failed to send verification email', stack || String(emailError));
        // Don't fail registration if email fails
      }
    }
    
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset via SMS' })
  @ApiResponse({ status: 200, description: 'Password reset SMS sent' })
  async forgotPassword(@Body() body: { phoneNumber: string }) {
    return this.authService.sendPasswordResetSMS(body.phoneNumber);
  }

  @Post('verify-reset-code')
  @ApiOperation({ summary: 'Verify password reset code' })
  @ApiResponse({ status: 200, description: 'Code verified successfully' })
  async verifyResetCode(@Body() body: { phoneNumber: string; code: string }) {
    return this.authService.verifyPasswordResetCode(body.phoneNumber, body.code);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPasswordWithToken(body.token, body.newPassword);
  }

  // Google OAuth Routes
  // Note: With global prefix 'api', this is available at /api/auth/google; we also allow /auth/google via prefix exclusion.
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Initiates Google OAuth flow
  }

  // Callback supports both /api/auth/google/callback and /auth/google/callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    // Persist Google OAuth tokens if available
  try {
      const uid = req.user?._id || req.user?.id;
      if (uid && (req.user?.accessToken || req.user?.refreshToken)) {
    // Update DB user when possible
        try {
          // Lazily require to avoid circulars at module load
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const mongoose = require('mongoose');
          const UserModel = mongoose.models.User || mongoose.model('User');
          if (UserModel?.findById) {
            const u = await UserModel.findById(uid);
            if (u) {
              u.googleAuth = {
                ...(u.googleAuth || {}),
                accessToken: req.user.accessToken,
                refreshToken: req.user.refreshToken,
              };
              await u.save();
            }
          }
        } catch {
          // In demo mode, or if model not available, skip silently
        }
      }
    } catch {
      // non-fatal – continue login flow
    }

    // Generate JWT for the authenticated user
    const userId = req.user?._id || req.user?.id; // demo users store id, db users _id
    const workspaceId = req.user?.workspaceId || `ws_${Date.now().toString(36)}`;
    const payload = {
      email: req.user.email,
      sub: userId,
      workspaceId,
    };
    const accessToken = this.authService.jwtService.sign(payload);

    // Redirect to frontend with token
  // Prefer FRONTEND_URL (backend env), then NEXT_PUBLIC_FRONTEND_URL (legacy), then localhost
  const frontendUrlRaw = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
  const frontendUrl = frontendUrlRaw.trim();
    const prodSafeUrl = frontendUrl.includes('localhost') && process.env.NODE_ENV === 'production'
      ? 'https://crm-h137.onrender.com'
      : frontendUrl;
  const finalRedirect = `${prodSafeUrl.replace(/\/$/, '')}/auth/google/success?token=${accessToken}`;
    this.logger.log(`Google login redirect -> ${finalRedirect} (FRONTEND_URL='${process.env.FRONTEND_URL}', NEXT_PUBLIC_FRONTEND_URL='${process.env.NEXT_PUBLIC_FRONTEND_URL}', NODE_ENV='${process.env.NODE_ENV}')`);
    res.redirect(finalRedirect);
  }

  @Get('google/debug')
  @ApiOperation({ summary: 'Debug Google OAuth frontend redirect config' })
  async googleDebug() {
    return {
      FRONTEND_URL: process.env.FRONTEND_URL || null,
      NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || null,
      NODE_ENV: process.env.NODE_ENV || null,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || null,
      computedSuccessRedirectBase: (() => {
        const frontendUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';
        if (frontendUrl.includes('localhost') && process.env.NODE_ENV === 'production') {
          return 'https://crm-h137.onrender.com';
        }
        return frontendUrl;
      })(),
    };
  }

  // Email Verification Endpoints
  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address with token' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() body: { token: string }) {
    return this.emailVerificationService.verifyEmail(body.token);
  }

  @Post('resend-verification')
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Email already verified or user not found' })
  async resendVerification(@Body() body: { email: string }) {
    return this.emailVerificationService.resendVerificationEmail(body.email);
  }

  @Get('verification-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check email verification status' })
  @ApiResponse({ status: 200, description: 'Verification status retrieved' })
  async getVerificationStatus(@Request() req) {
    return this.emailVerificationService.checkVerificationStatus(req.user.id);
  }
}
