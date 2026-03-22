import { User, Worker, Offer, FavoriteRequest, PersonalRequest, Notification, PrivateRegistration } from '../types';
import { db, auth, rtdb, storage } from '../firebase';
import { doc, setDoc, serverTimestamp, collection, addDoc, getDocs, query, orderBy, deleteDoc, getDocFromServer, onSnapshot } from 'firebase/firestore';
import { ref as rtdbRef, push, set, serverTimestamp as rtdbTimestamp, get, update, onValue } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, uploadString } from 'firebase/storage';

// --- ENUMS & INTERFACES FOR ERROR HANDLING ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email || undefined,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
    paymentInfo?: any;
    whatsAppPayload?: string;
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
  logConnection: async (user: User) => {
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
        
        // Sync to Firestore
        await databaseService.syncUserToFirestore(user);
    } catch (e) {
        console.error("Error logging connection", e);
    }
  },

  syncUserToFirestore: async (user: User) => {
    if (!user.phone) return;
    const sanitizedPhone = user.phone.replace(/\D/g, '');
    const path = `users/${sanitizedPhone}`;
    
    try {
      if (!auth.currentUser) {
        const { signInAnonymously } = await import('firebase/auth');
        await signInAnonymously(auth);
      }

      const cardDataPro = databaseService.getCardData(user.phone, 'pro');
      const cardDataService = databaseService.getCardData(user.phone, 'service');

      const userRef = doc(db, 'users', sanitizedPhone);
      const userData = {
        userId: auth.currentUser?.uid,
        name: user.name,
        phone: sanitizedPhone,
        city: user.city,
        role: user.role || localStorage.getItem('filant_user_role') || 'Client',
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastConnection: new Date().toISOString(),
        lastModeChange: serverTimestamp(),
        cardDataPro: cardDataPro || null,
        cardDataService: cardDataService || null
      };

      await setDoc(userRef, userData, { merge: true });
      console.log("User synced to Firestore successfully:", user.name);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, path);
    }
  },

  getUserFromFirestore: async (name: string, phone: string): Promise<User | null> => {
    const sanitizedPhone = phone.replace(/\D/g, '');
    const path = `users/${sanitizedPhone}`;
    const userRef = doc(db, 'users', sanitizedPhone);
    
    try {
      if (!auth.currentUser) {
        const { signInAnonymously } = await import('firebase/auth');
        await signInAnonymously(auth);
      }
      const docSnap = await getDocFromServer(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Strict verification: Name must match (case insensitive)
        if (data.name.trim().toLowerCase() === name.trim().toLowerCase()) {
            return {
              name: data.name,
              phone: data.phone,
              city: data.city,
              role: data.role
            };
        }
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
    return null;
  },

  getUserByPhoneFromFirestore: async (phone: string): Promise<User | null> => {
    const sanitizedPhone = phone.replace(/\D/g, '');
    const path = `users/${sanitizedPhone}`;
    const userRef = doc(db, 'users', sanitizedPhone);
    
    try {
      if (!auth.currentUser) {
        const { signInAnonymously } = await import('firebase/auth');
        await signInAnonymously(auth);
      }
      const docSnap = await getDocFromServer(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          name: data.name,
          phone: data.phone,
          city: data.city,
          role: data.role
        };
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, path);
    }
    return null;
  },

  syncUserDataFromCloud: async (user: User) => {
    if (!user.phone) return;
    const sanitizedPhone = user.phone.replace(/\D/g, '');
    
    // 1. Sync Card Data from Firestore
    try {
        const userRef = doc(db, 'users', sanitizedPhone);
        const docSnap = await getDocFromServer(userRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.cardDataPro) {
                databaseService.saveCardData(user.phone, data.cardDataPro, 'pro');
            }
            if (data.cardDataService) {
                databaseService.saveCardData(user.phone, data.cardDataService, 'service');
            }
            console.log("Card data synced from Firestore");
        }
    } catch (e) {
        console.error("Error syncing card data from Firestore:", e);
    }

    // 2. Sync Scanned Contacts from RTDB
    try {
        const { get, child } = await import('firebase/database');
        const sanitizedUserName = (user.name || 'Utilisateur').replace(/[.#$[\]/]/g, '_');
        const userKey = `${sanitizedUserName}_${user.phone}`;
        const dbRef = rtdbRef(rtdb);
        const snapshot = await get(child(dbRef, `scanned_contacts/${userKey}`));
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.contacts) {
                const contactsArray: SavedContact[] = Object.values(data.contacts);
                const key = getScopedKey(user.phone, CONTACTS_KEY_PREFIX);
                localStorage.setItem(key, JSON.stringify(contactsArray));
                console.log("Contacts synced from RTDB for:", userKey);
            }
        }
    } catch (e) {
        console.error("Error syncing data from cloud:", e);
    }
  },

  saveFCMToken: async (user: User, token: string) => {
    if (!user || !user.phone || !token) return;
    
    const sanitizedPhone = user.phone.replace(/\D/g, '');
    const userRef = doc(db, 'users', sanitizedPhone);
    
    try {
      await setDoc(userRef, { fcmToken: token, updatedAt: serverTimestamp() }, { merge: true });
      console.log("FCM Token saved to Firestore for:", user.name);
    } catch (e) {
      console.error("Error saving FCM token to Firestore:", e);
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

  getUserByPhone: (phone: string): User | null => {
    const users = getUsers();
    return users.find(u => u.phone === phone.replace(/\D/g, '')) || null;
  },

  loginUser: async (name: string, phone: string): Promise<{user: User | null, error?: string}> => {
    await new Promise(res => setTimeout(res, 500));
    const users = getUsers();
    const normalizedInputName = name.trim().toLowerCase();
    const normalizedInputPhone = phone.replace(/\D/g, '');
    
    // 1. Check Firestore first (Source of truth)
    console.log("Checking Firestore for user:", normalizedInputPhone);
    const firestoreUser = await databaseService.getUserByPhoneFromFirestore(normalizedInputPhone);
    
    if (firestoreUser) {
        // Strict Name Check
        if (firestoreUser.name.trim().toLowerCase() !== normalizedInputName) {
            return { user: null, error: "Le nom saisi ne correspond pas au numéro enregistré. Veuillez vérifier vos informations." };
        }
        
        // Success - Sync to local
        const user = firestoreUser;
        if (!users.some(u => u.phone === normalizedInputPhone)) {
            users.push(user);
            saveUsers(users);
        }
        
        // Persist role for App.tsx logic
        if (user.role) {
            localStorage.setItem('filant_user_role', user.role);
        }
        
        // Sync their data (contacts, etc.)
        await databaseService.syncUserDataFromCloud(user);
        await databaseService.logConnection(user);
        return { user };
    }
    
    // 2. Fallback to localStorage (if offline or legacy)
    let localUser = users.find(u => 
        u.phone === normalizedInputPhone && 
        u.name.trim().toLowerCase() === normalizedInputName
    );
    
    if (localUser) {
      if (localUser.role) {
          localStorage.setItem('filant_user_role', localUser.role);
      }
      await databaseService.logConnection(localUser);
      return { user: localUser };
    }
    
    return { user: null, error: "Utilisateur non trouvé. Veuillez vous inscrire." };
  },

  registerUser: async (name: string, city: string, phone: string): Promise<{user: User | null, error?: string}> => {
    await new Promise(res => setTimeout(res, 500));
    const users = getUsers();
    const normalizedPhone = phone.replace(/\D/g, '');
    const normalizedName = name.trim().toLowerCase();
    const normalizedCity = city.trim().toLowerCase();
    
    // 1. Check Firestore (Source of truth)
    const existingFirestoreUser = await databaseService.getUserByPhoneFromFirestore(normalizedPhone);
    
    if (existingFirestoreUser) {
        // Strict Verification: Name + City must match
        const dbName = existingFirestoreUser.name.trim().toLowerCase();
        const dbCity = existingFirestoreUser.city.trim().toLowerCase();
        
        if (dbName !== normalizedName || dbCity !== normalizedCity) {
            return { user: null, error: "Ce numéro est déjà enregistré avec un nom ou une ville différente. Veuillez utiliser vos informations d'origine." };
        }
        
        // If they match, it's a recovery
        const user = existingFirestoreUser;
        if (!users.some(u => u.phone === normalizedPhone)) {
            users.push(user);
            saveUsers(users); 
        }
        
        if (user.role) {
            localStorage.setItem('filant_user_role', user.role);
        }
        await databaseService.syncUserDataFromCloud(user);
        databaseService.logConnection(user);
        return { user };
    }

    // 2. Check localStorage (Legacy/Offline)
    const localUser = users.find(u => u.phone === normalizedPhone);
    if (localUser) {
        if (localUser.name.trim().toLowerCase() !== normalizedName || localUser.city.trim().toLowerCase() !== normalizedCity) {
            return { user: null, error: "Ce numéro est déjà enregistré avec des informations différentes localement." };
        }
        return { user: localUser };
    }

    const newUser: User = { 
        name: name.trim(), 
        city: city.trim(), 
        phone: normalizedPhone,
        role: localStorage.getItem('filant_user_role') || 'Client'
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // Sync to Firestore
    await databaseService.syncUserToFirestore(newUser);
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
      // Sync to Firestore
      try {
        const recruitmentRef = collection(db, 'recruitments');
        await addDoc(recruitmentRef, {
          ...data,
          createdAt: serverTimestamp()
        });
        console.log("Recruitment synced to Firestore");
      } catch (fsError) {
        console.error("Error syncing recruitment to Firestore:", fsError);
        if (fsError instanceof Error && fsError.message.includes('permission')) {
          handleFirestoreError(fsError, OperationType.WRITE, 'recruitments');
        }
      }

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

  uploadFile: async (file: File | Blob | string, path: string): Promise<string> => {
    console.time(`Upload to ${path}`);
    try {
      const fileRef = storageRef(storage, path);
      
      if (typeof file === 'string') {
        console.log(`Uploading base64 string to ${path}...`);
        await uploadString(fileRef, file, 'data_url');
      } else {
        console.log(`Uploading blob/file to ${path}...`);
        await uploadBytes(fileRef, file);
      }

      console.log(`Upload complete, getting download URL for ${path}...`);
      const downloadURL = await getDownloadURL(fileRef);
      console.timeEnd(`Upload to ${path}`);
      return downloadURL;
    } catch (e) {
      console.error(`Error uploading file to ${path}:`, e);
      console.timeEnd(`Upload to ${path}`);
      throw e;
    }
  },

  saveRegistration: async (type: string, data: any) => {
    console.log(`Starting ${type} registration save...`, { type, dataKeys: Object.keys(data) });
    const collectionMap: Record<string, string> = {
      'Travailleur': 'travailleurs',
      'Propriétaire d’équipement': 'proprietaires',
      'Agence immobilière': 'agences',
      'Entreprise': 'entreprises'
    };

    try {
      if (!auth.currentUser) {
        console.log("No user logged in, signing in anonymously...");
        const { signInAnonymously } = await import('firebase/auth');
        await signInAnonymously(auth);
      }

      const collectionName = collectionMap[type] || 'other_registrations';
      console.log(`Target collection: ${collectionName}`);
      
      const processedData = { ...data };
      const userId = auth.currentUser?.uid || 'anonymous';

      const registrationRef = collection(db, collectionName);
      let finalData: any = {
        userId,
        createdAt: serverTimestamp(),
        status: 'pending',
        typeInscription: type,
        price: data.price || 310
      };

      // Map fields according to new schemas
      if (type === 'Travailleur') {
        finalData = {
          ...finalData,
          jobTitle: data.titre || '',
          fullName: data.nomPrenom || '',
          city: data.ville || '',
          phone: data.telephone || '',
          whatsapp: data.whatsapp || '',
          experience: data.formation || '',
          workMode: data.local || '',
          birthDate: data.naissance || '',
          email: data.gmail || ''
        };
      } else if (type === 'Propriétaire d’équipement') {
        finalData = {
          ...finalData,
          ownerName: data.titre || '', // In config, labelTitre is "Nom du Propriétaire"
          location: data.ville || '',
          phone: data.telephone || '',
          whatsapp: data.whatsapp || '',
          equipmentType: data.formation || '', // In config, labelRadio is "Type d'accessoires"
          dailyPrice: parseFloat(data.prix) || 0,
          description: data.description || ''
        };
      } else if (type === 'Agence immobilière') {
        finalData = {
          ...finalData,
          agencyName: data.titre || '', // In config, labelTitre is "Nom de l'agence"
          managerName: data.nomPrenom || '',
          city: data.ville || '',
          phone: data.telephone || '',
          whatsapp: data.whatsapp || '',
          services: data.formation ? [data.formation] : [], // In config, labelRadio is "Services"
          interventionZones: data.zones || '',
          description: data.description || ''
        };
      } else if (type === 'Entreprise') {
        finalData = {
          ...finalData,
          companyName: data.titre || '', // In config, labelTitre is "Nom de l'entreprise"
          ownerName: data.nomPrenom || '',
          location: data.ville || '',
          phone: data.telephone || '',
          whatsapp: data.whatsapp || '',
          proposedSalary: data.prix || '',
          description: data.description || '',
          email: data.gmail || ''
        };
      } else {
        finalData = { ...finalData, ...processedData };
      }

      console.log("Saving to Firestore...", finalData);
      const docRef = await addDoc(registrationRef, finalData);
      console.log(`${type} registration saved with ID:`, docRef.id);
      return { success: true, id: docRef.id };
    } catch (e) {
      console.error(`Failed to save ${type} registration:`, e);
      handleFirestoreError(e, OperationType.WRITE, collectionMap[type] || 'registrations');
      return { success: false, error: e };
    }
  },

  saveWorkerRegistration: async (data: any) => {
    return databaseService.saveRegistration('Travailleur', data);
  },

  subscribeToPrivateRegistrations: (callback: (registrations: PrivateRegistration[]) => void) => {
    const collections = ['travailleurs', 'proprietaires', 'agences', 'entreprises'];
    const allRegistrations: Record<string, PrivateRegistration[]> = {};

    const updateAll = () => {
      const merged = Object.values(allRegistrations)
        .flat()
        .sort((a, b) => {
          const timeA = a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });
      callback(merged);
    };

    const unsubscribes = collections.map(colName => {
      return onSnapshot(collection(db, colName), (snapshot) => {
        const registrations = snapshot.docs.map(doc => {
          const data = doc.data();
          let title = '';
          let category = '';
          let phone = '';

          if (colName === 'travailleurs') {
            title = data.jobTitle || 'Sans titre';
            category = 'Profil Travailleur';
            phone = data.phone || '';
          } else if (colName === 'proprietaires') {
            title = data.ownerName || 'Sans titre';
            category = 'Profil Propriétaire';
            phone = data.phone || '';
          } else if (colName === 'agences') {
            title = data.agencyName || 'Sans titre';
            category = 'Profil Agence';
            phone = data.phone || '';
          } else if (colName === 'entreprises') {
            title = data.companyName || 'Sans titre';
            category = 'Profil Entreprise';
            phone = data.phone || '';
          }

          return {
            id: doc.id,
            userId: data.userId,
            createdAt: data.createdAt,
            status: data.status || 'pending',
            typeInscription: data.typeInscription || colName,
            price: data.price || 0,
            title,
            category,
            phone,
            data
          } as PrivateRegistration;
        });

        allRegistrations[colName] = registrations;
        updateAll();
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, colName);
      });
    });

    return () => unsubscribes.forEach(unsub => unsub());
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

  saveContacts: (phone: string, contacts: SavedContact[], user?: User) => {
      const key = getScopedKey(phone, CONTACTS_KEY_PREFIX);
      localStorage.setItem(key, JSON.stringify(contacts));

      // Sync to RTDB if user info is provided
      if (user) {
          try {
              const sanitizedUserName = (user.name || 'Utilisateur').replace(/[.#$[\]/]/g, '_');
              const userKey = `${sanitizedUserName}_${user.phone}`;
              const contactsRef = rtdbRef(rtdb, `scanned_contacts/${userKey}`);
              
              // Create an object where keys are "Nom_Numero"
              const contactsObject: Record<string, any> = {};
              contacts.forEach(c => {
                  const sanitizedContactName = (c.name || 'Inconnu').replace(/[.#$[\]/]/g, '_');
                  const contactKey = `${sanitizedContactName}_${c.phone.replace(/\s+/g, '')}`;
                  contactsObject[contactKey] = {
                      ...c,
                      syncedAt: rtdbTimestamp()
                  };
              });

              set(contactsRef, {
                  contacts: contactsObject,
                  lastUpdated: rtdbTimestamp()
              });
              console.log("Scanned contacts synced to RTDB for:", userKey);
          } catch (e) {
              console.error("Error syncing scanned contacts to RTDB:", e);
          }
      }
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
          
          // Sync to Firestore (async)
          databaseService.syncChatMessageToFirestore(phone, message);
      } catch (e) {}
  },

  syncChatMessageToFirestore: async (phone: string, message: StoredChatMessage) => {
    try {
      const sanitizedPhone = phone.replace(/\D/g, '');
      const user = databaseService.getUserByPhone(phone);
      const userName = user?.name || 'Utilisateur';
      
      // Utilisation d'un ID composé du Nom et du Numéro uniquement, comme demandé
      const messageId = `${userName}_${sanitizedPhone}`;
      const messageRef = doc(db, 'messages', messageId);
      
      await setDoc(messageRef, {
        userId: sanitizedPhone,
        userName: userName,
        role: message.sender,
        content: message.text,
        timestamp: serverTimestamp(),
        paymentInfo: message.paymentInfo || null,
        whatsAppPayload: message.whatsAppPayload || null
      });
      console.log("Chat message synced to Firestore successfully with ID:", messageId);
    } catch (e) {
      console.error("Error syncing chat message to Firestore:", e);
      if (e instanceof Error && (e.message.includes('permission') || e.message.includes('Missing or insufficient permissions'))) {
        handleFirestoreError(e, OperationType.WRITE, 'messages');
      }
    }
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
  },

  getUsersFromFirestore: async (): Promise<User[]> => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('lastSeen', 'desc'));
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data() as User;
        users.push({ ...data, id: doc.id });
      });
      return users;
    } catch (e) {
      console.error("Error getting users from Firestore:", e);
      if (e instanceof Error && (e.message.includes('permission') || e.message.includes('Missing or insufficient permissions'))) {
        handleFirestoreError(e, OperationType.LIST, 'users');
      }
      return [];
    }
  },

  saveAssistantRequestToRTDB: async (requestData: any) => {
    try {
      const { userName, userId } = requestData;
      const sanitizedName = (userName || 'Utilisateur').replace(/[.#$[\]/]/g, '_');
      const userKey = `${sanitizedName}_${userId}`;
      // On crée un sous-dossier par utilisateur pour mieux s'y retrouver
      const requestsRef = rtdbRef(rtdb, `assistant_requests/${userKey}`);
      const newRequestRef = push(requestsRef);
      await set(newRequestRef, {
        ...requestData,
        timestamp: rtdbTimestamp()
      });
      console.log("Assistant request saved to RTDB for:", userKey);
    } catch (e) {
      console.error("Error saving assistant request to RTDB:", e);
    }
  },

  savePaymentToRTDB: async (paymentData: any) => {
    try {
      const { userName, userId } = paymentData;
      const sanitizedName = (userName || 'Utilisateur').replace(/[.#$[\]/]/g, '_');
      const userKey = `${sanitizedName}_${userId}`;
      // On crée un sous-dossier par utilisateur pour mieux s'y retrouver
      const paymentsRef = rtdbRef(rtdb, `wave_payments/${userKey}`);
      const newPaymentRef = push(paymentsRef);
      await set(newPaymentRef, {
        ...paymentData,
        timestamp: rtdbTimestamp()
      });
      console.log("Wave payment saved to RTDB for:", userKey);
    } catch (e) {
      console.error("Error saving payment to RTDB:", e);
    }
  },

  getAssistantRequestsFromRTDB: async (): Promise<any[]> => {
    try {
      const { get } = await import('firebase/database');
      const requestsRef = rtdbRef(rtdb, 'assistant_requests');
      const snapshot = await get(requestsRef);
      if (snapshot.exists()) {
        const allRequests: any[] = [];
        const data = snapshot.val();
        Object.keys(data).forEach(userKey => {
          const userRequests = data[userKey];
          Object.keys(userRequests).forEach(reqId => {
            allRequests.push({
              id: reqId,
              userKey,
              ...userRequests[reqId]
            });
          });
        });
        return allRequests.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
      return [];
    } catch (e) {
      console.error("Error getting assistant requests from RTDB:", e);
      return [];
    }
  },

  getWavePaymentsFromRTDB: async (): Promise<any[]> => {
    try {
      const { get } = await import('firebase/database');
      const paymentsRef = rtdbRef(rtdb, 'wave_payments');
      const snapshot = await get(paymentsRef);
      if (snapshot.exists()) {
        const allPayments: any[] = [];
        const data = snapshot.val();
        Object.keys(data).forEach(userKey => {
          const userPayments = data[userKey];
          Object.keys(userPayments).forEach(payId => {
            allPayments.push({
              id: payId,
              userKey,
              ...userPayments[payId]
            });
          });
        });
        return allPayments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      }
      return [];
    } catch (e) {
      console.error("Error getting wave payments from RTDB:", e);
      return [];
    }
  },

  deleteAssistantRequest: async (userKey: string, reqId: string) => {
    try {
      const { remove } = await import('firebase/database');
      const reqRef = rtdbRef(rtdb, `assistant_requests/${userKey}/${reqId}`);
      await remove(reqRef);
      console.log("Assistant request deleted:", reqId);
    } catch (e) {
      console.error("Error deleting assistant request:", e);
    }
  },

  deleteWavePayment: async (userKey: string, payId: string) => {
    try {
      const { remove } = await import('firebase/database');
      const payRef = rtdbRef(rtdb, `wave_payments/${userKey}/${payId}`);
      await remove(payRef);
      console.log("Wave payment deleted:", payId);
    } catch (e) {
      console.error("Error deleting wave payment:", e);
    }
  },

  // --- ADMIN CHAT (PRIVATE) ---
  async getAdminChatHistory(userId: string): Promise<any[]> {
    const { get } = await import('firebase/database');
    const chatRef = rtdbRef(rtdb, `Chats/${userId}/messages`);
    const snapshot = await get(chatRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data).sort((a: any, b: any) => a.timestamp - b.timestamp);
    }
    return [];
  },

  async saveAdminChatMessage(userId: string, message: any) {
    try {
      const sanitizedUserId = userId.replace(/[.#$[\]/]/g, '_');
      const chatRef = rtdbRef(rtdb, `messages/${sanitizedUserId}`);
      
      const messageId = (typeof message === 'object' && message.id) ? message.id : push(chatRef).key;
      const newMessageRef = rtdbRef(rtdb, `messages/${sanitizedUserId}/${messageId}`);
      
      const msgData = typeof message === 'string' 
        ? {
            id: messageId,
            text: message,
            sender: 'user',
            timestamp: Date.now(),
            read: false,
            userId: sanitizedUserId
          }
        : {
            ...message,
            id: messageId,
            timestamp: message.timestamp || Date.now(),
            read: false,
            userId: sanitizedUserId
          };
      
      // Use Promise.all to run both writes in parallel and handle errors
      await Promise.all([
        set(newMessageRef, msgData),
        setDoc(doc(db, 'messages', sanitizedUserId, 'history', messageId!), {
          ...msgData,
          timestamp: serverTimestamp()
        })
      ]);
      
      console.log("Admin chat message saved successfully to RTDB and Firestore");
      return true;
    } catch (error) {
      console.error("Error saving admin chat message:", error);
      handleFirestoreError(error, OperationType.WRITE, `messages/${userId}`);
      return false;
    }
  },

  async markAdminMessagesAsRead(userId: string, senderToMark: 'admin' | 'user') {
    try {
      const sanitizedUserId = userId.replace(/[.#$[\]/]/g, '_');
      const chatRef = rtdbRef(rtdb, `messages/${sanitizedUserId}`);
      const snapshot = await get(chatRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const updates: any = {};
        Object.keys(data).forEach(key => {
          if (data[key].sender === senderToMark && !data[key].read) {
            updates[`${key}/read`] = true;
          }
        });
        if (Object.keys(updates).length > 0) {
          await update(chatRef, updates);
        }
      }
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  },

  onAdminChatUpdate(userId: string, callback: (messages: any[]) => void) {
    const sanitizedUserId = userId.replace(/[.#$[\]/]/g, '_');
    const chatRef = rtdbRef(rtdb, `messages/${sanitizedUserId}`);
    return onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const messages = Object.values(data).sort((a: any, b: any) => a.timestamp - b.timestamp);
        callback(messages);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error("RTDB Listener Error:", error);
    });
  },

  onUnreadAdminChatCount(userId: string, senderToWatch: 'admin' | 'user', callback: (count: number) => void) {
    const sanitizedUserId = userId.replace(/[.#$[\]/]/g, '_');
    const chatRef = rtdbRef(rtdb, `messages/${sanitizedUserId}`);
    return onValue(chatRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const unreadCount = Object.values(data).filter((msg: any) => msg.sender === senderToWatch && !msg.read).length;
        callback(unreadCount);
      } else {
        callback(0);
      }
    }, (error) => {
      console.error("RTDB Unread Count Error:", error);
    });
  },

  async saveScannedContact(contact: any) {
    try {
      const docRef = await addDoc(collection(db, 'scanned_contacts'), {
        ...contact,
        scannedAt: serverTimestamp()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'scanned_contacts');
      return { success: false, error };
    }
  },

  async getAllScannedContacts() {
    try {
      const q = query(collection(db, 'scanned_contacts'), orderBy('scannedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'scanned_contacts');
      return [];
    }
  },

  async onScannedContactsChange(callback: (contacts: any[]) => void) {
    const q = query(collection(db, 'scanned_contacts'), orderBy('scannedAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(contacts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'scanned_contacts');
    });
  }
};
