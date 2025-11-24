
import React, { useState, useRef } from 'react';
import { User, addPlant, getPlants } from '../services/firebase';
import { identifyPlants } from '../services/geminiService';
import { PlantIdentificationResult } from '../types';
import { Camera, Loader2, X, Plus, UploadCloud, Check, AlertCircle } from 'lucide-react';
import Button from './Button';

interface ScannerProps {
  user: User;
  onComplete: () => void;
}

// Extended type for UI state
interface ScannedPlant extends PlantIdentificationResult {
  isDuplicate: boolean;
  selected: boolean;
  uiId: string; // Internal ID for list management
}

const Scanner: React.FC<ScannerProps> = ({ user, onComplete }) => {
  const [images, setImages] = useState<{ base64: string, mimeType: string, preview: string }[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<ScannedPlant[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1];
          const mimeType = result.split(';')[0].split(':')[1];
          
          setImages(prev => [...prev, { 
            base64: base64Data, 
            mimeType,
            preview: result 
          }]);
          setError(null);
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    
    setIsAnalyzing(true);
    setError(null);
    try {
      // 1. Identify Plants
      const plantData = await identifyPlants(images.map(img => ({ base64: img.base64, mimeType: img.mimeType })));
      
      // 2. Fetch existing inventory for duplicate checking
      let existingPlants: any[] = [];
      try {
        existingPlants = await getPlants(user.uid);
      } catch (e) {
        console.warn("Duplicate check failed to fetch plants", e);
      }

      // 3. Process results to mark duplicates
      const processed: ScannedPlant[] = plantData.map((plant, idx) => {
        // Normalize names for comparison
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
        const newName = normalize(plant.name);
        
        // Check if exists in DB
        const isDupe = existingPlants.some(p => normalize(p.name) === newName);
        
        // Check if exists in OTHER results in this same batch
        const isBatchDupe = plantData.findIndex(p => normalize(p.name) === newName) < idx;

        const isDuplicate = isDupe || isBatchDupe;

        return {
          ...plant,
          uiId: `scan-${Date.now()}-${idx}`,
          isDuplicate,
          selected: !isDuplicate // Uncheck by default if duplicate
        };
      });

      setResults(processed);
    } catch (err) {
      console.error(err);
      setError("Failed to identify plants. Please check your internet connection or try clearer photos.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSelection = (index: number) => {
    setResults(prev => prev.map((p, i) => i === index ? { ...p, selected: !p.selected } : p));
  };

  const handleAddSelected = async () => {
    const toAdd = results.filter(p => p.selected);
    if (toAdd.length === 0) {
        onComplete();
        return;
    }
    
    const promises = toAdd.map(plant => addPlant(user.uid, {
      name: plant.name,
      type: plant.type,
      season: plant.season,
      plantedDate: new Date(),
      notes: plant.notes,
      isPlanted: false, // Default to seed inventory
      sowIndoors: plant.sowIndoors,
      sowOutdoors: plant.sowOutdoors,
      transplant: plant.transplant,
      harvest: plant.harvest
    }));

    await Promise.all(promises);
    onComplete();
  };

  const Badge = ({ label, value, color }: { label: string, value: string, color: string }) => (
    <div className={`flex flex-col px-2 py-1 rounded-md border ${color} min-w-[80px]`}>
       <span className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</span>
       <span className="text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis">{value}</span>
    </div>
  );

  // -- RENDER: RESULTS VIEW --
  if (results.length > 0) {
    const selectedCount = results.filter(r => r.selected).length;

    return (
      <div className="pb-24 px-4 pt-6 max-w-2xl mx-auto flex flex-col h-screen">
         <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-sage-900">Scan Results</h2>
              <p className="text-sm text-sage-500">Select seeds to add to inventory.</p>
            </div>
            <button onClick={() => setResults([])} className="text-sage-500 text-sm hover:text-sage-800 font-medium bg-sage-50 px-3 py-1 rounded-lg">
               Rescan
            </button>
         </div>

         <div className="flex-grow overflow-y-auto space-y-3 mb-4">
            {results.map((plant, idx) => (
               <div 
                  key={plant.uiId} 
                  className={`relative p-4 rounded-xl border transition-all ${
                     plant.selected 
                       ? 'bg-white border-leaf-300 shadow-md ring-1 ring-leaf-200' 
                       : 'bg-sage-50 border-sage-200 opacity-75'
                  }`}
               >
                  <div className="flex gap-3">
                     {/* Checkbox */}
                     <button 
                       onClick={() => toggleSelection(idx)}
                       className={`mt-1 w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                          plant.selected ? 'bg-leaf-600 border-leaf-600' : 'bg-white border-sage-300'
                       }`}
                     >
                        {plant.selected && <Check className="w-4 h-4 text-white" />}
                     </button>

                     <div className="flex-grow">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <h3 className="font-bold text-sage-900">{plant.name}</h3>
                              <p className="text-xs text-sage-500 italic">{plant.notes}</p>
                           </div>
                           {plant.isDuplicate && (
                             <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wide">
                                <AlertCircle className="w-3 h-3" /> Duplicate
                             </span>
                           )}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                           {plant.sowIndoors && plant.sowIndoors !== 'N/A' && (
                              <Badge label="Indoor" value={plant.sowIndoors} color="bg-blue-50 text-blue-700 border-blue-200" />
                           )}
                           {plant.sowOutdoors && plant.sowOutdoors !== 'N/A' && (
                              <Badge label="Outdoor" value={plant.sowOutdoors} color="bg-amber-50 text-amber-800 border-amber-200" />
                           )}
                           {plant.transplant && plant.transplant !== 'N/A' && (
                              <Badge label="Transplant" value={plant.transplant} color="bg-purple-50 text-purple-700 border-purple-200" />
                           )}
                           <Badge label="Harvest" value={plant.harvest} color="bg-leaf-50 text-leaf-700 border-leaf-200" />
                        </div>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         <div className="mb-24 pt-4 border-t border-sage-100 bg-white/90 backdrop-blur-sm sticky bottom-0">
            <Button onClick={handleAddSelected} fullWidth disabled={selectedCount === 0}>
               <Plus className="w-5 h-5 mr-2" />
               {selectedCount === 0 ? 'Select Seeds' : `Add ${selectedCount} Seeds`}
            </Button>
         </div>
      </div>
    );
  }

  // -- RENDER: SCANNER VIEW --
  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto flex flex-col h-screen">
      <h2 className="text-2xl font-serif font-bold text-sage-900 mb-2">Seed Scanner</h2>
      <p className="text-sage-600 mb-6">Take photos of your seed packets to auto-generate a schedule.</p>

      {/* Image Grid */}
      <div className="flex-grow">
        <div className="grid grid-cols-2 gap-3 mb-4">
           {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-sage-200 shadow-sm group">
                 <img src={img.preview} alt="Preview" className="w-full h-full object-cover" />
                 <button 
                   onClick={() => removeImage(idx)}
                   className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                 >
                    <X className="w-3 h-3" />
                 </button>
              </div>
           ))}
           
           {/* Add Button */}
           <div 
             onClick={() => fileInputRef.current?.click()}
             className={`
               aspect-square rounded-xl border-2 border-dashed border-sage-300 bg-sage-50 
               flex flex-col items-center justify-center cursor-pointer hover:bg-sage-100 transition-colors
               ${images.length === 0 ? 'col-span-2 aspect-auto h-64' : ''}
             `}
           >
              <div className="bg-white p-4 rounded-full shadow-sm mb-2">
                 <Camera className="w-6 h-6 text-terra-500" />
              </div>
              <span className="text-sage-500 font-medium text-sm">
                 {images.length === 0 ? "Tap to capture seeds" : "Add another"}
              </span>
           </div>
        </div>
        
        <input 
            type="file" 
            multiple
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleCapture}
        />
        
        {error && (
           <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4 flex items-start gap-2">
              <X className="w-5 h-5 flex-shrink-0" />
              {error}
           </div>
        )}
      </div>

      {/* Analyze Action */}
      {images.length > 0 && (
         <div className="mb-24 animate-slide-up">
            <Button onClick={handleAnalyze} fullWidth disabled={isAnalyzing}>
               {isAnalyzing ? (
                  <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Analyzing...</>
               ) : (
                  <><UploadCloud className="w-5 h-5 mr-2" /> Identify & Schedule</>
               )}
            </Button>
         </div>
      )}
    </div>
  );
};

export default Scanner;
