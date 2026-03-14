
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Tab, User } from '../types';
import MenuBackground from './common/MenuBackground';
import { databaseService, SavedContact } from '../services/databaseService';
import ScannerOverlay from './ScannerOverlay';
import { SEARCHABLE_TITLES } from './common/formDefinitions';
import { audioService } from '../services/audioService';
import { chatService } from '../services/chatService';
import { isAdmin, getCardType } from '../utils/authUtils';

// --- SVG Icons ---
const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`flex items-center justify-center rounded-full ${className}`}>
        {children}
    </div>
);

const UserCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const SendIconSmall = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
    </svg>
);

const InscriptionIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536" /></svg>;
const HeartIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6 text-white"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>;
const WhatsAppIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.288 1.902 5.941l-1.442 5.253 5.354-1.405z" /></svg>;
const MapPinIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const EmergencyIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const HelpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>;
const AssistantIcon = () => <svg className="w-6 h-6 text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M42 12H16C13.7909 12 12 13.7909 12 16V48C12 50.2091 13.7909 52 16 52H42C44.2091 52 46 50.2091 46 48V16C46 13.7909 44.2091 12 42 12Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M29 25C31.2091 25 33 23.2091 33 21C33 18.7909 31.2091 17 29 17C26.7909 17 25 18.7909 25 21C25 23.2091 26.7909 25 29 25Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M38 42C38 37.0294 33.9706 33 29 33C24.0294 33 20 37.0294 20 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M46 20H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M46 28H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M46 36H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const SearchBarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;

const ServiceRapideIcon: React.FC = () => <IconWrapper className="w-12 h-12 bg-white/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-current" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg></IconWrapper>;
const ServiceDeNuitIcon: React.FC = () => <IconWrapper className="w-12 h-12 bg-white/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /><path d="M16 10.5c-.5 0-1 .5-1 1s.5 1 1 1 .5-1 1-1" /><path d="M18 13c0 .5-.5 1-1 1s-1-.5-1-1" /></svg></IconWrapper>;
const EquipmentIcon: React.FC = () => <IconWrapper className="w-12 h-12 bg-orange-600/20"><svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.528-1.036.94-2.197 1.088-3.386l-.738-2.652L3 14l2.652.738c1.19.147 2.35.56 3.386 1.088l3.03-2.496z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21.75l-4.135-4.134a1.21 1.21 0 010-1.707l4.134-4.135a1.21 1.21 0 011.707 0l4.135 4.135a1.21 1.21 0 010 1.707l-4.134 4.135a1.21 1.21 0 01-1.707 0z" /></svg></IconWrapper>;

// --- Admin Icons ---
const StorageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
const ActivationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const AssociationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SMSAdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;

const IvoryCoastFlagIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" className={className} aria-label="Drapeau Côte d'Ivoire">
        <rect width="10" height="20" x="0" fill="#FF8200" />
        <rect width="10" height="20" x="10" fill="#FFFFFF" />
        <rect width="10" height="20" x="10" fill="#FFFFFF" />
        <rect width="10" height="20" x="20" fill="#009B77" />
    </svg>
);

const PointerArrow: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
);

const LargeMapPinIcon: React.FC = () => (
    <IconWrapper className="w-14 h-14 bg-indigo-600/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    </IconWrapper>
);

const LargeHouseIcon: React.FC = () => (
    <IconWrapper className="w-14 h-14 bg-blue-600/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    </IconWrapper>
);

const LargeCarteProIcon: React.FC = () => (
    <IconWrapper className="w-14 h-14 bg-orange-600/20 shadow-inner">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-4M9 4h6a2 2 0 012v2a2 2 0 01-2 2H9a2 2 0 01-2-2V6a2 2 0 012-2zm4 8a2 2 0 100-4 2 2 0 000 4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 16H8" />
        </svg>
    </IconWrapper>
);

const ASSISTANT_IMAGE_URL = "https://i.supaimg.com/c2d87a7d-60e1-4de2-abce-69cbdf1a2aac.png";
const TIKTOK_IMAGE_URL = "https://i.supaimg.com/5ee5d84d-9220-451a-95a6-a1a75146158d.png";

