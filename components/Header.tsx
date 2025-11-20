import React from 'react';
import { Sprout } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-earth-50/90 backdrop-blur-sm sticky top-0 z-50 border-b border-earth-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={onReset}
          >
            <div className="bg-leaf-600 p-1.5 rounded-full">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-earth-900 tracking-tight">
              Root & Regenerate
            </span>
          </div>
          <nav>
            <button 
              onClick={onReset}
              className="text-earth-700 hover:text-leaf-700 font-medium text-sm transition-colors"
            >
              Start Over
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;