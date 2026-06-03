import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  Check,
  TrendingUp,
  Dumbbell,
  BookOpen,
  Droplet,
  Brain,
  Award,
  Clock,
  Trash2
} from 'lucide-react';
import api from '../services/api';
import { useRefresh } from '../context/RefreshContext';

const getTodayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const addDays = (dateStr, offset) => {
  const d = new Date(dateStr + 'T12:00:00');
  d.setDate(d.getDate() + offset);
  return formatDate(d);
};

const HabitMonitor = () => {
  const { signalRefresh } = useRefresh();

  // Unified date state — drives everything
  const [todayDate, setTodayDate] = useState(getTodayDateStr());
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr());
  const isToday = selectedDate === todayDate;

  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Calendar modal
  const [showCalendarPop, setShowCalendarPop] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5);

  // Add Habit Form
  const [newHabit, setNewHabit] = useState({
    name: '',
    description: '',
    category: 'FITNESS',
    color: '#6D5DFE',
    icon: 'Dumbbell',
    frequency: 'DAILY',
    goal: 1,
    goalUnit: 'times',
    reminderTime: '08:00',
    startDate: getTodayDateStr()
  });

  const categories = [
    { name: 'FITNESS', icon: Dumbbell, color: '#EF4444' },
    { name: 'READING', icon: BookOpen, color: '#8B5CF6' },
    { name: 'MEDITATION', icon: Brain, color: '#6D5DFE' },
    { name: 'WATER_INTAKE', icon: Droplet, color: '#3B82F6' },
    { name: 'STUDY', icon: BookOpen, color: '#F59E0B' },
    { name: 'CODING', icon: Compass, color: '#10B981' },
    { name: 'JOURNAL', icon: Award, color: '#EC4899' },
  ];

  const getCategoryIcon = (catName) => {
    const cat = categories.find(c => c.name === catName);
    return cat ? cat.icon : Dumbbell;
  };

  // ── Fetch all tasks + logs for selected date's status ──
  useEffect(() => {
    fetchDateData();
  }, [selectedDate]);

  const fetchDateData = async () => {
    setLoading(true);
    try {
      const habitsRes = await api.get('/habits?isArchived=false');
      setHabits(habitsRes.data);

      const logsRes = await api.get(`/habits/logs/date/${selectedDate}`);
      const logsMap = {};
      logsRes.data.forEach(log => {
        logsMap[log.habitId] = log;
      });
      setLogs(logsMap);
    } catch (err) {
      console.error('Error fetching date data:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Day-change detection ──
  useEffect(() => {
    const checkDayChange = () => {
      const current = getTodayDateStr();
      if (current !== todayDate) {
        setTodayDate(current);
        // Auto-navigate to today only if user was viewing today
        if (isToday) setSelectedDate(current);
      }
    };
    const interval = setInterval(checkDayChange, 30000);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkDayChange();
    });
    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', checkDayChange);
    };
  }, [todayDate, isToday]);

  // ── Navigation ──
  const goToPrevDay = () => setSelectedDate(addDays(selectedDate, -1));
  const goToNextDay = () => setSelectedDate(addDays(selectedDate, 1));
  const goToToday = () => setSelectedDate(todayDate);

  const handleDateSelect = (dayNum) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    setSelectedDate(dateStr);
    setShowCalendarPop(false);
  };

  // ── Toggle habit completion ──
  const handleCheckClick = async (habit) => {
    const isCompleted = logs[habit.id]?.status === 'COMPLETED';
    const newStatus = isCompleted ? 'PENDING' : 'COMPLETED';

    try {
      const res = await api.post(`/habits/${habit.id}/log`, {
        date: selectedDate,
        status: newStatus,
        loggedValue: habit.goal
      });

      setLogs(prev => ({
        ...prev,
        [habit.id]: res.data
      }));

      const habitsRes = await api.get('/habits?isArchived=false');
      setHabits(habitsRes.data);

      signalRefresh();
    } catch (err) {
      console.error('Error checking habit:', err);
    }
  };

  // ── Delete Habit ──
  const handleDeleteHabit = async (habitId, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/habits/${habitId}`);
      setHabits(prev => prev.filter(h => h.id !== habitId));
      signalRefresh();
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  // ── Create Habit ──
  const handleAddHabit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/habits', { ...newHabit, startDate: getTodayDateStr() });
      setShowAddModal(false);
      fetchDateData();
      signalRefresh();
      setNewHabit({
        name: '',
        description: '',
        category: 'FITNESS',
        color: '#6D5DFE',
        icon: 'Dumbbell',
        frequency: 'DAILY',
        goal: 1,
        goalUnit: 'times',
        reminderTime: '08:00',
        startDate: getTodayDateStr()
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ── Stats ──
  const completedCount = Object.values(logs).filter(l => l.status === 'COMPLETED').length;
  const totalCount = habits.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const displayLabel = isToday
    ? "Today's Habits"
    : `Tasks for ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">

      {/* Header Panel */}
      <div className="glass-card p-6 rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              {isToday ? 'Overview' : 'History'}
            </span>
            <h2 className="text-3xl font-extrabold font-sans">{displayLabel}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
            {!isToday && (
              <button
                onClick={goToToday}
                className="mt-2 text-xs font-bold text-primary hover:underline"
              >
                ← Back to Today
              </button>
            )}
            <p className="text-sm font-semibold text-primary mt-2">
              {completedCount}/{totalCount} Done
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            {/* Circular Progress */}
            <div className="relative w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  className="text-primary"
                  strokeWidth="3.5"
                  strokeDasharray={`${completionPercentage}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${completionPercentage}, 100` }}
                  transition={{ duration: 0.8 }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-extrabold text-sm text-slate-800 dark:text-slate-100 font-sans">
                {completionPercentage}%
              </div>
            </div>

            {/* Calendar Icon + Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={goToPrevDay}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="Previous day"
              >
                <ChevronLeft size={18} className="text-slate-400" />
              </button>
              <button
                onClick={() => setShowCalendarPop(prev => !prev)}
                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all shadow-soft"
              >
                <CalIcon size={18} className="text-primary" />
              </button>
              <button
                onClick={goToNextDay}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                title="Next day"
              >
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

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
              className="w-full max-w-sm glass-card rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-premium text-sm font-sans"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setCurrentMonth(prev => prev === 0 ? 11 : prev - 1)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="font-extrabold">{monthNames[currentMonth]} {currentYear}</span>
                <button
                  onClick={() => setCurrentMonth(prev => prev === 11 ? 0 : prev + 1)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: daysInMonth }).map((_, idx) => {
                  const dayNum = idx + 1;
                  const cellDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = cellDate === selectedDate;
                  return (
                    <button
                      key={dayNum}
                      onClick={() => handleDateSelect(dayNum)}
                      className={`py-1.5 rounded-xl border transition font-medium ${
                        isSelected
                          ? 'bg-primary text-white border-primary'
                          : 'hover:bg-primary/20 dark:hover:bg-slate-800 border-transparent hover:text-primary dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit List */}
      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading tasks...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="text-center py-16 glass-card rounded-3xl p-6 text-slate-400 text-sm flex flex-col items-center gap-4">
              <span>No tasks yet. Create your first task below!</span>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl shadow-premium"
              >
                Create Task
              </button>
            </div>
          ) : (
            habits.map((habit) => {
              const isChecked = logs[habit.id]?.status === 'COMPLETED';
              const Icon = getCategoryIcon(habit.category);
              return (
                <motion.div
                  key={habit.id}
                  whileHover={{ y: -2 }}
                  className="glass-card p-5 rounded-3xl flex items-center justify-between border-slate-200/80 dark:border-slate-800/80 shadow-soft"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white" style={{ backgroundColor: `${habit.color}20`, color: habit.color }}>
                      <Icon size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-base block text-slate-800 dark:text-slate-100">{habit.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-400 font-semibold">{habit.category}</span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-slate-400 flex items-center gap-0.5">
                          <Clock size={11} className="mt-0.5" />
                          {habit.reminderTime || 'None'}
                        </span>
                        <span className="text-xs text-slate-400">•</span>
                        <span className="text-xs text-primary font-bold">{habit.goal} {habit.goalUnit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCheckClick(habit)}
                      className={`w-9 h-9 rounded-xl border-2 flex items-center justify-center transition-all ${
                        isChecked
                          ? 'bg-primary border-primary text-white shadow-soft scale-105'
                          : 'border-slate-200 dark:border-slate-800 hover:border-primary/50 text-transparent'
                      }`}
                    >
                      <Check size={18} strokeWidth={3} className={isChecked ? 'opacity-100' : 'opacity-0'} />
                    </button>
                    <button
                      onClick={(e) => handleDeleteHabit(habit.id, e)}
                      className="w-9 h-9 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 flex items-center justify-center transition-all"
                      title="Delete habit"
                    >
                      <Trash2 size={15} strokeWidth={2} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* Streaks Section (only for today's view) */}
      {habits.length > 0 && isToday && (
        <div className="glass-card p-5 rounded-3xl shadow-soft">
          <h3 className="font-extrabold text-sm block mb-4 tracking-wide text-slate-700 dark:text-slate-300">
            Streak Tracker
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {habits.slice(0, 4).map((habit) => (
              <div key={habit.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-xs">{habit.name}</span>
                <span className="font-bold text-xs text-orange-500 flex items-center gap-1">
                  {habit.currentStreak} Days
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating + Button */}
      <button
        onClick={() => {
          setShowAddModal(true);
          setNewHabit(prev => ({ ...prev, startDate: getTodayDateStr() }));
        }}
        className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white flex items-center justify-center shadow-premium neon-glow-primary hover:scale-110 active:scale-95 transition-all z-20"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-card border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-premium max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-5">
                <h3 className="font-extrabold text-lg flex items-center gap-2">
                  <Plus size={20} className="text-primary" /> Create New Task
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddHabit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Task Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Morning Yoga, Read 15 Pages, etc."
                    value={newHabit.name}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Description</label>
                  <textarea
                    placeholder="Brief description of your daily goal"
                    value={newHabit.description}
                    onChange={(e) => setNewHabit(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium h-20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Category</label>
                    <select
                      value={newHabit.category}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                    >
                      {categories.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Reminder Time</label>
                    <input
                      type="time"
                      value={newHabit.reminderTime}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, reminderTime: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Goal Target</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newHabit.goal}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, goal: parseInt(e.target.value) || 1 }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Unit</label>
                    <input
                      type="text"
                      required
                      placeholder="minutes, glasses"
                      value={newHabit.goalUnit}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, goalUnit: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wide">Color</label>
                    <input
                      type="color"
                      value={newHabit.color}
                      onChange={(e) => setNewHabit(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-11 p-1 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold shadow-premium neon-glow-primary transition mt-4 hover:scale-[1.01] active:scale-[0.99] duration-150"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitMonitor;