// --- DATA TRAVAILLEURS BATIMENT ---
const batimentWorkers = [
    { title: 'Plombier rapide', description: 'Réparation fuites d’eau et installations.', img: "https://i.supaimg.com/bf0970ed-7dcd-44cb-9de3-62334cdf346a.jpg" },
    { title: 'Électricien rapide', description: 'Dépannage électrique sécurisé.', img: "https://i.supaimg.com/8c410fb6-878b-44ec-84ed-2b5a4a864a78.jpg" },
    { title: 'Carreleur rapide', description: 'Pose de carreaux tous formats.', img: "https://i.supaimg.com/06e7bd93-4222-4631-aeee-6516870145ef.jpg" },
    { title: 'Charpentier rapide', description: 'Menuiserie et charpente bois.', img: "https://i.supaimg.com/017f0261-3cac-4fa3-b519-c5e93cdc1dd1.jpg" },
    { title: 'Maçon rapide', description: 'Maçonnerie et rénovation rapide.', img: "https://i.supaimg.com/dfd8a52a-a25c-4e93-a3c9-329a8a9ee255.jpg" },
    { title: 'Soudeur rapide', description: 'Travaux de soudure et ferronnerie.', img: "https://i.supaimg.com/891653b3-5444-44d7-abb6-cbbdd1f4b5bd.jpg" },
    { title: 'Peintre rapide', description: 'Peinture et finitions intérieures.', img: "https://i.supaimg.com/da9c5439-08c6-45b6-a6c4-772d20bbe1da.jpg" },
    { title: 'Laveur de vitres Rapide', description: 'Nettoyage professionnel de vitres.', img: "https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/e7f7c3c8-89f3-4893-b163-c21f955e5e81.jpg" },
    { title: 'Technicien entretien climatisation Rapide', description: 'Entretien et recharge clim.', img: "https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/e079b93f-a2ab-4aa5-8be3-a6923b189f86.jpg" },
    { title: 'Installateur de caméras de surveillance Rapide', description: 'Installation vidéosurveillance.', img: "https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/2f8ca35b-fcf3-40ad-82fa-63742864e4ec.jpg" },
    { title: 'Fabricant de poufs Rapide', description: 'Création et réparation de poufs.', img: "https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/ebb24cd2-8a14-45c1-b273-0b4a81361c8b.jpg" },
    { title: 'Installateur de fenêtres et portes vitrées Rapide', description: 'Pose menuiserie et vitrerie.', img: "https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/9b3f3e05-c4d1-4687-9039-8d371e6a166c.jpg" },
    { title: 'Menuisier Rapide', description: 'Menuiserie bois et meubles.', img: "https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/f34061d0-a1bf-43fd-8043-e872aaab3759.jpg" },
];

