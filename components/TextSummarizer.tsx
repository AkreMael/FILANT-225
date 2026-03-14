
import React, { useEffect, useRef, useState } from 'react';
import { User, Tab, FavoriteRequest } from '../types';
import ScannerOverlay from './ScannerOverlay';
import SpeakerIcon from './common/SpeakerIcon';
import { databaseService, SavedContact } from '../services/databaseService';
import { getQuestionsForType, generateWhatsAppMessage } from './common/formDefinitions';
import { audioService } from '../services/audioService';

// --- PROPS ---
interface ProfileScreenProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  setActiveTab: (tab: Tab) => void;
  onShowPopup: (msg: string, type: 'alert' | 'confirm', onConfirm?: () => void) => void; 
}

// --- CONSTANTS ---
const WELCOME_TEXT = "Bienvenue, je suis Filant 225. Nous sommes à votre disposition. Choisissez l’option qui vous convient et nous mettrons les agences à votre disposition. Notre mission est de vous accompagner et de vous encadrer dans tous vos besoins de service. Dites-nous ce que vous recherchez. Ouvrez l’application, effectuez votre choix, remplissez le formulaire et envoyez-le à l’entreprise. Merci.";
const ADMIN_PHONE = "0705052632";
const PROFILE_IMAGE_KEY_PREFIX = 'filant_profile_image_';
const PROFILE_TS_KEY_PREFIX = 'filant_profile_ts_';
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// --- ICONS ---
const ChevronRight: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>;
const BackIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const SearchIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const MapPinIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

const PayeIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M52 20H12C10.8954 20 10 20.8954 10 22V48C10 49.1046 10.8954 50 12 50H52C53.1046 50 54 49.1046 54 48V22C54 20.8954 53.1046 20 52 20Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M10 28H54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M42 42H48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 14H42C42 14 45 14 45 17C45 20 42 20 42 20H22C22 20 19 20 19 17C19 14 22 14 22 14Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const ContactIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M42 12H16C13.7909 12 12 13.7909 12 16V48C12 50.2091 13.7909 52 16 52H42C44.2091 52 46 50.2091 46 48V16C46 13.7909 44.2091 12 42 12Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M29 25C31.2091 25 33 23.2091 33 21C33 18.7909 31.2091 17 29 17C26.7909 17 25 18.7909 25 21C25 23.2091 26.7909 25 29 25Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M38 42C38 37.0294 33.9706 33 29 33C24.0294 33 20 37.0294 20 42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M46 20H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M46 28H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M46 36H50" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const AdminIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M29 32C33.4183 32 37 28.4183 37 24C37 19.5817 33.4183 16 29 16C24.5817 16 21 19.5817 21 24C21 28.4183 24.5817 32 29 32Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M29 48C21.268 48 15 41.732 15 34C15 33.364 15.054 32.738 15.16 32.124L11.83 30.084C9.722 28.776 9.428 25.896 11.21 24.114L13.17 22.154C14.952 20.372 17.832 20.666 19.14 22.774L21.18 26.1C21.794 26.054 22.42 26 23 26C23.636 26 24.262 26.054 24.876 26.16L26.916 22.83C28.224 20.722 31.104 20.428 32.886 22.21L34.846 24.17C36.628 25.952 36.334 28.832 34.226 30.14L30.9 32.18C30.946 32.794 31 33.42 31 34C31 41.732 36.732 48 44.464 48" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const RechercheIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H11V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M45 12H53V20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 52H11V44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M45 52H53V44" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 32H52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const FavorisIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 12H48V52L32 42L16 52V12Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M32 29L29.3431 34.3431L24 35L28 39L27 44L32 41.5L37 44L36 39L40 35L34.6569 34.3431L32 29Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const VideoIcon: React.FC<{className?: string}> = ({className}) => <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 52C43.0457 52 52 43.0457 52 32C52 20.9543 43.0457 12 32 12C20.9543 12 12 20.9543 12 32C12 43.0457 20.9543 52 32 52Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M28 24L40 32L28 40V24Z" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg>;
const TrashIcon: React.FC<{className?: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// --- INTERFACES ---
interface ScannedContactInfo {
    name: string;
    city: string;
    phone: string;
    title?: string;
    details?: string;
}

// --- HELPERS ---
const sanitizePhoneNumber = (phone: string): string => {
    let cleanPhone = phone.replace(/[\s-.]/g, '');
    if (cleanPhone.startsWith('+225')) cleanPhone = cleanPhone.slice(4);
    return cleanPhone;
};

const parseKeyValue = (text: string, key: string) => {
    const regex = new RegExp(`${key}\\s*[:=]\\s*([^\\n]+)`, 'i');
    return text.match(regex)?.[1]?.trim();
};

const ProfileAvatar = ({ imageUrl, onUpload, isLocked }: { imageUrl?: string | null, onUpload: () => void, isLocked: boolean }) => (
    <div className="relative">
        <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm relative">
            {imageUrl ? (
                <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400 mt-4" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 a4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
            )}
        </div>
        <button 
            onClick={isLocked ? undefined : onUpload}
            disabled={isLocked}
            className={`absolute bottom-0 right-0 w-9 h-9 rounded-full border-2 border-white flex items-center justify-center shadow-md transition-all ${isLocked ? 'bg-green-500 cursor-default scale-110' : 'bg-blue-600 text-white active:scale-90 hover:bg-blue-700'}`}
        >
            {isLocked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            )}
        </button>
    </div>
);

