import axios, { AxiosInstance } from 'axios';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Client,
  CreateClientRequest,
  UpdateClientRequest,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
  Estimate,
  CreateEstimateRequest,
  UpdateEstimateRequest,
  Invoice,
  CreateInvoiceRequest,
  UpdateInvoiceRequest,
  RecordPaymentRequest,
  SendEmailRequest,
  SendSmsRequest,
  Notification,
  DashboardStats,
  PaginatedResponse
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3008/api';

class ApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          // Redirect to login or show auth modal
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuth() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', { email, password });
    if (response.data.token) {
      this.setAuthToken(response.data.token);
    }
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  // Client Management
  async getClients(page = 1, limit = 10, search = ''): Promise<PaginatedResponse<Client>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(search && { search })
    });
    const response = await this.api.get(`/clients?${params}`);
    return response.data;
  }

  async getClient(id: string): Promise<Client> {
    const response = await this.api.get(`/clients/${id}`);
    return response.data;
  }

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    const response = await this.api.post('/clients', clientData);
    return response.data;
  }

  async updateClient(id: string, clientData: UpdateClientRequest): Promise<Client> {
    const response = await this.api.patch(`/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: string): Promise<void> {
    const response = await this.api.delete(`/clients/${id}`);
    return response.data;
  }

  // Project Management
  async getProjects(clientId?: string): Promise<Project[]> {
    const params = clientId ? `?clientId=${clientId}` : '';
    const response = await this.api.get(`/projects${params}`);
    return response.data;
  }

  async getProject(id: string): Promise<Project> {
    const response = await this.api.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: CreateProjectRequest): Promise<Project> {
    const response = await this.api.post('/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: UpdateProjectRequest): Promise<Project> {
    const response = await this.api.patch(`/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: string): Promise<void> {
    const response = await this.api.delete(`/projects/${id}`);
    return response.data;
  }

  // Estimate Management
  async getEstimates(clientId?: string): Promise<Estimate[]> {
    const params = clientId ? `?clientId=${clientId}` : '';
    const response = await this.api.get(`/estimates${params}`);
    return response.data;
  }

  async getEstimate(id: string): Promise<Estimate> {
    const response = await this.api.get(`/estimates/${id}`);
    return response.data;
  }

  async createEstimate(estimateData: CreateEstimateRequest): Promise<Estimate> {
    const response = await this.api.post('/estimates', estimateData);
    return response.data;
  }

  async updateEstimate(id: string, estimateData: UpdateEstimateRequest): Promise<Estimate> {
    const response = await this.api.patch(`/estimates/${id}`, estimateData);
    return response.data;
  }

  async deleteEstimate(id: string): Promise<void> {
    const response = await this.api.delete(`/estimates/${id}`);
    return response.data;
  }

  async sendEstimate(id: string, email: string): Promise<void> {
    const response = await this.api.post(`/estimates/${id}/send`, { email });
    return response.data;
  }

  async approveEstimate(id: string): Promise<Estimate> {
    const response = await this.api.post(`/estimates/${id}/approve`);
    return response.data;
  }

  async convertEstimateToInvoice(id: string): Promise<Invoice> {
    const response = await this.api.post(`/estimates/${id}/convert`);
    return response.data;
  }

  // Invoice Management
  async getInvoices(clientId?: string): Promise<Invoice[]> {
    const params = clientId ? `?clientId=${clientId}` : '';
    const response = await this.api.get(`/invoices${params}`);
    return response.data;
  }

  async getInvoice(id: string): Promise<Invoice> {
    const response = await this.api.get(`/invoices/${id}`);
    return response.data;
  }

  async createInvoice(invoiceData: CreateInvoiceRequest): Promise<Invoice> {
    const response = await this.api.post('/invoices', invoiceData);
    return response.data;
  }

  async updateInvoice(id: string, invoiceData: UpdateInvoiceRequest): Promise<Invoice> {
    const response = await this.api.patch(`/invoices/${id}`, invoiceData);
    return response.data;
  }

  async deleteInvoice(id: string): Promise<void> {
    const response = await this.api.delete(`/invoices/${id}`);
    return response.data;
  }

  async sendInvoice(id: string, email: string): Promise<void> {
    const response = await this.api.post(`/invoices/${id}/send`, { email });
    return response.data;
  }

  async recordPayment(id: string, paymentData: RecordPaymentRequest): Promise<Invoice> {
    const response = await this.api.post(`/invoices/${id}/payments`, paymentData);
    return response.data;
  }

  // Communications
  async sendEmail(emailData: SendEmailRequest): Promise<void> {
    const response = await this.api.post('/communications/email', emailData);
    return response.data;
  }

  async sendSMS(smsData: SendSmsRequest): Promise<void> {
    const response = await this.api.post('/communications/sms', smsData);
    return response.data;
  }

  // Analytics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Get basic counts
      const [clientsResponse, estimatesResponse, invoicesResponse] = await Promise.all([
        this.getClients(),
        this.getEstimates(),
        this.getInvoices()
      ]);

      const clients = (clientsResponse as any).data || clientsResponse || [];
      const estimates = estimatesResponse || [];
      const invoices = invoicesResponse || [];

      // Calculate stats
      const totalRevenue = invoices
        .filter((inv: Invoice) => inv.status === 'paid')
        .reduce((sum: number, inv: Invoice) => sum + inv.total, 0);

      const monthlyRevenue = invoices
        .filter((inv: Invoice) => {
          const paidAt = inv.paidAt ? new Date(inv.paidAt) : null;
          if (!paidAt) return false;
          const now = new Date();
          return paidAt.getMonth() === now.getMonth() && paidAt.getFullYear() === now.getFullYear();
        })
        .reduce((sum: number, inv: Invoice) => sum + inv.total, 0);

      const newClientsThisMonth = clients.filter((client: Client) => {
        const createdAt = new Date(client.createdAt);
        const now = new Date();
        return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
      }).length;

      const approvedEstimates = estimates.filter((est: Estimate) => est.status === 'approved').length;
      const conversionRate = estimates.length > 0 ? (approvedEstimates / estimates.length) * 100 : 0;

      const overdueInvoices = invoices.filter((inv: Invoice) => {
        if (inv.status === 'paid' || !inv.dueDate) return false;
        return new Date(inv.dueDate) < new Date();
      }).length;

      const overdueAmount = invoices
        .filter((inv: Invoice) => {
          if (inv.status === 'paid' || !inv.dueDate) return false;
          return new Date(inv.dueDate) < new Date();
        })
        .reduce((sum: number, inv: Invoice) => sum + (inv.total - inv.paidAmount), 0);

      const paidInvoices = invoices.filter((inv: Invoice) => inv.status === 'paid').length;
      const paidAmount = invoices
        .filter((inv: Invoice) => inv.status === 'paid')
        .reduce((sum: number, inv: Invoice) => sum + inv.total, 0);

      // Generate recent activity
      const recentActivity = [
        {
          icon: '👥',
          description: `${newClientsThisMonth} new clients added this month`,
          timestamp: 'This month'
        },
        {
          icon: '💰',
          description: `${monthlyRevenue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} revenue generated this month`,
          timestamp: 'This month'
        },
        {
          icon: '📋',
          description: `${estimates.filter((est: Estimate) => est.status === 'sent').length} estimates awaiting response`,
          timestamp: 'Current'
        }
      ].filter(activity => !activity.description.startsWith('0 new clients'));

      return {
        totalClients: clients.length,
        totalEstimates: estimates.length,
        totalRevenue,
        pendingEstimates: estimates.filter((est: Estimate) => est.status === 'sent').length,
        monthlyRevenue,
        overdueInvoices,
        newClientsThisMonth,
        conversionRate,
        convertedEstimates: approvedEstimates,
        overdueAmount,
        paidInvoices,
        paidAmount,
        recentActivity
      };
    } catch (error) {
      // Return default stats if API calls fail
      return {
        totalClients: 0,
        totalEstimates: 0,
        totalRevenue: 0,
        pendingEstimates: 0,
        monthlyRevenue: 0,
        overdueInvoices: 0,
        newClientsThisMonth: 0,
        conversionRate: 0,
        convertedEstimates: 0,
        overdueAmount: 0,
        paidInvoices: 0,
        paidAmount: 0,
        recentActivity: []
      };
    }
  }

  async getClientStats(clientId: string): Promise<{
    totalProjects: number;
    totalRevenue: number;
    pendingInvoices: number;
    lastInteraction?: Date;
  }> {
    const response = await this.api.get(`/clients/${clientId}/overview`);
    return response.data;
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    const response = await this.api.get('/notifications');
    return response.data;
  }

  async markNotificationRead(id: string): Promise<void> {
    const response = await this.api.patch(`/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsRead(): Promise<void> {
    const response = await this.api.post('/notifications/mark-all-read');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

// Create and export singleton instance
const apiService = new ApiService();

// Initialize auth token from localStorage if available
const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  apiService.setAuthToken(savedToken);
}

export default apiService;