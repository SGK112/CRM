// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export enum UserRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  SALES_ASSOCIATE = 'sales_associate',
  PROJECT_MANAGER = 'project_manager',
  TEAM_MEMBER = 'team_member',
  CLIENT = 'client',
}

// Project Types
export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: Priority;
  clientId: string;
  assignedTo: string[];
  startDate: Date;
  endDate?: Date;
  budget: number;
  actualCost?: number;
  address: Address;
  images: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export enum ProjectStatus {
  LEAD = 'lead',
  PROPOSAL = 'proposal',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Client Types
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address: Address;
  notes?: string;
  tags: string[];
  socialProfiles: SocialProfile[];
  projects: string[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SocialProfile {
  platform: string;
  username: string;
  url: string;
}

// Appointment Types
export interface Appointment {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  clientId?: string;
  projectId?: string;
  assignedTo: string[];
  location?: string;
  meetingLink?: string;
  notes?: string;
  reminders: Reminder[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  SITE_VISIT = 'site_visit',
  FOLLOW_UP = 'follow_up',
  PROPOSAL_PRESENTATION = 'proposal_presentation',
  PROJECT_MEETING = 'project_meeting',
  INSPECTION = 'inspection',
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface Reminder {
  type: 'email' | 'sms';
  timeBeforeMinutes: number;
  sent: boolean;
}

// Chat Types
export interface ChatMessage {
  id: string;
  content: string;
  type: MessageType;
  senderId: string;
  receiverId?: string;
  channelId?: string;
  attachments: Attachment[];
  isAIGenerated: boolean;
  aiProvider?: 'openai' | 'claude' | 'xai';
  createdAt: Date;
  updatedAt: Date;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
}

// Document Types
export interface Document {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  size: number;
  category: DocumentCategory;
  tags: string[];
  projectId?: string;
  clientId?: string;
  uploadedBy: string;
  isEncrypted: boolean;
  permissions: DocumentPermission[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export enum DocumentCategory {
  CONTRACT = 'contract',
  PROPOSAL = 'proposal',
  PERMIT = 'permit',
  INVOICE = 'invoice',
  BLUEPRINT = 'blueprint',
  PHOTO = 'photo',
  REPORT = 'report',
  OTHER = 'other',
}

export interface DocumentPermission {
  userId: string;
  permission: 'read' | 'write' | 'admin';
}

// Workspace Types
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  settings: WorkspaceSettings;
  ownerId: string;
  members: WorkspaceMember[];
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkspaceMember {
  userId: string;
  role: UserRole;
  permissions: string[];
  joinedAt: Date;
}

export interface WorkspaceSettings {
  timezone: string;
  currency: string;
  dateFormat: string;
  businessHours: BusinessHours;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
}

export interface BusinessHours {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

export interface DayHours {
  isOpen: boolean;
  start: string; // HH:mm format
  end: string; // HH:mm format
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  appointmentReminders: boolean;
  projectUpdates: boolean;
  newMessages: boolean;
}

export interface IntegrationSettings {
  google: GoogleIntegration;
  stripe: StripeIntegration;
  twilio: TwilioIntegration;
  quickbooks: QuickbooksIntegration;
  cloudinary: CloudinaryIntegration;
}

export interface GoogleIntegration {
  enabled: boolean;
  maps: boolean;
  calendar: boolean;
  gmail: boolean;
  drive: boolean;
}

export interface StripeIntegration {
  enabled: boolean;
  publicKey?: string;
  webhookEndpoint?: string;
}

export interface TwilioIntegration {
  enabled: boolean;
  phoneNumber?: string;
}

export interface QuickbooksIntegration {
  enabled: boolean;
  companyId?: string;
}

export interface CloudinaryIntegration {
  enabled: boolean;
  cloudName?: string;
}

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  features: string[];
}

export enum SubscriptionPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  TRIAL = 'trial',
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  twoFactorCode?: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  workspaceName: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  workspace: Workspace;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

// Marketing Types
export interface MarketingCampaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetAudience: string[];
  content: CampaignContent;
  schedule: CampaignSchedule;
  analytics: CampaignAnalytics;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  SOCIAL_MEDIA = 'social_media',
  MIXED = 'mixed',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
}

export interface CampaignContent {
  subject?: string;
  message: string;
  images: string[];
  links: string[];
  hashtags: string[];
}

export interface CampaignSchedule {
  startDate: Date;
  endDate?: Date;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly';
  platforms: string[];
}

export interface CampaignAnalytics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  unsubscribed: number;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  assignedTo: string[];
  projectId?: string;
  clientId?: string;
  dueDate?: Date;
  completedAt?: Date;
  tags: string[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  workspaceId: string;
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  COMPLETED = 'completed',
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
}
