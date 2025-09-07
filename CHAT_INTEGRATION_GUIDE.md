# CRM Chat Integration Documentation

## Overview
The CRM chat system now includes full integration with SendGrid (email), Twilio (SMS), Google Maps (location), and appointment scheduling functionality.

## Features

### 🚀 **Enhanced Chat UI**
- **Real-time messaging** with typing indicators
- **Command-based actions** for quick operations
- **Quick action buttons** for common tasks
- **Notification status indicators**
- **Professional message styling**

### 📧 **Email Notifications (SendGrid)**
- **Command**: `/notify email [your message]`
- **Quick Action**: Email button
- **Features**:
  - Professional HTML email templates
  - Delivery tracking
  - Branded email design
  - Contact ID tracking

### 📱 **SMS Notifications (Twilio)**
- **Command**: `/notify sms [your message]`
- **Quick Action**: SMS button
- **Features**:
  - International phone number support
  - Delivery confirmation
  - Contact ID tracking
  - Automatic phone number formatting

### 📅 **Appointment Scheduling**
- **Command**: `/schedule YYYY-MM-DD`
- **Quick Action**: Schedule button
- **Features**:
  - Conflict detection
  - Multiple appointment types
  - Duration tracking
  - Status management

### 🗺️ **Maps & Location Services**
- **Command**: `/location`
- **Quick Action**: Location button
- **Features**:
  - Address geocoding
  - Directions generation
  - Street view integration
  - Shareable map links

## API Endpoints

### Email Notifications
```
POST /api/notifications/email
Body: {
  "to": "user@example.com",
  "subject": "Message Subject",
  "content": "Email content",
  "contactId": "contact_id"
}
```

### SMS Notifications
```
POST /api/notifications/sms
Body: {
  "to": "+1234567890",
  "message": "SMS content",
  "contactId": "contact_id"
}
```

### Appointment Scheduling
```
POST /api/scheduling/create
Body: {
  "contactId": "contact_id",
  "dateTime": "2024-09-07T10:00:00Z",
  "duration": 60,
  "title": "Meeting title",
  "type": "consultation"
}

GET /api/scheduling/create?contactId=123&date=2024-09-07
```

### Maps & Geocoding
```
GET /api/maps/geocode?address=123 Main St, City, State

POST /api/maps/geocode
Body: {
  "origin": "123 Main St",
  "destination": "456 Oak Ave",
  "travelMode": "driving"
}
```

## Setup Instructions

### 1. Environment Variables
Copy `chat-integration.env.template` to `.env.local` and configure:

```bash
# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourcrm.com

# Twilio
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. SendGrid Setup
1. Create account at [SendGrid](https://sendgrid.com)
2. Generate API key with Mail Send permissions
3. Verify sender email address
4. Add API key to environment variables

### 3. Twilio Setup
1. Create account at [Twilio](https://twilio.com)
2. Get Account SID and Auth Token from dashboard
3. Purchase a phone number for SMS sending
4. Add credentials to environment variables

### 4. Google Maps Setup
1. Create project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable Maps JavaScript API and Geocoding API
3. Create API key with appropriate restrictions
4. Add to environment variables

## Chat Commands

### Notification Commands
- `/notify email [message]` - Send email notification
- `/notify sms [message]` - Send SMS notification

### Scheduling Commands
- `/schedule YYYY-MM-DD` - Schedule appointment for date
- `/schedule YYYY-MM-DD HH:MM` - Schedule at specific time

### Location Commands
- `/location` - Get contact's location info
- `/directions [address]` - Get directions to address

## Quick Actions

The chat interface includes quick action buttons for:
- **📅 Schedule** - Quick appointment scheduling
- **🗺️ Location** - Show contact location
- **📧 Email** - Send follow-up email
- **📱 SMS** - Send quick SMS
- **📞 Call** - Initiate phone/video call

## Integration Features

### Automatic Detection
The chat system automatically detects and handles:
- Email addresses for notifications
- Phone numbers for SMS
- Addresses for location services
- Date/time patterns for scheduling

### Status Tracking
- Real-time delivery status for notifications
- Appointment confirmation tracking
- Location service availability
- Integration health monitoring

### Error Handling
- Graceful degradation when services are unavailable
- User-friendly error messages
- Retry mechanisms for failed operations
- Logging for debugging

## Security Considerations

### API Key Protection
- All API keys stored in environment variables
- No client-side exposure of sensitive credentials
- Separate keys for development and production

### Data Privacy
- Contact information encrypted in transit
- No storage of sensitive notification content
- GDPR-compliant data handling
- User consent for notifications

### Rate Limiting
- Built-in protection against API abuse
- Twilio and SendGrid usage monitoring
- Google Maps quota management
- User action throttling

## Monitoring & Analytics

### Notification Tracking
- Email open/click rates (SendGrid)
- SMS delivery confirmation (Twilio)
- Failed notification alerts
- Usage statistics

### Performance Monitoring
- API response times
- Integration uptime tracking
- Error rate monitoring
- User engagement metrics

## Troubleshooting

### Common Issues
1. **API Key Errors**: Verify environment variables are set correctly
2. **SMS Delivery Failures**: Check phone number formatting (+1234567890)
3. **Email Not Received**: Verify sender email is authenticated
4. **Maps Not Loading**: Check API key has proper permissions

### Debug Mode
Enable detailed logging by setting:
```
NODE_ENV=development
DEBUG_CHAT_INTEGRATION=true
```

## Future Enhancements

### Planned Features
- **AI Chat Responses** - Automated intelligent replies
- **Calendar Integration** - Sync with Google/Outlook calendars
- **Video Calling** - Integrated video conferencing
- **File Sharing** - Document and image sharing
- **Voice Messages** - Audio message support
- **Multi-language** - Internationalization support

### Integration Roadmap
- **Slack/Teams** - Workplace chat integration
- **WhatsApp Business** - WhatsApp messaging
- **Zoom/Meet** - Video meeting scheduling
- **CRM Sync** - Real-time CRM data updates
- **Analytics Dashboard** - Communication insights
- **Mobile App** - Native mobile chat experience

## Support

For technical support or feature requests:
- Create GitHub issues for bugs
- Contact development team for integrations
- Check documentation for common solutions
- Review API logs for debugging information
