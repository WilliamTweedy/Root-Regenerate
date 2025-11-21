import React, { useState, useRef } from 'react';
import { PlantingPlanInputs } from '../types';
import Button from './Button';
import { ArrowRight, ArrowLeft, Upload, Image as ImageIcon, Type, X, MapPin, Ruler } from 'lucide-react';

interface PlantingWizardProps {
  onComplete: (data: PlantingPlanInputs) => void;
}

const PlantingWizard: React.FC<PlantingWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState<PlantingPlanInputs>({
    location: '',
    spaceSize: '',
    spaceUnit: 'm²',
    seedInputType: 'text',
    seedText: '',
    seedImages: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // Extract base64 data and mime type
          const base64Data = result.split(',')[1];
          const mimeType = result.split(';')[0].split(':')[1];
          
          setInputs(prev => ({
            ...prev,
            seedImages: [...prev.seedImages, { base64: base64Data, mimeType }]
          }));
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeImage = (index: number) => {
    setInputs(prev => ({
      ...prev,
      seedImages: prev.seedImages.filter((_, i) => i !== index)
    }));
  };

  const handleNext = () => {
    if (step === 1) {
       if (!inputs.location || !inputs.spaceSize) return; // Simple validation
       setStep(2);
    } else {
       onComplete(inputs);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Progress */}
      <div className="mb-8 flex items-center justify-center space-x-4">
         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-leaf-600 text-white' : 'bg-earth-200 text-earth-500'}`}>1</div>
         <div className={`h-1 w-16 ${step >= 2 ? 'bg-leaf-600' : 'bg-earth-200'}`}></div>
         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-leaf-600 text-white' : 'bg-earth-200 text-earth-500'}`}>2</div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-earth-100 p-6 sm:p-10 min-h-[400px] flex flex-col">
        
        {step === 1 && (
          <div className="flex-grow space-y-6">
             <h2 className="text-2xl font-serif font-bold text-earth-900">Garden Details</h2>
             <p className="text-earth-600">To create an accurate plan, we need to know your growing season and constraints.</p>
             
             <div>
                <label className="block text-sm font-medium text-earth-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-1"/> Rough Location
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. London, UK or Zone 8b"
                  className="w-full p-3 rounded-lg border-2 border-earth-200 focus:border-leaf-500 focus:ring-0 bg-earth-50/50"
                  value={inputs.location}
                  onChange={(e) => setInputs({...inputs, location: e.target.value})}
                />
             </div>

             <div>
                <label className="block text-sm font-medium text-earth-700 mb-2 flex items-center">
                    <Ruler className="w-4 h-4 mr-1"/> Growing Space Size
                </label>
                <div className="flex gap-2">
                    <input 
                      type="number" 
                      placeholder="e.g. 10"
                      className="flex-grow p-3 rounded-lg border-2 border-earth-200 focus:border-leaf-500 focus:ring-0 bg-earth-50/50"
                      value={inputs.spaceSize}
                      onChange={(e) => setInputs({...inputs, spaceSize: e.target.value})}
                    />
                    <select 
                       className="p-3 rounded-lg border-2 border-earth-200 bg-white"
                       value={inputs.spaceUnit}
                       onChange={(e) => setInputs({...inputs, spaceUnit: e.target.value as any})}
                    >
                        <option value="m²">m²</option>
                        <option value="ft²">ft²</option>
                    </select>
                </div>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex-grow space-y-6">
             <h2 className="text-2xl font-serif font-bold text-earth-900">What are we growing?</h2>
             <p className="text-earth-600">Upload photos of your seed packets or type a list of what you want to grow.</p>
             
             {/* Toggle */}
             <div className="flex bg-earth-100 p-1 rounded-lg mb-6">
                <button 
                  onClick={() => setInputs({...inputs, seedInputType: 'text'})}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-all ${inputs.seedInputType === 'text' ? 'bg-white shadow-sm text-earth-900' : 'text-earth-600'}`}
                >
                   <Type className="w-4 h-4 mr-2"/> Text List
                </button>
                <button 
                  onClick={() => setInputs({...inputs, seedInputType: 'image'})}
                  className={`flex-1 flex items-center justify-center py-2 rounded-md text-sm font-medium transition-all ${inputs.seedInputType === 'image' ? 'bg-white shadow-sm text-earth-900' : 'text-earth-600'}`}
                >
                   <ImageIcon className="w-4 h-4 mr-2"/> Upload Photos
                </button>
             </div>

             {inputs.seedInputType === 'text' ? (
                 <textarea 
                    className="w-full p-4 rounded-lg border-2 border-earth-200 focus:border-leaf-500 focus:ring-0 min-h-[200px] bg-earth-50/50 resize-none"
                    placeholder="e.g. Carrots (Nantes), Lettuce, Tomatoes, Basil, Radish..."
                    value={inputs.seedText}
                    onChange={(e) => setInputs({...inputs, seedText: e.target.value})}
                 />
             ) : (
                 <div className="space-y-4">
                     <div 
                       onClick={() => fileInputRef.current?.click()}
                       className="border-2 border-dashed border-earth-300 rounded-xl p-8 text-center cursor-pointer hover:border-leaf-500 hover:bg-leaf-50 transition-colors"
                     >
                        <Upload className="w-10 h-10 text-earth-400 mx-auto mb-3"/>
                        <p className="text-earth-700 font-medium">Click to upload photos</p>
                        <p className="text-xs text-earth-500 mt-1">Supports JPG, PNG</p>
                        <input 
                           type="file" 
                           ref={fileInputRef} 
                           className="hidden" 
                           multiple 
                           accept="image/*"
                           onChange={handleImageUpload}
                        />
                     </div>

                     {/* Image Previews */}
                     {inputs.seedImages.length > 0 && (
                         <div className="grid grid-cols-3 gap-2 mt-4">
                             {inputs.seedImages.map((img, idx) => (
                                 <div key={idx} className="relative aspect-square bg-earth-100 rounded-lg overflow-hidden group">
                                     <img 
                                       src={`data:${img.mimeType};base64,${img.base64}`} 
                                       alt="Seed preview" 
                                       className="w-full h-full object-cover"
                                     />
                                     <button 
                                       onClick={() => removeImage(idx)}
                                       className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                         <X className="w-3 h-3"/>
                                     </button>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>
             )}
          </div>
        )}

        {/* Nav */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-earth-100">
          {step > 1 ? (
            <button 
              onClick={() => setStep(1)}
              className="flex items-center text-earth-600 hover:text-earth-900 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </button>
          ) : (
             <div></div> // Spacer
          )}

          <Button onClick={handleNext} disabled={step === 2 && inputs.seedInputType === 'image' && inputs.seedImages.length === 0 && !inputs.seedText}>
            {step === 2 ? 'Create Plan' : 'Next'}
            {step !== 2 && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default PlantingWizard;