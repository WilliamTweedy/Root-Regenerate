
import React, { useEffect, useState } from 'react';
import { User, getPlants, updatePlantStatus, deletePlant } from '../services/firebase';
import { getWeather } from '../services/weatherService';
import { Plant, WeatherData } from '../types';
import { CloudRain, ThermometerSnowflake, Bell, Plus, Sprout, CheckSquare, Square, Trash2, Calendar } from 'lucide-react';

interface DashboardProps {
  user: User;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [plantsData, weatherData] = await Promise.all([
        getPlants(user.uid),
        getWeather()
      ]);
      setPlants(plantsData);
      setWeather(weatherData);
      setLoading(false);
    };
    loadData();
  }, [user]);

  const handleTogglePlanted = async (plantId: string, currentStatus: boolean) => {
    if (!plantId) return;
    // Optimistic UI update
    setPlants(prev => prev.map(p => p.id === plantId ? { ...p, isPlanted: !currentStatus } : p));
    await updatePlantStatus(user.uid, plantId, !currentStatus);
  };

  const handleDeletePlant = async (plantId: string, e: React.MouseEvent) => {
    // Stop propagation to prevent card clicks
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm("Delete this plant?")) {
        // Optimistic delete
        setPlants(prev => prev.filter(p => p.id !== plantId));
        
        if (plantId) {
            try {
               await deletePlant(user.uid, plantId);
            } catch (err) {
               console.error("Error deleting plant:", err);
               // If error, reload to sync state
               const fresh = await getPlants(user.uid);
               setPlants(fresh);
            }
        }
    }
  };

  // Reusing the nice badge from PlantingPlanResults
  const Badge = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className={`flex flex-col px-3 py-1.5 rounded-md border ${color} min-w-[90px]`}>
       <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
       <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sage-900">Hello, {user.displayName?.split(' ')[0] || 'Gardener'}</h1>
          <p className="text-sage-600">Tracking your seeds & plants.</p>
        </div>
        <div className="flex items-center gap-3">
             <button onClick={() => onNavigate('scan')} className="bg-terra-500 text-white px-4 py-2 rounded-xl shadow-md flex items-center gap-2 hover:bg-terra-600 transition-colors">
                <Plus className="w-4 h-4" /> Add Seeds
             </button>
             <div className="w-10 h-10 rounded-full bg-sage-200 overflow-hidden border-2 border-white shadow-sm">
               <img src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gardener'} alt="Profile" className="w-full h-full object-cover" />
             </div>
        </div>
      </div>

      {/* Smart Alerts */}
      {weather && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8 animate-fade-in">
          {weather.isFrostWarning && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <ThermometerSnowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-900">Frost Warning!</h3>
                <p className="text-sm text-red-700">Temperatures are dropping to {weather.temp}°C tonight. Cover your seedlings.</p>
              </div>
            </div>
          )}
          
          {/* Generic Task Alert */}
          <div className="bg-terra-50 border border-terra-100 p-4 rounded-2xl flex items-start gap-3 shadow-sm">
            <div className="bg-terra-100 p-2 rounded-full text-terra-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-terra-900">Time to Water</h3>
              <p className="text-sm text-terra-800">It's been dry lately. Give your leafy greens a drink.</p>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Grid */}
      <div className="mb-6">
        <h2 className="text-xl font-serif font-bold text-sage-800 mb-4">Your Garden Inventory</h2>
      
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-sage-100 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : plants.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-sage-100">
            <div className="bg-sage-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-sage-400">
              <CloudRain className="w-8 h-8" />
            </div>
            <p className="text-sage-600 mb-4">Your inventory is empty.</p>
            <button onClick={() => onNavigate('scan')} className="bg-terra-500 text-white px-6 py-2 rounded-full font-medium hover:bg-terra-600 transition-colors">
              Scan Seed Packet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {plants.map((plant, index) => {
               const hasScheduleData = plant.sowIndoors || plant.sowOutdoors || plant.transplant;
               
               return (
               <div key={plant.id || index} className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden hover:shadow-md relative transition-all">
                  
                  <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     
                     {/* 1. Title Section (Identical width logic to PlantingPlanResults) */}
                     <div className="w-full sm:w-1/4">
                        <div className="flex items-center gap-2 mb-1">
                          {plant.isPlanted && <span className="bg-leaf-100 text-leaf-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">In Ground</span>}
                          {!plant.isPlanted && <span className="bg-earth-100 text-earth-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Seed Bank</span>}
                        </div>
                        <h4 className="font-bold text-lg text-earth-900 flex items-center gap-2">
                           <Sprout className={`w-5 h-5 flex-shrink-0 ${plant.isPlanted ? 'text-leaf-600' : 'text-sage-400'}`} />
                           {plant.name}
                        </h4>
                        <p className="text-sm text-earth-500 mt-1 italic leading-tight line-clamp-2">{plant.notes || "No notes added."}</p>
                     </div>

                     {/* 2. Timeline Pills (Identical styling to PlantingPlanResults) */}
                     <div className="flex flex-wrap gap-2 w-full sm:w-auto sm:flex-1 items-center">
                        {plant.sowIndoors && plant.sowIndoors !== 'N/A' && (
                           <Badge label="Sow Indoors" value={plant.sowIndoors} color="bg-blue-50 text-blue-700 border-blue-200" />
                        )}
                        {plant.sowOutdoors && plant.sowOutdoors !== 'N/A' && (
                           <Badge label="Sow Outdoors" value={plant.sowOutdoors} color="bg-amber-50 text-amber-800 border-amber-200" />
                        )}
                        {plant.transplant && plant.transplant !== 'N/A' && (
                           <Badge label="Transplant" value={plant.transplant} color="bg-purple-50 text-purple-700 border-purple-200" />
                        )}
                        {!hasScheduleData && (
                           <div className="text-xs text-sage-400 italic flex items-center gap-1 bg-sage-50 px-3 py-2 rounded-md border border-sage-100">
                             <Calendar className="w-3 h-3" /> No schedule data
                           </div>
                        )}
                     </div>

                     {/* 3. Right Side: Harvest & Actions */}
                     <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-4 border-t sm:border-t-0 border-earth-100 pt-3 sm:pt-0">
                        {/* Harvest Info */}
                        <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-earth-400 uppercase tracking-wider block">Harvest</span>
                            <span className="font-medium text-leaf-700 text-sm">
                              {plant.harvest || plant.estimatedHarvestDate?.toLocaleDateString() || "TBD"}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => handleTogglePlanted(plant.id, plant.isPlanted)}
                                className={`flex items-center justify-center p-2 rounded-lg transition-colors border ${plant.isPlanted ? 'border-leaf-200 bg-leaf-50 text-leaf-600' : 'border-sage-200 bg-white text-sage-300 hover:border-leaf-300'}`}
                                title={plant.isPlanted ? "Mark as Unplanted" : "Mark as Planted"}
                              >
                                {plant.isPlanted ? (
                                  <CheckSquare className="w-5 h-5" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                            </button>
                            <button 
                              onClick={(e) => handleDeletePlant(plant.id, e)}
                              className="p-2 text-sage-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                     </div>

                  </div>
               </div>
               );
             })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
