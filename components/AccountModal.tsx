import React, { useEffect, useState } from 'react';
import { User, deleteUserAccount, logout, getPlants, getHarvests, getUserPlans } from '../services/firebase';
import Button from './Button';
import { X, Sprout, Calendar, Leaf, AlertTriangle, LogOut, Trash2, User as UserIcon, Shield } from 'lucide-react';

interface AccountModalProps {
  user: User;
  onClose: () => void;
}

const AccountModal: React.FC<AccountModalProps> = ({ user, onClose }) => {
  const [stats, setStats] = useState({ plants: 0, harvests: 0, plans: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [plants, harvests, plans] = await Promise.all([
          getPlants(user.uid),
          getHarvests(user.uid),
          getUserPlans(user.uid)
        ]);
        setStats({
          plants: plants.length,
          harvests: harvests.length,
          plans: plans.length
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, [user]);

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return;
    setIsDeleting(true);
    setError(null);
    try {
      await deleteUserAccount(user.uid);
      // Window reload is handled in service for demo/redirect usually, 
      // but just in case we manually close if not handled.
      onClose();
    } catch (e: any) {
      setIsDeleting(false);
      if (e.code === 'auth/requires-recent-login') {
        setError("For security, you must sign out and sign in again before deleting your account.");
      } else {
        setError("Failed to delete account. Please try again.");
      }
    }
  };

  const memberSince = user.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-earth-50 p-6 border-b border-earth-100 flex justify-between items-start">
           <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white p-1 shadow-sm">
                 {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                 ) : (
                    <div className="w-full h-full rounded-full bg-leaf-100 flex items-center justify-center text-leaf-600">
                       <UserIcon className="w-8 h-8" />
                    </div>
                 )}
              </div>
              <div>
                 <h2 className="text-xl font-serif font-bold text-earth-900">{user.displayName || 'Gardener'}</h2>
                 <p className="text-earth-600 text-sm">{user.email}</p>
                 <span className="text-xs text-earth-400 mt-1 block flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Member since {memberSince}
                 </span>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-earth-200 rounded-full transition-colors text-earth-500">
              <X className="w-5 h-5" />
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto">
           
           {/* Stats Grid */}
           <h3 className="font-bold text-earth-900 mb-4 text-sm uppercase tracking-wider">Your Impact</h3>
           <div className="grid grid-cols-3 gap-4 mb-8">
              <StatCard 
                 icon={<Sprout className="w-5 h-5 text-leaf-600" />}
                 value={isLoading ? '-' : stats.plants}
                 label="Plants"
                 bg="bg-leaf-50"
              />
              <StatCard 
                 icon={<Leaf className="w-5 h-5 text-amber-600" />}
                 value={isLoading ? '-' : stats.harvests}
                 label="Harvests"
                 bg="bg-amber-50"
              />
              <StatCard 
                 icon={<Calendar className="w-5 h-5 text-blue-600" />}
                 value={isLoading ? '-' : stats.plans}
                 label="Plans"
                 bg="bg-blue-50"
              />
           </div>

           {/* Danger Zone */}
           <div className="border-t border-earth-100 pt-6">
              <h3 className="font-bold text-red-700 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4" /> Danger Zone
              </h3>
              
              <div className="space-y-4">
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                    <h4 className="font-bold text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">
                       Permanently remove your account and all associated data (plants, harvests, plans). This action cannot be undone.
                    </p>
                    
                    <div className="space-y-3">
                       <label className="block text-xs font-bold text-red-600 uppercase">
                          Type <span className="font-mono bg-white px-1 rounded">DELETE</span> to confirm
                       </label>
                       <div className="flex gap-2">
                          <input 
                             type="text" 
                             value={confirmText}
                             onChange={(e) => setConfirmText(e.target.value)}
                             className="flex-grow border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                             placeholder="DELETE"
                          />
                          <button 
                             disabled={confirmText !== 'DELETE' || isDeleting}
                             onClick={handleDelete}
                             className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
                          >
                             {isDeleting ? 'Deleting...' : 'Delete Data'}
                          </button>
                       </div>
                       {error && (
                         <p className="text-xs text-red-600 font-bold bg-white p-2 rounded border border-red-100">
                           {error}
                         </p>
                       )}
                    </div>
                 </div>

                 <button 
                   onClick={() => { logout(); onClose(); }}
                   className="w-full flex items-center justify-center gap-2 py-3 border border-earth-200 rounded-xl text-earth-700 font-bold hover:bg-earth-50 transition-colors"
                 >
                    <LogOut className="w-4 h-4" /> Sign Out
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label, bg }: { icon: React.ReactNode, value: number | string, label: string, bg: string }) => (
   <div className={`${bg} p-4 rounded-2xl flex flex-col items-center justify-center text-center`}>
      <div className="mb-2 bg-white p-2 rounded-full shadow-sm">{icon}</div>
      <span className="text-2xl font-bold text-earth-900">{value}</span>
      <span className="text-xs font-medium text-earth-600 uppercase">{label}</span>
   </div>
);

export default AccountModal;