import { Controller, Get, Head } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  root() {
    return {
      name: 'Remodely CRM API',
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  @Head()
  head() {
    return;
  }
}
