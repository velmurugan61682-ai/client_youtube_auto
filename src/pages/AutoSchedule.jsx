import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar, 
  Sliders, 
  Sparkles, 
  Loader2,
  PlaySquare,
  FileVideo,
  Youtube,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';

const AutoSchedule = ({ channels = [], selectedChannelId, setSelectedChannelId }) => {
  const [activeChannel, setActiveChannel] = useState(selectedChannelId || channels[0]?.channelId || '');
  
  // Form inputs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoId, setVideoId] = useState('');
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');
  const [uploadError, setUploadError] = useState('');
  
  // Schedulers state
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const [manualTime, setManualTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [scheduleResult, setScheduleResult] = useState(null);
  
  // Queue list state
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(true);

  // Sync active channel from props if it changes
  useEffect(() => {
    if (selectedChannelId) {
      setActiveChannel(selectedChannelId);
    }
  }, [selectedChannelId]);

  // Load schedule queue and poll every 30s
  useEffect(() => {
    if (activeChannel) {
      fetchQueue();
      const interval = setInterval(fetchQueue, 30000);
      return () => clearInterval(interval);
    } else {
      setLoadingQueue(false);
    }
  }, [activeChannel]);

  const fetchQueue = async () => {
    try {
      const res = await api.get('/deepseek/schedule-queue', {
        params: { channelId: activeChannel }
      });
      setQueue(res.data || []);
    } catch (err) {
      console.error('Failed to fetch schedule queue:', err);
    } finally {
      setLoadingQueue(false);
    }
  };

  // Stats computation
  const queuedCount = queue.filter(item => item.status === 'scheduled' || item.status === 'pending' || item.status === 'publishing').length;
  const publishedCount = queue.filter(item => item.status === 'published').length;
  const failedCount = queue.filter(item => item.status === 'failed').length;
  const nextPublishItem = queue
    .filter(item => item.status === 'scheduled')
    .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))[0];

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!activeChannel) {
      alert('Please select a channel first.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStatus('Uploading to server...');
    setUploadError('');
    setVideoId('');

    const formData = new FormData();
    formData.append('video', file);
    formData.append('channelId', activeChannel);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await api.post('/deepseek/upload-video', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30 * 60 * 1000, // 30 minutes timeout for this request
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
          if (percentCompleted === 100) {
            setUploadStatus('Publishing to YouTube...');
          }
        },
      });

      setVideoId(response.data.videoId);
      setUploadStatus('Uploaded successfully!');
    } catch (err) {
      console.error('Video upload failed:', err);
      const errMsg = err.response?.data?.error || 'Failed to upload video';
      setUploadError(errMsg);
      setUploadStatus('Failed');
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleAutoSchedule = async () => {
    if (!activeChannel) {
      alert('Please select a channel first.');
      return;
    }
    if (!videoId) {
      alert('Please upload a video first.');
      return;
    }
    try {
      setLoading(true);
      setScheduleResult(null);
      const res = await api.post('/deepseek/analyze-schedule', {
        channelId: activeChannel,
        videoId
      });
      setScheduleResult(res.data);
      fetchQueue();
      // Clear inputs
      setTitle('');
      setDescription('');
      setVideoId('');
      setUploadStatus('');
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'AI analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSchedule = async () => {
    if (!activeChannel) {
      alert('Please select a channel first.');
      return;
    }
    if (!videoId) {
      alert('Please upload a video first.');
      return;
    }
    if (!manualTime) {
      alert('Please select a publication date and time.');
      return;
    }
    try {
      setLoading(true);
      setScheduleResult(null);
      const res = await api.post('/deepseek/confirm-schedule', {
        channelId: activeChannel,
        videoId,
        scheduledTime: manualTime
      });
      setScheduleResult(res.data);
      fetchQueue();
      // Clear inputs
      setTitle('');
      setDescription('');
      setVideoId('');
      setManualTime('');
      setUploadStatus('');
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || 'Failed to confirm manual schedule.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-[1440px] mx-auto space-y-6 md:space-y-8 pb-10"
    >
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#ff0000]/5 text-[#ff0000] rounded-2xl">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-[#0f0f0f] tracking-tighter">Auto-Schedule</h1>
            <p className="text-[13px] md:text-[14px] text-[#606060] font-medium mt-0.5">
              Deepseek analyzes watch time and publishes at the best moment.
            </p>
          </div>
        </div>

        {channels.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#909090] uppercase tracking-wider">Channel:</span>
            <select 
              value={activeChannel} 
              onChange={(e) => {
                setActiveChannel(e.target.value);
                if (setSelectedChannelId) setSelectedChannelId(e.target.value);
              }}
              className="bg-white border border-[#e5e5e5] rounded-xl px-4 py-2 text-sm font-bold text-[#0f0f0f] shadow-sm outline-none cursor-pointer hover:border-[#ff0000]/30 transition-all"
            >
              {channels.map(c => <option key={c.channelId} value={c.channelId}>{c.title}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Queued */}
        <div className="bg-white rounded-[32px] border border-[#f0f0f0] p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-blue-50" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-[14px] bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
              <Clock size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-[28px] font-black text-[#0f0f0f] tracking-tighter leading-none">
              {queuedCount}
            </h3>
            <p className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em]">Queued</p>
          </div>
          <div className="mt-6 pt-5 border-t border-[#f8f8f8] flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2ba640] animate-pulse" />
              <span className="text-[10px] font-bold text-[#aaaaaa]">Real-time Track</span>
            </div>
          </div>
        </div>

        {/* Card 2: Published */}
        <div className="bg-white rounded-[32px] border border-[#f0f0f0] p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-green-50" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-[14px] bg-green-50 text-[#2ba640] flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
              <CheckCircle2 size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-[28px] font-black text-green-600 tracking-tighter leading-none">
              {publishedCount}
            </h3>
            <p className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em]">Published</p>
          </div>
          <div className="mt-6 pt-5 border-t border-[#f8f8f8] flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#2ba640] animate-pulse" />
              <span className="text-[10px] font-bold text-[#aaaaaa]">Real-time Track</span>
            </div>
          </div>
        </div>

        {/* Card 3: Failed */}
        <div className="bg-white rounded-[32px] border border-[#f0f0f0] p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-red-50" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-[14px] bg-red-50 text-[#d93025] flex items-center justify-center transition-transform group-hover:scale-110 duration-500">
              <XCircle size={22} strokeWidth={2.5} />
            </div>
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="text-[28px] font-black text-red-600 tracking-tighter leading-none">
              {failedCount}
            </h3>
            <p className="text-[10px] font-black text-[#909090] uppercase tracking-[0.2em]">Failed</p>
          </div>
          <div className="mt-6 pt-5 border-t border-[#f8f8f8] flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#d93025] animate-pulse" />
              <span className="text-[10px] font-bold text-[#aaaaaa]">Real-time Track</span>
            </div>
          </div>
        </div>

        {/* Card 4: Next Publish (Dark) */}
        <div className="bg-[#0f0f0f] rounded-[32px] p-6 shadow-xl shadow-black/10 relative overflow-hidden group col-span-1 min-h-[160px] flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
            <Clock size={100} className="text-white" fill="white" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white">
              <Clock size={20} />
            </div>
            <div className="mt-4">
              <h3 className="text-white text-[15px] font-black uppercase tracking-widest leading-snug mb-1">
                Next Publish
              </h3>
              <p className="text-white/60 text-xs font-semibold leading-relaxed">
                {nextPublishItem 
                  ? `${new Date(nextPublishItem.scheduledTime).toLocaleString()}` 
                  : 'None Scheduled'}
              </p>
              {nextPublishItem && (
                <span className="inline-block mt-2 text-[9px] font-black text-white uppercase bg-white/10 px-2 py-0.5 rounded tracking-tighter">
                  {nextPublishItem.mode} Mode
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scheduler settings card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="yt-card lg:col-span-2 !p-6 space-y-6">
          <div>
            <h3 className="text-lg font-black text-[#0f0f0f]">Schedule New Video</h3>
            <p className="text-[11px] text-[#909090] font-medium">Specify the video properties to publish on YouTube.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#606060] uppercase tracking-widest">Video Title (Recommended)</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="yt-input" 
                placeholder="e.g. My Awesome Vlog" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#606060] uppercase tracking-widest">Video Description</label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="yt-input min-h-[46px] resize-none" 
                placeholder="Brief description of the content..." 
              />
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#606060] uppercase tracking-widest">Upload Video</label>
            <div 
              {...getRootProps()} 
              className={`border-2 border-dashed rounded-[24px] p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive 
                  ? 'border-[#ff0000] bg-[#ff0000]/5' 
                  : uploading
                    ? 'border-[#e5e5e5] bg-[#f9f9f9] cursor-not-allowed'
                    : 'border-[#e5e5e5] bg-white hover:border-[#ff0000]/30'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDragActive ? 'bg-[#ff0000]/10 text-[#ff0000]' : 'bg-gray-50 text-gray-400'}`}>
                  <UploadCloud size={24} />
                </div>
                <div>
                  <p className="text-sm font-black text-[#0f0f0f]">
                    {isDragActive ? 'Drop your video here' : 'Drag & drop your video here, or click to browse'}
                  </p>
                  <p className="text-[11px] text-[#909090] font-medium mt-1">
                    Supports MP4, MOV, AVI, MKV (up to 2GB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Status Card */}
          {(uploading || uploadProgress > 0 || videoId || uploadError) && (
            <div className="bg-[#f9f9f9] border border-[#f0f0f0] rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 shrink-0 border border-gray-200">
                  <FileVideo size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-black text-[#0f0f0f] truncate">
                    {uploadStatus}
                  </p>
                  {uploadProgress > 0 && !videoId && !uploadError && (
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-[#ff0000] h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                  {videoId && (
                    <p className="text-[11px] text-green-600 font-bold mt-1">
                      YouTube Video ID: {videoId}
                    </p>
                  )}
                  {uploadError && (
                    <p className="text-[11px] text-[#d93025] font-bold mt-1">
                      Error: {uploadError}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {uploadProgress > 0 && uploadProgress < 100 && !uploadError && (
                  <span className="text-xs font-black text-[#606060]">{uploadProgress}%</span>
                )}
                {uploadStatus === 'Publishing to YouTube...' && (
                  <Loader2 className="animate-spin text-[#ff0000]" size={20} />
                )}
                {videoId && (
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                  </div>
                )}
                {uploadError && (
                  <button 
                    onClick={() => {
                      setUploadError('');
                      setUploadStatus('');
                      setUploadProgress(0);
                      setVideoId('');
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Selector options card */}
          <div className="border-t border-[#f0f0f0] pt-6 space-y-4">
            <label className="text-[11px] font-black text-[#0f0f0f] uppercase tracking-widest block">Choose Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Auto */}
              <button 
                onClick={() => setMode('auto')}
                className={`p-5 rounded-[24px] border text-left flex flex-col justify-between transition-all duration-300 ${
                  mode === 'auto' 
                    ? 'border-[#ff0000] bg-[#ff0000]/5 ring-1 ring-[#ff0000]' 
                    : 'border-[#e5e5e5] bg-white hover:border-[#ff0000]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mode === 'auto' ? 'bg-[#ff0000] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Sparkles size={16} />
                  </div>
                  <span className="text-[10px] font-black text-[#ff0000] uppercase tracking-widest bg-[#ff0000]/10 px-2 py-0.5 rounded">AI Recommend</span>
                </div>
                <h4 className="text-sm font-black text-[#0f0f0f]">Auto (Deepseek picks)</h4>
                <p className="text-[11px] text-[#606060] font-medium mt-1">Deepseek analyzes viewer statistics to recommend the single best hour.</p>
              </button>

              {/* Option 2: Manual */}
              <button 
                onClick={() => setMode('manual')}
                className={`p-5 rounded-[24px] border text-left flex flex-col justify-between transition-all duration-300 ${
                  mode === 'manual' 
                    ? 'border-[#ff0000] bg-[#ff0000]/5 ring-1 ring-[#ff0000]' 
                    : 'border-[#e5e5e5] bg-white hover:border-[#ff0000]/30'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mode === 'manual' ? 'bg-[#ff0000] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Sliders size={16} />
                  </div>
                </div>
                <h4 className="text-sm font-black text-[#0f0f0f]">Manual (I set it)</h4>
                <p className="text-[11px] text-[#606060] font-medium mt-1">Directly configure the date and time you wish to publish.</p>
              </button>
            </div>

            {/* Inputs based on selection */}
            <div className="pt-4">
              {mode === 'manual' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#606060] uppercase tracking-widest">Publish Datetime</label>
                    <input 
                      type="datetime-local" 
                      value={manualTime}
                      onChange={(e) => setManualTime(e.target.value)}
                      className="yt-input cursor-pointer" 
                    />
                  </div>
                  <button 
                    onClick={handleManualSchedule}
                    disabled={loading || !videoId}
                    className="yt-btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Calendar size={16} />}
                    Confirm Schedule
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleAutoSchedule}
                  disabled={loading || !videoId}
                  className="yt-btn-primary w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                  Run Deepseek Analytics & Schedule
                </button>
              )}
            </div>
          </div>
        </div>

        {/* AI response details card */}
        <div className="yt-card !p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Sparkles className="text-[#ff0000]" size={20} />
              <h3 className="text-base font-black text-[#0f0f0f]">Optimization Feed</h3>
            </div>
            
            <AnimatePresence mode="wait">
              {scheduleResult ? (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                    <h4 className="text-xs font-black text-green-700 uppercase tracking-widest mb-1">Upload Scheduled</h4>
                    <p className="text-[12px] text-green-800 font-semibold leading-relaxed">
                      Scheduled for {new Date(scheduleResult.scheduledTime).toLocaleString()}
                    </p>
                    <span className="text-[10px] text-green-600 block mt-1 font-medium">
                      Deepseek will publish this automatically.
                    </span>
                  </div>

                  <div className="p-4 bg-[#f9f9f9] border border-[#f0f0f0] rounded-2xl space-y-1">
                    <span className="text-[9px] font-black text-[#909090] uppercase tracking-widest">Reasoning</span>
                    <p className="text-xs text-[#0f0f0f] font-semibold leading-relaxed">{scheduleResult.reason}</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="idle"
                  className="h-full flex flex-col items-center justify-center text-center opacity-40 py-10"
                >
                  <Sparkles size={40} className="mb-2 text-[#ff0000]" />
                  <p className="text-xs font-bold uppercase tracking-wider text-[#909090]">Awaiting schedule action</p>
                  <p className="text-[10px] font-medium text-[#aaaaaa] mt-1 max-w-[200px] mx-auto">
                    Fill the form and select a scheduling method to view optimized stats.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="p-4 bg-[#fff8e1] border border-[#ffe082] rounded-2xl flex items-start gap-3 mt-6">
            <div className="bg-[#f9ab00] p-1.5 rounded-lg text-white flex-shrink-0">
              <AlertCircle size={14} />
            </div>
            <p className="text-[10px] font-medium text-[#795548] leading-tight">
              <b>Publication Rule:</b> Automations run every minute. Videos are scheduled in UTC. Please verify timezone offsets.
            </p>
          </div>
        </div>
      </div>

      {/* Queue Table */}
      <div className="yt-card !p-0 overflow-hidden shadow-xl border-[#f0f0f0]">
        <div className="flex items-center gap-3 p-6 bg-white border-b border-[#f0f0f0]">
          <Youtube size={16} className="text-[#ff0000]" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0f0f0f]">Scheduled Queue</span>
        </div>

        <div className="w-full overflow-x-auto no-scrollbar">
          <table className="w-full border-separate border-spacing-0 min-w-[1000px]">
            <thead>
              <tr className="bg-[#fcfcfc]">
                <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Video Identifier</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Scheduled For</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Mode</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Status</th>
                <th className="text-left py-5 px-6 text-[10px] font-black text-[#909090] uppercase tracking-[0.15em] border-b border-[#f0f0f0]">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {loadingQueue ? (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <Loader2 className="animate-spin text-[#ff0000] mx-auto mb-2" size={32} />
                    <span className="text-[10px] font-black text-[#909090] uppercase tracking-widest">Loading queue...</span>
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-20">
                    <div className="flex flex-col items-center gap-3 opacity-30">
                      <PlaySquare size={48} className="text-[#909090]" />
                      <p className="text-sm font-black uppercase tracking-widest text-[#909090]">No scheduled videos found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                queue.map((item, i) => (
                  <tr 
                    key={item._id}
                    className="group transition-all hover:bg-[#fcfcfc] border-b border-[#f0f0f0]"
                  >
                    <td className="py-6 px-6 align-top">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 shrink-0 border border-gray-200">
                          {item.videoId ? <Youtube size={20} /> : <FileVideo size={20} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[14px] font-black text-[#0f0f0f] truncate max-w-[280px]">
                            {item.videoId ? `YouTube ID: ${item.videoId}` : item.fileName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-6 px-6 align-top">
                      <span className="text-[13px] font-bold text-[#0f0f0f]">
                        {new Date(item.scheduledTime).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-6 px-6 align-top">
                      <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg border border-gray-200">
                        {item.mode}
                      </span>
                    </td>
                    <td className="py-6 px-6 align-top">
                      <div className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-xl border ${
                        item.status === 'published' ? 'bg-green-50 text-green-600 border-green-100' : 
                        item.status === 'scheduled' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        item.status === 'failed' ? 'bg-red-50 text-red-600 border-red-100' : 
                        'bg-gray-50 text-[#909090] border-gray-100'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'published' ? 'bg-green-500' : 
                          item.status === 'scheduled' ? 'bg-amber-500' :
                          item.status === 'failed' ? 'bg-red-500' : 
                          'bg-gray-400'
                        }`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {['pending', 'publishing'].includes(item.status) ? 'Publishing' : item.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-6 align-top max-w-[300px]">
                      <p className="text-[11px] font-semibold text-[#606060] leading-relaxed">
                        {item.status === 'failed' ? item.errorMessage : item.reason}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AutoSchedule;