const ProfileRow: React.FC<{
    icon: React.ReactNode, 
    title: string, 
    subtitle?: string, 
    onClick?: () => void, 
    isDark?: boolean,
    rightElement?: React.ReactNode
}> = ({ icon, title, subtitle, onClick, isDark, rightElement }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center p-4 transition-colors active:bg-gray-100 ${isDark ? 'bg-[#212121] text-white rounded-2xl mb-4 shadow-md' : 'bg-white'}`}
    >
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg mr-4 ${isDark ? 'bg-transparent text-yellow-400' : 'text-gray-700'}`}>
            {icon}
        </div>
        <div className="flex-1 text-left overflow-hidden">
            <p className={`font-bold text-base leading-tight truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
            {subtitle && <p className="text-gray-400 text-xs mt-0.5 truncate uppercase font-bold tracking-tighter">{subtitle}</p>}
        </div>
        <div className="flex-shrink-0 ml-2">
            {rightElement || <ChevronRight className={isDark ? "text-red-500" : "text-gray-300"} />}
        </div>
    </button>
);

const ContactListView: React.FC<{ contacts: SavedContact[], onDelete: (id: string) => void }> = ({ contacts, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const filtered = contacts.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
    );

    return (
        <div className="flex flex-col h-full bg-[#F3F3F3]">
            <div className="p-4 bg-white shadow-sm border-b border-gray-100 sticky top-0 z-10">
                <div className="relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Rechercher un contact scanné..." 
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30">
                        <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                        <p className="text-sm font-bold uppercase tracking-widest text-center px-4 leading-tight">Aucun contact trouvé dans Assistant QR</p>
                    </div>
                ) : (
                    filtered.map(contact => (
                        <div key={contact.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-3 relative overflow-hidden animate-in fade-in duration-300">
                            {/* Card Header: Title and City Badge */}
                            <div className="flex justify-between items-start">
                                <div className="flex flex-col">
                                    <span className="bg-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full w-fit mb-1 tracking-tighter">
                                        {contact.title}
                                    </span>
                                    <h4 className="text-lg font-black text-slate-900 leading-tight uppercase truncate max-w-[180px]">{contact.name}</h4>
                                </div>
                                <div className="bg-blue-50 px-3 py-1.5 rounded-2xl flex items-center gap-1.5 border border-blue-100">
                                    <MapPinIcon className="w-3.5 h-3.5 text-blue-600" />
                                    <span className="text-[10px] font-black text-blue-800 uppercase tracking-tighter truncate max-w-[80px]">
                                        {contact.city || 'Non spécifiée'}
                                    </span>
                                </div>
                            </div>

                            {/* Contact Details String */}
                            {contact.review && contact.review !== (contact.city || 'Non spécifiée') && (
                                <p className="text-xs text-gray-500 italic leading-snug border-l-2 border-orange-100 pl-3">
                                    {contact.review}
                                </p>
                            )}

                            {/* Card Footer: WhatsApp & Actions */}
                            <div className="flex items-center justify-between mt-1 pt-3 border-t border-gray-50">
                                <div className="flex flex-col">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Numéro WhatsApp</p>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                        <p className="text-green-600 font-black text-sm tracking-tight">+225 {contact.phone}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onDelete(contact.id)} className="p-2.5 bg-red-50 text-red-500 rounded-full active:scale-90 transition-transform">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                    <a href={`tel:${contact.phone}`} className="p-2.5 bg-blue-600 text-white rounded-full shadow-lg active:scale-90 transition-transform">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const FavoritesListView: React.FC<{ favorites: FavoriteRequest[], onSelect: (fav: FavoriteRequest) => void, onClearAll: () => void, onDeleteOne: (id: string) => void }> = ({ favorites, onSelect, onClearAll, onDeleteOne }) => (
    <div className="space-y-4 p-4">
        <div className="flex justify-between items-center mb-4 px-1">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight">Historique des demandes</h3>
            {favorites.length > 0 && (
                <button onClick={onClearAll} className="p-2 text-red-600 bg-red-50 rounded-xl active:scale-95 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            )}
        </div>
        {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
                <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5S19.832 5.477 21 6.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-sm font-bold uppercase tracking-widest">Aucun historique trouvé</p>
            </div>
        ) : (
            favorites.map((fav) => (
                <div key={fav.id} onClick={() => onSelect(fav)} className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 cursor-pointer flex justify-between items-center active:scale-[0.98] transition-all">
                     <div className="flex-1">
                        <h4 className="text-gray-900 font-black uppercase text-sm tracking-tight">{fav.title}</h4>
                        <p className="text-gray-400 text-xs font-bold mt-1">
                            {new Date(fav.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                     </div>
                     <ChevronRight className="text-orange-500" />
                </div>
            ))
        )}
    </div>
);

const FavoriteDetailView: React.FC<{ fav: FavoriteRequest, onBack: () => void }> = ({ fav, onBack }) => {
    const questions = getQuestionsForType(fav.formType, fav.title);
    const [isSending, setIsSending] = useState(false);
    
    const handleResend = async () => {
        setIsSending(true);
        await new Promise(res => setTimeout(res, 1500));
        const storedPrice = fav.totalPrice || 0;
        const message = generateWhatsAppMessage(fav.title, questions, fav.answers, fav.userInfo, storedPrice);
        window.dispatchEvent(new CustomEvent('trigger-chat-message', { detail: message }));
        setIsSending(false);
    };

    return (
        <div className="fixed inset-0 bg-orange-500 z-[300] flex flex-col h-full w-full">
            <div className="p-4 flex items-center">
                <button onClick={onBack} className="p-2 -ml-2 text-black active:scale-90 transition-transform">
                    <BackIcon className="w-8 h-8" />
                </button>
                <h2 className="flex-1 text-center font-black uppercase text-base mr-10">Détails de la demande</h2>
            </div>
            <div className="flex-1 flex flex-col items-center pt-4 overflow-y-auto pb-24 px-6">
                <div className="w-24 h-24 rounded-full border-[4px] border-black flex items-center justify-center mb-8 shadow-xl bg-white/20">
                    <svg className="h-16 w-16 text-black" viewBox="0 0 24 24" fill="currentColor">
                        <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 a4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                    </svg>
                </div>
                <h2 className="text-xl font-black text-center text-black mb-8 border-b border-black/20 pb-2 w-full uppercase tracking-tighter">{fav.title}</h2>
                <div className="w-full space-y-4 mb-8 max-w-sm">
                    {questions.map(q => fav.answers[q.key] && (
                        <div key={q.key} className="bg-white/95 p-4 rounded-2xl shadow-md">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{q.text(fav.answers).replace(/\?$/, '')}</p>
                            <p className="text-black font-bold text-lg leading-tight">{fav.answers[q.key]}</p>
                        </div>
                    ))}
                    {fav.totalPrice !== undefined && (
                        <div className="bg-white p-4 rounded-2xl border-4 border-black/10 shadow-lg">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Montant Total</p>
                            <p className="text-red-600 font-black text-2xl">{fav.totalPrice} FCFA</p>
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleResend} 
                    disabled={isSending} 
                    className={`w-full max-w-sm text-white font-black py-5 px-6 rounded-3xl shadow-2xl flex items-center justify-center gap-3 uppercase tracking-widest transition-all active:scale-95 ${isSending ? 'bg-red-600 animate-pulse' : 'bg-black'}`}
                >
                    {isSending ? <><div className="w-5 h-5 border-[3px] border-white border-t-transparent rounded-full animate-spin"></div><span>Envoi assistant...</span></> : <span>Renvoyer la demande</span>}
                </button>
            </div>
        </div>
    );
};

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onClose, onLogout, setActiveTab, onShowPopup }) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [view, setView] = useState<'main' | 'contacts' | 'favorites' | 'favorite-detail'>('main');
  const [contacts, setContacts] = useState<SavedContact[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRequest[]>([]);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteRequest | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  
  const [profileImage, setProfileImage] = useState<string | null>(() => {
      const stored = localStorage.getItem(`${PROFILE_IMAGE_KEY_PREFIX}${user.phone}`);
      const storedTs = localStorage.getItem(`${PROFILE_TS_KEY_PREFIX}${user.phone}`);
      if (storedTs) {
          const ts = parseInt(storedTs);
          if (Date.now() - ts < ONE_MONTH_MS) return stored; 
      }
      return stored;
  });

  const isProfileLocked = React.useMemo(() => {
    const storedTs = localStorage.getItem(`${PROFILE_TS_KEY_PREFIX}${user.phone}`);
    if (!storedTs || !profileImage) return false;
    const ts = parseInt(storedTs);
    return (Date.now() - ts) < ONE_MONTH_MS;
  }, [user.phone, profileImage]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioSource, setAudioSource] = useState<string | null>(null);
  const [waveHeights, setWaveHeights] = useState(Array(30).fill(6));

  useEffect(() => {
    setContacts(databaseService.getContacts(user.phone));
    requestAnimationFrame(() => {
        if (panelRef.current) panelRef.current.classList.remove('translate-x-full');
        if (overlayRef.current) overlayRef.current.classList.remove('opacity-0');
    });
  }, [user.phone]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
        interval = setInterval(() => setWaveHeights(prev => prev.map(() => Math.floor(Math.random() * 18) + 4)), 100);
    } else {
        setWaveHeights(Array(30).fill(6));
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleBack = () => {
    if (view === 'favorite-detail') setView('favorites');
    else if (view !== 'main') setView('main');
    else handleClose();
  };

  const handleClose = () => {
    if (panelRef.current) panelRef.current.classList.add('translate-x-full');
    if (overlayRef.current) overlayRef.current.classList.add('opacity-0');
    audioService.cancel();
    setTimeout(onClose, 300);
  };

  const generateAndPlayAudio = async () => {
    if (isLoadingAudio) return;
    if (audioSource && audioRef.current) {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            try {
                await audioRef.current.play();
            } catch (err) {
                console.error("Playback failed:", err);
            }
        }
        setIsPlaying(!isPlaying);
        return;
    }
    setIsLoadingAudio(true);
    try {
        const url = await audioService.getAudioUrl(WELCOME_TEXT);
        setAudioSource(url);
        if (audioRef.current) {
            audioRef.current.src = url;
            try {
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (err) {
                console.error("Playback failed:", err);
            }
        }
    } catch (e) {
        onShowPopup("Erreur audio", "alert");
    } finally { setIsLoadingAudio(false); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isProfileLocked) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const now = Date.now();
        setProfileImage(base64);
        localStorage.setItem(`${PROFILE_IMAGE_KEY_PREFIX}${user.phone}`, base64);
        localStorage.setItem(`${PROFILE_TS_KEY_PREFIX}${user.phone}`, now.toString());
    };
    reader.readAsDataURL(file);
  };

  const handleScanResult = (data: string) => {
    setShowScanner(false);
    
    let info: ScannedContactInfo | null = null;
    
    // Improved key parsing logic for all requested fields
    const title = parseKeyValue(data, 'Poste') || parseKeyValue(data, 'Titre') || 'Assistant QR';
    const name = parseKeyValue(data, 'Nom') || parseKeyValue(data, 'Prénom') || parseKeyValue(data, 'Travailleur');
    const phone = parseKeyValue(data, 'Tél') || parseKeyValue(data, 'Phone') || parseKeyValue(data, 'WhatsApp') || parseKeyValue(data, 'Téléphone');
    const city = parseKeyValue(data, 'Ville') || parseKeyValue(data, 'Localité') || parseKeyValue(data, 'Commune') || 'Non spécifiée';
    const details = parseKeyValue(data, 'Details') || parseKeyValue(data, 'Infos') || parseKeyValue(data, 'Détails');

    if (name && phone) {
        info = { name, phone: sanitizePhoneNumber(phone), city, title, details };
    } else {
        // Fallback for raw text without keys
        const lines = data.split('\n').map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
            info = {
                title: lines[0],
                name: lines[1],
                city: lines[2] || 'Non spécifiée',
                phone: sanitizePhoneNumber(lines[3] || lines[1]),
                details: lines.slice(4).join(' ')
            };
        }
    }

    if (info) {
        const newContact: SavedContact = {
            id: Date.now().toString(),
            title: info.title || 'Assistant QR',
            name: info.name,
            phone: info.phone,
            city: info.city,
            review: info.details || info.city // Fallback to city if no extra details
        };
        const updated = [...contacts, newContact];
        setContacts(updated);
        databaseService.saveContacts(user.phone, updated);
        onShowPopup("Information validée et intégrée dans l'Assistance QR !", "alert");
        setView('contacts');
    } else {
        onShowPopup("Le format du code QR n'a pas pu être structuré automatiquement.", "alert");
    }
  };

  const renderMainView = () => (
    <div className="flex flex-col h-full bg-[#F3F3F3]">
        <header className="p-4 flex items-center bg-white shadow-sm border-b border-gray-100">
            <button onClick={handleBack} className="p-2 -ml-2 text-gray-800 hover:bg-gray-100 rounded-full transition-colors active:scale-90">
                <BackIcon />
            </button>
            <h1 className="flex-1 text-center font-black uppercase text-base tracking-tight mr-10">Mon Espace Profil</h1>
        </header>

        <div className="flex flex-col items-center justify-center pt-8 pb-8 px-4 bg-white shadow-sm mb-6">
            <ProfileAvatar 
                imageUrl={profileImage} 
                onUpload={() => fileInputRef.current?.click()} 
                isLocked={isProfileLocked}
            />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
            <div className="flex items-center gap-2 mt-5">
                <h1 className="text-2xl font-black text-gray-900 capitalize tracking-tight">{user.name}</h1>
                <div className="bg-orange-100 p-1 rounded-full"><ChevronRight className="h-4 w-4 text-orange-500" /></div>
            </div>
            <p className="text-gray-400 font-bold text-sm mt-0.5 tracking-tighter uppercase">Résidence: {user.city}</p>
            <p className="text-slate-900 font-black text-sm mt-2 bg-gray-100 px-3 py-1 rounded-full">+225 {user.phone}</p>
        </div>

        <div className="flex-1 space-y-6 pb-32">
            <div className="bg-white rounded-3xl overflow-hidden mx-4 shadow-sm border border-gray-100">
                <ProfileRow 
                    icon={<PayeIcon className="w-10 h-10 text-blue-600" />}
                    title="Modes de paiement"
                    subtitle="ESPÈCES / WAVE"
                    onClick={() => { setActiveTab(Tab.Payment); handleClose(); }}
                    rightElement={<div className="bg-green-100 px-2.5 py-1 rounded-lg flex items-center gap-1.5"><span className="text-[10px] font-black text-green-700 uppercase tracking-tighter">Actif</span><ChevronRight className="h-3 w-3 text-green-700" /></div>}
                />
                <div className="h-px bg-gray-50 mx-4"></div>
                <ProfileRow 
                    icon={<ContactIcon className="w-10 h-10 text-orange-500" />}
                    title="Assistance QR"
                    subtitle="Contacts intégrés"
                    onClick={() => setView('contacts')}
                />
            </div>

            <div className="bg-white rounded-3xl overflow-hidden mx-4 shadow-sm border border-gray-100">
                 <ProfileRow 
                    icon={<FavorisIcon className="w-10 h-10 text-indigo-600" />}
                    title="Historique"
                    subtitle="Favoris & Demandes"
                    onClick={() => { setFavorites(databaseService.getFavorites(user.phone)); setView('favorites'); }}
                />
            </div>

            <div className="mx-4">
                <ProfileRow 
                    isDark
                    icon={<AdminIcon className="w-10 h-10 text-yellow-400" />}
                    title="Compte professionnel"
                    subtitle="Accès Administrateur Admis"
                    onClick={() => { 
                        if (user.phone === ADMIN_PHONE) { setActiveTab(Tab.AdminDashboard); handleClose(); } 
                        else { setActiveTab(Tab.AdminLogin); handleClose(); }
                    }}
                    rightElement={<ChevronRight className="text-red-500" />}
                />
            </div>

            <div className="bg-white rounded-3xl overflow-hidden mx-4 shadow-sm border border-gray-100">
                <ProfileRow 
                    icon={<RechercheIcon className="w-10 h-10 text-gray-700" />}
                    title="Scanner QR"
                    subtitle="Intégrer information"
                    onClick={() => setShowScanner(true)}
                />
                <div className="h-px bg-gray-50 mx-4"></div>
                <ProfileRow 
                    icon={<VideoIcon className="w-10 h-10 text-red-500" />}
                    title="Vidéos Tuto"
                    subtitle="Tutoriels FILANT°225"
                    onClick={() => window.open('https://www.youtube.com/@FILANT225', '_blank')}
                />
            </div>

            <div className="mx-4 p-5 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
                <div className="flex items-end justify-center h-8 gap-1 mb-6">
                    {waveHeights.map((h, i) => (
                        <div key={i} className={`w-1 rounded-full transition-all duration-100 ${isPlaying ? 'bg-orange-500' : 'bg-gray-200'}`} style={{ height: `${h}px` }}></div>
                    ))}
                </div>
                <button onClick={generateAndPlayAudio} disabled={isLoadingAudio} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl active:scale-90 transition-all ${isPlaying ? 'bg-orange-500' : 'bg-blue-600'}`}>
                    {isLoadingAudio ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : (isPlaying ? <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>)}
                </button>
                <p className="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.2em]">Guide Vocal Interactif</p>
            </div>

            <div className="px-4 pt-6">
                <button onClick={handleLogoutClick} className="w-full py-4 text-red-600 font-black uppercase tracking-widest text-xs bg-white rounded-2xl shadow-sm border border-red-50 transition-all active:scale-[0.98] active:bg-red-50 flex items-center justify-center gap-3">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Déconnexion
                </button>
            </div>
        </div>
    </div>
  );

  const handleLogoutClick = () => {
    onShowPopup("Voulez-vous vous déconnecter de votre session ?", 'confirm', onLogout);
  };

  const handleClearContacts = () => {
      onShowPopup("Voulez-vous vider toute votre liste d'Assistance QR ?", 'confirm', () => {
          databaseService.saveContacts(user.phone, []);
          setContacts([]);
      });
  };

  const handleDeleteContact = (id: string) => {
      const updated = contacts.filter(c => c.id !== id);
      setContacts(updated);
      databaseService.saveContacts(user.phone, updated);
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
        <div ref={overlayRef} className="fixed inset-0 bg-black/40 transition-opacity duration-300 opacity-0" onClick={handleClose}></div>
        <div ref={panelRef} className="relative z-10 w-full max-w-sm bg-[#F3F3F3] flex flex-col transition-transform duration-300 translate-x-full overflow-hidden">
            <main className="flex-1 overflow-y-auto scrollbar-hide">
                {view === 'main' && renderMainView()}
                {view === 'favorites' && (
                    <div className="bg-[#F3F3F3] h-full flex flex-col">
                        <header className="p-4 flex items-center bg-white shadow-sm"><button onClick={() => setView('main')} className="p-2 -ml-2 active:scale-90 transition-transform"><BackIcon className="w-7 h-7 text-black"/></button><h1 className="flex-1 text-center font-black uppercase text-base tracking-tight mr-10">Historique des demandes</h1></header>
                        <FavoritesListView favorites={favorites} onSelect={(fav) => { setSelectedFavorite(fav); setView('favorite-detail'); }} onClearAll={() => onShowPopup("Voulez-vous vider tout votre historique ?", "confirm", () => { databaseService.clearFavorites(user.phone); setFavorites([]); })} onDeleteOne={(id) => { databaseService.removeFavorite(user.phone, id); setFavorites(prev => prev.filter(f => f.id !== id)); }} />
                    </div>
                )}
                {view === 'contacts' && (
                    <div className="bg-[#F3F3F3] h-full flex flex-col">
                        <header className="p-4 flex items-center bg-white shadow-sm border-b border-gray-100"><button onClick={() => setView('main')} className="p-2 -ml-2 active:scale-90 transition-transform"><BackIcon className="w-7 h-7 text-black"/></button><h1 className="flex-1 text-center font-black uppercase text-base tracking-tight mr-10">Assistance QR</h1><button onClick={handleClearContacts} className="p-2 text-red-500"><TrashIcon className="w-5 h-5"/></button></header>
                        <ContactListView contacts={contacts} onDelete={handleDeleteContact} />
                    </div>
                )}
                {view === 'favorite-detail' && selectedFavorite && <FavoriteDetailView fav={selectedFavorite} onBack={() => setView('favorites')} />}
            </main>
        </div>
        {showScanner && <ScannerOverlay onScan={handleScanResult} onClose={() => setShowScanner(false)} />}
    </div>
  );
};

export default ProfileScreen;
