
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { databaseService } from '../services/databaseService';
import SpeakerIcon from './common/SpeakerIcon';
import Typewriter from './common/Typewriter';
import { ADMIN_PHONE } from '../utils/authUtils';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
  onShowPopup: (msg: string, type: 'alert') => void;
}

const Spinner = () => (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
);

const UserIcon: React.FC<{className: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const CityIcon: React.FC<{className: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>;
const PhoneIcon: React.FC<{className: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>;
const KeyIcon: React.FC<{className: string}> = ({className}) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" /></svg>;

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, onShowPopup }) => {
  const [isRegisterView, setIsRegisterView] = useState(true);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('filant_user_role');
    if (role === 'Admin 225') {
        setIsAdminRole(true);
        setIsRegisterView(false);
    }
  }, []);
  
  const handleRegister = async () => {
    const sanitizedPhone = phone.replace(/\s/g, '');
    
    if (name.trim() === '' || city.trim() === '' || !/^\d{10}$/.test(sanitizedPhone)) {
      onShowPopup("Veuillez remplir tous les champs correctement. Le numéro doit comporter 10 chiffres.", 'alert');
      return;
    }

    setIsLoading(true);
    setTimeout(async () => {
        const { user, error: registerError } = await databaseService.registerUser(name, city, sanitizedPhone);
        if (user) {
          onLoginSuccess(user);
        } else {
          onShowPopup(registerError || "Erreur lors de l'inscription.", 'alert');
        }
        setIsLoading(false);
    }, 2000);
  };

  const handleLogin = async () => {
    const sanitizedPhone = phone.replace(/\s/g, '');
    
    if (name.trim() === '' || !/^\d{10}$/.test(sanitizedPhone)) {
      onShowPopup("Veuillez entrer votre nom et un numéro à 10 chiffres.", 'alert');
      return;
    }

    if (isAdminRole) {
        if (
            name.trim().toLowerCase() !== 'mael' || 
            sanitizedPhone !== ADMIN_PHONE || 
            adminCode !== ADMIN_PHONE + '0102'
        ) {
            onShowPopup("Identifiants incorrects. Accès refusé.", 'alert');
            return;
        }
    }
    
    setIsLoading(true);
    setTimeout(async () => {
        const user = await databaseService.loginUser(name, sanitizedPhone);
        if (user) {
          onLoginSuccess(user);
        } else {
          if (isAdminRole) {
              onShowPopup("Erreur de connexion. Veuillez redémarrer l'application.", 'alert');
          } else {
              onShowPopup("Ce numéro n’est pas encore inscrit. Veuillez vous inscrire ou vérifier votre numéro pour vous connecter.", 'alert');
          }
        }
        setIsLoading(false);
    }, 2000);
  };

  const handleSubmit = () => {
    if (isRegisterView && !isAdminRole) {
      handleRegister();
    } else {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-500 to-indigo-900 p-4">
      <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 text-white border border-white/20">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              className="w-20 h-20 text-orange-500"
              aria-label="Icône animée d'un travailleur qui cherche"
            >
              <g fill="currentColor">
                <circle cx="50" cy="35" r="15" />
                <path d="M20,90 C20,70 80,70 80,90 Z" fillRule="nonzero" />
              </g>
              <g
                className="animate-worker-search text-green-500"
                stroke="currentColor"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
              >
                <circle cx="65" cy="65" r="12" />
                <line x1="75" y1="75" x2="88" y2="88" />
              </g>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FILANT°225</h1>
          {isAdminRole ? (
              <p className="text-sm font-bold mt-2 px-4 uppercase text-white bg-red-600 inline-block py-1 rounded">
                Connexion Administrateur
              </p>
          ) : isRegisterView ? (
              <div className="text-sm text-white/90 mt-2 px-4 font-medium">
                <Typewriter text="Inscrivez-vous pour profiter pleinement de nos services sur FILANT°225." speed={20} delay={500} />
              </div>
          ) : (
              <div className="text-sm text-white/90 mt-1 px-4 font-medium">
                <Typewriter text="Connectez-vous avec votre nom et numéro WhatsApp." speed={20} delay={500} />
              </div>
          )}
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-200" />
            <input 
                type="text" 
                placeholder="Nom" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full pl-10 pr-10 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:bg-white/30 transition-colors" 
                required 
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <SpeakerIcon text="Entrez votre nom" className="text-white" />
            </div>
          </div>
          
          {isRegisterView && !isAdminRole && (
            <div className="relative">
              <CityIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-200" />
              <input 
                type="text" 
                placeholder="Ville" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                className="w-full pl-10 pr-10 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:bg-white/30 transition-colors" 
                required 
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <SpeakerIcon text="Entrez votre ville" className="text-white" />
              </div>
            </div>
          )}
          
          <div className="relative">
            <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-200" />
            <div className="absolute left-10 top-1/2 -translate-y-1/2 text-gray-200 font-semibold select-none">
                +225
            </div>
            <input 
                type="tel" 
                placeholder="0102030405" 
                value={phone} 
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setPhone(val);
                }} 
                className="w-full pl-[4.5rem] pr-10 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:bg-white/30 transition-colors" 
                required 
                pattern="\d{10}"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <SpeakerIcon text="Entrez votre numéro WhatsApp à 10 chiffres" className="text-white" />
            </div>
          </div>

          {isAdminRole && (
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-200" />
              <input 
                type="password" 
                placeholder="Code Administrateur" 
                value={adminCode} 
                onChange={(e) => setAdminCode(e.target.value)} 
                className="w-full pl-10 pr-10 py-3 bg-white/20 border border-white/30 rounded-lg placeholder-gray-200 text-white focus:outline-none focus:bg-white/30 transition-colors" 
                required 
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <SpeakerIcon text="Entrez votre code administrateur" className="text-white" />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-3 px-4 rounded-xl shadow-lg flex items-center justify-center font-bold text-white transition-transform transform active:scale-95 bg-green-600 hover:bg-green-700 disabled:opacity-80 disabled:cursor-not-allowed min-h-[52px]"
            >
                {isLoading ? <Spinner /> : (isRegisterView && !isAdminRole ? 'S\'inscrire' : (isAdminRole ? 'Connexion Admin' : 'Se connecter'))}
            </button>
          </div>
        </form>
        
        {!isAdminRole && (
            <div className="text-center mt-4">
            <button onClick={() => { setIsRegisterView(!isRegisterView); }} className="text-sm font-medium text-white hover:text-gray-200 hover:underline transition-colors">
                {isRegisterView ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
            </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
