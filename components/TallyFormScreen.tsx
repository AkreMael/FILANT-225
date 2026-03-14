
import React from 'react';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>;

interface TallyFormScreenProps {
  formUrl: string;
  formTitle: string;
  onBack: () => void;
  hideVideoButton?: boolean;
}

const TallyFormScreen: React.FC<TallyFormScreenProps> = ({ formUrl, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white animate-in slide-in-from-bottom-full duration-1000 ease-out overflow-hidden">
      {/* Header minimaliste avec uniquement le bouton Retour */}
      <header className="p-4 bg-white flex items-center border-b border-gray-50">
        <button 
            onClick={onBack} 
            className="flex items-center gap-2 text-slate-900 font-black transition-all active:scale-90" 
            aria-label="Retour"
        >
            <BackIcon />
            <span className="text-sm uppercase tracking-widest">Retour</span>
        </button>
      </header>
      
      {/* Container de l'iframe */}
      <div className="flex-1 w-full h-full bg-white">
        <iframe
            src={formUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            title="Formulaire FILANT°225"
            loading="lazy"
            className="w-full h-full border-none outline-none"
            style={{ display: 'block', height: '100%' }}
        >
            Chargement du service...
        </iframe>
      </div>
    </div>
  );
};

export default TallyFormScreen;
