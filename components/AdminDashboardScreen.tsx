import React, { useState, useEffect, useMemo } from 'react';
import { databaseService, ConnectionLog, Association, ActiveContact, AdminContact } from '../services/databaseService';
import { smsService } from '../services/smsService';
import Typewriter from './common/Typewriter';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const StorageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>;
const CardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>;
const ContactIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
const MicIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>;
const SMSIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>;
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

interface AdminDashboardScreenProps {
  onBack: () => void;
  onSelectUser?: (log: ConnectionLog) => void;
  initialView?: 'grid' | 'contacts' | 'associations' | 'active-contacts' | 'sms';
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBack, onSelectUser, initialView = 'grid' }) => {
  const [view, setView] = useState<'grid' | 'contacts' | 'associations' | 'active-contacts' | 'sms'>(initialView);
  const [logs, setLogs] = useState<ConnectionLog[]>([]);
  const [associations, setAssociations] = useState<Association[]>([]);
  const [activeContacts, setActiveContacts] = useState<ActiveContact[]>([]);
  const [adminContacts, setAdminContacts] = useState<AdminContact[]>([]);
  
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [showRecipientList, setShowRecipientList] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
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

  useEffect(() => {
      if (view === 'contacts') setAdminContacts(databaseService.getAdminContacts());
      if (view === 'sms') setLogs(databaseService.getConnectionLogs());
      if (view === 'associations') setAssociations(databaseService.getAssociations());
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

  const handleSendAdminSms = async () => {
      if (!smsRecipient || !smsMessage) {
          alert("Veuillez saisir un numéro et un message.");
          return;
      }
      setIsSendingSms(true);
      const success = await smsService.sendAdminManualSMS(smsRecipient, smsMessage);
      setIsSendingSms(false);
      if (!success) alert("Échec de l'ouverture de l'application SMS.");
  };

  const applySmsTemplate = (type: 'info' | 'notif' | 'alerte') => {
      let text = '';
      switch(type) {
          case 'info': text = "FILANT225: Nous avons de nouveaux prestataires disponibles dans votre zone. Consultez l'application pour en savoir plus."; break;
          case 'notif': text = "FILANT225: Votre demande de service a ete traitee. Un agent va vous contacter sous peu."; break;
          case 'alerte': text = "FILANT225 ALERTE: Un nouveau service de securite est disponible pour vos deplacements de nuit."; break;
      }
      setSmsMessage(text);
  };

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

  const handleDelete = (id: string) => {
      if (view === 'associations') {
          const updated = associations.filter(a => a.id !== id);
          setAssociations(updated);
          databaseService.saveAssociations(updated);
      } else if (view === 'active-contacts') {
          const updated = activeContacts.filter(c => c.id !== id);
          setActiveContacts(updated);
          databaseService.saveActiveContacts(updated);
      }
  };

  const renderSmsView = () => (
      <div className="flex-1 flex flex-col h-full bg-slate-900 animate-unfold-in text-left">
          <header className="p-4 flex items-center justify-between border-b border-slate-800 bg-slate-900 sticky top-0 z-20">
                <button onClick={() => setView('grid')} className="p-2 -ml-2 rounded-full hover:bg-slate-800 text-white">
                    <BackIcon />
                </button>
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex-1 text-center">Gestion des SMS</h2>
                <div className="w-10"></div>
          </header>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto scrollbar-hide">
              <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 shadow-xl space-y-5">
                  <h3 className="text-orange-500 font-black uppercase text-xs tracking-widest border-b border-slate-700 pb-2">Rédiger un SMS</h3>
                  <div className="relative">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Numéro du destinataire</label>
                      <div className="flex gap-2">
                          <input 
                              type="tel" 
                              value={smsRecipient} 
                              onChange={e => setSmsRecipient(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="0705052632"
                              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                          />
                          <button 
                            onClick={() => setShowRecipientList(!showRecipientList)}
                            className="bg-blue-600 text-white px-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all text-xs font-bold"
                          >
                              {showRecipientList ? 'Fermer' : 'Annuaire'}
                          </button>
                      </div>
                      {showRecipientList && (
                          <div className="absolute top-full left-0 right-0 z-30 bg-slate-800 border border-slate-600 rounded-xl mt-1 shadow-2xl max-h-40 overflow-y-auto">
                              {logs.length > 0 ? logs.map((log, i) => (
                                  <button 
                                      key={i} 
                                      onClick={() => { setSmsRecipient(log.phone); setShowRecipientList(false); }}
                                      className="w-full text-left p-3 hover:bg-slate-700 text-white text-xs border-b border-slate-700 flex justify-between"
                                  >
                                      <span>{log.name}</span>
                                      <span className="text-gray-400 font-mono">{log.phone}</span>
                                  </button>
                              )) : (
                                  <p className="p-3 text-gray-500 text-xs italic">Aucun contact trouvé.</p>
                              )}
                          </div>
                      )}
                  </div>
                  <div className="space-y-2">
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Templates rapides</label>
                      <div className="flex flex-wrap gap-2">
                          <button onClick={() => applySmsTemplate('notif')} className="bg-slate-700 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase hover:bg-orange-500 transition-colors">Notification</button>
                          <button onClick={() => applySmsTemplate('info')} className="bg-slate-700 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase hover:bg-orange-500 transition-colors">Information</button>
                          <button onClick={() => applySmsTemplate('alerte')} className="bg-slate-700 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase hover:bg-orange-500 transition-colors">Alerte</button>
                      </div>
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5 ml-1">Message SMS (Max 160 car.)</label>
                      <textarea 
                          value={smsMessage}
                          onChange={e => setSmsMessage(e.target.value.slice(0, 160))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-orange-500 outline-none h-32 text-sm leading-relaxed"
                          placeholder="Votre message ici..."
                      />
                      <div className="flex justify-end mt-1">
                          <span className={`text-[9px] font-bold ${smsMessage.length > 150 ? 'text-red-500' : 'text-gray-500'}`}>
                              {smsMessage.length} / 160
                          </span>
                      </div>
                  </div>
                  <button 
                    onClick={handleSendAdminSms}
                    disabled={isSendingSms || !smsMessage || !smsRecipient}
                    className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${isSendingSms ? 'bg-gray-700 text-gray-500' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                  >
                      {isSendingSms ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : 'Ouvrir l\'application SMS'}
                  </button>
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
                              <button onClick={() => setDeleteId(contact.id)} className="absolute top-3 right-3 z-10 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
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
                          <button onClick={() => setDeleteId(assoc.id)} className="absolute top-3 right-3 z-10 p-2 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
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
                                      <button onClick={() => setDeleteId(contact.id)} className="p-2.5 bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                                          <TrashIcon />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {viewingContact && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
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

  if (view === 'contacts') return renderContactStorageView();
  if (view === 'associations') return renderAssociationView();
  if (view === 'active-contacts') return renderActiveContactsView();
  if (view === 'sms') return renderSmsView();

  return (
    <div className="flex-1 bg-slate-900 flex flex-col h-full text-left">
        <header className="flex items-center p-4 bg-orange-600 shadow-lg sticky top-0 z-10">
            <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-orange-700 text-white transition-colors"><BackIcon /></button>
            <h1 className="text-xl font-bold text-white ml-2">Administrateur 225</h1>
        </header>

        <main className="p-6 overflow-y-auto">
            <h2 className="text-white font-bold mb-6 text-center text-lg">Panneau de gestion</h2>
            <div className="grid grid-cols-2 gap-6">
                <button onClick={() => setView('contacts')} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center gap-3 hover:bg-slate-700 transition-all transform hover:scale-105 group">
                    <div className="bg-blue-500/20 p-4 rounded-full group-hover:bg-blue-500/30 transition-colors"><StorageIcon /></div>
                    <span className="text-white text-sm font-semibold text-center leading-tight">Stockage des contacts</span>
                </button>

                <button onClick={() => setView('active-contacts')} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center gap-3 hover:bg-slate-700 transition-all transform hover:scale-105 group">
                     <div className="bg-green-500/20 p-4 rounded-full group-hover:bg-green-500/30 transition-colors"><CardIcon /></div>
                    <span className="text-white text-sm font-semibold text-center leading-tight">Activation des contacts</span>
                </button>

                <button onClick={() => setView('associations')} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center gap-3 hover:bg-slate-700 transition-all transform hover:scale-105 group">
                     <div className="bg-purple-500/20 p-4 rounded-full group-hover:bg-purple-500/30 transition-colors"><ContactIcon /></div>
                    <span className="text-white text-sm font-semibold text-center leading-tight">Association de contacts</span>
                </button>

                <button onClick={() => setView('sms')} className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 flex flex-col items-center gap-3 hover:bg-slate-700 transition-all transform hover:scale-105 group">
                     <div className="bg-orange-500/20 p-4 rounded-full group-hover:bg-orange-500/30 transition-colors"><SMSIcon /></div>
                    <span className="text-white text-sm font-semibold text-center leading-tight">Gestion des SMS</span>
                </button>
            </div>
        </main>

        {deleteId && (
              <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
                  <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
                      <h3 className="text-xl font-black text-gray-900 text-center mb-6 uppercase tracking-tight">Supprimer ?</h3>
                      <div className="flex gap-4">
                           <button onClick={() => setDeleteId(null)} className="flex-1 py-3 px-4 bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors">Non</button>
                           <button onClick={() => { 
                               if (view === 'contacts') handleDeleteAdminContact(deleteId!);
                               else handleDelete(deleteId!);
                               setDeleteId(null); 
                           }} className="flex-1 py-3 px-4 bg-red-600 text-white font-bold rounded-xl shadow-lg">Oui</button>
                      </div>
                  </div>
              </div>
          )}
    </div>
  );
};

export default AdminDashboardScreen;