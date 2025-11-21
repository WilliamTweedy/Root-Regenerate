import React from 'react';
import { Sprout, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react';
import { User } from 'firebase/auth';
import { signInWithGoogle, logout } from '../services/firebase';
import Button from './Button';

interface HeaderProps {
  onReset: () => void;
  onViewSaved: () => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ onReset, onViewSaved, user }) => {
  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      // Error is handled in service or logged
    }
  };

  return (
    <header className="bg-earth-50/90 backdrop-blur-sm sticky top-0 z-50 border-b border-earth-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" 
            onClick={onReset}
          >
            <div className="bg-leaf-600 p-1.5 rounded-full">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="font-serif text-xl font-bold text-earth-900 tracking-tight hidden sm:inline">
              Root & Regenerate
            </span>
             <span className="font-serif text-xl font-bold text-earth-900 tracking-tight sm:hidden">
              R&R
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <button 
                  onClick={onViewSaved}
                  className="text-earth-700 hover:text-leaf-700 font-medium text-sm transition-colors flex items-center gap-1"
                >
                   <LayoutDashboard className="w-4 h-4" />
                   <span className="hidden sm:inline">My Plans</span>
                </button>
                
                <div className="h-4 w-[1px] bg-earth-300"></div>

                <div className="flex items-center gap-3 group relative">
                   {user.photoURL ? (
                     <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full border border-earth-300" />
                   ) : (
                     <div className="w-8 h-8 rounded-full bg-leaf-100 flex items-center justify-center text-leaf-700">
                       <UserIcon className="w-4 h-4" />
                     </div>
                   )}
                   
                   <button 
                     onClick={logout}
                     className="text-xs font-medium text-earth-500 hover:text-red-600 transition-colors"
                   >
                     Sign Out
                   </button>
                </div>
              </div>
            ) : (
              <Button 
                variant="outline" 
                onClick={handleSignIn}
                className="text-sm py-2 px-4 h-auto bg-white"
              >
                <UserIcon className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;