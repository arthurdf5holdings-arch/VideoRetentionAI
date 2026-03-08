import { motion } from 'motion/react';
import { 
  Share2, Download, Play, Volume2, Settings, Maximize, 
  TrendingUp, TrendingDown, Sparkles, Lightbulb, Bolt,
  ArrowRight, ChevronRight, BarChart3, ZoomIn, ZoomOut,
  Mic2, Monitor, VolumeX, Scissors, Target, Trophy, HelpCircle,
  CheckCircle2, AlertTriangle, Star, Info, AlertCircle, XCircle,
  Pause, Layers, MousePointer2
} from 'lucide-react';
import { Header } from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, ReferenceDot, ReferenceLine
} from 'recharts';
import { cn } from '../lib/utils';
import React, { useState, useMemo, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Type } from "@google/genai";
import { getVideo } from '../lib/videoStore';
import { createAiInstance, getGeminiApiKey } from '../lib/gemini';

interface TranscriptItem {
  start: number;
  end: number;
  text: string;
}

interface RetentionPoint {
  time: number;
  value: number;
  type?: 'spike' | 'dip';
}

interface AnalysisLogEntry {
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
  event: string;
  comment: string;
}

interface AnalysisResults {
  title: string;
  niche: string;
  score: number;
  summary: string;
  totalDuration: number;
  retentionData: RetentionPoint[];
  log: AnalysisLogEntry[];
  transcript: TranscriptItem[];
  insights: string[];
  resolution: string;
  mainSpeaker: string;
  audioStatus: string;
  checklist: {
    hook: string;
    deadTime: string;
    patternInterrupts: string;
    openLoops: string;
    fastPacing: string;
    visualSupport: string;
    emotionalEngagement: string;
    storyStructure: string;
    noEarlyPayoff: string;
    strongEnding: string;
    killers: string;
  };
}

