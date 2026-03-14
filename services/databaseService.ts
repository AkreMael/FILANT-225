import { User, Worker, Offer, FavoriteRequest, PersonalRequest, Notification } from '../types';

// --- CONSTANTS ---
const USERS_KEY = 'filant_users';
const CONNECTION_LOGS_KEY = 'filant_connection_logs';
const FAVORITES_KEY_PREFIX = 'filant_user_favorites_';
const CONTACTS_KEY_PREFIX = 'filant_user_contacts_';
const REQUESTS_KEY_PREFIX = 'filant_user_requests_';
const CARD_KEY_PREFIX = 'filant_user_card_';
const CHAT_KEY_PREFIX = 'filant_chat_history_';
const NOTIFICATIONS_KEY_PREFIX = 'filant_user_notifications_';
const ASSOCIATIONS_KEY = 'filant_admin_associations';
const ACTIVE_CONTACTS_KEY = 'filant_admin_active_contacts';
const ADMIN_CONTACTS_KEY = 'filant_admin_contacts';
const CARD_LIFESPAN_MS = 30 * 24 * 60 * 60 * 1000; // 1 mois
const CHAT_RETENTION_MS = 24 * 60 * 60 * 1000; // Suppression automatique après 24 heures

// --- HELPER FUNCTIONS ---
const getScopedKey = (phone: string, prefix: string) => `${prefix}${phone.replace(/\s/g, '')}`;

// --- User Management ---
const getUsers = (): User[] => {
    try {
        const users = localStorage.getItem(USERS_KEY);
        return users ? JSON.parse(users) : [];
    } catch (e) {
        console.error("Failed to parse users from localStorage", e);
        return [];
    }
};

const saveUsers = (users: User[]) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// --- DATA TYPES ---
export interface SavedContact {
  id: string;
  title: string;
  name: string;
  review: string;
  phone: string;
  city?: string;
}

export interface CardData {
  imageData?: string;
  uploadTimestamp: number;
  isRegularized?: boolean; // Indique si la taxe de 500F a été payée
  hasPaidInitial?: boolean;
  profession?: string;
  companyPhone?: string;
  captureCount?: number; // Nombre d'intégrations de photos
}

export interface AdminContact {
    id: string;
    type: 'TRAVAILLEUR' | 'PROPRIÉTAIRE' | 'AGENCE' | 'CLIENT';
    name: string;
    city: string;
    phone: string;
    // Specific fields
    job?: string; // For Travailleur
    equipmentName?: string; // For Propriétaire
    userName?: string; // For Propriétaire (Nom de l'utilisateur)
    agencyName?: string; // For Agence
    description?: string; // For Client
    createdAt: string;
}

export interface ConnectionLog {
    name: string;
    city: string;
    phone: string;
    lastConnection: string;
    firstConnection: string;
}

export interface Association {
    id: string;
    provider: {
        type: string;
        job: string;
        name: string;
        city: string;
        phone: string;
    };
    client: {
        name: string;
        city: string;
        phone: string;
        description: string;
    };
    createdAt: string;
    status: 'active' | 'terminated';
    isActivated?: boolean;
}

export interface ActiveContact {
    id: string;
    type: 'TRAVAILLEUR' | 'PROPRIÉTAIRE' | 'AGENCE';
    title?: string; // Métier for Travailleur, Titre for Propriétaire
    name: string;
    city: string;
    phone: string;
    description: string;
    activationTimestamp: number | null;
    status: 'active' | 'inactive';
    createdAt: string;
}

export interface StoredChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: number;
}

