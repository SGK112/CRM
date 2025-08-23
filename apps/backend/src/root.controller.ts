import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class RootController {
  // Root endpoint (available at both / and /api)
  @Get()
  root() {
    return {
      name: 'Remodely CRM API',
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0',
      endpoints: {
        api: '/api',
        health: '/api/health', 
        docs: '/api/docs'
      }
    };
  }

  // HEAD endpoint for health checks and monitoring
  @Head()
  head() {
    // Return nothing for HEAD requests (only headers are sent)
    return;
  }
}
