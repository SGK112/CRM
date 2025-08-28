import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Body, 
  Param, 
  Query,
  UseGuards,
  Req 
} from '@nestjs/common';
import { WalletService, CreateTransactionDto } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('connect')
  async connectWallet(@Body() body: { walletAddress: string }, @Req() req) {
    const userId = req.user.id;
    return await this.walletService.connectTonWallet(userId, body.walletAddress);
  }

  @Post('disconnect')
  async disconnectWallet(@Req() req) {
    const userId = req.user.id;
    const result = await this.walletService.disconnectWallet(userId);
    return { success: result };
  }

  @Get('info')
  async getWalletInfo(@Req() req) {
    const userId = req.user.id;
    return await this.walletService.getWalletInfo(userId);
  }

  @Get('balance')
  async getBalance(@Req() req) {
    const userId = req.user.id;
    const balance = await this.walletService.getWalletBalance(userId);
    return { balance };
  }

  @Put('balance')
  async updateBalance(@Body() body: { balance: string }, @Req() req) {
    const userId = req.user.id;
    await this.walletService.updateBalance(userId, body.balance);
    return { success: true };
  }

  @Get('transactions')
  async getTransactions(@Query('limit') limit: string, @Req() req) {
    const userId = req.user.id;
    const transactions = await this.walletService.getTransactionHistory(
      userId, 
      limit ? parseInt(limit) : 50
    );
    return transactions;
  }

  @Post('payment')
  async createPayment(@Body() body: {
    amount: string;
    description: string;
    clientId?: string;
    projectId?: string;
    invoiceId?: string;
  }, @Req() req) {
    const userId = req.user.id;
    return await this.walletService.processPayment(
      userId,
      body.amount,
      body.description,
      body.clientId,
      body.projectId,
      body.invoiceId
    );
  }

  @Put('transaction/:id/status')
  async updateTransactionStatus(
    @Param('id') id: string,
    @Body() body: { status: 'pending' | 'confirmed' | 'failed'; txHash?: string }
  ) {
    await this.walletService.updateTransactionStatus(id, body.status, body.txHash);
    return { success: true };
  }

  @Get('stats')
  async getWalletStats(@Req() req) {
    const userId = req.user.id;
    return await this.walletService.getWalletStats(userId);
  }

  @Post('transaction')
  async createTransaction(@Body() transactionData: Omit<CreateTransactionDto, 'userId'>, @Req() req) {
    const userId = req.user.id;
    return await this.walletService.createTransaction({
      ...transactionData,
      userId
    });
  }
}
