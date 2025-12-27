/**
 * Types TypeScript pour l'API Django
 * Correspond aux modèles du backend
 */

// ============================================================================
// UTILISATEURS
// ============================================================================

export type UserRole = 'admin' | 'agent' | 'tenant';

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  is_active: boolean;
  date_joined: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

// ============================================================================
// PROPRIÉTÉS
// ============================================================================

export type PropertyType = 'apartment' | 'house' | 'studio' | 'commercial' | 'other';
export type PropertyStatus = 'available' | 'occupied' | 'maintenance';

export interface Property {
  id: number;
  name: string;
  address: string;
  city: string;
  postal_code: string;
  property_type: PropertyType;
  surface: number;
  rooms?: number;
  rent_amount: number;
  charges_amount: number;
  status: PropertyStatus;
  description?: string;
  agent: number;
  agent_name?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyCreateRequest {
  name: string;
  address: string;
  city: string;
  postal_code: string;
  property_type: PropertyType;
  surface: number;
  rooms?: number;
  rent_amount: number;
  charges_amount?: number;
  description?: string;
}

export interface PropertyStats {
  total_properties: number;
  available_properties: number;
  occupied_properties: number;
  maintenance_properties: number;
  total_rent_potential: number;
}

// ============================================================================
// LOCATAIRES / ASSIGNMENTS
// ============================================================================

export interface TenantAssignment {
  id: number;
  tenant: number;
  tenant_name: string;
  tenant_email: string;
  property: number;
  property_name: string;
  property_address: string;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  deposit_amount: number;
  is_active: boolean;
  created_at: string;
}

export interface TenantAssignmentCreateRequest {
  tenant: number;
  property: number;
  start_date: string;
  end_date?: string;
  rent_amount: number;
  deposit_amount: number;
}

export interface TenantWithAssignment extends User {
  assignment?: TenantAssignment;
}

export interface CreateTenantRequest {
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  property_id?: number;
  start_date?: string;
  rent_amount?: number;
  deposit_amount?: number;
}

export interface CreateTenantResponse {
  user: User;
  password: string;
  assignment?: TenantAssignment;
}

// ============================================================================
// PAIEMENTS
// ============================================================================

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'bank_transfer' | 'card' | 'cash' | 'check' | 'other';

export interface Payment {
  id: number;
  assignment: number;
  tenant_name: string;
  property_name: string;
  amount: number;
  due_date: string;
  status: PaymentStatus;
  payment_date?: string;
  payment_method?: PaymentMethod;
  reference?: string;
  notes?: string;
  created_at: string;
}

export interface PaymentCreateRequest {
  assignment: number;
  amount: number;
  due_date: string;
}

export interface RecordPaymentRequest {
  payment_method: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface PaymentStats {
  total_expected: number;
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  payment_rate: number;
}

// ============================================================================
// DASHBOARD
// ============================================================================

export interface DashboardStats {
  total_properties: number;
  total_tenants: number;
  total_rent_collected: number;
  total_overdue: number;
  occupancy_rate: number;
  recent_payments: Payment[];
}

// ============================================================================
// PAGINATION
// ============================================================================

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
