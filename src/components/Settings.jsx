import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Loader2,
  Key,
  ChevronRight,
  Phone,
  User,
  Camera
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, checkAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('automation');
  const [profileName, setProfileName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profilePictureBase64, setProfilePictureBase64] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePictureBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  const [autoMod, setAutoMod] = useState(true);
  const [autoLike, setAutoLike] = useState(true);
  const [threshold, setThreshold] = useState(85);
  const [languages, setLanguages] = useState(['English', 'Tamil', 'Tanglish']);
  const [realTimeAlerts, setRealTimeAlerts] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [delay, setDelay] = useState(5);
  const [smartAiReply, setSmartAiReply] = useState(true);
  const [archiveComments, setArchiveComments] = useState(false);
  const [channelFilter, setChannelFilter] = useState('all');

  // API Keys / Credentials
  const [credentials, setCredentials] = useState({
    youtubeApiKey: '',
    openaiApiKey: '',
    gowhatsApiKey: '',
    gowhatsUrl: '',
    productLink: ''
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePictureBase64('');
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) {
      alert('Name is required');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setSavingProfile(true);
    setSuccessMessage('');
    try {
      const payload = {
        name: profileName
      };
      if (newPassword) {
        payload.password = newPassword;
      }
      if (profilePictureBase64) {
        payload.profilePicture = profilePictureBase64;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
        await checkAuth();
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      const { settings, credentials: savedCreds } = res.data;
      if (settings) {
        setAutoMod(settings.autoMod ?? true);
        setAutoLike(settings.autoLike ?? true);
        setThreshold(settings.confidenceThreshold ?? 85);
        setLanguages(settings.languages ?? ['English', 'Tamil', 'Tanglish']);
        setRealTimeAlerts(settings.realTimeAlerts ?? true);
        setWhatsappNumber(settings.whatsappNumber || '');
        setDelay(settings.delay ?? 5);
        setSmartAiReply(settings.smartAiReply ?? true);
        setArchiveComments(settings.archiveComments ?? false);
        setChannelFilter(settings.channelFilter || 'all');
      }
      if (savedCreds) {
        setCredentials({
          youtubeApiKey: savedCreds.youtubeApiKey || '',
          openaiApiKey: savedCreds.openaiApiKey || '',
          gowhatsApiKey: savedCreds.gowhatsApiKey || '',
          gowhatsUrl: savedCreds.gowhatsUrl || '',
          productLink: savedCreds.productLink || ''
        });
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSavingSettings(true);
    setSuccessMessage('');
    try {
      if (activeTab === 'automation') {
        await api.post('/settings', {
          settings: {
            autoMod,
            autoLike,
            confidenceThreshold: threshold,
            languages,
            realTimeAlerts,
            whatsappNumber,
            delay,
            smartAiReply,
            archiveComments,
            channelFilter
          }
        });
      } else {
        await api.post('/settings/credentials', credentials);
      }
      setSuccessMessage('Configuration synchronized!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to sync configuration.');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-[#ff0000]" size={40} strokeWidth={2.5} />
          <p className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em]">Authenticating Core...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'automation', label: 'Automation Rules', icon: Zap },
    { id: 'credentials', label: 'API Credentials', icon: Key },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <div className="w-full py-4 space-y-8 pb-16">
      {/* Dummy inputs for Chrome Password Manager / Autofill Trap */}
      <div style={{ position: 'absolute', top: '-1000px', left: '-1000px', width: '0px', height: '0px', overflow: 'hidden' }} aria-hidden="true">
        <input type="text" name="chrome_autocomplete_trap_email" tabIndex="-1" autoComplete="username" />
        <input type="password" name="chrome_autocomplete_trap_password" tabIndex="-1" autoComplete="current-password" />
      </div>
      {/* Premium Tab Switcher */}
      <div className="flex flex-wrap bg-white p-1 rounded-[24px] border border-[#f0f0f0] w-full sm:w-fit shadow-sm gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-4 sm:px-6 py-3 rounded-[20px] text-[13px] font-black transition-all ${activeTab === tab.id
              ? 'bg-[#0f0f0f] text-white shadow-lg shadow-black/10'
              : 'text-[#909090] hover:text-[#0f0f0f] hover:bg-gray-50'
              }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="w-full">
        {/* Main Content Area */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'automation' && (
              <motion.div
                key="automation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Group 1: AI Automation Rules */}
                    <div className="ios-list-group">
                      <div className="ios-list-item">
                        <div className="max-w-[480px] pr-4 text-left">
                          <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">Smart Moderation</p>
                          <p className="text-[11px] text-[#909090] font-semibold leading-relaxed">Automatically purge or hide toxic, abusive, or spam comments using neural analysis.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            autoMod ? 'bg-[#fff1f1] text-[#ff0000]' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {autoMod ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAutoMod(!autoMod)}
                            className={`ios-toggle ${autoMod ? 'active' : ''}`}
                          >
                            <div className="ios-toggle-thumb" />
                          </button>
                        </div>
                      </div>

                      <div className="ios-list-item">
                        <div className="max-w-[480px] pr-4 text-left">
                          <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">Smart AI Reply</p>
                          <p className="text-[11px] text-[#909090] font-semibold leading-relaxed">Automatically generate replies based on the comment sentiment using AI.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            smartAiReply ? 'bg-[#fff1f1] text-[#ff0000]' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {smartAiReply ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setSmartAiReply(!smartAiReply)}
                            className={`ios-toggle ${smartAiReply ? 'active' : ''}`}
                          >
                            <div className="ios-toggle-thumb" />
                          </button>
                        </div>
                      </div>

                      <div className="ios-list-item">
                        <div className="max-w-[480px] pr-4 text-left">
                          <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">Auto-Engagement (Like)</p>
                          <p className="text-[11px] text-[#909090] font-semibold leading-relaxed">Automatically "Like" positive and appreciative comments to boost SEO performance.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            autoLike ? 'bg-[#fff1f1] text-[#ff0000]' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {autoLike ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAutoLike(!autoLike)}
                            className={`ios-toggle ${autoLike ? 'active' : ''}`}
                          >
                            <div className="ios-toggle-thumb" />
                          </button>
                        </div>
                      </div>

                      <div className="ios-list-item">
                        <div className="max-w-[480px] pr-4 text-left">
                          <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">Archive Comments</p>
                          <p className="text-[11px] text-[#909090] font-semibold leading-relaxed">Automatically archive comments once they have been approved or replied to.</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            archiveComments ? 'bg-[#fff1f1] text-[#ff0000]' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {archiveComments ? 'ON' : 'OFF'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setArchiveComments(!archiveComments)}
                            className={`ios-toggle ${archiveComments ? 'active' : ''}`}
                          >
                            <div className="ios-toggle-thumb" />
                          </button>
                        </div>
                      </div>

                      {/* Confidence Slider inside a list item */}
                      <div className="ios-list-item flex-col items-start gap-4 text-left">
                        <div className="flex justify-between w-full">
                          <div>
                            <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">Decision Confidence Threshold</p>
                            <p className="text-[11px] text-[#909090] font-semibold leading-relaxed">Minimum AI confidence percentage required for auto moderation actions.</p>
                          </div>
                          <span className="text-[12px] font-black text-[#ff0000] bg-[#fff1f1] px-2.5 py-1 rounded-lg h-fit">{threshold}%</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="99"
                          value={threshold}
                          onChange={(e) => setThreshold(Number(e.target.value))}
                          className="w-full accent-[#ff0000] h-1 bg-slate-100 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* Group 2: Channel & Timing Settings */}
                    <div className="ios-list-group">
                      <div className="ios-list-item text-left flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-2 p-5 md:p-4.5 pr-12 md:pr-5 relative w-full">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#fff1f1] text-[#ff0000] rounded-xl flex items-center justify-center shrink-0 md:hidden">
                            <Phone size={16} />
                          </div>
                          <div>
                            <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">WhatsApp Number</p>
                            <p className="text-[11px] text-[#909090] font-semibold leading-relaxed hidden md:block">Primary WhatsApp link destination number.</p>
                          </div>
                        </div>
                        <div className="relative w-full md:w-auto">
                          <input
                            type="text"
                            value={whatsappNumber}
                            onChange={(e) => setWhatsappNumber(e.target.value)}
                            placeholder="e.g. +919999999999"
                            className="w-full md:w-48 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#ff0000]/30 text-left md:text-right pr-8 md:pr-2 text-wrap break-all"
                          />
                          <ChevronRight size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#909090] md:hidden" />
                        </div>
                      </div>

                      <div className="ios-list-item text-left">
                        <div>
                          <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">Automation Scan Delay</p>
                          <p className="text-[11px] text-[#909090] font-semibold leading-relaxed">Minutes to wait between scanning comments on selected videos.</p>
                        </div>
                        <select
                          value={delay}
                          onChange={(e) => setDelay(Number(e.target.value))}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#ff0000]/30 cursor-pointer"
                        >
                          <option value={1}>1 Minute</option>
                          <option value={5}>5 Minutes</option>
                          <option value={10}>10 Minutes</option>
                          <option value={30}>30 Minutes</option>
                          <option value={60}>1 Hour</option>
                        </select>
                      </div>

                      <div className="ios-list-item text-left">
                        <div>
                          <p className="text-[14px] font-black text-[#0f0f0f] mb-0.5">Channel Filter</p>
                          <p className="text-[11px] text-[#909090] font-semibold leading-relaxed">Determine which connected channels the scan loop targets.</p>
                        </div>
                        <select
                          value={channelFilter}
                          onChange={(e) => setChannelFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#ff0000]/30 cursor-pointer"
                        >
                          <option value="all">All Linked Channels</option>
                          <option value="primary">Primary Channel Only</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
            )}

                  {activeTab === 'credentials' && (
                    <motion.div
                      key="credentials"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="yt-card p-4 sm:p-6 md:p-8"
                    >
                      <div className="flex items-center gap-4 mb-8 pb-5 border-b border-[#f8f8f8]">
                        <div className="w-12 h-12 bg-[#fff1f1] text-[#ff0000] rounded-2xl flex items-center justify-center">
                          <Key size={24} />
                        </div>
                        <div>
                          <h3 className="text-[18px] font-black text-[#0f0f0f] tracking-tight">API Gateways</h3>
                          <p className="text-[12px] font-medium text-[#909090]">Synchronize your cloud service credentials.</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">YouTube Data V3 Key</label>
                          <div className="relative group">
                            <input
                              type="password"
                              value={credentials.youtubeApiKey}
                              onChange={(e) => setCredentials({ ...credentials, youtubeApiKey: e.target.value })}
                              className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/20 transition-all outline-none"
                              placeholder="AIzaSy..."
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500 opacity-20"><Youtube size={16} /></div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">OpenAI API Access Token</label>
                          <input
                            type="password"
                            value={credentials.openaiApiKey}
                            onChange={(e) => setCredentials({ ...credentials, openaiApiKey: e.target.value })}
                            className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/20 transition-all outline-none"
                            placeholder="sk-..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#fcfcfc]">
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">GoWhats API Token</label>
                            <input
                              type="password"
                              value={credentials.gowhatsApiKey}
                              onChange={(e) => setCredentials({ ...credentials, gowhatsApiKey: e.target.value })}
                              className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/30 transition-all outline-none"
                              placeholder="Token..."
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">GoWhats API URL</label>
                            <input
                              type="text"
                              value={credentials.gowhatsUrl}
                              onChange={(e) => setCredentials({ ...credentials, gowhatsUrl: e.target.value })}
                              className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/30 transition-all outline-none"
                              placeholder="https://..."
                            />
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'profile' && (
                    <motion.div
                      key="profile"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                      {/* Left Card: Info */}
                      <div className="md:col-span-1 bg-white border border-[#f0f0f0] rounded-[22px] p-6 text-center flex flex-col items-center justify-center shadow-sm">
                        <div
                          onClick={() => document.getElementById('avatar-file-input').click()}
                          className="relative w-32 h-32 rounded-[22px] overflow-hidden shadow-lg border border-slate-100 mb-6 bg-slate-50 flex items-center justify-center group cursor-pointer"
                          title="Click to choose profile picture"
                        >
                          <img
                            src={profilePictureBase64 || user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Worker')}&background=0f172a&color=fff&size=128`}
                            alt="Profile"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                            <Camera size={18} />
                            <span className="text-[9px] font-black uppercase tracking-wider">Choose Picture</span>
                          </div>
                        </div>
                        <input
                          id="avatar-file-input"
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                        <h3 className="text-lg font-black text-slate-800 mb-1">{user?.name || 'Worker'}</h3>


                      </div>

                      {/* Right Card: Fields */}
                      <div className="md:col-span-2 bg-white border border-[#f0f0f0] rounded-[22px] p-6 md:p-8 space-y-6 shadow-sm text-left">
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                          <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">Profile Settings</h3>

                          {successMessage && (
                            <div className="p-4 bg-[#fff1f1] border border-red-100 text-[#ff0000] rounded-2xl text-xs font-semibold flex items-center gap-2">
                              <CheckCircle2 size={16} className="text-[#ff0000]" />
                              {successMessage}
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">Name</label>
                              <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#0f0f0f]/20 transition-all outline-none"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">Email Address</label>
                              <input
                                type="email"
                                value={user?.email || ''}
                                className="w-full bg-[#f4f5f6] border border-[#e8e9ea] text-slate-400 cursor-not-allowed rounded-2xl px-5 py-3.5 text-sm font-semibold outline-none"
                                disabled
                                readOnly
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 space-y-4">
                            <div>
                              <h4 className="text-[12px] font-black text-slate-700 uppercase tracking-wider">Change Password</h4>
                              <p className="text-[10px] text-[#606060] font-bold">Leave blank if you don't want to change it.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">New Password</label>
                                <input
                                  type="password"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#0f0f0f]/20 transition-all outline-none"
                                  placeholder="New password"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">Confirm Password</label>
                                <input
                                  type="password"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-2xl px-5 py-3.5 text-sm font-semibold focus:bg-white focus:border-[#0f0f0f]/20 transition-all outline-none"
                                  placeholder="Confirm password"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-slate-100">
                            <button
                              type="submit"
                              disabled={savingProfile}
                              className="flex items-center gap-2 px-8 py-3.5 bg-[#ff0000] hover:bg-[#cc0000] disabled:bg-red-200 text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-lg shadow-red-500/10 transition-all cursor-pointer"
                            >
                              {savingProfile ? (
                                <>
                                  <Loader2 className="animate-spin" size={16} />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  Save Changes
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer Save Button */}
                {activeTab !== 'profile' && (
                  <div className="flex items-center justify-between p-4 bg-[#fcfcfc] border border-[#f0f0f0] rounded-[24px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${savingSettings ? 'bg-[#ff0000] animate-ping' : 'bg-[#ff0000]'}`} />
                      <AnimatePresence>
                        {successMessage ? (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[12px] font-black text-[#ff0000] uppercase tracking-tight">
                            {successMessage}
                          </motion.span>
                        ) : (
                          <span className="text-[12px] font-black text-[#909090] uppercase tracking-tight">System Ready to Sync</span>
                        )}
                      </AnimatePresence>
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={savingSettings}
                      className="px-8 py-3.5 bg-[#0f0f0f] hover:bg-[#222] text-white rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-xl shadow-black/10 transition-all disabled:opacity-50"
                    >
                      {savingSettings ? 'Securing Data...' : 'Commit Configuration'}
                    </button>
                  </div>
                )}
              </div>
      </div>
      </div>
      );
};

      export default Settings;
      const Youtube = ({size, className}) => (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
      );

