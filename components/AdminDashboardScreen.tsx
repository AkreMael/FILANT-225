import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ref as rtdbRef, onValue } from 'firebase/database';
import { rtdb } from '../firebase';
import { databaseService, ConnectionLog, Association, ActiveContact, AdminContact } from '../services/databaseService';
import { User, PrivateRegistration } from '../types';
import { ADMIN_PHONE } from '../utils/authUtils';
import Typewriter from './common/Typewriter';
import MenuBackground from './common/MenuBackground';
import { QRCodeCanvas } from 'qrcode.react';

const IconWrapper: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`flex items-center justify-center rounded-full ${className}`}>
        {children}
    </div>
);

const BackIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
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
const VerifiedIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const BlockedIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>;
const BellIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);
const ExportIcon = ({ className }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>;
const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);
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
const CreditCardIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-8 w-8 text-blue-600"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
);
const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
);
const ShareIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
);
const EditIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

const sidebarButtons = [
  { id: 'contacts', label: 'Stockage' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'active-contacts', label: 'Activations' },
  { id: 'associations', label: 'Associations' },
  { id: 'card-tracking', label: 'Suivi des cartes' },
  { id: 'user-messages', label: 'Messages' },
  { id: 'private-registrations', label: 'Inscriptions' },
  { id: 'job-postings', label: 'Emplois' },
  { id: 'firestore-users', label: 'Cloud' },
  { id: 'wave-payments', label: 'Paiements' },
  { id: 'assistant-requests', label: 'Assistant' },
  { id: 'scanned-qr', label: 'QR Codes' },
];

const AdminChatButton = React.memo<{ 
    user: Partial<User>; 
    onOpenChat?: (user: User) => void;
    className?: string;
}>(({ user, onOpenChat, className }) => {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
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
});

AdminChatButton.displayName = 'AdminChatButton';

interface AdminDashboardScreenProps {
  onBack: () => void;
  onLogout?: () => void;
  onSelectUser?: (log: ConnectionLog) => void;
  onOpenChat?: (user: User) => void;
  initialView?: 'grid' | 'contacts' | 'associations' | 'active-contacts' | 'user-messages' | 'firestore-users' | 'wave-payments' | 'assistant-requests' | 'scanned-qr' | 'private-registrations' | 'notifications' | 'job-postings';
}

