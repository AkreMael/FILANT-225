
import React, { useState, useEffect } from 'react';
import { PersonalRequest, User } from '../types';
import InteractiveModal from './InteractiveModal';
import { databaseService } from '../services/databaseService';
import { Answers, getQuestionsForType, calculateTotalPrice } from './common/formDefinitions';

// --- ICONS ---
const BackIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
    </svg>
);

const LogoSmall = () => (
    <div className="w-10 h-10 bg-white rounded-full border-2 border-orange-500 p-1 shadow-sm">
        <img src="https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png" alt="Filant Logo" className="w-full h-full object-contain" />
    </div>
);

// --- REQUEST CARD COMPONENT ---
interface RequestCardProps {
  request: PersonalRequest;
  onDelete: (id: string) => void;
  onSend: (request: PersonalRequest) => void;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onDelete, onSend }) => {
  const isLocation = request.type === 'Location';
  
  // On récupère les questions pour avoir les labels propres
  const questions = getQuestionsForType(
      request.type === 'Travailleur' ? 'personal_worker' : 'personal_location',
      request.title
  );

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300 w-full max-w-sm mx-auto group relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight truncate leading-tight">{request.title}</h3>
            <span className="text-[10px] font-bold text-gray-400 mt-0.5">ID: {request.id.split('_')[1].slice(-4)}</span>
        </div>
        <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex-shrink-0 ${isLocation ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
            {request.type}
        </span>
      </div>

      {/* Affichage strict de TOUTES les informations fournies */}
      <div className="space-y-3 mb-6 bg-gray-50/50 rounded-2xl p-4 border border-gray-100">
        {questions.map((q) => {
            const answer = request.rawAnswers?.[q.key];
            if (!answer || (q.condition && !q.condition(request.rawAnswers || {}))) return null;
            return (
                <div key={q.key} className="flex flex-col gap-0.5 border-b border-gray-200/30 pb-2 last:border-0 last:pb-0">
                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{q.text(request.rawAnswers || {}).replace(/\?$/, '')}</span>
                    <span className="text-[12px] font-bold text-slate-700 leading-tight">{answer}</span>
                </div>
            );
        })}
        
        {/* Frais de mise en relation ajoutés dynamiquement */}
        {request.totalPrice !== undefined && request.totalPrice > 0 && (
            <div className="flex flex-col gap-0.5 pt-2 mt-2 border-t border-orange-200/50">
                <span className="text-[8px] font-black text-orange-600 uppercase tracking-tighter">Frais de mise en relation</span>
                <div className="flex justify-between items-baseline">
                    <span className="text-[14px] font-black text-orange-500">{request.totalPrice} FCFA</span>
                    <span className="text-[8px] font-black text-gray-400 uppercase italic">Valable 2 mois</span>
                </div>
            </div>
        )}

        {/* Si pas de rawAnswers (legacy), on affiche la description */}
        {(!request.rawAnswers || Object.keys(request.rawAnswers).length === 0) && (
            <p className="text-[12px] text-gray-600 italic leading-relaxed">{request.description}</p>
        )}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button 
          onClick={() => onDelete(request.id)}
          className="flex items-center gap-1.5 p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
        >
          <TrashIcon className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-widest">Supprimer</span>
        </button>

        <button 
          onClick={() => onSend(request)}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl shadow-lg transition-all active:scale-95 hover:bg-orange-600 border-b-4 border-orange-700"
        >
          <span className="text-xs font-black uppercase tracking-wider">Envoyer</span>
          <SendIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// --- MAIN SCREEN COMPONENT ---
interface MyWorkerScreenProps {
  onBack: () => void;
  user: User;
}

const MyWorkerScreen: React.FC<MyWorkerScreenProps> = ({ onBack, user }) => {
  const [requests, setRequests] = useState<PersonalRequest[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  
  const [interactiveContext, setInteractiveContext] = useState<{ 
      formType: 'personal_worker' | 'personal_location', 
      title: string, 
      user: User,
      initialAnswers?: Answers
  } | null>(null);

  useEffect(() => {
    setRequests(databaseService.getPersonalRequests(user.phone));
  }, [user.phone]);

  const saveRequests = (newRequests: PersonalRequest[]) => {
    setRequests(newRequests);
    databaseService.savePersonalRequests(user.phone, newRequests);
  };

  const handleConfirmDelete = () => {
    if (requestToDelete) {
        saveRequests(requests.filter(req => req.id !== requestToDelete));
        setRequestToDelete(null);
    }
  };

  const handleSendToAssistant = (request: PersonalRequest) => {
    const questions = getQuestionsForType(
        request.type === 'Travailleur' ? 'personal_worker' : 'personal_location',
        request.title
    );

    let detailMessage = `*Demande de service programmée*\n` +
        `*Type:* ${request.type}\n` +
        `*Objet:* ${request.title}\n\n` +
        `--- RÉPONSES ---\n`;

    questions.forEach(q => {
        const answer = request.rawAnswers?.[q.key];
        if (answer && (!q.condition || q.condition(request.rawAnswers || {}))) {
            detailMessage += `*${q.text(request.rawAnswers || {}).replace(/\?$/, '')}*: ${answer}\n`;
        }
    });

    if (request.totalPrice) {
        detailMessage += `\n*Frais de mise en relation:* ${request.totalPrice} FCFA (Valable 2 mois)\n`;
    }

    detailMessage += `\n--- INFORMATIONS CLIENT ---\n` +
        `*Nom:* ${user.name}\n` +
        `*Tél:* ${user.phone}\n` +
        `*Ville:* ${user.city}\n\n` +
        `ID de suivi: ${request.id.split('_')[1].slice(-4)}`;

    const event = new CustomEvent('trigger-chat-message', { detail: detailMessage });
    window.dispatchEvent(event);
  };

  const openModal = (type: 'Location' | 'Travailleur', subtype?: 'appartement' | 'equipement') => {
    setInteractiveContext({
        title: type === 'Location' ? (subtype === 'appartement' ? 'Demande appartement' : 'Demande équipement') : 'Demande travailleur',
        formType: type === 'Location' ? 'personal_location' : 'personal_worker',
        user: user,
        initialAnswers: type === 'Location' ? { locationType: subtype } : undefined
    });
    setIsMenuOpen(false);
  };

  const handleInteractiveComplete = (answers: Answers) => {
      if (!interactiveContext) return;
      const isWorker = interactiveContext.formType === 'personal_worker';
      
      let title = interactiveContext.title;
      let descParts = [];

      if (isWorker) {
          title = (answers['workerTitle'] as string) || 'Travailleur';
          if (answers['serviceType']) descParts.push(answers['serviceType']);
      } else {
          title = (answers['locationTitle'] as string) || (answers['apartmentTitle'] as string) || (answers['equipmentTitle'] as string) || (answers['locationType'] as string) || 'Location'; 
          if (answers['commune']) descParts.push(answers['commune']);
      }

      // Calcul des frais de mise en relation
      const price = calculateTotalPrice(interactiveContext.formType, answers, undefined, 1, title);

      const newRequest: PersonalRequest = {
          id: `req_${Date.now()}`,
          type: isWorker ? 'Travailleur' : 'Location',
          title: title,
          name: user.name,
          city: user.city,
          phone: user.phone,
          description: descParts.join(' • '),
          rawAnswers: answers,
          totalPrice: price
      };
      saveRequests([newRequest, ...requests]);
  };

  return (
    <div className="flex flex-col h-full bg-white text-slate-900 relative font-sans overflow-hidden">
      
      <header className="flex items-center justify-between p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-90 transition-all text-slate-900">
            <BackIcon className="h-7 w-7" />
        </button>
        
        <h1 className="text-sm font-black text-slate-900 uppercase tracking-widest text-center flex-1">
            Programmer des services
        </h1>
        
        <LogoSmall />
      </header>

      <main className="flex-1 p-6 overflow-y-auto pb-40 space-y-6 scrollbar-hide">
        {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <PlusIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-sm font-black uppercase tracking-widest text-gray-400">Aucune programmation</p>
                <p className="text-[10px] font-bold text-gray-300 mt-1 uppercase">Cliquez sur le bouton + pour commencer</p>
            </div>
        ) : (
            requests.map(req => (
                <RequestCard 
                    key={req.id} 
                    request={req} 
                    onDelete={(id) => setRequestToDelete(id)} 
                    onSend={handleSendToAssistant}
                />
            ))
        )}
      </main>

      {/* CONFIRMATION DIALOG (OUI / NON) */}
      {requestToDelete && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center border-t-4 border-red-500 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrashIcon className="w-7 h-7 text-red-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">Supprimer ?</h3>
                  <p className="text-sm text-gray-500 font-bold mb-8 leading-relaxed px-2">Souhaitez-vous vraiment effacer cette programmation ? Les données seront perdues.</p>
                  <div className="flex gap-4">
                      <button 
                        onClick={() => setRequestToDelete(null)}
                        className="flex-1 py-4 bg-gray-100 text-slate-600 font-black rounded-2xl text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all"
                      >
                        Non
                      </button>
                      <button 
                        onClick={handleConfirmDelete}
                        className="flex-1 py-4 bg-red-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all border-b-4 border-red-800"
                      >
                        Oui
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* FLOATING ACTION MENU BOTTOM-LEFT */}
      <div className="absolute bottom-28 left-6 z-40 flex flex-col items-start gap-3">
          {isMenuOpen && (
              <div className="flex flex-col gap-2 animate-in slide-in-from-bottom-4 duration-300">
                  <button 
                    onClick={() => openModal('Location', 'appartement')}
                    className="bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transform active:scale-95 transition-all border-b-4 border-blue-800"
                  >
                      <span>Appartement</span>
                  </button>
                  <button 
                    onClick={() => openModal('Location', 'equipement')}
                    className="bg-[#2E8B57] text-white px-5 py-3 rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transform active:scale-95 transition-all border-b-4 border-green-800"
                  >
                      <span>Équipement</span>
                  </button>
                  <button 
                    onClick={() => openModal('Travailleur')}
                    className="bg-orange-600 text-white px-5 py-3 rounded-2xl shadow-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transform active:scale-95 transition-all border-b-4 border-orange-800"
                  >
                      <span>Travailleur</span>
                  </button>
              </div>
          )}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all transform active:scale-90 border-4 border-white ${isMenuOpen ? 'bg-slate-900 rotate-45' : 'bg-orange-500'}`}
          >
            <PlusIcon className="w-8 h-8 text-white" />
          </button>
      </div>

      {interactiveContext && (
          <InteractiveModal 
            title={interactiveContext.title}
            formType={interactiveContext.formType}
            user={interactiveContext.user}
            onClose={() => setInteractiveContext(null)}
            onComplete={handleInteractiveComplete}
            initialAnswers={interactiveContext.initialAnswers}
          />
      )}
    </div>
  );
};

export default MyWorkerScreen;
