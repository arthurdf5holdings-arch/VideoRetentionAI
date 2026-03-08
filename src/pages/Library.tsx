import { motion } from 'motion/react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  PlayCircle, 
  Clock, 
  Eye, 
  BarChart2,
  Trash2,
  Download,
  Users,
  MapPin,
  GraduationCap,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const initialProjects = [
  { id: 1, title: "How to scale SaaS in 2024", date: "Feb 21, 2024", views: "1.2M", duration: "11:23", score: 88, thumbnail: "https://picsum.photos/seed/saas/400/225" },
  { id: 2, title: "Intro to AI Design Principles", date: "Feb 18, 2024", views: "450K", duration: "08:45", score: 92, thumbnail: "https://picsum.photos/seed/ai/400/225" },
  { id: 3, title: "10 Productivity Hacks for Devs", date: "Feb 15, 2024", views: "890K", duration: "15:10", score: 75, thumbnail: "https://picsum.photos/seed/prod/400/225" },
  { id: 4, title: "Crypto Market Analysis Q1", date: "Feb 10, 2024", views: "2.1M", duration: "22:05", score: 64, thumbnail: "https://picsum.photos/seed/crypto/400/225" },
  { id: 5, title: "Cooking Masterclass: Pasta", date: "Feb 05, 2024", views: "120K", duration: "12:30", score: 95, thumbnail: "https://picsum.photos/seed/pasta/400/225" },
  { id: 6, title: "Travel Vlog: Tokyo 2024", date: "Jan 28, 2024", views: "3.4M", duration: "18:45", score: 81, thumbnail: "https://picsum.photos/seed/tokyo/400/225" },
];

export function Library() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'projects' | 'audiences'>('projects');
  const [audienceProfiles, setAudienceProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const profiles = JSON.parse(localStorage.getItem('audience-profiles') || '[]');
    setAudienceProfiles(profiles);
  }, []);

  const deleteProfile = (id: string) => {
    const updated = audienceProfiles.filter(p => p.id !== id);
    setAudienceProfiles(updated);
    localStorage.setItem('audience-profiles', JSON.stringify(updated));
  };

  const filteredProjects = initialProjects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAudiences = audienceProfiles.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-black tracking-tight">Library</h1>
                <p className="opacity-70">Manage your analyzed projects and saved audience profiles.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    type="text" 
                    placeholder={`Search ${activeTab}...`} 
                    className="h-10 pl-10 pr-4 rounded-lg bg-primary/5 border border-primary/10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64 transition-all"
                    style={{ color: 'inherit' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-primary/10">
              <button 
                onClick={() => setActiveTab('projects')}
                className={cn(
                  "pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative",
                  activeTab === 'projects' ? "text-primary" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Projects
                {activeTab === 'projects' && <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
              </button>
              <button 
                onClick={() => setActiveTab('audiences')}
                className={cn(
                  "pb-4 px-2 text-sm font-bold uppercase tracking-widest transition-all relative",
                  activeTab === 'audiences' ? "text-primary" : "text-slate-500 hover:text-slate-300"
                )}
              >
                Audience Profiles
                {activeTab === 'audiences' && <motion.div layoutId="tab-underline" className="absolute bottom-0 inset-x-0 h-0.5 bg-primary" />}
              </button>
            </div>

            {activeTab === 'projects' ? (
              searchQuery ? (
                /* List View when searching */
                <div className="flex flex-col gap-2">
                  <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-black uppercase tracking-widest opacity-40">
                    <div className="col-span-6">Project Name</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Views</div>
                    <div className="col-span-2 text-right">Score</div>
                  </div>
                  {filteredProjects.map((project) => (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => navigate('/analytics')}
                      className="grid grid-cols-12 items-center px-4 py-3 bg-primary/5 border border-primary/10 rounded-lg hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="col-span-6 flex items-center gap-3">
                        <div className="size-8 rounded bg-slate-800 overflow-hidden shrink-0">
                          <img src={project.thumbnail} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <span className="text-sm font-bold group-hover:text-primary transition-colors">{project.title}</span>
                      </div>
                      <div className="col-span-2 text-xs opacity-60">{project.date}</div>
                      <div className="col-span-2 text-xs opacity-60">{project.views}</div>
                      <div className="col-span-2 text-right">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-[10px] font-black">
                          {project.score}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                  {filteredProjects.length === 0 && (
                    <div className="py-20 text-center opacity-40 uppercase tracking-widest text-xs font-bold">
                      No projects match your search
                    </div>
                  )}
                </div>
              ) : (
                /* Grid View by default */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {initialProjects.map((project, idx) => (
                    <motion.div 
                      key={project.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-primary/5 border border-primary/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all shadow-lg hover:shadow-primary/5"
                    >
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={project.thumbnail} 
                          alt={project.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                          <button 
                            onClick={() => navigate('/analytics')}
                            className="p-3 bg-primary text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                          >
                            <BarChart2 size={24} />
                          </button>
                          <button className="p-3 bg-white text-background-dark rounded-full shadow-xl hover:scale-110 transition-transform">
                            <PlayCircle size={24} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 rounded text-[10px] font-bold text-white backdrop-blur-sm">
                          {project.duration}
                        </div>
                        <div className="absolute top-3 left-3 px-2 py-1 bg-primary/90 rounded text-[10px] font-black text-white shadow-lg">
                          SCORE: {project.score}
                        </div>
                      </div>
                      
                      <div className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-1">
                            {project.title}
                          </h3>
                          <button className="opacity-50 hover:opacity-100 transition-colors">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Clock size={12} /> {project.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye size={12} /> {project.views}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors">
                            <Download size={14} /> Report
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAudiences.map((profile, idx) => (
                  <motion.div 
                    key={profile.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group bg-primary/5 border border-primary/10 rounded-2xl p-6 hover:border-primary/30 transition-all shadow-lg hover:shadow-primary/5 flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          <Users size={20} />
                        </div>
                        <h3 className="font-bold group-hover:text-primary transition-colors">{profile.name}</h3>
                      </div>
                      <button className="opacity-50 hover:opacity-100 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <MapPin size={12} className="text-primary" />
                        {profile.locations.length > 0 ? profile.locations.join(', ') : 'Global'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <GraduationCap size={12} className="text-primary" />
                        {profile.education || 'Any Education'}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <DollarSign size={12} className="text-primary" />
                        {profile.income || 'Any Income'}
                      </div>
                    </div>

                    <div className="p-3 bg-background-dark/50 rounded-lg border border-primary/5">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle size={12} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Pain Points</span>
                      </div>
                      <p className="text-xs italic opacity-80 line-clamp-2">{profile.painPoints || 'No pain points defined.'}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-primary/10 mt-auto">
                      <button 
                        onClick={() => navigate('/audience-builder')}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button 
                        onClick={() => deleteProfile(profile.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
                {audienceProfiles.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4 opacity-40">
                    <Users size={48} />
                    <p className="font-bold uppercase tracking-widest text-sm">No audience profiles found</p>
                    <button 
                      onClick={() => navigate('/audience-builder')}
                      className="text-xs font-black text-primary hover:underline"
                    >
                      CREATE YOUR FIRST PROFILE
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
