import React, { useState, useEffect } from 'react';
import {
  Zap,
  CheckCircle2,
  Loader2,
  Key,
  ChevronRight,
  Phone,
  User,
  Camera,
  ShieldCheck,
  ExternalLink,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import YouTubeIcon from './icons/YouTubeIcon';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProFeatureLock from './ProFeatureLock';
import { hasFeatureAccess } from '../config/planFeatures';

const Settings = ({ user: propUser }) => {
  const { user: authUser, checkAuth } = useAuth();
  const user = propUser || authUser;
  const canRemoveToxic = hasFeatureAccess(user, 'toxicCommentRemove');
  const canAutoDM = hasFeatureAccess(user, 'autoDM');

  const [activeTab, setActiveTab] = useState('automation');
  const [profileName, setProfileName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profilePictureBase64, setProfilePictureBase64] = useState('');

  // YouTube Data Deletion & Privacy Controls State (Policy III.I.4)
  const [purgingData, setPurgingData] = useState(false);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeSuccess, setPurgeSuccess] = useState('');

  const handlePurgeYouTubeData = async () => {
    setPurgingData(true);
    setPurgeSuccess('');
    try {
      const res = await api.post('/auth/purge-youtube-data');
      if (res.data.success) {
        setPurgeSuccess(res.data.message || 'All stored YouTube API data has been permanently purged from our servers.');
        setShowPurgeModal(false);
        if (checkAuth) await checkAuth();
      }
    } catch (err) {
      console.error(err);
      setPurgeSuccess(err.response?.data?.error || 'Failed to purge stored YouTube data.');
    } finally {
      setPurgingData(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSuccessMessage('File size must be less than 2MB');
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
      setSuccessMessage('Name is required');
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setSuccessMessage('Passwords do not match');
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
      setSuccessMessage(err.response?.data?.error || 'Failed to update profile');
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
      setSuccessMessage(err.response?.data?.error || 'Failed to sync configuration.');
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
    { id: 'privacy', label: 'YouTube Privacy & Data Controls', icon: ShieldCheck }
  ];

  return (
    <div className="w-full py-4 space-y-8 pb-16">
      {/* Dummy inputs for Chrome Password Manager / Autofill Trap */}
      <form onSubmit={(e) => e.preventDefault()} style={{ position: 'absolute', top: '-1000px', left: '-1000px', width: '0px', height: '0px', overflow: 'hidden' }} aria-hidden="true">
        <input type="text" name="chrome_autocomplete_trap_email" tabIndex="-1" autoComplete="username" />
        <input type="password" name="chrome_autocomplete_trap_password" tabIndex="-1" autoComplete="current-password" />
      </form>
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
                          className="w-full max-w-[360px] h-2 bg-slate-200 rounded-lg accent-[#ff0000] cursor-pointer transition-all"
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

                      <div className="space-y-5 max-w-[620px]">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">YouTube Data V3 Key</label>
                          <div className="relative group">
                            <input
                              type="password"
                              value={credentials.youtubeApiKey}
                              onChange={(e) => setCredentials({ ...credentials, youtubeApiKey: e.target.value })}
                              className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/20 transition-all outline-none"
                              placeholder="AIzaSy..."
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30"><YouTubeIcon size={24} /></div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">OpenAI API Access Token</label>
                          <input
                            type="password"
                            value={credentials.openaiApiKey}
                            onChange={(e) => setCredentials({ ...credentials, openaiApiKey: e.target.value })}
                            className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/20 transition-all outline-none"
                            placeholder="sk-..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-[#fcfcfc]">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">GoWhats API Token</label>
                            <input
                              type="password"
                              value={credentials.gowhatsApiKey}
                              onChange={(e) => setCredentials({ ...credentials, gowhatsApiKey: e.target.value })}
                              className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/30 transition-all outline-none"
                              placeholder="Token..."
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase text-[#909090] tracking-widest ml-1">GoWhats API URL</label>
                            <input
                              type="text"
                              value={credentials.gowhatsUrl}
                              onChange={(e) => setCredentials({ ...credentials, gowhatsUrl: e.target.value })}
                              className="w-full bg-[#f8f9fa] border border-[#f0f0f0] rounded-xl px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-[#ff0000]/30 transition-all outline-none"
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

                  {activeTab === 'privacy' && (
                    <motion.div
                      key="privacy"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="space-y-6"
                    >
                      {/* Policy III.C.1 Compliance Notice Card */}
                      <div className="bg-white border border-[#e5e5e5] rounded-[22px] p-6 sm:p-8 shadow-sm text-left space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-[#ff0000] border border-red-500/20">
                            <ShieldCheck size={20} />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-zinc-900">
                              YouTube API Terms of Service & Privacy Disclosures
                            </h3>
                            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
                              Policy # :III.C.1 Mandatory Directives
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs sm:text-sm text-zinc-650 font-medium leading-relaxed">
                          <p>
                            ChannelBot accesses and processes YouTube API Services data in full compliance with YouTube Developer Policies and Google API Terms.
                          </p>
                          <div className="p-4 bg-[#f9fafb] border border-zinc-200/80 rounded-xl space-y-2">
                            <p className="font-bold text-zinc-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-[#ff0000]" />
                              User Binding Terms:
                            </p>
                            <p>
                              By connecting a YouTube channel or using ChannelBot, you agree to be bound by the{' '}
                              <a
                                href="https://www.youtube.com/t/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#ff0000] font-black hover:underline inline-flex items-center gap-1"
                              >
                                YouTube Terms of Service <ExternalLink size={12} />
                              </a>.
                            </p>
                          </div>

                          <div className="p-4 bg-[#f9fafb] border border-zinc-200/80 rounded-xl space-y-2">
                            <p className="font-bold text-zinc-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-600" />
                              Privacy Policy Notice:
                            </p>
                            <p>
                              All data accessed, collected, or processed through YouTube API Services is handled strictly in accordance with the{' '}
                              <a
                                href="https://policies.google.com/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#ff0000] font-black hover:underline inline-flex items-center gap-1"
                              >
                                Google Privacy Policy <ExternalLink size={12} />
                              </a>.
                            </p>
                          </div>

                          <div className="p-4 bg-[#f9fafb] border border-zinc-200/80 rounded-xl space-y-2">
                            <p className="font-bold text-zinc-900 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              Revoke Authorization at Any Time:
                            </p>
                            <p>
                              You can revoke ChannelBot's access to your Google/YouTube account data at any time via the{' '}
                              <a
                                href="https://security.google.com/settings/security/permissions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#ff0000] font-black hover:underline inline-flex items-center gap-1"
                              >
                                Google Security Settings Permissions Page <ExternalLink size={12} />
                              </a>.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Policy III.I.4 Compliance & Data Deletion Controls Card */}
                      <div className="bg-white border border-[#e5e5e5] rounded-[22px] p-6 sm:p-8 shadow-sm text-left space-y-5">
                        <div className="flex items-center gap-3 pb-4 border-b border-zinc-100">
                          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 border border-amber-500/20">
                            <Trash2 size={20} />
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-black text-zinc-900">
                              YouTube API Data Retention & User Data Deletion Controls
                            </h3>
                            <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest mt-0.5">
                              Policy # :III.I.4 Compliance Controls
                            </p>
                          </div>
                        </div>

                        {purgeSuccess && (
                          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            {purgeSuccess}
                          </div>
                        )}

                        <div className="space-y-3 text-xs sm:text-sm text-zinc-650 font-medium leading-relaxed">
                          <div className="p-4 bg-amber-50/60 border border-amber-200/70 rounded-xl text-amber-900 space-y-2">
                            <p className="font-bold flex items-center gap-2 text-amber-950">
                              <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                              30-Day Data Storage Limit (Policy III.I.4 & Section III.E.4):
                            </p>
                            <p className="text-xs font-semibold leading-relaxed">
                              In accordance with YouTube API Services Developer Policies, ChannelBot stores non-authorized YouTube API data for no longer than 30 calendar days without a refresh. If access is revoked or data deletion is requested, all stored channel data, cached comments, and OAuth tokens are permanently erased.
                            </p>
                          </div>

                          <div className="pt-2 space-y-3">
                            <h4 className="text-sm font-black text-zinc-900">Self-Service Data Deletion Mechanism</h4>
                            <p className="text-xs text-zinc-500">
                              Clicking the button below will immediately trigger our automated data purge handler to permanently delete all connected YouTube channels, stored comment records, moderation logs, and OAuth tokens associated with your account from ChannelBot servers.
                            </p>

                            <button
                              type="button"
                              onClick={() => setShowPurgeModal(true)}
                              className="flex items-center gap-2 px-6 py-3.5 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-2xl text-xs font-black uppercase tracking-wider shadow-lg shadow-red-500/10 transition-all cursor-pointer"
                            >
                              <Trash2 size={16} />
                              Purge Stored YouTube API Data
                            </button>
                          </div>

                          <div className="pt-4 border-t border-zinc-100 text-xs text-zinc-500 font-semibold space-y-1">
                            <p>
                              <strong>Manual Deletion Request:</strong> You can also send a data deletion request by emailing{' '}
                              <span className="font-bold text-zinc-900">support@channelbot.in</span>. Requests are processed within 24-48 hours.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Data Purge Confirmation Modal */}
                {showPurgeModal && (
                  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[24px] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-zinc-100 text-left animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-[#ff0000] border border-red-500/20 shrink-0">
                          <AlertTriangle size={24} />
                        </div>
                        <div>
                          <h3 className="text-base font-black text-zinc-900">Purge All Stored YouTube Data?</h3>
                          <p className="text-xs text-zinc-500 font-bold mt-0.5">Policy # :III.I.4 Action</p>
                        </div>
                      </div>

                      <p className="text-xs text-zinc-650 font-medium leading-relaxed">
                        Are you sure you want to proceed? This will permanently delete all your connected YouTube channel records, cached comments, moderation logs, and OAuth access tokens stored on ChannelBot servers.
                      </p>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowPurgeModal(false)}
                          disabled={purgingData}
                          className="px-5 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handlePurgeYouTubeData}
                          disabled={purgingData}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          {purgingData ? (
                            <>
                              <Loader2 className="animate-spin" size={14} />
                              Purging...
                            </>
                          ) : (
                            <>
                              <Trash2 size={14} />
                              Confirm Data Purge
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Save Button */}
                {(activeTab === 'automation' || activeTab === 'credentials') && (
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

