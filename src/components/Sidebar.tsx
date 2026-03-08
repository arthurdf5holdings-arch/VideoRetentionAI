import { Home as HomeIcon, Upload, Library, Settings, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: HomeIcon, href: '/home' },
    { label: 'Upload', icon: Upload, href: '/upload' },
    { label: 'Library', icon: Library, href: '/library' },
    { label: 'Audience Builder', icon: Users, href: '/audience-builder' },
    { label: 'Settings', icon: Settings, href: '/settings', className: 'mt-10' },
  ];

  return (
    <aside className="w-64 p-4 border-r border-primary/10 hidden md:block h-full">
      <div className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <div
              key={item.label}
              onClick={() => item.href !== '#' && navigate(item.href)}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors",
                isActive 
                  ? "bg-primary text-white" 
                  : "opacity-60 hover:bg-primary/5 hover:text-primary hover:opacity-100",
                item.className
              )}
            >
              <item.icon size={20} />
              <p className="text-sm font-medium">{item.label}</p>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
