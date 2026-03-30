import React, { useState, useEffect, useMemo } from 'react';
import { databaseService, ConnectionLog, Association, ActiveContact, AdminContact } from '../services/databaseService';
import { User, PrivateRegistration } from '../types';
import Typewriter from './common/Typewriter';
import MenuBackground from './common/MenuBackground';
import { QRCodeSVG } from 'qrcode.react';

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`flex items-center justify-center rounded-full ${className}`}>
        {children}
    </div>
);

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const StorageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
const ActivationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const AssociationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const SMSAdminIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SMSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>;
const WaveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const AssistantIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const QRIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2m7-10h4m-4 4h4m-4 4h4M7 7h.01M7 11h.01M7 15h.01" /></svg>;
const SyncIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const WhatsAppIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.288 1.902 5.941l-1.442 5.253 5.354-1.405z" />
    </svg>
);
const CallIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
    </svg>
);
const ViewIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const SaveIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
);
const ShareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
);
const EditIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const AdminChatButton: React.FC<{ 
    user: Partial<User>; 
    onOpenChat?: (user: User) => void;
    className?: string;
}> = ({ user, onOpenChat, className }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Standardize chatUserId to always use the phone number if available
        const chatUserId = (user.phone || '').replace(/\D/g, '') || user.userId || user.id || `${user.name || 'User'}_${(user.phone || '').replace(/\D/g, '')}`;
        if (!chatUserId) return;
        
        let unsubscribe: any;
        
        const setupListener = () => {
            unsubscribe = databaseService.onUnreadAdminChatCount(chatUserId, 'user', (count) => {
                setUnreadCount(count);
            });
        };
        
        setupListener();
        
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [user.phone, user.name, user.id, user.userId]);

    return (
        <button 
            onClick={(e) => {
                e.stopPropagation();
                if (onOpenChat) {
                    const fullUser: User = {
                        id: user.id || user.userId || '',
                        userId: user.userId || user.id,
                        name: user.name || 'Utilisateur',
                        phone: user.phone || '',
                        role: user.role || 'Client',
                        city: user.city || 'Inconnue',
                        ...user
                    };
                    onOpenChat(fullUser);
                }
            }}
            className={`relative p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors active:scale-90 flex items-center justify-center ${className}`}
            title="Message Privé"
        >
            <ChatIcon className="w-5 h-5" />
            {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border border-white flex items-center justify-center">
                    <span className="text-[8px] font-black text-white">{unreadCount}</span>
                </div>
            )}
        </button>
    );
};

interface AdminDashboardScreenProps {
  onBack: () => void;
  onLogout?: () => void;
  onSelectUser?: (log: ConnectionLog) => void;
  onOpenChat?: (user: User) => void;
  initialView?: 'grid' | 'contacts' | 'associations' | 'active-contacts' | 'sms' | 'wave-payments' | 'assistant-requests';
}

