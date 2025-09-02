import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { google } from 'googleapis';

@Injectable()
export class GoogleCalendarService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getStatus(userId: string) {
    const user = await this.userModel.findById(userId).select('googleAuth email firstName');
    if (!user) throw new UnauthorizedException('User not found');
    const connected = !!(user.googleAuth?.accessToken || user.googleAuth?.refreshToken);
    return {
      connected,
      hasRefreshToken: !!user.googleAuth?.refreshToken,
      email: user.email,
    };
  }

  private getOAuthClient(user: UserDocument) {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri =
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback';
    const oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    if (user.googleAuth?.accessToken || user.googleAuth?.refreshToken) {
      oAuth2Client.setCredentials({
        access_token: user.googleAuth?.accessToken,
        refresh_token: user.googleAuth?.refreshToken,
      });
    }
    return oAuth2Client;
  }

  async listEvents(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.googleAuth?.accessToken && !user.googleAuth?.refreshToken) {
      return { connected: false, events: [] };
    }
    const auth = this.getOAuthClient(user);
    const calendar = google.calendar({ version: 'v3', auth });
    const now = new Date().toISOString();
    const resp = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return { connected: true, events: resp.data.items || [] };
  }

  async createEvent(
    userId: string,
    event: { summary: string; description?: string; start: string; end: string }
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    if (!user.googleAuth?.accessToken && !user.googleAuth?.refreshToken) {
      throw new UnauthorizedException('Google Calendar not connected');
    }
    const auth = this.getOAuthClient(user);
    const calendar = google.calendar({ version: 'v3', auth });
    const insert = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start },
        end: { dateTime: event.end },
      },
    });
    return insert.data;
  }
}
