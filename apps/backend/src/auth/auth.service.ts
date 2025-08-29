import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
    // If already seeded skip
    if (demoUsers.has(demoEmail)) return;
    const hashedPassword = await bcrypt.hash('demo123', 12);
    // Ensure a persistent DB record exists so JWT sub remains valid after restarts.
    let dbUser: any = null;
    try {
      dbUser = await this.userModel.findOne({ email: demoEmail });
      if (!dbUser) {
        dbUser = new this.userModel({
          email: demoEmail,
          password: hashedPassword,
          firstName: 'Demo',
          lastName: 'User',
          role: 'owner',
          workspaceId: 'demo_workspace_1',
          phone: '+1234567890', // Add demo phone number
          isEmailVerified: true,
          isPhoneVerified: false,
          twoFactorEnabled: false,
          isActive: true,
        });
        await dbUser.save();
      }
    } catch {/* swallow */}
    const stableId = dbUser?._id?.toString() || 'demo_user_1';
    demoUsers.set(demoEmail, {
      id: stableId,
      email: demoEmail,
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
      role: 'owner',
      workspaceId: 'demo_workspace_1',
      phone: '+1234567890', // Add demo phone number
      avatar: null,
      isEmailVerified: true,
      isPhoneVerified: false,
      twoFactorEnabled: false,
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date(),
    });
  }

  async register(createUserDto: RegisterDto): Promise<{ message: string; user: any; token?: string }> {
    console.log('🔵 Registration attempt for:', createUserDto.email);
    
    try {
      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
      console.log('🔍 Existing user check:', existingUser ? 'Found' : 'Not found');
      
      if (existingUser) {
        console.log('❌ User already exists:', createUserDto.email);
        throw new BadRequestException('User with this email already exists');
      }

      // Generate workspace ID
      const workspaceId = new Types.ObjectId().toString();
      console.log('🏢 Generated workspace ID:', workspaceId);

      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      console.log('🔐 Password hashed successfully');

      // Create user object
      const userDoc = new this.userModel({
        email: createUserDto.email,
        password: hashedPassword,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: 'owner', // First user becomes workspace owner
        workspaceId: workspaceId,
        phone: createUserDto.phone,
        isEmailVerified: false,
        isActive: true,
        subscriptionPlan: 'starter',
        subscriptionStatus: 'trialing',
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
      });

      console.log('👤 Created user document');

      // Save user
      const savedUser = await userDoc.save();
      console.log('💾 User saved to database:', savedUser._id);

      // TODO: Send email verification - will be triggered by email verification service
      console.log('📧 Email verification will be handled by separate service call');

      // Return response
      const responseUser = {
        id: savedUser._id,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        role: savedUser.role,
        workspaceId: savedUser.workspaceId,
        phone: savedUser.phone,
        subscriptionPlan: savedUser.subscriptionPlan,
        subscriptionStatus: savedUser.subscriptionStatus,
        trialEndsAt: savedUser.trialEndsAt,
        isEmailVerified: savedUser.isEmailVerified,
        isActive: savedUser.isActive,
        createdAt: (savedUser as any).createdAt
      };

      console.log('✅ Registration successful for:', createUserDto.email);

      return {
        message: 'User registered successfully. Please check your email to verify your account.',
        user: responseUser
      };

    } catch (error) {
      console.error('❌ Registration error:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Registration failed: ' + error.message);
    }
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

      // Check if email is verified
      if (!user.isEmailVerified) {
        throw new UnauthorizedException('Please verify your email address before logging in. Check your inbox for a verification email.');
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

  async findUserByEmail(email: string): Promise<User | null> {
    // check in-memory first
    const mem = demoUsers.get(email);
    if (mem) return mem;
    try {
      return this.userModel.findOne({ email }).select('-password');
    } catch { return null; }
  }

  // Google OAuth Methods
  async findOrCreateGoogleUser(googleUser: any): Promise<any> {
    // Check demo users first
    const existingDemoUser = demoUsers.get(googleUser.email);
    if (existingDemoUser) {
      // Special handling for super admin
      if (googleUser.email === 'help.remodely@gmail.com') {
        existingDemoUser.role = 'owner';
        existingDemoUser.subscriptionPlan = 'growth';
        existingDemoUser.subscriptionStatus = 'active';
        existingDemoUser.workspaceId = 'super_admin_workspace';
        demoUsers.set(googleUser.email, existingDemoUser);
      }
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
      const workspaceId = googleUser.email === 'help.remodely@gmail.com' 
        ? 'super_admin_workspace' 
        : `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        role: googleUser.email === 'help.remodely@gmail.com' ? 'owner' : 'owner',
        isActive: true,
        subscriptionPlan: googleUser.email === 'help.remodely@gmail.com' ? 'growth' : 'free',
        subscriptionStatus: googleUser.email === 'help.remodely@gmail.com' ? 'active' : 'active',
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
          role: googleUser.email === 'help.remodely@gmail.com' ? 'owner' : 'owner',
          subscriptionPlan: googleUser.email === 'help.remodely@gmail.com' ? 'growth' : 'free',
          subscriptionStatus: googleUser.email === 'help.remodely@gmail.com' ? 'active' : 'active',
        });
        await user.save();
      } catch (error) {
        console.log('Database save failed, using demo user');
        return newUser;
      }
    } else {
      // Update existing user to super admin if it's the help email
      if (googleUser.email === 'help.remodely@gmail.com') {
        try {
          user.role = 'owner';
          user.subscriptionPlan = 'growth';
          user.subscriptionStatus = 'active';
          user.workspaceId = 'super_admin_workspace';
          await user.save();
        } catch (error) {
          console.log('Database update failed for super admin');
        }
      }
    }

    return user;
  }

  // SMS-based Password Reset Methods
  async sendPasswordResetSMS(phoneNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`🔄 Password reset request for phone: ${phoneNumber}`);
      
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
          console.log('Database phone lookup failed, only demo users available');
        }
      }

      if (!user) {
        console.log(`❌ No user found with phone: ${phoneNumber}`);
        return { success: false, message: 'No account found with this phone number' };
      }

      console.log(`✅ User found: ${user.email || user.firstName}`);

      // Generate 6-digit code
      const code = this.twilioService.generateRandomCode(6);
      const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Store code temporarily
      this.passwordResetCodes.set(phoneNumber, {
        code,
        expires,
        userId: user.id || user._id?.toString(),
      });

      console.log(`🔑 Generated reset code: ${code} (expires: ${expires})`);

      // Send SMS
      const sent = await this.twilioService.sendPasswordResetCode(phoneNumber, code);
      
      if (sent) {
        console.log(`✅ Reset SMS sent successfully to ${phoneNumber}`);
        return { success: true, message: 'Reset code sent to your phone. Check your SMS messages.' };
      } else {
        console.log(`❌ Failed to send SMS to ${phoneNumber}`);
        return { success: false, message: 'Failed to send reset code. Please try again.' };
      }
    } catch (error) {
      console.error('Password reset SMS error:', error);
      return { success: false, message: 'An error occurred while sending the reset code' };
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
