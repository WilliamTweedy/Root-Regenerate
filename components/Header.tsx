import React, { useState, useRef, useEffect } from 'react';
import { Sprout, User as UserIcon, LogOut, LayoutDashboard, ChevronDown, Settings } from 'lucide-react';
import { User, signInWithGoogle, logout } from '../services/firebase';
import Button from './Button';
import AccountModal from './AccountModal';

interface HeaderProps {
  onReset: () => void;
  onViewSaved: () => void;
  user: User | null;
}

const Header: React.FC<HeaderProps> = ({ onReset, onViewSaved, user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (e) {
      // Error is handled in service or logged
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
  };

  const handleOpenAccount = () => {
    setIsMenuOpen(false);
    setShowAccountModal(true);
  };

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <>
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
                    className="hidden md:flex text-earth-700 hover:text-leaf-700 font-medium text-sm transition-colors items-center gap-1 bg-white border border-earth-200 px-3 py-1.5 rounded-lg shadow-sm"
                    type="button"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Plans</span>
                  </button>
                  
                  {/* User Menu Dropdown */}
                  <div className="relative" ref={menuRef}>
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="flex items-center gap-2 p-1 rounded-full hover:bg-earth-100 transition-colors focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:ring-offset-2 cursor-pointer"
                      type="button"
                    >
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full border border-earth-300 object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-leaf-100 flex items-center justify-center text-leaf-700 border border-leaf-200">
                          <UserIcon className="w-5 h-5" />
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 text-earth-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Content */}
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-earth-100 py-2 animate-in fade-in zoom-in-95 duration-100 origin-top-right z-50">
                          
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-earth-100 mb-1">
                            <p className="text-sm font-bold text-earth-900 truncate">{user.displayName || 'Gardener'}</p>
                            <p className="text-xs text-earth-500 truncate">{user.email}</p>
                          </div>

                          {/* Menu Items */}
                          <div className="px-2 py-1 space-y-1">
                             <button 
                               onClick={handleOpenAccount}
                               className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-earth-700 hover:bg-earth-50 rounded-lg transition-colors font-medium"
                               type="button"
                             >
                               <Settings className="w-4 h-4" />
                               Manage Profile
                             </button>

                             <div className="md:hidden">
                               <button 
                                 onClick={() => { onViewSaved(); setIsMenuOpen(false); }}
                                 className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-earth-700 hover:bg-earth-50 rounded-lg transition-colors"
                                 type="button"
                               >
                                 <LayoutDashboard className="w-4 h-4" />
                                 My Plans
                               </button>
                             </div>
                          </div>

                          {/* Footer */}
                          <div className="px-2 pt-1 border-t border-earth-100 mt-1">
                            <button 
                              onClick={handleLogout}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                              type="button"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleSignIn}
                  className="text-sm py-2 px-4 h-auto bg-white shadow-sm hover:shadow-md transition-all"
                  type="button"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Account Modal */}
      {showAccountModal && user && (
        <AccountModal 
          user={user} 
          onClose={() => setShowAccountModal(false)} 
        />
      )}
    </>
  );
};

export default Header;