// --- Mock Data ---
const workerDataList = [
  { name: 'Vendeuse / Vendeur', description: 'Assure la vente, l’accueil des clients et la gestion d’une boutique.', category: 'Disponible' },
  { name: 'Cuisinier / Cuisinière', description: 'Prépare les repas quotidiennement pour restaurant, foyer ou entreprise.', category: 'Disponible' },
  { name: 'Serveur / Serveuse', description: 'Accueille les clients, sert les plats et s’occupe des commandes.', category: 'Disponible' },
  { name: 'Coiffeur / Coiffeuse', description: 'S’occupe des cheveux, coiffure, tresses et soins capillaires.', category: 'Disponible' },
  { name: 'Hôtesse d’accueil', description: 'Accueille les visiteurs, gère les informations et la réception.', category: 'Disponible' },
  { name: 'Chauffeur', description: '(Taxi, VTC, Entreprise) Conduit les clients ou le personnel d’un lieu à un autre.', category: 'Disponible' },
  { name: 'Agent d’entretien / Femme de ménage', description: 'Nettoyeur bureaux et maisons.', category: 'Disponible' },
  { name: 'Caissière / Caissier', description: 'Gère les paiements, la caisse et l’accueil dans les commerces.', category: 'Disponible' },
  { name: 'Réceptionniste', description: 'Accueille les clients dans hôtels, entreprises ou agences.', category: 'Disponible' },
  { name: 'Nounou / Baby-sitter', description: 'Garde les enfants, aide aux devoirs et accompagne la famille.', category: 'Disponible' },
  { name: 'Jardinier', description: 'Entretient les jardins, pelouses, fleurs et espaces verts.', category: 'Disponible' },
  { name: 'Couturière / Couturier', description: 'Coud, répare et crée des vêtements pour clients.', category: 'Disponible' },
  { name: 'Esthéticienne', description: 'Fait les soins du visage, manucure, pédicure, beauté.', category: 'Disponible' },
  { name: 'Magasinier', description: 'Gère les stocks, rangement et réception des marchandises.', category: 'Disponible' },
  { name: 'Manutentionnaire', description: 'Charge, décharge et organise les marchandises.', category: 'Disponible' },
  { name: 'Vigile', description: 'Sécurise l’entrée d’un commerce ou d’un bâtiment.', category: 'Disponible' },
  { name: 'Laveur de vitres Rapide', description: 'Nettoyage professionnel de vitres et surfaces vitrées.', category: 'Disponible' },
  { name: 'Technicien entretien climatisation Rapide', description: 'Entretien, nettoyage et recharge de climatiseurs.', category: 'Disponible' },
  { name: 'Installateur de caméras de surveillance Rapide', description: 'Installation et configuration de systèmes de vidéosurveillance.', category: 'Disponible' },
  { name: 'Fabricant de poufs Rapide', description: 'Création et réparation de poufs et coussins.', category: 'Disponible' },
  { name: 'Installateur de fenêtres et portes vitrées Rapide', description: 'Pose de menuiserie aluminium et vitrerie.', category: 'Disponible' },
  { name: 'Menuisier Rapide', description: 'Travaux de menuiserie bois et réparation de meubles.', category: 'Disponible' },
  { name: 'Aide à domicile', description: 'Services humains', category: 'Disponible' },
  { name: 'Garde malade (jour / nuit)', description: 'Services humains', category: 'Disponible' },
  { name: 'Vente en ligne', description: 'Vend des produits via internet.', category: 'Commerce & Vente' },
  { name: 'Grossiste', description: 'Fournit des produits en grande quantité aux commerçants.', category: 'Commerce & Vente' },
  { name: 'Vente de vêtements', description: 'Propose des vêtements à la vente aux clients.', category: 'Commerce & Vente' },
  { name: 'Cuisinier / Restaurateur', description: 'Prépare et cuisine des plats pour les clients.', category: 'Services' },
  { name: 'Décorateur intérieur', description: 'Aménage et décore des espaces intérieurs.', category: 'Bâtiment & Construction' },
  { name: 'Pose de faux plafond', description: 'Installe des plafond suspendus dans les maisons ou bureaux.', category: 'Bâtiment & Construction' },
  { name: 'Community manager', description: 'Gère les réseaux sociaux pour les entreprises ou projets.', category: 'Numérique & Internet' },
  { name: 'Photographe', description: 'Prend des photos pour événements ou projets.', category: 'Numérique & Internet' },
  { name: 'Vidéaste / Monteur', description: 'Réalise et monte des vidéos.', category: 'Numérique & Internet' },
  { name: 'Manucure / Pédicure', description: 'S’occupe des soins des mains et pieds.', category: 'Beauté & Bien-être' },
  { name: 'Massage', description: 'Pratique des massages pour le bien-être.', category: 'Beauté & Bien-être' },
  { name: 'Maquillage professionnel', description: 'Maquille pour événements ou spectacles.', category: 'Beauté & Bien-être' },
  { name: 'Enseignant privé', description: 'Donne des cours particuliers aux élèves.', category: 'Éducation & Formation' },
];

