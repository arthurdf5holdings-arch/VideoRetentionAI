import { BarChart3, Settings, UserCircle, Search, LogOut, ExternalLink, Play, Loader2 } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import React, { useState, useEffect, useRef } from 'react';
import { createAiInstance } from '../lib/gemini';

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isUploadActive = location.pathname === '/upload';
  const isAudienceBuilderActive = location.pathname === '/audience-builder';

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setShowSearchResults(true);
    setSearchResults([]);

    try {
      const ai = createAiInstance();
      if (!ai) return;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Find 5 popular or relevant YouTube videos related to: "${searchQuery}". For each video, provide the title, a short description, and the URL. Format as a list.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // Extract grounding chunks if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const text = response.text;

      // Mocking structured results based on text/grounding for the demo
      // In a real app, we'd use a specific tool or more rigid parsing
      const results = text.split('\n')
        .filter(line => line.includes('http'))
        .map((line, i) => ({
          id: i,
          title: line.split('http')[0].replace(/^\d+\.\s*/, '').replace(/[:\-]\s*$/, '').trim() || `Result ${i + 1}`,
          url: 'https' + line.split('https')[1].split(' ')[0].split(')')[0].split(']')[0],
          description: "Found via web search"
        })).slice(0, 5);

      setSearchResults(results);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-primary/20 px-4 md:px-10 py-3 bg-background-dark sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link to="/" className="flex items-center gap-4 text-primary">
          <div className="size-8 flex items-center justify-center bg-primary rounded-lg text-white">
            <BarChart3 size={20} />
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight">RetentionAI</h2>
        </Link>
        
        <div className="hidden md:flex relative" ref={searchRef}>
          <form onSubmit={handleSearch} className="flex w-64 items-stretch rounded-lg h-10 bg-primary/10 border border-primary/20">
            <div className="text-primary/60 flex items-center justify-center pl-4">
              <Search size={16} />
            </div>
            <input 
              className="flex w-full min-w-0 flex-1 rounded-lg focus:outline-none border-none bg-transparent placeholder:text-primary/40 px-4 pl-2 text-sm"
              style={{ color: 'inherit' }}
              placeholder="Search web for videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          {showSearchResults && (
            <div className="absolute top-full left-0 mt-2 w-[400px] bg-background-dark border border-primary/20 rounded-xl shadow-2xl p-4 z-[60] backdrop-blur-xl">
              <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-4">Web Search Results</h3>
              {isSearching ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <p className="text-xs font-bold opacity-50">Browsing the web...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {searchResults.map((res) => (
                    <a 
                      key={res.id} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary/10 transition-colors group"
                    >
                      <div className="size-8 bg-primary/20 rounded flex items-center justify-center text-primary">
                        <Play size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{res.title}</p>
                        <p className="text-[10px] opacity-50 truncate">{res.url}</p>
                      </div>
                      <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center py-4 opacity-50">No videos found. Try a different query.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 justify-end gap-6 items-center">
        <nav className="hidden lg:flex items-center gap-6">
          <Link 
            to="/upload" 
            className={cn(
              "text-sm font-medium transition-colors",
              isUploadActive 
                ? "text-primary border-b-2 border-primary pb-1 font-semibold" 
                : "text-slate-400 hover:text-primary"
            )}
          >
            Upload
          </Link>
          <Link 
            to="/audience-builder" 
            className={cn(
              "text-sm font-medium transition-colors",
              isAudienceBuilderActive 
                ? "text-primary border-b-2 border-primary pb-1 font-semibold" 
                : "text-slate-400 hover:text-primary"
            )}
          >
            Audience Builder
          </Link>
        </nav>
        
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/settings', { state: { from: location.pathname } })}
            className="flex items-center justify-center rounded-lg size-10 bg-primary/10 text-primary hover:bg-primary/20 transition-all"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={cn(
                "flex items-center justify-center rounded-lg size-10 transition-all",
                isUserMenuOpen ? "bg-primary text-white" : "bg-primary/10 text-primary hover:bg-primary/20"
              )}
            >
              <UserCircle size={20} />
            </button>

            {isUserMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-background-dark border border-primary/20 rounded-xl shadow-2xl p-2 z-[60]">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
