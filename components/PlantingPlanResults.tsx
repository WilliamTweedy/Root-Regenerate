
import React, { useState, useEffect } from 'react';
import { PlantingPlanResponse } from '../types';
import Button from './Button';
import { Calendar, ArrowRight, Layers, Save, CheckCircle, Settings, Eye, EyeOff, Sprout, PlusCircle, Plus } from 'lucide-react';
import { User, savePlantingPlanToDb, signInWithGoogle, addPlant, getPlants } from '../services/firebase';

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

const normalizeName = (name: string) => name.toLowerCase().replace(/[^a-z0-9]/g, '');

const PlantingPlanResults: React.FC<PlantingPlanResultsProps> = ({ plan, onReset, user }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [planName, setPlanName] = useState(`My Garden Plan - ${new Date().toLocaleDateString()}`);
  const [showNameInput, setShowNameInput] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const [isAddingToGarden, setIsAddingToGarden] = useState(false);
  // Track which plants are in inventory by name (normalized)
  const [inventorySet, setInventorySet] = useState<Set<string>>(new Set());

  // Default View Settings
  const [view, setView] = useState<ViewSettings>({
    showIndoor: true,
    showOutdoor: true,
    showTransplant: true,
    showSuccession: true,
    showStrategy: true,
  });

  // Load existing inventory to check for duplicates
  useEffect(() => {
    const loadInventory = async () => {
      if (user) {
        try {
          const plants = await getPlants(user.uid);
          // Strict normalization
          const names = new Set(plants.map(p => normalizeName(p.name)));
          setInventorySet(names);
        } catch (error) {
          console.error("Failed to load inventory for duplicate check", error);
        }
      }
    };
    loadInventory();
  }, [user]);

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

  // Helper to determine season
  const getSeason = (harvestText: string) => {
     const h = harvestText.toLowerCase();
     if (h.includes('jul') || h.includes('aug') || h.includes('jun')) return 'Summer';
     if (h.includes('sep') || h.includes('oct') || h.includes('nov')) return 'Autumn';
     if (h.includes('dec') || h.includes('jan') || h.includes('feb')) return 'Winter';
     return 'Spring';
  };

  const handleAddSingle = async (crop: any) => {
    if (!user) return;
    if (inventorySet.has(normalizeName(crop.cropName))) return;

    try {
      await addPlant(user.uid, {
        name: crop.cropName,
        type: 'Vegetable',
        season: getSeason(crop.harvest) as any,
        plantedDate: new Date(),
        notes: `Added from Plan: ${crop.notes}`,
        isPlanted: false,
        // Save detailed schedule info
        sowIndoors: crop.sowIndoors,
        sowOutdoors: crop.sowOutdoors,
        transplant: crop.transplant,
        harvest: crop.harvest
      });
      
      // Update local state immediately
      setInventorySet(prev => {
        const newSet = new Set(prev);
        newSet.add(normalizeName(crop.cropName));
        return newSet;
      });
    } catch (error) {
      console.error("Error adding plant", error);
      alert(`Failed to add ${crop.cropName}`);
    }
  };

  const handleAddToGarden = async () => {
    if (!user || !plan.schedule) return;
    setIsAddingToGarden(true);
    try {
      // Filter out existing using robust normalization
      const toAdd = plan.schedule.filter(crop => !inventorySet.has(normalizeName(crop.cropName)));
      
      if (toAdd.length === 0) {
        alert("All crops in this plan are already in your inventory!");
        setIsAddingToGarden(false);
        return;
      }

      const promises = toAdd.map(crop => {
        return addPlant(user.uid, {
          name: crop.cropName,
          type: 'Vegetable', 
          season: getSeason(crop.harvest) as any,
          plantedDate: new Date(),
          notes: `Added from Plan: ${crop.notes}`,
          isPlanted: false,
          sowIndoors: crop.sowIndoors,
          sowOutdoors: crop.sowOutdoors,
          transplant: crop.transplant,
          harvest: crop.harvest
        });
      });

      await Promise.all(promises);
      
      // Update local set
      setInventorySet(prev => {
        const newSet = new Set(prev);
        toAdd.forEach(c => newSet.add(normalizeName(c.cropName)));
        return newSet;
      });
      
      alert(`Added ${toAdd.length} new crops to your inventory.`);
    } catch (error) {
      console.error("Error adding plants", error);
      alert("Failed to add plants to inventory.");
    } finally {
      setIsAddingToGarden(false);
    }
  };

  // Check if all displayed items are added
  const allAdded = plan.schedule && plan.schedule.every(c => inventorySet.has(normalizeName(c.cropName)));

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 pb-24">
      
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
         <div className="flex justify-between items-center">
            <h3 className="text-2xl font-serif font-bold text-earth-900">Sowing Schedule</h3>
            
            {user && plan.schedule?.length > 0 && (
              <Button 
                onClick={handleAddToGarden} 
                disabled={isAddingToGarden || allAdded}
                variant={allAdded ? "outline" : "secondary"}
                className="text-xs px-3 py-2 h-auto"
              >
                {allAdded ? (
                  <><CheckCircle className="w-4 h-4 mr-2" /> All Added</>
                ) : (
                  <><PlusCircle className="w-4 h-4 mr-2" /> Add Missing to Inventory</>
                )}
              </Button>
            )}
         </div>
         
         {plan.schedule && plan.schedule.length > 0 ? (
           <div className="grid gap-4">
             {plan.schedule.map((crop, index) => {
               const isAdded = inventorySet.has(normalizeName(crop.cropName));
               return (
               <div key={index} className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden hover:shadow-md relative transition-all">
                  
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     
                     {/* Title Section */}
                     <div className="w-full sm:w-1/4">
                        <h4 className="font-bold text-lg text-earth-900 flex items-center gap-2">
                           <Sprout className="w-5 h-5 text-leaf-600 flex-shrink-0" />
                           {crop.cropName}
                        </h4>
                        <p className="text-sm text-earth-500 mt-1 italic leading-tight">{crop.notes}</p>
                     </div>

                     {/* Timeline Pills */}
                     <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-1 items-center">
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

                     {/* Right Side: Harvest & Action */}
                     <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-4 border-t sm:border-t-0 border-earth-100 pt-3 sm:pt-0">
                        {/* Harvest Info */}
                        <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-earth-400 uppercase tracking-wider block">Harvest</span>
                            <span className="font-medium text-leaf-700 text-sm">{crop.harvest}</span>
                        </div>

                        {/* Individual Add Button */}
                        {user && (
                          <div className="flex-shrink-0">
                            {isAdded ? (
                               <div className="flex items-center gap-1 text-leaf-600 bg-leaf-50 px-3 py-1.5 rounded-full border border-leaf-100">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-xs font-bold">In Garden</span>
                               </div>
                            ) : (
                               <button 
                                 onClick={() => handleAddSingle(crop)}
                                 className="flex items-center gap-1 bg-terra-50 text-terra-700 hover:bg-terra-100 hover:text-terra-800 px-3 py-1.5 rounded-full border border-terra-200 transition-colors"
                               >
                                  <Plus className="w-4 h-4" />
                                  <span className="text-xs font-bold">Add</span>
                               </button>
                            )}
                          </div>
                        )}
                     </div>

                  </div>
               </div>
               );
             })}
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
