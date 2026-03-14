
import React from 'react';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

const INFO_CONTENT: Record<string, { title: string; image: string; text: string; points: string[]; showCartePro: boolean }> = {
    'Travailleur': {
        title: "TRAVAILLEURS QUALIFIÉS",
        image: "https://i.supaimg.com/17697fbb-4850-449b-8aae-1e5074f46e78.jpg",
        text: "Bonjour, donnez plus de visibilité à votre métier et trouvez plus de clients grâce à FILANT°225. Notre plateforme connecte votre talent directement avec des particuliers et entreprises qui recherchent votre expertise.",
        points: [
            "Visibilité accrue pour votre métier",
            "Contact direct avec des clients sérieux",
            "Gestion simplifiée de vos opportunités",
            "Frais d’inscription : 310 F CFA",
            "Accès prioritaire aux demandes locales"
        ],
        showCartePro: true
    },
    'Propriétaire d’équipement': {
        title: "PROMOTEURS D’ÉQUIPEMENTS",
        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000&auto=format&fit=crop",
        text: "Bonjour, optimisez la rentabilité de votre matériel en le proposant à la location sur FILANT°225. Nous mettons vos équipements en avant pour les événements et chantiers à travers le pays.",
        points: [
            "Mise en avant de votre catalogue",
            "Réservations facilitées via WhatsApp",
            "Réseau de clients vérifiés",
            "Frais d’inscription : 310 F CFA",
            "Sécurisation de vos locations"
        ],
        showCartePro: true
    },
    'Agence immobilière': {
        title: "AGENCES IMMOBILIÈRES",
        image: "https://i.supaimg.com/0014a601-381c-4384-ae46-8e5473703bc2.jpg",
        text: "Bonjour, donnez plus de visibilité et de crédibilité à votre agence immobilière grâce à la plateforme FILANT°225. Notre plateforme met votre agence en relation directe avec des clients qui recherchent des services immobiliers sérieux et fiables.",
        points: [
            "D’une visibilité accrue",
            "D’un contact direct avec les clients",
            "D’une présence professionnelle reconnue",
            "Frais d’inscription : 310 F CFA"
        ],
        showCartePro: true
    },
    'Entreprise': {
        title: "ENTREPRISES PARTENAIRES",
        image: "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1000&auto=format&fit=crop",
        text: "Bonjour, inscrivez votre entreprise pour accéder à un vivier de talents et de services logistiques de premier plan. FILANT°225 vous accompagne dans votre développement quotidien.",
        points: [
            "Accès aux meilleurs prestataires qualifiés",
            "Support logistique et location d’équipements",
            "Identité visuelle sur la plateforme",
            "Frais d’inscription : 310 F CFA",
            "Partenariats stratégiques durables"
        ],
        showCartePro: false
    }
};

const LOGO_URL = "https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png";

interface RegistrationInfoScreenProps {
    type: string;
    onBack: () => void;
    onNext: () => void;
}

const RegistrationInfoScreen: React.FC<RegistrationInfoScreenProps> = ({ type, onBack, onNext }) => {
    const content = INFO_CONTENT[type] || INFO_CONTENT['Travailleur'];
    const isCompany = type === 'Entreprise';

    return (
        <div className="min-h-full w-full bg-white flex flex-col font-sans animate-in slide-in-from-bottom-full duration-1000 ease-out">
            {/* Header Image - Only shown for Companies */}
            {isCompany ? (
                <div className="relative w-full h-[35vh] flex-shrink-0">
                    <img 
                        src={content.image} 
                        alt={type} 
                        className="w-full h-full object-cover" 
                        referrerPolicy="no-referrer"
                    />
                    <button 
                        onClick={onBack} 
                        className="absolute top-4 left-4 p-2 bg-white/40 backdrop-blur-md rounded-full text-black shadow-lg"
                    >
                        <BackIcon />
                    </button>
                </div>
            ) : (
                /* Simple navigation header when image is removed */
                <header className="p-4 flex items-center bg-white border-b border-gray-100 flex-shrink-0">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-black transition-colors">
                        <BackIcon />
                    </button>
                    <span className="ml-2 text-xs font-bold text-gray-400 uppercase tracking-widest">Retour</span>
                </header>
            )}

            {/* Content Area */}
            <main className={`flex-1 ${isCompany ? '-mt-6' : 'mt-2'} bg-white rounded-t-[2.5rem] p-6 shadow-2xl relative z-10 flex flex-col overflow-y-auto scrollbar-hide`}>
                
                {/* Title with Logo next to it */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <img 
                        src={LOGO_URL} 
                        alt="Logo FILANT" 
                        className="w-10 h-10 object-contain flex-shrink-0"
                        referrerPolicy="no-referrer"
                    />
                    <h1 className="text-orange-500 font-black text-xl sm:text-2xl uppercase tracking-tight text-center leading-tight">
                        {content.title}
                    </h1>
                </div>

                <div className="space-y-6 flex-1">
                    <p className="text-gray-800 font-bold leading-relaxed">
                        {content.text}
                    </p>

                    <div className="space-y-4">
                        <p className="font-black text-xs uppercase tracking-widest text-gray-400">
                            En vous inscrivant, vous bénéficiez :
                        </p>
                        <div className="space-y-3">
                            {content.points.map((point, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold mt-0.5">✔️</span>
                                    <span className="text-gray-700 font-bold text-sm leading-tight">{point}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bloc Carte Professionnelle Optionnel */}
                    {content.showCartePro && (
                        <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100 shadow-sm space-y-2">
                            <h3 className="text-blue-800 font-black text-sm uppercase flex items-center gap-2">
                                🔐 Carte professionnelle FILANT°225
                            </h3>
                            <p className="text-gray-700 text-xs font-bold leading-relaxed">
                                Après l’inscription, chaque utilisateur doit récupérer la carte professionnelle FILANT°225, indispensable pour valider et sécuriser son compte.
                            </p>
                            <p className="text-orange-600 font-black text-sm">
                                👉 Coût de la carte : 7 100 F CFA
                            </p>
                            <p className="text-gray-500 text-[10px] italic leading-tight">
                                Cette carte renforce la confiance des clients et confirme le statut professionnel sur la plateforme.
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                        <p className="text-xs text-gray-500 italic leading-relaxed">
                            Nous restons disponibles pour vous accompagner dans votre démarche de succès sur FILANT°225.
                        </p>
                    </div>
                </div>

                {/* Final Button */}
                <div className="pt-6 pb-4 flex justify-center">
                    <button 
                        onClick={onNext}
                        className="w-full max-w-xs bg-[#E31A32] hover:bg-red-700 text-white font-black py-3 rounded-xl shadow-lg transition-all transform active:scale-95 flex flex-col items-center justify-center gap-0"
                    >
                        <span className="text-base uppercase leading-tight">Inscrivez-vous</span>
                        <span className="text-[11px] opacity-90 leading-tight">310 F CFA</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default RegistrationInfoScreen;
