import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GitMerge, Layers, FolderGit2, User as UserIcon } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navItems = [
    { to: '/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/roadmap', label: 'Roadmap', icon: GitMerge },
    { to: '/skills', label: 'Skills', icon: Layers },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#090a0f]/95 backdrop-blur-xl border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1.5 rounded-xl transition ${
                isActive ? 'text-violet-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
