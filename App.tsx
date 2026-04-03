import React, { useState, useCallback, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Tab, User } from './types';
import BottomNav from './components/Sidebar';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import LoginScreen from './components/LoginScreen';
import WorkerListScreen from './components/WorkerListScreen';
import RegistrationHubScreen from './components/RegistrationHubScreen';
import TallyFormScreen from './components/TallyFormScreen';
import RegistrationFormScreen from './components/RegistrationFormScreen';
import MyWorkerScreen from './components/MyWorkerScreen';
import LocationScreen from './components/LocationScreen';
import PaymentScreen from './components/PaymentScreen';
import WavePaymentScreen from './components/WavePaymentScreen';
import InteractiveModal from './components/InteractiveModal';
import ChatWidget from './components/ChatWidget';
import AdminLoginScreen from './components/AdminLoginScreen';
import AdminDashboardScreen from './components/AdminDashboardScreen';
import GlobalPopup from './components/common/GlobalPopup';
import SplashScreen from './components/SplashScreen';
import FirstLaunchScreen from './components/FirstLaunchScreen';
import OfferScreen from './components/OfferScreen';
import InterventionShopScreen from './components/InterventionShopScreen';
import GlobalRippleEffect from './components/common/GlobalRippleEffect';
import RegistrationInfoScreen from './components/RegistrationInfoScreen';
import LocationMapScreen from './components/LocationMapScreen';
import NotificationsScreen from './components/NotificationsScreen';
import EmergencyFormScreen from './components/EmergencyFormScreen';
import ScannerOverlay, { extractQRInfo } from './components/ScannerOverlay';
import AssistantQRScreen from './components/AssistantQRScreen';
import PaymentConfirmationScreen from './components/PaymentConfirmationScreen';
import ProfessionalCardScreen from './components/ProfessionalCardScreen';
import ChatScreen from './components/ChatScreen';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import ReviewSystem from './components/ReviewSystem';
import { motion, AnimatePresence } from 'motion/react';
import { databaseService, SavedContact, ConnectionLog } from './services/databaseService';
import { messagingService } from './services/messagingService';
import { isAdmin, getCardType } from './utils/authUtils';
import app from './firebase';
import { getAnalytics } from "firebase/analytics";

import { auth, db } from './firebase';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { doc, getDocFromServer, onSnapshot } from 'firebase/firestore';

// Initialisation Analytics si supporté
if (typeof window !== 'undefined') {
  try {
    getAnalytics(app);
  } catch (e) {
    console.warn("Firebase Analytics not supported in this environment");
  }
}

const maelUser: User = {
  name: 'Mael',
  city: 'Bassam',
  phone: '0705052632',
};

type InteractiveModalContext = {
  formType: 'worker' | 'location' | 'personal_worker' | 'personal_location' | 'night_service' | 'rapid_building_service';
  title: string;
  imageUrl?: string | string[];
  isBlurredImage?: boolean;
  description?: string;
  price?: string;
};

interface PaymentConfirmationContext {
  title: string;
  amount: string;
  waveLink: string;
  paymentType: string;
  onSuccess?: () => void;
  formData?: {
    formType: 'worker' | 'location' | 'personal_worker' | 'personal_location' | 'night_service' | 'rapid_building_service';
    formTitle: string;
    data: any;
    whatsappMessage: string;
  };
}

interface PopupState {
    show: boolean;
    message: string;
    type: 'alert' | 'confirm';
    onConfirm: () => void;
    onCancel: () => void;
    confirmLabel?: string;
    cancelLabel?: string;
    isConfirmLoading?: boolean;
}

const REGISTRATION_URLS: Record<string, string> = {};

