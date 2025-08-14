import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { TwilioService } from '../services/twilio.service';

// In-memory store for demo accounts (for persistence across sessions)
const demoUsers = new Map<string, any>();

@Injectable()
export class AuthService {
  private passwordResetCodes = new Map<string, { code: string; expires: Date; userId: string }>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    public jwtService: JwtService,
    private twilioService: TwilioService,
  ) {
    // Initialize with a demo user
    this.initializeDemoUsers();
  }

  private async initializeDemoUsers() {
    const demoEmail = 'demo@test.com';
    const hashedPassword = await bcrypt.hash('demo123', 12);
    
    demoUsers.set(demoEmail, {
      id: 'demo_user_1',
      email: demoEmail,
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'owner',
      workspaceId: 'demo_workspace_1',
      avatar: null,
      isEmailVerified: true,
      isPhoneVerified: false,
      twoFactorEnabled: false,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
    });
  }

  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password, firstName, lastName, workspaceName } = registerDto;

    // Check if user already exists in demo store
    if (demoUsers.has(email)) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Check if user already exists in database
    const existingUser = await this.userModel.findOne({ email }).catch(() => null);
    if (existingUser) {
      throw new UnauthorizedException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create workspace ID (simple implementation)
    const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store in demo users for immediate access
    const newUser = {
      id: userId,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: 'owner',
      workspaceId,
      avatar: null,
      isEmailVerified: false,
      isPhoneVerified: false,
      twoFactorEnabled: false,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
    };

    demoUsers.set(email, newUser);

    // Also try to save to database (but don't fail if it doesn't work)
    try {
      const user = new this.userModel({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'owner',
        workspaceId,
        isEmailVerified: false,
        isPhoneVerified: false,
        twoFactorEnabled: false,
        isActive: true,
      });
      await user.save();
    } catch (error) {
      console.log('Database save failed, using in-memory storage:', error.message);
    }

    // Generate JWT token
    const payload = { email: newUser.email, sub: newUser.id, workspaceId };
    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        workspaceId: newUser.workspaceId,
      },
      accessToken,
      message: 'Registration successful',
    };
  }

  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // First check demo users
    const demoUser = demoUsers.get(email);
    if (demoUser) {
      const isPasswordValid = await bcrypt.compare(password, demoUser.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      if (!demoUser.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Update last login
      demoUser.lastLoginAt = new Date();

      // Generate JWT token
      const payload = { email: demoUser.email, sub: demoUser.id, workspaceId: demoUser.workspaceId };
      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          id: demoUser.id,
          email: demoUser.email,
          firstName: demoUser.firstName,
          lastName: demoUser.lastName,
          role: demoUser.role,
          workspaceId: demoUser.workspaceId,
          avatar: demoUser.avatar,
          isEmailVerified: demoUser.isEmailVerified,
          isPhoneVerified: demoUser.isPhoneVerified,
          twoFactorEnabled: demoUser.twoFactorEnabled,
        },
        accessToken,
        message: 'Login successful',
      };
    }

    // Fall back to database
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      const payload = { email: user.email, sub: user._id, workspaceId: user.workspaceId };
      const accessToken = this.jwtService.sign(payload);

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          workspaceId: user.workspaceId,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
          twoFactorEnabled: user.twoFactorEnabled,
        },
        accessToken,
        message: 'Login successful',
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async validateUser(email: string, password: string): Promise<any> {
    // Check demo users first
    const demoUser = demoUsers.get(email);
    if (demoUser && await bcrypt.compare(password, demoUser.password)) {
      const { password: _, ...result } = demoUser;
      return result;
    }

    // Fall back to database
    try {
      const user = await this.userModel.findOne({ email });
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user.toObject();
        return result;
      }
    } catch (error) {
      console.log('Database validation failed, checked demo users');
    }
    return null;
  }

  async findUserById(id: string): Promise<User | null> {
    // Check demo users first
    for (const user of demoUsers.values()) {
      if (user.id === id) {
        return user;
      }
    }

    // Fall back to database
    try {
      return this.userModel.findById(id).select('-password');
    } catch (error) {
      return null;
    }
  }

  // Google OAuth Methods
  async findOrCreateGoogleUser(googleUser: any): Promise<any> {
    // Check demo users first
    const existingDemoUser = demoUsers.get(googleUser.email);
    if (existingDemoUser) {
      return existingDemoUser;
    }

    let user;
    try {
      user = await this.userModel.findOne({ email: googleUser.email });
    } catch (error) {
      console.log('Database check failed, creating demo user');
    }

    if (!user) {
      // Create new user in demo store
      const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = {
        id: userId,
        email: googleUser.email,
        firstName: googleUser.firstName,
        lastName: googleUser.lastName,
        avatar: googleUser.picture,
        workspaceId,
        isEmailVerified: true,
        authProvider: 'google',
        googleId: googleUser.id,
        role: 'owner',
        isActive: true,
        createdAt: new Date(),
      };

      demoUsers.set(googleUser.email, newUser);

      // Try to save to database too
      try {
        user = new this.userModel({
          email: googleUser.email,
          firstName: googleUser.firstName,
          lastName: googleUser.lastName,
          avatar: googleUser.picture,
          workspaceId,
          isEmailVerified: true,
          authProvider: 'google',
          googleId: googleUser.id,
        });
        await user.save();
      } catch (error) {
        console.log('Database save failed, using demo user');
        return newUser;
      }
    }

    return user;
  }

  // SMS-based Password Reset Methods
  async sendPasswordResetSMS(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      // Find user by phone number in demo users
      let user = null;
      for (const demoUser of demoUsers.values()) {
        if (demoUser.phone === phoneNumber) {
          user = demoUser;
          break;
        }
      }

      // Fall back to database
      if (!user) {
        try {
          user = await this.userModel.findOne({ phone: phoneNumber });
        } catch (error) {
          console.log('Database phone lookup failed');
        }
      }

      if (!user) {
        return { success: false, message: 'No account found with this phone number' };
      }

      // Generate 6-digit code
      const code = this.twilioService.generateRandomCode(6);
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store code temporarily
      this.passwordResetCodes.set(phoneNumber, {
        code,
        expires,
        userId: user.id || user._id.toString(),
      });

      // Send SMS
      const sent = await this.twilioService.sendPasswordResetCode(phoneNumber, code);
      
      if (sent) {
        return { success: true, message: 'Reset code sent to your phone' };
      } else {
        return { success: false, message: 'Failed to send reset code' };
      }
    } catch (error) {
      console.error('Password reset SMS error:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  async verifyPasswordResetCode(phoneNumber: string, code: string): Promise<{ success: boolean; message: string; token?: string }> {
    const resetData = this.passwordResetCodes.get(phoneNumber);

    if (!resetData) {
      return { success: false, message: 'No reset code found for this phone number' };
    }

    if (new Date() > resetData.expires) {
      this.passwordResetCodes.delete(phoneNumber);
      return { success: false, message: 'Reset code has expired' };
    }

    if (resetData.code !== code) {
      return { success: false, message: 'Invalid reset code' };
    }

    // Generate temporary reset token
    const resetToken = this.jwtService.sign(
      { userId: resetData.userId, type: 'password_reset' },
      { expiresIn: '15m' }
    );

    // Clean up the code
    this.passwordResetCodes.delete(phoneNumber);

    return { 
      success: true, 
      message: 'Code verified successfully',
      token: resetToken 
    };
  }

  async resetPasswordWithToken(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const decoded = this.jwtService.verify(token);
      
      if (decoded.type !== 'password_reset') {
        return { success: false, message: 'Invalid reset token' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      
      // Update demo user if exists
      for (const [email, user] of demoUsers.entries()) {
        if (user.id === decoded.userId) {
          user.password = hashedPassword;
          demoUsers.set(email, user);
          break;
        }
      }

      // Update database user if exists
      try {
        await this.userModel.findByIdAndUpdate(decoded.userId, {
          password: hashedPassword,
        });
      } catch (error) {
        console.log('Database password update failed, demo user updated');
      }

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: 'Invalid or expired reset token' };
    }
  }
}
