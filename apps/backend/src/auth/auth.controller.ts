import { Controller, Post, Body, UseGuards, Request, Get, Req, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, PasswordResetDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Authentication')
// Support both legacy '/auth' and prefixed '/api/auth' paths so production URL /api/auth/google works
@Controller(['auth','api/auth'])
export class AuthController {
  constructor(private authService: AuthService) {}
  private readonly logger = new Logger('AuthController');

  @Post('register')
  @ApiOperation({ summary: 'Register a new user and workspace' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
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
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth(@Req() req) {
    // Initiates Google OAuth flow
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthRedirect(@Req() req, @Res() res) {
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
}
