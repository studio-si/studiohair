
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, User } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-sm bg-white/70 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_-15px_rgba(244,63,94,0.12)] rounded-[2.5rem] px-10 py-4 z-50 flex items-center justify-between">
      <NavLink 
        to="/" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-rose-500 scale-110' : 'text-gray-300 hover:text-rose-200'}`}
      >
        {({ isActive }) => (
          <>
            <Home size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Início</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/appointments" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-rose-500 scale-110' : 'text-gray-300'}`}
      >
        {({ isActive }) => (
          <>
            <Calendar size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Agenda</span>
          </>
        )}
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? 'text-rose-500 scale-110' : 'text-gray-300'}`}
      >
        {({ isActive }) => (
          <>
            <User size={22} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-widest">Perfil</span>
          </>
        )}
      </NavLink>
    </nav>
  );
};

export default Navbar;