const UserListItem: React.FC<{ user: User; onOpenChat?: (user: User) => void }> = ({ user, onOpenChat }) => {
    const [isVerified, setIsVerified] = useState(user.isVerified || false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleToggleVerify = async () => {
        setIsVerifying(true);
        try {
            const newStatus = !isVerified;
            // For general users in the dashboard, we assume they are in the 'users' collection
            await databaseService.verifyWorker(user.id || user.userId || '', 'users', newStatus);
            setIsVerified(newStatus);
        } catch (error) {
            console.error("Error toggling verification:", error);
            alert("Erreur lors de la modification du statut de vérification.");
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <div>
                        <h4 className="font-black text-gray-900 uppercase text-sm flex items-center gap-1">
                            {user.name}
                            {isVerified && (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812 3.066 3.066 0 00.723 1.745 3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                        </h4>
                        <p className="text-xs text-gray-500 font-bold">{user.city}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                        user.role === 'Admin 225' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                        {user.role || 'Client'}
                    </span>
                    <button 
                        onClick={handleToggleVerify}
                        disabled={isVerifying}
                        className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter transition-all active:scale-95 ${
                            isVerified ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                        }`}
                    >
                        {isVerifying ? '...' : isVerified ? 'Vérifié' : 'Vérifier'}
                    </button>
                </div>
            </div>
            <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                    <a href={`tel:${user.phone}`} className="text-blue-600 font-mono text-xs font-bold">+225 {user.phone}</a>
                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                        {user.lastSeen ? (typeof user.lastSeen === 'object' && 'toDate' in user.lastSeen ? (user.lastSeen as any).toDate().toLocaleDateString() : 'Actif') : 'Inscrit'}
                    </span>
                </div>
                <AdminChatButton user={user} onOpenChat={onOpenChat} />
            </div>
        </div>
    );
};

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBack, onLogout, onSelectUser, onOpenChat, initialView = 'grid' }) => {
  const [view, setView] = useState<'grid' | 'contacts' | 'associations' | 'active-contacts' | 'user-messages' | 'firestore-users' | 'wave-payments' | 'assistant-requests' | 'scanned-qr' | 'private-registrations' | 'registrations-travailleurs' | 'registrations-proprietaires' | 'registrations-agences' | 'registrations-entreprises'>(initialView);
  const [firestoreUsers, setFirestoreUsers] = useState<User[]>([]);
  const [privateRegistrations, setPrivateRegistrations] = useState<PrivateRegistration[]>([]);
  const [travailleurRegistrations, setTravailleurRegistrations] = useState<PrivateRegistration[]>([]);
  const [proprietaireRegistrations, setProprietaireRegistrations] = useState<PrivateRegistration[]>([]);
  const [agenceRegistrations, setAgenceRegistrations] = useState<PrivateRegistration[]>([]);
  const [entrepriseRegistrations, setEntrepriseRegistrations] = useState<PrivateRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<PrivateRegistration | null>(null);
  const [wavePayments, setWavePayments] = useState<any[]>([]);
  const [assistantRequests, setAssistantRequests] = useState<any[]>([]);
  const [scannedContacts, setScannedContacts] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedQR, setSelectedQR] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [activeContacts, setActiveContacts] = useState<ActiveContact[]>([]);
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const [editingContact, setEditingContact] = useState<AdminContact | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [shareMode, setShareMode] = useState<'none' | 'client' | 'outil'>('none');
  const [viewingContact, setViewingContact] = useState<AdminContact | null>(null);
  
  const [adminContactInputs, setAdminContactInputs] = useState<Partial<AdminContact>>({
      type: 'TRAVAILLEUR',
      name: '', city: '', phone: '', job: '', equipmentName: '', userName: '', agencyName: '', description: ''
  });

  const [contactInputs, setContactInputs] = useState({
      type: 'TRAVAILLEUR' as 'TRAVAILLEUR' | 'PROPRIÉTAIRE' | 'AGENCE',
      title: '', name: '', city: '', phone: '', description: ''
  });

  const [assocInputs, setAssocInputs] = useState({
      providerType: 'TRAVAILLEUR' as 'TRAVAILLEUR' | 'PROPRIÉTAIRE' | 'AGENCE',
      providerJob: '',
      providerName: '',
      providerCity: '',
      providerPhone: '',
      clientName: '',
      clientCity: '',
      clientPhone: '',
      clientDescription: ''
  });

  const refreshScannedContacts = async () => {
    setIsSyncing(true);
    try {
      const contacts = await databaseService.getAllScannedContacts();
      setScannedContacts(contacts);
    } catch (error) {
      console.error("Error refreshing scanned contacts:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
      if (view === 'contacts') setAdminContacts(databaseService.getAdminContacts());
      if (view === 'user-messages') {
        const unsubscribe = databaseService.onAllConversationsUpdate((convs) => {
          setConversations(convs);
        });
        return () => unsubscribe();
      }
      if (view === 'associations') setAssociations(databaseService.getAssociations());
      if (view === 'firestore-users') {
          setIsSyncing(true);
          databaseService.getUsersFromFirestore().then(users => {
              setFirestoreUsers(users);
              setIsSyncing(false);
          });
      }
      if (view === 'wave-payments') {
          setIsSyncing(true);
          databaseService.getWavePaymentsFromRTDB().then(payments => {
              setWavePayments(payments);
              setIsSyncing(false);
          });
      }
      if (view === 'assistant-requests') {
          setIsSyncing(true);
          databaseService.getAssistantRequestsFromRTDB().then(requests => {
              setAssistantRequests(requests);
              setIsSyncing(false);
          });
      }
      if (view === 'scanned-qr') {
          setIsSyncing(true);
          let unsubscribe: any;
          databaseService.onScannedContactsChange((contacts) => {
              setScannedContacts(contacts);
              setIsSyncing(false);
          }).then(unsub => {
              unsubscribe = unsub;
          });
          return () => {
              if (unsubscribe) unsubscribe();
          };
      }
      if (view === 'private-registrations') {
          setIsSyncing(true);
          const unsubscribe = databaseService.subscribeToPrivateRegistrations((registrations) => {
              setPrivateRegistrations(registrations);
              setIsSyncing(false);
          });
          return () => unsubscribe();
      }
      if (view === 'registrations-travailleurs') {
          setIsSyncing(true);
          const unsubscribe = databaseService.subscribeToPrivateRegistrationsByType('Travailleur', (registrations) => {
              setTravailleurRegistrations(registrations);
              setIsSyncing(false);
          });
          return () => unsubscribe();
      }
      if (view === 'registrations-proprietaires') {
          setIsSyncing(true);
          const unsubscribe = databaseService.subscribeToPrivateRegistrationsByType('Propriétaire d’équipement', (registrations) => {
              setProprietaireRegistrations(registrations);
              setIsSyncing(false);
          });
          return () => unsubscribe();
      }
      if (view === 'registrations-agences') {
          setIsSyncing(true);
          const unsubscribe = databaseService.subscribeToPrivateRegistrationsByType('Agence immobilière', (registrations) => {
              setAgenceRegistrations(registrations);
              setIsSyncing(false);
          });
          return () => unsubscribe();
      }
      if (view === 'registrations-entreprises') {
          setIsSyncing(true);
          const unsubscribe = databaseService.subscribeToPrivateRegistrationsByType('Entreprise', (registrations) => {
              setEntrepriseRegistrations(registrations);
              setIsSyncing(false);
          });
          return () => unsubscribe();
      }
      if (view === 'active-contacts') {
          const list = databaseService.getActiveContacts();
          const now = Date.now();
          const updated: ActiveContact[] = list.map(c => {
              if (c.status === 'active' && c.activationTimestamp && (now - c.activationTimestamp > ONE_MONTH_MS)) {
                  return { ...c, status: 'inactive', activationTimestamp: null } as ActiveContact;
              }
              return c;
          });
          setActiveContacts(updated);
          databaseService.saveActiveContacts(updated);
      }
  }, [view]);

  const handleAddAssociation = () => {
      if (!assocInputs.providerName || !assocInputs.providerPhone || !assocInputs.clientName || !assocInputs.clientPhone) {
          alert("Veuillez remplir les informations obligatoires.");
          return;
      }
      const newAssoc: Association = {
          id: Date.now().toString(),
          provider: {
              type: assocInputs.providerType,
              job: assocInputs.providerJob,
              name: assocInputs.providerName,
              city: assocInputs.providerCity,
              phone: assocInputs.providerPhone.replace(/\D/g, '')
          },
          client: {
              name: assocInputs.clientName,
              city: assocInputs.clientCity,
              phone: assocInputs.clientPhone.replace(/\D/g, ''),
              description: assocInputs.clientDescription
          },
          createdAt: new Date().toISOString(),
          status: 'active',
          isActivated: false
      };
      const updated = [newAssoc, ...associations];
      setAssociations(updated);
      databaseService.saveAssociations(updated);
      setAssocInputs({ 
          providerType: 'TRAVAILLEUR', providerJob: '', providerName: '', providerCity: '', providerPhone: '', 
          clientName: '', clientCity: '', clientPhone: '', clientDescription: '' 
      });
      setIsFormOpen(false);
  };

  const toggleAssociationActivation = (id: string) => {
      const updated = associations.map(a => {
          if (a.id === id) {
              return { ...a, isActivated: !a.isActivated };
          }
          return a;
      });
      setAssociations(updated);
      databaseService.saveAssociations(updated);
  };

  const handleAddActiveContact = () => {
      if (!contactInputs.name || !contactInputs.phone) {
          alert("Veuillez remplir au moins le nom et le numéro.");
          return;
      }
      const newContact: ActiveContact = {
          id: Date.now().toString(),
          type: contactInputs.type,
          title: contactInputs.title,
          name: contactInputs.name,
          city: contactInputs.city || 'Abidjan',
          phone: contactInputs.phone.replace(/\D/g, ''),
          description: contactInputs.description,
          status: 'inactive',
          activationTimestamp: null,
          createdAt: new Date().toISOString()
      };
      const updated = [newContact, ...activeContacts];
      setActiveContacts(updated);
      databaseService.saveActiveContacts(updated);
      setContactInputs({ type: 'TRAVAILLEUR', title: '', name: '', city: '', phone: '', description: '' });
      setIsFormOpen(false);
  };

  const toggleContactStatus = (id: string) => {
      const updated = activeContacts.map(c => {
          if (c.id === id) {
              const newStatus = c.status === 'active' ? 'inactive' : 'active';
              return { 
                  ...c, 
                  status: newStatus as 'active' | 'inactive', 
                  activationTimestamp: newStatus === 'active' ? Date.now() : null 
              } as ActiveContact;
          }
          return c;
      });
      setActiveContacts(updated);
      databaseService.saveActiveContacts(updated);
  };

  const handleDelete = async (id: string) => {
      if (!id) return;
      try {
          if (view === 'associations') {
              const updated = associations.filter(a => a.id !== id);
              setAssociations(updated);
              await databaseService.saveAssociations(updated);
          } else if (view === 'private-registrations' && itemToDelete) {
              await databaseService.deletePrivateRegistration(itemToDelete.typeInscription, itemToDelete.id);
          } else if (view === 'registrations-travailleurs' && itemToDelete) {
              await databaseService.deletePrivateRegistration('Travailleur', itemToDelete.id);
          } else if (view === 'registrations-proprietaires' && itemToDelete) {
              await databaseService.deletePrivateRegistration('Propriétaire d’équipement', itemToDelete.id);
          } else if (view === 'registrations-agences' && itemToDelete) {
              await databaseService.deletePrivateRegistration('Agence immobilière', itemToDelete.id);
          } else if (view === 'registrations-entreprises' && itemToDelete) {
              await databaseService.deletePrivateRegistration('Entreprise', itemToDelete.id);
          } else if (view === 'active-contacts') {
              const updated = activeContacts.filter(c => c.id !== id);
              setActiveContacts(updated);
              await databaseService.saveActiveContacts(updated);
          } else if (view === 'wave-payments' && itemToDelete) {
              await databaseService.deleteWavePayment(itemToDelete.userKey, itemToDelete.id);
              setWavePayments(prev => prev.filter(p => p.id !== itemToDelete.id));
          } else if (view === 'assistant-requests' && itemToDelete) {
              await databaseService.deleteAssistantRequest(itemToDelete.userKey, itemToDelete.id);
              setAssistantRequests(prev => prev.filter(r => r.id !== itemToDelete.id));
          } else if (view === 'user-messages' && itemToDelete) {
              await databaseService.deleteAdminConversation(itemToDelete.userId);
              setConversations(prev => prev.filter(c => c.userId !== itemToDelete.userId));
          }
          setDeleteId(null);
          setItemToDelete(null);
      } catch (error) {
          console.error("Erreur lors de la suppression:", error);
      }
  };

  const renderUserMessagesView = () => (
      <div className="flex-1 flex flex-col h-full bg-slate-900 animate-unfold-in text-left">
          <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-white">
                    <BackIcon />
                </button>
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex-1 text-center">Messages Utilisateurs</h2>
                <div className="w-10"></div>
          </header>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
              <div className="relative mb-6">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><SearchIcon /></div>
                   <input 
                    type="text" 
                    placeholder="Rechercher une conversation..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-2xl outline-none text-sm text-white placeholder:text-slate-500" 
                   />
              </div>

              <div className="space-y-3 pb-20">
                  {conversations
                    .filter(c => c.userName.toLowerCase().includes(searchTerm.toLowerCase()) || c.userId.includes(searchTerm))
                    .map((conv) => (
                      <button 
                        key={conv.userId}
                        onClick={() => {
                            if (onOpenChat) {
                                onOpenChat({
                                    id: conv.userId,
                                    userId: conv.userId,
                                    name: conv.userName,
                                    phone: conv.userId.match(/^\d+$/) ? conv.userId : '',
                                    role: 'Client',
                                    city: ''
                                } as User);
                            }
                        }}
                        className="w-full bg-slate-800/50 border border-slate-700 p-4 rounded-3xl flex items-center gap-4 hover:bg-slate-800 transition-all active:scale-[0.98] group"
                      >
                          <div className="relative">
                              <div className="w-12 h-12 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                  <ChatIcon />
                              </div>
                              {conv.unreadCount > 0 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full border-2 border-slate-900 flex items-center justify-center">
                                      <span className="text-[10px] font-black text-white">{conv.unreadCount}</span>
                                  </div>
                              )}
                          </div>
                          
                          <div className="flex-1 text-left min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                  <h4 className="font-black text-white uppercase text-xs truncate tracking-tighter">{conv.userName}</h4>
                                  <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-bold text-slate-500 uppercase">
                                          {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setDeleteId(conv.userId);
                                              setItemToDelete({ ...conv, name: conv.userName });
                                          }}
                                          className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all active:scale-90"
                                          title="Supprimer la conversation"
                                      >
                                          <TrashIcon className="w-3.5 h-3.5" />
                                      </button>
                                  </div>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate leading-tight">
                                  {conv.lastMessage}
                              </p>
                          </div>
                      </button>
                  ))}
                  {conversations.length === 0 && (
                      <div className="py-20 text-center">
                          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                              <ChatIcon />
                          </div>
                          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Aucun message trouvé</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );

  const renderActiveContactsView = () => (
      <div className="flex-1 flex flex-col h-full bg-white animate-unfold-in text-left">
          <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
                <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                    <BackIcon />
                </button>
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">Activation des contacts</h2>
                <div className="w-10"></div>
          </header>
          <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
              <div className="relative mb-6">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><SearchIcon /></div>
                   <input 
                    type="text" 
                    placeholder="Rechercher un contact..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-12 py-2.5 bg-white border border-gray-300 rounded-full shadow-sm focus:ring-1 focus:ring-orange-500 outline-none text-sm text-gray-900" 
                   />
              </div>
              <button 
                onClick={() => setIsFormOpen(!isFormOpen)} 
                className="w-full bg-[#FF4500] hover:bg-red-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all transform active:scale-[0.98] text-sm uppercase tracking-widest mb-8"
              >
                  {isFormOpen ? 'Fermer le formulaire' : 'Nouveau Contact à Activer'}
              </button>
              
              {isFormOpen && (
                  <div className="bg-gray-50 border border-gray-200 rounded-[2.5rem] p-6 shadow-inner animate-in slide-in-from-top duration-300 space-y-4 mb-8">
                      <select 
                        value={contactInputs.type} 
                        onChange={e => setContactInputs(p => ({ ...p, type: e.target.value as any }))} 
                        className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-gray-800"
                      >
                          <option value="TRAVAILLEUR">TRAVAILLEUR</option>
                          <option value="PROPRIÉTAIRE">PROPRIÉTAIRE</option>
                          <option value="AGENCE">AGENCE</option>
                      </select>

                      {contactInputs.type === 'TRAVAILLEUR' && (
                          <input type="text" placeholder="Métier *" value={contactInputs.title} onChange={e => setContactInputs(p => ({ ...p, title: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                      )}
                      {contactInputs.type === 'PROPRIÉTAIRE' && (
                          <input type="text" placeholder="Titre d'intégration *" value={contactInputs.title} onChange={e => setContactInputs(p => ({ ...p, title: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                      )}

                      <input type="text" placeholder="Nom *" value={contactInputs.name} onChange={e => setContactInputs(p => ({ ...p, name: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                      <input type="text" placeholder="Ville" value={contactInputs.city} onChange={e => setContactInputs(p => ({ ...p, city: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                      <input type="tel" placeholder="Numéro *" value={contactInputs.phone} onChange={e => setContactInputs(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                      <textarea placeholder="Description *" value={contactInputs.description} onChange={e => setContactInputs(p => ({ ...p, description: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none h-24" />
                      
                      <div className="flex gap-3 pt-2">
                          <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-200 text-gray-600 font-bold py-4 rounded-xl uppercase text-xs tracking-widest">Annuler</button>
                          <button onClick={handleAddActiveContact} className="flex-1 bg-green-600 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-green-200">Enregistrer</button>
                      </div>
                  </div>
              )}

              <div className="space-y-8 pb-32">
                  {activeContacts.filter(c => 
                    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    c.title?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(contact => (
                      <div key={contact.id} className="space-y-2">
                          <div className="flex justify-center">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                                  Créé le {new Date(contact.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </span>
                          </div>
                          <div className="bg-white rounded-[2rem] shadow-2xl relative border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                              <button onClick={() => { setItemToDelete(contact); setDeleteId(contact.id); }} className="absolute top-3 right-3 z-30 p-3 bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-md active:scale-90">
                                <TrashIcon />
                              </button>
                              
                              <div className="flex items-stretch min-h-[140px]">
                                  {/* Infos Contact (Gauche) */}
                                  <div className="flex-1 p-5 bg-gray-50/30 flex flex-col justify-between border-r border-gray-100">
                                      <div>
                                          <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 block">{contact.type}</span>
                                          <h4 className="font-black text-gray-900 text-sm uppercase leading-tight">{contact.name}</h4>
                                          {contact.title && <p className="text-[10px] text-orange-500 font-black uppercase mt-1">{contact.title}</p>}
                                          <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{contact.city}</p>
                                          <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 italic">"{contact.description}"</p>
                                      </div>
                                      <div className="flex gap-2 mt-4">
                                          <AdminChatButton 
                                              user={{
                                                  name: contact.name,
                                                  phone: contact.phone
                                              }}
                                              onOpenChat={onOpenChat}
                                              className="flex-1 h-10 rounded-xl"
                                          />
                                          <a href={`tel:${contact.phone}`} className="flex-1 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm active:scale-95 transition-transform">
                                              <CallIcon className="w-4 h-4" />
                                          </a>
                                          <a href={`https://wa.me/225${contact.phone}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform">
                                              <WhatsAppIcon className="w-4 h-4" />
                                          </a>
                                      </div>
                                  </div>

                                  {/* Bouton Activer (Droite) */}
                                  <div className="w-24 flex flex-col items-center justify-center bg-gray-50/10">
                                      <button 
                                        onClick={() => toggleContactStatus(contact.id)}
                                        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform active:scale-90 ${
                                            contact.status === 'active' 
                                            ? 'bg-green-500 text-white animate-rapid-blink-green shadow-green-200' 
                                            : 'bg-gray-100 text-gray-400'
                                        }`}
                                      >
                                          <div className={`w-3.5 h-3.5 rounded-full ${contact.status === 'active' ? 'bg-white animate-ping' : 'bg-gray-300'}`}></div>
                                      </button>
                                      <span className={`text-[9px] font-black uppercase tracking-tighter mt-3 ${contact.status === 'active' ? 'text-green-600' : 'text-gray-400'}`}>
                                          {contact.status === 'active' ? 'Activé' : 'Éteint'}
                                      </span>
                                      {contact.status === 'active' && contact.activationTimestamp && (
                                          <span className="text-[7px] text-gray-400 mt-1 font-bold">
                                              Expire le {new Date(contact.activationTimestamp + ONE_MONTH_MS).toLocaleDateString()}
                                          </span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderAssociationView = () => (
      <div className="flex-1 flex flex-col h-full bg-white font-sans animate-unfold-in text-left">
          <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
                <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                    <BackIcon />
                </button>
                <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">Association de contacts</h2>
                <div className="w-10"></div>
          </header>
          <div className="p-4 bg-white space-y-4 flex-1 overflow-y-auto scrollbar-hide">
              <div className="relative mb-6">
                   <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><SearchIcon /></div>
                   <input 
                    type="text" 
                    placeholder="Rechercher..."
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-12 py-2.5 bg-white border border-gray-300 rounded-full outline-none text-sm text-gray-900" 
                   />
              </div>
              <button 
                onClick={() => setIsFormOpen(!isFormOpen)} 
                className="w-full bg-[#FF4500] hover:bg-red-600 text-white font-black py-4 px-6 rounded-2xl shadow-lg transition-all text-sm uppercase tracking-widest mb-8"
              >
                {isFormOpen ? 'Fermer le formulaire' : 'Nouvelle Association'}
              </button>
              
              {isFormOpen && (
                  <div className="bg-gray-50 border border-gray-200 rounded-[2.5rem] p-6 shadow-inner space-y-6 mb-8">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-orange-600 uppercase tracking-widest border-b border-orange-200 pb-2">Prestataire</h3>
                            <select 
                                value={assocInputs.providerType} 
                                onChange={e => setAssocInputs(p => ({ ...p, providerType: e.target.value }))} 
                                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-gray-800"
                            >
                                <option value="TRAVAILLEUR">TRAVAILLEUR</option>
                                <option value="PROPRIÉTAIRE">PROPRIÉTAIRE</option>
                                <option value="AGENCE">AGENCE</option>
                            </select>
                            <input type="text" placeholder="Métier *" value={assocInputs.providerJob} onChange={e => setAssocInputs(p => ({ ...p, providerJob: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <input type="text" placeholder="Nom *" value={assocInputs.providerName} onChange={e => setAssocInputs(p => ({ ...p, providerName: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <input type="text" placeholder="Ville *" value={assocInputs.providerCity} onChange={e => setAssocInputs(p => ({ ...p, providerCity: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <input type="tel" placeholder="Numéro *" value={assocInputs.providerPhone} onChange={e => setAssocInputs(p => ({ ...p, providerPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-xs font-black text-blue-600 uppercase tracking-widest border-b border-blue-200 pb-2">Client</h3>
                            <input type="text" placeholder="Nom Client *" value={assocInputs.clientName} onChange={e => setAssocInputs(p => ({ ...p, clientName: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <input type="text" placeholder="Ville Client *" value={assocInputs.clientCity} onChange={e => setAssocInputs(p => ({ ...p, clientCity: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <input type="tel" placeholder="Numéro Client *" value={assocInputs.clientPhone} onChange={e => setAssocInputs(p => ({ ...p, clientPhone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <textarea placeholder="Description *" value={assocInputs.clientDescription} onChange={e => setAssocInputs(p => ({ ...p, clientDescription: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none h-20" />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-200 text-gray-600 font-bold py-4 rounded-xl uppercase text-xs tracking-widest">Annuler</button>
                            <button onClick={handleAddAssociation} className="flex-1 bg-green-600 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-green-200">Associer</button>
                        </div>
                  </div>
              )}

              <div className="space-y-8 pb-32">
                  {associations.filter(a => 
                    a.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    a.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    a.provider?.job?.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map(assoc => (
                      <div key={assoc.id} className="space-y-2">
                          <div className="flex justify-center">
                              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 border border-gray-100 px-3 py-1 rounded-full shadow-sm">
                                  Intégré le {new Date(assoc.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
                          </div>
                          <div className="bg-white rounded-[2rem] shadow-2xl relative border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                          <button onClick={() => { setItemToDelete(assoc); setDeleteId(assoc.id); }} className="absolute top-3 right-3 z-30 p-3 bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-md active:scale-90">
                            <TrashIcon />
                          </button>
                          
                          <div className="flex items-stretch min-h-[160px]">
                              {/* Côté Client (Gauche) */}
                              <div className="flex-1 p-5 bg-blue-50/30 flex flex-col justify-between border-r border-gray-100">
                                  <div>
                                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 block">Client</span>
                                      <h4 className="font-black text-gray-900 text-sm uppercase leading-tight">{assoc.client?.name || "Client Inconnu"}</h4>
                                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{assoc.client?.city}</p>
                                      <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 italic">"{assoc.client?.description}"</p>
                                  </div>
                                  <div className="flex gap-2 mt-4">
                                      <AdminChatButton 
                                          user={{
                                              userId: assoc.client?.userId,
                                              name: assoc.client?.name,
                                              phone: assoc.client?.phone
                                          }}
                                          onOpenChat={onOpenChat}
                                          className="flex-1 h-10 rounded-xl"
                                      />
                                      <a href={`tel:${assoc.client?.phone}`} className="flex-1 h-10 rounded-xl bg-white border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm active:scale-95 transition-transform">
                                          <CallIcon className="w-4 h-4" />
                                      </a>
                                      <a href={`https://wa.me/225${assoc.client?.phone}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform">
                                          <WhatsAppIcon className="w-4 h-4" />
                                      </a>
                                  </div>
                              </div>

                              {/* Bouton Activer (Milieu) */}
                              <div className="w-16 flex flex-col items-center justify-center relative bg-white z-10">
                                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gray-100"></div>
                                  <button 
                                    onClick={() => toggleAssociationActivation(assoc.id)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center z-20 shadow-lg transition-all duration-300 transform active:scale-90 ${
                                        assoc.isActivated 
                                        ? 'bg-green-500 text-white animate-rapid-blink-green shadow-green-200' 
                                        : 'bg-gray-100 text-gray-400'
                                    }`}
                                  >
                                      <div className={`w-3 h-3 rounded-full ${assoc.isActivated ? 'bg-white animate-ping' : 'bg-gray-300'}`}></div>
                                  </button>
                                  <span className={`text-[8px] font-black uppercase tracking-tighter mt-2 z-20 ${assoc.isActivated ? 'text-green-600' : 'text-gray-400'}`}>
                                      {assoc.isActivated ? 'Actif' : 'Off'}
                                  </span>
                              </div>

                              {/* Côté Prestataire (Droite) */}
                              <div className="flex-1 p-5 bg-orange-50/30 flex flex-col justify-between">
                                  <div className="text-right">
                                      <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1 block">{assoc.provider?.type || "PRESTATAIRE"}</span>
                                      <h4 className="font-black text-gray-900 text-sm uppercase leading-tight">{assoc.provider?.name || "Inconnu"}</h4>
                                      <p className="text-[10px] text-orange-500 font-black uppercase mt-1">{assoc.provider?.job}</p>
                                      <p className="text-[10px] text-gray-500 font-bold uppercase mt-0.5">{assoc.provider?.city}</p>
                                  </div>
                                  <div className="flex gap-2 mt-4">
                                      <AdminChatButton 
                                          user={{
                                              userId: assoc.provider?.userId,
                                              name: assoc.provider?.name,
                                              phone: assoc.provider?.phone
                                          }}
                                          onOpenChat={onOpenChat}
                                          className="flex-1 h-10 rounded-xl"
                                      />
                                      <a href={`https://wa.me/225${assoc.provider?.phone}`} target="_blank" rel="noopener noreferrer" className="flex-1 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white shadow-sm active:scale-95 transition-transform">
                                          <WhatsAppIcon className="w-4 h-4" />
                                      </a>
                                      <a href={`tel:${assoc.provider?.phone}`} className="flex-1 h-10 rounded-xl bg-white border border-orange-200 flex items-center justify-center text-orange-600 shadow-sm active:scale-95 transition-transform">
                                          <CallIcon className="w-4 h-4" />
                                      </a>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const handleAddAdminContact = () => {
      if (!adminContactInputs.name || !adminContactInputs.phone) {
          alert("Veuillez remplir au moins le nom et le numéro.");
          return;
      }
      const newContact: AdminContact = {
          ...(adminContactInputs as AdminContact),
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
      };
      const updated = [newContact, ...adminContacts];
      setAdminContacts(updated);
      databaseService.saveAdminContacts(updated);
      setAdminContactInputs({ type: 'TRAVAILLEUR', name: '', city: '', phone: '', job: '', equipmentName: '', userName: '', agencyName: '', description: '' });
      setIsFormOpen(false);
  };

  const handleUpdateAdminContact = () => {
      if (!editingContact) return;
      const updated = adminContacts.map(c => c.id === editingContact.id ? { ...editingContact, ...adminContactInputs } as AdminContact : c);
      setAdminContacts(updated);
      databaseService.saveAdminContacts(updated);
      setEditingContact(null);
      setAdminContactInputs({ type: 'TRAVAILLEUR', name: '', city: '', phone: '', job: '', equipmentName: '', userName: '', agencyName: '', description: '' });
      setIsFormOpen(false);
  };

  const handleDeleteAdminContact = (id: string) => {
      const updated = adminContacts.filter(c => c.id !== id);
      setAdminContacts(updated);
      databaseService.saveAdminContacts(updated);
  };

  const handleSaveToNativeContacts = (contact: AdminContact) => {
      const vCard = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${contact.name};;;`,
          `FN:${contact.name}`,
          `TEL;TYPE=CELL:+225${contact.phone}`,
          `ADR;TYPE=HOME:;;${contact.city};;;`,
          contact.job ? `TITLE:${contact.job}` : '',
          contact.agencyName ? `ORG:${contact.agencyName}` : '',
          contact.description ? `NOTE:${contact.description}` : '',
          'END:VCARD'
      ].filter(Boolean).join('\r\n');

      const blob = new Blob([vCard], { type: 'text/vcard;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      
      // On mobile, window.open(url) often triggers the native "Open with Contacts" or "Preview"
      // which allows the user to save it directly without going through the downloads folder.
      const newWin = window.open(url);
      
      // Fallback for browsers that block window.open or don't handle blob URLs this way
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `${contact.name.replace(/\s+/g, '_')}.vcf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }

      // Cleanup
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
  };

  const handleSyncToGoogle = async (contact: AdminContact) => {
      try {
          const response = await fetch('/api/contacts/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ contact })
          });
          
          if (response.status === 401) {
              const authRes = await fetch('/api/auth/google/url');
              const { url } = await authRes.json();
              window.open(url, 'google_auth', 'width=600,height=700');
              
              const messageHandler = (event: MessageEvent) => {
                  if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
                      window.removeEventListener('message', messageHandler);
                      handleSyncToGoogle(contact);
                  }
              };
              window.addEventListener('message', messageHandler);
          } else if (response.ok) {
              alert("Contact synchronisé avec succès !");
          } else {
              alert("Erreur lors de la synchronisation.");
          }
      } catch (error) {
          alert("Erreur réseau.");
      }
  };

  const toggleContactSelection = (id: string) => {
      setSelectedContacts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleShare = (mode: 'client' | 'outil') => {
      setShareMode(mode);
  };

  const renderContactStorageView = () => {
      const filteredContacts = adminContacts.filter(c => {
          const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm);
          if (shareMode === 'client') return matchesSearch && c.type === 'CLIENT';
          if (shareMode === 'outil') return matchesSearch && (c.type === 'TRAVAILLEUR' || c.type === 'PROPRIÉTAIRE' || c.type === 'AGENCE');
          return matchesSearch;
      });

      return (
          <div className="flex-1 flex flex-col h-full bg-white font-sans animate-unfold-in text-left">
              <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
                    <button onClick={() => { setView('grid'); setShareMode('none'); setSelectedContacts([]); }} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                        <BackIcon />
                    </button>
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">Stockage des contacts</h2>
                    <div className="w-10"></div>
              </header>
              <div className="p-4 bg-white space-y-4 flex-1 overflow-y-auto scrollbar-hide">
                  <div className="relative mb-6">
                       <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none"><SearchIcon /></div>
                       <input 
                        type="text" 
                        placeholder="Rechercher un contact..."
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="w-full pl-12 pr-12 py-2.5 bg-white border border-gray-300 rounded-full outline-none text-sm text-gray-900" 
                       />
                  </div>

                  <div className="flex gap-3 mb-6">
                      <button 
                        onClick={() => { setIsFormOpen(!isFormOpen); setEditingContact(null); }} 
                        className="flex-1 bg-[#FF4500] hover:bg-red-600 text-white font-black py-4 px-4 rounded-2xl shadow-lg transition-all text-[10px] uppercase tracking-widest"
                      >
                        {isFormOpen ? 'Fermer' : 'Ajouter Contact'}
                      </button>
                      <div className="flex-1 flex gap-2">
                          <button onClick={() => handleShare('client')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${shareMode === 'client' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Client</button>
                          <button onClick={() => handleShare('outil')} className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${shareMode === 'outil' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>Outil</button>
                      </div>
                  </div>
                  
                  {isFormOpen && (
                      <div className="bg-gray-50 border border-gray-200 rounded-[2.5rem] p-6 shadow-inner space-y-4 mb-8">
                            <select 
                                value={adminContactInputs.type} 
                                onChange={e => setAdminContactInputs(p => ({ ...p, type: e.target.value as any }))} 
                                className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm font-bold text-gray-800"
                            >
                                <option value="TRAVAILLEUR">TRAVAILLEUR</option>
                                <option value="PROPRIÉTAIRE">PROPRIÉTAIRE D'ÉQUIPEMENT</option>
                                <option value="AGENCE">AGENCE IMMOBILIÈRE</option>
                                <option value="CLIENT">CLIENT</option>
                            </select>

                            {adminContactInputs.type === 'TRAVAILLEUR' && (
                                <input type="text" placeholder="Métier *" value={adminContactInputs.job} onChange={e => setAdminContactInputs(p => ({ ...p, job: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            )}
                            {adminContactInputs.type === 'PROPRIÉTAIRE' && (
                                <>
                                    <input type="text" placeholder="Nom de l'équipement *" value={adminContactInputs.equipmentName} onChange={e => setAdminContactInputs(p => ({ ...p, equipmentName: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                                    <input type="text" placeholder="Nom de l'utilisateur *" value={adminContactInputs.userName} onChange={e => setAdminContactInputs(p => ({ ...p, userName: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                                </>
                            )}
                            {adminContactInputs.type === 'AGENCE' && (
                                <input type="text" placeholder="Nom de l'agence *" value={adminContactInputs.agencyName} onChange={e => setAdminContactInputs(p => ({ ...p, agencyName: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            )}

                            <input type="text" placeholder="Nom *" value={adminContactInputs.name} onChange={e => setAdminContactInputs(p => ({ ...p, name: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <input type="text" placeholder="Ville *" value={adminContactInputs.city} onChange={e => setAdminContactInputs(p => ({ ...p, city: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            <input type="tel" placeholder="Numéro *" value={adminContactInputs.phone} onChange={e => setAdminContactInputs(p => ({ ...p, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none" />
                            
                            {adminContactInputs.type === 'CLIENT' && (
                                <textarea placeholder="Description *" value={adminContactInputs.description} onChange={e => setAdminContactInputs(p => ({ ...p, description: e.target.value }))} className="w-full bg-white border border-gray-300 rounded-xl p-3 text-sm outline-none h-20" />
                            )}

                            <div className="flex gap-3 pt-4">
                                <button onClick={() => { setIsFormOpen(false); setEditingContact(null); }} className="flex-1 bg-gray-200 text-gray-600 font-bold py-4 rounded-xl uppercase text-xs tracking-widest">Annuler</button>
                                <button onClick={editingContact ? handleUpdateAdminContact : handleAddAdminContact} className="flex-1 bg-green-600 text-white font-black py-4 rounded-xl uppercase text-xs tracking-widest shadow-lg shadow-green-200">
                                    {editingContact ? 'Modifier' : 'Enregistrer'}
                                </button>
                            </div>
                      </div>
                  )}

                  <div className="space-y-4 pb-32">
                      {filteredContacts.map(contact => (
                          <div key={contact.id} className={`bg-white rounded-[2rem] shadow-xl relative border border-gray-100 overflow-hidden transition-all ${selectedContacts.includes(contact.id) ? 'ring-2 ring-orange-500' : ''}`}>
                              <div className="p-5 flex items-center gap-4">
                                  <div className="flex-1" onClick={() => toggleContactSelection(contact.id)}>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                              contact.type === 'CLIENT' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                          }`}>
                                              {contact.type}
                                          </span>
                                      </div>
                                      <h4 className="font-black text-gray-900 text-sm uppercase leading-tight">{contact.name}</h4>
                                      <p className="text-[10px] text-gray-500 font-bold uppercase">{contact.city}</p>
                                      <p className="text-[10px] text-gray-400 font-mono mt-1">+225 {contact.phone}</p>
                                  </div>
                                  
                                  <div className="flex gap-2">
                                      <AdminChatButton 
                                          user={{
                                              name: contact.name,
                                              phone: contact.phone,
                                              city: contact.city
                                          }}
                                          onOpenChat={onOpenChat}
                                          className="p-2.5 rounded-full"
                                      />
                                      <a href={`tel:${contact.phone}`} className="p-2.5 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors">
                                          <CallIcon className="w-4 h-4" />
                                      </a>
                                      <a href={`https://wa.me/225${contact.phone}`} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-[#25D366] rounded-full text-white hover:opacity-90 transition-opacity">
                                          <WhatsAppIcon className="w-4 h-4" />
                                      </a>
                                      <button onClick={() => setViewingContact(contact)} className="p-2.5 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors">
                                          <ViewIcon className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => handleSaveToNativeContacts(contact)} className="p-2.5 bg-green-100 rounded-full text-green-600 hover:bg-green-200 transition-colors">
                                          <SaveIcon className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => { setEditingContact(contact); setAdminContactInputs(contact); setIsFormOpen(true); }} className="p-2.5 bg-gray-100 rounded-full text-gray-400 hover:text-orange-500 transition-colors">
                                          <EditIcon className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => { setItemToDelete(contact); setDeleteId(contact.id); }} className="p-2.5 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                          <TrashIcon />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {viewingContact && (
                  <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                          <h3 className="text-xl font-black text-gray-900 mb-4 uppercase tracking-tight border-b border-gray-100 pb-2">Détails Contact</h3>
                          <div className="space-y-4 text-sm">
                              <div><span className="text-[10px] font-black text-gray-400 uppercase block">Type</span><p className="font-bold text-gray-800">{viewingContact.type}</p></div>
                              <div><span className="text-[10px] font-black text-gray-400 uppercase block">Nom</span><p className="font-bold text-gray-800">{viewingContact.name}</p></div>
                              {viewingContact.job && <div><span className="text-[10px] font-black text-gray-400 uppercase block">Métier</span><p className="font-bold text-gray-800">{viewingContact.job}</p></div>}
                              {viewingContact.equipmentName && <div><span className="text-[10px] font-black text-gray-400 uppercase block">Équipement</span><p className="font-bold text-gray-800">{viewingContact.equipmentName}</p></div>}
                              {viewingContact.agencyName && <div><span className="text-[10px] font-black text-gray-400 uppercase block">Agence</span><p className="font-bold text-gray-800">{viewingContact.agencyName}</p></div>}
                              <div><span className="text-[10px] font-black text-gray-400 uppercase block">Ville</span><p className="font-bold text-gray-800">{viewingContact.city}</p></div>
                              <div><span className="text-[10px] font-black text-gray-400 uppercase block">Téléphone</span><p className="font-bold text-gray-800">+225 {viewingContact.phone}</p></div>
                              {viewingContact.description && <div><span className="text-[10px] font-black text-gray-400 uppercase block">Description</span><p className="text-gray-600 italic">"{viewingContact.description}"</p></div>}
                          </div>
                          <button onClick={() => setViewingContact(null)} className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest">Fermer</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderFirestoreUsersView = () => (
    <div className="flex-1 flex flex-col h-full bg-white font-sans animate-unfold-in text-left">
        <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
            <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                <BackIcon />
            </button>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">Utilisateurs Cloud (Firebase)</h2>
            <button 
                onClick={() => {
                    setIsSyncing(true);
                    databaseService.getUsersFromFirestore().then(users => {
                        setFirestoreUsers(users);
                        setIsSyncing(false);
                    });
                }}
                disabled={isSyncing}
                className={`p-2 rounded-full hover:bg-gray-100 text-blue-600 transition-all ${isSyncing ? 'animate-spin' : ''}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            {firestoreUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <StorageIcon />
                    <p className="mt-4 font-bold uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucun utilisateur dans le Cloud'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {firestoreUsers.map((user, idx) => (
                        <UserListItem key={idx} user={user} onOpenChat={onOpenChat} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  const renderWavePaymentsView = () => (
    <div className="flex-1 flex flex-col h-full bg-white font-sans animate-unfold-in text-left">
        <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
            <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                <BackIcon />
            </button>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">Paiements Wave (RTDB)</h2>
            <button 
                onClick={() => {
                    setIsSyncing(true);
                    databaseService.getWavePaymentsFromRTDB().then(payments => {
                        setWavePayments(payments);
                        setIsSyncing(false);
                    });
                }}
                disabled={isSyncing}
                className={`p-2 rounded-full hover:bg-gray-100 text-blue-600 transition-all ${isSyncing ? 'animate-spin' : ''}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            {wavePayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <WaveIcon />
                    <p className="mt-4 font-bold uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucun paiement enregistré'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {wavePayments.map((payment, idx) => {
                        const inferredPhone = payment.userKey?.split('_').pop() || '';
                        return (
                            <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm relative">
                                <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                                    <AdminChatButton 
                                        user={{
                                            id: payment.userId,
                                            userId: payment.userId,
                                            name: payment.userName,
                                            phone: payment.phone || inferredPhone,
                                            city: payment.city
                                        }} 
                                        onOpenChat={onOpenChat} 
                                    />
                                    <button 
                                        onClick={() => { setItemToDelete(payment); setDeleteId(payment.id); }} 
                                        className="p-3 bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-md active:scale-90"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-2 pr-12">
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm">{payment.userName || 'Utilisateur'}</h4>
                                        <p className="text-xs text-gray-500 font-bold">{payment.city || 'Ville inconnue'}</p>
                                    </div>
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-blue-100 text-blue-600">
                                        {payment.amount} FCFA
                                    </span>
                                </div>
                                <div className="space-y-1 mt-3">
                                    <p className="text-[10px] text-gray-400 font-black uppercase">Service: <span className="text-gray-700">{payment.serviceType || payment.title || 'Inconnu'}</span></p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase">Téléphone: <span className="text-gray-700">+225 {payment.phone || inferredPhone || payment.userId}</span></p>
                                    <p className="text-[10px] text-gray-400 font-black uppercase">ID Transaction: <span className="text-gray-700 font-mono">{payment.transactionId || 'N/A'}</span></p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                                        {payment.timestamp ? new Date(payment.timestamp).toLocaleString() : 'Date inconnue'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );

  const renderAssistantRequestsView = () => (
    <div className="flex-1 flex flex-col h-full bg-white font-sans animate-unfold-in text-left">
        <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
            <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                <BackIcon />
            </button>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">Demandes Assistant (RTDB)</h2>
            <button 
                onClick={() => {
                    setIsSyncing(true);
                    databaseService.getAssistantRequestsFromRTDB().then(requests => {
                        setAssistantRequests(requests);
                        setIsSyncing(false);
                    });
                }}
                disabled={isSyncing}
                className={`p-2 rounded-full hover:bg-gray-100 text-blue-600 transition-all ${isSyncing ? 'animate-spin' : ''}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            {assistantRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <AssistantIcon />
                    <p className="mt-4 font-bold uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucune demande enregistrée'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assistantRequests.map((req, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 shadow-sm relative">
                                <div className="absolute top-3 right-3 flex items-center gap-2 z-30">
                                    <AdminChatButton 
                                        user={{
                                            id: req.userId,
                                            userId: req.userId,
                                            name: req.userName,
                                            phone: req.phone,
                                            city: req.city
                                        }} 
                                        onOpenChat={onOpenChat} 
                                    />
                                    <button 
                                        onClick={() => { setItemToDelete(req); setDeleteId(req.id); }} 
                                        className="p-3 bg-white rounded-full text-gray-400 hover:text-red-500 transition-all shadow-md active:scale-90"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                                <div className="flex justify-between items-start mb-2 pr-12">
                                <div>
                                    <h4 className="font-black text-gray-900 uppercase text-sm">{req.userName || 'Utilisateur'}</h4>
                                    <p className="text-xs text-gray-500 font-bold">{req.city || 'Ville inconnue'}</p>
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-indigo-100 text-indigo-600">
                                    Assistant
                                </span>
                            </div>
                            <div className="mt-3 p-3 bg-white rounded-xl border border-gray-100 italic text-xs text-gray-600">
                                "{req.request || req.requestText || req.message || 'Pas de message'}"
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <a href={`tel:${req.phone || req.userId}`} className="text-blue-600 font-mono text-[10px] font-bold">+225 {req.phone || req.userId}</a>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">
                                        {req.timestamp ? new Date(req.timestamp).toLocaleString() : 'Date inconnue'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  const renderScannedQRView = () => (
    <div className="flex-1 bg-gray-50 flex flex-col h-full text-left relative overflow-hidden">
        <header className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shadow-sm sticky top-0 z-20">
            <div className="flex items-center gap-4">
                <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                    <BackIcon />
                </button>
                <div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Codes QR Scannés</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Historique des scans utilisateurs</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <button 
                    onClick={refreshScannedContacts}
                    disabled={isSyncing}
                    className={`p-2 rounded-xl transition-all active:scale-90 ${isSyncing ? 'bg-gray-100 text-gray-300 animate-spin' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                    title="Rafraîchir"
                >
                    <SyncIcon />
                </button>
                {isSyncing && (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-500 border-t-transparent" />
                )}
            </div>
        </header>

        <main className="p-6 overflow-y-auto flex-1 scrollbar-hide">
            {scannedContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                    <div className="bg-emerald-50 p-6 rounded-full mb-4">
                        <QRIcon />
                    </div>
                    <p className="font-black text-xs uppercase tracking-widest text-gray-400">Aucun scan enregistré</p>
                </div>
            ) : (
                <div className="space-y-4 pb-12">
                    {scannedContacts.map((contact, idx) => (
                        <div key={contact.id || idx} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 duration-300" style={{ animationDelay: `${idx * 0.05}s` }}>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-emerald-50 p-3 rounded-2xl">
                                        <QRIcon />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-gray-900 uppercase text-sm leading-none mb-1">{contact.name}</h4>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{contact.title || 'Contact Scanné'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <AdminChatButton 
                                        user={{
                                            name: contact.name,
                                            phone: contact.phone
                                        }}
                                        onOpenChat={onOpenChat}
                                    />
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mb-1">Scanné le</p>
                                        <p className="text-[10px] font-bold text-gray-500">
                                            {contact.scannedAt?.toDate ? contact.scannedAt.toDate().toLocaleString() : 
                                             (contact.scannedAt && contact.scannedAt.seconds ? new Date(contact.scannedAt.seconds * 1000).toLocaleString() : 
                                             new Date(contact.scannedAt).toLocaleString())}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Téléphone</p>
                                    <p className="text-xs font-mono font-bold text-gray-700">+225 {contact.phone}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Ville</p>
                                    <p className="text-xs font-bold text-gray-700">{contact.city || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">Scanné par</p>
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-black text-gray-900 uppercase">{contact.scannerName || 'Utilisateur inconnu'}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-[10px] font-mono font-bold text-indigo-500 tracking-tighter">{contact.scannerUserId}</p>
                                        <button 
                                            onClick={() => setSelectedQR(contact)}
                                            className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-all active:scale-90"
                                            title="Voir le Code"
                                        >
                                            <ViewIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>

        {/* Modal QR Code */}
        {selectedQR && (
            <div className="absolute inset-0 bg-black/90 z-[60] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-300">
                <div className="bg-white rounded-[3rem] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
                    <button 
                        onClick={() => setSelectedQR(null)}
                        className="absolute -top-4 -right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-xl active:scale-90 transition-all z-10"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>

                    <div className="flex flex-col items-center">
                        <div className="bg-emerald-50 p-4 rounded-3xl mb-6">
                            <QRIcon />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight text-center mb-1">{selectedQR.name}</h3>
                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-8">{selectedQR.title || 'Contact Scanné'}</p>
                        
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border-4 border-emerald-500/20 shadow-inner mb-8">
                            <QRCodeSVG 
                                value={`Métier: ${selectedQR.title || 'Non spécifié'}\nNom: ${selectedQR.name}\nVille: ${selectedQR.city || 'N/A'}\nNuméro: ${selectedQR.phone}`} 
                                size={200} 
                                level="H" 
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-center">Données du Code</p>
                                <p className="text-[11px] font-mono font-bold text-gray-600 text-center break-all">
                                    {`Métier: ${selectedQR.title || 'Non spécifié'}\nNom: ${selectedQR.name}\nVille: ${selectedQR.city || 'N/A'}\nNuméro: ${selectedQR.phone}`}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );

  const renderRegistrationsByTypeView = (title: string, registrations: PrivateRegistration[]) => (
    <div className="flex-1 flex flex-col h-full bg-white font-sans animate-unfold-in text-left">
        <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
            <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                <BackIcon />
            </button>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">{title}</h2>
            <div className="w-10"></div>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            {registrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <ActivationIcon />
                    <p className="mt-4 font-bold uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucune demande'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {registrations.map((reg) => (
                        <div key={reg.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-black text-gray-900 uppercase text-sm leading-tight">{reg.title}</h4>
                                    <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1">{reg.category}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <AdminChatButton 
                                        user={{
                                            id: reg.userId,
                                            userId: reg.userId,
                                            name: reg.title,
                                            phone: reg.phone,
                                            city: reg.data?.ville || 'Inconnue'
                                        }} 
                                        onOpenChat={onOpenChat} 
                                    />
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                        reg.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {reg.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-xs font-black text-gray-900 uppercase">{reg.title}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{reg.data?.ville || 'Ville inconnue'} • +225 {reg.phone}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(reg.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setSelectedRegistration(reg)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors active:scale-90"
                                        title="Voir détails"
                                    >
                                        <ViewIcon className="h-5 w-5" />
                                    </button>
                                    <button 
                                        onClick={() => { setDeleteId(reg.id); setItemToDelete(reg); }}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors active:scale-90"
                                        title="Supprimer"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  const renderPrivateRegistrationsView = () => (
    <div className="flex-1 flex flex-col h-full bg-white font-sans animate-unfold-in text-left">
        <header className="p-4 flex items-center justify-between border-b border-gray-100 bg-white sticky top-0 z-20">
            <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-400 transition-transform active:scale-90">
                <BackIcon />
            </button>
            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest flex-1 text-center">Inscriptions Privées</h2>
            <div className="w-10"></div>
        </header>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            {privateRegistrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <ActivationIcon />
                    <p className="mt-4 font-bold uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucune inscription privée'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {privateRegistrations.map((reg) => (
                        <div key={reg.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h4 className="font-black text-gray-900 uppercase text-sm leading-tight">{reg.title}</h4>
                                    <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1">{reg.category}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <AdminChatButton 
                                        user={{
                                            id: reg.userId,
                                            userId: reg.userId,
                                            name: reg.title,
                                            phone: reg.phone,
                                            city: reg.data?.ville || 'Inconnue'
                                        }} 
                                        onOpenChat={onOpenChat} 
                                    />
                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                        reg.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {reg.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-xs font-black text-gray-900 uppercase">{reg.title}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">{reg.data?.ville || 'Ville inconnue'} • +225 {reg.phone}</p>
                                    <p className="text-[10px] font-black mt-1">
                                        <span className="text-gray-400 uppercase">Profil: </span>
                                        <span className="text-blue-600 uppercase">
                                            {reg.typeInscription === 'Propriétaire' ? 'Propriétaire (si propriétaire d’équipement)' : 
                                             reg.typeInscription === 'Travailleur' ? 'Travailleur' : reg.typeInscription}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mt-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">{new Date(reg.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setSelectedRegistration(reg)}
                                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors active:scale-90"
                                        title="Voir détails"
                                    >
                                        <ViewIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Modal Détails Inscription */}
        {selectedRegistration && (
            <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[80vh] overflow-y-auto scrollbar-hide">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Détails de l'Inscription</h3>
                        <span className="text-[10px] font-black px-3 py-1 bg-orange-100 text-orange-600 rounded-full uppercase">
                            {selectedRegistration.category}
                        </span>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                            <span className="text-[10px] font-black text-blue-600 uppercase block mb-4 border-b border-blue-100 pb-1">Contenu de l'inscription</span>
                            <div className="space-y-4">
                                {Object.entries(selectedRegistration.data || {}).map(([key, value]) => {
                                    // Skip internal fields if any, but here we show "contenu réel"
                                    if (key === 'ville' || key === 'phone' || key === 'name') return null;
                                    return (
                                        <div key={key} className="flex flex-col">
                                            <span className="text-[9px] font-black text-gray-400 uppercase mb-1">{key}</span>
                                            <p className="text-sm text-gray-800 font-bold leading-relaxed">
                                                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 px-2">
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Type de Profil</span>
                                <p className="font-bold text-gray-800 text-xs uppercase">
                                    {selectedRegistration.typeInscription === 'Propriétaire' ? 'Propriétaire' : 'Travailleur'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-gray-400 uppercase block mb-1">Date</span>
                                <p className="font-bold text-gray-800 text-xs uppercase">{new Date(selectedRegistration.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setSelectedRegistration(null)} 
                        className="w-full mt-8 py-4 bg-gray-900 text-white font-black rounded-2xl uppercase text-xs tracking-widest hover:bg-black transition-colors active:scale-95"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        )}
    </div>
  );

  const renderContent = () => {
    if (view === 'contacts') return renderContactStorageView();
    if (view === 'associations') return renderAssociationView();
    if (view === 'active-contacts') return renderActiveContactsView();
    if (view === 'user-messages') return renderUserMessagesView();
    if (view === 'firestore-users') return renderFirestoreUsersView();
    if (view === 'wave-payments') return renderWavePaymentsView();
    if (view === 'assistant-requests') return renderAssistantRequestsView();
    if (view === 'scanned-qr') return renderScannedQRView();
    if (view === 'registrations-travailleurs') return renderRegistrationsByTypeView('Demandes Travailleurs', travailleurRegistrations);
    if (view === 'registrations-proprietaires') return renderRegistrationsByTypeView('Demandes Équipements', proprietaireRegistrations);
    if (view === 'registrations-agences') return renderRegistrationsByTypeView('Demandes Agences', agenceRegistrations);
    if (view === 'registrations-entreprises') return renderRegistrationsByTypeView('Demandes Entreprises', entrepriseRegistrations);
    if (view === 'private-registrations') return renderPrivateRegistrationsView();
    
    return (
      <div className="flex-1 bg-slate-900 flex flex-col h-full text-left relative overflow-hidden">
          <MenuBackground />
          
          <div className="relative z-10 flex flex-col h-full">
              <header className="pt-5">
                  <div className="flex justify-between items-center px-4 h-20">
                      <div className="flex items-center gap-3">
                          {view === 'grid' ? (
                              onLogout && (
                                  <button onClick={onLogout} className="p-2 -ml-2 rounded-full hover:bg-red-500/10 text-red-500 transition-colors active:scale-90" title="Déconnexion">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                      </svg>
                                  </button>
                              )
                          ) : (
                              <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors active:scale-90">
                                  <BackIcon />
                              </button>
                          )}
                          <div className="flex items-center gap-2">
                               <img src="https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png" alt="Logo" className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                               <h2 className="text-xl font-black text-white uppercase tracking-tighter">Administration</h2>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-md my-4 p-6 border-y border-white/10 overflow-hidden">
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
                          <p className="font-black text-xs mt-3 text-center uppercase tracking-[0.3em] text-white opacity-80">Panneau de gestion</p>
                      </div>
                  </div>
              </header>

              <main className="p-6 overflow-y-auto flex-1 scrollbar-hide">
                  <div className="grid grid-cols-2 gap-6 pb-12">
                      <button onClick={() => setView('contacts')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                          <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-colors shadow-inner">
                              <StorageIcon />
                          </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Stockage des contacts</span>
                      </button>

                      <button onClick={() => setView('active-contacts')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-green-500/20 p-4 rounded-full group-hover:bg-green-500/30 transition-colors shadow-inner">
                              <ActivationIcon />
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Activation des contacts</span>
                      </button>

                      <button onClick={() => setView('associations')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-purple-500/20 p-4 rounded-full group-hover:bg-purple-500/30 transition-colors shadow-inner">
                              <AssociationIcon />
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Association de contacts</span>
                      </button>

                      <button onClick={() => setView('user-messages')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-orange-500/20 p-4 rounded-full group-hover:bg-orange-500/30 transition-colors shadow-inner">
                              <ChatIcon />
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Messages Utilisateurs</span>
                      </button>

                      <button onClick={() => setView('firestore-users')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-colors shadow-inner">
                              <CloudIcon />
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Utilisateurs Cloud</span>
                      </button>

                      <button onClick={() => setView('wave-payments')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-colors shadow-inner">
                              <WaveIcon />
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Paiements Wave</span>
                      </button>

                      <button onClick={() => setView('assistant-requests')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-indigo-500/20 p-4 rounded-full group-hover:bg-indigo-500/30 transition-colors shadow-inner">
                              <AssistantIcon />
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Demandes Assistant</span>
                      </button>

                      <button onClick={() => setView('scanned-qr')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-pink-500/20 p-4 rounded-full group-hover:bg-pink-500/30 transition-colors shadow-inner">
                              <QRIcon />
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">QR Codes Scannés</span>
                      </button>

                      <button onClick={() => setView('registrations-travailleurs')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-orange-500/20 p-4 rounded-full group-hover:bg-orange-500/30 transition-colors shadow-inner text-orange-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.67.38m-4.5-8.319v2.25m0-2.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v2.25m0 2.25v2.25m0-2.25a2.185 2.185 0 01-1.383-.618m0 2.25c.194.165.42.295.67.38m0-2.25c.67.38.194.67.67.38" /></svg>
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Demandes Travailleurs</span>
                      </button>

                      <button onClick={() => setView('registrations-proprietaires')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-emerald-500/20 p-4 rounded-full group-hover:bg-emerald-500/30 transition-colors shadow-inner text-emerald-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.528-1.036.94-2.197 1.088-3.386l-.738-2.652L3 14l2.652.738c1.19.147 2.35.56 3.386 1.088l3.03-2.496z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21.75l-4.135-4.134a1.21 1.21 0 010-1.707l4.134-4.135a1.21 1.21 0 011.707 0l4.135 4.135a1.21 1.21 0 010 1.707l-4.134 4.135a1.21 1.21 0 01-1.707 0z" /></svg>
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Demandes Équipements</span>
                      </button>

                      <button onClick={() => setView('registrations-agences')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-colors shadow-inner text-blue-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Demandes Agences</span>
                      </button>

                      <button onClick={() => setView('registrations-entreprises')} className="bg-slate-800/80 backdrop-blur-sm p-6 rounded-[2.5rem] shadow-2xl border border-slate-700 flex flex-col items-center gap-4 hover:bg-slate-700 transition-all transform hover:scale-105 group active:scale-95">
                           <div className="bg-purple-500/20 p-4 rounded-full group-hover:bg-purple-500/30 transition-colors shadow-inner text-purple-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" /></svg>
                           </div>
                          <span className="text-white text-[11px] font-black uppercase tracking-widest text-center leading-tight">Demandes Entreprises</span>
                      </button>
                  </div>
              </main>
          </div>
      </div>
    );
  };

  return (
      <div className="absolute inset-0 bg-gray-50 flex flex-col overflow-hidden">
          {renderContent()}

          {/* Modal de confirmation de suppression */}
          {deleteId && (
              <div className="absolute inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                  <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <TrashIcon />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 text-center mb-2 uppercase tracking-tight">Confirmation</h3>
                      <p className="text-sm text-gray-500 text-center mb-8 font-bold">Êtes-vous sûr de vouloir supprimer {itemToDelete?.name || itemToDelete?.client?.name || "cet élément"} ? Cette action est irréversible.</p>
                      <div className="flex gap-4">
                           <button onClick={() => { setDeleteId(null); setItemToDelete(null); }} className="flex-1 py-4 px-4 bg-gray-100 text-gray-600 font-black rounded-2xl transition-all active:scale-95 uppercase text-xs tracking-widest">Annuler</button>
                           <button onClick={() => { 
                               if (view === 'contacts') handleDeleteAdminContact(deleteId!);
                               else handleDelete(deleteId!);
                               setDeleteId(null); 
                           }} className="flex-1 py-4 px-4 bg-red-600 text-white font-black rounded-2xl shadow-xl shadow-red-200 transition-all active:scale-95 uppercase text-xs tracking-widest">Supprimer</button>
                      </div>
                  </div>
              </div>
          )}
      </div>
  );
};

export default AdminDashboardScreen;