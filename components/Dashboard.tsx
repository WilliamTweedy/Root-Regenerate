
import React, { useEffect, useState } from 'react';
import { User, getPlants, updatePlantStatus, deletePlant } from '../services/firebase';
import { getWeather } from '../services/weatherService';
import { Plant, WeatherData } from '../types';
import { CloudRain, ThermometerSnowflake, Bell, Plus, Sprout, CheckSquare, Square, Trash2, Calendar, Flower2, Search } from 'lucide-react';
import Button from './Button';

interface DashboardProps {
  user: User;
  onNavigate: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onNavigate }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'planted' | 'seeds'>('all');

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
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm("Delete this plant?")) {
        setPlants(prev => prev.filter(p => p.id !== plantId));
        if (plantId) {
            try {
               await deletePlant(user.uid, plantId);
            } catch (err) {
               console.error("Error deleting plant:", err);
               const fresh = await getPlants(user.uid);
               setPlants(fresh);
            }
        }
    }
  };

  const filteredPlants = plants.filter(p => {
    if (filter === 'planted') return p.isPlanted;
    if (filter === 'seeds') return !p.isPlanted;
    return true;
  });

  const Badge = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className={`flex flex-col px-3 py-1.5 rounded-md border ${color} min-w-[100px]`}>
       <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{label}</span>
       <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
    </div>
  );

  return (
    <div className="pb-24 px-4 pt-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-sage-900">Hello, {user.displayName?.split(' ')[0] || 'Gardener'}</h1>
          <p className="text-sage-600">Here is your gardening status.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
             <Button onClick={() => onNavigate('scan')} className="flex-1 sm:flex-none text-sm px-4 py-2 h-auto shadow-md">
                <Plus className="w-4 h-4 mr-2" /> Add Seeds
             </Button>
             <div className="w-10 h-10 rounded-full bg-sage-200 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
               <img src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gardener'} alt="Profile" className="w-full h-full object-cover" />
             </div>
        </div>
      </div>

      {/* Weather & Alerts */}
      {weather && (
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {weather.isFrostWarning && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start gap-3 shadow-sm">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <ThermometerSnowflake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-red-900">Frost Warning!</h3>
                <p className="text-sm text-red-700">Temperatures are dropping to {weather.temp}°C tonight.</p>
              </div>
            </div>
          )}
          <div className="bg-terra-50 border border-terra-100 p-4 rounded-xl flex items-start gap-3 shadow-sm">
            <div className="bg-terra-100 p-2 rounded-full text-terra-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-terra-900">Garden Update</h3>
              <p className="text-sm text-terra-800">You have {plants.filter(p => !p.isPlanted).length} seed packets waiting to be sown.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === 'all' ? 'bg-sage-800 text-white' : 'bg-white text-sage-600 border border-sage-200'}`}
        >
          All Plants ({plants.length})
        </button>
        <button 
          onClick={() => setFilter('planted')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === 'planted' ? 'bg-leaf-600 text-white' : 'bg-white text-sage-600 border border-sage-200'}`}
        >
          In Ground ({plants.filter(p => p.isPlanted).length})
        </button>
        <button 
          onClick={() => setFilter('seeds')}
          className={`px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${filter === 'seeds' ? 'bg-terra-500 text-white' : 'bg-white text-sage-600 border border-sage-200'}`}
        >
          Seed Bank ({plants.filter(p => !p.isPlanted).length})
        </button>
      </div>

      {/* Inventory List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-32 bg-sage-50 rounded-xl animate-pulse"></div>)}
          </div>
        ) : filteredPlants.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-sage-200">
              <div className="bg-sage-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-sage-400">
                 <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-sage-900">No plants found</h3>
              <p className="text-sage-500 mb-6">Try adjusting the filter or add new seeds.</p>
           </div>
        ) : (
          filteredPlants.map((plant) => {
             const hasSchedule = plant.sowIndoors || plant.sowOutdoors || plant.transplant;
             
             return (
              <div key={plant.id} className="bg-white rounded-xl border border-earth-200 shadow-sm overflow-hidden hover:shadow-md transition-all relative group">
                  
                  {/* Status Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${plant.isPlanted ? 'bg-leaf-500' : 'bg-terra-400'}`}></div>

                  <div className="p-5 pl-7 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                     
                     {/* 1. Header Section */}
                     <div className="w-full sm:w-1/4">
                        <div className="flex items-center gap-2 mb-2">
                           <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                             plant.season === 'Summer' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                             plant.season === 'Winter' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                             plant.season === 'Autumn' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                             'bg-green-50 text-green-700 border-green-100' // Spring
                           }`}>
                              {plant.season || 'Season'}
                           </span>
                        </div>
                        <h4 className="font-bold text-xl text-earth-900 leading-tight mb-1">
                           {plant.name}
                        </h4>
                        <p className="text-sm text-earth-500 italic line-clamp-2">
                           {plant.notes || "No additional notes."}
                        </p>
                     </div>

                     {/* 2. Schedule Section */}
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
                        {!hasSchedule && (
                           <div className="text-xs text-sage-400 bg-sage-50 px-3 py-2 rounded-md border border-sage-100 flex items-center gap-2">
                             <Calendar className="w-3 h-3" /> No schedule data available
                           </div>
                        )}
                     </div>

                     {/* 3. Action Section */}
                     <div className="flex w-full sm:w-auto justify-between sm:justify-end items-center gap-4 border-t sm:border-t-0 border-earth-100 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right">
                            <span className="text-[10px] font-bold text-earth-400 uppercase tracking-wider block">Harvest</span>
                            <span className="font-bold text-leaf-700 text-sm">
                              {plant.harvest || "TBD"}
                            </span>
                        </div>
                        
                        <div className="flex items-center gap-2 pl-2 border-l border-earth-100">
                            <button 
                                onClick={() => handleTogglePlanted(plant.id, plant.isPlanted)}
                                className={`p-2 rounded-lg transition-colors border ${
                                  plant.isPlanted 
                                    ? 'bg-leaf-50 text-leaf-600 border-leaf-200 hover:bg-leaf-100' 
                                    : 'bg-white text-sage-400 border-sage-200 hover:text-leaf-600 hover:border-leaf-300'
                                }`}
                                title={plant.isPlanted ? "Mark as Harvested/Done" : "Mark as Planted"}
                              >
                                {plant.isPlanted ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                            </button>
                            <button 
                              onClick={(e) => handleDeletePlant(plant.id, e)}
                              className="p-2 text-sage-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                     </div>

                  </div>
              </div>
             );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard;
