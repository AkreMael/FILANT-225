
import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { databaseService, StoredChatMessage } from '../services/databaseService';
import { audioService } from '../services/audioService';
import { Tab } from '../types';

const MessageIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.405 0 4.725.282 6.917.783 3.54.81 6.083 3.894 6.083 7.467 0 2.77-1.935 5.197-4.524 6.359a25.86 25.86 0 01-4.479 1.343.75.75 0 00-.449.374l-1.17 2.641a.75.75 0 01-1.329.124l-.987-1.878a.75.75 0 00-.512-.393c-1.692-.313-3.317-.786-4.876-1.406a8.25 8.25 0 01-4.919-6.338C1.192 7.135 3.033 4.263 4.848 2.771z" clipRule="evenodd" />
  </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.269.655 4.288 1.902 5.941l-1.442 5.253 5.354-1.405z" />
    </svg>
);

const WAVE_LOGO_URL = "https://i.supaimg.com/ff5dee1c-8ed5-426e-8fb7-eba013e98837.png";
const ASSISTANT_IMAGE_URL = "https://i.supaimg.com/5cd01a23-e101-4415-9e28-ff02a617cd11.png";

interface Message extends StoredChatMessage {
    paymentInfo?: { link: string; amount: string } | null;
    whatsAppPayload?: string;
}

