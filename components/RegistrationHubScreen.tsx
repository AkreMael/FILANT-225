
import React, { useState } from 'react';
import SpeakerIcon from './common/SpeakerIcon';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const HelpIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm11.378-3.917c-.89-.777-2.366-.777-3.255 0a.75.75 0 01-.988-1.129c1.454-1.272 3.776-1.272 5.23 0 1.513 1.324 1.513 3.518 0 4.842a3.75 3.75 0 01-.837.552c-.676.328-1.028.774-1.028 1.152v.202a.75.75 0 01-1.5 0v-.202c0-.944.606-1.657 1.359-2.022.253-.122.482-.291.666-.452.923-.807.923-2.146 0-2.953zM12 15a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0v-.008A.75.75 0 0112 15z" clipRule="evenodd" />
    </svg>
);

const WorkerIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.67.38m-4.5-8.319v2.25m0-2.25V6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v2.25m0 2.25v2.25m0-2.25a2.185 2.185 0 01-1.383-.618m0 2.25c.194.165.42.295.67.38m0-2.25c.67.38.194.67.67.38" /></svg>;
const EquipmentIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.528-1.036.94-2.197 1.088-3.386l-.738-2.652L3 14l2.652.738c1.19.147 2.35.56 3.386 1.088l3.03-2.496z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 21.75l-4.135-4.134a1.21 1.21 0 010-1.707l4.134-4.135a1.21 1.21 0 011.707 0l4.135 4.135a1.21 1.21 0 010 1.707l-4.134 4.135a1.21 1.21 0 01-1.707 0z" /></svg>;
const AgencyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const CompanyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 11.25h6M9 15.75h6" /></svg>;

const registrationTypes = [
    { 
      type: 'Travailleur', 
      icon: <WorkerIcon />, 
      audioText: "Veuillez vous inscrire. Nous vous offrirons des services adaptés à votre talent, où que vous soyez. Que vous ayez un local ou non, si vous avez un métier et un talent, vous pouvez vous inscrire et décrire votre métier ainsi que votre talent pour que nous puissions trouver des clients pour vous. Avec Filan, vous êtes toujours joyeux et en sécurité, et vous ne manquerez jamais d’opportunités d’emploi."
    },
    { 
      type: 'Propriétaire d’équipement', 
      icon: <EquipmentIcon />, 
      audioText: "Veuillez inscrire votre équipement à la location. Nous trouverons des clients adaptés à votre équipement, où qu’il soit situé. Veuillez décrire le nom de votre équipement, et nous trouverons des clients pour votre disposition."
    },
    { 
      type: 'Agence immobilière', 
      icon: <AgencyIcon />, 
      audioText: "Veuillez vous inscrire. Nous trouverons des clients adaptés à la location de vos biens immobiliers. Décrivez votre propriété, et nous mettrons à disposition les clients idéaux."
    },
    { 
      type: 'Entreprise', 
      icon: <CompanyIcon />, 
      audioText: "Veuillez vous inscrire. Nous vous aiderons à trouver des services et des personnes adaptés aux besoins de votre entreprise. Décrivez votre activité, et nous vous mettrons en relation avec les bonnes personnes."
    },
];

interface RegistrationHubScreenProps {
  onSelectType: (type: string) => void;
  onBack: () => void;
}

const RegistrationHubScreen: React.FC<RegistrationHubScreenProps> = ({ onSelectType, onBack }) => {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="min-h-full w-full bg-gradient-to-br from-orange-500 to-indigo-900 p-4 font-sans text-white flex flex-col">
      <header className="flex items-center mb-6">
        <div className="flex items-center gap-2">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors focus:outline-none" aria-label="Retour">
              <BackIcon />
            </button>
            <button 
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-1 bg-white/90 hover:bg-white text-black px-2 py-1.5 rounded-full shadow-lg transition-transform transform hover:scale-105"
            >
                <HelpIcon className="w-4 h-4 text-black" />
                <span className="text-xs font-bold text-black">Aide</span>
            </button>
        </div>
        <h1 className="text-xl font-bold ml-auto flex-1 text-right">Type d'inscription</h1>
      </header>

      <div className="p-4 mb-6 text-center bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <p className="text-white/90">
          Inscrivez-vous pour accéder à notre large gamme de services.
          </p>
          <p className="mt-2 font-bold text-white text-lg">
          Fini le chômage !
          </p>
          <p className="text-white/80 text-sm">
          Inscrivez-vous pour devenir indépendant et saisir de nouvelles opportunités.
          </p>
      </div>

      <div className="space-y-4 flex-1">
          {registrationTypes.map(({ type, icon, audioText }) => (
          <div
              key={type}
              className="w-full p-0 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl shadow-lg backdrop-blur-sm flex items-stretch transition-transform transform hover:scale-105 overflow-hidden group"
          >
              <button
              onClick={() => onSelectType(type)}
              className="flex-1 p-4 flex items-center gap-4 text-left text-white focus:outline-none"
              >
                  <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-md flex-shrink-0 text-white">
                      {icon}
                  </div>
                  <span className="font-bold text-lg leading-tight">{type}</span>
              </button>

              <div className="w-16 flex items-center justify-center border-l border-white/20 bg-black/10 hover:bg-black/20 transition-colors">
                  <SpeakerIcon text={audioText} className="text-white hover:text-orange-300 w-10 h-10" />
              </div>
          </div>
          ))}
      </div>

      {showHelp && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white text-black rounded-2xl p-6 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button 
                    onClick={() => setShowHelp(false)} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-black transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                
                <div className="text-center">
                    <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                        <HelpIcon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h2 className="text-lg font-bold mb-1 leading-tight">Coût de mise en ligne d’inscription</h2>
                    <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide">Travailleur – Propriétaire – Agence</p>
                    
                    <div className="text-red-600 bg-orange-100 px-6 py-2 rounded-xl font-black text-3xl mb-5 inline-block border border-orange-200">
                        310 CFA
                    </div>
                    
                    <div className="text-sm text-gray-700 space-y-3 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p>Ce montant s’applique à chaque inscription.</p>
                        <p>Une fois activé, vous aurez accès à des services adaptés à votre talent et à votre expérience. trouver des emplois et des services rapidement gratuitement.</p>
                        <p className="font-bold text-black bg-yellow-50 p-2 rounded border border-yellow-100">
                            Suivi d’un paiement <span className="text-red-600 font-black">7100 CFA</span> par carte professionnelle de l’entreprise.
                        </p>
                    </div>
                </div>
                
                <button 
                    onClick={() => setShowHelp(false)} 
                    className="mt-6 w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg"
                >
                    Fermer
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationHubScreen;
