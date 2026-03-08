import { motion } from 'motion/react';
import { 
  ArrowLeft, Clock, MessageSquare, ShieldCheck, 
  CheckCircle2, AlertCircle, XCircle, Sparkles, Trophy
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const fullLog = [
  { timestamp: "0:00", type: "success", event: "Hook Started", comment: "Bold statement used: 'This one mistake is why most founders fail'." },
  { timestamp: "0:05", type: "success", event: "Hook Completed", comment: "Curiosity loop opened successfully. Retention at 98%." },
  { timestamp: "0:12", type: "info", event: "Pattern Interrupt", comment: "Camera angle switch. Maintained visual interest." },
  { timestamp: "0:15", type: "info", event: "Open Loop", comment: "Teased 'exact protocol' to be revealed later." },
  { timestamp: "0:25", type: "success", event: "Visual Support", comment: "Revenue chart overlay shown. High engagement spike." },
  { timestamp: "0:45", type: "error", event: "Dead Time Detected", comment: "6-second gap with no audio or visual change. Retention dropped 4%." },
  { timestamp: "0:51", type: "warning", event: "Filler Word", comment: "Used 'um' during transition. Minor distraction." },
  { timestamp: "1:20", type: "info", event: "Pattern Interrupt", comment: "B-roll footage of SaaS dashboard introduced." },
  { timestamp: "2:10", type: "info", event: "Emotional Engagement", comment: "Mentioned 'pain points' to increase stakes." },
  { timestamp: "2:45", type: "success", event: "Major Win", comment: "Case study reveal. Retention peaked at 92%." },
  { timestamp: "3:30", type: "info", event: "Pattern Interrupt", comment: "Text graphic overlay: 'CAC Optimization'." },
  { timestamp: "4:12", type: "error", event: "Significant Drop", comment: "Sponsor segment started. Audience loss detected." },
  { timestamp: "5:30", type: "info", event: "Story Structure", comment: "Transitioned from problem to solution phase." },
  { timestamp: "6:45", type: "warning", event: "Pacing Issue", comment: "Explanation became too technical. Slight dip in engagement." },
  { timestamp: "8:15", type: "success", event: "Retention Recovery", comment: "Q&A preview teased. Viewers returned to the video." },
  { timestamp: "10:30", type: "info", event: "Pattern Interrupt", comment: "Final summary graphic introduced." },
  { timestamp: "11:10", type: "success", event: "Strong Ending", comment: "Clear CTA with curiosity for next video. High click-through potential." },
];

export function AnalysisLog() {
  const navigate = useNavigate();
  const results = JSON.parse(localStorage.getItem('last-analysis-results') || 'null');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={16} />;
      case 'warning': return <AlertCircle className="text-yellow-500" size={16} />;
      case 'error': return <XCircle className="text-red-500" size={16} />;
      default: return <Sparkles className="text-primary" size={16} />;
    }
  };

  const getTypeBg = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/20';
      case 'error': return 'bg-red-500/10 border-red-500/20';
      default: return 'bg-primary/10 border-primary/20';
    }
  };

  if (!results) {
    return (
      <div className="flex flex-col h-screen bg-background-dark">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle className="text-yellow-500" size={48} />
          <h2 className="text-xl font-bold">No Analysis Found</h2>
          <button onClick={() => navigate('/upload')} className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Go to Upload</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl mx-auto"
          >
            <button 
              onClick={() => navigate('/analytics')}
              className="flex items-center gap-2 text-primary hover:underline mb-8 font-bold uppercase tracking-widest text-xs"
            >
              <ArrowLeft size={16} />
              Back to Analytics
            </button>

            <div className="flex items-center justify-between mb-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight">Full Analysis Log</h1>
                <p className="opacity-70">Second-by-second breakdown of video performance and AI insights for "{results.title}".</p>
              </div>
              <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <ShieldCheck size={28} />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {results.log.map((log: any, i: number) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl border ${getTypeBg(log.type)} backdrop-blur-sm transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-center gap-3 md:w-32 shrink-0">
                    <div className="p-2 bg-background-dark/50 rounded-lg text-primary">
                      <Clock size={14} />
                    </div>
                    <span className="font-black text-sm tracking-tighter">{log.timestamp}</span>
                  </div>

                  <div className="flex items-center gap-3 md:w-48 shrink-0">
                    {getTypeIcon(log.type)}
                    <span className="font-bold text-xs uppercase tracking-widest">{log.event}</span>
                  </div>

                  <div className="flex-1 flex items-start gap-3">
                    <MessageSquare size={14} className="opacity-30 mt-0.5 shrink-0" />
                    <p className="text-sm opacity-80 leading-relaxed italic">"{log.comment}"</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-12 p-8 rounded-[32px] bg-primary text-white shadow-2xl shadow-primary/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Final AI Verdict</h3>
                <p className="text-sm opacity-90 leading-relaxed max-w-2xl">
                  {results.summary}
                </p>
                <div className="flex gap-4 pt-4">
                  <div className="bg-white/20 px-4 py-2 rounded-full text-xs font-bold">Score: {results.score}/100</div>
                  <div className="bg-white/20 px-4 py-2 rounded-full text-xs font-bold">Duration: {Math.floor(results.totalDuration / 60)}:{String(Math.floor(results.totalDuration % 60)).padStart(2, '0')}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