interface ChatWidgetProps {
    userPhone: string;
    activeTab: Tab;
    currentMenuView: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ userPhone, activeTab, currentMenuView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const [position, setPosition] = useState({ bottom: '100px', left: '20px' });
  const [moveDuration, setMoveDuration] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) return;
    let timeoutId: any;
    const moveButton = () => {
        const paddingBottom = 100; 
        const paddingTop = 150; 
        const paddingX = 20;
        const frameW = Math.min(window.innerWidth, 480);
        const frameH = window.innerHeight;
        const randomY = Math.floor(Math.random() * (frameH - paddingTop - paddingBottom)) + paddingBottom;
        const randomX = Math.floor(Math.random() * (frameW - paddingX * 2 - 64)) + paddingX;
        const duration = Math.random() * 3 + 3; 
        setMoveDuration(duration);
        setPosition({ bottom: `${randomY}px`, left: `${randomX}px` });
        timeoutId = setTimeout(moveButton, (duration * 1000) + (Math.random() * 2000));
    };
    timeoutId = setTimeout(moveButton, 1000);
    return () => clearTimeout(timeoutId);
  }, [isOpen]);

  useEffect(() => {
    if (!userPhone) return;
    const history = databaseService.getChatHistory(userPhone);
    if (history.length > 0) setMessages(history);
    else resetChatWithWelcome();
  }, [userPhone]);

  const resetChatWithWelcome = () => {
    const welcomeMsg: Message = { 
        id: 'init-1', 
        text: 'Bonjour ! Je suis l\'assistant FILANT°225. Comment puis-je vous aider aujourd\'hui ?', 
        sender: 'ai',
        timestamp: Date.now()
    };
    setMessages([welcomeMsg]);
    databaseService.saveChatMessage(userPhone, welcomeMsg);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    const handleTrigger = (event: CustomEvent<string>) => {
      setIsOpen(true);
      handleSend(event.detail);
    };
    window.addEventListener('trigger-chat-message' as any, handleTrigger as any);
    return () => {
      window.removeEventListener('trigger-chat-message' as any, handleTrigger as any);
    };
  }, [userPhone]);

  const detectPrice = (text: string) => {
    // Nettoyage Markdown pour la détection
    const cleanText = text.replace(/[\*_]/g, '');

    // Priorité 1: Recherche explicite du Montant Total
    const totalMatch = cleanText.match(/Montant Total à Payer\s*[:]\s*(\d+)/i);
    if (totalMatch && parseInt(totalMatch[1]) > 0) {
        return {
            amount: totalMatch[1],
            link: `https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=${totalMatch[1]}`
        };
    }

    // Priorité 2: Recherche générique du libellé Montant
    const amountMatch = cleanText.match(/Montant\s*[:]\s*(\d+)/i);
    if (amountMatch && parseInt(amountMatch[1]) > 0) {
        return {
            amount: amountMatch[1],
            link: `https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=${amountMatch[1]}`
        };
    }

    // Priorité 3: Chiffre suivi de FCFA/CFA, mais à distance des ID de suivi
    // On ignore les chiffres seuls pour éviter de capturer l'ID
    const currencyMatch = cleanText.match(/(\d+)\s*(?:F|FCFA|CFA)/i);
    if (currencyMatch && parseInt(currencyMatch[1]) > 0 && !cleanText.includes(`ID de suivi: ${currencyMatch[1]}`)) {
        return {
            amount: currencyMatch[1],
            link: `https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=${currencyMatch[1]}`
        };
    }

    // Cas spécial Récupération de carte
    if (text.includes("récupération de carte") || text.includes("7100")) {
        return {
            amount: "7100",
            link: "https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount=7100"
        };
    }

    // Cas spécial Montant d'expédition (saisie manuelle)
    if (text.includes("Montant d’expédition")) {
        return {
            amount: "custom",
            link: "https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount="
        };
    }

    return null;
  };

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;

    let detected = detectPrice(textToSend);
    const isFormSubmission = textToSend.includes("Nouvelle demande via FILANT");
    const isCardRecovery = textToSend.includes("récupération de carte");
    
    const userMsg: Message = { 
        id: Date.now().toString(), 
        text: textToSend, 
        sender: 'user',
        timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    databaseService.saveChatMessage(userPhone, userMsg);
    setInput('');
    
    let aiResponseText = "";
    let isAILoading = false;

    if (isFormSubmission) {
        aiResponseText = "J'ai bien reçu votre demande. Voici le récapitulatif de votre commande. Veuillez procéder au paiement des frais de mise en relation via le bouton ci-dessous, puis cliquez sur 'Transmettre sur WhatsApp' pour finaliser avec un conseiller.";
    } else if (isCardRecovery) {
        aiResponseText = "C'est noté. Pour récupérer et intégrer votre carte FILANT°225, un paiement de 7 100 FCFA est requis. Veuillez utiliser le bouton de paiement ci-dessous, puis transmettez votre demande sur WhatsApp.";
    } else {
        setIsTyping(true);
        isAILoading = true;
        aiResponseText = await chatService.sendMessage(userMsg.text);
    }
    
    // Si aucun prix n'a été détecté dans le message utilisateur, on cherche dans la réponse de l'IA
    if (!detected) {
        detected = detectPrice(aiResponseText);
    }

    // Si c'est une demande de service/paiement mais toujours pas de prix, on met un montant libre (custom)
    const isPaymentRequest = isFormSubmission || 
        /paiement|payer|carte|renouvellement|commander|service|frais|tarif|prix/i.test(textToSend) ||
        /paiement|payer|carte|renouvellement|commander|service|frais|tarif|prix/i.test(aiResponseText);

    if (!detected && isPaymentRequest) {
        detected = {
            amount: "custom",
            link: "https://pay.wave.com/m/M_ci_jwxwatdcoKS8/c/ci/?amount="
        };
    }

    let whatsAppPayload = textToSend;
    if (detected && detected.amount !== "custom") {
        if (!whatsAppPayload.includes(`Montant Total à Payer: ${detected.amount}`)) {
            whatsAppPayload += `\n\n*Montant:* ${detected.amount} FCFA\n*Lien de paiement:* ${detected.link}`;
        }
    }

    const aiMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: aiResponseText, 
        sender: 'ai',
        timestamp: Date.now(),
        paymentInfo: detected, 
        whatsAppPayload: whatsAppPayload || aiResponseText // Fallback sur la réponse IA
    };

    setMessages(prev => [...prev, aiMsg]);
    databaseService.saveChatMessage(userPhone, aiMsg);
    
    if (isAILoading) {
        setIsTyping(false);
    }

    const textToSpeak = aiResponseText
        .replace(/(https?:\/\/[^\s]+)/g, '')
        .replace(/\n\s*\n/g, '\n')
        .trim();
    
    audioService.speak(textToSpeak);
  };

  const handleWhatsAppRedirect = (payload: string) => {
      const url = `https://wa.me/2250705052632?text=${encodeURIComponent(payload)}`;
      window.open(url, '_blank');
  };

  const handleOpenPaymentView = (paymentInfo: {link: string, amount: string}, messageText: string) => {
      // Détermination intelligente du titre pour l'affichage de confirmation
      let title = "Mise en relation";
      
      if (messageText.includes("récupération de carte")) title = "Récupération Carte Pro";
      else if (messageText.includes("régularisation de carte")) title = "Régularisation Carte Pro";
      else if (messageText.includes("expédition")) title = "Montant d’expédition";
      else {
          const titleMatch = messageText.match(/pour ([^.]+)/i);
          if (titleMatch) title = titleMatch[1].trim();
      }
      
      const event = new CustomEvent('trigger-payment-view', { 
          detail: { waveLink: paymentInfo.link, amount: paymentInfo.amount, title, paymentType: 'Service' } 
      });
      window.dispatchEvent(event);
      setIsOpen(false);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-50 group"
          style={{ bottom: position.bottom, left: position.left, transition: `all ${moveDuration}s ease-in-out` }}
        >
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-orange-800 translate-y-2"></div>
            <div className="relative w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg border-2 border-orange-300 overflow-hidden">
               <img src={ASSISTANT_IMAGE_URL} alt="Assistant" className="w-12 h-12 object-contain animate-pulse" referrerPolicy="no-referrer" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span></span>
          </div>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-20 left-4 right-4 z-50 h-[500px] max-h-[70vh] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-orange-500/30 overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="bg-orange-500 p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
               <MessageIcon className="w-5 h-5 text-white" />
               <h3 className="font-bold text-white uppercase text-sm">Assistant FILANT°225</h3>
            </div>
            <div className="flex gap-2">
                <button onClick={() => { databaseService.clearChatHistory(userPhone); setMessages([]); resetChatWithWelcome(); }} className="text-white/80 p-1"><TrashIcon className="w-5 h-5" /></button>
                <button onClick={() => setIsOpen(false)} className="text-white/80 p-1"><CloseIcon className="w-6 h-6" /></button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-hide">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-[13px] ${msg.sender === 'user' ? 'bg-orange-500 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none shadow-sm border border-gray-200'}`}>
                    {msg.text}
                    
                    {msg.sender === 'ai' && (msg.paymentInfo || msg.whatsAppPayload) && (
                        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                            {msg.paymentInfo && (
                                <button 
                                    onClick={() => handleOpenPaymentView(msg.paymentInfo!, msg.text)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <img 
                                        src="https://i.supaimg.com/0543a7e5-673b-44b9-9668-8152c5aea01b/756a216c-cba5-487d-8e2f-aa9312795945.png" 
                                        alt="Paiement" 
                                        className="w-6 h-6 object-contain" 
                                        referrerPolicy="no-referrer"
                                    />
                                    <span className="uppercase tracking-widest text-[12px]">
                                        {msg.paymentInfo.amount === 'custom' ? 'Payer' : `Payer – ${msg.paymentInfo.amount.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} F`}
                                    </span>
                                </button>
                            )}

                            {msg.whatsAppPayload && (
                                <button 
                                    onClick={() => handleWhatsAppRedirect(msg.whatsAppPayload!)} 
                                    className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-black py-4 px-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
                                >
                                    <WhatsAppIcon className="w-5 h-5" />
                                    <span className="uppercase tracking-widest text-[12px]">WhatsApp</span>
                                </button>
                            )}
                        </div>
                    )}
                  </div>
                </div>
            ))}
            {isTyping && <div className="flex justify-start"><div className="bg-white p-3 rounded-2xl shadow-sm"><div className="flex space-x-1"><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div><div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div></div></div></div>}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t flex items-center gap-2">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Votre demande ou montant..." className="flex-1 p-3 bg-gray-50 rounded-xl outline-none text-sm" />
            <button type="submit" className="p-3 bg-orange-500 text-white rounded-xl shadow-lg active:scale-95"><SendIcon className="w-6 h-6" /></button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
