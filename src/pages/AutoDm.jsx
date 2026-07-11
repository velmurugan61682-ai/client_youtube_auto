import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

import StatsCards from '../components/autoDm/StatsCards';
import AutoDmConfigCard from '../components/autoDm/AutoDmConfigCard';
import KeywordEditor from '../components/autoDm/KeywordEditor';
import TemplateEditor from '../components/autoDm/TemplateEditor';
import RepliedHistoryTable from '../components/autoDm/RepliedHistoryTable';

import {
  getAutoDmConfig,
  saveAutoDmConfig,
  getAutoDmStats,
  getAutoDmHistory,
  triggerAutoDmRun
} from '../services/api/autoDmApi';

const AutoDm = ({ channels, selectedChannelId, setSelectedChannelId }) => {
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [config, setConfig] = useState({
    enabled: false,
    whatsappNumber: '',
    keywords: ['contact', 'details', 'course', 'help', 'info', 'price'],
    replyTemplates: [
      '📲 மேலும் தகவலுக்கு WhatsApp: {whatsapp_link}',
      '💬 Need details? Message me on WhatsApp: {whatsapp_link}',
      '📞 Contact on WhatsApp: {whatsapp_link}'
    ]
  });

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);

  // Loaders
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [runningManual, setRunningManual] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Set initial selected channel if none is selected
  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].channelId);
    }
  }, [channels, selectedChannelId, setSelectedChannelId]);

  // Load config, stats, and history when video selection changes
  useEffect(() => {
    if (selectedVideoId) {
      fetchConfigAndStats(selectedVideoId);
      fetchHistory(selectedVideoId, 1);
    } else {
      setConfig({
        enabled: false,
        whatsappNumber: '',
        keywords: ['contact', 'details', 'course', 'help', 'info', 'price'],
        replyTemplates: [
          '📲 மேலும் தகவலுக்கு WhatsApp: {whatsapp_link}',
          '💬 Need details? Message me on WhatsApp: {whatsapp_link}',
          '📞 Contact on WhatsApp: {whatsapp_link}'
        ]
      });
      setStats(null);
      setHistory(null);
      setHistoryPage(1);
    }
  }, [selectedVideoId]);

  const fetchConfigAndStats = async (videoId) => {
    try {
      setLoadingConfig(true);
      const [configData, statsData] = await Promise.all([
        getAutoDmConfig(videoId),
        getAutoDmStats(videoId)
      ]);
      setConfig(configData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching configuration/stats:', err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const fetchHistory = async (videoId, page) => {
    try {
      setLoadingHistory(true);
      const historyData = await getAutoDmHistory(videoId, page, 10);
      setHistory(historyData);
      setHistoryPage(page);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSave = async () => {
    if (!selectedChannelId || !selectedVideoId) {
      alert('Please select both a channel and a video.');
      return;
    }
    if (!config.whatsappNumber) {
      alert('Please enter a WhatsApp number.');
      return;
    }
    try {
      setSavingConfig(true);
      const data = {
        channelId: selectedChannelId,
        videoId: selectedVideoId,
        enabled: config.enabled,
        whatsappNumber: config.whatsappNumber,
        keywords: config.keywords,
        replyTemplates: config.replyTemplates
      };
      const updated = await saveAutoDmConfig(data);
      setConfig(updated);
      
      // Refresh stats
      const updatedStats = await getAutoDmStats(selectedVideoId);
      setStats(updatedStats);
      
      alert('✅ Auto DM configuration saved successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleManualRun = async () => {
    if (!selectedVideoId) return;
    if (!config.enabled) {
      alert('Please save and enable Auto DM for this video first.');
      return;
    }
    try {
      setRunningManual(true);
      const res = await triggerAutoDmRun(selectedVideoId);
      alert(`🚀 ${res.message || 'Auto DM execution completed successfully!'}`);
      
      // Refresh stats and history
      const [updatedStats, updatedHistory] = await Promise.all([
        getAutoDmStats(selectedVideoId),
        getAutoDmHistory(selectedVideoId, 1)
      ]);
      setStats(updatedStats);
      setHistory(updatedHistory);
      setHistoryPage(1);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to trigger manual run.');
    } finally {
      setRunningManual(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-[#22c55e] rounded-2xl shrink-0">
            <MessageCircle size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0f0f0f] tracking-tighter">Auto DM — WhatsApp Comment Reply</h1>
            <p className="text-xs md:text-sm text-[#606060] font-medium mt-0.5">
              Automatically reply to YouTube comments and redirect users to WhatsApp.
            </p>
          </div>
        </div>

        {/* Action buttons */}
        {selectedVideoId && (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleManualRun}
              disabled={runningManual || !config.enabled || !config._id}
              title={!config._id ? "Please save settings first" : "Run manual test"}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl px-5 py-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-55 disabled:cursor-not-allowed shadow-sm shadow-green-500/10"
            >
              {runningManual ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              {runningManual ? 'Processing...' : 'Run Test Now'}
            </button>
            
            <button
              onClick={handleSave}
              disabled={savingConfig}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-[#22c55e] text-[#22c55e] hover:bg-green-50/30 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-55"
            >
              {savingConfig ? (
                <Loader2 className="animate-spin" size={14} />
              ) : (
                <Save size={14} />
              )}
              {savingConfig ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        )}
      </div>

      {/* Stats row */}
      {selectedVideoId && (
        <StatsCards stats={stats} loading={loadingConfig} />
      )}

      {/* Layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: select channel, video, whatsapp details */}
        <div className="lg:col-span-6 space-y-6">
          <AutoDmConfigCard
            channels={channels}
            selectedChannelId={selectedChannelId}
            onChannelChange={setSelectedChannelId}
            selectedVideoId={selectedVideoId}
            onVideoChange={setSelectedVideoId}
            enabled={config.enabled}
            onEnabledChange={(val) => setConfig({ ...config, enabled: val })}
            whatsappNumber={config.whatsappNumber}
            onWhatsappNumberChange={(val) => setConfig({ ...config, whatsappNumber: val })}
            onSave={handleSave}
            saving={savingConfig}
          />
        </div>

        {/* Right column: keyword triggers, reply templates */}
        <div className="lg:col-span-6 space-y-6">
          {selectedVideoId && (
            <>
              <KeywordEditor
                keywords={config.keywords}
                onChange={(val) => setConfig({ ...config, keywords: val })}
                videoId={selectedVideoId}
              />
              <TemplateEditor
                templates={config.replyTemplates}
                onChange={(val) => setConfig({ ...config, replyTemplates: val })}
              />
            </>
          )}
        </div>
      </div>

      {/* History table */}
      {selectedVideoId && (
        <RepliedHistoryTable
          history={history}
          loading={loadingHistory}
          page={historyPage}
          onPageChange={(page) => fetchHistory(selectedVideoId, page)}
        />
      )}
    </motion.div>
  );
};

export default AutoDm;
