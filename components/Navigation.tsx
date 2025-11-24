import React from 'react';
import { LayoutDashboard, ScanLine, MessageCircle, Sprout, Shovel } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Garden', icon: <LayoutDashboard className="w-6 h-6" /> },
    { id: 'scan', label: 'Scan', icon: <ScanLine className="w-6 h-6" /> },
    { id: 'tools', label: 'Tools', icon: <Shovel className="w-6 h-6" /> }, // New Tab
    { id: 'chat', label: 'Clubs', icon: <MessageCircle className="w-6 h-6" /> },
    { id: 'harvest', label: 'Harvest', icon: <Sprout className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-cream border-t border-terra-200 pb-safe pt-2 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center p-2 min-w-[60px] transition-all duration-300 ${
              activeTab === tab.id 
                ? 'text-terra-600 -translate-y-2' 
                : 'text-sage-500 hover:text-sage-700'
            }`}
          >
            <div className={`p-2 rounded-full mb-1 transition-all ${
              activeTab === tab.id ? 'bg-terra-100 shadow-sm' : 'bg-transparent'
            }`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium tracking-wide uppercase">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;