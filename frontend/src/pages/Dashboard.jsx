import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { Award, Zap, CheckSquare, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../services/api';
import { useRefresh } from '../context/RefreshContext';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplay(date) {
  const opts = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', opts);
}

const BAR_COLORS = [
  '#E2E8F0',
  '#6EE7B7',
  '#34D399',
  '#10B981',
  '#059669',
];

function getBarColor(rate) {
  if (rate === 0) return BAR_COLORS[0];
  if (rate <= 25) return BAR_COLORS[1];
  if (rate <= 50) return BAR_COLORS[2];
  if (rate <= 75) return BAR_COLORS[3];
  return BAR_COLORS[4];
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-xl text-xs shadow-lg border border-slate-700">
      <p className="font-bold mb-1">{d.day} — {d.date}</p>
      <p>Progress: <span className="font-bold">{d.rate}%</span></p>
      <p>Completed: <span className="font-bold">{d.completed}</span> / {d.total} tasks</p>
    </div>
  );
};

const Dashboard = () => {
  const { refreshSignal } = useRefresh();
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const currentMonday = getMonday(today);
  const [weekStart, setWeekStart] = useState(currentMonday);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [heatmapYear, setHeatmapYear] = useState(today.getFullYear());
  const [heatmapMonth, setHeatmapMonth] = useState(today.getMonth() + 1);
  const [heatmapData, setHeatmapData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, analyticsRes, achievementsRes] = await Promise.all([
        api.get('/dashboard'),
        api.get('/analytics'),
        api.get('/profile/achievements'),
      ]);
      setMetrics(metricsRes.data);
      setAnalytics(analyticsRes.data);
      setAchievements(achievementsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshSignal]);

  const fetchWeeklyProgress = useCallback(async (monday) => {
    try {
      const dateStr = formatDateStr(monday);
      const res = await api.get(`/analytics/weekly?weekStart=${dateStr}`);
      setWeeklyProgress(res.data.weeklyProgress || []);
    } catch (err) {
      console.error(err);
      setWeeklyProgress([]);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyProgress(weekStart);
  }, [weekStart, fetchWeeklyProgress, refreshSignal]);

  const prevWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(d);
  };

  const nextWeek = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    if (d <= currentMonday) {
      setWeekStart(d);
    }
  };

  const canGoNext = () => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 7);
    return d <= currentMonday;
  };

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const fetchHeatmap = useCallback(async (year, month) => {
    try {
      const res = await api.get(`/heatmap?year=${year}&month=${month}`);
      setHeatmapData(res.data.heatmapData || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchHeatmap(heatmapYear, heatmapMonth);
  }, [heatmapYear, heatmapMonth, fetchHeatmap, refreshSignal]);

  const prevMonth = () => {
    if (heatmapMonth === 1) {
      setHeatmapYear(y => y - 1);
      setHeatmapMonth(12);
    } else {
      setHeatmapMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (heatmapMonth === 12) {
      setHeatmapYear(y => y + 1);
      setHeatmapMonth(1);
    } else {
      setHeatmapMonth(m => m + 1);
    }
  };

  const dayInfo = {};
  heatmapData.forEach(d => { dayInfo[d.day] = { count: d.count, intensity: d.intensity ?? 0 }; });

  const daysInMonth = new Date(heatmapYear, heatmapMonth, 0).getDate();
  const firstDayOfWeek = new Date(heatmapYear, heatmapMonth - 1, 1).getDay();
  const heatmapDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const INTENSITY_CLASSES = [
    'bg-slate-100 dark:bg-slate-800 text-slate-400',
    'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10',
    'bg-emerald-500/40 text-emerald-500 border border-emerald-500/20',
    'bg-emerald-500/70 text-white shadow-soft',
    'bg-emerald-500 text-white neon-glow-success scale-105',
  ];

  const INTENSITY_LEGEND = [
    'bg-slate-200 dark:bg-slate-800',
    'bg-emerald-500/20',
    'bg-emerald-500/50',
    'bg-emerald-500/70',
    'bg-emerald-500',
  ];

  const isCurrentMonth = heatmapYear === today.getFullYear() && heatmapMonth === today.getMonth() + 1;

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-sans">

      <div className="glass-card p-6 rounded-3xl">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Analytics Dashboard</span>
          <h2 className="text-3xl font-extrabold font-sans">HabitFlow Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Real-time statistics, consistency trends, and contribution heatmaps.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Compiling your performance analytics...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-3xl shadow-soft">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Zap size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Current Streaks</span>
                  <span className="text-2xl font-black text-slate-800 block mt-1 font-sans">
                    🔥 {metrics?.totalStreak || 0} Days
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl shadow-soft">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <CheckSquare size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Habits Tracked</span>
                  <span className="text-2xl font-black text-slate-800 block mt-1 font-sans">
                    {metrics?.activeHabits || 0} Active
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl shadow-soft">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-success/10 text-success flex items-center justify-center">
                  <Compass size={22} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block">Completion Rate</span>
                  <span className="text-2xl font-black text-slate-800 block mt-1 font-sans">
                    {metrics?.successRate || 0}% Monthly
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 1. Weekly Progress Bar Chart */}
            <div className="glass-card p-6 rounded-3xl shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">
                  Weekly Progress Chart
                </h3>
                <div className="flex items-center gap-3">
                  <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                    <ChevronLeft size={18} className="text-slate-500" />
                  </button>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-300 min-w-[120px] text-center">
                    {formatDisplay(weekStart)} — {formatDisplay(weekEnd)}
                  </span>
                  <button onClick={nextWeek} disabled={!canGoNext()} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed">
                    <ChevronRight size={18} className="text-slate-500" />
                  </button>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyProgress}>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} unit="%" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(109, 93, 254, 0.05)' }} />
                    <Bar dataKey="rate" radius={[8, 8, 0, 0]} maxBarSize={48}>
                      {weeklyProgress.map((entry, idx) => (
                        <Cell key={idx} fill={getBarColor(entry.rate || 0)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Consistency Trend Area Chart */}
            <div className="glass-card p-6 rounded-3xl shadow-soft">
              <h3 className="font-extrabold text-sm block mb-6 uppercase tracking-wider text-slate-400">
                Consistency Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.consistencyTrend || []}>
                    <XAxis dataKey="week" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff' }} />
                    <Area type="monotone" dataKey="rate" stroke="#8B5CF6" fill="rgba(139, 92, 246, 0.2)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* 3. Monthly Heatmap Grid */}
          <div className="glass-card p-6 rounded-3xl shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">
                Monthly Contribution Heatmap
              </h3>
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                  <ChevronLeft size={18} className="text-slate-500" />
                </button>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 min-w-[100px] text-center">
                  {MONTHS[heatmapMonth - 1]} {heatmapYear}
                </span>
                <button onClick={nextMonth} disabled={isCurrentMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight size={18} className="text-slate-500" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-6">Detailed view of logged habit completions for each date of the month.</p>

            <div className="grid grid-cols-7 gap-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider pb-1">
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}
              {heatmapDays.map(day => {
                const info = dayInfo[day] || { count: 0, intensity: 0 };
                return (
                  <div
                    key={day}
                    title={`${info.count} completion${info.count !== 1 ? 's' : ''} (level ${info.intensity}/4)`}
                    className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs cursor-pointer heatmap-cell transition duration-150 ${INTENSITY_CLASSES[info.intensity] || INTENSITY_CLASSES[0]}`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5 mt-6 text-xs text-slate-400 font-bold justify-end">
              <span>Less</span>
              {INTENSITY_LEGEND.map((cls, i) => (
                <div key={i} className={`w-4 h-4 rounded ${cls}`} />
              ))}
              <span>More</span>
            </div>
          </div>

          {/* 4. Achievements Badges Grid */}
          <div className="glass-card p-6 rounded-3xl shadow-soft">
            <h3 className="font-extrabold text-sm block mb-6 uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Award size={18} className="text-primary" /> Unlocked Badges & Milestones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {achievements.length === 0 ? (
                <div className="col-span-full text-center py-8 text-slate-400 text-sm">
                  Complete your daily check-ins to earn and unlock achievements!
                </div>
              ) : (
                achievements.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-4 hover:border-primary/30 transition duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center neon-glow-primary font-bold text-xl shadow-soft shrink-0">
                      🏆
                    </div>
                    <div>
                      <span className="font-bold text-sm block text-slate-800 dark:text-slate-100">{badge.title}</span>
                      <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{badge.description}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Dashboard;
