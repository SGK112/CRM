import { Controller, Post, Body, UseGuards, Request, Get, Req, Res } from '@nestjs/common';
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
    const payload = { 
      email: req.user.email, 
      sub: req.user._id, 
      workspaceId: req.user.workspaceId 
    };
    const accessToken = this.authService.jwtService.sign(payload);

    // Redirect to frontend with token
    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3002';
    res.redirect(`${frontendUrl}/auth/google/success?token=${accessToken}`);
  }
}
