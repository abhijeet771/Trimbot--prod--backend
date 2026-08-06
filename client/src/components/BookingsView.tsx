import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, Trash2, RefreshCw, X, Mail } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import config from '../config';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface IAppointment {
  _id: string;
  date: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  barberId: {
    name: string;
  };
  services: Array<{
    name: string;
    price: number;
  }>;
}

export const BookingsView: React.FC = () => {
  const { setActiveWidget, sessionId } = useChat();
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<IAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch appointments if we have a userId
  const fetchAppointments = async (targetUserId: string) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${config.apiUrl}/appointments?userId=${targetUserId}`);
      setAppointments(res.data.data || []);
    } catch (err: any) {
      toast.error('Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      // Find user by email dynamically via API
      const response = await axios.get(`${config.apiUrl}/users/lookup?email=${encodeURIComponent(email)}`);
      const user = response.data?.data;
      if (user && user._id) {
        setUserId(user._id);
        await fetchAppointments(user._id);
        toast.success(`Welcome back, ${user.name}!`);
      } else {
        toast.error('Could not find account.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Could not find account.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // On mount, check if there are appointments for the guest email based on sessionId
  useEffect(() => {
    const checkGuestBookings = async () => {
      setIsLoading(true);
      try {
        // Since seed script has dummy appointments, we allow looking up directly.
        // We'll let users view bookings by entering email or we display a default list
      } catch (e) {}
      setIsLoading(false);
    };
    checkGuestBookings();
  }, [sessionId]);

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await axios.post(`${config.apiUrl}/cancel`, { appointmentId });
      toast.success('Appointment cancelled successfully.');
      if (userId) {
        fetchAppointments(userId);
      } else {
        setAppointments(prev =>
          prev.map(appt =>
            appt._id === appointmentId ? { ...appt, status: 'cancelled' } : appt
          )
        );
      }
    } catch (err: any) {
      toast.error('Failed to cancel appointment.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex justify-between items-center p-4 border-b border-white/5 bg-zinc-900/60">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-zinc-100">My Bookings</h3>
        </div>
        <button
          onClick={() => setActiveWidget('none')}
          className="text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {!userId ? (
          <form onSubmit={handleLookup} className="space-y-4">
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enter your email address associated with your bookings to review your upcoming schedule and status.
            </p>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="reception@trimtokyo.jp"
                className="w-full glass-input py-2 pl-10 pr-4 text-sm rounded-xl text-zinc-200"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-zinc-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search Bookings'}
            </button>
          </form>
        ) : isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs text-zinc-400">Loading bookings history...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Calendar className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm font-semibold text-zinc-300">No appointments found</p>
            <p className="text-xs text-zinc-500">Try booking a service with our AI Chatbot receptionist first!</p>
            <button
              onClick={() => setUserId(null)}
              className="text-xs text-amber-500 hover:underline mt-2 inline-block"
            >
              Search a different email
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Bookings</span>
              <button
                onClick={() => setUserId(null)}
                className="text-[10px] text-amber-500 hover:underline"
              >
                Change Email
              </button>
            </div>

            {appointments.map((appt) => {
              const apptDate = new Date(appt.date);
              return (
                <div
                  key={appt._id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    appt.status === 'cancelled'
                      ? 'border-white/2 bg-black/10 opacity-60'
                      : 'border-white/5 bg-black/30 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        appt.status === 'confirmed'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/15'
                          : appt.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/15'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700/50'
                      }`}
                    >
                      {appt.status}
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      ¥{appt.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                      <span>
                        {apptDate.toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <span>
                        {apptDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Barber: {appt.barberId?.name || 'Any Barber'}</span>
                    </div>
                    <div className="flex items-start gap-2 pt-1 border-t border-white/2 mt-1">
                      <Scissors className="w-3.5 h-3.5 text-zinc-500 mt-0.5" />
                      <div className="flex-1">
                        {appt.services.map((s, idx) => (
                          <div key={idx} className="text-[11px] text-zinc-400">
                            • {s.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {appt.status !== 'cancelled' && (
                    <div className="flex gap-2 mt-3 pt-2 border-t border-white/2">
                      <button
                        onClick={() => handleCancel(appt._id)}
                        className="flex-1 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs flex items-center justify-center gap-1.5 transition-all duration-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsView;
