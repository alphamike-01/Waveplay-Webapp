import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, FileMusic } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center gap-1 flex-1 py-2 text-[10px] font-medium transition ${
      isActive ? 'text-violet-400 font-bold' : 'text-slate-400 hover:text-slate-200'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0d0e14]/95 backdrop-blur-xl border-t border-white/[0.08] flex items-center justify-around px-2 py-1">
      <NavLink to="/" className={navLinkClass} end>
        <Home className="w-5 h-5" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/search" className={navLinkClass}>
        <Search className="w-5 h-5" />
        <span>Search</span>
      </NavLink>

      <NavLink to="/library" className={navLinkClass}>
        <Library className="w-5 h-5" />
        <span>Library</span>
      </NavLink>

      <NavLink to="/local-music" className={navLinkClass}>
        <FileMusic className="w-5 h-5" />
        <span>Local</span>
      </NavLink>
    </nav>
  );
};
