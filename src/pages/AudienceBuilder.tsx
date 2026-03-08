import { motion } from 'motion/react';
import { 
  Users, 
  MapPin, 
  GraduationCap, 
  DollarSign, 
  AlertCircle, 
  PlusCircle,
  Save,
  ChevronRight,
  Check,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Gamepad2,
  Heart,
  Cpu,
  Music,
  Camera,
  ShoppingBag,
  Plane,
  Utensils,
  X
} from 'lucide-react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../lib/utils';

type AgeGroup = 'kids' | 'young adult' | 'adult' | 'senior';

interface AudienceProfile {
  id: string;
  name: string;
  ages: AgeGroup[];
  locations: string[];
  education: string;
  income: string;
  painPoints: string;
  others: string;
  description: string;
  icon?: string;
  image?: string;
}

const NICHE_ICONS = [
  { id: 'Gamepad2', icon: Gamepad2, label: 'Gaming' },
  { id: 'GraduationCap', icon: GraduationCap, label: 'Education' },
  { id: 'Heart', icon: Heart, label: 'Lifestyle' },
  { id: 'Cpu', icon: Cpu, label: 'Tech' },
  { id: 'DollarSign', icon: DollarSign, label: 'Finance' },
  { id: 'Music', icon: Music, label: 'Music' },
  { id: 'Camera', icon: Camera, label: 'Vlog' },
  { id: 'ShoppingBag', icon: ShoppingBag, label: 'E-commerce' },
  { id: 'Plane', icon: Plane, label: 'Travel' },
  { id: 'Utensils', icon: Utensils, label: 'Food' },
];

