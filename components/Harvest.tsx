

import React, { useEffect, useState } from 'react';
import { User, getHarvests, addHarvest, deleteHarvest, getPlants } from '../services/firebase';
import { generateGardenRecipe } from '../services/geminiService';
import { HarvestLog, RecipeResult } from '../types';
import { Sprout, Scale, Star, Plus, Calendar, ChefHat, Check, X, Clock, Utensils, Trash2, Sliders, ShoppingBasket, Vegan } from 'lucide-react';
import Button from './Button';

interface HarvestProps {
  user: User;
}

const Harvest: React.FC<HarvestProps> = ({ user }) => {
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Recipe Mode State
  const [isRecipeMode, setIsRecipeMode] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [recipe, setRecipe] = useState<RecipeResult | null>(null);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);

  // New Recipe Features
  const [pantryInput, setPantryInput] = useState('');
  const [creativityLevel, setCreativityLevel] = useState(2); // 1-3
  const [includeGrowing, setIncludeGrowing] = useState(false);
  const [growingPlants, setGrowingPlants] = useState<string[]>([]);

  // Form State
  const [formCrop, setFormCrop] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formRating, setFormRating] = useState(5);

  useEffect(() => {
    loadHarvests();
  }, [user]);

  // Load growing plants if toggle is active
  useEffect(() => {
    if (includeGrowing && isRecipeMode) {
        const loadGrowing = async () => {
            try {
                const plants = await getPlants(user.uid);
                // Filter for plants that are currently "In Ground"
                const inGround = plants
                    .filter(p => p.isPlanted)
                    .map(p => p.name);
                // Unique names
                setGrowingPlants(Array.from(new Set(inGround)));
            } catch (e) {
                console.error("Failed to load growing plants", e);
            }
        };
        loadGrowing();
    }
  }, [includeGrowing, isRecipeMode, user]);

  const loadHarvests = async () => {
    const data = await getHarvests(user.uid);
    setHarvests(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addHarvest(user.uid, {
      cropName: formCrop,
      weightKg: parseFloat(formWeight),
      rating: formRating as any,
      date: new Date()
    });
    setShowForm(false);
    setFormCrop('');
    setFormWeight('');
    loadHarvests();
  };

  const handleDeleteHarvest = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this harvest entry?")) {
        await deleteHarvest(user.uid, id);
        loadHarvests();
    }
  };

  const toggleIngredient = (cropName: string) => {
    if (selectedIngredients.includes(cropName)) {
      setSelectedIngredients(prev => prev.filter(i => i !== cropName));
    } else {
      setSelectedIngredients(prev => [...prev, cropName]);
    }
  };

  const handleGenerateRecipe = async () => {
    if (selectedIngredients.length === 0) return;
    setIsGeneratingRecipe(true);
    try {
      const result = await generateGardenRecipe(
          selectedIngredients, 
          pantryInput, 
          creativityLevel, 
          includeGrowing ? growingPlants : []
      );
      setRecipe(result);
    } catch (e) {
      alert("Failed to create recipe. Try again.");
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  const totalYield = harvests.reduce((sum, h) => sum + h.weightKg, 0);

  // --- Recipe Overlay ---
  if (recipe) {
    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto pb-20">
         <div className="max-w-md mx-auto relative min-h-screen">
             <div className="sticky top-0 bg-white/90 backdrop-blur-md p-4 flex justify-between items-center border-b border-sage-100 z-10">
                <h2 className="text-xl font-serif font-bold text-sage-900 flex items-center gap-2">
                   <ChefHat className="w-6 h-6 text-terra-500" /> Garden Chef
                </h2>
                <button onClick={() => setRecipe(null)} className="p-2 rounded-full bg-sage-50 hover:bg-sage-100 transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <div className="p-6">
                <div className="bg-terra-50 p-6 rounded-2xl border border-terra-100 mb-6">
                   <h1 className="text-2xl font-serif font-bold text-terra-900 mb-2">{recipe.title}</h1>
                   <p className="text-terra-800 italic text-sm mb-4">"{recipe.description}"</p>
                   <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-terra-600 bg-white/50 inline-flex px-3 py-1 rounded-full">
                      <Clock className="w-3 h-3" /> {recipe.prepTime}
                   </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-sage-900 mb-3 flex items-center gap-2">
                           <Sprout className="w-5 h-5 text-leaf-600" /> Ingredients
                        </h3>
                        <ul className="space-y-2">
                           {recipe.ingredients.map((ing, i) => (
                              <li key={i} className="flex items-start gap-3 p-3 bg-white border border-sage-100 rounded-xl shadow-sm">
                                 <div className="w-1.5 h-1.5 rounded-full bg-terra-400 mt-2 flex-shrink-0"></div>
                                 <span className="text-sage-700">{ing}</span>
                              </li>
                           ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-sage-900 mb-3 flex items-center gap-2">
                           <Utensils className="w-5 h-5 text-leaf-600" /> Instructions
                        </h3>
                        <div className="space-y-4">
                           {recipe.steps.map((step, i) => (
                              <div key={i} className="flex gap-4">
                                 <span className="font-serif font-bold text-terra-300 text-xl">{i + 1}</span>
                                 <p className="text-sage-800 leading-relaxed text-sm pt-1">{step}</p>
                              </div>
                           ))}
                        </div>
                    </div>
                    
                    {recipe.chefsNote && (
                       <div className="bg-leaf-50 p-4 rounded-xl text-sm text-leaf-900 italic border border-leaf-100">
                          <span className="font-bold not-italic mr-1">Chef's Note:</span> 
                          {recipe.chefsNote}
                       </div>
                    )}
                </div>
                
                <div className="mt-8">
                   <Button fullWidth onClick={() => setRecipe(null)}>Close Recipe</Button>
                </div>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <div className="flex justify-between items-end mb-6">
         <div>
             <h2 className="text-2xl font-serif font-bold text-sage-900">Harvest Log</h2>
             <p className="text-xs text-sage-500">Total Yield: {totalYield.toFixed(1)} kg</p>
         </div>
         {harvests.length > 0 && !showForm && (
            <button 
              onClick={() => { 
                  setIsRecipeMode(!isRecipeMode); 
                  setSelectedIngredients([]); 
                  setPantryInput('');
                  setIncludeGrowing(false);
                  setCreativityLevel(2);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                 isRecipeMode 
                 ? 'bg-terra-50 text-terra-700 border-terra-200' 
                 : 'bg-white text-sage-500 border-sage-200'
              }`}
            >
               <ChefHat className="w-4 h-4" />
               {isRecipeMode ? 'Cancel Chef' : 'Create Recipe'}
            </button>
         )}
      </div>

      {/* Generating Overlay */}
      {isGeneratingRecipe && (
         <div className="fixed inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
             <div className="w-16 h-16 bg-terra-100 text-terra-600 rounded-full flex items-center justify-center animate-bounce mb-4">
                <ChefHat className="w-8 h-8" />
             </div>
             <h3 className="text-xl font-bold text-terra-900">Cooking up ideas...</h3>
             <p className="text-terra-700">The chef is reviewing your harvest to create a custom recipe.</p>
         </div>
      )}

      {/* Add Harvest Button (Hidden in Recipe Mode) */}
      {!showForm && !isRecipeMode && (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full mb-8 bg-white border-2 border-dashed border-sage-200 rounded-2xl p-6 text-sage-400 flex flex-col items-center hover:border-terra-400 hover:text-terra-500 transition-all"
        >
           <Plus className="w-8 h-8 mb-2" />
           <span className="font-medium">Log New Harvest</span>
        </button>
      )}

      {/* Recipe Controls */}
      {isRecipeMode && (
         <div className="mb-4 bg-white rounded-xl border border-terra-200 sticky top-4 z-20 shadow-lg overflow-hidden animate-fade-in">
             <div className="bg-terra-50 p-4 border-b border-terra-100 flex justify-between items-center">
                 <h3 className="font-bold text-terra-900 flex items-center gap-2">
                     <ChefHat className="w-5 h-5" /> Kitchen Setup
                 </h3>
                 <span className="text-xs bg-white px-2 py-0.5 rounded-full text-terra-700 font-bold shadow-sm">
                    {selectedIngredients.length} Garden Items
                 </span>
             </div>
             
             <div className="p-4 space-y-4">
                 {/* Pantry Input */}
                 <div>
                    <label className="block text-xs font-bold text-terra-800 uppercase mb-1 flex items-center gap-1">
                        <ShoppingBasket className="w-3 h-3" /> Pantry Staples (Meat, Pasta, etc)
                    </label>
                    <textarea 
                        className="w-full bg-terra-50/50 border border-terra-100 rounded-lg p-3 text-sm focus:border-terra-400 outline-none resize-none h-20"
                        placeholder="e.g. Chicken breast, rice, lemon..."
                        value={pantryInput}
                        onChange={(e) => setPantryInput(e.target.value)}
                    />
                 </div>

                 {/* Creativity Slider */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-bold text-terra-800 uppercase flex items-center gap-1">
                            <Sliders className="w-3 h-3" /> Creativity
                        </label>
                        <span className="text-xs font-bold text-terra-600">
                            {creativityLevel === 1 ? 'Pantry Raid (Strict)' : creativityLevel === 2 ? 'Balanced' : 'Gourmet Shopping'}
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="3" 
                        step="1"
                        value={creativityLevel}
                        onChange={(e) => setCreativityLevel(parseInt(e.target.value))}
                        className="w-full accent-terra-500 h-2 bg-terra-100 rounded-lg appearance-none cursor-pointer"
                    />
                 </div>

                 {/* Growing Toggle */}
                 <div className="flex items-center gap-3 bg-terra-50/50 p-3 rounded-lg border border-terra-100">
                     <button 
                        onClick={() => setIncludeGrowing(!includeGrowing)}
                        className={`w-10 h-6 rounded-full p-1 transition-colors ${includeGrowing ? 'bg-terra-500' : 'bg-gray-300'}`}
                     >
                         <div className={`w-4 h-4 bg-white rounded-full transition-transform ${includeGrowing ? 'translate-x-4' : ''}`}></div>
                     </button>
                     <div className="flex-1">
                         <span className="text-sm font-bold text-terra-900 flex items-center gap-1">
                             <Vegan className="w-3 h-3" /> Shop the Garden
                         </span>
                         <p className="text-[10px] text-terra-600 leading-tight">
                             Include unharvested plants from your garden inventory.
                         </p>
                     </div>
                 </div>

                 <Button 
                   fullWidth 
                   onClick={handleGenerateRecipe} 
                   disabled={selectedIngredients.length === 0}
                   className="text-sm py-3 shadow-md"
                 >
                    Generate Recipe
                 </Button>
             </div>
             
             <div className="bg-terra-50/50 p-2 text-center border-t border-terra-100">
                 <p className="text-[10px] text-terra-500 font-medium">Select items from your harvest log below ↓</p>
             </div>
         </div>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg border border-sage-100 mb-8 animate-fade-in">
           <h3 className="font-bold text-sage-800 mb-4">Record Produce</h3>
           <div className="space-y-4">
              <div>
                 <label className="block text-xs font-bold text-sage-500 uppercase mb-1">Crop Name</label>
                 <input 
                   required
                   value={formCrop}
                   onChange={(e) => setFormCrop(e.target.value)}
                   className="w-full bg-sage-50 border border-sage-200 rounded-lg p-3 focus:border-terra-400 outline-none"
                   placeholder="e.g. Zucchini"
                 />
              </div>
              <div>
                 <label className="block text-xs font-bold text-sage-500 uppercase mb-1">Weight (kg)</label>
                 <input 
                   required
                   type="number"
                   step="0.1"
                   value={formWeight}
                   onChange={(e) => setFormWeight(e.target.value)}
                   className="w-full bg-sage-50 border border-sage-200 rounded-lg p-3 focus:border-terra-400 outline-none"
                   placeholder="0.0"
                 />
              </div>
              <div>
                 <label className="block text-xs font-bold text-sage-500 uppercase mb-1">Rating</label>
                 <div className="flex gap-2">
                    {[1,2,3,4,5].map(star => (
                       <button
                         key={star}
                         type="button"
                         onClick={() => setFormRating(star)}
                         className={`p-2 rounded-lg transition-colors ${formRating >= star ? 'text-yellow-400 bg-yellow-50' : 'text-sage-200 bg-sage-50'}`}
                       >
                          <Star className="w-6 h-6 fill-current" />
                       </button>
                    ))}
                 </div>
              </div>
              <div className="flex gap-3 pt-2">
                 <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-sage-500 font-medium">Cancel</button>
                 <button type="submit" className="flex-1 bg-terra-500 text-white rounded-xl py-3 font-bold shadow-md">Save</button>
              </div>
           </div>
        </form>
      )}

      {/* Gallery List */}
      <div className="space-y-4">
         {harvests.map(harvest => {
            const isSelected = selectedIngredients.includes(harvest.cropName);
            return (
            <div 
               key={harvest.id} 
               onClick={() => isRecipeMode && toggleIngredient(harvest.cropName)}
               className={`
                  bg-white rounded-2xl p-4 border transition-all relative group
                  ${isRecipeMode 
                     ? (isSelected ? 'border-terra-500 ring-1 ring-terra-500 bg-terra-50 cursor-pointer' : 'border-sage-100 opacity-80 cursor-pointer hover:opacity-100') 
                     : 'border-sage-100 shadow-sm'
                  }
               `}
            >
               <div className="flex items-center gap-4">
                   <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-terra-200 text-terra-700' : 'bg-sage-100 text-sage-400'}`}>
                      {isRecipeMode && isSelected ? <Check className="w-8 h-8" /> : <Sprout className="w-8 h-8" />}
                   </div>
                   <div className="flex-grow">
                      <div className="flex justify-between items-start">
                         <h4 className="font-bold text-sage-900 text-lg">{harvest.cropName}</h4>
                         {!isRecipeMode && (
                            <div className="flex text-yellow-400">
                               {[...Array(harvest.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                            </div>
                         )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-sage-500 mt-1">
                         <span className="flex items-center gap-1"><Scale className="w-3 h-3" /> {harvest.weightKg}kg</span>
                         <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {harvest.date.toLocaleDateString()}</span>
                      </div>
                   </div>
               </div>

               {/* Delete Button (Only visible when NOT in recipe mode) */}
               {!isRecipeMode && (
                   <button 
                      onClick={(e) => handleDeleteHarvest(harvest.id, e)}
                      className="absolute top-4 right-4 p-2 text-sage-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                   >
                       <Trash2 className="w-4 h-4" />
                   </button>
               )}
            </div>
         )})}
         {harvests.length === 0 && !showForm && (
            <div className="text-center text-sage-400 py-8">No harvests recorded yet.</div>
         )}
      </div>
    </div>
  );
};

export default Harvest;