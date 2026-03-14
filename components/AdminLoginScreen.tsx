
import React, { useState } from 'react';
import SpeakerIcon from './common/SpeakerIcon';
import { ADMIN_PHONE } from '../utils/authUtils';

interface AdminLoginScreenProps {
  onSuccess: () => void;
  onBack: () => void;
  onShowPopup: (msg: string, type: 'alert' | 'confirm') => void;
}

const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({ onSuccess, onBack, onShowPopup }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
        if (code === ADMIN_PHONE) {
            onSuccess();
        } else {
            onShowPopup("Code d'accès incorrect. Veuillez réessayer.", 'alert');
            setCode('');
        }
        setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
            <h1 className="text-2xl font-bold text-white text-center mb-2">Sécurité Admin</h1>
            <p className="text-gray-400 text-center mb-6 text-sm">Veuillez entrer le code d'accès administrateur.</p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                     <label className="block mb-2 text-sm font-medium text-white flex items-center justify-center gap-2">
                        Code d'accès
                        <SpeakerIcon text="Entrez le code d'accès" className="text-white" />
                    </label>
                    <input 
                        type="password" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={code} 
                        onChange={(e) => setCode(e.target.value)} 
                        className="w-full text-center text-2xl tracking-widest p-4 bg-slate-900 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-gray-600"
                        placeholder="••••••••••"
                    />
                </div>
                
                <div className="flex gap-4">
                     <button type="button" onClick={onBack} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-gray-600 hover:bg-gray-700 transition-colors">
                        Retour
                    </button>
                    <button type="submit" disabled={isLoading} className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-transform transform hover:scale-105 shadow-lg flex items-center justify-center min-h-[52px]">
                        {isLoading ? <Spinner /> : 'Valider'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default AdminLoginScreen;
