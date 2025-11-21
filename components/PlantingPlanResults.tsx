import React, { useState } from 'react';
import { PlantingPlanResponse } from '../types';
import Button from './Button';
import { Download, Share2, Calendar, Sprout, Sun, ArrowRight, Layers, Save, CheckCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { User } from 'firebase/auth';
import { savePlantingPlanToDb, signInWithGoogle } from '../services/firebase';

interface PlantingPlanResultsProps {
  plan: PlantingPlanResponse;
  onReset: () => void;
  user: User | null;
}

interface ViewSettings {
  showIndoor: boolean;
  showOutdoor: boolean;
  showTransplant: boolean;
  showSuccession: boolean;
  showStrategy: boolean;
}

const PlantingPlanResults: React.FC<PlantingPlanResultsProps> = ({ plan, onReset, user }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [planName, setPlanName] = useState(`My Garden Plan - ${new Date().toLocaleDateString()}`);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Default View Settings
  const [view, setView] = useState<ViewSettings>({
    showIndoor: true,
    showOutdoor: true,
    showTransplant: true,
    showSuccession: true,
    showStrategy: true,
  });

  const toggleView = (key: keyof ViewSettings) => {
    setView(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveClick = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (e) {
         // Handled in service
      }
      return;
    }
    setShowNameInput(true);
  };

  const confirmSave = async () => {
    if(!user) return;
    setIsSaving(true);
    try {
      const id = await savePlantingPlanToDb(user.uid, plan, planName);
      setSavedId(id);
      setShowNameInput(false);
    } catch (e) {
      console.error(e);
      alert("Failed to save plan. Please check your internet connection or configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
         <h2 className="text-2xl font-serif font-bold text-earth-900">Your Custom Plan</h2>
         <div className="flex flex-wrap gap-2 w-full sm:w-auto">
             {/* View Settings Toggle */}
             <Button 
               variant="outline" 
               className={`py-2 h-auto text-sm px-3 ${showSettings ? 'bg-earth-100 border-earth-400' : 'bg-white'}`}
               onClick={() => setShowSettings(!showSettings)}
             >
                <Settings className="w-4 h-4 mr-2" /> Options
             </Button>

             {!savedId ? (
               showNameInput ? (
                 <div className="flex items-center gap-2 w-full sm:w-auto animate-fade-in">
                    <input 
                      type="text" 
                      value={planName} 
                      onChange={(e) => setPlanName(e.target.value)}
                      className="px-3 py-2 text-sm border border-earth-300 rounded-lg focus:ring-2 focus:ring-leaf-500 w-full sm:w-64"
                    />
                    <Button onClick={confirmSave} disabled={isSaving} className="py-2 h-auto text-sm px-4">
                       {isSaving ? 'Saving...' : 'Confirm'}
                    </Button>
                 </div>
               ) : (
                 <Button onClick={handleSaveClick} variant="primary" className="py-2 h-auto text-sm px-4 flex-1 sm:flex-none">
                    <Save className="w-4 h-4 mr-2" />
                    {user ? "Save to Account" : "Sign in to Save"}
                 </Button>
               )
             ) : (
               <Button disabled variant="outline" className="py-2 h-auto text-sm px-4 bg-leaf-50 text-leaf-700 border-leaf-200">
                  <CheckCircle className="w-4 h-4 mr-2" /> Saved
               </Button>
             )}
         </div>
      </div>

      {/* View Settings Panel */}
      {showSettings && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-earth-200 mb-6 animate-fade-in">
           <h4 className="text-sm font-bold text-earth-700 mb-3">Control what is shown:</h4>
           <div className="flex flex-wrap gap-3">
              <Toggle label="Strategy & Tips" active={view.showStrategy} onClick={() => toggleView('showStrategy')} />
              <Toggle label="Indoor Sowing" active={view.showIndoor} onClick={() => toggleView('showIndoor')} />
              <Toggle label="Outdoor Sowing" active={view.showOutdoor} onClick={() => toggleView('showOutdoor')} />
              <Toggle label="Transplanting" active={view.showTransplant} onClick={() => toggleView('showTransplant')} />
              <Toggle label="Succession Plans" active={view.showSuccession} onClick={() => toggleView('showSuccession')} />
           </div>
        </div>
      )}

      {/* Header Strategy Card */}
      {view.showStrategy && (
        <div className="bg-white rounded-2xl shadow-lg border border-earth-200 overflow-hidden mb-8 animate-fade-in">
          <div className="bg-leaf-50 p-8 border-b border-leaf-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-leaf-100 rounded-lg">
                <Calendar className="w-6 h-6 text-leaf-700" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-earth-900">Seasonal Strategy</h2>
            </div>
            <p className="text-earth-800 text-lg leading-relaxed font-medium">
              {plan.seasonalStrategy}
            </p>
          </div>
          
          <div className="p-6 bg-white grid sm:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
               <h4 className="font-bold text-leaf-700 flex items-center gap-2 mb-2">
                 <Layers className="w-4 h-4" /> Space Maximizer Tip
               </h4>
               <p className="text-earth-600 bg-earth-50 p-4 rounded-lg border-l-4 border-leaf-400">
                 {plan.spaceMaximizationTip}
               </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Schedule */}
      <div className="space-y-6 mb-12">
         <h3 className="text-2xl font-serif font-bold text-earth-900 mb-4">Sowing Schedule</h3>
         
         {plan.schedule && plan.schedule.length > 0 ? (
           <div className="grid gap-4">
             {plan.schedule.map((crop, index) => (
               <div key={index} className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     
                     {/* Title */}
                     <div className="sm:w-1/4">
                        <h4 className="font-bold text-lg text-earth-900 flex items-center gap-2">
                           <Sprout className="w-5 h-5 text-leaf-600" />
                           {crop.cropName}
                        </h4>
                        <p className="text-sm text-earth-500 mt-1 italic">{crop.notes}</p>
                     </div>

                     {/* Timeline Pills */}
                     <div className="flex flex-wrap gap-2 sm:flex-1 justify-start sm:justify-center">
                        {view.showIndoor && crop.sowIndoors && crop.sowIndoors !== 'N/A' && (
                           <Badge label="Sow Indoors" value={crop.sowIndoors} color="bg-blue-50 text-blue-700 border-blue-200" />
                        )}
                        {view.showOutdoor && crop.sowOutdoors && crop.sowOutdoors !== 'N/A' && (
                           <Badge label="Sow Outdoors" value={crop.sowOutdoors} color="bg-amber-50 text-amber-800 border-amber-200" />
                        )}
                        {view.showTransplant && crop.transplant && crop.transplant !== 'N/A' && (
                           <Badge label="Transplant" value={crop.transplant} color="bg-purple-50 text-purple-700 border-purple-200" />
                        )}
                     </div>

                     {/* Harvest */}
                     <div className="sm:w-1/5 text-right border-l border-earth-100 pl-4 hidden sm:block">
                        <span className="text-xs font-bold text-earth-400 uppercase tracking-wider">Harvest</span>
                        <p className="font-medium text-leaf-700">{crop.harvest}</p>
                     </div>
                     {/* Mobile Harvest */}
                     <div className="sm:hidden pt-3 border-t border-earth-100 flex justify-between items-center">
                        <span className="text-sm text-earth-500">Harvest:</span>
                        <span className="font-medium text-leaf-700">{crop.harvest}</span>
                     </div>
                  </div>
               </div>
             ))}
           </div>
         ) : (
           <div className="bg-white p-8 rounded-xl text-center border border-earth-200 border-dashed">
             <p className="text-earth-500">No planting schedule could be generated from the data provided.</p>
           </div>
         )}
      </div>

      {/* Succession Plans */}
      {view.showSuccession && plan.successionPlans && plan.successionPlans.length > 0 && (
        <div className="animate-fade-in">
          <h3 className="text-2xl font-serif font-bold text-earth-900 mb-6">Succession Opportunities</h3>
          <div className="grid md:grid-cols-2 gap-6">
             {plan.successionPlans.map((item, idx) => (
                <div key={idx} className="bg-gradient-to-br from-leaf-50 to-white p-6 rounded-xl border border-leaf-100 relative overflow-hidden">
                   <div className="absolute top-0 right-0 bg-leaf-200 w-16 h-16 rounded-bl-full opacity-20"></div>
                   
                   <div className="flex items-center gap-3 mb-4 text-earth-900 font-medium">
                      <span>{item.originalCrop}</span>
                      <ArrowRight className="w-4 h-4 text-leaf-500" />
                      <span className="text-leaf-700 font-bold">{item.followUpCrop}</span>
                   </div>
                   
                   <p className="text-sm text-earth-600 leading-relaxed bg-white/50 p-3 rounded-lg">
                      {item.reason}
                   </p>
                </div>
             ))}
          </div>
        </div>
      )}

      <div className="mt-12 pt-8 border-t border-earth-200 flex justify-center">
        <Button onClick={onReset} variant="secondary">Start New Plan</Button>
      </div>
    </div>
  );
};

const Badge = ({ label, value, color }: { label: string, value: string, color: string }) => (
  <div className={`flex flex-col px-3 py-1.5 rounded-md border ${color} min-w-[100px]`}>
     <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
     <span className="text-sm font-medium">{value}</span>
  </div>
);

const Toggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
   <button 
     onClick={onClick}
     className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${active ? 'bg-leaf-100 text-leaf-800 border border-leaf-200' : 'bg-earth-50 text-earth-500 border border-earth-200'}`}
   >
      {active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
      {label}
   </button>
);

export default PlantingPlanResults;