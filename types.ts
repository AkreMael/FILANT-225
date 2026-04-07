
export enum Tab {
  Profile = 'Profile',
  Menu = 'Menu',
  Offer = 'Offer',
  Emergency = 'Emergency',
  WavePayment = 'WavePayment',
  Map = 'Map',
  Card = 'Card',
  Payment = 'Payment',
  AdminLogin = 'AdminLogin',
  AdminDashboard = 'AdminDashboard',
  Notifications = 'Notifications',
  Scanner = 'Scanner',
  AdminChat = 'AdminChat',
  UserChat = 'UserChat',
  AvailabilityCalendar = 'AvailabilityCalendar',
  Reviews = 'Reviews'
}

export interface User {
  id?: string;
  userId?: string; // Firebase Auth UID
  name: string;
  city: string;
  phone: string;
  role?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  status?: 'active' | 'pending' | 'blocked';
  activeSessionId?: string;
  pin?: string; // 4-digit PIN
  cardActivationDate?: string; // ISO string
  cardExpirationDate?: string; // ISO string
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  isRead: boolean;
}

export interface Worker {
  id: string;
  name: string;
  profileImageUrl: string;
  phone: string;
  rating: number;
  description: string;
  category: string;
  isVerified?: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface PersonalRequest {
  id: string;
  type: 'Location' | 'Travailleur';
  title: string;
  name: string;
  city: string;
  phone: string;
  description: string;
  interventionPlace?: string; // Specific to Location
  rawAnswers?: Record<string, string | null>;
  totalPrice?: number;
}

export interface FavoriteRequest {
  id: string;
  title: string;
  date: string; // ISO string
  formType: 'worker' | 'location' | 'personal_worker' | 'personal_location' | 'night_service' | 'rapid_building_service';
  answers: Record<string, string | null>;
  userInfo: User;
  totalPrice?: number;
}

export interface PrivateRegistration {
  id: string;
  userId: string;
  createdAt: any;
  status: 'pending' | 'approved' | 'rejected';
  typeInscription: string;
  price: number;
  title: string;
  category: string;
  phone: string;
  data: any;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  workerId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Intervention {
  id: string;
  userId: string;
  workerId: string;
  workerName: string;
  serviceType: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  price?: number;
}

export interface Availability {
  id: string; // workerId_date
  workerId: string;
  date: string; // YYYY-MM-DD
  slots: string[]; // ["08:00", "09:00", ...]
}
