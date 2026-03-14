import React, { useState, useCallback, useEffect, useRef } from 'react';
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
import { motion, AnimatePresence } from 'motion/react';
import { databaseService, SavedContact, ConnectionLog } from './services/databaseService';
import { isAdmin, getCardType } from './utils/authUtils';

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

const REGISTRATION_URLS: Record<string, string> = {
  'Travailleur': 'https://tally.so/r/wQY5aA',
  'Propriétaire d’équipement': 'https://tally.so/r/rjyBLo',
  'Agence immobilière': 'https://tally.so/r/RGKdJK',
  'Entreprise': 'https://tally.so/r/GxxjXp'
};

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
    <div className="fixed inset-0 z-[2000] bg-slate-900 flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
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

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [hasCompletedFirstLaunch, setHasCompletedFirstLaunch] = useState(() => {
      return localStorage.getItem('filant_has_selected_profile') === 'true';
  });

  const [activeTab, setActiveTab] = useState<Tab>(Tab.Menu);
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
  
  const [menuView, setMenuView] = useState<'hub' | 'worker_list' | 'registration_hub' | 'registration_info' | 'tally_form' | 'custom_registration' | 'my_worker' | 'location_hub' | 'schedule_service_form' | 'location_propose_form' | 'admin_sms' | 'location_map' | 'notifications' | 'emergency_form' | 'assistant_qr' | 'admin_connections' | 'admin_active_contacts' | 'admin_associations'>('hub');
  const [locationInitialTab, setLocationInitialTab] = useState<'appartement' | 'equipement'>('appartement');
  const [registrationType, setRegistrationType] = useState<string>('Travailleur');
  const [tallyFormUrl, setTallyFormUrl] = useState<string | null>(null);
  const [scheduleServiceUrl, setScheduleServiceUrl] = useState<string | null>(null);
  const [interactiveModalContext, setInteractiveModalContext] = useState<InteractiveModalContext | null>(null);
  
  const [offerSubView, setOfferSubView] = useState<'main' | 'shop'>('main');
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
        
        const role = localStorage.getItem('filant_user_role');
        if (role && role !== 'Client') {
            setIsClientModeActive(false);
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
    
    const role = localStorage.getItem('filant_user_role');
    if (role && role !== 'Client') {
        setIsClientModeActive(false);
    }
  };

  const handleLogout = useCallback(() => {
    setIsProfileOpen(false);
    setCurrentUser(null);
    setShowSplash(false);
    localStorage.removeItem('filant_currentUserPhone');
  }, []);

  const handleReset = useCallback(() => {
    setIsProfileOpen(false);
    setHasCompletedFirstLaunch(false);
    localStorage.removeItem('filant_has_selected_profile');
    localStorage.removeItem('filant_selected_pro_role');
    setMenuView('hub');
    setActiveTab(Tab.Menu);
  }, []);

  const handleToggleClientMode = useCallback((active: boolean, selectedProMode?: string) => {
    if (!active && selectedProMode) {
        setIsTransitioning(true);
        setTransitionMessage(`Configuration de votre espace ${selectedProMode}...`);
        
        setTimeout(() => {
            localStorage.setItem('filant_selected_pro_role', selectedProMode);
            setIsClientModeActive(false);
            setActiveTab(Tab.Menu);
            setMenuView('hub');
            setIsProfileOpen(false);
            setIsTransitioning(false);
        }, 3000);
    } else {
        setIsClientModeActive(active);
        setActiveTab(Tab.Menu);
        setMenuView('hub');
        setIsProfileOpen(false);
    }
  }, []);
  
  const handleToggleProfile = () => {
    setIsProfileOpen(prev => !prev);
  };

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
        setMenuView('hub');
    }
    if (tab === Tab.Offer) {
        setOfferSubView('main');
    }
    setActiveTab(tab);
  };

  const handleFirstLaunchComplete = () => {
      localStorage.setItem('filant_has_selected_profile', 'true');
      const role = localStorage.getItem('filant_user_role');
      if (role && role !== 'Client') {
          setIsClientModeActive(false);
      }
      setHasCompletedFirstLaunch(true);
  };

  const handleNavigateFromOffer = (view: 'worker_list' | 'location_hub') => {
      setActiveTab(Tab.Menu);
      setMenuView(view);
  };

  const startRegistration = (type: string) => {
    const url = REGISTRATION_URLS[type];
    setRegistrationType(type);
    if (url) {
      setTallyFormUrl(url);
      setMenuView('tally_form');
    } else {
      setMenuView('custom_registration');
    }
  };

  const handleOpenSiteWorkers = useCallback(() => {
    setMenuView('hub');
    setShopCategory('travailleurs');
    setOfferSubView('shop');
    setActiveTab(Tab.Offer);
  }, []);

  const handleHomeNavigate = (view: any, category?: 'appartement' | 'equipement') => {
      if (view === 'location_hub' && category) {
          setLocationInitialTab(category);
      }
      setMenuView(view);
  };

  const handleRegisterDirectly = (type: string) => {
      setRegistrationType(type);
      setMenuView('registration_info');
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
        databaseService.saveContacts(currentUser.phone, [...currentContacts, newContact]);
        showPopup("Information validée et intégrée dans l'Assistance QR !", "alert");
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
    setActiveTab(Tab.Menu);
    setMenuView('hub');
    setIsProfileOpen(true);
  }, []);

  if (!hasCompletedFirstLaunch) {
      return (
        <GlobalRippleEffect>
          <div className="flex justify-center bg-slate-950 w-full h-full min-h-[100dvh]">
            <div className="w-full max-w-[480px] h-[100dvh] relative overflow-hidden bg-slate-900 shadow-2xl">
              <FirstLaunchScreen onComplete={handleFirstLaunchComplete} />
            </div>
          </div>
        </GlobalRippleEffect>
      );
  }

  if (!currentUser) {
    return (
        <GlobalRippleEffect>
          <div className="flex justify-center bg-slate-950 w-full h-full min-h-[100dvh]">
            <div className="w-full max-w-[480px] h-[100dvh] relative overflow-hidden bg-slate-900 shadow-2xl">
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
        </GlobalRippleEffect>
    );
  }

  if (showSplash) {
      return (
          <div className="flex justify-center bg-slate-950 w-full h-full min-h-[100dvh]">
            <div className="w-full max-w-[480px] h-[100dvh] relative overflow-hidden bg-slate-900 shadow-2xl">
              <SplashScreen 
                userName={currentUser.name} 
                onFinish={() => setShowSplash(false)} 
              />
            </div>
          </div>
      );
  }

  let activeScreen: React.ReactNode;

  switch (activeTab) {
    case Tab.Menu:
      switch (menuView) {
        case 'worker_list':
          activeScreen = <WorkerListScreen 
            onBack={() => setMenuView('hub')} 
            user={displayUser}
            onScheduleService={(url) => {
                setScheduleServiceUrl(url || null);
                setMenuView('schedule_service_form');
            }}
            onOpenSiteWorkers={handleOpenSiteWorkers}
          />;
          break;
        case 'registration_hub':
          activeScreen = <RegistrationHubScreen 
            onBack={() => setMenuView('hub')} 
            onSelectType={(type) => {
              setRegistrationType(type);
              setMenuView('registration_info');
            }} 
          />;
          break;
        case 'registration_info':
          activeScreen = <RegistrationInfoScreen 
            type={registrationType} 
            onBack={() => {
                if (displayUser.role === 'Client') setMenuView('hub');
                else setMenuView('registration_hub');
            }} 
            onNext={() => startRegistration(registrationType)}
          />;
          break;
        case 'custom_registration':
          activeScreen = <RegistrationFormScreen registrationType={registrationType} onBack={() => setMenuView('registration_hub')} />;
          break;
        case 'tally_form':
          activeScreen = registrationType && tallyFormUrl && <TallyFormScreen formUrl={tallyFormUrl} formTitle={registrationType} onBack={() => {
            if (displayUser.role === 'Client') {
                setMenuView('hub');
            } else if (Object.values(REGISTRATION_URLS).includes(tallyFormUrl)) {
              setMenuView('registration_hub');
            } else {
              setMenuView('hub');
            }
            setTallyFormUrl(null);
          }} />;
          break;
        case 'schedule_service_form':
          activeScreen = <TallyFormScreen 
            formUrl={scheduleServiceUrl || "https://tally.so/r/wQZVJY"}
            formTitle="Demande de Service"
            onBack={() => {
                setMenuView('worker_list');
                setScheduleServiceUrl(null);
            }}
          />;
          break;
        case 'my_worker':
          activeScreen = <MyWorkerScreen onBack={() => setMenuView('hub')} user={currentUser} />;
          break;
        case 'location_hub':
          activeScreen = <LocationScreen 
            onBack={() => setMenuView('hub')} 
            user={displayUser}
            initialCategory={locationInitialTab}
            onPropose={(url) => {
                setScheduleServiceUrl(url);
                setMenuView('location_propose_form');
            }}
          />;
          break;
        case 'location_propose_form':
          activeScreen = <TallyFormScreen 
            formUrl={scheduleServiceUrl || ""}
            formTitle="Proposition de Location"
            onBack={() => {
                setMenuView('location_hub');
                setScheduleServiceUrl(null);
            }}
          />;
          break;
        case 'admin_sms':
            activeScreen = <AdminDashboardScreen initialView="sms" onBack={() => setMenuView('hub')} />;
            break;
        case 'admin_connections':
            activeScreen = <AdminDashboardScreen initialView="connections" onBack={() => setMenuView('hub')} onSelectUser={handleAdminSelectUser} />;
            break;
        case 'admin_active_contacts':
            activeScreen = <AdminDashboardScreen initialView="active-contacts" onBack={() => setMenuView('hub')} />;
            break;
        case 'admin_associations':
            activeScreen = <AdminDashboardScreen initialView="associations" onBack={() => setMenuView('hub')} />;
            break;
        case 'location_map':
            activeScreen = <LocationMapScreen onBack={() => setMenuView('hub')} />;
            break;
        case 'notifications':
            activeScreen = <NotificationsScreen onBack={() => setMenuView('hub')} user={displayUser} />;
            break;
        case 'emergency_form':
            activeScreen = <EmergencyFormScreen onBack={() => setMenuView('hub')} user={displayUser} />;
            break;
        case 'assistant_qr':
            activeScreen = <AssistantQRScreen onBack={() => setMenuView('hub')} user={displayUser} onShowPopup={showPopup} />;
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
          />;
          break;
      }
      break;
    case Tab.Offer:
        if (offerSubView === 'shop') {
            activeScreen = <InterventionShopScreen 
                category={shopCategory}
                user={displayUser}
                onBack={() => setOfferSubView('main')} 
            />;
        } else {
            activeScreen = <OfferScreen 
                onNavigateToMenu={handleNavigateFromOffer} 
                setActiveTab={handleTabChange} 
                onOpenIntervention={() => {
                    setShopCategory('intervention');
                    setOfferSubView('shop');
                }}
                onOpenCategory={(category) => {
                    setShopCategory(category);
                    setOfferSubView('shop');
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
        onBack={() => handleTabChange(Tab.Menu)}
        hideVideoButton={true}
      />;
      break;
    case Tab.WavePayment:
      activeScreen = <WavePaymentScreen onBack={() => handleTabChange(Tab.Menu)} />;
      break;
    case Tab.Card:
      activeScreen = <ProfessionalCardScreen 
        user={displayUser} 
        onBack={() => handleTabChange(Tab.Menu)} 
        onShowPopup={showPopup}
      />;
      break;
    case Tab.Payment:
      activeScreen = <PaymentScreen onBack={() => setActiveTab(Tab.Menu)} />;
      break;
    case Tab.AdminLogin:
      activeScreen = <AdminLoginScreen 
        onSuccess={() => setActiveTab(Tab.AdminDashboard)} 
        onBack={() => setActiveTab(Tab.Menu)}
        onShowPopup={showPopup}
      />;
      break;
    case Tab.AdminDashboard:
      activeScreen = <AdminDashboardScreen onBack={() => setActiveTab(Tab.Menu)} onSelectUser={handleAdminSelectUser} />;
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
      />;
      break;
  }

  return (
    <GlobalRippleEffect>
      <div className="flex justify-center bg-slate-950 w-full min-h-[100dvh]">
        <div className="w-full max-w-[480px] h-[100dvh] relative flex flex-col bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 shadow-2xl overflow-hidden">
          
          <RestrictedNotification show={showRestrictedToast} message={restrictedMessage} />

          {isTransitioning && <GlobalModeLoading message={transitionMessage} />}

          <main className="flex-1 flex flex-col overflow-hidden relative">
            <div ref={scrollContainerRef} className="absolute inset-0 scroll-container pb-20 scrollbar-hide">
              {activeScreen}
            </div>
          </main>
          
          <ChatWidget 
            userPhone={currentUser.phone} 
            activeTab={activeTab} 
            currentMenuView={menuView}
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
              <div className="absolute inset-0 z-[500]">
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
          />
        </div>
      </div>
    </GlobalRippleEffect>
  );
};

export default App;
