import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { databaseService } from '../services/databaseService';
import { Availability, User } from '../types';
import { LucideCalendar, LucideClock, LucideCheckCircle, LucideChevronRight, LucideSave, LucideAlertCircle } from 'lucide-react';

interface AvailabilityCalendarProps {
  user: User;
  onBack: () => void;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ user, onBack }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  const timeSlots = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"
  ];

  useEffect(() => {
    const fetchAvailability = async () => {
      if (user.phone && selectedDate) {
        setLoading(true);
        const data = await databaseService.getAvailability(user.phone, selectedDate);
        setAvailability(data);
        setSelectedSlots(data?.slots || []);
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [user.phone, selectedDate]);

  const toggleSlot = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleSave = async () => {
    if (!user.phone || !selectedDate) return;

    setSaving(true);
    const newAvailability: Availability = {
      id: `${user.phone}_${selectedDate}`,
      workerId: user.phone,
      date: selectedDate,
      slots: selectedSlots
    };

    const result = await databaseService.updateAvailability(newAvailability);
    if (result.success) {
      setAvailability(newAvailability);
      alert("Disponibilités mises à jour avec succès !");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <LucideChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Calendrier de disponibilité</h1>
        <div className="w-10" />
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <LucideCalendar className="w-5 h-5" />
            <h2 className="font-bold">Choisir une date</h2>
          </div>
          <input
            type="date"
            value={selectedDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 font-bold"
          />
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-blue-600">
              <LucideClock className="w-5 h-5" />
              <h2 className="font-bold">Créneaux horaires</h2>
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {selectedSlots.length} sélectionné(s)
            </span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot) => {
                const isSelected = selectedSlots.includes(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => toggleSlot(slot)}
                    className={`py-3 rounded-xl font-bold transition-all border-2 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100'
                        : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200'
                    }`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-2xl flex items-start space-x-3">
            <LucideAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Sélectionnez les heures auxquelles vous êtes disponible pour recevoir des interventions. 
              Les clients pourront réserver ces créneaux directement.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
              saving || loading
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white shadow-lg shadow-blue-200 active:scale-95'
            }`}
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LucideSave className="w-5 h-5" />
                <span>Enregistrer mes disponibilités</span>
              </>
            )}
          </button>
        </div>

        {availability && availability.slots.length > 0 && (
          <div className="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <LucideCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-900">Disponibilité confirmée</h3>
              <p className="text-sm text-green-700">Vos créneaux pour le {new Date(selectedDate).toLocaleDateString('fr-FR')} sont à jour.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AvailabilityCalendar;
