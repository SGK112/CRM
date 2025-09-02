import { EmailService } from './src/services/email.service';
import { ConfigService } from '@nestjs/config';

async function testEmail() {
  // Mock ConfigService with our SendGrid settings
  const mockConfigService = {
    get: (key: string) => {
      const config = {
        SENDGRID_API_KEY: 'your-sendgrid-api-key-here',
        SENDGRID_FROM_EMAIL: 'noreply@remodely.ai',
        SENDGRID_FROM_NAME: 'Remodely CRM',
      };
      return config[key];
    },
  } as ConfigService;

  const emailService = new EmailService(mockConfigService);

  console.log('Testing SendGrid email...');

  try {
    const result = await emailService.sendEmail({
      to: 'test@example.com', // Change this to your email
      subject: 'SendGrid Test from Remodely CRM',
      html: `
        <h1>🚀 SendGrid Integration Test</h1>
        <p>This is a test email from your Remodely CRM system!</p>
        <p><strong>SendGrid Web API is working correctly!</strong></p>
        <p>Sent at: ${new Date().toISOString()}</p>
      `,
      text: 'SendGrid Integration Test - This is a test email from your Remodely CRM system! SendGrid Web API is working correctly!',
    });

    if (result) {
      console.log('✅ Email sent successfully!');
    } else {
      console.log('❌ Email failed to send');
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
}

testEmail();
