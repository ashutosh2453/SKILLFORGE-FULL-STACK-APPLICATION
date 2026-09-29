import React, { useState, useEffect } from 'react';
import { Users2, Star, Clock, Calendar, CheckCircle2, MessageSquare, Send, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { Mentor } from '../types';

export const MentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // Request fields
  const [topic, setTopic] = useState('Roadmap & Portfolio Architecture Review');
  const [message, setMessage] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const fetchMentorsData = async () => {
    try {
      const [mentorsRes, reqsRes] = await Promise.all([
        api.getMentors(),
        api.getMyMentorRequests()
      ]);
      setMentors(mentorsRes.mentors || []);
      setMyRequests(reqsRes.requests || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMentorsData();
  }, []);

  const handleOpenRequest = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setShowRequestModal(true);
    setSentSuccess(false);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMentor) return;
    try {
      await api.requestMentorship(selectedMentor.user_id, {
        topic,
        message,
        preferred_date: preferredDate
      });
      setSentSuccess(true);
      fetchMentorsData();
      setTimeout(() => {
        setShowRequestModal(false);
        setMessage('');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#11131c]/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-violet-400 font-semibold mb-1">
            <Users2 className="w-4 h-4" />
            <span>EXPERT NETWORK & CODE REVIEW</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            1:1 Mentorship & Architecture Review
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
            Connect directly with staff engineers from Stripe, Google, and Meta for portfolio reviews, system design mock interviews, and career strategy.
          </p>
        </div>
      </div>

      {/* Active Requests History (if any) */}
      {myRequests.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl space-y-3">
          <h3 className="font-bold text-sm text-white">Your Mentorship Sessions & Feedback</h3>
          <div className="space-y-3">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-[#11131c] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-white text-sm">Session with {req.mentor_name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full capitalize font-bold ${
                      req.status === 'accepted' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">{req.topic} • Preferred: {req.preferred_date || 'Flexible'}</p>
                  {req.feedback_notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-[11px]">
                      <b className="text-violet-300 block mb-0.5">Mentor Feedback Notes:</b>
                      {req.feedback_notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentor Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-[#11131c]/90 border border-slate-800 hover:border-violet-500/50 transition backdrop-blur-xl shadow-xl flex flex-col justify-between space-y-6"
          >
            <div>
              <div className="flex items-start gap-4">
                <img
                  src={m.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'}
                  alt={m.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-violet-500/30 shrink-0"
                />
                <div>
                  <h3 className="font-bold text-base text-white">{m.name}</h3>
                  <span className="text-xs text-violet-400 font-medium block">{m.role_title}</span>
                  <span className="text-[11px] text-slate-500 font-mono">@{m.company} • {m.years_experience}+ yrs exp</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 mt-4 leading-relaxed line-clamp-3">
                {m.bio}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {m.expertise?.map((tag, idx) => (
                  <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-amber-400 font-bold font-mono">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{m.rating}</span>
                <span className="text-slate-500 text-[10px] font-normal">({m.total_reviews})</span>
              </div>

              <button
                onClick={() => handleOpenRequest(m)}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition"
              >
                Book Session
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Book Session Request Modal */}
      {showRequestModal && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-[#11131c] border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-white">Request Mentorship with {selectedMentor.name}</h3>
            {sentSuccess ? (
              <div className="p-6 text-center text-emerald-400 font-bold flex flex-col items-center gap-2">
                <CheckCircle2 className="w-10 h-10" />
                <span>Mentorship request sent successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Focus Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Preferred Date & Time</label>
                  <input
                    type="text"
                    placeholder="e.g. This Thursday at 6:00 PM EST"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Message & Specific Questions</label>
                  <textarea
                    rows={3}
                    placeholder="Describe your current blocker or link your project PR..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
