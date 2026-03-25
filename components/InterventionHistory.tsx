import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { databaseService } from '../services/databaseService';
import { Intervention, User } from '../types';
import { LucideHistory, LucideCheckCircle, LucideXCircle, LucideClock, LucideChevronRight } from 'lucide-react';

interface InterventionHistoryProps {
  user: User;
  onBack: () => void;
}

const InterventionHistory: React.FC<InterventionHistoryProps> = ({ user, onBack }) => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterventions = async () => {
      if (user.phone) {
        const data = await databaseService.getInterventions(user.phone, user.role || 'Client');
        setInterventions(data);
      }
      setLoading(false);
    };

    fetchInterventions();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <LucideCheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled': return <LucideXCircle className="w-5 h-5 text-red-500" />;
      default: return <LucideClock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return 'En cours';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <LucideChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Historique des interventions</h1>
        <div className="w-10" />
      </header>

      <main className="p-4 max-w-2xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Chargement de l'historique...</p>
          </div>
        ) : interventions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
              <LucideHistory className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Aucune intervention</h2>
              <p className="text-slate-500">Vous n'avez pas encore d'historique d'interventions.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {interventions.map((intervention) => (
              <motion.div
                key={intervention.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    intervention.status === 'completed' ? 'bg-green-50' : 
                    intervention.status === 'cancelled' ? 'bg-red-50' : 'bg-orange-50'
                  }`}>
                    {getStatusIcon(intervention.status)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{intervention.workerName}</h3>
                    <p className="text-sm text-slate-500">{intervention.serviceType}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(intervention.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{intervention.price ? `${intervention.price} F` : 'N/A'}</p>
                  <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
                    intervention.status === 'completed' ? 'text-green-600' : 
                    intervention.status === 'cancelled' ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    {getStatusText(intervention.status)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default InterventionHistory;
