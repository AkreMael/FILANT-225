
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { databaseService } from '../services/databaseService';

interface ChatMessage {
  id?: string;
  sender: 'admin' | 'user';
  text: string;
  timestamp: number;
}

interface ChatScreenProps {
  currentUser: User;
  targetUser?: User; // Only for admin
  isAdmin: boolean;
  onBack: () => void;
}

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const SendIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9-7-9-7V7l11 5-11 5v-2z" /></svg>;

const QUICK_MESSAGES = [
  { label: 'BIENVENUE', text: "Bonjour ! Bienvenue chez Filan 225. Nous avons bien reçu votre formulaire. Votre profil est en cours de traitement. Merci de votre confiance !" },
  { label: 'VALIDATION', text: "Félicitations ! Votre inscription sur Filan 225 est validée. Vous faites officiellement partie de notre réseau. À très bientôt pour des opportunités !" },
  { label: 'CORRECTION', text: "Bonjour, certaines informations de votre formulaire sont incomplètes. Merci de nous préciser les détails manquants ici même dans cette messagerie." }
];

const ChatScreen: React.FC<ChatScreenProps> = ({ currentUser, targetUser, isAdmin, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatUserId = isAdmin && targetUser 
    ? `${targetUser.name}_${targetUser.phone.replace(/\D/g, '')}`
    : `${currentUser.name}_${currentUser.phone.replace(/\D/g, '')}`;

  const chatTitle = isAdmin && targetUser ? `Chat avec ${targetUser.name}` : "Message Privé (Filant 225)";

  useEffect(() => {
    let unsubscribe: any;
    
    const setupChat = async () => {
      setIsLoading(true);
      unsubscribe = await databaseService.onAdminChatUpdate(chatUserId, (msgs) => {
        setMessages(msgs);
        setIsLoading(false);
        
        // Mark messages from the other side as read
        const otherSide = isAdmin ? 'user' : 'admin';
        databaseService.markAdminMessagesAsRead(chatUserId, otherSide);
      });
    };

    setupChat();

    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [chatUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = textOverride || inputText.trim();
    if (!textToSend) return;

    const newMessage: ChatMessage = {
      sender: isAdmin ? 'admin' : 'user',
      text: textToSend,
      timestamp: Date.now()
    };

    if (!textOverride) setInputText('');
    await databaseService.saveAdminChatMessage(chatUserId, newMessage);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-300">
      <header className="bg-white border-b border-slate-200 p-4 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
        <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
          <BackIcon />
        </button>
        <div className="flex-1">
          <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest truncate">{chatTitle}</h2>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En ligne</span>
          </div>
        </div>
      </header>

      {isAdmin && (
        <div className="bg-white border-b border-slate-100 p-3 flex gap-2 overflow-x-auto scrollbar-hide sticky top-[73px] z-10 shadow-sm">
          {QUICK_MESSAGES.map((msg) => (
            <button
              key={msg.label}
              onClick={() => handleSendMessage(msg.text)}
              className="flex-shrink-0 px-4 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-colors active:scale-95 shadow-sm"
            >
              {msg.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chargement des messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px]">
              {isAdmin 
                ? "Envoyez un message privé à cet utilisateur pour démarrer la conversation."
                : "Bienvenue dans votre espace de discussion privée avec Filant 225. Posez vos questions ici !"}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = (isAdmin && msg.sender === 'admin') || (!isAdmin && msg.sender === 'user');
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                  isMe 
                    ? 'bg-orange-500 text-white rounded-tr-none' 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[9px] mt-1.5 font-bold uppercase tracking-widest ${isMe ? 'text-white/60' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200 sticky bottom-0">
        <div className="flex items-center gap-2 bg-slate-100 rounded-2xl p-2 shadow-inner">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Écrivez votre message..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-2 py-1 text-slate-800 placeholder:text-slate-400 font-medium"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-md ${
              inputText.trim() ? 'bg-orange-500 text-white active:scale-90' : 'bg-slate-200 text-slate-400'
            }`}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
