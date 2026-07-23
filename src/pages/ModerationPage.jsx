import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  MessageSquare,
  MessageCircle,
  Send,
  Clock,
  Sliders,
  Plus,
  Trash2,
  Play,
  Pause,
  Edit,
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Video as VideoIcon,
  Sparkles,
  User,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  ExternalLink,
  Activity,
  Check,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  updateRuleStatus,
  testRule,
  retryReply,
  getModerationLogs,
  executeModerationAction,
  getCommentAutomationStats,
  getCommentHistory
} from '../services/api/autoDmApi';
import '../components/ModerationQueue';

//  Toast utility 
const Toast = ({ toasts }) => (
  <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: -16, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 font-semibold text-xs uppercase tracking-wider  pointer-events-auto ${t.type === 'error'
              ? 'bg-red-500/10 border-red-500/20 text-red-500'
              : t.type === 'warning'
                ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                : t.type === 'info'
                  ? 'bg-[#fff1f1] border-red-100 text-[#ff0000]'
                  : 'bg-[#fff1f1] border-red-100 text-[#ff0000]'
            }`}
        >
          {t.type === 'error' ? <AlertCircle size={15} /> : t.type === 'warning' ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
          <span>{t.message}</span>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

//  Moderation Rule Toggle Row 


//  Main Component 
const ModerationPage = ({
  channels = [],
  onAction,
  selectedChannelId: propSelectedChannelId,
  setSelectedChannelId: propSetSelectedChannelId,
  initialTab = 'auto-reply'
}) => {
  // Main tabs: auto-reply | comment-history
  const [mainTab, setMainTab] = useState('auto-reply');

  // Channel selection (local state synced to parent)
  const [selectedChannelId, _setSelectedChannelId] = useState(propSelectedChannelId || '');
  const setSelectedChannelId = (id) => {
    _setSelectedChannelId(id);
    if (propSetSelectedChannelId) propSetSelectedChannelId(id);
  };

  // Toasts
  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  // Auto-select channel on mount
  useEffect(() => {
    if (channels.length > 0 && !selectedChannelId) {
      setSelectedChannelId(channels[0].channelId);
    }
  }, [channels]);

  // Sync initialTab prop changes
  useEffect(() => { setMainTab(initialTab); }, [initialTab]);

  //  Moderation Rules State 
  const [modRules, setModRules] = useState({
    toxicDetection: true,
    spamDetection: true,
    hateSpeech: true,
    abuse: true,
    scam: true,
    sexualContent: true,
    duplicateComments: true,
    linkSpam: true
  });
  const [moderationAction, setModerationAction] = useState('delete');
  const [, setSavingModRules] = useState(false);
  const [, setLoadingModSettings] = useState(false);

  const fetchModSettings = async () => {
    try {
      setLoadingModSettings(true);
      const res = await api.get('/settings');
      const s = res.data.settings || {};
      if (s.moderationRules) setModRules({ ...modRules, ...s.moderationRules });
      if (s.moderationAction) setModerationAction(s.moderationAction);
    } catch (err) {
      console.error('Failed to load moderation settings', err);
    } finally {
      setLoadingModSettings(false);
    }
  };

  

  useEffect(() => { if (mainTab === 'moderation-rules') fetchModSettings(); }, [mainTab]);

  //  Auto Reply State 
  const [videos, setVideos] = useState([]);
  const [, setLoadingVideos] = useState(false);
  const [stats, setStats] = useState({ totalRules: 0, totalTriggers: 0, totalSuccess: 0, totalFailed: 0 });
  const [rulesList, setRulesList] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [, setRuleToDelete] = useState(null);

  // Form
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleName, setRuleName] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('all_videos');
  const [contentPickerOpen, setContentPickerOpen] = useState(false);
  const [triggerType, setTriggerType] = useState('contains_any');
  const [keywordInput, setKeywordInput] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [replyType, setReplyType] = useState('Text'); // 'Text' | 'Carousel'
  const [followersOnly, setFollowersOnly] = useState(false);
  const [replyCommentText, setReplyCommentText] = useState('');
  const [automatedDmContent, setAutomatedDmContent] = useState('');
  const [carouselCards, setCarouselCards] = useState([
    { imageUrl: '', title: 'Untitled Card', description: 'No description provided.', btnLabel: 'View Detail', link: '' }
  ]);
  const [publicReplyEnabled, setPublicReplyEnabled] = useState(true);
  const [templateInput, setTemplateInput] = useState('');
  const [replyTemplates, setReplyTemplates] = useState(['Hi {{username}}, thanks for your comment! Check out our video {{videoTitle}}.']);
  const [templateSelectionMode, setTemplateSelectionMode] = useState('random');
  const [aiReplyEnabled, setAiReplyEnabled] = useState(false);
  const [aiTone, setAiTone] = useState('Friendly');
  const [customTone, setCustomTone] = useState('');
  const [maxReplyLength, setMaxReplyLength] = useState(200);
  const [ruleStatus, setRuleStatus] = useState('Active');
  const [savingRule, setSavingRule] = useState(false);
  const [showRuleForm, setShowRuleForm] = useState(false);

  // Test modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testingRule, setTestingRule] = useState(null);
  const [testCommentText, setTestCommentText] = useState('');
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [testResult, setTestResult] = useState(null);

  //  Comment History State 
  const [historyType, setHistoryType] = useState('all');
  const [historySummary, setHistorySummary] = useState({ total: 0, replied: 0, deleted: 0, hidden: 0, failed: 0, successRate: 0 });
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPages, setHistoryPages] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [historySearch, setHistorySearch] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [, setRetryingLogId] = useState(null);

  const [chatLogs, setChatLogs] = useState([]);
  const [, setLoadingChatLogs] = useState(false);

  const fetchChatLogs = async (channelId) => {
    try {
      setLoadingChatLogs(true);
      const res = await api.get('/auto-mod/comments', { params: { channelId } });
      setChatLogs(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch chat logs', err);
    } finally {
      setLoadingChatLogs(false);
    }
  };

  const [, setModLogs] = useState([]);
  const [, setModTotal] = useState(0);
  const [, setModPages] = useState(1);
  const [modPage, setModPage] = useState(1);
  const [modFilterCategory] = useState('');
  const [modFilterStatus] = useState('');
  const [modSearch] = useState('');
  const [, setLoadingMod] = useState(false);
  const [, setExecutingModId] = useState(null);

  //  Comment Chat State 
  const [chatSearch, setChatSearch] = useState('');
  const [selectedChatId, setSelectedChatId] = useState('');
  const [chatReplyInput, setChatReplyInput] = useState('');

  // Dynamic Comment Chat items derived exclusively from the user's actual channel videos and rules
  const channelChatItems = useMemo(() => {
    if (!videos || videos.length === 0) {
      return [];
    }

    return videos.map(v => {
      // Find rules matching this video or apply to all
      const matchingRules = rulesList.filter(r => r.videoId === v.videoId || r.applyToAllVideos);
      const mainKeyword = matchingRules.length > 0 && matchingRules[0].keywords?.length > 0
        ? matchingRules[0].keywords[0].toUpperCase()
        : 'COMMENTS';

      // Find real comments (logs) for this video
      const matchingLogs = chatLogs.filter(log => log.videoId === v.videoId);

      const commentsMapped = matchingLogs.map(log => ({
        id: log._id,
        username: log.username.startsWith('@') ? log.username : `@${log.username}`,
        time: new Date(log.createdAt).toLocaleString(),
        userComment: log.commentText,
        autoReply: log.replyText,
        link: ''
      }));

      return {
        id: v.videoId,
        trigger: mainKeyword,
        title: v.title || 'Untitled Video',
        ruleType: 'text',
        date: v.publishedAt ? new Date(v.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
        totalComments: commentsMapped.length,
        thumbnail: v.thumbnail || v.thumbnailUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
        caption: v.title || v.description || 'Channel Video Content',
        comments: commentsMapped
      };
    });
  }, [videos, rulesList, chatLogs]);

  // Set default selectedChatId when channelChatItems change
  useEffect(() => {
    if (channelChatItems.length > 0 && !selectedChatId) {
      setSelectedChatId(channelChatItems[0].id);
    }
  }, [channelChatItems]);

  const handleSendChatReply = () => {
    if (!chatReplyInput.trim()) return;
    const newLog = {
      _id: `manual_${Date.now()}`,
      username: 'you',
      createdAt: new Date().toISOString(),
      commentText: 'Manual Reply',
      replyText: chatReplyInput.trim(),
      videoId: selectedChatId
    };
    setChatLogs(prev => [newLog, ...prev]);
    showToast('Reply posted to comment chat thread!');
    setChatReplyInput('');
  };

  //  Data Fetching 
  const fetchVideosForChannel = async (channelId) => {
    try {
      setLoadingVideos(true);
      const res = await api.get('/youtube/videos', { params: { channelId } });
      const arr = Array.isArray(res.data) ? res.data : res.data?.videos || [];
      setVideos(arr);
    } catch { showToast('Failed to load videos', 'error'); }
    finally { setLoadingVideos(false); }
  };

  const fetchStats = async (channelId) => {
    try {
      const data = await getCommentAutomationStats(channelId);
      setStats(data);
    } catch (e) { console.error(e); }
  };

  const fetchRules = async (channelId) => {
    try {
      setLoadingRules(true);
      const rules = await getRules(channelId);
      setRulesList(rules);
    } catch { showToast('Failed to fetch rules', 'error'); }
    finally { setLoadingRules(false); }
  };

  const fetchHistoryLogs = async (page = 1) => {
    try {
      setLoadingHistory(true);
      const res = await getCommentHistory({
        channelId: selectedChannelId || undefined,
        type: historyType || 'all',
        page,
        limit: 20,
        search: historySearch || undefined
      });
      setHistoryLogs(res.items || []);
      setHistorySummary(res.summary || { total: 0, replied: 0, deleted: 0, hidden: 0, failed: 0, successRate: 0 });
      setHistoryTotal(res.pagination?.total || 0);
      setHistoryPages(res.pagination?.pages || 1);
      setHistoryPage(page);
    } catch (err) {
      console.error('Failed to load comment history', err);
      showToast('Failed to load comment history', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchModerationQueue = async (page = 1) => {
    try {
      setLoadingMod(true);
      const res = await getModerationLogs({
        channelId: selectedChannelId,
        page,
        limit: 10,
        status: modFilterStatus || undefined,
        category: modFilterCategory || undefined,
        search: modSearch || undefined
      });
      setModLogs(res.data || []);
      setModTotal(res.total || 0);
      setModPages(res.pages || 1);
      setModPage(page);
    } catch { showToast('Failed to load moderation logs', 'error'); }
    finally { setLoadingMod(false); }
  };

  useEffect(() => {
    if (!selectedChannelId) return;
    fetchVideosForChannel(selectedChannelId);
    fetchStats(selectedChannelId);
    if (mainTab === 'auto-reply') fetchRules(selectedChannelId);
    if (mainTab === 'comment-chat') {
      fetchChatLogs(selectedChannelId);
    }
    if (mainTab === 'comment-history') {
      fetchHistoryLogs(1);
    }
  }, [selectedChannelId, mainTab, historyType]);

  //  Auto-suggest rule name 
  useEffect(() => {
    if (editingRuleId) return;
    const videoTitle = selectedVideoId === 'all_videos'
      ? 'All Videos'
      : videos.find(v => v.videoId === selectedVideoId)?.title?.substring(0, 20) || 'Video';
    const triggerDesc = triggerType === 'any_comment' ? 'Any comment'
      : triggerType === 'ai_intent' ? 'AI Intent'
        : keywords.length > 0 ? `Keywords (${keywords.slice(0, 2).join(', ')})` : 'New rule';
    setRuleName(`${triggerDesc} reply for ${videoTitle}`);
  }, [selectedVideoId, triggerType, keywords, videos, editingRuleId]);

  //  Keyword chips 
  const addKeywordChip = () => {
    const term = keywordInput.trim().toLowerCase();
    if (!term) return;
    if (keywords.includes(term)) { showToast('Keyword already added', 'warning'); return; }
    setKeywords([...keywords, term]);
    setKeywordInput('');
  };

  

  const resetRuleForm = () => {
    setEditingRuleId(null);
    setKeywords([]);
    setReplyType('Text');
    setFollowersOnly(false);
    setReplyCommentText('');
    setAutomatedDmContent('');
    setCarouselCards([
      { imageUrl: '', title: 'Untitled Card', description: 'No description provided.', btnLabel: 'View Detail', link: '' }
    ]);
    setReplyTemplates(['Hi {{username}}, thanks for your comment!']);
    setAiReplyEnabled(false);
    setSelectedVideoId('all_videos');
    setTriggerType('contains_any');
    setRuleStatus('Active');
    setRuleName('');
    setShowRuleForm(false);
  };

  const addCarouselCard = () => {
    if (carouselCards.length >= 10) {
      showToast('Maximum 10 carousel cards allowed', 'warning');
      return;
    }
    setCarouselCards([
      ...carouselCards,
      { imageUrl: '', title: 'Untitled Card', description: 'No description provided.', btnLabel: 'View Detail', link: '' }
    ]);
  };

  const updateCarouselCard = (index, field, value) => {
    setCarouselCards(prev => prev.map((card, i) => i === index ? { ...card, [field]: value } : card));
  };

  const removeCarouselCard = (index) => {
    if (carouselCards.length <= 1) {
      showToast('At least 1 card is required for carousel', 'warning');
      return;
    }
    setCarouselCards(prev => prev.filter((_, i) => i !== index));
  };

  //  Save/Deploy Rule 
  const handleDeployRule = async () => {
    if (!selectedChannelId) { showToast('Please select a channel', 'error'); return; }
    if (triggerType !== 'any_comment' && triggerType !== 'ai_intent' && keywords.length === 0) {
      showToast('Enter at least one trigger keyword', 'error'); return;
    }
    try {
      setSavingRule(true);
      const ruleData = {
        channelId: selectedChannelId,
        videoId: selectedVideoId === 'all_videos' ? null : selectedVideoId,
        applyToAllVideos: selectedVideoId === 'all_videos',
        name: ruleName.trim() || 'Untitled Rule',
        triggerType,
        triggerText: keywords.length > 0 ? keywords[0] : '*',
        keywords,
        replyType,
        followersOnly,
        replyCommentText,
        automatedDmContent,
        carouselCards: replyType === 'Carousel' ? carouselCards.map(c => ({
          imageUrl: c.imageUrl || '',
          title: c.title || '',
          description: c.description || '',
          btnLabel: c.btnLabel || c.buttonText || 'View Detail',
          buttonText: c.btnLabel || c.buttonText || 'View Detail',
          link: c.link || c.buttonUrl || '',
          buttonUrl: c.link || c.buttonUrl || ''
        })) : [],
        publicReplyEnabled,
        replyTemplates: publicReplyEnabled && !aiReplyEnabled ? (replyCommentText ? [replyCommentText] : replyTemplates) : [],
        templateSelectionMode,
        aiReplyEnabled,
        aiTone,
        customTone: aiTone === 'Custom' ? customTone.trim() : '',
        maxReplyLength,
        status: ruleStatus
      };
      if (editingRuleId) { await updateRule(editingRuleId, ruleData); showToast('Rule updated!'); }
      else { await createRule(ruleData); showToast('Rule deployed!'); }
      resetRuleForm();
      fetchRules(selectedChannelId);
      fetchStats(selectedChannelId);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to save rule', 'error');
    } finally { setSavingRule(false); }
  };

  const handleEditRule = (rule) => {
    setEditingRuleId(rule._id);
    setRuleName(rule.name);
    setSelectedVideoId(rule.applyToAllVideos ? 'all_videos' : rule.videoId || '');
    setTriggerType(rule.triggerType);
    setKeywords(rule.keywords || []);
    setReplyType(rule.replyType || 'Text');
    setFollowersOnly(!!rule.followersOnly);
    setReplyCommentText(rule.replyCommentText || '');
    setAutomatedDmContent(rule.automatedDmContent || '');
    setCarouselCards(rule.carouselCards?.length > 0 ? rule.carouselCards : [
      { imageUrl: '', title: 'Untitled Card', description: 'No description provided.', btnLabel: 'View Detail', link: '' }
    ]);
    setPublicReplyEnabled(rule.publicReplyEnabled !== false);
    setReplyTemplates(rule.replyTemplates?.length > 0 ? rule.replyTemplates : ['Hi {{username}}, thanks!']);
    setTemplateSelectionMode(rule.templateSelectionMode || 'random');
    setAiReplyEnabled(!!rule.aiReplyEnabled);
    setAiTone(rule.aiTone || 'Friendly');
    setCustomTone(rule.customTone || '');
    setMaxReplyLength(rule.maxReplyLength || 200);
    setRuleStatus(rule.status || 'Active');
    setShowRuleForm(true);
    showToast('Rule loaded into editor', 'info');
  };

  const handleDeleteRule = async (rule) => {
    try {
      setLoadingRules(true);
      await deleteRule(rule._id);
      showToast('Rule deleted');
      setRuleToDelete(null);
      fetchRules(selectedChannelId);
      fetchStats(selectedChannelId);
    } catch { showToast('Failed to delete rule', 'error'); }
    finally { setLoadingRules(false); }
  };

  const handleToggleStatus = async (rule) => {
    const newStatus = rule.status === 'Active' ? 'Paused' : 'Active';
    try {
      await updateRuleStatus(rule._id, newStatus);
      showToast(`Rule ${newStatus === 'Active' ? 'activated' : 'paused'}`);
      setRulesList(prev => prev.map(r => r._id === rule._id ? { ...r, status: newStatus } : r));
    } catch { showToast('Failed to update status', 'error'); }
  };

  

  

  const handleRunTest = async () => {
    if (!testCommentText.trim()) { showToast('Enter a sample comment', 'warning'); return; }
    try {
      setTestingInProgress(true);
      setTestResult(null);
      const data = await testRule(testingRule._id, testCommentText);
      setTestResult(data);
      showToast('Test completed!');
    } catch { showToast('Test failed', 'error'); }
    finally { setTestingInProgress(false); }
  };

  

  

  

  //  Render 
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100svh-5.5rem)] min-[1025px]:h-[calc(100vh-2.5rem)] min-[1025px]:min-h-[760px] overflow-visible min-[1025px]:overflow-hidden rounded-[28px] bg-[#eef3f5] p-4 sm:p-5 text-[#0f0f0f] relative min-w-0"
    >
      <Toast toasts={toasts} />

      {/* Page Header */}
      <div className="rounded-[22px] bg-white border border-[#e5e5e5] shadow-sm px-5 sm:px-7 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-[#fff1f1] text-[#ff0000] rounded-[22px] shrink-0 border border-red-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0f0f0f] tracking-tighter">Auto-Mod</h1>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="relative flex items-center gap-2 bg-white border border-[#e5e5e5] rounded-full px-4 h-11 shadow-sm w-full min-[400px]:w-[200px] md:w-auto md:min-w-[200px] shrink-0">
          <Sliders size={15} className="text-[#ff0000] shrink-0 pointer-events-none" />
          <select
            value={selectedChannelId || ''}
            onChange={(e) => setSelectedChannelId(e.target.value)}
            className="w-full h-full bg-transparent border-none text-xs font-black uppercase tracking-wider text-[#0f0f0f] focus:outline-none cursor-pointer appearance-none pr-6 py-0"
          >
            <option value="" disabled>Select Channel</option>
            {channels.map(ch => (
              <option key={ch.channelId} value={ch.channelId}>{ch.title}</option>
            ))}
          </select>
          <ChevronDown size={14} className="text-slate-500 shrink-0 pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mt-4 flex items-center rounded-[22px] bg-white border border-[#e5e5e5] shadow-sm gap-1 overflow-x-auto no-scrollbar p-2">
        {[
          { id: 'auto-reply', label: 'Auto Reply', icon: MessageSquare },
          { id: 'comment-chat', label: 'Comment Chat', icon: MessageCircle },
          { id: 'comment-history', label: 'Comment History', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs uppercase tracking-wider transition-all rounded-t-xl shrink-0 ${mainTab === tab.id
                ? 'border-[#ff0000] text-[#ff0000] bg-[#fff1f1] font-black'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={mainTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
          className="custom-scroll mt-4 h-[calc(100%-178px)] overflow-y-auto pr-1"
        >

          {/*  TAB: AUTO REPLY  */}
          {mainTab === 'auto-reply' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Rules', value: stats.totalRules || 0 },
                  { label: 'Total Triggers', value: stats.totalTriggers || 0 },
                  { label: 'Successful Replies', value: stats.totalSuccess || 0 },
                  { label: 'Failed Replies', value: stats.totalFailed || 0 },
                ].map(s => (
                  <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</p>
                    <p className="text-2xl font-black text-[#0f0f0f] mt-1">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* New Rule Button */}
              {!showRuleForm && (
                <button
                  onClick={() => { resetRuleForm(); setShowRuleForm(true); }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-sm"
                >
                  <Plus size={15} /> Deploy New Rule
                </button>
              )}

              {/* Rule Editor Form */}
              <AnimatePresence>
                {showRuleForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <h2 className="text-base font-black text-[#0f0f0f] tracking-tight">
                          {editingRuleId ? 'Edit Automation Rule' : 'Create New Rule'}
                        </h2>
                        <button onClick={resetRuleForm} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Column: Form Builder Steps */}
                        <div className="lg:col-span-7 space-y-6">

                          {/* 1. Select Content */}
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                              1. Select Content / Video
                            </label>
                            <div
                              onClick={() => setContentPickerOpen(true)}
                              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-[#ff0000] transition-all group"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {selectedVideoId !== 'all_videos' && videos.find(v => v.videoId === selectedVideoId)?.thumbnail ? (
                                  <img
                                    src={videos.find(v => v.videoId === selectedVideoId).thumbnail}
                                    alt="Thumbnail"
                                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-[#ff0000]/10 text-[#ff0000] flex items-center justify-center shrink-0">
                                    <VideoIcon size={20} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-black text-slate-900 truncate">
                                    {selectedVideoId === 'all_videos' ? 'All Videos & Shorts (Channel-wide)' : videos.find(v => v.videoId === selectedVideoId)?.title || selectedVideoId}
                                  </p>
                                  <p className="text-[11px] text-slate-400 font-semibold">
                                    {selectedVideoId === 'all_videos' ? 'Applies to all content on your channel' : 'Targeted single content'}
                                  </p>
                                </div>
                              </div>
                              <span className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl group-hover:border-[#ff0000] group-hover:text-[#ff0000] transition-all">
                                Choose Content
                              </span>
                            </div>
                          </div>

                          {/* 2. Trigger Keyword */}
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                              2. Trigger Keyword
                            </label>
                            <div className="flex gap-2 items-stretch">
                              {/* Input + inline Add button */}
                              <div className="flex flex-1 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#ff0000] transition-colors">
                                <input
                                  type="text"
                                  placeholder="Type keyword then click + or press Enter"
                                  value={keywordInput}
                                  onChange={e => setKeywordInput(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      addKeywordChip();
                                    }
                                  }}
                                  className="flex-1 bg-transparent px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={addKeywordChip}
                                  disabled={!keywordInput.trim()}
                                  className="px-4 py-2 bg-[#ff0000] text-white text-xs font-black uppercase tracking-wider hover:bg-[#ff0000] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  + Add
                                </button>
                              </div>
                              {/* ANY button */}
                              <button
                                type="button"
                                onClick={() => {
                                  setKeywords(['*']);
                                  setTriggerType('any_comment');
                                  setKeywordInput('');
                                  showToast('Set to trigger on ANY comment', 'info');
                                }}
                                className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all border whitespace-nowrap ${triggerType === 'any_comment' || (keywords.length === 1 && keywords[0] === '*')
                                    ? 'bg-[#ff0000] text-white border-[#ff0000]'
                                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                  }`}
                              >
                                ANY
                              </button>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium">
                              Type a keyword and click <strong>+ Add</strong> or press <strong>Enter</strong>. Add multiple keywords. Use <strong>ANY</strong> to match all comments.
                            </p>
                          </div>

                          {keywords.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {keywords.map((kw, idx) => (
                                <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-[#ff0000]/10 text-[#ff0000] rounded-full text-xs font-black">
                                  {kw === '*' ? 'ANY Comment (*)' : kw}
                                  <button onClick={() => setKeywords(keywords.filter((_, j) => j !== idx))} className="hover:text-red-500">
                                    <X size={11} />
                                  </button>
                                </span>
                              ))}
                            </div>
                          )}


                          {/* Reply Type & Followers Only */}
                          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Reply Type:</span>
                              <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => setReplyType('Text')}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${replyType === 'Text' ? 'bg-[#ff0000] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                  Text
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReplyType('Carousel')}
                                  className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all ${replyType === 'Carousel' ? 'bg-[#ff0000] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                  Carousel
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-700">Subscribers Only</span>
                              <button
                                type="button"
                                onClick={() => setFollowersOnly(!followersOnly)}
                                className={`relative w-11 h-6 rounded-full transition-all ${followersOnly ? 'bg-[#ff0000]' : 'bg-slate-300'}`}
                              >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${followersOnly ? 'translate-x-5' : ''}`} />
                              </button>
                            </div>
                          </div>

                          {/* 3. Reply Comment (Optional) */}
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                              3. Reply Comment (Optional)
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 'Just sent you a DM! '"
                              value={replyCommentText}
                              onChange={e => setReplyCommentText(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#ff0000]"
                            />
                          </div>

                          {/* 4. Automated DM Content OR Carousel Cards */}
                          {replyType === 'Text' ? (
                            <div className="space-y-2">
                              <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                                4. Automated DM / Response Content
                              </label>
                              <textarea
                                rows={4}
                                placeholder="Enter the private message users will receive..."
                                value={automatedDmContent}
                                onChange={e => setAutomatedDmContent(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#ff0000]"
                              />
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                  4. Carousel Cards ({carouselCards.length}/10)
                                </label>
                                <button
                                  type="button"
                                  onClick={addCarouselCard}
                                  className="text-xs font-black text-[#ff0000] hover:text-[#cc0000] flex items-center gap-1 bg-[#fff1f1] px-3 py-1.5 rounded-xl border border-red-100"
                                >
                                  <Plus size={13} /> Add Card +
                                </button>
                              </div>

                              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                                {carouselCards.map((card, idx) => (
                                  <div key={idx} className="bg-slate-50 border border-red-100 rounded-2xl p-4 space-y-3 relative">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                      <span className="text-xs font-black text-[#ff0000]">Card #{idx + 1}</span>
                                      {carouselCards.length > 1 && (
                                        <button onClick={() => removeCarouselCard(idx)} className="text-red-500 hover:text-red-700 p-1">
                                          <Trash2 size={14} />
                                        </button>
                                      )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        placeholder="Image URL"
                                        value={card.imageUrl}
                                        onChange={e => updateCarouselCard(idx, 'imageUrl', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Title"
                                        value={card.title}
                                        onChange={e => updateCarouselCard(idx, 'title', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-black text-slate-900"
                                      />
                                    </div>

                                    <input
                                      type="text"
                                      placeholder="Description"
                                      value={card.description}
                                      onChange={e => updateCarouselCard(idx, 'description', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <input
                                        type="text"
                                        placeholder="Btn Label (e.g. View Detail)"
                                        value={card.btnLabel}
                                        onChange={e => updateCarouselCard(idx, 'btnLabel', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold"
                                      />
                                      <input
                                        type="text"
                                        placeholder="Link (https://...)"
                                        value={card.link}
                                        onChange={e => updateCarouselCard(idx, 'link', e.target.value)}
                                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#ff0000]"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Deploy Button */}
                          <button
                            type="button"
                            onClick={handleDeployRule}
                            disabled={savingRule}
                            className="w-full py-4 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:shadow-red-500/25 active:scale-98 flex items-center justify-center gap-2"
                          >
                            {savingRule ? <RefreshCw size={18} className="animate-spin" /> : <Zap size={18} />}
                            {savingRule ? 'Deploying...' : editingRuleId ? 'Update Automation' : 'Deploy Automation'}
                          </button>

                        </div>

                        {/* Right Column: Live Phone Mockup */}
                        <div className="lg:col-span-5 flex flex-col items-center justify-start">
                          <div className="text-center mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#ff0000] flex items-center justify-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-[#ff0000] animate-pulse" /> Live Preview
                            </span>
                          </div>

                          <div className="w-[300px] h-[580px] bg-slate-950 rounded-[44px] border-[6px] border-slate-800 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden text-white">
                            {/* Phone Header */}
                            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#ff0000] text-white flex items-center justify-center text-xs font-black">
                                  {selectedChannelId ? channels.find(c => c.channelId === selectedChannelId)?.title?.charAt(0) || 'Y' : 'Y'}
                                </div>
                                <div>
                                  <p className="text-xs font-bold truncate max-w-[130px]">
                                    {channels.find(c => c.channelId === selectedChannelId)?.title || 'Your Channel'}
                                  </p>
                                  <p className="text-[9px] text-red-200 font-semibold">Active now</p>
                                </div>
                              </div>
                              <span className="text-slate-600 text-xs"></span>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto py-4 space-y-4 custom-scroll">
                              {/* User Message */}
                              <div className="flex justify-start">
                                <div className="bg-slate-800 text-slate-200 px-3.5 py-2 rounded-2xl rounded-tl-none text-xs max-w-[80%] font-medium">
                                  {keywords.length > 0 && keywords[0] !== '*' ? `Is this available? ${keywords[0]}` : 'How much is this?'}
                                </div>
                              </div>

                              {/* Automated Reply */}
                              <div className="flex justify-end w-full">
                                {replyType === 'Text' ? (
                                  <div className="bg-[#ff0000] text-white px-3.5 py-2 rounded-2xl rounded-tr-none text-xs max-w-[85%] font-medium leading-relaxed">
                                    {automatedDmContent || replyCommentText || 'Your automated reply will appear here...'}
                                  </div>
                                ) : (
                                  <div className="w-full overflow-x-auto pb-2 flex gap-2.5 scrollbar-thin scrollbar-thumb-slate-700">
                                    {carouselCards.map((card, cIdx) => (
                                      <div key={cIdx} className="w-[180px] shrink-0 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between">
                                        <div>
                                          {card.imageUrl ? (
                                            <img src={card.imageUrl} alt="Card" className="w-full h-24 object-cover" />
                                          ) : (
                                            <div className="w-full h-24 bg-slate-800 flex items-center justify-center text-slate-600">
                                              <VideoIcon size={24} />
                                            </div>
                                          )}
                                          <div className="p-2.5 space-y-1">
                                            <p className="text-xs font-black text-white truncate">{card.title || 'Untitled Card'}</p>
                                            <p className="text-[10px] text-slate-400 font-medium line-clamp-2 leading-tight">
                                              {card.description || 'No description provided.'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="p-2.5 pt-0">
                                          <button 
                                            type="button"
                                            onClick={() => {
                                              if (card.link) {
                                                const url = card.link.startsWith('http') ? card.link : `https://${card.link}`;
                                                window.open(url, '_blank', 'noopener,noreferrer');
                                              } else {
                                                showToast('Enter a Link URL in the card editor to test redirect', 'info');
                                              }
                                            }}
                                            className="w-full py-1.5 bg-[#ff0000] hover:bg-[#ff0000] active:scale-95 transition-all text-white text-[10px] font-black uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1"
                                          >
                                            <span>{card.btnLabel || 'View Detail'}</span>
                                            {card.link && <ExternalLink size={10} />}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Input Bar */}
                            <div className="pt-2 border-t border-slate-900 flex items-center gap-2">
                              <div className="flex-1 bg-slate-900 rounded-full px-3 py-1.5 text-[10px] text-slate-500 font-medium">
                                Message...
                              </div>
                              <span className="text-slate-600 text-xs"></span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rules List */}
              <div className="bg-white border border-slate-100 rounded-[28px] shadow-sm overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h2 className="text-sm font-black text-[#0f0f0f] uppercase tracking-tight">Deployed Rules</h2>
                  <button onClick={() => fetchRules(selectedChannelId)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <RefreshCw size={15} />
                  </button>
                </div>
                {loadingRules ? (
                  <div className="flex items-center justify-center p-12 gap-3">
                    <RefreshCw size={20} className="animate-spin text-[#ff0000]" />
                    <p className="text-sm font-bold text-slate-400">Loading rules</p>
                  </div>
                ) : rulesList.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 gap-3 text-slate-400">
                    <MessageSquare size={32} className="opacity-30" />
                    <p className="text-sm font-bold">No rules deployed yet</p>
                    <p className="text-xs font-medium">Deploy your first automation rule above.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {rulesList.map(rule => (
                      <div key={rule._id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-black text-slate-800 truncate">{rule.name}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${rule.status === 'Active' ? 'bg-[#fff1f1] text-[#ff0000]' : 'bg-slate-100 text-slate-500'
                              }`}>{rule.status}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {rule.triggerType === 'any_comment' ? 'Any comment' : `Keywords: ${(rule.keywords || []).join(', ')}`}
                            {'  '}Triggers: {rule.triggeredCount || 0}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleStatus(rule)}
                            className={`p-2 rounded-xl transition-colors ${rule.status === 'Active' ? 'text-[#f9ab00] hover:bg-[#fff8e1]' : 'text-[#ff0000] hover:bg-[#fff1f1]'}`}
                            title={rule.status === 'Active' ? 'Pause' : 'Activate'}
                          >
                            {rule.status === 'Active' ? <Pause size={15} /> : <Play size={15} />}
                          </button>
                          <button onClick={() => handleEditRule(rule)} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors" title="Edit">
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => { setTestingRule(rule); setTestModalOpen(true); }}
                            className="p-2 rounded-xl text-[#ff0000] hover:bg-[#fff1f1] hover:text-[#ff0000] transition-colors"
                            title="Test"
                          >
                            <Eye size={15} />
                          </button>
                          <button onClick={() => handleDeleteRule(rule)} className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/*  TAB 2: COMMENT CHAT HISTORY  */}
          {mainTab === 'comment-chat' && (() => {
            const filteredTriggers = channelChatItems.filter(t => {
              const matchesSearch = t.trigger.toLowerCase().includes(chatSearch.toLowerCase()) ||
                t.caption.toLowerCase().includes(chatSearch.toLowerCase());
              return matchesSearch;
            });
            const selectedTriggerItem = channelChatItems.find(t => t.id === selectedChatId) || filteredTriggers[0];

            return (
              <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <MessageCircle className="text-[#ff0000]" size={24} /> Comment Chat History
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      Track user comments and automated replies across your channel videos and posts
                    </p>
                  </div>
                </div>

                {/* 2-Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">

                  {/* Left Column: List of Triggers & Posts */}
                  <div className="lg:col-span-5 border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50/50 flex flex-col">

                    {/* Header Label */}
                    <div className="flex items-center gap-2 px-1 text-xs font-black text-slate-800 uppercase tracking-wider">
                      <MessageSquare size={15} className="text-[#ff0000]" /> Channel Video Comments
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search channel videos..."
                        value={chatSearch}
                        onChange={e => setChatSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-[#ff0000]"
                      />
                    </div>

                    {/* Items Count */}
                    <div className="text-[11px] font-bold text-slate-400 px-1">
                      Found {filteredTriggers.length} of {channelChatItems.length} videos ({channelChatItems.length} total)
                    </div>

                    {/* Trigger Cards */}
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[460px] pr-1">
                      {filteredTriggers.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-bold">
                          No matching posts or triggers found.
                        </div>
                      ) : (
                        filteredTriggers.map(item => {
                          const isSelected = selectedChatId === item.id;
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedChatId(item.id)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${isSelected
                                  ? 'bg-white border-[#ff0000] ring-2 ring-red-500/20 shadow-md'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={item.thumbnail}
                                  alt={item.trigger}
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-xs font-black text-slate-900 truncate">
                                      Trigger: "{item.trigger}"
                                    </h4>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    Rule Type: {item.ruleType}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-medium">
                                    {item.date}
                                  </p>
                                  <div className="flex justify-end mt-1">
                                    <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                                      {item.totalComments} total comments
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Chat Stream */}
                  <div className="lg:col-span-7 border border-slate-200 rounded-2xl p-5 bg-white flex flex-col justify-between space-y-4">
                    {selectedTriggerItem ? (
                      <>
                        <div className="space-y-4">
                          {/* Selected Header Card */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-start gap-4">
                            <img
                              src={selectedTriggerItem.thumbnail}
                              alt="Selected"
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-xs font-black text-slate-900 leading-relaxed line-clamp-2">
                                {selectedTriggerItem.caption}
                              </p>
                              <p className="text-[11px] font-bold text-slate-400">
                                {selectedTriggerItem.totalComments} recent comments  {selectedTriggerItem.ruleType}
                              </p>
                            </div>
                          </div>

                          {/* Divider Badge */}
                          <div className="text-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                              Showing {selectedTriggerItem.comments.length} recent comments
                            </span>
                          </div>

                          {/* Chat Stream Messages */}
                          <div className="space-y-5 overflow-y-auto max-h-[380px] pr-2">
                            {selectedTriggerItem.comments.map(c => (
                              <div key={c.id} className="space-y-2 border-b border-slate-100 pb-4 last:border-0">
                                <div className="flex items-center justify-between text-xs font-black">
                                  <span className="text-[#ff0000] hover:underline cursor-pointer">{c.username}</span>
                                  <span className="text-[11px] text-slate-400 font-medium">{c.time}</span>
                                </div>

                                <div className="bg-slate-100 text-slate-800 text-xs font-semibold px-4 py-2.5 rounded-2xl max-w-fit">
                                  "{c.userComment}"
                                </div>

                                <div className="bg-[#fff1f1] border border-red-100 rounded-2xl p-4 space-y-2 ml-4">
                                  <div className="flex items-center gap-1.5 text-xs font-black text-[#ff0000]">
                                    <Sparkles size={14} /> Automated Reply:
                                  </div>
                                  <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                                    {c.autoReply}
                                  </p>
                                  {c.link && (
                                    <a
                                      href={c.link}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff0000] hover:underline bg-white px-3 py-1.5 rounded-xl border border-red-100 shadow-sm mt-1"
                                    >
                                      <ExternalLink size={12} /> {c.link}
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Interactive Input Bar */}
                        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type a manual reply..."
                            value={chatReplyInput}
                            onChange={e => setChatReplyInput(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && chatReplyInput.trim()) {
                                handleSendChatReply();
                              }
                            }}
                            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff0000]"
                          />
                          <button
                            onClick={handleSendChatReply}
                            className="px-4 py-2.5 bg-[#ff0000] hover:bg-[#cc0000] text-white text-xs font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send size={14} /> Send
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                        <MessageCircle size={40} className="opacity-30 mb-2" />
                        <p className="text-xs font-bold">Select a post or trigger from the left list</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/*  TAB 3: COMMENT HISTORY  */}
          {mainTab === 'comment-history' && (
            <div className="space-y-5">
              <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Clock className="text-[#ff0000]" size={24} /> Comment History
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      All AI replies, deleted toxic comments, held-for-review, and failed actions
                    </p>
                  </div>
                  <button
                    onClick={() => fetchHistoryLogs(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={loadingHistory ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>

                {/* 6 Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Total Actions', value: historySummary.total, color: 'text-[#ff0000]', bg: 'bg-[#fff1f1] border-red-100' },
                    { label: 'AI Replies', value: historySummary.replied, color: 'text-[#ff0000]', bg: 'bg-[#fff1f1] border-red-100' },
                    { label: 'Deleted', value: historySummary.deleted, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
                    { label: 'Hidden', value: historySummary.hidden, color: 'text-[#b06000]', bg: 'bg-[#fff8e1] border-[#f9ab00]/20' },
                    { label: 'Failed', value: historySummary.failed, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
                    { label: 'Success Rate', value: `${historySummary.successRate}%`, color: 'text-[#ff0000]', bg: 'bg-[#fff1f1] border-red-100' }
                  ].map(card => (
                    <div key={card.label} className={`border rounded-2xl p-3.5 ${card.bg}`}>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.label}</p>
                      <p className={`text-2xl font-black mt-1.5 ${card.color}`}>{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Search + Filter Bar */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search by username or comment..."
                        value={historySearch}
                        onChange={e => setHistorySearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchHistoryLogs(1)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#ff0000]"
                      />
                    </div>
                  </div>

                  {/* Type Filter Pills */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: 'all',     label: 'All',     color: 'slate' },
                      { id: 'replied', label: 'Replied', color: 'red'  },
                      { id: 'deleted', label: 'Deleted', color: 'danger'    },
                      { id: 'hidden',  label: 'Hidden',  color: 'amber'  },
                      { id: 'failed',  label: 'Failed',  color: 'rose'   }
                    ].map(f => {
                      const isActive = historyType === f.id;
                      const activeStyles = {
                        slate: 'bg-slate-900 text-white border-slate-900',
                        red: 'bg-[#ff0000] text-white border-[#ff0000]',
                        danger: 'bg-[#cc0000] text-white border-[#cc0000]',
                        amber: 'bg-[#0f0f0f] text-white border-[#0f0f0f]',
                        rose:  'bg-rose-600 text-white border-rose-600'
                      };
                      return (
                        <button
                          key={f.id}
                          onClick={() => { setHistoryType(f.id); }}
                          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm ${isActive
                            ? activeStyles[f.color]
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comment Cards */}
                {loadingHistory ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 animate-pulse space-y-3">
                        <div className="h-3 bg-slate-200 rounded w-1/3" />
                        <div className="h-3 bg-slate-200 rounded w-2/3" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                ) : historyLogs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-3 border border-dashed border-slate-200 rounded-2xl">
                    <Clock size={36} className="opacity-30 text-[#ff0000]" />
                    <div>
                      <p className="text-sm font-black text-slate-700">No records found</p>
                      <p className="text-xs text-slate-400 font-medium mt-1 max-w-sm">
                        {historyType === 'all'
                          ? 'Replies, deleted comments, and moderation actions will appear here after the automation worker runs.'
                          : `No ${historyType} records found. Try selecting a different filter or refreshing.`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {historyLogs.map(log => (
                      <div
                        key={log.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition-all space-y-3"
                      >
                        {/* Card Header: Author + Date */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                              <User size={13} className="text-slate-500" />
                            </div>
                            <span className="text-xs font-black text-slate-900">
                              {log.authorName?.startsWith('@') ? log.authorName : `@${log.authorName || 'user'}`}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold">
                            {log.actionDate ? new Date(log.actionDate).toLocaleString() : ''}
                          </span>
                        </div>

                        {/* Video Name */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <VideoIcon size={12} className="text-slate-400" />
                          {log.videoTitle || 'Unknown Video'}
                        </div>

                        {/* Original Comment */}
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-xs text-slate-800 font-semibold">
                          &ldquo;{log.commentText || 'No comment text recorded.'}&rdquo;
                        </div>

                        {/* Type-specific content */}
                        {log.type === 'replied' && log.replyText && (
                          <div className="bg-[#fff1f1] border border-red-100 rounded-xl p-3.5 text-xs text-slate-700 font-semibold space-y-3">
                            <p className="font-bold text-[#ff0000] flex items-center gap-1">
                              <Sparkles size={11} /> {log.replyType === 'Carousel' ? 'Carousel Reply:' : 'AI Reply:'}
                            </p>
                            {log.replyType === 'Carousel' && log.carouselCards && log.carouselCards.length > 0 ? (
                              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 max-w-full scrollbar-thin">
                                {log.carouselCards.map((card, cIdx) => (
                                  <div key={cIdx} className="w-[200px] shrink-0 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                                    {card.imageUrl && (
                                      <img src={card.imageUrl} alt={card.title} className="w-full h-24 object-cover border-b border-slate-100" />
                                    )}
                                    <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                                      <div>
                                        <h4 className="text-xs font-black text-slate-900 truncate">{card.title || 'Untitled Card'}</h4>
                                        <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-semibold">{card.description || 'No description provided.'}</p>
                                      </div>
                                      {card.link || card.buttonUrl ? (
                                        <a
                                          href={card.link || card.buttonUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="block w-full py-1.5 text-center bg-[#fff1f1] hover:bg-red-100 text-[#ff0000] border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all mt-2"
                                        >
                                          {card.btnLabel || card.buttonText || 'View Detail'}
                                        </a>
                                      ) : (
                                        <span className="block w-full py-1.5 text-center bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-[10px] font-black uppercase tracking-wider mt-2">
                                          {card.btnLabel || card.buttonText || 'View Detail'}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="whitespace-pre-line leading-relaxed">{log.replyText}</p>
                            )}
                          </div>
                        )}

                        {(log.type === 'deleted' || log.type === 'hidden') && log.category && (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-red-700">Category:</span>
                              <span className="capitalize font-semibold text-red-800">{log.category}</span>
                              {log.confidence != null && (
                                <>
                                  <span className="text-slate-400"></span>
                                  <span className="font-bold text-slate-600">
                                    Confidence: {log.confidence > 1
                                      ? `${Math.round(log.confidence)}%`
                                      : `${Math.round(log.confidence * 100)}%`}
                                  </span>
                                </>
                              )}
                            </div>
                            {log.reason && (
                              <p className="text-slate-600 font-medium">
                                <span className="font-bold text-slate-700">Reason:</span> {log.reason}
                              </p>
                            )}
                          </div>
                        )}

                        {log.status === 'failed' && log.reason && log.type === 'replied' && (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-xs">
                            <p className="text-red-600 font-semibold">
                              <span className="font-bold">Error:</span> {log.reason}
                            </p>
                          </div>
                        )}

                        {/* Footer: Badges */}
                        <div className="flex items-center gap-2 flex-wrap border-t border-slate-100 pt-3">
                          {/* Type badge */}
                          {log.type === 'replied' && (
                            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase bg-[#fff1f1] text-[#ff0000] flex items-center gap-1">
                              <Send size={9} /> Replied
                            </span>
                          )}
                          {log.type === 'deleted' && (
                            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase bg-red-100 text-red-700 flex items-center gap-1">
                              <Trash2 size={9} /> Deleted
                            </span>
                          )}
                          {log.type === 'hidden' && (
                            <span className="px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase bg-[#fff8e1] text-[#b06000] flex items-center gap-1">
                              <Eye size={9} /> Hidden
                            </span>
                          )}

                          {/* Status badge */}
                          <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md uppercase flex items-center gap-1 ${
                            log.status === 'success'
                              ? 'bg-[#fff1f1] text-[#ff0000]'
                              : 'bg-rose-100 text-rose-700'
                          }`}>
                            {log.status === 'success'
                              ? <><CheckCircle size={9} /> Success</>
                              : <><AlertTriangle size={9} /> Failed</>}
                          </span>

                          {/* Trigger keyword if replied */}
                          {log.triggerKeyword && log.type === 'replied' && (
                            <span className="px-2.5 py-0.5 bg-[#fff1f1] text-[#ff0000] text-[10px] font-black rounded-md">
                              Keyword: {log.triggerKeyword}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {historyPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500 font-semibold">
                      Page {historyPage} of {historyPages} ({historyTotal} total)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        disabled={historyPage <= 1}
                        onClick={() => fetchHistoryLogs(historyPage - 1)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <button
                        disabled={historyPage >= historyPages}
                        onClick={() => fetchHistoryLogs(historyPage + 1)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/*  Test Rule Modal  */}
      <AnimatePresence>
        {testModalOpen && testingRule && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => { setTestModalOpen(false); setTestResult(null); }}
              className="fixed inset-0 bg-black/40  z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-md bg-white rounded-[28px] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-[#0f0f0f]">Test Rule: {testingRule.name}</h3>
                <button onClick={() => { setTestModalOpen(false); setTestResult(null); }} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
                  <X size={16} />
                </button>
              </div>
              <textarea
                value={testCommentText}
                onChange={e => setTestCommentText(e.target.value)}
                placeholder="Enter a sample comment to test"
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-[#0f0f0f] focus:outline-none resize-none"
              />
              <button
                onClick={handleRunTest}
                disabled={testingInProgress}
                className="w-full py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {testingInProgress ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                {testingInProgress ? 'Running' : 'Run Test'}
              </button>
              {testResult && (
                <div className={`p-4 rounded-2xl border text-sm font-medium ${testResult.matched ? 'bg-[#fff1f1] border-red-100 text-[#ff0000]' : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}>
                  <p className="font-black mb-1">{testResult.matched ? 'Rule Matched' : 'No Match'}</p>
                  {testResult.generatedReply && <p className="text-xs leading-relaxed">Reply: {testResult.generatedReply}</p>}
                  {testResult.reason && <p className="text-xs text-slate-500 mt-1">{testResult.reason}</p>}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/*  Content Picker Modal  */}
      <AnimatePresence>
        {contentPickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setContentPickerOpen(false)}
              className="fixed inset-0 bg-black/60  z-[200]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-2xl bg-white rounded-[22px] p-6 md:p-8 shadow-2xl space-y-6 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Select YouTube Content</h3>
                  <p className="text-xs text-slate-400 font-semibold">Choose the source for automation (Videos, Shorts, Posts)</p>
                </div>
                <button onClick={() => setContentPickerOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Option 1: All Videos (Channel-wide) */}
                  <div
                    onClick={() => {
                      setSelectedVideoId('all_videos');
                      setContentPickerOpen(false);
                      showToast('Target set to All Videos (Channel-wide)', 'info');
                    }}
                    className={`rounded-2xl border-2 p-3 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-square ${selectedVideoId === 'all_videos'
                        ? 'border-[#ff0000] bg-[#ff0000]/10 text-[#ff0000] font-black'
                        : 'border-slate-200 hover:border-red-200 text-slate-600 bg-slate-50'
                      }`}
                  >
                    <VideoIcon size={32} className="mb-2 text-[#ff0000]" />
                    <p className="text-xs font-black">All Videos & Shorts</p>
                    <p className="text-[10px] opacity-70 font-semibold mt-1">Channel-wide</p>
                  </div>

                  {/* Channel Videos / Shorts Grid */}
                  {videos.map(v => (
                    <div
                      key={v.videoId}
                      onClick={() => {
                        setSelectedVideoId(v.videoId);
                        setContentPickerOpen(false);
                        showToast(`Target set to: ${v.title?.substring(0, 20)}...`, 'info');
                      }}
                      className={`rounded-2xl border-2 overflow-hidden cursor-pointer transition-all relative group flex flex-col ${selectedVideoId === v.videoId
                          ? 'border-[#ff0000] ring-2 ring-red-500/20'
                          : 'border-slate-200 hover:border-red-200'
                        }`}
                    >
                      <div className="h-28 bg-slate-900 relative overflow-hidden">
                        {v.thumbnail ? (
                          <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 font-black">
                            <VideoIcon size={24} />
                          </div>
                        )}
                        {selectedVideoId === v.videoId && (
                          <div className="absolute top-2 right-2 bg-[#ff0000] text-white p-1 rounded-full shadow">
                            <Check size={12} />
                          </div>
                        )}
                      </div>
                      <div className="p-2.5 bg-white flex-1 flex flex-col justify-between">
                        <p className="text-xs font-black text-slate-800 line-clamp-2 leading-tight">{v.title || v.videoId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-slate-100 pt-4 gap-3">
                <button
                  onClick={() => setContentPickerOpen(false)}
                  className="px-6 py-2.5 bg-[#ff0000] text-white font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#cc0000] transition-all"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ModerationPage;





