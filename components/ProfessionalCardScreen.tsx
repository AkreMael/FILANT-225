import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { databaseService, CardData } from '../services/databaseService';
import { getCardType } from '../utils/authUtils';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, Check, Edit2, ArrowLeft, X, Loader2, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface ProfessionalCardScreenProps {
  user: User;
  onBack: () => void;
  onShowPopup?: (msg: string, type: 'alert' | 'confirm') => void;
}

const ProfessionalCardScreen: React.FC<ProfessionalCardScreenProps> = ({ user, onBack, onShowPopup }) => {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [profession, setProfession] = useState('');
  const [isEditingProfession, setIsEditingProfession] = useState(false);
  
  // Camera States
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const COMPANY_PHONE = '07 05 05 26 32';
  const cardType = getCardType(user.role);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    const data = databaseService.getCardData(user.phone, cardType);
    if (data) {
      setCardData(data);
      setProfession(data.profession || '');
    }
  }, [user.phone, cardType]);

  const handleSaveProfession = () => {
    if (!profession.trim()) return;
    
    const newData: CardData = {
      ...(cardData || { uploadTimestamp: Date.now() }),
      profession: profession.trim(),
      companyPhone: COMPANY_PHONE
    };
    databaseService.saveCardData(user.phone, newData, cardType);
    setCardData(newData);
    setIsEditingProfession(false);
  };

  useEffect(() => {
    if (showCamera && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [showCamera, stream]);

  const startCamera = async () => {
    const currentCount = cardData?.captureCount || 0;
    if (currentCount >= 2) {
      onShowPopup?.("Vous avez déjà intégré le maximum de photos autorisées.", "alert");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', 
          width: { ideal: 1920 }, 
          height: { ideal: 1080 } 
        } 
      });
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      onShowPopup?.("Impossible d'accéder à la caméra. Veuillez vérifier les permissions.", "alert");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const validateAndSavePhoto = async (base64Data: string, newCount: number) => {
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{
          parts: [
            { text: "Analyse cette image. Est-ce une photo claire du visage d'une personne ? Vérifie la visibilité, la luminosité (pas trop sombre) et la netteté (pas flou). Réponds UNIQUEMENT avec un objet JSON: { \"valid\": boolean }. Si l'image est trop sombre, floue ou si le visage n'est pas clair, valid doit être false." },
            { inlineData: { mimeType: "image/png", data: base64Data.split(',')[1] } }
          ]
        }],
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.valid) {
        const currentData = cardData || { uploadTimestamp: Date.now(), profession: '', companyPhone: COMPANY_PHONE };
        const newData: CardData = {
          ...currentData,
          imageData: base64Data,
          uploadTimestamp: Date.now(),
          captureCount: newCount
        };
        databaseService.saveCardData(user.phone, newData, cardType);
        setCardData(newData);
      } else {
        // Recharger les données précédentes si invalide
        const oldData = databaseService.getCardData(user.phone, cardType);
        setCardData(oldData);
        onShowPopup?.("Veuillez vous placer dans un endroit bien éclairé. Votre visage doit être clairement visible.", "alert");
      }
    } catch (err) {
      console.error("Validation error:", err);
      const oldData = databaseService.getCardData(user.phone, cardType);
      setCardData(oldData);
      onShowPopup?.("Erreur lors de la validation de la photo. Veuillez réessayer.", "alert");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // On veut un carré pour le cercle
      const size = Math.min(video.videoWidth, video.videoHeight);
      canvas.width = size;
      canvas.height = size;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dessiner le cercle (clip)
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        
        // Dessiner la vidéo centrée
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        
        // On inverse horizontalement pour le selfie
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
        
        ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        
        const base64Data = canvas.toDataURL('image/png');
        
        const newCount = (cardData?.captureCount || 0) + 1;

        // 1. Intégrer automatiquement dans la page (état local)
        setCardData(prev => ({
          ...(prev || { uploadTimestamp: Date.now(), profession: '', companyPhone: COMPANY_PHONE }),
          imageData: base64Data,
          captureCount: newCount
        }));
        
        // 2. Fermer la caméra
        stopCamera();
        
        // 3. Lancer l'analyse ensuite
        validateAndSavePhoto(base64Data, newCount);
      }
    }
  };

  const qrValue = `Métier: ${profession}\nNom: ${user.name}\nVille: ${user.city}\nNuméro: ${COMPANY_PHONE}`;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold uppercase tracking-wider">Carte Professionnelle</h1>
      </div>

      {/* Card Container */}
      <div className="bg-white rounded-xl overflow-hidden shadow-2xl text-slate-900 max-w-md mx-auto">
        {/* Top Section */}
        <div className="p-6 flex items-start gap-4 border-b border-slate-100">
          <div className="relative group">
            <div 
              className="w-24 h-24 rounded-full border-4 border-orange-500 overflow-hidden bg-slate-100 flex items-center justify-center cursor-pointer relative"
              onClick={startCamera}
            >
              {cardData?.imageData ? (
                <img src={cardData.imageData} alt="Profile" className={`w-full h-full object-cover ${isAnalyzing ? 'opacity-50 grayscale' : ''}`} referrerPolicy="no-referrer" />
              ) : (
                <Camera className="w-8 h-8 text-slate-400" />
              )}
              
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-orange-500 p-1.5 rounded-full border-2 border-white shadow-md">
              <Camera className="w-3 h-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1 pt-2">
            <p className="text-[10px] font-bold uppercase text-slate-500 leading-tight">
              veuillez me scanner pour nouvelle demande de mon service
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          {/* QR Code */}
          <div className="flex justify-center items-center bg-white p-2 border-2 border-slate-100 rounded-lg shrink-0">
            <QRCodeSVG value={qrValue} size={140} level="H" />
          </div>

          {/* Info Rows */}
          <div className="flex-1 space-y-3">
            {/* Métier */}
            <div className="bg-orange-500 text-white px-3 py-2 rounded flex items-center justify-between">
              <div className="flex-1 flex items-center gap-2 overflow-hidden">
                <span className="font-bold text-xs shrink-0">MÉTIER:</span>
                {isEditingProfession ? (
                  <input 
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="bg-white/20 border-none outline-none text-white px-1 py-0.5 rounded w-full text-xs"
                    placeholder="Votre métier"
                  />
                ) : (
                  <span className="font-medium text-xs truncate uppercase">{profession || '.........'}</span>
                )}
              </div>
              {!cardData?.profession && (
                <button 
                  onClick={() => isEditingProfession ? handleSaveProfession() : setIsEditingProfession(true)}
                  className="ml-2 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors"
                >
                  {isEditingProfession ? 'OK' : <Edit2 className="w-3 h-3" />}
                </button>
              )}
            </div>

            {/* Nom */}
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded flex items-center gap-2">
              <span className="font-bold text-xs text-slate-500">NOM:</span>
              <span className="font-bold text-xs uppercase">{user.name}</span>
            </div>

            {/* Ville */}
            <div className="bg-orange-500 text-white px-3 py-2 rounded flex items-center gap-2">
              <span className="font-bold text-xs">VILLE:</span>
              <span className="font-bold text-xs uppercase">{user.city}</span>
            </div>

            {/* Numéro */}
            <div className="bg-green-600 text-white px-3 py-2 rounded flex items-center justify-between">
              <div className="flex-1 flex items-center gap-2 overflow-hidden">
                <span className="font-bold text-xs shrink-0">NUMÉRO:</span>
                <span className="font-bold text-xs tracking-wider">{COMPANY_PHONE}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
          <div className="relative w-full h-full bg-slate-900 overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
            
            {/* Orange Overlay with Circular Cutout */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
              <div className="w-[300px] h-[300px] rounded-full border-4 border-white shadow-[0_0_0_2000px_rgba(249,115,22,0.8)] relative">
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.3)]"></div>
              </div>
            </div>
            
            {/* Overlay UI */}
            <div className="absolute inset-0 flex flex-col justify-between p-8 pointer-events-none">
              <div className="flex justify-between items-start pointer-events-auto">
                <button 
                  onClick={stopCamera}
                  className="p-4 bg-black/50 backdrop-blur-xl rounded-full text-white hover:bg-black/70 transition-all shadow-2xl"
                >
                  <X className="w-8 h-8" />
                </button>
                <div className="px-6 py-3 bg-black/50 backdrop-blur-xl rounded-full text-white text-xs font-black uppercase tracking-[0.2em] shadow-2xl border border-white/10">
                  Capture Visage Direct
                </div>
              </div>

              {/* Face Guide Label */}
              <div className="flex-1 flex items-center justify-center">
                <div className="w-[300px] h-[300px] relative pointer-events-none">
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                      Placez votre visage ici
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 pointer-events-auto pb-12">
                <div className="flex flex-col items-center gap-6">
                  <button 
                    onClick={capturePhoto}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)] active:scale-90 transition-all border-8 border-orange-500 group"
                  >
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                  </button>
                  <p className="text-white font-black text-[11px] text-center uppercase tracking-widest bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                    Assurez-vous d'être dans un endroit bien éclairé
                  </p>
                </div>
              </div>
            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 max-w-md mx-auto text-center">
        <p className="text-slate-400 text-sm italic">
          Cette carte est générée automatiquement car votre mise en relation est active.
        </p>
      </div>
    </div>
  );
};

export default ProfessionalCardScreen;
