import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, Shield, Download, Check, AlertCircle } from 'lucide-react';
import api from '../services/api';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [themePref, setThemePref] = useState(user?.themePreference || 'DARK');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  
  // Password updates state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      await updateProfile(name, themePref, 'en', timezone);
      setStatusMessage('Profile configurations updated successfully.');
    } catch (err) {
      setErrorMessage(err || 'Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setStatusMessage('');
    setErrorMessage('');
    setLoading(true);

    try {
      await api.put('/profile/password', { oldPassword, newPassword });
      setStatusMessage('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Password update failed. Make sure current password is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/profile/export', { responseType: 'blob' });
      
      const blob = new Blob([response.data], { type: 'text/csv' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = downloadUrl;
      link.setAttribute('download', `habit_flow_history.csv`);
      document.body.appendChild(link);
      
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV Export failed:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      
      {/* Page Header */}
      <div className="glass-card p-6 rounded-3xl">
        <h2 className="text-3xl font-extrabold flex items-center gap-2">
          <SettingsIcon size={28} className="text-primary" /> Settings & Configurations
        </h2>
        <p className="text-xs text-slate-400 mt-1">Manage themes, update security passwords, and export data logs.</p>
      </div>

      {/* Success / Error Messages */}
      {statusMessage && (
        <div className="p-4 bg-success/15 border border-success/20 text-success rounded-2xl flex items-center gap-2 text-xs">
          <Check size={16} />
          <span>{statusMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 bg-red-500/15 border border-red-500/20 text-red-500 rounded-2xl flex items-center gap-2 text-xs">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Card settings */}
        <div className="glass-card p-6 rounded-3xl space-y-5 shadow-soft">
          <h3 className="font-extrabold text-sm block border-b border-slate-200 dark:border-slate-800 pb-3 uppercase tracking-wider text-slate-400">
            Profile Configuration
          </h3>
          
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase">Display Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase">Theme Preference</label>
              <select
                value={themePref}
                onChange={(e) => setThemePref(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
              >
                <option value="DARK">DARK Mode</option>
                <option value="LIGHT">LIGHT Mode</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
              >
                <option value="UTC">UTC (Universal Coordinated)</option>
                <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
                <option value="America/New_York">EST (Eastern Standard Time)</option>
                <option value="Europe/London">GMT (Greenwich Mean Time)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-soft transition disabled:opacity-50"
            >
              Save Profile Preferences
            </button>
          </form>
        </div>

        {/* Security Settings panel */}
        <div className="glass-card p-6 rounded-3xl space-y-5 shadow-soft">
          <h3 className="font-extrabold text-sm block border-b border-slate-200 dark:border-slate-800 pb-3 uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Shield size={16} /> Security Center
          </h3>

          <form onSubmit={handlePasswordSave} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1.5 uppercase">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-primary outline-none transition text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-soft transition disabled:opacity-50"
            >
              Update Password
            </button>
          </form>
        </div>

      </div>

      {/* Export / Data Panel */}
      <div className="glass-card p-6 rounded-3xl shadow-soft">
        <h3 className="font-extrabold text-sm block border-b border-slate-200 dark:border-slate-800 pb-3 mb-4 uppercase tracking-wider text-slate-400">
          Data Portability & Export
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Download a complete record of your habits list, check-in history logs, streaks, categories, and planner logs. Your data is exported as a highly readable, standard comma-separated values (CSV) sheet file.
        </p>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-xl shadow-premium neon-glow-primary hover:scale-[1.01] transition-all"
        >
          <Download size={16} /> Export Habit Data as CSV
        </button>
      </div>

    </div>
  );
};

export default Settings;
