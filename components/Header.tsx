import React from 'react';
import type { View } from '../types';

interface HeaderProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const TecpetrolLogo = () => (
    <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="4"/>
        <path d="M25 35H75" stroke="white" strokeWidth="6" strokeLinecap="round"/>
        <path d="M50 35V75" stroke="white" strokeWidth="6" strokeLinecap="round"/>
        <path d="M35 75C35 68.3726 41.3726 63 50 63C58.6274 63 65 68.3726 65 75" stroke="white" strokeWidth="6" strokeLinecap="round"/>
    </svg>
);


const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
  const navItems: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Panel de Control' },
    { id: 'inventory', label: 'Inventario (WMS)' },
    { id: 'matrix', label: 'Matriz de Sustitución' },
    { id: 'purchasing', label: 'Compras (Coupa)' },
    { id: 'suggestions', label: 'Sugerencias' },
    { id: 'catalog', label: 'Catálogo (Sphera)'},
    { id: 'alerts', label: 'Alertas' },
    { id: 'reports', label: 'Reportes' },
  ];

  return (
    <header className="bg-tec-blue text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <TecpetrolLogo />
             <div className="ml-3">
                <span className="font-bold text-xl block leading-tight">Tecpetrol</span>
                <span className="text-xs font-light block leading-tight">Materiales Sustitutos</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === item.id
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
       {/* Mobile Nav */}
      <nav className="md:hidden bg-tec-blue border-t border-blue-800">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-wrap justify-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors w-1/2 text-center ${
                  activeView === item.id
                    ? 'bg-white bg-opacity-20 text-white'
                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                }`}
              >
                {item.label}
              </button>
            ))}
        </div>
      </nav>
    </header>
  );
};

export default Header;