const RestrictedNotification = ({ show, message }: { show: boolean, message: string }) => (
  <div className={`absolute top-4 left-4 right-4 z-[400] transition-all duration-500 ease-out transform ${show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
    <div className="bg-red-600 text-white px-4 py-4 rounded-xl shadow-2xl flex items-start gap-3 border-2 border-red-400">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div className="text-sm">
        <p className="font-bold text-base mb-1">Accès refusé</p>
        <p className="opacity-95 leading-relaxed">{message}</p>
      </div>
    </div>
  </div>
);

const GlobalModeLoading = ({ message }: { message: string }) => (
    <div className="absolute inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
        <div className="relative">
            <div className="w-24 h-24 border-4 border-orange-500/20 rounded-full"></div>
            <div className="absolute inset-0 w-24 h-24 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="mt-8 text-2xl font-black text-white uppercase tracking-widest animate-pulse">Chargement</h2>
        <p className="mt-4 text-orange-400 font-bold text-sm max-w-xs">{message}</p>
        <div className="mt-12 flex gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
        </div>
    </div>
);

interface NavigationPoint {
  activeTab: Tab;
  menuView: string;
  offerSubView: 'main' | 'shop';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [hasCompletedFirstLaunch, setHasCompletedFirstLaunch] = useState(() => {
      return localStorage.getItem('filant_has_selected_profile') === 'true';
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.Menu);
  const [menuView, setMenuView] = useState<'hub' | 'worker_list' | 'registration_hub' | 'registration_info' | 'tally_form' | 'custom_registration' | 'my_worker' | 'location_hub' | 'schedule_service_form' | 'location_propose_form' | 'admin_sms' | 'location_hub' | 'location_map' | 'notifications' | 'emergency_form' | 'assistant_qr' | 'admin_connections' | 'admin_active_contacts' | 'admin_associations'>('hub');
  const [offerSubView, setOfferSubView] = useState<'main' | 'shop'>('main');
  
  const [navHistory, setNavHistory] = useState<NavigationPoint[]>([]);

  const navigateTo = useCallback((updates: Partial<NavigationPoint>) => {
    const currentState: NavigationPoint = { activeTab, menuView, offerSubView };
    
    const willChange = 
      (updates.activeTab !== undefined && updates.activeTab !== activeTab) ||
      (updates.menuView !== undefined && updates.menuView !== menuView) ||
      (updates.offerSubView !== undefined && updates.offerSubView !== offerSubView);

    if (willChange) {
      setNavHistory(prev => [...prev, currentState]);
      if (updates.activeTab !== undefined) setActiveTab(updates.activeTab);
      if (updates.menuView !== undefined) setMenuView(updates.menuView as any);
      if (updates.offerSubView !== undefined) setOfferSubView(updates.offerSubView);
    }
  }, [activeTab, menuView, offerSubView]);

  const [chatTargetUser, setChatTargetUser] = useState<User | undefined>(undefined);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showScannerGlobal, setShowScannerGlobal] = useState(false);
  const [paymentConfirmationContext, setPaymentConfirmationContext] = useState<PaymentConfirmationContext | null>(null);
  const [isMiseEnRelationActive, setIsMiseEnRelationActive] = useState(false);
  
  const [isClientModeActive, setIsClientModeActive] = useState(() => {
    const role = localStorage.getItem('filant_user_role');
    return role === 'Client' || !role;
  });
  
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('filant_darkMode');
    return savedMode ? JSON.parse(savedMode) : true;
  });

  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPWA = async () => {
    if (!deferredPrompt) {
        showPopup("Pour installer l'application sur Android :\n1. Appuyez sur les 3 points (⋮) en haut à droite du navigateur.\n2. Sélectionnez 'Installer l'application' ou 'Ajouter à l'écran d'accueil'.", "alert");
        return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
        setDeferredPrompt(null);
    }
  };

  // Authentification anonyme pour Firestore
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Test de connexion selon les directives
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firestore connection test successful");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
        // On ignore les autres erreurs (ex: permission denied sur le doc de test) car c'est juste un test de connectivité
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch(err => console.error("Anonymous sign-in failed:", err));
      } else {
        testConnection();
        // Set the user ID from Firebase Auth
        setCurrentUser(prev => prev ? { ...prev, userId: user.uid } : null);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Firebase Messaging
  useEffect(() => {
    if (currentUser) {
      messagingService.requestPermission(currentUser);
      messagingService.onMessageListener(currentUser.phone);
    }
  }, [currentUser]);

  // Real-time Role Synchronization
  useEffect(() => {
    if (!currentUser || !currentUser.phone) return;

    const sanitizedPhone = currentUser.phone.replace(/\D/g, '');
    const userRef = doc(db, 'users', sanitizedPhone);

    console.log("Setting up real-time role listener for:", sanitizedPhone);

    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const cloudRole = data.role;
        const cloudIsBlocked = data.isBlocked;
        
        // Sync blocked status
        if (cloudIsBlocked !== undefined && cloudIsBlocked !== currentUser.isBlocked) {
          console.log("Blocked status updated from cloud:", cloudIsBlocked);
          setCurrentUser(prev => prev ? { ...prev, isBlocked: cloudIsBlocked } : null);
        }

        // Sync role
        if (cloudRole && cloudRole !== currentUser.role) {
          console.log("Role updated from cloud in real-time:", cloudRole);
          
          // Update local state
          setCurrentUser(prev => prev ? { ...prev, role: cloudRole } : null);
          
          // Update localStorage
          localStorage.setItem('filant_user_role', cloudRole);
          
          // Update UI mode
          if (cloudRole === 'Client') {
            setIsClientModeActive(true);
          } else {
            setIsClientModeActive(false);
            localStorage.setItem('filant_selected_pro_role', cloudRole);
          }
        }
      }
    }, (error) => {
      console.error("Error in real-time role listener:", error);
    });

    return () => unsubscribe();
  }, [currentUser?.phone, currentUser?.name]);

  const [lastNotificationId, setLastNotificationId] = useState<string | null>(null);

  const [locationInitialTab, setLocationInitialTab] = useState<'appartement' | 'equipement'>('appartement');
  const [registrationType, setRegistrationType] = useState<string>('Travailleur');
  const [tallyFormUrl, setTallyFormUrl] = useState<string | null>(null);
  const [scheduleServiceUrl, setScheduleServiceUrl] = useState<string | null>(null);
  const [scheduleServiceTitle, setScheduleServiceTitle] = useState<string>("Service FILANT°225");
  const [interactiveModalContext, setInteractiveModalContext] = useState<InteractiveModalContext | null>(null);
  const [shopCategory, setShopCategory] = useState<'intervention' | 'immobilier' | 'equipement' | 'travailleurs'>('intervention');

  const [showRestrictedToast, setShowRestrictedToast] = useState(false);
  const [restrictedMessage, setRestrictedMessage] = useState("Cette fonctionnalité est réservée uniquement aux services Travailleurs, Propriétaires et Agences.");

  const [popup, setPopup] = useState<PopupState>({
      show: false,
      message: '',
      type: 'alert',
      onConfirm: () => {},
      onCancel: () => {}
  });

  const FULL_SCREEN_MENU_VIEWS = [
    'registration_hub', 
    'registration_info', 
    'custom_registration', 
    'tally_form', 
    'emergency_form', 
    'location_propose_form', 
    'schedule_service_form',
    'worker_list',
    'location_hub',
    'location_map',
    'notifications',
    'assistant_qr',
    'my_worker',
    'admin_sms',
    'admin_connections',
    'admin_active_contacts',
    'admin_associations'
  ];

  const isFullScreenView = (activeTab === Tab.Menu && FULL_SCREEN_MENU_VIEWS.includes(menuView)) || 
                           (activeTab === Tab.Offer && offerSubView === 'shop') ||
                           activeTab === Tab.Emergency;

  // --- DERIVED USER INFO ---
  const roleFromSelection = localStorage.getItem('filant_selected_pro_role');
  const roleFromInitial = localStorage.getItem('filant_user_role') || 'Client';
  const effectiveRole = isClientModeActive ? 'Client' : (roleFromSelection || roleFromInitial);

  const displayUser: User = {
    name: currentUser?.name ? currentUser.name.charAt(0).toUpperCase() + currentUser.name.slice(1) : '',
    city: currentUser?.city ? currentUser.city.charAt(0).toUpperCase() + currentUser.city.slice(1) : '',
    phone: currentUser?.phone || '',
    role: effectiveRole,
  };

  const showPopup = useCallback((
    message: string, 
    type: 'alert' | 'confirm', 
    onConfirm?: (close: () => void, setLoading: (l: boolean) => void) => void,
    confirmLabel?: string,
    cancelLabel?: string
  ) => {
      setPopup({
          show: true,
          message,
          type,
          confirmLabel,
          cancelLabel,
          isConfirmLoading: false,
          onConfirm: () => {
              const close = () => setPopup(p => ({ ...p, show: false }));
              const setLoading = (l: boolean) => setPopup(p => ({ ...p, isConfirmLoading: l }));
              if (onConfirm) {
                  onConfirm(close, setLoading);
              } else {
                  close();
              }
          },
          onCancel: () => setPopup(prev => ({ ...prev, show: false }))
      });
  }, []);

  const handleRestrictedAccess = useCallback((message?: string) => {
      if (message) {
          setRestrictedMessage(message);
      } else {
          setRestrictedMessage("Cette fonctionnalité est réservée uniquement aux services Travailleurs, Propriétaires et Agences.");
      }
      setShowRestrictedToast(true);
      setTimeout(() => setShowRestrictedToast(false), 3000);
  }, []);

  useEffect(() => {
    if (!currentUser?.phone) return;
    
    const unsubscribe = databaseService.onNotificationsUpdate(currentUser.phone, (notifications) => {
      const unread = notifications.filter(n => !n.isRead);
      if (unread.length > 0) {
        const latest = unread[0];
        if (latest.id !== lastNotificationId) {
          setLastNotificationId(latest.id);
          // Show popup if not already on notifications screen
          if (activeTab !== Tab.Notifications) {
            showPopup(
              `🔔 ${latest.title}\n\n${latest.message}`,
              'alert',
              (close) => {
                close();
                navigateTo({ activeTab: Tab.Notifications });
              },
              'Voir'
            );
          }
        }
      }
    });
    
    return () => unsubscribe();
  }, [currentUser?.phone, activeTab, showPopup, lastNotificationId, navigateTo]);

  useEffect(() => {
    let storedUserPhone = localStorage.getItem('filant_currentUserPhone');
    let allUsers: (User & { code: string })[] = JSON.parse(localStorage.getItem('filant_users') || '[]');

    const ensureMaelExists = () => {
      if (!allUsers.some(u => u.phone === maelUser.phone)) {
        allUsers.push({ ...maelUser, code: '0000' });
        localStorage.setItem('filant_users', JSON.stringify(allUsers));
        return JSON.parse(localStorage.getItem('filant_users') || '[]');
      }
      return allUsers;
    };
    
    allUsers = ensureMaelExists();

    if (storedUserPhone) {
      const user = allUsers.find(u => u.phone === storedUserPhone);
      if (user) {
        const { code, ...userData } = user;
        setCurrentUser(userData);
        setShowSplash(true);
        
        // Synchronisation avec Firestore au chargement
        databaseService.syncUserToFirestore(userData);
        
        const role = localStorage.getItem('filant_user_role');
        if (role && role !== 'Client') {
            setIsClientModeActive(false);
        }

        // Redirection automatique si admin
        if (isAdmin(userData)) {
          navigateTo({ activeTab: Tab.AdminDashboard });
        }
      } else {
        localStorage.removeItem('filant_currentUserPhone');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  useEffect(() => {
    if (currentUser && isAdmin(currentUser)) {
      console.log("Admin detected, running duplicate cleanup...");
      databaseService.cleanupDuplicateUsers().catch(err => {
        console.error("Failed to cleanup duplicate users:", err);
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const cardType = getCardType(displayUser.role);
      const data = databaseService.getCardData(currentUser.phone, cardType);
      setIsMiseEnRelationActive(!!(data?.hasPaidInitial || data?.isRegularized));
    }
  }, [currentUser, displayUser.role]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('filant_darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
      const handlePaymentTrigger = (event: CustomEvent<PaymentConfirmationContext>) => {
          setPaymentConfirmationContext(event.detail);
      };
      window.addEventListener('trigger-payment-view' as any, handlePaymentTrigger as any);
      return () => window.removeEventListener('trigger-payment-view' as any, handlePaymentTrigger as any);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowSplash(true);
    localStorage.setItem('filant_currentUserPhone', user.phone);
    
    // Synchronisation avec Firestore lors de la connexion
    databaseService.syncUserToFirestore(user);
    
    const role = localStorage.getItem('filant_user_role');
    if (role && role !== 'Client') {
        setIsClientModeActive(false);
    }

    // Redirection automatique si admin
    if (isAdmin(user)) {
      navigateTo({ activeTab: Tab.AdminDashboard });
    }
  };

  // Écoute des messages non lus pour le badge
  useEffect(() => {
    if (currentUser?.phone && !isAdmin(currentUser)) {
      const sanitizedPhone = currentUser.phone.replace(/\D/g, '');
      const chatUserId = sanitizedPhone || currentUser.userId || currentUser.id || `${currentUser.name}_${sanitizedPhone}`;
      
      const unsubscribe = databaseService.onUnreadAdminChatCount(chatUserId, 'admin', (count) => {
        setUnreadChatCount(count);
      });
      return () => {
        if (unsubscribe && typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [currentUser?.phone, currentUser?.userId, currentUser?.id, currentUser?.name]);

  const handleLogout = useCallback(() => {
    setIsProfileOpen(false);
    setCurrentUser(null);
    setShowSplash(false);
    localStorage.removeItem('filant_currentUserPhone');
    localStorage.removeItem('filant_user_role');
    localStorage.removeItem('filant_selected_pro_role');
    localStorage.removeItem('filant_has_selected_profile');
    setNavHistory([]);
    setActiveTab(Tab.Menu);
    setMenuView('hub');
  }, []);

  const handleReset = useCallback(() => {
    setIsProfileOpen(false);
    setHasCompletedFirstLaunch(false);
    localStorage.removeItem('filant_has_selected_profile');
    localStorage.removeItem('filant_selected_pro_role');
    setNavHistory([]);
    setMenuView('hub');
    setActiveTab(Tab.Menu);
  }, []);

  const handleToggleClientMode = useCallback((active: boolean, selectedProMode?: string) => {
    if (!active && selectedProMode) {
        setIsTransitioning(true);
        setTransitionMessage(`Configuration de votre espace ${selectedProMode}...`);
        
        setTimeout(async () => {
            localStorage.setItem('filant_selected_pro_role', selectedProMode);
            localStorage.setItem('filant_user_role', selectedProMode);
            setIsClientModeActive(false);
            setNavHistory([]);
            setActiveTab(Tab.Menu);
            setMenuView('hub');
            setIsProfileOpen(false);
            
            // Sync to Firestore immediately for real-time reflection on other devices
            if (currentUser) {
                const updatedUser = { ...currentUser, role: selectedProMode };
                setCurrentUser(updatedUser);
                await databaseService.syncUserToFirestore(updatedUser);
            }
            
            setIsTransitioning(false);
        }, 3000);
    } else {
        setIsClientModeActive(active);
        const newRole = active ? 'Client' : (localStorage.getItem('filant_selected_pro_role') || 'Professionnel');
        localStorage.setItem('filant_user_role', newRole);
        
        // Sync to Firestore immediately for real-time reflection on other devices
        if (currentUser) {
            const updatedUser = { ...currentUser, role: newRole };
            setCurrentUser(updatedUser);
            databaseService.syncUserToFirestore(updatedUser);
        }
        
        setNavHistory([]);
        setActiveTab(Tab.Menu);
        setMenuView('hub');
        setIsProfileOpen(false);
    }
  }, [currentUser]);
  
  const handleToggleProfile = () => {
    setIsProfileOpen(prev => !prev);
  };

  const handleBack = useCallback(() => {
    if (isProfileOpen) {
      setIsProfileOpen(false);
      return;
    }

    if (showScannerGlobal) {
      setShowScannerGlobal(false);
      return;
    }

    if (navHistory.length > 0) {
      const lastPoint = navHistory[navHistory.length - 1];
      setNavHistory(prev => prev.slice(0, -1));
      setActiveTab(lastPoint.activeTab);
      setMenuView(lastPoint.menuView as any);
      setOfferSubView(lastPoint.offerSubView);
      return;
    }

    if ((activeTab === Tab.Menu && menuView === 'hub') || activeTab === Tab.AdminDashboard) {
      showPopup(
        "Voulez-vous quitter l’application ?",
        "confirm",
        (close) => {
          CapApp.exitApp();
          close();
        },
        "Oui",
        "Non"
      );
    } else {
      navigateTo({ activeTab: Tab.Menu, menuView: 'hub' });
    }
  }, [activeTab, menuView, isProfileOpen, showScannerGlobal, navHistory, showPopup, navigateTo]);

  useEffect(() => {
    const backListener = CapApp.addListener('backButton', () => {
      handleBack();
    });

    return () => {
      backListener.then(l => l.remove());
    };
  }, [handleBack]);

  const handleTabChange = (tab: Tab) => {
    const role = displayUser.role;

    if (tab === Tab.Card) {
        if (role === 'Client') {
            handleRestrictedAccess();
            return;
        }
        
        if (!isMiseEnRelationActive && !isAdmin(currentUser)) {
            showPopup("Activez votre mise en relation.", "alert");
            return;
        }
    }

    if (tab === Tab.Scanner) {
        setShowScannerGlobal(true);
        return;
    }

    if (tab !== Tab.Menu && activeTab === Tab.Menu) {
        navigateTo({ activeTab: tab, menuView: 'hub' });
    } else if (tab === Tab.Offer) {
        navigateTo({ activeTab: tab, offerSubView: 'main' });
    } else {
        navigateTo({ activeTab: tab });
    }
  };

  const handleFirstLaunchComplete = () => {
      localStorage.setItem('filant_has_selected_profile', 'true');
      const role = localStorage.getItem('filant_user_role');
      if (role && role !== 'Client') {
          setIsClientModeActive(false);
      }
      
      // If user is already logged in (e.g. returning user resetting profile), sync the new role
      if (currentUser && role) {
          const updatedUser = { ...currentUser, role };
          setCurrentUser(updatedUser);
          databaseService.syncUserToFirestore(updatedUser);
      }
      
      setHasCompletedFirstLaunch(true);
  };

  const handleNavigateFromOffer = (view: 'worker_list' | 'location_hub') => {
      navigateTo({ activeTab: Tab.Menu, menuView: view });
  };

  const startRegistration = (type: string) => {
    const url = REGISTRATION_URLS[type];
    setRegistrationType(type);
    if (url) {
      setTallyFormUrl(url);
      navigateTo({ menuView: 'tally_form' });
    } else {
      navigateTo({ menuView: 'custom_registration' });
    }
  };

  const handleOpenSiteWorkers = useCallback(() => {
    setShopCategory('travailleurs');
    navigateTo({ activeTab: Tab.Offer, offerSubView: 'shop', menuView: 'hub' });
  }, []);

  const handleHomeNavigate = (view: any, category?: 'appartement' | 'equipement') => {
      if (view === 'location_hub' && category) {
          setLocationInitialTab(category);
      }
      navigateTo({ menuView: view });
  };

  const handleRegisterDirectly = (type: string) => {
      setRegistrationType(type);
      navigateTo({ menuView: 'registration_info' });
  };

  const handleScanResultGlobal = (data: string) => {
    setShowScannerGlobal(false);
    
    // Utilisation de la logique unifiée d'extraction
    const info = extractQRInfo(data);
    
    const sanitizePhone = (phone: string): string => {
        let cleanPhone = phone.replace(/[\s-.]/g, '');
        if (cleanPhone.startsWith('+225')) cleanPhone = cleanPhone.slice(4);
        return cleanPhone;
    };

    if (info.name && info.phone !== 'N/A' && currentUser) {
        const currentContacts = databaseService.getContacts(currentUser.phone);
        const newContact: SavedContact = {
            id: Date.now().toString(),
            title: info.title,
            name: info.name,
            phone: sanitizePhone(info.phone),
            city: info.city,
            review: info.details || info.city 
        };
        const updatedContacts = [...currentContacts, newContact];
        databaseService.saveContacts(currentUser.phone, updatedContacts, currentUser);
        
        // Envoi vers Firestore pour la vue Admin
        databaseService.saveScannedContact({
            scannerUserId: currentUser.phone,
            scannerName: currentUser.name,
            name: info.name,
            phone: sanitizePhone(info.phone),
            title: info.title,
            city: info.city,
            details: info.details || info.city
        });
        
        showPopup("Information validée et intégrée dans l'Assistance QR !", "alert");
        
        // Redirection automatique vers l'Assistance QR
        navigateTo({ activeTab: Tab.Menu, menuView: 'assistant_qr' });
    } else {
        showPopup("Le format du code QR n'a pas pu être structuré automatiquement.", "alert");
    }
  };

  const handleAdminSelectUser = useCallback((userLog: ConnectionLog) => {
    const selectedUser: User = {
        name: userLog.name,
        city: userLog.city,
        phone: userLog.phone,
        role: 'Client'
    };
    
    setCurrentUser(selectedUser);
    localStorage.setItem('filant_currentUserPhone', selectedUser.phone);
    navigateTo({ activeTab: Tab.Menu, menuView: 'hub' });
    setIsProfileOpen(true);
  }, []);

  if (!hasCompletedFirstLaunch) {
      return (
        <GlobalRippleEffect>
          <div className="flex justify-center bg-slate-950 w-full h-full min-h-[100dvh]">
            <div className="w-full max-w-[480px] h-[100dvh] relative flex flex-col overflow-hidden bg-slate-900 shadow-2xl">
              {/* Status Bar Area */}
              <div className="w-full bg-blue-600 flex-shrink-0 z-[999] h-[env(safe-area-inset-top,24px)] min-h-[24px]" />
              
              <div className="flex-1 relative overflow-hidden">
                <FirstLaunchScreen onComplete={handleFirstLaunchComplete} />
              </div>
            </div>
          </div>
        </GlobalRippleEffect>
      );
  }

  const isUserAdmin = isAdmin(currentUser);

  if (!currentUser) {
    return (
        <GlobalRippleEffect>
          <div className="flex justify-center bg-slate-950 w-full h-full min-h-[100dvh]">
            <div className="w-full max-w-[480px] h-[100dvh] relative flex flex-col overflow-hidden bg-slate-900 shadow-2xl">
              {/* Status Bar Area */}
              <div className="w-full bg-blue-600 flex-shrink-0 z-[999] h-[env(safe-area-inset-top,24px)] min-h-[24px]" />
              
              <div className="flex-1 relative overflow-hidden">
                <LoginScreen onLoginSuccess={handleLogin} onShowPopup={showPopup} />
                {popup.show && (
                    <GlobalPopup 
                        message={popup.message} 
                        type={popup.type} 
                        onConfirm={popup.onConfirm} 
                        onCancel={popup.onCancel}
                        confirmLabel={popup.confirmLabel}
                        cancelLabel={popup.cancelLabel}
                        isConfirmLoading={popup.isConfirmLoading}
                    />
                )}
              </div>
            </div>
          </div>
        </GlobalRippleEffect>
    );
  }

  if (showSplash) {
      return (
          <div className="flex justify-center bg-slate-950 w-full h-full min-h-[100dvh]">
            <div className="w-full max-w-[480px] h-[100dvh] relative flex flex-col overflow-hidden bg-slate-900 shadow-2xl">
              {/* Status Bar Area */}
              <div className="w-full bg-blue-600 flex-shrink-0 z-[999] h-[env(safe-area-inset-top,24px)] min-h-[24px]" />
              
              <div className="flex-1 relative overflow-hidden">
                <SplashScreen 
                  userName={currentUser.name} 
                  onFinish={() => setShowSplash(false)} 
                />
              </div>
            </div>
          </div>
      );
  }

  // --- ADMIN LOCKED MODE ---
  if (isUserAdmin) {
    return (
      <GlobalRippleEffect>
        <div className="flex justify-center bg-slate-950 w-full min-h-[100dvh]">
          <div className="w-full h-[100dvh] relative flex flex-col bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 shadow-2xl overflow-hidden admin-layout">
            
            {/* Status Bar Area */}
            <div className="w-full bg-blue-600 flex-shrink-0 z-[999] h-[env(safe-area-inset-top,24px)] min-h-[24px]" />
            
            <main className="flex-1 flex flex-col overflow-hidden relative">
              <div className="absolute inset-0 scroll-container scrollbar-hide">
                {activeTab === Tab.AdminChat && chatTargetUser ? (
                  <ChatScreen 
                    currentUser={currentUser || maelUser} 
                    targetUser={chatTargetUser}
                    isAdmin={true}
                    onBack={handleBack}
                  />
                ) : (
                  <AdminDashboardScreen 
                    onBack={handleBack} 
                    onSelectUser={handleAdminSelectUser} 
                    onOpenChat={(user) => {
                      setChatTargetUser(user);
                      navigateTo({ activeTab: Tab.AdminChat });
                    }}
                    onLogout={handleLogout} // We'll add this prop to AdminDashboardScreen
                  />
                )}
              </div>
            </main>

            {popup.show && (
                <GlobalPopup 
                  message={popup.message} 
                  type={popup.type} 
                  onConfirm={popup.onConfirm} 
                  onCancel={popup.onCancel}
                  confirmLabel={popup.confirmLabel}
                  cancelLabel={popup.cancelLabel}
                  isConfirmLoading={popup.isConfirmLoading}
                />
            )}
          </div>
        </div>
      </GlobalRippleEffect>
    );
  }

  let activeScreen: React.ReactNode;

  switch (activeTab) {
    case Tab.Menu:
      switch (menuView) {
        case 'worker_list':
          activeScreen = <WorkerListScreen 
            onBack={handleBack} 
            user={displayUser}
            onScheduleService={(url, title) => {
                setScheduleServiceUrl(url || "https://tally.so/r/wQZVJY");
                setScheduleServiceTitle(title || "Demande de Service");
                navigateTo({ menuView: 'schedule_service_form' });
            }}
            onOpenSiteWorkers={handleOpenSiteWorkers}
            onOpenForm={(context) => setInteractiveModalContext(context)}
          />;
          break;
        case 'registration_hub':
          activeScreen = <RegistrationHubScreen 
            onBack={handleBack} 
            onSelectType={(type) => {
              setRegistrationType(type);
              navigateTo({ menuView: 'registration_info' });
            }} 
          />;
          break;
        case 'registration_info':
          activeScreen = <RegistrationInfoScreen 
            type={registrationType} 
            onBack={handleBack} 
            onNext={() => startRegistration(registrationType)}
          />;
          break;
        case 'custom_registration':
          activeScreen = <RegistrationFormScreen registrationType={registrationType} onBack={handleBack} />;
          break;
        case 'tally_form':
          activeScreen = registrationType && tallyFormUrl && <TallyFormScreen formUrl={tallyFormUrl} formTitle={registrationType} onBack={() => {
            handleBack();
            setTallyFormUrl(null);
          }} />;
          break;
        case 'schedule_service_form':
          activeScreen = <TallyFormScreen 
            formUrl={scheduleServiceUrl || "https://tally.so/r/wQZVJY"}
            formTitle={scheduleServiceTitle}
            onBack={() => {
                handleBack();
                setScheduleServiceUrl(null);
            }}
          />;
          break;
        case 'my_worker':
          activeScreen = <MyWorkerScreen onBack={handleBack} user={currentUser} />;
          break;
        case 'location_hub':
          activeScreen = <LocationScreen 
            onBack={handleBack} 
            user={displayUser}
            initialCategory={locationInitialTab}
            onPropose={(url, title) => {
                setScheduleServiceUrl(url);
                setScheduleServiceTitle(title);
                navigateTo({ menuView: 'location_propose_form' });
            }}
            onOpenForm={(context) => setInteractiveModalContext(context)}
          />;
          break;
        case 'location_propose_form':
          activeScreen = <TallyFormScreen 
            formUrl={scheduleServiceUrl || ""}
            formTitle={scheduleServiceTitle}
            onBack={() => {
                handleBack();
                setScheduleServiceUrl(null);
            }}
          />;
          break;
        case 'admin_sms':
            activeScreen = <AdminDashboardScreen initialView="sms" onBack={handleBack} />;
            break;
        case 'admin_connections':
            activeScreen = <AdminDashboardScreen initialView="connections" onBack={handleBack} onSelectUser={handleAdminSelectUser} />;
            break;
        case 'admin_active_contacts':
            activeScreen = <AdminDashboardScreen initialView="active-contacts" onBack={handleBack} />;
            break;
        case 'admin_associations':
            activeScreen = <AdminDashboardScreen initialView="associations" onBack={handleBack} />;
            break;
        case 'location_map':
            activeScreen = <LocationMapScreen onBack={handleBack} />;
            break;
        case 'notifications':
            activeScreen = <NotificationsScreen onBack={handleBack} user={displayUser} />;
            break;
        case 'emergency_form':
            activeScreen = <EmergencyFormScreen onBack={handleBack} user={displayUser} />;
            break;
        case 'assistant_qr':
            activeScreen = <AssistantQRScreen onBack={handleBack} user={displayUser} onShowPopup={showPopup} />;
            break;
        case 'hub':
        default:
          activeScreen = <HomeScreen 
            onNavigate={handleHomeNavigate} 
            user={displayUser} 
            setActiveTab={handleTabChange}
            onOpenNightService={() => setInteractiveModalContext({ formType: 'night_service', title: 'Service de Nuit' })}
            onOpenBuildingService={(item) => setInteractiveModalContext({ 
                formType: 'rapid_building_service', 
                title: item.title, 
                imageUrl: item.img,
                description: item.description
            })}
            onRestrictedAccess={handleRestrictedAccess}
            onShowPopup={showPopup}
            onRegisterDirectly={handleRegisterDirectly}
            unreadChatCount={unreadChatCount}
            deferredPrompt={deferredPrompt}
            onInstallPWA={handleInstallPWA}
          />;
          break;
      }
      break;
    case Tab.Offer:
        if (offerSubView === 'shop') {
            activeScreen = <InterventionShopScreen 
                category={shopCategory}
                user={displayUser}
                onBack={handleBack} 
                onOpenForm={(context) => setInteractiveModalContext(context)}
            />;
        } else {
            activeScreen = <OfferScreen 
                onNavigateToMenu={handleNavigateFromOffer} 
                setActiveTab={handleTabChange} 
                onOpenIntervention={() => {
                    setShopCategory('intervention');
                    navigateTo({ offerSubView: 'shop' });
                }}
                onOpenCategory={(category) => {
                    setShopCategory(category);
                    navigateTo({ offerSubView: 'shop' });
                }}
                onSelectItem={(item, type, img, isBlurred, desc, price) => setInteractiveModalContext({ 
                  formType: type, 
                  title: item, 
                  imageUrl: img,
                  isBlurredImage: isBlurred,
                  description: desc,
                  price: price
                })}
            />;
        }
      break;
    case Tab.Emergency:
      activeScreen = <TallyFormScreen 
        formUrl="https://tally.so/r/nPY5eQ"
        formTitle="Urgence"
        onBack={handleBack}
        hideVideoButton={true}
      />;
      break;
    case Tab.WavePayment:
      activeScreen = <WavePaymentScreen onBack={handleBack} />;
      break;
    case Tab.Card:
      activeScreen = <ProfessionalCardScreen 
        user={displayUser} 
        onBack={handleBack} 
        onShowPopup={showPopup}
      />;
      break;
    case Tab.Payment:
      activeScreen = <PaymentScreen onBack={handleBack} />;
      break;
    case Tab.AdminLogin:
      activeScreen = <AdminLoginScreen 
        onSuccess={() => navigateTo({ activeTab: Tab.AdminDashboard })} 
        onBack={handleBack}
        onShowPopup={showPopup}
      />;
      break;
    case Tab.AdminDashboard:
      activeScreen = <AdminDashboardScreen 
        onBack={handleBack} 
        onSelectUser={handleAdminSelectUser} 
        onOpenChat={(user) => {
          setChatTargetUser(user);
          navigateTo({ activeTab: Tab.AdminChat });
        }}
      />;
      break;
    case Tab.AdminChat:
      activeScreen = chatTargetUser && (
        <ChatScreen 
          currentUser={currentUser || maelUser} 
          targetUser={chatTargetUser}
          isAdmin={true}
          onBack={handleBack}
        />
      );
      break;
    case Tab.UserChat:
      activeScreen = (
        <ChatScreen 
          currentUser={currentUser || maelUser} 
          isAdmin={false}
          onBack={handleBack}
        />
      );
      break;
    case Tab.AvailabilityCalendar:
      activeScreen = <AvailabilityCalendar user={displayUser} onBack={handleBack} />;
      break;
    case Tab.Reviews:
      activeScreen = <ReviewSystem user={displayUser} onBack={handleBack} />;
      break;
    default:
      activeScreen = <HomeScreen 
        onNavigate={handleHomeNavigate} 
        user={displayUser} 
        setActiveTab={handleTabChange}
        onOpenNightService={() => setInteractiveModalContext({ formType: 'night_service', title: 'Service de Nuit' })}
        onOpenBuildingService={(item) => setInteractiveModalContext({ 
            formType: 'rapid_building_service', 
            title: item.title, 
            imageUrl: item.img,
            description: item.description
        })}
        onRestrictedAccess={handleRestrictedAccess}
        onShowPopup={showPopup}
        onRegisterDirectly={handleRegisterDirectly}
        unreadChatCount={unreadChatCount}
      />;
      break;
  }

  const isAdminView = activeTab === Tab.AdminDashboard || activeTab === Tab.AdminChat || isUserAdmin || (activeTab === Tab.Menu && menuView.startsWith('admin_'));

  if (currentUser?.isBlocked) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8 animate-pulse">
          <svg className="w-12 h-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-tight">
          Accès Restreint
        </h2>
        <p className="text-gray-600 font-bold text-lg leading-relaxed max-w-xs">
          “Vous ne pouvez plus effectuer une demande. Veuillez patienter. Une demande d’agence va vous contacter.”
        </p>
        <div className="mt-12 pt-8 border-t border-gray-100 w-full max-w-xs">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">FILANT°225 • SERVICE SÉCURITÉ</p>
        </div>
      </div>
    );
  }

  return (
    <GlobalRippleEffect>
      <div className="flex justify-center bg-slate-950 w-full min-h-[100dvh]">
        <div className={`w-full ${isAdminView ? 'admin-layout' : 'max-w-[480px]'} h-[100dvh] relative flex flex-col bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 shadow-2xl overflow-hidden`}>
          
          {/* Status Bar Area */}
          <div className="w-full bg-blue-600 flex-shrink-0 z-[999] h-[env(safe-area-inset-top,24px)] min-h-[24px]" />
          
          {/* App Content Area */}
          <div className="flex-1 relative flex flex-col overflow-hidden">
            <RestrictedNotification show={showRestrictedToast} message={restrictedMessage} />

            {isTransitioning && <GlobalModeLoading message={transitionMessage} />}

            <main className="flex-1 flex flex-col overflow-hidden relative">
              <div ref={scrollContainerRef} className="absolute inset-0 scroll-container pb-20 scrollbar-hide">
                {!isFullScreenView && activeScreen}
              </div>
            </main>
            
            {/* Full Screen Forms Overlay */}
            <AnimatePresence>
              {isFullScreenView && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 z-[800] bg-white"
                >
                  {activeScreen}
                </motion.div>
              )}
            </AnimatePresence>

            <ChatWidget 
              userPhone={displayUser.phone} 
              userId={currentUser?.userId || currentUser?.id}
              userName={displayUser.name}
              activeTab={activeTab} 
              currentMenuView={menuView}
              unreadChatCount={unreadChatCount}
            />
            
            {popup.show && (
                <GlobalPopup 
                  message={popup.message} 
                  type={popup.type} 
                  onConfirm={popup.onConfirm} 
                  onCancel={popup.onCancel}
                  confirmLabel={popup.confirmLabel}
                  cancelLabel={popup.cancelLabel}
                  isConfirmLoading={popup.isConfirmLoading}
                />
            )}

            {isProfileOpen && (
              <div className="absolute inset-0 z-[500] pointer-events-none">
                <div className="pointer-events-auto h-full w-full">
                  <ProfileScreen 
                      user={currentUser} 
                      onClose={() => setIsProfileOpen(false)}
                      onLogout={handleLogout}
                      onReset={handleReset}
                      isClientModeActive={isClientModeActive}
                      onToggleClientMode={handleToggleClientMode}
                      setActiveTab={handleTabChange}
                      onShowPopup={showPopup}
                      deferredPrompt={deferredPrompt}
                      onInstallPWA={handleInstallPWA}
                  />
                </div>
              </div>
            )}

            {showScannerGlobal && (
                <ScannerOverlay 
                  onScan={handleScanResultGlobal}
                  onClose={() => setShowScannerGlobal(false)}
                />
            )}

            {paymentConfirmationContext && (
                <div className="absolute inset-0 z-[1000]">
                    <PaymentConfirmationScreen 
                      {...paymentConfirmationContext}
                      user={displayUser}
                      onBack={() => setPaymentConfirmationContext(null)}
                    />
                </div>
            )}

            <AnimatePresence>
              {interactiveModalContext && (
                <div className="absolute inset-0 z-[800]">
                  <InteractiveModal
                      title={interactiveModalContext.title}
                      formType={interactiveModalContext.formType}
                      user={displayUser}
                      imageUrl={interactiveModalContext.imageUrl}
                      isBlurredImage={interactiveModalContext.isBlurredImage}
                      description={interactiveModalContext.description}
                      price={interactiveModalContext.price}
                      onClose={() => setInteractiveModalContext(null)}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          <BottomNav 
            activeTab={activeTab} 
            setActiveTab={(tab) => {
                if (isProfileOpen) setIsProfileOpen(false);
                handleTabChange(tab);
            }}
            onToggleProfile={handleToggleProfile}
            isProfileOpen={isProfileOpen}
            userRole={displayUser.role}
            isMiseEnRelationActive={isMiseEnRelationActive}
            unreadChatCount={unreadChatCount}
          />
        </div>
      </div>
    </GlobalRippleEffect>
  );
};

export default App;