const UserListItem = React.memo<{ user: User; onOpenChat?: (user: User) => void }>(({ user, onOpenChat }) => {
    const [isVerified, setIsVerified] = useState(user.isVerified || false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleToggleVerify = async () => {
        setIsVerifying(true);
        try {
            const newStatus = !isVerified;
            await databaseService.verifyWorker(user.id || user.userId || '', 'users', newStatus);
            setIsVerified(newStatus);
        } catch (error) {
            console.error("Error toggling verification:", error);
            console.error("Erreur lors de la modification du statut de vérification.");
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
});

UserListItem.displayName = 'UserListItem';

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBack, onLogout, onSelectUser, onOpenChat, initialView = 'grid' }) => {
  const [view, setView] = useState<'grid' | 'contacts' | 'associations' | 'active-contacts' | 'user-messages' | 'firestore-users' | 'wave-payments' | 'assistant-requests' | 'scanned-qr' | 'private-registrations' | 'notifications' | 'card-tracking'>(initialView);
  const [firestoreUsers, setFirestoreUsers] = useState<User[]>([]);
  const [privateRegistrations, setPrivateRegistrations] = useState<PrivateRegistration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<PrivateRegistration | null>(null);
  const [wavePayments, setWavePayments] = useState<any[]>([]);
  const [assistantRequests, setAssistantRequests] = useState<any[]>([]);
  const [scannedContacts, setScannedContacts] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedQR, setSelectedQR] = useState<any | null>(null);

  const downloadQRCode = () => {
    const canvas = document.getElementById('admin-qr-canvas') as HTMLCanvasElement;
    if (canvas && selectedQR) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `QR_Code_${selectedQR.name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  const [isSyncing, setIsSyncing] = useState(false);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [activeContacts, setActiveContacts] = useState<ActiveContact[]>([]);
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notificationTargetUser, setNotificationTargetUser] = useState<User | null>(null);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const sidebarButtonsMemo = useMemo(() => sidebarButtons, []);

  const handleResetDatabase = async () => {
    if (window.confirm("⚠️ ATTENTION : Cette action va supprimer TOUS les utilisateurs (sauf vous) et réinitialiser toutes les données de la base. Cette opération est irréversible. Voulez-vous continuer ?")) {
      setIsResetting(true);
      try {
        await databaseService.resetDatabase(ADMIN_PHONE);
        console.log("✅ Base de données réinitialisée avec succès !");
        // Re-fetch users to update UI
        const users = await databaseService.getUsersFromFirestore();
        setFirestoreUsers(users);
      } catch (error) {
        console.error("❌ Erreur lors de la réinitialisation : " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsResetting(false);
      }
    }
  };

  const handleSetView = useCallback((newView: any) => {
    setView(newView);
  }, []);

  const handleOpenChat = useCallback((user: User) => {
    if (onOpenChat) onOpenChat(user);
  }, [onOpenChat]);

  const handleBack = useCallback(() => {
    if (view !== 'grid') {
      setView('grid');
    } else {
      onBack();
    }
  }, [view, onBack]);

  const handleLogout = useCallback(() => {
    if (onLogout) onLogout();
  }, [onLogout]);

  const [viewedRegistrations, setViewedRegistrations] = useState<string[]>(() => {
    const saved = localStorage.getItem('viewedRegistrations');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewedPayments, setViewedPayments] = useState<string[]>(() => {
    const saved = localStorage.getItem('viewedPayments');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewedAssistantRequests, setViewedAssistantRequests] = useState<string[]>(() => {
    const saved = localStorage.getItem('viewedAssistantRequests');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewedScannedContacts, setViewedScannedContacts] = useState<string[]>(() => {
    const saved = localStorage.getItem('viewedScannedContacts');
    return saved ? JSON.parse(saved) : [];
  });

  const [viewedJobPostings, setViewedJobPostings] = useState<string[]>(() => {
    const saved = localStorage.getItem('viewedJobPostings');
    return saved ? JSON.parse(saved) : [];
  });

  const markJobPostingAsViewed = (id: string) => {
    if (!viewedJobPostings.includes(id)) {
      const newList = [...viewedJobPostings, id];
      setViewedJobPostings(newList);
      localStorage.setItem('viewedJobPostings', JSON.stringify(newList));
    }
  };

  const isJobPostingViewed = (id: string) => viewedJobPostings.includes(id);

  const markAsViewed = (id: string) => {
    if (!viewedRegistrations.includes(id)) {
      const newList = [...viewedRegistrations, id];
      setViewedRegistrations(newList);
      localStorage.setItem('viewedRegistrations', JSON.stringify(newList));
    }
  };

  const markPaymentAsViewed = (id: string) => {
    if (!viewedPayments.includes(id)) {
      const newList = [...viewedPayments, id];
      setViewedPayments(newList);
      localStorage.setItem('viewedPayments', JSON.stringify(newList));
    }
  };

  const markAssistantRequestAsViewed = (id: string) => {
    if (!viewedAssistantRequests.includes(id)) {
      const newList = [...viewedAssistantRequests, id];
      setViewedAssistantRequests(newList);
      localStorage.setItem('viewedAssistantRequests', JSON.stringify(newList));
    }
  };

  const markScannedContactAsViewed = (id: string) => {
    if (!viewedScannedContacts.includes(id)) {
      const newList = [...viewedScannedContacts, id];
      setViewedScannedContacts(newList);
      localStorage.setItem('viewedScannedContacts', JSON.stringify(newList));
    }
  };

  const isViewed = (id: string) => viewedRegistrations.includes(id);
  const isPaymentViewed = (id: string) => viewedPayments.includes(id);
  const isAssistantRequestViewed = (id: string) => viewedAssistantRequests.includes(id);
  const isScannedContactViewed = (id: string) => viewedScannedContacts.includes(id);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
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

  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [jobPostings, setJobPostings] = useState<any[]>([]);

  useEffect(() => {
    // 1. Messages (RTDB)
    const unsubMessages = databaseService.onAllConversationsUpdate((convs) => {
      const totalUnread = convs.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      setUnreadCounts(prev => ({ ...prev, 'user-messages': totalUnread }));
    });

    // 2. Wave Payments (RTDB)
    const paymentsRef = rtdbRef(rtdb, 'wave_payments');
    const unsubPayments = onValue(paymentsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let pendingCount = 0;
        Object.values(data).forEach((userPayments: any) => {
          Object.values(userPayments).forEach((p: any) => {
            if (p.status === 'pending') pendingCount++;
          });
        });
        setUnreadCounts(prev => ({ ...prev, 'wave-payments': pendingCount }));
      } else {
        setUnreadCounts(prev => ({ ...prev, 'wave-payments': 0 }));
      }
    });

    // 3. Assistant Requests (RTDB)
    const assistantRef = rtdbRef(rtdb, 'assistant_requests');
    const unsubAssistant = onValue(assistantRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        let totalCount = 0;
        Object.values(data).forEach((userReqs: any) => {
          totalCount += Object.keys(userReqs).length;
        });
        setUnreadCounts(prev => ({ ...prev, 'assistant-requests': totalCount }));
      } else {
        setUnreadCounts(prev => ({ ...prev, 'assistant-requests': 0 }));
      }
    });

    // 4. Job Postings (Firestore)
    const unsubJobPostings = databaseService.onJobPostingsUpdate((postings) => {
      setJobPostings(postings);
    });

    // 5. Private Registrations (Firestore)
    const unsubPrivate = databaseService.subscribeToPrivateRegistrations((registrations) => {
      setPrivateRegistrations(registrations);
    });

    // 6. Scanned QR Contacts (Firestore)
    let unsubQR: any;
    databaseService.onScannedContactsChange((contacts) => {
      setScannedContacts(contacts);
    }).then(unsub => {
      unsubQR = unsub;
    });

    // 7. Users (Firestore)
    const unsubUsers = databaseService.onUsersUpdate((users) => {
      setFirestoreUsers(users);
    });

    return () => {
      unsubMessages();
      unsubPayments();
      unsubAssistant();
      unsubJobPostings();
      unsubPrivate();
      if (unsubQR) unsubQR();
      unsubUsers();
    };
  }, []);

  const getUnreadCount = (id: string) => {
    if (id === 'private-registrations') {
      return privateRegistrations.filter(r => r.status === 'pending' && !isViewed(r.id)).length;
    }
    if (id === 'wave-payments') {
      return wavePayments.filter(p => p.status === 'pending' && !isPaymentViewed(p.id)).length;
    }
    if (id === 'assistant-requests') {
      return assistantRequests.filter(r => !isAssistantRequestViewed(r.id)).length;
    }
    if (id === 'scanned-qr') {
      return scannedContacts.filter(c => !isScannedContactViewed(c.id)).length;
    }
    if (id === 'job-postings') {
      return jobPostings.filter(p => !isJobPostingViewed(p.id)).length;
    }
    return unreadCounts[id] || 0;
  };

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

  const [cardFilter, setCardFilter] = useState<'all' | 'active' | 'expired'>('all');

  const renderActiveView = () => {
    if (view === 'contacts') return renderContactStorageView();
    if (view === 'associations') return renderAssociationView();
    if (view === 'card-tracking') return renderCardTrackingView();
    if (view === 'active-contacts') return renderActiveContactsView();
    if (view === 'user-messages') return renderUserMessagesView();
    if (view === 'firestore-users') return renderFirestoreUsersView();
    if (view === 'wave-payments') return renderWavePaymentsView();
    if (view === 'assistant-requests') return renderAssistantRequestsView();
    if (view === 'scanned-qr') return renderScannedQRView();
    if (view === 'job-postings') return renderJobPostingsView();
    if (view === 'private-registrations') return renderPrivateRegistrationsView();
    if (view === 'notifications') return renderNotificationsView();
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-white/30 p-6">
        <img src="https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/343956e5-aaed-4531-85f6-a07422df385b.png" alt="Logo" className="w-20 h-20 lg:w-32 lg:h-32 object-contain opacity-20 mb-4 lg:mb-6" referrerPolicy="no-referrer" />
        <h3 className="text-sm lg:text-xl font-black uppercase tracking-widest text-center">Sélectionnez une catégorie</h3>
      </div>
    );
  };

  const activeViewContent = useMemo(() => renderActiveView(), [
      view, firestoreUsers, privateRegistrations, wavePayments, assistantRequests, 
      scannedContacts, conversations, associations, activeContacts, adminContacts, jobPostings, viewedJobPostings,
      searchTerm, isSyncing, isFormOpen, selectedRegistration, selectedQR, deleteId, itemToDelete, editingContact, selectedContacts, shareMode, viewingContact
  ]);

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
      // Use a small delay to allow the UI to update immediately when switching views
      const timer = setTimeout(() => {
          if (view === 'contacts' && adminContacts.length === 0) {
              setAdminContacts(databaseService.getAdminContacts());
          }
          if (view === 'associations' && associations.length === 0) setAssociations(databaseService.getAssociations());
          if (view === 'wave-payments' && wavePayments.length === 0) {
              setIsSyncing(true);
              databaseService.getWavePaymentsFromRTDB().then(payments => {
                  setWavePayments(payments);
                  setIsSyncing(false);
              });
          }
          if (view === 'assistant-requests' && assistantRequests.length === 0) {
              setIsSyncing(true);
              databaseService.getAssistantRequestsFromRTDB().then(requests => {
                  setAssistantRequests(requests);
                  setIsSyncing(false);
              });
          }
          if (view === 'active-contacts' && activeContacts.length === 0) {
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
      }, 50);

      let unsubscribeMessages: any;
      if (view === 'user-messages') {
        unsubscribeMessages = databaseService.onAllConversationsUpdate((convs) => {
          setConversations(convs);
        });
      }

      return () => {
          clearTimeout(timer);
          if (unsubscribeMessages) unsubscribeMessages();
      };
  }, [view]);

  const handleAddAssociation = () => {
      if (!assocInputs.providerName || !assocInputs.providerPhone || !assocInputs.clientName || !assocInputs.clientPhone) {
          console.warn("Veuillez remplir les informations obligatoires.");
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
          console.warn("Veuillez remplir au moins le nom et le numéro.");
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

  const handleToggleVerify = async (user: User) => {
    if (!user.phone) return;
    const newStatus = !user.isVerified;
    try {
      await databaseService.updateUserInFirestore(user.phone, { isVerified: newStatus });
      setFirestoreUsers(prev => prev.map(u => u.phone === user.phone ? { ...u, isVerified: newStatus } : u));
    } catch (error) {
      console.error("Error toggling verification:", error);
    }
  };

  const handleToggleBlock = async (user: User) => {
    if (!user.phone) return;
    const newStatus = !user.isBlocked;
    try {
      await databaseService.updateUserInFirestore(user.phone, { isBlocked: newStatus, status: newStatus ? 'blocked' : 'active' });
      setFirestoreUsers(prev => prev.map(u => u.phone === user.phone ? { ...u, isBlocked: newStatus, status: newStatus ? 'blocked' : 'active' } : u));
    } catch (error) {
      console.error("Error toggling block:", error);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Nom', 'Téléphone', 'Ville', 'Rôle', 'Vérifié', 'Bloqué'];
    const rows = firestoreUsers.map(u => [
      u.name || 'N/A',
      u.phone || 'N/A',
      u.city || 'N/A',
      u.role || 'Client',
      u.isVerified ? 'Oui' : 'Non',
      u.isBlocked ? 'Oui' : 'Non'
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `contacts_filant225_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          } else if (view === 'job-postings' && itemToDelete) {
              await databaseService.deleteJobPosting(itemToDelete.id);
          } else if ((view === 'contacts' || view === 'firestore-users') && itemToDelete) {
              await databaseService.deleteUserFromFirestore(itemToDelete.phone);
              setFirestoreUsers(prev => prev.filter(u => u.phone !== itemToDelete.phone));
          }
          setDeleteId(null);
          setItemToDelete(null);
      } catch (error) {
          console.error("Erreur lors de la suppression:", error);
      }
  };

  const renderUserMessagesView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Messages Utilisateurs</h2>
        </header>

        <div className="px-8 mt-6">
            <div className="bg-black rounded-full p-2 flex items-center justify-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucun message'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {conversations
                      .filter(c => c.userName.toLowerCase().includes(searchTerm.toLowerCase()) || c.userId.includes(searchTerm))
                      .map((conv) => (
                        <div key={conv.userId} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{conv.userName}</h4>
                                    <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">Conversation</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative">
                                        <AdminChatButton 
                                            user={{
                                                id: conv.userId,
                                                userId: conv.userId,
                                                name: conv.userName,
                                                phone: conv.userId.match(/^\d+$/) ? conv.userId : '',
                                                role: 'Client',
                                                city: ''
                                            } as User}
                                            onOpenChat={handleOpenChat}
                                            className="h-8 w-8"
                                        />
                                        {conv.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-[#2d1b0d] flex items-center justify-center">
                                                <span className="text-[8px] font-black text-white">{conv.unreadCount}</span>
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setDeleteId(conv.userId);
                                            setItemToDelete({ ...conv, name: conv.userName });
                                        }}
                                        className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                    {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="text-[#ff802b] font-mono text-[9px] font-black tracking-widest uppercase">ID: {conv.userId.slice(-6)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  const renderActiveContactsView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Activation des contacts</h2>
        </header>

        <div className="px-4 mt-4">
            <div className="bg-black rounded-full p-1.5 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {activeContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucun contact actif'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {activeContacts.filter(c => 
                        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.title?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((contact, idx) => (
                        <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{contact.name}</h4>
                                    <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{contact.title || 'Contact Actif'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AdminChatButton 
                                        user={{
                                            name: contact.name,
                                            phone: contact.phone
                                        }}
                                        onOpenChat={handleOpenChat}
                                        className="h-8 w-8"
                                    />
                                    <button 
                                        onClick={() => { setItemToDelete(contact); setDeleteId(contact.id); }} 
                                        className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-0.5">Téléphone</p>
                                <p className="text-[11px] font-mono font-black text-white">+225 {contact.phone}</p>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                    Créé le {new Date(contact.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                                <button 
                                  onClick={() => toggleContactStatus(contact.id)}
                                  className={`px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                                      contact.status === 'active' 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-white/10 text-white/40'
                                  }`}
                                >
                                    {contact.status === 'active' ? 'Activé' : 'Désactivé'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  const renderAssociationView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white flex items-center justify-between sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Association de contacts</h2>
            <button 
                onClick={() => setIsFormOpen(true)}
                className="p-2 bg-[#00522b] text-white rounded-xl hover:bg-[#00522b]/80 transition-all active:scale-90 flex items-center gap-2"
                title="Ajouter une association"
            >
                <PlusIcon className="w-4 h-4" />
                <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Ajouter</span>
            </button>
        </header>

        <div className="px-8 mt-6">
            <div className="bg-black rounded-full p-2 flex items-center justify-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {associations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucune association'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {associations.filter(a => 
                        a.provider?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        a.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        a.provider?.job?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map((assoc, idx) => (
                        <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">Association #{idx + 1}</h4>
                                    <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">Prestataire & Client</p>
                                </div>
                                <button 
                                    onClick={() => { setItemToDelete(assoc); setDeleteId(assoc.id); }} 
                                    className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <p className="text-[7px] font-black text-[#ff802b] uppercase tracking-widest mb-0.5">Client</p>
                                    <p className="text-[11px] font-black text-white uppercase truncate">{assoc.client?.name}</p>
                                    <p className="text-[9px] text-white/40 font-mono mt-0.5">+225 {assoc.client?.phone}</p>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                    <p className="text-[7px] font-black text-[#ff802b] uppercase tracking-widest mb-0.5">Prestataire</p>
                                    <p className="text-[11px] font-black text-white uppercase truncate">{assoc.provider?.name}</p>
                                    <p className="text-[9px] text-white/40 font-mono mt-0.5">+225 {assoc.provider?.phone}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between">
                                <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                    {new Date(assoc.createdAt).toLocaleDateString('fr-FR')}
                                </span>
                                <button 
                                  onClick={() => toggleAssociationActivation(assoc.id)}
                                  className={`px-3 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                                      assoc.isActivated 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-white/10 text-white/40'
                                  }`}
                                >
                                    {assoc.isActivated ? 'Actif' : 'Off'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
  const renderCardTrackingView = () => {
    const filteredUsers = firestoreUsers.filter(u => {
        const cardData = (u as any).cardData_pro || (u as any).cardData_service;
        const isMiseEnRelationActive = !!(u as any).isMiseEnRelationActive;
        const expirationDate = (u as any).cardExpirationDate;
        const isExpired = expirationDate ? new Date(expirationDate).getTime() <= Date.now() : true;
        const isActive = isMiseEnRelationActive && !isExpired;

        const matchesSearch = 
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.city || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = 
            cardFilter === 'all' || 
            (cardFilter === 'active' && isActive) || 
            (cardFilter === 'expired' && (isExpired || !isMiseEnRelationActive));
            
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
            <header className="p-4 bg-white flex items-center justify-between sticky top-0 z-20 shadow-md">
                <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Suivi des Cartes</h2>
            </header>

            <div className="p-4 space-y-3 bg-black/5">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 text-xs font-bold focus:outline-none focus:border-white/40 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <SearchIcon />
                    </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'all', label: 'Tous' },
                        { id: 'active', label: 'Actifs' },
                        { id: 'expired', label: 'Expirés' }
                    ].map(f => (
                        <button
                            key={f.id}
                            onClick={() => setCardFilter(f.id as any)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                cardFilter === f.id ? 'bg-black text-white shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/50">
                        <p className="font-black uppercase text-xs tracking-widest">Aucun utilisateur trouvé</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredUsers.map((u, idx) => {
                            const expirationDate = (u as any).cardExpirationDate;
                            const isMiseEnRelationActive = !!(u as any).isMiseEnRelationActive;
                            const isExpired = expirationDate ? new Date(expirationDate).getTime() <= Date.now() : true;
                            const isActive = isMiseEnRelationActive && !isExpired;
                            const daysRemaining = expirationDate ? databaseService.getDaysRemaining(expirationDate) : 0;

                            return (
                                <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl border-2 border-black/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-black text-white uppercase text-sm tracking-tight">{u.name}</h4>
                                            <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{u.city}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                                        }`}>
                                            {isActive ? '🟢 Carte active' : '🔴 Carte inactive'}
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/10 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Téléphone</span>
                                            <span className="text-xs font-mono font-black text-white">+225 {u.phone}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">Statut</span>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                {isActive ? `Expire dans ${daysRemaining} jours` : 'Expirée'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                            {expirationDate ? `Expire le ${new Date(expirationDate).toLocaleDateString('fr-FR')}` : 'Pas de date'}
                                        </span>
                                        <AdminChatButton user={u} onOpenChat={onOpenChat} className="h-8 w-8" />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
  };

  const handleSendNotification = async () => {
    if (!notificationTargetUser || !notificationTitle || !notificationMessage) return;
    setIsSendingNotification(true);
    try {
      await databaseService.sendNotificationToFirestore(notificationTargetUser.phone, {
        title: notificationTitle,
        message: notificationMessage
      });
      setIsNotificationModalOpen(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setNotificationTargetUser(null);
      console.log("Notification envoyée avec succès !");
    } catch (error) {
      console.error("Error sending notification:", error);
      console.error("Erreur lors de l'envoi de la notification.");
    } finally {
      setIsSendingNotification(false);
    }
  };

  const renderNotificationsView = () => {
    const filteredUsers = firestoreUsers.filter(u => {
        const matchesSearch = 
            (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (u.city || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'all' || u.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
            <header className="p-4 bg-white flex items-center justify-between sticky top-0 z-20 shadow-md">
                <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Envoyer des Notifications</h2>
            </header>

            <div className="p-4 space-y-3 bg-black/5">
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Rechercher un utilisateur..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 text-xs font-bold focus:outline-none focus:border-white/40 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <SearchIcon />
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <select 
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border-none focus:ring-0"
                    >
                        <option value="all">Tous les rôles</option>
                        <option value="Client">Clients</option>
                        <option value="Agence">Agences</option>
                        <option value="Travailleur">Travailleurs</option>
                        <option value="Propriété">Équipements</option>
                    </select>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {isSyncing ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/50">
                        <div className="animate-spin mb-4">
                            <SyncIcon />
                        </div>
                        <p className="font-black uppercase text-[10px] tracking-widest">Chargement des utilisateurs...</p>
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/50">
                        <p className="font-black uppercase text-xs tracking-widest">Aucun utilisateur trouvé</p>
                    </div>
                ) : (
                    <div className="space-y-4 pb-20">
                        {filteredUsers.map((user, idx) => (
                            <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-black text-white uppercase text-xs tracking-tight">{user.name || 'Utilisateur'}</h4>
                                        <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{user.role || 'Client'}</p>
                                        <p className="text-[9px] text-white/40 font-mono">+225 {user.phone}</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setNotificationTargetUser(user);
                                            setIsNotificationModalOpen(true);
                                        }}
                                        className="px-4 py-2 bg-[#ff802b] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#e67326] transition-all active:scale-95 flex items-center gap-2"
                                    >
                                        <BellIcon className="w-3 h-3" />
                                        Notifier
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
  };

  const renderContactStorageView = () => {
    const filteredContacts = adminContacts.filter(c => {
        const matchesSearch = 
            (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.job || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.equipmentName || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesType = filterRole === 'all' || c.type.toLowerCase() === filterRole.toLowerCase();

        return matchesSearch && matchesType;
    });

    return (
        <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
            <header className="p-4 bg-white flex items-center justify-between sticky top-0 z-20 shadow-md">
                <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Stockage des contacts</h2>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setIsFormOpen(true)}
                        className="p-2 bg-[#00522b] text-white rounded-xl hover:bg-[#00522b]/80 transition-all active:scale-90 flex items-center gap-2"
                        title="Ajouter un contact"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Ajouter</span>
                    </button>
                    <button 
                        onClick={handleExportCSV}
                        className="p-2 bg-black text-white rounded-xl hover:bg-black/80 transition-all active:scale-90 flex items-center gap-2"
                        title="Exporter en CSV"
                    >
                        <ExportIcon className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest hidden sm:inline">Exporter</span>
                    </button>
                </div>
            </header>

            <div className="p-4 space-y-3 bg-black/5">
                {/* Search Bar */}
                <div className="relative">
                    <input 
                        type="text"
                        placeholder="Rechercher un nom, numéro, ville, métier..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/10 border-2 border-white/20 rounded-2xl py-3 pl-10 pr-4 text-white placeholder:text-white/40 text-xs font-bold focus:outline-none focus:border-white/40 transition-all"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <SearchIcon />
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <select 
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border-none focus:ring-0"
                    >
                        <option value="all">Tous les types</option>
                        <option value="CLIENT">Clients</option>
                        <option value="AGENCE">Agences</option>
                        <option value="TRAVAILLEUR">Travailleurs</option>
                        <option value="PROPRIÉTAIRE">Propriétaires</option>
                    </select>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {filteredContacts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-white/50">
                        <p className="font-black uppercase text-xs tracking-widest">Aucun contact trouvé</p>
                    </div>
                ) : (
                    <div className="space-y-4 pb-20">
                        {filteredContacts.map((contact, idx) => (
                            <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h4 className="font-black text-white uppercase text-xs tracking-tight">{contact.name}</h4>
                                        </div>
                                        <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">
                                            {contact.type} • {contact.city}
                                            {contact.job && ` • ${contact.job}`}
                                            {contact.equipmentName && ` • ${contact.equipmentName}`}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => { setEditingContact(contact); setAdminContactInputs(contact); setIsFormOpen(true); }}
                                            className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all active:scale-90"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => { setItemToDelete(contact); setDeleteId(contact.id); }} 
                                            className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-2 rounded-xl border border-white/10 mb-4">
                                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-0.5">Téléphone</p>
                                    <p className="text-[11px] font-mono font-black text-white">{contact.phone}</p>
                                </div>

                                {contact.description && (
                                    <p className="text-[10px] text-white/70 italic mb-4">"{contact.description}"</p>
                                )}

                                <button 
                                    onClick={() => handleSaveToNativeContacts(contact)}
                                    className="w-full py-2 bg-white/10 text-white rounded-xl text-[8px] font-black uppercase tracking-widest hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <DownloadIcon className="w-3 h-3" />
                                    Enregistrer dans le répertoire
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
  };

  const handleAddAdminContact = () => {
      if (!adminContactInputs.name || !adminContactInputs.phone) {
          console.warn("Veuillez remplir au moins le nom et le numéro.");
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
              console.log("Contact synchronisé avec succès !");
          } else {
              console.error("Erreur lors de la synchronisation.");
          }
      } catch (error) {
          console.error("Erreur réseau.");
      }
  };

  const toggleContactSelection = (id: string) => {
      setSelectedContacts(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleShare = (mode: 'client' | 'outil') => {
      setShareMode(mode);
  };

  const renderFirestoreUsersView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Utilisateurs Cloud</h2>
        </header>

        <div className="px-4 mt-4">
            <div className="bg-black rounded-full p-1.5 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {firestoreUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucun utilisateur'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {firestoreUsers.map((user, idx) => (
                        <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{user.name || 'Utilisateur'}</h4>
                                    <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{user.city || 'Ville inconnue'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AdminChatButton 
                                        user={user} 
                                        onOpenChat={handleOpenChat} 
                                        className="h-8 w-8"
                                    />
                                    <button 
                                        onClick={() => { setItemToDelete(user); setDeleteId(user.id); }} 
                                        className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                                <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-0.5">Téléphone</p>
                                <p className="text-[11px] font-mono font-black text-white">+225 {user.phone || user.userId}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );

  const renderWavePaymentsView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Paiements Wave</h2>
        </header>

        <div className="px-4 mt-4">
            <div className="bg-black rounded-full p-1.5 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {wavePayments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucun paiement'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {wavePayments.map((payment, idx) => {
                        const inferredPhone = payment.userKey?.split('_').pop() || '';
                        const viewed = isPaymentViewed(payment.id);
                        return (
                            <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                                {!viewed && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse z-10" />
                                )}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{payment.userName || 'Utilisateur'}</h4>
                                        <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{payment.city || 'Ville inconnue'}</p>
                                    </div>
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-white text-black">
                                        {payment.amount} FCFA
                                    </span>
                                </div>
                                <div className="space-y-1.5 mt-3 border-t border-white/10 pt-3">
                                    <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Service: <span className="text-white">{payment.serviceType || payment.title || 'Inconnu'}</span></p>
                                    <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Téléphone: <span className="text-white">+225 {payment.phone || inferredPhone || payment.userId}</span></p>
                                    <p className="text-[9px] text-white/60 font-black uppercase tracking-widest">Transaction: <span className="text-white font-mono">{payment.transactionId || 'N/A'}</span></p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                        {payment.timestamp ? new Date(payment.timestamp).toLocaleString() : 'Date inconnue'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <AdminChatButton 
                                            user={{
                                                id: payment.userId,
                                                userId: payment.userId,
                                                name: payment.userName,
                                                phone: payment.phone || inferredPhone,
                                                city: payment.city
                                            }} 
                                            onOpenChat={handleOpenChat} 
                                            className="h-8 w-8"
                                        />
                                        <button 
                                            onClick={() => markPaymentAsViewed(payment.id)}
                                            className={`p-1.5 rounded-lg transition-all active:scale-90 ${viewed ? 'bg-white/5 text-white/30' : 'bg-white/20 text-white'}`}
                                            title="Marquer comme lu"
                                        >
                                            <VerifiedIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => { setItemToDelete(payment); setDeleteId(payment.id); }} 
                                            className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
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
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Demandes Assistant</h2>
        </header>

        <div className="px-4 mt-4">
            <div className="bg-black rounded-full p-1.5 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {assistantRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucune demande'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assistantRequests.map((req, idx) => {
                        const viewed = isAssistantRequestViewed(req.id);
                        return (
                            <div key={idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                                {!viewed && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse z-10" />
                                )}
                                <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{req.userName || 'Utilisateur'}</h4>
                                    <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{req.city || 'Ville inconnue'}</p>
                                </div>
                                <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-white text-black">
                                    Assistant
                                </span>
                            </div>
                            <div className="mt-3 p-3 bg-white/5 rounded-xl border border-white/10 italic text-[11px] text-white/80 leading-relaxed">
                                "{req.request || req.requestText || req.message || 'Pas de message'}"
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="flex flex-col">
                                    <a href={`tel:${req.phone || req.userId}`} className="text-[#ff802b] font-mono text-[9px] font-black tracking-widest uppercase">+225 {req.phone || req.userId}</a>
                                    <span className="text-[8px] text-white/30 font-black uppercase tracking-widest mt-0.5">
                                        {req.timestamp ? new Date(req.timestamp).toLocaleString() : 'Date inconnue'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AdminChatButton 
                                        user={{
                                            id: req.userId,
                                            userId: req.userId,
                                            name: req.userName,
                                            phone: req.phone,
                                            city: req.city
                                        }} 
                                        onOpenChat={handleOpenChat} 
                                        className="h-8 w-8"
                                    />
                                    <button 
                                        onClick={() => markAssistantRequestAsViewed(req.id)}
                                        className={`p-1.5 rounded-lg transition-all active:scale-90 ${viewed ? 'bg-white/5 text-white/30' : 'bg-white/20 text-white'}`}
                                        title="Marquer comme lu"
                                    >
                                        <VerifiedIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => { setItemToDelete(req); setDeleteId(req.id); }} 
                                        className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            )}
        </div>
    </div>
  );

  const renderJobPostingsView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Demandes d'emploi</h2>
        </header>

        <div className="px-4 mt-4">
            <div className="bg-black rounded-full p-1.5 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {jobPostings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucune demande'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {jobPostings.map((post, idx) => {
                        const viewed = isJobPostingViewed(post.id);
                        return (
                            <div key={post.id || idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                                {!viewed && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse z-10" />
                                )}
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{post.name}</h4>
                                        <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{post.service || post.jobTitle || 'Métier inconnu'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={() => markJobPostingAsViewed(post.id)}
                                            className={`p-1.5 rounded-lg transition-all active:scale-90 ${viewed ? 'bg-white/5 text-white/30' : 'bg-white/20 text-white'}`}
                                            title="Marquer comme lu"
                                        >
                                            <VerifiedIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => { setItemToDelete(post); setDeleteId(post.id); }} 
                                            className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-all active:scale-90"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                                        <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-0.5">Ville</p>
                                        <p className="text-[11px] font-black text-white uppercase">{post.city || 'N/A'}</p>
                                    </div>
                                    <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                                        <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-0.5">Salaire</p>
                                        <p className="text-[11px] font-black text-white uppercase">{post.price} {post.frequency ? `/ ${post.frequency}` : ''}</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 p-3 rounded-xl border border-white/10 mb-3">
                                    <p className="text-[8px] font-black text-[#ff802b] uppercase tracking-widest mb-1.5">Description</p>
                                    <p className="text-[11px] text-white/80 leading-relaxed">{post.description}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                        {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 
                                         (post.createdAt && post.createdAt.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleString() : 
                                         new Date(post.createdAt).toLocaleString())}
                                    </span>
                                    {post.typeInscription && (
                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-white/10 text-white/60">
                                            {post.typeInscription}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );

  const renderScannedQRView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">QR Codes Scannés</h2>
        </header>

        <div className="px-4 mt-4">
            <div className="bg-black rounded-full p-1.5 flex items-center justify-center">
                <span className="text-[9px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
            {scannedContacts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucun scan'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {scannedContacts.map((contact, idx) => {
                        const viewed = isScannedContactViewed(contact.id);
                        return (
                            <div key={contact.id || idx} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                                {!viewed && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse z-10" />
                                )}
                                <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{contact.name}</h4>
                                    <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">{contact.title || 'Contact Scanné'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AdminChatButton 
                                        user={{
                                            name: contact.name,
                                            phone: contact.phone
                                        }}
                                        onOpenChat={handleOpenChat}
                                        className="h-8 w-8"
                                    />
                                    <button 
                                        onClick={() => markScannedContactAsViewed(contact.id)}
                                        className={`p-1.5 rounded-lg transition-all active:scale-90 ${viewed ? 'bg-white/5 text-white/30' : 'bg-white/20 text-white'}`}
                                        title="Marquer comme lu"
                                    >
                                        <VerifiedIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => setSelectedQR(contact)}
                                        className="p-1.5 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all active:scale-90"
                                    >
                                        <ViewIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-3">
                                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-0.5">Téléphone</p>
                                    <p className="text-[11px] font-mono font-black text-white">+225 {contact.phone}</p>
                                </div>
                                <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mb-0.5">Ville</p>
                                    <p className="text-[11px] font-black text-white uppercase">{contact.city || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                                <p className="text-[8px] font-black text-[#ff802b] uppercase tracking-widest mb-1.5">Scanné par</p>
                                <div className="flex justify-between items-center">
                                    <p className="text-[11px] font-black text-white uppercase">{contact.scannerName || 'Inconnu'}</p>
                                    <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">
                                        {contact.scannedAt?.toDate ? contact.scannedAt.toDate().toLocaleString() : 
                                         (contact.scannedAt && contact.scannedAt.seconds ? new Date(contact.scannedAt.seconds * 1000).toLocaleString() : 
                                         new Date(contact.scannedAt).toLocaleString())}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
                </div>
            )}
        </div>

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
                        
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] border-4 border-emerald-500/20 shadow-inner mb-8 flex flex-col items-center gap-6">
                            <QRCodeCanvas 
                                id="admin-qr-canvas"
                                value={`Métier: ${selectedQR.title || 'Non spécifié'}\nNom: ${selectedQR.name}\nVille: ${selectedQR.city || 'N/A'}\nNuméro: ${selectedQR.phone}`} 
                                size={200} 
                                level="H" 
                                includeMargin={true}
                                imageSettings={{
                                    src: "https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png",
                                    x: undefined,
                                    y: undefined,
                                    height: 40,
                                    width: 40,
                                    excavate: true,
                                }}
                            />
                            <button 
                                onClick={downloadQRCode}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                            >
                                <DownloadIcon className="w-4 h-4" />
                                Télécharger
                            </button>
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

  const renderPrivateRegistrationsView = () => (
    <div className="flex-1 flex flex-col h-full bg-[#ff802b] font-sans text-left overflow-hidden">
        <header className="p-4 bg-white text-center sticky top-0 z-20 shadow-md">
            <h2 className="text-sm font-black text-black uppercase tracking-[0.3em]">Nouvelle inscription</h2>
        </header>

        <div className="px-8 mt-6">
            <div className="bg-black rounded-full p-2 flex items-center justify-center">
                <span className="text-[10px] font-black text-white uppercase tracking-widest">recherche</span>
            </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {privateRegistrations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-white/50">
                    <p className="font-black uppercase text-xs tracking-widest">
                        {isSyncing ? 'Chargement...' : 'Aucune inscription'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {privateRegistrations.map((reg) => {
                        const viewed = isViewed(reg.id);
                        return (
                            <div key={reg.id} className="bg-[#2d1b0d] rounded-2xl p-4 shadow-xl relative overflow-hidden border-2 border-black/10">
                                {!viewed && (
                                    <div className="absolute top-2 right-2 w-3 h-3 bg-red-600 rounded-full border-2 border-white animate-pulse z-10" />
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-black text-white uppercase text-xs tracking-tight mb-0.5">{reg.title}</h4>
                                        <div className="flex flex-col gap-0.5">
                                            <p className="text-[10px] text-[#ff802b] font-black uppercase tracking-widest">
                                                {reg.data?.ville || 'VILLE'} • {reg.phone}
                                            </p>
                                            <p className="text-[9px] text-white/40 font-bold uppercase tracking-tighter">
                                                {reg.category || reg.typeInscription || 'Inscription'}
                                            </p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => {
                                          setSelectedRegistration(reg);
                                          markAsViewed(reg.id);
                                        }}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${
                                          viewed 
                                            ? 'bg-transparent text-white border-2 border-white/20' 
                                            : 'bg-white text-black'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    </div>
  );

  return (
      <div className="absolute inset-0 bg-gray-50 flex flex-col overflow-hidden">
          <div className="flex flex-col lg:flex-row h-screen w-screen overflow-hidden bg-[#00522b]">
            {/* Left Side: Grid of buttons - Hidden on mobile if a view is selected */}
            <div className={`${view !== 'grid' ? 'hidden lg:flex' : 'flex'} w-full lg:w-[60%] p-4 lg:p-10 flex flex-col h-full relative`}>
              <header className="mb-6 lg:mb-10">
                <div className="flex items-center gap-4">
                    <button onClick={handleBack} className="p-2 lg:p-3 bg-white/10 text-white rounded-xl lg:rounded-2xl hover:bg-white/20 transition-all active:scale-90">
                        <BackIcon className="w-5 h-5 lg:w-6 lg:h-6" />
                    </button>
                    <h1 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tighter flex flex-wrap items-center gap-2 lg:gap-4">
                        <span className="text-white">ADMINISTRATION</span>
                        <span className="text-[#ff802b]">FILANT225</span>
                    </h1>
                </div>
                <div className="h-0.5 lg:h-1 bg-white/20 w-full mt-4 lg:mt-6" />
              </header>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-6 flex-1 content-start overflow-y-auto pr-2 lg:pr-4 scrollbar-hide pb-20">
                {sidebarButtonsMemo.map(btn => {
                  const count = getUnreadCount(btn.id);
                  return (
                    <button 
                      key={btn.id}
                      onClick={() => handleSetView(btn.id as any)}
                      className={`aspect-[16/9] rounded-2xl lg:rounded-[2rem] p-3 lg:p-6 flex flex-col items-center justify-center text-center transition-all active:scale-95 shadow-xl border-2 lg:border-4 border-transparent relative ${
                        view === btn.id 
                          ? 'bg-black text-[#ff802b]' 
                          : 'bg-white text-[#ff802b] hover:bg-white/90'
                      }`}
                    >
                      <span className="text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-widest leading-tight">
                        {btn.label}
                      </span>
                      {count > 0 && (
                        <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-red-600 text-white min-w-[20px] h-5 lg:min-w-[28px] lg:h-7 rounded-full flex items-center justify-center px-1 border-2 border-white shadow-lg animate-bounce">
                          <span className="text-[10px] lg:text-xs font-black">{count}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
    
              {onLogout && (
                <button onClick={handleLogout} className="absolute bottom-6 lg:bottom-8 left-4 lg:left-10 flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-red-500 text-white rounded-xl lg:rounded-2xl hover:bg-red-600 transition-all active:scale-95 text-[10px] lg:text-xs font-black uppercase tracking-widest shadow-xl">
                  Déconnexion
                </button>
              )}
            </div>
    
            {/* Right Side: Content Panel - Full screen on mobile if a view is selected */}
            <div className={`${view === 'grid' ? 'hidden lg:flex' : 'flex'} w-full lg:w-[40%] bg-[#ff802b] flex flex-col h-full shadow-[-10px_0_30px_rgba(0,0,0,0.2)] lg:shadow-[-20px_0_60px_rgba(0,0,0,0.3)] relative z-10`}>
              {view !== 'grid' && (
                <div className="p-4 lg:p-6 border-b border-white/20 bg-white/5 flex items-center gap-4 z-30">
                  <button 
                    onClick={handleBack}
                    className="p-2 lg:p-3 bg-white/20 text-white rounded-xl lg:rounded-2xl hover:bg-white/30 transition-all active:scale-90 flex items-center gap-2 font-black text-[10px] lg:text-xs tracking-widest"
                  >
                    <BackIcon className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>RETOUR</span>
                  </button>
                  <h2 className="text-white font-black uppercase tracking-widest text-[10px] lg:text-sm truncate">
                    {sidebarButtonsMemo.find(b => b.id === view)?.label || view}
                  </h2>
                </div>
              )}
              {activeViewContent}
            </div>
    
            {/* Shared Modal for Registration Details */}
            {/* Shared Modal for Registration Details */}
            {selectedRegistration && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide border-8 border-[#ff802b]/20">
                        <div className="flex justify-between items-center mb-8 border-b-4 border-slate-100 pb-6">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Détails Inscription</h3>
                            <button 
                                onClick={() => setSelectedRegistration(null)}
                                className="p-3 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-8">
                            <div className="bg-slate-50 rounded-[2rem] p-8 border-2 border-slate-100">
                                <div className="flex justify-between items-center mb-6 border-b-2 border-slate-200 pb-4">
                                    <span className="text-xs font-black text-[#ff802b] uppercase tracking-widest">{selectedRegistration.category}</span>
                                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                                        selectedRegistration.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {selectedRegistration.status}
                                    </span>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nom Complet</p>
                                            <p className="text-lg font-black text-slate-900 uppercase">{selectedRegistration.title}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Contact Téléphonique</p>
                                            <p className="text-lg font-mono font-black text-slate-700">+225 {selectedRegistration.phone}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t-2 border-slate-200">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Informations Détaillées</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            {Object.entries(selectedRegistration.data || {}).map(([key, value]) => {
                                                if (key === 'ville' || key === 'phone' || key === 'name') return null;
                                                return (
                                                    <div key={key} className="bg-white p-4 rounded-2xl border-2 border-slate-100 shadow-sm">
                                                        <p className="text-[9px] font-black text-[#ff802b] uppercase tracking-widest mb-1">{key}</p>
                                                        <p className="text-sm font-bold text-slate-800">{String(value)}</p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                {selectedRegistration.status === 'pending' && (
                                    <button 
                                        onClick={async () => {
                                            setIsSyncing(true);
                                            const res = await databaseService.approveRegistration(selectedRegistration.id, selectedRegistration.collectionName || selectedRegistration.typeInscription || 'travailleurs');
                                            if (res.success) {
                                                setSelectedRegistration(null);
                                            }
                                            setIsSyncing(false);
                                        }}
                                        className="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all active:scale-95 uppercase text-xs tracking-widest shadow-lg"
                                    >
                                        Approuver
                                    </button>
                                )}
                                <AdminChatButton 
                                    user={{
                                        id: selectedRegistration.userId,
                                        userId: selectedRegistration.userId,
                                        name: selectedRegistration.title,
                                        phone: selectedRegistration.phone,
                                        city: selectedRegistration.data?.ville || 'Inconnue'
                                    }} 
                                    onOpenChat={handleOpenChat} 
                                    className="h-16 w-16"
                                />
                                <button 
                                    onClick={() => {
                                        setDeleteId(selectedRegistration.id);
                                        setItemToDelete(selectedRegistration);
                                        setSelectedRegistration(null);
                                    }}
                                    className="flex-1 py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition-all active:scale-95 uppercase text-xs tracking-widest border-2 border-red-100"
                                >
                                    Supprimer la demande
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Modal d'ajout/modification de contact admin */}
          {isFormOpen && view === 'contacts' && (
              <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border-8 border-[#ff802b]/20 max-h-[90vh] overflow-y-auto scrollbar-hide">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                              {editingContact ? 'Modifier le contact' : 'Nouveau contact'}
                          </h3>
                          <button 
                              onClick={() => { setIsFormOpen(false); setEditingContact(null); }}
                              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </div>

                      <div className="space-y-4">
                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type de contact</p>
                              <select 
                                  value={adminContactInputs.type}
                                  onChange={(e) => setAdminContactInputs({ ...adminContactInputs, type: e.target.value as any })}
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                              >
                                  <option value="TRAVAILLEUR">Travailleur</option>
                                  <option value="PROPRIÉTAIRE">Propriétaire</option>
                                  <option value="AGENCE">Agence</option>
                                  <option value="CLIENT">Client</option>
                              </select>
                          </div>

                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom Complet</p>
                              <input 
                                  type="text"
                                  value={adminContactInputs.name}
                                  onChange={(e) => setAdminContactInputs({ ...adminContactInputs, name: e.target.value })}
                                  placeholder="Nom et prénoms"
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                              />
                          </div>

                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ville</p>
                              <input 
                                  type="text"
                                  value={adminContactInputs.city}
                                  onChange={(e) => setAdminContactInputs({ ...adminContactInputs, city: e.target.value })}
                                  placeholder="Ville de résidence"
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                              />
                          </div>

                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Téléphone</p>
                              <input 
                                  type="text"
                                  value={adminContactInputs.phone}
                                  onChange={(e) => setAdminContactInputs({ ...adminContactInputs, phone: e.target.value })}
                                  placeholder="Numéro sans indicatif"
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                              />
                          </div>

                          {adminContactInputs.type === 'TRAVAILLEUR' && (
                              <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Métier</p>
                                  <input 
                                      type="text"
                                      value={adminContactInputs.job}
                                      onChange={(e) => setAdminContactInputs({ ...adminContactInputs, job: e.target.value })}
                                      placeholder="Ex: Chauffeur, Maçon..."
                                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                  />
                              </div>
                          )}

                          {adminContactInputs.type === 'PROPRIÉTAIRE' && (
                              <>
                                  <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom de l'équipement</p>
                                      <input 
                                          type="text"
                                          value={adminContactInputs.equipmentName}
                                          onChange={(e) => setAdminContactInputs({ ...adminContactInputs, equipmentName: e.target.value })}
                                          placeholder="Ex: Camion, Pelle..."
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      />
                                  </div>
                                  <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom de l'utilisateur</p>
                                      <input 
                                          type="text"
                                          value={adminContactInputs.userName}
                                          onChange={(e) => setAdminContactInputs({ ...adminContactInputs, userName: e.target.value })}
                                          placeholder="Nom de celui qui utilise"
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      />
                                  </div>
                              </>
                          )}

                          {adminContactInputs.type === 'AGENCE' && (
                              <div>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom de l'agence</p>
                                  <input 
                                      type="text"
                                      value={adminContactInputs.agencyName}
                                      onChange={(e) => setAdminContactInputs({ ...adminContactInputs, agencyName: e.target.value })}
                                      placeholder="Nom de l'entreprise"
                                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                  />
                              </div>
                          )}

                          <div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description / Notes</p>
                              <textarea 
                                  value={adminContactInputs.description}
                                  onChange={(e) => setAdminContactInputs({ ...adminContactInputs, description: e.target.value })}
                                  placeholder="Informations complémentaires..."
                                  rows={3}
                                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all resize-none"
                              />
                          </div>

                          <button 
                              onClick={editingContact ? handleUpdateAdminContact : handleAddAdminContact}
                              className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                          >
                              <SaveIcon className="w-4 h-4" />
                              {editingContact ? 'Mettre à jour' : 'Enregistrer le contact'}
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* Modal d'ajout d'association */}
          {isFormOpen && view === 'associations' && (
              <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
                  <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border-8 border-[#ff802b]/20 max-h-[90vh] overflow-y-auto scrollbar-hide">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nouvelle Association</h3>
                          <button 
                              onClick={() => setIsFormOpen(false)}
                              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                          >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                      </div>

                      <div className="space-y-6">
                          {/* Prestataire Section */}
                          <div className="space-y-3">
                              <p className="text-xs font-black text-[#ff802b] uppercase tracking-widest border-b-2 border-slate-100 pb-1">Prestataire</p>
                              <div className="grid grid-cols-2 gap-2">
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
                                      <select 
                                          value={assocInputs.providerType}
                                          onChange={(e) => setAssocInputs({ ...assocInputs, providerType: e.target.value as any })}
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      >
                                          <option value="TRAVAILLEUR">Travailleur</option>
                                          <option value="PROPRIÉTAIRE">Propriétaire</option>
                                          <option value="AGENCE">Agence</option>
                                      </select>
                                  </div>
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Métier/Matériel</p>
                                      <input 
                                          type="text"
                                          value={assocInputs.providerJob}
                                          onChange={(e) => setAssocInputs({ ...assocInputs, providerJob: e.target.value })}
                                          placeholder="Ex: Chauffeur"
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      />
                                  </div>
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom</p>
                                      <input 
                                          type="text"
                                          value={assocInputs.providerName}
                                          onChange={(e) => setAssocInputs({ ...assocInputs, providerName: e.target.value })}
                                          placeholder="Nom prestataire"
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      />
                                  </div>
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Téléphone</p>
                                      <input 
                                          type="text"
                                          value={assocInputs.providerPhone}
                                          onChange={(e) => setAssocInputs({ ...assocInputs, providerPhone: e.target.value })}
                                          placeholder="Numéro"
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      />
                                  </div>
                              </div>
                          </div>

                          {/* Client Section */}
                          <div className="space-y-3">
                              <p className="text-xs font-black text-[#ff802b] uppercase tracking-widest border-b-2 border-slate-100 pb-1">Client</p>
                              <div className="grid grid-cols-2 gap-2">
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Nom Client</p>
                                      <input 
                                          type="text"
                                          value={assocInputs.clientName}
                                          onChange={(e) => setAssocInputs({ ...assocInputs, clientName: e.target.value })}
                                          placeholder="Nom du client"
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      />
                                  </div>
                                  <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Téléphone</p>
                                      <input 
                                          type="text"
                                          value={assocInputs.clientPhone}
                                          onChange={(e) => setAssocInputs({ ...assocInputs, clientPhone: e.target.value })}
                                          placeholder="Numéro"
                                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                                      />
                                  </div>
                              </div>
                              <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Description du besoin</p>
                                  <textarea 
                                      value={assocInputs.clientDescription}
                                      onChange={(e) => setAssocInputs({ ...assocInputs, clientDescription: e.target.value })}
                                      placeholder="Détails de la mission..."
                                      rows={2}
                                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-2 px-3 text-xs font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all resize-none"
                                  />
                              </div>
                          </div>

                          <button 
                              onClick={handleAddAssociation}
                              className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center justify-center gap-2"
                          >
                              <SaveIcon className="w-4 h-4" />
                              Créer l'association
                          </button>
                      </div>
                  </div>
              </div>
          )}

          {/* Modal d'envoi de notification */}
        {isNotificationModalOpen && notificationTargetUser && (
            <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md animate-in fade-in duration-200">
                <div className="bg-white rounded-[3rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 border-8 border-[#ff802b]/20">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Nouvelle Notification</h3>
                        <button 
                            onClick={() => setIsNotificationModalOpen(false)}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-[#ff802b] uppercase tracking-widest mb-1">Destinataire</p>
                            <p className="text-sm font-bold text-slate-700">{notificationTargetUser.name} (+225 {notificationTargetUser.phone})</p>
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Titre</p>
                            <input 
                                type="text"
                                value={notificationTitle}
                                onChange={(e) => setNotificationTitle(e.target.value)}
                                placeholder="Titre de la notification"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all"
                            />
                        </div>

                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Message</p>
                            <textarea 
                                value={notificationMessage}
                                onChange={(e) => setNotificationMessage(e.target.value)}
                                placeholder="Écrivez votre message ici..."
                                rows={4}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none focus:border-[#ff802b]/50 transition-all resize-none"
                            />
                        </div>

                        <button 
                            onClick={handleSendNotification}
                            disabled={isSendingNotification || !notificationTitle || !notificationMessage}
                            className="w-full py-4 bg-black text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                        >
                            {isSendingNotification ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <BellIcon className="w-4 h-4" />
                                    Envoyer maintenant
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )}

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