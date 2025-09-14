// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    companyName?: string;
    phone?: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

// User Types
export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
    workspaceId: string;
    role: 'admin' | 'user' | 'viewer';
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Address Type
export interface Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
}

// Client Types
export interface Client {
    _id: string;
    workspaceId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
    contactType: 'individual' | 'business';
    status: 'active' | 'inactive' | 'prospect';
    address?: Address;
    notes?: string;
    tags?: string[];
    source?: string;
    referredBy?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateClientRequest {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
    contactType: 'individual' | 'business';
    status?: 'active' | 'inactive' | 'prospect';
    address?: Address;
    notes?: string;
    tags?: string[];
    source?: string;
    referredBy?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {}

// Project Types
export interface Project {
    _id: string;
    workspaceId: string;
    clientId: string;
    name: string;
    description?: string;
    status: 'active' | 'completed' | 'cancelled' | 'on-hold';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    tags?: string[];
    createdAt: Date;
    updatedAt: Date;
    client?: Client;
}

export interface CreateProjectRequest {
    clientId: string;
    name: string;
    description?: string;
    status?: 'active' | 'completed' | 'cancelled' | 'on-hold';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    startDate?: Date;
    endDate?: Date;
    budget?: number;
    tags?: string[];
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

// Estimate Types
export interface EstimateItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    category?: string;
}

export interface Estimate {
    _id: string;
    workspaceId: string;
    clientId: string;
    projectId?: string;
    estimateNumber: string;
    title: string;
    description?: string;
    items: EstimateItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'expired';
    validUntil?: Date;
    terms?: string;
    notes?: string;
    sentAt?: Date;
    viewedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    shareToken?: string;
    createdAt: Date;
    updatedAt: Date;
    client?: Client;
    project?: Project;
}

export interface CreateEstimateRequest {
    clientId: string;
    projectId?: string;
    title: string;
    description?: string;
    items: EstimateItem[];
    taxRate?: number;
    validUntil?: Date;
    terms?: string;
    notes?: string;
}

export interface UpdateEstimateRequest extends Partial<CreateEstimateRequest> {}

// Invoice Types
export interface Invoice {
    _id: string;
    workspaceId: string;
    clientId: string;
    projectId?: string;
    estimateId?: string;
    invoiceNumber: string;
    title: string;
    description?: string;
    items: EstimateItem[];
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    total: number;
    paidAmount: number;
    status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
    dueDate?: Date;
    terms?: string;
    notes?: string;
    sentAt?: Date;
    viewedAt?: Date;
    paidAt?: Date;
    shareToken?: string;
    createdAt: Date;
    updatedAt: Date;
    client?: Client;
    project?: Project;
    payments?: Payment[];
}

export interface Payment {
    _id: string;
    amount: number;
    method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'stripe';
    notes?: string;
    paidAt: Date;
    stripePaymentIntentId?: string;
}

export interface CreateInvoiceRequest {
    clientId: string;
    projectId?: string;
    estimateId?: string;
    title: string;
    description?: string;
    items: EstimateItem[];
    taxRate?: number;
    dueDate?: Date;
    terms?: string;
    notes?: string;
}

export interface UpdateInvoiceRequest extends Partial<CreateInvoiceRequest> {}

export interface RecordPaymentRequest {
    amount: number;
    method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'stripe';
    notes?: string;
    paidAt?: Date;
}

// Communication Types
export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    timestamp: Date;
}

export interface SendEmailRequest {
    to: string;
    subject: string;
    content: string;
    cc?: string[];
    bcc?: string[];
}

export interface SendSmsRequest {
    to: string;
    message: string;
}

export type CommunicationMethod = 'email' | 'sms';

// Notification Types
export interface Notification {
    _id: string;
    workspaceId: string;
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead: boolean;
    actionUrl?: string;
    createdAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T = any> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Dashboard Stats
export interface ActivityItem {
    icon: string;
    description: string;
    timestamp: string;
}

export interface DashboardStats {
    totalClients: number;
    totalEstimates: number;
    totalRevenue: number;
    pendingEstimates: number;
    monthlyRevenue: number;
    overdueInvoices: number;
    newClientsThisMonth: number;
    conversionRate: number;
    convertedEstimates: number;
    overdueAmount: number;
    paidInvoices: number;
    paidAmount: number;
    recentActivity?: ActivityItem[];
}

// Error Types
export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}