const mockWorkers: Worker[] = workerDataList.map((worker, index) => ({
  id: `${index + 1}`,
  name: worker.name,
  description: worker.description,
  category: worker.category,
  profileImageUrl: '',
  phone: `+22507050526${32 + index}`,
  rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
}));

const mockOffers: Offer[] = [
    { id: '1', title: 'Service de Nettoyage Pro', description: '20% de réduction pour les nouveaux clients sur le nettoyage de bureaux.', imageUrl: 'https://picsum.photos/seed/nettoyage/500/300' },
    { id: '2', title: 'Chauffeur Privé Express', description: 'Besoin d\'un transport rapide et fiable ? Nos chauffeurs sont à votre service 24/7.', imageUrl: 'https://picsum.photos/seed/chauffeur/500/300' },
    { id: '3', title: 'Jardinage et Entretien', description: 'Donnez une nouvelle vie à votre jardin avec nos experts paysagistes.', imageUrl: 'https://picsum.photos/seed/jardinage/500/300' },
    { id: '4', title: 'Soutien Scolaire à Domicile', description: 'Aidez vos enfants à réussir avec des tuteurs qualifiés et expérimentés.', imageUrl: 'https://picsum.photos/seed/ecole/500/300' },
    { id: '5', title: 'Coiffure et Maquillage Pro', description: 'Soyez la plus belle pour vos événements. Services à domicile disponibles.', imageUrl: 'https://picsum.photos/seed/coiffure/500/300' },
    { id: '6', title: 'Agence Immobilière FILANT', description: 'Trouvez la maison de vos rêves with notre catalogue exclusif de propriétés.', imageUrl: 'https://picsum.photos/seed/immobilier/500/300' },
];

// --- Database Service ---