// --- COMPONENT CAROUSEL ---
const BuildingCarousel: React.FC<{ onSelectItem: (item: any) => void }> = ({ onSelectItem }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer || isUserInteracting) return;

        const scrollStep = () => {
            if (!scrollContainer) return;
            if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
                scrollContainer.scrollLeft = 0;
            } else {
                scrollContainer.scrollLeft += 0.8; // Vitesse de défilement douce
            }
        };

        const intervalId = window.setInterval(scrollStep, 30);
        return () => window.clearInterval(intervalId);
    }, [isUserInteracting]);

    return (
        <div className="w-full pt-1 pb-4 overflow-hidden">
            <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto px-4 scrollbar-hide"
                onTouchStart={() => setIsUserInteracting(true)}
                onTouchEnd={() => setIsUserInteracting(false)}
                onMouseDown={() => setIsUserInteracting(true)}
                onMouseUp={() => setIsUserInteracting(false)}
                onMouseLeave={() => setIsUserInteracting(false)}
            >
                {batimentWorkers.map((item, idx) => (
                    <div 
                        key={idx}
                        onClick={() => onSelectItem(item)}
                        className="flex-shrink-0 w-[160px] bg-white rounded-[2rem] overflow-hidden shadow-xl flex flex-col transition-all relative border border-gray-100"
                    >
                        <div className="p-2">
                            <div className="h-[100px] w-full rounded-2xl overflow-hidden relative shadow-inner bg-slate-50 border border-gray-100">
                                <img src={item.img} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                        </div>
                        <div className="px-4 pb-4 flex flex-col text-left">
                            <h4 className="text-[12px] font-black text-gray-900 uppercase leading-tight mb-1 tracking-tight truncate lowercase">{item.title}</h4>
                            <p className="text-[#ef4444] font-black text-[10px] leading-tight mb-1.5 uppercase">
                                H. Descente : <span className="text-black font-bold">18h30</span>
                            </p>
                            <p className="text-[9px] text-gray-400 leading-snug italic line-clamp-2 mb-2 lowercase">
                                {item.description}
                            </p>
                            <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                                <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">Filant Services</span>
                                <div className="flex h-2.5 w-2.5 rounded-full border-2 border-white shadow-md animate-flash-green-red"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface HomeScreenProps {
  onNavigate: (view: 'worker_list' | 'registration_hub' | 'my_worker' | 'location_hub' | 'admin_sms' | 'location_map' | 'notifications' | 'emergency_form' | 'assistant_qr' | 'admin_connections' | 'admin_active_contacts' | 'admin_associations', category?: 'appartement' | 'equipement') => void;
  user: User;
  setActiveTab: (tab: Tab) => void;
  onOpenNightService: () => void;
  onOpenBuildingService: (item: any) => void;
  onRestrictedAccess: (message?: string) => void;
  onOpenFavorites?: () => void;
  onShowPopup: (
    msg: string, 
    type: 'alert' | 'confirm', 
    onConfirm?: (close: () => void, setLoading: (l: boolean) => void) => void,
    confirmLabel?: string,
    cancelLabel?: string
  ) => void;
  onRegisterDirectly?: (type: string) => void;
  onTriggerClosedNotification?: () => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate, user, setActiveTab, onOpenNightService, onOpenBuildingService, onRestrictedAccess, onOpenFavorites, onShowPopup, onRegisterDirectly }) => {
  const isMainServiceOpen = true;
  const isNightServiceOpen = true;

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showNoOffer, setShowNoOffer] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showScanner, setShowScanner] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // --- CONVERSATIONAL ASSISTANT STATES ---
  const [isSearchSubmitted, setIsSearchSubmitted] = useState(false);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [assistantText, setAssistantText] = useState('');
  const [matchedResult, setMatchedResult] = useState<any>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [timeLeft, setTimeLeft] = useState<{ min: number; sec: number } | null>(null);

  const isClientMode = user.role === 'Client';

  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentTime(new Date());
      }, 1000);
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
      const notifs = databaseService.getNotifications(user.phone);
      setUnreadCount(notifs.filter(n => !n.isRead).length);
      
      const notifTimer = setInterval(() => {
          const currentNotifs = databaseService.getNotifications(user.phone);
          setUnreadCount(currentNotifs.filter(n => !n.isRead).length);
      }, 5000);
      return () => clearInterval(notifTimer);
  }, [user.phone]);

  const CARD_LIFESPAN_MS = 30 * 24 * 60 * 60 * 1000; 
  const cardType = getCardType(user.role);
  const cardData = databaseService.getCardData(user.phone, cardType);

  useEffect(() => {
      if (!cardData) {
          setTimeLeft(null);
          return;
      }
      
      const interval = setInterval(() => {
          const now = Date.now();
          const end = cardData.uploadTimestamp + CARD_LIFESPAN_MS;
          const diff = end - now;
          
          if (diff <= 0) {
              setTimeLeft({ min: 0, sec: 0 });
              clearInterval(interval);
          } else {
              const days = Math.floor(diff / (24 * 60 * 60 * 1000));
              const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
              const mins = Math.floor((diff % (60 * 60 * 1000)) / 60000);
              const secs = Math.floor((diff % 60000) / 1000);
              
              // We'll just store min/sec for compatibility but we might want to display days
              setTimeLeft({
                  min: mins + (hours * 60) + (days * 24 * 60),
                  sec: secs
              });
          }
      }, 1000);
      
      return () => clearInterval(interval);
  }, [cardData]);

  const isCardExpired = cardData && (Date.now() > cardData.uploadTimestamp + CARD_LIFESPAN_MS);

  const handleNightServiceClick = () => {
      onOpenNightService();
  };

  const handleMainServiceClick = (view: 'worker_list' | 'registration_hub' | 'my_worker' | 'location_hub' | 'admin_sms' | 'location_map' | 'notifications' | 'emergency_form' | 'assistant_qr' | 'admin_connections' | 'admin_active_contacts' | 'admin_associations', category?: 'appartement' | 'equipement') => {
      onNavigate(view, category);
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const isClient = user.role === 'Client';
  const isEntreprise = user.role === 'Entreprise';
  const isTravailleur = user.role === 'Travailleur';
  const isProprietaire = user.role === 'Propriété' || user.role === 'Propriétaire d’équipement' || user.role === 'Propriétaire d’équipements';
  const isAgence = user.role === 'Agence' || user.role === 'Agence immobilière';
  
  const isProRole = isTravailleur || isProprietaire || isAgence;
  const isGroupA = isClient || isEntreprise;

  const menuTitle = useMemo(() => {
    if (isTravailleur) return "Travailleur";
    if (isProprietaire) return "Propriétaire d’équipements";
    if (isAgence) return "Agence immobilière";
    return "Mise en relation & Solutions";
  }, [isTravailleur, isProprietaire, isAgence]);

  const handleCardClick = () => {
      if (isClient || isEntreprise) {
          onRestrictedAccess();
          return;
      }

      if (!cardData) {
          handleRecoveryPayment();
          return;
      }

      if (isCardExpired) {
          handleRegularizationPayment();
          return;
      }
      
      // If active, we do nothing or just show a status alert
      onShowPopup("Votre mise en relation est active et valable 1 mois.", "alert");
  };

  const handleRecoveryPayment = () => {
    onShowPopup(
      "Activation de la mise en relation – 7 100 FCFA. Souhaitez-vous procéder au paiement pour activer votre carte ?", 
      'confirm', 
      async (close, setLoading) => {
        setLoading(true);
        
        const event = new CustomEvent('trigger-payment-view', {
            detail: {
                title: "Activation Mise en Relation",
                amount: "7100",
                waveLink: "https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=7100",
                paymentType: "Activation"
            }
        });
        window.dispatchEvent(event);

        setTimeout(() => {
            setLoading(false);
            close();
        }, 500);
      },
      "Payez maintenant",
      "Pas maintenant"
    );
  };

  const handleRegularizationPayment = () => {
      onShowPopup(
        "Renouvellement de la mise en relation – 500 FCFA. Souhaitez-vous payer pour prolonger de 1 mois ?", 
        'confirm', 
        async (close, setLoading) => {
          setLoading(true);
          
          const event = new CustomEvent('trigger-payment-view', {
              detail: {
                  title: "Renouvellement Mise en Relation",
                  amount: "500",
                  waveLink: "https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=500",
                  paymentType: "Renouvellement"
              }
          });
          window.dispatchEvent(event);

          setTimeout(() => {
              setLoading(false);
              close();
          }, 500);
        },
        "Payez maintenant",
        "Pas maintenant"
      );
  };

  const handleScanResult = (data: string) => {
    setShowScanner(false);
    const parseKeyValue = (text: string, key: string) => {
        const regex = new RegExp(`${key}\\s*[:=]\\s*([^\\n]+)`, 'i');
        return text.match(regex)?.[1]?.trim();
    };
    const sanitizePhoneNumber = (phone: string): string => {
        let cleanPhone = phone.replace(/[\s-.]/g, '');
        if (cleanPhone.startsWith('+225')) cleanPhone = cleanPhone.slice(4);
        return cleanPhone;
    };

    const title = parseKeyValue(data, 'Poste') || parseKeyValue(data, 'Titre') || 'Assistant QR';
    const name = parseKeyValue(data, 'Nom') || parseKeyValue(data, 'Prénom') || 'Travailleur';
    const phone = parseKeyValue(data, 'Tél') || parseKeyValue(data, 'Phone') || parseKeyValue(data, 'WhatsApp') || parseKeyValue(data, 'Téléphone');
    const city = parseKeyValue(data, 'Ville') || parseKeyValue(data, 'Localité') || parseKeyValue(data, 'Commune') || 'Non spécifiée';
    const details = parseKeyValue(data, 'Details') || parseKeyValue(data, 'Infos') || parseKeyValue(data, 'Détails');

    let info: any = null;
    if (name && phone) {
        info = { name, phone: sanitizePhoneNumber(phone), city, title, details };
    }

    if (info) {
        const currentContacts = databaseService.getContacts(user.phone);
        const newContact: SavedContact = {
            id: Date.now().toString(),
            title: info.title || 'Assistant QR',
            name: info.name,
            phone: info.phone,
            city: info.city,
            review: info.details || info.city 
        };
        databaseService.saveContacts(user.phone, [...currentContacts, newContact]);
        onShowPopup("Information validée et intégrée dans l'Assistance QR !", "alert");
    } else {
        onShowPopup("Le format du code QR n'a pas pu être structuré automatiquement.", "alert");
    }
  };

  const handleSearchSubmit = async () => {
    const val = searchTerm.trim().toLowerCase();
    if (!val) return;

    setIsSearchSubmitted(true);
    setIsAssistantThinking(true);
    setMatchedResult(null);
    setAssistantText(''); 

    const match = SEARCHABLE_TITLES.find(item => 
        val.includes(item.title.toLowerCase()) || item.title.toLowerCase().includes(val)
    );

    const response = await chatService.getHomeAssistantAdvice(searchTerm);
    
    setIsAssistantThinking(false);
    setAssistantText(response);
    audioService.speak(response);

    if (match && val.length > 2) {
        setMatchedResult(match);
    }
    
    setSearchTerm('');
  };

  const handleCancelSearch = () => {
    setIsSearchSubmitted(false);
    setAssistantText('');
    setMatchedResult(null);
    setSearchTerm('');
    audioService.cancel();
  };

  const handleSelectSearchResult = (item: any) => {
    const event = new CustomEvent('trigger-interactive-modal', { 
        detail: { title: item.title, formType: item.type } 
    });
    handleCancelSearch();
    handleMainServiceClick(item.type === 'worker' ? 'worker_list' : 'location_hub');
  };

  const bgClass = isClient ? 'bg-white' : 'bg-orange-500';
  const textClass = isClient ? 'text-slate-900' : 'text-white';

  if (showNoOffer) {
    return (
        <div className="fixed inset-0 z-[600] bg-orange-500 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
            <button 
                onClick={() => setShowNoOffer(false)}
                className="absolute top-8 left-8 p-3 bg-white/20 rounded-full text-white active:scale-90 transition-transform"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-[3rem] border border-white/20 shadow-2xl text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-white font-black text-2xl uppercase tracking-tighter leading-tight">
                    Aucune offre disponible pour le moment
                </p>
            </div>
            <p className="mt-8 text-white/60 font-bold uppercase tracking-widest text-[10px]">Filant°225 • Service Client</p>
        </div>
    );
  }

  return (
    <div className={`${bgClass} ${textClass} min-h-full flex flex-col font-sans relative`}>
      
      <MenuBackground />
      
      <div className="relative z-10 flex flex-col w-full">
      
        <header className="pt-5">
            <div className="flex justify-between items-center px-4 h-20">
                <div className="flex items-center gap-3 relative flex-1">
                    {user.role === 'Client' ? (
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onRegisterDirectly?.('Entreprise')} 
                                className="bg-white text-orange-600 px-4 rounded-xl shadow-md transform active:scale-95 transition-all flex items-center justify-center h-10 border-2 border-blue-600 relative overflow-hidden"
                            >
                                <span className="text-[11px] font-black uppercase whitespace-nowrap">Inscription des entreprises</span>
                            </button>
                            <button 
                                onClick={() => setShowHelpModal(true)}
                                className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg active:scale-90 transition-transform border-2 border-green-500"
                                title="Aide"
                            >
                                <HelpIcon />
                            </button>
                        </div>
                    ) : (
                        <>
                            {!isGroupA && !isAdmin(user) && (
                                <button onClick={() => onNavigate('registration_hub')} className="text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-md animate-flash-red-blue select-none">
                                    <InscriptionIcon className="w-4 h-4" />
                                    <span>INSCRIPTION</span>
                                </button>
                            )}
                            
                            {!isAdmin(user) && (
                                <div className="flex items-center pointer-events-none">
                                    <PointerArrow className={`w-5 h-5 ${isClient ? 'text-slate-900' : 'text-white'} animate-pointing-right drop-shadow-md`} />
                                </div>
                            )}

                            {!isAdmin(user) && (
                                <button 
                                    onClick={() => setShowNoOffer(true)}
                                    className="animate-fast-bounce active:scale-95 transition-transform group focus:outline-none"
                                >
                                    <img 
                                        src="https://i.supaimg.com/0011a7e2-e310-4119-a6bf-8a4545b13cd7.png" 
                                        alt="Filant Group" 
                                        className="h-16 w-auto object-contain drop-shadow-lg"
                                    />
                                </button>
                            )}

                            {isAdmin(user) && (
                                <div className="flex items-center gap-2">
                                     <img src="https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png" alt="Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                                     <h2 className="text-xl font-black text-white uppercase tracking-tighter">Administration</h2>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center space-x-3">
                    <div className={`text-lg font-bold ${isClient ? 'text-slate-900' : 'text-white'} font-mono tracking-wider select-none`}>
                        {formattedTime}
                    </div>
                    {isAdmin(user) ? (
                        <button 
                            onClick={() => onNavigate('admin_sms')}
                            className="active:scale-90 transition-transform shadow-lg focus:outline-none"
                            aria-label="Gestion SMS Administrateur"
                        >
                            <IvoryCoastFlagIcon className="h-6 w-9 rounded-sm" />
                        </button>
                    ) : (
                        <IvoryCoastFlagIcon className="h-6 w-9 rounded-sm shadow-sm" />
                    )}
                    
                    <button onClick={onOpenFavorites} className="focus:outline-none">
                        <HeartIcon className={`h-6 w-6 ${isClient ? 'text-slate-900' : 'text-white'} animate-flash-red-white`} />
                    </button>
                </div>
            </div>

            <div className={`bg-white/10 backdrop-blur-md my-4 p-6 border-y ${isClient ? 'border-slate-200' : 'border-white/10'} overflow-hidden`}>
                <div className="flex flex-col items-center">
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tighter flex items-center justify-center flex-nowrap whitespace-nowrap">
                        <img 
                            src="https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png" 
                            alt="Logo" 
                            className="w-14 h-14 sm:w-20 sm:h-20 object-contain mr-3"
                            referrerPolicy="no-referrer"
                        />
                        <div className="flex">
                            {"FILANT".split("").map((letter, idx) => (
                                <span 
                                    key={idx} 
                                    className="text-green-500 drop-shadow-[0_2px_10px_rgba(34,197,94,0.4)] animate-logo-letter"
                                    style={{ animationDelay: `${idx * 0.1}s` }}
                                >
                                    {letter}
                                </span>
                            ))}
                        </div>
                        <span className="text-white bg-orange-600 rounded-lg px-3 py-1 text-4xl sm:text-5xl ml-2 shadow-xl select-none animate-logo-225">225</span>
                    </h1>
                    <p className={`font-black text-xs mt-3 text-center uppercase tracking-[0.3em] ${isClient ? 'text-slate-400' : 'opacity-80'}`}>{menuTitle}</p>
                </div>
            </div>
            
            <div className="flex justify-between items-end px-4">
            <div>
                <p className={`text-xs uppercase font-bold ${isClient ? 'text-slate-400' : 'opacity-60'} tracking-wider`}>Session active</p>
                <p className="text-lg font-bold capitalize">
                    {user.name} {user.role && <span className={`text-xs font-normal ${isClient ? 'bg-slate-100 text-slate-600' : 'bg-white/20 text-white'} px-2 py-0.5 rounded-full ml-1`}>{user.role}</span>}
                </p>
                <p className="text-sm font-medium">{user.city} <span className="text-green-400 font-bold animate-pulse ml-2">• EN LIGNE</span></p>
            </div>
            <div className="flex items-start space-x-3">
                <a href="https://wa.me/2250705052632" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1 group">
                    <div className="bg-green-500 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                        <WhatsAppIcon />
                    </div>
                    <span className={`text-[8px] font-black uppercase ${isClient ? 'text-slate-600' : 'text-white'}`}>WhatsApp</span>
                </a>

                {isClient && (
                    <a href="https://www.tiktok.com/@filant225" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center space-y-1 group">
                        <div className="w-12 h-12 transform group-hover:scale-110 transition-transform flex items-center justify-center">
                            <img src={TIKTOK_IMAGE_URL} alt="TikTok" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>
                        <span className={`text-[8px] font-black uppercase text-slate-600`}>TikTok</span>
                    </a>
                )}

                {isClient && (
                    <button 
                        onClick={() => handleMainServiceClick('assistant_qr')}
                        className="flex flex-col items-center space-y-1 group"
                    >
                        <div className="bg-indigo-600 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                            <AssistantIcon />
                        </div>
                        <span className={`text-[8px] font-black uppercase text-slate-600`}>Assistant QR</span>
                    </button>
                )}

                {isClient && (
                    <button 
                        onClick={() => handleMainServiceClick('emergency_form')}
                        className="flex flex-col items-center space-y-1 group"
                    >
                        <div className="bg-red-600 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform border border-red-400 animate-pulse">
                            <EmergencyIcon />
                        </div>
                        <span className={`text-[8px] font-black uppercase text-slate-600`}>Urgence</span>
                    </button>
                )}

                {isProRole && !isAdmin(user) && (
                    <button 
                        onClick={() => handleMainServiceClick('notifications')}
                        className="bg-white text-orange-600 px-4 rounded-2xl shadow-lg transform active:scale-95 transition-all flex items-center justify-between h-[45px] border border-orange-100 min-w-[160px] relative overflow-hidden"
                    >
                        <span className="text-[10px] font-black uppercase whitespace-nowrap">Notification des services</span>
                        <div className="ml-3 flex items-center justify-center bg-orange-500 text-white w-6 h-6 rounded-full text-[10px] font-black shadow-inner border border-white/20">
                            {unreadCount}
                        </div>
                    </button>
                )}

                {isGroupA && !isClient && !isAdmin(user) && (
                    <button onClick={() => onNavigate('location_map')} className="flex flex-col items-center space-y-1 group">
                        <div className="bg-indigo-600 p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                            <MapPinIcon />
                        </div>
                        <span className="text-[8px] font-black uppercase text-white">Localisation</span>
                    </button>
                )}
            </div>
            </div>

            <div className="px-4 mt-6">
                <div className={`h-px bg-gradient-to-r from-transparent ${isClient ? 'via-slate-200' : 'via-white/30'} to-transparent`}></div>
            </div>
        </header>

        <main className="w-full p-4 flex flex-col gap-0 pb-12">
            <div className="flex flex-col">
                {isAdmin(user) ? (
                    <div className="grid grid-cols-2 gap-6 py-6 animate-in fade-in duration-500">
                        <button onClick={() => handleMainServiceClick('admin_connections')} className="bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                            <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-colors shadow-inner"><StorageIcon /></div>
                            <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Stockage des connexions</span>
                        </button>

                        <button onClick={() => handleMainServiceClick('admin_active_contacts')} className="bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                             <div className="bg-green-500/20 p-4 rounded-full group-hover:bg-green-500/30 transition-colors shadow-inner"><ActivationIcon /></div>
                            <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Activation des contacts</span>
                        </button>

                        <button onClick={() => handleMainServiceClick('admin_associations')} className="bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                             <div className="bg-purple-500/20 p-4 rounded-full group-hover:bg-purple-500/30 transition-colors shadow-inner"><AssociationIcon /></div>
                            <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Association de contacts</span>
                        </button>

                        <button onClick={() => handleMainServiceClick('admin_sms')} className="bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                             <div className="bg-orange-500/20 p-4 rounded-full group-hover:bg-orange-500/30 transition-colors shadow-inner"><SMSAdminIcon /></div>
                            <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Gestion des SMS</span>
                        </button>
                    </div>
                ) : (
                    <>
                        {isSearchSubmitted ? (
                            <div className="w-[92%] mx-auto bg-gradient-to-br from-orange-600 to-green-800 rounded-[2rem] p-4 shadow-2xl animate-in zoom-in-95 duration-500 min-h-[100px] flex flex-col items-center justify-center border-2 border-white/10 mb-4 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-search-border-flow"></div>
                                
                                <div className="w-full space-y-3">
                                    <div className="flex flex-row items-center gap-4 w-full">
                                        <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center shadow-lg bg-black/10 relative flex-shrink-0">
                                            <img src={ASSISTANT_IMAGE_URL} alt="Assistant" className="w-full h-full object-cover rounded-full" />
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${isAssistantThinking ? 'bg-orange-400 animate-bounce' : 'bg-green-500'} rounded-full border-2 border-white`}></div>
                                        </div>
                                        <div className="flex-1">
                                            {isAssistantThinking ? (
                                                <div className="flex gap-1">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                </div>
                                            ) : (
                                                <p className="text-white font-bold text-[13px] lowercase tracking-tight leading-tight animate-in fade-in duration-500">
                                                    {assistantText}
                                                </p>
                                            )}
                                        </div>
                                        {!isAssistantThinking && (
                                            <button 
                                                onClick={handleCancelSearch}
                                                className="p-2 text-white/40 hover:text-white transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        )}
                                    </div>
                                    
                                    {matchedResult && !isAssistantThinking && (
                                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl flex flex-row items-center gap-4 border border-white/10 shadow-inner animate-in slide-in-from-bottom-2 duration-500">
                                            <div className="flex-1 text-left overflow-hidden">
                                                <h5 className="text-white font-black text-sm uppercase leading-tight truncate">{matchedResult.title}</h5>
                                                <p className="text-white/70 text-[10px] font-medium leading-relaxed italic truncate">Service FILANT°225 prêt.</p>
                                            </div>
                                            <button 
                                                onClick={() => handleSelectSearchResult(matchedResult)}
                                                className="bg-white text-orange-600 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl transform active:scale-95 transition-all flex items-center gap-2 flex-shrink-0"
                                            >
                                                Ouvrir
                                                <SendIconSmall />
                                            </button>
                                        </div>
                                    )}
                                    
                                    {!isAssistantThinking && (
                                        <button onClick={handleCancelSearch} className="w-full text-center text-white/40 text-[9px] font-black uppercase">Fermer la discussion</button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mb-1">
                                {isProRole ? (
                                    <button 
                                        onClick={() => handleMainServiceClick('location_map')} 
                                        className="aspect-square bg-white text-slate-900 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-2xl transform active:scale-95 transition-all border-2 border-transparent hover:border-indigo-500 relative overflow-hidden group"
                                    >
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="absolute top-[-16px] left-[-16px] right-[-16px] h-1.5 bg-indigo-600"></div>
                                            <LargeMapPinIcon />
                                            <span className="text-sm font-black uppercase mt-3 tracking-tight">Localisation</span>
                                            <div className="mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-indigo-100 text-indigo-700">
                                                Itinéraire
                                            </div>
                                        </div>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleMainServiceClick('worker_list')} 
                                        className={`aspect-square bg-white text-slate-900 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-2xl transform active:scale-95 transition-all border-2 border-orange-500 relative overflow-hidden group`}
                                    >
                                        <img 
                                            src="https://i.supaimg.com/2681e7cd-50eb-4001-a420-79f8832470c3.jpg" 
                                            alt="" 
                                            className="absolute inset-0 w-full h-full object-cover opacity-15"
                                            referrerPolicy="no-referrer"
                                        />
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="absolute top-[-16px] left-[-16px] right-[-16px] h-1.5 bg-green-500"></div>
                                            <ServiceRapideIcon />
                                            <span className="text-sm font-black uppercase mt-3 tracking-tight">Travailleurs Qualifiés</span>
                                            <div className={`mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-green-100 text-green-700`}>
                                                Disponibles
                                            </div>
                                        </div>
                                    </button>
                                )}
                                
                                {isProRole ? (
                                    <button 
                                        onClick={handleCardClick} 
                                        className={`aspect-square bg-white text-slate-900 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-2xl transition-all border-2 border-white/10 relative overflow-hidden group active:scale-95`}
                                    >
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="absolute top-[-16px] left-[-16px] right-[-16px] h-1.5 bg-orange-500"></div>
                                            <LargeCarteProIcon />
                                            <span className="text-[10px] font-black uppercase mt-3 tracking-tighter leading-tight">
                                                {!cardData ? 'Activer la mise en relation – 7 100 F' : isCardExpired ? 'Activer la mise en relation – 500 F' : 'Mise en relation activée – 1 mois'}
                                            </span>
                                            {!cardData ? (
                                                <div className="mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-red-100 text-red-700 animate-pulse">
                                                    7 100 FCFA
                                                </div>
                                            ) : isCardExpired ? (
                                                <div className="mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-red-100 text-red-700 animate-pulse">
                                                    500 F
                                                </div>
                                            ) : (
                                                <div className="mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-green-100 text-green-700">
                                                    Activée
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleMainServiceClick('location_hub', 'appartement')} 
                                        className={`aspect-square bg-white text-slate-900 rounded-3xl p-4 flex flex-col items-center justify-center text-center shadow-2xl transform active:scale-95 transition-all border-2 border-orange-500 relative overflow-hidden group`}
                                    >
                                        <div className="relative z-10 flex flex-col items-center">
                                            <div className="absolute top-[-16px] left-[-16px] right-[-16px] h-1.5 bg-blue-600"></div>
                                            <LargeHouseIcon />
                                            <span className="text-sm font-black uppercase mt-3 tracking-tight">Location d'appartements</span>
                                            <div className={`mt-2 px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-blue-100 text-blue-700`}>
                                                Voir offres
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}

                        {isClient && (
                            <div className="px-4 py-0 w-full flex flex-col mb-1 gap-1">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 h-1.5 rounded-full bg-animated-search-border animate-search-border-flow shadow-lg"></div>
                                    <div className="relative w-full max-w-[240px] h-11 rounded-full p-[2.5px] overflow-hidden group shadow-xl">
                                        <div className="absolute inset-0 bg-animated-search-border animate-search-border-flow"></div>
                                        <div className="relative w-full h-full bg-[#3d4234] rounded-full flex items-center px-4 gap-2 shadow-inner">
                                            <div className="w-1 h-5 bg-white animate-search-cursor-color rounded-full"></div>
                                            <div className="flex-1 flex items-center justify-between overflow-hidden">
                                                <input 
                                                    ref={searchInputRef}
                                                    type="text"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    onKeyDown={(e) => { if(e.key === 'Enter') handleSearchSubmit(); }}
                                                    placeholder="Qu'est-ce que vous recherchez...."
                                                    className="bg-transparent border-none outline-none text-white/80 font-bold text-[10px] tracking-tight truncate w-full placeholder-white/40 lowercase"
                                                />
                                                <button 
                                                    onClick={handleSearchSubmit}
                                                    className={`${searchTerm.trim().length > 0 ? 'bg-orange-500' : 'bg-transparent text-white/40'} p-1.5 rounded-full transition-all active:scale-90 ml-1`}
                                                >
                                                    <SendIconSmall />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {isClient && !isSearchSubmitted && (
                            <BuildingCarousel onSelectItem={(item) => onOpenBuildingService(item)} />
                        )}

                        <div className="flex flex-col gap-4 mt-2">
                            {isGroupA && (
                                <button 
                                    onClick={() => handleMainServiceClick('location_hub', 'equipement')} 
                                    className={`w-full bg-white text-slate-900 rounded-3xl p-5 flex items-center justify-between shadow-xl transform active:scale-[0.98] transition-all border-2 border-green-500`}
                                >
                                    <div className="flex items-center space-x-4 text-left">
                                        <EquipmentIcon />
                                        <div className="flex flex-col items-start">
                                            <span className="text-lg font-black uppercase tracking-tight leading-none">Location d’équipements</span>
                                            <span className="text-[10px] opacity-80 mt-1 font-bold text-gray-500">Matériels, sonorisation, baches et plus</span>
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-full bg-orange-100 text-orange-600`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </button>
                            )}

                            <div className="flex flex-col gap-2 w-full">
                                {isProRole ? (
                                    <div className="flex flex-col w-full">
                                        <button 
                                            onClick={handleCardClick}
                                            className={`w-full ${!cardData || isCardExpired ? 'bg-red-600' : 'bg-green-600'} text-white rounded-3xl p-5 flex items-center justify-between shadow-xl transform active:scale-[0.98] transition-all border border-white/5 relative overflow-hidden`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <IconWrapper className="w-12 h-12 bg-white/20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                </IconWrapper>
                                                <div className="flex flex-col items-start text-left">
                                                    <span className="text-lg font-black uppercase tracking-tight leading-none">
                                                        {!cardData ? 'Activer la mise en relation – 7 100 F' : isCardExpired ? 'Activer la mise en relation – 500 F' : 'Mise en relation activée – 1 mois'}
                                                    </span>
                                                    <span className="text-[10px] mt-1 font-bold text-gray-300">
                                                        {!cardData ? 'Cliquez pour activer votre mise en relation professionnelle' : isCardExpired ? 'Votre accès a expiré. Payez 500F pour prolonger de 1 mois.' : 'Votre statut est actif et visible par les clients'}
                                                    </span>
                                                </div>
                                            </div>
                                            {!cardData && <div className="bg-white/20 p-2 rounded-full"><PointerArrow className="h-5 w-5" /></div>}
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleNightServiceClick}
                                        className="w-full bg-black text-white rounded-3xl p-5 flex items-center justify-between shadow-xl transform active:scale-[0.98] transition-all border border-white/5 relative overflow-hidden"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <ServiceDeNuitIcon />
                                            <div className="flex flex-col items-start">
                                                <span className="text-lg font-black uppercase tracking-tight leading-none">Service de Nuit</span>
                                                <span className={`text-[10px] mt-1 font-bold text-green-400`}>
                                                    ● En service actuellement
                                                </span>
                                            </div>
                                        </div>
                                        {isNightServiceOpen && (
                                            <div className="animate-pulse bg-green-500 w-3 h-3 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
      </div>

      {showScanner && <ScannerOverlay onScan={handleScanResult} onClose={() => setShowScanner(false)} />}

      {showHelpModal && (
          <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-white text-black rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
                  <button onClick={() => setShowHelpModal(false)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <HelpIcon />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest mb-6 border-b border-orange-500/20 pb-2">À PROPOS DE FILANT°225</h3>
                    <div className="space-y-4 text-sm font-bold text-gray-600 leading-relaxed">
                        <p>
                            Recherche rapide de solutions fiables et sécurisées en Côte d'Ivoire.
                        </p>
                        <p>
                            Réseau étendu de travailleurs, propriétaires et agences partenaires.
                        </p>
                        <p className="pt-4 border-t border-gray-100 text-[10px] uppercase font-black tracking-widest opacity-60">
                            © 2024 FILANT MAËL GROUP
                        </p>
                    </div>
                  </div>
                  <button onClick={() => setShowHelpModal(false)} className="w-full mt-8 bg-black text-white font-black py-4 rounded-2xl uppercase tracking-widest text-xs active:scale-95 transition-transform shadow-lg">Fermer</button>
              </div>
          </div>
      )}

      <style>{`
        .text-outline-white {
          text-shadow: 1px 1px 0 #FFFFFF, -1px -1px 0 #FFFFFF, 1px -1px 0 #FFFFFF, -1px 1px 0 #FFFFFF, 1px 1px 0 #FFFFFF;
        }
        @keyframes fast-bounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-3px) scale(1.05); }
        }
        .animate-fast-bounce {
          animation: fast-bounce 0.8s infinite ease-in-out;
        }
        @keyframes pointing-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-pointing-right {
          animation: pointing-right 1s infinite ease-in-out;
        }

        /* LOGO ANIMATIONS */
        @keyframes logo-letter {
          0%, 5% { opacity: 0; transform: scale(0.8) translateY(5px); }
          15%, 85% { opacity: 1; transform: scale(1) translateY(0); }
          95%, 100% { opacity: 0; }
        }
        .animate-logo-letter {
          animation: logo-letter 5s infinite;
          display: inline-block;
          opacity: 0;
        }

        @keyframes logo-225 {
          0%, 25% { opacity: 0; transform: translateX(0); }
          30%, 40% { opacity: 1; transform: translateX(0); }
          50% { opacity: 0; transform: translateX(-150%); }
          51% { opacity: 0; transform: translateX(150%); }
          60%, 85% { opacity: 1; transform: translateX(0); }
          95%, 100% { opacity: 0; }
        }
        .animate-logo-225 {
          animation: logo-225 5s infinite;
          opacity: 0;
        }

        @keyframes scanner-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(4px); }
        }
        .animate-scanner-float {
            animation: scanner-float 2.5s ease-in-out infinite;
        }

        @keyframes blink-fast {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
        }
        .animate-blink-fast {
            animation: blink-fast 0.6s step-end infinite;
        }

        /* SEARCH BAR ANIMATIONS */
        .bg-animated-search-border {
            background: linear-gradient(90deg, #FFFFFF, #16a34a, #000000, #f97316, #FFFFFF);
            background-size: 400% 100%;
        }
        
        @keyframes search-border-flow {
            0% { background-position: 0% 50%; }
            100% { background-position: 100% 50%; }
        }
        .animate-search-border-flow {
            animation: search-border-flow 3s linear infinite;
        }

        @keyframes search-cursor-color {
            0% { background-color: #FFFFFF; }
            25% { background-color: #16a34a; }
            50% { background-color: #000000; }
            75% { background-color: #f97316; }
            100% { background-color: #FFFFFF; }
        }
        .animate-search-cursor-color {
            animation: search-cursor-color 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;
