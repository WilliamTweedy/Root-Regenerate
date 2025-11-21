import React, { useState, useRef, useEffect } from 'react';
import { SoilDiagnosisInputs, SoilTexture, CompactionLevel, DrainageStatus, BiodiversityLevel, SurfaceCondition } from '../types';
import Button from './Button';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface QuestionnaireProps {
  onComplete: (data: SoilDiagnosisInputs) => void;
}

const steps = [
  { id: 'texture', title: 'Soil Texture', description: 'Take a handful of damp soil and squeeze it.' },
  { id: 'compaction', title: 'Compaction Test', description: 'Try pushing a wire or stick into the ground.' },
  { id: 'drainage', title: 'Water Retention', description: 'Dig a small hole, fill it with water. What happens?' },
  { id: 'biodiversity', title: 'Signs of Life', description: 'Look closely at a shovel-full of soil.' },
  { id: 'surface', title: 'Current Surface', description: 'What is currently covering the area?' },
  { id: 'specific', title: 'Specific Problem', description: 'Describe any other issues (e.g., moss, yellow leaves).' },
];

const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [inputs, setInputs] = useState<SoilDiagnosisInputs>({
    texture: null,
    compaction: null,
    drainage: null,
    biodiversity: null,
    surface: null,
    specificConcern: '',
  });
  
  // Ref to track the auto-advance timer so we can clear it if user navigates manually
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleOptionSelect = (key: keyof SoilDiagnosisInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }));
    
    // Clear any pending timer to prevent race conditions (double jump)
    if (timerRef.current) clearTimeout(timerRef.current);

    // Auto advance for single-select questions
    if (currentStep < steps.length - 1 && key !== 'specificConcern') {
      timerRef.current = setTimeout(() => {
        setCurrentStep(curr => {
          // Safety check: Ensure we don't increment past the last step
          if (curr < steps.length - 1) return curr + 1;
          return curr;
        });
      }, 250);
    }
  };

  const handleNext = () => {
    // Clear timer if user clicks Next manually
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onComplete(inputs);
    }
  };

  const handleBack = () => {
    // Clear timer if user clicks Back
    if (timerRef.current) clearTimeout(timerRef.current);

    if (currentStep > 0) {
      setCurrentStep(curr => curr - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Safety check to prevent render crashes if index is out of bounds
  const currentStepData = steps[currentStep] || steps[0];

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-earth-600 mb-2 font-medium">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{currentStepData.title}</span>
        </div>
        <div className="h-2 bg-earth-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-leaf-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-earth-100 p-6 sm:p-10 min-h-[400px] flex flex-col">
        <div className="flex-grow">
          <h2 className="text-2xl font-serif font-bold text-earth-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-earth-600 mb-8 text-lg">
            {currentStepData.description}
          </p>

          {/* Dynamic Input Rendering */}
          <div className="space-y-3">
            {currentStep === 0 && (
              <OptionsGroup 
                options={Object.values(SoilTexture)} 
                selected={inputs.texture} 
                onSelect={(val) => handleOptionSelect('texture', val)} 
              />
            )}
            {currentStep === 1 && (
              <OptionsGroup 
                options={Object.values(CompactionLevel)} 
                selected={inputs.compaction} 
                onSelect={(val) => handleOptionSelect('compaction', val)} 
              />
            )}
            {currentStep === 2 && (
              <OptionsGroup 
                options={Object.values(DrainageStatus)} 
                selected={inputs.drainage} 
                onSelect={(val) => handleOptionSelect('drainage', val)} 
              />
            )}
            {currentStep === 3 && (
              <OptionsGroup 
                options={Object.values(BiodiversityLevel)} 
                selected={inputs.biodiversity} 
                onSelect={(val) => handleOptionSelect('biodiversity', val)} 
              />
            )}
            {currentStep === 4 && (
              <OptionsGroup 
                options={Object.values(SurfaceCondition)} 
                selected={inputs.surface} 
                onSelect={(val) => handleOptionSelect('surface', val)} 
              />
            )}
            {currentStep === 5 && (
              <div className="space-y-4">
                <textarea 
                  className="w-full p-4 rounded-lg border-2 border-earth-200 focus:border-leaf-500 focus:ring-0 min-h-[150px] bg-earth-50/50 resize-none"
                  placeholder="Describe any specific weeds, plant diseases, or observations..."
                  value={inputs.specificConcern}
                  onChange={(e) => setInputs({...inputs, specificConcern: e.target.value})}
                />
              </div>
            )}
          </div>
        </div>

        {/* Navigation Controls */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-earth-100">
          <button 
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center text-earth-600 hover:text-earth-900 font-medium transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>

          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Analyze Soil' : 'Next'}
            {currentStep !== steps.length - 1 && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

const OptionsGroup = ({ options, selected, onSelect }: { options: string[], selected: string | null, onSelect: (val: string) => void }) => (
  <div className="grid gap-3">
    {options.map((option) => (
      <button
        key={option}
        onClick={() => onSelect(option)}
        className={`
          relative flex items-center w-full p-4 rounded-xl border-2 text-left transition-all duration-200 group
          ${selected === option 
            ? 'border-leaf-600 bg-leaf-50 text-leaf-900 shadow-inner' 
            : 'border-earth-200 bg-white text-earth-700 hover:border-leaf-400 hover:bg-earth-50'}
        `}
      >
        <div className={`
          w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center flex-shrink-0 transition-colors
          ${selected === option ? 'border-leaf-600 bg-leaf-600' : 'border-earth-300 group-hover:border-leaf-400'}
        `}>
          {selected === option && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="font-medium">{option}</span>
      </button>
    ))}
  </div>
);

export default Questionnaire;