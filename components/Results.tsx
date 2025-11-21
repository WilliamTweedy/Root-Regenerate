import React from 'react';
import { DiagnosisResponse } from '../types';
import Button from './Button';
import { Download, Share2, AlertTriangle, CheckCircle, Activity, Sprout, ArrowRight, Droplets, Shield, Shovel } from 'lucide-react';

interface ResultsProps {
  diagnosis: DiagnosisResponse | string; // Handle both string errors and structured data
  onReset: () => void;
}

const Results: React.FC<ResultsProps> = ({ diagnosis, onReset }) => {
  
  // Error State Fallback
  if (typeof diagnosis === 'string') {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <div className="bg-white p-8 rounded-2xl border border-red-100 shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-earth-900 mb-4">Analysis Issue</h2>
          <p className="text-earth-700 mb-6">{diagnosis}</p>
          <Button onClick={onReset}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-serif font-bold text-earth-900">Soil Health Report</h2>
            <p className="text-earth-600">Based on Minimal Disturbance Principles</p>
         </div>
         <div className="flex gap-2">
            {/* Placeholder buttons for future functionality */}
            <button className="p-2 rounded-full bg-white border border-earth-200 hover:bg-earth-50 text-earth-600">
               <Download className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-white border border-earth-200 hover:bg-earth-50 text-earth-600">
               <Share2 className="w-5 h-5" />
            </button>
         </div>
      </div>

      {/* Health Dashboard Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-earth-200 overflow-hidden mb-8">
         <div className="p-6 sm:p-8 grid md:grid-cols-[1fr_auto] gap-8 items-start">
            <div>
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-leaf-50 text-leaf-800 text-sm font-bold mb-4">
                  <Activity className="w-4 h-4" /> Diagnosis
               </div>
               <h3 className="text-2xl sm:text-3xl font-bold text-earth-900 mb-3">
                  {diagnosis.healthTitle}
               </h3>
               <p className="text-earth-700 text-lg leading-relaxed">
                  {diagnosis.diagnosisSummary}
               </p>
            </div>

            {/* Score Circle */}
            <div className="flex flex-col items-center bg-earth-50 p-4 rounded-xl min-w-[120px]">
               <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-earth-200" />
                     <circle 
                        cx="40" cy="40" r="36" 
                        stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={226} // 2 * pi * 36
                        strokeDashoffset={226 - (226 * diagnosis.healthScore) / 10}
                        className={`${diagnosis.healthScore > 7 ? 'text-leaf-500' : diagnosis.healthScore > 4 ? 'text-amber-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                     />
                  </svg>
                  <span className="absolute text-2xl font-bold text-earth-900">{diagnosis.healthScore}</span>
               </div>
               <span className="text-xs font-bold text-earth-500 uppercase tracking-wider mt-2">Health Score</span>
            </div>
         </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
         
         {/* Left Column: Action Plan */}
         <div className="space-y-8">
            
            {/* Immediate Remediation */}
            <section>
               <h3 className="text-xl font-serif font-bold text-earth-900 mb-4 flex items-center gap-2">
                  <Shovel className="w-5 h-5 text-earth-600" /> 
                  The No-Dig Fix
               </h3>
               <div className="bg-white rounded-xl shadow-sm border border-earth-200 p-6 space-y-6">
                  {diagnosis.immediateActions.map((step, idx) => (
                     <div key={idx} className="flex gap-4">
                        <div className="flex-shrink-0 flex flex-col items-center">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              step.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-leaf-100 text-leaf-800'
                           }`}>
                              {idx + 1}
                           </div>
                           {idx !== diagnosis.immediateActions.length - 1 && (
                              <div className="w-0.5 h-full bg-earth-100 my-1"></div>
                           )}
                        </div>
                        <div>
                           <h4 className="font-bold text-earth-900 text-lg mb-1">{step.title}</h4>
                           <p className="text-earth-600 text-sm leading-relaxed">{step.description}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </section>

            {/* Long Term Strategy */}
            <section>
               <h3 className="text-xl font-serif font-bold text-earth-900 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-earth-600" /> 
                  Long-term Care
               </h3>
               <div className="bg-earth-50 rounded-xl p-6 border border-earth-200">
                  <p className="text-earth-800 italic font-medium">
                     "{diagnosis.longTermStrategy}"
                  </p>
               </div>
            </section>
         </div>

         {/* Right Column: Plants */}
         <div>
             <h3 className="text-xl font-serif font-bold text-earth-900 mb-4 flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-earth-600" /> 
                  Nature's Assistants
             </h3>
             <div className="space-y-4">
               {diagnosis.recommendedPlants.map((plant, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-earth-200 hover:border-leaf-300 transition-colors group">
                     <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-earth-900 text-lg group-hover:text-leaf-700 transition-colors">{plant.name}</h4>
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-earth-100 text-earth-600 px-2 py-1 rounded-md">
                           {plant.type}
                        </span>
                     </div>
                     <div className="flex items-start gap-2 text-earth-600 text-sm">
                        <CheckCircle className="w-4 h-4 text-leaf-500 mt-0.5 flex-shrink-0" />
                        <span>{plant.benefit}</span>
                     </div>
                  </div>
               ))}
               
               <div className="bg-leaf-50 p-5 rounded-xl border border-leaf-100 text-center">
                  <Droplets className="w-8 h-8 text-leaf-400 mx-auto mb-2" />
                  <p className="text-sm text-leaf-800 font-medium">
                     Keeping living roots in the soil is the fastest way to build structure.
                  </p>
               </div>
             </div>
         </div>

      </div>

      {/* Footer Action */}
      <div className="mt-12 pt-8 border-t border-earth-200 flex justify-center">
         <Button onClick={onReset} variant="secondary">
            Start New Diagnosis
         </Button>
      </div>

    </div>
  );
};

export default Results;