import { motion } from 'motion/react';
import { CloudUpload, FileVideo, Info, Sparkles, Eye, PlayCircle } from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import React, { useState, useRef } from 'react';
import { saveVideo } from '../lib/videoStore';

export function UploadPage() {
  const navigate = useNavigate();
  const [selectedNiche, setSelectedNiche] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoPainPoints, setVideoPainPoints] = useState('');
  const [audienceDescription, setAudienceDescription] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  
  const [audienceProfiles] = useState(() => {
    return JSON.parse(localStorage.getItem('audience-profiles') || '[]');
  });

  const handleProfileChange = (id: string) => {
    setSelectedProfileId(id);
    if (id === 'manual') {
      setAudienceDescription('');
    } else {
      const profile = audienceProfiles.find((p: any) => p.id === id);
      if (profile) {
        setAudienceDescription(profile.description);
      }
    }
  };

  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setVideoTitle(file.name.split('.').slice(0, -1).join('.'));
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (selectedFile) {
      await saveVideo(selectedFile);
    }
    
    const analysisData = {
      title: videoTitle || (selectedFile ? selectedFile.name : 'Untitled Video'),
      niche: selectedNiche,
      painPoints: videoPainPoints,
      audience: audienceDescription,
      fileName: selectedFile?.name,
      fileSize: selectedFile?.size,
      timestamp: new Date().toISOString()
    };
    
    localStorage.removeItem('last-analysis-results');
    localStorage.setItem('current-analysis-request', JSON.stringify(analysisData));

    // Check if notifications are enabled
    const notificationsEnabled = localStorage.getItem('app-notifications') === 'true';
    
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      // We'll let the Analytics page handle the actual notification after Gemini finishes
    }
    
    navigate('/analytics');
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-[1200px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black tracking-tight">Upload Video & Details</h1>
              <p className="opacity-70">Our AI will analyze your content to predict retention and engagement.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Upload Section */}
              <div className="flex flex-col gap-6">
                <div 
                  onClick={triggerFileSelect}
                  className="flex flex-col items-center justify-center gap-6 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 px-6 py-12 text-center hover:border-primary/50 transition-all cursor-pointer group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="video/*"
                  />
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <CloudUpload size={40} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-lg font-bold">
                      {selectedFile ? selectedFile.name : "Drag and drop your video"}
                    </p>
                    <p className="text-sm opacity-50 uppercase tracking-wider font-semibold">
                      {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : "MP4, MOV OR AVI (MAX 2GB)"}
                    </p>
                  </div>
                  <button className="bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-8 rounded-lg transition-colors shadow-lg shadow-primary/20">
                    {selectedFile ? "Change File" : "Select File"}
                  </button>
                </div>

                {/* YouTube Option */}
                <div className="flex flex-col gap-3 p-6 rounded-xl border border-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                      <PlayCircle size={20} />
                    </div>
                    <p className="text-sm font-bold">Import from YouTube</p>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="Paste YouTube video URL..."
                      className="flex-1 h-11 px-4 rounded-lg bg-background-dark border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-100 text-sm"
                    />
                    <button className="h-11 px-4 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-all text-sm">
                      Import
                    </button>
                  </div>
                </div>

                {/* Transcript Upload */}
                <div className="flex flex-col gap-4 p-6 rounded-xl border-2 border-dashed border-primary/20 bg-primary/5 text-center hover:border-primary/40 transition-all cursor-pointer group">
                  <div className="flex items-center justify-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <FileVideo size={20} />
                    </div>
                    <p className="text-sm font-bold">Upload Transcript or SRT (Optional)</p>
                  </div>
                  <p className="text-[10px] opacity-50 uppercase tracking-widest font-semibold">TXT, SRT OR VTT (MAX 10MB)</p>
                  <button className="text-xs font-bold text-primary hover:underline">
                    Browse Files
                  </button>
                </div>

                {/* Progress Mockup */}
                <div className="bg-primary/5 rounded-xl p-4 flex items-center gap-4 border border-primary/10">
                  <div className="size-10 bg-primary/20 rounded flex items-center justify-center">
                    <FileVideo className="text-primary" size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-300">vlog_final_draft.mp4</span>
                      <span className="text-xs font-bold text-primary">75%</span>
                    </div>
                    <div className="w-full bg-primary/10 rounded-full h-1.5">
                      <div className="bg-primary h-1.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Details Form */}
              <div className="flex flex-col gap-6 bg-primary/5 p-6 rounded-xl border border-primary/10">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileVideo className="text-primary" size={24} />
                  Video Metadata
                </h2>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Video Title</label>
                    <input 
                      type="text"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                      placeholder="Enter the title of your video..."
                      className="w-full h-11 px-4 rounded-lg bg-background-dark border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-100"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Pain Point or Intended Wins</label>
                    <textarea 
                      value={videoPainPoints}
                      onChange={(e) => setVideoPainPoints(e.target.value)}
                      placeholder="What problem does this video solve or what is the intended win for the viewer?"
                      className="w-full p-4 rounded-lg bg-background-dark border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-100 resize-none"
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Video Niche</label>
                    <select 
                      value={selectedNiche}
                      onChange={(e) => setSelectedNiche(e.target.value)}
                      className="w-full h-11 px-4 rounded-lg bg-background-dark border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-100 appearance-none"
                    >
                      <option disabled value="">Select a category</option>
                      <option value="gaming">Gaming</option>
                      <option value="education">Education / Tutorials</option>
                      <option value="vlog">Lifestyle / Vlog</option>
                      <option value="tech">Technology</option>
                      <option value="finance">Finance / Business</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  {selectedNiche === 'other' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="flex flex-col gap-1.5"
                    >
                      <label className="text-sm font-semibold text-slate-300">Specify Niche</label>
                      <input 
                        type="text"
                        placeholder="Enter your specific niche..."
                        className="w-full h-11 px-4 rounded-lg bg-background-dark border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-100"
                      />
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Target Audience Profile</label>
                    <select 
                      value={selectedProfileId}
                      onChange={(e) => handleProfileChange(e.target.value)}
                      className="w-full h-11 px-4 rounded-lg bg-background-dark border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-100 appearance-none"
                    >
                      <option value="manual">Manual Description (No Profile)</option>
                      {audienceProfiles.map((profile: any) => (
                        <option key={profile.id} value={profile.id}>{profile.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-300">Target Audience Description</label>
                    <textarea 
                      value={audienceDescription}
                      onChange={(e) => setAudienceDescription(e.target.value)}
                      className="w-full p-4 rounded-lg bg-background-dark border border-primary/20 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-slate-100 resize-none"
                      placeholder="e.g. 18-24 year olds interested in sustainable living and DIY projects..."
                      rows={4}
                    />
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg">
                    <Info className="text-primary shrink-0" size={20} />
                    <p className="text-xs text-slate-400 leading-snug">
                      Adding more details helps the AI understand the context and provides a more accurate retention score.
                    </p>
                  </div>

                  <button 
                    onClick={handleAnalyze}
                    className="mt-4 flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white font-black text-lg py-4 rounded-lg transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-xl uppercase tracking-widest shadow-primary/20"
                  >
                    <span>Analyze Retention</span>
                    <Sparkles size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Uploads */}
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-4">Your Recent Uploads</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { name: 'Intro to AI Design.mp4', time: 'Analyzed 2h ago', color: 'from-primary/20 to-primary/5' },
                  { name: 'Vlog 045 Summer.mp4', time: 'Analyzed 1d ago', color: 'from-slate-400/20 to-slate-400/5' },
                  { name: 'Gaming Highlights.mp4', time: 'Analyzed 3d ago', color: 'from-primary/30 to-background-dark' }
                ].map((video) => (
                  <div key={video.name} className="flex items-center gap-3 p-3 rounded-lg border border-primary/10 hover:bg-primary/5 transition-colors cursor-pointer group">
                    <div className="w-16 h-10 rounded bg-slate-800 flex-shrink-0 relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Eye className="text-primary" size={14} />
                      </div>
                      <div className={cn("w-full h-full bg-gradient-to-br", video.color)}></div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold truncate">{video.name}</span>
                      <span className="text-[10px] text-slate-500 uppercase">{video.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
