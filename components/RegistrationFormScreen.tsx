
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
                    labelTitre: "Nom du Propriétaire *",
                    placeholderTitre: "👤 Filant mael",
                    labelVille: "Ville / Quartier actuelle *",
                    placeholderVille: "🏕️",
                    labelRadio: "Type d'accessoires à louer *",
                    radioOpts: ["Bétonnière", "Électrogène", "Tentes", "Projecteur", "Sonorisation", "Mobilier", "Autres"],
                    photoLabel: "Ajouter 3 images de votre article *",
                    showPrix: true,
                    labelPrix: "Prix de location 1 jour *",
                    showDescription: true,
                    showMultiplePhotos: true,
                    price: 310
                };
            case 'Agence immobilière':
                return {
                    title: "Inscription Agence",
                    labelTitre: "Nom de l'agence *",
                    placeholderTitre: "Ex: Agence Horizon...",
                    labelVille: "Ville / Quartier actuelle *",
                    placeholderVille: "🏕️",
                    labelRadio: "Type de service *",
                    radioOpts: ["Vente de terrains", "Location d'appartements", "Gestion immobilière", "Autres"],
                    photoLabel: "Logo ou image de l'agence *",
                    showDescription: true,
                    price: 510
                };
            case 'Entreprise':
                return {
                    title: "Inscription Entreprise",
                    labelTitre: "Nom de l'entreprise *",
                    placeholderTitre: "Ex: Filant BTP...",
                    labelVille: "Ville / Quartier actuelle *",
                    placeholderVille: "🏕️",
                    labelRadio: "Secteur d'activité *",
                    radioOpts: ["Services", "Commerce", "Industrie", "Autres"],
                    photoLabel: "Logo ou image de l'entreprise *",
                    showDescription: true,
                    price: 1010
                };
            default: 
                return {
                    title: "Inscription Travailleur",
                    labelNom: "Nom complet *",
                    placeholderNom: "👤 Filant mael",
                    labelTitre: "Métier / Compétence *",
                    placeholderTitre: "Ex: Maçon, Coiffeuse, Chauffeur...",
                    labelVille: "Ville / Quartier actuelle *",
                    placeholderVille: "🏕️",
                    photoLabel: "Photo de profil professionnelle *",
                    showDescription: true,
                    price: 210
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
        photo: '',
        photo2: '',
        photo3: '',
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string = 'photo') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isWorker = registrationType === 'Travailleur';
        const requiredFields = isWorker 
            ? ['titre', 'nomPrenom', 'ville', 'telephone', 'whatsapp', 'photo']
            : ['titre', 'ville', 'telephone', 'whatsapp', 'photo'];

        const missingFields = requiredFields.filter(f => !formData[f as keyof typeof formData]);
        if (missingFields.length > 0) {
            setError("Veuillez renseigner tous les champs obligatoires et joindre vos pièces justificatives.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        
        try {
            if (isWorker) {
                // Save to worker_registrations collection
                await databaseService.saveWorkerRegistration({
                    ...formData,
                    jobTitle: formData.titre,
                    fullName: formData.nomPrenom,
                    city: formData.ville,
                    phone: formData.telephone,
                    whatsapp: formData.whatsapp,
                    email: formData.gmail,
                    description: formData.description,
                    photo: formData.photo,
                    typeInscription: registrationType,
                    price: config.price
                });
            } else {
                // Save to recruitments collection
                await databaseService.saveRecruitment({
                    ...formData,
                    typeInscription: registrationType,
                    price: config.price,
                    createdAt: new Date().toISOString()
                });
            }

            // Keep the old script call as backup
            try {
                const queryParams = new URLSearchParams();
                Object.entries(formData).forEach(([key, value]) => {
                    queryParams.append(key, value as string);
                });
                queryParams.append('typeInscription', registrationType);
                await fetch(SCRIPT_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: queryParams.toString()
                });
            } catch (e) {
                console.warn("Google Apps Script backup failed", e);
            }

            // Trigger payment view
            const paymentEvent = new CustomEvent('trigger-payment-view', {
                detail: {
                    amount: config.price,
                    description: `Inscription ${registrationType} - ${formData.nomPrenom || formData.titre}`,
                    onSuccess: () => {
                        setIsSuccess(true);
                    }
                }
            });
            window.dispatchEvent(paymentEvent);
        } catch (err) {
            console.error("Erreur d'envoi:", err);
            setError("Une erreur est survenue lors de l'enregistrement de vos données.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssistantRedirect = () => {
        const detailMessage = `*Nouvelle inscription via FILANT°225*\n\n` +
            `*Type:* ${registrationType}\n` +
            `*Objet:* ${formData.titre}\n` +
            (formData.nomPrenom ? `*Nom:* ${formData.nomPrenom}\n` : '') +
            `*Ville:* ${formData.ville}\n` +
            `*Tél:* ${formData.telephone}\n` +
            `*WhatsApp:* ${formData.whatsapp}\n` +
            (formData.prix ? `*Prix:* ${formData.prix}\n` : '') +
            (formData.formation ? `*Catégorie:* ${formData.formation}\n` : '') +
            (formData.gmail ? `*Email:* ${formData.gmail}\n` : '') +
            (formData.description ? `*Description:* ${formData.description}\n` : '') +
            `\n--- PAIEMENT REQUIS ---\n` +
            `Montant: ${config.price} FCFA\n` +
            `Lien Wave: https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=${config.price}`;

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
                        L'inscription de <span className="font-bold text-slate-900">{formData.nomPrenom || formData.titre}</span> a bien été enregistrée.<br/>
                        Cliquez ci-dessous pour finaliser la procédure avec notre assistant.
                    </p>
                    <p className="text-gray-700 leading-relaxed mb-8 text-sm">
                        Pour valider votre mise en ligne, un paiement de <span className="font-bold text-red-600">{config.price} FCFA</span> est requis.
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
                                    <div className="flex flex-col items-center">
                                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-44 bg-white rounded-3xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-white transition-colors shadow-inner">
                                            {formData.photo ? <img src={formData.photo} className="w-full h-full object-cover" alt="Aperçu photo" referrerPolicy="no-referrer" /> : (
                                                <>
                                                    <div className="bg-orange-500 p-3 rounded-full mb-3 shadow-lg transform group-hover:scale-110 transition-transform"><CameraIcon /></div>
                                                    <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest text-center px-4">{config.photoLabel}</span>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                                    </div>

                                    {config.showMultiplePhotos && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div onClick={() => document.getElementById('photo2')?.click()} className="w-full h-32 bg-white rounded-3xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative shadow-inner">
                                                {formData.photo2 ? <img src={formData.photo2} className="w-full h-full object-cover" alt="Photo 2" referrerPolicy="no-referrer" /> : (
                                                    <span className="text-[10px] text-gray-400 font-black uppercase">Image 2</span>
                                                )}
                                                <input id="photo2" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo2')} />
                                            </div>
                                            <div onClick={() => document.getElementById('photo3')?.click()} className="w-full h-32 bg-white rounded-3xl border-2 border-dashed border-orange-200 flex flex-col items-center justify-center cursor-pointer overflow-hidden relative shadow-inner">
                                                {formData.photo3 ? <img src={formData.photo3} className="w-full h-full object-cover" alt="Photo 3" referrerPolicy="no-referrer" /> : (
                                                    <span className="text-[10px] text-gray-400 font-black uppercase">Image 3</span>
                                                )}
                                                <input id="photo3" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo3')} />
                                            </div>
                                        </div>
                                    )}

                                    {config.labelNom && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelNom}</label>
                                            <input name="nomPrenom" value={formData.nomPrenom} onChange={handleChange} type="text" placeholder={config.placeholderNom || "Nom complet"} className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelVille || "Ville *"}</label>
                                            <input name="ville" value={formData.ville} onChange={handleChange} type="text" placeholder={config.placeholderVille || "Ex: Abidjan"} className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Téléphone *</label>
                                            <input name="telephone" value={formData.telephone} onChange={handleChange} type="tel" placeholder="🇨🇮 SIM1" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">WhatsApp *</label>
                                        <input name="whatsapp" value={formData.whatsapp} onChange={handleChange} type="tel" placeholder="🇨🇮 Contact°WhatsApp" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelTitre}</label>
                                        <input name="titre" value={formData.titre} onChange={handleChange} type="text" placeholder={config.placeholderTitre} className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                    </div>

                                    {config.showEmail && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Email *</label>
                                            <input name="gmail" value={formData.gmail} onChange={handleChange} type="email" placeholder="votre@email.com" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

                                    {config.showPrix && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">{config.labelPrix}</label>
                                            <input name="prix" value={formData.prix} onChange={handleChange} type="text" placeholder="Ex: 5000 FCFA" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
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

                                    {registrationType === 'Travailleur' && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Domaine *</label>
                                            <input name="domaine" value={formData.domaine} onChange={handleChange} type="text" placeholder="Ex: Bâtiment, Beauté..." className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold placeholder-gray-300 focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

                                    {registrationType === 'Travailleur' && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Date de naissance *</label>
                                            <input name="naissance" value={formData.naissance} onChange={handleChange} type="date" className="w-full bg-white border-none rounded-2xl p-4 text-green-600 font-bold focus:ring-4 focus:ring-white/50 outline-none transition-all shadow-md" required />
                                        </div>
                                    )}

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

                                    {registrationType === 'Travailleur' && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[11px] font-black text-black uppercase tracking-widest ml-1">Avez-vous un local professionnel ? *</label>
                                            <div className="grid grid-cols-2 gap-3 mt-1">
                                                <label className={`flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer transition-all shadow-md ${formData.local === 'OUI' ? 'bg-white text-orange-600 ring-4 ring-white/30' : 'bg-white/20 text-white border border-white/30'}`}>
                                                    <input type="radio" name="local" value="OUI" checked={formData.local === 'OUI'} onChange={handleChange} className="hidden" />
                                                    <span className="text-[11px] font-black uppercase">OUI</span>
                                                </label>
                                                <label className={`flex items-center justify-center gap-2 p-4 rounded-2xl cursor-pointer transition-all shadow-md ${formData.local === 'NON' ? 'bg-white text-orange-600 ring-4 ring-white/30' : 'bg-white/20 text-white border border-white/30'}`}>
                                                    <input type="radio" name="local" value="NON" checked={formData.local === 'NON'} onChange={handleChange} className="hidden" />
                                                    <span className="text-[11px] font-black uppercase">NON</span>
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 pb-12">
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-black hover:bg-slate-900 text-white font-black py-5 rounded-3xl shadow-2xl transition-all transform active:scale-95 disabled:opacity-80 uppercase tracking-widest text-sm min-h-[60px] flex items-center justify-center gap-3">
                                        {isSubmitting ? <Spinner /> : (
                                            <>
                                                <span>Confirmer l'inscription</span>
                                                <span className="bg-white/20 px-2 py-1 rounded-lg text-[10px]">{config.price} FCFA</span>
                                            </>
                                        )}
                                    </button>
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
