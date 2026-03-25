import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { databaseService } from '../services/databaseService';
import { Review, User, Worker } from '../types';
import { LucideStar, LucideMessageSquare, LucideSend, LucideChevronRight, LucideUser, LucideCalendar } from 'lucide-react';

interface ReviewSystemProps {
  user: User;
  worker?: Worker;
  onBack: () => void;
}

const ReviewSystem: React.FC<ReviewSystemProps> = ({ user, worker, onBack }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      const targetId = worker?.id || (user.role !== 'Client' ? user.phone : null);
      if (targetId) {
        const data = await databaseService.getReviews(targetId);
        setReviews(data);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [worker, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !worker?.id || !user.phone) return;

    setSubmitting(true);
    const newReview: Omit<Review, 'id'> = {
      userId: user.phone,
      userName: user.name,
      workerId: worker.id,
      rating,
      comment,
      createdAt: new Date().toISOString()
    };

    const result = await databaseService.addReview(newReview);
    if (result.success) {
      setReviews([{ id: result.id!, ...newReview }, ...reviews]);
      setRating(0);
      setComment('');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 p-4 sticky top-0 z-10 flex items-center justify-between">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <LucideChevronRight className="w-6 h-6 rotate-180" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">Avis et notations</h1>
        <div className="w-10" />
      </header>

      <main className="p-4 max-w-2xl mx-auto space-y-6">
        {worker && (
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
              {worker.profileImageUrl ? (
                <img src={worker.profileImageUrl} alt={worker.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <LucideUser className="w-8 h-8 text-blue-600" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{worker.name}</h2>
              <p className="text-slate-500">{worker.category}</p>
              <div className="flex items-center mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <LucideStar
                    key={s}
                    className={`w-4 h-4 ${s <= worker.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                  />
                ))}
                <span className="ml-2 text-sm font-bold text-slate-700">{worker.rating}</span>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'avis */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Laisser un avis</h3>
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setRating(s)}
                className="p-1 transition-transform active:scale-90"
              >
                <LucideStar
                  className={`w-8 h-8 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-h-[100px] text-slate-700"
          />
          <button
            onClick={handleSubmit}
            disabled={rating === 0 || submitting}
            className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all ${
              rating === 0 || submitting
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 text-white shadow-lg shadow-blue-200 active:scale-95'
            }`}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LucideSend className="w-5 h-5" />
                <span>Envoyer mon avis</span>
              </>
            )}
          </button>
        </div>

        {/* Liste des avis */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Avis des clients ({reviews.length})</h3>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-slate-100">
              <LucideMessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-2" />
              <p className="text-slate-400">Aucun avis pour le moment.</p>
            </div>
          ) : (
            reviews.map((review) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                      <LucideUser className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-bold text-slate-900">{review.userName}</span>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <LucideStar
                        key={s}
                        className={`w-3 h-3 ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                <div className="flex items-center text-[10px] text-slate-400 space-x-1">
                  <LucideCalendar className="w-3 h-3" />
                  <span>
                    {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default ReviewSystem;
