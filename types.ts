
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
  UserChat = 'UserChat'
}

export interface User {
  id?: string;
  name: string;
  city: string;
  phone: string;
  role?: string;
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
  formType: 'worker' | 'location' | 'personal_worker' | 'personal_location' | 'night_service';
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
