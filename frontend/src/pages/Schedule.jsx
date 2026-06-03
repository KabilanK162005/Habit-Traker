import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  X
} from 'lucide-react';
import api from '../services/api';
import { useToast } from '../context/ToastContext';

const Schedule = () => {
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const { addToast } = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCalendarPop, setShowCalendarPop] = useState(false);
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  // Add Event Form State
  const todayStr = getTodayStr();
  const [newEvent, setNewEvent] = useState({
    title: '',
    eventDate: todayStr,
    startTime: '',
    endTime: ''
  });

  const isToday = selectedDate === todayStr;

  useEffect(() => {
    fetchScheduleEvents();
  }, [selectedDate]);

  const fetchScheduleEvents = async () => {
    setLoading(true);
    try {
      const start = new Date(selectedDate + 'T00:00:00').toISOString();
      const end = new Date(selectedDate + 'T23:59:59').toISOString();
      const res = await api.get('/schedules', { params: { startDate: start, endDate: end } });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const eventDate = newEvent.eventDate;
      const startIso = new Date(`${eventDate}T${newEvent.startTime}:00`).toISOString();
      const endIso = new Date(`${eventDate}T${newEvent.endTime}:00`).toISOString();

      await api.post('/schedules', { title: newEvent.title, startTime: startIso, endTime: endIso });
      setShowAddModal(false);
      setSelectedDate(eventDate);
      fetchScheduleEvents();

      setNewEvent({
        title: '',
        eventDate: todayStr,
        startTime: '',
        endTime: ''
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create event';
      addToast('Error', msg);
      console.error(err);
    }
  };

  const toggleEventComplete = async (event) => {
    try {
      await api.put(`/schedules/${event.id}`, {
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        isCompleted: !event.isCompleted
      });
      fetchScheduleEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.delete(`/schedules/${id}`);
      fetchScheduleEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (isoStr) => {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleDateSelect = (day) => {
    const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowCalendarPop(false);
  };

  const goToToday = () => setSelectedDate(getTodayStr());

  const getEventIcon = () => Clock;

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Overview Card */}
      <div className="glass-card p-6 rounded-3xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Interactive Planner</span>
          <h2 className="text-3xl font-extrabold font-sans">
            {isToday ? "Today's Schedule" : `Schedule for ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {!isToday && (
            <button onClick={goToToday} className="mt-2 text-xs font-bold text-primary hover:underline">
              ← Back to Today
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCalendarPop(prev => !prev)}
            className="p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-soft"
          >
            <Calendar size={18} className="text-primary" />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-2xl shadow-premium neon-glow-primary hover:scale-[1.02] transition-all"
          >
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {/* Timeline Slots */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading your schedule planner...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl p-6 text-slate-400 text-sm">
              No events for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Click 'Add Event' above to schedule your time!
            </div>
          ) : (
            events.map((event) => {
              const Icon = getEventIcon();
              return (
                <motion.div
                  key={event.id}
                  whileHover={{ x: 3 }}
                  className="glass-card p-5 rounded-3xl flex items-center justify-between border-l-8"
                  style={{ borderLeftColor: '#6D5DFE' }}
                >
                  <div className="flex items-center gap-5">
                    {/* Time Indicator */}
                    <div className="text-left min-w-[80px]">
                      <span className="font-bold text-xs text-slate-400 uppercase tracking-wide block">Time Slot</span>
                      <span className="font-black text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1 mt-0.5 font-sans">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                      </span>
                    </div>

                    <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />

                    {/* Event Description Card details */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: '#6D5DFE15', color: '#6D5DFE' }}>
                        <Icon size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-800 dark:text-slate-100">
                          {event.title}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Actions Drawer */}
                  <div className="flex items-center gap-3">
                    {/* Check complete */}
                    <button 
                      onClick={() => toggleEventComplete(event)}
                      className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                        event.isCompleted 
                          ? 'bg-success border-success text-white shadow-soft scale-105' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-success/50 text-transparent'
                      }`}
                    >
                      <Check size={18} strokeWidth={3} className={event.isCompleted ? 'opacity-100' : 'opacity-0'} />
                    </button>

                    {/* Delete */}
                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-500 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendarPop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowCalendarPop(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-premium text-sm"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setCalMonth(prev => prev === 0 ? 11 : prev - 1)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-extrabold">
                  {["January","February","March","April","May","June","July","August","September","October","November","December"][calMonth]} {calYear}
                </span>
                <button
                  onClick={() => setCalMonth(prev => prev === 11 ? 0 : prev + 1)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: new Date(calYear, calMonth + 1, 0).getDate() }).map((_, idx) => {
                  const day = idx + 1;
                  const cellDate = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = cellDate === selectedDate;
                  return (
                    <button
                      key={day}
                      onClick={() => handleDateSelect(day)}
                      className={`py-1.5 rounded-xl border transition font-medium ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'hover:bg-primary/20 dark:hover:bg-slate-800 border-transparent hover:text-primary dark:text-slate-200'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-premium"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Plus size={20} className="text-primary" /> Schedule New Event
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Event Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Project Review, Stand-up Meeting, etc."
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Event Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.eventDate}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, eventDate: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Start Time</label>
                    <input
                      type="time"
                      required
                      value={newEvent.startTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, startTime: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">End Time</label>
                    <input
                      type="time"
                      required
                      value={newEvent.endTime}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, endTime: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-premium neon-glow-primary transition mt-4"
                >
                  Schedule Event
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Schedule;
