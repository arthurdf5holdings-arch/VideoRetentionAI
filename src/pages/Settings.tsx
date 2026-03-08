import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  Palette, 
  Languages, 
  Moon, 
  Sun, 
  Monitor,
  Check,
  Globe,
  ArrowLeft,
  Video
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { useLocation, useNavigate } from 'react-router-dom';

type Theme = 'light' | 'medium' | 'dark';
type Language = 'en' | 'es' | 'fr' | 'de' | 'jp';

export function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const fromAnalytics = location.state?.from === '/analytics';

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('app-theme') as Theme) || 'dark';
  });
  
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('app-language') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('theme-light', 'theme-medium', 'theme-dark');
    root.classList.add(`theme-${theme}`);
    
    // For Tailwind dark mode support
    if (theme === 'dark' || theme === 'medium') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const themes = [
    { id: 'light', name: 'Light Skin', icon: Sun, description: 'Clean and bright interface' },
    { id: 'medium', name: 'Medium Skin', icon: Monitor, description: 'Balanced slate gray tones' },
    { id: 'dark', name: 'Dark Skin', icon: Moon, description: 'Deep contrast for focus' },
  ];

  const languages = [
    { id: 'en', name: 'English', native: 'English' },
    { id: 'es', name: 'Spanish', native: 'Español' },
    { id: 'fr', name: 'French', native: 'Français' },
    { id: 'de', name: 'German', native: 'Deutsch' },
    { id: 'jp', name: 'Japanese', native: '日本語' },
  ];

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-[800px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
          >
            <div className="flex flex-col gap-2 relative">
              {fromAnalytics && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => navigate('/analytics')}
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-xs font-black uppercase tracking-widest mb-4 group"
                >
                  <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Video Analysis
                </motion.button>
              )}
              <h1 className="text-3xl font-black tracking-tight">Settings</h1>
              <p className="opacity-70">Personalize your RetentionAI experience.</p>
            </div>

            {/* Appearance Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Palette size={24} />
                </div>
                <h2 className="text-xl font-bold">App Skin</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as Theme)}
                    className={cn(
                      "flex flex-col gap-4 p-6 rounded-2xl border transition-all text-left group",
                      theme === t.id 
                        ? "bg-primary/10 border-primary shadow-lg shadow-primary/5" 
                        : "bg-primary/5 border-primary/10 hover:border-primary/30"
                    )}
                  >
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      theme === t.id ? "bg-primary text-white" : "bg-primary/10 text-primary group-hover:bg-primary/20"
                    )}>
                      <t.icon size={24} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{t.name}</span>
                        {theme === t.id && <Check size={16} className="text-primary" />}
                      </div>
                      <p className="text-xs opacity-60 font-medium">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Language Section */}
            <section className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Languages size={24} />
                </div>
                <h2 className="text-xl font-bold">Language</h2>
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {languages.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLanguage(l.id as Language)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        language === l.id 
                          ? "bg-primary/10 border-primary text-white" 
                          : "bg-background-dark border-primary/10 text-slate-400 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Globe size={18} className={cn(language === l.id ? "text-primary" : "opacity-40")} />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold">{l.name}</span>
                          <span className="text-[10px] uppercase tracking-wider opacity-50">{l.native}</span>
                        </div>
                      </div>
                      {language === l.id && <Check size={18} className="text-primary" />}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Save Status */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest justify-center py-4 border-t border-primary/10"
            >
              <Check size={14} className="text-primary" />
              Settings are saved automatically
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
