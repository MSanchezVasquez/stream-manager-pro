export type StreamingPlatform =
  | "Amazon Prime Video"
  | "Apple TV"
  | "Crunchyroll"
  | "DGO"
  | "Disney+"
  | "Disney+ Estándar"
  | "Disney+ Premium"
  | "Flujo TV"
  | "HBO Max"
  | "Max"
  | "Movistar TV"
  | "NBA League Pass"
  | "Netflix"
  | "Netflix Perfil Privado"
  | "Paramount Plus"
  | "Spotify Premium"
  | "Telelatino"
  | "Vix Premium"
  | "Youtube Premium"
  | "Otro";

export type SubscriptionStatus = "active" | "expired" | "warning" | "inactive";

export interface ClientSubscription {
  id: string;
  clientId: string;
  clientName: string;
  serviceName: StreamingPlatform;
  hireDate: string; // YYYY-MM-DD or DD/MM/YY
  cutDate: string; // YYYY-MM-DD or DD/MM/YY
  email?: string;
  password?: string;
  profileName?: string;
  pin?: string;
  status: SubscriptionStatus;
  supplierName?: string;
  notes?: string;
  price?: number;
}

export interface Client {
  id: string;
  name: string;
  status: "active" | "inactive";
  phone?: string;
  notes?: string;
  createdAt: string;
  subscriptions: ClientSubscription[];
}

export interface SupplierAccount {
  id: string;
  supplierId: string;
  supplierName: string;
  serviceName: StreamingPlatform;
  email: string;
  password: string;
  expirationDate: string;
  browser?: string;
  webmailUrl?: string;
  notes?: string;
  status: "active" | "expired" | "revision";
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo?: string;
  notes?: string;
  accounts: SupplierAccount[];
}

export interface FreeProfile {
  id: string;
  serviceName: StreamingPlatform;
  quantity: number;
  email: string;
  password: string;
  browser?: string;
  notes?: string;
}

export interface QuickLink {
  id: string;
  title: string;
  url: string;
  category?: string;
}

export interface SystemStats {
  totalActiveClients: number;
  totalInactiveClients: number;
  totalActiveSubscriptions: number;
  expiringIn7Days: number;
  totalSuppliers: number;
  totalFreeProfiles: number;
}
