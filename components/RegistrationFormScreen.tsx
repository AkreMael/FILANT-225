
import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { smsService } from '../services/smsService';
import { databaseService } from '../services/databaseService';
import InlineVideoPlayer from './common/InlineVideoPlayer';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const CheckIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const VideoTutorialIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white fill-current" viewBox="0 0 24 24">
        <path d="M8 5v14l11-7z" />
    </svg>
);

const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwUFMhA0knIMxi2t7OyqYfSO6N6pkicMXl7o9gx_Ve7nwpApJscgWaa7KZ3mmT8EnW4xg/exec';

interface RegistrationFormScreenProps {
    onBack: () => void;
    registrationType: string; 
}

const RegistrationFormScreen: React.FC<RegistrationFormScreenProps> = ({ onBack, registrationType }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const config = useMemo(() => {
        switch (registrationType) {
            case 'Propriétaire d’équipement':
                return {
                    title: "Inscription Propriétaire",
                    labelTitre: "Nom du Propriétaire *",
                    placeholderTitre: "👤 Filant mael",
                    labelVille: "Ville & Quartier actuels *",
                    placeholderVille: "🏕️",
                    labelRadio: "Type d'accessoires à louer *",
                    radioOpts: ["Bétonnière", "Électrogène", "Tentes", "Projecteur", "Sonorisation", "Mobilier", "Autres"],
                    showPrix: true,
                    labelPrix: "Prix de location par jour *",
                    showDescription: true,
                    price: 310
                };
            case 'Agence immobilière':
                return {
                    title: "Inscription Agence",
                    labelTitre: "Nom de l'agence *",
                    placeholderTitre: "Ex: Agence Horizon...",
                    labelNom: "Nom du responsable *",
                    placeholderNom: "👤 Nom du responsable",
                    labelVille: "Ville actuelle *",
                    placeholderVille: "🏕️",
                    labelRadio: "Services *",
                    radioOpts: ["Location (maisons/boutiques)", "Vente (terrains/immeubles)", "Gestion locative", "Autres"],
                    showZones: true,
                    labelZones: "Zones d'intervention (Facultatif)",
                    showDescription: true,
                    price: 310
                };
            case 'Entreprise':
                return {
                    title: "Inscription Entreprise",
                    labelTitre: "Nom de l'entreprise *",
                    placeholderTitre: "Ex: Filant BTP...",
                    labelNom: "Nom du propriétaire *",
                    placeholderNom: "👤 Nom du propriétaire",
                    labelVille: "Lieu *",
                    placeholderVille: "🏕️",
                    showPrix: true,
                    labelPrix: "Salaire proposé *",
                    showEmail: true,
                    labelEmail: "Email de l'entreprise *",
                    showDescription: true,
                    price: 310
                };
            default: 
                return {
                    title: "Inscription Travailleur",
                    labelNom: "Nom & Prénoms *",
                    placeholderNom: "👤 Filant mael",
                    labelTitre: "Titre du métier *",
                    placeholderTitre: "Ex: Maçon, Coiffeuse, Chauffeur...",
                    labelVille: "Ville actuelle *",
                    placeholderVille: "🏕️",
                    labelRadio: "Expérience *",
                    radioOpts: ["Appris sur le tas", "Nouveau (Formation)"],
                    labelWorkMode: "Mode d'exercice *",
                    workModeOpts: ["J'ai un local", "Travailleur ambulant"],
                    showBirthDate: true,
                    showEmail: true,
                    labelEmail: "Email (Gmail) *",
                    price: 310
                };
        }
    }, [registrationType]);

    const [formData, setFormData] = useState({
        titre: '',
        nomPrenom: '',
        ville: '',
        telephone: '',
        whatsapp: '',
        formation: '',
        naissance: '',
        gmail: '',
        domaine: '',
        local: '',
        adresse: '',
        categorie: '',
        prix: '',
        description: '',
        zones: ''
    });

    const headerImage = useMemo(() => {
        switch (registrationType) {
            case 'Propriétaire d’équipement': return "https://i.supaimg.com/03ee9f0b-9978-48aa-a0c1-a4ee2b0efb74.jpg";
            case 'Agence immobilière': return "https://i.supaimg.com/7dd280ea-2d80-472d-9997-d6c5b3d3c53c.jpg";
            case 'Entreprise': return "https://i.supaimg.com/dfdc8569-179f-4dc2-aeb9-e0757dfbc5cf.jpg";
            default: return "https://i.supaimg.com/ed09fd1b-87c1-4297-bab2-6f5e2f39baf0.jpg";
        }
    }, [registrationType]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isWorker = registrationType === 'Travailleur';
        const isAgency = registrationType === 'Agence immobilière';
        const isCompany = registrationType === 'Entreprise';
        const isEquipment = registrationType === 'Propriétaire d’équipement';

        let requiredFields = ['titre', 'ville', 'telephone', 'whatsapp'];
        
        if (isWorker) {
            requiredFields = [...requiredFields, 'nomPrenom', 'formation', 'local', 'naissance', 'gmail'];
        } else if (isAgency) {
            requiredFields = [...requiredFields, 'nomPrenom', 'formation'];
        } else if (isCompany) {
            requiredFields = [...requiredFields, 'nomPrenom', 'prix', 'gmail'];
        } else if (isEquipment) {
            requiredFields = [...requiredFields, 'prix'];
        }

        const missingFields = requiredFields.filter(f => !formData[f as keyof typeof formData]);
        if (missingFields.length > 0) {
            setError("Veuillez renseigner tous les champs obligatoires.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        console.log("Form submission started for:", registrationType);
        
        try {
            console.log("Preparing data for submission...");
            // Save to Firestore and Storage using the centralized service
            const result = await databaseService.saveRegistration(registrationType, {
                ...formData,
                typeInscription: registrationType,
                price: config.price
            });

            if (result.success) {
                console.log("Registration successful!");
                // Success! Show confirmation page
                setIsSuccess(true);
            } else {
                console.error("Registration failed:", result.error);
                setError("L'enregistrement a échoué. Veuillez vérifier votre connexion et réessayer.");
            }
        } catch (err) {
            console.error("Erreur d'envoi (catch):", err);
            setError("Une erreur inattendue est survenue. Veuillez réessayer plus tard.");
        } finally {
            console.log("Form submission process finished.");
            setIsSubmitting(false);
        }
    };

    const handleFinalConfirmation = () => {
        // 1. Send to Assistant
        const detailMessage = `*Nouvelle inscription via FILANT°225*\n\n` +
            `*Nom:* ${formData.nomPrenom || formData.titre}\n` +
            `*Service:* ${registrationType} (${formData.titre})\n` +
            `*Montant:* ${config.price} FCFA\n\n` +
            `*Ville:* ${formData.ville}\n` +
            `*Tél:* ${formData.telephone}\n` +
            `*WhatsApp:* ${formData.whatsapp}\n` +
            (formData.formation ? `*Catégorie:* ${formData.formation}\n` : '') +
            (formData.gmail ? `*Email:* ${formData.gmail}\n` : '') +
            (formData.description ? `*Description:* ${formData.description}\n` : '') +
            `\n--- PAIEMENT REQUIS ---\n` +
            `Lien Wave: https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=${config.price}`;

        const chatEvent = new CustomEvent('trigger-chat-message', { 
            detail: { 
                message: detailMessage,
                phone: formData.telephone,
                name: formData.nomPrenom || formData.titre
            } 
        });
        window.dispatchEvent(chatEvent);

        // 2. Trigger Payment View
        const paymentEvent = new CustomEvent('trigger-payment-view', {
            detail: {
                amount: config.price.toString(),
                title: `Inscription ${registrationType}`,
                paymentType: 'Inscription',
                waveLink: `https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=${config.price}`,
                onSuccess: () => {
                    console.log("Paiement réussi");
                }
            }
        });
        window.dispatchEvent(paymentEvent);
    };

    if (isSuccess) {
        return (
            <div className="min-h-full w-full bg-slate-900 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom-full duration-1000 ease-out">
                <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border border-white/10">
                    <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                        <CheckIcon />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">Inscription Réussie !</h2>
                    <p className="text-gray-600 leading-relaxed mb-8 text-sm font-medium">
                        Votre demande a été transmise avec succès. <br/><br/>
                        Pour finaliser votre opération et valider votre mise en ligne, veuillez confirmer votre inscription.
                    </p>
                    
                    <button 
                        onClick={handleFinalConfirmation} 
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 px-4 rounded-3xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                    >
                        Confirmer l'inscription - {config.price} CFA 🚀
                    </button>

                    <button onClick={onBack} className="mt-8 text-gray-400 hover:text-gray-600 font-black text-[10px] uppercase tracking-widest transition-colors">
                        Retourner au menu principal
                    </button>

                    <div className="mt-10 pt-8 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400 italic leading-tight px-4">
                            Rejoignez le réseau Filan 225 dès maintenant ! Donnez de la visibilité à vos compétences ou services et accédez à des opportunités garanties en un clic. Votre avenir professionnel commence ici.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-orange-500 z-[600] flex flex-col font-sans overflow-hidden"
        >
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide">
                <div className="p-6 flex flex-col items-center">
                    <button onClick={onBack} className="self-start p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 mb-4">
                        <BackIcon />
                    </button>
                    
                    <div className="flex flex-col items-center gap-2 mb-8">
                        <img 
                            src="https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png" 
                            alt="Logo" 
                            className="w-20 h-20 object-contain drop-shadow-xl"
                            referrerPolicy="no-referrer"
                        />
                        <span className="text-white font-black text-2xl tracking-tighter uppercase drop-shadow-lg">FILANT°225</span>
                    </div>

                    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-[3rem] p-8 shadow-2xl border border-white/20">
                        <div className="mb-8 flex flex-col items-center">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight text-center">{config.title}</h2>
                            <div className="h-1.5 w-24 bg-white mt-2 rounded-full shadow-sm"></div>
                        </div>

                        {showVideo ? (
                            <div className="p-4 h-full min-h-[500px]">
                                <InlineVideoPlayer onBack={() => setShowVideo(false)} />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium animate-pulse text-center">{error}</div>}

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelTitre}</label>
                                        <input name="titre" value={formData.titre} onChange={handleChange} type="text" placeholder={config.placeholderTitre} className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                    </div>

                                    {config.labelNom && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelNom}</label>
                                            <input name="nomPrenom" value={formData.nomPrenom} onChange={handleChange} type="text" placeholder={config.placeholderNom || "Nom complet"} className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelVille || "Ville *"}</label>
                                        <input name="ville" value={formData.ville} onChange={handleChange} type="text" placeholder={config.placeholderVille || "Ex: Abidjan"} className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Téléphone *</label>
                                            <input name="telephone" value={formData.telephone} onChange={handleChange} type="tel" placeholder="🇨🇮 SIM1" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">WhatsApp *</label>
                                            <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} type="tel" placeholder="🇨🇮 WhatsApp" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    </div>

                                    {config.labelRadio && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelRadio}</label>
                                            <div className="flex flex-wrap gap-3 mt-1">
                                                {config.radioOpts?.map((opt: string) => (
                                                    <label key={opt} className={`flex items-center justify-center gap-2 px-4 py-3 rounded-2xl cursor-pointer transition-all shadow-md ${formData.formation === opt ? 'bg-white text-orange-600 ring-4 ring-white/30' : 'bg-white/20 text-white border border-white/30'}`}>
                                                        <input type="radio" name="formation" value={opt} checked={formData.formation === opt} onChange={handleChange} className="hidden" />
                                                        <span className="text-[11px] font-black uppercase">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {config.labelWorkMode && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelWorkMode}</label>
                                            <div className="grid grid-cols-2 gap-3 mt-1">
                                                {config.workModeOpts?.map((opt: string) => (
                                                    <label key={opt} className={`flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer transition-all shadow-md ${formData.local === opt ? 'bg-white text-orange-600 ring-4 ring-white/30' : 'bg-white/20 text-white border border-white/30'}`}>
                                                        <input type="radio" name="local" value={opt} checked={formData.local === opt} onChange={handleChange} className="hidden" />
                                                        <span className="text-[11px] font-black uppercase">{opt}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {config.showPrix && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelPrix}</label>
                                            <input name="prix" value={formData.prix} onChange={handleChange} type="text" placeholder="Ex: 5000 FCFA" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

                                    {config.showBirthDate && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Date de naissance *</label>
                                            <input name="naissance" value={formData.naissance} onChange={handleChange} type="date" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

                                    {config.showEmail && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelEmail || "Email *"}</label>
                                            <input name="gmail" value={formData.gmail} onChange={handleChange} type="email" placeholder="votre@email.com" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

                                    {config.showZones && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelZones}</label>
                                            <input name="zones" value={formData.zones} onChange={handleChange} type="text" placeholder="Ex: Cocody, Plateau..." className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" />
                                        </div>
                                    )}

                                    {config.showDescription && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Description (facultatif)</label>
                                            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Plus de détails..." className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md min-h-[100px] resize-none" />
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6">
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-black hover:bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl transition-all transform active:scale-95 disabled:opacity-80 uppercase tracking-widest text-sm min-h-[60px] flex items-center justify-center gap-3">
                                        {isSubmitting ? <Spinner /> : (
                                            <>
                                                <span>Valider l'inscription 🚀</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <p className="text-[10px] text-white/60 italic leading-tight text-center px-4">
                                        Rejoignez le réseau Filan 225 dès maintenant ! Donnez de la visibilité à vos compétences ou services et accédez à des opportunités garanties en un clic. Votre avenir professionnel commence ici.
                                    </p>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RegistrationFormScreen;
