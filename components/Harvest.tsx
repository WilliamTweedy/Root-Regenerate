import React, { useEffect, useState } from 'react';
import { User, getHarvests, addHarvest } from '../services/firebase';
import { HarvestLog } from '../types';
import { Sprout, Scale, Star, Plus, Calendar } from 'lucide-react';

interface HarvestProps {
  user: User;
}

const Harvest: React.FC<HarvestProps> = ({ user }) => {
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [formCrop, setFormCrop] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formRating, setFormRating] = useState(5);

  useEffect(() => {
    loadHarvests();
  }, [user]);

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

  const totalYield = harvests.reduce((sum, h) => sum + h.weightKg, 0);

  return (
    <div className="pb-24 px-4 pt-6 max-w-md mx-auto">
      <div className="flex justify-between items-end mb-6">
         <h2 className="text-2xl font-serif font-bold text-sage-900">Harvest Scrapbook</h2>
         <div className="bg-terra-100 text-terra-800 px-3 py-1 rounded-lg text-xs font-bold">
            Total: {totalYield.toFixed(1)} kg
         </div>
      </div>

      {/* Add Harvest Button */}
      {!showForm ? (
        <button 
          onClick={() => setShowForm(true)}
          className="w-full mb-8 bg-white border-2 border-dashed border-sage-200 rounded-2xl p-6 text-sage-400 flex flex-col items-center hover:border-terra-400 hover:text-terra-500 transition-all"
        >
           <Plus className="w-8 h-8 mb-2" />
           <span className="font-medium">Log New Harvest</span>
        </button>
      ) : (
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

      {/* Gallery */}
      <div className="space-y-4">
         {harvests.map(harvest => (
            <div key={harvest.id} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-sage-100">
               <div className="w-16 h-16 bg-sage-100 rounded-xl flex items-center justify-center text-sage-400 flex-shrink-0">
                  <Sprout className="w-8 h-8" />
               </div>
               <div className="flex-grow">
                  <div className="flex justify-between items-start">
                     <h4 className="font-bold text-sage-900 text-lg">{harvest.cropName}</h4>
                     <div className="flex text-yellow-400">
                        {[...Array(harvest.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                     </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-sage-500 mt-1">
                     <span className="flex items-center gap-1"><Scale className="w-3 h-3" /> {harvest.weightKg}kg</span>
                     <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {harvest.date.toLocaleDateString()}</span>
                  </div>
               </div>
            </div>
         ))}
         {harvests.length === 0 && !showForm && (
            <div className="text-center text-sage-400 py-8">No harvests recorded yet.</div>
         )}
      </div>
    </div>
  );
};

export default Harvest;