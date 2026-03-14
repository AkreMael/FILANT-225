
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const config = useMemo(() => {
        switch (registrationType) {
            case 'Propriétaire d’équipement':
                return {
                    title: "Inscription Propriétaire",
                    labelTitre: "Dénomination de l'équipement *",
                    placeholderTitre: "Ex: Sonorisation, Bâche, Podium...",
                    labelNom: "Nom du propriétaire ou gérant *",
                    labelRadio: "État actuel du matériel *",
                    radioOpt1: "Neuf",
                    radioOpt2: "Bon état",
                    photoLabel: "Photo de l'équipement"
                };
            case 'Agence immobilière':
                return {
                    title: "Inscription Agence",
                    labelTitre: "Nom de l'agence *",
                    placeholderTitre: "Ex: Agence Horizon, Immo Plus...",
                    labelNom: "Nom du responsable légal *",
                    labelRadio: "Domaine de spécialité *",
                    radioOpt1: "Location",
                    radioOpt2: "Vente / Gestion",
                    photoLabel: "Logo de l'agence"
                };
            case 'Entreprise':
                return {
                    title: "Inscription Entreprise",
                    labelTitre: "Raison sociale *",
                    placeholderTitre: "Ex: Filant BTP, Resto Mael...",
                    labelNom: "Nom du gérant ou directeur *",
                    labelRadio: "Secteur d'activité principal *",
                    radioOpt1: "Services",
                    radioOpt2: "Commerce / Industrie",
                    photoLabel: "Logo ou Façade de l'établissement"
                };
            default: 
                return {
                    title: "Inscription Travailleur",
                    labelTitre: "Intitulé du métier *",
                    placeholderTitre: "Ex: Maçon, Coiffeuse, Chauffeur...",
                    labelNom: "Nom et Prénoms *",
                    labelRadio: "Mode d'apprentissage / Expérience *",
                    radioOpt1: "Sur le tas",
                    radioOpt2: "Formation pro",
                    photoLabel: "Photo de profil professionnelle"
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
        photo: ''
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.titre || !formData.nomPrenom || !formData.ville || !formData.telephone || !formData.whatsapp || !formData.formation || !formData.naissance || !formData.photo) {
            setError("Veuillez renseigner tous les champs obligatoires et joindre une photo.");
            return;
        }
        setIsSubmitting(true);
        setError(null);
        
        setTimeout(async () => {
            try {
                const queryParams = new URLSearchParams();
                Object.entries(formData).forEach(([key, value]) => {
                    queryParams.append(key, value as string);
                });
                queryParams.append('typeInscription', registrationType);
                // Save to backend API
                await databaseService.saveRecruitment({
                    ...formData,
                    typeInscription: registrationType
                });

                // Keep the old script call as backup or remove it? 
                // The user wants to use their GCP project, so we prioritize our API.
                try {
                    await fetch(SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: queryParams.toString()
                    });
                } catch (e) {
                    console.warn("Google Apps Script backup failed, but GCP save succeeded", e);
                }

                setIsSuccess(true);
            } catch (err) {
                console.error("Erreur d'envoi:", err);
                setError("Une erreur est survenue lors de l'enregistrement de vos données.");
            } finally {
                setIsSubmitting(false);
            }
        }, 2000);
    };

    const handleAssistantRedirect = () => {
        const detailMessage = `*Nouvelle inscription via FILANT°225*\n\n` +
            `*Type:* ${registrationType}\n` +
            `*Objet:* ${formData.titre}\n` +
            `*Nom:* ${formData.nomPrenom}\n` +
            `*Ville:* ${formData.ville}\n` +
            `*Tél:* ${formData.telephone}\n` +
            `*WhatsApp:* ${formData.whatsapp}\n` +
            `*Date:* ${formData.naissance}\n` +
            `*Statut/Formation:* ${formData.formation}\n` +
            `*Email:* ${formData.gmail || 'Non communiqué'}\n\n` +
            `--- PAIEMENT REQUIS ---\n` +
            `Montant: 310 FCFA\n` +
            `Lien Wave: https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=310`;

        const event = new CustomEvent('trigger-chat-message', { detail: detailMessage });
        window.dispatchEvent(event);
    };

    if (isSuccess) {
        return (
            <div className="min-h-full w-full bg-slate-900 flex flex-col items-center justify-center p-6 animate-in slide-in-from-bottom-full duration-1000 ease-out">
                <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
                    <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckIcon />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Demande Transmise !</h2>
                    <p className="text-gray-700 leading-relaxed mb-4 text-sm">
                        L'inscription de <span className="font-bold text-slate-900">{formData.nomPrenom}</span> a bien été enregistrée.<br/>
                        Cliquez ci-dessous pour finaliser la procédure avec notre assistant.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-8 text-sm">
                        Pour valider votre mise en ligne, un paiement de <span className="font-bold text-red-600">310 FCFA</span> est requis.
                    </p>
                    <button 
                        onClick={handleAssistantRedirect} 
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-4 rounded-xl shadow-lg transition-transform transform active:scale-95 flex items-center justify-center gap-2 text-xs uppercase"
                    >
                        👉 Transmettre à l'Assistant FILANT°225
                    </button>
                    <button onClick={onBack} className="mt-4 text-gray-400 hover:text-gray-600 font-medium text-sm">
                        Retourner au menu principal
                    </button>
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[600] flex flex-col font-sans overflow-hidden"
        >
            <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden scrollbar-hide">
                <motion.div 
                    initial={{ y: -50, opacity: 0, scale: 1.1 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                    className="relative h-[200px] w-full flex-shrink-0"
                >
                    <img src={headerImage} alt="header" className="w-full h-full object-cover grayscale-[0.2]" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <button onClick={onBack} className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white active:scale-90 z-20">
                        <BackIcon />
                    </button>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                        <span className="text-white font-black text-xl tracking-tighter uppercase drop-shadow-lg">FILANT°225</span>
                    </div>
                    {!showVideo && (
                        <div className="absolute bottom-16 right-4 z-20">
                            <button 
                                onClick={() => setShowVideo(true)}
                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full shadow-lg transition-all transform active:scale-95"
                            >
                                <VideoTutorialIcon />
                                <span className="text-[10px] font-black uppercase tracking-widest">Vidéo</span>
                            </button>
                        </div>
                    )}
                </motion.div>

                <motion.div 
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex-1 bg-white rounded-t-[3rem] -mt-12 relative z-10 p-6 flex flex-col items-center"
                >
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full mb-6"></div>
                    
                    <div className="mb-6 flex flex-col items-center">
                        <h2 className="text-xl font-black text-black uppercase tracking-tight text-center">{config.title}</h2>
                        <div className="h-1 w-20 bg-orange-500 mt-1 rounded-full"></div>
                    </div>

                    <div className="w-full max-w-md mx-auto">
                        {showVideo ? (
                            <div className="p-4 h-full min-h-[500px]">
                                <InlineVideoPlayer onBack={() => setShowVideo(false)} />
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-0 space-y-6">
                                {error && <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl text-sm font-medium animate-pulse text-center">{error}</div>}

                                <div className="space-y-5">
                                    <div className="flex flex-col items-center">
                                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-40 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-orange-500 transition-colors">
                                            {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" alt="Aperçu photo" referrerPolicy="no-referrer" /> : (
                                                <>
                                                    <div className="bg-orange-500 p-2 rounded-full mb-2 shadow-lg transform group-hover:scale-110 transition-transform"><CameraIcon /></div>
                                                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-tight">{config.photoLabel}</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{config.labelTitre}</label>
                                        <input name="titre" value={formData.titre} onChange={handleChange} type="text" placeholder={config.placeholderTitre} className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all" required />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{config.labelNom}</label>
                                        <input name="nomPrenom" value={formData.nomPrenom} onChange={handleChange} type="text" placeholder="Nom et Prénoms complets" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all" required />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ville de résidence *</label>
                                            <input name="ville" value={formData.ville} onChange={handleChange} type="text" placeholder="Ex: Abidjan" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Téléphone *</label>
                                            <input name="telephone" value={formData.telephone} onChange={handleChange} type="tel" placeholder="0701020304" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-gray-800 placeholder-gray-300 focus:ring-2 focus:ring-orange-500 outline-none transition-all" required />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Numéro WhatsApp *</label>
                                        <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} type="tel" placeholder="Numéro WhatsApp (10 chiffres)" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none" required />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{registrationType === 'Travailleur' ? "Date de naissance" : "Date de création"} *</label>
                                        <input name="naissance" value={formData.naissance} onChange={handleChange} type="date" className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3.5 text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none transition-all" required />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{config.labelRadio}</label>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${formData.formation === config.radioOpt1 ? 'bg-orange-50 border-orange-400 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                <input type="radio" name="formation" value={config.radioOpt1} checked={formData.formation === config.radioOpt1} onChange={handleChange} className="hidden" />
                                                <span className="text-[10px] font-black uppercase">{config.radioOpt1}</span>
                                            </label>
                                            <label className={`flex items-center justify-center gap-2 p-3 rounded-xl cursor-pointer transition-all border ${formData.formation === config.radioOpt2 ? 'bg-orange-50 border-orange-400 text-white' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                <input type="radio" name="formation" value={config.radioOpt2} checked={formData.formation === config.radioOpt2} onChange={handleChange} className="hidden" />
                                                <span className="text-[10px] font-black uppercase">{config.radioOpt2}</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 pb-12">
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-80 uppercase tracking-widest text-xs min-h-[52px] flex items-center justify-center">
                                        {isSubmitting ? <Spinner /> : 'Confirmé'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default RegistrationFormScreen;
