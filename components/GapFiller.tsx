

import React, { useState, useEffect } from 'react';
import { User, getPlants } from '../services/firebase';
import { generateGapFillerRecommendation } from '../services/geminiService';
import { GapFillerInputs, GapFillerResult } from '../types';
import Button from './Button';
import Loading from './Loading';
import { Ruler, Trees, Sprout, ArrowLeft, Lightbulb, HeartHandshake, CheckCircle, MapPin, Navigation } from 'lucide-react';

interface GapFillerProps {
  user: User | null;
  onBack: () => void;
}

const GapFiller: React.FC<GapFillerProps> = ({ user, onBack }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inputs, setInputs] = useState<GapFillerInputs>({
    gapSize: '',
    surroundingPlants: '',
    goal: 'Food',
    useInventory: false,
    location: ''
  });
  const [result, setResult] = useState<GapFillerResult | null>(null);
  const [inventoryCount, setInventoryCount] = useState(0);

  useEffect(() => {
    if (user && inputs.useInventory) {
      getPlants(user.uid).then(plants => {
         const uniqueNames = new Set(plants.map(p => p.name));
         setInventoryCount(uniqueNames.size);
      });
    }
  }, [user, inputs.useInventory]);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
         // Gemini is very good at interpreting raw coordinates
         setInputs(prev => ({
             ...prev, 
             location: `Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)}`
         }));
      }, (err) => {
         alert("Could not access location. Please enter manually (e.g., 'London, UK' or 'Zone 9').");
      });
    } else {
        alert("Geolocation is not supported by this browser.");
    }
  }

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let inventoryList: string[] = [];
      if (user && inputs.useInventory) {
         const plants = await getPlants(user.uid);
         inventoryList = Array.from(new Set(plants.map(p => p.name)));
      }

      const rec = await generateGapFillerRecommendation(inputs, inventoryList);
      setResult(rec);
      setStep(2);
    } catch (error) {
      alert("Could not generate recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif font-bold text-sage-900 flex items-center gap-2">
            <Trees className="w-6 h-6 text-terra-500" /> Gap Filler
        </h2>
        <button onClick={onBack} className="text-sm font-medium text-sage-500 hover:text-sage-800 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sage-200 shadow-sm space-y-6">
           
           <div>
              <label className="block text-sm font-bold text-sage-700 mb-2 flex items-center gap-2">
                 <MapPin className="w-4 h-4 text-leaf-600" /> Location / Climate
              </label>
              <div className="flex gap-2">
                  <input 
                    className="w-full p-4 rounded-xl border-2 border-sage-100 focus:border-leaf-400 focus:ring-0 bg-sage-50"
                    placeholder="e.g. London, UK or Zone 9b"
                    value={inputs.location}
                    onChange={(e) => setInputs({...inputs, location: e.target.value})}
                  />
                  <button 
                    onClick={handleGetLocation}
                    className="p-4 rounded-xl border-2 border-sage-100 bg-sage-50 text-sage-500 hover:text-leaf-600 hover:border-leaf-400 transition-colors"
                    title="Use Current Location"
                  >
                     <Navigation className="w-5 h-5" />
                  </button>
              </div>
              <p className="text-xs text-sage-400 mt-1 pl-1">Crucial for recommending plants that will survive the current season.</p>
           </div>

           <div>
              <label className="block text-sm font-bold text-sage-700 mb-2 flex items-center gap-2">
                 <Ruler className="w-4 h-4 text-leaf-600" /> Gap Size
              </label>
              <input 
                className="w-full p-4 rounded-xl border-2 border-sage-100 focus:border-leaf-400 focus:ring-0 bg-sage-50"
                placeholder="e.g. 30cm x 30cm, or 'small corner'"
                value={inputs.gapSize}
                onChange={(e) => setInputs({...inputs, gapSize: e.target.value})}
              />
           </div>

           <div>
              <label className="block text-sm font-bold text-sage-700 mb-2 flex items-center gap-2">
                 <Trees className="w-4 h-4 text-leaf-600" /> Surrounding Plants
              </label>
              <textarea 
                className="w-full p-4 rounded-xl border-2 border-sage-100 focus:border-leaf-400 focus:ring-0 bg-sage-50 resize-none h-24"
                placeholder="e.g. Tomatoes on the left, Basil on the right..."
                value={inputs.surroundingPlants}
                onChange={(e) => setInputs({...inputs, surroundingPlants: e.target.value})}
              />
           </div>

           <div>
              <label className="block text-sm font-bold text-sage-700 mb-2">Primary Goal</label>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setInputs({...inputs, goal: 'Food'})}
                   className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${inputs.goal === 'Food' ? 'border-terra-400 bg-terra-50 text-terra-800' : 'border-sage-100 text-sage-400'}`}
                 >
                    Food Production
                 </button>
                 <button 
                   onClick={() => setInputs({...inputs, goal: 'Soil Regeneration'})}
                   className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${inputs.goal === 'Soil Regeneration' ? 'border-leaf-400 bg-leaf-50 text-leaf-800' : 'border-sage-100 text-sage-400'}`}
                 >
                    Soil Health
                 </button>
              </div>
           </div>

           {user && (
             <div className="bg-sage-50 p-4 rounded-xl border border-sage-200 flex items-center gap-3">
                 <input 
                    type="checkbox" 
                    id="useInventory"
                    checked={inputs.useInventory}
                    onChange={(e) => setInputs({...inputs, useInventory: e.target.checked})}
                    className="w-5 h-5 rounded border-sage-300 text-leaf-600 focus:ring-leaf-500"
                 />
                 <label htmlFor="useInventory" className="text-sage-700 text-sm font-medium cursor-pointer select-none">
                    Prioritize my existing seeds {inventoryCount > 0 && `(${inventoryCount} varieties)`}
                 </label>
             </div>
           )}

           <Button 
             fullWidth 
             onClick={handleSubmit} 
             disabled={!inputs.gapSize || !inputs.surroundingPlants || !inputs.location}
           >
              Find Perfect Match
           </Button>
        </div>
      )}

      {step === 2 && result && (
        <div className="animate-fade-in space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-leaf-200 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-leaf-100 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                
                <div className="relative z-10">
                   <div className="flex items-center gap-2 mb-2">
                       <span className="text-xs font-bold uppercase tracking-wider text-leaf-600 bg-leaf-50 px-2 py-1 rounded-md">
                          Best Match
                       </span>
                       {result.isFromInventory && (
                          <span className="text-xs font-bold uppercase tracking-wider text-terra-600 bg-terra-50 px-2 py-1 rounded-md flex items-center gap-1">
                             <CheckCircle className="w-3 h-3" /> In Inventory
                          </span>
                       )}
                   </div>
                   <h1 className="text-4xl font-serif font-bold text-sage-900 mb-6">{result.recommendedPlant}</h1>
                   
                   <div className="space-y-6">
                       <div>
                           <h3 className="font-bold text-sage-900 flex items-center gap-2 mb-2">
                               <Lightbulb className="w-5 h-5 text-amber-500" /> Why this works
                           </h3>
                           <p className="text-sage-700 leading-relaxed bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                               {result.reasoning}
                           </p>
                       </div>

                       <div>
                           <h3 className="font-bold text-sage-900 flex items-center gap-2 mb-2">
                               <HeartHandshake className="w-5 h-5 text-pink-500" /> Companion Benefits
                           </h3>
                           <p className="text-sage-700 leading-relaxed bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                               {result.companionBenefits}
                           </p>
                       </div>

                       <div>
                           <h3 className="font-bold text-sage-900 flex items-center gap-2 mb-2">
                               <Sprout className="w-5 h-5 text-leaf-600" /> Sowing Instructions
                           </h3>
                           <div className="text-sage-700 bg-leaf-50 p-4 rounded-xl border-l-4 border-leaf-400">
                               {result.plantingInstructions}
                           </div>
                       </div>
                   </div>
                </div>
            </div>

            <Button fullWidth variant="secondary" onClick={() => setStep(1)}>
               Check Another Gap
            </Button>
        </div>
      )}
    </div>
  );
};

export default GapFiller;