export const databaseService = {
  logConnection: (user: User) => {
    try {
        const logsString = localStorage.getItem(CONNECTION_LOGS_KEY);
        let logs: ConnectionLog[] = logsString ? JSON.parse(logsString) : [];
        const now = new Date().toISOString();
        const existingIndex = logs.findIndex(log => log.phone === user.phone);
        if (existingIndex !== -1) {
            logs[existingIndex].lastConnection = now;
            logs[existingIndex].name = user.name;
            logs[existingIndex].city = user.city;
        } else {
            logs.unshift({
                name: user.name,
                city: user.city,
                phone: user.phone,
                firstConnection: now,
                lastConnection: now
            });
        }
        localStorage.setItem(CONNECTION_LOGS_KEY, JSON.stringify(logs));
    } catch (e) {
        console.error("Error logging connection", e);
    }
  },

  getConnectionLogs: (): ConnectionLog[] => {
      try {
          const logs = localStorage.getItem(CONNECTION_LOGS_KEY);
          return logs ? JSON.parse(logs) : [];
      } catch (e) {
          return [];
      }
  },

  loginUser: async (name: string, phone: string): Promise<User | null> => {
    await new Promise(res => setTimeout(res, 500));
    const users = getUsers();
    const normalizedInputName = name.trim().toLowerCase();
    const normalizedInputPhone = phone.replace(/\s/g, '');
    const user = users.find(u => 
        u.phone === normalizedInputPhone && 
        u.name.trim().toLowerCase() === normalizedInputName
    );
    if (user) {
      databaseService.logConnection(user);
      return user;
    }
    return null;
  },

  registerUser: async (name: string, city: string, phone: string): Promise<{user: User | null, error?: string}> => {
    await new Promise(res => setTimeout(res, 500));
    const users = getUsers();
    const normalizedPhone = phone.replace(/\s/g, '');
    if (users.some(u => u.phone === normalizedPhone)) {
      return { user: null, error: 'Ce numéro de téléphone est déjà enregistré.' };
    }
    const newUser: User = { 
        name: name.trim(), 
        city: city.trim(), 
        phone: normalizedPhone 
    };
    users.push(newUser);
    saveUsers(users);
    databaseService.logConnection(newUser);
    return { user: newUser };
  },
  
  getWorkers: async (): Promise<Worker[]> => {
    try {
      const response = await fetch('/api/workers');
      if (response.ok) {
        const workers = await response.json();
        if (workers && workers.length > 0) return workers;
      }
    } catch (e) {
      console.error("Failed to fetch workers from API, using mock data", e);
    }
    await new Promise(res => setTimeout(res, 500)); 
    return mockWorkers;
  },

  getOffers: async (): Promise<Offer[]> => {
    try {
      const response = await fetch('/api/offers');
      if (response.ok) {
        const offers = await response.json();
        if (offers && offers.length > 0) return offers;
      }
    } catch (e) {
      console.error("Failed to fetch offers from API, using mock data", e);
    }
    await new Promise(res => setTimeout(res, 800)); 
    return mockOffers;
  },

  saveWorker: async (worker: any) => {
    try {
      const response = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(worker),
      });
      return await response.json();
    } catch (e) {
      console.error("Failed to save worker", e);
      return { success: false, error: e };
    }
  },

  saveOffer: async (offer: any) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(offer),
      });
      return await response.json();
    } catch (e) {
      console.error("Failed to save offer", e);
      return { success: false, error: e };
    }
  },

  saveRecruitment: async (data: any) => {
    try {
      const response = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e) {
      console.error("Failed to save recruitment", e);
      return { success: false, error: e };
    }
  },

  savePlacement: async (data: any) => {
    try {
      const response = await fetch('/api/placement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (e) {
      console.error("Failed to save placement", e);
      return { success: false, error: e };
    }
  },

  getFavorites: (phone: string): FavoriteRequest[] => {
      try {
          const key = getScopedKey(phone, FAVORITES_KEY_PREFIX);
          const favs = localStorage.getItem(key);
          return favs ? JSON.parse(favs) : [];
      } catch (e) {
          return [];
      }
  },

  saveFavorite: (phone: string, request: Omit<FavoriteRequest, 'id'>) => {
      const key = getScopedKey(phone, FAVORITES_KEY_PREFIX);
      const favsString = localStorage.getItem(key);
      const favs: FavoriteRequest[] = favsString ? JSON.parse(favsString) : [];
      const newFav: FavoriteRequest = { ...request, id: Date.now().toString() };
      favs.unshift(newFav);
      if (favs.length > 50) favs.pop();
      localStorage.setItem(key, JSON.stringify(favs));
  },

  removeFavorite: (phone: string, id: string) => {
      const key = getScopedKey(phone, FAVORITES_KEY_PREFIX);
      const favsString = localStorage.getItem(key);
      if (!favsString) return;
      const favs: FavoriteRequest[] = JSON.parse(favsString);
      const updated = favs.filter(f => f.id !== id);
      localStorage.setItem(key, JSON.stringify(updated));
  },

  clearFavorites: (phone: string) => {
      const key = getScopedKey(phone, FAVORITES_KEY_PREFIX);
      localStorage.setItem(key, JSON.stringify([]));
  },

  getContacts: (phone: string): SavedContact[] => {
      try {
          const key = getScopedKey(phone, CONTACTS_KEY_PREFIX);
          const contacts = localStorage.getItem(key);
          return contacts ? JSON.parse(contacts) : [];
      } catch (e) {
          return [];
      }
  },

  saveContacts: (phone: string, contacts: SavedContact[]) => {
      const key = getScopedKey(phone, CONTACTS_KEY_PREFIX);
      localStorage.setItem(key, JSON.stringify(contacts));
  },

  getPersonalRequests: (phone: string): PersonalRequest[] => {
      try {
          const key = getScopedKey(phone, REQUESTS_KEY_PREFIX);
          const reqs = localStorage.getItem(key);
          return reqs ? JSON.parse(reqs) : [];
      } catch (e) {
          return [];
      }
  },

  savePersonalRequests: (phone: string, requests: PersonalRequest[]) => {
      const key = getScopedKey(phone, REQUESTS_KEY_PREFIX);
      localStorage.setItem(key, JSON.stringify(requests));
  },

  getCardData: (phone: string, type: 'pro' | 'service' = 'pro'): CardData | null => {
      try {
          const suffix = type === 'service' ? '_service' : '';
          const key = getScopedKey(phone, CARD_KEY_PREFIX + suffix);
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : null;
      } catch (e) {
          return null;
      }
  },

  saveCardData: (phone: string, data: CardData | null, type: 'pro' | 'service' = 'pro') => {
      const suffix = type === 'service' ? '_service' : '';
      const key = getScopedKey(phone, CARD_KEY_PREFIX + suffix);
      if (data) localStorage.setItem(key, JSON.stringify(data));
      else localStorage.removeItem(key);
  },

  getChatHistory: (phone: string): StoredChatMessage[] => {
      try {
          const key = getScopedKey(phone, CHAT_KEY_PREFIX);
          const historyString = localStorage.getItem(key);
          if (!historyString) return [];
          let history: StoredChatMessage[] = historyString ? JSON.parse(historyString) : [];
          const now = Date.now();
          const validHistory = history.filter(msg => (now - msg.timestamp) < CHAT_RETENTION_MS);
          if (validHistory.length < history.length) localStorage.setItem(key, JSON.stringify(validHistory));
          return validHistory;
      } catch (e) {
          return [];
      }
  },

  saveChatMessage: (phone: string, message: StoredChatMessage) => {
      try {
          const historyKey = getScopedKey(phone, CHAT_KEY_PREFIX);
          const historyString = localStorage.getItem(historyKey);
          let history: StoredChatMessage[] = historyString ? JSON.parse(historyString) : [];
          history.push(message);
          if (history.length > 100) history.shift();
          localStorage.setItem(historyKey, JSON.stringify(history));
      } catch (e) {}
  },

  clearChatHistory: (phone: string) => {
      try {
          const historyKey = getScopedKey(phone, CHAT_KEY_PREFIX);
          localStorage.removeItem(historyKey);
      } catch (e) {}
  },

  // --- Notifications ---
  getNotifications: (phone: string): Notification[] => {
      try {
          const key = getScopedKey(phone, NOTIFICATIONS_KEY_PREFIX);
          const data = localStorage.getItem(key);
          return data ? JSON.parse(data) : [];
      } catch (e) { return []; }
  },

  saveNotifications: (phone: string, notifications: Notification[]) => {
      const key = getScopedKey(phone, NOTIFICATIONS_KEY_PREFIX);
      localStorage.setItem(key, JSON.stringify(notifications));
  },

  addNotification: (phone: string, notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
      const key = getScopedKey(phone, NOTIFICATIONS_KEY_PREFIX);
      const current = databaseService.getNotifications(phone);
      const newNotif: Notification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
          isRead: false
      };
      const updated = [newNotif, ...current];
      localStorage.setItem(key, JSON.stringify(updated));
      return updated;
  },

  clearNotifications: (phone: string) => {
      const key = getScopedKey(phone, NOTIFICATIONS_KEY_PREFIX);
      localStorage.setItem(key, JSON.stringify([]));
  },

  getAssociations: (): Association[] => {
      try {
          const data = localStorage.getItem(ASSOCIATIONS_KEY);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },

  saveAssociations: (associations: Association[]) => {
      localStorage.setItem(ASSOCIATIONS_KEY, JSON.stringify(associations));
  },

  getActiveContacts: (): ActiveContact[] => {
      try {
          const data = localStorage.getItem(ACTIVE_CONTACTS_KEY);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },

  saveActiveContacts: (contacts: ActiveContact[]) => {
      localStorage.setItem(ACTIVE_CONTACTS_KEY, JSON.stringify(contacts));
  },

  getAdminContacts: (): AdminContact[] => {
      try {
          const data = localStorage.getItem(ADMIN_CONTACTS_KEY);
          return data ? JSON.parse(data) : [];
      } catch (e) {
          return [];
      }
  },

  saveAdminContacts: (contacts: AdminContact[]) => {
      localStorage.setItem(ADMIN_CONTACTS_KEY, JSON.stringify(contacts));
  }
};