export function AudienceBuilder() {
  const [profiles, setProfiles] = useState<AudienceProfile[]>(() => {
    return JSON.parse(localStorage.getItem('audience-profiles') || '[]');
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetAudience, setTargetAudience] = useState('');
  const [selectedAges, setSelectedAges] = useState<AgeGroup[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [newLocation, setNewLocation] = useState('');
  const [education, setEducation] = useState('');
  const [income, setIncome] = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [others, setOthers] = useState('');
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(NICHE_ICONS[0].id);
  const [uploadedImage, setUploadedImage] = useState<string | undefined>(undefined);
  const [isSaved, setIsSaved] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('audience-profiles', JSON.stringify(profiles));
  }, [profiles]);

  const ageGroups: { id: AgeGroup; label: string }[] = [
    { id: 'kids', label: 'Kids (0-12)' },
    { id: 'young adult', label: 'Young Adult (13-24)' },
    { id: 'adult', label: 'Adult (25-64)' },
    { id: 'senior', label: 'Senior (65+)' },
  ];

  const toggleAge = (age: AgeGroup) => {
    setSelectedAges(prev => 
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    );
  };

  const addLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLocation.trim() && !locations.includes(newLocation.trim())) {
      setLocations([...locations, newLocation.trim()]);
      setNewLocation('');
    }
  };

  const removeLocation = (loc: string) => {
    setLocations(locations.filter(l => l !== loc));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setSelectedIcon(undefined);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = (profile: AudienceProfile) => {
    setEditingId(profile.id);
    setTargetAudience(profile.name || '');
    setSelectedAges(profile.ages || []);
    setLocations(profile.locations || []);
    setEducation(profile.education || '');
    setIncome(profile.income || '');
    setPainPoints(profile.painPoints || '');
    setOthers(profile.others || '');
    setSelectedIcon(profile.icon || NICHE_ICONS[0].id);
    setUploadedImage(profile.image);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      setProfiles(profiles.filter(p => p.id !== id));
      if (editingId === id) resetForm();
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTargetAudience('');
    setSelectedAges([]);
    setLocations([]);
    setEducation('');
    setIncome('');
    setPainPoints('');
    setOthers('');
    setSelectedIcon(NICHE_ICONS[0].id);
    setUploadedImage(undefined);
  };

  const handleSave = () => {
    const profileData: AudienceProfile = {
      id: editingId || Date.now().toString(),
      name: targetAudience || 'Untitled Audience',
      ages: selectedAges,
      locations,
      education,
      income,
      painPoints,
      others,
      icon: selectedIcon,
      image: uploadedImage,
      description: `${targetAudience}. Ages: ${selectedAges.join(', ')}. Locations: ${locations.join(', ')}. Education: ${education}. Income: ${income}. Pain Points: ${painPoints}.`
    };

    if (editingId) {
      setProfiles(profiles.map(p => p.id === editingId ? profileData : p));
    } else {
      setProfiles([...profiles, profileData]);
      resetForm(); // Clear immediately for new profiles to avoid race conditions
    }

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const renderProfileIcon = (profile: AudienceProfile, size = 24) => {
    if (profile.image) {
      return <img src={profile.image} alt="" className="rounded-full object-cover" style={{ width: size, height: size }} />;
    }
    const IconComponent = NICHE_ICONS.find(i => i.id === profile.icon)?.icon || Users;
    return <IconComponent size={size} />;
  };

  return (
    <div className="flex flex-col h-screen bg-background-dark">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-10 max-w-[1000px] mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight">Audience Builder</h1>
                <p className="opacity-70">Define and refine your target audience profile for specific niches.</p>
              </div>
              {editingId && (
                <button 
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-bold hover:bg-primary/20 transition-all"
                >
                  <PlusCircle size={18} />
                  New Profile
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 md:p-8 flex flex-col gap-6">
                  
                  {/* Profile Identity */}
                  <div className="flex flex-col gap-4">
                    <label className="text-sm font-bold uppercase tracking-widest opacity-60">
                      Profile Identity
                    </label>
                    <div className="flex flex-wrap gap-6 items-start">
                      <div className="flex flex-col gap-3">
                        <p className="text-xs font-bold opacity-40">Profile Image</p>
                        <div className="relative group">
                          <div className="size-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                            {uploadedImage ? (
                              <img src={uploadedImage} alt="Profile" className="size-full object-cover" />
                            ) : selectedIcon ? (
                              (() => {
                                const Icon = NICHE_ICONS.find(i => i.id === selectedIcon)?.icon || Users;
                                return <Icon size={32} className="text-primary" />;
                              })()
                            ) : (
                              <Users size={32} className="text-primary" />
                            )}
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 size-8 bg-primary text-white rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                          >
                            <ImageIcon size={16} />
                          </button>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                            accept="image/*" 
                          />
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-3">
                        <p className="text-xs font-bold opacity-40">Or Choose Niche Icon</p>
                        <div className="grid grid-cols-5 gap-2">
                          {NICHE_ICONS.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => {
                                setSelectedIcon(item.id);
                                setUploadedImage(undefined);
                              }}
                              className={cn(
                                "size-10 rounded-lg flex items-center justify-center transition-all border",
                                selectedIcon === item.id 
                                  ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                                  : "bg-primary/5 border-primary/10 text-primary/60 hover:bg-primary/10"
                              )}
                              title={item.label}
                            >
                              <item.icon size={20} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                      <Users size={16} className="text-primary" />
                      Target Audience Name
                    </label>
                    <input 
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Tech-Savvy Entrepreneurs"
                      className="w-full h-12 rounded-lg border border-primary/20 bg-primary/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      style={{ color: 'inherit' }}
                    />
                  </div>

                  {/* Age Selection */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold uppercase tracking-widest opacity-60">
                      Age Groups (Multiple)
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {ageGroups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => toggleAge(group.id)}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border transition-all text-sm font-medium",
                            selectedAges.includes(group.id)
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-primary/5 border-primary/10 opacity-60 hover:opacity-100"
                          )}
                        >
                          {group.label}
                          {selectedAges.includes(group.id) && <Check size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex flex-col gap-3">
                    <label className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                      <MapPin size={16} className="text-primary" />
                      Locations
                    </label>
                    <form onSubmit={addLocation} className="flex gap-2">
                      <input 
                        type="text"
                        value={newLocation}
                        onChange={(e) => setNewLocation(e.target.value)}
                        placeholder="Add a city or country..."
                        className="flex-1 h-10 rounded-lg border border-primary/20 bg-primary/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        style={{ color: 'inherit' }}
                      />
                      <button 
                        type="submit"
                        className="size-10 flex items-center justify-center bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <PlusCircle size={20} />
                      </button>
                    </form>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {locations.map((loc) => (
                        <span 
                          key={loc}
                          className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary"
                        >
                          {loc}
                          <button onClick={() => removeLocation(loc)} className="hover:text-white transition-colors">×</button>
                        </span>
                      ))}
                      {locations.length === 0 && <p className="text-xs opacity-40 italic">No locations added yet.</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Education */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                        <GraduationCap size={16} className="text-primary" />
                        Education
                      </label>
                      <input 
                        type="text"
                        value={education}
                        onChange={(e) => setEducation(e.target.value)}
                        placeholder="e.g. University Graduates"
                        className="w-full h-10 rounded-lg border border-primary/20 bg-primary/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        style={{ color: 'inherit' }}
                      />
                    </div>
                    {/* Income */}
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                        <DollarSign size={16} className="text-primary" />
                        Income Range
                      </label>
                      <input 
                        type="text"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        placeholder="e.g. $50k - $100k"
                        className="w-full h-10 rounded-lg border border-primary/20 bg-primary/5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        style={{ color: 'inherit' }}
                      />
                    </div>
                  </div>

                  {/* Pain Points */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
                      <AlertCircle size={16} className="text-primary" />
                      Pain Points
                    </label>
                    <textarea 
                      value={painPoints}
                      onChange={(e) => setPainPoints(e.target.value)}
                      placeholder="What problems are they trying to solve?"
                      className="w-full h-24 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      style={{ color: 'inherit' }}
                    />
                  </div>

                  {/* Others */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold uppercase tracking-widest opacity-60">
                      Others / Notes
                    </label>
                    <textarea 
                      value={others}
                      onChange={(e) => setOthers(e.target.value)}
                      placeholder="Additional demographic or psychographic details..."
                      className="w-full h-20 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      style={{ color: 'inherit' }}
                    />
                  </div>

                  <button 
                    onClick={handleSave}
                    className={cn(
                      "mt-4 flex items-center justify-center gap-2 h-12 font-bold rounded-lg transition-all shadow-lg",
                      editingId 
                        ? "bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600" 
                        : "bg-primary text-white shadow-primary/20 hover:bg-primary/90"
                    )}
                  >
                    {isSaved ? <Check size={20} /> : editingId ? <Edit2 size={20} /> : <Save size={20} />}
                    {isSaved ? 'PROFILE SAVED' : editingId ? 'UPDATE AUDIENCE PROFILE' : 'SAVE AUDIENCE PROFILE'}
                  </button>
                </div>

                {/* Saved Profiles List */}
                <div className="flex flex-col gap-6">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Users className="text-primary" size={24} />
                    Saved Audience Profiles
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profiles.map((profile) => (
                      <div 
                        key={profile.id}
                        className={cn(
                          "bg-primary/5 border rounded-2xl p-5 flex flex-col gap-4 transition-all group",
                          editingId === profile.id ? "border-primary ring-1 ring-primary/50" : "border-primary/10 hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
                              {renderProfileIcon(profile, 32)}
                            </div>
                            <div className="flex flex-col">
                              <h4 className="font-bold text-sm">{profile.name}</h4>
                              <p className="text-[10px] opacity-50 uppercase tracking-widest font-black">
                                {profile.ages.length > 0 ? profile.ages[0] : 'General'} • {profile.locations.length > 0 ? profile.locations[0] : 'Global'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEdit(profile)}
                              className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                              title="Edit Profile"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(profile.id)}
                              className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                              title="Delete Profile"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">
                          {profile.painPoints || 'No pain points defined.'}
                        </p>
                        <div className="flex items-center justify-between pt-2 border-t border-primary/5">
                          <span className="text-[10px] font-bold opacity-40">Created {new Date(parseInt(profile.id)).toLocaleDateString()}</span>
                          <button 
                            onClick={() => handleEdit(profile)}
                            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                    {profiles.length === 0 && (
                      <div className="col-span-full py-12 flex flex-col items-center justify-center gap-4 bg-primary/5 border border-dashed border-primary/20 rounded-2xl opacity-50">
                        <Users size={40} />
                        <p className="font-bold text-sm">No profiles saved yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary / Preview Section */}
              <div className="flex flex-col gap-6">
                <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 sticky top-24">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Users className="text-primary" size={20} />
                    Profile Summary
                  </h3>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-widest font-black text-primary">Niche</p>
                      <p className="font-bold">{targetAudience || 'Untitled Audience'}</p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-widest font-black text-primary">Demographics</p>
                      <div className="flex flex-col gap-2 mt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="opacity-60">Age:</span>
                          <span className="font-bold">{selectedAges.length > 0 ? selectedAges.join(', ') : 'Not set'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="opacity-60">Income:</span>
                          <span className="font-bold">{income || 'Not set'}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="opacity-60">Education:</span>
                          <span className="font-bold">{education || 'Not set'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <p className="text-[10px] uppercase tracking-widest font-black text-primary">Reach</p>
                      <p className="text-xs font-bold">{locations.length > 0 ? locations.join(' • ') : 'Global'}</p>
                    </div>

                    <div className="pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                        <div className="flex flex-col">
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Estimated Reach</p>
                          <p className="text-lg font-black">2.4M - 3.1M</p>
                        </div>
                        <ChevronRight className="text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