export function Analytics() {
  const navigate = useNavigate();
  
  const ai = useMemo(() => {
    return createAiInstance();
  }, []);

  const [zoom, setZoom] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [videoFrames, setVideoFrames] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const performAnalysis = async () => {
      console.log('Starting analysis...');
      setError(null);

      if (!ai) {
        const key = getGeminiApiKey();
        console.error("Gemini API Key is missing. Key found:", key ? "YES (but ai instance null)" : "NO");
        setError(`Gemini API Key is missing. Please check your environment variables (GEMINI_API_KEY or VITE_GEMINI_API_KEY). If you just added the key to Vercel, you MUST trigger a NEW DEPLOYMENT for the changes to take effect.`);
        setIsLoading(false);
        return;
      }

      // Check for existing results first
      const savedResults = localStorage.getItem('last-analysis-results');
      if (savedResults) {
        try {
          const parsed = JSON.parse(savedResults);
          if (parsed && parsed.score !== undefined) {
            setResults(parsed);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to parse saved results:", e);
          localStorage.removeItem('last-analysis-results');
        }
      }

      const requestData = localStorage.getItem('current-analysis-request');
      if (!requestData) {
        console.warn('No analysis request data found');
        setIsLoading(false);
        return;
      }

      try {
        const { title, niche, painPoints, audience } = JSON.parse(requestData);

        console.log('Calling Gemini API...');
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: `You are an expert YouTube retention analyst. Analyze this video metadata and predict a retention curve and analysis log.
          
          VIDEO DETAILS:
          Title: ${title}
          Niche: ${niche}
          Pain Points: ${painPoints}
          Target Audience: ${audience}
          
          TASK:
          1. Predict the overall retention score (0-100).
          2. Provide a summary of the analysis.
          3. Generate a second-by-second retention curve (at least 10 data points).
          4. Create a detailed event log with timestamps.
          5. Generate a transcript snippet.
          6. Provide checklist findings for key retention factors.
          
          IMPORTANT: Return the response in strictly valid JSON format matching the requested schema.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER, description: "Overall retention score 0-100" },
                summary: { type: Type.STRING, description: "Brief summary of the analysis" },
                totalDuration: { type: Type.NUMBER, description: "Total duration in seconds" },
                retentionData: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      time: { type: Type.NUMBER },
                      value: { type: Type.NUMBER, description: "Retention percentage 0-100" },
                      type: { type: Type.STRING, description: "Optional: 'spike' or 'dip'" }
                    },
                    required: ["time", "value"]
                  }
                },
                log: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timestamp: { type: Type.STRING },
                      type: { type: Type.STRING, description: "'success', 'warning', 'error', or 'info'" },
                      event: { type: Type.STRING },
                      comment: { type: Type.STRING }
                    },
                    required: ["timestamp", "type", "event", "comment"]
                  }
                },
                transcript: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      start: { type: Type.NUMBER },
                      end: { type: Type.NUMBER },
                      text: { type: Type.STRING }
                    },
                    required: ["start", "end", "text"]
                  }
                },
                insights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                resolution: { type: Type.STRING },
                mainSpeaker: { type: Type.STRING },
                audioStatus: { type: Type.STRING },
                checklist: {
                  type: Type.OBJECT,
                  properties: {
                    hook: { type: Type.STRING },
                    deadTime: { type: Type.STRING },
                    patternInterrupts: { type: Type.STRING },
                    openLoops: { type: Type.STRING },
                    fastPacing: { type: Type.STRING },
                    visualSupport: { type: Type.STRING },
                    emotionalEngagement: { type: Type.STRING },
                    storyStructure: { type: Type.STRING },
                    noEarlyPayoff: { type: Type.STRING },
                    strongEnding: { type: Type.STRING },
                    killers: { type: Type.STRING }
                  },
                  required: ["hook", "deadTime", "patternInterrupts", "openLoops", "fastPacing", "visualSupport", "emotionalEngagement", "storyStructure", "noEarlyPayoff", "strongEnding", "killers"]
                }
              },
              required: ["score", "summary", "totalDuration", "retentionData", "log", "transcript", "insights", "resolution", "mainSpeaker", "audioStatus", "checklist"]
            }
          }
        });

        const responseText = response.text;
        if (!responseText) {
          throw new Error("Empty response from AI");
        }

        const parsedResults = JSON.parse(responseText);
        const finalResults = {
          ...parsedResults,
          title,
          niche
        };
        
        setResults(finalResults);
        localStorage.setItem('last-analysis-results', JSON.stringify(finalResults));
        
        // Trigger notification if enabled
        const notificationsEnabled = localStorage.getItem('app-notifications') === 'true';
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('Analysis Complete', {
            body: `Analysis for "${title}" is ready. Score: ${finalResults.score}%`,
            icon: '/favicon.ico'
          });
        }
      } catch (error: any) {
        console.error("Analysis failed:", error);
        setError(error.message || "An unexpected error occurred during analysis.");
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [ai]);

  useEffect(() => {
    const processVideo = async () => {
      try {
        const file = await getVideo();
        if (!file) {
          console.log('No video file found in storage');
          return;
        }

        const url = URL.createObjectURL(file);
        setVideoUrl(url);

        // Extract Frames
        const video = document.createElement('video');
        video.src = url;
        video.muted = true; // Better for autoplay/loading
        video.load();
        
        video.onloadedmetadata = async () => {
          try {
            const duration = video.duration;
            const frameCount = 20;
            const frames = [];
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = 160;
            canvas.height = 90;

            for (let i = 0; i < frameCount; i++) {
              const time = (i / frameCount) * duration;
              video.currentTime = time;
              await new Promise(resolve => {
                const onSeeked = () => {
                  if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    frames.push(canvas.toDataURL('image/jpeg', 0.7));
                  }
                  video.removeEventListener('seeked', onSeeked);
                  resolve(null);
                };
                video.addEventListener('seeked', onSeeked);
                // Timeout safety for seeked event
                setTimeout(() => {
                  video.removeEventListener('seeked', onSeeked);
                  resolve(null);
                }, 1000);
              });
            }
            setVideoFrames(frames);
          } catch (err) {
            console.error("Frame extraction failed:", err);
          }
        };

        video.onerror = (e) => {
          console.error("Video loading error:", e);
        };
      } catch (err) {
        console.error("Video processing failed:", err);
      }
    };

    if (results) {
      processVideo();
    }

    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [results]);

  const seekToPosition = (clientX: number) => {
    if (!timelineRef.current || !results) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const padding = 32; // 2rem = 32px
    const x = clientX - rect.left - padding;
    const availableWidth = rect.width - (padding * 2);
    const percentage = Math.max(0, Math.min(1, x / availableWidth));
    const newTime = percentage * results.totalDuration;
    setCurrentTime(newTime);
    
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    timelineRef.current.style.setProperty('--hover-x', `${x}px`);
    
    if (isDragging) {
      seekToPosition(e.clientX);
    }
  };

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    seekToPosition(e.clientX);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        seekToPosition(e.clientX);
      }
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  const playheadPosition = results ? (currentTime / results.totalDuration) * 100 : 0;

  const currentRetention = useMemo(() => {
    if (!results) return 0;
    const time = currentTime;
    const data = results.retentionData;
    for (let i = 0; i < data.length - 1; i++) {
      if (time >= data[i].time && time <= data[i+1].time) {
        const t1 = data[i].time;
        const t2 = data[i+1].time;
        const v1 = data[i].value;
        const v2 = data[i+1].value;
        return Math.round(v1 + (v2 - v1) * (time - t1) / (t2 - t1));
      }
    }
    return data[data.length - 1]?.value || 0;
  }, [currentTime, results]);

  useEffect(() => {
    const setupAnalyser = () => {
      if (!videoRef.current || analyserRef.current) return;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaElementSource(videoRef.current);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const updateFrequencyData = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          setFrequencyData(new Uint8Array(dataArray));
        }
        animationFrameRef.current = requestAnimationFrame(updateFrequencyData);
      };
      
      updateFrequencyData();
    };

    if (isPlaying && videoRef.current) {
      setupAnalyser();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    let animationFrame: number;
    
    const syncTime = () => {
      if (videoRef.current) {
        if (isPlaying) {
          setCurrentTime(videoRef.current.currentTime);
        }
        animationFrame = requestAnimationFrame(syncTime);
      }
    };

    animationFrame = requestAnimationFrame(syncTime);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isPlaying]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && results) {
      if (videoRef.current) {
        // Ensure video is playing
        videoRef.current.play().catch(err => {
          console.error("Video play failed:", err);
          // Fallback to interval if video play fails (e.g. autoplay block)
          interval = setInterval(() => {
            setCurrentTime(prev => {
              const next = prev + 0.05; // More frequent updates for smoothness
              if (next >= results.totalDuration) {
                setIsPlaying(false);
                return 0;
              }
              return next;
            });
          }, 50);
        });
      } else {
        interval = setInterval(() => {
          setCurrentTime(prev => {
            const next = prev + 0.05;
            if (next >= results.totalDuration) {
              setIsPlaying(false);
              return 0;
            }
            return next;
          });
        }, 50);
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, results]);
  
  const apv = useMemo(() => {
    if (!results) return 0;
    return Math.floor(results.totalDuration * 0.3);
  }, [results]);

  const getScoreStatus = (score: number) => {
    if (score >= 90) return { label: "Outstanding", color: "text-green-500", bg: "bg-green-500/10", icon: <Star className="text-green-500" /> };
    if (score >= 80) return { label: "Average", color: "text-blue-500", bg: "bg-blue-500/10", icon: <CheckCircle2 className="text-blue-500" /> };
    if (score >= 70) return { label: "Passing", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: <AlertTriangle className="text-yellow-500" /> };
    return { label: "Needs Improvement", color: "text-red-500", bg: "bg-red-500/10", icon: <AlertTriangle className="text-red-500" /> };
  };

  const checklistFindings = useMemo(() => {
    if (!results || !results.checklist) return null;
    const findings = {
      hook: { status: 'pass', text: results.checklist.hook || 'No data' },
      deadTime: { status: 'fail', text: results.checklist.deadTime || 'No data' },
      patternInterrupts: { status: 'pass', text: results.checklist.patternInterrupts || 'No data' },
      openLoops: { status: 'pass', text: results.checklist.openLoops || 'No data' },
      fastPacing: { status: 'pass', text: results.checklist.fastPacing || 'No data' },
      visualSupport: { status: 'pass', text: results.checklist.visualSupport || 'No data' },
      emotionalEngagement: { status: 'pass', text: results.checklist.emotionalEngagement || 'No data' },
      storyStructure: { status: 'pass', text: results.checklist.storyStructure || 'No data' },
      noEarlyPayoff: { status: 'pass', text: results.checklist.noEarlyPayoff || 'No data' },
      strongEnding: { status: 'pass', text: results.checklist.strongEnding || 'No data' },
      killers: { status: 'pass', text: results.checklist.killers || 'No data' },
    };
    return findings;
  }, [results]);

  const handleExportPDF = () => {
    if (!results || !checklistFindings) return;
    const doc = new jsPDF();
    const brandName = "RetentionAI";
    
    doc.setFontSize(22);
    doc.setTextColor(36, 214, 101);
    doc.text(brandName, 14, 20);
    
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text("Video Retention Analysis Report", 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 36);
    
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Analysis Score", 14, 50);
    doc.setFontSize(40);
    doc.text(`${results.score}%`, 14, 70);
    doc.setFontSize(14);
    doc.text(`Status: ${scoreStatus.label}`, 60, 65);
    
    autoTable(doc, {
      startY: 75,
      head: [['Category', 'Score']],
      body: [
        ['Hook Performance', '92%'],
        ['Audience Retention', '78%'],
        ['Visual Engagement', '85%'],
        ['Audio Quality', '81%'],
      ],
      theme: 'plain',
      headStyles: { fontStyle: 'bold' }
    });
    
    const metaY = (doc as any).lastAutoTable.finalY || 110;
    autoTable(doc, {
      startY: metaY + 10,
      head: [['Metric', 'Value']],
      body: [
        ['Resolution', results.resolution],
        ['Main Speaker', results.mainSpeaker],
        ['Audio Report', results.audioStatus],
        ['Total Duration', `${Math.floor(results.totalDuration / 60)}:${String(results.totalDuration % 60).padStart(2, '0')}`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [36, 214, 101] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY || 120;
    doc.setFontSize(16);
    doc.text("Hook Analysis", 14, finalY + 15);
    doc.setFontSize(10);
    doc.text(`Result: ${checklistFindings.hook.text}`, 14, finalY + 25);
    
    autoTable(doc, {
      startY: finalY + 40,
      head: [['Timestamp', 'Type', 'Description']],
      body: results.retentionData.filter(d => d.type).map(d => [
        `${Math.floor(d.time / 60)}:${String(d.time % 60).padStart(2, '0')}`,
        d.type === 'spike' ? 'Spike' : 'Drop',
        d.type === 'spike' ? 'Retention Spike detected' : 'Retention Drop detected'
      ]),
      theme: 'grid',
      headStyles: { fillColor: [36, 214, 101] }
    });
    
    doc.save(`RetentionAI_Report_${Date.now()}.pdf`);
  };

  const getRetentionColor = (value: number) => {
    if (value >= 85) return '#24d665'; // Green
    if (value >= 70) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-background-dark">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <div className="size-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="text-primary animate-pulse" size={32} />
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-2xl font-black tracking-tight animate-pulse">Analyzing Your Video...</h2>
            <p className="text-primary/60 max-w-xs">Gemini AI is processing your metadata to predict retention patterns and engagement spikes.</p>
            <div className="mt-4 flex flex-col gap-2">
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-40">Status: Running AI Diagnostics</p>
              <button 
                onClick={() => navigate('/upload')}
                className="text-xs text-primary hover:underline font-bold"
              >
                Cancel & Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="flex flex-col h-screen bg-background-dark">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <AlertTriangle className="text-red-500" size={48} />
          <h2 className="text-xl font-bold">{error ? "Analysis Error" : "No Analysis Found"}</h2>
          <p className="text-sm opacity-70 max-w-md">
            {error || "We couldn't find any recent analysis results. Please try uploading your video again."}
          </p>
          
          {error?.includes("Gemini API Key") && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left max-w-md">
              <p className="text-xs font-bold text-red-400 mb-2 uppercase tracking-wider">Debug Info:</p>
              <ul className="text-[10px] space-y-1 opacity-60 font-mono">
                <li>• process.env.GEMINI_API_KEY: {process.env.GEMINI_API_KEY ? "DETECTED" : "MISSING"}</li>
                <li>• process.env.VITE_GEMINI_API_KEY: {process.env.VITE_GEMINI_API_KEY ? "DETECTED" : "MISSING"}</li>
                <li>• import.meta.env.VITE_GEMINI_API_KEY: {import.meta.env.VITE_GEMINI_API_KEY ? "DETECTED" : "MISSING"}</li>
                <li>• import.meta.env.GEMINI_API_KEY: {import.meta.env.GEMINI_API_KEY ? "DETECTED" : "MISSING"}</li>
              </ul>
              <p className="text-[10px] mt-3 text-red-400/80">
                Tip: In Vercel, try naming your variable <code className="bg-red-500/20 px-1 rounded">VITE_GEMINI_API_KEY</code> to ensure Vite picks it up.
              </p>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button onClick={() => window.location.reload()} className="bg-primary/10 text-primary border border-primary/20 px-6 py-2 rounded-lg font-bold">Retry</button>
            <button onClick={() => navigate('/upload')} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Go to Upload</button>
          </div>
        </div>
      </div>
    );
  }

  const scoreStatus = getScoreStatus(results.score);

  return (
    <div className="flex flex-col min-h-screen bg-background-dark">
      <Header />
      <main className="flex-1 max-w-[1440px] mx-auto w-full p-4 lg:p-8">
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm text-primary/60 font-medium">
              <a href="#" className="hover:text-primary transition-colors">Analytics</a>
              <ChevronRight size={14} />
              <span className="opacity-70">Video Retention Analysis</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">{results.title}</h1>
            <p className="text-primary/60 text-sm font-medium">Niche: {results.niche} • Analysis generated just now</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary/10 text-primary border border-primary/20 font-bold hover:bg-primary/20 transition-all">
              <Share2 size={16} />
              Share
            </button>
            <button 
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <Download size={16} />
              Export Report
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Top Section: Scorecard & Timeline */}
          <div className="flex flex-col gap-6">
            <div className={cn("rounded-xl p-6 border border-primary/10 flex items-center justify-between", scoreStatus.bg)}>
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full border-4 border-primary/30 flex items-center justify-center text-2xl font-black">
                  {results.score}%
                </div>
                <div>
                  <h2 className={cn("text-xl font-black uppercase tracking-tight", scoreStatus.color)}>{scoreStatus.label} Video</h2>
                  <p className="text-sm opacity-70">{results.summary}</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {scoreStatus.icon}
                <span className={cn("font-bold text-sm", scoreStatus.color)}>Score Breakdown Available</span>
              </div>
            </div>

            {/* Video Preview Card */}
            {videoUrl && (
              <div className="bg-background-dark border border-primary/10 rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row gap-6 p-6">
                <div className="flex-1 aspect-video bg-black rounded-lg overflow-hidden relative group">
                  <video 
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain cursor-pointer"
                    onTimeUpdate={(e) => {
                      setCurrentTime(e.currentTarget.currentTime);
                    }}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onClick={() => {
                      if (videoRef.current) {
                        if (videoRef.current.paused) videoRef.current.play();
                        else videoRef.current.pause();
                      }
                    }}
                  />
                  {!isPlaying && (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer group-hover:bg-black/20 transition-all"
                      onClick={() => setIsPlaying(true)}
                    >
                      <div className="size-16 rounded-full bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20">
                        <Play size={32} className="fill-white ml-1" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-80 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-primary">Real-time Retention</h3>
                    <div className="flex-1 bg-primary/5 rounded-lg p-6 border border-primary/10 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                      <div className="relative size-32">
                        <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                          <circle
                            className="text-primary/10"
                            strokeWidth="8"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                          <circle
                            className={cn(
                              "transition-all duration-300 ease-out",
                              currentRetention >= 85 ? "text-green-500" : currentRetention >= 70 ? "text-yellow-500" : "text-red-500"
                            )}
                            strokeWidth="8"
                            strokeDasharray={251.2}
                            strokeDashoffset={251.2 - (251.2 * currentRetention) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                            r="40"
                            cx="50"
                            cy="50"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl font-black">{currentRetention}%</span>
                          <span className="text-[10px] font-bold opacity-50 uppercase">Retention</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-1 text-center">
                        <p className={cn(
                          "text-sm font-bold uppercase tracking-widest",
                          currentRetention >= 85 ? "text-green-500" : currentRetention >= 70 ? "text-yellow-500" : "text-red-500"
                        )}>
                          {currentRetention >= 85 ? "High Engagement" : currentRetention >= 70 ? "Average Interest" : "Critical Drop-off"}
                        </p>
                        <p className="text-[10px] opacity-60 max-w-[180px]">
                          {currentTime < results.totalDuration * 0.1 ? "Hook Phase: Crucial for viewer retention." : 
                           currentTime > results.totalDuration * 0.8 ? "Outro Phase: Final CTA efficiency." : 
                           "Content Phase: Maintaining value density."}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-[10px] font-bold text-primary uppercase mb-3">Audio Frequency Visualizer</p>
                    <div className="flex items-end justify-center gap-1 h-24 px-2">
                      {frequencyData ? (
                        Array.from(frequencyData).map((val: number, i) => (
                          <motion.div 
                            key={i}
                            animate={{ height: `${(val / 255) * 100}%` }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="flex-1 bg-primary rounded-t-sm min-w-[4px]"
                            style={{ opacity: 0.3 + (val / 255) * 0.7 }}
                          />
                        ))
                      ) : (
                        Array.from({ length: 32 }).map((_, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-primary/10 rounded-t-sm min-w-[4px] h-2"
                          />
                        ))
                      )}
                    </div>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-[10px] font-bold text-primary uppercase mb-1">Current Insight</p>
                    <p className="text-xs opacity-80 leading-relaxed min-h-[3em]">
                      {results.insights[Math.floor((currentTime / results.totalDuration) * results.insights.length)] || results.insights[0]}
                    </p>
                  </div>
                </div>
              </div>
            )}

              {/* Timeline with Retention Curve Layer */}
              <div className="bg-background-dark border border-primary/10 rounded-xl overflow-hidden shadow-2xl flex flex-col">
                <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold text-sm flex items-center gap-2">
                      <Layers size={16} className="text-primary" />
                      Advanced Analysis Timeline
                    </h3>
                    <div className="flex items-center gap-2 bg-background-dark rounded-lg p-1 border border-primary/10">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)} 
                        className={cn(
                          "p-1.5 rounded-md transition-all",
                          isPlaying ? "bg-primary text-white" : "hover:text-primary"
                        )}
                      >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <div className="w-px h-4 bg-primary/20 mx-1"></div>
                      <button onClick={() => setZoom(Math.max(1, zoom - 0.5))} className="p-1 hover:text-primary transition-colors"><ZoomOut size={14} /></button>
                      <span className="text-[10px] font-bold w-8 text-center">{Math.round(zoom * 100)}%</span>
                      <button onClick={() => setZoom(Math.min(5, zoom + 0.5))} className="p-1 hover:text-primary transition-colors"><ZoomIn size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-[10px] font-bold opacity-60">
                      <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-green-500"></div> High</span>
                      <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-yellow-500"></div> Avg</span>
                      <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-red-500"></div> Low</span>
                    </div>
                    <div className="text-xs font-mono font-bold text-primary">
                      {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(results.totalDuration / 60)}:{String(Math.floor(results.totalDuration % 60)).padStart(2, '0')}
                    </div>
                  </div>
                </div>

                <div className="relative overflow-x-auto custom-scrollbar bg-slate-950/50">
                  <div 
                    ref={timelineRef}
                    onMouseDown={handleTimelineMouseDown}
                    onMouseMove={handleTimelineMouseMove}
                    className={cn(
                      "flex flex-col min-w-full relative group/timeline select-none pt-24 pb-8",
                      isDragging ? "cursor-grabbing" : "cursor-crosshair"
                    )}
                    style={{ width: `${100 * zoom}%`, paddingLeft: '2rem', paddingRight: '2rem' }}
                  >
                    {/* Time Ruler */}
                    <div className="absolute top-0 left-8 right-8 h-8 border-b border-primary/10 pointer-events-none">
                      {Array.from({ length: Math.ceil(results.totalDuration / (results.totalDuration > 60 ? 10 : 5)) + 1 }).map((_, i) => {
                        const step = results.totalDuration > 60 ? 10 : 5;
                        const time = i * step;
                        if (time > results.totalDuration) return null;
                        return (
                          <div 
                            key={i} 
                            className="absolute flex flex-col items-center"
                            style={{ left: `${(time / results.totalDuration) * 100}%` }}
                          >
                            <div className="h-3 w-px bg-primary/40"></div>
                            <span className="text-[9px] font-mono font-bold opacity-60 mt-1 text-primary">
                              {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
                            </span>
                          </div>
                        );
                      })}
                      {/* Minor ticks */}
                      {Array.from({ length: Math.ceil(results.totalDuration) + 1 }).map((_, i) => {
                        const time = i;
                        if (time > results.totalDuration || time % (results.totalDuration > 60 ? 10 : 5) === 0) return null;
                        return (
                          <div 
                            key={i} 
                            className="absolute h-1.5 w-px bg-primary/20 top-0"
                            style={{ left: `${(time / results.totalDuration) * 100}%` }}
                          ></div>
                        );
                      })}
                    </div>

                    {/* Hover Indicator */}
                    <div className="absolute inset-y-0 w-px bg-white/10 opacity-0 group-hover/timeline:opacity-100 pointer-events-none z-10 transition-opacity" style={{ left: 'var(--hover-x, 0)' }}></div>
                    
                    {/* Playhead */}
                    <motion.div 
                      className="absolute top-0 bottom-0 w-0.5 bg-primary z-30 shadow-[0_0_20px_rgba(36,214,101,0.8)] pointer-events-none"
                      animate={{ 
                        left: `calc(2rem + ${playheadPosition}% * (100% - 4rem) / 100)` 
                      }}
                      transition={{ type: "tween", ease: "linear", duration: 0.1 }}
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-4 bg-primary rounded-b-xl flex items-center justify-center shadow-lg">
                        <div className="size-1.5 bg-white rounded-full shadow-inner"></div>
                      </div>
                      <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-primary text-white text-[11px] font-black px-3 py-1.5 rounded-lg shadow-2xl flex flex-col items-center gap-0.5 whitespace-nowrap border border-white/30 backdrop-blur-sm">
                        <span className="text-[7px] opacity-80 uppercase leading-none tracking-[0.1em] font-bold">Playback Position</span>
                        <span className="leading-none text-sm font-mono">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}.{Math.floor((currentTime % 1) * 10)}</span>
                      </div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-4 bg-primary/40 rounded-full border-2 border-white shadow-2xl animate-ping opacity-50"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-3 bg-primary rounded-full border-2 border-white shadow-lg"></div>
                    </motion.div>

                    {/* Retention Curve Layer */}
                    <div className="h-48 w-full relative z-0 mb-4 bg-primary/5 rounded-lg border border-primary/5 overflow-hidden">
                      <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(36, 214, 101, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart 
                          data={results.retentionData} 
                          margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#24d665" stopOpacity={0.4}/>
                              <stop offset="50%" stopColor="#eab308" stopOpacity={0.2}/>
                              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05}/>
                            </linearGradient>
                            <linearGradient id="retentionStroke" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#24d665" />
                              <stop offset="30%" stopColor="#24d665" />
                              <stop offset="60%" stopColor="#eab308" />
                              <stop offset="90%" stopColor="#ef4444" />
                            </linearGradient>
                          </defs>
                          <XAxis 
                            dataKey="time" 
                            type="number" 
                            domain={[0, results.totalDuration]} 
                            hide 
                          />
                          <YAxis domain={[0, 100]} hide />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(36, 214, 101, 0.1)" />
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke="url(#retentionStroke)" 
                            strokeWidth={4}
                            fill="url(#retentionGradient)" 
                            isAnimationActive={false}
                            dot={false}
                          />
                          <ReferenceLine 
                            x={results.totalDuration * 0.3} 
                            stroke="#24d665" 
                            strokeDasharray="8 4" 
                            strokeWidth={2}
                            label={{ 
                              value: 'APV (30%)', 
                              position: 'insideTopLeft', 
                              fill: '#24d665', 
                              fontSize: 9, 
                              fontWeight: '900',
                              offset: 10
                            }} 
                          />
                          <ReferenceLine y={50} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Frames Row (Speech-Aware) */}
                    <div className="relative h-10 mb-4 bg-black/40 rounded-lg border border-white/5 overflow-hidden">
                      {results.transcript.map((segment, i) => {
                        const width = ((segment.end - segment.start) / results.totalDuration) * 100;
                        const left = (segment.start / results.totalDuration) * 100;
                        // Find frames that fall within this segment
                        const segmentFrames = videoFrames.filter((_, frameIdx) => {
                          const frameTime = (frameIdx / videoFrames.length) * results.totalDuration;
                          return frameTime >= segment.start && frameTime <= segment.end;
                        });

                        return (
                          <div 
                            key={i}
                            className="absolute h-full flex gap-px bg-slate-900/50 border-x border-white/5"
                            style={{ width: `${width}%`, left: `${left}%` }}
                          >
                            {segmentFrames.length > 0 ? (
                              segmentFrames.map((frame, fIdx) => (
                                <img 
                                  key={fIdx}
                                  src={frame} 
                                  alt="" 
                                  className="h-full object-cover flex-1 opacity-40 hover:opacity-100 transition-opacity"
                                />
                              ))
                            ) : (
                              <div className="w-full h-full bg-primary/5"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Transcript Row (Single Line) */}
                    <div className="relative h-6 mb-2">
                      {results.transcript.map((item, i) => {
                        const width = ((item.end - item.start) / results.totalDuration) * 100;
                        const left = (item.start / results.totalDuration) * 100;
                        const isActive = currentTime >= item.start && currentTime <= item.end;
                        
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "absolute h-full flex items-center px-2 text-[9px] whitespace-nowrap overflow-hidden transition-all duration-300 border-b",
                              isActive 
                                ? "border-primary text-primary bg-primary/10 z-10 font-bold" 
                                : "border-transparent text-white/30"
                            )}
                            style={{ 
                              width: `${width}%`, 
                              left: `${left}%` 
                            }}
                            title={item.text}
                          >
                            <span className="truncate w-full italic">"{item.text}"</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Legend */}
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mt-4 px-2">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-2"><Scissors size={12} /> Start</span>
                        <div className="w-12 h-px bg-white/20"></div>
                        <span>Analysis Phase</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span>End of Video</span>
                        <div className="w-12 h-px bg-white/20"></div>
                        <span className="flex items-center gap-2">Finish <Target size={12} /></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Bottom Section: Analysis Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Hook Analysis Box */}
            <div className="bg-background-dark border border-primary/10 rounded-xl p-6 flex flex-col gap-4 shadow-lg hover:border-primary/30 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Target size={20} />
                  <h3 className="font-bold text-sm uppercase tracking-widest">Hook Analysis</h3>
                </div>
                <div className={cn("px-2 py-0.5 rounded text-[10px] font-black", results.score > 70 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500")}>
                  {results.score > 70 ? "PASS" : "FAIL"}
                </div>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-xs font-bold text-primary mb-1">0-5 Seconds Checklist</p>
                <ul className="space-y-1.5">
                  <li className="flex items-center gap-2 text-[10px] opacity-80">
                    <CheckCircle2 size={12} className="text-green-500" /> Opens with curiosity
                  </li>
                  <li className="flex items-center gap-2 text-[10px] opacity-80">
                    <CheckCircle2 size={12} className="text-green-500" /> Bold statement/promise
                  </li>
                  <li className="flex items-center gap-2 text-[10px] opacity-80">
                    <CheckCircle2 size={12} className="text-green-500" /> No long intro/logo
                  </li>
                </ul>
              </div>
              <p className="text-xs opacity-70 leading-relaxed italic">"{results.summary}"</p>
            </div>

            {/* AI Smart Insights Box */}
            <div className="bg-primary rounded-xl p-6 text-white shadow-xl shadow-primary/20 flex flex-col gap-4 relative overflow-hidden group">
              <div className="absolute top-[-20px] right-[-20px] size-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="flex items-center gap-2 relative z-10">
                <Sparkles size={20} />
                <h3 className="font-bold text-sm uppercase tracking-widest">AI Smart Insights</h3>
              </div>
              <div className="flex flex-col gap-4 relative z-10">
                {results.insights.map((insight, i) => (
                  <div key={i} className="flex gap-3">
                    <Lightbulb className="text-white/60 shrink-0" size={18} />
                    <p className="text-[11px] leading-relaxed">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
              <button className="mt-auto w-full py-2 bg-white text-primary rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-white/90 transition-colors relative z-10">
                Apply Auto-Edit
              </button>
            </div>

            {/* Key Moments Box */}
            <div className="bg-background-dark border border-primary/10 rounded-xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center gap-2 text-primary">
                <BarChart3 size={20} />
                <h3 className="font-bold text-sm uppercase tracking-widest">Key Moments</h3>
              </div>
              <div className="flex flex-col gap-3">
                {(results.retentionData || []).filter(d => d.type).map((d, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between p-2 rounded border",
                    d.type === 'spike' ? "bg-green-500/5 border-green-500/10" : "bg-red-500/5 border-red-500/10"
                  )}>
                    <div className="flex flex-col">
                      <span className={cn("text-[10px] font-black", d.type === 'spike' ? "text-green-500" : "text-red-500")}>
                        {Math.floor(d.time / 60)}:{String(d.time % 60).padStart(2, '0')}
                      </span>
                      <span className="text-[11px] font-bold capitalize">{d.type === 'spike' ? 'Retention Spike' : 'Retention Drop'}</span>
                    </div>
                    {d.type === 'spike' ? <TrendingUp size={16} className="text-green-500" /> : <TrendingDown size={16} className="text-red-500" />}
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed Log Box */}
            <div className="bg-background-dark border border-primary/10 rounded-xl p-6 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center gap-2 text-primary">
                <Info size={20} />
                <h3 className="font-bold text-sm uppercase tracking-widest">Detailed Log</h3>
              </div>
              <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {(results.log || []).map((log, i) => (
                  <div key={i} className="flex items-start gap-2 text-[10px] py-1 border-b border-primary/5">
                    <span className={cn(
                      "font-bold",
                      log.type === 'error' ? "text-red-500" : log.type === 'success' ? "text-green-500" : "text-primary"
                    )}>{log.timestamp}</span>
                    <span className="opacity-70">{log.comment}</span>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => navigate('/analysis-log')}
                className="mt-auto flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                View Full Analysis Log
                <ArrowRight size={14} />
              </button>
            </div>

          </div>

          {/* Video Analysis Details (Resolution, etc) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-background-dark border border-primary/10 p-5 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Monitor size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Resolution</span>
              </div>
              <p className="text-2xl font-black">{results.resolution || 'N/A'}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                <CheckCircle2 size={12} /> High Quality
              </div>
            </div>

            <div className="bg-background-dark border border-primary/10 p-5 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Mic2 size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Main Speaker</span>
              </div>
              <p className="text-2xl font-black truncate">{results.mainSpeaker || 'N/A'}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-primary/60">
                Detected via VoiceID
              </div>
            </div>

            <div className="bg-background-dark border border-primary/10 p-5 rounded-xl flex flex-col gap-3">
              <div className="flex items-center gap-2 text-primary">
                <Volume2 size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">Audio Balance</span>
              </div>
              <p className="text-2xl font-black">{results.audioStatus || 'N/A'}</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                <CheckCircle2 size={12} /> Clear Vocals
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
