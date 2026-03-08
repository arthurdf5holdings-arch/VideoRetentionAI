import { motion } from 'motion/react';
import { 
  Lightbulb, 
  Newspaper, 
  History, 
  ExternalLink, 
  RefreshCw,
  PlayCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useState, useEffect } from 'react';
import { createAiInstance } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Tip {
  title: string;
  content: string;
  source?: string;
  url?: string;
}

export function Home() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = createAiInstance();
      if (!ai) {
        setError("Gemini API Key is missing. Please check your environment variables and ensure you have redeployed after adding the key. Tip: In Vercel, try naming your variable VITE_GEMINI_API_KEY.");
        setLoading(false);
        return;
      }
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Provide 3 latest and highly effective tips for video creators: one about improving video hooks, one about audience retention strategies, and one specific tip from professional video editors for other editors. Include a brief title and a 2-sentence explanation for each. If possible, mention a source or reference.",
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text;
      // Simple parsing logic - in a real app we'd use responseSchema but search grounding doesn't support it well with complex text
      // For this demo, we'll just treat the whole text as the content if parsing fails
      const lines = text?.split('\n').filter(l => l.trim().length > 0) || [];
      
      // Fallback if parsing is too complex for a simple regex
      setTips([{
        title: "Latest Creator Insights",
        content: text || "No tips found at the moment.",
      }]);

      // Try to extract URLs from grounding metadata
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks && chunks.length > 0) {
        // We could map these back to tips if we had a more structured response
      }

    } catch (err) {
      console.error(err);
      setError("Failed to fetch latest tips. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const previousProjects = [
    { id: 1, title: "SaaS Scaling Guide 2024", date: "2 days ago", views: "1.2M", duration: "11:23", thumbnail: "https://picsum.photos/seed/saas/200/120" },
    { id: 2, title: "AI Design Principles", date: "5 days ago", views: "450K", duration: "08:45", thumbnail: "https://picsum.photos/seed/ai/200/120" },
    { id: 3, title: "Productivity Hacks", date: "1 week ago", views: "890K", duration: "15:10", thumbnail: "https://picsum.photos/seed/prod/200/120" },
    { id: 4, title: "Crypto Market Analysis", date: "2 weeks ago", views: "2.1M", duration: "22:05", thumbnail: "https://picsum.photos/seed/crypto/200/120" },
  ];

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-[1200px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
          >
            {/* Hero Section */}
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-black tracking-tight">Welcome, Creator</h1>
              <p className="opacity-70">Here's what's happening in the world of video retention today.</p>
            </div>

            {/* Knowledge / Tip Box */}
            <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-500/50 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-background-dark border border-primary/20 rounded-2xl p-6 md:p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Newspaper size={24} />
                    </div>
                    <h2 className="text-xl font-bold">Creator Knowledge Hub</h2>
                  </div>
                  <button 
                    onClick={fetchTips}
                    disabled={loading}
                    className="flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={cn(loading && "animate-spin")} />
                    REFRESH NEWS
                  </button>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="size-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm text-slate-500 font-medium">Scanning the web for the latest insights...</p>
                  </div>
                ) : error ? (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                    {tips.map((tip, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex flex-col gap-3"
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 p-1.5 bg-primary/20 rounded-full text-primary">
                            <Lightbulb size={16} />
                          </div>
                          <div className="flex flex-col gap-2">
                            <h3 className="text-lg font-bold">{tip.title}</h3>
                            <div className="opacity-70 text-sm leading-relaxed whitespace-pre-wrap prose prose-invert max-w-none" style={{ color: 'inherit' }}>
                              {tip.content}
                            </div>
                            {tip.url && (
                              <a 
                                href={tip.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline mt-2"
                              >
                                READ FULL ARTICLE <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Previous Projects Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <History size={24} />
                  </div>
                  <h2 className="text-xl font-bold">Previous Projects</h2>
                </div>
                <button className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                  VIEW ALL <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {previousProjects.map((project, idx) => (
                  <motion.div 
                    key={project.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-primary/10 mb-3">
                      <img 
                        src={project.thumbnail} 
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlayCircle className="text-white" size={48} />
                      </div>
                      <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white">
                        {project.duration}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="text-sm font-bold truncate group-hover:text-primary transition-colors">
                        {project.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {project.date}
                        </span>
                        <span>{project.views} VIEWS</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
